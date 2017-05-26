'use strict'

import es6Promise from 'es6-promise'
es6Promise.polyfill()
import 'isomorphic-fetch'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Row, Col, Icon, Table, Button, message, Modal, Popconfirm, Select, Tooltip } from 'antd'
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import Title from '../../../views/title'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import _ from 'underscore'

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

window.eventListAutoRefresh = null

class EventList extends Component {
    constructor(props) {
        super(props)
        this.state = {            
            eventlist: [],
            expandedRowKeys: [""],
            pagination: {            
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "uri",
                order: "asc"
            },
            loading: false,
            eventlistExtList: [],
            eventlistExt: [],
            extgroupListObj: {},
            phonebookDnArr: [],
            phonebookExtArr: [],
            phonebookExtObj: {},
            subEventListOpts: [],
            uriVal: "",
            subscriberList: [],
            numberList: [],
            uriList: []
        }
    }
    componentDidMount() {
        window.eventListAutoRefresh = setInterval(this._refreshEventListPage, 3000)
        this._listEventList()
        this._loadSubURI()
        this._listVoIPTrunk()
        this._getNameList()
        // setInterval(this._listEventList, 3000)
    }
    componentWillUnmount() {
        clearInterval(window.eventListAutoRefresh)
    }
    _refreshEventListPage = () => {
        const pagination = this.state.pagination

        this._listEventList({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: this.state.sorter.field ? this.state.sorter.field : "uri",
            sord: this.state.sorter.order === "descend" ? "desc" : "asc"
        })

        this._loadSubURI()
    }
    _listVoIPTrunk = () => {
        const { formatMessage } = this.props.intl

        fetch(baseServerURl, {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: UCMGUI.serialize({
                action: "listVoIPTrunk",
                options: "trunk_index,trunk_name"
            })
        }).then(function(response) {
            return response.json()
        }).then(function(data) {
            let bool = UCMGUI.errorHandler(data, null, formatMessage)

            if (bool) {
                let voipTrunkList = data.response.voip_trunk,
                    voipTrunkListObj = {}

                for (let i = 0; i < voipTrunkList.length; i++) {
                    let index = voipTrunkList[i]
                    voipTrunkListObj[index.trunk_name] = "trunk_" + index.trunk_index
                }

                this._getAccountList(voipTrunkListObj)
            }
        }.bind(this)).catch(function(ex) {
            this._getAccountList()
        }.bind(this))

        // $.ajax({
        //     type: "post",
        //     url: baseServerURl,
        //     data: {
        //         action: "listVoIPTrunk",
        //         options: "trunk_index,trunk_name"
        //     },
        //     error: function(jqXHR, textStatus, errorThrown) {
        //         this._getAccountList()
        //     }.bind(this),
        //     success: function(data) {
        //         let bool = UCMGUI.errorHandler(data, null, formatMessage)

        //         if (bool) {
        //             let voipTrunkList = data.response.voip_trunk,
        //                 voipTrunkListObj = {}

        //             for (let i = 0; i < voipTrunkList.length; i++) {
        //                 let index = voipTrunkList[i]
        //                 voipTrunkListObj[index.trunk_name] = "trunk_" + index.trunk_index
        //             }

        //             this._getAccountList(voipTrunkListObj)
        //         }
        //     }.bind(this)
        // })
    }
    _getAccountList = (voipTrunkListObj) => {
        const { formatMessage } = this.props.intl

        let accountList = UCMGUI.isExist.getList("getAccountList"),
            returnObj = this._transData(accountList),
            eventlistExtList = returnObj.eventlistExtList,
            eventlistExt = returnObj.eventlistExt,
            extgroupList = UCMGUI.isExist.getList("getExtensionGroupList"),
            extgroupListObj = {},
            phonebookExtArr = [],
            phonebookExtObj = {},
            phonebookDnArr = []

        for (let i = 0; i < extgroupList.length; i++) {
            let groupId = extgroupList[i]["group_id"],
                groupName = extgroupList[i]["group_name"]

            eventlistExt.push(groupId)

            extgroupListObj[groupId] = {
                key: groupId,
                title: groupName
            }
        }

        let listPhonebookDn = UCMGUI.isExist.getList("listPhonebookDn")
        _.map(listPhonebookDn, function(item, index) {
            let dn = item.dn,
                ou = dn ? dn.split(",")[0].split("=")[1] : "",
                prefix = item["prefix"],
                action = {
                    'action': "listLDAPContacts",
                    'phonebook_dn': dn
                }

            $.ajax({
                type: "post",
                url: baseServerURl,
                data: action,
                async: false,
                success: function(data) {
                    let bool = UCMGUI.errorHandler(data, null, formatMessage)

                    if (bool) {
                        let phonebookDn = data.response.phonebook_dn

                        _.map(phonebookDn, function(item, index) {
                            let obj = {},
                                accountnumber = item.accountnumber,
                                trunkIndex = voipTrunkListObj[ou] || ou,
                                trunkDes = trunkIndex + ":" + accountnumber,
                                ouName = ou + "--" + accountnumber,
                                fullname = item.calleridname

                            obj["key"] = trunkDes
                            obj["title"] = ouName + (fullname ? ' "' + fullname + '"' : '')
                            obj["description"] = trunkIndex

                            if (fullname) {
                                obj["fullname"] = fullname
                            }

                            phonebookDnArr.push(obj)
                            phonebookExtArr.push(trunkDes)
                            phonebookExtObj[trunkDes] = obj
                        })
                    }
                }.bind(this)
            })
        })

        this.setState({
            eventlistExt: eventlistExt,
            eventlistExtList: eventlistExtList,
            extgroupList: extgroupList,
            extgroupListObj: extgroupListObj,
            phonebookDnArr: phonebookDnArr,
            phonebookExtArr: phonebookExtArr,
            phonebookExtObj: phonebookExtObj
        })

        setTimeout(this._getNameList, 300)
    }
    _getNameList = () => {
        const { formatMessage } = this.props.intl

        let numberList = UCMGUI.isExist.getList("getNumberList"),            
            action = {
                'action': "listEventList",
                'options': "uri"
            }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                this.setState({
                    numberList: numberList
                })
            }.bind(this),
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage),
                    uriList = []

                if (bool) {
                    let eventlist = data.response.eventlist

                    _.map(eventlist, function(item, index) {
                        uriList.push(item.uri)
                    })
                }
                this.setState({
                    uriList: uriList,
                    numberList: numberList
                })
            }.bind(this)
        })
    }
    _loadSubURI = () => {
        const { formatMessage } = this.props.intl

        let uriVal = this.state.uriVal

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                "action": "getEventlistSubsList",
                "auto-refresh": Math.random()
            },
            async: false,
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)
                // { "response": { "eventlist_subscriber": [ { "uri": "eventlist", "extension": "1001" } ] }, "status": 0 }
                if (bool) {
                    let eventlistSubsList = data.response.eventlist_subscriber,
                        options = this._transSubsListData(eventlistSubsList),
                        lastUriInNewList = false

                    this.setState({
                        subEventListOpts: options
                    })
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].val === uriVal) {
                            lastUriInNewList = true
                            break
                        }
                    }

                    if (options.length && lastUriInNewList) {
                        this._checkSubscribers(options)
                    } else if (options.length && !lastUriInNewList) {
                        this._checkSubscribers(options)
                    } else {
                        $('#sub_div').hide()
                    }
                }
            }.bind(this)
        })
    }
    _getStatus = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                "action": "getEventlistExtenList",
                "auto-refresh": Math.random()
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.status === 0) {
                    let eventlistExtens = data.response.eventlist_extens
                }
            }.bind(this)
        })
    }
    _onChangeSubURI = (e) => {
        const { formatMessage } = this.props.intl

        let action = {
            'action': "getEventlistSubs",
            'uri': e
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)
                // { "response": { "uri": [ { "uri": "eventlist", "extension": "1001" } ] }, "status": 0 }
                if (bool) {
                    let uri = data.response.uri

                    this.setState({
                        subscriberList: uri
                    })
                }
            }.bind(this)
        })
    }
    _checkSubscribers = (options) => {
        const { formatMessage } = this.props.intl
        const form = this.props.form 

        let uriVal = form.getFieldValue("sub_eventList") || options[0].val

        let action = {
            'action': "getEventlistSubs",
            'uri': uriVal
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)
                // { "response": { "uri": [ { "uri": "eventlist", "extension": "1001" } ] }, "status": 0 }
                if (bool) {
                    let uri = data.response.uri

                    this.setState({
                        subscriberList: uri
                    })
                }
            }.bind(this)
        })
    }
    _transSubsListData = (res, cb) => {
        let arr = [],
            existed = false

        for (let i = 0; i < res.length; i++) {
            let obj = {}

            // obj["val"] = res[i].extension;
            obj["val"] = res[i].uri

            for (let j = 0; j < arr.length; j++) {
                if (arr[j].val === obj.val) {
                    existed = true
                    break
                }
            }

            if (!existed) {
                arr.push(obj)
            }

            existed = false
        }

        if (cb && typeof cb === "function") {
            cb(arr)
        }

        return arr
    }
    _transData = (res, cb) => {
        const { formatMessage } = this.props.intl

        let arr = [],
            returnObj = {},
            eventlistExt = []

        for (let i = 0; i < res.length; i++) {
            let obj = {},
                extension = res[i].extension,
                fullname = res[i].fullname,
                disabled = res[i].out_of_service

            obj["key"] = extension

            if (disabled === 'yes') {
                obj["class"] = 'disabledExtOrTrunk'
                obj["title"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + formatMessage({ id: 'LANG273' }) + '>'
                obj["disable"] = true // disabled extension
            } else {
                obj["title"] = extension + (fullname ? ' "' + fullname + '"' : '')
            }

            if (fullname) {
                obj["fullname"] = fullname
            }

            eventlistExt.push(extension)

            arr.push(obj)
        }

        if (cb && typeof cb === "function") {
            cb(arr)
        }
        returnObj = {
            eventlistExt: eventlistExt,
            eventlistExtList: arr
        }
        return returnObj
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

        pager.current = pagination.current
        pager.pageSize = pagination.pageSize
        let sorter_here = {}

        if (sorter && sorter.field) {
            this.setState({
                pagination: pager,
                sorter: sorter
            })
            sorter_here = sorter
        } else {
            this.setState({
                pagination: pager
            })
            sorter_here = this.state.sorter
        }

        this._listEventList({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : "uri",
            sord: sorter_here.order === "ascend" ? "asc" : "desc",
            ...filters
        })
    }
    _listEventList = (
        params = {                
            item_num: 10,
            sidx: "uri",
            sord: "asc",
            page: 1 
        }) => {
        // this.setState({ loading: true })

        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: {
                action: 'listEventList',
                ...params
            },
            type: 'json',
            async: true,
            success: function(res) {
                let eventlist = res.response.eventlist
                const pagination = this.state.pagination
                // Read total count from server
                pagination.total = res.response.total_item

                this.setState({
                    // loading: false,
                    // expandedRowKeys: [eventlist[0].uri],
                    eventlist: eventlist,
                    pagination
                })
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _deleteEventList = (record) => {
        const { formatMessage } = this.props.intl

        let uri = record.uri,
            action = {
                "action": "deleteEventList",
                "eventlist": uri
        }

        message.loading(formatMessage({ id: "LANG825" }, { 0: "LANG11" }), 0)

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>)

                    const pagination = this.state.pagination
                    const pageSize = this.state.pagination.pageSize
                    let current = this.state.pagination.current
                    const old_total = this.state.pagination.total
                    const new_total = old_total - 1
                    const new_total_page = (new_total - 1) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._listEventList({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'uri',
                        sord: this.state.sorter.order === "descend" ? "desc" : "asc"
                    })

                    this.setState({
                        pagination: pagination
                    })

                    this._getNameList()
                }
            }.bind(this)
        })
    }
    _createEventList = () => {
        let state = this.state

        browserHistory.push({ 
            pathname: '/call-features/eventList/add', 
            state: {
                extgroupList: state.extgroupList,
                eventlistExtList: state.eventlistExtList,
                phonebookDnArr: state.phonebookDnArr,
                eventlistExt: state.eventlistExt,
                phonebookExtArr: state.phonebookExtArr,
                phonebookExtObj: state.phonebookExtObj,
                extgroupListObj: state.extgroupListObj,
                numberList: state.numberList,
                uriList: state.uriList
            } 
        })
    }
    _editEventList = (record) => {
        let trunkId = record.trunk_index,
            state = this.state

        browserHistory.push({ 
            pathname: '/call-features/eventList/edit', 
            state: {
                extgroupList: state.extgroupList,
                eventlistExtList: state.eventlistExtList,
                phonebookDnArr: state.phonebookDnArr,
                eventlistExt: state.eventlistExt,
                phonebookExtArr: state.phonebookExtArr,
                phonebookExtObj: state.phonebookExtObj,
                extgroupListObj: state.extgroupListObj,
                numberList: state.numberList,
                uriList: state.uriList,
                record: record                
            } 
        })
    }
    _transSignallingType = (type) => {
        if (!type || !type.indexOf) {
            return false
        }

        let result

        if (type.indexOf('NET') !== -1 || type.indexOf('CPE') !== -1) {
            result = 'PRI'
        } else if (type.indexOf('SS7') !== -1) {
            result = 'SS7'
        } else if (type.indexOf('MFC/R2') !== -1) {
            result = 'MFC/R2'
        }

        return result
    }
    _getRowData = (record) => {
        const {formatMessage, formatHTMLMessage} = this.props.intl
        
        let uri = []
        let action = {
            "action": "listEventlistExtens",
            "uri": record.uri,
            "item_num": 1000000
        }
        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            async: false,
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    // "uri": "uri5", "extension": "5000", "location": "local", "trunk": "-", "status": "offline"
                    uri = data.response.uri
                }
            }.bind(this)
        })
        return uri
    }
    _renderRowData = (uri) => {
        const {formatMessage, formatHTMLMessage} = this.props.intl

        const columns = [{ 
            title: formatMessage({id: "LANG85"}), 
            dataIndex: 'extension', 
            key: 'extension',
            render: (text, record, index) => {
                let extension = record.extension,
                    group = this.state.extgroupListObj[extension]

                if (group) {
                    let text = group["text"]
                    extension = formatMessage({ id: "LANG2714" }) + "--" + text
                } else if (_.contains(extension ? extension.split(",") : extension, "group-")) {
                    extension = formatMessage({ id: "LANG2989" }) + "--" + extension
                }

                return extension
            }
        }, { 
            title: formatMessage({id: "LANG0"}), 
            dataIndex: 'status', 
            key: 'status' 
        }, { 
            title: formatMessage({id: "LANG84"}),
            dataIndex: 'location', 
            key: 'location'
        }, { 
            title: formatMessage({id: "LANG1351"}), 
            dataIndex: 'trunk', 
            key: 'trunk' 
        }]

        return (
            <Table
                columns={ columns }
                dataSource={ uri }
                pagination={ false }
            />
        )        
    }
    _expandedRowRender = (record) => {
        return this._renderRowData(this._getRowData(record))
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const {formatMessage, formatHTMLMessage} = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const state = this.state

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG2474"})
        })

        const columns = [{
                title: formatMessage({id: "LANG2478"}),
                dataIndex: 'uri',
                sorter: true
            }, { 
                title: formatMessage({id: "LANG5463"}), 
                dataIndex: 'event', 
                key: 'event',
                sorter: true 
            }, {
                title: formatMessage({id: "LANG2917"}),
                dataIndex: 'total_item',
                sorter: true,
                render: (text, record, index) => text ? text : 0
            }, {
                title: formatMessage({id: "LANG2477"}),
                dataIndex: 'total_subscriber',
                sorter: true,
                render: (text, record, index) => text ? text : 0
            }, { 
                title: formatMessage({id: "LANG74"}), 
                dataIndex: '', 
                key: 'x', 
                render: (text, record, index) => {
                    return <span>
                        <span className="sprite sprite-edit" title={ formatMessage({ id: "LANG738"})} onClick={this._editEventList.bind(this, record)}></span>
                        <Popconfirm title={
                            <FormattedHTMLMessage
                                id='LANG818'
                                values={{
                                    0: record.uri
                                }}
                            />} 
                            onConfirm={() => this._deleteEventList(record)}>
                            <span className="sprite sprite-del" title={ formatMessage({ id: "LANG739"})} ></span>
                        </Popconfirm>
                    </span>
                } 
            }]
        const subscribeColumns = [{
                title: formatMessage({id: "LANG2477"}),
                dataIndex: 'extension',
                sorter: true
            }]

        return (
            <div className="app-content-main" id="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG2474"}) }  
                    isDisplay='hidden' 
                />
                <div className="content">
                    <div className="top-button">
                        <Button icon="plus" type="primary" size="default" onClick={ this._createEventList }>
                            { formatMessage({id: "LANG2475"}) }
                        </Button>
                    </div>
                    <Table
                        rowSelection={ undefined } 
                        columns={ columns }
                        rowKey={ record => record.uri }
                        expandedRowRender={ this._expandedRowRender }
                        dataSource={ state.eventlist }
                        pagination={ state.pagination }
                        loading={ state.loading}
                        onChange={ this._handleTableChange }
                    />
                    <div className={ state.subscriberList.length === 0 ? "hidden" : "display-block" }>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG2476"}) }</span>
                        </div>
                        <div className="section-body">
                            <Form>
                                <Row>
                                    <Col span={8}>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={<FormattedHTMLMessage id="LANG2482" />}>
                                                    <span>{formatMessage({id: "LANG2478"})}</span>
                                                </Tooltip>
                                            )}>
                                            { getFieldDecorator('sub_eventList', {
                                                rules: [],
                                                initialValue: state.subEventListOpts[0] ? state.subEventListOpts[0].val : ""
                                            })(
                                                <Select onChange={this._onChangeSubURI}>
                                                {
                                                    state.subEventListOpts.map(function(it) {
                                                        let val = it.val
                                                        return <Option key={ val } value={ val }>
                                                               { val }
                                                            </Option>
                                                    })
                                                }   
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={16}></Col>
                                </Row>
                                <Row>
                                    <Col span={8}>
                                        <Table
                                            rowSelection={ undefined } 
                                            columns={ subscribeColumns }
                                            rowKey={ record => record.extension }
                                            dataSource={ state.subscriberList }
                                        /> 
                                    </Col>
                                    <Col span={16}></Col>
                                </Row>
                            </Form>                       
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

EventList.defaultProps = {
    
}

export default Form.create()(injectIntl(EventList))
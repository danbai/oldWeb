'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Modal, message, Form, Input, Icon, Table, Button, DatePicker, Row, Col, Select } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import OperationLogSearch from './operationLogSearch'
import OperationLogList from './operationLogList'
import Title from '../../../views/title'
import _ from 'underscore'
import options2Lang from '../../../locale/locale.params.json'
import Validator from "../../api/validator"

const baseServerURl = api.apiHost
const FormItem = Form.Item
const Option = Select.Option

class OperationLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isDisplay: 'display-block-filter',
            isDisplaySearch: 'hidden',
            options2Lang: {},
            searchAction: {},
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "date",
                order: "desc"
            },
            visible: false,
            detailNum: 0,
            operationData: [],
            operationDetailData: [],
            loading: false,
            userLists: [],
            d_user_name: '',
            d_ipaddress: '',
            d_start_date: '',
            d_start_end: '',
            modal_location: ''
        }
    }
    componentDidMount () {
        this._getUserLists()
        // this._getOptions2Lang()
        this._listOperation()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _checkTimeStart = (rule, value, callback) => {
        if (!value) {
            callback()
            return
        }
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const endValue = getFieldValue('end_date')

        if (value && endValue && value.valueOf() >= endValue.valueOf()) {
            callback(formatMessage({id: "LANG2165"}, {0: formatMessage({id: "LANG1048"}), 1: formatMessage({id: "LANG1049"})}))
        } else {
            callback()
        }
    }
    _checkTimeEnd = (rule, value, callback) => {
        if (!value) {
            callback()
            return
        }
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const startValue = getFieldValue('start_date')

        if (value && startValue && value.valueOf() <= startValue.valueOf()) {
            callback(formatMessage({id: "LANG2142"}, {0: formatMessage({id: "LANG1049"}), 1: formatMessage({id: "LANG1048"})}))
        } else {
            callback()
        }
    }
    _getUserLists = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            url: api.apiHost,
            async: true,
            data: {
                "action": "listUser",
                "options": "user_name"
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    let userLists = data.response.user_id,
                        arr = []

                    arr.push({
                        val: "",
                        text: formatMessage({id: "LANG3921"})
                    })

                    for (var i = 0; i < userLists.length; i++) {
                        var obj = {}

                        obj["val"] = userLists[i].user_name

                        arr.push(obj)
                    }
                    this.setState({
                        userLists: arr
                    })
                }
            }.bind(this)
        })        
    }
    _getOptions2Lang = () => {
        $.ajax({
            type: "GET",
            url: "../locale/locale.params.json",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                const options2Lang = JSON.parse(data)
                this.setState({
                    options2Lang: options2Lang
                })
            }.bind(this)
        })        
    }
    _deleteAll = () => {
        const {formatMessage} = this.props.intl,
            me = this

        let operActionData = {
            "action": "deleteOperationLog",
            "acctid": '0',
            "start_date": "",
            "end_date": "",
            "ipaddress": "",
            "user_name": ""
        }

        Modal.confirm({
            title: formatMessage({id: "LANG543" }),
            content: formatMessage({id: "LANG840" }),
            okText: formatMessage({id: "LANG727" }),
            cancelText: formatMessage({id: "LANG726" }),
            onOk() {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: api.apiHost,
                    data: {
                        "action": 'deleteOperationLog'
                    },
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        message.success(formatMessage({id: "LANG819" }))
                        me._listOperation()
                    }
                })
            },
            onCancel() {}
        })
    }
    _deleteSearch = () => {
        const {formatMessage} = this.props.intl,
            me = this

        let dataPost = {},
            operActionData = {
                "action": "deleteOperationLog"
            },
            flag = false

        if (this.state.d_start_date) {
            dataPost.start_date = this.state.d_start_date
        }
        if (this.state.d_end_date) {
            dataPost.end_date = this.state.d_end_date
        }
        if (this.state.d_ipaddress) {
            dataPost.ipaddress = this.state.d_ipaddress
        }
        if (this.state.d_user_name) {
            dataPost.user_name = this.state.d_user_name
        }

        _.extend(operActionData, dataPost)

        Modal.confirm({
            title: formatMessage({id: "LANG543" }),
            content: formatMessage({id: "LANG4072" }),
            okText: formatMessage({id: "LANG727" }),
            cancelText: formatMessage({id: "LANG726" }),
            onOk() {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: api.apiHost,
                    data: operActionData,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        message.success(formatMessage({id: "LANG819" }))
                        me._listOperation()
                    }
                })
            },
            onCancel() {}
        })
    }
    _hideSearch = () => {
        this.setState({
            isDisplay: 'display-block-filter',
            isDisplaySearch: 'hidden'
        })
    }
    _handleSearch = () => {
        this.setState({
            isDisplay: 'display-block',
            isDisplaySearch: 'display-block'
        })
    }
    _handleCancel = () => {
        browserHistory.push('/maintenance/operationLog')
        this.props.form.resetFields()
        this._listOperation()
        const pagination = this.state.pagination
        pagination.current = 1
        this.setState({
            pagination: pagination
        })
    }
    _listOperation = (
        params = {                
            item_num: 10,
            page: 1,
            sord: 'desc',
            sidx: 'date'
        }, isSearch = 0) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        let pagination = this.state.pagination

        message.loading(formatMessage({ id: "LANG3773" }), 0)

        let operationData = [],
            acctid = [],
            dataPost = {},
            operationSearchData = {
                action: "listOperationLog",
                options: "date,user_name,ipaddress,result,action,operation,detailed_log",
                ...params
            },
            flag = false

        let t_start_date = form.getFieldValue('start_date')
        let t_end_date = form.getFieldValue('end_date')
        let t_ipaddress = form.getFieldValue('ipaddress')
        let t_user_name = form.getFieldValue('user_name')
        
        if (isSearch === 1) {
            if (t_ipaddress && t_ipaddress !== "") {
                dataPost['ipaddress'] = t_ipaddress
            }
            if (t_user_name && t_user_name !== "") {
                dataPost['user_name'] = t_user_name
            }
            if (t_start_date && _.isObject(t_start_date)) {
                dataPost['start_date'] = t_start_date.format('YYYY-MM-DD HH:mm')
            }
            if (t_end_date && _.isObject(t_end_date)) {
                dataPost['end_date'] = t_end_date.format('YYYY-MM-DD HH:mm')
            }
            if (this.state.d_logid !== '') {
                dataPost['logid'] = this.state.d_logid
            }
            if (this.state.d_logaction !== '') {
                dataPost['logaction'] = this.state.d_logaction
            }
            if (this.state.d_logstartfrom !== '') {
                dataPost['logstartfrom'] = this.state.d_logstartfrom
            }
            if (this.state.d_logstartto !== '') {
                dataPost['logstartto'] = this.state.d_logstartto
            }
        } else if (isSearch === 0) {

        }
        _.extend(operationSearchData, dataPost)

        $.ajax({
            url: api.apiHost,
            data: operationSearchData,
            type: 'POST',
            dataType: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()

                    const response = data.response || {}
                    operationData = response.operation || []

                    pagination.total = response.total_item

                    pagination.current = params.page

                    this.setState({
                        operationData: operationData,
                        d_start_date: dataPost['start_date'],
                        d_end_date: dataPost['end_date'],
                        d_ipaddress: dataPost['ipaddress'],
                        d_user_name: dataPost['user_name'],
                        pagination: pagination
                    })
                }
            }.bind(this)
        })
    }
    _handleSubmit =() => {
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                this._listOperation({                
                    item_num: 10,
                    page: 1,
                    sord: 'desc',
                    sidx: 'date'
                }, 1)
            }
        })
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

        if (this.state.d_start_date ||
            this.state.d_end_date ||
            this.state.d_ipaddress ||
            this.state.d_user_name) {
            this._listOperation({
                item_num: pagination.pageSize,
                page: pagination.current,
                sidx: sorter_here.field ? sorter_here.field : 'date',
                sord: sorter_here.order === "ascend" ? "asc" : "desc",
                ...filters
            }, 1)
        } else {
            this._listOperation({
                item_num: pagination.pageSize,
                page: pagination.current,
                sidx: sorter_here.field ? sorter_here.field : 'date',
                sord: sorter_here.order === "ascend" ? "asc" : "desc",
                ...filters
            }, 0)
        }
    }
    _getOptStr = (obj) => {
        const { formatMessage } = this.props.intl

        let optStr = "",
            data = obj.data,
            options2Lang = obj.options2Lang,
            locationObj = obj.locationObj,
            action = obj.action,
            count = obj.count,
            maxLen = obj.maxLen

        for (let prop in data) {
            if (data.hasOwnProperty(prop) && prop !== "action" && prop !== "_location" && prop !== "_") {
                let param = prop,
                    options2LangAction = options2Lang[action]

                if (count || maxLen) {
                    if (count > maxLen) {
                        break
                    }
                    count++
                }

                if (locationObj && locationObj[prop]) {
                    param = "<span>" + formatMessage({id: locationObj[prop]}) + "</span>"
                }

                if (options2LangAction && options2LangAction[prop]) {
                    param = "<span>" + formatMessage({id: options2LangAction[prop]}) + "</span>"
                }

                optStr += param + ": " + (data[prop] ? data[prop] : "") + ";  "
            }
        }

        return {
            data: optStr,
            count: count
        }
    }
    _jumpPage = (_location) => {
        // browserHistory.push('/pbx-settings/voicePrompt/2')
    }
    _transResults = (cellvalue, options, rowObject) => {
        const {formatMessage} = this.props.intl

        var erroeCodes = UCMGUI.initConfig.errorCodes,
            val = erroeCodes[cellvalue]

        if (!val) {
            val = "LANG3910" // Operate Successfully 
        }

        return <span>{ formatMessage({id: val}) }</span>       
    }
    _transAction = (cellvalue, options, rowObject) => {
        const {formatMessage} = this.props.intl

        let _location = rowObject.operation._location ? rowObject.operation._location : "",
            // options2Lang = this.state.options2Lang,
            locationObj = options2Lang[_location],
            page = ""

        if (options2Lang && locationObj) {
            var lang = locationObj["_LOCATION"]

            if (lang && _location !== "operationLog") {
                page = <span className='jumpPage' onClick={ this._jumpPage.bind(this, _location) } title={ formatMessage({id: 'LANG3984'}) } >{ formatMessage({id: lang}) + ":" } </span>
            } else {
                page = <span>{ formatMessage({id: lang}) + ":" }</span>
            }
        }

        if (locationObj && locationObj[cellvalue]) {
            var sVal = locationObj[cellvalue]

            if (sVal.match(/\sLANG\d+$/)) {
                var aTranLang = sVal.split(' ')

                cellvalue = <span>{ formatMessage({id: aTranLang[0]}, {0: formatMessage({id: aTranLang[1]})}) }</span>
            } else {
                cellvalue = <span>{ formatMessage({id: locationObj[cellvalue]}) }</span>
            }
        } else if (options2Lang && options2Lang[cellvalue]) {
            var _LOCATION = options2Lang[cellvalue]["_LOCATION"]

            if (_LOCATION) {
                cellvalue = <span>{ formatMessage({id: _LOCATION}) }</span>
            } else {
                cellvalue = <span>{ formatMessage({id: options2Lang[cellvalue]}) }</span>
            }
        }

        return <div>
                { page } 
                { cellvalue }
            </div>
    }
    _transOperation = (cellvalue, options, rowObject) => {
        const { formatMessage } = this.props.intl

        let optStr = "",
            isDetail = "",
            _location = rowObject.operation._location ? rowObject.operation._location : "",
            action = rowObject.action,
            // options2Lang = this.state.options2Lang,
            locationObj = options2Lang[_location],
            detailedLog = rowObject.detailed_log

        if (detailedLog) {
            if (_.size(cellvalue) > 1) {
                let obj = this._getOptStr({
                    data: cellvalue,
                    options2Lang: options2Lang,
                    locationObj: locationObj,
                    action: action
                })

                optStr += obj.data
            } else {
                let count = 0,
                    maxLen = 3,
                    obj = this._getOptStr({
                        data: cellvalue,
                        options2Lang: options2Lang,
                        locationObj: locationObj,
                        action: action,
                        count: count,
                        maxLen: maxLen
                    })

                optStr += obj.data
            }

            // optStr += "<span class='sprite sprite-del' onclick='" + this._showDetail.bind(this, rowObject.detailed_log) + "'></span>"
            isDetail = <span className='sprite sprite-detail' onClick={ this._showDetail.bind(this, rowObject.detailed_log) }></span>
            rowObject.detailed_log["action"] = action

            // detailObj[id] = rowObject.detailed_log

            /* let detailNum = this.state.detailNum
            detailNum = detailNum++
            this.setState({
                detailNum: detailNum
            }) */
        } else {
            let count = 0,
                maxLen = 3,
                obj = this._getOptStr({
                    data: cellvalue,
                    options2Lang: options2Lang,
                    locationObj: locationObj,
                    action: action,
                    count: count,
                    maxLen: maxLen
                })

            optStr += obj.data
            count = obj.count

            if (count > maxLen) {
                let id = "detail" + this.state.detailNum

                // optStr += "<span class='sprite sprite-del' onclick='" + this._showDetail.bind(this, cellvalue) + "'></span>"
                isDetail = <span className='sprite sprite-detail' onClick={ this._showDetail.bind(this, cellvalue) }></span>
                // rowObject.detailed_log["action"] = action;
                // detailObj[id] = cellvalue
                /* let detailNum = this.state.detailNum
                detailNum = detailNum++
                this.setState({
                    detailNum: detailNum
                }) */
            } else {
                if (action === "updateCountryCodes") {
                    optStr = '<div>' + optStr.substr(0, 40) + '<span class="operation-more">...</span><span class="operation-more-content">' + optStr.substr(40) + '</span>' + '</div>'
                }
            }
        }

        if (/;\s+$/.test(optStr)) {
            optStr = optStr.replace(/;\s+$/, ".")
        }

        return <div>
            <span dangerouslySetInnerHTML={{__html: optStr}} ></span>
            { isDetail }
        </div>
    }
    _showDetail = (data) => {
        this.setState({
            visible: true
        })
        let arr = []
        let modal_location = ''
        for (let tmp in data) {
            if (data.hasOwnProperty(tmp)) {
                let obj = {}
                obj["options"] = tmp
                obj["value"] = data[tmp]
                if (tmp !== '_location' && tmp !== 'action') {
                    arr.push(obj)
                } else if (tmp === '_location') {
                    modal_location = data[tmp]                    
                }
            }
        }
        this.setState({
            operationDetailData: arr,
            modal_location: modal_location
        })
    }
    _handleModalOk = () => {
        this.setState({
            visible: false
        })
    }
    _handleModalCancel = () => {
        this.setState({
            visible: false
        })
    }
    _transModalOption = (text, index, record) => {
        const { formatMessage } = this.props.intl
        let modal_location = this.state.modal_location
        // let locationObj = this.state.options2Lang[modal_location]
        let locationObj = options2Lang[modal_location]
        return <span>{ formatMessage({id: locationObj && locationObj[text] ? locationObj[text] : text}) }</span>
    }
    render() {
        const {formatMessage} = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        let userLists = this.state.userLists

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        const formItemLayoutCheckGroup = {
            labelCol: { span: 3 },
            wrapperCol: { span: 12 }
        }

        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG3908"})
        })

        const columns = [
            {
                title: formatMessage({id: "LANG203"}),
                dataIndex: 'date',
                width: 130,
                sorter: true
            }, {
                title: formatMessage({id: "LANG2809"}),
                dataIndex: 'user_name',
                width: 120,
                sorter: true
            }, {
                title: formatMessage({id: "LANG155"}),
                dataIndex: 'ipaddress',
                width: 120,
                sorter: true
            }, {
                title: formatMessage({id: "LANG3909"}),
                dataIndex: 'result',
                width: 120,
                sorter: true,
                render: (text, record, index) => (
                    this._transResults(text, index, record)
                )
            }, {
                title: formatMessage({id: "LANG3922"}),
                dataIndex: 'action',
                sorter: true,
                width: 348,
                render: (text, record, index) => (
                    this._transAction(text, index, record)
                )
            }, {
                title: formatMessage({id: "LANG3927"}),
                dataIndex: 'operation',
                sorter: true,
                width: 350,
                render: (text, record, index) => (
                    this._transOperation(text, index, record)
                )
            }
        ]
        const detailColumns = [
            {
                title: formatMessage({id: "LANG74"}),
                dataIndex: 'options',
                width: 120,
                render: (text, record, index) => (
                    this._transModalOption(text, index, record)
                )
            }, {
                title: formatMessage({id: "LANG3925"}),
                dataIndex: 'value'
            }
        ]

        const detailPagination = {
            total: this.state.operationDetailData.length,
            showSizeChanger: true,
            onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange: (current) => {
                console.log('Current: ', current)
            }
        }

        return (
            <div className="app-content-main app-content-cdr">
                <Title 
                    headerTitle={ formatMessage({id: "LANG3908"}) } 
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel } 
                    onSearch = { this._handleSearch }
                    saveTxt= { formatMessage({id: "LANG803"}) }
                    cancelTxt= { formatMessage({id: "LANG750"}) } 
                    isDisplay= { this.state.isDisplay }
                />
                <Form id="operationLog-form" className={ this.state.isDisplaySearch }>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>{formatMessage({id: "LANG1048"})}</span>
                                )}
                            >
                                {getFieldDecorator('start_date', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: this._checkTimeStart
                                    }]
                                })(
                                    <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>{formatMessage({id: "LANG1049"})}</span>
                                )}
                            >
                                {getFieldDecorator('end_date', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: this._checkTimeEnd
                                    }]
                                })(
                                    <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={formatMessage({id: "LANG5200"})} >
                                {getFieldDecorator('ipaddress', {
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            Validator.ipAddress(rule, value, callback, formatMessage)
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={formatMessage({id: "LANG2809"})} >
                                {getFieldDecorator('user_name', {
                                    rules: [],
                                    initialValue: ""
                                })(
                                    <Select>
                                        {
                                           userLists.map(function(it) {
                                            const val = it.val
                                            const text = it.text

                                            return <Option key={ val } value={ val }>
                                                   { text ? text : val }
                                                </Option>
                                            })
                                       }
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <div className="hide_search sprite sprite-slide-bar" onClick={ this._hideSearch }></div>
                </Form>
                <div className="content">
                <div className="top-button">
                    <Button type="primary" icon="delete" size='default' onClick={ this._deleteSearch }>
                        { formatMessage({id: "LANG4071" }) }
                    </Button>
                    <Button type="primary" icon="delete" size='default' onClick={ this._deleteAll }>
                        { formatMessage({id: "LANG3911"}) }
                    </Button>
                </div>
                    <Table
                        bordered
                        columns={ columns }
                        dataSource={ this.state.operationData }
                        pagination={ this.state.pagination }
                        showHeader={ !!this.state.operationData.length }
                        onChange={ this._handleTableChange }  
                    />
                    <Modal
                        style={{width: "850px"}} 
                        title={ formatMessage({id: "LANG3926"}) }
                        visible={ this.state.visible }
                        onOk={ this._handleModalOk } 
                        onCancel={ this._handleModalCancel }
                        okText={ formatMessage({id: "LANG727"}) }
                        cancelText={ formatMessage({id: "LANG726"}) } >
                        <Table
                            bordered
                            columns={ detailColumns }
                            dataSource={ this.state.operationDetailData }
                            pagination={ detailPagination }
                            showHeader={ !!this.state.operationDetailData.length }
                            loading={ this.state.loading}
                        />
                    </Modal>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(OperationLog))
'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Icon, Table, Button, message, Modal, Popconfirm } from 'antd'
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import Title from '../../../views/title'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import _ from 'underscore'

const baseServerURl = api.apiHost

class DigitalTrunk extends Component {
    constructor(props) {
        super(props)
        this.state = {
            digitaltrunk: {},
            digitalGroup: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "trunk_name",
                order: "asc"
            },
            loading: false
        }
    }
    componentDidMount() {
        this._listDigitalTrunk()
        this._getNameList()
    }
    _getNameList = () => {
        const { formatMessage } = this.props.intl

        let allTrunkList = UCMGUI.isExist.getList("getTrunkList")

        let trunkNameList = this._transData(allTrunkList)

        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: true,
            data: {
                "action": "listDigitalTrunk",
                "options": "trunk_name,group_index"
            },
            success: function(data) {
                let res = data.response

                if (res && data.status === 0) {
                    let digitalTrunks = res.digital_trunks

                    let groupNameList = []

                    for (let i = 0; i < digitalTrunks.length; i++) {
                        let digitalTrunksIndex = digitalTrunks[i]
                        groupNameList.push(String(digitalTrunksIndex.group_index))
                    }
                    this._listDataTrunk(groupNameList, trunkNameList)
                }
            }.bind(this)
        })
        this._listDigitalGroup()
    }
    _listDigitalGroup = () => {
        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            data: {
                action: "listDigitalGroup",
                options: "group_name,group_index"
            },
            success: function(data) {
                if (data && data.status === 0) {
                    let res = data.response

                    if (res) {
                        let digitalGroup = res.digital_group

                        this.setState({
                            digitalGroup: digitalGroup
                        })
                    }
                }
            }.bind(this)
        })
    }
    _listDataTrunk = (groupNameList, trunkNameList) => {
        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "listDataTrunk"
            },
            success: function(data) {
                if (data.status === 0) {
                    let netHDLCSettings = data.response.nethdlc_settings

                    if (netHDLCSettings) {
                        groupNameList.push(String(netHDLCSettings[0].group_index))
                    }
                    this.setState({
                        groupNameList: groupNameList,
                        trunkNameList: trunkNameList
                    })
                }
            }.bind(this)
        })
    }
    _transData(res, cb) {
        let arr = []

        for (let i = 0; i < res.length; i++) {
            arr.push(res[i]["trunk_name"])
        }
        if (cb && typeof cb === "function") {
            cb(arr)
        }

        return arr
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

        this.setState({
            pagination: pager,
            sorter: sorter
        })

        this._listDigitalTrunk({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : "trunk_name",
            sord: sorter_here.order === "ascend" ? "asc" : "desc",
            ...filters
        })
    }
    _listDigitalTrunk = (
        params = {
            item_num: 10,
            sidx: "trunk_name",
            sord: "asc",
            page: 1
        }) => {
        this.setState({ loading: true })

        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: {
                action: 'listDigitalTrunk',
                options: "trunk_name,type,trunk_index,span,channel,out_of_service",
                ...params
            },
            type: 'json',
            async: true,
            success: function(res) {
                let digitalTrunk = res.response.digital_trunks
                const pagination = this.state.pagination
                // Read total count from server
                pagination.total = res.response.total_item

                this.setState({
                    loading: false,
                    digitalTrunk: digitalTrunk,
                    pagination
                })
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _delAstdb = (trunk) => {
        let action = {
            action: "DBDel",
            Family: "TRUNK_" + trunk + "/DOD"
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            async: false
        })
    }
    _deleteTrunk = (data) => {
        const { formatMessage } = this.props.intl

        let trunkIndex = data.trunk_index,
            action = {}

        action = {
                "action": "deleteDigitalTrunk",
                "trunk": trunkIndex
        }

        message.loading(formatMessage({ id: "LANG825" }, {0: "LANG11"}), 0)

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

                    this._listDigitalTrunk({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'trunk_name',
                        sord: this.state.sorter.order === "descend" ? "desc" : "asc"
                    })
                    this.setState({
                        pagination: pagination
                    })

                    this._delAstdb(trunkIndex)
                    this._getNameList()
                }
            }.bind(this)
        })
    }
    _createDigitalTrunk = () => {
        let state = this.state,
            digitalGroup = state.digitalGroup,
            groupNameList = state.groupNameList,
            trunkNameList = state.trunkNameList

        browserHistory.push({
            pathname: '/extension-trunk/digitalTrunk/add',
            state: {
                digitalGroup: digitalGroup,
                groupNameList: groupNameList,
                trunkNameList: trunkNameList
            }
        })
    }
    _editDigitalTrunk = (record) => {
        let trunkId = record.trunk_index,
            trunkType = record.type,
            trunkName = record.trunk_name,
            state = this.state,
            digitalGroup = state.digitalGroup,
            groupNameList = state.groupNameList,
            trunkNameList = state.trunkNameList

        browserHistory.push({
            pathname: '/extension-trunk/digitalTrunk/edit/' + trunkId + "/" + trunkName,
            state: {
                trunkType: trunkType,
                digitalGroup: digitalGroup,
                groupNameList: groupNameList,
                trunkNameList: trunkNameList
            }
        })
    }
    _dodTrunksList = (record) => {
        let signalling = this._transSignallingType(record.type)
        browserHistory.push({
            pathname: '/extension-trunk/digitalTrunk/dodTrunksList/' + record.trunk_index,
            state: {
                signalling: signalling
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
    render() {
        const {formatMessage, formatHTMLMessage} = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name,
            1: formatMessage({id: "LANG3141"})
        })

        const columns = [
            {
                title: formatMessage({id: "LANG3141"}),
                dataIndex: 'trunk_name',
                sorter: true
            }, {
                title: formatMessage({id: "LANG1486"}),
                dataIndex: 'type',
                sorter: true
            }, {
                title: formatMessage({id: "LANG2986"}),
                dataIndex: 'channel',
                sorter: true
            }, {
                title: formatMessage({id: "LANG74"}),
                dataIndex: '',
                key: 'x',
                render: (text, record, index) => {
                    return <span>
                        <span className="sprite sprite-edit" title={ formatMessage({ id: "LANG738"})} onClick={this._editDigitalTrunk.bind(this, record)}></span>
                        <span className="sprite sprite-dod" title={ formatMessage({ id: "LANG2677"})} onClick={this._dodTrunksList.bind(this, record)}></span>
                        <Popconfirm title={
                            <FormattedHTMLMessage
                                id='LANG818'
                                values={{
                                    0: record.trunk_name
                                }}
                            />}
                            onConfirm={() => this._deleteTrunk(record)}>
                            <span className="sprite sprite-del" title={ formatMessage({ id: "LANG739"})} ></span>
                        </Popconfirm>
                    </span>
                }
            }
        ]
        // rowSelection object indicates the need for row selection
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
            },
            onSelect: (record, selected, selectedRows) => {
                console.log(record, selected, selectedRows)
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                console.log(selected, selectedRows, changeRows)
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User'    // Column configuration not to be checked
            })
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG3141"}) }
                    isDisplay='hidden'
                />
                <div className="content">
                    <div className="top-button">
                        <Button icon="plus" type="primary" size="default" onClick={ this._createDigitalTrunk }>
                            { formatMessage({id: "LANG3142"}) }
                        </Button>
                    </div>
                    <Table
                        rowSelection={ false }
                        columns={ columns }
                        rowKey={ record => record.trunk_index }
                        dataSource={ this.state.digitalTrunk }
                        pagination={ this.state.pagination }
                        loading={ this.state.loading}
                        onChange={ this._handleTableChange }
                    />
                </div>
            </div>
        )
    }
}

DigitalTrunk.defaultProps = {

}

export default injectIntl(DigitalTrunk)

'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Icon, Table, Button, message, Modal, Popconfirm } from 'antd'
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import _ from 'underscore'

const baseServerURl = api.apiHost

class VoipTrunksList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            voipTrunk: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "trunk_name",
                order: "asc"
            },
            msg: "",
            loading: false
        }
    }
    componentDidMount() {
        this._listVoipTrunk()
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

        this._listVoipTrunk({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'trunk_name',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _listVoipTrunk = (
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
                action: 'listVoIPTrunk',
                options: "trunk_index,trunk_name,host,trunk_type,username,technology,ldap_sync_enable,trunks.out_of_service",
                ...params
            },
            type: 'json',
            async: true,
            success: function(res) {
                let voipTrunk = res.response.voip_trunk
                const pagination = this.state.pagination
                // Read total count from server
                pagination.total = res.response.total_item

                this.setState({
                    loading: false,
                    voipTrunk: voipTrunk,
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
            technology = data.technology,
            action = {}

        if (technology.toLowerCase() === "sip") {
            action = {
                "action": "deleteSIPTrunk",
                "trunk": trunkIndex
            }
        } else {
            action = {
                "action": "deleteIAXTrunk",
                "trunk": trunkIndex
            }
        }
        message.loading(formatMessage({id: "LANG825"}, {0: formatMessage({id: "LANG4323"}, {0: ''})}), 0)

        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: action,
            type: 'json',
            async: true,
            success: function(res) {
                let bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>)
                    let pagination = this.state.pagination,
                        sorter = this.state.sorter

                    const pageSize = this.state.pagination.pageSize
                    let current = this.state.pagination.current
                    const old_total = this.state.pagination.total
                    const new_total = old_total - 1
                    const new_total_page = (new_total - 1) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current
                    this._listVoipTrunk({
                        item_num: pagination.pageSize,
                        page: current,
                        sidx: sorter.field,
                        sord: sorter.order === "ascend" ? "asc" : "desc"
                    })
                    this._delAstdb(trunkIndex)
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _createSipVoipTrunk = () => {
        browserHistory.push('/extension-trunk/voipTrunk/createVoipTrunk/addSip')
    }
    _createIaxVoipTrunk = () => {
        browserHistory.push('/extension-trunk/voipTrunk/createVoipTrunk/addIax')
    }
    _editVoipTrunk = (record) => {
        let trunkId = record.trunk_index,
            technology = record.technology,
            trunkType = record.trunk_type,
            trunkName = record.trunk_name

        browserHistory.push('/extension-trunk/voipTrunk/editVoipTrunk/' + trunkId + "/" + technology + "/" + trunkType + "/" + trunkName)
    }
    _dodTrunksList = (record) => {
        browserHistory.push({
            pathname: '/extension-trunk/voipTrunk/dodTrunksList/' + record.trunk_index,
            state: {
                signalling: 0
            }
        })
    }
    _manual_ldap_sync = (record) => {
        const { formatMessage } = this.props.intl
        const me = this

        let trunkId = record.trunk_index,
            trunkName = record.trunk_name,
            ldapSyncEnable = record.ldap_sync_enable,
            ttype = record.technology

        if (!trunkId) {
            message.warn(formatMessage({ id: "ERROR ITEM!!!!" }))
            me.props.setSpinLoading({loading: false})
            return
        }

        let a = (ldapSyncEnable === "yes") ? 1 : 0

        if (a !== 1) {
            // message.destroy()
            // message.warn(formatMessage({ id: "LANG2674" }))
            return
        }

        message.loading(formatMessage({ id: "LANG2655" }), 0)
        this.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG2654"})})
        /* Start to sync */
        $.ajax({
            type: "Post",
            url: baseServerURl,
            data: {
                "action": "syncLDAP",
                "ldap-sync": "trunk_" + trunkId
            },
            dataType: "json",
            error: function() {
                message.destroy()
                message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG909" })}}></span>)
                this.props.setSpinLoading({loading: false})
            }.bind(this),
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    this._manual_ldap_sync_progress(trunkName)
                }
            }.bind(this)
        })
    }

    _manual_ldap_sync_progress = (trunkName) => {
        /* Get the LDAP SYNC date and progress */
        const { formatMessage } = this.props.intl
        const me = this
        let errArray = ['', 'LANG2664', 'LANG2665', 'LANG2666']

        let count = 120
        let tryTimes = 0

        this._check_ldap_sync_progress(trunkName, count, tryTimes)

        if (count <= 0) {
            message.warn(formatMessage({ id: errArray[1] }))
            me.props.setSpinLoading({loading: false})
            this.state.msg = ""
        }
    }

    _check_ldap_sync_progress = (trunkName, count, tryTimes) => {
        const { formatMessage } = this.props.intl
        const me = this

        let errArray = ['', 'LANG2664', 'LANG2665', 'LANG2666']

        if (count <= 0) {
            message.warn(formatMessage({ id: errArray[1] }))
            me.props.setSpinLoading({loading: false})
            return
        }
        tryTimes++
        count--

        $.ajax({
            type: "POST",
            url: baseServerURl,
            async: false,
            data: {
                action: "getldapsyncprogress",
                ldap_sync_progress: trunkName
            },
            success: function(result) {
                let bool = UCMGUI.errorHandler(result, null, this.props.intl.formatMessage)
                let msgArray = ['LANG2656', 'LANG2657', 'LANG2658', 'LANG2659', 'LANG2660', 'LANG2661', 'LANG2662', 'LANG2663']
                let me = this

                if (bool) {
                    /* The progress */
                    let index = Number(result.response.ldap_sync_progress)

                    if (isNaN(index)) {
                        setTimeout(() => {
                            me._check_ldap_sync_progress(trunkName, count, tryTimes)
                        }, 1000)
                        me.props.setSpinLoading({loading: false})
                        return
                    }

                    if (index >= 0) {
                        if (index === 7) {
                            message.destroy()

                            /* successful done */
                            message.success(formatMessage({ id: msgArray[index] }))
                            this.state.msg = ""
                            me.props.setSpinLoading({loading: false})

                            // let frameContainerDoc = top.frames["frameContainer"].document,
                            //     applyChanges = $("#applyChanges_Button", frameContainerDoc),
                            //     lineButton = $("#line_Button", frameContainerDoc)

                            // // if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
                            // applyChanges.css("visibility", "visible")

                            // lineButton.css("visibility", "visible")
                        } else {
                            if (tryTimes === 60) {
                                message.destroy()
                                message.warn(formatMessage({ id: errArray[1] }))
                                me.props.setSpinLoading({loading: false})
                                this.state.msg = ""
                            } else {
                                count = 90
                                if (this.state.msg !== msgArray[index]) {
                                    message.destroy()
                                    message.loading(formatMessage({ id: msgArray[index] }), 0)
                                    this.state.msg = msgArray[index]
                                }

                                setTimeout(() => {
                                    me._check_ldap_sync_progress(trunkName, count, tryTimes)
                                }, 1000)
                            }
                        }
                    } else {
                        message.destroy()

                        let number = Math.abs(index)
                        message.warn(formatMessage({ id: errArray[number] }))
                        me.props.setSpinLoading({loading: false})
                        this.state.msg = ""
                    }
                }
            }.bind(this)

        })
    }

    _createName = (text, record, index) => {
        const { formatMessage } = this.props.intl

        let name,
            disabled = record.out_of_service

        if (disabled === 'yes') {
            name = <div className="status-container unavailable">
                        <span
                            className="sprite sprite-status-unavailable"
                            title={ formatMessage({ id: "LANG273" }) }
                        ></span>
                        { text }
                    </div>
        } else {
            name = text
        }

        return name
    }
    render() {
        const {formatMessage, formatHTMLMessage} = this.props.intl

        const columns = [
            {
                title: formatMessage({id: "LANG1382"}),
                dataIndex: 'trunk_name',
                sorter: true,
                render: (text, record, index) => (
                    this._createName(text, record, index)
                )
            }, {
                title: formatMessage({id: "LANG623"}),
                dataIndex: 'technology',
                sorter: true
            }, {
                title: formatMessage({id: "LANG84"}),
                dataIndex: 'trunk_type',
                sorter: true
            }, {
                title: formatMessage({id: "LANG1395"}),
                dataIndex: 'host',
                sorter: true
            }, {
                title: formatMessage({id: "LANG72"}),
                dataIndex: 'username',
                sorter: true
            }, {
                title: formatMessage({id: "LANG74"}),
                dataIndex: '',
                key: 'x',
                render: (text, record, index) => {
                    let ldapCls = "sprite sprite-sync"

                    if (record.ldap_sync_enable !== "yes") {
                        ldapCls = "sprite sprite-sync-disabled"
                    }

                    return <span>
                        <span className="sprite sprite-edit" title={ formatMessage({ id: "LANG738"})} onClick={this._editVoipTrunk.bind(this, record)}></span>
                        <span className="sprite sprite-dod" title={ formatMessage({ id: "LANG2677"})} onClick={this._dodTrunksList.bind(this, record)}></span>
                        <span className={ ldapCls } title={ formatMessage({ id: "LANG2654"})} onClick={this._manual_ldap_sync.bind(this, record)}></span>
                        <Popconfirm title={
                            <FormattedHTMLMessage
                                id='LANG4471'
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
            <div className="content">
                <div className="top-button">
                    <Button icon="plus" type="primary" size="default" onClick={ this._createSipVoipTrunk }>
                        { formatMessage({id: "LANG2908"}) }
                    </Button>
                    <Button icon="plus" type="primary" size="default" onClick={ this._createIaxVoipTrunk }>
                        { formatMessage({id: "LANG2909"}) }
                    </Button>
                    {/* <Button type="primary" icon="" onClick={this._deleteVoipTrunk} >
                            {formatMessage({id: "LANG739"})}
                        </Button>
                    */}
                </div>
                <Table
                    rowSelection={ undefined }
                    columns={ columns }
                    rowKey={ record => record.trunk_index }
                    dataSource={ this.state.voipTrunk }
                    pagination={ this.state.pagination }
                    loading={ this.state.loading}
                    onChange={ this._handleTableChange }
                />
            </div>
        )
    }
}

VoipTrunksList.defaultProps = {

}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(VoipTrunksList)))

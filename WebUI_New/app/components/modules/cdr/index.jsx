'use strict'

import $ from 'jquery'
import '../../../css/cdr'
import _ from 'underscore'
import api from "../../api/api"
import CDRList from './CDRList'
import CDRSearch from './CDRSearch'
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Alert, Modal, message, Form, Spin } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'

class CDR extends Component {
    constructor(props) {
        super(props)

        this.state = {
            cdrData: [],
            dataPost: {},
            store_msg: '',
            isDisplaySearch: 'hidden',
            interfaceStatusVisible: false,
            isDisplay: 'display-block-filter',
            pagination: {
                defaultPageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: this._showTotal
            }
        }
    }
    componentDidMount () {
        this._getCdrData()
    }
    componentWillMount() {
        this.props.getInterfaceStatus()
    }
    componentWillReceiveProps(nextProps) {
        const { formatMessage } = this.props.intl

        let interfaceStatus = nextProps.interfaceStatus || {},
            sdcard_info = interfaceStatus['interface-sdcard'],
            usbdisk_info = interfaceStatus['interface-usbdisk'],
            link_info = '',
            store_msg = ''

        if (!_.isEmpty(interfaceStatus)) {
            if (sdcard_info === 'true' || usbdisk_info === 'true') {
                $.ajax({
                    type: 'post',
                    async: false,
                    url: api.apiHost,
                    data: {
                        'action': 'getRecordingLink',
                        'auto-refresh': Math.random()
                    },
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, formatMessage)

                        if (bool) {
                            link_info = res.response['body']

                            if (link_info === 'local') {
                                store_msg = 'LANG1072'
                            } else if (link_info === 'USB') {
                                store_msg = 'LANG263'
                            } else if (link_info === 'SD') {
                                store_msg = 'LANG262'
                            }

                            this.setState({
                                store_msg: store_msg,
                                interfaceStatusVisible: true
                            })
                        }
                    }.bind(this),
                    error: function(e) {
                        message.destroy()
                        message.error(formatMessage({id: "LANG913"}))
                    }
                })
            } else {
                $.ajax({
                    type: 'post',
                    async: false,
                    url: api.apiHost,
                    data: {
                        'action': 'getRecordingLink',
                        'auto-refresh': Math.random()
                    },
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, formatMessage)

                        if (bool) {
                            link_info = res.response['body']

                            this.setState({
                                store_msg: store_msg,
                                interfaceStatusVisible: false
                            })

                            if (link_info !== 'local') {
                                $.ajax({
                                    type: 'post',
                                    async: false,
                                    url: api.apiHost,
                                    data: {
                                        'choose_link': '0',
                                        'action': 'ChooseLink'
                                    },
                                    error: function(e) {
                                        message.destroy()
                                        message.error(formatMessage({id: "LANG913"}))
                                    },
                                    success: function(res) {
                                        const bool = UCMGUI.errorHandler(res, null, formatMessage)

                                        if (bool) {}
                                    }
                                })
                            }
                        }
                    }.bind(this),
                    error: function(e) {
                        message.destroy()
                        message.error(formatMessage({id: "LANG913"}))
                    }
                })
            }
        }
    }
    _jumpToRecordingStorage = () => {
        browserHistory.push('/pbx-settings/recordingStorageSettings')
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _handleTableChange = (pagination, filters, sorter) => {
        let dataPost = this.state.dataPost
        let params = {
            page: pagination.current,
            item_num: pagination.pageSize,
            ...filters
        }

        if (sorter.field) {
            params.sidx = sorter.field
            params.sord = sorter.order === 'ascend' ? 'asc' : 'desc'
        } else {
            params.sidx = 'start'
            params.sord = 'desc'
        }

        this._getCdrData(params, dataPost)
    }
    _getCdrData = (
        params = {
            item_num: 10,
            sidx: "start",
            sord: "desc",
            page: 1
        }, dataPost) => {
        if (dataPost) {
            _.extend(params, dataPost)
        }

        $.ajax({
            type: 'POST',
            url: api.apiHost,
            data: {
                action: 'listCDRDB',
                ...params
            },
            success: function(data) {
                let cdrData = data.response.acctid || [],
                    pager = this.state.pagination

                pager.current = data.response.page
                pager.total = data.response.total_item

                this.setState({
                    cdrData: cdrData,
                    pagination: pager
                })

                this.props.setSpinLoading({loading: false})
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deleteAll = () => {
        const { formatMessage } = this.props.intl

        let self = this

        Modal.confirm({
            content: formatMessage({id: "LANG840" }),
            okText: formatMessage({id: "LANG727" }),
            cancelText: formatMessage({id: "LANG726" }),
            onOk() {
                $.ajax({
                    type: "POST",
                    async: false,
                    dataType: "json",
                    url: api.apiHost,
                    data: {
                        "action": 'deleteCDRDB',
                        "acctid": '0'
                    },
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        self.setState({
                            cdrData: []
                        })

                        Modal.success({
                            title: formatMessage({id: "LANG543" }),
                            content: formatMessage({id: "LANG819" }),
                            okText: formatMessage({id: "LANG727" }),
                            onOk() {}
                        })
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
    _showSearch = () => {
        this.setState({
            isDisplay: 'display-block',
            isDisplaySearch: 'display-block'
        })
    }
    _handleCancel = () => {
        const { form } = this.props

        form.resetFields()

        this.setState({
            dataPost: {}
        })

        this._getCdrData()
    }
    _sendDownloadSearchRequest = (value) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                message.loading(formatMessage({ id: "LANG3774" }))

                let action = {}

                let all = form.getFieldsValue()

                _.each(all, function(item, key) {
                    if (item !== undefined && item !== '') {
                        if (_.isObject(item)) {
                            if (key.match(/fromtime|totime/)) {
                                action[key] = item.format('YYYY-MM-DD HH:mm')
                            } else {
                                if (item.length) {
                                    action[key] = item.join()
                                } else {
                                    delete action[key]
                                } 
                            }
                        } else {
                            action[key] = item
                        }
                    }
                })

                action['action'] = 'CreateCdrRecord'
                action['condition'] = 1

                $.ajax({
                    type: "POST",
                    data: action,
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()

                            window.open("/cgi?action=downloadCdrRecord&type=cdr_recording&data=Master_condition.csv&_location=cdr&_=" + (new Date().getTime()), '_self')
                        }
                    }.bind(this)
                })
            }
        })
    }
    _handleSubmit = (value) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let dataPost = {}

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG3773" })})

                let item_num = this.state.pagination.pageSize ? this.state.pagination.pageSize : this.state.pagination.defaultPageSize

                let params = {
                    page: 1,
                    sord: 'desc',
                    item_num: item_num,
                    sidx: 'start'
                }

                let all = form.getFieldsValue()

                _.each(all, function(item, key) {
                    if (item !== undefined && item !== '') {
                        if (_.isObject(item)) {
                            if (key.match(/fromtime|totime/)) {
                                dataPost[key] = item.format('YYYY-MM-DD HH:mm')
                            } else {
                                if (item.length) {
                                    dataPost[key] = item.join()
                                } else {
                                    delete dataPost[key]
                                } 
                            }
                        } else {
                            dataPost[key] = item
                        }
                    }
                })

                this.setState({
                    dataPost: dataPost
                })

                this._getCdrData(params, dataPost)
            }
        })
    }
    render() {
        const {formatMessage} = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let htmlPrivilege = JSON.parse(localStorage.getItem('html_privilege'))
        let storagePrivilege = htmlPrivilege.recordingStorageSettings === 1

        let message = '',
            store_msg = this.state.store_msg

        if (store_msg) {
            message = <span
                            style={{ 'cursor': 'pointer' }}
                            onClick={ this._jumpToRecordingStorage.bind(this) }
                            dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3757" }, {
                                        0: `<span style="disabled: inline-block; color: #4c8eff; margin: 0 5px; cursor: pointer;">` + formatMessage({id: store_msg}) + `</span>`
                                    })
                                }}
                        ></span>
        }

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG7"})})

        return (
            <div className="app-content-main app-content-cdr">
                <Title
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    onSearch={ this._showSearch }
                    isDisplay={ this.state.isDisplay} 
                    headerTitle={ formatMessage({id: "LANG7"}) }
                    saveTxt={ formatMessage({id: "LANG1288" }) }
                    cancelTxt={ formatMessage({id: "LANG750" }) }
                />
                <div className="content">
                    <CDRSearch
                        form={ this.props.form }
                        _hideSearch={ this._hideSearch }
                        isDisplaySearch={ this.state.isDisplaySearch }
                    />
                    <Alert
                        type="warning"
                        message={ message }
                        className={ storagePrivilege && this.state.interfaceStatusVisible ? 'ant-alert-warning-custom' : 'hidden' }
                    />
                    <CDRList
                        cdrData={ this.state.cdrData }
                        deleteAll={ this._deleteAll }
                        _getCdrData={ this._getCdrData }
                        pagination={ this.state.pagination }
                        handleTableChange={ this._handleTableChange }
                        sendDownloadSearchRequest={ this._sendDownloadSearchRequest }
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading,
    interfaceStatus: state.interfaceStatus
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(CDR)))
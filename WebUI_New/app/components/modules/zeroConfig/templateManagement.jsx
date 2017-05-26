'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
// import ZEROCONFIG from './parser/ZCDataSource'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Col, Form, Input, Row, message, Transfer, Tooltip, Checkbox, Icon, Modal, Button, Table, Upload } from 'antd'

const FormItem = Form.Item
const uploadErrObj = {
        "-1": "LANG4144",
        "-2": "LANG4120"
    }

class TemplateManagement extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showPrepare: true,
            showContent: false,
            baseVersion: null,
            currentModal: null,
            uploadLoading: true,
            remoteTemplateList: []
        }
    }
    componentDidMount() {
        $(document).ready(() => {
            let ZEROCONFIG = window.ZEROCONFIG
            let { formatMessage } = this.props.intl

            if (!window.ISREFRESHPAGE) {
                ZEROCONFIG.init('', formatMessage, message)

                this._checkReady()
            } else {
                setTimeout(() => {
                    ZEROCONFIG.init('', formatMessage, message)

                    this._checkReady()
                }, 600)
            }
        })
    }
    componentWillUnmount() {
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.activeKey === 'templateManagement') {
            this._checkReady()
        }
    }
    _checkReady = () => {
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG
        let { formatMessage } = this.props.intl

        if (ZEROCONFIG && ZEROCONFIG.isDataReady() === 1) {
            this._getVersionInfo()
            this._fetchRemoteTemplateList()

            this.setState({
                showContent: true,
                showPrepare: false
            })
        } else {
            let label = $('div#loadingMsgTM'),
                tLocale = 'LANG805'

            if (ZEROCONFIG && ZEROCONFIG.isDataReady() === -1) {
                tLocale = 'LANG3717'
            }

            label.text(formatMessage({id: tLocale}))

            setTimeout(this._checkReady, 1000)
        }
    }
    _getVersionInfo() {
        $.ajax({
            async: true,
            type: 'post',
            url: api.apiHost,
            data: {
                action: "getZeroConfigVersionInfo"
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, function () {})

                if (bool) {
                    const version_info = data.response.zc_model.base_version

                    this.setState({
                        baseVersion: version_info
                    })
                }
            }.bind(this)
        })
    }
    _fetchRemoteTemplateList() {
        $.ajax({
            async: true,
            type: 'post',
            url: api.apiHost,
            data: {
                sord: "asc",
                sidx: "model",
                action: "fetchRemoteTemplateList"
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                message.destroy()

                let bool = UCMGUI.errorHandler(data, function () {})

                if (bool) {
                    let template_list = data.response.template_list

                    template_list = _.map(template_list, (data, index) => {
                        let obj = data

                        obj.id = index

                        return obj
                    })

                    this.setState({
                        remoteTemplateList: template_list
                    })
                }
            }.bind(this)
        })
    }
    _reloadData() {
        let me = this
        let ZEROCONFIG = window.ZEROCONFIG
        let { formatMessage } = this.props.intl

        message.loading(formatMessage({id: "LANG3717"}), 0)

        ZEROCONFIG.reset()

        ZEROCONFIG.init(() => {
            let checkReady = () => {
                if (ZEROCONFIG.isDataReady() === 1) {
                    message.destroy()
                    message.success(formatMessage({id: "LANG4143"}))

                    me._fetchRemoteTemplateList()
                }
            }

            checkReady()
        })
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _renderModalTitle = () => {
        const { formatMessage } = this.props.intl

        let type = this.state.type

        if (type === "upload") {
            return formatMessage({id: "LANG4116"})
        } else if (type === "downloadReleaseNote") {
            return "Updates"
        }
    }
    _handleOk = () => {
    }
    _handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    _renderModalOkText = () => {
        const { formatMessage } = this.props.intl

        let type = this.state.type

        if (type === "upload") {
            return formatMessage({ id: "LANG4116" })
        } else if (type === "downloadReleaseNote") {
            return formatMessage({ id: "LANG727" })
        } else {
            return formatMessage({id: "LANG728"})
        }
    }
    _renderModalCancelText = () => {
        const { formatMessage } = this.props.intl

        return formatMessage({id: "LANG726"})
    }
    _downloadModelTemplate(record) {
        const { formatMessage } = this.props.intl

        /* if (record.update !== null && record.update.length > 0) {
            this._downloadReleaseNotes()
        } else { */
            const filename = record.filename

            message.destroy()

            if (!filename) {
                message.error(formatMessage({ id: "LANG916" }))

                return
            }

            this.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG5635"})})

            $.ajax({
                async: true,
                type: 'post',
                url: api.apiHost,
                data: {
                    "model_template": filename,
                    action: "fetchRemoteTemplatePackage"
                },
                error: function(e) {
                    message.error(e.statusText)
                },
                success: function (data) {
                    message.destroy()

                    this.props.setSpinLoading({loading: false})

                    if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result') && data.response.result === 0) {
                        this._reloadData()
                    } else if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result') && uploadErrObj.hasOwnProperty(data.response.result)) {
                        message.error(formatMessage({id: uploadErrObj[data.response.result]}))
                    } else {
                        message.error(formatMessage({id: "LANG4144"}))
                    }
                }.bind(this)
            })
       //  }
    }
    _upgradeModelTemplate = (record) => {
    }
    _restoreModelTemplate = (record) => {
    }
    _downloadReleaseNotes() {
    }
    _renderOptions = (text, record, index) => {
        let BLL = window.BLL

        let upgrade = <span
                        className="sprite sprite-upgrade"
                        onClick={ this._upgradeModelTemplate.bind(this, record) }
                    ></span>

        let upgradeDisable = <span
                                className="sprite sprite-upgrade-dsiabled"
                            ></span>

        let download = <span
                        className="sprite sprite-download"
                        onClick={ this._downloadModelTemplate.bind(this, record) }
                    ></span>

        let restore = <span
                        className="sprite sprite-restore"
                        onClick={ this._restoreModelTemplate.bind(this, record) }
                    ></span>

        let invalidmodel = BLL.DataCollection.getInvalidModelByName(record.vendor, record.model)

        if (invalidmodel !== undefined) {
            return restore
        }

        let localmodel = BLL.DataCollection.getModelByName(record.vendor, record.model)

        if (localmodel !== undefined) {
            if (localmodel.xmlVersion() === record.version) {
                return upgradeDisable
            }

            return upgrade
        }

        return download
    }
    _renderVersion = (text, record, index) => {
        let BLL = window.BLL
        let version = record.version + "/-"
        let localmodel = BLL.DataCollection.getModelByName(record.vendor, record.model)

        if (localmodel !== undefined) {
            version = record.version + "/" + localmodel.xmlVersion()
        }

        return version
    }
    render() {
        const me = this
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const baseVersion = this.state.baseVersion

        const uploadProps = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=zc_model_package',
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log("WL onchage:", info)

                if (me.state.uploadLoading) {
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG866"})})
                    me.state.uploadLoading = false
                }

                if (info.file.status === 'removed') {}

                if (info.file.status === 'done') {
                    let data = info.file.response

                    me.props.setSpinLoading({loading: false})
                    if (data) {
                        let status = data.status,
                            response = data.response

                        if (status === 0 && response && response.result === 0) {
                            me._reloadData()
                        } else if (response && uploadErrObj.hasOwnProperty(response.result)) {
                            message.error(formatMessage({id: uploadErrObj[data.response.result]}))
                        } else {
                            message.error(formatMessage({id: "LANG4144"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }

                    me.state.uploadLoading = true
                }

                if (info.file.status === 'error') {
                    me.props.setSpinLoading({loading: false})
                    message.error(formatMessage({id: "LANG916"}))
                    me.state.uploadLoading = true
                }
            },
            onRemove() {
            }
        }

        const columns = [{
                title: formatMessage({id: "LANG1299"}),
                dataIndex: 'vendor'
            }, {
                title: formatMessage({id: "LANG1295"}),
                dataIndex: 'model'
            }, {
                title: formatMessage({id: "LANG2466"}),
                dataIndex: 'version',
                render: (text, record, index) => {
                    return this._renderVersion(text, record, index)
                }
            }, {
                title: formatMessage({id: "LANG2257"}),
                dataIndex: 'size'
            }, {
                title: formatMessage({id: "LANG74"}),
                dataIndex: 'update',
                key: 'x',
                render: (text, record, index) => {
                    return this._renderOptions(text, record, index)
                }
            }
        ]

        const pagination = {
            showSizeChanger: true,
            total: this.state.remoteTemplateList.length,
            onShowSizeChange(current, pageSize) {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange(current) {
                console.log('Current: ', current)
            }
        }

        // rowSelection object indicates the need for row selection
        const rowSelection = {
            onChange(selectedRowKeys, selectedRows) {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
            },
            onSelect(record, selected, selectedRows) {
                console.log(record, selected, selectedRows)
            },
            onSelectAll(selected, selectedRows, changeRows) {
                console.log(selected, selectedRows, changeRows)
            }
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div
                    id="preparePadGT"
                    style={{ 'width': '500px', 'height': '160px' }}
                    className={ this.state.showPrepare ? 'display-block' : 'hidden' }
                >
                    <div style={{ 'marginTop': '60px' }}>
                        <img src="/../../images/ani_loading.gif"/>
                    </div>
                    <div id="loadingMsgTM" style={{ 'textAlign': 'center' }}>{ formatMessage({ id: "LANG805"}) }</div>
                </div>
                <div className={ this.state.showContent ? 'content' : 'hidden' }>
                    <Form>
                        <div className="section-title">{ formatMessage({id: "LANG4765"}) }</div>
                        <Row>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4767" /> }>
                                        <span>{ formatMessage({id: "LANG4766"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                <span>
                                    { baseVersion }
                                </span>
                            </FormItem>
                        </Row>
                        <div className="section-title">{ formatMessage({id: "LANG4116"}) }</div>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4118" /> }>
                                    <span>{ formatMessage({id: "LANG4117"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('upload', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload { ...uploadProps }>
                                    <Button type="ghost">
                                        <Icon type="upload" />{ formatMessage({id: "LANG1607"}) }
                                    </Button>
                                </Upload>
                            ) }
                        </FormItem>
                        <div className="section-title">{ formatMessage({id: "LANG4119"}) }</div>
                        <Table
                            bordered
                            rowKey="id"
                            columns={ columns }
                            pagination={ pagination }
                            rowSelection={ rowSelection }
                            dataSource={ this.state.remoteTemplateList }
                        />
                        <Modal
                            onOk={ this._handleOk }
                            visible={ this.state.visible }
                            onCancel={ this._handleCancel }
                            title={ this._renderModalTitle() }
                            okText={ this._renderModalOkText() }
                            cancelText={ this._renderModalCancelText() }
                        >
                            <Form>
                                <div
                                    ref="showReleaseNotes"
                                    className={ this.state.type === "showReleaseNotes" ? "display-block" : "hidden" }
                                >
                                    <FormItem
                                        { ...formItemLayout }
                                        label="Release Notes for { this.state.currentModal }"
                                    >
                                        { (
                                           <span>Release Notes Here</span>
                                        ) }
                                    </FormItem>
                                </div>
                            </Form>
                        </Modal>
                    </Form>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

TemplateManagement.propTypes = {}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(TemplateManagement)))

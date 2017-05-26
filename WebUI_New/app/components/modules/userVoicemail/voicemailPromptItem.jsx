'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, formatMessage } from 'react-intl'
import { Col, Form, Input, message, Tooltip, Checkbox, Upload, Icon, Modal, Button, Row } from 'antd'

const FormItem = Form.Item

class UserVoicemailPromptItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hasBusy: "",
            hasGreet: "",
            hasTemp: "",
            hasUnavail: "",
            upgradeLoading: true
        }
    }
    componentWillMount() {
        this._listVoicemailPromptlFile()
    }
    componentDidMount() {
    }
    _listVoicemailPromptlFile = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'user_recording',
                item_num: 10,
                sidx: 'd',
                sord: 'asc',
                page: 1,
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3", "wav", "gsm", "ulaw", "alaw"]}'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const fileList = response.user_recording || []
                    // Read total count from server
                    let hasBusy = ""
                    let hasGreet = ""
                    let hasTemp = ""
                    let hasUnavail = ""

                    fileList.map((item, i) => {
                        if (item.n.indexOf("busy") > -1) {
                            hasBusy = item.n
                        } else if (item.n.indexOf("greet") > -1) {
                            hasGreet = item.n
                        } else if (item.n.indexOf("temp") > -1) {
                            hasTemp = item.n
                        } else if (item.n.indexOf("unavail") > -1) {
                            hasUnavail = item.n
                        }
                    })

                    this.setState({
                        hasBusy: hasBusy,
                        hasGreet: hasGreet,
                        hasTemp: hasTemp,
                        hasUnavail: hasUnavail
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        browserHistory.push('/user-personal-data/userVoicemail')
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _onRemoveFile = (filename) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: "removeFile",
                type: "user_recording",
                data: filename
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)
                    this._listVoicemailPromptlFile()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _onDownloadFile = (filename) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            url: "/cgi",
            data: {
                "action": "checkFile",
                "type": "user_recording",
                "data": filename
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    window.open("/cgi?action=downloadFile&type=user_recording" + "&data=" + encodeURIComponent(filename), '_self')
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })
    }
    _checkFile = (file) => {
        const { formatMessage } = this.props.intl

        let filename = file.name
        filename = filename.toLowerCase()
        if (filename.slice(-4) !== '.mp3' && filename.slice(-4) !== '.wav' && filename.slice(-4) !== '.gsm' && filename.slice(-4) !== '.ulaw' && filename.slice(-4) !== '.alaw') {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG867"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
            return false
        } else {
            return true
        }
    }

    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let hasBusy = this.state.hasBusy
        let hasGreet = this.state.hasGreet
        let hasTemp = this.state.hasTemp
        let hasUnavail = this.state.hasUnavail

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 21 }
        }
        const title = formatMessage({id: "LANG4722"})

        const roomItem = this.state.roomItem || {}

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })
        const me = this
        const props_busy = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=user_recording&data=busy',
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }
                if (me.state.upgradeLoading) {
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG1409"})})
                    me.setState({upgradeLoading: false})
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response
                    if (data) {
                        let status = data.status,
                            response = data.response

                        me.props.setSpinLoading({loading: false})

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))
                            me._listVoicemailPromptlFile()
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                    me.setState({
                        upgradeLoading: true
                    })
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                    me.setState({
                        upgradeLoading: true
                    })
                }
            },
            onRemove() {
                me.props.setSpinLoading({loading: false})
                message.destroy()
            },
            beforeUpload: me._checkFile
        }

        const props_greet = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=user_recording&data=greet',
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }
                if (me.state.upgradeLoading) {
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG1409"})})
                    me.setState({upgradeLoading: false})
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response
                    if (data) {
                        let status = data.status,
                            response = data.response

                        me.props.setSpinLoading({loading: false})

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))
                            me._listVoicemailPromptlFile()
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                    me.setState({
                        upgradeLoading: true
                    })
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                    me.setState({
                        upgradeLoading: true
                    })
                }
            },
            onRemove() {
                me.props.setSpinLoading({loading: false})
                message.destroy()
            },
            beforeUpload: me._checkFile
        }

        const props_temp = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=user_recording&data=temp',
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }
                if (me.state.upgradeLoading) {
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG1409"})})
                    me.setState({upgradeLoading: false})
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response
                    if (data) {
                        let status = data.status,
                            response = data.response

                        me.props.setSpinLoading({loading: false})

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))
                            me._listVoicemailPromptlFile()
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                    me.setState({
                        upgradeLoading: true
                    })
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                    me.setState({
                        upgradeLoading: true
                    })
                }
            },
            onRemove() {
                me.props.setSpinLoading({loading: false})
                message.destroy()
            },
            beforeUpload: me._checkFile
        }

        const props_unavail = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=user_recording&data=unavail',
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }
                if (me.state.upgradeLoading) {
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG1409"})})
                    me.setState({upgradeLoading: false})
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response
                    if (data) {
                        let status = data.status,
                            response = data.response

                        me.props.setSpinLoading({loading: false})

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))
                            me._listVoicemailPromptlFile()
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                         me.setState({
                        upgradeLoading: true
                    })
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                         me.setState({
                        upgradeLoading: true
                    })
                    }
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                }
            },
            onRemove() {
                me.props.setSpinLoading({loading: false})
                message.destroy()
            },
            beforeUpload: me._checkFile
        }
        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                    isDisplaySubmit='hidden'
                />
                <div className="content">
                    <Form>
                        <div className="lite-desc">
                            <Row>
                                { formatMessage({id: "LANG4826"}) }
                            </Row>
                            <Row>
                                { formatMessage({id: "LANG867"}) }
                            </Row>
                        </div>
                        <FormItem
                            { ...formItemLayout }

                            label={(
                                <span>Busy</span>
                            )}>
                            <Col xl={ 3 } lg={ 4 }>
                            { getFieldDecorator('busy', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...props_busy} disabled= {this.state.hasBusy !== ""}>
                                    <Button type="ghost">
                                        <Icon type="upload" />{this.state.hasBusy === "" ? formatMessage({id: "LANG1607"}) : this.state.hasBusy}
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col xl={ 2 } lg={ 3 }>
                                <Button
                                    icon="download"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasBusy === ""}
                                    onClick={ this._onDownloadFile.bind(this, this.state.hasBusy) }>
                                    { formatMessage({id: "LANG759"}) }
                                </Button>
                            </Col>
                            <Col xl={ 2 } lg={ 3 }>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasBusy === ""}
                                    onClick={ this._onRemoveFile.bind(this, this.state.hasBusy) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }

                            label={(
                                <span>Greet</span>
                            )}>
                            <Col xl={ 3 } lg={ 4 }>
                            { getFieldDecorator('greet', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...props_greet} disabled= {this.state.hasGreet !== ""}>
                                    <Button type="ghost">
                                        <Icon type="upload" />{this.state.hasGreet === "" ? formatMessage({id: "LANG1607"}) : this.state.hasGreet}
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col xl={ 2 } lg={ 3 }>
                                <Button
                                    icon="download"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasGreet === ""}
                                    onClick={ this._onDownloadFile.bind(this, this.state.hasGreet) }>
                                    { formatMessage({id: "LANG759"}) }
                                </Button>
                            </Col>
                            <Col xl={ 2 } lg={ 3 }>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasGreet === ""}
                                    onClick={ this._onRemoveFile.bind(this, this.state.hasGreet) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }

                            label={(
                                <span>Temp</span>
                            )}>
                            <Col xl={ 3 } lg={ 4 }>
                            { getFieldDecorator('temp', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...props_temp} disabled= {this.state.hasTemp !== ""}>
                                    <Button type="ghost">
                                        <Icon type="upload" />{this.state.hasTemp === "" ? formatMessage({id: "LANG1607"}) : this.state.hasTemp}
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col xl={ 2 } lg={ 3 }>
                                <Button
                                    icon="download"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasTemp === ""}
                                    onClick={ this._onDownloadFile.bind(this, this.state.hasTemp) }>
                                    { formatMessage({id: "LANG759"}) }
                                </Button>
                            </Col>
                            <Col xl={ 2 } lg={ 3 }>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasTemp === ""}
                                    onClick={ this._onRemoveFile.bind(this, this.state.hasTemp) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }

                            label={(
                                <span>Unavail</span>
                            )}>
                            <Col xl={ 3 } lg={ 4 }>
                            { getFieldDecorator('unavail', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...props_unavail} disabled= {this.state.hasUnavail !== ""}>
                                    <Button type="ghost">
                                        <Icon type="upload" />{this.state.hasUnavail === "" ? formatMessage({id: "LANG1607"}) : this.state.hasUnavail}
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col xl={ 2 } lg={ 3 }>
                                <Button
                                    icon="download"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasUnavail === ""}
                                    onClick={ this._onDownloadFile.bind(this, this.state.hasUnavail) }>
                                    { formatMessage({id: "LANG759"}) }
                                </Button>
                            </Col>
                            <Col xl={ 2 } lg={ 3 }>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasUnavail === ""}
                                    onClick={ this._onRemoveFile.bind(this, this.state.hasUnavail) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(UserVoicemailPromptItem)))

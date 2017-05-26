'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Button, message, Modal, Popconfirm, Form, Input, Select, Tooltip, Upload, Icon, Radio, Col, Table } from 'antd'
import Validator from "../../api/validator"
import _ from 'underscore'

const Option = Select.Option
const FormItem = Form.Item
const RadioGroup = Radio.Group
const uploadErrObj = {
        1: "LANG890",
        2: "LANG891",
        3: "LANG892",
        4: "LANG893",
        5: "LANG894",
        6: "LANG895",
        7: "LANG896",
        8: "LANG897",
        9: "LANG898",
        10: "LANG899"
    }

class VoicePrompt extends Component {
    constructor(props) {
        super(props)
        this.state = {
            languageList: [],
            allLanguageList: [],
            infoVisible: false,
            loading: false
        }
    }
    componentDidMount() {
        this._getLanguage()
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _getLanguage = () => {
        const { formatMessage } = this.props.intl
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getLanguage' },
            type: 'json',
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    const languageList = response.languages
                    this.setState({
                        languageList: languageList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getAllLanguage = () => {
        const { formatMessage } = this.props.intl
        message.loading(formatMessage({id: "LANG2470"}, {0: formatMessage({id: "LANG2468"})}))
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'fetchRemoteLanguageList',
                sidx: 'language',
                sord: 'asc'
            },
            type: 'json',
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    const allLanguageList = response.language_list
                    this.setState({
                        allLanguageList: allLanguageList
                    })
                    message.destroy()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _showVoickPromptList = () => {
        this._getAllLanguage()
        this.setState({
            infoVisible: true
        })
    }
    _infoCancel = () => {
        const { formatMessage } = this.props.intl
        if (this.state.loading === false) {
            this.setState({
                infoVisible: false
            })
        } else {
            // message.loading(formatMessage({id: "LANG2462"}, {0: formatMessage({id: "LANG2468"})}))
        }
    }
    _onChangeRadio = (e) => {
        
    }
    _updateLanguageSetting = (key) => {
        const { formatMessage } = this.props.intl
        message.loading(formatMessage({id: "LANG770"}))
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'updateLanguageSettings',
                language: key
            },
            type: 'json',
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    this._getLanguage()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _delete = (key) => {
        const { formatMessage } = this.props.intl
        message.loading(formatMessage({id: "LANG877"}))
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'removeFile',
                type: 'voice_package',
                data: key
            },
            type: 'json',
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    this._getLanguage()
                    const select = this.props.form.getFieldValue('language')
                    if (select === key && this.props.language !== key) {
                        this.props.form.setFieldsValue({
                            'language': this.props.language
                        })
                    }
                    if (this.props.language === key) {
                        this._updateLanguageSetting('en')
                        this.props.form.setFieldsValue({
                            'language': 'en'
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _downloadLanguge = (record) => {
        const { formatMessage } = this.props.intl
        message.loading(formatMessage({id: "LANG2462"}, {0: formatMessage({id: "LANG2468"})}))
        this.setState({loading: true})
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'fetchRemoteLanguagePackage',
                package: record.filename
            },
            type: 'json',
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    this.setState({
                        infoVisible: false,
                        loading: false
                    })
                    message.destroy()
                    this._getLanguage()
                    this.props.getLanguageSettings()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _createVersion = (text, record, index) => {
        const languageList = this.state.languageList
        const version = record.version
        const filename = record.language
        let return_value = version + '/-'
        languageList.map(function(item) {
            if (item.language_name === filename) {
                return_value = version + '/' + item.version
            }
        })
        return <span>{ return_value }</span>
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl
        const languageList = this.state.languageList
        const version = record.version
        const filename = record.language
        let type = 0 /* 0 download , 1 upgrade, 2 do not */ 
        languageList.map(function(item) {
            if (item.language_name === filename) {
                if (version === item.version) {
                    type = 2
                } else {
                    type = 1
                }
            }
        })
        if (type === 0) {
                return <div>
                    <span
                        className="sprite sprite-download"
                        title={ formatMessage({id: "LANG2465"}) }
                        onClick={ this._downloadLanguge.bind(this, record) }>
                    </span>
                </div>
        } else if (type === 1) {
            return <div>
                    <span
                        className="sprite sprite-edit"
                        title={ formatMessage({id: "LANG61"}) }
                        onClick={ this._downloadLanguge.bind(this, record) }>
                    </span>
                </div>
        } else if (type === 2) {
            return <div>
                    <span
                        className="sprite sprite-edit sprite-edit-disabled"
                        title={ formatMessage({id: "LANG61"}) }>
                    </span>
                </div>
        }
    }
    _checkFormat = (file) => {
        const { formatMessage } = this.props.intl
        let returnValue = false

        const filename = file.name
        if (filename.endsWith('.tar.bz2') || filename.endsWith('.tar.gz') ||
            filename.endsWith('.tar.z') || filename.endsWith('.tgz') ||
            filename.endsWith('.tar') || filename.endsWith('.bz2') ||
            filename.endsWith('.zip') || filename.endsWith('.gz')) {
            returnValue = true
        } else {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG908"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        }
        return returnValue
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const me = this
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG674"})
                })

        const props = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=voice_package',
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

                        // me.props.setSpinLoading({loading: false})

                        if (data.status === 0 && response) {
                            if (response.result === 0) {
                                me._getLanguage()
                                me._handleCancel()
                            } else {
                                message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: uploadErrObj[Math.abs(parseInt(data.response.result))] })}}></span>)
                            }
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
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                }
            },
            onRemove() {
                message.destroy()
            },
            beforeUpload: me._checkFormat
        }
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px'
        }
        const columns = [{
                key: 'language',
                dataIndex: 'language',
                title: formatMessage({id: "LANG781"})
            }, {
                key: 'version',
                dataIndex: 'version',
                title: formatMessage({id: "LANG2466"}),
                render: (text, record, index) => {
                    return this._createVersion(text, record, index)
                }
            }, {
                key: 'size',
                dataIndex: 'size',
                title: formatMessage({id: "LANG2257"})
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return this._createOption(text, record, index)
                }
            }]

        return (
            <div className="app-content-main">
                <div className="content">
                    <div className="section-title">
                        <p><span>{ formatMessage({id: "LANG783"}) }</span></p>
                    </div>
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1742" />}>
                                    <span>{formatMessage({id: "LANG1741"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('upload', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...props}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                    </Button>
                                </Upload>
                            ) }
                        </FormItem>
                    </Form>
                    <div className="section-title">
                        <p><span>{ formatMessage({id: "LANG781"}) }</span></p>
                    </div>
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1740" />}>
                                    <span>{formatMessage({id: "LANG1739"})}</span>
                                </Tooltip>
                            )}>
                                <Col span={ 23 }>
                                    { getFieldDecorator('language', {
                                        rules: [],
                                        initialValue: this.props.language
                                    })(
                                    <RadioGroup onChange={ this._onChangeRadio }>
                                        <Radio style={ radioStyle } value={'en'}>English : en</Radio>
                                        <Radio style={ radioStyle } value={'zh'}>中文 : zh</Radio>
                                        {
                                            this.state.languageList.map(function(item) {
                                                if (item.language_id !== 'zh' && item.language_id !== 'en') {
                                                    return <Radio
                                                            style={ radioStyle }
                                                            key={ item.language_id }
                                                            value={ item.language_id }>
                                                            { item.language_name + ' : ' + item.language_id }
                                                            <Popconfirm
                                                                title={ formatMessage({id: "LANG841"}) }
                                                                okText={ formatMessage({id: "LANG727"}) }
                                                                cancelText={ formatMessage({id: "LANG726"}) }
                                                                onConfirm={ me._delete.bind(this, item.language_id) }
                                                            >
                                                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                                                            </Popconfirm>
                                                        </Radio>
                                                }
                                            })
                                        }
                                    </RadioGroup>
                                    )}
                                </Col>
                                <Col span={ 12 }>
                                    <Button
                                        icon="save"
                                        type="primary"
                                        size='default'
                                        onClick={ this._showVoickPromptList }
                                    >
                                        { formatMessage({id: "LANG2464"}) }
                                    </Button>
                                </Col>
                        </FormItem>
                    </Form>
                </div>
                <Modal title={ formatMessage({id: "LANG3923"}) }
                    visible={ this.state.infoVisible }
                    onOk={ this._infoCancel }
                    onCancel={ this._infoCancel }
                    footer={[
                        <Button onClick={this._infoCancel}>{ formatMessage({id: "LANG726"}) }</Button>
                    ]}
                >
                    <Table
                        rowKey="filename"
                        columns={ columns }
                        pagination={ false }
                        dataSource={ this.state.allLanguageList }
                        showHeader={ !!this.state.allLanguageList.length }
                        scroll={{ y: 300 }}
                        loading={ this.state.loading }
                    >
                    </Table>
                </Modal>
            </div>
        )
    }
}

export default injectIntl(VoicePrompt)
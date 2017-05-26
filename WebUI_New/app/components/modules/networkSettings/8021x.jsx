'use strict'

import $ from 'jquery'
import _ from 'underscore'
import moment from "moment"
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, Upload, Icon, DatePicker, TimePicker, Button, Modal, Row } from 'antd'

const baseServerURl = api.apiHost
const FormItem = Form.Item
const confirm = Modal.confirm

class Network8021x extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lan1_mode_calss: {
                identity: 'hidden',
                cert: 'hidden'
            },
            lan2_mode_calss: {
                identity: 'hidden',
                cert: 'hidden'
            },
            network_pro_settings: {},
            CaCrt: "",
            ClientCrt: "",
            CaCrt2: "",
            ClientCrt2: ""
        }
    }
    componentWillMount() {
        this._initNetwork()
        this._checkFiles()
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }

    _initNetwork = () => {
        const { formatMessage } = this.props.intl
        let method = ""
        let method_calss = {}
        let response = {}

        $.ajax({
            url: api.apiHost,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "getNetworkproSettings"
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    response = data.response
                    this._EAPChange()
                    this._EAPChange2()
                }
            }.bind(this)
        })

        let value = ""
        value = response.mode
        let mode1 = {}
        let mode2 = {}

        if (value === "0") {
            mode1 = {
                identity: 'hidden',
                cert: 'hidden'
            }
        } else if (value === "1") {
            mode1 = {
                identity: 'display-block',
                cert: 'hidden'
            }
        } else {
            mode1 = {
                identity: 'display-block',
                cert: 'display-block'
            }
        }
        value = response['lan2.802.1x.mode']

        if (value === "0") {
            mode2 = {
                identity: 'hidden',
                cert: 'hidden'
            }
        } else if (value === "1") {
            mode2 = {
                identity: 'display-block',
                cert: 'hidden'
            }
        } else {
            mode2 = {
                identity: 'display-block',
                cert: 'display-block'
            }
        }

        this.setState({
            network_pro_settings: response,
            lan1_mode_class: mode1,
            lan2_mode_class: mode2
        })
    }

    _onChangeMode = (key, value) => {
        let mode = {}

        if (value === "0") {
            mode = {
                identity: 'hidden',
                cert: 'hidden'
            }
        } else if (value === "1") {
            mode = {
                identity: 'display-block',
                cert: 'hidden'
            }
        } else {
            mode = {
                identity: 'display-block',
                cert: 'display-block'
            }
        }
        if (key === "mode") {
            this.setState({
                lan1_mode_class: mode
            })
        } else {
            this.setState({
                lan2_mode_class: mode
            })
        }
    }
    _EAPChange = () => {

    }
    _EAPChange2 = () => {

    }

    _checkFiles = () => {
        const { formatMessage } = this.props.intl
        let CaCrt = ""
        let ClientCrt = ""
        let CaCrt2 = ""
        let ClientCrt2 = ""
        let type = ""
        let me = this
        let caList = []

        type = "8021x_ca_cert"
        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: {
                "action": "checkFile",
                "type": type
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status")) {
                     if (data.status === 0) {
                        CaCrt = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        type = "8021x_client_cert"
        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: {
                "action": "checkFile",
                "type": type
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status")) {
                     if (data.status === 0) {
                        ClientCrt = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        type = "8021x_ca_cert2"
        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: {
                "action": "checkFile",
                "type": type
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status")) {
                     if (data.status === 0) {
                        CaCrt2 = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        type = "8021x_client_cert2"
        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: {
                "action": "checkFile",
                "type": type
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status")) {
                     if (data.status === 0) {
                        ClientCrt2 = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        this.setState({
            CaCrt: CaCrt,
            ClientCrt: ClientCrt,
            CaCrt2: CaCrt2,
            ClientCrt2: ClientCrt2
        })
    }
    _checkFormat = (type, msg, file) => {
        const { formatMessage } = this.props.intl

        let filename = file.name
        filename = filename.toLowerCase()
        if (filename.slice(-type.length) !== type) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG911"}, {0: type, 1: formatMessage({id: msg})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
            return false
        } else {
            return true
        }
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }

    _onRemoveFileOK = (type) => {
        let successMessage = ''
        const { formatMessage } = this.props.intl
        let me = this

        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2798" })}}></span>
        let data = {
            action: "removeFile"
        }

        data.type = type

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: data,
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)
                if (bool) {
                    me._checkFiles()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onRemoveFile = (type) => {
        const { formatMessage } = this.props.intl
        let me = this
        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG938"})}} ></span>,
            onOk() {
                me._onRemoveFileOK(type)
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _setUpgradeLoading= () => {
        this.setState({upgradeLoading: false})
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const network_pro_settings = this.state.network_pro_settings
        const dhcp_settings = this.state.dhcp_settings
        const class8021x = this.props.class8021x
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        if (this.props.firstLoad) {
            this._initNetwork()
            this.props.setFirstLoad(0)
        }

        let upgradeLoading = this.state.upgradeLoading
        let CaCrt = this.state.CaCrt
        let ClientCrt = this.state.ClientCrt
        let CaCrt2 = this.state.CaCrt2
        let ClientCrt2 = this.state.ClientCrt2
        let me = this

        const propsCaCrt = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=8021x_ca_cert',
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
                if (upgradeLoading) {
                    this._setUpgradeLoading()
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

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))
                            me._checkFiles()
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
            }// ,
            // beforeUpload: this._checkFormat.bind(this, ".crt", "LANG3999")
        }

        const propsClientCrt = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=8021x_client_cert',
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
                if (upgradeLoading) {
                    this._setUpgradeLoading()
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

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))
                            me._checkFiles()
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
            }// ,
            // beforeUpload: this._checkFormat.bind(this, ".crt", "LANG3999")
        }

        const propsCaCrt2 = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=8021x_ca_cert2',
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
                if (upgradeLoading) {
                    this._setUpgradeLoading()
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

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))
                            me._checkFiles()
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
            }// ,
            // beforeUpload: this._checkFormat.bind(this, ".crt", "LANG3999")
        }

        const propsClientCrt2 = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=8021x_client_cert2',
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
                if (upgradeLoading) {
                    this._setUpgradeLoading()
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

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))
                            me._checkFiles()
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
            }// ,
            // beforeUpload: this._checkFormat.bind(this, ".crt", "LANG3999")
        }
        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form>
                        <Row className={ class8021x.lan1title }>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG266"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className={ class8021x.wantitle }>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG264"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <div className={ class8021x.lan1 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={                            
                                        <Tooltip title={<FormattedHTMLMessage id="LANG1934" />}>
                                            <span>{formatMessage({id: "LANG1933"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('lan2.802.1x.mode', {
                                        rules: [],
                                        initialValue: network_pro_settings['lan2.802.1x.mode']
                                    })(
                                        <Select onChange={ this._onChangeMode.bind(this, "lan2.802.1x.mode") }>
                                             <Option value="0">{formatMessage({id: "LANG273"})}</Option>
                                             <Option value="1">{formatMessage({id: "LANG1969"})}</Option>
                                             <Option value="2">{formatMessage({id: "LANG1970"})}</Option>
                                             <Option value="3">{formatMessage({id: "LANG1971"})}</Option>
                                         </Select>
                                    ) }
                                </FormItem>
                                <div className={ this.state.lan2_mode_class.identity }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={                            
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1928" />}>
                                                <span>{formatMessage({id: "LANG1927"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('lan2.802.1x.identity', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: class8021x.lan2 && this.state.lan2_mode_class.identity === 'display-block',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    class8021x.lan2 && this.state.lan2_mode_class.identity === 'display-block' ? Validator.keyboradNoSpace(data, value, callback, formatMessage) : callback()
                                                }
                                            }],
                                            initialValue: network_pro_settings['lan2.802.1x.identity']
                                        })(
                                            <Input maxLength="15" />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={                            
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1928" />}>
                                                <span>{formatMessage({id: "LANG1927"})}</span>
                                            </Tooltip>
                                        }
                                        className='hidden'
                                    >
                                        { getFieldDecorator('lan2.802.1x.username', {
                                            rules: [],
                                            initialValue: network_pro_settings['lan2.802.1x.username']
                                        })(
                                            <Input maxLength="15" />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={                            
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1930" />}>
                                                <span>{formatMessage({id: "LANG1929"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('lan2.802.1x.password', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: class8021x.lan2 && this.state.lan2_mode_class.identity === 'display-block',
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: network_pro_settings['lan2.802.1x.password']
                                        })(
                                            <Input maxLength="15" />
                                        ) }
                                    </FormItem>
                                </div>
                                <div className={ this.state.lan2_mode_class.cert} >
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ formatMessage({id: "LANG1932"}) }>
                                                    <span>{ formatMessage({id: "LANG1931"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                    <Col span={12}>
                                        { getFieldDecorator('ca_cert_file2', {
                                            valuePropName: 'fileList',
                                            normalize: this._normFile
                                        })(
                                            <Upload {...propsCaCrt2} disabled= {CaCrt2 !== ""}>
                                                <Button type="ghost">
                                                    <Icon type="upload" /> { CaCrt2 === "" ? formatMessage({id: "LANG1607"}) : "8021x_ca_cert" }
                                                </Button>
                                            </Upload>
                                        ) }
                                    </Col>
                                    <Col span={6}>
                                        <Button
                                            icon="delete"
                                            type="primary"
                                            size='default'
                                            disabled= {CaCrt2 === ""}
                                            onClick={ this._onRemoveFile.bind(this, CaCrt2) }>
                                            { formatMessage({id: "LANG739"}) }
                                        </Button>
                                    </Col>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ formatMessage({id: "LANG1926"}) }>
                                                    <span>{ formatMessage({id: "LANG1925"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                    <Col span={12}>
                                        { getFieldDecorator('client_cert_file2', {
                                            valuePropName: 'fileList',
                                            normalize: this._normFile
                                        })(
                                            <Upload {...propsClientCrt2} disabled= {ClientCrt2 !== ""}>
                                                <Button type="ghost">
                                                    <Icon type="upload" /> { ClientCrt2 === "" ? formatMessage({id: "LANG1607"}) : "8021x_ca_cert" }
                                                </Button>
                                            </Upload>
                                        ) }
                                    </Col>
                                    <Col span={6}>
                                        <Button
                                            icon="delete"
                                            type="primary"
                                            size='default'
                                            disabled= {ClientCrt2 === ""}
                                            onClick={ this._onRemoveFile.bind(this, ClientCrt2) }>
                                            { formatMessage({id: "LANG739"}) }
                                        </Button>
                                    </Col>
                                    </FormItem>
                                </div>
                            </div>
                        </Row>
                        <Row className={ class8021x.lan2title }>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG267"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className={ class8021x.lantitle }>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG265"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <div className={ class8021x.lan2 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={                            
                                        <Tooltip title={<FormattedHTMLMessage id="LANG1934" />}>
                                            <span>{formatMessage({id: "LANG1933"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('mode', {
                                        rules: [],
                                        initialValue: network_pro_settings.mode
                                    })(
                                        <Select onChange={ this._onChangeMode.bind(this, "mode") }>
                                             <Option value="0">{formatMessage({id: "LANG273"})}</Option>
                                             <Option value="1">{formatMessage({id: "LANG1969"})}</Option>
                                             <Option value="2">{formatMessage({id: "LANG1970"})}</Option>
                                             <Option value="3">{formatMessage({id: "LANG1971"})}</Option>
                                         </Select>
                                    ) }
                                </FormItem>
                                <div className={ this.state.lan1_mode_class.identity }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={                            
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1928" />}>
                                                <span>{formatMessage({id: "LANG1927"})}</span>
                                            </Tooltip>
                                        }>
                                        <Input name="identity" className="hidden"></Input>
                                        { getFieldDecorator('identity', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: class8021x.lan1 && this.state.lan1_mode_class.identity === 'display-block',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    class8021x.lan1 && this.state.lan1_mode_class.identity === 'display-block' ? Validator.keyboradNoSpace(data, value, callback, formatMessage) : callback()
                                                }
                                            }],
                                            initialValue: network_pro_settings.identity
                                        })(
                                            <Input maxLength="15" />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={                            
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1930" />}>
                                                <span>{formatMessage({id: "LANG1929"})}</span>
                                            </Tooltip>
                                        }>
                                        <Input type="password" name="md5_secret" className="hidden"></Input>
                                        { getFieldDecorator('md5_secret', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: class8021x.lan1 && this.state.lan1_mode_class.identity === 'display-block',
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: network_pro_settings.md5_secret
                                        })(
                                            <Input type="password" maxLength="15" />
                                        ) }
                                    </FormItem>
                                </div>
                                <div className={ this.state.lan1_mode_class.cert} >
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ formatMessage({id: "LANG1932"}) }>
                                                    <span>{ formatMessage({id: "LANG1931"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                    <Col span={12}>
                                        { getFieldDecorator('ca_cert_file', {
                                            valuePropName: 'fileList',
                                            normalize: this._normFile
                                        })(
                                            <Upload {...propsCaCrt} disabled= {CaCrt !== ""}>
                                                <Button type="ghost">
                                                    <Icon type="upload" /> { CaCrt === "" ? formatMessage({id: "LANG1607"}) : "8021x_ca_cert2" }
                                                </Button>
                                            </Upload>
                                        ) }
                                    </Col>
                                    <Col span={6}>
                                        <Button
                                            icon="delete"
                                            type="primary"
                                            size='default'
                                            disabled= {CaCrt === ""}
                                            onClick={ this._onRemoveFile.bind(this, CaCrt) }>
                                            { formatMessage({id: "LANG739"}) }
                                        </Button>
                                    </Col>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ formatMessage({id: "LANG1926"}) }>
                                                    <span>{ formatMessage({id: "LANG1925"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                    <Col span={12}>
                                        { getFieldDecorator('client_cert_file', {
                                            valuePropName: 'fileList',
                                            normalize: this._normFile
                                        })(
                                            <Upload {...propsClientCrt} disabled= {ClientCrt !== ""}>
                                                <Button type="ghost">
                                                    <Icon type="upload" /> { ClientCrt === "" ? formatMessage({id: "LANG1607"}) : "8021x_client_cert2" }
                                                </Button>
                                            </Upload>
                                        ) }
                                    </Col>
                                    <Col span={6}>
                                        <Button
                                            icon="delete"
                                            type="primary"
                                            size='default'
                                            disabled= {ClientCrt === ""}
                                            onClick={ this._onRemoveFile.bind(this, ClientCrt) }>
                                            { formatMessage({id: "LANG739"}) }
                                        </Button>
                                    </Col>
                                    </FormItem>
                                </div>
                            </div>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

Network8021x.propTypes = {
}

export default injectIntl(Network8021x)

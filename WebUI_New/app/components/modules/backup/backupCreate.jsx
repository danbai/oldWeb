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
import { FormattedMessage, FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const CheckboxGroup = Checkbox.Group

class BackupCreate extends Component {
    constructor(props) {
        super(props)

        this.state = {
            settings: {},
            filename: '',
            storageList: [],
            plainOptions: [],
            checkedList: [],
            dialList: [
                'config',
                'cdr',
                'voice_record',
                'vfax',
                'voicemail_file',
                'voice_file',
                'storage'
            ],
            dialAll: false
        }
    }
    componentWillMount() {
        this._getInitData()
    }
    componentDidMount() {

    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const plainOptions = [{
            label: formatMessage({id: "LANG4052"}),
            value: 'config'
        }, {
            label: formatMessage({id: "LANG4053"}),
            value: 'cdr'
        }, {
            label: formatMessage({id: "LANG2640"}),
            value: 'voice_record'
        }, {
            label: formatMessage({id: "LANG2988"}),
            value: 'vfax'
        }, {
            label: formatMessage({id: "LANG2379"}),
            value: 'voicemail_file'
        }, {
            label: formatMessage({id: "LANG4054"}),
            value: 'voice_file'
        }, {
            label: formatMessage({id: "LANG4115"}),
            value: 'storage'
        }]

        let storageList = this.state.storageList || []
        let checkedList = this.state.checkedList || []
        let dialAll = this.state.dialAll
        let settings = {}

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getBackupSettings',
                type: "realtime"
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    settings = response.type
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getInterfaceStatus'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    let bSd = response['interface-sdcard']
                    let bUsb = response['interface-usbdisk']
                    let obj = {}
                    if (bSd === 'true') {
                        obj = { 
                            text: formatMessage({id: "LANG262"}),
                            val: "sd"
                        }
                        storageList.push(obj)
                    }
                    if (bUsb === 'true') {
                        obj = { 
                            text: formatMessage({id: "LANG263"}),
                            val: "usb"
                        }
                        storageList.push(obj)
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        checkedList = []
        this.state.dialList.map(function(item) {
            if (settings[item] === 'yes') {
                checkedList.push(item)
            }
        })

        dialAll = checkedList.length === plainOptions.length

        let months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
            today = new Date(),
            year = today.getFullYear(),
            month = (today.getMonth() + 1),
            day = UCMGUI.addZero(today.getDate()),
            hour = UCMGUI.addZero(today.getHours()),
            minute = UCMGUI.addZero(today.getMinutes()),
            seconds = UCMGUI.addZero(today.getSeconds()),
            bkpfile = "backup_" + year + month + day + "_" + hour + minute + seconds

        // this.props.getSpecialState(checkedList)
        this.setState({
            filename: bkpfile,
            settings: settings,
            storageList: storageList,
            checkedList: checkedList,
            dialAll: dialAll,
            plainOptions: plainOptions
        })
    }
    _onChangeAddMethod = (value) => {
        this.setState({
            add_method: value
        })
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    _onChangeDial = (checkedList) => {
        const plainOptions = this.state.plainOptions
        this.setState({
            checkedList: checkedList,
            dialAll: checkedList.length === plainOptions.length
        })
        // this.props.getSpecialState(checkedList)
    }
    _onDialallChange = (e) => {
        let checkedList = []
        const plainOptions = this.state.plainOptions
        plainOptions.map(function(item) {
            checkedList.push(item.value)
        })
        this.setState({
            checkedList: e.target.checked ? checkedList : [],
            dialAll: e.target.checked
        })
        // his.props.getSpecialState(checkedList)
    }

    _handleCancel = (e) => {
        browserHistory.push('/maintenance/backup')
    }

    _backupUCMConfig = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        let loadingMessage = ''
        let successMessage = ''
        let me = this
        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG854" })}}></span>       
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG961" })}}></span>

        let filename = form.getFieldValue('newbkp_name') 

        let data = {
            action: "backupUCMConfig"
        }

        data["file-backup"] = filename + ".tar realtime"
        this.props.setSpinLoading({loading: true, tip: loadingMessage})
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: data,
            type: 'json',
            error: function(e) {
                 message.error(e.statusText)
            },
            success: function(data) {
                let nFileStatus = data.response["file-backup"]
                let mdata = data
                if (nFileStatus === '') {
                    mdata.status = -9
                } else {
                    mdata.status = Number(nFileStatus)
                }
                me.props.setSpinLoading({loading: false})
                const bool = UCMGUI.errorHandler(mdata, null, this.props.intl.formatMessage)

                if (bool) {
                    message.success(successMessage)
                    this._handleCancel()
                }
            }.bind(this)
        })
    }
    _handleSubmit = (e) => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const { form } = this.props
        let me = this
        let errorMessage = ''
        let successMessage = ''

        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                let action = values
                action['config'] = 'no'
                action['cdr'] = 'no'
                action['voice_record'] = 'no'
                action['vfax'] = 'no'
                action['voicemail_file'] = 'no'
                action['voice_file'] = 'no'
                action['storage'] = 'no'
                this.state.checkedList.map(function(item) {
                    action[item] = "yes"
                })

                action["action"] = "updateBackupSettings"
                action["type"] = "realtime"

                let sBackName = action['newbkp_name'] + '.tar'
                let backupDir = action["location"]
                let warnMsg = ''

                if (this.state.checkedList.length === 0) {
                    warnMsg = "LANG852"
                } else if (backupDir === 'local') {
                    if (action['config'] === 'no' || this.state.checkedList.length > 1) {
                        warnMsg = 'LANG4114'
                    }
                } else {
                    if (action["config"] === 'no' && (action["vfax"] === 'yes' || action["voice_file"] === 'yes' || action["storage"] === 'yes')) {
                        warnMsg = 'LANG5267'
                    }
                }

                if (warnMsg !== "") {
                    Modal.warning({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: warnMsg})}} ></span>,
                        okText: (formatMessage({id: "LANG727"}))
                    })
                } else {
                    delete action.newbkp_name
                    // message.loading(loadingMessage, 0)

                    $.ajax({
                        url: api.apiHost,
                        method: "post",
                        data: action,
                        type: 'json',
                        error: function(e) {
                            message.error(e.statusText)
                        },
                        success: function(data) {
                            const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                me._backupUCMConfig()
                            }
                        }.bind(this)
                    })
                }
            }
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const checkedList = this.state.checkedList
        const plainOptions = this.state.plainOptions
        const settings = this.state.settings
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const title = formatMessage({id: "LANG227"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemPromptLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }

        const formItemLayoutTime = {
            labelCol: { span: 3 },
            wrapperCol: { span: 1 }
        }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="content">
                <Title
                    headerTitle={ title }
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                    saveTxt={ formatMessage({id: "LANG62"}) }
                    isDisplay='display-block'
                />
                <Form>
                    <FormItem
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG4055" />}>
                                <span>{formatMessage({id: "LANG4055"})}</span>
                            </Tooltip>
                        )}>
                        <CheckboxGroup options={ plainOptions } value={ checkedList } onChange={ this._onChangeDial } />
                        <Col span={ 2 }>
                            <Checkbox checked={ this.state.dialAll } onChange={ this._onDialallChange } />
                        </Col>
                        <Col span={ 6 }>{formatMessage({id: "LANG104"})}</Col>
                    </FormItem>
                    <FormItem
                        { ...formItemPromptLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG4073" />}>
                                <span>{formatMessage({id: "LANG4073"})}</span>
                            </Tooltip>
                        )}>
                        <Row>
                            <Col span={16} >
                                { getFieldDecorator('location', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: _.indexOf(this.state.storageList, settings.location) > -1 ? settings.location : "local"
                                })(
                                    <Select>
                                        <Option value="local">{ formatMessage({id: "LANG1072"}) }</Option>  
                                        {
                                            this.state.storageList.map(function(item) {
                                                return <Option
                                                        key={ item.text }
                                                        value={ item.val }>
                                                        { item.text }
                                                    </Option>
                                                }
                                            ) 
                                        }
                                    </Select>
                                ) }
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG572" />}>
                                <span>{formatMessage({id: "LANG572"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('newbkp_name', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: this.state.filename
                        })(
                            <Input placeholder={ formatMessage({id: "LANG135"}) } maxLength='32' />
                        ) }
                    </FormItem>
                    <div className="lite-desc">
                        { formatMessage({id: "LANG1417"}) }
                    </div>
                </Form>
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

BackupCreate.propTypes = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(BackupCreate)))

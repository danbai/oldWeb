'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Form, Input, Modal, Button, Row, Col, Checkbox, message, Select, Tabs, Spin, Upload, Icon } from 'antd'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import Validator from "../../api/validator"
import Title from '../../../views/title'
import UCMGUI from "../../api/ucmgui"

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class ImportLdapPhonebook extends Component {
    constructor(props) {
        super(props)
        this.state = {
            importType: 'csv'
        }
        this._handleSave = () => {
            this.props.handleOk()
        }
        this._handleCancel = () => {
            this.props.handleCancel()
        }
    }
    componentDidMount() {
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _onChangeImportType = (value) => {
        this.setState({
            importType: value
        })
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        let me = this

        const props = {
            name: 'file',
            action: baseServerURl + 'action=uploadfile&type=import_' + this.state.importType + '_phonebooks',
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                message.destroy()
                message.loading(formatMessage({ id: "LANG905" }), 0)
                console.log(info.file.status)
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }
                if (me.state.upgradeLoading) {
                    // me.setState({upgradeLoading: false})
                }

                if (info.file.status === 'removed') {
                    message.destroy()
                    // return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response
                    message.destroy()
                    if (data) {
                        let status = data.status,
                            response = data.response

                        if (status === 0) {
                            // import extensions after upload successfully
                            $.ajax({
                                type: "GET",
                                async: false,
                                dataType: "json",
                                url: window.location.protocol + '//' + window.location.host + "/import_phonebook_response.json",
                                error: function (jqXHR, textStatus, errorThrown) {},
                                success: function (data) {
                                    let aErr = {
                                        '-2': 'LANG4365',
                                        '-3': 'LANG3203',
                                        '-4': 'LANG4366',
                                        '-5': 'LANG2152'
                                    }

                                    let nRes = data.result,
                                        sResult = formatMessage({ id: "LANG3917" }, {0: data.success, 1: data.failed}) + ' ',
                                        sErrMsg = ''

                                    if (nRes === -4) {
                                        // let sDn = mwindow.jQuery("#pbxdn", mWindow.document).val().split(',')[0].split('=')[1]
                                        sErrMsg = nRes === 0 ? '' : formatMessage({ id: "LANG4364"}, {0: formatMessage({ id: aErr[nRes] })})
                                    } else {
                                        sErrMsg = nRes === 0 ? '' : formatMessage({ id: "LANG4364"}, {0: formatMessage({ id: aErr[nRes] })})
                                    }

                                    sResult = sResult + sErrMsg

                                    message.success(sResult)
                                }
                            })
                        } else if (status === -1) {
                            message.error(formatMessage({ id: "LANG3204"}))
                        } else {
                            // message.destroy()
                            let msg = formatMessage({ id: "LANG907" })

                            if (parseInt(status) < 0) {
                                msg = formatMessage({ id: this.props.uploadErrObj[Math.abs(parseInt(response.result)).toString()] })
                            } else if (parseInt(data.response.result) === 4) {
                                msg = formatMessage({ id: "LANG915" })
                            } else if (data.response.body) {
                                msg = data.response.body
                            }
                            message.error(msg)
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                }
                me._handleCancel()
                me.props.listPhonebookDn()
            },
            onRemove() {
            }
        }
        return (
            <div className="content">
                <div className="section-title">{ formatMessage({ id: "LANG2735" })}</div>
                <div className="lite-desc">
                    { formatMessage({ id: "LANG3201" }) }
                    { formatMessage({ id: "LANG3918" }) }
                </div>
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={ formatMessage({id: "LANG573"}) }>
                        { getFieldDecorator('lead_type', {
                            rules: [],
                            initialValue: this.state.importType
                        })(
                            <Select onChange={ this._onChangeImportType }>
                                <Option value='csv'>CSV</Option>
                                <Option value='vcf'>VCF</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={ formatMessage({id: "LANG3652"})}>
                        { getFieldDecorator('upload')(
                            <Upload {...props}>
                                <Button type="ghost">
                                    <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                </Button>
                            </Upload>
                        ) }
                    </FormItem>
                    <div className="app-ant-modal-footer">
                        <Button type="primary" onClick= { this._handleCancel }>
                            {formatMessage({id: "LANG726"})}
                        </Button>
                        <Button type="primary" onClick= { this._handleSave }>
                            {formatMessage({id: "LANG728"})}
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
}

ImportLdapPhonebook.defaultProps = {
    uploadErrObj: {
        "1": "LANG890",
        "2": "LANG891",
        "3": "LANG892",
        "4": "LANG893",
        "5": "LANG894",
        "6": "LANG895",
        "7": "LANG896",
        "8": "LANG897",
        "9": "LANG898",
        "10": "LANG899"
    }
}
module.exports = Form.create()(injectIntl(ImportLdapPhonebook))

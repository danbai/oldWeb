'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, message, Tooltip, Select, Transfer } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class SLAStationItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            targetKeys: [],
            accountList: [],
            slaStationItem: {}
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkExistence = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        let editName = this.props.params.name
        let existedSlaStationNameList = this.state.existedSlaStationNameList

        if (editName) {
            existedSlaStationNameList = _.filter(existedSlaStationNameList, (value) => {
                return value !== editName
            })
        }

        if (value && _.indexOf(existedSlaStationNameList, value) !== -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.label.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        let targetKeys = []
        let accountList = []
        let slaStationItem = {}
        let analogtrunkObj = {}
        let slaTrunkNameList = []
        let existedSlaStationNameList = []
        let existedSlaStationNumberList = []

        const { formatMessage } = this.props.intl
        const slaStationId = this.props.params.id
        const disabled = formatMessage({id: "LANG273"})

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: { action: 'getSIPAccountList' },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extension = response.extension || []

                    accountList = extension.map(function(item) {
                        return {
                                key: item.extension,
                                value: item.extension,
                                out_of_service: item.out_of_service,
                                // disabled: (item.out_of_service === 'yes'),
                                label: (item.extension +
                                        (item.fullname ? ' "' + item.fullname + '"' : '') +
                                        (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                            }
                    })

                    accountList = _.sortBy(accountList, function(item) { return item.key })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listAnalogTrunk',
                options: 'trunk_name,trunk_index,out_of_service'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const analogtrunk = response.analogtrunk || []

                    _.map(analogtrunk, (item) => {
                        analogtrunkObj[item.trunk_name] = item.out_of_service
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getSLATrunkNameList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const trunkName = response.trunk_name || []

                    _.map(trunkName, (value) => {
                        slaTrunkNameList.push({
                                key: value,
                                value: value,
                                out_of_service: analogtrunkObj[value],
                                label: (analogtrunkObj[value] === 'yes' ? value + ' <' + disabled + '>' : value)
                            })
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                'sord': 'asc',
                'sidx': 'station',
                'action': 'listSLAStation',
                'options': 'station_name,station'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const slaStation = response.sla_station || []

                    _.map(slaStation, (data) => {
                        if (data.station) {
                            existedSlaStationNumberList.push(data.station)
                        }

                        if (data.station_name) {
                            existedSlaStationNameList.push(data.station_name)
                        }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (slaStationId) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getSLAStation',
                    sla_station: slaStationId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        slaStationItem = res.response.sla_station || {}
                        targetKeys = slaStationItem.trunks.split(',') || []

                        existedSlaStationNameList = _.filter(existedSlaStationNameList, (value) => { return value !== slaStationItem.station_name })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        } else {
            accountList = _.filter(accountList, (data) => {
                return _.indexOf(existedSlaStationNumberList, data.key) === -1
            })
        }

        this.setState({
            targetKeys: targetKeys,
            accountList: accountList,
            slaStationItem: slaStationItem,
            slaTrunkNameList: slaTrunkNameList,
            existedSlaStationNameList: existedSlaStationNameList,
            existedSlaStationNumberList: existedSlaStationNumberList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/extension-trunk/slaStation')
    }
    _handleTransferChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            targetKeys: targetKeys
        })

        console.log('targetKeys: ', targetKeys)
        console.log('direction: ', direction)
        console.log('moveKeys: ', moveKeys)
    }
    _handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        // this.setState({ targetContactKeys: nextTargetKeys })
        console.log('sourceSelectedKeys: ', sourceSelectedKeys)
        console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let loadingMessage = ''
        let successMessage = ''
        let minSlaTrunkMessage = ''
        let maxSlaTrunkMessage = ''
        const { formatMessage } = this.props.intl
        const slaStationId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>

        minSlaTrunkMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG3230"}).toLowerCase()
                })}}></span>

        maxSlaTrunkMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2169"}, {
                    0: '16',
                    1: formatMessage({id: "LANG3230"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                if (!this.state.targetKeys.length) {
                    message.error(minSlaTrunkMessage)

                    return
                } else if (this.state.targetKeys.length > 16) {
                    message.error(maxSlaTrunkMessage)

                    return
                }

                message.loading(loadingMessage, 0)

                let action = values

                if (slaStationId) {
                    action.action = 'updateSLAStation'
                    action.sla_station = slaStationId
                } else {
                    action.action = 'addSLAStation'
                }

                action.trunks = this.state.targetKeys.join()

                $.ajax({
                    type: 'post',
                    data: action,
                    async: false,
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }

                        this._handleCancel()
                    }.bind(this)
                })
            }
        })
    }
    _renderItem = (item) => {
        const customLabel = (
                <span className={ item.out_of_service === 'yes' ? 'out-of-service' : '' }>
                    { item.label }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.value   // for title and filter matching
            }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const slaStationItem = this.state.slaStationItem || {}
        const station_name = slaStationItem.station_name
        const sla_station = slaStationItem.station
        const ringtimeout = slaStationItem.ringtimeout
        const ringdelay = slaStationItem.ringdelay
        const holdaccess = slaStationItem.holdaccess

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 8 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG3227"}, {
                    0: this.props.params.name
                })
                : formatMessage({id: "LANG3226"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG3228"}) }</span>
                            )}
                        >
                            { getFieldDecorator('station_name', {
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
                                }, {
                                    validator: this._checkExistence
                                }],
                                initialValue: station_name
                            })(
                                <Input placeholder={ formatMessage({id: "LANG3228"}) } maxLength="25" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3237" /> }>
                                        <span>{ formatMessage({id: "LANG3229"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('sla_station', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: sla_station
                            })(
                                <Select disabled={ !!this.props.params.id }>
                                    {
                                        this.state.accountList.map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    className={ item.out_of_service === 'yes' }
                                                >
                                                    { item.label }
                                                </Option>
                                            }
                                        ) 
                                    }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemTransferLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG3230"}) }</span>
                            )}
                        >
                            <Transfer
                                showSearch
                                sorter={ true }
                                render={ this._renderItem }
                                targetKeys={ this.state.targetKeys }
                                onChange={ this._handleTransferChange }
                                dataSource={ this.state.slaTrunkNameList }
                                filterOption={ this._filterTransferOption }
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                onSelectChange={ this._handleTransferSelectChange }
                                searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                titles={ [formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})] }
                            />
                        </FormItem>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG3233"}) }</span>
                        </div>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3234" /> }>
                                        <span>{ formatMessage({id: "LANG1598"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('ringtimeout', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 300)
                                    }
                                }],
                                initialValue: ringtimeout
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3236" /> }>
                                        <span>{ formatMessage({id: "LANG3235"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('ringdelay', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 300)
                                    }
                                }],
                                initialValue: ringdelay
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3243" /> }>
                                        <span>{ formatMessage({id: "LANG3222"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('holdaccess', {
                                initialValue: holdaccess ? holdaccess : 'open'
                            })(
                                <Select>
                                    <Option key="open" value="open">{ "Open" }</Option>
                                    <Option key="private" value="private">{ "Private" }</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(SLAStationItem))
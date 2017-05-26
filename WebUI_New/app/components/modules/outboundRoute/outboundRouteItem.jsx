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
import { Alert, Button, Checkbox, Col, Form, Input, message, Modal, Row, Select, Table, Tooltip, TreeSelect } from 'antd'

import FailoverTrunk from './failoverTrunk'
import TimeCondition from './timeCondition'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const AddZero = UCMGUI.addZero
const SHOW_PARENT = TreeSelect.SHOW_PARENT
const officeTimeType = ["LANG133", "LANG3271", "LANG3275", "LANG3266", "LANG3286", "LANG3287", "LANG3288"]

class OutBoundRouteItem extends Component {
    constructor(props) {
        super(props)

        const { formatMessage } = this.props.intl

        this.state = {
            members: [],
            treeData: [],
            trunkList: [],
            pinSetList: [],
            accountList: [],
            pin_sets_id: '',
            holidayList: [],
            timeCondition: [],
            failoverTrunk: [],
            officeTimeList: [],
            outboundNameList: [],
            slaTrunkNameList: [],
            enable_wlist: false,
            outBoundRouteItem: {},
            extensionPrefSettings: [],
            enable_out_limitime: false,
            permissionTooltipTitle: '',
            permissionTooltipVisible: true
        }
    }
    componentWillMount() {
        this._getInitData()
    }
    componentDidMount() {
    }
    _checkCustomNumberLength = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let str = this._customDynamicMember(val)

        if (str.length > 128) {
            callback(formatMessage({id: "LANG4470"}))
        } else {
            callback()
        }
    }
    _checkDynamicRouteRequired = (data, val, callback) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let members = form.getFieldValue('members')
        let custom_member = form.getFieldValue('custom_member')

        if (!members && !custom_member) {
            callback(formatMessage({id: "LANG4264"}, {
                    0: formatMessage({id: "LANG2702"}),
                    1: formatMessage({id: "LANG2703"})
                }))
        } else {
            callback()
        }
    }
    _checkPatternFormat = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let additional = function(value) {
                let res = false,
                    off1 = value.indexOf('['),
                    off2 = value.indexOf(']')

                if (off1 > -1 && off1 < off2) {
                    res = true

                    let str = value
                    let pos = str.indexOf('-')

                    while (pos > -1) {
                        let v1 = str[pos - 1]
                        let v2 = str[pos + 1]

                        if (pos < 2) {
                            res = false

                            break
                        }

                        if (/[^0-9a-zA-Z]/.test(v1) || /[^0-9a-zA-Z]/.test(v2)) {
                            res = false

                            break
                        }

                        if ((/[0-9]/.test(v1) && /[0-9]/.test(v2)) && v1 > v2) {
                            res = false

                            break
                        }

                        if ((/[a-z]/.test(v1) && /[a-z]/.test(v2)) && v1 > v2) {
                            res = false

                            break
                        }

                        if ((/[A-Z]/.test(v1) && /[A-Z]/.test(v2)) && v1 > v2) {
                            res = false

                            break
                        }

                        if ((/[0-9]/.test(v1) && /[^0-9]/.test(v2)) ||
                            (/[^0-9]/.test(v1) && /[0-9]/.test(v2))) {
                            res = false

                            break
                        }

                        if ((/[a-z]/.test(v1) && /[^a-z]/.test(v2)) ||
                            (/[A-Z]/.test(v1) && /[^A-Z]/.test(v2))) {
                            res = false

                            break
                        }

                        str = str.substr(pos + 1)
                        pos = str.indexOf('-')
                    }
                } else if (off1 === -1 && off2 === -1) {
                    res = true
                }

                return res
            }

        let str = val ? val.split(',') : [],
            res = false

        for (let i = 0; i < str.length; i++) {
            let item = $.trim(str[i])

            if (/^_$/.test(item) || /(\[.*?(\.|\!).*?\])|(\[\])/g.test(item)) {
                res = false

                break
            }

            if (/^_/.test(item)) {
                item = item.substr(1)
            }

            if (/^_$/.test(item) || item.length > 32 || /^[!\.]/.test(item)) {
                res = false

                break
            }

            if (!/[^a-zA-Z0-9\#\*\.!\[\]\-\+\/_]/.test(item) && additional(item)) {
                res = true
            } else {
                res = false

                break
            }
        }

        if (val && !res) {
            callback(formatMessage({id: "LANG2139"}))
        } else {
            callback()
        }
    }
    _checkPatternWithCid = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let str = val ? val.split(',') : [],
            res = false

        for (let i = 0; i < str.length; i++) {
            let item = $.trim(str[i])

            if (!/^_/.test(item)) {
                item = '_' + item
            }

            if (/^_[0-9a-zA-Z!\[\]\-\.\?\+\*\#]+[0-9]+$/.test(item)) {
                res = true
            } else if (!/\//.test(item)) {
                res = true
            } else {
                res = false

                break
            }
        }

        if (val && !res) {
            callback(formatMessage({id: "LANG2994"}))
        } else {
            callback()
        }
    }
    _checkOutboundName = (data, val, callback, formatMessage) => {
        let error = false
        let outboundNameList = this.state.outboundNameList
        let currentName = this.props.params.name

        if (currentName) {
            if (val === currentName) {
                error = false
            } else {
                if (_.indexOf(outboundNameList, val) > -1) {
                    error = true
                } else {
                    error = false
                }
            }
        } else {
            if (_.indexOf(outboundNameList, val) > -1) {
                error = true
            } else {
                error = false
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _customDynamicMember = (value) => {
        let i
        let str
        let length
        let results = []
        let customMember = value ? value : ''
        let customMemberList = customMember.split(',')

        for (i = 0, length = customMemberList.length; i < length; i++) {
            str = $.trim(customMemberList[i])

            if (str) {
                if (str[0] !== '_') {
                    str = '_' + str
                }

                results.push(str)
            }
        }

        return results.toString()
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getFieldsIDs = () => {
        let id = []
        let form = this.props.form
        let fieldsValue = form.getFieldsValue()

        _.map(fieldsValue, (value, key) => {
            id.push(key)
        })

        return id
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const outboundRouteId = this.props.params.id
        const outboundRouteName = this.props.params.name

        let pinSetList = []
        let accountList = []
        let extgroupList = []
        let failoverTrunk = []
        let timeCondition = []
        let outboundNameList = []
        let outBoundRouteItem = {}
        let permissionTooltipTitle = ''
        let permissionTooltipVisible = true
        let treeData = [{
            key: 'all',
            value: 'all',
            children: [],
            label: formatMessage({id: "LANG104"})
        }]

        let trunkList = UCMGUI.isExist.getList('getTrunkList', formatMessage)
        let extensionPrefSettings = UCMGUI.isExist.getRange('', formatMessage)
        let slaTrunkNameList = UCMGUI.isExist.getList('getSLATrunkNameList', formatMessage)
        let holidayList = UCMGUI.isExist.getList('listTimeConditionHoliday', formatMessage)
        let officeTimeList = UCMGUI.isExist.getList('listTimeConditionOfficeTime', formatMessage)

        $.ajax({
            async: false,
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listPinSets'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    pinSetList = response.pin_sets_id || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            async: false,
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listOutboundRoute',
                options: 'outbound_rt_name'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const outboundRoutes = response.outbound_route || []

                    _.map(outboundRoutes, (data, index) => {
                        outboundNameList.push(data.outbound_rt_name)
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
                action: 'getAccountList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extension = response.extension || []
                    const disabled = formatMessage({id: "LANG273"})

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
                action: 'getExtensionGroupList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extgroupLabel = formatMessage({id: "LANG2714"})

                    extgroupList = response.extension_groups || []

                    extgroupList.map(function(item) {
                        accountList.push({
                            key: item.group_id,
                            value: item.group_id,
                            label: (extgroupLabel + item.group_name)
                        })
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        treeData[0].children = accountList

        if (outboundRouteId) {
            let action = {}
            let params = ['outbound_rt_name', 'outbound_rt_index', 'default_trunk_index', 'pin_sets_id', 'permission',
                    'password', 'strip', 'prepend', 'pattern', 'members', 'enable_wlist', 'custom_member', 'limitime',
                    'out_of_service', 'failover_outbound_data'
                ]

            action.action = 'getOutboundRoute'
            action.outbound_route = outboundRouteId

            params.map(function(value) {
                action[value] = ''
            })

            $.ajax({
                data: action,
                type: 'post',
                async: false,
                url: api.apiHost,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        let matchs = []
                        let outLimitimeArr = []
                        let response = res.response || {}
                        let pattern = res.response.pattern || []
                        let failover = res.response.failover_outbound_data || []

                        outBoundRouteItem = response.outbound_route || {}

                        outBoundRouteItem.default_trunk_index = outBoundRouteItem.default_trunk_index ? outBoundRouteItem.default_trunk_index : ''
                        outBoundRouteItem.members = outBoundRouteItem.members ? outBoundRouteItem.members.split(',') : []

                        outLimitimeArr = outBoundRouteItem.limitime ? outBoundRouteItem.limitime.match(/\d+/g) : []

                        if (outLimitimeArr.length) {
                            outBoundRouteItem.enable_out_limitime = true
                            outBoundRouteItem.maximumTime = (outLimitimeArr[0] ? (parseInt(outLimitimeArr[0] / 1000) + '') : "")
                            outBoundRouteItem.warningTime = (outLimitimeArr[1] ? (parseInt(outLimitimeArr[1] / 1000) + '') : "")
                            outBoundRouteItem.repeatTime = (outLimitimeArr[2] ? (parseInt(outLimitimeArr[2] / 1000) + '') : "")
                        }

                        _.map(pattern, (data) => {
                            matchs.push(data.match)
                        })

                        _.map(failover, (data, index) => {
                            let obj = _.clone(data)

                            delete obj.outbound_rt_index
                            // let prepend = data.failover_prepend
                            // let trunk = data.failover_trunk_index
                            // let name = this._getTrunkName(trunkList, trunk)

                            failoverTrunk.push(obj)
                        })

                        outBoundRouteItem.match = matchs.join()
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
                    'page': 1,
                    'sidx': 'sequence',
                    'item_num': 1000000,
                    'outbound_route': outboundRouteId,
                    'action': 'listOutboundTimeCondition',
                    'options': 'condition_index,timetype,sequence,start_hour,start_min,end_hour,end_min,mode,week_day,month,day'
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}
                        const tc = _.sortBy((response.time_condition || []), function(data) {
                                return data.sequence
                            })

                        for (let i = 0; i < tc.length; i++) {
                            if (tc[i].timetype) {
                                let obj = tc[i]

                                // obj.index = i
                                obj.end_min = AddZero(obj.end_min)
                                obj.end_hour = AddZero(obj.end_hour)
                                obj.start_min = AddZero(obj.start_min)
                                obj.start_hour = AddZero(obj.start_hour)

                                if (obj.start_hour === "" && obj.start_min === "" &&
                                    obj.end_hour === "" && obj.end_min === "") {
                                    obj.time = "00:00-23:59"
                                } else {
                                    obj.time = obj.start_hour + ':' + obj.start_min + '-' +
                                        obj.end_hour + ':' + obj.end_min
                                }

                                timeCondition.push(obj)
                            }
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })

            if (outBoundRouteItem.permission === 'none') {
                permissionTooltipVisible = true
                permissionTooltipTitle = formatMessage({id: "LANG3700"})
            } else if (outBoundRouteItem.permission === 'internal') {
                permissionTooltipVisible = true
                permissionTooltipTitle = formatMessage({id: "LANG2535"}, {
                        0: formatMessage({id: "LANG1071"})
                    })
            } else {
                permissionTooltipTitle = ''
                permissionTooltipVisible = false
            }
        } else {
            permissionTooltipVisible = true
            permissionTooltipTitle = formatMessage({id: "LANG3700"})
        }

        this.setState({
            treeData: treeData,
            trunkList: trunkList,
            pinSetList: pinSetList,
            holidayList: holidayList,
            accountList: accountList,
            extgroupList: extgroupList,
            failoverTrunk: failoverTrunk,
            timeCondition: timeCondition,
            officeTimeList: officeTimeList,
            outboundNameList: outboundNameList,
            slaTrunkNameList: slaTrunkNameList,
            outBoundRouteItem: outBoundRouteItem,
            extensionPrefSettings: extensionPrefSettings,
            permissionTooltipTitle: permissionTooltipTitle,
            permissionTooltipVisible: permissionTooltipVisible,
            enable_wlist: outBoundRouteItem.enable_wlist === 'yes',
            members: outBoundRouteItem.members ? outBoundRouteItem.members : [],
            pin_sets_id: outBoundRouteItem.pin_sets_id ? outBoundRouteItem.pin_sets_id : '',
            enable_out_limitime: outBoundRouteItem.enable_out_limitime ? outBoundRouteItem.enable_out_limitime : false
        })
    }
    _getTrunkName = (datasource, trunkIndex) => {
        let trunkName
        const { formatMessage } = this.props.intl

        _.map(datasource, function(data, index) {
            if (data.trunk_index === trunkIndex) {
                if (data.technology === 'Analog') {
                    trunkName = <span
                                    className={ data.out_of_service === 'yes' ? 'out-of-service' : '' }
                                >
                                    {
                                        formatMessage({id: 'LANG105'}) + ' ' + formatMessage({id: 'LANG83'}) + ' -- ' + data.trunk_name +
                                        (data.out_of_service === 'yes' ? ' -- ' + formatMessage({id: 'LANG273'}) : '')
                                    }
                                </span>
                } else {
                    trunkName = <span
                                    className={ data.out_of_service === 'yes' ? 'out-of-service' : '' }
                                >
                                    {
                                        data.technology + ' ' + formatMessage({id: 'LANG83'}) + ' -- ' + data.trunk_name +
                                        (data.out_of_service === 'yes' ? ' -- ' + formatMessage({id: 'LANG273'}) : '')
                                    }
                                </span>
                }
            }
        })

        return trunkName
    }
    _handleCancel = () => {
        browserHistory.push('/extension-trunk/outboundRoute')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const form = this.props.form
        const { formatMessage } = this.props.intl

        const getFieldInstance = form.getFieldInstance
        const outboundRouteIndex = this.props.params.id

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        let validateFields = this._getFieldsIDs()

        validateFields = _.without(validateFields, 'failover_trunk_index', 'failover_strip', 'failover_prepend', 'tc_timetype', 'tc_start_time', 'tc_end_time', 'tc_not_holiday', 'tc_mode')

        form.validateFields(validateFields, { force: true }, (err, values) => {
            if (!err) {
                let permissionDisabled = !!this.state.pin_sets_id || this.state.enable_wlist

                let doSubmit = () => {
                        let action = {}
                        let pattern = '['
                        let match = values.match.split(',') || []

                        match = _.filter(match, function(value) {
                            return value
                        })

                        if (outboundRouteIndex) {
                            action.action = 'updateOutboundRoute'
                            action.outbound_route = outboundRouteIndex
                        } else {
                            action.action = 'addOutboundRoute'
                        }

                        _.map(values, function(value, key) {
                            let fieldInstance = getFieldInstance(key)

                            if (key === 'enable_out_limitime' || key === 'office' || key === 'match' ||
                                key === 'maximumTime' || key === 'repeatTime' || key === 'warningTime' ||
                                key === 'failover_prepend' || key === 'failover_strip' || key === 'failover_trunk_index') {
                                return false
                            }

                            if (key.indexOf('tc_') === 0) {
                                return false
                            }

                            action[key] = (value !== undefined ? UCMGUI.transCheckboxVal(value) : '')
                        })

                        _.map(match, function(value, index) {
                            if (!value) {
                                return
                            }

                            value = $.trim(value)
                            value = (value[0] !== '_') ? '_' + value : value

                            if (index < match.length - 1) {
                                pattern += '{"match": "' + value + '"}, '
                            } else {
                                pattern += '{"match": "' + value + '"}]'
                            }
                        })

                        if (values.enable_out_limitime) {
                            let maximumTime = values.maximumTime
                            let warningTime = values.warningTime
                            let repeatTime = values.repeatTime

                            maximumTime = maximumTime ? (parseInt(maximumTime) * 1000) : ''
                            warningTime = warningTime ? (parseInt(warningTime) * 1000) : ''
                            repeatTime = repeatTime ? (parseInt(repeatTime) * 1000) : ''

                            action.limitime = 'L(' + maximumTime + ':' + warningTime + ':' + repeatTime + ')'
                        } else {
                            action.limitime = ''
                        }

                        let time_condition = values.time_condition,
                            tcLength = time_condition.length

                        for (let i = 0; i < tcLength; i++) {
                            delete time_condition[i]['time']
                            delete time_condition[i]['condition_index']

                            time_condition[i]['sequence'] = i + 1
                            // time_condition[i]['condition_index'] = i + 1
                        }

                        let failoverTrunk = values.failover_outbound_data,
                            ftLength = failoverTrunk.length

                        for (let i = 0; i < ftLength; i++) {
                            failoverTrunk[i]['failover_trunk_sequence'] = i + 1
                        }

                        action.time_condition = JSON.stringify(time_condition)
                        action.failover_outbound_data = JSON.stringify(failoverTrunk)

                        action.pattern = pattern
                        action.custom_member = this._customDynamicMember(action.custom_member)
                        action.pin_sets_id = action.pin_sets_id === 'none' ? '' : action.pin_sets_id

                        if (!!this.state.pin_sets_id || this.state.enable_wlist) {
                            action.permission = 'none'
                        }

                        // console.log('Received values of form: ', action)
                        // console.log('Received values of form: ', values)

                        message.loading(formatMessage({ id: "LANG826" }), 0)

                        $.ajax({
                            data: action,
                            type: 'json',
                            method: "post",
                            url: api.apiHost,
                            error: function(e) {
                                message.error(e.statusText)
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                if (bool) {
                                    message.destroy()
                                    message.success(successMessage, 2)

                                    this._handleCancel()
                                }
                            }.bind(this)
                        })
                    }

                if (values.permission === 'internal' && !permissionDisabled) {
                    confirm({
                        onCancel() {},
                        onOk() { doSubmit() },
                        content: <span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG2534" }, {
                                                0: formatMessage({ id: "LANG1071" }),
                                                1: formatMessage({ id: "LANG1071" })
                                            })
                                        }}
                                    ></span>
                    })
                } else if (values.permission === 'none' && !permissionDisabled) {
                    confirm({
                        onCancel() {},
                        onOk() { doSubmit() },
                        content: <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG3701" }) }}></span>
                    })
                } else {
                    doSubmit()
                }
            }
        })
    }
    _onChangeLimitime = (e) => {
        this.setState({
            enable_out_limitime: e.target.checked
        })
    }
    _onChangePermission = (value) => {
        let title
        let visible
        const { formatMessage } = this.props.intl

        if (value === 'none') {
            visible = true
            title = formatMessage({id: "LANG3700"})
        } else if (value === 'internal') {
            visible = true
            title = formatMessage({id: "LANG2535"}, {
                    0: formatMessage({id: "LANG1071"})
                })
        } else {
            title = ''
            visible = false
        }

        this.setState({
            permissionTooltipTitle: title,
            permissionTooltipVisible: visible
        })
    }
    _onChangePinSet = (value) => {
        this.setState({
            pin_sets_id: value === 'none' ? '' : value
        })
    }
    _onChangeTreeSelect = (value) => {
        const { form } = this.props

        let members = []

        if (_.indexOf(value, 'all') !== -1) {
            _.map(this.state.accountList, (data) => {
                members.push(data.value)
            })
        } else {
            members = value
        }

        this.setState({
            members: members
        })

        form.setFieldsValue({
            members: members.join()
        })

        form.validateFields(['custom_member'], { force: true })
    }
    _onChangeWlist = (e) => {
        this.setState({
            enable_wlist: e.target.checked
        })
    }
    _renderTrunkOptions = (isFailoverTrunk) => {
        const { formatMessage } = this.props.intl

        let trunkList = this.state.trunkList
        let slaTrunkNameList = this.state.slaTrunkNameList

        if (isFailoverTrunk) {
            trunkList = _.filter(trunkList, (data, index) => {
                return slaTrunkNameList.indexOf(data.trunk_name) === -1
            })
        }

        return <Select>
                {
                    // Pengcheng Zou Moved. Set Trunk Options First.
                    _.map(trunkList, (data, index) => {
                        let text
                        let option
                        let hasClass
                        let name = data.trunk_name
                        let technology = data.technology
                        let value = data.trunk_index + ''
                        let isSLA = slaTrunkNameList.indexOf(name) > -1
                        let disabled = (data.out_of_service && data.out_of_service === 'yes')

                        // Pengcheng Zou Added. locale="{0}{1}{2}{3}" or locale="{0}{1}{2}{3}{4}{5}"
                        // locale = (disabled || isSLA) ? 'LANG564' : 'LANG2696';

                        if (technology === 'Analog') {
                            text = formatMessage({id: "LANG105"})
                        } else if (technology === 'SIP') {
                            text = formatMessage({id: "LANG108"})
                        } else if (technology === 'IAX') {
                            text = formatMessage({id: "LANG107"})
                        } else if (technology === 'BRI') {
                            text = formatMessage({id: "LANG2835"})
                        } else if (technology === 'PRI' || technology === 'SS7' || technology === 'MFC/R2' || technology === 'EM' || technology === 'EM_W') {
                            text = technology
                        }

                        text += formatMessage({id: "LANG83"}) + ' -- ' + name

                        if (disabled) {
                            text += ' -- ' + formatMessage({id: "LANG273"})
                        } else if (isSLA) {
                            text += ' -- ' + formatMessage({id: "LANG3218"})
                        }

                        hasClass = (disabled || isSLA) ? 'out-of-service' : ''

                        return <Option
                                    key={ value }
                                    value={ value }
                                    className={ hasClass }
                                    technology={ technology }
                                >
                                    { text }
                                </Option>
                    })
                }
            </Select>
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const settings = this.state.outBoundRouteItem || {}
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const formItemRowLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemLayoutSpecial = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const treeSelectProps = {
            multiple: true,
            treeCheckable: true,
            value: this.state.members,
            treeDefaultExpandAll: true,
            treeData: this.state.treeData,
            showCheckedStrategy: SHOW_PARENT,
            onChange: this._onChangeTreeSelect,
            disabled: !!this.state.pin_sets_id
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG657"}, {
                    0: this.props.params.name
                })
                : formatMessage({id: "LANG768"}))

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
                        <Row>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1534" /> }>
                                                <span>{ formatMessage({id: "LANG1533"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('outbound_rt_name', {
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
                                                Validator.maxlength(data, value, callback, formatMessage, 25)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                this._checkOutboundName(data, value, callback, formatMessage)
                                            }
                                        }],
                                        initialValue: settings.outbound_rt_name
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1560" /> }>
                                                <span>{ formatMessage({id: "LANG246"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('match', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.match
                                    })(
                                        <Input placeholder={ formatMessage({id: "LANG5448"}) } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5092" /> }>
                                                <span>{ formatMessage({id: "LANG5093"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('out_of_service', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.out_of_service ? (settings.out_of_service === 'yes') : false
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4558" /> }>
                                                <span>{ formatMessage({id: "LANG4553"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('pin_sets_id', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        initialValue: this.state.pin_sets_id ? this.state.pin_sets_id : 'none'
                                    })(
                                        <Select
                                            onChange={ this._onChangePinSet }
                                        >
                                            <Option value='none'>{ formatMessage({id: "LANG133"}) }</Option>
                                            {
                                                this.state.pinSetList.map(function(item) {
                                                    return <Option
                                                                key={ item.pin_sets_id }
                                                                value={ item.pin_sets_id }
                                                            >
                                                                { item.pin_sets_name }
                                                            </Option>
                                                })
                                            }
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1540" /> }>
                                                <span>{ formatMessage({id: "LANG73"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('password', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                this.state.pin_sets_id ? callback() : Validator.digits(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.pin_sets_id ? callback() : Validator.minlength(data, value, callback, formatMessage, 4)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.pin_sets_id ? callback() : Validator.maxlength(data, value, callback, formatMessage, 10)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.pin_sets_id ? callback() : Validator.checkNumericPw(data, value, callback, formatMessage)
                                            }
                                        }],
                                        initialValue: settings.password
                                    })(
                                        <Input disabled={ !!this.state.pin_sets_id } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1544" /> }>
                                                <span>{ formatMessage({id: "LANG1543"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    {/* <Tooltip
                                        placement="bottom"
                                        trigger={ ['hover'] }
                                        overlayClassName="numeric-input"
                                        title={ this.state.permissionTooltipTitle }
                                        visible={ !this.state.pin_sets_id && !this.state.enable_wlist && this.state.permissionTooltipVisible }
                                    ></Tooltip> */}
                                    { getFieldDecorator('permission', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        initialValue: settings.permission ? settings.permission : 'none'
                                    })(
                                        <Select
                                            onChange={ this._onChangePermission }
                                            disabled={ !!this.state.pin_sets_id || this.state.enable_wlist }
                                        >
                                            <Option value='none'>{ formatMessage({id: "LANG273"}) }</Option>
                                            <Option value='internal'>{ formatMessage({id: "LANG1071"}) }</Option>
                                            <Option value='local'>{ formatMessage({id: "LANG1072"}) }</Option>
                                            <Option value='national'>{ formatMessage({id: "LANG1073"}) }</Option>
                                            <Option value='international'>{ formatMessage({id: "LANG1074"}) }</Option>
                                        </Select>
                                    ) }
                                    <Alert
                                        type="error"
                                        message={ this.state.permissionTooltipTitle }
                                        style={{ 'position': 'absolute', 'marginTop': '10px' }}
                                        className={ (!this.state.pin_sets_id && !this.state.enable_wlist && this.state.permissionTooltipVisible) ? 'display-block' : 'hidden' }
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG2699"}) }</span>
                            </div>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2700" /> }>
                                                <span>{ formatMessage({id: "LANG2699"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('enable_wlist', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: this.state.enable_wlist
                                    })(
                                        <Checkbox
                                            onChange={ this._onChangeWlist }
                                            disabled={ !!this.state.pin_sets_id }
                                        />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    className={ this.state.enable_wlist ? 'display-block' : 'hidden' }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4472" /> }>
                                                <span>{ formatMessage({id: "LANG2703"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('custom_member', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: !this.state.pin_sets_id && this.state.enable_wlist ? this._checkDynamicRouteRequired : ''
                                        }, {
                                            validator: !this.state.pin_sets_id && this.state.enable_wlist ? this._checkCustomNumberLength : ''
                                        }, {
                                            validator: !this.state.pin_sets_id && this.state.enable_wlist ? this._checkPatternFormat : ''
                                        }, {
                                            validator: !this.state.pin_sets_id && this.state.enable_wlist ? this._checkPatternWithCid : ''
                                        }, {
                                            validator: (data, value, callback) => {
                                                !this.state.pin_sets_id && this.state.enable_wlist ? Validator.differentPatterns(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                        initialValue: settings.custom_member
                                    })(
                                        <Input max={ 128 } disabled={ !!this.state.pin_sets_id } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    className={ this.state.enable_wlist ? 'display-block' : 'hidden' }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2701" /> }>
                                                <span>{ formatMessage({id: "LANG2701"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('members', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            // validator: !this.state.pin_sets_id && this.state.enable_wlist ? this._checkDynamicRouteRequired : ''
                                        }],
                                        initialValue: settings.members ? settings.members.join() : ''
                                    })(
                                        <Input type="hidden" />
                                    ) }
                                    <TreeSelect { ...treeSelectProps } />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG3025"}) }</span>
                            </div>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3026" /> }>
                                                <span>{ formatMessage({id: "LANG3025"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('enable_out_limitime', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: this.state.enable_out_limitime
                                    })(
                                        <Checkbox onChange={ this._onChangeLimitime } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.enable_out_limitime ? 'display-block' : 'hidden' }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3018" /> }>
                                                <span>{ formatMessage({id: "LANG3017"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('maximumTime', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            message: formatMessage({id: "LANG2150"}),
                                            required: this.state.enable_out_limitime ? true : false
                                        }],
                                        initialValue: settings.maximumTime
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.enable_out_limitime ? 'display-block' : 'hidden' }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3020" /> }>
                                                <span>{ formatMessage({id: "LANG3019"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('warningTime', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        initialValue: settings.warningTime
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.enable_out_limitime ? 'display-block' : 'hidden' }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3022" /> }>
                                                <span>{ formatMessage({id: "LANG3021"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('repeatTime', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        initialValue: settings.repeatTime
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG1553"}) }</span>
                            </div>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemRowLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1552" /> }>
                                                <span>{ formatMessage({id: "LANG1551"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('default_trunk_index', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.default_trunk_index ? settings.default_trunk_index + '' : ''
                                    })(
                                        this._renderTrunkOptions()
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemRowLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1548" /> }>
                                                <span>{ formatMessage({id: "LANG245"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('strip', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                Validator.digits(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.maxlength(data, value, callback, formatMessage, 2)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                let pattern = form.getFieldValue('match')
                                                let prepend = form.getFieldValue('prepend')

                                                Validator.stripMax(data, value, callback, formatMessage, formatMessage({id: "LANG5634"}).toLowerCase(), pattern, prepend)
                                            }
                                        }],
                                        initialValue: settings.strip
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemRowLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1542" /> }>
                                                <span>{ formatMessage({id: "LANG1541"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('prepend', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.maxlength(data, value, callback, formatMessage, 20)
                                            }
                                        }],
                                        initialValue: settings.prepend
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <div className="section-title">
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1550" /> }>
                                    <span>{ formatMessage({id: "LANG1549"}) }</span>
                                </Tooltip>
                            </div>
                        </Row>
                        <Row className="row-section-content">
                            <FailoverTrunk
                                form={ this.props.form }
                                trunkList={ this.state.trunkList }
                                failoverTrunk={ this.state.failoverTrunk }
                                renderTrunkOptions={ this._renderTrunkOptions }
                            />
                        </Row>
                        <Row>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG1557"}) }</span>
                            </div>
                        </Row>
                        <Row className="row-section-content">
                            <TimeCondition
                                form={ this.props.form }
                                timeCondition={ this.state.timeCondition }
                            />
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(OutBoundRouteItem))

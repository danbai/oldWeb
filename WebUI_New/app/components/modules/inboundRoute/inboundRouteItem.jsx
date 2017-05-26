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
import { Button, Checkbox, Col, Form, Input, message, Modal, Row, Select, Tabs, Table, Tooltip, TreeSelect } from 'antd'

import TimeCondition from './timeCondition'

const FormItem = Form.Item
const TabPane = Tabs.TabPane
const Option = Select.Option
const confirm = Modal.confirm
const AddZero = UCMGUI.addZero
const SHOW_PARENT = TreeSelect.SHOW_PARENT

class InboundRouteItem extends Component {
    constructor(props) {
        super(props)

        let currentInAddMode = this.props.route.path.indexOf('add') === 0

        this.state = {
            currentTrunkType: '',
            currentTrunkIndex: '',
            timeCondition: [],
            DIDDesTreeData: [],
            diddes_members: [],
            activeKey: 'default',
            seamlessTreeData: [],
            seamless_members: [],
            inboundRouteItem: {},
            destinationType: '',
            destinationValue: '',
            mode1DestinationType: '',
            mode1DestinationValue: '',
            mode1DestinationData: {},
            alertinfo: 'none',
            custom_alert_info: '',
            dial_trunk: false,
            enableMultiMode: false,
            destinationHasDID: false,
            prepend_trunk_name: false,
            prepend_inbound_name_enable: false,
            currentInAddMode: currentInAddMode,
            DIDParams: ['ext_fax', 'ext_local', 'ext_group', 'ext_queues', 'ext_paging', 'voicemenus', 'ext_conference', 'voicemailgroups', 'ext_directory'],
            destinationDataSource: {
                'byDID': [],
                'account': [],
                'voicemail': [],
                'conference': [],
                'queue': [],
                'ringgroup': [],
                'paginggroup': [],
                'vmgroup': [],
                'fax': [],
                'disa': [],
                'ivr': [],
                'directory': [],
                'external_number': [],
                'callback': []
            }
        }
    }
    componentWillMount() {
        this._getInitData()
    }
    componentDidMount() {
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.groupNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkDestinationHasDID = (value) => {
        const { form } = this.props

        let obj = {}
        let destination_type = form.getFieldValue('destination_type')
        let mode1_destination_type = form.getFieldValue('mode1_destination_type')
        let mode_1_time_condition = form.getFieldValue('mode_1_time_condition')
        let mode_default_time_condition = form.getFieldValue('mode_default_time_condition')

        // if (value === 'byDID') {
        //     obj.destinationHasDID = true
        // } else {
        //     obj.destinationHasDID = false
        // }

        obj.destinationHasDID = false

        if (destination_type === 'byDID' || mode1_destination_type === 'byDID') {
            obj.destinationHasDID = true
        }

        if (mode_default_time_condition && mode_default_time_condition.length) {
            _.map(mode_default_time_condition, (data, index) => {
                if (data.destination_type === 'byDID') {
                    obj.destinationHasDID = true
                }
            })
        }

        if (mode_1_time_condition && mode_1_time_condition.length) {
            _.map(mode_1_time_condition, (data, index) => {
                if (data.destination_type === 'byDID') {
                    obj.destinationHasDID = true
                }
            })
        }

        this.setState(obj)
    }
    _getFieldsIDs = () => {
        let id = []
        let form = this.props.form
        let fieldsValue = form.getFieldsValue()

        _.map(fieldsValue, (value, key) => {
            if (key.indexOf('mode_') === -1 || key === 'mode_default_time_condition' || key === 'mode_1_time_condition') {
                id.push(key)
            }
        })

        return id
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl

        let dial_trunk = false
        let destinationHasDID = false
        let prepend_trunk_name = false
        let prepend_inbound_name_enable = false
        let alertinfo = 'none'
        let custom_alert_info = ''
        let diddes_members = []
        let seamless_members = []
        let inboundRouteItem = {}
        let currentTrunkType = ''
        let currentTrunkIndex = ''
        let disabled = formatMessage({id: "LANG273"})

        let getList = [
                { 'getIVRList': '' },
                { 'getQueueList': '' },
                { 'getVMGroupList': '' },
                { 'getAccountList': '' },
                { 'getVoicemailList': '' },
                { 'getRingGroupList': '' },
                { 'getConferenceList': '' },
                { 'getPaginggroupList': '' },
                { 'getFaxList': '' },
                { 'getDISAList': '' },
                { 'getDirectoryList': '' },
                { 'getCallbackList': '' },
                { 'getTrunkList': '' },
                { 'getExtenPrefSettings': '' },
                { 'getSLATrunkNameList': '' }
            ]

        let DIDDesTreeData = [{
            key: 'all',
            value: 'all',
            children: [],
            label: formatMessage({id: "LANG104"})
        }]

        let seamlessTreeData = [{
            key: 'all',
            value: 'all',
            children: [],
            label: formatMessage({id: "LANG104"})
        }]

        DIDDesTreeData[0].children = [{
                key: 'ext_local',
                value: 'ext_local',
                label: formatMessage({id: "LANG85"})
            }, {
                key: 'ext_conference',
                value: 'ext_conference',
                label: formatMessage({id: "LANG18"})
            }, {
                key: 'ext_queues',
                value: 'ext_queues',
                label: formatMessage({id: "LANG607"})
            }, {
                key: 'ext_group',
                value: 'ext_group',
                label: formatMessage({id: "LANG600"})
            }, {
                key: 'ext_paging',
                value: 'ext_paging',
                label: formatMessage({id: "LANG604"})
            }, {
                key: 'voicemenus',
                value: 'voicemenus',
                label: formatMessage({id: "LANG19"})
            }, {
                key: 'voicemailgroups',
                value: 'voicemailgroups',
                label: formatMessage({id: "LANG21"})
            }, {
                key: 'ext_fax',
                value: 'ext_fax',
                label: formatMessage({id: "LANG1268"})
            }, {
                key: 'ext_directory',
                value: 'ext_directory',
                label: formatMessage({id: "LANG2884"})
            }]

        if (!this.state.currentInAddMode) {
            let action = {}
            let enableMultiMode = false
            let holidayList = UCMGUI.isExist.getList('listTimeConditionHoliday', formatMessage)
            let officeTimeList = UCMGUI.isExist.getList('listTimeConditionOfficeTime', formatMessage)
            let params = ["trunk_index", "did_pattern_match", "did_pattern_allow", "en_multi_mode",
                        "destination_type", "prepend_trunk_name", "prepend_inbound_name_enable",
                        "prepend_inbound_name", "account", "voicemail", "conference",
                        "vmgroup", "ivr", "ringgroup", "queue", "paginggroup", "fax", "disa", "directory",
                        "external_number", "callback", "did_strip", "permission", "dial_trunk", "ext_local",
                        "ext_fax", "voicemailgroups", "voicemenus", "ext_conference", "ext_queues", "ext_group",
                        "ext_paging", "ext_directory", "alertinfo", "incoming_prepend", "out_of_service", 'seamless_transfer_did_whitelist'
                    ]

            action.action = 'getInboundRoute'
            action.inbound_route = this.props.params.routeId

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
                        const response = res.response || {}

                        inboundRouteItem = response.inbound_routes || {}

                        let destinationValue
                        let destinationType = inboundRouteItem.destination_type ? inboundRouteItem.destination_type : ''
                        let inboundDIDDestination = response.inbound_did_destination || {}

                        if (destinationType && (destinationType !== 'byDID' || destinationType !== 'external_number')) {
                            destinationValue = inboundRouteItem[destinationType] + ''
                        } else {
                            destinationValue = ''
                        }

                        if (destinationType === 'byDID') {
                            destinationHasDID = true
                        }

                        _.map(inboundDIDDestination, function(value, key) {
                            inboundRouteItem[key] = value
                        })

                        seamless_members = inboundRouteItem.seamless_transfer_did_whitelist
                        seamless_members = seamless_members ? seamless_members.split(',') : []

                        _.map(this.state.DIDParams, (value) => {
                            if (inboundRouteItem[value] === 'yes') {
                                diddes_members.push(value)
                            }
                        })

                        alertinfo = inboundRouteItem.alertinfo

                        if (alertinfo && alertinfo.indexOf('custom') > -1) {
                            custom_alert_info = alertinfo.slice(7)
                            alertinfo = 'custom'
                        } else {
                            alertinfo = alertinfo ? alertinfo : 'none'
                        }

                        currentTrunkIndex = inboundRouteItem.trunk_index + ''
                        dial_trunk = inboundRouteItem.dial_trunk === 'yes'
                        enableMultiMode = inboundRouteItem.en_multi_mode === 'yes'
                        prepend_trunk_name = inboundRouteItem.prepend_trunk_name === 'yes'
                        prepend_inbound_name_enable = inboundRouteItem.prepend_inbound_name_enable === 'yes'

                        this.setState({
                            alertinfo: alertinfo,
                            dial_trunk: dial_trunk,
                            holidayList: holidayList,
                            officeTimeList: officeTimeList,
                            diddes_members: diddes_members,
                            enableMultiMode: enableMultiMode,
                            seamless_members: seamless_members,
                            inboundRouteItem: inboundRouteItem,
                            destinationType: destinationType,
                            destinationValue: destinationValue,
                            custom_alert_info: custom_alert_info,
                            currentTrunkIndex: currentTrunkIndex,
                            prepend_trunk_name: prepend_trunk_name,
                            prepend_inbound_name_enable: prepend_inbound_name_enable
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
                    'page': 1,
                    'sidx': 'sequence',
                    'item_num': 1000000,
                    'action': 'listInboundTimeCondition',
                    'inbound_route': this.props.params.routeId,
                    'options': 'condition_index,inbound_mode,timetype,sequence,start_hour,start_min,end_hour,end_min,mode,week_day,month,day,destination_type,account,voicemail,conference,vmgroup,ivr,ringgroup,queue,paginggroup,fax,disa,did_strip,directory,external_number,callback,timecondition_prepend'
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        let timeCondition = []
                        let tc = _.sortBy((response.time_condition || []), function(data) {
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

                                if (obj.destination_type === 'byDID') {
                                    destinationHasDID = true
                                }

                                timeCondition.push(obj)
                            }
                        }

                        this.setState({
                            timeCondition: timeCondition
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
                    'action': 'listInboundRouteExtra',
                    'inbound_route': this.props.params.routeId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        let mode1DestinationType = ''
                        let mode1DestinationValue = ''
                        let mode1DestinationData = {}
                        let inbound_route_extra = response.inbound_route_extra || []

                        if (inbound_route_extra.length) {
                            mode1DestinationData = inbound_route_extra[0]
                            mode1DestinationType = mode1DestinationData.destination_type ? mode1DestinationData.destination_type : ''

                            if (mode1DestinationType && (mode1DestinationType !== 'byDID' || mode1DestinationType !== 'external_number')) {
                                mode1DestinationValue = mode1DestinationData[mode1DestinationType] + ''
                            } else {
                                mode1DestinationValue = ''
                            }
                        }

                        if (mode1DestinationType === 'byDID') {
                            destinationHasDID = true
                        }

                        this.setState({
                            mode1DestinationType: mode1DestinationType,
                            mode1DestinationValue: mode1DestinationValue,
                            mode1DestinationData: mode1DestinationData
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        } else {
            currentTrunkIndex = this.props.params.trunkId

            this.setState({
                currentTrunkIndex: currentTrunkIndex
            })
        }

        $.ajax({
            type: 'GET',
            // async: false,
            url: api.apiHost + 'action=combineAction&data=' + JSON.stringify(getList),
            success: function(res) {
                let bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    let response = res.response || {}

                    let extensionPreference = []
                    let trunkList = response.getTrunkList.trunks || []
                    let slaTrunkNameList = response.getSLATrunkNameList.trunk_name || []
                    let ivrList = response.getIVRList.ivr || []
                    let conferenceList = response.getConferenceList.extension || []
                    let paginggroupList = response.getPagingGroupList.paginggroups || []
                    let faxList = response.getFaxList.fax || []
                    let disaList = response.getDISAList.disa || []
                    let directoryList = response.getDirectoryList.directorys || []
                    let callbackList = response.getCallbackList.callback || []
                    let queueList = response.getQueueList.queues || []
                    let vmgroupList = response.getVMGroupList.vmgroups || []
                    let accountList = response.getAccountList.extension || []
                    let voicemailList = response.getVoicemailList.extension || []
                    let ringgroupList = response.getRingGroupList.ringgroups || []
                    let extensionPrefSettings = response.getExtenPrefSettings.extension_pref_settings || {}

                    ivrList = ivrList.map(function(item) {
                            return {
                                    key: item.ivr_id,
                                    value: item.ivr_id,
                                    label: item.ivr_name
                                }
                        })

                    queueList = queueList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.queue_name
                            }
                        })

                    vmgroupList = vmgroupList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.vmgroup_name
                            }
                        })

                    accountList = accountList.map(function(item) {
                            return {
                                    key: item.extension,
                                    value: item.extension,
                                    fullname: item.fullname,
                                    out_of_service: item.out_of_service,
                                    label: (item.extension +
                                            (item.fullname ? ' "' + item.fullname + '"' : '') +
                                            (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                                }
                        })

                    voicemailList = voicemailList.map(function(item) {
                            return {
                                    key: item.extension,
                                    value: item.extension,
                                    fullname: item.fullname,
                                    out_of_service: item.out_of_service,
                                    label: (item.extension +
                                            (item.fullname ? ' "' + item.fullname + '"' : '') +
                                            (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                                }
                        })

                    ringgroupList = ringgroupList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.ringgroup_name
                            }
                        })

                    conferenceList = conferenceList.map(function(value) {
                            return {
                                key: value,
                                value: value,
                                label: value
                            }
                        })

                    paginggroupList = paginggroupList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.paginggroup_name
                            }
                        })

                    faxList = faxList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.fax_name
                            }
                        })

                    disaList = disaList.map(function(item) {
                            let extension = item.disa_id + ''

                            return {
                                key: extension,
                                value: extension,
                                label: item.display_name
                            }
                        })

                    directoryList = directoryList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.name
                            }
                        })

                    callbackList = callbackList.map(function(item) {
                            let extension = item.callback_id + ''

                            return {
                                key: extension,
                                value: extension,
                                label: item.name
                            }
                        })

                    _.map(trunkList, (data, index) => {
                        let technology = data.technology
                        let value = data.trunk_index + ''

                        if (value === currentTrunkIndex) {
                            currentTrunkType = technology
                        }
                    })

                    seamlessTreeData[0].children = accountList
                    extensionPreference.push(extensionPrefSettings.disable_extension_ranges, extensionPrefSettings.rand_password, extensionPrefSettings.weak_password)

                    this.setState({
                        destinationDataSource: {
                            'byDID': [],
                            'account': accountList,
                            'voicemail': voicemailList,
                            'conference': conferenceList,
                            'queue': queueList,
                            'ringgroup': ringgroupList,
                            'paginggroup': paginggroupList,
                            'vmgroup': vmgroupList,
                            'fax': faxList,
                            'disa': disaList,
                            'ivr': ivrList,
                            'directory': directoryList,
                            'external_number': [],
                            'callback': callbackList
                        },
                        trunkList: trunkList,
                        DIDDesTreeData: DIDDesTreeData,
                        currentTrunkType: currentTrunkType,
                        slaTrunkNameList: slaTrunkNameList,
                        seamlessTreeData: seamlessTreeData,
                        destinationHasDID: destinationHasDID,
                        extensionPreference: extensionPreference
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        browserHistory.push(this.props.params.trunkId ? ('/extension-trunk/inboundRoute/' + this.props.params.trunkId) : '/extension-trunk/inboundRoute')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const form = this.props.form
        const { formatMessage } = this.props.intl
        const getFieldInstance = form.getFieldInstance

        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4272" })}}></span>
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        let validateFields = this._getFieldsIDs()

        form.validateFields(validateFields, { force: true }, (err, values) => {
            if (!err) {
                let permissionVisible = this.state.destinationHasDID && this.state.dial_trunk 

                if (!this.state.diddes_members.length && this.state.destinationHasDID) {
                    message.error(errorMessage)

                    return false
                }

                let doSubmit = () => {
                        let action = {}
                        let sequence = 0
                        let multi_mode = []
                        let time_condition = []
                        let seamless_members = []
                        let destinationTypeList = ['conference', 'paginggroup', 'fax', 'disa', 'directory', 'callback', 'voicemail', 'account', 'vmgroup', 'ivr', 'ringgroup', 'queue']

                        if (!this.state.currentInAddMode) {
                            action.action = 'updateInboundRoute'
                            action.inbound_route = this.props.params.routeId
                        } else {
                            action.action = 'addInboundRoute'
                            action.trunk_index = values.trunk_index
                        }

                        _.map(values, function(value, key) {
                            let fieldInstance = getFieldInstance(key)

                            if (key === 'trunk_index' || key === 'custom_alert_info' ||
                                key === 'did_pattern_match' || key === 'did_pattern_allow' || key === 'destination_value') {
                                return false
                            }

                            if (key.indexOf('mode_') === 0 || key.indexOf('mode1_') === 0) {
                                return false
                            }

                            action[key] = (value !== undefined ? UCMGUI.transCheckboxVal(value) : '')
                        })

                        let trueMatch = []
                        let trueAllow = []
                        let matchAry = values.did_pattern_match ? values.did_pattern_match.split(',') : []
                        let allowAry = values.did_pattern_allow ? values.did_pattern_allow.split(',') : []

                        _.map(matchAry, (value) => {
                            let match = $.trim(value)

                            if (!match) {
                                return false
                            } else {
                                trueMatch.push((match.indexOf('_') === 0) ? match : '_' + match)
                            }
                        })

                        _.map(allowAry, (value) => {
                            let allow = $.trim(value)

                            if (!allow) {
                                return false
                            } else {
                                trueAllow.push((allow.indexOf('_') === 0) ? allow : '_' + allow)
                            }
                        })

                        _.map(this.state.DIDParams, (value) => {
                            if (this.state.diddes_members.indexOf(value) > -1 || (this.state.diddes_members.length === 1 && this.state.diddes_members[0] === 'all')) {
                                action[value] = 'yes'
                            } else {
                                action[value] = 'no'
                            }
                        })

                        if (this.state.seamless_members.length === 1 && this.state.seamless_members[0] === 'all') {
                            _.map(this.state.destinationDataSource.account, (data) => {
                                seamless_members.push(data.value)
                            })
                        } else {
                            seamless_members = this.state.seamless_members
                        }

                        if (values.alertinfo === 'none') {
                            action['alertinfo'] = ''
                        } else if (values.alertinfo === 'custom') {
                            action['alertinfo'] = 'custom_' + values.custom_alert_info
                        }

                        _.map(destinationTypeList, (value) => {
                            action[value] = ''
                        })

                        action.did_strip = values.did_strip ? values.did_strip : '0'

                        if (values.destination_type === 'byDID') {
                            action.incoming_prepend = values.incoming_prepend
                        } else {
                            action.incoming_prepend = ''
                        }

                        if (values.destination_type === 'external_number') {
                            action.external_number = values.external_number
                        } else {
                            action.external_number = ''
                        }

                        if (values.destination_type !== 'byDID' && values.destination_type !== 'external_number') {
                            action.did_strip = '0'
                            action[values.destination_type] = values.destination_value
                        }

                        if (values.mode1_destination_type) {
                            let obj = {
                                mode: '1',
                                did_strip: values.mode1_did_strip ? values.mode1_did_strip : '0',
                                destination_type: values.mode1_destination_type ? values.mode1_destination_type : ''
                            }

                            _.map(destinationTypeList, (value) => {
                                obj[value] = ''
                            })

                            if (values.mode1_destination_type === 'byDID') {
                                obj.incoming_prepend = values.mode1_incoming_prepend
                            } else {
                                obj.incoming_prepend = ''
                            }

                            if (values.mode1_destination_type === 'external_number') {
                                obj.external_number = values.mode1_external_number
                            } else {
                                obj.external_number = ''
                            }

                            if (values.mode1_destination_type !== 'byDID' && values.mode1_destination_type !== 'external_number') {
                                obj.did_strip = '0'
                                obj[values.mode1_destination_type] = values.mode1_destination_value
                            }

                            multi_mode.push(obj)
                        }

                        if (values.mode_default_time_condition && values.mode_default_time_condition.length) {
                            _.map(values.mode_default_time_condition, (data, index) => {
                                let obj = _.clone(data)

                                delete obj.time
                                delete obj.condition_index

                                obj.inbound_mode = '0'
                                obj.sequence = ++sequence

                                time_condition.push(obj)
                            })
                        }

                        if (values.mode_1_time_condition && values.mode_1_time_condition.length) {
                            _.map(values.mode_1_time_condition, (data, index) => {
                                let obj = _.clone(data)

                                delete obj.time
                                delete obj.condition_index

                                obj.inbound_mode = '1'
                                obj.sequence = ++sequence

                                time_condition.push(obj)
                            })
                        }

                        action.did_pattern_allow = trueAllow.toString()
                        action.did_pattern_match = trueMatch.toString()
                        action.multi_mode = JSON.stringify(multi_mode)
                        action.time_condition = JSON.stringify(time_condition)
                        action.seamless_transfer_did_whitelist = seamless_members.join()

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

                                    browserHistory.push('/extension-trunk/inboundRoute/' + values.trunk_index)
                                }
                            }.bind(this)
                        })
                    }

                if (values.permission !== 'internal' && permissionVisible) {
                    confirm({
                        onCancel() {},
                        onOk() { doSubmit() },
                        content: <span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG2537" }, {
                                                0: formatMessage({ id: "LANG1071" }),
                                                1: formatMessage({ id: "LANG658" })
                                            })
                                        }}
                                    ></span>
                    })
                } else {
                    doSubmit()
                }
            }
        })
    }
    _onChange = (activeKey) => {
        let form = this.props.form
        let validateFields = ['destination_type', 'destination_value', 'external_number', 'did_strip', 'incoming_prepend', 'mode1_destination_type', 'mode1_destination_value', 'mode1_external_number', 'mode1_did_strip', 'mode1_incoming_prepend']

        form.validateFieldsAndScroll(validateFields, { force: true }, (err, values) => {
            if (err) {
                this.setState({
                    activeKey: this.state.activeKey
                })

                return
            }

            this.setState({
                activeKey
            })
        })
    }
    _onChangeAlertInfo = (value) => {
        this.setState({
            alertinfo: value
        })
    }
    _onChangeDestinationType = (value) => {
        let obj = {}
        let form = this.props.form
        let destinationList = this.state.destinationDataSource[value]

        form.setFieldsValue({
            external_number: '',
            destination_value: destinationList.length ? destinationList[0].value : ""
        })

        obj.destinationType = value
        obj.destinationValue = destinationList.length ? destinationList[0].value : ""

        if (value === 'byDID') {
            obj.destinationHasDID = true
        } else {
            obj.destinationHasDID = false
        }

        this.setState(obj)
    }
    _onChangeMode1DestinationType = (value) => {
        let obj = {}
        let form = this.props.form
        let destinationList = this.state.destinationDataSource[value]
        
        form.setFieldsValue({
            mode1_external_number: '',
            mode1_destination_value: destinationList.length ? destinationList[0].value : ""
        })

        obj.mode1DestinationType = value
        obj.mode1DestinationValue = destinationList.length ? destinationList[0].value : ""

        if (value === 'byDID') {
            obj.destinationHasDID = true
        } else {
            obj.destinationHasDID = false
        }

        this.setState(obj)
    }
    _onChangeDialTrunk = (e) => {
        this.setState({
            dial_trunk: e.target.checked
        })
    }
    _onChangeLimitime = (e) => {
        this.setState({
            enable_out_limitime: e.target.checked
        })
    }
    _onChangeSeamlessSelect = (value) => {
        this.setState({
            seamless_members: value
        })
    }
    _onChangeDIDDesSelect = (value) => {
        this.setState({
            diddes_members: value
        })
    }
    _onChangeMultiMode = (e) => {
        let obj = {
            enableMultiMode: e.target.checked
        }

        if (!e.target.checked) {
            obj.activeKey = 'default'
        }

        this.setState(obj)
    }
    _onChangePrependTrunkName = (e) => {
        this.setState({
            prepend_trunk_name: e.target.checked
        })
    }
    _onChangePrependInboundNameEnable = (e) => {
        this.setState({
            prepend_inbound_name_enable: e.target.checked
        })
    }
    _onSelectTrunkIndex = (value, option) => {
        const { form } = this.props

        let currentTrunkType = option.props.technology

        this.setState({
                currentTrunkIndex: value,
                currentTrunkType: currentTrunkType
            }, () => {
                if (currentTrunkType === 'Analog') {
                    form.setFieldsValue({
                        'did_pattern_match': 's'
                    })
                } else {
                    form.setFieldsValue({
                        'did_pattern_match': ''
                    })
                }
            })
    }
    _renderTrunkOptions = () => {
        let trunkList = this.state.trunkList
        const { formatMessage } = this.props.intl
        let slaTrunkNameList = this.state.slaTrunkNameList

        return <Select onSelect={ this._onSelectTrunkIndex }>
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
                                    disabled={ this.state.destinationHasDID && technology === 'Analog' }
                                >
                                    { text }
                                </Option>
                    })
                }
            </Select>
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const settings = this.state.inboundRouteItem || {}
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const formItemRowLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const diddesProps = {
            multiple: true,
            treeCheckable: true,
            treeDefaultExpandAll: true,
            showCheckedStrategy: SHOW_PARENT,
            value: this.state.diddes_members,
            treeData: this.state.DIDDesTreeData,
            onChange: this._onChangeDIDDesSelect
        }

        const seamlessProps = {
            multiple: true,
            treeCheckable: true,
            treeDefaultExpandAll: true,
            showCheckedStrategy: SHOW_PARENT,
            value: this.state.seamless_members,
            treeData: this.state.seamlessTreeData,
            onChange: this._onChangeSeamlessSelect
        }

        const failoverTrunkColumns = [{
                key: 'failover_trunk_index',
                dataIndex: 'failover_trunk_index',
                title: formatMessage({id: "LANG83"})
            }, {
                key: 'failover_strip',
                dataIndex: 'failover_strip',
                title: formatMessage({id: "LANG1547"})
            }, {
                key: 'failover_prepend',
                dataIndex: 'failover_prepend',
                title: formatMessage({id: "LANG1541"})
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                onClick={ this._editFailoverTrunk.bind(this, record) }
                            >
                            </span>
                            <span
                                className="sprite sprite-del"
                                onClick={ this._deleteFailoverTrunk.bind(this, record) }>
                            ></span>
                        </div>
                }
            }]

        const defaultTCColumns = [{
                key: 'timetype',
                dataIndex: 'timetype',
                title: formatMessage({id: "LANG1557"})
            }, {
                key: 'time',
                dataIndex: 'time',
                title: formatMessage({id: "LANG247"})
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                onClick={ this._editDefaultTC.bind(this, record) }
                            >
                            </span>
                            <span
                                className="sprite sprite-del"
                                onClick={ this._deleteDefaultTC.bind(this, record) }>
                            ></span>
                        </div>
                }
            }]

        const otherTCColumns = [{
                key: 'timetype',
                dataIndex: 'timetype',
                title: formatMessage({id: "LANG1557"})
            }, {
                key: 'time',
                dataIndex: 'time',
                title: formatMessage({id: "LANG247"})
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                onClick={ this._editOtherTC.bind(this, record) }
                            >
                            </span>
                            <span
                                className="sprite sprite-del"
                                onClick={ this._deleteOtherTC.bind(this, record) }>
                            ></span>
                        </div>
                }
            }]

        const title = (this.state.currentInAddMode
                ? formatMessage({id: 'LANG771'})
                : formatMessage({id: 'LANG659'}))

        document.title = formatMessage({id: 'LANG584'}, {
                    0: model_info.model_name,
                    1: title
                })

        let mode_1_time_condition = _.filter(this.state.timeCondition, (data) => { return data.inbound_mode.toString() === '1' })

        getFieldDecorator('mode_1_time_condition', { initialValue: mode_1_time_condition })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    isDisplay='display-block'
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                />
                <div className="content">
                    <Form>
                        <Row>
                            <Col
                                span={ 12 }
                                className={ this.state.currentInAddMode ? 'display-block' : 'hidden' }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3493" /> }>
                                                <span>{ formatMessage({id: "LANG83"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('trunk_index', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: this.state.currentTrunkIndex
                                    })(
                                        this._renderTrunkOptions()
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
                                    { getFieldDecorator('did_pattern_match', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: this.state.currentTrunkType === 'Analog' ? 's' : settings.did_pattern_match
                                    })(
                                        <Input placeholder={ formatMessage({id: "LANG5448"}) } disabled={ this.state.currentTrunkType === 'Analog' } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1560" /> }>
                                                <span>{ formatMessage({id: "LANG2748"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('did_pattern_allow', {
                                        rules: [],
                                        initialValue: settings.did_pattern_allow
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
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.out_of_service === 'yes'
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
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2749" /> }>
                                                <span>{ formatMessage({id: "LANG2745"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('prepend_trunk_name', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: this.state.prepend_trunk_name
                                    })(
                                        <Checkbox onChange={ this._onChangePrependTrunkName } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5033" /> }>
                                                <span>{ formatMessage({id: "LANG5032"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    <Col span={ 2 }>
                                        { getFieldDecorator('prepend_inbound_name_enable', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: this.state.prepend_inbound_name_enable
                                        })(
                                            <Checkbox onChange={ this._onChangePrependInboundNameEnable } disabled={ this.state.prepend_trunk_name } />
                                        ) }
                                    </Col>
                                    <Col
                                        span={ 21 }
                                        offset={ 1 }
                                        className={ this.state.prepend_inbound_name_enable ? 'display-block' : 'hidden' }
                                    >
                                        { getFieldDecorator('prepend_inbound_name', {
                                            rules: [],
                                            initialValue: settings.prepend_inbound_name
                                        })(
                                            <Input disabled={ this.state.prepend_trunk_name } />
                                        ) }
                                    </Col>
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4291" /> }>
                                                <span>{ formatMessage({id: "LANG4290"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('en_multi_mode', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: this.state.enableMultiMode
                                    })(
                                        <Checkbox onChange={ this._onChangeMultiMode } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3249" /> }>
                                                <span>{ formatMessage({id: "LANG3248"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('alertinfo', {
                                        rules: [],
                                        initialValue: this.state.alertinfo
                                    })(
                                        <Select onChange={ this._onChangeAlertInfo }>
                                            <Option value='none'>{ formatMessage({id: "LANG133"}) }</Option>
                                            <Option value='ring1'>{ 'Ring 1' }</Option>
                                            <Option value='ring2'>{ 'Ring 2' }</Option>
                                            <Option value='ring3'>{ 'Ring 3' }</Option>
                                            <Option value='ring4'>{ 'Ring 4' }</Option>
                                            <Option value='ring5'>{ 'Ring 5' }</Option>
                                            <Option value='ring6'>{ 'Ring 6' }</Option>
                                            <Option value='ring7'>{ 'Ring 7' }</Option>
                                            <Option value='ring8'>{ 'Ring 8' }</Option>
                                            <Option value='ring9'>{ 'Ring 9' }</Option>
                                            <Option value='ring10'>{ 'Ring 10' }</Option>
                                            <Option value="Bellcore-dr1">{ 'Bellcore-dr1' }</Option>
                                            <Option value="Bellcore-dr2">{ 'Bellcore-dr2' }</Option>
                                            <Option value="Bellcore-dr3">{ 'Bellcore-dr3' }</Option>
                                            <Option value="Bellcore-dr4">{ 'Bellcore-dr4' }</Option>
                                            <Option value="Bellcore-dr5">{ 'Bellcore-dr5' }</Option>
                                            <Option value="custom">{ formatMessage({id: "LANG231"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ (this.state.alertinfo === 'custom')
                                                ? 'display-block'
                                                : 'hidden' }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3250" /> }>
                                                <span>{ formatMessage({id: "LANG3250"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('custom_alert_info', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.alertinfo === 'custom',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.alphanumeric(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.maxlength(data, value, callback, formatMessage, 64)
                                            }
                                        }],
                                        initialValue: this.state.custom_alert_info
                                    })(
                                        <Input maxLength={64} />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.destinationHasDID ? 'display-block' : 'hidden' }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1566" /> }>
                                                <span>{ formatMessage({id: "LANG1447"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('dial_trunk', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: this.state.dial_trunk
                                    })(
                                        <Checkbox onChange={ this._onChangeDialTrunk } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.destinationHasDID && this.state.dial_trunk ? 'display-block' : 'hidden' }
                            >
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
                                    { getFieldDecorator('permission', {
                                        rules: [],
                                        initialValue: settings.permission ? settings.permission : 'internal'
                                    })(
                                        <Select>
                                            <Option value='internal'>{ formatMessage({id: "LANG1071"}) }</Option>
                                            <Option value='internal-local'>{ formatMessage({id: "LANG1072"}) }</Option>
                                            <Option value='internal-local-national'>{ formatMessage({id: "LANG1073"}) }</Option>
                                            <Option value='internal-local-national-international'>{ formatMessage({id: "LANG1074"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.destinationHasDID ? 'display-block' : 'hidden' }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5305" /> }>
                                                <span>{ formatMessage({id: "LANG1564"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    <TreeSelect { ...diddesProps } />
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1565" /> }>
                                                <span>{ formatMessage({id: "LANG5295"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    <TreeSelect { ...seamlessProps } />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Tabs
                                type="card"
                                className="custom-tabs"
                                onChange={ this._onChange }
                                activeKey={ this.state.activeKey }
                            >
                                <TabPane
                                    key="default"
                                    className="custom-tabpanel-content"
                                    tab={ formatMessage({id: "LANG4288"}) }
                                >
                                    <Row>
                                        <Col span={ 24 }>
                                            <Col span={ 12 }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={(
                                                        <span>
                                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2389" /> }>
                                                                <span>{ formatMessage({id: "LANG1558"}) }</span>
                                                            </Tooltip>
                                                        </span>
                                                    )}
                                                >
                                                    { getFieldDecorator('destination_type', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: true,
                                                            message: formatMessage({id: "LANG2150"})
                                                        }],
                                                        initialValue: this.state.destinationType
                                                    })(
                                                        <Select onChange={ this._onChangeDestinationType }>
                                                            <Option value="byDID" disabled={ this.state.currentTrunkType === 'Analog' }>{ formatMessage({id: "LANG1563"}) }</Option>
                                                            <Option value="account">{ formatMessage({id: "LANG85"}) }</Option>
                                                            <Option value="voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                                            <Option value="conference">{ formatMessage({id: "LANG98"}) }</Option>
                                                            <Option value="vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                                            <Option value="ivr">IVR</Option>
                                                            <Option value="ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                                            <Option value="queue">{ formatMessage({id: "LANG91"}) }</Option>
                                                            <Option value="paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                                            <Option value="fax">{ formatMessage({id: "LANG95"}) }</Option>
                                                            <Option value="disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                                            <Option value="directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                                            <Option value="external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                                            <Option value="callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                                        </Select>
                                                    ) }
                                                </FormItem>
                                            </Col>
                                            <Col
                                                span={ 6 }
                                                className={ !this.state.destinationType || this.state.destinationType === 'byDID' || this.state.destinationType === 'external_number' ? 'hidden' : 'display-block' }
                                            >
                                                <FormItem>
                                                    { getFieldDecorator('destination_value', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            message: formatMessage({id: "LANG2150"}),
                                                            required: this.state.destinationType && this.state.destinationType !== 'byDID' && this.state.destinationType !== 'external_number'
                                                        }],
                                                        initialValue: this.state.destinationValue
                                                    })(
                                                        this.state.destinationType
                                                            ? <Select>
                                                                    {
                                                                        this.state.destinationDataSource[this.state.destinationType].map(function(obj) {
                                                                                return <Option
                                                                                            key={ obj.key }
                                                                                            value={ obj.value }
                                                                                            className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                                                            { obj.label }
                                                                                        </Option>
                                                                            })
                                                                    }
                                                                </Select>
                                                            : <Select></Select>
                                                    ) }
                                                </FormItem>
                                            </Col>
                                            <Col
                                                span={ 6 }
                                                className={ this.state.destinationType === 'external_number' ? 'display-block' : 'hidden' }
                                            >
                                                <FormItem>
                                                    { getFieldDecorator('external_number', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            message: formatMessage({id: "LANG2150"}),
                                                            required: this.state.destinationType === 'external_number'
                                                        }],
                                                        initialValue: settings.external_number
                                                    })(
                                                        <Input />
                                                    ) }
                                                </FormItem>
                                            </Col>
                                        </Col>
                                        <Col
                                            span={ 24 }
                                            className={ this.state.destinationType === 'byDID' ? 'display-block' : 'hidden' }
                                        >
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
                                                { getFieldDecorator('did_strip', {
                                                    rules: [],
                                                    initialValue: settings.did_strip ? settings.did_strip : '0'
                                                })(
                                                    <Input />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col
                                            span={ 24 }
                                            className={ this.state.destinationType === 'byDID' ? 'display-block' : 'hidden' }
                                        >
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
                                                { getFieldDecorator('incoming_prepend', {
                                                    rules: [],
                                                    initialValue: settings.incoming_prepend
                                                })(
                                                    <Input />
                                                ) }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <div className="section-title">
                                            <span>{ formatMessage({id: "LANG1557"}) }</span>
                                        </div>
                                    </Row>
                                    <Row className="row-section-content">
                                        <TimeCondition
                                            inboundMode={ '0' }
                                            form={ this.props.form }
                                            timeCondition={ this.state.timeCondition }
                                            currentTrunkType={ this.state.currentTrunkType }
                                            checkDestinationHasDID={ this._checkDestinationHasDID }
                                            destinationDataSource={ this.state.destinationDataSource }
                                        />
                                    </Row>
                                </TabPane>
                                <TabPane
                                    key="mode1"
                                    className="custom-tabpanel-content"
                                    disabled={ !this.state.enableMultiMode }
                                    tab={ formatMessage({id: "LANG4289"}, {0: '1'}) }
                                >
                                    <Row>
                                        <Col span={ 24 }>
                                            <Col span={ 12 }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={(
                                                        <span>
                                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2389" /> }>
                                                                <span>{ formatMessage({id: "LANG1558"}) }</span>
                                                            </Tooltip>
                                                        </span>
                                                    )}
                                                >
                                                    { getFieldDecorator('mode1_destination_type', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.enableMultiMode && this.state.activeKey === 'mode1',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }],
                                                        initialValue: this.state.mode1DestinationType
                                                    })(
                                                        <Select onChange={ this._onChangeMode1DestinationType }>
                                                            <Option value="byDID" disabled={ this.state.currentTrunkType === 'Analog' }>{ formatMessage({id: "LANG1563"}) }</Option>
                                                            <Option value="account">{ formatMessage({id: "LANG85"}) }</Option>
                                                            <Option value="voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                                            <Option value="conference">{ formatMessage({id: "LANG98"}) }</Option>
                                                            <Option value="vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                                            <Option value="ivr">IVR</Option>
                                                            <Option value="ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                                            <Option value="queue">{ formatMessage({id: "LANG91"}) }</Option>
                                                            <Option value="paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                                            <Option value="fax">{ formatMessage({id: "LANG95"}) }</Option>
                                                            <Option value="disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                                            <Option value="directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                                            <Option value="external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                                            <Option value="callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                                        </Select>
                                                    ) }
                                                </FormItem>
                                            </Col>
                                            <Col
                                                span={ 6 }
                                                className={ !this.state.mode1DestinationType || this.state.mode1DestinationType === 'byDID' || this.state.mode1DestinationType === 'external_number' ? 'hidden' : 'display-block' }
                                            >
                                                <FormItem>
                                                    { getFieldDecorator('mode1_destination_value', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            message: formatMessage({id: "LANG2150"}),
                                                            required: this.state.mode1DestinationType && this.state.mode1DestinationType !== 'byDID' && this.state.mode1DestinationType !== 'external_number'
                                                        }],
                                                        initialValue: this.state.mode1DestinationValue
                                                    })(
                                                        this.state.mode1DestinationType
                                                            ? <Select>
                                                                    {
                                                                        this.state.destinationDataSource[this.state.mode1DestinationType].map(function(obj) {
                                                                                return <Option
                                                                                            key={ obj.key }
                                                                                            value={ obj.value }
                                                                                            className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                                                            { obj.label }
                                                                                        </Option>
                                                                            })
                                                                    }
                                                                </Select>
                                                            : <Select></Select>
                                                    ) }
                                                </FormItem>
                                            </Col>
                                            <Col
                                                span={ 6 }
                                                className={ this.state.mode1DestinationType === 'external_number' ? 'display-block' : 'hidden' }
                                            >
                                                <FormItem>
                                                    { getFieldDecorator('mode1_external_number', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            message: formatMessage({id: "LANG2150"}),
                                                            required: this.state.mode1DestinationType === 'external_number'
                                                        }],
                                                        initialValue: this.state.mode1DestinationData.external_number
                                                    })(
                                                        <Input />
                                                    ) }
                                                </FormItem>
                                            </Col>
                                        </Col>
                                        <Col
                                            span={ 24 }
                                            className={ this.state.mode1DestinationType === 'byDID' ? 'display-block' : 'hidden' }
                                        >
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
                                                { getFieldDecorator('mode1_did_strip', {
                                                    rules: [],
                                                    initialValue: this.state.mode1DestinationData.did_strip ? this.state.mode1DestinationData.did_strip : '0'
                                                })(
                                                    <Input />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col
                                            span={ 24 }
                                            className={ this.state.mode1DestinationType === 'byDID' ? 'display-block' : 'hidden' }
                                        >
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
                                                { getFieldDecorator('mode1_incoming_prepend', {
                                                    rules: [],
                                                    initialValue: this.state.mode1DestinationData.incoming_prepend
                                                })(
                                                    <Input />
                                                ) }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <div className="section-title">
                                            <span>{ formatMessage({id: "LANG1557"}) }</span>
                                        </div>
                                    </Row>
                                    <Row className="row-section-content">
                                        <TimeCondition
                                            inboundMode={ '1' }
                                            form={ this.props.form }
                                            timeCondition={ this.state.timeCondition }
                                            currentTrunkType={ this.state.currentTrunkType }
                                            checkDestinationHasDID={ this._checkDestinationHasDID }
                                            destinationDataSource={ this.state.destinationDataSource }
                                        />
                                    </Row>
                                </TabPane>
                            </Tabs>
                        </Row>
                        {/* <div
                            className={ this.state.defaultTCMode ? 'display-block' : 'hidden' }
                        >
                            <Col span={ 24 }>
                                <div className="function-description">
                                    <span>{ formatMessage({id: "LANG1532"}) }</span>
                                </div>
                            </Col>
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemRowLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1557" /> }>
                                                <span>{ formatMessage({id: "LANG1557"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('tc_timetype', {
                                        rules: [],
                                        initialValue: settings.tc_timetype ? settings.tc_timetype : '1'
                                    })(
                                        <Select>
                                            <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                            <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                            <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                            <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                            <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                            <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemRowLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG168" /> }>
                                                <span>{ formatMessage({id: "LANG168"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('tc_destination_type', {
                                        rules: [],
                                        initialValue: settings.tc_destination_type ? settings.tc_destination_type : 'account'
                                    })(
                                        <Select>
                                            <Option value="byDID">{ formatMessage({id: "LANG1563"}) }</Option>
                                            <Option value="account">{ formatMessage({id: "LANG85"}) }</Option>
                                            <Option value="voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                            <Option value="conference">{ formatMessage({id: "LANG98"}) }</Option>
                                            <Option value="vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                            <Option value="ivr">IVR</Option>
                                            <Option value="ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                            <Option value="queue">{ formatMessage({id: "LANG91"}) }</Option>
                                            <Option value="paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                            <Option value="fax">{ formatMessage({id: "LANG95"}) }</Option>
                                            <Option value="disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                            <Option value="directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                            <Option value="external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                            <Option value="callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                        </div>
                        <Col span={ 24 } style={{ 'padding': '0 0 10px 0' }}>
                            <Button
                                icon="plus"
                                type="primary"
                                onClick={ this._addDefaultTC }
                                className={ !this.state.defaultTCMode ? 'display-inline' : 'hidden' }
                            >
                                { formatMessage({id: "LANG769"}) }
                            </Button>
                            <Button
                                icon="check"
                                type="primary"
                                onClick={ this._saveDefaultTC }
                                className={ this.state.defaultTCMode ? 'display-inline' : 'hidden' }
                            >
                                { formatMessage({id: "LANG728"}) }
                            </Button>
                            <Button
                                icon="cross"
                                type="primary"
                                onClick={ this._cancelDefaultTC }
                                className={ this.state.defaultTCMode ? 'display-inline' : 'hidden' }
                            >
                                { formatMessage({id: "LANG726"}) }
                            </Button>
                        </Col>
                        <Col span={ 24 }>
                            <Table
                                rowKey="sequence"
                                pagination={ false }
                                columns={ defaultTCColumns }
                                dataSource={ this.state.defaultTC }
                            />
                        </Col>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG4289"}, {0: '1'}) }</span>
                            </div>
                        </Col>
                        <Col span={ 24 }>
                            <FormItem
                                { ...formItemRowLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2389" /> }>
                                            <span>{ formatMessage({id: "LANG1558"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('mode1_destination_type', {
                                    rules: [],
                                    initialValue: settings.mode1_destination_type ? settings.mode1_destination_type : 'account'
                                })(
                                    <Select>
                                        <Option value="byDID">{ formatMessage({id: "LANG1563"}) }</Option>
                                        <Option value="account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="ivr">IVR</Option>
                                        <Option value="ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <div
                            className={ this.state.otherTCMode ? 'display-block' : 'hidden' }
                        >
                            <Col span={ 24 }>
                                <div className="function-description">
                                    <span>{ formatMessage({id: "LANG1532"}) }</span>
                                </div>
                            </Col>
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemRowLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1557" /> }>
                                                <span>{ formatMessage({id: "LANG1557"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('tc_mode1_timetype', {
                                        rules: [],
                                        initialValue: settings.tc_mode1_timetype ? settings.tc_mode1_timetype : '1'
                                    })(
                                        <Select>
                                            <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                            <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                            <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                            <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                            <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                            <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemRowLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG168" /> }>
                                                <span>{ formatMessage({id: "LANG168"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('tc_mode1_destination_type', {
                                        rules: [],
                                        initialValue: settings.tc_mode1_destination_type ? settings.tc_mode1_destination_type : 'account'
                                    })(
                                        <Select>
                                            <Option value="byDID">{ formatMessage({id: "LANG1563"}) }</Option>
                                            <Option value="account">{ formatMessage({id: "LANG85"}) }</Option>
                                            <Option value="voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                            <Option value="conference">{ formatMessage({id: "LANG98"}) }</Option>
                                            <Option value="vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                            <Option value="ivr">IVR</Option>
                                            <Option value="ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                            <Option value="queue">{ formatMessage({id: "LANG91"}) }</Option>
                                            <Option value="paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                            <Option value="fax">{ formatMessage({id: "LANG95"}) }</Option>
                                            <Option value="disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                            <Option value="directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                            <Option value="external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                            <Option value="callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                        </div>
                        <Col span={ 24 } style={{ 'padding': '0 0 10px 0' }}>
                            <Button
                                icon="plus"
                                type="primary"
                                onClick={ this._addOtherTC }
                                className={ !this.state.otherTCMode ? 'display-inline' : 'hidden' }
                            >
                                { formatMessage({id: "LANG769"}) }
                            </Button>
                            <Button
                                icon="check"
                                type="primary"
                                onClick={ this._saveOtherTC }
                                className={ this.state.otherTCMode ? 'display-inline' : 'hidden' }
                            >
                                { formatMessage({id: "LANG728"}) }
                            </Button>
                            <Button
                                icon="cross"
                                type="primary"
                                onClick={ this._cancelOtherTC }
                                className={ this.state.otherTCMode ? 'display-inline' : 'hidden' }
                            >
                                { formatMessage({id: "LANG726"}) }
                            </Button>
                        </Col>
                        <Col span={ 24 }>
                            <Table
                                rowKey="sequence"
                                pagination={ false }
                                columns={ otherTCColumns }
                                dataSource={ this.state.otherTC }
                            />
                        </Col> */}
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(InboundRouteItem))

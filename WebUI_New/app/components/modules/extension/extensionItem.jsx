'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, message, Modal, Tabs, Tag } from 'antd'

import Media from './media'
import Feature from './feature'
import FollowMe from './followMe'
import SpecificTime from './specificTime'
import BasicSettings from './basicSettings'

const MAXLOCALNETWORK = 10
const TabPane = Tabs.TabPane
const confirm = Modal.confirm

class ExtensionItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            settings: {},
            languages: [],
            existFXSList: [],
            activeKey: '1',
            userSettings: {},
            editFollowme: false,
            editTimeCondition: false,
            add_method: 'single',
            autoEmailToUser: 'no',
            time_conditions_officetime: [],
            destinationDataSource: {
                ivr: [],
                none: [],
                queue: [],
                hangup: [],
                account: [],
                vmgroup: [],
                voicemail: [],
                ringgroup: [],
                external_number: []
            },
            mohNameList: ['default', 'ringbacktone_default'],
            currentEditId: this.props.params.id,
            extension_type: this.props.params.type ? this.props.params.type : 'sip'
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this._getInitData()
    }
    componentWillUnmount() {
    }
    _bigNumAdd = (a) => {
        if (!a) {
            a = '0'
        }

        let m = a.split('').reverse(),
            ret = [],
            s = 0,
            flag = 1,
            t

        for (let i = 0; i < a.length; i++) {
            t = Number(m[i]) + flag

            if (t > 9) {
                flag = 1
            } else {
                flag = 0
            }

            ret.push(t % 10)
        }

        if (flag) {
            ret.push(1)
        }

        return ret.reverse().join('')
    }
    _bigNumDelete = (a) => {
        if (!a) {
            a = '0'
        }

        let m = a.split('').reverse(),
            ret = [],
            s = 0,
            flag = 1,
            t

        for (let i = 0; i < a.length; i++) {
            t = Number(m[i]) - flag

            if (t < 0) {
                flag = 1
            } else {
                flag = 0
            }

            ret.push((t + 10) % 10)
        }

        return ret.reverse().join('').replace(/0*(\d+)/, '$1')
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
        let extensionEnd
        let extensionStart
        let settings = {}
        let languages = {}
        let autoEmail = 'no'
        let userSettings = {}
        let existFXSList = []
        let extensionRange = []
        let existNumberList = []
        let portExtensionList = []
        let destinationDataSource = {}
        let time_conditions_officetime = []
        let mohNameList = ['default', 'ringbacktone_default']
        let getList = [
                { 'getIVRList': '' },
                { 'getDahdiList': '' },
                { 'getLanguage': '' },
                { 'getQueueList': '' },
                { 'getNumberList': '' },
                { 'getFeatureCodes': '' },
                { 'getMOHNameList': '' },
                { 'getVMGroupList': '' },
                { 'getAccountList': '' },
                { 'getVoicemailList': '' },
                { 'getRingGroupList': '' },
                { 'getExtenPrefSettings': '' }
            ]

        const { formatMessage } = this.props.intl
        const extensionId = this.props.params.id
        const extensionType = this.props.params.type
        const disabled = formatMessage({id: "LANG273"})
        const extensionTypeUpperCase = extensionType ? extensionType.toUpperCase() : ''

        if (extensionId) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    extension: extensionId,
                    action: `get${extensionTypeUpperCase}Account`
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        settings = response.extension || {}

                        _.map(settings, (value, key) => {
                            if (value === null) {
                                settings[key] = ''
                            } else {
                                settings[key] = value
                            }
                        })

                        settings.presence_settings = response.sip_presence_settings || []
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
                    action: 'getUser',
                    user_name: extensionId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        let importantValues = ''
                        const response = res.response || {}

                        userSettings = response.user_name || {}
                        importantValues = settings.secret + settings.authid +
                                userSettings.email + userSettings.phone_number +
                                userSettings.first_name + userSettings.last_name + userSettings.user_password

                        this.setState({
                            settings: settings,
                            userSettings: userSettings,
                            importantValues: importantValues
                        })

                        $.ajax({
                            type: 'post',
                            url: api.apiHost,
                            data: {
                                'sord': 'asc',
                                'sidx': 'condition_index',
                                'user_id': userSettings.user_id,
                                'action': 'listTimeConditionOfficeTime'
                            },
                            success: function(res) {
                                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                                if (bool) {
                                    let ary = [],
                                        response = res.response || {},
                                        time_condition = response.time_conditions_officetime,
                                        translateTime = _.sortBy(time_condition, function(item) { return item.condition_index })

                                    for (let i = 0; i < translateTime.length; i++) {
                                        let obj = translateTime[i]

                                        obj.user_id = userSettings.user_id
                                        obj.start_hour = UCMGUI.addZero(obj.start_hour)
                                        obj.start_min = UCMGUI.addZero(obj.start_min)
                                        obj.end_hour = UCMGUI.addZero(obj.end_hour)
                                        obj.end_min = UCMGUI.addZero(obj.end_min)

                                        let stime_hour = obj.start_hour,
                                            stime_minute = obj.start_min,
                                            ftime_hour = obj.end_hour,
                                            ftime_minute = obj.end_min

                                        if (stime_hour === '' && stime_minute === '' &&
                                            ftime_hour === '' && ftime_minute === '') {
                                            obj.time = '00:00-23:59'
                                        } else {
                                            obj.time = stime_hour + ':' + stime_minute + '-' +
                                                ftime_hour + ':' + ftime_minute
                                        }

                                        ary.push(obj)
                                    }

                                    this.setState({
                                        time_conditions_officetime: ary
                                    })
                                }
                            }.bind(this),
                            error: function(e) {
                                message.error(e.statusText)
                            }
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        $.ajax({
            type: 'GET',
            async: false,
            url: api.apiHost + 'action=combineAction&data=' + JSON.stringify(getList),
            success: function(res) {
                let bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    let response = res.response || {}

                    let ivrList = response.getIVRList.ivr || []
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

                    languages = response.getLanguage.languages || []
                    existFXSList = response.getDahdiList.dahdi || []
                    mohNameList = response.getMOHNameList.moh_name || []
                    existNumberList = response.getNumberList.number || []
                    autoEmail = extensionPrefSettings.auto_email_to_user
                    extensionEnd = extensionPrefSettings.ue_end
                    extensionStart = extensionPrefSettings.ue_start
                    extensionRange = [(extensionStart ? parseInt(extensionStart) : undefined), (extensionEnd ? parseInt(extensionEnd) : undefined)]
                    extensionRange.push(extensionPrefSettings.disable_extension_ranges, extensionPrefSettings.rand_password, extensionPrefSettings.weak_password)

                    let featureSettings = response.getFeatureCodes.feature_settings || {}
                    let parkext = featureSettings.parkext
                    let parkpos = featureSettings.parkpos.split('-')

                    portExtensionList.push(parkext)

                    for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                        portExtensionList.push(i + "")
                    }

                    this.setState({
                        destinationDataSource: {
                            none: [],
                            hangup: [],
                            external_number: [],
                            ivr: ivrList,
                            queue: queueList,
                            account: accountList,
                            vmgroup: vmgroupList,
                            voicemail: voicemailList,
                            ringgroup: ringgroupList
                        },
                        languages: languages,
                        existFXSList: existFXSList,
                        mohNameList: mohNameList,
                        extensionRange: extensionRange,
                        existNumberList: existNumberList,
                        portExtensionList: portExtensionList,
                        autoEmailToUser: autoEmail ? autoEmail : 'no'
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getImportantValues = () => {
        let fieldsValue = ''
        const getFieldsValue = this.props.form.getFieldsValue

        fieldsValue = getFieldsValue(['secret', 'authid', 'email', 'phone_number', 'first_name', 'last_name', 'user_password'])

        return fieldsValue
    }
    _getBatchUsers = () => {
        const getFieldValue = this.props.form.getFieldValue

        let existNumberList = _.clone(this.state.existNumberList),
            startExt = getFieldValue('extension'),
            addNumber = getFieldValue('batch_number'),
            batchInterval = getFieldValue('batch_interval'),
            batchAddExtList = []

        while (addNumber) {
            if (existNumberList.indexOf(startExt) !== -1) {
                startExt = this._bigNumAdd(startExt)
                continue
            }

            batchAddExtList.push(startExt)

            startExt = parseInt(this._bigNumAdd(startExt)) + (batchInterval - 1) + ''

            addNumber--
        }

        return batchAddExtList
    }
    _handleCancel = (e) => {
        browserHistory.push('/extension-trunk/extension')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const getFieldInstance = form.getFieldInstance

        let validateFields = this._getFieldsIDs()

        validateFields = _.without(validateFields, 'fm_member_local', 'fm_member_external', 'tc_start_time', 'tc_end_time')

        form.validateFields(validateFields, { force: true }, (err, values) => {
            if (!err) {
                let action = {
                        dndwhitelist: [],
                        fwdwhitelist: [],
                        bypass_outrt_auth: 'no'
                    },
                    fm_action = {},
                    time_condition = [],
                    add_method = this.state.add_method,
                    extensionRange = this.state.extensionRange,
                    fax = values.faxmode ? values.faxmode : '',
                    type = values.extension_type ? values.extension_type : ''

                if (this.state.currentEditId) {
                    action.action = `update${this.state.extension_type.toUpperCase()}Account`
                } else {
                    action.action = `add${this.state.extension_type.toUpperCase()}AccountAndUser`

                    if (add_method === 'single') {
                        action.first_name = values.first_name ? values.first_name : ''
                        action.last_name = values.last_name ? values.last_name : ''
                        action.email = values.email ? values.email : ''
                        action.language = (values.language && values.language !== 'default') ? values.language : ''
                        action.user_password = values.user_password ? values.user_password : ''
                        action.phone_number = values.phone_number ? values.phone_number : ''

                        if (action.first_name && action.last_name) {
                            action.fullname = action.first_name + ' ' + action.last_name
                        } else if (action.first_name) {
                            action.fullname = action.first_name
                        } else if (action.last_name) {
                            action.fullname = action.last_name
                        } else {
                            action.fullname = ''
                        }
                    }
                }

                _.map(values, function(value, key) {
                    let fieldInstance = getFieldInstance(key)

                    if (key === 'mode' || key === 'out_limitime' || key === 'maximumTime' || key === 'enable_cc' ||
                        key === 'whiteLists' || key === 'fwdwhiteLists' || key === 'localNetworks' ||
                        key === 'room' || key === 'faxmode' || key === 'cc_mode' || key === 'batch_number' || key === 'batch_interval' ||
                        key === 'cc_max_agents' || key === 'cc_max_monitors' || key === 'custom_alert_info' ||
                        key === 'user_password' || key === 'phone_number' || key === 'email' || key === 'language' ||
                        key === 'extension_type' || key === 'fullname' || key === 'first_name' || key === 'last_name') {
                        return false
                    }

                    if (key.indexOf('fm_') === 0) {
                        if (key.indexOf('fm_member') !== 0 && key !== 'fm_destination_value') {
                            fm_action[key.slice(3)] = (value !== undefined ? UCMGUI.transCheckboxVal(value) : '')
                        }

                        return false
                    }

                    if (key.indexOf('ps_') === 0) {
                        return false
                    }

                    if (key.indexOf('tc_') === 0) {
                        return false
                    }

                    if (key.indexOf('whitelist') === 0) {
                        if (value) {
                            action.dndwhitelist.push(value)
                        }

                        return false
                    }

                    if (key.indexOf('fwdwhitelist') === 0) {
                        if (value) {
                            action.fwdwhitelist.push(value)
                        }

                        return false
                    }

                    if (fieldInstance && fieldInstance.props) {
                        let medaData = fieldInstance.props['data-__meta']

                        if (!medaData.className || medaData.className !== 'hidden') {
                            action[key] = (value !== undefined ? UCMGUI.transCheckboxVal(value) : '')
                        }
                    } else {
                        action[key] = value ? value : ''
                    }
                })

                if (this.state.editTimeCondition) {
                    let time_condition = values.tc_time_condition,
                        tcLength = time_condition.length

                    for (let i = 0; i < tcLength; i++) {
                        delete time_condition[i]['time']
                        delete time_condition[i]['condition_index']

                        time_condition[i]['sequence'] = 0
                        // time_condition[i]['condition_index'] = i + 1
                    }

                    action.time_condition = JSON.stringify(time_condition)
                } else {
                    if (!this.state.currentEditId) {
                        action.time_condition = JSON.stringify([])
                    }
                }

                action.dndwhitelist = action.dndwhitelist.join()
                action.fwdwhitelist = action.fwdwhitelist.join()

                if (fax === 'no') {
                    action['faxdetect'] = 'no'

                    if (type === 'fxs') {
                        action['fax_gateway'] = 'no'
                    }
                } else if (fax === 'detect') {
                    action['faxdetect'] = 'yes'

                    if (type === 'fxs') {
                        action['fax_gateway'] = 'no'
                    }
                } else if (fax === 'gateway') {
                    action['faxdetect'] = 'no'

                    if (type === 'fxs') {
                        action['fax_gateway'] = 'yes'
                    }
                }

                if (type === 'fxs') {
                    action['hanguponpolarityswitch'] = action['answeronpolarityswitch']

                    if (values.enable_cc) {
                        action['cc_agent_policy'] = 'generic'
                        action['cc_monitor_policy'] = 'generic'
                        action['cc_max_agents'] = '1'
                        action['cc_max_monitors'] = '5'
                        action['cc_offer_timer'] = '120'
                        action['ccnr_available_timer'] = '3600'
                        action['ccbs_available_timer'] = '3600'
                    } else {
                        action['cc_agent_policy'] = 'never'
                        action['cc_monitor_policy'] = 'never'
                    }

                    delete action.allow
                } else {
                    // SIP/ IAX
                    for (var i = 1; i <= MAXLOCALNETWORK; i++) {
                        if (!action.hasOwnProperty('local_network' + i)) {
                            action['local_network' + i] = ''
                        }
                    }

                    if (type === 'sip') {
                        if (values.enable_cc) {
                            if (values.cc_mode === 'trunk') {
                                action['cc_agent_policy'] = 'native'
                                action['cc_monitor_policy'] = 'native'
                                action['cc_max_agents'] = values.cc_max_agents ? values.cc_max_agents : ''
                                action['cc_max_monitors'] = values.cc_max_monitors ? values.cc_max_monitors : ''
                                action['cc_offer_timer'] = '120'
                                action['ccnr_available_timer'] = '3600'
                                action['ccbs_available_timer'] = '3600'
                            } else {
                                action['cc_agent_policy'] = 'generic'
                                action['cc_monitor_policy'] = 'generic'
                                action['cc_max_agents'] = '1'
                                action['cc_max_monitors'] = '5'
                                action['cc_offer_timer'] = '120'
                                action['ccnr_available_timer'] = '3600'
                                action['ccbs_available_timer'] = '3600'
                            }
                        } else {
                            action['cc_agent_policy'] = 'never'
                            action['cc_monitor_policy'] = 'never'
                        }

                        if (values.enable_webrtc !== undefined) {
                            if (values.enable_webrtc) {
                                action['enable_webrtc'] = 'yes'
                                action['media_encryption'] = 'auto_dtls'
                                action['account_type'] = 'SIP(WebRTC)'
                            } else {
                                action['enable_webrtc'] = 'no'
                                action['media_encryption'] = 'no'
                                action['account_type'] = 'SIP'
                            }
                        }

                        if (values.alertinfo === 'none') {
                            action['alertinfo'] = ''
                        } else if (values.alertinfo === 'custom') {
                            action['alertinfo'] = 'custom_' + values.custom_alert_info
                        }

                        if (values.room) {
                            action['room'] = action['extension']
                        }

                        let presence_settings = []
                        let presenceStatusList = ['available', 'away', 'chat', 'userdef', 'unavailable']

                        presenceStatusList.map((value) => {
                            let type = values[`ps_${value}_cfu_type`]
                            let obj = {
                                    presence_status: value
                                }

                            if (type) {
                                obj.cfu_destination_type = type
                                obj.cfb_destination_type = values[`ps_${value}_cfb_type`]
                                obj.cfn_destination_type = values[`ps_${value}_cfn_type`]
                                obj.cfu_timetype = values[`ps_${value}_cfu_timetype`]
                                obj.cfb_timetype = values[`ps_${value}_cfb_timetype`]
                                obj.cfn_timetype = values[`ps_${value}_cfn_timetype`]

                                if (obj.cfu_destination_type === '0' || obj.cfu_destination_type === '7') {
                                    obj.cfu = ''
                                } else if (obj.cfu_destination_type === '2') { // External Number
                                    obj.cfu = values[`ps_${value}_cfu_external`]
                                } else {
                                    obj.cfu = values[`ps_${value}_cfu_value`]
                                }

                                if (obj.cfn_destination_type === '0' || obj.cfn_destination_type === '7') {
                                    obj.cfn = ''
                                } else if (obj.cfn_destination_type === '2') { // External Number
                                    obj.cfn = values[`ps_${value}_cfn_external`]
                                } else {
                                    obj.cfn = values[`ps_${value}_cfn_value`]
                                }

                                if (obj.cfb_destination_type === '0' || obj.cfb_destination_type === '7') {
                                    obj.cfb = ''
                                } else if (obj.cfb_destination_type === '2') { // External Number
                                    obj.cfb = values[`ps_${value}_cfb_external`]
                                } else {
                                    obj.cfb = values[`ps_${value}_cfb_value`]
                                }
                            } else {
                                if (this.state.currentEditId) {
                                    let presence = this.state.settings.presence_settings

                                    _.map(presence, (data) => {
                                        if (data.presence_status === value) {
                                            obj = data
                                        }
                                    })
                                } else {
                                    obj.cfu = ''
                                    obj.cfb = ''
                                    obj.cfn = ''
                                    obj.cfu_timetype = 0
                                    obj.cfb_timetype = 0
                                    obj.cfn_timetype = 0
                                    obj.cfu_destination_type = '0'
                                    obj.cfb_destination_type = '0'
                                    obj.cfn_destination_type = '0'
                                }
                            }

                            presence_settings.push(obj)
                        })

                        action['presence_settings'] = JSON.stringify(presence_settings)
                    }
                }

                if (values.out_limitime) {
                    action['limitime'] = parseInt(values.maximumTime) * 1000
                } else {
                    action['limitime'] = ''
                }

                if ((add_method === 'batch' || !this.state.currentEditId) && !action.allow && (type !== 'fxs')) {
                    action.allow = 'ulaw,alaw,gsm,g726,g722,g729,h264,ilbc'
                }

                console.log('Received values of form: ', action)
                console.log('Received values of form: ', values)

                if (add_method === 'batch') {
                    let newusersLists = []
                    let batchAddExtList = []
                    let addNumber = values.batch_number

                    batchAddExtList = this._getBatchUsers()

                    if (UCMGUI.askExtensionRange(values.extension, extensionRange[0], extensionRange[1], extensionRange[2], batchAddExtList[batchAddExtList.length - 1], formatMessage)) {
                        newusersLists.push('<font>' + batchAddExtList[0] + '</font>')

                        for (let i = 1; i < addNumber; i++) {
                            let newusersItem = batchAddExtList[i],
                                prevItem = batchAddExtList[i - 1],
                                prev = this._bigNumDelete(newusersItem)

                            if ((typeof prevItem === 'string' ? prevItem.replace(/0*(\d+)/, '$1') : prevItem) === prev) {
                                newusersItem = '<font>' + newusersItem + '</font>'
                            } else {
                                newusersItem = '<font color="green">' + newusersItem + '</font>'
                            }

                            newusersLists.push(newusersItem)
                        }

                        action.user_password = 'r'
                        action.time_condition = JSON.stringify([])
                        action.extension = batchAddExtList.toString()

                        if (values.room) {
                            action['room'] = action['extension']
                        }

                        action.language = (values.language && values.language !== 'default') ? values.language : ''

                        confirm({
                            onCancel: () => {},
                            okText: formatMessage({id: "LANG727" }),
                            cancelText: formatMessage({id: "LANG726" }),
                            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG813" }, {0: newusersLists.join('  ')}) }}></span>,
                            onOk: () => {
                                this.props.setSpinLoading({
                                        loading: true,
                                        tip: formatMessage({ id: "LANG736" })
                                    })

                                $.ajax({
                                    data: action,
                                    type: 'post',
                                    url: api.apiHost,
                                    error: function(e) {
                                        message.error(e.statusText)
                                    },
                                    success: (data) => {
                                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                        if (bool) {
                                            this.props.setSpinLoading({
                                                    tip: '',
                                                    loading: false
                                                })

                                            message.destroy()
                                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4104" })}}></span>, 2)

                                            $.ajax({
                                                type: 'post',
                                                url: api.apiHost,
                                                data: {
                                                    'action': 'addFollowme',
                                                    'extension': action['extension']
                                                },
                                                error: function(e) {
                                                    message.error(e.statusText)
                                                },
                                                success: (data) => {
                                                    // var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                                    // if (bool) {}
                                                }
                                            })

                                            this._handleCancel()
                                        }
                                    }
                                })
                            }
                        })
                    }
                } else {
                    // if (!values.fm_members.length) {
                    //     message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3391" })}}></span>)

                    //     this.setState({
                    //         activeKey: '5'
                    //     })

                    //     return false
                    // }

                    if (!this.state.currentEditId && !UCMGUI.askExtensionRange(values.extension, extensionRange[0], extensionRange[1], extensionRange[2], undefined, formatMessage)) {
                        return false
                    }

                    this.props.setSpinLoading({
                        loading: true,
                        tip: formatMessage({ id: "LANG826" })
                    })

                    $.ajax({
                        data: action,
                        type: 'post',
                        url: api.apiHost,
                        error: function(e) {
                            message.error(e.statusText)
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                if (this.state.currentEditId) {
                                    let fieldsValue = this._getImportantValues()

                                    let newImportantValues = fieldsValue.secret + fieldsValue.authid +
                                            fieldsValue.email + fieldsValue.phone_number +
                                            fieldsValue.first_name + fieldsValue.last_name + fieldsValue.user_password

                                    let userAction = {
                                            'action': 'updateUser',
                                            'email': values.email ? values.email : '',
                                            'user_id': this.state.userSettings.user_id,
                                            'last_name': values.last_name ? values.last_name : '',
                                            'first_name': values.first_name ? values.first_name : '',
                                            'phone_number': values.phone_number ? values.phone_number : '',
                                            'user_password': values.user_password ? values.user_password : '',
                                            'language': (values.language && values.language !== 'default') ? values.language : ''
                                        }

                                    if (userAction.user_password === '******') {
                                        delete userAction.user_password
                                    }

                                    if (this.state.importantValues !== newImportantValues) {
                                        userAction.email_to_user = 'no'
                                    }

                                    $.ajax({
                                        type: 'post',
                                        async: false,
                                        url: api.apiHost,
                                        data: userAction,
                                        error: function(e) {
                                            message.error(e.statusText)
                                        },
                                        success: function(data) {
                                            var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                            if (bool) {
                                                if ((this.state.importantValues !== newImportantValues) &&
                                                    (this.state.autoEmailToUser === 'yes') && userAction['email']) {
                                                    $.ajax({
                                                        'type': "post",
                                                        'async': false,
                                                        'url': api.apiHost,
                                                        'data': {
                                                            'action': 'sendAccount2User',
                                                            'extension': action['extension']
                                                        },
                                                        error: function(jqXHR, textStatus, errorThrown) {},
                                                        success: function(data) {}
                                                    })
                                                }

                                                message.destroy()
                                                message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>, 2)
                                            }
                                            this.props.setSpinLoading({
                                                tip: '',
                                                loading: false
                                            })
                                        }.bind(this)
                                    })
                                } else {
                                    if ((this.state.autoEmailToUser === 'yes') && action['email']) {
                                        $.ajax({
                                            type: "post",
                                            async: false,
                                            url: api.apiHost,
                                            data: {
                                                'action': 'sendAccount2User',
                                                'extension': action['extension']
                                            },
                                            error: function(jqXHR, textStatus, errorThrown) {},
                                            success: function(data) {}
                                        })
                                    }

                                    this.props.setSpinLoading({
                                            tip: '',
                                            loading: false
                                        })

                                    message.destroy()
                                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4104" })}}></span>, 2)
                                }

                                if (this.state.editFollowme) {
                                    let fm_members = []
                                    let destinationTypeList = ['voicemail', 'account', 'vmgroup', 'ivr', 'ringgroup', 'queue', 'external_number']

                                    if (fm_action.action === 'addFollowme') {
                                        fm_action.extension = values.extension
                                    } else {
                                        fm_action.followme = values.extension
                                    }

                                    for (let i = 0; i < destinationTypeList.length; i++) {
                                        let destinationType = destinationTypeList[i]

                                        if (destinationType !== values.fm_destination_type) {
                                            if (destinationType === 'queue') {
                                                fm_action['queue_dest'] = ''
                                            } else if (destinationType === 'voicemail') {
                                                fm_action['vm_extension'] = ''
                                            } else {
                                                fm_action[destinationType] = ''
                                            }
                                        } else {
                                            if (destinationType === 'queue') {
                                                fm_action['queue_dest'] = values.fm_destination_value
                                            } else if (destinationType === 'voicemail') {
                                                fm_action['vm_extension'] = values.fm_destination_value
                                            } else if (destinationType === 'external_number') {
                                                fm_action[destinationType] = values.fm_external_number
                                            } else {
                                                fm_action[destinationType] = values.fm_destination_value
                                            }
                                        }
                                    }

                                    _.map(values.fm_members, (data, key) => {
                                        let obj = {
                                                'local_extension': [],
                                                'outside_extension': [],
                                                'ringtime': data.ringtime
                                            }

                                        let extensions = data.extension

                                        _.map(extensions, (value, index) => {
                                            if (_.find(this.state.destinationDataSource.account, (data) => { return data.key === value })) {
                                                obj['local_extension'].push(value)
                                            } else {
                                                obj['outside_extension'].push(value)
                                            }
                                        })

                                        fm_members.push(obj)
                                    })

                                    fm_action['members'] = JSON.stringify(fm_members)
                                } else {
                                    if (!this.state.currentEditId) {
                                        fm_action = {
                                            action: 'addFollowme',
                                            extension: values.extension
                                        }
                                    } else {
                                        fm_action = {}
                                    }
                                }

                                if (!_.isEmpty(fm_action)) {
                                    $.ajax({
                                        type: 'post',
                                        data: fm_action,
                                        url: api.apiHost,
                                        error: function(e) {},
                                        success: function(data) {}
                                    })
                                }

                                this._handleCancel()
                            }
                        }.bind(this)
                    })
                }
            }
        })
    }
    _onChange = (activeKey) => {
        let form = this.props.form
        let validateFields = this._getFieldsIDs()

        validateFields = _.without(validateFields, 'fm_member_local', 'fm_member_external', 'tc_start_time', 'tc_end_time')

        form.validateFieldsAndScroll(validateFields, { force: true }, (err, values) => {
            if (err) {
                this.setState({
                    activeKey: this.state.activeKey
                })

                return
            }

            if (activeKey === '5') {
                this.setState({
                    editFollowme: true
                })
            }

            if (activeKey === '4') {
                this.setState({
                    editTimeCondition: true
                })
            }

            this.setState({
                activeKey
            })
        })
    }
    _onAddMethodChange = (value) => {
        this.setState({
            add_method: value
        })
    }
    _onExtensionTypeChange = (value) => {
        this.setState({
            extension_type: value
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG85"}),
                    1: this.props.params.id
                })
                : formatMessage({id: "LANG733"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main app-content-extension">
                <Title
                    headerTitle={ title }
                    isDisplay='display-block'
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                />
                <Form className="form-contain-tab">
                    <Tabs
                        onChange={ this._onChange }
                        activeKey={ this.state.activeKey }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG2217"}) } key="1">
                            <BasicSettings
                                form={ form }
                                settings={ this.state.settings }
                                languages={ this.state.languages }
                                existFXSList={ this.state.existFXSList }
                                userSettings={ this.state.userSettings }
                                currentEditId={ this.state.currentEditId }
                                extensionType={ this.state.extension_type }
                                extensionRange={ this.state.extensionRange }
                                existNumberList={ this.state.existNumberList }
                                portExtensionList={ this.state.portExtensionList }
                                onAddMethodChange={ this._onAddMethodChange }
                                onExtensionTypeChange={ this._onExtensionTypeChange }
                                destinationDataSource={ this.state.destinationDataSource }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG3886"}) } key="2">
                            <Media
                                form={ form }
                                settings={ this.state.settings }
                                currentEditId={ this.state.currentEditId }
                                extensionType={ this.state.extension_type }
                                onExtensionTypeChange={ this._onExtensionTypeChange }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG106"}) } key="3">
                            <Feature
                                form={ form }
                                settings={ this.state.settings }
                                addMethod={ this.state.add_method }
                                mohNameList={ this.state.mohNameList }
                                currentEditId={ this.state.currentEditId }
                                extensionType={ this.state.extension_type }
                                onExtensionTypeChange={ this._onExtensionTypeChange }
                                destinationDataSource={ this.state.destinationDataSource }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG3288"}) } key="4" disabled={ this.state.add_method === 'batch' }>
                            <SpecificTime
                                form={ form }
                                settings={ this.state.settings }
                                userSettings={ this.state.userSettings }
                                currentEditId={ this.state.currentEditId }
                                extensionType={ this.state.extension_type }
                                onExtensionTypeChange={ this._onExtensionTypeChange }
                                destinationDataSource={ this.state.destinationDataSource }
                                timeConditionsOfficetime={ this.state.time_conditions_officetime }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG568"}) } key="5" disabled={ this.state.add_method === 'batch' }>
                            <FollowMe
                                form={ form }
                                settings={ this.state.settings }
                                mohNameList={ this.state.mohNameList }
                                currentEditId={ this.state.currentEditId }
                                extensionType={ this.state.extension_type }
                                onExtensionTypeChange={ this._onExtensionTypeChange }
                                destinationDataSource={ this.state.destinationDataSource }
                            />
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

ExtensionItem.propTypes = {}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(ExtensionItem)))

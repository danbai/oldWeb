'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { injectIntl } from 'react-intl'
import Title from '../../../views/title'
import { Form, Input, message, Tabs } from 'antd'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'

import Feature from './feature'
import BasicSettings from './basicSettings'
import SpecificTime from '../extension/specificTime'

const MAXLOCALNETWORK = 10
const TabPane = Tabs.TabPane

class UserExtension extends Component {
    constructor(props) {
        super(props)

        this.state = {
            activeKey: "1",
            settings: {},
            languages: [],
            userSettings: {},
            currentEditId: '',
            extension_type: '',
            settingsPrivilege: {},
            editTimeCondition: false,
            userSettingsPrivilege: {},
            time_conditions_officetime: [],
            mohNameList: ['default', 'ringbacktone_default'],
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
            }
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this._getInitData()
    }
    _getInitData = () => {
        let extensionId
        let extensionType
        let extensionEnd
        let extensionStart
        let settings = {}
        let userSettings = {}
        let settingsPrivilege = {}
        let userSettingsPrivilege = {}
        let extensionTypeUpperCase = ''

        let ivrList
        let queueList
        let vmgroupList
        let accountList
        let voicemailList
        let ringgroupList
        let extensionPrefSettings

        let languages = {}
        let extensionRange = []
        let destinationDataSource = {}
        let time_conditions_officetime = []
        let mohNameList = ['default', 'ringbacktone_default']
        let getList = [
                { 'getIVRList': '' },
                { 'getLanguage': '' },
                { 'getQueueList': '' },
                { 'getMOHNameList': '' },
                { 'getVMGroupList': '' },
                { 'getAccountList': '' },
                { 'getVoicemailList': '' },
                { 'getRingGroupList': '' },
                { 'getExtenPrefSettings': '' }
            ]

        const { formatMessage } = this.props.intl
        const disabled = formatMessage({id: "LANG273"})

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listAccount',
                options: 'extension,account_type'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const account = response.account || []

                    extensionId = account[0] ? account[0].extension : ''
                    extensionTypeUpperCase = account[0] ? account[0].account_type.slice(0, 3) : ''
                    extensionType = extensionTypeUpperCase.toLowerCase()
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
                extension: extensionId,
                action: `get${extensionTypeUpperCase}Account`
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    settings = response.extension || {}
                    settingsPrivilege = response.privilege_info || {}

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
                    const response = res.response || {}

                    userSettings = response.user_name || {}
                    userSettingsPrivilege = response.privilege_info || {}

                    $.ajax({
                        type: 'post',
                        async: false,
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

                                time_conditions_officetime = ary
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

        this.setState({
            settings: settings,
            userSettings: userSettings,
            currentEditId: extensionId,
            extension_type: extensionType,
            settingsPrivilege: settingsPrivilege,
            userSettingsPrivilege: userSettingsPrivilege,
            time_conditions_officetime: time_conditions_officetime
        })

        $.ajax({
            type: 'GET',
            // async: false,
            url: api.apiHost + 'action=combineAction&data=' + JSON.stringify(getList),
            success: function(res) {
                let bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    let response = res.response || {}

                    ivrList = response.getIVRList.ivr || []
                    queueList = response.getQueueList.queues || []
                    vmgroupList = response.getVMGroupList.vmgroups || []
                    accountList = response.getAccountList.extension || []
                    voicemailList = response.getVoicemailList.extension || []
                    ringgroupList = response.getRingGroupList.ringgroups || []
                    extensionPrefSettings = response.getExtenPrefSettings.extension_pref_settings || {}

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
                    mohNameList = response.getMOHNameList.moh_name || []
                    extensionEnd = extensionPrefSettings.ue_end
                    extensionStart = extensionPrefSettings.ue_start
                    extensionRange = [(extensionStart ? parseInt(extensionStart) : undefined), (extensionEnd ? parseInt(extensionEnd) : undefined)]
                    extensionRange.push(extensionPrefSettings.disable_extension_ranges, extensionPrefSettings.rand_password, extensionPrefSettings.weak_password)

                    this.setState({
                        languages: languages,
                        mohNameList: mohNameList,
                        extensionRange: extensionRange,
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
                        }
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
    _handleCancel = (e) => {
        this.props.form.resetFields()
        this._getInitData()
        // browserHistory.push('/user-basic-information/userExtension')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const getFieldInstance = form.getFieldInstance

        form.validateFields({ force: true }, (err, values) => {
            if (!err) {
                let action = {
                        dndwhitelist: [],
                        fwdwhitelist: []
                    },
                    time_condition = [],
                    type = this.state.extension_type,
                    fax = values.faxmode ? values.faxmode : ''

                action.action = `update${type.toUpperCase()}Account`

                _.map(values, function(value, key) {
                    let fieldInstance = getFieldInstance(key)

                    if (key === 'enable_cc' || key === 'callbarging_monitor' || key === 'use_callee_dod_on_fwd_rb' ||
                        key === 'mode' || key === 'out_limitime' || key === 'maximumTime' ||
                        key === 'whiteLists' || key === 'fwdwhiteLists' || key === 'localNetworks' ||
                        key === 'presence_dst_account_voicemail' || key === 'presence_dst_external_number' ||
                        key === 'room' || key === 'faxmode' || key === 'cc_mode' || key === 'batch_number' ||
                        key === 'cc_max_agents' || key === 'cc_max_monitors' || key === 'custom_alert_info' ||
                        key === 'user_password' || key === 'phone_number' || key === 'email' || key === 'language' ||
                        key === 'extension_type' || key === 'fullname' || key === 'first_name' || key === 'last_name') {
                        return false
                    }

                    if (key.indexOf('fm_') === 0) {
                        return false
                    }

                    if (key.indexOf('ps_') === 0) {
                        return false
                    }

                    if (key.indexOf('whitelist') === 0) {
                        if (value) {
                            action.dndwhitelist.push(value)
                        }

                        return false
                    }

                    if (key.indexOf('tc_') === 0) {
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
                    let time_condition = []

                    _.map(values.tc_time_condition, (data, index) => {
                        let obj = _.clone(data)

                        delete obj['time']
                        delete obj['condition_index']

                        obj['sequence'] = 0

                        time_condition.push(obj)
                    })

                    action.time_condition = JSON.stringify(time_condition)
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
                    // for (var i = 1; i <= MAXLOCALNETWORK; i++) {
                    //     if (!action.hasOwnProperty('local_network' + i)) {
                    //         action['local_network' + i] = ''
                    //     }
                    // }

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

                // if (values.maximumTime) {
                //     action['limitime'] = parseInt(values.maximumTime) * 1000
                // } else {
                //     action['limitime'] = ''
                // }

                message.loading(formatMessage({ id: "LANG826" }), 0)

                if (!$.isEmptyObject(this.state.privilegeInfo)) {
                    action = UCMGUI.getPrivilegeAction(action, this.state.privilegeInfo)
                }

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
                            let userAction = {
                                    'action': 'updateUser',
                                    'user_id': this.state.userSettings.user_id,
                                    'last_name': this.state.userSettings.last_name,
                                    'first_name': this.state.userSettings.first_name,
                                    'language': (values.language && values.language !== 'default') ? values.language : ''
                                }

                            if (!$.isEmptyObject(this.state.userPrivilegeInfo)) {
                                userAction = UCMGUI.getPrivilegeAction(userAction, this.state.userPrivilegeInfo)
                            }

                            $.ajax({
                                type: 'json',
                                method: "post",
                                url: api.apiHost,
                                data: userAction,
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                    if (bool) {
                                        message.destroy()
                                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>, 2)
                                    }
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }
    _onChangeTabs = (activeKey) => {
        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (err) {
                this.setState({ 
                    activeKey: this.state.activeKey
                })
                return
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
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        const title = formatMessage({id: "LANG4094"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: formatMessage({id: "LANG82"}),
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
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChangeTabs }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG2217"}) } key="1">
                            <BasicSettings
                                form={ form }
                                settings={ this.state.settings }
                                languages={ this.state.languages }
                                userSettings={ this.state.userSettings }
                                currentEditId={ this.state.currentEditId }
                                extensionType={ this.state.extension_type }
                                extensionRange={ this.state.extensionRange }
                                settingsPrivilege={ this.state.settingsPrivilege }
                                userSettingsPrivilege={ this.state.userSettingsPrivilege }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG106"}) } key="3">
                            <Feature
                                form={ form }
                                settings={ this.state.settings }
                                mohNameList={ this.state.mohNameList }
                                currentEditId={ this.state.currentEditId }
                                extensionType={ this.state.extension_type }
                                settingsPrivilege={ this.state.settingsPrivilege }
                                destinationDataSource={ this.state.destinationDataSource }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG3288"}) } key="4">
                            <SpecificTime
                                form={ form }
                                settings={ this.state.settings }
                                userSettings={ this.state.userSettings }
                                currentEditId={ this.state.currentEditId }
                                extensionType={ this.state.extension_type }
                                destinationDataSource={ this.state.destinationDataSource }
                                timeConditionsOfficetime={ this.state.time_conditions_officetime }
                            />
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

UserExtension.propTypes = {}

export default Form.create()(injectIntl(UserExtension))
'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Modal, Row, Select, Tabs, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const TabPane = Tabs.TabPane

class QueueItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            queueItem: {},
            memberList: [],
            targetKeys: [],
            queueRange: [],
            numberList: [],
            activeKey: '1',
            vmPromptList: [],
            alertinfo: 'none',
            custom_alert_info: '',
            vq_switch: false,
            vq_mode: 'periodic',
            destination_value: '',
            announce_position: false,
            destination_type: 'hangup',
            destination_value_prompt: '',
            destination_voice_enable: false,
            destination_type_prompt: 'account',
            mohNameList: ['default', 'ringbacktone_default'],
            destinationListDataSource: {
                'account': [],
                'voicemail': [],
                'queue': [],
                'ringgroup': [],
                'vmgroup': [],
                'ivr': [],
                'external_number': [],
                'hangup': []
            },
            portExtensionList: [],
            queueNameList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
        this._getPortExtension()
    }
    _checkQueueTimeout = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const ringtime = getFieldValue('ringtime')

        if (value && parseInt(value) <= parseInt(ringtime)) {
            callback(formatMessage({id: "LANG4024"}, {0: formatMessage({id: "LANG4083"}), 1: formatMessage({id: "LANG1184"})}))
        } else {
            callback()
        }
    }
    _checkVoicePromptTime = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const ringtime = getFieldValue('ringtime')

        if (value && parseInt(value) <= parseInt(ringtime)) {
            callback(formatMessage({id: "LANG4024"}, {0: formatMessage({id: "LANG4580"}), 1: formatMessage({id: "LANG1184"})}))
        } else {
            callback()
        }
    }
    _checkNumber = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else if (value && _.indexOf(this.state.portExtensionList, parseInt(value)) > -1) {
            callback(formatMessage({id: "LANG2172"}, {0: formatMessage({id: "LANG2144"}), 1: formatMessage({id: "LANG2142"})}))
        } else {
            callback()
        }
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.queueNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _endsWith = (str, a) => {
        return str.length >= a.length && str.substring(str.length - a.length) === a
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.label.indexOf(inputValue) > -1)
    }
    _generateNewExt = () => {
        let queueRange = this.state.queueRange
        let numberList = this.state.numberList

        let i = queueRange[0]
        let endExt = queueRange[1]

        for (i; i <= endExt; i++) {
            if (numberList.indexOf(i.toString()) === -1) {
                return i
            }
        }
    }
    _getPortExtension = () => {
        let portExtensionList = []

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                action: "getFeatureCodes"
            },
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    var featureSettings = data.response.feature_settings,
                        parkext = featureSettings.parkext,
                        parkpos = featureSettings.parkpos.split('-')

                    portExtensionList.push(parseInt(parkext, 10))

                    for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                        portExtensionList.push(i)
                    }
                }
            }
        })
        this.setState({
            portExtensionList: portExtensionList
        })
    }
    _getInitData = () => {
        let queueNameList = []
        let queueItem = {}
        let targetKeys = []
        let memberList = []
        let mohNameList = []
        let extgroupObj = {}
        let extgroupList = []
        let vmPromptList = []
        let alertinfo = 'none'
        let existedAgentList = []
        let custom_alert_info = ''
        let vq_switch = false
        let vq_mode = 'periodic'
        let destination_value = ''
        let announce_position = false
        let destination_type = 'hangup'
        let destination_value_prompt = ''
        let destination_voice_enable = false
        let destination_type_prompt = 'account'
        let destinationListDataSource = {}

        const queueId = this.props.params.id
        const { formatMessage } = this.props.intl
        const disabled = formatMessage({id: "LANG273"})

        let queueRange = UCMGUI.isExist.getRange('queue', formatMessage)
        let numberList = UCMGUI.isExist.getList('getNumberList', formatMessage)
        let account = UCMGUI.isExist.getList('getAccountList', formatMessage)
        let voicemail = UCMGUI.isExist.getList('getVoicemailList', formatMessage)
        let queue = UCMGUI.isExist.getList('getQueueList', formatMessage)
        let ringgroup = UCMGUI.isExist.getList('getRinggroupList', formatMessage)
        let vmgroup = UCMGUI.isExist.getList('getVMgroupList', formatMessage)
        let ivr = UCMGUI.isExist.getList('getIVRList', formatMessage)

        account = account.map(function(item) {
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

        voicemail = voicemail.map(function(item) {
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

        queue = queue.map(function(item) {
                    return {
                            key: item.extension,
                            value: item.extension,
                            label: item.queue_name
                        }
                })

        queue = _.filter(queue, (data) => { return data.value !== queueId })

        queue.map(function(item) {
            queueNameList.push(item.label)
        })

        numberList = _.filter(numberList, (data) => { return data !== queueId })

        ringgroup = ringgroup.map(function(item) {
                    return {
                            key: item.extension,
                            value: item.extension,
                            label: item.ringgroup_name
                        }
                })

        vmgroup = vmgroup.map(function(item) {
                    return {
                            key: item.extension,
                            value: item.extension,
                            label: item.vmgroup_name
                        }
                })

        ivr = ivr.map(function(item) {
                    return {
                            key: item.ivr_id,
                            value: item.ivr_id,
                            label: item.ivr_name
                        }
                })

        memberList = _.clone(account)

        destinationListDataSource = {
            account: account,
            voicemail: voicemail,
            queue: queue,
            ringgroup: ringgroup,
            vmgroup: vmgroup,
            ivr: ivr,
            external_number: [],
            hangup: []
        }

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                sord: 'asc',
                sidx: 'group_id',
                action: 'listExtensionGroup'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    let membersLabel = formatMessage({id: "LANG128"})
                    let extgroupLabel = formatMessage({id: "LANG2714"})

                    extgroupList = response.extension_group || []

                    _.map(extgroupList, (item) => {
                        let members = item.members,
                            membersList = members ? members.split(',').sort() : [],
                            length = membersList.length,
                            obj = {
                                    key: item.group_id,
                                    value: item.group_id,
                                    members: membersList.join(),
                                    title: length + ' ' + membersLabel + ': ' + membersList.join(),
                                    label: extgroupLabel + ' -- ' + item.group_name + ' -- ' + length + ' ' + membersLabel
                                }

                        memberList.push(obj)
                        extgroupObj[item.group_id] = obj
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
                sord: 'asc',
                sidx: 'extension',
                action: 'listQueue',
                options: 'extension,members'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const callQueueList = response.queue || []

                    _.map(callQueueList, (item) => {
                        let members = item.members
                        let extension = item.extension

                        if (members && (extension !== queueId)) {
                            members = members.split(',')

                            _.map(members, (data) => {
                                let group = extgroupObj[data]

                                if (group) {
                                    let groupMembers = group.members

                                    if (groupMembers) {
                                        groupMembers = groupMembers.split(',')

                                        _.map(groupMembers, (value) => {
                                            if (value && _.indexOf(existedAgentList, value) === -1) {
                                                existedAgentList.push(value)
                                            }
                                        })
                                    }
                                } else {
                                    if (_.indexOf(existedAgentList, data) === -1) {
                                        existedAgentList.push(data)
                                    }
                                }
                            })
                        }
                    })

                    existedAgentList.sort()
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
                action: 'getMohNameList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    mohNameList = response.moh_name || []
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
                page: 1,
                sidx: 'd',
                sord: 'asc',
                type: 'ivr',
                action: 'listFile',
                filter: JSON.stringify({
                    'list_dir': 0,
                    'list_file': 1,
                    'file_suffix': ['mp3', 'wav', 'gsm', 'ulaw', 'alaw']
                })
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let ivr = data.response.ivr,
                        options = {
                            val: 'n',
                            text: 'n'
                        }

                    vmPromptList = this._transVoicemailPromptData(ivr, options, (arr) => {
                        for (let i = 0; i < arr.length; i++) {
                            arr[i].val = 'record/' + this._removeSuffix(arr[i].val)
                        }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (queueId) {
            $.ajax({
                async: false,
                type: 'post',
                url: api.apiHost,
                data: {
                    queue: queueId,
                    action: 'getQueue'
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        queueItem = res.response.queue || {}

                        _.map(queueItem, (value, key) => {
                            if (value === null) {
                                queueItem[key] = ''
                            } else {
                                queueItem[key] = value
                            }
                        })

                        vq_mode = queueItem.vq_mode
                        vq_switch = (queueItem.vq_switch === 'yes')
                        announce_position = (queueItem.announce_position === 'yes')
                        destination_voice_enable = (queueItem.destination_voice_enable === 'yes')

                        destination_type = queueItem.destination_type_t
                        destination_type_prompt = queueItem.destination_type_v

                        if (destination_type === 'voicemail') {
                            destination_value = queueItem['vm_extension_t']
                        } else if (destination_type === 'queue') {
                            destination_value = queueItem['queue_dest_t']
                        } else {
                            destination_value = queueItem[destination_type + '_t']
                        }

                        if (destination_type_prompt === 'voicemail') {
                            destination_value_prompt = queueItem['vm_extension_v']
                        } else if (destination_type_prompt === 'queue') {
                            destination_value_prompt = queueItem['queue_dest_v']
                        } else {
                            destination_value_prompt = queueItem[destination_type_prompt + '_v']
                        }

                        targetKeys = queueItem.members ? queueItem.members.split(',') : []

                        alertinfo = queueItem.alertinfo

                        if (alertinfo && alertinfo.indexOf('custom') > -1) {
                            custom_alert_info = alertinfo.slice(7)
                            alertinfo = 'custom'
                        } else {
                            alertinfo = alertinfo ? alertinfo : 'none'
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        this.setState({
            vq_mode: vq_mode,
            alertinfo: alertinfo,
            vq_switch: vq_switch,
            queueItem: queueItem,
            memberList: memberList,
            queueRange: queueRange,
            numberList: numberList,
            targetKeys: targetKeys,
            extgroupObj: extgroupObj,
            extgroupList: extgroupList,
            vmPromptList: vmPromptList,
            queueNameList: queueNameList,
            existedAgentList: existedAgentList,
            custom_alert_info: custom_alert_info,
            announce_position: announce_position,
            destination_value: destination_value,
            destination_value_prompt: destination_value_prompt,
            destination_voice_enable: destination_voice_enable,
            destinationListDataSource: destinationListDataSource,
            mohNameList: mohNameList ? mohNameList : ['default', 'ringbacktone_default'],
            destination_type: destination_type ? destination_type.replace(/_t/g, '') : 'hangup',
            destination_type_prompt: destination_type_prompt ? destination_type_prompt.replace(/_t/g, '') : 'account'
        })
    }
    _gotoPromptOk = () => {
        browserHistory.push('/pbx-settings/voicePrompt/2')
    }
    _gotoPrompt = () => {
        const { formatMessage } = this.props.intl
        const __this = this

        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG28"})})}} ></span>,
            onOk() {
                __this._gotoPromptOk()
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/callQueue')
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

        const form = this.props.form
        const { formatMessage } = this.props.intl
        const getFieldInstance = form.getFieldInstance

        let queueId = this.props.params.id
        let existedAgentList = this.state.existedAgentList
        let existedAgentLength = existedAgentList.length
        let featureLimits = JSON.parse(localStorage.featureLimits)
        let queueMemberMax = featureLimits.callqueue_members ? featureLimits.callqueue_members : 100

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        form.validateFields({ force: true }, (err, values) => {
            if (!err) {
                if (this.state.targetKeys.length) {
                    let selectAgentList = []
                    let selectAgentLength = []
                    let targetKeys = this.state.targetKeys
                    let extgroupObj = this.state.extgroupObj

                    _.map(targetKeys, (data) => {
                        let group = extgroupObj[data]

                        if (group) {
                            let groupMembers = group.members

                            if (groupMembers) {
                                groupMembers = groupMembers.split(',')

                                _.map(groupMembers, (value) => {
                                    if (value && (_.indexOf(existedAgentList, value) === -1) && (_.indexOf(selectAgentList, value) === -1)) {
                                        selectAgentList.push(value)
                                    }
                                })
                            }
                        } else {
                            if ((_.indexOf(existedAgentList, data) === -1) && (_.indexOf(selectAgentList, data) === -1)) {
                                selectAgentList.push(data)
                            }
                        }
                    })

                    if (selectAgentList.length + existedAgentLength > queueMemberMax) {
                        existedAgentLength = existedAgentLength ? existedAgentLength.toString() : '0'
                        selectAgentLength = selectAgentList.length ? selectAgentList.length.toString() : '0'

                        let errorMessageMax = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5651"}, {
                                    0: queueMemberMax, 1: existedAgentLength, 2: selectAgentLength
                                })}}></span>

                        message.destroy()
                        message.error(errorMessageMax, 2)

                        return
                    }
                }

                let action = {}

                if (this.props.params.id) {
                    action.queue = queueId
                    action.action = 'updateQueue'
                } else {
                    action.action = 'addQueue'
                }

                _.map(values, function(value, key) {
                    let fieldInstance = getFieldInstance(key)

                    if (key === 'destination_type' || key === 'destination_value' ||
                        key === 'destination_type_prompt' || key === 'destination_value_prompt' || key === 'custom_alert_info') {
                        return false
                    }

                    action[key] = (value !== undefined ? UCMGUI.transCheckboxVal(value) : '')
                })

                action.members = this.state.targetKeys.join(',')

                action.destination_type_t = values.destination_type
                action.destination_type_v = values.destination_type_prompt

                if (action.custom_prompt === 'none') {
                    action.custom_prompt = ''
                }

                if (action.queue_chairman === 'none') {
                    action.queue_chairman = ''
                }

                _.map(this.state.destinationListDataSource, (data, key) => {
                    if (key === 'hangup' || key === 'external_number') {
                        return
                    }

                    if (key === values.destination_type) {
                        if (key === 'queue') {
                            action['queue_dest_t'] = values.destination_value
                        } else if (key === 'voicemail') {
                            action['vm_extension_t'] = values.destination_value
                        } else {
                            action[key + '_t'] = values.destination_value
                        }
                    } else {
                        if (key === 'queue') {
                            action['queue_dest_t'] = ''
                        } else if (key === 'voicemail') {
                            action['vm_extension_t'] = ''
                        } else {
                            action[key + '_t'] = ''
                        }
                    }

                    if (key === values.destination_type_prompt) {
                        if (key === 'queue') {
                            action['queue_dest_v'] = values.destination_value_prompt
                        } else if (key === 'voicemail') {
                            action['vm_extension_v'] = values.destination_value_prompt
                        } else {
                            action[key + '_v'] = values.destination_value_prompt
                        }
                    } else {
                        if (key === 'queue') {
                            action['queue_dest_v'] = ''
                        } else if (key === 'voicemail') {
                            action['vm_extension_v'] = ''
                        } else {
                            action[key + '_v'] = ''
                        }
                    }
                })

                if (values.alertinfo === 'none') {
                    action['alertinfo'] = ''
                } else if (values.alertinfo === 'custom') {
                    action['alertinfo'] = 'custom_' + values.custom_alert_info
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
        })
    }
    _onChangeAlertInfo = (value) => {
        this.setState({
            alertinfo: value
        })
    }
    _onChangeAnnouncePosition = (e) => {
        this.setState({
            announce_position: e.target.checked
        })
    }
    _onChangeDesType = (value) => {
        let form = this.props.form
        let destinationList = this.state.destinationListDataSource[value]

        this.setState({
                destination_type: value,
                destination_value: destinationList.length ? destinationList[0].value : ""
            }, () => {
                form.setFieldsValue({
                    external_number_t: '',
                    destination_value: destinationList.length ? destinationList[0].value : ""
                })
            })
    }
    _onChangeDesTypePrompr = (value) => {
        let form = this.props.form
        let destinationList = this.state.destinationListDataSource[value]

        this.setState({
                destination_type_prompt: value,
                destination_value_prompt: destinationList.length ? destinationList[0].value : ""
            }, () => {
                form.setFieldsValue({
                    external_number_v: '',
                    destination_value_prompt: destinationList.length ? destinationList[0].value : ""
                })
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

            this.setState({
                activeKey
            })
        })
    }
    _onChangeVoiceEnable = (e) => {
        this.setState({
            destination_voice_enable: e.target.checked
        })
    }
    _onChangeVQMode = (value) => {
        this.setState({
            vq_mode: value
        })
    }
    _onChangeVQSwitch = (e) => {
        this.setState({
            vq_switch: e.target.checked
        })
    }
    _removeSuffix = (filename) => {
        let name = filename.toLocaleLowerCase(),
            file_suffix = ['.mp3', '.wav', '.gsm', '.ulaw', '.alaw']

        for (let i = 0; i < file_suffix.length; i++) {
            let num = name.lastIndexOf(file_suffix[i])

            if (num !== -1 && this._endsWith(name, file_suffix[i])) {
                filename = filename.substring(0, num)

                return filename
            }
        }
    }
    _renderItem = (item) => {
        const customLabel = (
                <span className={ item.out_of_service === 'yes' ? 'out-of-service' : '' } title={ item.title }>
                    { item.label }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.value   // for title and filter matching
            }
    }
    _transVoicemailPromptData = (res, options, cb) => {
        let arr = [],
            val = options.val,
            text = options.text

        if ($.isArray(res)) {
            for (let i = 0; i < res.length; i++) {
                let obj = {}

                obj['val'] = res[i][val]
                obj['text'] = res[i][text]

                arr.push(obj)
            }

            if (cb && typeof cb === "function") {
                cb(arr)
            }

            return arr
        }
    }
    render() {
        const settings = this.state.queueItem
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        const formItemSpecialLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 }
        }

        const formItemRowLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG608"}, {
                    0: this.props.params.id
                })
                : formatMessage({id: "LANG747"}))

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
                <Form className="form-contain-tab">
                    <Tabs
                        onChange={ this._onChangeTabs }
                        activeKey={ this.state.activeKey }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG2217"}) } key="1">
                            <div className="content">
                                <div className="ant-form">
                                    <Row>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG3"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1171" /> }>
                                                            <span>{ formatMessage({id: "LANG5601"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('extension', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: true,
                                                        message: formatMessage({id: 'LANG2150'})
                                                    }, {
                                                        validator: this._checkNumber
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 10)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.minlength(data, value, callback, formatMessage, 2)
                                                        }
                                                    }],
                                                    initialValue: this.props.params.id ? this.props.params.id + '' : this._generateNewExt()
                                                })(
                                                    <Input maxLength={ 10 } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1180" /> }>
                                                            <span>{ formatMessage({id: "LANG135"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('queue_name', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: true,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: this._checkName
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
                                                    }],
                                                    initialValue: settings.queue_name
                                                })(
                                                    <Input maxLength={ 25 } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1183" /> }>
                                                            <span>{ formatMessage({id: "LANG132"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('strategy', {
                                                    rules: [],
                                                    initialValue: settings.strategy ? settings.strategy : 'ringall'
                                                })(
                                                    <Select>
                                                        <Option value='ringall'>{ formatMessage({id: "LANG1197"}) }</Option>
                                                        <Option value='linear'>{ formatMessage({id: "LANG1198"}) }</Option>
                                                        <Option value='leastrecent'>{ formatMessage({id: "LANG1199"}) }</Option>
                                                        <Option value='fewestcalls'>{ formatMessage({id: "LANG1200"}) }</Option>
                                                        <Option value='random'>{ formatMessage({id: "LANG1201"}) }</Option>
                                                        <Option value='rrmemory'>{ formatMessage({id: "LANG1202"}) }</Option>
                                                    </Select>
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1179" /> }>
                                                            <span>{ formatMessage({id: "LANG1178"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('musicclass', {
                                                    rules: [],
                                                    initialValue: settings.musicclass ? settings.musicclass : 'default'
                                                })(
                                                    <Select>
                                                        {
                                                            this.state.mohNameList.map(function(value) {
                                                                return <Option
                                                                            key={ value }
                                                                            value={ value }
                                                                        >
                                                                            { value }
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
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1177" /> }>
                                                            <span>{ formatMessage({id: "LANG1176"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('maxlen', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: true,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 2)
                                                        }
                                                    }],
                                                    initialValue: (settings.maxlen || settings.maxlen === 0) ? settings.maxlen + '' : '0'
                                                })(
                                                    <Input maxLength={ 2 } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1188" /> }>
                                                            <span>{ formatMessage({id: "LANG1189"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('wrapuptime', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: true,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 3)
                                                        }
                                                    }],
                                                    initialValue: (settings.wrapuptime || settings.wrapuptime === 0) ? settings.wrapuptime + '' : '10'
                                                })(
                                                    <Input maxLength={ 3 } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4798" /> }>
                                                            <span>{ formatMessage({id: "LANG4797"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('retry', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: true,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.minlength(data, value, callback, formatMessage, 1)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 3)
                                                        }
                                                    }],
                                                    initialValue: (settings.retry || settings.retry === 0) ? settings.retry + '' : '5'
                                                })(
                                                    <Input maxLength={ 3 } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1185" /> }>
                                                            <span>{ formatMessage({id: "LANG1184"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('ringtime', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: true,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 3)
                                                        }
                                                    }],
                                                    initialValue: (settings.ringtime || settings.ringtime === 0) ? settings.ringtime + '' : '30'
                                                })(
                                                    <Input maxLength={ 3 } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2544" /> }>
                                                            <span>{ formatMessage({id: "LANG2543"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('auto_record', {
                                                    rules: [],
                                                    valuePropName: 'checked',
                                                    initialValue: settings.auto_record === 'yes'
                                                })(
                                                    <Checkbox />
                                                ) }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG1186"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <Col span={ 24 }>
                                            <FormItem
                                                { ...formItemRowLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1187" /> }>
                                                            <span>{ formatMessage({id: "LANG1186"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('queue_timeout', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.range(data, value, callback, formatMessage, 0, 2000)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 3)
                                                        }
                                                    }, {
                                                        // validator: this._checkQueueTimeout
                                                    }],
                                                    initialValue: (settings.queue_timeout || settings.queue_timeout === 0) ? settings.queue_timeout + '' : '0'
                                                })(
                                                    <Input maxLength={ 3 } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 24 }>
                                            <Col span={ 12 }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={(
                                                        <span>
                                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3751" /> }>
                                                                <span>{ formatMessage({id: "LANG1535"}) }</span>
                                                            </Tooltip>
                                                        </span>
                                                    )}
                                                >
                                                    { getFieldDecorator('destination_type', {
                                                        rules: [],
                                                        initialValue: this.state.destination_type
                                                    })(
                                                        <Select onChange={ this._onChangeDesType }>
                                                            <Option value='account'>{ formatMessage({id: "LANG85"}) }</Option>
                                                            <Option value='voicemail'>{ formatMessage({id: "LANG90"}) }</Option>
                                                            <Option value='queue'>{ formatMessage({id: "LANG91"}) }</Option>
                                                            <Option value='ringgroup'>{ formatMessage({id: "LANG600"}) }</Option>
                                                            <Option value='vmgroup'>{ formatMessage({id: "LANG89"}) }</Option>
                                                            <Option value='ivr'>{ formatMessage({id: "LANG19"}) }</Option>
                                                            <Option value='external_number'>{ formatMessage({id: "LANG3458"}) }</Option>
                                                            <Option value='hangup'>{ formatMessage({id: "LANG3007"}) }</Option>
                                                        </Select>
                                                    ) }
                                                </FormItem>
                                            </Col>
                                            <Col
                                                span={ 6 }
                                                className={ this.state.destination_type !== 'external_number' && this.state.destination_type !== 'hangup' ? 'display-block' : 'hidden' }
                                            >
                                                <FormItem>
                                                    { getFieldDecorator('destination_value', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: (this.state.destination_type !== 'external_number' && this.state.destination_type !== 'hangup'),
                                                            message: formatMessage({id: "LANG2150"})
                                                        }],
                                                        initialValue: this.state.destination_value
                                                    })(
                                                        <Select>
                                                            {
                                                                this.state.destinationListDataSource[this.state.destination_type.replace(/_t/g, '')].map(function(obj) {
                                                                        return <Option
                                                                                    key={ obj.key }
                                                                                    value={ obj.value }
                                                                                    className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                                                    { obj.label }
                                                                                </Option>
                                                                    })
                                                            }
                                                        </Select>
                                                    ) }
                                                </FormItem>
                                            </Col>
                                            <Col
                                                span={ 6 }
                                                className={ this.state.destination_type === 'external_number' ? 'display-block' : 'hidden' }
                                            >
                                                <FormItem>
                                                    { getFieldDecorator('external_number_t', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.destination_type === 'external_number',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.destination_type === 'external_number' ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.destination_type === 'external_number' ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                                            }
                                                        }],
                                                        initialValue: settings.external_number_t
                                                    })(
                                                        <Input maxLength={ 32 } />
                                                    ) }
                                                </FormItem>
                                            </Col>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG4580"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <Col span={ 24 }>
                                            <FormItem
                                                { ...formItemRowLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG274" /> }>
                                                            <span>{ formatMessage({id: "LANG274"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('destination_voice_enable', {
                                                    rules: [],
                                                    valuePropName: 'checked',
                                                    initialValue: this.state.destination_voice_enable
                                                })(
                                                    <Checkbox onChange={ this._onChangeVoiceEnable } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 24 }>
                                            <FormItem
                                                { ...formItemRowLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4581" /> }>
                                                            <span>{ formatMessage({id: "LANG4580"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('voice_prompt_time', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: true,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        // validator: this._checkVoicePromptTime
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.range(data, value, callback, formatMessage, 20, 2000)
                                                        }
                                                    }],
                                                    initialValue: (settings.voice_prompt_time || settings.voice_prompt_time === 0) ? settings.voice_prompt_time + '' : '60'
                                                })(
                                                    <Input disabled={ !this.state.destination_voice_enable } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 24 }>
                                            <Col span={ 12 }>
                                                <FormItem
                                                    { ...formItemSpecialLayout }
                                                    label={(
                                                        <span>
                                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5060" /> }>
                                                                <span>{ formatMessage({id: "LANG28"}) }</span>
                                                            </Tooltip>
                                                        </span>
                                                    )}
                                                >
                                                    <Col span={ 16 }>
                                                        { getFieldDecorator('custom_prompt', {
                                                            rules: [],
                                                            initialValue: settings.custom_prompt ? settings.custom_prompt : 'none'
                                                        })(
                                                            <Select disabled={ !this.state.destination_voice_enable }>
                                                                <Option value="none">{ formatMessage({id: "LANG133"}) }</Option>
                                                                {
                                                                    this.state.vmPromptList.map(function(data, index) {
                                                                        return <Option
                                                                                    key={ data.val }
                                                                                    value={ data.val }
                                                                                >
                                                                                    { data.text }
                                                                                </Option>
                                                                    })
                                                                }
                                                            </Select>
                                                        ) }
                                                    </Col>
                                                    <Col span={ 6 } offset={ 2 }>
                                                        <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                                                    </Col>
                                                </FormItem>
                                            </Col>
                                        </Col>
                                        <Col span={ 24 }>
                                            <Col span={ 12 }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={(
                                                        <span>
                                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3751" /> }>
                                                                <span>{ formatMessage({id: "LANG1535"}) }</span>
                                                            </Tooltip>
                                                        </span>
                                                    )}
                                                >
                                                    { getFieldDecorator('destination_type_prompt', {
                                                        rules: [],
                                                        initialValue: this.state.destination_type_prompt
                                                    })(
                                                        <Select
                                                            onChange={ this._onChangeDesTypePrompr }
                                                            disabled={ !this.state.destination_voice_enable }
                                                        >
                                                            <Option value='account'>{ formatMessage({id: "LANG85"}) }</Option>
                                                            <Option value='voicemail'>{ formatMessage({id: "LANG90"}) }</Option>
                                                            <Option value='queue'>{ formatMessage({id: "LANG91"}) }</Option>
                                                            <Option value='ringgroup'>{ formatMessage({id: "LANG600"}) }</Option>
                                                            <Option value='vmgroup'>{ formatMessage({id: "LANG89"}) }</Option>
                                                            <Option value='ivr'>{ formatMessage({id: "LANG19"}) }</Option>
                                                            <Option value='external_number'>{ formatMessage({id: "LANG3458"}) }</Option>
                                                        </Select>
                                                    ) }
                                                </FormItem>
                                            </Col>
                                            <Col
                                                span={ 6 }
                                                className={ this.state.destination_type_prompt !== 'external_number' ? 'display-block' : 'hidden' }
                                            >
                                                <FormItem>
                                                    { getFieldDecorator('destination_value_prompt', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: (this.state.destination_voice_enable && this.state.destination_type_prompt !== 'external_number'),
                                                            message: formatMessage({id: "LANG2150"})
                                                        }],
                                                        initialValue: this.state.destination_value_prompt
                                                    })(
                                                        <Select disabled={ !this.state.destination_voice_enable }>
                                                            {
                                                                this.state.destinationListDataSource[this.state.destination_type_prompt.replace(/_t/g, '')].map(function(obj) {
                                                                        return <Option
                                                                                    key={ obj.key }
                                                                                    value={ obj.value }
                                                                                    className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                                                    { obj.label }
                                                                                </Option>
                                                                    })
                                                            }
                                                        </Select>
                                                    ) }
                                                </FormItem>
                                            </Col>
                                            <Col
                                                span={ 6 }
                                                className={ this.state.destination_type_prompt === 'external_number' ? 'display-block' : 'hidden' }
                                            >
                                                <FormItem>
                                                    { getFieldDecorator('external_number_v', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.destination_type_prompt === 'external_number',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.destination_type_prompt === 'external_number' ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.destination_type_prompt === 'external_number' ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                                            }
                                                        }],
                                                        initialValue: settings.external_number_v
                                                    })(
                                                        <Input maxLength={ 32 } disabled={ !this.state.destination_voice_enable } />
                                                    ) }
                                                </FormItem>
                                            </Col>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG542"}) } key="2">
                            <div className="content">
                                <div className="ant-form">
                                    <Row>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG5449"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5309" /> }>
                                                            <span>{ formatMessage({id: "LANG5308"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('vq_switch', {
                                                    rules: [],
                                                    valuePropName: 'checked',
                                                    initialValue: this.state.vq_switch
                                                })(
                                                    <Checkbox onChange={ this._onChangeVQSwitch } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5311" /> }>
                                                            <span>{ formatMessage({id: "LANG5310"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('vq_mode', {
                                                    rules: [],
                                                    initialValue: this.state.vq_mode
                                                })(
                                                    <Select disabled={ !this.state.vq_switch } onChange={ this._onChangeVQMode }>
                                                        <Option value="periodic">{ formatMessage({id: "LANG5317"}) }</Option>
                                                        <Option value="digit">{ formatMessage({id: "LANG5316"}) }</Option>
                                                    </Select>
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5313" /> }>
                                                            <span>{ formatMessage({id: "LANG5312"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('vq_periodic', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.range(data, value, callback, formatMessage, 5, 2000)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 64)
                                                        }
                                                    }],
                                                    initialValue: (settings.vq_periodic || settings.vq_periodic === 0) ? settings.vq_periodic + '' : '20'
                                                })(
                                                    <Input maxLength={ 64 } disabled={ !this.state.vq_switch || (this.state.vq_mode === 'digit') } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5315" /> }>
                                                            <span>{ formatMessage({id: "LANG5314"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('vq_outprefix', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 20)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                                        }
                                                    }],
                                                    initialValue: settings.vq_outprefix
                                                })(
                                                    <Input maxLength={ 20 } disabled={ !this.state.vq_switch } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG5458"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5446" /> }>
                                                            <span>{ formatMessage({id: "LANG5446"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('announce_position', {
                                                    rules: [],
                                                    valuePropName: 'checked',
                                                    initialValue: this.state.announce_position
                                                })(
                                                    <Checkbox onChange={ this._onChangeAnnouncePosition } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5447" /> }>
                                                            <span>{ formatMessage({id: "LANG5447"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('announce_frequency', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 4)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.range(data, value, callback, formatMessage, 20, 2000)
                                                        }
                                                    }],
                                                    initialValue: (settings.announce_frequency || settings.announce_frequency === 0) ? settings.announce_frequency + '' : '20'
                                                })(
                                                    <Input maxLength={ 4 } disabled={ !this.state.announce_position } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>CTI</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5408" /> }>
                                                            <span>{ formatMessage({id: "LANG5408"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('queue_chairman', {
                                                    rules: [],
                                                    initialValue: settings.queue_chairman ? settings.queue_chairman : 'none'
                                                })(
                                                    <Select>
                                                        <Option value="none">{ formatMessage({id: "LANG133"}) }</Option>
                                                        {
                                                            this.state.destinationListDataSource['account'].map(function(obj) {
                                                                    return <Option
                                                                                key={ obj.key }
                                                                                value={ obj.value }
                                                                                className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                                                { obj.label }
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
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5434" /> }>
                                                            <span>{ formatMessage({id: "LANG5434"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('enable_agent_login', {
                                                    rules: [],
                                                    valuePropName: 'checked',
                                                    initialValue: settings.enable_agent_login === 'yes'
                                                })(
                                                    <Checkbox />
                                                ) }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG629"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1175" /> }>
                                                            <span>{ formatMessage({id: "LANG1174"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('leavewhenempty', {
                                                    rules: [],
                                                    initialValue: settings.leavewhenempty ? settings.leavewhenempty : 'strict'
                                                })(
                                                    <Select>
                                                        <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                                        <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                                        <Option value='strict'>{ formatMessage({id: "LANG1203"}) }</Option>
                                                    </Select>
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1173" /> }>
                                                            <span>{ formatMessage({id: "LANG1172"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('joinempty', {
                                                    rules: [],
                                                    initialValue: settings.joinempty ? settings.joinempty : 'no'
                                                })(
                                                    <Select>
                                                        <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                                        <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                                        <Option value='strict'>{ formatMessage({id: "LANG1203"}) }</Option>
                                                    </Select>
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 12 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1182" /> }>
                                                            <span>{ formatMessage({id: "LANG1181"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('reportholdtime', {
                                                    rules: [],
                                                    valuePropName: 'checked',
                                                    initialValue: settings.reportholdtime === 'yes'
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
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5072" /> }>
                                                            <span>{ formatMessage({id: "LANG5071"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('replace_caller_id', {
                                                    rules: [],
                                                    valuePropName: 'checked',
                                                    initialValue: settings.replace_caller_id === 'yes'
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
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4170" /> }>
                                                            <span>{ formatMessage({id: "LANG4169"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('enable_feature', {
                                                    rules: [],
                                                    valuePropName: 'checked',
                                                    initialValue: settings.enable_feature === 'yes'
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
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1170" /> }>
                                                            <span>{ formatMessage({id: "LANG1169"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                { getFieldDecorator('pin', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.minlength(data, value, callback, formatMessage, 4)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.maxlength(data, value, callback, formatMessage, 8)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.activeKey === '2' ? Validator.checkNumericPw(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: settings.pin
                                                })(
                                                    <Input maxLength={ 8 } />
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
                                                        <Option value="none">{ formatMessage({id: "LANG133"}) }</Option>
                                                        <Option value="ring1">Ring 1</Option>
                                                        <Option value="ring2">Ring 2</Option>
                                                        <Option value="ring3">Ring 3</Option>
                                                        <Option value="ring4">Ring 4</Option>
                                                        <Option value="ring5">Ring 5</Option>
                                                        <Option value="ring6">Ring 6</Option>
                                                        <Option value="ring7">Ring 7</Option>
                                                        <Option value="ring8">Ring 8</Option>
                                                        <Option value="ring9">Ring 9</Option>
                                                        <Option value="ring10">Ring 10</Option>
                                                        <Option value="Bellcore-dr1">Bellcore-dr1</Option>
                                                        <Option value="Bellcore-dr2">Bellcore-dr2</Option>
                                                        <Option value="Bellcore-dr3">Bellcore-dr3</Option>
                                                        <Option value="Bellcore-dr4">Bellcore-dr4</Option>
                                                        <Option value="Bellcore-dr5">Bellcore-dr5</Option>
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
                                                    <Input maxLength={ 64 } />
                                                ) }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG143"}) } key="3">
                            <div className="content">
                                <div className="ant-form">
                                    <Row>
                                        <Col span={ 24 }>
                                            <FormItem
                                                { ...formItemTransferLayout }
                                                label={(
                                                    <span>
                                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1191" /> }>
                                                            <span>{ formatMessage({id: "LANG1191"}) }</span>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            >
                                                <Transfer
                                                    showSearch
                                                    sorter={ true }
                                                    render={ this._renderItem }
                                                    targetKeys={ this.state.targetKeys }
                                                    dataSource={ this.state.memberList }
                                                    onChange={ this._handleTransferChange }
                                                    filterOption={ this._filterTransferOption }
                                                    notFoundContent={ formatMessage({id: "LANG133"}) }
                                                    onSelectChange={ this._handleTransferSelectChange }
                                                    searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                                    titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                                />
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(QueueItem))

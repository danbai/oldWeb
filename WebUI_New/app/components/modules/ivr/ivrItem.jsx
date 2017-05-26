'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { injectIntl } from 'react-intl'
import Title from '../../../views/title'
import { Form, Input, message, Tabs, Modal } from 'antd'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'

import Key from './ivrItemKey'
import BasicSetting from './ivrItemBasic'

const TabPane = Tabs.TabPane
const confirm = Modal.confirm

class IvrItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            checkedList: {},
            activeKey: "1",
            currentEditId: this.props.params.id,
            settings: {},
            accountList: [],
            voicemailList: [],
            conferenceList: [],
            vmgruopList: [],
            ivrList: [],
            queueList: [],
            ringgroupList: [],
            paginggroupList: [],
            faxList: [],
            disaList: [],
            directoryList: [],
            callbackList: [],
            fileList: [],
            ivrNameList: [],
            numberList: [],
            languageList: [],
            ivrItem: {},
            ivrItemMembers: {},
            ivrStart: '7000',
            ivrEnd: '7100',
            disable_extension_ranges: 'no',
            newIvrNum: ''
        }
    }
    componentDidMount() {
        
    }
    componentWillMount() {
        this._getIVRRange()
        this._getInitData()
    }
    componentWillUnmount() {
    }
    _onChange = (activeKey) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
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
    _removeSuffix = (filename) => {
        let name = filename.toLocaleLowerCase(),
            file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"]

        for (let i = 0; i < file_suffix.length; i++) {
            let num = name.lastIndexOf(file_suffix[i])

            if (num !== -1 && name.endsWith(file_suffix[i])) {
                filename = filename.substring(0, num)

                return filename
            }
        }
    }
    _getIVRRange = () => {
        let prefSetting = {}
        let ivrStart = this.state.ivrStart
        let ivrEnd = this.state.ivrEnd
        let disable_extension_ranges = this.state.disable_extension_ranges

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getExtenPrefSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    prefSetting = res.response.extension_pref_settings || {}
                    ivrStart = prefSetting.vme_start
                    ivrEnd = prefSetting.vme_end
                    disable_extension_ranges = prefSetting.disable_extension_ranges
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            ivrStart: ivrStart,
            ivrEnd: ivrEnd,
            disable_extension_ranges: disable_extension_ranges
        })
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const ivrId = this.props.params.id
        const __this = this

        let languageList = []
        let accountList = []
        let voicemailList = []
        let conferenceList = []
        let vmgruopList = []
        let ivrList = []
        let queueList = []
        let ringgroupList = []
        let paginggroupList = []
        let faxList = []
        let disaList = []
        let directoryList = []
        let callbackList = []
        let fileList = []
        let ivrNameList = []
        let numberList = []
        let ivrItem = {}
        let ivrItemMembers = {}
        let newIvrNum = ''

        let getList = []
        getList.push({"getAccountList": ""})
        getList.push({"getVoicemailList": ""})
        getList.push({"getConferenceList": ""})
        getList.push({"getVMgroupList": ""})
        getList.push({"getIVRList": ""})
        getList.push({"getRinggroupList": ""})
        getList.push({"getPaginggroupList": ""})
        getList.push({"getQueueList": ""})
        getList.push({"getDirectoryList": ""})
        getList.push({"getFaxList": ""})
        getList.push({"getDISAList": ""})
        getList.push({"getCallbackList": ""})
        getList.push({"getIVRNameList": ""})
        getList.push({"getNumberList": ""})
        getList.push({"getLanguage": ""})
        $.ajax({
            url: api.apiHost,
            data: {
                action: 'combineAction',
                data: JSON.stringify(getList)
            },
            type: 'post',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const getAccountList = response.getAccountList || {}
                    const getVoicemailList = response.getVoicemailList || {}
                    const getConferenceList = response.getConferenceList || {}
                    const getVMgroupList = response.getVMGroupList || {}
                    const getIVRList = response.getIVRList || {}
                    const getRinggroupList = response.getRingGroupList || {}
                    const getPaginggroupList = response.getPagingGroupList || {}
                    const getQueueList = response.getQueueList || {}
                    const getDirectoryList = response.getDirectoryList || {}
                    const getFaxList = response.getFaxList || {}
                    const getDISAList = response.getDISAList || {}
                    const getCallbackList = response.getCallbackList || {}
                    const getIVRNameList = response.getIVRNameList || {}
                    const getNumberList = response.getNumberList || {}
                    const getLanguage = response.getLanguage || {}

                    const getAccountList_extension = getAccountList.extension || []
                    const getVoicemailList_extension = getVoicemailList.extension || []
                    const getConferenceList_extension = getConferenceList.extension || []
                    const getVMgroupList_vmgroups = getVMgroupList.vmgroups || []
                    const getIVRList_ivr = getIVRList.ivr || []
                    const getRinggroupList_ringgroups = getRinggroupList.ringgroups || []
                    const getPaginggroupList_paginggroups = getPaginggroupList.paginggroups || []
                    const getQueueList_queues = getQueueList.queues || []
                    const getDirectoryList_directorys = getDirectoryList.directorys || []
                    const getFaxList_fax = getFaxList.fax || []
                    const getDISAList_disa = getDISAList.disa || []
                    const getCallbackList_callback = getCallbackList.callback || []
                    const getLanguage_languages = getLanguage.languages || []
                    const disabled = formatMessage({id: "LANG273"})

                    accountList = getAccountList.extension.map(function(item) {
                        return {
                                key: item.extension,
                                out_of_service: item.out_of_service,
                                // disabled: (item.out_of_service === 'yes'),
                                title: (item.extension +
                                        (item.fullname ? ' "' + item.fullname + '"' : '') +
                                        (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                            }
                    })
                    voicemailList = getVoicemailList_extension.map(function(item) {
                        return {
                                key: item.extension,
                                out_of_service: item.out_of_service,
                                // disabled: (item.out_of_service === 'yes'),
                                title: (item.extension +
                                        (item.fullname ? ' "' + item.fullname + '"' : '') +
                                        (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                            }
                    })
                    conferenceList = getConferenceList_extension.map(function(item) {
                        return {
                                key: item,
                                value: item
                            }
                    })
                    vmgruopList = getVMgroupList_vmgroups.map(function(item) {
                        return {
                                key: item.vmgroup_name,
                                value: item.extension
                            }
                    })
                    ivrList = getIVRList_ivr.map(function(item) {
                        return {
                                key: item.ivr_name,
                                value: item.ivr_id,
                                extension: item.extension
                            }
                    })
                    ringgroupList = getRinggroupList_ringgroups.map(function(item) {
                        return {
                                key: item.ringgroup_name,
                                value: item.extension
                            }
                    })
                    paginggroupList = getPaginggroupList_paginggroups.map(function(item) {
                        return {
                                key: item.paginggroup_name,
                                value: item.extension
                            }
                    })
                    queueList = getQueueList_queues.map(function(item) {
                        return {
                                key: item.queue_name,
                                value: item.extension
                            }
                    })
                    directoryList = getDirectoryList_directorys.map(function(item) {
                        return {
                                key: item.name,
                                value: item.extension
                            }
                    })
                    faxList = getFaxList_fax.map(function(item) {
                        return {
                                key: item.fax_name,
                                value: item.extension
                            }
                    })
                    disaList = getDISAList_disa.map(function(item) {
                        return {
                                key: item.display_name,
                                value: item.disa_id
                            }
                    })
                    callbackList = getCallbackList_callback.map(function(item) {
                        return {
                                key: item.name,
                                value: item.callback_id
                            }
                    })
                    numberList = getNumberList.number || []
                    ivrNameList = getIVRNameList.ivr_name || []
                    languageList = getLanguage_languages || []
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
                action: 'listFile',
                type: 'ivr',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3","wav","gsm","ulaw","alaw"]}',
                sidx: 'n',
                sord: 'desc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    response.ivr.map(function(item) {
                        let obj = { 
                            text: item.n,
                            val: "record/" + __this._removeSuffix(item.n)
                        }
                        fileList.push(obj)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (ivrId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getIVR',
                    ivr: ivrId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}
                        ivrItem = response.ivr
                        ivrItemMembers = response.members

                        if (ivrItem.extension) {
                            numberList = _.without(numberList, ivrItem.extension)
                        }
                        if (ivrItem.ivr_name) {
                            ivrNameList = _.without(ivrNameList, ivrItem.ivr_name)
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        } else {
            const ivrStart = this.state.ivrStart
            const ivrEnd = this.state.ivrEnd
            
            let noNeedBreak = true
            for (let i = parseInt(ivrStart); i < parseInt(ivrEnd) && noNeedBreak; i++) {
                if (($.inArray((i + ''), numberList) > -1)) {
                } else {
                    newIvrNum = i + ''
                    noNeedBreak = false
                }
            }
        }

        this.setState({
            accountList: accountList,
            voicemailList: voicemailList,
            conferenceList: conferenceList,
            vmgruopList: vmgruopList,
            ivrList: ivrList,
            queueList: queueList,
            ringgroupList: ringgroupList,
            paginggroupList: paginggroupList,
            faxList: faxList,
            disaList: disaList,
            directoryList: directoryList,
            callbackList: callbackList,
            fileList: fileList,
            numberList: numberList,
            ivrNameList: ivrNameList, 
            languageList: languageList,
            ivrItem: ivrItem,
            ivrItemMembers: ivrItemMembers,
            newIvrNum: newIvrNum
        })
    }
    _getNameValue = (e, name) => {
        const accountList = this.state.accountList
        const voicemailList = this.state.voicemailList
        const conferenceList = this.state.conferenceList
        const vmgruopList = this.state.vmgruopList
        const ivrList = this.state.ivrList
        const queueList = this.state.queueList
        const ringgroupList = this.state.ringgroupList
        const paginggroupList = this.state.paginggroupList
        const faxList = this.state.faxList
        const disaList = this.state.disaList
        const directoryList = this.state.directoryList
        const callbackList = this.state.callbackList
        const fileList = this.state.fileList
        let value = name
        if (e === "member_account") {
            accountList.map(function(item) {
                if (item.title === name) {
                    value = item.key
                    return value
                }
            })
        } else if (e === "member_voicemail") {
            voicemailList.map(function(item) {
                if (item.title === name) {
                    value = item.key
                    return value
                }
            })
        } else if (e === "member_conference") {
            conferenceList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_vmgroup") {
            vmgruopList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_ivr") {
            ivrList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_ringgroup") {
            ringgroupList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_queue") {
            queueList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_paginggroup") {
            paginggroupList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_fax") {
            faxList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_prompt") {
            fileList.map(function(item) {
                if (item.text === name) {
                    value = item.val
                    return value
                }
            })
        } else if (e === "member_disa") {
            disaList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_directory") {
            directoryList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else if (e === "member_callback") {
            callbackList.map(function(item) {
                if (item.key === name) {
                    value = item.value
                    return value
                }
            })
        } else {
            value = name
        }
        return value
    }
    _handleCancel = (e) => {
        browserHistory.push('/call-features/ivr')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const IvrId = this.props.params.id

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
            }
            if (err && (err.hasOwnProperty('ivr_name') ||
                err.hasOwnProperty('extension') ||
                err.hasOwnProperty('keypress_event_ext_0') ||
                err.hasOwnProperty('keypress_event_ext_1') ||
                err.hasOwnProperty('keypress_event_ext_2') ||
                err.hasOwnProperty('keypress_event_ext_3') ||
                err.hasOwnProperty('keypress_event_ext_4') ||
                err.hasOwnProperty('keypress_event_ext_5') ||
                err.hasOwnProperty('keypress_event_ext_6') ||
                err.hasOwnProperty('keypress_event_ext_7') ||
                err.hasOwnProperty('keypress_event_ext_8') ||
                err.hasOwnProperty('keypress_event_ext_9') ||
                err.hasOwnProperty('keypress_event_ext_10') ||
                err.hasOwnProperty('keypress_event_ext_t') ||
                err.hasOwnProperty('keypress_event_ext_i') ||
                err.hasOwnProperty('keypress_event_0') ||
                err.hasOwnProperty('keypress_event_1') ||
                err.hasOwnProperty('keypress_event_2') ||
                err.hasOwnProperty('keypress_event_3') ||
                err.hasOwnProperty('keypress_event_4') ||
                err.hasOwnProperty('keypress_event_5') ||
                err.hasOwnProperty('keypress_event_6') ||
                err.hasOwnProperty('keypress_event_7') ||
                err.hasOwnProperty('keypress_event_8') ||
                err.hasOwnProperty('keypress_event_9') ||
                err.hasOwnProperty('keypress_event_10') ||
                err.hasOwnProperty('keypress_event_t') ||
                err.hasOwnProperty('keypress_event_i'))
                ) {
                return
            }
            if (err && (err.hasOwnProperty('switch') || err.hasOwnProperty('ivr_out_blackwhite_list'))) {
                return
            }
            if (err && err.hasOwnProperty('custom_alert_info')) {
                return
            }
            if (err && (err.hasOwnProperty('digit_timeout') ||
                err.hasOwnProperty('response_timeout'))) {
                return
            }

            const disable_extension_ranges = this.state.disable_extension_ranges
            const ivrStart = this.state.ivrStart
            const ivrEnd = this.state.ivrEnd
            if (disable_extension_ranges === 'no') {
                const num = parseInt(values.extension)
                if (num < parseInt(ivrStart) || num > parseInt(ivrEnd)) {
                    const { formatMessage } = this.props.intl
                    confirm({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2132"}, {0: num, 1: ivrStart, 2: ivrEnd})}} ></span>,
                        onOk() {
                           browserHistory.push('/pbx-settings/pbxGeneralSettings')
                        },
                        onCancel() {
                            return
                        },
                        okText: formatMessage({id: "LANG727"}),
                        cancelText: formatMessage({id: "LANG726"})
                    })
                    return
                }
            }
            let action = values
            if (values.ivr_blackwhite_list.length > 500) {
                message.error(formatMessage({id: "LANG808"}, {0: 500, 1: formatMessage({id: "LANG5327"})}))
                return
            }
            action.ivr_blackwhite_list = values.ivr_blackwhite_list.join(',')
            if (values.alertinfo === "custom") {
                if (values.custom_alert_info !== "") {
                    action.alertinfo = "custom_" + values.custom_alert_info
                }
            }
            if (action.keypress_0 ||
                action.keypress_1 ||
                action.keypress_2 ||
                action.keypress_3 ||
                action.keypress_4 ||
                action.keypress_5 ||
                action.keypress_6 ||
                action.keypress_7 ||
                action.keypress_8 ||
                action.keypress_9 ||
                action.keypress_10 ||
                action.keypress_t ||
                action.keypress_i) {
                let members = []

                let obj = {}
                if (action.keypress_0) {
                    obj["keypress"] = "0"
                    if (action.keypress_0 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_0
                    } else if (action.keypress_0 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_0
                        obj[action.keypress_0] = action.keypress_event_ext_0
                    } else {
                        obj["keypress_event"] = action.keypress_0
                        obj[action.keypress_0] = this._getNameValue(action.keypress_0, action.keypress_event_0)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_1) {
                    obj["keypress"] = "1"
                    if (action.keypress_1 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_1
                    } else if (action.keypress_1 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_1
                        obj[action.keypress_1] = action.keypress_event_ext_1
                    } else {
                        obj["keypress_event"] = action.keypress_1
                        obj[action.keypress_1] = this._getNameValue(action.keypress_1, action.keypress_event_1)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_2) {
                    obj["keypress"] = "2"
                    if (action.keypress_2 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_2
                    } else if (action.keypress_2 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_2
                        obj[action.keypress_2] = action.keypress_event_ext_2
                    } else {
                        obj["keypress_event"] = action.keypress_2
                        obj[action.keypress_2] = this._getNameValue(action.keypress_2, action.keypress_event_2)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_3) {
                    obj["keypress"] = "3"
                    if (action.keypress_3 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_3
                    } else if (action.keypress_3 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_3
                        obj[action.keypress_3] = action.keypress_event_ext_3
                    } else {
                        obj["keypress_event"] = action.keypress_3
                        obj[action.keypress_3] = this._getNameValue(action.keypress_3, action.keypress_event_3)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_4) {
                    obj["keypress"] = "4"
                    if (action.keypress_4 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_4
                    } else if (action.keypress_4 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_4
                        obj[action.keypress_4] = action.keypress_event_ext_4
                    } else {
                        obj["keypress_event"] = action.keypress_4
                        obj[action.keypress_4] = this._getNameValue(action.keypress_4, action.keypress_event_4)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_5) {
                    obj["keypress"] = "5"
                    if (action.keypress_5 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_5
                    } else if (action.keypress_5 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_5
                        obj[action.keypress_5] = action.keypress_event_ext_5
                    } else {
                        obj["keypress_event"] = action.keypress_5
                        obj[action.keypress_5] = this._getNameValue(action.keypress_5, action.keypress_event_5)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_6) {
                    obj["keypress"] = "6"
                    if (action.keypress_6 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_6
                    } else if (action.keypress_6 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_6
                        obj[action.keypress_6] = action.keypress_event_ext_6
                    } else {
                        obj["keypress_event"] = action.keypress_6
                        obj[action.keypress_6] = this._getNameValue(action.keypress_6, action.keypress_event_6)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_7) {
                    obj["keypress"] = "7"
                    if (action.keypress_7 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_7
                    } else if (action.keypress_7 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_7
                        obj[action.keypress_7] = action.keypress_event_ext_7
                    } else {
                        obj["keypress_event"] = action.keypress_7
                        obj[action.keypress_7] = this._getNameValue(action.keypress_7, action.keypress_event_7)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_8) {
                    obj["keypress"] = "8"
                    if (action.keypress_8 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_8
                    } else if (action.keypress_8 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_8
                        obj[action.keypress_8] = action.keypress_event_ext_8
                    } else {
                        obj["keypress_event"] = action.keypress_8
                        obj[action.keypress_8] = this._getNameValue(action.keypress_8, action.keypress_event_8)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_9) {
                    obj["keypress"] = "9"
                    if (action.keypress_9 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_9
                    } else if (action.keypress_9 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_9
                        obj[action.keypress_9] = action.keypress_event_ext_9
                    } else {
                        obj["keypress_event"] = action.keypress_9
                        obj[action.keypress_9] = this._getNameValue(action.keypress_9, action.keypress_event_9)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_10) {
                    obj["keypress"] = "*"
                    if (action.keypress_10 === "member_hangup") {
                        obj["keypress_event"] = action.keypress_10
                    } else if (action.keypress_10 === "member_external_number") {
                        obj["keypress_event"] = action.keypress_10
                        obj[action.keypress_10] = action.keypress_event_ext_10
                    } else {
                        obj["keypress_event"] = action.keypress_10
                        obj[action.keypress_10] = this._getNameValue(action.keypress_10, action.keypress_event_10)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_t) {
                    obj["keypress"] = "t"
                    if (action.keypress_t === "member_hangup") {
                        obj["keypress_event"] = action.keypress_t
                    } else if (action.keypress_t === "member_external_number") {
                        obj["keypress_event"] = action.keypress_t
                        obj[action.keypress_t] = action.keypress_event_ext_t
                    } else {
                        obj["keypress_event"] = action.keypress_t
                        obj[action.keypress_t] = this._getNameValue(action.keypress_t, action.keypress_event_t)
                    }
                }
                members.push(obj)
                obj = {}
                if (action.keypress_i) {
                    obj["keypress"] = "i"
                    if (action.keypress_i === "member_hangup") {
                        obj["keypress_event"] = action.keypress_i
                    } else if (action.keypress_i === "member_exiernal_number") {
                        obj["keypress_event"] = action.keypress_i
                        obj[action.keypress_i] = action.keypress_event_ext_i
                    } else {
                        obj["keypress_event"] = action.keypress_i
                        obj[action.keypress_i] = this._getNameValue(action.keypress_i, action.keypress_event_i)
                    }
                }
                members.push(obj)

                action["members"] = JSON.stringify(members)
            }
            // action.remove("dial_trunk")
            delete action.custom_alert_info
            delete action.dial_all
            delete action.keypress_0
            delete action.keypress_1
            delete action.keypress_2
            delete action.keypress_3
            delete action.keypress_4
            delete action.keypress_5
            delete action.keypress_6
            delete action.keypress_7
            delete action.keypress_8
            delete action.keypress_9
            delete action.keypress_10
            delete action.keypress_t
            delete action.keypress_i
            delete action.keypress_event_0
            delete action.keypress_event_1
            delete action.keypress_event_2
            delete action.keypress_event_3
            delete action.keypress_event_4
            delete action.keypress_event_5
            delete action.keypress_event_6
            delete action.keypress_event_7
            delete action.keypress_event_8
            delete action.keypress_event_9
            delete action.keypress_event_10
            delete action.keypress_event_t
            delete action.keypress_event_i
            delete action.keypress_event_ext_0
            delete action.keypress_event_ext_1
            delete action.keypress_event_ext_2
            delete action.keypress_event_ext_3
            delete action.keypress_event_ext_4
            delete action.keypress_event_ext_5
            delete action.keypress_event_ext_6
            delete action.keypress_event_ext_7
            delete action.keypress_event_ext_8
            delete action.keypress_event_ext_9
            delete action.keypress_event_ext_10
            delete action.keypress_event_ext_t
            delete action.keypress_event_ext_i

            _.each(action, function(num, key) {
                if (_.isObject(num)) {
                    if (typeof (num.errors) === "undefined") {
                        if (num.value === true) {
                            action[key] = "yes"  
                        } else if (num.value === false) {
                            action[key] = "no" 
                        } else {
                            action[key] = num.value
                        }
                    } else {
                        return
                    }
                } else {
                    if (num === true) {
                        action[key] = "yes"  
                    } else if (num === false) {
                        action[key] = "no" 
                    } else {
                        action[key] = num
                    }
                }
            })
            action['dial_extension'] = 'no'
            action['dial_conference'] = 'no'
            action['dial_queue'] = 'no'
            action['dial_ringgroup'] = 'no'
            action['dial_paginggroup'] = 'no'
            action['dial_vmgroup'] = 'no'
            action['dial_fax'] = 'no'
            action['dial_directory'] = 'no'
            this.state.checkedList.map(function(item) {
                action[item] = "yes"
            })
            if (action['dial_extension'] === 'no') {
                delete action.ivr_blackwhite_list
            }

            if (action.dial_trunk === 'no') {
                delete action.ivr_out_blackwhite_list
            }

            if (IvrId) {
                action["action"] = "updateIVR"
                action["ivr"] = IvrId
            } else {
                action["action"] = "addIVR"
                if (action.members === undefined) {
                    action["members"] = '[{},{},{},{},{},{},{},{},{},{},{},{"keypress":"t","keypress_event":"member_prompt","member_prompt":"goodbye"},{"keypress":"i","keypress_event":"member_prompt","member_prompt":"goodbye"}]'
                }
            }

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
                            message.destroy()
                            message.success(successMessage)
                        }

                        this._handleCancel()
                    }.bind(this)
                })
        })
    }
    _getSpecialState = (checkedList) => {
        this.setState({
            checkedList: checkedList
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG19"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG766"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main app-content-extension">
                <Title
                    headerTitle={ title }
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                    isDisplay='display-block'
                />
                <Form className="form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG2217"}) } key="1">
                            <BasicSetting
                                form={ form }
                                currentEditId={ this.state.currentEditId }
                                settings={ this.state.settings }
                                accountList={ this.state.accountList }
                                fileList={ this.state.fileList }
                                ivrItem={ this.state.ivrItem }
                                numberList={ this.state.numberList }
                                ivrNameList={ this.state.ivrNameList }
                                languageList={ this.state.languageList }
                                newIvrNum={ this.state.newIvrNum }
                                getSpecialState={ this._getSpecialState.bind(this) }
                                ivrId={ this.props.params.id }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG648"}) } key="2">
                            <Key
                                form={ form }
                                currentEditId={ this.state.currentEditId }
                                ivrItemMembers={ this.state.ivrItemMembers }
                                accountList={ this.state.accountList }
                                voicemailList={ this.state.voicemailList }
                                conferenceList={ this.state.conferenceList }
                                vmgruopList={ this.state.vmgruopList }
                                ivrList={ this.state.ivrList }
                                queueList={ this.state.queueList }
                                ringgroupList={ this.state.ringgroupList }
                                paginggroupList={ this.state.paginggroupList }
                                faxList={ this.state.faxList }
                                disaList={ this.state.disaList }
                                directoryList={ this.state.directoryList }
                                callbackList={ this.state.callbackList }
                                fileList={ this.state.fileList }
                            />
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

IvrItem.propTypes = {}

export default Form.create()(injectIntl(IvrItem))

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
import { Form, Input, message, Select, Tooltip, Checkbox, Row, Col, Transfer, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class RingGroupItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            targetKeys: [],
            targetKeysLDAP: [],
            accountList: [],
            memberList: [],
            ldapList: [],
            ringgroupnameList: [],
            numberList: [],
            mohnameList: [],
            fileList: [],
            ringGroupValues: {},
            disabled_exten: false,
            voicemailDisplay: false,
            extensionList: [],
            voicemailList: [],
            queueList: [],
            ringGroupList: [],
            vmGroupList: [],
            externalNumber: false,
            displayInitDest: true,
            destinationValues: {name: '', id: ''},
            warningMusicClass: false,
            destinationValuesID: '',
            rgeStart: '6400',
            rgeEnd: '6499',
            newRGENum: '',
            disable_extension_ranges: 'no'
        }
    }
    componentWillMount() {
        this._getAccountList()
        this._getVoicemailList()
        this._getQueueList()
        this._getRingGroupList()
        this._getVmGroupList()
        this._getPromptList()
        this._getIvrList()
        this._getRingGroupValues()
        this._getPortExtension()
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const name = this.props.params.name

        if (name && value && name === value) {
            callback()
        } else if (value && _.indexOf(this.state.ringgroupnameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkNumber = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const id = this.props.params.id

        if (id && value && parseInt(id) === parseInt(value)) {
            callback()
        } else if (value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkIfInPort = (rules, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.portExtensionList, parseInt(value)) > -1) {
            callback(formatMessage({id: "LANG2172"}, {0: formatMessage({id: "LANG1244"}), 1: formatMessage({id: "LANG1242"})}))
        } else {
            callback()
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
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
    _onChangeAutoRecord = (e) => {
        let ringGroupValues = this.state.ringGroupValues || {}

        if (e.target.checked) {
            ringGroupValues.auto_record = 'yes'
        } else {
            ringGroupValues.auto_record = 'no'
        }

        this.setState({
            ringGroupValues: ringGroupValues
        })
    }
    _onChangeReplaceCaller = (e) => {
        let ringGroupValues = this.state.ringGroupValues || {}

        if (e.target.checked) {
            ringGroupValues.replace_caller_id = 'yes'
        } else {
            ringGroupValues.replace_caller_id = 'no'
        }

        this.setState({
            ringGroupValues: ringGroupValues
        })
    }
    _onChangeEnableDestination = (e) => {
        let ringGroupValues = this.state.ringGroupValues || {}

        if (e.target.checked) {
            ringGroupValues.enable_destination = 'yes'
        } else {
            ringGroupValues.enable_destination = 'no'
        }

        this.setState({
            ringGroupValues: ringGroupValues
        })
    }
    _onInitDestinationTyepe = (val) => {
        this._handleSelectExtension(val, false)
    }
    _onCahngeDestinationType = (val) => {
        this._handleSelectExtension(val, true)
    }
    _handleSelectExtension = (val, click) => {
        console.log('value is: ', val)

        let displayList = []
        let voicemailDisplay = false
        let externalNumber = false
        let initDestValue = ''
        let destinationValues = {name: '', id: ''}
        let displayInitDest = this.state.displayInitDest

        const { formatMessage } = this.props.intl
        const ringGroupExten = this.props.params.id

        if (val === 'account') {
            let accountList = this.state.accountList

            for (let i = 0; i < accountList.length; i++) {
                let extension = accountList[i].key

                if (extension) {
                    let obj = {
                        key: extension,
                        val: extension
                    }

                    displayList.push(obj)
                }
            }

            if (displayInitDest) {
                let ringGroupValues = this.state.ringGroupValues

                initDestValue = ringGroupValues.account
            }
        } else if (val === 'voicemail') {
            voicemailDisplay = true

            let voicemailList = this.state.voicemailList

            if (this.state.destinationValuesID === 'ringGroupNum') {
                voicemailDisplay = true
            } else if (this.state.destinationValuesID === this.props.params.id) {
                voicemailDisplay = true
            } else {
                voicemailDisplay = false
            }

            const ringGroupNum = formatMessage({id: "LANG1597"})

            let objRingGroup = {
                key: 'ringGroupNum',
                val: ringGroupNum
            }

            displayList.push(objRingGroup)

            for (let i = 0; i < voicemailList.length; i++) {
                let extension = voicemailList[i]["extension"]

                if (extension) {
                    let obj = {
                        key: extension,
                        val: extension
                    }

                    displayList.push(obj)
                }
            }

            if (displayInitDest) {
                let ringGroupValues = this.state.ringGroupValues

                if (ringGroupExten && ringGroupValues.vm_extension === ringGroupExten) {
                    // voicemail extension is ringgroup extension
                    initDestValue = 'ringGroupNum'
                } else {
                    initDestValue = ringGroupValues.vm_extension
                }
            }
        } else if (val === 'queue') {
            let queueList = this.state.queueList

            for (let i = 0; i < queueList.length; i++) {
                let extension = queueList[i]["extension"]
                let queueName = queueList[i]["queue_name"]

                if (extension && queueName) {
                    let obj = {
                        key: extension,
                        val: queueName
                    }

                    displayList.push(obj)
                }
            }

            if (displayInitDest) {
                let ringGroupValues = this.state.ringGroupValues

                initDestValue = ringGroupValues.queue
            }
        } else if (val === 'ringgroup') {
            let ringGroupList = this.state.ringGroupList
            let ringGroupExten = this.state.ringGroupValues.extension

            for (let i = 0; i < ringGroupList.length; i++) {
                let extension = ringGroupList[i]["extension"]
                let ringGroupName = ringGroupList[i]["ringgroup_name"]

                if (extension && ringGroupName && extension !== ringGroupExten) {
                    let obj = {
                        key: extension,
                        val: ringGroupName
                    }

                    displayList.push(obj)
                }
            }

            if (displayInitDest) {
                let ringGroupValues = this.state.ringGroupValues

                initDestValue = ringGroupValues.ringgroup
            }
        } else if (val === 'vmgroup') {
            let vmGroupList = this.state.vmGroupList

            for (let i = 0; i < vmGroupList.length; i++) {
                let extension = vmGroupList[i]["extension"]
                let vmGroupName = vmGroupList[i]["vmgroup_name"]

                if (extension && vmGroupName) {
                    let obj = {
                        key: extension,
                        val: vmGroupName
                    }

                    displayList.push(obj)
                }
            }

            if (displayInitDest) {
                let ringGroupValues = this.state.ringGroupValues

                initDestValue = ringGroupValues.vmgroup
            }
        } else if (val === 'ivr') {
            let ivrList = this.state.ivrList

            for (let i = 0; i < ivrList.length; i++) {
                let ivrName = ivrList[i]["ivr_name"]
                let ivrId = String(ivrList[i]["ivr_id"])

                if (ivrName && ivrId) {
                    let obj = {
                        key: ivrId,
                        val: ivrName
                    }

                    displayList.push(obj)
                }
            }

            if (displayInitDest) {
                let ringGroupValues = this.state.ringGroupValues

                initDestValue = ringGroupValues.ivr
            }
        } else if (val === 'external_number') {
            displayList = []
            externalNumber = true
        }

        if (displayInitDest && ringGroupExten) {
            destinationValues['id'] = initDestValue

            displayList.map(function(item) {
                if (item.key === initDestValue) {
                    destinationValues['name'] = item.val
                }
            })
        } else {
            if (displayList.length > 0) {
                destinationValues['id'] = displayList[0].key
                destinationValues['name'] = displayList[0].val
            } else {
                destinationValues['id'] = ''
                destinationValues['name'] = ''
            }
        }

        let keypress_event = displayList.length > 0 ? displayList[0].key : ""

        if (click) {
            this.props.form.setFieldsValue({
                external_number: '',
                select_extension: keypress_event
            })

            if (val === 'voicemail') {
                if (keypress_event === 'ringGroupNum') {
                    voicemailDisplay = true
                }
            }
        }

        this.setState({
            extensionList: displayList,
            voicemailDisplay: voicemailDisplay,
            externalNumber: externalNumber,
            destinationValues: destinationValues
        })

        console.log('distination value is: ', displayList)
    }
    _selectDestinationValue =(val) => {
        console.log('==val==', val)

        let destinationValues = {name: '', id: ''}

        destinationValues['id'] = val
        destinationValues['name'] = val

        if (val === 'ringGroupNum') {
            this.setState({
                voicemailDisplay: true,
                destinationValues: destinationValues
            })
        } else {
            this.setState({
                voicemailDisplay: false,
                destinationValues: destinationValues
            })
        }
    }
    _getPortExtension = () => {
        const { formatMessage } = this.props.intl

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
    _getAccountList = () => {
        const { formatMessage } = this.props.intl

        let memberList = []
        let accountList = []

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
                                title: (item.extension +
                                        (item.fullname ? ' "' + item.fullname + '"' : '') +
                                        (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                            }
                    })

                    memberList = _.clone(accountList)

                    this.setState({
                        accountList: accountList
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
                    let response = res.response || {}
                    let extgroupList = response.extension_groups || []
                    let extgroupLabel = formatMessage({id: "LANG2714"})

                    _.map(extgroupList, (item) => {
                        memberList.push({
                                key: item.group_id,
                                value: item.group_id,
                                title: extgroupLabel + " -- " + item.group_name
                            })
                    })

                    this.setState({
                        memberList: memberList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getVoicemailList = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getVoicemailList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    let voicemailList = response.extension || []

                    this.setState({
                        voicemailList: voicemailList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getQueueList = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getQueueList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    let queueList = response.queues || []

                    this.setState({
                        queueList: queueList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getRingGroupList = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getRinggroupList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    let ringGroupList = response.ringgroups || []

                    this.setState({
                        ringGroupList: ringGroupList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getVmGroupList = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getVMgroupList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    let vmGroupList = response.vmgroups || []

                    this.setState({
                        vmGroupList: vmGroupList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getPromptList = () => {
        let fileList = []
        let __this = this
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listFile',
                type: 'ivr',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3","wav","gsm","ulaw","alaw"]}',
                sidx: 'n',
                sord: 'desc'
            },
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

                    this.setState({
                        fileList: fileList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getIvrList = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getIVRList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    let ivrList = response.ivr || []

                    this.setState({
                        ivrList: ivrList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getRingGroupValues = () => {
        let ringGroupValues = {}

        const ringgroup_exten = this.props.params.id

        if (ringgroup_exten) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getRinggroup',
                    ringgroup: ringgroup_exten
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        ringGroupValues = response.ringgroup

                        let destinationValuesID = ''

                        if (ringGroupValues.destination_type === 'account') {
                            destinationValuesID = ringGroupValues.account
                        } else if (ringGroupValues.destination_type === 'voicemail') {
                            destinationValuesID = ringGroupValues.vm_extension
                        } else if (ringGroupValues.destination_type === 'queue') {
                            destinationValuesID = ringGroupValues.queue
                        } else if (ringGroupValues.destination_type === 'ringgroup') {
                            destinationValuesID = ringGroupValues.ringgroup
                        } else if (ringGroupValues.destination_type === 'ivr') {
                            destinationValuesID = ringGroupValues.ivr
                        } else if (ringGroupValues.destination_type === 'vmgroup') {
                            destinationValuesID = ringGroupValues.vmgroup
                        } else if (ringGroupValues.destination_type === 'external_number') {
                            destinationValuesID = ringGroupValues.external_number
                        }

                        this.setState({
                            disabled_exten: true,
                            ringGroupValues: ringGroupValues,
                            destinationValuesID: destinationValuesID
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
    }
    _getInitData = () => {
        let targetKeys = []
        let targetKeysLDAP = []
        let ldapList = []
        let ringgroupnameList = []
        let numberList = []
        let mohnameList = []
        let warningMusicClass = false
        let rgeStart = this.state.rgeStart
        let rgeEnd = this.state.rgeEnd
        let disable_extension_ranges = this.state.disable_extension_ranges

        const { formatMessage } = this.props.intl
        const ringGroupExten = this.props.params.id
        const ringGroupName = this.props.params.name
        const __this = this

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getRinggroupNameList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    ringgroupnameList = response.ringgroup_name || []
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
                action: 'getNumberList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    numberList = response.number || []
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
                action: 'getPhonebookListDnAndMembers'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const disabled = formatMessage({id: "LANG273"})
                    const response = res.response || {}

                    let memberLDAP = response.extension

                    for (let i = 0; i < memberLDAP.length; i++) {
                        let phonebook = memberLDAP[i]["phonebook_dn"]

                        if (phonebook && (phonebook !== "ou=pbx,dc=pbx,dc=com")) {
                            let members = memberLDAP[i]["members"] ? memberLDAP[i]["members"].split('|') : []

                            for (let j = 0, length = members.length; j < length; j++) {
                                let extension = members[j]

                                if (extension) {
                                    let obj = {
                                        key: extension + '#' + phonebook,
                                        value: extension + '#' + phonebook,
                                        title: extension + '(' + phonebook + ')'
                                    }

                                    ldapList.push(obj)
                                }
                            }
                        }
                    }

                    console.log('ldapt is ', ldapList)
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
                action: 'getMohNameList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    mohnameList = response.moh_name
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
                action: 'getExtenPrefSettings'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    let prefSetting = res.response.extension_pref_settings || {}

                    rgeStart = prefSetting.rge_start
                    rgeEnd = prefSetting.rge_end
                    disable_extension_ranges = prefSetting.disable_extension_ranges
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        
        let noNeedBreak = true
        let newRGENum = this.state.newRGENum

        for (let i = parseInt(rgeStart); i < parseInt(rgeEnd) && noNeedBreak; i++) {
            if (($.inArray((i + ''), numberList) > -1)) {
            } else {
                newRGENum = i + ''
                noNeedBreak = false
            }
        }

        if (ringGroupExten) {
            let ringGroupValues = this.state.ringGroupValues
            let destinationType = ringGroupValues.destination_type

            if (ringGroupValues.musicclass && ringGroupValues.musicclass !== '') {
                warningMusicClass = true
            }

            targetKeys = ringGroupValues.members ? ringGroupValues.members.split(',') : []
            targetKeysLDAP = ringGroupValues.members_ldap ? ringGroupValues.members_ldap.split('|') : []

            this._onInitDestinationTyepe(destinationType)
        } else {
            this._onInitDestinationTyepe('account')
            this.state.ringGroupValues.enable_destination = 'no'
        }

        this.setState({
            targetKeys: targetKeys,
            targetKeysLDAP: targetKeysLDAP,
            ldapList: ldapList,
            ringgroupnameList: ringgroupnameList,
            numberList: numberList,
            mohnameList: mohnameList,
            displayInitDest: false,
            warningMusicClass: warningMusicClass,
            rgeStart: rgeStart,
            rgeEnd: rgeEnd,
            newRGENum: newRGENum,
            disable_extension_ranges: disable_extension_ranges
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/ringGroup')
    }
    _handleTransferChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            targetKeys: targetKeys
        })

        console.log('targetKeys extension: ', targetKeys)
        console.log('direction extension: ', direction)
        console.log('moveKeys extension: ', moveKeys)
    }
    _handleTransferChangeLDAP = (targetKeys, direction, moveKeys) => {
        this.setState({
            targetKeysLDAP: targetKeys
        })

        console.log('targetKeys LDAP: ', targetKeys)
        console.log('direction LDAP: ', direction)
        console.log('moveKeys LDAP: ', moveKeys)
    }
    _handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        // this.setState({ targetContactKeys: nextTargetKeys })
        console.log('sourceSelectedKeys: ', sourceSelectedKeys)
        console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
    _updateDestinationInfo = (destType, action) => {
        let destinationValues = this.state.destinationValues

        if (destType === 'account') {
            action['account'] = destinationValues.id
        } else {
            action['account'] = ''
        }

        if (destType === 'voicemail') {
            if (destinationValues.id === 'ringGroupNum') {
                action['vm_extension'] = action.extension
                action['ringgroupasvm'] = 'yes'
            } else {
                action['vm_extension'] = destinationValues.id
                action['ringgroupasvm'] = 'no'
                delete action.vmsecret
                delete action.email
            }
            action['hasvoicemail'] = 'yes'
        } else {
            action['vm_extension'] = ''
            action['hasvoicemail'] = 'no'
        }

        if (destType === 'queue') {
            action['queue'] = destinationValues.id
        } else {
            action['queue'] = ''
        }

        if (destType === 'ringgroup') {
            action['ringgroup_dest'] = destinationValues.id
        } else {
            action['ringgroup_dest'] = ''
        }

        if (destType === 'vmgroup') {
            action['vmgroup'] = destinationValues.id
        } else {
            action['vmgroup'] = ''
        }

        if (destType === 'ivr') {
            action['ivr'] = destinationValues.id
        } else {
            action['ivr'] = ''
        }

        if (destType !== 'external_number') {
            action['external_number'] = ''
        }

        console.log('add dest val ', action)
    }
    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''

        const { formatMessage } = this.props.intl
        const ringgroup_extension = this.props.params.id
        const ringgroupMemberMax = parseInt(JSON.parse(localStorage.featureLimits).ringgroup_members)

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        let maxLengthMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2169"}, {
                    0: 100, 1: formatMessage({id: "LANG128"})
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                if (!this.state.targetKeys.length && !this.state.targetKeysLDAP.length) {
                    message.error(errorMessage)
                    return
                } else if (this.state.targetKeys.length > ringgroupMemberMax || this.state.targetKeysLDAP.length > ringgroupMemberMax) {
                    message.error(maxLengthMessage)
                    return
                }

                const disable_extension_ranges = this.state.disable_extension_ranges
                const rgeStart = this.state.rgeStart
                const rgeEnd = this.state.rgeEnd

                if (disable_extension_ranges === 'no') {
                    const num = parseInt(values.extension)

                    if (num < parseInt(rgeStart) || num > parseInt(rgeEnd)) {
                        const { formatMessage } = this.props.intl

                        confirm({
                            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2132"}, {0: num, 1: rgeStart, 2: rgeEnd})}} ></span>,
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

                message.loading(loadingMessage)

                let action = _.clone(values)
                let selectDestType = values.destination_type

                if (selectDestType === 'voicemail') {
                    action.vm_extension = values.select_extension
                } else if (selectDestType === 'vmgroup') {
                    action.vmgroup = values.select_extension
                } else if (selectDestType === 'ivr') {
                    action.ivr = values.select_extension
                } else if (selectDestType === 'ringgroup') {
                    action.ringgroup = values.select_extension
                } else if (selectDestType === 'queue') {
                    action.queue = values.select_extension
                } else if (selectDestType === 'directory') {
                    action.directory = values.select_extension
                } else if (selectDestType === 'external_number') {
                    action.external_number = values.external_number
                }

                delete action.select_extension

                action.members = this.state.targetKeys.join()
                action.members_ldap = this.state.targetKeysLDAP.join('|')
                action.auto_record = this.state.ringGroupValues.auto_record
                action.replace_caller_id = this.state.ringGroupValues.replace_caller_id
                action.enable_destination = this.state.ringGroupValues.enable_destination

                this._updateDestinationInfo(selectDestType, action)

                if (ringgroup_extension) {
                    action.action = 'updateRinggroup'
                    action.ringgroup = ringgroup_extension
                    delete action.extension
                } else {
                    action.action = 'addRinggroup'
                }

                $.ajax({
                    data: action,
                    type: 'post',
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
                <span>
                    { item.title }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.value   // for title and filter matching
            }
    }
    _gotoPromptOk = () => {
        browserHistory.push('/pbx-settings/voicePrompt/2')
    }
    _gotoPrompt = () => {
        console.log('enter goto Prompt')

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
    _onChangeMusicClass = (val) => {
        let warningMusicClass = false

        if (val !== "") {
            warningMusicClass = true
        } else {
            warningMusicClass = false
        }

        this.setState({
            warningMusicClass: warningMusicClass
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const ring_name = this.props.params.name
        const ring_extension = this.props.params.id
        const ringGroupValues = this.state.ringGroupValues
        const extensionList = this.state.extensionList
        const destinationValues = this.state.destinationValues

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemPromptLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }

        const formItemDestinationLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 12 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG600"}),
                    1: this.props.params.id
                })
                : formatMessage({id: "LANG602"}))

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
                                <span>{ formatMessage({id: "LANG1053"}) }</span>
                            )}
                        >
                            { getFieldDecorator('ringgroup_name', {
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
                                    validator: this._checkName
                                }],
                                initialValue: ring_name ? ring_name : ''
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1053"}) } maxLength="25" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG85"}) }</span>
                            )}
                        >
                            { getFieldDecorator('extension', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG85"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkNumber
                                }, {
                                    validator: this._checkIfInPort
                                }],
                                initialValue: ring_extension ? ring_extension : this.state.newRGENum
                            })(
                                <Input disabled={ this.state.disabled_exten ? true : false } placeholder={ formatMessage({id: "LANG85"}) } maxLength="25" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemTransferLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG128"}) }</span>
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
                                titles={[formatMessage({id: "LANG2484"}), formatMessage({id: "LANG2483"})]}
                            />
                        </FormItem>
                        <FormItem
                            { ...formItemTransferLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4724" />}>
                                    <span>{ formatMessage({id: "LANG714"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Transfer
                                showSearch
                                sorter={ true }
                                render={ this._renderItem }
                                targetKeys={ this.state.targetKeysLDAP }
                                dataSource={ this.state.ldapList }
                                onChange={ this._handleTransferChangeLDAP }
                                filterOption={ this._filterTransferOption }
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                onSelectChange={ this._handleTransferSelectChange }
                                searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                titles={[formatMessage({id: "LANG3214"}), formatMessage({id: "LANG3215"})]}
                            />
                        </FormItem>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG601"}) }</span>
                        </div>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>{ formatMessage({id: "LANG1061"}) }</span>
                                )}
                            >
                                { getFieldDecorator('strategy', {
                                    rules: [],
                                    initialValue: ringGroupValues.strategy ? ringGroupValues.strategy : "ORDER"
                                })(
                                    <Select>
                                        <Option value="SIMULTA">{ formatMessage({id: "LANG1062"}) }</Option>
                                        <Option value="ORDER">{ formatMessage({id: "LANG1063"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_musicclass"
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1179" />}>
                                        <span>{ formatMessage({id: "LANG1178"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('musicclass', {
                                    rules: [],
                                    initialValue: ringGroupValues.musicclass ? ringGroupValues.musicclass : ''
                                })(
                                    <Select onChange={ this._onChangeMusicClass }>
                                         <Option key="" value="">{ formatMessage({id: "LANG133"}) }</Option>
                                        {
                                            this.state.mohnameList.map(function(value, index) {
                                                return <Option value={ value } key={ index }>{ value }</Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                            <div className= { this.state.warningMusicClass ? 'display-block' : 'hidden' }>
                                <span className= "lite-desc-warning" >{ formatMessage({id: "LANG5203"}) }</span>
                            </div>
                            <FormItem
                                ref="div_custom_prompt"
                                { ...formItemPromptLayout }
                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3489" />}>
                                        <span>{ formatMessage({id: "LANG28"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                <Row>
                                    <Col span={ 16 }>
                                    { getFieldDecorator('custom_prompt', {
                                        rules: [],
                                        initialValue: ringGroupValues.custom_prompt ? ringGroupValues.custom_prompt : ''
                                    })(
                                         <Select>
                                            <Option key="" value="">{ formatMessage({id: "LANG133"}) }</Option>
                                            {
                                                this.state.fileList.map(function(item) {
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
                                    <Col span={6} offset={1} >
                                        <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                                    </Col>
                                </Row>
                            </FormItem>
                            <FormItem
                                ref="div_ringtime"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1056" />}>
                                        <span>{formatMessage({id: "LANG1055"})}</span>
                                    </Tooltip>
                                }
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
                                            Validator.minlength(data, value, callback, formatMessage, 2)
                                        }
                                    }],
                                    initialValue: ringGroupValues.ringtime ? ringGroupValues.ringtime : '60'
                                })(
                                    <Input maxLength="3" />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_auto_record"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG2544" />}>
                                        <span>{formatMessage({id: "LANG2543"})}</span>
                                    </Tooltip>
                                }
                            >
                                { getFieldDecorator('auto_record', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: ringGroupValues.auto_record === "yes"
                                })(
                                    <Checkbox onChange={ this._onChangeAutoRecord } />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_replace_caller_id"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG5073" />}>
                                        <span>{formatMessage({id: "LANG5071"})}</span>
                                    </Tooltip>
                                }
                            >
                                { getFieldDecorator('replace_caller_id', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: ringGroupValues.replace_caller_id === "yes"
                                })(
                                    <Checkbox onChange={ this._onChangeReplaceCaller } />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_enable_destination"
                                { ...formItemLayout }
                                label={
                                    <span>{formatMessage({id: "LANG2990"})}</span>
                                }
                            >
                                <Checkbox onChange={ this._onChangeEnableDestination } checked={ ringGroupValues.enable_destination === 'yes' }/>
                            </FormItem>
                            <Row>
                                <Col span={ 6 } style={{ marginRight: 20 }}>
                                    <FormItem
                                        ref="div_destination_type"
                                        { ...formItemDestinationLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2991" />}>
                                                <span>{ formatMessage({id: "LANG1558"}) }</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('destination_type', {
                                            rules: [],
                                            width: 100,
                                            initialValue: ringGroupValues.destination_type ? ringGroupValues.destination_type : 'account'
                                        })(
                                            <Select disabled = { ringGroupValues.enable_destination === 'no' } onChange={ this._onCahngeDestinationType } >
                                                <Option value='account'>{ formatMessage({id: "LANG11"}) }</Option>
                                                <Option value='voicemail'>{ formatMessage({id: "LANG20"}) }</Option>
                                                <Option value='queue'>{ formatMessage({id: "LANG24"}) }</Option>
                                                <Option value='ringgroup'>{ formatMessage({id: "LANG600"}) }</Option>
                                                <Option value='vmgroup'>{ formatMessage({id: "LANG21"}) }</Option>
                                                <Option value='ivr'>{ formatMessage({id: "LANG19"}) }</Option>
                                                <Option value='external_number'>{ formatMessage({id: "LANG3458"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 3 } style={{ marginRight: 20 }} className= { this.state.externalNumber ? 'hidden' : 'display-block' }>
                                    <FormItem
                                        ref="div_select_extension"
                                    >
                                        { getFieldDecorator('select_extension', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: ringGroupValues.enable_destination === 'yes' && !this.state.externalNumber,
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            width: 100,
                                            initialValue: this.state.destinationValuesID === this.props.params.id ? 'ringGroupNum' : this.state.destinationValuesID
                                        })(
                                             <Select disabled = { ringGroupValues.enable_destination === 'no' } onChange={ this._selectDestinationValue } >
                                                {
                                                    extensionList.map(function(item) {
                                                        return <Option key={ item.key } value={ item.key }>{ item.val }</Option>
                                                        }
                                                    )
                                                }
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 3 } style={{ marginRight: 20 }} className= { this.state.externalNumber ? 'display-block' : 'hidden' }>
                                    <FormItem
                                        ref="div_external_number"
                                    >
                                        { getFieldDecorator('external_number', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: ringGroupValues.enable_destination === 'yes' && this.state.externalNumber,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    ringGroupValues.enable_destination === 'yes' && this.state.externalNumber ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                                }
                                            }],
                                            initialValue: ringGroupValues.external_number ? ringGroupValues.external_number : ''
                                        })(
                                            <Input disabled = { ringGroupValues.enable_destination === 'no' } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                            <FormItem
                                ref="div_vmsecret"
                                { ...formItemLayout }
                                className= { this.state.voicemailDisplay ? 'display-block' : 'hidden' }
                                label={
                                    <span>{formatMessage({id: "LANG127"})}</span>
                                }
                            >
                                { getFieldDecorator('vmsecret', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.voicemailDisplay ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.voicemailDisplay ? Validator.checkNumericPw(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: ringGroupValues.vmsecret
                                })(
                                    <Input maxLength={15} />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_email"
                                { ...formItemLayout }
                                className= { this.state.voicemailDisplay ? 'display-block' : 'hidden' }
                                label={
                                    <span>{formatMessage({id: "LANG126"})}</span>
                                }
                            >
                                { getFieldDecorator('email', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.voicemailDisplay ? Validator.email(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: ringGroupValues.email
                                })(
                                    <Input maxLength={256} />
                                ) }
                            </FormItem>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(RingGroupItem))

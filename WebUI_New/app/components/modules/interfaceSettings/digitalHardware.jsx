'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import UCMGUI from "../../api/ucmgui"
import api from "../../api/api"
import _ from 'underscore'
import Validator from "../../api/validator"
import { Form, Input, Row, Col, Icon, message, Button, Select, Table, Popconfirm, Modal, Tooltip } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class DigitalHardware extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            addGroupData: {},
            lastOtherArrs: [],
            lastOtherArrLen: 0,
            editGroupData: {},
            otherChansArr: [],
            optVal: 0,
            digitalHardwareList: [],
            oldGroupName: "",
            expandedRowKeys: [""],
            ss7Settings: [],
            digitalGroupE1: [],
            digitalGroupT1: [],
            digitalGroupJ1: [],
            globalSettings: {},
            oldAlawoverride: "",
            digitalTrunkGroupIndexList: [],
            dataTrunkGroupIndexList: [],
            digitalTrunkChannelList: [],
            dataTrunkChannelList: [],
            otherTrunkChannelList: [],
            digitalTrunkChannelObj: {},
            dataTrunkChannelObj: {},
            otherChannelObj: {},
            groupSpan: 0,
            groupSpanType: "",
            groupHardhdlc: -1,
            groupIndex: "",
            digitalGroup: {},
            mfcR2Settings: {},
            priSettings: {}
        }
    }
    componentDidMount() {
        this._initTable()
        this._listDataTrunk()
        this._listDigitalTrunk()
    }
    componentWillUnmount() {
    }
    _initTable = () => {
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        if (model_info.num_pri) {
            this._getPRISettings()
            this._getDigitalHardwareSS7Settings()
            this._getDigitalHardwareR2Settings()
        }
    }
    _getPRISettings = () => {
        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "getDigitalHardwareSettings"
            },
            success: function(data) {
                if (data.status === 0) {
                    let priSettings = data.response.digital_driver_settings
                    this.state["priSettings"] = priSettings

                    this._listDigitalGroup()
                    this._renderPRITable()
                }
            }.bind(this)
        })
    }
    _getDigitalHardwareSS7Settings = () => {
        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "getDigitalHardwareSS7Settings"
            },
            success: function(data) {
                if (data.status === 0) {
                    let ss7Settings = data.response.ss7_settings
                    this.state["ss7Settings"] = ss7Settings
                }
            }.bind(this)
        })
    }
    _getDigitalHardwareR2Settings = () => {
        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "getDigitalHardwareR2Settings"
            },
            success: function(data) {
                if (data.status === 0) {
                    let mfcR2Settings = data.response.mfc_r2_settings
                    this.state["mfcR2Settings"] = mfcR2Settings
                }
            }.bind(this)
        })
    }
    _listDigitalGroup = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "listDigitalGroup"
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let digitalGroup = data.response.digital_group
                    this.state["digitalGroup"] = digitalGroup
                }
            }.bind(this)
        })
    }
    _listDataTrunk = () => {
        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "listDataTrunk"
            },
            success: function(data) {
                if (data.status === 0) {
                    let netHDLCSettings = data.response.nethdlc_settings

                    for (let i = 0; i < netHDLCSettings.length; i++) {
                        let netHDLCSettingsIndex = netHDLCSettings[i]

                        this.state.dataTrunkGroupIndexList.push(String(netHDLCSettingsIndex.group_index))
                    }
                }
            }.bind(this)
        })
    }

    _listDigitalTrunk = () => {
        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                "action": "listDigitalTrunk",
                "options": "group_index"
            },
            success: function(data) {
                let res = data.response

                if (res && data.status === 0) {
                    let digitalTrunks = res.digital_trunks

                    for (let i = 0; i < digitalTrunks.length; i++) {
                        let digitalTrunksIndex = digitalTrunks[i]

                        this.state.digitalTrunkGroupIndexList.push(String(digitalTrunksIndex.group_index))
                    }
                }
            }.bind(this)
        })
    }
    _generateGroupIndex = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            url: baseServerURl,
            async: false,
            data: {
                'action': 'getAvailableDAHDIGroupIndex',
                'group_index': ''
            },
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    this.state.groupIndex = data.response.group_index
                }
            }.bind(this)
        })
    }
    _renderPRITable = () => {
        let digitalHardwareList = [],
            priSettings = this.state.priSettings

        for (let i = 0; i < priSettings.length; i++) {
            let priSettingsIndex = priSettings[i]

            if (priSettingsIndex) {
                let totleChans = 31,
                    spanType = priSettingsIndex.span_type,
                    hardhdlc = priSettingsIndex.hardhdlc,
                    span = priSettingsIndex.span

                if (spanType === "t1" || spanType === "j1") {
                    totleChans = 24
                }

                let spanInfo = {}

                spanInfo["key"] = i + 1
                spanInfo["span"] = span
                spanInfo["spanType"] = spanType
                spanInfo["port"] = i + 1
                spanInfo["totleChans"] = totleChans
                spanInfo["hardhdlc"] = hardhdlc
                // $("<td width='30%'>").appendTo(tr).html("<span id=" + span + " type=" + spanType + " name='selecttag' class='options room_noselect' totleChans=" + totleChans + " hardhdlc=" + hardhdlc + "></span>" + "<span class='spanType'>" + spanType + "</span>");
                // $("<td width='30%'>").appendTo(tr).html(i + 1);
                // $("<td width='40%'>").appendTo(tr).html("<button type='button' class='options edit' id='PRI' span='" + span + "' localetitle='LANG738' title='Edit'></button><button type='button' class='options room_addUser' id='addGroup' span='" + JSON.stringify(spanInfo) + "' localetitle='LANG3135' title='Add Group'></button>");
                spanInfo["children"] = this._renderGroupTable(spanInfo)

                digitalHardwareList.push(spanInfo)
            }
        }
        this.setState({
            digitalHardwareList: digitalHardwareList// ,
            // expandedRowKeys: [digitalHardwareList[0].spanType]
        })
    }
    _renderGroupTable = (spanInfo) => {
        const { formatMessage } = this.props.intl

        let arr = []
        arr.push({
            key: spanInfo.port + "1",
            spanType: formatMessage({id: "LANG2887"}),
            port: formatMessage({id: "LANG101"}),
            subHeader: true
        })
        let spanId = spanInfo.span,
            spanType = spanInfo.spanType.toLowerCase(),
            digitalGroup = this.state.digitalGroup,
            digitalTrunkGroupIndexList = this.state.digitalTrunkGroupIndexList,
            dataTrunkGroupIndexList = this.state.dataTrunkGroupIndexList

        this.state.digitalGroupE1.length = 0
        this.state.digitalGroupT1.length = 0
        this.state.digitalGroupJ1.length = 0
        this.state.digitalTrunkChannelObj = {}
        this.state.dataTrunkChannelObj = {}
        this.state.otherChannelObj = {}
        this.state.digitalTrunkChannelList.length = 0
        this.state.dataTrunkChannelList.length = 0
        this.state.otherTrunkChannelList.length = 0

        for (let i = 0; i < digitalGroup.length; i++) {
            let digitalGroupIndex = digitalGroup[i]

            if (spanId === digitalGroupIndex.span) {
                // let groupTr = $("<tr>").appendTo(tbody),
                let totleChans = spanInfo.totleChans,
                    hardhdlc = spanInfo.hardhdlc,
                    groupName = digitalGroupIndex.group_name,
                    channel = digitalGroupIndex.channel,
                    groupIndex = String(digitalGroupIndex.group_index)

                if (digitalTrunkGroupIndexList.indexOf(groupIndex) !== -1) {
                    this.state.digitalTrunkChannelObj[channel] = {
                        "group_name": groupName,
                        "group_index": groupIndex,
                        "channel": channel
                    }
                    this.state.digitalTrunkChannelList.push(channel)
                } else if (dataTrunkGroupIndexList.indexOf(groupIndex) !== -1) {
                    this.state.dataTrunkChannelObj[channel] = {
                        "group_name": groupName,
                        "group_index": groupIndex,
                        "channel": channel
                    }
                    this.state.dataTrunkChannelList.push(channel)
                } else {
                    this.state.otherChannelObj[channel] = {
                        "group_name": groupName,
                        "group_index": groupIndex,
                        "channel": channel
                    }
                    this.state.otherTrunkChannelList.push(channel)
                }
                digitalGroupIndex.totleChans = totleChans
                digitalGroupIndex.hardhdlc = hardhdlc
                digitalGroupIndex.spanType = spanType

                if (spanType === "e1") {
                    this.state.digitalGroupE1.push(digitalGroupIndex)
                } else if (spanType === "t1") {
                    this.state.digitalGroupT1.push(digitalGroupIndex)
                } else if (spanType === "j1") {
                    this.state.digitalGroupJ1.push(digitalGroupIndex)
                }

                if (groupName.indexOf('DefaultGroup') > -1) {
                    // $("<td>").html("<button type='button' class='options edit' spanType='editGroup' groupInfo='" + JSON.stringify(digitalGroupIndex) + "' localetitle='LANG3135' title='Edit Group'></button><button type='button' disabled='disabled' class='options del disabled' groupName='" + groupName + "' spanType='" + spanType + "' channel='" + channel + "' hardhdlc='" + hardhdlc + "' localetitle='LANG739' title='Delete'></button>").appendTo(groupTr);
                } else {
                    // $("<td>").html("<button type='button' class='options edit' spanType='editGroup' groupInfo='" + JSON.stringify(digitalGroupIndex) + "' localetitle='LANG3135' title='Edit Group'></button><button type='button' class='options del' groupName='" + groupName + "' spanType='" + spanType + "' span='" + spanId + "' channel='" + channel + "' hardhdlc='" + hardhdlc + "' localetitle='LANG739' title='Delete'></button>").appendTo(groupTr);
                }
                arr.push({
                    key: spanInfo.port + String(i + 2),
                    span: spanInfo.span,
                    spanType: groupName,
                    port: channel,
                    spantypes: spanInfo.spanType,
                    hardhdlc: spanInfo.hardhdlc,
                    group_index: Number(groupIndex),
                    subOptions: true
                })
            }
        }
        return arr
    }
    _edit = (record) => {
        let type = "PRI",
            span = record.span,
            state = this.state

        browserHistory.push({
            pathname: '/pbx-settings/interfaceSettings/digitalHardwareItem/' + type + "/" + span,
            state: {
                ss7Settings: state.ss7Settings,
                mfcR2Settings: state.mfcR2Settings,
                priSettings: state.priSettings,
                digitalGroupE1: state.digitalGroupE1,
                digitalGroupT1: state.digitalGroupT1,
                digitalGroupJ1: state.digitalGroupJ1,
                dataTrunkChannelList: state.dataTrunkChannelList,
                digitalGroup: state.digitalGroup,
                dataTrunkChannelObj: state.dataTrunkChannelObj
            }
        })
        // let lang = "LANG780",
        //     type = $(this).attr("id")

        // if (type == "FXO") {
        //     lang = "LANG2343";
        // } else if (type == "BRI") {
        //     lang = "LANG2878";
        // } else if (type == "PRI") {
        //     let span = $(this).attr("span");

        //     lang = "LANG3096";
        //     url += "&span=" + span;
        // }
    }
    _addGroup = (record) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        let type = "addGroup",
            span = record.span

        let spanInfo = record
        this._generateGroupIndex()
        if (!_.isEmpty(spanInfo)) {
            let hardhdlc = Number(spanInfo.hardhdlc),
                digitalGroupArr = [],
                digitalGroup = this.state.digitalGroup

            for (let i = 0; i < digitalGroup.length; i++) {
                let digitalGroupIndex = digitalGroup[i]

                if (spanInfo.span === digitalGroupIndex.span) {
                    digitalGroupArr.push(digitalGroupIndex.channel)
                }
            }

            let lastArr = this._getTotalArr(digitalGroupArr)
            let otherArr = this._getOtherArr(lastArr, hardhdlc)
            let str = this._getChannelRange(otherArr)
            let strArr = str.split(",")
            let lastOtherArr = this._getGroupChannel(strArr)
            if (lastOtherArr.length === 0) {
                message.error("No channel.")
                return
            }
            let channelEle = form.getFieldValue("digital_channel")
            let lastOtherArrLen = this._getTotalNum(lastOtherArr)
            let lastOtherArrs = []

            for (let i = 1; i <= lastOtherArrLen; i++) {
                lastOtherArrs.push(i)
            }

            let useredChannel = lastOtherArr.length !== 0 ? lastOtherArr.toString() : ""

            if (!hardhdlc) {
                hardhdlc = formatMessage({ id: "LANG133"})
            }
            this.setState({
                addGroupData: record,
                lastOtherArrs: lastOtherArrs,
                lastOtherArrLen: lastOtherArrLen,
                useredChannel: useredChannel,
                hardhdlc: hardhdlc,
                oldGroupName: ""
            })
            this._showModal("addGroup", record)
        }
    }
    _onChangeDigitalChannel = (val) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const me = this

        let groupInfo = this.state.addGroupData,
            hardhdlc = Number(groupInfo.hardhdlc),
            usedchannelArr = [],
            channel = groupInfo.port,
            spanType = groupInfo.spanType,
            digitalGroup = this.state.digitalGroup,
            digitalChannelVal = Number(val)

        for (let k = 0; k < digitalGroup.length; k++) {
            let digitalGroupChannel = digitalGroup[k].channel

            if (digitalGroupChannel !== channel) {
                usedchannelArr.push(digitalGroupChannel)
            }
        }

        let otherArr = me._getOtherArr(me._getTotalArr(usedchannelArr))
        otherArr = _.without(otherArr, hardhdlc)
        let useredChannel = me._getChannel(digitalChannelVal, otherArr)

        if (!hardhdlc) {
            hardhdlc = formatMessage({ id: "LANG133" })
        }
        me.setState({
            useredChannel: useredChannel,
            hardhdlc: hardhdlc
        })
    }
    _editGroup = (record) => {
        const { formatMessage } = this.props.intl

        let type = "editGroup",
            groupInfo = record

        if (!_.isEmpty(groupInfo)) {
            let groupInfoChannel = groupInfo.port

            let hardhdlc = Number(groupInfo.hardhdlc),
                digitalGroup = this.state.digitalGroup,
                digitalGroupStr = "",
                otherOigitalGroupStr = ""

            for (let i = 0; i < digitalGroup.length; i++) {
                let digitalGroupIndex = digitalGroup[i]
                let channels = digitalGroupIndex.channel

                if (groupInfoChannel !== channels) {
                    otherOigitalGroupStr += ("," + channels)
                }
                if (groupInfo.span === digitalGroupIndex.span) {
                    digitalGroupStr += ("," + channels)
                }
            }
            let totleChans = this._getTotalChans(),
                groupInfoChanneArr = groupInfoChannel.split(","),
                optVal = this._getTotalNum(groupInfoChanneArr),
                otherOigitalGroupArr = otherOigitalGroupStr ? otherOigitalGroupStr.replace(/^,/, "").split(",") : [],
                optLen = this._getTotalNum(otherOigitalGroupArr),
                otherChansLen = totleChans - optLen,
                otherChansArr = []

            if (hardhdlc) {
                otherChansLen = otherChansLen - 1
            } else {
                hardhdlc = formatMessage({ id: "LANG133"})
            }

            for (let i = 1; i <= otherChansLen; i++) {
                otherChansArr.push(i)
            }
            this.setState({
                editGroupData: record,
                groupSpanType: record.spantypes,
                groupHardhdlc: record.hardhdlc,
                groupSpan: record.span,
                groupIndex: record.group_index,
                otherChansArr: otherChansArr,
                useredChannel: groupInfo.port,
                hardhdlc: hardhdlc,
                optVal: optVal,
                oldGroupName: groupInfo.spanType
            })
            // channelEle.attr("useredChannel", groupInfo.channel).val(optVal);

            // $("#channelDes").text($P.lang("LANG170") + " " + groupInfo.channel + " " + $P.lang("LANG3140") + hardhdlc);
        }
        this._showModal("editGroup", record)
    }
    _onChangeChannel = (val) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        const me = this

        let groupInfo = this.state.editGroupData,
            hardhdlc = Number(groupInfo.hardhdlc),
            usedchannelArr = [],
            channel = groupInfo.port,
            spanType = groupInfo.spanType,
            digitalGroup = this.state.digitalGroup,
            channelVal = val

        for (let k = 0; k < digitalGroup.length; k++) {
            let digitalGroupChannel = digitalGroup[k].channel
            if (digitalGroupChannel !== channel) {
                usedchannelArr.push(digitalGroupChannel)
            }
        }

        let otherArr = me._getOtherArr(me._getTotalArr(usedchannelArr))

        otherArr = _.without(otherArr, hardhdlc)
        let useredChannel = me._getChannel(channelVal, otherArr)

        if (!hardhdlc) {
            hardhdlc = formatMessage({ id: "LANG133" })
        }
        me.setState({
            useredChannel: useredChannel,
            hardhdlc: hardhdlc
        })
    }
    _delete = (record) => {
        const { formatMessage } = this.props.intl

        let groupName = record.spanType,
            channel = record.port,
            digitalGroupInfo = [],
            spanType = record.spantypes.toLowerCase(),
            hardhdlc = record.hardhdlc,
            digitalGroupArr = [],
            digitalGroupObj = {},
            arr = [],
            actionObj = {}

        this.state.groupSpan = record.span
        this.state.groupSpanType = spanType
        this.state.groupHardhdlc = hardhdlc

        if (spanType === "e1") {
            digitalGroupInfo = this.state.digitalGroupE1
        } else if (spanType === "t1") {
            digitalGroupInfo = this.state.digitalGroupT1
        } else if (spanType === "j1") {
            digitalGroupInfo = this.state.digitalGroupJ1
        }

        let totalChannelArr = this._getTotalChannelArr(spanType, hardhdlc)

        for (let i = 0; i < digitalGroupInfo.length; i++) {
            let obj = {},
                digitalGroupObj = {},
                digitalGroupInfoIndex = digitalGroupInfo[i],
                digitalGroupName = digitalGroupInfoIndex.group_name,
                digitalGroupIndex = digitalGroupInfoIndex.group_index,
                digitalGroupSpan = digitalGroupInfoIndex.span,
                digitalGroupChannel = digitalGroupInfoIndex.channel,
                originChannelLength = this._getTotalNum(digitalGroupChannel ? digitalGroupChannel.split(",") : [])

            if ((spanType === digitalGroupInfoIndex.spanType) && (groupName === digitalGroupName)) {
                obj["channel"] = ''
                digitalGroupObj["channel"] = ''
            } else if (spanType === digitalGroupInfoIndex.spanType) {
                digitalGroupChannel = this._getChannel(originChannelLength, totalChannelArr)

                obj["channel"] = digitalGroupChannel
                digitalGroupObj["channel"] = digitalGroupChannel
            }

            obj["group_name"] = digitalGroupName

            obj["group_index"] = digitalGroupIndex
            digitalGroupObj["group_index"] = digitalGroupIndex
            digitalGroupObj["span"] = digitalGroupSpan
            arr.push(obj)
            digitalGroupArr.push(digitalGroupObj)
        }

        actionObj["group"] = arr
        this.state.digitalGroup = digitalGroupArr

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                action: "updateAllDigitalGroup",
                group: JSON.stringify(actionObj)
            },
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    if (this._isModifyGroupChanneOfDataTrunk()) {
                        Modal.confirm({
                            content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG927" })}}></span>,
                            okText: formatMessage({id: "LANG727"}),
                            cancelText: formatMessage({id: "LANG726"}),
                            onOk: this._applyChangeAndReboot.bind(this),
                            onCancel: this._getPRISettings.bind(this)
                        })
                    } else {
                        message.destroy()
                        message.success(<span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG816" }) }}
                                    ></span>)
                        this._getPRISettings()
                    }
                }
            }.bind(this)
        })
    }
    _applyChangeAndReboot = () => {
        const { formatMessage } = this.props.intl

        message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG832" })}}></span>, 0)

        UCMGUI.loginFunction.confirmReboot()
    }
    _isModifyGroupChanneOfDataTrunk() {
        let flag = false,
            spanType = this.state.groupSpanType,
            hardhdlc = Number(this.state.groupHardhdlc),
            groupInfoSpan = Number(this.state.groupSpan),
            digitalGroup = this.state.digitalGroup,
            dataTrunkChannelObj = this.state.dataTrunkChannelObj

        let totalChannelArr = this._getTotalChannelArr(spanType, hardhdlc)

        for (let i = 0; i < digitalGroup.length; i++) {
            let digitalGroupIndex = digitalGroup[i],
                channel = digitalGroupIndex.channel,
                groupIndex = digitalGroupIndex.group_index,
                originChannelLength = this._getTotalNum(channel ? channel.split(",") : [])

            if ((groupInfoSpan === digitalGroupIndex.span) && (typeof groupIndex === "undefined")) {
                // let currentChannelLength = Number($("#channel").val())

                // channel = this._getChannel(currentChannelLength, totalChannelArr)
            } else if (groupInfoSpan === digitalGroupIndex.span) {
                channel = this._getChannel(originChannelLength, totalChannelArr)
            }
            if (!_.isEmpty(dataTrunkChannelObj)) {
                for (let prop in dataTrunkChannelObj) {
                    if (dataTrunkChannelObj.hasOwnProperty(prop)) {
                        let dataTrunkChannelObjProp = dataTrunkChannelObj[prop],
                            propGroupIndex = Number(dataTrunkChannelObjProp["group_index"]),
                            propChannel = dataTrunkChannelObjProp["channel"]

                        if ((propGroupIndex === groupIndex) && (propChannel !== this.state.useredChannel)) {
                            flag = true
                            break
                        }
                    }
                }
            }
            if (flag) {
                break
            }
        }
        return flag
    }
    _getTotalChannelArr = (spanTypes, hardhdlcs) => {
        let totalChannelLen = 0,
            totalChannelArr = [],
            hardhdlc = Number(hardhdlcs),
            spanType = spanTypes.toLowerCase()

        if (spanType === "e1") {
            totalChannelLen = 31
        } else if (spanType === "t1" || spanType === "j1") {
            totalChannelLen = 24
        }

        for (let j = 1; j <= totalChannelLen; j++) {
            if (hardhdlc !== j) {
                totalChannelArr.push(j)
            }
        }
        return totalChannelArr
    }
    _getTotalNum = (arr) => {
        let num = 0

        for (let k = 0; k < arr.length; k++) {
            let index = arr[k]

            if (/-/.test(index)) {
                let first = index.match(/^\d+/),
                    last = index.match(/\d+$/)
                if (first && last) {
                    first = Number(first[0])
                    last = Number(last[0])
                    num += (last - first + 1)
                }
            } else {
                num += 1
            }
        }
        return num
    }
    _getChannel = (length, arr) => {
        let curentChansArr = arr.splice(0, length),
            str = this._getChannelRange(curentChansArr),
            strArr = str.split(",")

        return this._getGroupChannel(strArr).toString()
    }
    _getChannelRange = (arr) => {
        let str = ""

        for (let i = 0; i < arr.length; i++) {
            let before = Number(arr[i]),
                after = Number(arr[i + 1])

            if ((before + 1) !== after) {
                str += (before + ",")
            } else {
                str += (before + "-")
            }
        }
        return str
    }
    _getGroupChannel = (arr) => {
        let lastArr = []

        for (let i = 0; i < arr.length; i++) {
            let strArrIndex = arr[i]

            if (/-/.test(strArrIndex)) {
                let first = strArrIndex.match(/^\d+/),
                    last = strArrIndex.match(/\d+$/)

                if (first && last) {
                    lastArr.push(first[0] + "-" + last[0])
                }
            } else if (strArrIndex) {
                lastArr.push(strArrIndex)
            }
        }
        return lastArr
    }
    _getOtherArr = (arr, hardhdlc) => {
        let totalChansLen = this._getTotalChans(),
            otherArr = []

        for (let l = 1; l <= totalChansLen; l++) {
            let index = arr[l]

            if (arr.indexOf(String(l)) === -1) {
                if (l !== hardhdlc) {
                    otherArr.push(l)
                }
            }
        }
        return otherArr
    }
    _getTotalArr = (arr) => {
        let totalArr = []

        for (let i = 0; i < arr.length; i++) {
            let index = arr[i],
                indexArr = []

            if (/,/.test(index)) {
                indexArr = index.split(",")
            }
            if (indexArr.length === 0) {
                totalArr = totalArr.concat(this._getEndTotalArr(index))
            } else {
                for (let j = 0; j < indexArr.length; j++) {
                    let indexArrIndex = indexArr[j]
                    totalArr = totalArr.concat(this._getEndTotalArr(indexArrIndex))
                }
            }
        }
        return totalArr
    }
    _getEndTotalArr = (str) => {
        let endTotalArr = []

        if (/-/.test(str)) {
            let match = str.match(/(\d+)-(\d+)/)

            if (match[1] && match[2]) {
                let matchFirst = Number(match[1]),
                    matchSecon = Number(match[2])

                for (let j = 0; j < (matchSecon - matchFirst + 1); j++) {
                    endTotalArr.push(String(matchFirst + j))
                }
            }
        } else if (str) {
            endTotalArr.push(str)
        }
        return endTotalArr
    }
    _getTotalChans = () => {
        let totleChans = 31,
            priSettingsInfo = this.state.priSettings

        for (let i = 0; i < priSettingsInfo.length; i++) {
            let priSettingsInfoIndex = priSettingsInfo[i],
                spanType = priSettingsInfoIndex.span_type

            if (spanType.toLowerCase() === "t1" || spanType.toLowerCase() === "j1") {
                totleChans = 24
            }
        }
        return totleChans
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl

        if (record.children) {
            return <div>
                    <span className="sprite sprite-edit" title={formatMessage({ id: "LANG738" })} onClick={ this._edit.bind(this, record) }></span>
                    <span className="sprite sprite-addGroup" title={formatMessage({ id: "LANG3135" })} onClick={ this._addGroup.bind(this, record) }></span>
                </div>
        } else {
            if (record.subHeader) {
                return <div>
                    { formatMessage({
                        id: "LANG74"
                    })}
                </div>
            } else if (record.subOptions) {
                if (record.spanType.indexOf('DefaultGroup') > -1) {
                    return <div>
                        <span className="sprite sprite-edit" title={formatMessage({ id: "LANG3135" })} onClick={ this._editGroup.bind(this, record) }></span>
                        <span className="sprite sprite-del sprite-del-disabled" title={ formatMessage({ id: "LANG739" }) }></span>
                    </div>
                }
                return <div>
                    <span className="sprite sprite-edit" title={formatMessage({ id: "LANG3135" })} onClick={ this._editGroup.bind(this, record) }></span>
                    <Popconfirm
                        title={ <span dangerouslySetInnerHTML=
                                    {{ __html: formatMessage({ id: "LANG818" }, { 0: record.spanType }) }}
                                ></span> }
                        okText={ formatMessage({id: "LANG727"}) }
                        cancelText={ formatMessage({id: "LANG726"}) }
                        onConfirm={ this._delete.bind(this, record) }>
                        <span className="sprite sprite-del" title={ formatMessage({ id: "LANG739" }) }></span>
                    </Popconfirm>
                </div>
            }
        }
    }
    _showModal = (type, record) => {
        this.setState({
            visible: true,
            type: type
        })
    }
    _renderModalTitle = () => {
        const { formatMessage } = this.props.intl

        let type = this.state.type

        if (type === "addGroup") {
            return formatMessage({ id: "LANG3135" })
        } else {
            return formatMessage({ id: "LANG3136" })
        }
    }
    _handleOk = () => {
        if (this.state.type === "editGroup") {
            this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
                if (err && err.hasOwnProperty('group_name')) {

                } else {
                    this.setState({
                        visible: false
                    })
                    this._updateGroupInfo()
                }
            })
        } else if (this.state.type === "addGroup") {
                this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
                if (err && err.hasOwnProperty('digital_group_name')) {

                } else {
                    this.setState({
                        visible: false
                    })
                    this._updateGroup()
                }
            })
        }
    }
    _handleCancel = () => {
        const { resetFields } = this.props.form
        this.setState({
            visible: false
        })
        resetFields()
    }
    _updateGroup = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let action = {},
            spanInfo = this.state.addGroupData

        action["span"] = spanInfo.span
        action["group_name"] = form.getFieldValue("digital_group_name")
        action["group_index"] = this.state.groupIndex
        action["channel"] = this.state.useredChannel
        action["action"] = "addDigitalGroup"

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.success(<span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG4782" }) }}
                                    ></span>)
                    this._getPRISettings()
                    this.props.form.resetFields()
                }
            }.bind(this)
        })
    }
    _updateGroupInfo = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let action = {},
            groupInfo = this.state.editGroupData,
            digitalGroup = this.state.digitalGroup,
            arr = [],
            actionObj = {},
            spanType = groupInfo.spantypes,
            hardhdlc = Number(groupInfo.hardhdlc)

        let totalChannelArr = this._getTotalChannelArr(spanType, hardhdlc)

        for (let i = 0; i < digitalGroup.length; i++) {
            let digitalGroupIndex = digitalGroup[i],
                channel = digitalGroupIndex.channel,
                groupName = digitalGroupIndex.group_name,
                groupIndex = digitalGroupIndex.group_index,
                obj = {},
                originChannelLength = this._getTotalNum(channel ? channel.split(",") : [])

            if ((groupInfo.span === digitalGroupIndex.span) && (groupInfo.group_index === groupIndex)) {
                let currentChannelLength = Number(form.getFieldValue("channel"))
                channel = this._getChannel(currentChannelLength, totalChannelArr)
                obj["group_name"] = form.getFieldValue("group_name")
            } else if (groupInfo.span === digitalGroupIndex.span) {
                channel = this._getChannel(originChannelLength, totalChannelArr)
                obj["group_name"] = groupName
            }

            obj["group_index"] = groupIndex
            obj["channel"] = channel
            arr.push(obj)
        }

        action["action"] = "updateAllDigitalGroup"
        actionObj["group"] = arr
        action["group"] = JSON.stringify(actionObj)

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    if (this._isModifyGroupChanneOfDataTrunk()) {
                        Modal.confirm({
                            content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG927" })}}></span>,
                            okText: formatMessage({id: "LANG727"}),
                            cancelText: formatMessage({id: "LANG726"}),
                            onOk: this._applyChangeAndReboot.bind(this),
                            onCancel: this._getPRISettings.bind(this)
                        })
                    } else {
                        message.success(<span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG4782" }) }}
                                    ></span>)
                        this._getPRISettings()
                    }
                    this.props.form.resetFields()
                }
            }.bind(this)
        })
    }
    _checkIfDefaultName = (data, value, callback, errMsg) => {
        let isDefault = true

        if (value && value.indexOf('DefaultGroup') > -1 && this.state.oldGroupName.indexOf('DefaultGroup') === -1) {
            callback(errMsg)
        } else {
            callback()
        }
    }
    _digitalGroupNameIsExist = (data, value, callback, errMsg) => {
        let digitalGroupNameList = [],
            digitalGroup = this.state.digitalGroup,
            groupInfoSpan = this.state.addGroupData.span

        for (let i = 0; i < digitalGroup.length; i++) {
            let digitalGroupIndex = digitalGroup[i]

            if (groupInfoSpan === digitalGroupIndex.span) {
                digitalGroupNameList.push(digitalGroupIndex.group_name)
            }
        }

        if (_.find(digitalGroupNameList, (num) => {
            return (num === value && this.state.digitalGroup.digital_group_name !== value)
        })) {
            callback(errMsg)
        } else {
            callback()
        }
    }
    _groupNameIsExist = (data, value, callback, errMsg) => {
        let state = this.state

        let groupNameList = [],
            group = {},
            spantypes = this.state.editGroupData.spantypes,
            spanType = spantypes ? spantypes.toLowerCase() : ""

        if (spanType === "e1") {
            group = state.digitalGroupE1
        } else if (spanType === "t1") {
            group = state.digitalGroupT1
        } else if (spanType === "j1") {
            group = state.digitalGroupJ1
        }

        for (let i = 0; i < group.length; i++) {
            let groupIndex = group[i]
            groupNameList.push(groupIndex.group_name)
        }

        if (_.find(groupNameList, (num) => {
            return (num === value && this.state.editGroupData.spanType !== value)
        })) {
            callback(errMsg)
        } else {
            callback()
        }
    }
    _renderModalOkText = () => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG770" })
    }
    _renderModalCancelText = () => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG726" })
    }
    render() {
        const {formatMessage} = this.props.intl
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }
        const state = this.state

        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const columns = [
            {
                key: 'spanType',
                dataIndex: 'spanType',
                title: formatMessage({id: "LANG84"})
            }, {
                key: 'port',
                dataIndex: 'port',
                title: formatMessage({id: "LANG237"})
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }
        ]

        // rowSelection objects indicates the need for row selection
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
                this.setState({ selectedRowKeys, selectedRows })
            },
            onSelect: (record, selected, selectedRows) => {
                console.log(record, selected, selectedRows)
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                console.log(selected, selectedRows, changeRows)
            }
        }

        return (
            <div className="content no-pagination">
                <Table
                    bordered
                    rowSelection={ undefined }
                    rowKey={ record => record.spanType }
                    columns={ columns }
                    dataSource={ state.digitalHardwareList }
                    showHeader={ !!state.digitalHardwareList.length }
                />
                <Modal
                    title={ this._renderModalTitle() }
                    visible={ this.state.visible }
                    onOk={ this._handleOk }
                    onCancel={ this._handleCancel }
                    okText={ this._renderModalOkText() }
                    cancelText={ this._renderModalCancelText() }>
                    <Form>
                        <div ref="digital_group_container" className={ this.state.type === "addGroup" ? "display_block" : "hidden"}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3137" /> }>
                                            <span>{ formatMessage({id: "LANG2887"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('digital_group_name', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 2)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let errMsg = formatMessage({id: "LANG2786"})
                                            this._checkIfDefaultName(data, value, callback, errMsg)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let errMsg = formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG2887"})})
                                            this._digitalGroupNameIsExist(data, value, callback, errMsg)
                                        }
                                    }],
                                    initialValue: ""
                                })(
                                    <Input maxLength="32" />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3139" /> }>
                                            <span>{ formatMessage({id: "LANG3138"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('digital_channel', {
                                    rules: [],
                                    initialValue: this.state.lastOtherArrLen
                                })(
                                    <Select style={{ width: '20%', marginRight: 8 }} onSelect={ this._onChangeDigitalChannel }>
                                        {
                                            this.state.lastOtherArrs.map(function(it) {
                                                const val = it
                                                return <Option key={ val } value={ val }>
                                                       { val }
                                                    </Option>
                                            })
                                        }
                                    </Select>
                                ) }
                                <span ref="digital_channelDes">{ formatMessage({ id: "LANG170" }) + " " + this.state.useredChannel + " " + formatMessage({ id: "LANG3140" }) + this.state.hardhdlc }</span>
                            </FormItem>
                        </div>
                        <div ref="edit_group_container" className={ this.state.type === "editGroup" ? "display_block" : "hidden"}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3137" /> }>
                                            <span>{ formatMessage({id: "LANG2887"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('group_name', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 2)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let errMsg = formatMessage({id: "LANG2786"})
                                            this._checkIfDefaultName(data, value, callback, errMsg)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let errMsg = formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG2887"})})
                                            this._groupNameIsExist(data, value, callback, errMsg)
                                        }
                                    }],
                                    initialValue: this.state.editGroupData.spanType
                                })(
                                    <Input maxLength="32" disabled={this.state.oldGroupName.indexOf('DefaultGroup') > -1 ? true : false} />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3139" /> }>
                                            <span>{ formatMessage({id: "LANG3138"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('channel', {
                                    rules: [],
                                    initialValue: this.state.optVal
                                })(
                                    <Select style={{ width: '20%', marginRight: 8 }} onSelect={ this._onChangeChannel }>
                                    {
                                        this.state.otherChansArr.map(function(it) {
                                            const val = it
                                            return <Option key={ val } value={ val }>
                                                   { val }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                                <span ref="channelDes">{ formatMessage({ id: "LANG170" }) + " " + this.state.useredChannel + " " + formatMessage({ id: "LANG3140" }) + this.state.hardhdlc }</span>
                            </FormItem>
                        </div>
                    </Form>
                </Modal>
            </div>
        )
    }
}

module.exports = Form.create()(injectIntl(DigitalHardware))

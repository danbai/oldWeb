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
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class BasicSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            div_mfcr2ForcedRelease_style: "hidden",
            framingOpts: [],
            hardhdlcOpts: [],
            codingOpts: [],
            crcOpts: [],
            signallingOpts: [{
                val: "pri_net",
                text: "PRI_NET"
            }, {
                val: "pri_cpe",
                text: "PRI_CPE"
            }, {
                val: "ss7",
                text: "SS7"
            }, {
                val: "mfcr2",
                text: "MFC/R2"
            }],
            div_crc_style: "display-block",
            collectCall: false,
            div_hardhdlc_style: "hidden",
            firstSpanTypeLoad: true,
            firstSignallingLoad: true,
            firstMfcr2VariantLoad: true,
            mfcr2GeAniFirstValue: false,
            dataTrunkGroupIndexList: [],
            spanTypeFirstLoad: true,
            signallingFirstLoad: true,
            mfcr2VariantFirstLoad: true
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this.props.getRefs(this.refs)
        this._initVal()
        this._getlistDataTrunk()
    }
    _checkPointCode = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const ss7type = getFieldValue('ss7type')
        const defaultdpc = getFieldValue('defaultdpc')

        if (!value) {
            callback()
            return
        }

        if (ss7type === 'itu') {
            if (!value) {
                callback()
            } else if (value && !/^\d+$/i.test(value)) {
                callback(formatMessage({id: "LANG2157"}))
            } else if (Number(value) > 16383 || Number(value) < 0) {
                callback(formatMessage({id: "LANG2147"}, {0: 0 + '', 1: 16383 + ''}))
            } else {
                if (defaultdpc === value) {
                    callback(formatMessage({id: "LANG3263"}, {0: formatMessage({id: "LANG3257"}), 1: formatMessage({id: "LANG3259"})}))
                } else {
                    callback()
                }
            }
        } else {
            if (!((/^\d+$/.test(value) && (Number(value) >= 0 && Number(value) <= 16777215)) || /^([0-9]|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(value))) {
                callback(formatMessage({id: "LANG3459"}, {0: '0', 1: '16777215', 2: '0', 3: '255'}))
            } else if (defaultdpc === value) {
                    callback(formatMessage({id: "LANG3263"}, {0: formatMessage({id: "LANG3257"}), 1: formatMessage({id: "LANG3259"})}))
            } else {
                callback()
            }
        }
    }
    _checkDefaultPc = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const ss7type = getFieldValue('ss7type')
        const pointcode = getFieldValue('pointcode')

        if (!value) {
            callback()
            return
        }

        if (ss7type === 'itu') {
            if (!value) {
                callback()
            } else if (value && !/^\d+$/i.test(value)) {
                callback(formatMessage({id: "LANG2157"}))
            } else if (Number(value) > 16383 || Number(value) < 0) {
                callback(formatMessage({id: "LANG2147"}, {0: 0 + '', 1: 16383 + ''}))
            } else {
                if (pointcode === value) {
                    callback(formatMessage({id: "LANG3263"}, {0: formatMessage({id: "LANG3259"}), 1: formatMessage({id: "LANG3257"})}))
                } else {
                    callback()
                }
            }
        } else {
            if (!((/^\d+$/.test(value) && (Number(value) >= 0 && Number(value) <= 16777215)) || /^([0-9]|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(value))) {
                callback(formatMessage({id: "LANG3459"}, {0: '0', 1: '16777215', 2: '0', 3: '255'}))
            } else if (pointcode === value) {
                callback(formatMessage({id: "LANG3263"}, {0: formatMessage({id: "LANG3259"}), 1: formatMessage({id: "LANG3257"})}))
            } else {
                callback()
            }
        }
    }
    _checkCICBeginWith = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const ss7type = getFieldValue('ss7type')
        const span_type = getFieldValue('span_type')
        if (!value) {
            callback(formatMessage({id: "LANG2150"}))
        } else if (!/^\d+$/i.test(value)) {
            callback(formatMessage({id: "LANG2157"}))
        } else {
            let min = 0
            let max = 4072
            if (span_type === 'E1') {
                if (ss7type === 'ansi') {
                    max = 16353
                } else {
                    max = 4065
                }
            } else {
                if (ss7type === 'ansi') {
                    max = 16360
                } else {
                    max = 4072
                }
            }
            if (Number(value) > max || Number(value) < min) {
                callback(formatMessage({id: "LANG2147"}, {0: min + '', 1: max + ''}))
            } else {
                callback()
            }
        }
    }
    _initVal = () => {
        const form = this.props.form

        if (form.getFieldValue("mfcr2_variant") === "br") {
            this.setState({
                div_mfcr2ForcedRelease_style: "display-block",
                hardhdlcOpts: this.props.hardhdlcOpts
            })
        } else {
            this.setState({
                div_mfcr2ForcedRelease_style: "hidden",
                hardhdlcOpts: this.props.hardhdlcOpts
            })
        }
    }
    _onChangeMfcr2GetAniFirst = (e) => {
        this.props.getSonState({
            mfcr2GetAniFirstChecked: e.target.checked
        })
        this.setState({
            mfcr2GeAniFirstValue: e.target.checked
        })
    }
    _getlistDataTrunk = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'listDataTrunk' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let dataTrunkGroupIndexList = []
                    let response = res.response || {}
                    let netHDLCSettings = response.nethdlc_settings

                    for (let i = 0; i < netHDLCSettings.length; i++) {
                        let netHDLCSettingsIndex = netHDLCSettings[i]
                        if (netHDLCSettingsIndex.group_index) {
                            dataTrunkGroupIndexList.push(String(netHDLCSettingsIndex.group_index))
                        }
                    }
                    this.setState({
                        dataTrunkGroupIndexList: dataTrunkGroupIndexList
                    })
                    console.log('listDataTrunk is  ', dataTrunkGroupIndexList)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _isChangeSignalling = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value === "mfcr2" || value === "em" || value === "em_w") {
            let totalArr = this.state.dataTrunkGroupIndexList

            if (totalArr.length !== 0) {
                callback(formatMessage({id: "LANG3979"}))
            } else {
                callback()
            }
        } else {
            callback()
        }
    }
    _onChangeSignalling = (value) => {
        let stateObj = this._changeSignallingGetState(value)
        this.setState(stateObj.selfStateObj, () => {
            this._changeSignallingSetFieldsValue(value)
        })
        this.props.getSonState(stateObj.sonStateObj)
        this.props.priSettingsInfo.mfcr2_variant = "itu"
    }
    _changeSignallingSetFieldsValue = (value) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let parentState = this.props.parentState,
            hardhdlcEle = this.refs.hardhdlc,
            // opts = hardhdlcEle.children(),
            // noneOpt = hardhdlcEle.children().filter("[value=0]"),
            flag = true,
            oldCoding = parentState.oldCoding,
            oldSingnaling = parentState.oldSingnaling,
            oldHardhdlc = parentState.oldHardhdlc

        if (value === "ss7") {
            let totleChans = this.props.getTotalChans(),
                dataTrunkChansArr = this.props.getDataTrunkChansArr(),
                allChansArr = this.props.getTotalArr(dataTrunkChansArr)

            // if ((allChansArr.length + 1) >= totleChans && noneOpt.length == 0) {
            //     hardhdlcEle.prepend("<option value='0'>" + $P.lang("LANG133") + "</option>");
            // } else if ((allChansArr.length + 1) < totleChans) {
            //     noneOpt.remove()
            // }
            // for (let i = 0; i < opts.length; i++) {
            //     let index = opts[i]
            //     index.disabled = false
            // }

            let ss7Settings = parentState.ss7Settings[0]
            if (ss7Settings) {
                form.setFieldsValue({
                    ss7_called_nai: ss7Settings["ss7_called_nai"],
                    ss7_calling_nai: ss7Settings["ss7_calling_nai"],
                    internationalprefix: ss7Settings["ss7_internationalprefix"],
                    nationalprefix: ss7Settings["ss7_nationalprefix"],
                    subscriberprefix: ss7Settings["ss7_subscriberprefix"],
                    unknownprefix: ss7Settings["ss7_unknownprefix"]
                })
            }
        } else if (value === "mfcr2") {

        } else if (value === "em" || value === "em_w") {
        } else {
            let totleChans = this.props.getTotalChans(),
                dataTrunkChansArr = this.props.getDataTrunkChansArr(),
                allChansArr = this.props.getTotalArr(dataTrunkChansArr)

            // if ((allChansArr.length + 1) >= totleChans && noneOpt.length == 0) {
            //     hardhdlcEle.prepend("<option value='0'>" + $P.lang("LANG133") + "</option>");
            // } else if ((allChansArr.length + 1) < totleChans) {
            //     noneOpt.remove();
            // }
            // for (let i = 0; i < opts.length; i++) {
            //     let index = opts[i];
            //     index.disabled = false;
            // }
        }
        let spanTypeVal = form.getFieldValue("span_type")

        if (spanTypeVal === "E1") {
            if (value !== "mfcr2") {
                form.setFieldsValue({
                    hardhdlc: "16"
                })
            }
        }
        if ((spanTypeVal === "T1" || spanTypeVal === "J1") && flag) {
            // if (form.getFieldValue("hardhdlc") !== oldHardhdlc && oldHardhdlc !== "0") {
            //     form.setFieldsValue({
            //         hardhdlc: oldHardhdlc
            //     })
            // } else {
                form.setFieldsValue({
                    hardhdlc: "24"
                })
            // }
        }

        form.setFieldsValue({
            coding: oldCoding
        })

        if (value === "mfcr2") {
            form.setFieldsValue({
                hardhdlc: "16"
            })
        } else if (value === "em" || value === "em_w") {
            form.setFieldsValue({
                hardhdlc: "0"
            })
        }

        if (spanTypeVal === "T1" || spanTypeVal === "J1") {
            if (oldCoding === "hdb3") {
                form.setFieldsValue({
                    coding: "b8zs"
                })
            }
        } else {
            if (oldCoding === "b8zs") {
                form.setFieldsValue({
                    coding: "hdb3"
                })
            }
        }
        parentState.oldSingnaling = value
    }
    _changeSignallingGetState = (value, spanType) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let parentState = this.props.parentState,
            hardhdlcEle = this.refs.hardhdlc,
            // opts = hardhdlcEle.children(),
            // noneOpt = hardhdlcEle.children().filter("[value=0]"),
            flag = true,
            oldCoding = parentState.oldCoding,
            stateObj = {
                selfStateObj: {},
                sonStateObj: {}
            }

        if (value === "ss7") {
            let totleChans = this.props.getTotalChans(),
                dataTrunkChansArr = this.props.getDataTrunkChansArr(),
                allChansArr = this.props.getTotalArr(dataTrunkChansArr)

            _.extend(stateObj.selfStateObj, {
                div_hardhdlc_style: "display-block"
            })

            // if ((allChansArr.length + 1) >= totleChans && noneOpt.length == 0) {
            //     hardhdlcEle.prepend("<option value='0'>" + $P.lang("LANG133") + "</option>");
            // } else if ((allChansArr.length + 1) < totleChans) {
            //     noneOpt.remove()
            // }
            // for (let i = 0; i < opts.length; i++) {
            //     let index = opts[i]
            //     index.disabled = false
            // }

            let ss7Settings = parentState.ss7Settings[0]

            let showEles = ["div_ss7Options", "div_callerIdPrefix", "div_SS7dialplan", "div_codec", "div_subscriberprefix", "div_lbo", "div_rtx"],
                hideEles = ["div_mfcR2", "div_priT310", "div_switchtype", "div_localprefix", "div_privateprefix", "div_special", "div_pridialplan",
                            "div_R2Advanced", "otherAdvanced_btn", "div_priPlayLocalRbt", "div_mfcr2PlayLocaRbt", "div_em_immediate", "div_em_w_outgoing"],
                showElesObj = {},
                hideElesObj = {}
            showEles.map(function(it) {
                showElesObj[it + "_style"] = "display-block"
            })
            hideEles.map(function(it) {
                hideElesObj[it + "_style"] = "hidden"
            })

            showElesObj = _.extend(hideElesObj, showElesObj)
            // this.setState(showElesObj)
            _.extend(stateObj.sonStateObj, showElesObj)
        } else if (value === "mfcr2") {
            let showEles = ["div_mfcR2", "div_R2Advanced", "otherAdvanced_btn", "div_mfcr2PlayLocaRbt", "div_lbo", "div_rtx"],
                hideEles = ["div_special", "div_priT310", "div_ss7Options", "div_switchtype", "div_callerIdPrefix", "div_pridialplan",
                            "div_SS7dialplan", "div_codec", "div_priPlayLocalRbt", "div_em_immediate", "div_em_w_outgoing"],
                showElesObj = {},
                hideElesObj = {}

            _.extend(stateObj.selfStateObj, {
                div_hardhdlc_style: "hidden"
            })
            showEles.map(function(it) {
                showElesObj[it + "_style"] = "display-block"
            })
            hideEles.map(function(it) {
                hideElesObj[it + "_style"] = "hidden"
            })
            showElesObj = _.extend(hideElesObj, showElesObj)
            // this.setState(showElesObj)
            _.extend(stateObj.sonStateObj, showElesObj)
        } else if (value === "em" || value === "em_w") {
            let showEles = ["div_em_immediate"],
                hideEles = ["div_mfcR2", "div_priT310", "div_ss7Options", "div_lbo", "div_R2Advanced", "otherAdvanced_btn",
                            "div_subscriberprefix", "div_priPlayLocalRbt", "div_mfcr2PlayLocaRbt", "div_SS7dialplan", "div_callerIdPrefix",
                            "div_switchtype", "div_pridialplan", "div_special"],
                showElesObj = {},
                hideElesObj = {}
            this.setState({
                div_hardhdlc_style: "hidden"
            })
            if (value === "em_w") {
                showEles.push("div_em_w_outgoing")
            } else {
                hideEles.push("div_em_w_outgoing")
            }
            flag = false

            showEles.map(function(it) {
                showElesObj[it + "_style"] = "display-block"
            })
            hideEles.map(function(it) {
                hideElesObj[it + "_style"] = "hidden"
            })

            showElesObj = _.extend(hideElesObj, showElesObj)
            // this.setState(showElesObj)
            _.extend(stateObj.sonStateObj, showElesObj)
        } else {
            let totleChans = this.props.getTotalChans(),
                dataTrunkChansArr = this.props.getDataTrunkChansArr(),
                allChansArr = this.props.getTotalArr(dataTrunkChansArr)

            _.extend(stateObj.selfStateObj, {
                div_hardhdlc_style: "display-block"
            })

            // if ((allChansArr.length + 1) >= totleChans && noneOpt.length == 0) {
            //     hardhdlcEle.prepend("<option value='0'>" + $P.lang("LANG133") + "</option>");
            // } else if ((allChansArr.length + 1) < totleChans) {
            //     noneOpt.remove();
            // }
            // for (let i = 0; i < opts.length; i++) {
            //     let index = opts[i];
            //     index.disabled = false;
            // }

            let showEles = ["div_switchtype", "div_priT310", "div_localprefix", "div_privateprefix", "div_special", "div_hardhdlc",
                            "div_callerIdPrefix", "div_pridialplan", "div_codec", "div_priPlayLocalRbt", "div_lbo", "div_rtx"],
                hideEles = ["div_mfcR2", "div_ss7Options", "div_R2Advanced", "otherAdvanced_btn", "div_subscriberprefix",
                            "div_SS7dialplan", "div_mfcr2PlayLocaRbt", "div_em_immediate", "div_em_w_outgoing"],
                showElesObj = {},
                hideElesObj = {},
                spanTypeVal = form.getFieldValue("span_type")

            if (spanTypeVal === "E1") {
                showEles.push("div_crc")
            }
            if (spanTypeVal === "T1" || spanTypeVal === "J1") {
                hideEles.push("div_crc")
            }

            showEles.map(function(it) {
                showElesObj[it + "_style"] = "display-block"
            })
            hideEles.map(function(it) {
                hideElesObj[it + "_style"] = "hidden"
            })

            showElesObj = _.extend(hideElesObj, showElesObj)
            _.extend(stateObj.sonStateObj, showElesObj)
        }
        let spanTypeVal = spanType ? spanType : form.getFieldValue("span_type")

        if (spanTypeVal === "E1") {
            let framingOpts = [],
                oldHardhdlc = parentState.oldHardhdlc

                // if (form.getFieldValue("hardhdlc") !== oldHardhdlc && oldHardhdlc !== "0") {
                //     form.setFieldsValue({
                //         hardhdlc: oldHardhdlc
                //     })
                // } else {
                    form.setFieldsValue({
                        hardhdlc: "16"
                    })
                // }

            if (value === 'mfcr2') {
                framingOpts = [{
                    val: "cas"
                }]
                this.props.priSettingsInfo.framing = "cas"
            } else {
                framingOpts = [{
                    val: "ccs"
                }]
                this.props.priSettingsInfo.framing = "ccs"
            }

            _.extend(stateObj.selfStateObj, {
                framingOpts: framingOpts
            })
        }
        return stateObj
    }
    _onChangeFraming = (val) => {
        this.props.parentState.oldFraming = val
    }
    _onChangeMfcr2Variant = (val) => {
        let stateObj = this._changeMfcr2VariantGetState(val)
        this.setState(stateObj.selfStateObj, () => {
            this._changeMfcr2VariantSetFieldsValue()
        })
        this.props.priSettingsInfo.mfcr2_variant = val
        this.props.getSonState(
            _.extend(stateObj.sonStateObj, {
                mfcr2VariantVal: val
            })
        )
        this.props.parentState.mfcr2_variant = val
    }
    _changeMfcr2VariantSetFieldsValue = (val) => {
        const form = this.props.form

        if (val === "ve") {
            form.setFieldsValue({
               mfcr2_get_ani_first: true
            })
        }

        if (val === "br") {
        } else {
            if (form.getFieldValue("mfcr2_category") === "collect_call") {
                form.setFieldsValue({
                    mfcr2_category: "national_subscriber"
                })
            }
        }
        let mfcR2Settings = this.props.parentState.mfcR2Settings[0]

        if (val === "ve") {
            form.setFieldsValue({
                mfcr2_get_ani_first: true
            })
        }

        if (mfcR2Settings) {
            if (form.getFieldValue("mfcr2_variant") === mfcR2Settings.mfcr2_variant) {
                let mfcr2GetAniFirstVal = (mfcR2Settings.mfcr2_get_ani_first === "yes") ? true : false,
                    mfcr2AllowCollectCallsVal = (mfcR2Settings.mfcr2_allow_collect_calls === "yes") ? true : false,
                    mfcr2DoubleAnswerVal = (mfcR2Settings.mfcr2_double_answer === "yes") ? true : false,
                    mfcr2AcceptOnOfferVal = (mfcR2Settings.mfcr2_accept_on_offer === "yes") ? true : false,
                    mfcr2ChargeCallsVal = (mfcR2Settings.mfcr2_charge_calls === "yes") ? true : false,
                    mfAdvancedSettingsVal = (mfcR2Settings.mf_advanced_settings === "yes") ? true : false

                form.setFieldsValue({
                    mfcr2_get_ani_first: mfcr2GetAniFirstVal,
                    mfcr2_category: mfcR2Settings.mfcr2_category,
                    mfcr2_allow_collect_calls: mfcr2AllowCollectCallsVal,
                    mfcr2_double_answer: mfcr2DoubleAnswerVal,
                    mfcr2_accept_on_offer: mfcr2AcceptOnOfferVal,
                    mfcr2_charge_calls: mfcr2ChargeCallsVal,
                    mfcr2_mfback_timeout: mfcR2Settings.mfcr2_mfback_timeout,
                    mfcr2_metering_pulse_timeout: mfcR2Settings.mfcr2_metering_pulse_timeout,
                    mf_advanced_settings: mfAdvancedSettingsVal
                })
            } else {
                form.setFieldsValue({
                    mf_advanced_settings: false
                })
            }
        }
        // $("#advanced_area").text(":" + $(this).find("option:selected").text())
    }
    _changeMfcr2VariantGetState = (val) => {
        const form = this.props.form

        let stateObj = {
            selfStateObj: {},
            sonStateObj: {}
        }

        if (val === "br") {
            _.extend(stateObj.selfStateObj, {
                collectCall: false,
                div_mfcr2ForcedRelease_style: "display-block"
            })
        } else if (val === "ve") {
            this.state.mfcr2GeAniFirstValue = true
        } else {
            this.state.mfcr2GeAniFirstValue = false
            _.extend(stateObj.selfStateObj, {
                collectCall: true,
                div_mfcr2ForcedRelease__style: "hidden"
            })
        }
        let mfcR2Settings = this.props.parentState.mfcR2Settings[0]
        if (mfcR2Settings) {
            if (form.getFieldValue("mfcr2_variant") === mfcR2Settings.mfcr2_variant) {
                _.extend(stateObj.sonStateObj, {
                    mfcr2_skip_category: (mfcR2Settings.mfcr2_skip_category === "yes") ? true : false
                })
            }
        }

        _.extend(stateObj.selfStateObj, {
            mfcr2VariantVal: val
        })
        return stateObj
        // $("#advanced_area").text(":" + $(this).find("option:selected").text())
    }
    _onChangeSpanType = (val) => {
        this.setState(this._changeSpanTypeGetState(val), () => {
            this._changeSpanTypeSetFieldsValue(val)
        })
    }
    _changeSpanTypeSetFieldsValue = (val) => {
        const { setFieldsValue, getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl

        let parentState = this.props.parentState,
            oldSingnaling = parentState.oldSingnaling,
            oldCoding = parentState.oldCoding,
            bchanTotalChans = parentState.bchanTotalChans,
            oldHardhdlc = parentState.oldHardhdlc,
            oldFraming = parentState.oldFraming

        let hardhdlcEle = this.refs.div_hardhdlc

        if (!this.props.isChangeSignallingForDataTrunk()) {
            message.error(formatMessage({ id: "LANG3978" }, { 0: getFieldValue("hardhdlc") }))
        }
        if (oldSingnaling) {
            let isExsit = _.find(this.refs.div_signalling.props.children.props.children, function(it) {
                let key = it.key
                return oldSingnaling === key
            })
            if (typeof isExsit !== "undefined") {
                // setFieldsValue({
                //     signalling: "pri_net"
                // })
            } else {
                setFieldsValue({
                    signalling: oldSingnaling
                })
            }
        }
        setFieldsValue({
            coding: oldCoding
        })

        if (val === "E1") {
            if (oldSingnaling === "em" || oldSingnaling === "em_w") {
                setFieldsValue({
                    signalling: "pri_cpe"
                })
                this._onChangeSignalling("pri_cpe")
            }
            if (oldCoding === "b8zs") {
                setFieldsValue({
                   coding: "hdb3"
                })
            }
            let signalling = getFieldValue("signalling")
            if (signalling === 'mfcr2') {
                setFieldsValue({
                   framing: "cas"
                })
            } else {
                setFieldsValue({
                    hardhdlc: "16",
                   framing: "ccs"
                })
            }
            setFieldsValue({
               switchtype: "euroisdn"
            })
        } else if (val === "T1" || val === "J1") {
            if (hardhdlcEle.props.children.props.children.length > 25) {
                setFieldsValue({
                   hardhdlc: oldHardhdlc
                })
            } else {
                setFieldsValue({
                   hardhdlc: "24"
                })
            }
            if (oldSingnaling === "em" || oldSingnaling === "em_w" || oldSingnaling === "mfcr2") {
                setFieldsValue({
                    signalling: "pri_cpe"
                })
                this._onChangeSignalling("pri_cpe")
            }

            // if (oldFraming && oldFraming !== 'ccs' && oldFraming !== 'cas') {
            //     setFieldsValue({
            //         framing: oldFraming
            //     })
            // }
            setFieldsValue({
                framing: "esf",
                coding: "b8zs",
                switchtype: "national"
            })
            let hardhdlc = getFieldValue("hardhdlc")

            if ((Number(hardhdlc) > 24)) {
                message.error(formatMessage({ id: "LANG3968" }))
            }
        }
    }
    _changeSpanTypeGetState = (val, trigger) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let parentState = this.props.parentState,
            oldSingnaling = parentState.oldSingnaling,
            oldCoding = parentState.oldCoding,
            bchanTotalChans = parentState.bchanTotalChans,
            oldHardhdlc = parentState.oldHardhdlc,
            oldFraming = parentState.oldFraming,
            stateObj = {}

        let hardhdlcEle = this.refs.div_hardhdlc,
            signalling = form.getFieldValue('signalling'),
            opts = []

        if (val === "E1") {
            bchanTotalChans = 31

            let framingOpts = []
            if (signalling === 'mfcr2') {
                framingOpts = [{
                    val: "cas"
                }]
            } else {
                framingOpts = [{
                    val: "ccs"
                }]
            }

            let hardhdlcOpts = [],
                dataTrunkChansArr = this.props.getDataTrunkChansArr(),
                allChansArr = this.props.getTotalArr(dataTrunkChansArr)

            if (((allChansArr.length + 1) === bchanTotalChans) || (allChansArr.length === bchanTotalChans)) {
                hardhdlcOpts = [{
                    text: formatMessage({ id: "LANG133" }),
                    val: "0"
                }]
            }
            for (let i = 1; i <= bchanTotalChans; i++) {
                hardhdlcOpts.push({
                    val: i
                })
            }

            let codingOpts = [{
                val: "hdb3",
                text: "HDB3"
            }, {
                val: "ami",
                text: "AMI"
            }],

            crcOpts = [{
                text: "None",
                val: "none"
            }, {
                val: "crc4",
                text: "CRC4"
            }],

            signallingOpts = [{
                val: "pri_net",
                text: "PRI_NET"
            }, {
                val: "pri_cpe",
                text: "PRI_CPE"
            }, {
                val: "ss7",
                text: "SS7"
            }, {
                val: "mfcr2",
                text: "MFC/R2"
            }]

            _.extend(stateObj, {
                framingOpts: framingOpts,
                hardhdlcOpts: hardhdlcOpts,
                codingOpts: codingOpts,
                crcOpts: crcOpts,
                signallingOpts: signallingOpts,
                div_crc_style: "display-block"
            })
        } else if (val === "T1" || val === "J1") {
            bchanTotalChans = 24

            let framingOpts = [{
                val: "esf"
            }, {
                val: 'd4'
            }]
            if (!trigger) {
                this.props.priSettingsInfo.framing = "esf"
            }
            if (hardhdlcEle.props.children.props.children.length > 25) {
                let hardhdlcOpts = [],
                    dataTrunkChansArr = this.props.getDataTrunkChansArr(),
                    allChansArr = this.props.getTotalArr(dataTrunkChansArr)

                if ((allChansArr.length + 1) === bchanTotalChans) {
                    hardhdlcOpts = [{
                        text: formatMessage({ id: "LANG133" }),
                        val: "0"
                    }]
                }
                for (let i = 1; i <= bchanTotalChans; i++) {
                    hardhdlcOpts.push({
                        val: i
                    })
                }
                _.extend(stateObj, {
                    hardhdlcOpts: hardhdlcOpts
                })
            }

            let codingOpts = [{
                val: "b8zs",
                text: "B8ZS"
            }, {
                val: "ami",
                text: "AMI"
            }]

            let crcOpts = [{
                val: "none"
            }]

            let signallingOpts = [{
                val: "pri_net",
                text: "PRI_NET"
            }, {
                val: "pri_cpe",
                text: "PRI_CPE"
            }, {
                val: "ss7",
                text: "SS7"
            }, {
                val: "em",
                text: "E&M Immediate"
            }, {
                val: "em_w",
                text: "E&M Wink"
            }]

            if (val === "J1") {
                signallingOpts.length = 3
            }
            _.extend(stateObj, {
                framingOpts: framingOpts,
                codingOpts: codingOpts,
                crcOpts: crcOpts,
                signallingOpts: signallingOpts,
                div_crc_style: "hidden"
            })
        }
        return stateObj
    }
    _onChangeSs7type = (val) => {
        // if ($(this).val() == "itu") {
        //     $P("#pointcode, #defaultdpc", document).rules("remove", "customCallback1");
        //     $P("#pointcode", document).rules("add", {
        //         digits: true,
        //         range: [0, 16383],
        //         customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
        //             function() {
        //                 return $("#pointcode").val() != $("#defaultdpc").val();
        //             }
        //         ]
        //     });
        //     $P("#defaultdpc", document).rules("add", {
        //         digits: true,
        //         range: [0, 16383],
        //         customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3259"), $P.lang("LANG3257")),
        //             function() {
        //                 return $("#defaultdpc").val() != $("#pointcode").val();
        //             }
        //         ]
        //     });
        //     $P("#pointcode, #defaultdpc", document).valid();
        // } else {
        //     $P("#pointcode", document).rules("remove", "digits range");
        //     $P("#defaultdpc", document).rules("remove", "digits range");
        //     $P("#pointcode", document).rules("add", {
        //         customCallback1: [$P.lang("LANG3459").format(0, 16777215, 0, 255),
        //             function(val, ele) {
        //                 return (/^\d+$/.test(val) && (0 <= Number(val) && Number(val) <= 16777215)) || /^([0-9]|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(val);
        //             }
        //         ],
        //         customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
        //             function() {
        //                 return $("#pointcode").val() != $("#defaultdpc").val();
        //             }
        //         ]
        //     });
        //     $P("#defaultdpc", document).rules("add", {
        //         customCallback1: [$P.lang("LANG3459").format(0, 16777215, 0, 255),
        //             function(val, ele) {
        //                 if (val) {
        //                     return (/^\d+$/.test(val) && (0 <= Number(val) && Number(val) <= 16777215)) || /^([0-9]|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(val);
        //                 } else {
        //                     return true;
        //                 }
        //             }
        //         ],
        //         customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3259"), $P.lang("LANG3257")),
        //             function() {
        //                 return $("#defaultdpc").val() != $("#pointcode").val();
        //             }
        //         ]
        //     })
        // }
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        let hardhdlcOpts = this.props.hardhdlcOpts,
            parentState = this.props.parentState,
            state = this.state,
            priSettingsInfo = this.props.priSettingsInfo

        if (state.hardhdlcOpts.length !== 0) {
            hardhdlcOpts = this.state.hardhdlcOpts
        }

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        let spanType = priSettingsInfo.span_type,
            signalling = priSettingsInfo.signalling,
            mfcr2Variant = priSettingsInfo.mfcr2_variant

        if (spanType && state.spanTypeFirstLoad) {
            _.extend(state, this._changeSpanTypeGetState(spanType, true))
            if (spanType === "E1") {
                if (priSettingsInfo.coding === "b8zs") {
                    priSettingsInfo.coding = "hdb3"
                }
            }
            state.spanTypeFirstLoad = false
        }
        if (signalling && state.signallingFirstLoad) {
            let stateObj = this._changeSignallingGetState(signalling, spanType)
            if (stateObj.selfStateObj) {
                _.extend(state, stateObj.selfStateObj)
            }
            if (stateObj.sonStateObj) {
                _.extend(parentState, stateObj.sonStateObj)
            }
            state.signallingFirstLoad = false
        }
        if (mfcr2Variant && state.mfcr2VariantFirstLoad) {
            let stateObj = this._changeMfcr2VariantGetState(mfcr2Variant)
            if (stateObj.selfStateObj) {
                _.extend(state, stateObj.selfStateObj)
            }
            if (stateObj.sonStateObj) {
                _.extend(parentState, stateObj.sonStateObj)
            }
            state.mfcr2VariantFirstLoad = false
        }

        if (priSettingsInfo.mfcr2_get_ani_first === "yes") {
            _.extend(parentState, {
                mfcr2GetAniFirstChecked: true
            })
        }
        if (priSettingsInfo.mfcr2_skip_category === "yes") {
            _.extend(parentState, {
                mfcr2SkipCategoryChecked: true
            })
        }

        return (
            <div className="content">
                <div className="ant-form">
                    <FormItem
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3130" />}>
                                <span>{formatMessage({id: "LANG3129"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('span_type', {
                            rules: [],
                            initialValue: priSettingsInfo.span_type ? priSettingsInfo.span_type : "E1"
                        })(
                            <Select onChange={ this._onChangeSpanType } >
                                <Option value="E1">E1</Option>
                                <Option value="T1">T1</Option>
                                <Option value="J1">J1</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3126" />}>
                                <span>{formatMessage({id: "LANG3125"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('clock', {
                            rules: [],
                            initialValue: priSettingsInfo.clock ? String(priSettingsInfo.clock) : "0"
                        })(
                            <Select>
                                <Option value="0">{ formatMessage({ id: "LANG3127"}) }</Option>
                                <Option value="1">{ formatMessage({ id: "LANG3128"}) }</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_signalling"
                        className={ parentState.div_signalling_style }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3108" />}>
                                <span>{formatMessage({id: "LANG3107"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('signalling', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: this._isChangeSignalling
                            }],
                            initialValue: priSettingsInfo.signalling ? priSettingsInfo.signalling : "pri_net"
                        })(
                            <Select onChange= { this._onChangeSignalling }>
                            {
                                this.state.signallingOpts.map(function(it) {
                                    const text = it.text
                                    const value = String(it.val)

                                    return <Option key={ value } value={ value }>
                                           { text ? text : value }
                                        </Option>
                                })
                            }
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_hardhdlc"
                        className={ this.state.div_hardhdlc_style }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3134" />}>
                                <span>{formatMessage({id: "LANG3133"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('hardhdlc', {
                            rules: [],
                            initialValue: priSettingsInfo.hardhdlc
                        })(
                            <Select>
                            {
                                hardhdlcOpts.map(function(it) {
                                    const text = it.text
                                    const value = String(it.val)

                                    return <Option key={ value } value={ value }>
                                           { text ? text : value }
                                        </Option>
                                })
                            }
                            </Select>
                        ) }
                    </FormItem>
                    <div ref="div_ss7Options" className={ parentState.div_ss7Options_style }>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3256" />}>
                                    <span>{formatMessage({id: "LANG3255"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ss7type', {
                                rules: [],
                                initialValue: priSettingsInfo.ss7type ? priSettingsInfo.ss7type : "itu"
                            })(
                                <Select onChange={ this._onChangeSs7type } >
                                    <Option value="itu">ITU</Option>
                                    <Option value="ansi">ANSI</Option>
                                    <Option value="china">CHINA</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            ref="div_pointcode"
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3258" />}>
                                    <span>{formatMessage({id: "LANG3257"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('pointcode', {
                                rules: [{
                                    required: parentState.div_ss7Options_style === "display-block",
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: parentState.div_ss7Options_style === "display-block" ? this._checkPointCode : ''
                                }],
                                initialValue: priSettingsInfo.pointcode ? priSettingsInfo.pointcode : ""
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            ref="div_defaultdpc"
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3260" />}>
                                    <span>{formatMessage({id: "LANG3259"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('defaultdpc', {
                                rules: [{
                                    required: parentState.div_ss7Options_style === "display-block",
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: parentState.div_ss7Options_style === "display-block" ? this._checkDefaultPc : ''
                                }],
                                initialValue: priSettingsInfo.defaultdpc ? priSettingsInfo.defaultdpc : ""
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            ref="div_cicbeginswith"
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG4088" />}>
                                    <span>{formatMessage({id: "LANG4070"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('cicbeginswith', {
                                rules: [{
                                    validator: parentState.div_ss7Options_style === "display-block" ? this._checkCICBeginWith : ''
                                }],
                                initialValue: priSettingsInfo.cicbeginswith ? priSettingsInfo.cicbeginswith + '' : ""
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG4111" />}>
                                    <span>{formatMessage({id: "LANG4110"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('sigchan_assign_cic', {
                                rules: [],
                                initialValue: priSettingsInfo.sigchan_assign_cic ? String(priSettingsInfo.sigchan_assign_cic) : "0"
                            })(
                                <Select>
                                    <Option value="0">{ formatMessage({ id: "LANG137"}) }</Option>
                                    <Option value="1">{ formatMessage({ id: "LANG136"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3262" /> }>
                                    <span>{ formatMessage({id: "LANG3261"}) }</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('networkindicator', {
                                rules: [],
                                initialValue: priSettingsInfo.networkindicator ? priSettingsInfo.networkindicator : "national"
                            })(
                                <Select>
                                    <Option value="national">National</Option>
                                    <Option value="national_spare">National Spare</Option>
                                    <Option value="international">International</Option>
                                    <Option value="international_spare">International Spare</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </div>
                    <div ref="div_mfcR2" className={ parentState.div_mfcR2_style }>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3291" /> }>
                                    <span>{formatMessage({id: "LANG3290"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('mfcr2_variant', {
                                rules: [],
                                initialValue: priSettingsInfo.mfcr2_variant ? priSettingsInfo.mfcr2_variant : "itu"
                            })(
                                <Select onChange={ this._onChangeMfcr2Variant }>
                                    <Option value="ar">{ formatMessage({ id: "LANG284"}) }</Option>
                                    <Option value="br">{ formatMessage({ id: "LANG307"}) }</Option>
                                    <Option value="cn">{ formatMessage({ id: "LANG324"}) }</Option>
                                    <Option value="cz">{ formatMessage({ id: "LANG332"}) }</Option>
                                    <Option value="co">{ formatMessage({ id: "LANG325"}) }</Option>
                                    <Option value="ec">{ formatMessage({ id: "LANG341"}) }</Option>
                                    <Option value="id">{ formatMessage({ id: "LANG379"}) }</Option>
                                    <Option value="itu">ITU</Option>
                                    <Option value="mx">{ formatMessage({ id: "LANG437"}) }</Option>
                                    <Option value="ph">{ formatMessage({ id: "LANG458"}) }</Option>
                                    <Option value="ve">{ formatMessage({ id: "LANG528"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_mfcr2ForcedRelease"
                            className={ this.state.div_mfcr2ForcedRelease_style }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3318" />}>
                                    <span>{formatMessage({id: "LANG3317"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('mfcr2_forced_release', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: priSettingsInfo.mfcr2_forced_release === "yes" ? true : false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3299" />}>
                                    <span>{formatMessage({id: "LANG3298"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('mfcr2_category', {
                                rules: [],
                                initialValue: priSettingsInfo.mfcr2_category || "national_subscriber"
                            })(
                                <Select>
                                    <Option value="national_subscriber">{ formatMessage({ id: "LANG3300"}) }</Option>
                                    <Option value="national_priority_subscriber">{ formatMessage({ id: "LANG3301"}) }</Option>
                                    <Option value="international_subscriber">{ formatMessage({ id: "LANG3302"}) }</Option>
                                    <Option value="international_priority_subscriber">{ formatMessage({ id: "LANG3303"}) }</Option>
                                    <Option value="collect_call" disabled={ this.state.collectCall}>{ formatMessage({ id: "LANG3304"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="mfcr2_get_ani_first"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3293" /> }>
                                    <span>{ formatMessage({id: "LANG3292"}) }</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('mfcr2_get_ani_first', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: state.mfcr2GeAniFirstValue
                            })(
                                <Checkbox onChange= { this._onChangeMfcr2GetAniFirst } disabled={ this.props.parentState.mfcr2SkipCategoryChecked } />
                            ) }
                        </FormItem>
                    </div>
                    <FormItem
                        ref="div_lbo"
                        className={ parentState.div_lbo_style }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3104" />}>
                                <span>{formatMessage({id: "LANG3103"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('lbo', {
                            rules: [],
                            initialValue: priSettingsInfo.lbo ? String(priSettingsInfo.lbo) : "0"
                        })(
                            <Select>
                                <Option value="0" >{ formatMessage({ id: "LANG3154"}) }</Option>
                                <Option value="1" >{ formatMessage({ id: "LANG3155"}) }</Option>
                                <Option value="2" >{ formatMessage({ id: "LANG3156"}) }</Option>
                                <Option value="3" >{ formatMessage({ id: "LANG3157"}) }</Option>
                                <Option value="4" >{ formatMessage({ id: "LANG3158"}) }</Option>
                                <Option value="5" >{ formatMessage({ id: "LANG3159"}) }</Option>
                                <Option value="6" >{ formatMessage({ id: "LANG3160"}) }</Option>
                                <Option value="7" >{ formatMessage({ id: "LANG3161"}) }</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3100" />}>
                                <span>{formatMessage({id: "LANG3099"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('coding', {
                            rules: [],
                            initialValue: priSettingsInfo.coding
                        })(
                            <Select>
                            {
                                this.state.codingOpts.map(function(it) {
                                    const text = it.text
                                    const value = String(it.val)

                                    return <Option key={ value } value={ value }>
                                           { text ? text : value }
                                        </Option>
                                })
                            }
                            </Select>
                        ) }
                    </FormItem>
                    <div ref="div_rtx" className={ parentState.div_rtx_style }>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3163" />}>
                                    <span>{formatMessage({id: "LANG1113"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('rxgain', {
                                rules: [],
                                initialValue: priSettingsInfo.rxgain ? String(priSettingsInfo.rxgain) : "0"
                            })(
                                <Select>
                                    <Option value="12" >12</Option>
                                    <Option value="11" >11</Option>
                                    <Option value="10" >10</Option>
                                    <Option value="9" >9</Option>
                                    <Option value="8" >8</Option>
                                    <Option value="7" >7</Option>
                                    <Option value="6" >6</Option>
                                    <Option value="5" >5</Option>
                                    <Option value="4" >4</Option>
                                    <Option value="3" >3</Option>
                                    <Option value="2" >2</Option>
                                    <Option value="1" >1</Option>
                                    <Option value="0" >0</Option>
                                    <Option value="-1" >-1</Option>
                                    <Option value="-2" >-2</Option>
                                    <Option value="-3" >-3</Option>
                                    <Option value="-4" >-4</Option>
                                    <Option value="-5" >-5</Option>
                                    <Option value="-6">-6</Option>
                                    <Option value="-7" >-7</Option>
                                    <Option value="-8" >-8</Option>
                                    <Option value="-9" >-9</Option>
                                    <Option value="-10" >-10</Option>
                                    <Option value="-11" >-11</Option>
                                    <Option value="-12" >-12</Option>
                                    <Option value="-13" >-13</Option>
                                    <Option value="-14" >-14</Option>
                                    <Option value="-15" >-15</Option>
                                    <Option value="-16" >-16</Option>
                                    <Option value="-17" >-17</Option>
                                    <Option value="-18" >-18</Option>
                                    <Option value="-19" >-19</Option>
                                    <Option value="-20" >-20</Option>
                                    <Option value="-21" >-21</Option>
                                    <Option value="-22" >-22</Option>
                                    <Option value="-23" >-23</Option>
                                    <Option value="-24" >-24</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3164" />}>
                                    <span>{formatMessage({id: "LANG1115"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('txgain', {
                                rules: [],
                                initialValue: priSettingsInfo.txgain ? String(priSettingsInfo.txgain) : "0"
                            })(
                                <Select>
                                    <Option value="12" >12</Option>
                                    <Option value="11" >11</Option>
                                    <Option value="10" >10</Option>
                                    <Option value="9" >9</Option>
                                    <Option value="8" >8</Option>
                                    <Option value="7" >7</Option>
                                    <Option value="6" >6</Option>
                                    <Option value="5" >5</Option>
                                    <Option value="4" >4</Option>
                                    <Option value="3" >3</Option>
                                    <Option value="2" >2</Option>
                                    <Option value="1" >1</Option>
                                    <Option value="0" >0</Option>
                                    <Option value="-1" >-1</Option>
                                    <Option value="-2" >-2</Option>
                                    <Option value="-3" >-3</Option>
                                    <Option value="-4" >-4</Option>
                                    <Option value="-5" >-5</Option>
                                    <Option value="-6" >-6</Option>
                                    <Option value="-7" >-7</Option>
                                    <Option value="-8" >-8</Option>
                                    <Option value="-9" >-9</Option>
                                    <Option value="-10" >-10</Option>
                                    <Option value="-11" >-11</Option>
                                    <Option value="-12" >-12</Option>
                                    <Option value="-13" >-13</Option>
                                    <Option value="-14" >-14</Option>
                                    <Option value="-15" >-15</Option>
                                    <Option value="-16" >-16</Option>
                                    <Option value="-17" >-17</Option>
                                    <Option value="-18" >-18</Option>
                                    <Option value="-19" >-19</Option>
                                    <Option value="-20" >-20</Option>
                                    <Option value="-21" >-21</Option>
                                    <Option value="-22" >-22</Option>
                                    <Option value="-23" >-23</Option>
                                    <Option value="-24" >-24</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </div>
                    <FormItem
                        ref="div_codec"
                        className={ parentState.div_codec_style }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3106" />}>
                                <span>{ formatMessage({id: "LANG3105"}) }</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('codec', {
                            rules: [],
                            initialValue: priSettingsInfo.codec ? priSettingsInfo.codec : "default"
                        })(
                            <Select>
                                <Option value="default">{ formatMessage({id: "LANG257"}) }</Option>
                                <Option value="alaw">alaw</Option>
                                <Option value="ulaw">ulaw</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_priPlayLocalRbt"
                        className={ parentState.div_priPlayLocalRbt_style }
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3492" /> }>
                                    <span>{ formatMessage({id: "LANG3491"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('priplaylocalrbt', {
                            valuePropName: 'checked',
                            initialValue: priSettingsInfo.priplaylocalrbt === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_mfcr2PlayLocaRbt"
                        className={ parentState.div_mfcr2PlayLocaRbt_style }
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3492" /> }>
                                    <span>{ formatMessage({id: "LANG3491"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('mfcr2_play_local_rbt', {
                            valuePropName: 'checked',
                            initialValue: priSettingsInfo.mfcr2_play_local_rbt === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        className="hidden"
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3132" /> }>
                                    <span>{ formatMessage({id: "LANG3131"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        <span ref="bchan">{ priSettingsInfo.bchan }</span>
                    </FormItem>
                    <FormItem
                        ref="div_priPlayLocalRbt"
                        className={ this.state.priPlayLocalRbtDiv_style }
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3098" /> }>
                                    <span>{ formatMessage({id: "LANG3097"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('framing', {
                            initialValue: priSettingsInfo.framing
                        })(
                            <Select onChange={ this._onChangeFraming }>
                            {
                                this.state.framingOpts.map(function(it) {
                                    const text = it.text
                                    const value = String(it.val)

                                    return <Option key={ value } value={ value }>
                                           { text ? text : value }
                                        </Option>
                                })
                            }
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_crc"
                        className={ this.state.div_crc_style }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3102" />}>
                                <span>{formatMessage({id: "LANG3101"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('crc', {
                            rules: [],
                            initialValue: priSettingsInfo.crc
                        })(
                            <Select>
                            {
                                this.state.crcOpts.map(function(it) {
                                    const text = it.text
                                    const value = String(it.val)

                                    return <Option key={ value } value={ value }>
                                           { text ? text : value }
                                        </Option>
                                })
                            }
                            </Select>
                        ) }
                    </FormItem>
                </div>
            </div>
        )
    }
}

export default injectIntl(BasicSettings)

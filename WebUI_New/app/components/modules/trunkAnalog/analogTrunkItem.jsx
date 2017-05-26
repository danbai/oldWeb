'use strict'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Modal, Button, Row, Col, Checkbox, message, Tooltip, Select, Tabs, Spin } from 'antd'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import Validator from "../../api/validator"
import Title from '../../../views/title'
import UCMGUI from "../../api/ucmgui"

const FormItem = Form.Item
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
const baseServerURl = api.apiHost

global.oldTrunkName = ""
global.oldSLAMode = ''
global.trunkgroup = ""
global.countryObj = {}

class AnalogTrunkItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            visible: false,
            totalChans: [],
            checkedChansList: [],
            trunkNameList: [],
            indeterminate: true,
            countrytoneOpts: [],
            analogtrunk: {},
            firstLoad: true,
            isTrigger: true,
            faxIntelligentRouteDestinationOpts: [],
            div_polarityonanswerdelay_style: false
        }

        this._onChangeBusydetect = (e) => {
            let isChecked = e.target.checked

            if (isChecked) {
                this.setState({
                    div_busycount_style: true
                })
            } else {
                this.setState({
                    div_busycount_style: false
                })
            }
        }

        this._onChangeCongestiondetect = (e) => {
            let isChecked = e.target.checked

            if (isChecked) {
                this.setState({
                    div_congestioncount_style: true
                })
            } else {
                this.setState({
                    div_congestioncount_style: false
                })
            }
        }

        this._onChangeTrunkmode = (e) => {
            const form = this.props.form
            const { validateFields, setFields, getFieldValue } = this.props.form

            let obj = {},
                isChecked = e.target ? e.target.checked : e

            if (isChecked) {
                this.state.analogtrunk.bargeallowed = "yes"

                obj.trunkmodeVal = isChecked
                obj.div_slaOptions_style = true
                obj.analogtrunk = this.state.analogtrunk
            } else {
                obj.trunkmodeVal = isChecked
                obj.div_slaOptions_style = false
            }

            this.setState(obj, () => {
                validateFields(["changroup"], { force: true })
            })
        }

        this._onChangePolarityswitch = (e) => {
            const form = this.props.form

            let isChecked = e.target ? e.target.checked : e

            if (isChecked) {
                this.setState({
                    div_polarityonanswerdelay_style: true,
                    polarityswitchVal: true
                })
            } else {
                this.setState({
                    div_polarityonanswerdelay_style: false,
                    polarityswitchVal: false
                })
            }
        }

        this._onChangeEnablecurrentdisconnectthreshold = (e) => {
            const form = this.props.form

            let isChecked = e.target ? e.target.checked : e

            if (isChecked) {
                this.setState({
                    div_currentdisconnectthreshold_style: true
                })
            } else {
                this.setState({
                    div_currentdisconnectthreshold_style: false
                })
            }
        }

        this._onChangeCountrytone = (val) => {
            const form = this.props.form

            let busytone = '',
                congestiontone = '',
                freq_tmp = ''

            if (val === 'custom') {
                this.setState({
                    busyDisabled: false,
                    congestionDisabled: false
                })
            } else {
                let countryTone = global.countryObj[val]

                if (countryTone) {
                    // f1=500[@-11][,f2=440[@-11]],c=500/500[-600/600[-700/700]]
                    freq_tmp = countryTone.busyfreq.split('+')

                    for (let i = 0, len = freq_tmp.length; i < len; i++) {
                        busytone += 'f' + (i + 1) + '=' + freq_tmp[i] + '@-50' + ','
                    }

                    busytone += 'c=' + countryTone.busypattern.replace(/,/g, '/')

                    freq_tmp = countryTone.congestionfreq.split('+')

                    for (let i = 0, len = freq_tmp.length; i < len; i++) {
                        congestiontone += 'f' + (i + 1) + '=' + freq_tmp[i] + '@-50' + ','
                    }

                    congestiontone += 'c=' + countryTone.congestionpattern.replace(/,/g, '/')

                    form.setFieldsValue({
                        busy: busytone,
                        congestion: congestiontone
                    })
                }

                this.setState({
                    busyDisabled: true,
                    congestionDisabled: true
                })
            }
        }

        this._onClickFaxmode = (val) => {
            const form = this.props.form

            if (val === 'detect') {
                this.setState({
                    div_faxDetect_style: true
                })
            } else {
                this.setState({
                    div_faxDetect_style: false
                })
            }
        }

        this._onChangefaxIntelligentRoute = (e) => {
            let isChecked = e.target ? e.target.checked : e

            if (isChecked) {
                this.setState({
                    faxIntelligentRouteVal: true
                })
            } else {
                this.setState({
                    faxIntelligentRouteVal: false
                })
            }
        }

        this._onChangeDetectModel = (val) => {
            const form = this.props.form

            if (val === '1') {
                this.setState({
                    div_des_channels_style: false
                })
            } else {
                this.setState({
                    div_des_channels_style: true
                })
            }
        }

        this._onChangeChans = (checkedChansList) => {
            const { validateFields, setFields, getFieldValue } = this.props.form

            let state = this.state,
                checkedChansListLen = state.checkedChansList.length,
                totalChansLen = state.totalChans.length

            this.setState({
                checkedChansList,
                indeterminate: !!checkedChansListLen && (checkedChansListLen < totalChansLen),
                checkAll: checkedChansListLen === totalChansLen
            }, () => {
                // validateFields(["trunk_name"], (errors, values) => {
                //     if (values.trunk_name && getFieldValue('trunkmode')) {
                //         if (this.state.checkedChansList.length <= 1) {
                //             if (errors && errors.trunk_name) {
                //                 setFields({
                //                     trunk_name: {
                //                         value: values.trunk_name,
                //                         errors: [""]
                //                     }
                //                 })
                //             }
                //         } else if (this.state.checkedChansList.length > 1) {
                //             // UCMGUI.toggleErrorMessage()
                //         }
                //     }
                // })
            })
        }
    }
    componentDidMount() {
        const form = this.props.form

        let mode = this.props.route.path

        this._initForm()

        if (mode.indexOf('edit') === 0) {
            let showEles = ["div_out_maxchans", "div_faxmode"],
                showElesObj = {}

            showEles.map(function(it) {
                showElesObj[it + "_style"] = true
            })

            this.setState({
                type: "edit",
                ...showElesObj
            })

            let trunkId = this.props.params.trunkId

            this._getAnalogTrunk(trunkId)
        } else {
            this.setState({
                type: "add"
            })

            form.setFieldsValue({
                countrytone: "us"
            })

            this._onChangeCountrytone("us")
        }
    }
    componentDidUpdate() {
        let state = this.state,
            analogtrunk = state.analogtrunk

        if (!_.isEmpty(analogtrunk) && state.isTrigger) {
            this._onChangeCountrytone(analogtrunk.countrytone)
            this._onChangePolarityswitch(analogtrunk.polarityswitch === "yes" ? true : false)
            this._onChangeEnablecurrentdisconnectthreshold(analogtrunk.enablecurrentdisconnectthreshold === "no" ? false : true)
            this._onClickFaxmode(analogtrunk["faxmode"])

            if (typeof analogtrunk.trunkmode !== "undefined") {
                this._onChangeTrunkmode(analogtrunk.trunkmode === "sla" ? true : false)
            }

            this._onChangefaxIntelligentRoute(analogtrunk.fax_intelligent_route === "yes" ? true : false)

            state.isTrigger = false
        }
    }
    componentWillUnmount() {
    }
    _initForm = () => {
        const form = this.props.form

        let hideEles = ["div_out_maxchans", "div_slaOptions", "div_faxmode", "div_faxDetect"],
            hideElesObj = {}

        hideEles.map(function(it) {
            hideElesObj[it + "_style"] = false
        })

        this.setState(hideElesObj)

        this._getNameList()
        this._getChanList()
        this._getToneZoneSettings()
        this._tectFax()
    }
    _getNameList = () => {
        const { formatMessage } = this.props.intl

        let allTrunkList = UCMGUI.isExist.getList("getTrunkList", formatMessage),
            failoverTrunkList = UCMGUI.isExist.getList("getOutrtFailoverTrunkIdList", formatMessage)

        this.setState({
            trunkNameList: this._transData(allTrunkList),
            failoverTrunkList: failoverTrunkList
        })
    }
    _getChanList = () => {
        const { formatMessage } = this.props.intl

        let arr = []
        let chanList = UCMGUI.isExist.getList("getAnalogTrunkChanList", formatMessage)

        for (let i = 0; i < chanList.length; i++) {
            arr.push(chanList[i]["chan"])
        }

        this._loadChans(arr)
    }
    _transData(res, cb) {
        let arr = []

        for (let i = 0; i < res.length; i++) {
            arr.push(res[i]["trunk_name"])
        }

        if (cb && typeof cb === "function") {
            cb(arr)
        }

        return arr
    }
    _loadChans = (chanList) => {
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let chans = Number(model_info.num_fxo),
            chansArr = []

        for (let i = 1; i <= chans; i++) {
            let obj = {},
                str = i.toString()

            obj["label"] = str
            obj["value"] = str

            let isFind = _.find(chanList, function(num) {
                return i === num
            })

            if (typeof isFind !== "undefined") {
                obj["disabled"] = true
            } else {
                obj["disabled"] = false
            }

            chansArr.push(obj)
        }

        this.setState({
            totalChans: chansArr
        })
    }
    _getToneZoneSettings = () => {
        let action = {
            action: "listAllToneZoneSettings",
            options: "description,country,busy,congestion",
            sidx: "description"
        }

        $.ajax({
            type: 'POST',
            data: action,
            async: false,
            dataType: 'json',
            url: baseServerURl,
            success: function(data) {
                if (data && data.status === 0) {
                    let toneZoneSettings = data.response.CountryTone

                    this._loadToneZone(toneZoneSettings)
                }
            }.bind(this)
        })
    }
    _loadToneZone = (toneZoneSettings) => {
        const { formatMessage } = this.props.intl

        let me = this,
            arr = [],
            regexBusy = /^([\d+*]+)\/(\d+),[\d+]+\/(\d+)(,[\d+*]+\/(\d+),[\d+]+\/(\d+))?(,[\d+*]+\/(\d+),[\d+]+\/(\d+))?$/,
            regexCongestion = /^([\d+*]+)\/(\d+),[\d+]+\/(\d+)(,[\d+*]+\/(\d+),[\d+]+\/(\d+))?(,[\d+*]+\/(\d+),[\d+]+\/(\d+))?$/

        toneZoneSettings.map(function(item) {
            let countryItem = {},
                obj = {},
                country = item["country"]

            // obj["text"] = item["description"]
            obj["text"] = formatMessage({id: me.props.nation2langObj[country.toLowerCase()]})
            obj["val"] = country

            arr.push(obj)

            let match = item.busy.match(regexBusy)

            if (match) {
                countryItem.busyfreq = match[1]
                countryItem.busypattern = match[2] + ',' + match[3] + ((match[5]) ? ('-' + match[5] + ',' + match[6]) : '') + ((match[8]) ? ('-' + match[8] + ',' + match[9]) : '')
            }

            match = item.congestion.match(regexCongestion)

            if (match) {
                countryItem.congestionfreq = match[1]
                countryItem.congestionpattern = match[2] + ',' + match[3] + ((match[5]) ? ('-' + match[5] + ',' + match[6]) : '') + ((match[8]) ? ('-' + match[8] + ',' + match[9]) : '')
            }

            countryItem.desc = item.description

            global.countryObj[item.country] = countryItem
        })

        arr.push({
            val: "custom",
            text: formatMessage({id: "LANG231"})
        })

        this.setState({
            countrytoneOpts: arr
        })
    }
    _tectFax() {
        const { formatMessage } = this.props.intl

        let accountList = UCMGUI.isExist.getList("listAccount").account,
            faxList = UCMGUI.isExist.getList("listFax").fax,
            arr = [{
                text: formatMessage({id: "LANG133"}),
                val: "no"
            }],
            ele

        for (let i = 0; i < accountList.length; i++) {
            ele = accountList[i]

            if (ele.account_type.match(/FXS/i)) {
                arr.push({
                    text: ele.extension,
                    val: ele.extension
                })
            }
        }

        for (let i = 0; i < faxList.length; i++) {
            ele = faxList[i]

            arr.push({
                text: ele.extension,
                val: ele.extension
            })
        }

        this.setState({
            faxIntelligentRouteDestinationOpts: arr
        })
    }
    _getAnalogTrunk = (trunkId) => {
        const { formatMessage } = this.props.intl
        const form = this.props.form

        let action = {
            "analogtrunk": trunkId,
            "action": "getAnalogTrunk"
        }

        $.ajax({
            type: "post",
            data: action,
            url: baseServerURl,
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let analogtrunk = data.response.analogtrunk,
                        chans = analogtrunk.chans ? analogtrunk.chans.split(",") : []

                    global.oldTrunkName = analogtrunk.trunk_name
                    global.trunkgroup = analogtrunk.trunkgroup
                    global.oldSLAMode = analogtrunk.trunkmode

                    let chansArr = [],
                        totalChans = []

                    chans.map(function (it) {
                        chansArr.push(it)
                    })

                    this.state.totalChans.map(function (it) {
                        let value = it.value,
                            disabled = it.disabled,
                            obj = {},
                            isFind = _.find(chans, function(num) {
                                return value === Number(num)
                            })

                        obj["label"] = value
                        obj["value"] = value

                        if (typeof isFind !== "undefined") {
                            obj["disabled"] = false
                        } else {
                            obj["disabled"] = disabled
                        }

                        totalChans.push(obj)
                    })

                    this.setState({
                        analogtrunk: analogtrunk,
                        totalChans: totalChans,
                        checkedChansList: chansArr
                    })

                    if (analogtrunk.trunkmode === 'sla') {
                        form.setFieldsValue({
                            trunkmode: true
                        })

                        this.setState({
                            div_slaOptions_style: true,
                            trunkmodeVal: true
                        })

                        this._getSLAData(trunkId)
                    }
                }
            }.bind(this)
        })
    }
    _getSLAData(trunkId) {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let action = {
            "action": "getSLATrunk",
            "trunk_index": trunkId
        }

        $.ajax({
            type: "post",
            data: action,
            async: false,
            url: baseServerURl,
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let slaData = data.response.trunk_index,
                        bargeallowed = slaData.bargeallowed,
                        holdaccess = slaData.holdaccess

                    if (bargeallowed) {
                        form.setFieldsValue({
                            bargeallowed: (bargeallowed === 'yes' ? true : false)
                        })
                    }

                    if (holdaccess) {
                        form.setFieldsValue({
                            holdaccess: holdaccess
                        })
                    }
                }
            }.bind(this)
        })
    }
    _pstnDetection = () => {
        const form = this.props.form

        let state = this.state

        if (state.checkedChansList.length === 0) {
            return
        }

        form.setFieldsValue({
            des_number: "",
            src_number: "6000",
            is_save_record: false
        })
    }
    _pstnAfter = () => {
        this._pstnCancel()
    }
    _pstnStop = () => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let des_channel = ""

        if (form.getFieldValue("detect_model") === "1") {
            des_channel = "-1"
        } else {
            des_channel = form.getFieldValue("des_channels")
        }

        let buf = {
            "action": "stopPSTNDetecting",
            "pstn_type": "pstn_cpt",
            "src_channel": form.getFieldValue("src_channels"),
            "dest_channel": des_channel,
            "src_extension": form.getFieldValue("src_number"),
            "dest_extension": form.getFieldValue("des_number"),
            'is_save_record': form.getFieldValue('is_save_record') ? 'yes' : 'no'
        }

        $.ajax({
            data: buf,
            type: "post",
            url: baseServerURl,
            success: this._pstnAfter
        })
    }
    _pstnOver = () => {
        let i = 120,
            status_type = 1

        this._getResponce(1, i, status_type)
    }
    _getResponce = (flag, i, status_type) => {
        const me = this
        const form = this.props.form
        const { formatMessage } = this.props.intl

        setTimeout(function() {
            let buf = {
                action: "getPSTNDetecting",
                pstn_type: "pstn_cpt"
            }

            $.ajax({
                type: "post",
                url: baseServerURl,
                data: buf,
                success: function(res) {
                    if (res.status === -5) {
                        UCMGUI.loginFunction.switchToLoginPanel()
                        return
                    }

                    let bool = UCMGUI.errorHandler(res, null, formatMessage)

                    if (bool) {
                        let result = res.response.result,
                            state = result.state,
                            errCode = Number(result.errCode),
                            currentDisconnect = result.current_disconnect,
                            currentDisconnectTime = Number(result.current_disconnect_time),
                            polarity = result.polarity,
                            busytone = result.busytone,
                            frequencies = result.frequencies,
                            cadence = result.cadence

                        if (state === "done") {
                            flag = 0

                            if (!errCode) {
                                let buf = "",
                                    sCon = 'LANG2338'

                                if (currentDisconnect === "yes") {
                                    buf += formatMessage({id: "LANG1694"}) + ": " + currentDisconnectTime + "<br/>"
                                } else {
                                    buf += formatMessage({id: "LANG1694"}) + ": " + currentDisconnect + "<br/>"
                                }

                                if (polarity) {
                                    buf += formatMessage({id: "LANG1340"}) + ": " + polarity + "<br/>"
                                }

                                if (busytone === "yes") {
                                    buf += formatMessage({id: "LANG1325"}) + ": frequencies=" + frequencies + " cadence=" + cadence + "<br/>"
                                }

                                if (form.getFieldValue('is_save_record') && currentDisconnect === 'yes' && busytone === 'no') {
                                    sCon = 'LANG5151'
                                }
                                if (form.getFieldValue('is_save_record')) {
                                    buf += formatMessage({id: "LANG5650"}) + "<br/>"
                                }

                                me.props.setSpinLoading({loading: false})

                                message.destroy()

                                Modal.confirm({
                                    content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: sCon}, {0: buf}) }}></span>,
                                    okText: formatMessage({id: "LANG727"}),
                                    cancelText: formatMessage({id: "LANG726"}),
                                    onOk: () => {
                                        if (currentDisconnect === "yes") {
                                            form.setFieldsValue({
                                                enablecurrentdisconnectthreshold: true,
                                                currentdisconnectthreshold: currentDisconnectTime
                                            })

                                            this.setState({
                                                div_currentdisconnectthreshold_style: true
                                            })
                                        } else {
                                            form.setFieldsValue({
                                                enablecurrentdisconnectthreshold: false
                                            })

                                            this.setState({
                                                div_currentdisconnectthreshold_style: false
                                            })
                                        }

                                        if (polarity) {
                                            let polarityVal = polarity.toLowerCase() === "yes" ? true : false

                                            form.setFieldsValue({
                                                polarityswitch: polarityVal
                                            })

                                            this._onChangePolarityswitch(polarityVal)
                                        }

                                        if (busytone === "yes") {
                                            form.setFieldsValue({
                                                countrytone: "custom",
                                                busydetect: true
                                            })

                                            this.setState({
                                                div_busycount_style: true,
                                                busyDisabled: false,
                                                congestionDisabled: false
                                            })
                                        }

                                        if (frequencies && cadence) {
                                            let frequenciesCadence = "f1=" + frequencies.split("+")[0] + "@-50," + "f2=" + frequencies.split("+")[1] + "@-50," + cadence

                                            form.setFieldsValue({
                                                busy: frequenciesCadence
                                            })
                                        }

                                        this._pstnAfter()
                                    },
                                    onCancel: this._pstnStop
                                })
                            } else {
                                me.props.setSpinLoading({loading: false})

                                message.destroy()
                                message.error(formatMessage({id: this.props.mappingErrCode[errCode]}))
                            }
                        } else if (form.getFieldValue("detect_model") === "1") {
                            if (state === "ring back tone") {
                                flag = 0

                                me.props.setSpinLoading({loading: false})

                                message.destroy()

                                Modal.confirm({
                                    content: formatMessage({id: "LANG2412"}),
                                    okText: formatMessage({id: "LANG727"}),
                                    cancelText: formatMessage({id: "LANG726"}),
                                    onOk: () => {
                                        $.ajax({
                                            type: "post",
                                            url: baseServerURl,
                                            data: "action=PSTNDetectingPickup",
                                            success: function() {
                                                message.destroy()
                                                message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2337" })}}></span>, 0)

                                                status_type = 2

                                                this._getResponce(1, i, status_type)
                                            }.bind(this)
                                        })
                                    },
                                    onCancel: this._pstnStop
                                })
                            } else if (state === "waiting for hangup" && status_type === 2) {
                                flag = 0

                                me.props.setSpinLoading({loading: false})

                                message.destroy()

                                Modal.confirm({
                                    content: formatMessage({id: "LANG2413"}),
                                    okText: formatMessage({id: "LANG727"}),
                                    cancelText: formatMessage({id: "LANG726"}),
                                    onOk: () => {
                                        $.ajax({
                                            type: "post",
                                            url: baseServerURl,
                                            data: "action=PSTNDetectingHangup",
                                            success: function() {
                                                message.destroy()
                                                message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2337" })}}></span>, 0)

                                                status_type = 3

                                                this._getResponce(1, i, status_type)
                                            }.bind(this)
                                        })
                                    },
                                    onCancel: this._pstnStop
                                })
                            }
                        }
                    }

                    i--

                    if (flag && i > 0) {
                        this._getResponce(1, i, status_type)
                    } else if (i <= 0) {
                        /* time out */
                        me.props.setSpinLoading({loading: false})

                        message.destroy()
                        message.error(formatMessage({id: "LANG2339"}))

                        this._pstnAfter()
                    }
                }.bind(this)
            })
        }.bind(this), 1000)
    }
    _pstnSave = () => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            let des_channel = "",
                me = this,
                refs = this.refs,
                detectParams = this.props.detectParams,
                flag = false

            detectParams.map(function (it) {
                if (!err || (err && typeof err[it] === "undefined")) {
                } else {
                    flag = true
                }
            })

            if (flag) {
                return
            }

            if (form.getFieldValue("detect_model") === "1") {
                des_channel = "-1"
            } else {
                des_channel = form.getFieldValue("des_channels")
            }

            let buf = {
                "action": "startPSTNDetecting",
                "pstn_type": "pstn_cpt",
                "src_channel": form.getFieldValue("src_channels"),
                "dest_channel": des_channel,
                "src_extension": form.getFieldValue("src_number"),
                "dest_extension": form.getFieldValue("des_number"),
                'is_save_record': form.getFieldValue('is_save_record') ? 'yes' : 'no'
            }

            me.props.setSpinLoading({loading: true, tip: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2337" })}}></span>})

            $.ajax({
                type: "post",
                url: baseServerURl,
                data: buf,
                error: function(e) {
                    me.props.setSpinLoading({loading: false})

                    message.error(e.statusText)
                },
                success: function(data) {
                    let bool = UCMGUI.errorHandler(data, null, formatMessage)

                    if (bool) {
                        this._pstnOver()
                    }
                }.bind(this)
            })

            // message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2337" })}}></span>, 0)

            this.setState({
                visible: false
            })
        })
    }
    _handleSubmit = (e) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let trunkId = this.props.params.trunkId,
            action = {},
            mode = this.props.route.path,
            isEdit = (mode.indexOf('edit') === 0),
            isAdd = (mode.indexOf('add') === 0),
            cidmodeObj = this.props.cidmodeObj,
            oldSLAMode = global.oldSLAMode,
            detectParams = this.props.detectParams

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                let me = this
                let refs = this.refs

                detectParams.map(function (it) {
                    delete values[it]
                })

                delete values.changroup
                delete values.holdaccess
                delete values.bargeallowed

                for (let key in values) {
                    if (values.hasOwnProperty(key)) {
                        let divKey = refs["div_" + key]

                        if (divKey && divKey.props && ((divKey.props.className && divKey.props.className.indexOf("hidden") === -1) || typeof divKey.props.className === "undefined")) {
                            if (!err || (err && typeof err[key] === "undefined")) {
                                action[key] = UCMGUI.transCheckboxVal(values[key])
                            } else {
                                return
                            }
                        } else if (typeof divKey === "undefined") {
                            if (!err || (err && typeof err[key] === "undefined")) {
                                action[key] = UCMGUI.transCheckboxVal(values[key])
                            } else {
                                return
                            }
                        }
                    }
                }

                message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG904" })}}></span>, 0)

                // action = me._transAction(action)
                delete action.fax_intelligent_route_destination

                let cidmodeVal = action["cidmode"]

                action["cidstart"] = cidmodeObj[cidmodeVal]["cidstart"]
                action["cidsignalling"] = cidmodeObj[cidmodeVal]["cidsignalling"]
                action["trunkmode"] = form.getFieldValue("trunkmode") ? 'sla' : 'normal'

                if (!form.getFieldValue("busydetect")) {
                    action["busycount"] = ""
                }

                if (!form.getFieldValue("congestiondetect")) {
                    action["congestioncount"] = ""
                } else {
                    action["congestioncount"] = values.congestioncount
                }

                if (!form.getFieldValue("enablecurrentdisconnectthreshold")) {
                    action["currentdisconnectthreshold"] = 3000
                    // action["currentdisconnectthreshold"] = 200
                } else {
                    action["currentdisconnectthreshold"] = form.getFieldValue("currentdisconnectthreshold")
                }

                let fax = form.getFieldValue('faxmode')
                let bEnableRoute = form.getFieldValue('fax_intelligent_route')

                if (fax === "no") {
                    action['faxdetect'] = "no"
                    action['fax_gateway'] = "no"
                } else if (fax === "detect") {
                    action['faxdetect'] = "incoming"
                    action['fax_gateway'] = "no"
                } else if (fax === "gateway") {
                    action['faxdetect'] = "no"
                    action['fax_gateway'] = "yes"
                }

                delete action.faxmode
                delete action.fax_intelligent_route

                if (isEdit) {
                    action["trunkgroup"] = global.trunkgroup
                    action["analogtrunk"] = trunkId
                }

                action["chans"] = this.state.checkedChansList.toString()

                if (isAdd) {
                    action["trunkgroup"] = ''
                }

                action["action"] = (mode.indexOf('edit') === 0 ? "updateAnalogTrunk" : "addAnalogTrunk")

                if (isAdd) {
                    if (form.getFieldValue("trunkmode")) {
                        let slaAction = {
                            'action': 'addSLATrunk',
                            'trunk_name': action['trunk_name'],
                            'device': ('DAHDI/' + action["chans"]),
                            'bargeallowed': (form.getFieldValue('bargeallowed') ? 'yes' : 'no'),
                            'holdaccess': form.getFieldValue('holdaccess')
                        }

                        action["polarityswitch"] = 'no'

                        this._updateOrAddTrunkInfo(action, 'add', slaAction)
                    } else {
                        this._updateOrAddTrunkInfo(action)
                    }
                } else if (isEdit) {
                    if (fax === "detect") {
                        action['fax_intelligent_route'] = bEnableRoute ? 'yes' : 'no'

                        if (bEnableRoute && form.getFieldValue('fax_intelligent_route_destination') !== 'no') {
                            action['fax_intelligent_route_destination'] = form.getFieldValue('fax_intelligent_route_destination')
                        }
                    }

                    if (form.getFieldValue("trunkmode")) {
                        action["polarityswitch"] = 'no'

                        if (oldSLAMode === 'sla') {
                            let slaAction = {
                                'action': 'updateSLATrunk',
                                'trunk_index': trunkId,
                                'trunk_name': action['trunk_name'],
                                'device': ('DAHDI/' + action["chans"]),
                                'bargeallowed': (form.getFieldValue('bargeallowed') ? 'yes' : 'no'),
                                'holdaccess': form.getFieldValue('holdaccess')
                            }

                            this._updateOrAddTrunkInfo(action, 'update', slaAction)
                        } else {
                            let slaAction = {
                                'action': 'addSLATrunk',
                                'trunk_index': trunkId,
                                'trunk_name': action['trunk_name'],
                                'device': ('DAHDI/' + action["chans"]),
                                'bargeallowed': form.getFieldValue('bargeallowed') ? 'yes' : 'no',
                                'holdaccess': form.getFieldValue('holdaccess')
                            }

                            this._updateOrAddTrunkInfo(action, 'add', slaAction)
                        }
                    } else if (oldSLAMode === 'sla') {
                        let slaAction = {
                            'action': 'deleteSLATrunk',
                            'trunk_index': trunkId
                        }

                        this._updateOrAddTrunkInfo(action, 'delete', slaAction)
                    } else {
                        this._updateOrAddTrunkInfo(action)
                    }
                }
            }
        })
    }
    _updateOrAddTrunkInfo = (action, slaActionMode, slaAction) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            data: action,
            url: baseServerURl,
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let callback = function() {
                        message.destroy()
                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)

                        browserHistory.push('/extension-trunk/analogTrunk')
                    }

                    if (slaActionMode) {
                        this._updateOrAddSLATrunkInfo(slaActionMode, slaAction, callback)
                    } else {
                        callback()
                    }
                }
            }.bind(this)
        })
    }
    _updateOrAddSLATrunkInfo = (actionMode, action, callback) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    if (callback && typeof callback === "function") {
                        callback()
                    }
                }
            }.bind(this)
        })
    }
    _handleCancel = (e) => {
        browserHistory.push('/extension-trunk/analogTrunk')
    }
    _showModal = () => {
        this.setState({
            visible: true
        })
        this._pstnDetection()
    }
    _handleOk = () => {
        this._pstnSave()
    }
    _pstnCancel = () => {
        this.setState({
            visible: false
        })
    }
    _trunkNameIsExist = (rule, value, callback, errMsg) => {
        let _this = this,
            mode = this.props.route.path,
            params = this.props.params,
            isEdit = (mode.indexOf('edit') === 0),
            isAdd = (mode.indexOf('add') === 0)

        if (value && value.length >= 2) {
            // if (this.state.checkedChansList.length !== 0) {
                if (_.find(this.state.trunkNameList, function (num) {
                    if (isEdit) {
                        return (num === value && params && params.trunkName !== value)
                    } else if (isAdd) {
                        return num === value
                    }
                })) {
                    callback(errMsg)
                }

                callback()
            // } else {
            //     callback(errMsg)
            // }
        }

        callback()
    }
    _checkTone = (rule, value, callback, formatMessage) => {
        let errmsg = formatMessage({id: "LANG2136"})

        if (!value) {
            return callback()
        }

        var regex = /^f1=(\d+)?(@(-\d+))?(,f2=(\d+)(@(-\d+))?)?,c=((\d+)\/(\d+))(-(\d+)\/(\d+))?(-(\d+)\/(\d+))?;?$/,
            match = value.match(regex)

        if (!match) {
            return callback(errmsg)
        }

        // match group fields example at pre_save_setting()
        // valid frequence range Tone frequency A in Hz; 0 <= Hz < 4000
        if (match[1] && match[1] > 4000) {
            return callback(errmsg)
        }

        if (match[5] && match[1] > 4000) {
            return callback(errmsg)
        }

        // valid levels range -300 < levelA < 0
        if (match[3] && (match[3] <= -300 || match[3] === 0)) {
            return callback(errmsg)
        }

        if (match[7] && (match[7] <= -300 || match[3] === 0)) {
            return callback(errmsg)
        }

        // valid pattern range  0 <= cadence <= 16383.
        var fields = [9, 10, 12, 13, 15, 16]

        for (var i = 0, len = fields.length; i < len; i++) {
            var idx = fields[i]

            if (match[idx] && match[idx] > 16383) {
                return callback(errmsg)
            }
        }

        callback()
    }
    _checkLimitValue = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (Number(value) && Number(value) !== 1 && Number(value) !== 2) {
            callback(formatMessage({id: "LANG3840"}))
        } else {
            callback()
        }
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const modalFormItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        let state = this.state,
            analogtrunk = state.analogtrunk,
            params = this.props.params,
            mode = this.props.route.path,
            isEdit = (mode.indexOf('edit') === 0),
            isAdd = (mode.indexOf('add') === 0),
            headerTitle = formatMessage({id: "LANG762"})

        if (isEdit) {
            headerTitle = formatMessage({
                id: "LANG642"
            }, {
                0: formatMessage({id: "LANG105"}),
                1: params.trunkName
            })

            if (!_.isEmpty(analogtrunk) && state.firstLoad) {
                if (analogtrunk["fax_intelligent_route_destination"] === "") {
                    analogtrunk["fax_intelligent_route_destination"] = "no"
                }

                if (Number(analogtrunk["busycount"]) === 0) {
                    analogtrunk["busycount"] = 2
                }

                if (Number(analogtrunk["congestioncount"]) === 0) {
                    analogtrunk["congestioncount"] = 2
                }

                if ((analogtrunk['faxdetect'] === 'no') && (analogtrunk['fax_gateway'] === 'no')) {
                    analogtrunk["faxmode"] = 'no'
                } else if (analogtrunk['faxdetect'] === 'incoming') {
                    state.div_faxDetect_style = true

                    analogtrunk["faxmode"] = 'detect'
                } else if (analogtrunk['fax_gateway'] === 'yes') {
                    analogtrunk["faxmode"] = 'gateway'
                }

                if (analogtrunk.busydetect === "yes") {
                    state["div_busycount_style"] = true
                } else {
                    state["div_busycount_style"] = false
                }

                if (analogtrunk.congestiondetect === "yes") {
                    state["div_congestioncount_style"] = true
                } else {
                    state["div_congestioncount_style"] = false
                }

                if (analogtrunk["enablecurrentdisconnectthreshold"] === "yes") {
                    state["div_currentdisconnectthreshold_style"] = true
                } else {
                    state["div_currentdisconnectthreshold_style"] = false
                    analogtrunk["currentdisconnectthreshold"] = "200"
                }

                if (analogtrunk["polarityswitch"] === "yes") {
                    state["polarityswitchVal"] = true
                    state["div_polarityonanswerdelay_style"] = true
                } else {
                    state["div_polarityonanswerdelay_style"] = false
                }

                state["faxIntelligentRouteVal"] = !(analogtrunk["fax_intelligent_route"] === "yes" ? true : false)
                state["firstLoad"] = false
                // state.loading = false
            }
        }
        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    headerTitle={ headerTitle }
                    onSubmit={ this._handleSubmit.bind(this) }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <div className="content">
                    <Spin spinning={ false }>
                        <Form>
                            <Row style={{ 'marginTop': '10px' }}>
                                <Col span={ 12 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        className="ant-form-left-explain"
                                        label={ formatMessage({id: "LANG1329"}) }
                                    >
                                        { getFieldDecorator('changroup', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    let errMsg = formatMessage({id: "LANG3224"})

                                                    if (value && value.length > 1 && getFieldValue('trunkmode')) {
                                                        callback(errMsg)
                                                    } else {
                                                        callback()
                                                    }
                                                }
                                            }],
                                            initialValue: state.checkedChansList
                                        })(
                                            <CheckboxGroup options={ state.totalChans } onChange={ this._onChangeChans } />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={ 12 }>
                                    <FormItem
                                        className="hidden"
                                        ref="div_trunkgroup"
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1343" /> }>
                                                <span>{ formatMessage({id: "LANG1342"}) }</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('trunkgroup', {
                                            rules: [],
                                            initialValue: analogtrunk.trunkgroup ? analogtrunk.trunkgroup + '' : ""
                                        })(
                                            <Select></Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={ 12 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1350" /> }>
                                                <span>{ formatMessage({id: "LANG1351"}) }</span>
                                            </Tooltip>
                                        }
                                    >
                                        { getFieldDecorator('trunk_name', {
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
                                                    let errMsg = formatMessage({id: "LANG2137"})
                                                    // let errMsg = formatMessage({id: "LANG2135"}, {0: 1, 1: formatMessage({id: "LANG1329"})})

                                                    this._trunkNameIsExist(data, value, callback, errMsg)
                                                }
                                            }],
                                            initialValue: analogtrunk.trunk_name || ""
                                        })(
                                            <Input />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG229"}) }</span>
                            </div>
                            <div className="section-body row-section-content">
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            className="ant-form-left-explain"
                                            label={
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3219" /> }>
                                                    <span>{ formatMessage({id: "LANG3218"}) }</span>
                                                </Tooltip>
                                            }
                                        >
                                            { getFieldDecorator('trunkmode', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    validator: (data, value, callback) => {
                                                        let trunkId = this.props.params.trunkId,
                                                            errMsg = formatMessage({id: "LANG3284"}),
                                                            isFind = _.find(this.state.failoverTrunkList, function (num) {
                                                                        return num.toString() === trunkId
                                                                    })

                                                        if (isEdit && value && typeof isFind !== "undefined") {
                                                            callback(errMsg)
                                                        }

                                                        callback()
                                                    }
                                                }],
                                                valuePropName: 'checked',
                                                initialValue: analogtrunk.trunkmode === "sla" ? true : false
                                            })(
                                                <Checkbox onChange={ this._onChangeTrunkmode } disabled={ state.polarityswitchVal ? true : false }/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row ref="div_slaOptions" className={ state.div_slaOptions_style === false ? "hidden" : "display-block" }>
                                    <Col span={ 12 }>
                                        <FormItem
                                            ref="div_bargeallowed"
                                            { ...formItemLayout }
                                            className={ state.div_slaOptions_style === false ? "hidden" : "display-block" }
                                            label={
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3221" /> }>
                                                    <span>{ formatMessage({id: "LANG3220"}) }</span>
                                                </Tooltip>
                                            }
                                        >
                                            { getFieldDecorator('bargeallowed', {
                                                rules: [],
                                                valuePropName: 'checked',
                                                initialValue: analogtrunk.bargeallowed === "yes" ? true : false
                                            })(
                                                <Checkbox />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            ref="div_holdaccess"
                                            { ...formItemLayout }
                                            className={ state.div_slaOptions_style === false ? "hidden" : "display-block" }
                                            label={
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3223" /> }>
                                                    <span>{ formatMessage({id: "LANG3222"}) }</span>
                                                </Tooltip>
                                            }
                                        >
                                            { getFieldDecorator('holdaccess', {
                                                rules: [],
                                                initialValue: analogtrunk.holdaccess || "open"
                                            })(
                                                <Select>
                                                    <Option value="open">Open</Option>
                                                    <Option value="private">Private</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1341" /> }>
                                                    <span>{ formatMessage({id: "LANG1340"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('polarityswitch', {
                                                rules: [],
                                                valuePropName: "checked",
                                                initialValue: analogtrunk.polarityswitch === "yes" ? true : false
                                            })(
                                                <Checkbox onChange={ this._onChangePolarityswitch } disabled={ state.trunkmodeVal ? true : false } />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            ref="div_polarityonanswerdelay"
                                            className={ state.div_polarityonanswerdelay_style === false ? "hidden" : "display-block" }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1345" /> }>
                                                    <span>{ formatMessage({id: "LANG1344"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('polarityonanswerdelay', {
                                                getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                    /* type: 'integer', */
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.range(data, value, callback, formatMessage, 100, 2000)
                                                    }
                                                }],
                                                initialValue: analogtrunk.polarityonanswerdelay ? analogtrunk.polarityonanswerdelay : 600
                                            })(
                                                <Input maxLength="4" min={ 100 } max={ 2000 }/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1695" /> }>
                                                    <span>{ formatMessage({id: "LANG1694"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('enablecurrentdisconnectthreshold', {
                                                rules: [],
                                                valuePropName: "checked",
                                                initialValue: analogtrunk.enablecurrentdisconnectthreshold === "no" ? false : true
                                            })(
                                                <Checkbox onChange={ this._onChangeEnablecurrentdisconnectthreshold }/>
                                            )}
                                            <span ref="div_currentdisconnectthreshold" className={ state.div_currentdisconnectthreshold_style === false ? "hidden" : "display-inline" }>
                                            <FormItem>
                                                { getFieldDecorator('currentdisconnectthreshold', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        /* type: 'integer', */
                                                        required: true,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.digits(data, value, callback, formatMessage)
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            Validator.range(data, value, callback, formatMessage, 50, 3000)
                                                        }
                                                    }],
                                                    initialValue: analogtrunk.currentdisconnectthreshold || 200
                                                })(
                                                    <Input min={ 50 } max={ 3000 } />
                                                )}
                                                </FormItem>
                                            </span>
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1347" /> }>
                                                    <span>{ formatMessage({id: "LANG1346"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('ringtimeout', {
                                                getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                    /* type: 'integer', */
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.range(data, value, callback, formatMessage, 4000, 20000)
                                                    }
                                                }],
                                                initialValue: analogtrunk.ringtimeout || 8000
                                            })(
                                                <Input min={ 4000 } max={ 20000 } />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1398" /> }>
                                                    <span>{ formatMessage({id: "LANG1397"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('rxgain', {
                                                getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.gain(data, value, callback, formatMessage, -13.5, 12)
                                                    }
                                                }],
                                                initialValue: analogtrunk.rxgain || 0
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1400" /> }>
                                                    <span>{ formatMessage({id: "LANG1399"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('txgain', {
                                                getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.gain(data, value, callback, formatMessage, -13.5, 12)
                                                    }
                                                }],
                                                initialValue: analogtrunk.txgain || 0
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1352" /> }>
                                                    <span>{ formatMessage({id: "LANG1353"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('usecallerid', {
                                                rules: [],
                                                valuePropName: "checked",
                                                initialValue: analogtrunk.usecallerid === "no" ? false : true
                                            })(
                                                <Checkbox />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            ref="div_faxmode"
                                            { ...formItemLayout }
                                            className={ state.div_faxmode_style === false ? "hidden" : "display-block" }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3555" /> }>
                                                    <span>{ formatMessage({id: "LANG3871"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('faxmode', {
                                                rules: [],
                                                initialValue: analogtrunk.faxmode || "no"
                                            })(
                                                <Select onChange={ this._onClickFaxmode }>
                                                    <Option value='no'>{formatMessage({id: "LANG133"})}</Option>
                                                    <Option value='detect'>{formatMessage({id: "LANG1135"})}</Option>
                                                    <Option value='gateway'>{formatMessage({id: "LANG3554"})}</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row ref="div_faxDetect" className={ state.div_faxDetect_style === false ? "hidden" : "display-block" }>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            ref="div_fax_intelligent_route"
                                            className={ state.div_faxDetect_style === false ? "hidden" : "display-block" }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG4380" /> }>
                                                    <span>{ formatMessage({id: "LANG4379"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('fax_intelligent_route', {
                                                rules: [],
                                                valuePropName: "checked",
                                                initialValue: analogtrunk.fax_intelligent_route === "yes" ? true : false
                                            })(
                                                <Checkbox onChange={ this._onChangefaxIntelligentRoute }/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            ref="div_fax_intelligent_route_destination"
                                            className={ state.div_faxDetect_style === false ? "hidden" : "display-block" }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG4380" /> }>
                                                    <span>{ formatMessage({id: "LANG4379"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('fax_intelligent_route_destination', {
                                                rules: [],
                                                initialValue: analogtrunk.fax_intelligent_route_destination || "no"
                                            })(
                                                <Select disabled={ state.faxIntelligentRouteVal ? false : true }>
                                                {
                                                    state.faxIntelligentRouteDestinationOpts.map(function(it) {
                                                        let val = it.val,
                                                            text = it.text
                                                        return <Option key={ val } value={ val }>
                                                               { text ? text : val }
                                                            </Option>
                                                    })
                                                }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG2254" /> }>
                                                    <span>{ formatMessage({id: "LANG2275"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('cidmode', {
                                                rules: [],
                                                initialValue: analogtrunk.cidmode ? analogtrunk.cidmode.toString() : "0"
                                            })(
                                            <Select>
                                                <Option value='0'>{formatMessage({id: "LANG2268"})}</Option>
                                                <Option value='1'>{formatMessage({id: "LANG2250"})}</Option>
                                                <Option value='2'>{formatMessage({id: "LANG2267"})}</Option>
                                                <Option value='3'>{formatMessage({id: "LANG2249"})}</Option>
                                                <Option value='4'>{formatMessage({id: "LANG2266"})}</Option>
                                                <Option value='5'>{formatMessage({id: "LANG2248"})}</Option>
                                                <Option value='6'>{formatMessage({id: "LANG2265"})}</Option>
                                                <Option value='7'>{formatMessage({id: "LANG2247"})}</Option>
                                                <Option value='8'>{formatMessage({id: "LANG2262"})}</Option>
                                                <Option value='9'>{formatMessage({id: "LANG2245"})}</Option>
                                                <Option value='10'>{formatMessage({id: "LANG5268"})}</Option>
                                                <Option value='11'>{formatMessage({id: "LANG2410"})}</Option>
                                            </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3254" /> }>
                                                    <span>{ formatMessage({id: "LANG3253"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('fxooutbandcalldialdelay', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    /* type: 'integer', */
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.range(data, value, callback, formatMessage, 0, 3000)
                                                    }
                                                }],
                                                initialValue: analogtrunk.fxooutbandcalldialdelay || 0
                                            })(
                                                <Input min={0} max={3000} />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG5266" /> }>
                                                    <span>{ formatMessage({id: "LANG2543"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('auto_record', {
                                                rules: [],
                                                valuePropName: "checked",
                                                initialValue: analogtrunk.auto_record === "yes" ? true : false
                                            })(
                                                <Checkbox />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3480" /> }>
                                                    <span>{ formatMessage({id: "LANG2757"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('out_of_service', {
                                                rules: [],
                                                valuePropName: "checked",
                                                initialValue: analogtrunk.out_of_service === "yes" ? true : false
                                            })(
                                                <Checkbox />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3533" /> }>
                                                    <span>{ formatMessage({id: "LANG3532"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('dahdilineselectmode', {
                                                rules: [],
                                                initialValue: analogtrunk.dahdilineselectmode || "ascend"
                                            })(
                                                <Select disabled={ state.trunkmodeVal ? true : false }>
                                                    <Option value='ascend'>{formatMessage({id: "LANG3534"})}</Option>
                                                    <Option value='poll'>{formatMessage({id: "LANG3535"})}</Option>
                                                    <Option value='desend'>{formatMessage({id: "LANG3536"})}</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            ref="div_out_maxchans"
                                            { ...formItemLayout }
                                            className={ state.div_out_maxchans_style === false ? "hidden" : "display-block" }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3024" /> }>
                                                    <span>{ formatMessage({id: "LANG3023"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('out_maxchans', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    /* type: 'integer', */
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        let errMsg = formatMessage({id: "LANG3972"})

                                                        if (parseInt(value) > state.checkedChansList.length) {
                                                            callback(errMsg)
                                                        } else {
                                                            callback()
                                                        }
                                                    }
                                                }],
                                                initialValue: analogtrunk.out_maxchans || 0
                                            })(
                                                <Input disabled={ state.trunkmodeVal ? true : false } />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className={'hidden'}
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG5610" /> }>
                                                    <span>{ formatMessage({id: "LANG5609"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('lectype', {
                                                rules: [],
                                                initialValue: String(analogtrunk.lectype) || '0'
                                            })(
                                                <Select >
                                                    <Option value='0'>{formatMessage({id: "LANG257"})}</Option>
                                                    <Option value='1'>{formatMessage({id: "LANG5611"})}</Option>
                                                    <Option value='2'>{formatMessage({id: "LANG5612"})}</Option>
                                                    <Option value='3'>{formatMessage({id: "LANG5613"})}</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </div>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG2387"}) }</span>
                            </div>
                            <div className="section-body row-section-content">
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1324" /> }>
                                                    <span>{ formatMessage({id: "LANG1323"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('busydetect', {
                                                rules: [],
                                                valuePropName: "checked",
                                                initialValue: analogtrunk.busydetect === "no" ? false : true
                                            })(
                                                <Checkbox onChange={ this._onChangeBusydetect } />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            ref="div_busycount"
                                            { ...formItemLayout }
                                            className={ state.div_busycount_style === false ? "hidden" : "display-block" }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1322" /> }>
                                                    <span>{ formatMessage({id: "LANG1321"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('busycount', {
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
                                                    validator: this._checkLimitValue
                                                }],
                                                initialValue: analogtrunk.busycount || 2
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1335" /> }>
                                                    <span>{ formatMessage({id: "LANG1334"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('congestiondetect', {
                                                rules: [],
                                                valuePropName: "checked",
                                                initialValue: analogtrunk.congestiondetect === "no" ? false : true
                                            })(
                                                <Checkbox onChange={ this._onChangeCongestiondetect }/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            id="div_congestioncount"
                                            className={ state.div_congestioncount_style === false ? "hidden" : "display-block"}
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1333" /> }>
                                                    <span>{ formatMessage({id: "LANG1332"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('congestioncount', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    /* type: 'integer', */
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        let errMsg = formatMessage({id: "LANG3840"})

                                                        if (value < 1 || value > 2) {
                                                            callback(errMsg)
                                                        } else {
                                                            callback()
                                                        }
                                                    }
                                                }],
                                                initialValue: analogtrunk.congestioncount || "2"
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            id="toneCountryField"
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1348" /> }>
                                                    <span>{ formatMessage({id: "LANG1349"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('countrytone', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }],
                                                initialValue: analogtrunk.countrytone || "us"
                                            })(
                                                <Select onChange={ this._onChangeCountrytone }>
                                                {
                                                    state.countrytoneOpts.map(function(it) {
                                                        let val = it.val,
                                                            text = it.text
                                                        return <Option key={ val } value={ val }>
                                                               { text ? text : val }
                                                            </Option>
                                                    })
                                                }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1326" /> }>
                                                    <span>{ formatMessage({id: "LANG1325"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('busy', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this._checkTone(data, value, callback, formatMessage)
                                                    }
                                                }],
                                                initialValue: analogtrunk.busy || ""
                                            })(
                                                <Input disabled={ state.busyDisabled ? true : false }/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className="hidden"
                                            ref="div_busypattern"
                                            { ...formItemLayout }
                                            label=""
                                        >
                                            { getFieldDecorator('busypattern', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        let errMsg = 'Invalid Format ( format example: 500,500 )'

                                                        if (!value) {
                                                            callback()
                                                        }

                                                        if (/^[0-9]+,[0-9]+$/.test(value)) {
                                                            callback()
                                                        } else {
                                                            callback(errMsg)
                                                        }
                                                    }
                                                }],
                                                initialValue: analogtrunk.busypattern || "500,500"
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className="hidden"
                                            { ...formItemLayout }
                                            ref="div_congestionpattern"
                                            label=""
                                        >
                                            { getFieldDecorator('congestionpattern', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        let errMsg = "Invalid Format ( format example: X,X ), the range of 'X' is [100,2000]"

                                                        if (!value) {
                                                            callback()
                                                        }

                                                        if (/^[0-9]+,[0-9]+$/.test(value)) {
                                                            let a = Number(value.split(',')[0]),
                                                                b = Number(value.split(',')[1])

                                                            if (a >= 100 && a <= 2000 && b >= 100 && b <= 2000) {
                                                                callback()
                                                            } else {
                                                                callback(errMsg)
                                                            }
                                                        } else {
                                                            callback(errMsg)
                                                        }
                                                    }
                                                }],
                                                initialValue: analogtrunk.congestionpattern || "250,250"
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className="hidden"
                                            { ...formItemLayout }
                                            ref="div_busyfrequencies"
                                            label=""
                                        >
                                            { getFieldDecorator('busyfrequencies', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        let errMsg = "Invalid format (format example: 450 or 480+620)."

                                                        if (!value) {
                                                            callback()
                                                        }

                                                        if (/^[0-9]+\+?[0-9]+$/.test(value)) {
                                                            callback()
                                                        } else {
                                                            callback(errMsg)
                                                        }
                                                    }
                                                }],
                                                initialValue: analogtrunk.busyfrequencies || "480+620"
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className="hidden"
                                            { ...formItemLayout }
                                            ref="div_congestionfrequencies"
                                            label=""
                                        >
                                            { getFieldDecorator('congestionfrequencies', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        let errMsg = "Invalid format (format example: 450 or 480+620)."

                                                        if (!value) {
                                                            callback()
                                                        }

                                                        if (/^[0-9]+\+?[0-9]+$/.test(value)) {
                                                            callback()
                                                        } else {
                                                            callback(errMsg)
                                                        }
                                                    }
                                                }],
                                                initialValue: analogtrunk.congestionfrequencies || "450+450"
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className="hidden"
                                            ref="div_busylevels"
                                            { ...formItemLayout }
                                            label=""
                                        >
                                            { getFieldDecorator('busylevels', {
                                                rules: [],
                                                initialValue: ""
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className="hidden"
                                            { ...formItemLayout }
                                            ref="div_congestionlevels"
                                            label=""
                                        >
                                            { getFieldDecorator('congestionlevels', {
                                                rules: [],
                                                initialValue: analogtrunk.congestionlevels || ""
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        {/* <FormItem
                                            ref="div_congestioncount"
                                            className="hidden"
                                            { ...formItemLayout }
                                            label=""
                                        >
                                            { getFieldDecorator('congestioncount', {
                                                rules: [],
                                                initialValue: ""
                                            })(
                                                <Input />
                                            )}
                                        </FormItem> */}
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            ref="div_cidstart"
                                            className="hidden"
                                            { ...formItemLayout }
                                            label=""
                                        >
                                            { getFieldDecorator('cidstart', {
                                                rules: [],
                                                initialValue: analogtrunk.cidstart || ""
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className="hidden"
                                            { ...formItemLayout }
                                            ref="div_cidsignalling"
                                            label=""
                                        >
                                            { getFieldDecorator('cidsignalling', {
                                                rules: [],
                                                initialValue: analogtrunk.cidsignalling || ""
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            className="hidden"
                                            ref="div_echocancel"
                                            { ...formItemLayout }
                                            label=""
                                        >
                                            { getFieldDecorator('echocancel', {
                                                rules: [],
                                                initialValue: analogtrunk.echocancel || "128"
                                            })(
                                                <Input />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={ 12 }>
                                        <FormItem
                                            id="toneCountryField"
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1337" /> }>
                                                    <span>{ formatMessage({id: "LANG1336"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('congestion', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this._checkTone(data, value, callback, formatMessage)
                                                    }
                                                }],
                                                initialValue: analogtrunk.congestion || ""
                                            })(
                                                <Input disabled={ state.congestionDisabled ? true : false}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={ 12 }>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG2348" /> }>
                                                    <span>{ formatMessage({id: "LANG2347"}) }</span>
                                                </Tooltip>
                                            )}
                                        >
                                            <Button type="primary" ref="detect" size="default" onClick={ this._showModal } disabled={ state.checkedChansList.length !== 0 ? false : true}>{formatMessage({id: "LANG2325"})}</Button>
                                        </FormItem>
                                    </Col>
                                </Row>
                            </div>
                            <Modal
                                className="ant-form"
                                onOk={ this._handleOk }
                                visible={ state.visible }
                                onCancel={ this._pstnCancel }
                                title={ formatMessage({id: "LANG2347"}) }
                                okText={ formatMessage({id: "LANG2325"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                            >
                                <FormItem
                                    { ...modalFormItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2409" /> }>
                                            <span>{ formatMessage({id: "LANG2408"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('detect_model', {
                                        rules: [],
                                        initialValue: analogtrunk.detect_model || "0"
                                    })(
                                        <Select onChange={ this._onChangeDetectModel }>
                                            <Option value='0'>{ formatMessage({id: "LANG2410"}) }</Option>
                                            <Option value='1'>{ formatMessage({id: "LANG2411"}) }</Option>
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...modalFormItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2327" /> }>
                                            <span>{ formatMessage({id: "LANG2326"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('src_channels', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                let errMsg = formatMessage({id: "LANG2334"})

                                                if (state.div_des_channels_style && value === getFieldValue("des_channels")) {
                                                    callback(errMsg)
                                                } else {
                                                    callback()
                                                }
                                            }
                                        }],
                                        initialValue: state.checkedChansList[0] || '1'
                                    })(
                                        <Select style={{width: "50px"}}>
                                        {
                                            state.checkedChansList.map(function (it) {
                                                return <Option key={ it } value={ it }>
                                                       { it }
                                                    </Option>
                                            })
                                        }
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    className="hidden"
                                    { ...modalFormItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2331" /> }>
                                            <span>{ formatMessage({id: "LANG2330"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('src_number', {
                                        rules: [],
                                        initialValue: analogtrunk.src_number || ""
                                    })(
                                        <Input maxLength="32" />
                                    )}
                                </FormItem>
                                <FormItem
                                    ref="div_des_channels"
                                    { ...modalFormItemLayout }
                                    className={ state.div_des_channels_style === false ? "hidden" : "display-block" }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2329" /> }>
                                            <span>{ formatMessage({id: "LANG2328"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('des_channels', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                let errMsg = formatMessage({id: "LANG2334"})

                                                if (state.div_des_channels_style && getFieldValue("src_channels") === value) {
                                                    callback(errMsg)
                                                } else {
                                                    callback()
                                                }
                                            }
                                        }],
                                        initialValue: state.totalChans[0] ? state.totalChans[0].value : '1'
                                    })(
                                        <Select style={{ width: "50px" }}>
                                        {
                                            state.totalChans.map(function (it) {
                                                let value = it.value

                                                return <Option key={ value } value={ value }>
                                                       { value }
                                                    </Option>
                                            })
                                        }
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...modalFormItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2333" /> }>
                                            <span>{ formatMessage({id: "LANG2332"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('des_number', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            /* type: 'integer', */
                                            required: state.visible,
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
                                        initialValue: analogtrunk.des_number || ""
                                    })(
                                        <Input maxLength="32" />
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...modalFormItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5139" /> }>
                                            <span>{ formatMessage({id: "LANG5139"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('is_save_record', {
                                        rules: [],
                                        valuePropName: "checked",
                                        initialValue: analogtrunk.is_save_record === "yes" ? true : false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem>
                                <span>{ formatMessage({id: "LANG2414"}) }</span>
                            </Modal>
                        </Form>
                    </Spin>
                </div>
            </div>
        )
    }
}

AnalogTrunkItem.defaultProps = {
    detectParams: ["detect_model", "src_channels", "src_number", "des_channels", "des_number", "is_save_record"],
    cidmodeObj: {
        0: {
            cidstart: "ring",
            cidsignalling: "bell"
        },
        1: {
            cidstart: "ring",
            cidsignalling: "bell"
        },
        2: {
            cidstart: "ring",
            cidsignalling: "bell"
        },
        3: {
            cidstart: "ring",
            cidsignalling: "bell"
        },
        4: {
            cidstart: "ring",
            cidsignalling: "bell"
        },
        5: {
            cidstart: "polarity",
            cidsignalling: "dtmf"
        },
        6: {
            cidstart: "dtmf",
            cidsignalling: "dtmf"
        },
        7: {
            cidstart: "polarity",
            cidsignalling: "dtmf"
        },
        8: {
            cidstart: "polarity_in",
            cidsignalling: "dtmf"
        },
        9: {
            cidstart: "polarity",
            cidsignalling: "v23"
        },
        10: {
            cidstart: "polarity",
            cidsignalling: "v23_jp"
        },
        11: {
            cidstart: "autodetect",
            cidsignalling: ""
        }
    },
    mappingErrCode: {
        "-1": "LANG2931", // "time out"
        0: "", // "no error return"
        1: "LANG2934", // "ACIM detect is running"
        2: "LANG2933", // "CPT detect is running"
        3: "LANG2936", // "unload dahdi module failed"
        4: "LANG2948", // "invaid extension number"
        5: "LANG2949", // "invaid fxo channel number"
        6: "LANG2937", // "fxo absent/busy"
        7: "LANG2950", // "fxo disconnect"
        8: "LANG2951", // "monitor task init failed"
        9: "LANG2952", // "fxo configure failed"
        10: "LANG2953", // "fxo offhook failed"
        11: "LANG2954", // "fxo dial failed"
        12: "LANG2955", // "no dial tone detected"
        13: "LANG2956", // "pickup the call failed"
        14: "LANG2957", // "user pickup the call timeout"
        15: "LANG2958", // "no ringback tone detected"
        16: "LANG2959", // "fxo dtmf send failed"
        17: "LANG2960", // "fxo no ringing, call setup failed"
        18: "LANG2961", // "hang up the call failed"
        19: "LANG2962", // "user hangup the call timeout"
        20: "LANG2963", // "no busy tone detected"
        21: "LANG2964" // "thread creat failed"
    },
    nation2langObj: {
        "ad": 'LANG275',
        "ae": 'LANG276',
        "af": 'LANG277',
        "ag": 'LANG278',
        "ai": 'LANG279',
        "al": 'LANG280',
        "am": 'LANG281',
        "ao": 'LANG282',
        "aq": 'LANG283',
        "ar": 'LANG284',
        "as": 'LANG285',
        "at": 'LANG286',
        "au": 'LANG287',
        "aw": 'LANG288',
        "ax": 'LANG289',
        "az": 'LANG290',
        "ba": 'LANG291',
        "bb": 'LANG292',
        "bd": 'LANG293',
        "be": 'LANG294',
        "bf": 'LANG295',
        "bg": 'LANG296',
        "bg2": 'LANG297',
        "bg3": 'LANG298',
        "bh": 'LANG299',
        "bi": 'LANG300',
        "bj": 'LANG301',
        "bl": 'LANG302',
        "bm": 'LANG303',
        "bn": 'LANG304',
        "bo": 'LANG305',
        "bq": 'LANG306',
        "br": 'LANG307',
        "bs": 'LANG308',
        "bt": 'LANG309',
        "bv": 'LANG310',
        "bw": 'LANG311',
        "by": 'LANG312',
        "bz": 'LANG313',
        "ca": 'LANG314',
        "cc": 'LANG315',
        "cd": 'LANG316',
        "cf": 'LANG317',
        "cg": 'LANG318',
        "ch": 'LANG319',
        "ci": 'LANG320',
        "ck": 'LANG321',
        "cl": 'LANG322',
        "cm": 'LANG323',
        "cn": 'LANG324',
        "co": 'LANG325',
        "cr": 'LANG326',
        "cu": 'LANG327',
        "cv": 'LANG328',
        "cw": 'LANG329',
        "cx": 'LANG330',
        "cy": 'LANG331',
        "cz": 'LANG332',
        "de": 'LANG333',
        "dj": 'LANG334',
        "dk": 'LANG335',
        "dk1": 'LANG336',
        "dm": 'LANG337',
        "do": 'LANG338',
        "do2": 'LANG339',
        "dz": 'LANG340',
        "ec": 'LANG341',
        "ee": 'LANG342',
        "eg": 'LANG343',
        "eh": 'LANG344',
        "er": 'LANG345',
        "es": 'LANG346',
        "et": 'LANG347',
        "fi": 'LANG348',
        "fj": 'LANG349',
        "fk": 'LANG350',
        "fm": 'LANG351',
        "fo": 'LANG352',
        "fr": 'LANG353',
        "ga": 'LANG354',
        "gb": 'LANG355',
        "gd": 'LANG356',
        "ge": 'LANG357',
        "gf": 'LANG358',
        "gg": 'LANG359',
        "gh": 'LANG360',
        "gi": 'LANG361',
        "gl": 'LANG362',
        "gm": 'LANG363',
        "gn": 'LANG364',
        "gp": 'LANG365',
        "gq": 'LANG366',
        "gr": 'LANG367',
        "gs": 'LANG368',
        "gt": 'LANG369',
        "gu": 'LANG370',
        "gw": 'LANG371',
        "gy": 'LANG372',
        "hk": 'LANG373',
        "hm": 'LANG374',
        "hn": 'LANG375',
        "hr": 'LANG376',
        "ht": 'LANG377',
        "hu": 'LANG378',
        "id": 'LANG379',
        "ie": 'LANG380',
        "il": 'LANG381',
        "im": 'LANG382',
        "in": 'LANG383',
        "io": 'LANG384',
        "iq": 'LANG385',
        "ir": 'LANG386',
        "is": 'LANG387',
        "it": 'LANG388',
        "je": 'LANG389',
        "jm": 'LANG390',
        "jo": 'LANG391',
        "jp": 'LANG392',
        "ke": 'LANG393',
        "kg": 'LANG394',
        "kh": 'LANG395',
        "ki": 'LANG396',
        "km": 'LANG397',
        "kn": 'LANG398',
        "kp": 'LANG399',
        "kr": 'LANG400',
        "kw": 'LANG401',
        "ky": 'LANG402',
        "kz": 'LANG403',
        "la": 'LANG404',
        "lb": 'LANG405',
        "lc": 'LANG406',
        "li": 'LANG407',
        "lk": 'LANG408',
        "lr": 'LANG409',
        "ls": 'LANG410',
        "ls2": 'LANG411',
        "lt": 'LANG412',
        "lu": 'LANG413',
        "lv": 'LANG414',
        "ly": 'LANG415',
        "ma": 'LANG416',
        "ma2": 'LANG417',
        "mc": 'LANG418',
        "md": 'LANG419',
        "me": 'LANG420',
        "mf": 'LANG421',
        "mg": 'LANG422',
        "mh": 'LANG423',
        "mk": 'LANG424',
        "ml": 'LANG425',
        "mm": 'LANG426',
        "mn": 'LANG427',
        "mo": 'LANG428',
        "mp": 'LANG429',
        "mq": 'LANG430',
        "mr": 'LANG431',
        "ms": 'LANG432',
        "mt": 'LANG433',
        "mu": 'LANG434',
        "mv": 'LANG435',
        "mw": 'LANG436',
        "mx": 'LANG437',
        "my": 'LANG438',
        "mz": 'LANG439',
        "na": 'LANG440',
        "nc": 'LANG441',
        "ne": 'LANG442',
        "nf": 'LANG443',
        "ng": 'LANG444',
        "ni": 'LANG445',
        "nl": 'LANG446',
        "no": 'LANG447',
        "np": 'LANG448',
        "nr": 'LANG449',
        "nauru": 'LANG450',
        "nu": 'LANG451',
        "nz": 'LANG452',
        "om": 'LANG453',
        "pa": 'LANG454',
        "pe": 'LANG455',
        "pf": 'LANG456',
        "pg": 'LANG457',
        "ph": 'LANG458',
        "pk": 'LANG459',
        "pl": 'LANG460',
        "pm": 'LANG461',
        "pn": 'LANG462',
        "pr": 'LANG463',
        "ps": 'LANG464',
        "pt": 'LANG465',
        "pt2": 'LANG466',
        "pw": 'LANG467',
        "py": 'LANG468',
        "qa": 'LANG469',
        "qa1": 'LANG470',
        "qa2": 'LANG471',
        "qa3": 'LANG472',
        "re": 'LANG473',
        "ro": 'LANG474',
        "rs": 'LANG475',
        "ru": 'LANG476',
        "rw": 'LANG477',
        "sa": 'LANG478',
        "sb": 'LANG479',
        "sc": 'LANG480',
        "sd": 'LANG481',
        "se": 'LANG482',
        "sg": 'LANG483',
        "sh": 'LANG484',
        "si": 'LANG485',
        "sj": 'LANG486',
        "sk": 'LANG487',
        "sl": 'LANG488',
        "sm": 'LANG489',
        "sn": 'LANG490',
        "so": 'LANG491',
        "sr": 'LANG492',
        "ss": 'LANG493',
        "st": 'LANG494',
        "sv": 'LANG495',
        "sx": 'LANG496',
        "sy": 'LANG497',
        "sz": 'LANG498',
        "tc": 'LANG499',
        "td": 'LANG500',
        "tf": 'LANG501',
        "tg": 'LANG502',
        "th": 'LANG503',
        "tj": 'LANG504',
        "tk": 'LANG505',
        "tl": 'LANG506',
        "tm": 'LANG507',
        "tn": 'LANG508',
        "to": 'LANG509',
        "tr": 'LANG510',
        "tt": 'LANG511',
        "tv": 'LANG512',
        "tw": 'LANG513',
        "tz": 'LANG514',
        "tz2": 'LANG515',
        "ua": 'LANG516',
        "ug": 'LANG517',
        "ug2": 'LANG518',
        "uk": 'LANG519',
        "um": 'LANG520',
        "us": 'LANG521',
        "us_old": 'LANG522',
        "us-old": 'LANG523',
        "uy": 'LANG524',
        "uz": 'LANG525',
        "va": 'LANG526',
        "vc": 'LANG527',
        "ve": 'LANG528',
        "vg": 'LANG529',
        "vi": 'LANG530',
        "vn": 'LANG531',
        "vu": 'LANG532',
        "wf": 'LANG533',
        "ws": 'LANG534',
        "ye": 'LANG535',
        "yt": 'LANG536',
        "za": 'LANG537',
        "zm": 'LANG538',
        "zw": 'LANG539'
    }
}

AnalogTrunkItem.propTypes = {
}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(AnalogTrunkItem)))

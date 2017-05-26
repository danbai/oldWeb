'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Table, Button, Col, Checkbox, Form, Input, message, Popover, Popconfirm, Row, Select, Transfer, Steps, Tooltip, Card, Modal, Radio } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import _ from "underscore"
import SubscribeEvent from '../../api/subscribeEvent'
import cookie from 'react-cookie'

const FormItem = Form.Item
const Option = Select.Option
const Step = Steps.Step
const RadioGroup = Radio.Group
const confirm = Modal.confirm
const CheckboxGroup = Checkbox.Group

global.SetupWizardReboot = false
global.SetupWizardReLogin = false
global.SetupWizardEditTrunkName = ''
global.SetupWizardEditOutName = ''

const interfaceObj = {
    '0': 'eth1',
    '1': 'eth0',
    '2': {
        'LAN1': 'eth0',
        'LAN2': 'eth1'
    }
}

const nation2langObj = {
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

class SetupWizard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            current: 0,
            languageList: [],
            language: 'en',
            timezoneItem: {},
            customizeDisable: true,
            secretDisable: true,
            numberList: [],
            accountList: [],
            prefSettings: {},
            newExtenNum: '',
            popValue: '',
            popValueList: [],
            disable_extension_ranges: false,
            existOutboundRouteList: [],
            addTrunkShow: false,
            trunkEdit: false,
            countryToneList: [],
            permissionPopVisible: false,
            permissionPopContent: "",
            byDIDDisabled: false,
            destinationAccountShow: false,
            selectTrunkType: "SIP",
            addTrunkList: [],
            idList: [],
            checkedFXOList: [],
            editCheckedList: [],
            usedFXOList: [],
            trunkNameList: [],
            outboundNameList: [],
            editTrunkID: 0,
            span_type: 'E1',
            signalling: 'pri_net',
            network_settings: {},
            dhcp_settings: {},
            dhcp6_settings: {},
            method_display_calss: {
                num_eth: 'display-block'
            },
            method_change_calss: {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'display-block',
                lan2title: 'hidden',
                wantitle: 'hidden'
            },
            lan1_ip_class: {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            },
            lan2_ip_class: {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            },
            default_interface_calss: {
                lan1: 'display-block',
                lan2: 'hidden'
            },
            method_key: [],
            disableExtensionItem: false,
            batch_number: 5
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
        this._initNetwork()
    }
    /* network */
    _initNetwork = () => {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        let myclass = this.state.method_display_calss
        let method_key = this.state.method_key || []
        if (Number(model_info.num_eth) >= 2) {
            myclass.num_eth = 'display-block'
            method_key = [{"key": "1", "name": formatMessage({id: "LANG551"})}, {"key": "2", "name": formatMessage({id: "LANG2219"})}]
            if (model_info.allow_nat === "1") {
                let item = {"key": "0", "name": formatMessage({id: "LANG550"})}
                method_key.push(item)
            }
        } else {
            myclass.num_eth = 'hidden'
        }

        let network_settings = {}
        let dhcp_settings = {}
        let dhcp6_settings = {}

        $.ajax({
            url: api.apiHost,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "getNetworkSettings"
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    const response = data.response || {}
                    _.each(response.network_settings, function(num, key) {
                        if (key === 'dhcp_enable') {
                            network_settings[key] = num === "1" ? true : false
                        } else {
                            network_settings[key] = num
                        }
                    })
                    dhcp_settings = data.response.dhcp_settings
                    dhcp6_settings = data.response.dhcp6_settings
               }
           }
        })

        let value = network_settings.method
        let method = {}
        let default_interface = {
            lan1: 'hidden',
            lan2: 'display-block'
        }

        if (value === "0") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'display-block',
                lantitle: 'hidden',
                lan2title: 'hidden',
                wantitle: 'display-block'
            }
        } else if (value === "1") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'display-block',
                lan2title: 'hidden',
                wantitle: 'hidden'
            }
        } else {
            method = {
                lan1: 'display-block',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'hidden',
                lan2title: 'display-block',
                wantitle: 'hidden'
            }

            if (network_settings.default_interface === "LAN1") {
                default_interface = {
                    lan1: 'display-block',
                    lan2: 'hidden'
                }
            } else {
                default_interface = {
                    lan1: 'hidden',
                    lan2: 'display-block'
                }
            }
        }

        value = network_settings.lan1_ip_method
        let ipmethod = {}
        let ipmethod2 = {}

        if (value === "0") {
            ipmethod = {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            }
        } else if (value === "1") {
            ipmethod = {
                dhcp: 'hidden',
                static: 'display-block',
                pppoe: 'hidden'
            }
        } else {
            ipmethod = {
                dhcp: 'hidden',
                static: 'hidden',
                pppoe: 'display-block'
            }
        }
        value = network_settings.lan2_ip_method

        if (value === "0") {
            ipmethod2 = {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            }
        } else if (value === "1") {
            ipmethod2 = {
                dhcp: 'hidden',
                static: 'display-block',
                pppoe: 'hidden'
            }
        } else {
            ipmethod2 = {
                dhcp: 'hidden',
                static: 'hidden',
                pppoe: 'display-block'
            }
        }

        value = network_settings.lan1_ip6_method
        let ip6method = {}
        let ip6method2 = {}

        if (value === "1") {
            ip6method = {
                static: 'display-block'
            }
        } else {
            ip6method = {
                static: 'hidden'
            }
        }
        value = network_settings.lan2_ip6_method
        if (value === "1") {
            ip6method2 = {
                static: 'display-block'
            }
        } else {
            ip6method2 = {
                static: 'hidden'
            }
        }

        value = network_settings.dhcp6_enable
        let dhcp_ipv6 = {}

        if (value === "1") {
            dhcp_ipv6 = {
                fromto: 'hidden'
            }
        } else {
            dhcp_ipv6 = {
                fromto: 'display-block'
            }
        }

        this.setState({
            method_display_calss: myclass,
            method_change_calss: method,
            lan1_ip_class: ipmethod,
            lan2_ip_class: ipmethod2,
            default_interface_calss: default_interface,
            method_key: method_key,
            network_settings: network_settings,
            dhcp_settings: dhcp_settings,
            dhcp6_settings: dhcp6_settings
        })
    }
    _onChangeDHCP = (e) => {
        let network_settings = this.state.network_settings
        network_settings.dhcp_enable = e.target.checked
        this.setState({
            network_settings: network_settings
        })
    }
    _networkMethodSwitch = (value) => {
        const { form } = this.props
        let method = {}
        let default_interface_calss = {
            lan1: 'hidden',
            lan2: 'display-block'
        }

        if (value === "0") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'display-block',
                lantitle: 'hidden',
                lan2title: 'hidden',
                wantitle: 'display-block'
            }
        } else if (value === "1") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'display-block',
                lan2title: 'hidden',
                wantitle: 'hidden'
            }
        } else {
            method = {
                lan1: 'display-block',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'hidden',
                lan2title: 'display-block',
                wantitle: 'hidden'
            }

            let defaultInterface = form.getFieldValue("default_interface")
            if (defaultInterface === "LAN1") {
                default_interface_calss = {
                    lan1: 'display-block',
                    lan2: 'hidden'
                }
            } else {
                default_interface_calss = {
                    lan1: 'hidden',
                    lan2: 'display-block'
                }
            }
        }

        // this.props.change8021x(value)

        this.setState({
            method_change_calss: method,
            default_interface_calss: default_interface_calss
        })
    }
    _onChangeIPMethod = (key, value) => {
        let method = {}

        if (value === "0") {
            method = {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            }
        } else if (value === "1") {
            method = {
                dhcp: 'hidden',
                static: 'display-block',
                pppoe: 'hidden'
            }
        } else {
            method = {
                dhcp: 'hidden',
                static: 'hidden',
                pppoe: 'display-block'
            }
        }
        if (key === "lan1_ip_method") {
            this.setState({
                lan1_ip_class: method
            })
        } else {
            this.setState({
                lan2_ip_class: method
            })
        }
    }
    _onChangeDefaultInterface = (value) => {
        let data = {}

        if (value === "LAN1") {
            data = {
                lan1: 'display-block',
                lan2: 'hidden'
            }
        } else {
            data = {
                lan1: 'hidden',
                lan2: 'display-block'
            }
        }
        this.setState({
            default_interface_calss: data
        })
    }
    _inSameNetworkSegment = (data, value, callback, formatMessage, ip1, ip2, submask, mask, str, needSame) => {
        const { form } = this.props
        let res = true
        let dhcp_enable = form.getFieldValue('dhcp_enable')
        if ((ip2 === "dhcp_gateway" && dhcp_enable) || str === "other") {
            let tenTotwo = function(str) {
                str = parseInt(str, 10).toString(2)
                let i = 0

                for (i = str.length; i < 8; i = str.length) {
                    str = "0" + str
                }

                return str
            }
            ip1 = form.getFieldValue(ip1).split(".")
            ip2 = form.getFieldValue(ip2).split(".")
            submask = form.getFieldValue(submask).split(".")
            mask = form.getFieldValue(mask).split(".")

            ip1 = tenTotwo(ip1[0]) + tenTotwo(ip1[1]) + tenTotwo(ip1[2]) + tenTotwo(ip1[3])
            ip2 = tenTotwo(ip2[0]) + tenTotwo(ip2[1]) + tenTotwo(ip2[2]) + tenTotwo(ip2[3])
            submask = tenTotwo(submask[0]) + tenTotwo(submask[1]) + tenTotwo(submask[2]) + tenTotwo(submask[3])
            mask = tenTotwo(mask[0]) + tenTotwo(mask[1]) + tenTotwo(mask[2]) + tenTotwo(mask[3])

            ip1 = ip1.split("")
            ip2 = ip2.split("")
            submask = submask.split("")
            mask = mask.split("")

            let i = 0
            for (i = 0; i < 32; i++) {
                if ((ip1[i] & submask[i]) !== (ip2[i] & mask[i])) {
                    res = false
                    break
                }
            }
        }

        let msg = "LANG2176"
        if (needSame === false) {
            msg = "LANG2430"
            res = !res
        }
        if (res === false) {
            callback(formatMessage({id: msg}))
        } else {
            callback()
        }
    }
    _checkDHCPPrefix = (data, value, callback, formatMessage) => {
        const { form } = this.props
        const reg = /^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)$|^([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)$|^([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)$|^([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)$|^([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?$|^([0-9a-fA-F]{1,4}:){6}:$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG5164"}))
        } else {
            callback()
        }
    }
    _checkPrefixNoFourDigits = (data, value, callback, formatMessage) => {
        const { form } = this.props
        let res = false
        let arr = value.split(":"),
            noEmptyLen = 0

        _.each(arr, function(item, num) {
            if (item !== "") {
                noEmptyLen++
            }
        })

        if (noEmptyLen <= 4 && arr[arr.length - 1] === "" && arr[arr.length - 2] === "") {
            res = true
        }

        if (res === false) {
            callback(formatMessage({id: "LANG5241"}))
        } else {
            callback()
        }
    }
    /* network === end */
    _checkPointcode = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const defaultdpc = getFieldValue('defaultdpc')
        if (value && value === defaultdpc) {
            callback(formatMessage({id: "LANG3263"}, {0: formatMessage({id: "LANG3257"}), 1: formatMessage({id: "LANG3259"})}))
        } else {
            callback()
        }
    }
    _checkDefaultpc = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const pointcode = getFieldValue('pointcode')
        if (value && value === pointcode) {
            callback(formatMessage({id: "LANG3263"}, {0: formatMessage({id: "LANG3257"}), 1: formatMessage({id: "LANG3259"})}))
        } else {
            callback()
        }
    }
    _checkCICBegin = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const span_type = getFieldValue('span_type')
        const ss7type = getFieldValue('ss7type')
        let max = 0
        let min = 0
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
        const num = parseInt(value)
        if (value && (value > max || value < min)) {
            callback(formatMessage({id: "LANG2147"}, {0: min + '', 1: max + ''}))
        } else {
            callback()
        }
    }
    _checkReg = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const username = getFieldValue('username')
        const secret = getFieldValue('secret')

        if ((secret && username) || (!secret && !username)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2150"}))
        }
    }
    _checkStrip = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const number_length = getFieldValue('number_length')
        if (value === '' || parseInt(value) < parseInt(number_length)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2391"}, {0: formatMessage({id: "LANG4328"})}))
        }
    }
    _checkNeedPass = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const old_password = getFieldValue('old_password')
        const user_password = getFieldValue('user_password')
        const newpass_rep = getFieldValue('newpass_rep')
        const email = getFieldValue('email')
        if ((!email && !old_password && !user_password && !newpass_rep) || value) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2150"}))
        }
    }
    _checkNewPass = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const user_password = getFieldValue('user_password')
        const newpass_rep = getFieldValue('newpass_rep')

        if (value && value !== user_password) {
            callback(formatMessage({id: "LANG2159"}))
        } else {
            callback()
        }
    }
    _checkOldPassword = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const currentUserId = localStorage.user_id

        if (value) {
            let response = false
            $.ajax({
                type: "post",
                url: api.apiHost,
                async: false,
                data: {
                    'action': 'checkOldPassword',
                    'user_id': currentUserId,
                    'old_password': value
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    if (data.hasOwnProperty('status') && (data.status === 0)) {
                        response = true
                    } else {
                        response = false
                    }
                }
            })
            if (response) {
                callback()
            } else {
                callback(formatMessage({id: "LANG933"}))
            }
        } else {
            callback()
        }
    }
    _checkExtenExists = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const batch_number = getFieldValue('batch_number')
        if (batch_number && value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkExtenRequire = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const batch_number = getFieldValue('batch_number')
        if (batch_number && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkExtenRange = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const prefSettings = this.state.prefSettings

        const disable_extension_ranges = getFieldValue('disable_extension_ranges')
        if (disable_extension_ranges === false) {
            const ue_start = parseInt(prefSettings.ue_start)
            const ue_end = parseInt(prefSettings.ue_end)
            const num = parseInt(value)
            if (num < ue_start || num > ue_end) {
                callback(formatMessage({id: "LANG2147"}, {0: ue_start, 1: ue_end}))
            } else {
                callback()
            }
        } else {
            callback()
        }
    }
    _checkMaxUsers = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const featureLimits = JSON.parse(localStorage.getItem('featureLimits'))
        const maxExtension = parseInt(featureLimits.extension)
        const config_exten_number = this.state.accountList.length + parseInt(value)

        if (maxExtension < config_exten_number) {
            callback(formatMessage({id: "LANG811"}, {0: maxExtension, 1: config_exten_number}))
        } else {
            callback()
        }
    }
    _checkBatchSecret = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const real_value = getFieldValue('batch_secret')
        if (value === 'batch_rand_secret') {
            callback()
            return
        }

        if (!real_value) {
            callback(formatMessage({id: "LANG2150"}))
        } else if (real_value && !/^([a-zA-Z0-9~!@#\$%\^\*]*)$/.test(real_value)) {
            callback(formatMessage({id: "LANG4475"}))
        } else {
            Validator.checkAlphanumericPw(rule, real_value, callback, formatMessage)
            Validator.minlength(rule, real_value, callback, formatMessage, 4)
            Validator.keyboradNoSpacesemicolon(rule, real_value, callback, formatMessage)
        }
    }
    _checkTrunkName = (rule, value, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const trunkType = getFieldValue('trunkType')
        let tmpNameList = []
        this.state.addTrunkList.map(function(item) {
            tmpNameList.push(item.trunk_name)
        })
        if (value && value === global.SetupWizardEditTrunkName) {
            callback()
        } else if (trunkType === 'Digital') {
            callback()
        } else if (trunkType === 'Analog' && this.state.checkedFXOList.length === this.state.usedFXOList.length) {
            callback(formatMessage({id: "LANG2135"}, {0: 1, 1: formatMessage({id: "LANG1329"})}))
        } else if (value && _.indexOf(this.state.trunkNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else if (value && _.indexOf(tmpNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkOutboundName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        let tmpNameList = []
        this.state.addTrunkList.map(function(item) {
            tmpNameList.push(item.outbound_rt_name)
        })

        if (value && value === global.SetupWizardEditOutName) {
            callback()
        } else if (value && _.indexOf(this.state.outboundNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else if (value && _.indexOf(tmpNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _onChangeSpanType = (value) => {
        const { setFieldsValue, getFieldValue, resetFields } = this.props.form
        let signalling = getFieldValue('signalling')
        if (signalling !== 'pri_net' &&
            signalling !== 'pri_cpe' &&
            signalling !== 'ss7') {
            setFieldsValue({
                signalling: 'pri_net'
            })
            signalling = 'pri_net'
        }
        resetFields(['coding'])
        this.setState({
            span_type: value,
            signalling: signalling
        })
    }
    _onChangeSignalling = (value) => {
        this.setState({
            signalling: value
        })
    }
    _onChangeTimeZone = (value) => {
        if (value === 'customize') {
            this.setState({
                customizeDisable: false
            })
        } else {
            this.setState({
                customizeDisable: true
            })
        }
    }
    _onChangeRadioSecret = (value) => {
        if (value.target.value === 'batch_rand_secret') {
            this.setState({
                secretDisable: true
            })
        } else {
            this.setState({
                secretDisable: false
            })
        }
    }
    _onChangeFXOPort = (checkedFXOList) => {
        this.setState({
            checkedFXOList: checkedFXOList
        })
    }
    _onInputBatchNumberChange = (val) => {
        const value = val.target.value
        if (!value) {
            return
        }
        if (!(/^\d+$/i.test(value))) {
            return
        }
        let popValue = ''
        let popValueList = []
        const { getFieldValue } = this.props.form
        const numberList = this.state.numberList
        let batch_number = parseInt(value)
        let batch_extension = parseInt(getFieldValue('batch_extension'))

        for (let i = 0; i < batch_number; i++) {
            let num = batch_extension + i
            if (($.inArray((num + ''), numberList) > -1)) {
                batch_number++
            } else {
                popValueList.push(num)
            }
        }
        popValueList.map(function(item, index) {
            if (index > 0) {
                if (item - popValueList[index - 1] === 1) {
                    popValue += ' ' + item
                } else {
                    popValue += ' ' + '<font color="green"><b>' + item + '</b></font>'
                }
            } else {
                popValue += ' ' + item
            }
        })

        this.setState({
            popValue: popValue,
            popValueList: popValueList
        })
    }
    _onInputExtenChange = (val) => {
        const value = val.target.value
        if (!value || value.length < 2) {
            return
        }
        if (!(/^\d+$/i.test(value))) {
            return
        }
        let popValue = ''
        let popValueList = []
        const { getFieldValue } = this.props.form
        const numberList = this.state.numberList
        let batch_number = parseInt(getFieldValue('batch_number'))

        for (let i = 0; i < batch_number; i++) {
            let num = parseInt(value) + i
            if (($.inArray((num + ''), numberList) > -1)) {
                batch_number++
            } else {
                popValueList.push(num)
            }
        }
        popValueList.map(function(item, index) {
            if (index > 0) {
                if (item - popValueList[index - 1] === 1) {
                    popValue += ' ' + item
                } else {
                    popValue += ' ' + '<font color="green"><b>' + item + '</b></font>'
                }
            } else {
                popValue += ' ' + item
            }
        })

        this.setState({
            popValue: popValue,
            popValueList: popValueList
        })
    }
    _onpermissionPopVisibleChange = (e) => {
        this.setState({
            permissionPopVisible: false,
            permissionPopContent: ''
        })
    }
    _onFocusPermission = () => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const value = getFieldValue('permission')
        if (value === 'none') {
            this.setState({
                permissionPopVisible: true,
                permissionPopContent: <span style={{ color: 'red' }}>{ formatMessage({id: "LANG2535"}, {0: formatMessage({id: "LANG273"})}) }</span>
            })
        } else if (value === 'internal') {
            this.setState({
                permissionPopVisible: true,
                permissionPopContent: <span style={{ color: 'red' }}>{ formatMessage({id: "LANG2535"}, {0: formatMessage({id: "LANG1071"})}) }</span>
            })
        } else {
            this.setState({
                permissionPopVisible: false,
                permissionPopContent: ''
            })
        }
    }
    _onChangePermission = (val) => {
        const { formatMessage } = this.props.intl
        if (val === 'none') {
            this.setState({
                permissionPopVisible: true,
                permissionPopContent: <span style={{ color: 'red' }}>{ formatMessage({id: "LANG2535"}, {0: formatMessage({id: "LANG273"})}) }</span>
            })
        } else if (val === 'internal') {
            this.setState({
                permissionPopVisible: true,
                permissionPopContent: <span style={{ color: 'red' }}>{ formatMessage({id: "LANG2535"}, {0: formatMessage({id: "LANG1071"})}) }</span>
            })
        } else {
            this.setState({
                permissionPopVisible: false,
                permissionPopContent: ''
            })
        }
    }
    _onChangeDestinationType = (val) => {
        if (val === 'account') {
            this.setState({
                destinationAccountShow: true
            })
        } else {
            this.setState({
                destinationAccountShow: false
            })
        }
    }
    _onChangeTrunkType = (val) => {
        const { setFieldsValue, getFieldValue } = this.props.form
        const trunk_name = getFieldValue('trunk_name')
        if (trunk_name === 'Digital_1') {
            setFieldsValue({
                trunk_name: ''
            })
        }
        if (val === 'Analog') {
            setFieldsValue({
                destination_type: 'account'
            })
            this.setState({
                byDIDDisabled: true,
                destinationAccountShow: true,
                selectTrunkType: 'Analog'
            })
        } else {
            if (val === 'Digital') {
                setFieldsValue({
                    trunk_name: 'Digital_1'
                })
            }
            this.setState({
                byDIDDisabled: false,
                selectTrunkType: val
            })
        }
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let languageList = []
        let language = this.state.language
        let timezoneItem = this.state.timezoneItem
        let customizeDisable = this.state.customizeDisable
        let numberList = []
        let prefSettings = this.state.prefSettings
        let newExtenNum = this.state.newExtenNum
        let popValue = ''
        let popValueList = []
        let existOutboundRouteList = []
        let countryToneList = []
        let accountList = []
        let usedFXOList = []
        let checkedFXOList = []
        let editCheckedList = []
        let trunkNameList = []
        let outboundNameList = []
        let disableExtensionItem = this.state.disableExtensionItem

        global.SetupWizardReboot = false
        global.SetupWizardReLogin = false

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getLanguage'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    languageList = res.response.languages
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
                action: 'getLanguageSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    language = res.response.language_settings.language
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
                action: 'getTimeSettings',
                self_defined_time_zone: '',
                time_zone: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    timezoneItem = res.response
                    if (timezoneItem.time_zone === 'customize') {
                        customizeDisable = false
                    } else {
                        customizeDisable = true
                    }
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
                action: 'getNumberList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    numberList = res.response.number
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
                action: 'getExtenPrefSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    prefSettings = res.response.extension_pref_settings
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
                action: 'listOutboundRoute',
                options: 'outbound_rt_name,outbound_rt_index,permission,sequence,pattern',
                sidx: 'sequence',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    existOutboundRouteList = res.response.outbound_route
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
                action: 'listAllToneZoneSettings',
                options: 'description,country,busy,congestion',
                sidx: 'description'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    countryToneList = res.response.CountryTone
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
                action: 'getAccountList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const disabled = formatMessage({id: "LANG273"})
                    accountList = res.response.extension.map(function(item) {
                        return {
                                key: item.extension,
                                out_of_service: item.out_of_service,
                                // disabled: (item.out_of_service === 'yes'),
                                title: (item.extension +
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
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getAnalogTrunkChanList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const chanlist = res.response.analog_trunk_chans
                    chanlist.map(function(item) {
                        usedFXOList.push(item.chan)
                        checkedFXOList.push(item.chan)
                        editCheckedList.push(item.chan)
                    })
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
                action: 'getTrunkList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const tmplist = res.response.trunks
                    tmplist.map(function(item) {
                        trunkNameList.push(item.trunk_name)
                    })
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
                action: 'getOutboundRouteList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const tmplist = res.response.outbound_routes
                    tmplist.map(function(item) {
                        outboundNameList.push(item.outbound_rt_name)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        const ue_start = parseInt(prefSettings.ue_start)
        const ue_end = parseInt(prefSettings.ue_end)
        let noNeedBreak = true
        for (let i = parseInt(ue_start); i < parseInt(ue_end) && noNeedBreak; i++) {
            if ($.inArray((i + ''), numberList) > -1) {

            } else {
                newExtenNum = i + ''
                noNeedBreak = false
            }
        }

        const featureLimits = JSON.parse(localStorage.getItem('featureLimits'))
        const maxExtension = parseInt(featureLimits.extension)
        const config_exten_number = accountList.length

        let batch_number = 5
        if (maxExtension <= config_exten_number) {
            disableExtensionItem = true
            batch_number = 0
            newExtenNum = ''
        }
        if (config_exten_number + 5 > maxExtension) {
            batch_number = maxExtension - config_exten_number
        }

        let batch_number_tmp = batch_number
        for (let i = 0; i < batch_number_tmp; i++) {
            let num = parseInt(newExtenNum) + i
            if ($.inArray((num + ''), numberList) > -1) {
                batch_number_tmp++
            } else {
                popValueList.push(num)
            }
        }
        popValueList.map(function(item, index) {
            if (index > 0) {
                if (item - popValueList[index - 1] === 1) {
                    popValue += ' ' + item
                } else {
                    popValue += ' ' + '<font color="green"><b>' + item + '</b></font>'
                }
            } else {
                popValue += ' ' + item
            }
        })

        this.setState({
            languageList: languageList,
            language: language,
            timezoneItem: timezoneItem,
            customizeDisable: customizeDisable,
            prefSettings: prefSettings,
            numberList: numberList,
            newExtenNum: newExtenNum,
            popValue: popValue,
            popValueList: popValueList,
            existOutboundRouteList: existOutboundRouteList,
            countryToneList: countryToneList,
            accountList: accountList,
            usedFXOList: usedFXOList,
            checkedFXOList: checkedFXOList,
            editCheckedList: editCheckedList,
            trunkNameList: trunkNameList,
            outboundNameList: outboundNameList,
            disableExtensionItem: disableExtensionItem,
            batch_number: batch_number
        })
    }
    _addTrunk = () => {
        const { resetFields } = this.props.form
        resetFields(['trunkType', 'trunk_name', 'countrytone', 'host', 'username', 'secret', 'authid', 'outbound_rt_name', 'number_head', 'number_length', 'permission', 'strip', 'prepend', 'destination_type', 'destination_value'])
        this.setState({
            addTrunkShow: true,
            selectTrunkType: "SIP",
            destinationAccountShow: false,
            trunkEdit: false
        })
        global.SetupWizardEditOutName = ''
        global.SetupWizardEditTrunkName = ''
    }
    _applyChanges = () => {
        const { formatMessage } = this.props.intl
        this.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG806"})})
        const me = this
        $.ajax({
            url: api.apiHost + "action=applyChanges&settings=",
            type: "GET",
            success: function(data) {
                let status = data.status,
                    settings = data.response.hasOwnProperty('settings') ? data.response.settings : ''

                me.props.setSpinLoading({loading: false})
                if (status === 0 && settings === '0') {
                    // this.setState({
                    //     visible: false
                    // })

                    // cookie.remove("needApplyChange");
                    if (data.response.need_reboot && data.response.need_reboot === '1') {
                        Modal.confirm({
                            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG833"}) }}></span>,
                            okText: formatMessage({id: "LANG727"}),
                            cancelText: formatMessage({id: "LANG726"}),
                            onOk: () => {
                                UCMGUI.loginFunction.confirmReboot()
                            },
                            onCancel: () => {
                            }
                        })
                    } else if (global.SetupWizardReboot) {
                        global.SetupWizardReboot = false
                        Modal.confirm({
                            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG833"}) }}></span>,
                            okText: formatMessage({id: "LANG727"}),
                            cancelText: formatMessage({id: "LANG726"}),
                            onOk: () => {
                                UCMGUI.loginFunction.confirmReboot()
                            },
                            onCancel: () => {
                            }
                        })
                    } else if (global.SetupWizardReLogin) {
                        global.SetupWizardReLogin = false
                        // cookie.remove('user_id')
                        // cookie.remove('username')
                        // localStorage.removeItem('user_id')
                        // localStorage.removeItem('username')
                        // localStorage.removeItem('password')
                        // localStorage.clear()
                        if (window.socket) {
                            window.socket.send(SubscribeEvent.logout)
                        }

                        UCMGUI.logoutFunction.doLogout(formatMessage)
                    } else {
                        message.info(formatMessage({id: "LANG951"}))
                        me._handleCancel()
                    }
                } else if (status === -9 && settings.indexOf('-1') > -1) {
                    message.error(formatMessage({id: "LANG2805"}))
                } else if (status === -9 && settings.indexOf('486') > -1) {
                    message.info(formatMessage({id: "LANG2803"}))
                } else if (status === -9 && settings.indexOf('485') > -1) {
                    message.info(formatMessage({id: "LANG2804"}))
                } else if (status === -69) {
                    message.error(formatMessage({id: "LANG4760"}))
                } else {
                    UCMGUI.errorHandler(data, null, formatMessage)
                }
            }.bind(this)
        })
    }
    _handleCancel = () => {
        browserHistory.push('/system-status/dashboard')
        localStorage.setItem('first_login', 'no')
    }
    _handleCancelClick = () => {
        const { formatMessage } = this.props.intl
        const me = this
        Modal.confirm({
            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG4313"}) }}></span>,
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"}),
            onOk: () => {
                me._handleCancel()
            },
            onCancel: () => {
            }
        })
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const { form } = this.props
        const __this = this
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if ((!err) || (err && (err.hasOwnProperty('authid') ||
                err.hasOwnProperty('username') ||
                err.hasOwnProperty('secret') ||
                err.hasOwnProperty('authid') ||
                err.hasOwnProperty('host') ||
                err.hasOwnProperty('number_head') ||
                err.hasOwnProperty('number_length') ||
                err.hasOwnProperty('strip') ||
                err.hasOwnProperty('prepend') ||
                err.hasOwnProperty('destination_value') ||
                err.hasOwnProperty('outbound_rt_name') || err.hasOwnProperty('trunk_name')))) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = {}

                action.action = 'addSettingGuide'
                action.user_id = localStorage.user_id
                /* password */
                action.disable_extension_ranges = values.disable_extension_ranges ? 'yes' : 'no'
                if (values.old_password) {
                    let passObj = {}
                    let passwd = []
                    passObj['user_password'] = values.user_password
                    passObj['email'] = values.email
                    passwd.push(passObj)
                    action['password'] = JSON.stringify(passwd)
                    global.SetupWizardReLogin = true
                }
                /* extension */
                if (parseInt(values.batch_number) > 0) {
                    let extensionObj = {}
                    extensionObj['extension'] = this.state.popValueList.join(',')
                    if (values.batch_password === 'batch_rand_secret') {
                        extensionObj['secret'] = 'r'
                    } else {
                        extensionObj['secret'] = values.batch_secret
                    }
                    let exten = []
                    exten.push(extensionObj)
                    action['extension'] = JSON.stringify(exten)
                }
                /* country */
                if (values.language) {
                    if (values.language === this.state.language &&
                        values.time_zone === this.state.timezoneItem.time_zone &&
                        values.self_defined_time_zone === this.state.timezoneItem.self_defined_time_zone) {

                    } else {
                        let counObj = {}
                        let coun = []
                        counObj['time_zone'] = values.time_zone
                        counObj['self_defined_time_zone'] = values.self_defined_time_zone
                        counObj['language'] = values.language
                        coun.push(counObj)
                        action['country'] = JSON.stringify(coun)
                        if (values.time_zone !== this.state.time_zone || values.self_defined_time_zone !== this.state.self_defined_time_zone) {
                            global.SetupWizardReboot = true
                        }
                    }
                }
                /* sip_trunk */
                /* iax_trunk */
                /* analog_trunk */
                const addTrunkList = this.state.addTrunkList
                if (addTrunkList.length > 0) {
                    let sipList = []
                    let iaxList = []
                    let analogList = []
                    addTrunkList.map(function(item) {
                        let obj = {}

                        const head = item.number_head
                        const len_x = parseInt(item.number_length) - head.length
                        let tmp_pattern = '_' + head
                        for (let i = 0; i < len_x; i++) {
                            tmp_pattern += 'X'
                        }
                        obj.pattern = tmp_pattern
                        obj.type = item.trunkType
                        obj.trunk_name = item.trunk_name
                        obj.outbound_rt_name = item.outbound_rt_name
                        obj.permission = item.permission
                        obj.strip = item.strip
                        obj.prepend = item.prepend
                        obj.destination_type = item.destination_type
                        if (item.destination_type === 'byDID') {
                            obj.account = ''
                        } else if (item.destination_type === 'account') {
                            obj.account = item.account
                        }

                        if (item.trunkType === "Analog") {
                            obj.countrytone = item.countrytone
                            obj.chans = item.FXOPorts.join()
                            analogList.push(obj)
                        } else if (item.trunkType === "SIP") {
                            obj.host = item.host
                            obj.username = item.username
                            obj.secret = item.secret
                            obj.authid = item.authid
                            if (item.username && item.secret) {
                                obj.trunk_type = 'register'
                            } else {
                                obj.trunk_type = 'peer'
                            }
                            sipList.push(obj)
                        } else if (item.trunkType === "IAX") {
                            obj.host = item.host
                            obj.username = item.username
                            obj.secret = item.secret
                            if (item.username && item.secret) {
                                obj.trunk_type = 'register'
                            } else {
                                obj.trunk_type = 'peer'
                            }
                            iaxList.push(obj)
                        }
                    })
                    if (sipList.length > 0) {
                        action.sip_trunk = JSON.stringify(sipList)
                    }
                    if (iaxList.length > 0) {
                        action.iax_trunk = JSON.stringify(iaxList)
                    }
                    if (analogList.length > 0) {
                        action.analog_trunk = JSON.stringify(analogList)
                    }
                }
                /* hardware_digtal */
                const model_info = JSON.parse(localStorage.getItem('model_info'))
                const firstLogin = localStorage.first_login
                if (model_info.num_pri > 0 && firstLogin === 'yes') {
                    let hardwareObj = {}
                    let hardware_digtal = []
                    hardwareObj['span_type'] = values.span_type
                    hardwareObj['clock'] = values.clock
                    hardwareObj['coding'] = values.coding
                    hardwareObj['signalling'] = values.signalling

                    if (hardwareObj.signalling === 'pri_net' || hardwareObj.signalling === 'pri_cpe') {
                        hardwareObj.type = 'PRI'
                    } else if (hardwareObj.signalling === 'ss7') {
                        hardwareObj.type = 'SS7'
                        hardwareObj.ss7type = values.ss7type
                        hardwareObj.pointcode = values.pointcode
                        hardwareObj.defaultdpc = values.defaultdpc
                        hardwareObj.cicbeginswith = values.cicbeginswith
                    } else if (hardwareObj.signalling === 'mfcr2') {
                        hardwareObj.type = 'MFC/R2'
                        hardwareObj.mfcr2_variant = values.mfcr2_variant
                    } else if (hardwareObj.signalling === 'em') {
                        hardwareObj.type = 'EM'
                    } else if (hardware_digtal.signalling === 'em_w') {
                        hardwareObj.type = 'EM_W'
                    }

                    if (hardwareObj.span_type === 'E1') {
                        hardwareObj.hardhdlc = '16'
                        hardwareObj.bchan = '1-15,17-31'

                        if (hardwareObj.signalling === 'mfcr2') {
                            hardwareObj.framing = "cas"
                        } else {
                            hardwareObj.framing = "ccs"
                        }
                    } else {
                        if (hardwareObj.span_type === 'T1' &&
                            (hardwareObj.signalling === 'em' || hardwareObj.signalling === 'em_w')) {
                            hardwareObj.bchan = '1-24'
                        } else {
                            hardwareObj.hardhdlc = '24'
                            hardwareObj.bchan = '1-23'
                        }
                        hardwareObj.framing = "esf"
                    }

                    addTrunkList.map(function(item) {
                        if (item.trunkType === "Digital") {
                            const head = item.number_head
                            const len_x = parseInt(item.number_length) - head.length
                            let tmp_pattern = '_' + head
                            for (let i = 0; i < len_x; i++) {
                                tmp_pattern += 'X'
                            }
                            hardwareObj.pattern = tmp_pattern
                            hardwareObj.outbound_rt_name = item.outbound_rt_name
                            hardwareObj.permission = item.permission
                            hardwareObj.strip = item.strip
                            hardwareObj.prepend = item.prepend
                            hardwareObj.destination_type = item.destination_type
                            if (item.destination_type === 'byDID') {
                                hardwareObj.account = ''
                            } else if (item.destination_type === 'account') {
                                hardwareObj.account = item.account
                            }
                        }
                    })

                    hardware_digtal.push(hardwareObj)
                    action['hardware_digtal'] = JSON.stringify(hardware_digtal)
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
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            // message.success(successMessage)
                            setTimeout(__this._applyChanges, 100)
                        }
                    }.bind(this)
                })

                const network_values = form.getFieldsValue(['method',
                                                        'mtu',
                                                        'default_interface',
                                                        'lan2_ip_method',
                                                        'lan2_ip',
                                                        'lan2_mask',
                                                        'lan2_gateway',
                                                        'lan2_dns1',
                                                        'lan2_dns2',
                                                        'lan2_username',
                                                        'lan2_password',
                                                        'lan2_vid',
                                                        'lan2_priority',
                                                        'lan1_ip_method',
                                                        'lan1_ipaddr',
                                                        'lan1_submask',
                                                        'lan1_gateway',
                                                        'lan1_dns1',
                                                        'lan1_dns2',
                                                        'lan1_username',
                                                        'lan1_password',
                                                        'lan1_vid',
                                                        'lan1_priority',
                                                        'dhcp_enable'
                                                        ])
                const dhcp_values = form.getFieldsValue(['dhcp_ipaddr',
                                                        'dhcp_submask',
                                                        'dhcp_dns1',
                                                        'dhcp_dns2',
                                                        'ipfrom',
                                                        'ipto',
                                                        'dhcp_gateway',
                                                        'ipleasetime'
                                                        ])
                let needNetwork = false

                const network_settings = this.state.network_settings
                const dhcp_settings = this.state.dhcp_settings
                _.each(network_values, function(num, key) {
                    if (key === 'altdns' || key === 'lan1_dns1' || key === 'lan1_dns2') {
                        if (network_settings[key] === '0.0.0.0' && network_values[key] === '') {
                        } else if (network_values[key] !== network_settings[key]) {
                            needNetwork = true
                        }
                    } else {
                        if (network_values[key] !== network_settings[key]) {
                            needNetwork = true
                        }
                    }
                })
                _.each(dhcp_values, function(num, key) {
                     if (dhcp_values[key] !== dhcp_settings[key]) {
                        needNetwork = true
                    }
                })

                if (needNetwork) {
                    let flag = false
                    let buf = {}
                    let defaultInterface = form.getFieldValue("default_interface")
                    let method = form.getFieldValue("method")

                    let lasInterface = ''
                    if (method === '2') {
                        lasInterface = interfaceObj[method][defaultInterface]
                    } else {
                        lasInterface = interfaceObj[method]
                    }

                    buf["action"] = "updateNetworkSettings"
                    buf["altdns"] = form.getFieldValue("altdns") || '0.0.0.0'
                    buf["mtu"] = form.getFieldValue("mtu")

                    const model_info = JSON.parse(localStorage.getItem('model_info'))

                    if (Number(model_info.num_eth) >= 2) {
                        buf["method"] = method

                        if (model_info.allow_nat === "1") {
                            flag = true
                        }

                        if (method === "0") {
                            buf["dhcp_ipaddr"] = form.getFieldValue("dhcp_ipaddr")
                            buf["dhcp_submask"] = form.getFieldValue("dhcp_submask")
                            buf["lan2_vid"] = form.getFieldValue("lan2_vid")
                            buf["lan2_priority"] = form.getFieldValue("lan2_priority")
                        } else if (method === "2") {
                            let sval = form.getFieldValue("lan2_ip_method")

                            buf["default_interface"] = defaultInterface
                            buf["lan2_ip_method"] = sval

                            if (sval === "1") {
                                buf["lan2_ip"] = form.getFieldValue("lan2_ip")
                                buf["lan2_mask"] = form.getFieldValue("lan2_mask")
                                buf["lan2_gateway"] = form.getFieldValue("lan2_gateway")
                                buf["lan2_dns1"] = form.getFieldValue("lan2_dns1")
                                buf["lan2_dns2"] = form.getFieldValue("lan2_dns2")
                            } else if (sval === "2") {
                                buf["lan2_username"] = form.getFieldValue("lan2_username")
                                buf["lan2_password"] = form.getFieldValue("lan2_password")
                            }

                            buf["lan2_vid"] = form.getFieldValue("lan2_vid")
                            buf["lan2_priority"] = form.getFieldValue("lan2_priority")
                        }
                    }
                    let sval = form.getFieldValue("lan1_ip_method")
                    if (sval === "0") {
                        buf["lan1_ip_method"] = "0"
                    } else if (sval === "1") {
                        buf["lan1_ip_method"] = "1"
                        buf["lan1_ipaddr"] = form.getFieldValue("lan1_ipaddr")
                        buf["lan1_submask"] = form.getFieldValue("lan1_submask")
                        buf["lan1_gateway"] = form.getFieldValue("lan1_gateway")
                        buf["lan1_dns1"] = form.getFieldValue("lan1_dns1")
                        buf["lan1_dns2"] = form.getFieldValue("lan1_dns2") || '0.0.0.0'
                    } else {
                        buf["lan1_ip_method"] = "2"
                        // buf["lan1_username"] = encodeURIComponent($("#lan1_username").val());
                        // buf["lan1_password"] = encodeURIComponent($("#lan1_password").val());
                        buf["lan1_username"] = form.getFieldValue("lan1_username")
                        buf["lan1_password"] = form.getFieldValue("lan1_password")
                    }

                    buf["lan1_vid"] = form.getFieldValue("lan1_vid")
                    buf["lan1_priority"] = form.getFieldValue("lan1_priority")

                    if (flag) {
                        let dhcpenable = ((form.getFieldValue("dhcp_enable") && (form.getFieldValue("method") === "0")) ? 1 : 0)

                        buf["dhcp_enable"] = dhcpenable

                        if (dhcpenable) {
                            buf["dhcp_ipaddr"] = form.getFieldValue("dhcp_ipaddr")
                            buf["dhcp_submask"] = form.getFieldValue("dhcp_submask")
                            buf["dhcp_dns1"] = form.getFieldValue("dhcp_dns1")
                            buf["dhcp_dns2"] = form.getFieldValue("dhcp_dns2")
                            buf["ipfrom"] = form.getFieldValue("ipfrom")
                            buf["ipto"] = form.getFieldValue("ipto")
                            buf["dhcp_gateway"] = form.getFieldValue("dhcp_gateway")
                            buf["ipleasetime"] = form.getFieldValue("ipleasetime")
                        }
                    }

                    if (buf["altdns"] === '') {
                        buf["altdns"] = "0.0.0.0"
                    }
                    if (buf["lan1_dns1"] === '') {
                        buf["lan1_dns1"] = "0.0.0.0"
                    }
                    if (buf["lan1_dns2"] === '') {
                        buf["lan1_dns2"] = "0.0.0.0"
                    }
                    if (buf["lan1_vid"] === undefined) {
                        buf["lan1_vid"] = ""
                    }
                    if (buf["lan1_priority"] === undefined) {
                        buf["lan1_priority"] = ""
                    }
                    if (buf["lan2_vid"] === undefined) {
                        buf["lan2_vid"] = ""
                    }
                    if (buf["lan2_priority"] === undefined) {
                        buf["lan2_priority"] = ""
                    }

                    $.ajax({
                        url: api.apiHost,
                        type: "post",
                        data: buf,
                        async: false,
                        error: function(e) {
                            message.error(e.statusText)
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                // message.success(successMessage)
                                global.SetupWizardReboot = true
                                /* confddns */
                                let currentInterface = ''

                                if (method === '2') {
                                    currentInterface = interfaceObj[method][defaultInterface]
                                } else {
                                    currentInterface = interfaceObj[method]
                                }

                                if (lasInterface !== currentInterface) {
                                    $.ajax({
                                        type: "POST",
                                        url: api.apiHost,
                                        async: false,
                                        data: {
                                            'action': 'confPhddns',
                                            'nicName': currentInterface,
                                            'conffile': ''
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {},
                                        success: function(data) {
                                            // var bool = UCMGUI.errorHandler(data);

                                            // if (bool) {}
                                        }
                                    })
                                }
                                /* confddns end */
                            }
                        }.bind(this)
                    })
                }

                this._handleCancel()
            }
        })
    }
    _deleteBatchDHCPClient = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        $.ajax({
            url: api.apiHost,
            type: "GET",
            data: {
                action: "deleteBatchDHCPClient",
                mac: 'ALL',
                isbind: 'no'
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    // message.success(formatMessage({ id: "LANG5078"}))
                }
            }.bind(this)
        })
    }
    _next = () => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const __this = this
        const me = this
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            // const a = 1
            if ((!err) || (err && (err.hasOwnProperty('authid') ||
                err.hasOwnProperty('username') ||
                err.hasOwnProperty('secret') ||
                err.hasOwnProperty('authid') ||
                err.hasOwnProperty('host') ||
                err.hasOwnProperty('number_head') ||
                err.hasOwnProperty('number_length') ||
                err.hasOwnProperty('strip') ||
                err.hasOwnProperty('prepend') ||
                err.hasOwnProperty('destination_value') ||
                err.hasOwnProperty('outbound_rt_name') || err.hasOwnProperty('trunk_name')))) {
                if (this.state.current === 0) {
                    const current = this.state.current + 1
                    const old_password = getFieldValue('old_password')
                    const user_password = getFieldValue('user_password')
                    const newpass_rep = getFieldValue('newpass_rep')
                    const email = getFieldValue('email')
                    if (!email && !old_password && !user_password && !newpass_rep) {
                        confirm({
                            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4319"})}} ></span>,
                            onOk() {
                                __this.setState({
                                    current: current
                                })
                            },
                            onCancel() {},
                            okText: formatMessage({id: "LANG727"}),
                            cancelText: formatMessage({id: "LANG726"})
                        })
                    } else {
                        this.setState({
                            current: current
                        })
                    }
                } else if (this.state.current === 1) {
                    const current = this.state.current + 1

                    let method = getFieldValue("method")
                    if (method === '0') {
                        let aOldGateway = this.state.dhcp_settings.dhcp_gateway.split('\.')
                        let aNewGateWay = getFieldValue("dhcp_gateway").split('\.')
                        if (aOldGateway[0] !== aNewGateWay[0] || aOldGateway[1] !== aNewGateWay[1] || aOldGateway[2] !== aNewGateWay[2]) {
                            $.ajax({
                                url: api.apiHost,
                                type: "GET",
                                data: {
                                    action: "checkIfHasMacBind"
                                },
                                success: function(data) {
                                    const bool = UCMGUI.errorHandler(data, null, formatMessage)

                                    if (bool) {
                                        let bBind = (data.response.hasbind === 'yes')

                                        if (bBind) {
                                            Modal.confirm({
                                                content: formatMessage({id: "LANG5077"}),
                                                okText: formatMessage({id: "LANG727"}),
                                                cancelText: formatMessage({id: "LANG726"}),
                                                onOk () {
                                                    me.setState({
                                                        current: current
                                                    }, () => {
                                                        __this._deleteBatchDHCPClient()
                                                    })
                                                }
                                            })
                                        } else {
                                            me.setState({
                                                current: current
                                            })
                                        }
                                    }
                                }
                            })
                        } else {
                            me.setState({
                                current: current
                            })
                        }
                    } else {
                        me.setState({
                            current: current
                        })
                    }
                } else {
                    const current = this.state.current + 1
                    this.setState({
                        current: current
                    })
                }
            }
        })
    }
    _prev = () => {
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if ((!err) || (err && (err.hasOwnProperty('authid') ||
                err.hasOwnProperty('username') ||
                err.hasOwnProperty('secret') ||
                err.hasOwnProperty('authid') ||
                err.hasOwnProperty('host') ||
                err.hasOwnProperty('number_head') ||
                err.hasOwnProperty('number_length') ||
                err.hasOwnProperty('strip') ||
                err.hasOwnProperty('prepend') ||
                err.hasOwnProperty('destination_value') ||
                err.hasOwnProperty('outbound_rt_name') || err.hasOwnProperty('trunk_name')))) {
                const current = this.state.current - 1
                this.setState({
                    current: current
                })
            }
        })
    }
    _cancelAddTrunk = () => {
        let checkedFXOList = _.clone(this.state.editCheckedList)
        let usedFXOList = _.clone(this.state.editCheckedList)
        this.setState({
            addTrunkShow: false,
            usedFXOList: usedFXOList,
            editTrunkID: 0
        })
        global.SetupWizardEditOutName = ''
        global.SetupWizardEditTrunkName = ''
    }
    _saveAddTrunk = () => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const __this = this
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                let trunkObj = {}
                let addTrunkList = this.state.addTrunkList
                let idList = this.state.idList
                let usedFXOList = this.state.usedFXOList
                let editCheckedList = this.state.editCheckedList

                trunkObj.trunkType = values.trunkType
                trunkObj.trunk_name = values.trunk_name

                trunkObj.countrytone = values.countrytone /* analog */
                trunkObj.FXOPorts = [] /* analog */
                this.state.checkedFXOList.map(function(item) {
                    let found = false
                    usedFXOList.map(function(itemused) {
                        if (item === itemused) {
                            found = true
                        }
                    })
                    if (found === false) {
                        trunkObj.FXOPorts.push(item)
                    }
                })
                usedFXOList = _.clone(this.state.checkedFXOList)
                editCheckedList = _.clone(this.state.checkedFXOList)
                if (trunkObj.trunkType === 'Analog' && trunkObj.FXOPorts.length === 0) {
                    message.error()
                    return
                }

                trunkObj.host = values.host /* SIP IAX */
                trunkObj.username = values.username /* SIP IAX */
                trunkObj.secret = values.secret /* SIP IAX */
                trunkObj.authid = values.authid /* SIP */

                trunkObj.outbound_rt_name = values.outbound_rt_name
                trunkObj.number_head = values.number_head
                trunkObj.number_length = values.number_length
                trunkObj.permission = values.permission
                trunkObj.strip = values.strip
                trunkObj.prepend = values.prepend

                trunkObj.destination_type = values.destination_type
                trunkObj.destination_value = values.destination_value

                const len = idList.length
                let id = 0
                if (this.state.editTrunkID === 0) {
                    id = len === 0 ? 1 : this.state.idList[len - 1] + 1
                    idList.push(id)
                    trunkObj.id = id
                } else {
                    id = this.state.editTrunkID
                    trunkObj.id = id
                    let tmpList = []
                    addTrunkList.map(function(item) {
                        if (item.id !== id) {
                            tmpList.push(item)
                        }
                    })
                    addTrunkList = tmpList
                }

                addTrunkList.push(trunkObj)

                this.setState({
                    addTrunkShow: false,
                    addTrunkList: addTrunkList,
                    idList: idList,
                    usedFXOList: usedFXOList,
                    editCheckedList: editCheckedList,
                    editTrunkID: 0
                })
            }
        })
        global.SetupWizardEditOutName = ''
        global.SetupWizardEditTrunkName = ''
    }
    _editTrunk = (record) => {
        const { setFieldsValue, resetFields } = this.props.form
        let addTrunkList = this.state.addTrunkList
        let editCheckedList = _.clone(this.state.checkedFXOList)
        let usedFXOList = this.state.usedFXOList
        const id = record.id
        let editObj = {}
        addTrunkList.map(function(item) {
            if (item.id === id) {
                editObj = item
            }
        })

        global.SetupWizardEditOutName = editObj.outbound_rt_name
        global.SetupWizardEditTrunkName = editObj.trunk_name

        setFieldsValue({
            trunkType: editObj.trunkType,
            trunk_name: editObj.trunk_name,
            countrytone: editObj.countrytone,
            host: editObj.host,
            username: editObj.username,
            secret: editObj.secret,
            authid: editObj.authid,
            outbound_rt_name: editObj.outbound_rt_name,
            number_head: editObj.number_head,
            number_length: editObj.number_length,
            permission: editObj.permission,
            strip: editObj.strip,
            prepend: editObj.prepend,
            destination_type: editObj.destination_type,
            destination_value: editObj.destination_value
        })

        let destinationAccountShow = false
        if (editObj.destination_type === "byDID") {
            destinationAccountShow = false
            setFieldsValue({
                destination_type: "byDID"
            })
        } else {
            destinationAccountShow = true
        }
        if (editObj.trunkType === "Analog") {
            editObj.FXOPorts.map(function(item) {
                usedFXOList = _.without(usedFXOList, item)
            })
        } else if (editObj.trunkType === "SIP" || editObj.trunkType === "IAX") {

        }
        this.setState({
            addTrunkShow: true,
            selectTrunkType: editObj.trunkType,
            destinationAccountShow: destinationAccountShow,
            editCheckedList: editCheckedList,
            usedFXOList: usedFXOList,
            editTrunkID: id,
            trunkEdit: true
        })
    }
    _deleteTrunk = (record) => {
        let addTrunkList = this.state.addTrunkList
        let idList = this.state.idList
        let usedFXOList = this.state.usedFXOList
        let checkedFXOList = this.state.checkedFXOList
        const id = record.id
        idList = _.without(idList, id)
        let tmpTrunkList = []
        addTrunkList.map(function(item) {
            if (item.id !== id) {
                tmpTrunkList.push(item)
            }
        })

        if (record.trunkType === "Analog") {
            record.FXOPorts.map(function(item) {
                usedFXOList = _.without(usedFXOList, item)
                checkedFXOList = _.without(checkedFXOList, item)
            })
        }

        this.setState({
            addTrunkList: tmpTrunkList,
            idList: idList
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const firstLogin = localStorage.first_login
        const num_fxo = model_info.num_fxo
        const batch_number_max = model_info.num_pri > 0 ? 500 : 100
        const me = this
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const formItemTwoSelectLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px'
        }
        let steps = []
        let wizardItem = []
        let addTrunkList = _.clone(this.state.addTrunkList)

        const destinationAccountShow = this.state.destinationAccountShow === true

        const pageItem = {
            0: 'passwordItem',
            1: 'networkItem',
            2: 'timezoneItem',
            3: 'extensionItem',
            4: 'trunkItem',
            5: 'summaryItem',
            6: 'digitalhardwareItem'
        }
        let showHardware = false
        if (model_info.model_name === 'UCM6510' && firstLogin === 'yes') {
            steps = [{
              title: '1',
              content: formatMessage({id: "LANG55"}) /* password */
            }, {
              title: '2',
              content: formatMessage({id: "LANG48"}) /* NetWork */
            }, {
              title: '3',
              content: formatMessage({id: "LANG4314"}) /* TimeZone */
            }, {
              title: '4',
              content: formatMessage({id: "LANG686"}) /* digits hardware just for 65 first login */
            }, {
              title: '5',
              content: formatMessage({id: "LANG87"}) /* Extension */
            }, {
              title: '6',
              content: formatMessage({id: "LANG4315"}) /* Trunk */
            }, {
              title: '7',
              content: formatMessage({id: "LANG4316"}) /* summary */
            }]
            wizardItem.push(pageItem[0])
            wizardItem.push(pageItem[1])
            wizardItem.push(pageItem[2])
            wizardItem.push(pageItem[6])
            wizardItem.push(pageItem[3])
            wizardItem.push(pageItem[4])
            wizardItem.push(pageItem[5])
            showHardware = true
        } else {
            steps = [{
              title: '1',
              content: formatMessage({id: "LANG55"})
            }, {
              title: '2',
              content: formatMessage({id: "LANG48"})
            }, {
              title: '3',
              content: formatMessage({id: "LANG4314"})
            }, {
              title: '4',
              content: formatMessage({id: "LANG87"})
            }, {
              title: '5',
              content: formatMessage({id: "LANG4315"})
            }, {
              title: '6',
              content: formatMessage({id: "LANG4316"})
            }]
            wizardItem.push(pageItem[0])
            wizardItem.push(pageItem[1])
            wizardItem.push(pageItem[2])
            wizardItem.push(pageItem[3])
            wizardItem.push(pageItem[4])
            wizardItem.push(pageItem[5])
        }

        const current = this.state.current

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG4283"})})

        let plainOptionsFXO = []
        for (let i = 1; i <= num_fxo; i++) {
            let obj = {}
            if (_.indexOf(this.state.usedFXOList, i) > -1) {
                obj.disabled = true
            } else {
                obj.disabled = false
            }
            obj.value = i
            obj.label = i
            plainOptionsFXO.push(obj)
        }
        const checkedFXOList = this.state.checkedFXOList

        let accountList = []
        this.state.accountList.map(function(item) {
            accountList.push({
                key: item.key,
                value: item.key,
                disabled: item.out_of_service === 'yes',
                title: item.title
            })
        })
        this.state.popValueList.map(function(item) {
            accountList.push({
                key: item,
                value: item,
                disabled: false,
                title: item
            })
        })

        const columns_trunk = [{
                key: 'id',
                dataIndex: 'id',
                className: 'hidden',
                title: 'id'
            }, {
                key: 'trunkType',
                dataIndex: 'trunkType',
                title: formatMessage({id: "LANG4324"}),
                render: (text, record, index) => {
                    let sipContent = ''
                    if (record.trunkType === "SIP" && !record.username) {
                        sipContent = <span>{ formatMessage({id: "LANG233"}) }</span>
                    } else if (record.trunkType === "SIP" && record.username) {
                        sipContent = <span>{ formatMessage({id: "LANG234"}) }</span>
                    } else if (record.trunkType === "IAX" && !record.username) {
                        sipContent = <span>{ formatMessage({id: "LANG235"}) }</span>
                    } else if (record.trunkType === "IAX" && record.username) {
                        sipContent = <span>{ formatMessage({id: "LANG236"}) }</span>
                    } else if (record.trunkType === "Analog") {
                        sipContent = <span>{ formatMessage({id: "LANG639"}) }</span>
                    } else if (record.trunkType === "Digital") {
                        sipContent = <span>{ formatMessage({id: "LANG3141"}) }</span>
                    }
                    return sipContent
                }
            }, {
                key: 'trunk_name',
                dataIndex: 'trunk_name',
                title: formatMessage({id: "LANG83"}),
                render: (text, record, index) => {
                    let trunkContent = ''
                    if (record.trunkType === "SIP" || record.trunkType === "IAX") {
                        const trunkName = formatMessage({id: "LANG1351"}) + ":" + record.trunk_name
                        const host = formatMessage({id: "LANG1373"}) + ":" + record.host
                        trunkContent = <span dangerouslySetInnerHTML={{__html: trunkName + '<br />' + host}}></span>
                    } else if (record.trunkType === "Analog") {
                        const trunkName = formatMessage({id: "LANG1351"}) + ":" + record.trunk_name
                        const countryTone = formatMessage({id: "LANG1349"}) + ":" + formatMessage({id: nation2langObj[record.countrytone]})
                        const fxoPorts = formatMessage({id: "LANG1329"}) + ":" + record.FXOPorts.join(',')
                        trunkContent = <span dangerouslySetInnerHTML={{__html: trunkName + '<br />' + countryTone + '<br/ >' + fxoPorts}}></span>
                    } else if (record.trunkType === "Digital") {
                        const trunkName = formatMessage({id: "LANG1351"}) + ":" + record.trunk_name
                        trunkContent = <span dangerouslySetInnerHTML={{__html: trunkName}}></span>
                    }
                    return trunkContent
                }
            }, {
                key: 'outbound_rt_name',
                dataIndex: 'outbound_rt_name',
                title: formatMessage({id: "LANG4325"}),
                render: (text, record, index) => {
                    let outContent = ''
                    const head = record.number_head
                    const len_x = parseInt(record.number_length) - head.length
                    let tmp_pattern = '_' + head
                    for (let i = 0; i < len_x; i++) {
                        tmp_pattern += 'x'
                    }
                    let tmp_permission = ''
                    if (record.permission === 'internal') {
                        tmp_permission = formatMessage({id: "LANG1071"})
                    } else if (record.permission === 'local') {
                        tmp_permission = formatMessage({id: "LANG1072"})
                    } else if (record.permission === 'national') {
                        tmp_permission = formatMessage({id: "LANG1073"})
                    } else if (record.permission === 'international') {
                        tmp_permission = formatMessage({id: "LANG1074"})
                    } else {
                        tmp_permission = formatMessage({id: "LANG273"})
                    }
                    const outName = formatMessage({id: "LANG1533"}) + ":" + record.outbound_rt_name
                    const pattern = formatMessage({id: "LANG246"}) + ":" + tmp_pattern
                    const permission = formatMessage({id: "LANG1543"}) + ":" + tmp_permission
                    outContent = <span dangerouslySetInnerHTML={{__html: outName + '<br />' + pattern + '<br/ >' + permission}}></span>
                    return outContent
                }
            }, {
                key: 'destination_type',
                dataIndex: 'destination_type',
                title: formatMessage({id: "LANG4326"}),
                render: (text, record, index) => {
                    let destinationContent = ''
                    if (record.destination_type === 'byDID') {
                        destinationContent = formatMessage({id: "LANG1563"})
                    } else {
                        let destination_account = ''
                        me.state.accountList.map(function(item) {
                            if (item.key === record.destination_value) {
                                destination_account = item.title
                            }
                        })
                        destinationContent = formatMessage({id: "LANG248"}) + '--' + destination_account
                    }
                    return destinationContent
                }
            }, {
                key: 'option',
                dataIndex: 'option',
                className: wizardItem[this.state.current] === 'summaryItem' ? 'hidden' : 'display-inline',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"}) }
                                onClick={ this._editTrunk.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._deleteTrunk.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]

        const pagination_trunk = {
                total: this.state.addTrunkList.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }

        const columns_pop = [{
                key: 'outbound_rt_name',
                dataIndex: 'outbound_rt_name',
                title: formatMessage({id: "LANG656"}),
                sorter: (a, b) => a.outbound_rt_name.length - b.outbound_rt_name.length
            }, {
                key: 'pattern',
                dataIndex: 'pattern',
                title: formatMessage({id: "LANG246"}),
                sorter: (a, b) => a.pattern.length - b.pattern.length,
                render: (text, record, index) => {
                    const patternList = text.split(',')
                    const pattern = patternList.join('<br />')
                    return <div>
                            <span dangerouslySetInnerHTML={{__html: pattern}}></span>
                            </div>
                }
            }, {
                key: 'permission',
                dataIndex: 'permission',
                title: formatMessage({id: "LANG1543"}),
                sorter: (a, b) => a.permission.length - b.permission.length,
                render: (text, record, index) => {
                    if (text === 'internal') {
                        return <span>{ formatMessage({id: "LANG1071"}) }</span>
                    } else if (text === 'local') {
                        return <span>{ formatMessage({id: "LANG1072"}) }</span>
                    } else if (text === 'national') {
                        return <span>{ formatMessage({id: "LANG1073"}) }</span>
                    } else if (text === 'international') {
                        return <span>{ formatMessage({id: "LANG1074"}) }</span>
                    } else {
                        return <span>{ formatMessage({id: "LANG273"}) }</span>
                    }
                }
            }]
        const pagination_pop = {
                total: this.state.existOutboundRouteList.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }

        let codingItem = ''
        if (this.state.span_type === 'E1') {
            codingItem = <Option value='hdb3'>HDB3</Option>
        } else {
            codingItem = <Option value='b8zs'>B8ZS</Option>
        }

        const network_settings = this.state.network_settings
        const dhcp_settings = this.state.dhcp_settings
        const dhcp6_settings = this.state.dhcp6_settings
        const { form } = this.props
        let networkItem = (
            <div>
                <FormItem
                    { ...formItemLayout }
                    label={
                        <Tooltip title={<FormattedHTMLMessage id="LANG1914" />}>
                            <span>{formatMessage({id: "LANG2233"})}</span>
                        </Tooltip>
                    }
                    className={ this.state.method_display_calss.num_eth }
                >
                    { getFieldDecorator('method', {
                        rules: [],
                        initialValue: network_settings.method
                    })(
                        <Select onChange={ this._networkMethodSwitch } >
                            {
                                this.state.method_key.map(function(value, index) {
                                    return <Option value={ value.key } key={ index }>{ value.name }</Option>
                                })
                            }
                        </Select>
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <Tooltip title={<FormattedHTMLMessage id="LANG5047" />}>
                            <span>{formatMessage({id: "LANG5046"})}</span>
                        </Tooltip>
                    )}
                >
                    { getFieldDecorator('mtu', {
                        getValueFromEvent: (e) => {
                            return UCMGUI.toggleErrorMessage(e)
                        },
                        rules: [{
                            validator: (data, value, callback) => {
                                Validator.digits(data, value, callback, formatMessage)
                            }
                        }, {
                            validator: (data, value, callback) => {
                                Validator.range(data, value, callback, formatMessage, 1280, 1500)
                            }
                        }],
                        initialValue: network_settings.mtu
                    })(
                        <Input/>
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={
                        <Tooltip title={<FormattedHTMLMessage id="LANG2226" />}>
                            <span>{formatMessage({id: "LANG2220"})}</span>
                        </Tooltip>
                    }
                    className={ this.state.method_change_calss.lan1 }
                >
                    { getFieldDecorator('default_interface', {
                        rules: [],
                        initialValue: network_settings.default_interface
                    })(
                        <Select onChange={ this._onChangeDefaultInterface }>
                             <Option value="LAN1">{formatMessage({id: "LANG266"})}</Option>
                             <Option value="LAN2">{formatMessage({id: "LANG267"})}</Option>
                         </Select>
                    ) }
                </FormItem>
                <div>
                    <FormItem
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1913" />}>
                                <span>{formatMessage({id: "LANG1912"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('altdns', {
                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                validator: (data, value, callback) => {
                                    Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"}))
                                }
                            }],
                            initialValue: network_settings.altdns === "0.0.0.0" ? "" : network_settings.altdns
                        })(
                            <Input/>
                        ) }
                    </FormItem>
                    <div className={ this.state.method_change_calss.lan1 }>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG266"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG549" />}>
                                    <span>{formatMessage({id: "LANG549"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('lan2_ip_method', {
                                rules: [],
                                initialValue: network_settings.lan2_ip_method
                            })(
                                <Select onChange={ this._onChangeIPMethod.bind(this, "lan2_ip_method") } >
                                     <Option value="0">{formatMessage({id: "LANG219"})}</Option>
                                     <Option value="1">{formatMessage({id: "LANG220"})}</Option>
                                     <Option value="2">{formatMessage({id: "LANG221"})}</Option>
                                 </Select>
                            ) }
                        </FormItem>
                        <div className={ this.state.lan2_ip_class.static }>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1292" />}>
                                        <span>{formatMessage({id: "LANG1291"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('lan2_ip', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.default_interface_calss.lan1 === 'display-block' && this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "lan2_ip", "lan2_gateway", "lan2_mask", "lan2_mask", "other", true) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan2_ip
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1903" />}>
                                        <span>{formatMessage({id: "LANG1902"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('lan2_mask', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.mask(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan2_mask
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1901" />}>
                                        <span>{formatMessage({id: "LANG1900"})}</span>
                                    </Tooltip>
                                }
                                className={ this.state.default_interface_calss.lan1 }
                            >
                                { getFieldDecorator('lan2_gateway', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.default_interface_calss.lan1 === 'display-block' && this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.default_interface_calss.lan1 === 'display-block' && this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan2_gateway
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1905" />}>
                                        <span>{formatMessage({id: "LANG1904"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('lan2_dns1', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan2_dns1
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1907" />}>
                                        <span>{formatMessage({id: "LANG1906"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('lan2_dns2', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan2_dns2
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                        </div>
                        <div className={ this.state.lan2_ip_class.pppoe }>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1909" />}>
                                        <span>{formatMessage({id: "LANG1908"})}</span>
                                    </Tooltip>
                                }>
                                <Input name="lan2_username" className="hidden"></Input>
                                { getFieldDecorator('lan2_username', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.pppoe === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.pppoe === 'display-block' ? Validator.keyboradNoSpace(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan2_username
                                })(
                                    <Input maxLength="64" />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1911" />}>
                                        <span>{formatMessage({id: "LANG1910"})}</span>
                                    </Tooltip>
                                }>
                                <Input type="password" name="lan2_password" className="hidden"></Input>
                                { getFieldDecorator('lan2_password', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.pppoe === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.pppoe === 'display-block' ? Validator.pppoeSecret(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan2_password
                                })(
                                    <Input maxLength="64" type="password"/>
                                ) }
                            </FormItem>
                        </div>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2521" />}>
                                    <span>{formatMessage({id: "LANG2520"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('lan2_vid', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan1 === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan1 === 'display-block' ? Validator.range(data, value, callback, formatMessage, 0, 4094) : callback()
                                    }
                                }],
                                initialValue: network_settings.lan2_vid
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2523" />}>
                                    <span>{formatMessage({id: "LANG2522"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('lan2_priority', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan1 === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan1 === 'display-block' ? Validator.range(data, value, callback, formatMessage, 0, 7) : callback()
                                    }
                                }],
                                initialValue: network_settings.lan2_priority
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                    </div>
                    <Row className={ this.state.method_change_calss.wantitle}>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG264"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className={ this.state.method_change_calss.lantitle}>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG265"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className={ this.state.method_change_calss.lan2title}>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG267"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <div className={ this.state.method_change_calss.lan2 }>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG549" />}>
                                    <span>{formatMessage({id: "LANG549"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('lan1_ip_method', {
                                rules: [],
                                initialValue: network_settings.lan1_ip_method
                            })(
                                <Select onChange={ this._onChangeIPMethod.bind(this, "lan1_ip_method") } >
                                     <Option value="0">{formatMessage({id: "LANG219"})}</Option>
                                     <Option value="1">{formatMessage({id: "LANG220"})}</Option>
                                     <Option value="2">{formatMessage({id: "LANG221"})}</Option>
                                 </Select>
                            ) }
                        </FormItem>
                        <div className={ this.state.lan1_ip_class.static }>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1292" />}>
                                        <span>{formatMessage({id: "LANG1291"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('lan1_ipaddr', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' && this.state.default_interface_calss.lan2 === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "lan1_ipaddr", "lan1_gateway", "lan1_submask", "lan1_submask", "other", true) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "lan1_ipaddr", "lan2_ip", "lan1_submask", "lan2_mask", "other", false) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan1_ipaddr
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1903" />}>
                                        <span>{formatMessage({id: "LANG1902"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('lan1_submask', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? Validator.mask(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan1_submask
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1901" />}>
                                        <span>{formatMessage({id: "LANG1900"})}</span>
                                    </Tooltip>
                                }
                                className={ this.state.default_interface_calss.lan2 }
                            >
                                { getFieldDecorator('lan1_gateway', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' && this.state.default_interface_calss.lan2 === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' && this.state.default_interface_calss.lan2 === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan1_gateway
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1905" />}>
                                        <span>{formatMessage({id: "LANG1904"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('lan1_dns1', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan1_dns1 === "0.0.0.0" ? "" : network_settings.lan1_dns1
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1907" />}>
                                        <span>{formatMessage({id: "LANG1906"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('lan1_dns2', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan1_dns2 === "0.0.0.0" ? "" : network_settings.lan1_dns2
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                        </div>
                        <div className={ this.state.lan1_ip_class.pppoe }>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1909" />}>
                                        <span>{formatMessage({id: "LANG1908"})}</span>
                                    </Tooltip>
                                }>
                                <Input name="lan1_username" className="hidden"></Input>
                                { getFieldDecorator('lan1_username', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.pppoe === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.pppoe === 'display-block' ? Validator.keyboradNoSpace(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan1_username
                                })(
                                    <Input maxLength="64" />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1911" />}>
                                        <span>{formatMessage({id: "LANG1910"})}</span>
                                    </Tooltip>
                                }>
                                <Input type="password" name="lan1_password" className="hidden"></Input>
                                { getFieldDecorator('lan1_password', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.pppoe === 'display-block',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.pppoe === 'display-block' ? Validator.pppoeSecret(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: network_settings.lan1_password
                                })(
                                    <Input maxLength="64" type="password"/>
                                ) }
                            </FormItem>
                        </div>
                    </div>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG2521" />}>
                                <span>{formatMessage({id: "LANG2520"})}</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('lan1_vid', {
                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                validator: (data, value, callback) => {
                                    Validator.digits(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 0, 4094)
                                }
                            }],
                            initialValue: network_settings.lan1_vid
                        })(
                            <Input/>
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG2523" />}>
                                <span>{formatMessage({id: "LANG2522"})}</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('lan1_priority', {
                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                validator: (data, value, callback) => {
                                    Validator.digits(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 0, 7)
                                }
                            }],
                            initialValue: network_settings.lan1_priority
                        })(
                            <Input/>
                        ) }
                    </FormItem>
                    <div className={ this.state.method_change_calss.lan}>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG265"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG1916" />}>
                                    <span>{formatMessage({id: "LANG1915"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('dhcp_ipaddr', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: this.state.method_change_calss.lan === 'display-block',
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "dhcp_ipaddr", "dhcp_gateway", "dhcp_submask", "dhcp_submask", "", true) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "lan1_ipaddr", "dhcp_ipaddr", "lan1_submask", "dhcp_submask", "other", false) : callback()
                                    }
                                }],
                                initialValue: dhcp_settings.dhcp_ipaddr
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG1903" />}>
                                    <span>{formatMessage({id: "LANG1902"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('dhcp_submask', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: this.state.method_change_calss.lan === 'display-block',
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' ? Validator.mask(data, value, callback, formatMessage) : callback()
                                    }
                                }],
                                initialValue: dhcp_settings.dhcp_submask
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG1918" />}>
                                    <span>{formatMessage({id: "LANG1917"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('dhcp_enable', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: network_settings.dhcp_enable
                            })(
                                <Checkbox onChange={ this._onChangeDHCP } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG1905" />}>
                                    <span>{formatMessage({id: "LANG1904"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('dhcp_dns1', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                    }
                                }],
                                initialValue: dhcp_settings.dhcp_dns1
                            })(
                                <Input disabled={ !network_settings.dhcp_enable } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG1907" />}>
                                    <span>{formatMessage({id: "LANG1906"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('dhcp_dns2', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                    }
                                }],
                                initialValue: dhcp_settings.dhcp_dns2
                            })(
                                <Input disabled={ !network_settings.dhcp_enable } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG1920" />}>
                                    <span>{formatMessage({id: "LANG1919"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ipfrom', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? this._inSameNetworkSegment(data, value, callback, formatMessage, "ipfrom", "dhcp_gateway", "dhcp_submask", "dhcp_submask", "", true) : callback()
                                    }
                                }],
                                initialValue: dhcp_settings.ipfrom
                            })(
                                <Input disabled={ !network_settings.dhcp_enable } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG1922" />}>
                                    <span>{formatMessage({id: "LANG1921"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ipto', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? this._inSameNetworkSegment(data, value, callback, formatMessage, "ipto", "dhcp_gateway", "dhcp_submask", "dhcp_submask", "", true) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        const thisLabel = formatMessage({id: "LANG1921"})
                                        const otherInputValue = form.getFieldValue('ipfrom')
                                        const otherInputLabel = formatMessage({id: "LANG1919"})

                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.strbigger(data, value, callback, formatMessage, thisLabel, otherInputLabel, otherInputValue) : callback()
                                    }
                                }],
                                initialValue: dhcp_settings.ipto
                            })(
                                <Input disabled={ !network_settings.dhcp_enable } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG4444" />}>
                                    <span>{formatMessage({id: "LANG4443"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('dhcp_gateway', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                    }
                                }],
                                initialValue: dhcp_settings.dhcp_gateway
                            })(
                                <Input disabled={ !network_settings.dhcp_enable } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1924" />}>
                                    <span>{formatMessage({id: "LANG1923"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('ipleasetime', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.range(data, value, callback, formatMessage, 300, 172800) : callback()
                                    }
                                }],
                                initialValue: dhcp_settings.ipleasetime
                            })(
                                <Input disabled={ !network_settings.dhcp_enable } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2521" />}>
                                    <span>{formatMessage({id: "LANG2520"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('lan2_vid', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' ? Validator.range(data, value, callback, formatMessage, 0, 4094) : callback()
                                    }
                                }],
                                initialValue: network_settings.lan2_vid
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2523" />}>
                                    <span>{formatMessage({id: "LANG2522"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('lan2_priority', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.method_change_calss.lan === 'display-block' ? Validator.range(data, value, callback, formatMessage, 0, 7) : callback()
                                    }
                                }],
                                initialValue: network_settings.lan2_priority
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                    </div>
                </div>
            </div>
        )

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG4283"}) }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='hidden' />
                <div className="content">
                    <Form>
                        <Steps current={current}>
                            {steps.map(item => <Step key={item.title} title={item.content} />)}
                        </Steps>
                    </Form>
                </div>
                <div className="content">
                    <Card
                        style={{height: 400, overflow: 'auto'}}
                        title={steps[this.state.current + ''].content}
                        bodyStyle={{ padding: 20 }}>
                        <Form className={ wizardItem[this.state.current] === 'passwordItem' ? 'display-block' : 'hidden'}>
                            <FormItem
                                ref="div_oldpass"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1989" />}>
                                        <span>{formatMessage({id: "LANG1989"})}</span>
                                    </Tooltip>
                                }>
                                <Input type="password" name="old_password" className="hidden"></Input>
                                { getFieldDecorator('old_password', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: this._checkNeedPass
                                    }, {
                                        validator: this._checkOldPassword
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 4)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }],
                                    initialValue: ''
                                })(
                                    <Input type="password" maxLength='32' />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_newpass"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1990" />}>
                                        <span>{formatMessage({id: "LANG1990"})}</span>
                                    </Tooltip>
                                }>
                                <Input type="password" name="user_password" className="hidden"></Input>
                                { getFieldDecorator('user_password', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: this._checkNeedPass
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 8)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.checkAlphanumericPw(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: ''
                                })(
                                    <Input type="password" />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_newpass_rep"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1991" />}>
                                        <span>{formatMessage({id: "LANG1991"})}</span>
                                    </Tooltip>
                                }>
                                <Input type="password" name="newpass_rep" className="hidden"></Input>
                                { getFieldDecorator('newpass_rep', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: this._checkNeedPass
                                    }, {
                                        validator: this._checkNewPass
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 8)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.checkAlphanumericPw(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: ''
                                })(
                                    <Input type="password" />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_email"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG4192" />}>
                                        <span>{formatMessage({id: "LANG1081"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('email', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: this._checkNeedPass
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.email(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: ''
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Form>
                        <Form className={ wizardItem[this.state.current] === 'networkItem' ? 'display-block' : 'hidden'}>
                            { networkItem }
                        </Form>
                        <Form className={ wizardItem[this.state.current] === 'timezoneItem' ? 'display-block' : 'hidden'}>
                            <FormItem
                                ref="div_time_zone"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG2058" />}>
                                        <span>{formatMessage({id: "LANG2058"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('time_zone', {
                                    rules: [],
                                    initialValue: this.state.timezoneItem ? this.state.timezoneItem.time_zone : ''
                                })(
                                    <Select onChange={ this._onChangeTimeZone } >
                                        <Option value="TZA+12">{ formatMessage({id: "LANG2067"}) }</Option>
                                        <Option value="TZB+11">{ formatMessage({id: "LANG2068"}) }</Option>
                                        <Option value="HAW10">{ formatMessage({id: "LANG2069"}) }</Option>
                                        <Option value="AKST9AKDT">{ formatMessage({id: "LANG2070"}) }</Option>
                                        <Option value="PST8PDT">{ formatMessage({id: "LANG2071"}) }</Option>
                                        <Option value="PST8PDT,M4.1.0,M10.5.0" locale="LANG2072"></Option>
                                        <Option value="MST7MDT">{ formatMessage({id: "LANG2073"}) }</Option>
                                        <Option value="MST7">{ formatMessage({id: "LANG2074"}) }</Option>
                                        <Option value="MST7MDT,M4.1.0,M10.5.0">{ formatMessage({id: "LANG2075"}) }</Option>
                                        <Option value="CST6CDT">{ formatMessage({id: "LANG2076"}) }</Option>
                                        <Option value="CST+6">{ formatMessage({id: "LANG2077"}) }</Option>
                                        <Option value="CST6CDT,M4.1.0,M10.5.0">{ formatMessage({id: "LANG2078"}) }</Option>
                                        <Option value="EST5EDT">{ formatMessage({id: "LANG2079"}) }</Option>
                                        <Option value="TZf+4:30">{ formatMessage({id: "LANG2080"}) }</Option>
                                        <Option value="AST4ADT">{ formatMessage({id: "LANG2081"}) }</Option>
                                        <Option value="AST4ADT,M4.1.0/00:01:00,M10.5.0/00:01:00">{ formatMessage({id: "LANG2082"}) }</Option>
                                        <Option value="NST+3:30NDT+2:30,M4.1.0/00:01:00,M10.5.0/00:01:00">{ formatMessage({id: "LANG2083"}) }</Option>
                                        <Option value="TZK+3">{ formatMessage({id: "LANG2084"}) }</Option>
                                        <Option value="BRST+3BRDT+2,M10.3.0,M2.3.0">{ formatMessage({id: "LANG2085"}) }</Option>
                                        <Option value="UTC+3">{ formatMessage({id: "LANG2086"}) }</Option>
                                        <Option value="UTC+3">{ formatMessage({id: "LANG4538"}) }</Option>
                                        <Option value="UTC+2">{ formatMessage({id: "LANG4539"}) }</Option>
                                        <Option value="TZL+2">{ formatMessage({id: "LANG2087"}) }</Option>
                                        <Option value="TZM+1">{ formatMessage({id: "LANG2088"}) }</Option>
                                        <Option value="TZN+0">{ formatMessage({id: "LANG2089"}) }</Option>
                                        <Option value="GMT+0BST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2090"}) }</Option>
                                        <Option value="WET-0WEST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2091"}) }</Option>
                                        <Option value="GMT+0IST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2092"}) }</Option>
                                        <Option value="CET-1CEST-2,M3.5.0/02:00:00,M10.5.0/03:00:00">{ formatMessage({id: "LANG2094"}) }</Option>
                                        <Option value="CET-1CEST-2,M3.5.0/02:00:00,M10.5.0/03:00:00">{ formatMessage({id: "LANG2095"}) }</Option>
                                        <Option value="TZP-2">{ formatMessage({id: "LANG2096"}) }</Option>
                                        <Option value="EET-2EEST-3,M3.5.0/03:00:00,M10.5.0/04:00:00">{ formatMessage({id: "LANG2097"}) }</Option>
                                        <Option value="EET-2EEST,M3.5.0/3,M10.5.0/4">{ formatMessage({id: "LANG2098"}) }</Option>
                                        <Option value="TZQ-3">{ formatMessage({id: "LANG2099"}) }</Option>
                                        <Option value="MSK-3">{ formatMessage({id: "LANG2100"}) }</Option>
                                        <Option value="MST-3">{ formatMessage({id: "LANG2101"}) }</Option>
                                        <Option value="TZR-4">{ formatMessage({id: "LANG2102"}) }</Option>
                                        <Option value="TZS-5">{ formatMessage({id: "LANG2103"}) }</Option>
                                        <Option value="TZT-5:30">{ formatMessage({id: "LANG2104"}) }</Option>
                                        <Option value="TZU-5:45">{ formatMessage({id: "LANG2105"}) }</Option>
                                        <Option value="TZV-6">{ formatMessage({id: "LANG2106"}) }</Option>
                                        <Option value="TZW-6:30">{ formatMessage({id: "LANG2107"}) }</Option>
                                        <Option value="TZX-7">{ formatMessage({id: "LANG2108"}) }</Option>
                                        <Option value="WIB-7">{ formatMessage({id: "LANG2109"}) }</Option>
                                        <Option value="TZY-8">{ formatMessage({id: "LANG2110"}) }</Option>
                                        <Option value="SGT-8">{ formatMessage({id: "LANG2111"}) }</Option>
                                        <Option value="ULAT-8">{ formatMessage({id: "LANG2112"}) }</Option>
                                        <Option value="WST-8">{ formatMessage({id: "LANG2113"}) }</Option>
                                        <Option value="TZZ-9">{ formatMessage({id: "LANG2114"}) }</Option>
                                        <Option value="CST-9:30CDT-10:30,M10.5.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2115"}) }</Option>
                                        <Option value="CST-9:30">{ formatMessage({id: "LANG2116"}) }</Option>
                                        <Option value="TZb-10">{ formatMessage({id: "LANG2117"}) }</Option>
                                        <Option value="EST-10EDT-11,M10.1.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2118"}) }</Option>
                                        <Option value="EST-10EDT-11,M10.5.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2119"}) }</Option>
                                        <Option value="EST-10">{ formatMessage({id: "LANG2120"}) }</Option>
                                        <Option value="TZc-11">{ formatMessage({id: "LANG2121"}) }</Option>
                                        <Option value="NZST-12NZDT-13,M9.5.0/02:00:00,M4.1.0/03:00:00">{ formatMessage({id: "LANG2122"}) }</Option>
                                        <Option value="TZd-12">{ formatMessage({id: "LANG2123"}) }</Option>
                                        <Option value="TZe-13">{ formatMessage({id: "LANG2124"}) }</Option>
                                        <Option value="customize">{ formatMessage({id: "LANG2125"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_self_defined_time_zone"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG2061" />}>
                                        <span>{formatMessage({id: "LANG2061"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('self_defined_time_zone', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        required: this.state.customizeDisable ? false : true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: this.state.timezoneItem ? this.state.timezoneItem.self_defined_time_zone : ""
                                })(
                                    <Input disabled={ this.state.customizeDisable } maxLength="60" />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1740" />}>
                                        <span>{formatMessage({id: "LANG1739"})}</span>
                                    </Tooltip>
                                )}>
                                    { getFieldDecorator('language', {
                                        rules: [],
                                        initialValue: this.state.language
                                    })(
                                    <RadioGroup onChange={ this._onChangeRadio }>
                                        <Radio style={ radioStyle } value={'en'}>English : en</Radio>
                                        <Radio style={ radioStyle } value={'zh'}>中文 : zh</Radio>
                                        {
                                            this.state.languageList.map(function(item) {
                                                if (item.language_id !== 'zh' && item.language_id !== 'en') {
                                                    return <Radio
                                                            style={ radioStyle }
                                                            key={ item.language_id }
                                                            value={ item.language_id }>
                                                            { item.language_name + ' : ' + item.language_id }
                                                        </Radio>
                                                }
                                            })
                                        }
                                    </RadioGroup>
                                    )}
                            </FormItem>
                        </Form>
                        <Form className={ wizardItem[this.state.current] === 'digitalhardwareItem' ? 'display-block' : 'hidden'}>
                            <FormItem
                                ref="div_span_type"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3130" />}>
                                        <span>{formatMessage({id: "LANG3129"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('span_type', {
                                    rules: [],
                                    initialValue: 'E1'
                                })(
                                    <Select onChange={ this._onChangeSpanType }>
                                        <Option value='E1'>E1</Option>
                                        <Option value='T1'>T1</Option>
                                        <Option value='J1'>J1</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_clock"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3126" />}>
                                        <span>{formatMessage({id: "LANG3125"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('clock', {
                                    rules: [],
                                    initialValue: '1'
                                })(
                                    <Select>
                                        <Option value='0'>{ formatMessage({id: "LANG3127"}) }</Option>
                                        <Option value='1'>{ formatMessage({id: "LANG3128"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_coding"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3100" />}>
                                        <span>{formatMessage({id: "LANG3099"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('coding', {
                                    rules: [],
                                    initialValue: this.state.span_type === 'E1' ? 'hdb3' : 'b8zs'
                                })(
                                    <Select>
                                        { codingItem }
                                        <Option value='ami'>AMI</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                className={ this.state.span_type === 'E1' ? 'display-block' : 'hidden' }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3108" />}>
                                        <span>{formatMessage({id: "LANG3107"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('signalling', {
                                    rules: [],
                                    initialValue: 'pri_net'
                                })(
                                    <Select onChange={ this._onChangeSignalling }>
                                        <Option value='pri_net'>PRI_NET</Option>
                                        <Option value='pri_cpe'>PRI_CPE</Option>
                                        <Option value='ss7'>SS7</Option>
                                        <Option value='mfcr2'>MFC/R2</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                className={ this.state.span_type === 'T1' ? 'display-block' : 'hidden' }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3108" />}>
                                        <span>{formatMessage({id: "LANG3107"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('signalling', {
                                    rules: [],
                                    initialValue: 'pri_net'
                                })(
                                    <Select onChange={ this._onChangeSignalling }>
                                        <Option value='pri_net'>PRI_NET</Option>
                                        <Option value='pri_cpe'>PRI_CPE</Option>
                                        <Option value='ss7'>SS7</Option>
                                        <Option value='em'>E&M Immediate</Option>
                                        <Option value='em_w'>E&M Wink</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                className={ this.state.span_type === 'J1' ? 'display-block' : 'hidden' }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3108" />}>
                                        <span>{formatMessage({id: "LANG3107"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('signalling', {
                                    rules: [],
                                    initialValue: 'pri_net'
                                })(
                                    <Select onChange={ this._onChangeSignalling }>
                                        <Option value='pri_net'>PRI_NET</Option>
                                        <Option value='pri_cpe'>PRI_CPE</Option>
                                        <Option value='ss7'>SS7</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <div className={ this.state.signalling === 'ss7' ? 'display-block' : 'hidden'}>
                                <FormItem
                                    ref="div_ss7type"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3256" />}>
                                            <span>{formatMessage({id: "LANG3255"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('ss7type', {
                                        rules: [],
                                        initialValue: 'itu'
                                    })(
                                        <Select>
                                            <Option value='itu'>ITU</Option>
                                            <Option value='ansi'>ANSI</Option>
                                            <Option value='china'>CHINA</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <FormItem
                                    ref="div_pointcode"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3258" />}>
                                            <span>{formatMessage({id: "LANG3257"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('pointcode', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.signalling === 'ss7',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: this.state.signalling === 'ss7' ? this._checkPointcode : ''
                                        }],
                                        initialValue: ''
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                                <FormItem
                                    ref="div_defaultdpc"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3260" />}>
                                            <span>{formatMessage({id: "LANG3259"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('defaultdpc', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.signalling === 'ss7',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: this.state.signalling === 'ss7' ? this._checkDefaultpc : ''
                                        }],
                                        initialValue: ''
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                                <FormItem
                                    ref="div_cicbeginswith"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4088" />}>
                                            <span>{formatMessage({id: "LANG4070"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('cicbeginswith', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.signalling === 'ss7',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.signalling === 'ss7' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: this.state.signalling === 'ss7' ? this._checkCICBegin : ''
                                        }],
                                        initialValue: '1'
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </div>
                            <FormItem
                                ref="div_mfcr2_variant"
                                className={this.state.signalling === 'mfcr2' ? 'display-block' : 'hidden'}
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3291" />}>
                                        <span>{formatMessage({id: "LANG3290"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('mfcr2_variant', {
                                    rules: [],
                                    initialValue: 'itu'
                                })(
                                    <Select>
                                        <Option value="ar">{ formatMessage({id: "LANG284"}) }</Option>
                                        <Option value="br">{ formatMessage({id: "LANG307"}) }</Option>
                                        <Option value="cn">{ formatMessage({id: "LANG324"}) }</Option>
                                        <Option value="cz">{ formatMessage({id: "LANG332"}) }</Option>
                                        <Option value="co">{ formatMessage({id: "LANG325"}) }</Option>
                                        <Option value="ec">{ formatMessage({id: "LANG341"}) }</Option>
                                        <Option value="id">{ formatMessage({id: "LANG379"}) }</Option>
                                        <Option value="itu">ITU</Option>
                                        <Option value="mx">{ formatMessage({id: "LANG437"}) }</Option>
                                        <Option value="ph">{ formatMessage({id: "LANG458"}) }</Option>
                                        <Option value="ve">{ formatMessage({id: "LANG528"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Form>
                        <Form className={ wizardItem[this.state.current] === 'extensionItem' ? 'display-block' : 'hidden'}>
                            <div className='content'>
                                <span style={{ color: '#AAAAAA' }}>{ formatMessage({id: "LANG4322"}) }</span>
                            </div>
                            <FormItem
                                ref="div_disable_extension_ranges"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1586" />}>
                                        <span>{formatMessage({id: "LANG1586"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('disable_extension_ranges', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.prefSettings.disable_extension_ranges === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_batch_extension"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1156" />}>
                                        <span>{formatMessage({id: "LANG1155"})}</span>
                                    </Tooltip>
                                }>
                                <Popover content={<span dangerouslySetInnerHTML={{__html: this.state.popValue}}></span>}>
                                { getFieldDecorator('batch_extension', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: wizardItem[this.state.current] === 'extensionItem' && this.state.disableExtensionItem === false ? this._checkExtenRequire : ''
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: this._checkExtenRange
                                    }, {
                                        validator: (data, value, callback) => {
                                            wizardItem[this.state.current] === 'extensionItem' ? Validator.minlength(data, value, callback, formatMessage, 2) : callback()
                                        }
                                    }],
                                    initialValue: this.state.newExtenNum
                                })(
                                    <Input disabled={ this.state.disableExtensionItem } onChange={this._onInputExtenChange} maxLength='18' />
                                ) }
                                </Popover>
                            </FormItem>
                            <FormItem
                                ref="div_batch_number"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1158" />}>
                                        <span>{formatMessage({id: "LANG1157"})}</span>
                                    </Tooltip>
                                }>
                                <Col span={ 6 }>
                                    { getFieldDecorator('batch_number', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                Validator.digits(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.range(data, value, callback, formatMessage, 0, batch_number_max)
                                            }
                                        }, {
                                            validator: wizardItem[this.state.current] === 'extensionItem' ? this._checkMaxUsers : ''
                                        }],
                                        initialValue: this.state.batch_number + ''
                                    })(
                                        <Input disabled={ this.state.disableExtensionItem } maxLength='18' onChange={this._onInputBatchNumberChange} />
                                    ) }
                                </Col>
                            </FormItem>
                            <FormItem
                                ref="div_batch_password"
                                { ...formItemLayout }
                                label={
                                    <Tooltip title={<FormattedHTMLMessage id="LANG4321" />}>
                                        <span>{formatMessage({id: "LANG4320"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('batch_password', {
                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                        validator: this.state.secretDisable === false ? this._checkBatchSecret : ''
                                    }],
                                    initialValue: 'batch_rand_secret'
                                })(
                                    <RadioGroup onChange={ this._onChangeRadioSecret } disabled={ this.state.disableExtensionItem }>
                                        <Radio style={ radioStyle } value={'batch_rand_secret'}>{ formatMessage({id: "LANG1151"}) }</Radio>
                                        <Radio style={ radioStyle } value={'batch_same_secret'}>
                                            <span>
                                                { formatMessage({id: "LANG1153"}) }
                                            </span>
                                                {getFieldDecorator('batch_secret', {
                                                    rules: [],
                                                    initialValue: ''
                                                })(
                                                <Input
                                                    style={{width: 200}}
                                                    maxLength={32}
                                                    disabled={this.state.secretDisable}/>
                                                )}
                                            <span>
                                                { formatMessage({id: "LANG1154"}) }
                                            </span>
                                        </Radio>
                                    </RadioGroup>
                                ) }
                            </FormItem>
                        </Form>
                        <Form className={ wizardItem[this.state.current] === 'trunkItem' ? 'display-block' : 'hidden'}>
                            <Row>
                                <Button
                                    icon="plus"
                                    type="primary"
                                    size='default'
                                    onClick={this._addTrunk}
                                    disabled={this.state.addTrunkShow}>
                                    { formatMessage({id: "LANG769"}) }
                                </Button>
                                <Popover
                                    content={
                                        <div>
                                            <Table
                                                rowKey="outbound_rt_index"
                                                columns={ columns_pop }
                                                dataSource={ this.state.existOutboundRouteList }
                                                showHeader={ !!this.state.existOutboundRouteList.length }
                                                pagination={ pagination_pop }
                                            />
                                        </div>
                                 }>
                                    <a>{ formatMessage({id: "LANG4371"}) }</a>
                                </Popover>
                            </Row>
                            <div className='content'>
                                <div className={ this.state.addTrunkShow ? 'hidden' : 'display-block' }>
                                    <Table
                                        rowKey="id"
                                        columns={ columns_trunk }
                                        dataSource={ addTrunkList }
                                        showHeader={ !!addTrunkList.length }
                                        pagination={ pagination_trunk }
                                    ></Table>
                                </div>
                            </div>
                            <div className='content'>
                                <div className={ this.state.addTrunkShow ? 'display-block' : 'hidden' }>
                                    <FormItem
                                        { ...formItemLayout }
                                        className={ showHardware ? 'hidden' : 'display-block' }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4324" />}>
                                                <span>{formatMessage({id: "LANG4324"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('trunkType', {
                                            rules: [],
                                            initialValue: 'SIP'
                                        })(
                                            <Select onChange={ this._onChangeTrunkType } disabled={ this.state.trunkEdit }>
                                                <Option value='SIP'>{ formatMessage({id: "LANG4323"}, {0: formatMessage({id: "LANG108"})}) }</Option>
                                                <Option value='IAX'>{ formatMessage({id: "LANG4323"}, {0: formatMessage({id: "LANG107"})}) }</Option>
                                                <Option value='Analog'>{ formatMessage({id: "LANG639"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        className={ showHardware ? 'display-block' : 'hidden' }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4324" />}>
                                                <span>{formatMessage({id: "LANG4324"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('trunkType', {
                                            rules: [],
                                            initialValue: 'SIP'
                                        })(
                                            <Select onChange={ this._onChangeTrunkType } disabled={ this.state.trunkEdit }>
                                                <Option value='SIP'>{ formatMessage({id: "LANG4323"}, {0: formatMessage({id: "LANG108"})}) }</Option>
                                                <Option value='IAX'>{ formatMessage({id: "LANG4323"}, {0: formatMessage({id: "LANG107"})}) }</Option>
                                                <Option value='Analog'>{ formatMessage({id: "LANG639"}) }</Option>
                                                <Option value='Digital'>{ formatMessage({id: "LANG3141"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1350" />}>
                                                <span>{formatMessage({id: "LANG1351"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('trunk_name', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                required: this.state.addTrunkShow,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.alphanumeric(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: this._checkTrunkName
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='16' disabled={ this.state.selectTrunkType === 'Digital' }/>
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        className={ this.state.selectTrunkType === 'Analog' ? "display-block" : "hidden" }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4324" />}>
                                                <span>{formatMessage({id: "LANG4324"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('countrytone', {
                                            rules: [],
                                            initialValue: 'us'
                                        })(
                                            <Select>
                                                {
                                                    this.state.countryToneList.map(function(item) {
                                                        const text = formatMessage({id: nation2langObj[item.country.toLowerCase()]})
                                                        return <Option
                                                            key={ item.country }
                                                            value={ item.country }>
                                                            { text }
                                                        </Option>
                                                    })
                                                }
                                            </Select>
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        className={ this.state.selectTrunkType === 'Analog' ? "display-block" : "hidden" }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1329" />}>
                                                <span>{formatMessage({id: "LANG1329"})}</span>
                                            </Tooltip>
                                        }>
                                        <CheckboxGroup options={ plainOptionsFXO } value={ checkedFXOList } disabled onChange={ this._onChangeFXOPort } />
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        className={ this.state.selectTrunkType !== 'Analog' && this.state.selectTrunkType !== 'Digital' ? "display-block" : "hidden" }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1374" />}>
                                                <span>{formatMessage({id: "LANG1373"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('host', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                required: this.state.selectTrunkType !== 'Analog' && this.state.selectTrunkType !== 'Digital' && this.state.addTrunkShow,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.host(data, value, callback, formatMessage, "LANG1373")
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='41' />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        className={ this.state.selectTrunkType !== 'Analog' && this.state.selectTrunkType !== 'Digital' ? "display-block" : "hidden" }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1393" />}>
                                                <span>{formatMessage({id: "LANG72"})}</span>
                                            </Tooltip>
                                        }>
                                        <Input name="username" className="hidden"></Input>
                                        { getFieldDecorator('username', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                validator: this._checkReg
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.authid(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='64' />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        className={ this.state.selectTrunkType !== 'Analog' && this.state.selectTrunkType !== 'Digital' ? "display-block" : "hidden" }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG73" />}>
                                                <span>{formatMessage({id: "LANG73"})}</span>
                                            </Tooltip>
                                        }>
                                        <Input type="password" name="secret" className="hidden"></Input>
                                        { getFieldDecorator('secret', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                validator: this._checkReg
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.keyboradNoSpace(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input type='password' maxLength='64' />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        className={ this.state.selectTrunkType === 'SIP' ? "display-block" : "hidden" }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2488" />}>
                                                <span>{formatMessage({id: "LANG2487"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('authid', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                validator: (data, value, callback) => {
                                                    Validator.authid(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='64' />
                                        ) }
                                    </FormItem>
                                    <div className='section-title section-title-specail'>
                                        <span>
                                        { formatMessage({id: "LANG4325"}) }
                                        </span>
                                    </div>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1534" />}>
                                                <span>{formatMessage({id: "LANG1533"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('outbound_rt_name', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                required: this.state.addTrunkShow,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: this._checkOutboundName
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='25' />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4329" />}>
                                                <span>{formatMessage({id: "LANG4327"})}</span>
                                            </Tooltip>
                                        }>
                                        <Popover
                                            content={ <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG4329"}) }}></span> }
                                            placement="right">
                                        { getFieldDecorator('number_head', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='20' />
                                        ) }
                                        </Popover>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4329" />}>
                                                <span>{formatMessage({id: "LANG4328"})}</span>
                                            </Tooltip>
                                        }>
                                        <Popover
                                            content={ <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG4329"}) }}></span> }
                                            placement="right">
                                        { getFieldDecorator('number_length', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                required: this.state.addTrunkShow,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='2' />
                                        ) }
                                        </Popover>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1544" />}>
                                                <span>{formatMessage({id: "LANG1543"})}</span>
                                            </Tooltip>
                                        }>
                                        <Popover
                                            content={this.state.permissionPopContent}
                                            visible={this.state.permissionPopVisible}
                                            trigger="focus"
                                            placement="right"
                                            onVisibleChange={this._onpermissionPopVisibleChange}
                                        >
                                        { getFieldDecorator('permission', {
                                            rules: [],
                                            initialValue: 'local'
                                        })(
                                            <Select onChange={ this._onChangePermission } onFocus={ this._onFocusPermission }>
                                                <Option value="none">{ formatMessage({id: "LANG273"}) }</Option>
                                                <Option value="internal">{ formatMessage({id: "LANG1071"}) }</Option>
                                                <Option value="local">{ formatMessage({id: "LANG1072"}) }</Option>
                                                <Option value="national">{ formatMessage({id: "LANG1073"}) }</Option>
                                                <Option value="international">{ formatMessage({id: "LANG1074"}) }</Option>
                                            </Select>
                                        ) }
                                        </Popover>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1548" />}>
                                                <span>{formatMessage({id: "LANG245"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('strip', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: this.state.addTrunkShow ? this._checkStrip : ''
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='2' />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1542" />}>
                                                <span>{formatMessage({id: "LANG1541"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('prepend', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                validator: (data, value, callback) => {
                                                    Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input maxLength='20' />
                                        ) }
                                    </FormItem>
                                    <div className='section-title section-title-specail'>
                                        <span>
                                        { formatMessage({id: "LANG4326"}) }
                                        </span>
                                    </div>
                                    <FormItem
                                        { ...formItemTwoSelectLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2389" />}>
                                                <span>{formatMessage({id: "LANG1558"})}</span>
                                            </Tooltip>
                                        }>
                                        <Row>
                                            <Col span={8}>
                                                { getFieldDecorator('destination_type', {
                                                    rules: [],
                                                    initialValue: 'byDID'
                                                })(
                                                    <Select onChange={this._onChangeDestinationType}>
                                                        <Option value="byDID" disabled={this.state.byDIDDisabled}>{ formatMessage({id: "LANG1563"}) }</Option>
                                                        <Option value="account">{ formatMessage({id: "LANG85"}) }</Option>
                                                    </Select>
                                                ) }
                                            </Col>
                                            <Col span={8} offset={1} className={destinationAccountShow ? 'display-block' : 'hidden'}>
                                                { getFieldDecorator('destination_value', {
                                                    getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                        required: destinationAccountShow,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }],
                                                    initialValue: this.state.accountList.length > 0 ? this.state.accountList[0].key : ''
                                                })(
                                                    <Select>
                                                    {
                                                        accountList.map(function(item) {
                                                            return <Option
                                                                    key={ item.key }
                                                                    value={ item.value }
                                                                    disabled={ item.disabled }>
                                                                    { item.title }
                                                                </Option>
                                                        })
                                                    }
                                                    </Select>
                                                ) }
                                            </Col>
                                        </Row>
                                    </FormItem>
                                    <Form>
                                        <Button
                                            style={{ marginLeft: 8 }}
                                            onClick={this._cancelAddTrunk}>
                                            { formatMessage({id: "LANG726"}) }
                                        </Button>
                                        <Button
                                            style={{ marginLeft: 8 }}
                                            onClick={this._saveAddTrunk}>
                                            { formatMessage({id: "LANG728"}) }
                                        </Button>
                                    </Form>
                                </div>
                            </div>
                        </Form>
                        <Form className={ wizardItem[this.state.current] === 'summaryItem' ? 'display-block' : 'hidden'}>
                            <div className='section-title section-title-specail'>
                                <span>{ formatMessage({id: "LANG48"}) }</span>
                            </div>
                            { networkItem }
                            <div className='section-title section-title-specail'>
                                <span>{ formatMessage({id: "LANG2058"}) }</span>
                            </div>
                            <div>
                                <FormItem
                                    ref="div_time_zone"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG2058" />}>
                                            <span>{formatMessage({id: "LANG2058"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('time_zone', {
                                        rules: [],
                                        initialValue: this.state.timezoneItem ? this.state.timezoneItem.time_zone : ''
                                    })(
                                        <Select onChange={ this._onChangeTimeZone } >
                                            <Option value="TZA+12">{ formatMessage({id: "LANG2067"}) }</Option>
                                            <Option value="TZB+11">{ formatMessage({id: "LANG2068"}) }</Option>
                                            <Option value="HAW10">{ formatMessage({id: "LANG2069"}) }</Option>
                                            <Option value="AKST9AKDT">{ formatMessage({id: "LANG2070"}) }</Option>
                                            <Option value="PST8PDT">{ formatMessage({id: "LANG2071"}) }</Option>
                                            <Option value="PST8PDT,M4.1.0,M10.5.0" locale="LANG2072"></Option>
                                            <Option value="MST7MDT">{ formatMessage({id: "LANG2073"}) }</Option>
                                            <Option value="MST7">{ formatMessage({id: "LANG2074"}) }</Option>
                                            <Option value="MST7MDT,M4.1.0,M10.5.0">{ formatMessage({id: "LANG2075"}) }</Option>
                                            <Option value="CST6CDT">{ formatMessage({id: "LANG2076"}) }</Option>
                                            <Option value="CST+6">{ formatMessage({id: "LANG2077"}) }</Option>
                                            <Option value="CST6CDT,M4.1.0,M10.5.0">{ formatMessage({id: "LANG2078"}) }</Option>
                                            <Option value="EST5EDT">{ formatMessage({id: "LANG2079"}) }</Option>
                                            <Option value="TZf+4:30">{ formatMessage({id: "LANG2080"}) }</Option>
                                            <Option value="AST4ADT">{ formatMessage({id: "LANG2081"}) }</Option>
                                            <Option value="AST4ADT,M4.1.0/00:01:00,M10.5.0/00:01:00">{ formatMessage({id: "LANG2082"}) }</Option>
                                            <Option value="NST+3:30NDT+2:30,M4.1.0/00:01:00,M10.5.0/00:01:00">{ formatMessage({id: "LANG2083"}) }</Option>
                                            <Option value="TZK+3">{ formatMessage({id: "LANG2084"}) }</Option>
                                            <Option value="BRST+3BRDT+2,M10.3.0,M2.3.0">{ formatMessage({id: "LANG2085"}) }</Option>
                                            <Option value="UTC+3">{ formatMessage({id: "LANG2086"}) }</Option>
                                            <Option value="UTC+3">{ formatMessage({id: "LANG4538"}) }</Option>
                                            <Option value="UTC+2">{ formatMessage({id: "LANG4539"}) }</Option>
                                            <Option value="TZL+2">{ formatMessage({id: "LANG2087"}) }</Option>
                                            <Option value="TZM+1">{ formatMessage({id: "LANG2088"}) }</Option>
                                            <Option value="TZN+0">{ formatMessage({id: "LANG2089"}) }</Option>
                                            <Option value="GMT+0BST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2090"}) }</Option>
                                            <Option value="WET-0WEST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2091"}) }</Option>
                                            <Option value="GMT+0IST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2092"}) }</Option>
                                            <Option value="CET-1CEST-2,M3.5.0/02:00:00,M10.5.0/03:00:00">{ formatMessage({id: "LANG2094"}) }</Option>
                                            <Option value="CET-1CEST-2,M3.5.0/02:00:00,M10.5.0/03:00:00">{ formatMessage({id: "LANG2095"}) }</Option>
                                            <Option value="TZP-2">{ formatMessage({id: "LANG2096"}) }</Option>
                                            <Option value="EET-2EEST-3,M3.5.0/03:00:00,M10.5.0/04:00:00">{ formatMessage({id: "LANG2097"}) }</Option>
                                            <Option value="EET-2EEST,M3.5.0/3,M10.5.0/4">{ formatMessage({id: "LANG2098"}) }</Option>
                                            <Option value="TZQ-3">{ formatMessage({id: "LANG2099"}) }</Option>
                                            <Option value="MSK-3">{ formatMessage({id: "LANG2100"}) }</Option>
                                            <Option value="MST-3">{ formatMessage({id: "LANG2101"}) }</Option>
                                            <Option value="TZR-4">{ formatMessage({id: "LANG2102"}) }</Option>
                                            <Option value="TZS-5">{ formatMessage({id: "LANG2103"}) }</Option>
                                            <Option value="TZT-5:30">{ formatMessage({id: "LANG2104"}) }</Option>
                                            <Option value="TZU-5:45">{ formatMessage({id: "LANG2105"}) }</Option>
                                            <Option value="TZV-6">{ formatMessage({id: "LANG2106"}) }</Option>
                                            <Option value="TZW-6:30">{ formatMessage({id: "LANG2107"}) }</Option>
                                            <Option value="TZX-7">{ formatMessage({id: "LANG2108"}) }</Option>
                                            <Option value="WIB-7">{ formatMessage({id: "LANG2109"}) }</Option>
                                            <Option value="TZY-8">{ formatMessage({id: "LANG2110"}) }</Option>
                                            <Option value="SGT-8">{ formatMessage({id: "LANG2111"}) }</Option>
                                            <Option value="ULAT-8">{ formatMessage({id: "LANG2112"}) }</Option>
                                            <Option value="WST-8">{ formatMessage({id: "LANG2113"}) }</Option>
                                            <Option value="TZZ-9">{ formatMessage({id: "LANG2114"}) }</Option>
                                            <Option value="CST-9:30CDT-10:30,M10.5.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2115"}) }</Option>
                                            <Option value="CST-9:30">{ formatMessage({id: "LANG2116"}) }</Option>
                                            <Option value="TZb-10">{ formatMessage({id: "LANG2117"}) }</Option>
                                            <Option value="EST-10EDT-11,M10.1.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2118"}) }</Option>
                                            <Option value="EST-10EDT-11,M10.5.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2119"}) }</Option>
                                            <Option value="EST-10">{ formatMessage({id: "LANG2120"}) }</Option>
                                            <Option value="TZc-11">{ formatMessage({id: "LANG2121"}) }</Option>
                                            <Option value="NZST-12NZDT-13,M9.5.0/02:00:00,M4.1.0/03:00:00">{ formatMessage({id: "LANG2122"}) }</Option>
                                            <Option value="TZd-12">{ formatMessage({id: "LANG2123"}) }</Option>
                                            <Option value="TZe-13">{ formatMessage({id: "LANG2124"}) }</Option>
                                            <Option value="customize">{ formatMessage({id: "LANG2125"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <FormItem
                                    ref="div_self_defined_time_zone"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG2061" />}>
                                            <span>{formatMessage({id: "LANG2061"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('self_defined_time_zone', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.customizeDisable ? false : true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: this.state.timezoneItem ? this.state.timezoneItem.self_defined_time_zone : ""
                                    })(
                                        <Input disabled={ this.state.customizeDisable } maxLength="60" />
                                    ) }
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG1740" />}>
                                            <span>{formatMessage({id: "LANG1739"})}</span>
                                        </Tooltip>
                                    )}>
                                        { getFieldDecorator('language', {
                                            rules: [],
                                            initialValue: this.state.language
                                        })(
                                        <RadioGroup onChange={ this._onChangeRadio }>
                                            <Radio style={ radioStyle } value={'en'}>English : en</Radio>
                                            <Radio style={ radioStyle } value={'zh'}>中文 : zh</Radio>
                                            {
                                                this.state.languageList.map(function(item) {
                                                    if (item.language_id !== 'zh' && item.language_id !== 'en') {
                                                        return <Radio
                                                                style={ radioStyle }
                                                                key={ item.language_id }
                                                                value={ item.language_id }>
                                                                { item.language_name + ' : ' + item.language_id }
                                                            </Radio>
                                                    }
                                                })
                                            }
                                        </RadioGroup>
                                        )}
                                </FormItem>
                            </div>
                            <div className={ showHardware ? 'display-block' : 'hidden' }>
                                <div className='section-title section-title-specail'>
                                    <span>{ formatMessage({id: "LANG686"}) }</span>
                                </div>
                                <FormItem
                                    ref="div_span_type"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3130" />}>
                                            <span>{formatMessage({id: "LANG3129"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('span_type', {
                                        rules: [],
                                        initialValue: 'E1'
                                    })(
                                        <Select onChange={ this._onChangeSpanType }>
                                            <Option value='E1'>E1</Option>
                                            <Option value='T1'>T1</Option>
                                            <Option value='J1'>J1</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <FormItem
                                    ref="div_clock"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3126" />}>
                                            <span>{formatMessage({id: "LANG3125"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('clock', {
                                        rules: [],
                                        initialValue: '1'
                                    })(
                                        <Select>
                                            <Option value='0'>{ formatMessage({id: "LANG3127"}) }</Option>
                                            <Option value='1'>{ formatMessage({id: "LANG3128"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <FormItem
                                    ref="div_coding"
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3100" />}>
                                            <span>{formatMessage({id: "LANG3099"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('coding', {
                                        rules: [],
                                        initialValue: this.state.span_type === 'E1' ? 'hdb3' : 'b8zs'
                                    })(
                                        <Select>
                                            { codingItem }
                                            <Option value='ami'>AMI</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    className={ this.state.span_type === 'E1' ? 'display-block' : 'hidden' }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3108" />}>
                                            <span>{formatMessage({id: "LANG3107"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('signalling', {
                                        rules: [],
                                        initialValue: 'pri_net'
                                    })(
                                        <Select onChange={ this._onChangeSignalling }>
                                            <Option value='pri_net'>PRI_NET</Option>
                                            <Option value='pri_cpe'>PRI_CPE</Option>
                                            <Option value='ss7'>SS7</Option>
                                            <Option value='mfcr2'>MFC/R2</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    className={ this.state.span_type === 'T1' ? 'display-block' : 'hidden' }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3108" />}>
                                            <span>{formatMessage({id: "LANG3107"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('signalling', {
                                        rules: [],
                                        initialValue: 'pri_net'
                                    })(
                                        <Select onChange={ this._onChangeSignalling }>
                                            <Option value='pri_net'>PRI_NET</Option>
                                            <Option value='pri_cpe'>PRI_CPE</Option>
                                            <Option value='ss7'>SS7</Option>
                                            <Option value='em'>E&M Immediate</Option>
                                            <Option value='em_w'>E&M Wink</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    className={ this.state.span_type === 'J1' ? 'display-block' : 'hidden' }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3108" />}>
                                            <span>{formatMessage({id: "LANG3107"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('signalling', {
                                        rules: [],
                                        initialValue: 'pri_net'
                                    })(
                                        <Select onChange={ this._onChangeSignalling }>
                                            <Option value='pri_net'>PRI_NET</Option>
                                            <Option value='pri_cpe'>PRI_CPE</Option>
                                            <Option value='ss7'>SS7</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <div className={ this.state.signalling === 'ss7' ? 'display-block' : 'hidden'}>
                                    <FormItem
                                        ref="div_ss7type"
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG3256" />}>
                                                <span>{formatMessage({id: "LANG3255"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('ss7type', {
                                            rules: [],
                                            initialValue: 'itu'
                                        })(
                                            <Select>
                                                <Option value='itu'>ITU</Option>
                                                <Option value='ansi'>ANSI</Option>
                                                <Option value='china'>CHINA</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        ref="div_pointcode"
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG3258" />}>
                                                <span>{formatMessage({id: "LANG3257"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('pointcode', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                required: this.state.signalling === 'ss7',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this.state.signalling === 'ss7' ? this._checkPointcode : ''
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        ref="div_defaultdpc"
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG3260" />}>
                                                <span>{formatMessage({id: "LANG3259"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('defaultdpc', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                required: this.state.signalling === 'ss7',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this.state.signalling === 'ss7' ? this._checkDefaultpc : ''
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                    <FormItem
                                        ref="div_cicbeginswith"
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4088" />}>
                                                <span>{formatMessage({id: "LANG4070"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('cicbeginswith', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                required: this.state.signalling === 'ss7',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.signalling === 'ss7' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                }
                                            }, {
                                                validator: this.state.signalling === 'ss7' ? this._checkCICBegin : ''
                                            }],
                                            initialValue: '1'
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                </div>
                                <FormItem
                                    ref="div_mfcr2_variant"
                                    className={this.state.signalling === 'mfcr2' ? 'display-block' : 'hidden'}
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3291" />}>
                                            <span>{formatMessage({id: "LANG3290"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('mfcr2_variant', {
                                        rules: [],
                                        initialValue: 'itu'
                                    })(
                                        <Select>
                                            <Option value="ar">{ formatMessage({id: "LANG284"}) }</Option>
                                            <Option value="br">{ formatMessage({id: "LANG307"}) }</Option>
                                            <Option value="cn">{ formatMessage({id: "LANG324"}) }</Option>
                                            <Option value="cz">{ formatMessage({id: "LANG332"}) }</Option>
                                            <Option value="co">{ formatMessage({id: "LANG325"}) }</Option>
                                            <Option value="ec">{ formatMessage({id: "LANG341"}) }</Option>
                                            <Option value="id">{ formatMessage({id: "LANG379"}) }</Option>
                                            <Option value="itu">ITU</Option>
                                            <Option value="mx">{ formatMessage({id: "LANG437"}) }</Option>
                                            <Option value="ph">{ formatMessage({id: "LANG458"}) }</Option>
                                            <Option value="ve">{ formatMessage({id: "LANG528"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </div>
                            <div className='section-title section-title-specail'>
                                <span>{ formatMessage({id: "LANG87"}) }</span>
                            </div>
                            <div>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG736" />}>
                                            <span>{formatMessage({id: "LANG736"})}</span>
                                        </Tooltip>
                                    )}>
                                    <span dangerouslySetInnerHTML={{__html: this.state.popValue}}></span>
                                </FormItem>
                            </div>
                            <div className='section-title section-title-specail'>
                                <span>{ formatMessage({id: "LANG4315"}) }</span>
                            </div>
                            <div>
                                <Table
                                    rowKey="id"
                                    columns={ columns_trunk }
                                    dataSource={ addTrunkList }
                                    showHeader={ !!addTrunkList.length }
                                    pagination={ pagination_trunk }
                                ></Table>
                            </div>
                        </Form>
                    </Card>
                    <Form className={ this.state.addTrunkShow ? 'hidden' : 'display-block' }>
                        <div className="top-button">
                            {
                                this.state.current > 0 &&
                                <Button
                                    style={{ marginLeft: 8 }}
                                    onClick={this._prev}>
                                    { formatMessage({id: "LANG4311"}) }
                                </Button>
                            }
                            {
                                this.state.current < steps.length - 1 &&
                                <Button
                                    type="primary"
                                    onClick={this._next}>
                                    { formatMessage({id: "LANG3386"}) }
                                </Button>
                            }
                            {
                                this.state.current === steps.length - 1 &&
                                <Button
                                    type="primary"
                                    onClick={this._handleSubmit}>
                                    { formatMessage({id: "LANG728"}) }
                                </Button>
                            }
                            <Button
                                style={{ marginLeft: 8 }}
                                onClick={this._handleCancelClick}>
                                { formatMessage({id: "LANG4312"}) }
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

SetupWizard.propTypes = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(SetupWizard)))

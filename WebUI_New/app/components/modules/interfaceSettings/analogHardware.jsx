'use strict'

import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import $ from 'jquery'
import { Form, Input, Row, Col, Icon, message, Button, Tooltip, Select, Checkbox, Table } from 'antd'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { browserHistory } from 'react-router'

const Option = Select.Option
const FormItem = Form.Item

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

const country2lngObj = {
    "usa": "LANG521",
    "argentina": "LANG284",
    "australia": "LANG287",
    "austria": "LANG286",
    "bahrain": "LANG299",
    "belgium": "LANG294",
    "brazil": "LANG307",
    "bulgaria": "LANG296",
    "canada": "LANG314",
    "chile": "LANG322",
    "china": "LANG324",
    "colombia": "LANG325",
    "croatia": "LANG376",
    "cyprus": "LANG331",
    "czech": "LANG332",
    "denmark": "LANG335",
    "ecuador": "LANG341",
    "egypt": "LANG343",
    "elsalvador": "LANG495",
    "fcc": "LANG1729",
    "finland": "LANG348",
    "france": "LANG353",
    "germany": "LANG333",
    "greece": "LANG367",
    "guam": "LANG370",
    "hongkong": "LANG373",
    "hungary": "LANG378",
    "iceland": "LANG387",
    "india": "LANG383",
    "indonesia": "LANG379",
    "ireland": "LANG380",
    "israel": "LANG381",
    "italy": "LANG388",
    "japan": "LANG392",
    "jordan": "LANG391",
    "kazakhstan": "LANG403",
    "kuwait": "LANG401",
    "latvia": "LANG414",
    "lebanon": "LANG405",
    "luxembourg": "LANG413",
    "macao": "LANG428",
    "malaysia": "LANG438",
    "malta": "LANG433",
    "mexico": "LANG437",
    "morocco": "LANG416",
    "netherlands": "LANG446",
    "newzealand": "LANG452",
    "nigeria": "LANG444",
    "norway": "LANG447",
    "oman": "LANG453",
    "pakistan": "LANG459",
    "peru": "LANG455",
    "philippines": "LANG458",
    "poland": "LANG460",
    "portugal": "LANG465",
    "romania": "LANG474",
    "russia": "LANG476",
    "saudiarabia": "LANG478",
    "singapore": "LANG483",
    "slovakia": "LANG487",
    "slovenia": "LANG485",
    "southafrica": "LANG537",
    "southkorea": "LANG400",
    "spain": "LANG346",
    "sweden": "LANG482",
    "switzerland": "LANG319",
    "syria": "LANG497",
    "taiwan": "LANG513",
    "tbr21": "LANG1728",
    "thailand": "LANG503",
    "uae": "LANG276",
    "uk": "LANG355",
    "yemen": "LANG535"
}

const defaultValue = {
    'fxo_opermode': 'usa',
    'fxs_opermode': 'usa',
    'fxs_override_tiss': 0,
    'alawoverride': '0',
    'boostringer': '0',
    'fastringer': '0',
    'lowpower': '0',
    'fwringdetect': '0',
    'fxs_mwisendtype': '0'
}
class AnalogHardware extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tonezoneList: [],
            opermodeList: []
        }
    }
    componentDidMount() {
        this._listToneZone()
        this._listOpermode()
    }
    componentWillUnmount() {

    }
    _setDefaultVal = (formValue) => {
        const { setFieldsValue } = this.props.form
        if (formValue === 'fxo_opermode') {
             setFieldsValue({
                fxo_opermode: 'USA'
            })
        } else if (formValue === 'fxs_opermode') {
            setFieldsValue({
                fxs_opermode: 'USA'
            })
        } else if (formValue === 'fxs_override_tiss') {
            setFieldsValue({
                fxs_override_tiss: 0
            })
            this.props.updateTiss(false)
        } else if (formValue === 'alawoverride') {
            setFieldsValue({
                alawoverride: '0'
            })
        } else if (formValue === 'boostringer') {
            setFieldsValue({
                boostringer: '0'
            })
        } else if (formValue === 'fastringer') {
            setFieldsValue({
                fastringer: '0'
            })
        } else if (formValue === 'lowpower') {
            setFieldsValue({
                lowpower: '0'
            })
        } else if (formValue === 'fwringdetect') {
            setFieldsValue({
                fwringdetect: '0'
            })
        } else if (formValue === 'fxs_mwisendtype') {
            setFieldsValue({
                fxs_mwisendtype: 'fsk'
            })
        }
    }
    _listToneZone = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listAllToneZoneSettings',
                options: 'description,country',
                sidx: 'description',
                fxs_surpport: 1
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tonezoneList = response.CountryTone

                    this.setState({
                        tonezoneList: tonezoneList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listOpermode = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listAllOpermodeSettings',
                sidx: 'country_description'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const opermodeList = response.CountryOpermode

                    this.setState({
                        opermodeList: opermodeList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onChangeTiss = (e) => {
        this.props.updateTiss(e.target.checked)
    }
    _edit = (record) => {
        browserHistory.push('/pbx-settings/interfaceSettings/analogHardwareItem/' + record.mode)
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 }
        }
        const hardware_global_settings = this.props.hardware_global_settings
        const fxsTissShow = this.props.fxsTissShow
        let hardwareList = [{'mode': 'fxs'}, {'mode': 'fxo'}]

        const columns = [{
                key: 'mode',
                dataIndex: 'mode',
                title: formatMessage({id: "LANG84"}),
                render: (text, record, index) => {
                    if (record.mode === 'fxs') {
                        return <div>
                            <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG562"}, {0: formatMessage({id: "LANG1725"})}) }}></span>
                        </div>
                    } else if (record.mode === 'fxo') {
                         return <div>
                            <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG562"}, {0: formatMessage({id: "LANG1724"})}) }}></span>
                        </div>
                    }
                }
            }, {
                key: 'port',
                dataIndex: 'port',
                title: formatMessage({id: "LANG237"}),
                render: (text, record, index) => {
                    const fxoChansNum = Number(JSON.parse(localStorage.getItem('model_info')).num_fxo)
                    const fxsChansNum = Number(JSON.parse(localStorage.getItem('model_info')).num_fxs)
                    let fxoChans = [],
                        fxsChans = []

                    for (let i = 1; i <= fxoChansNum; i++) {
                        fxoChans.push(i)
                    }

                    for (let i = 1; i <= fxsChansNum; i++) {
                        fxsChans.push(i)
                    }
                    if (record.mode === 'fxs') {
                        return <div>
                            <span>{ fxsChans.join(',') }</span>
                        </div>
                    } else if (record.mode === 'fxo') {
                         return <div>
                            <span>{ fxoChans.join(',') }</span>
                        </div>
                    }
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"}) }
                                onClick={ this._edit.bind(this, record) }>
                            </span>
                        </div>
                }
            }]
        return (
            <div className="content">
                <Table
                    rowKey="mode"
                    columns={ columns }
                    pagination={ false }
                    dataSource={ hardwareList }
                    showHeader={ !!hardwareList.length }
                />
                <Form>
                    <FormItem
                        ref="div_fxs_tonezone"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1722" />}>
                                <span>{formatMessage({id: "LANG1723"})}</span>
                            </Tooltip>
                        )}>
                        <Col span={12}>
                        { getFieldDecorator('fxs_tonezone', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.fxs_tonezone
                        })(
                            <Select>
                                {
                                    this.state.tonezoneList.map(function(item) {
                                        return <Option
                                                key={ item.country }
                                                value={ item.country }>
                                                { formatMessage({id: nation2langObj[item.country.toLowerCase()]}) }
                                            </Option>
                                        }
                                    ) 
                                }
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                </Form>
                <div className="section-title">
                    <span>{ formatMessage({id: "LANG542"}) }</span>
                </div>
                <Form>
                    <FormItem
                        ref="div_fxo_opermode"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1705" />}>
                                <span>{formatMessage({id: "LANG1704"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'fxo_opermode') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={12}>
                        { getFieldDecorator('fxo_opermode', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.fxo_opermode
                        })(
                            <Select>
                                {
                                    this.state.opermodeList.map(function(item) {
                                        return <Option
                                                key={ item.opermode }
                                                value={ item.opermode }>
                                                { formatMessage({id: country2lngObj[item.opermode.toLowerCase()]}) }
                                            </Option>
                                        }
                                    ) 
                                }
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                    <FormItem
                        ref="div_fxs_opermode"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1705" />}>
                                <span>{formatMessage({id: "LANG1708"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'fxs_opermode') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={12}>
                        { getFieldDecorator('fxs_opermode', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.fxs_opermode
                        })(
                            <Select>
                                {
                                    this.state.opermodeList.map(function(item) {
                                        return <Option
                                                key={ item.opermode }
                                                value={ item.opermode }>
                                                { formatMessage({id: country2lngObj[item.opermode.toLowerCase()]}) }
                                            </Option>
                                        }
                                    ) 
                                }
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                    <FormItem
                        ref="div_fxs_override_tiss"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1720" />}>
                                <span>{formatMessage({id: "LANG1721"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'fxs_override_tiss') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={3}>
                            { getFieldDecorator('fxs_override_tiss', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            valuePropName: 'checked',
                            initialValue: hardware_global_settings.fxs_override_tiss === 1
                            })(
                                <Checkbox onChange={ this._onChangeTiss }/>
                            )}
                        </Col>
                        <Col span={9} className={ fxsTissShow ? 'display-block' : 'hidden'}>
                        { getFieldDecorator('fxs_tiss', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.fxs_tiss + ''
                        })(
                            <Select>
                                <Option value="0">600 &Omega;</Option>
                                <Option value="1">900 &Omega;</Option>
                                <Option value="2">600 &Omega; + 1 μF</Option>
                                <Option value="3">900 &Omega; + 2.16 μF</Option>
                                <Option value="4">270 &Omega; + (750 &Omega; || 150 nF)</Option>
                                <Option value="5">220 &Omega; + (820 &Omega; || 120 nF)</Option>
                                <Option value="6">220 &Omega; + (820 &Omega; || 115 nF)</Option>
                                <Option value="7">200 &Omega; + (680 &Omega; || 100 nF)</Option>
                                <Option value="8">370 &Omega; + (620 &Omega; || 310 nF)</Option>
                                <Option value="9">120 &Omega; + (820 &Omega; || 110 nF)</Option>
                                <Option value="10">350 &Omega; + (1000 &Omega; || 210 nF)</Option>
                                <Option value="11">275 &Omega; + (780 &Omega; || 115 nF)</Option>
                                <Option value="12">320 &Omega; + (1050 &Omega; || 230 nF)</Option>
                                <Option value="13">370 &Omega; + (820 &Omega; || 110 nF)</Option>
                                <Option value="14">600 &Omega; + 2.16μF</Option>
                                <Option value="15">900 &Omega; + 1μF</Option>
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                    <FormItem
                        ref="div_alawoverride"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1717" />}>
                                <span>{formatMessage({id: "LANG1716"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'alawoverride') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={12}>
                        { getFieldDecorator('alawoverride', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.alawoverride + ''
                        })(
                            <Select>
                                <Option value="0">PCMU</Option>
                                <Option value="1">PCMA</Option>
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                    <FormItem
                        ref="div_boostringer"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1693" />}>
                                <span>{formatMessage({id: "LANG1692"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'boostringer') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={12}>
                        { getFieldDecorator('boostringer', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.boostringer + ''
                        })(
                            <Select>
                                <Option value="0">{ formatMessage({id: "LANG544"}) }</Option>
                                <Option value="1">{ formatMessage({id: "LANG1733"}) }</Option>
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                    <FormItem
                        ref="div_fastringer"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1703" />}>
                                <span>{formatMessage({id: "LANG1702"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'fastringer') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={12}>
                        { getFieldDecorator('fastringer', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.fastringer + ''
                        })(
                            <Select>
                                <Option value="0">{ formatMessage({id: "LANG544"}) }</Option>
                                <Option value="1">{ formatMessage({id: "LANG1734"}) }</Option>
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                    <FormItem
                        ref="div_lowpower"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1711" />}>
                                <span>{formatMessage({id: "LANG1710"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'lowpower') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={12}>
                        { getFieldDecorator('lowpower', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.lowpower + ''
                        })(
                            <Select>
                                <Option value="0">{ formatMessage({id: "LANG544"}) }</Option>
                                <Option value="1">{ formatMessage({id: "LANG1735"}) }</Option>
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                    <FormItem
                        ref="div_fwringdetect"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1719" />}>
                                <span>{formatMessage({id: "LANG1718"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'fwringdetect') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={12}>
                        { getFieldDecorator('fwringdetect', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.fwringdetect + ''
                        })(
                            <Select>
                                <Option value="0">{ formatMessage({id: "LANG545"}) }</Option>
                                <Option value="1">{ formatMessage({id: "LANG1736"}) }</Option>
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                    <FormItem
                        ref="div_fxs_mwisendtype"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG2622" />}>
                                <span>{formatMessage({id: "LANG2621"})}</span>
                            </Tooltip>
                        )}>
                        <Col lg={ 8 } xl={ 6 } >
                            <Button icon="settings" type="primary" size="default" onClick={ this._setDefaultVal.bind(this, 'fxs_mwisendtype') }>
                                { formatMessage({id: "LANG257"}) }
                            </Button>
                        </Col>
                        <Col span={12}>
                        { getFieldDecorator('fxs_mwisendtype', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: hardware_global_settings.fxs_mwisendtype
                        })(
                            <Select>
                                <Option value="fsk">{ formatMessage({id: "LANG1737"}) }</Option>
                                <Option value="neon">{ formatMessage({id: "LANG1738"}) }</Option>
                            </Select>
                        ) }
                        </Col>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

module.exports = injectIntl(AnalogHardware)
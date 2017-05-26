'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import Validator from "../../api/validator"
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Button, message, Modal, Table, Card, Select, Form, Input, Tooltip, Checkbox, BackTop, Col } from 'antd'

const confirm = Modal.confirm
const Option = Select.Option
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const Search = Input.Search

class SystemLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            staticSwitch: [],
            staticSwitchAll: [],
            dynamicSwitch: [],
            dynamicSwitchList: [],
            logServer: {},
            syslog_server: "",
            syslog_enable: "",
            syslog_interval: "",
            logSwitch: {},
            plainOptions: [],
            plainOptions_dynamic: [],
            logSwitchList: [],
            switchAll: false,
            dynamicAll: false,
            selectedRowKeys: [],
            searchText: '',
            filterDropdownVisible: false
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _onChangeLevel = (record, level, e) => {
        let staticSwitch = this.state.staticSwitch
        let staticSwitchAll = this.state.staticSwitchAll

        if (record.id === 0) {
            if (level === 'ERROR') {
                staticSwitch.map(function(item, index) {
                    staticSwitch[index].ERROR = e.target.checked ? '1' : '0'
                })
                staticSwitchAll.map(function(item, index) {
                    staticSwitchAll[index].ERROR = e.target.checked ? '1' : '0'
                })
            } else if (level === 'WARN') {
                staticSwitch.map(function(item, index) {
                    staticSwitch[index].WARN = e.target.checked ? '1' : '0'
                })
                staticSwitchAll.map(function(item, index) {
                    staticSwitchAll[index].WARN = e.target.checked ? '1' : '0'
                })
            } else if (level === 'NOTIC') {
                staticSwitch.map(function(item, index) {
                    staticSwitch[index].NOTIC = e.target.checked ? '1' : '0'
                })
                staticSwitchAll.map(function(item, index) {
                    staticSwitchAll[index].NOTIC = e.target.checked ? '1' : '0'
                })
            } else if (level === 'DEBUG') {
                staticSwitch.map(function(item, index) {
                    staticSwitch[index].DEBUG = e.target.checked ? '1' : '0'
                })
                staticSwitchAll.map(function(item, index) {
                    staticSwitchAll[index].DEBUG = e.target.checked ? '1' : '0'
                })
            } else if (level === 'VERB') {
                staticSwitch.map(function(item, index) {
                    staticSwitch[index].VERB = e.target.checked ? '1' : '0'
                })
                staticSwitchAll.map(function(item, index) {
                    staticSwitchAll[index].VERB = e.target.checked ? '1' : '0'
                })
            }
        } else {
            if (level === 'ERROR') {
                staticSwitch.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitch[index].ERROR = e.target.checked ? '1' : '0'
                    }
                })
                staticSwitchAll.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitchAll[index].ERROR = e.target.checked ? '1' : '0'
                    }
                })
            } else if (level === 'WARN') {
                staticSwitch.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitch[index].WARN = e.target.checked ? '1' : '0'
                    }
                })
                staticSwitchAll.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitchAll[index].WARN = e.target.checked ? '1' : '0'
                    }
                })
            } else if (level === 'NOTIC') {
                staticSwitch.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitch[index].NOTIC = e.target.checked ? '1' : '0'
                    }
                })
                staticSwitchAll.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitchAll[index].NOTIC = e.target.checked ? '1' : '0'
                    }
                })
            } else if (level === 'DEBUG') {
                staticSwitch.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitch[index].DEBUG = e.target.checked ? '1' : '0'
                    }
                })
                staticSwitchAll.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitchAll[index].DEBUG = e.target.checked ? '1' : '0'
                    }
                })
            } else if (level === 'VERB') {
                staticSwitch.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitch[index].VERB = e.target.checked ? '1' : '0'
                    }
                })
                staticSwitchAll.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitchAll[index].VERB = e.target.checked ? '1' : '0'
                    }
                })
            } else if (level === 'ALL') {
                staticSwitch.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitch[index].ERROR = e.target.checked ? '1' : '0'
                        staticSwitch[index].WARN = e.target.checked ? '1' : '0'
                        staticSwitch[index].NOTIC = e.target.checked ? '1' : '0'
                        staticSwitch[index].DEBUG = e.target.checked ? '1' : '0'
                        staticSwitch[index].VERB = e.target.checked ? '1' : '0'
                    }
                })
                staticSwitchAll.map(function(item, index) {
                    if (item.id === record.id) {
                        staticSwitchAll[index].ERROR = e.target.checked ? '1' : '0'
                        staticSwitchAll[index].WARN = e.target.checked ? '1' : '0'
                        staticSwitchAll[index].NOTIC = e.target.checked ? '1' : '0'
                        staticSwitchAll[index].DEBUG = e.target.checked ? '1' : '0'
                        staticSwitchAll[index].VERB = e.target.checked ? '1' : '0'
                    }
                })
            }
        }
        
        this.setState({
            staticSwitch: staticSwitch
        })
    }
    _onChangeDynamic = (record, e) => {
        let dynamicSwitch = this.state.dynamicSwitch
        if (record.id === 0) {
            dynamicSwitch.map(function(item, index) {
                dynamicSwitch[index].switch = e.target.checked ? '1' : '0'
            })
        } else {
            dynamicSwitch.map(function(item, index) {
                if (item.id === record.id) {
                    dynamicSwitch[index].switch = e.target.checked ? '1' : '0'
                }
            })
        }
        this.setState({
            dynamicSwitch: dynamicSwitch
        })
    }
    _createID = (text, record, index) => {
        const { getFieldDecorator } = this.props.form
        if (record.id === 0) {
            return <span></span>
        } else {
            let checkOneAll = false
            if (record.ERROR === '1' &&
                record.WARN === '1' &&
                record.NOTIC === '1' &&
                record.DEBUG === '1' &&
                record.VERB === '1') {
                checkOneAll = true
            }
            return <div>
                <Checkbox checked={ checkOneAll } onChange={ this._onChangeLevel.bind(this, record, 'ALL') } />
            </div>
        }
    }
    _createError = (text, record, index) => {
        const staticSwitch = this.state.staticSwitch
        let isChecked = true
        if (record.id === 0) {
            staticSwitch.map(function(item) {
                if (item.ERROR === '0' && item.id !== 0) {
                    isChecked = false
                }
            })
        } else {
            isChecked = record.ERROR === '1'
        }
        return <div>
            <Checkbox checked={ isChecked } onChange={ this._onChangeLevel.bind(this, record, 'ERROR') } />
        </div>
    }
    _createWarn = (text, record, index) => {
        const staticSwitch = this.state.staticSwitch
        let isChecked = true
        if (record.id === 0) {
            staticSwitch.map(function(item) {
                if (item.WARN === '0' && item.id !== 0) {
                    isChecked = false
                }
            })
        } else {
            isChecked = record.WARN === '1'
        }
        return <div>
            <Checkbox checked={ isChecked } onChange={ this._onChangeLevel.bind(this, record, 'WARN') } />
        </div>
    }
    _createNotice = (text, record, index) => {
        const staticSwitch = this.state.staticSwitch
        let isChecked = true
        if (record.id === 0) {
            staticSwitch.map(function(item) {
                if (item.NOTIC === '0' && item.id !== 0) {
                    isChecked = false
                }
            })
        } else {
            isChecked = record.NOTIC === '1'
        }
        return <div>
            <Checkbox checked={ isChecked } onChange={ this._onChangeLevel.bind(this, record, 'NOTIC') } />
        </div>
    }
    _createDebug = (text, record, index) => {
        const staticSwitch = this.state.staticSwitch
        let isChecked = true
        if (record.id === 0) {
            staticSwitch.map(function(item) {
                if (item.DEBUG === '0' && item.id !== 0) {
                    isChecked = false
                }
            })
        } else {
            isChecked = record.DEBUG === '1'
        }
        return <div>
            <Checkbox checked={ isChecked } onChange={ this._onChangeLevel.bind(this, record, 'DEBUG') } />
        </div>
    }
    _createVerb = (text, record, index) => {
        const staticSwitch = this.state.staticSwitch
        let isChecked = true
        if (record.id === 0) {
            staticSwitch.map(function(item) {
                if (item.VERB === '0' && item.id !== 0) {
                    isChecked = false
                }
            })
        } else {
            isChecked = record.VERB === '1'
        }
        return <div>
            <Checkbox checked={ isChecked } onChange={ this._onChangeLevel.bind(this, record, 'VERB') } />
        </div>
    }
    _createDynamicSwitch = (text, record, index) => {
        const dynamicSwitch = this.state.dynamicSwitch
        let isChecked = true
        if (record.id === 0) {
            dynamicSwitch.map(function(item) {
                if (item.switch === '0' && item.id !== 0) {
                    isChecked = false
                }
            })
        } else {
            isChecked = record.switch === '1'
        }
        return <div>
            <Checkbox checked={ isChecked } onChange={ this._onChangeDynamic.bind(this, record) } />
        </div>
    }
    _download = (fileName) => {
        window.open("/cgi?action=downloadFile&type=syslog")
    }
    _clean = () => {
        const { formatMessage } = this.props.intl
        $.ajax({
            url: api.apiHost,
            data: {
                action: "removeFile",
                type: "syslog"
            },
            type: "POST",
            dataType: "json",
            async: false,
            success: function(res) {
                var status = res.hasOwnProperty('status') ? res.status : null,
                    existed = false

                if (status === 0) {
                    if (res.response.result === 0) {
                        message.success(formatMessage({id: "LANG871"}))
                    } else {
                        message.error(formatMessage({id: "LANG2684"}))
                    }
                } else {
                    message.error(formatMessage({id: "LANG2684"}))
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let logServer = this.state.logServer
        let dynamicSwitch = []
        let dynamicSwitchList = []
        let staticSwitch = []
        let logSwitch = []
        let logSwitchList = []
        let switchAll = false
        let dynamicAll = false
        let syslog_server = this.state.syslog_server
        let syslog_enable = this.state.syslog_enable
        let syslog_interval = this.state.syslog_interval
        const plainOptions = [{
                label: formatMessage({id: "LANG5142"}),
                value: 'cdrapi'
            }, {
                label: formatMessage({id: "LANG5143"}),
                value: 'pbxmid'
            }, {
                label: formatMessage({id: "LANG5144"}),
                value: 'apply_python'
            }, {
                label: formatMessage({id: "LANG5145"}),
                value: 'cgi'
            }, {
                label: formatMessage({id: "LANG2581"}),
                value: 'warning'
            }, {
                label: formatMessage({id: "LANG5189"}),
                value: 'zeroconfig'
            }, {
                label: formatMessage({id: "LANG5621"}),
                value: 'other_logger'
            }]
        const plainOptions_dynamic = [{
                label: 'DTMF',
                value: 'DTMF'
            }, {
                label: 'CC',
                value: 'CC'
            }, {
                label: 'FAX',
                value: 'FAX'
            }, {
                label: 'SECURITY',
                value: 'SECURITY'
            }]

        $.ajax({
            url: api.apiHost + 'action=getSyslogValue&syslog-server&syslogbk_interval&syslogbk_enabled',
            method: 'GET',
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    logServer = response || []
                    syslog_server = logServer['syslog-server']
                    syslog_enable = logServer['syslogbk_enabled']
                    syslog_interval = logServer['syslogbk_interval']
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
                action: 'listLogSwitchDynamic',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tmpDynamicSwitch = response.log_switch_dynamic || []
                    dynamicSwitch.push({
                        dlevel: formatMessage({id: "LANG4160"}),
                        id: 0,
                        switch: '0'
                    })
                    tmpDynamicSwitch.map(function(item) {
                        dynamicSwitch.push({
                            dlevel: item.dlevel,
                            id: item.id,
                            switch: item.switch
                        })
                        if (item.switch === '1') {
                            dynamicSwitchList.push(item.dlevel)
                        }
                    })
                    if (dynamicSwitchList.length === 4) {
                        dynamicAll = true
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
                action: 'listLogSwitchStatic',
                sidx: 'module_name',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tmpStaticSwitch = response.log_switch_static || []
                    staticSwitch.push({
                        id: 0,
                        module_name: formatMessage({id: "LANG4160"}),
                        ERROR: '0',
                        WARN: '0',
                        NOTIC: '0',
                        DEBUG: '0',
                        VERB: '0'
                    })
                    tmpStaticSwitch.map(function(item) {
                        staticSwitch.push({
                            id: item.id,
                            module_name: item.module_name,
                            ERROR: item.ERROR,
                            WARN: item.WARN,
                            NOTIC: item.NOTIC,
                            DEBUG: item.DEBUG,
                            VERB: item.VERB
                        })
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
                action: 'getLogSwitch'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    logSwitch = response || {}
                    if (logSwitch.cdrapi === '1') {
                        logSwitchList.push('cdrapi')
                    }
                    if (logSwitch.pbxmid === '1') {
                        logSwitchList.push('pbxmid')
                    }
                    if (logSwitch.apply_python === '1') {
                        logSwitchList.push('apply_python')
                    }
                    if (logSwitch.cgi === '1') {
                        logSwitchList.push('cgi')
                    }
                    if (logSwitch.warning === '1') {
                        logSwitchList.push('warning')
                    }
                    if (logSwitch.zeroconfig === '1') {
                        logSwitchList.push('zeroconfig')
                    }
                    if (logSwitch.other_logger === '1') {
                        logSwitchList.push('other_logger')
                    }
                    if (logSwitchList.length === 6) {
                        switchAll = true
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        const staticSwitchAll = _.clone(staticSwitch)
        this.setState({
            logServer: logServer,
            dynamicSwitch: dynamicSwitch,
            dynamicSwitchList: dynamicSwitchList,
            staticSwitch: staticSwitch,
            logSwitch: logSwitch,
            logSwitchList: logSwitchList,
            plainOptions: plainOptions,
            plainOptions_dynamic: plainOptions_dynamic,
            switchAll: switchAll,
            staticSwitchAll: staticSwitchAll,
            dynamicAll: dynamicAll,
            syslog_server: syslog_server,
            syslog_enable: syslog_enable,
            syslog_interval: syslog_interval
        })
    }
    _onChangeSyslogbk = (e) => {
        let logServer = this.state.logServer || {}

        if (e.target.checked) {
            logServer.syslogbk_enabled = '1'
        } else {
            logServer.syslogbk_enabled = '0'
        }
        this.setState({
            logServer: logServer
        })
    }
    _onChangeSwitch = (checkedList) => {
        const plainOptions = this.state.plainOptions
        const { formatMessage } = this.props.intl
        const __this = this
        
        if (_.indexOf(this.state.logSwitchList, "cgi") < 0 || _.indexOf(checkedList, "cgi") > -1) {
            this.setState({
                logSwitchList: checkedList,
                switchAll: checkedList.length === plainOptions.length
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5605"})}} ></span>,
                onOk() {
                    __this.setState({
                        logSwitchList: checkedList,
                        switchAll: checkedList.length === plainOptions.length
                    })
                },
                onCancel() {
                    checkedList.push('cgi')
                    __this.setState({
                        logSwitchList: checkedList,
                        switchAll: checkedList.length === plainOptions.length
                    })
                },
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _onChangeSwitchAll = (e) => {
        const { formatMessage } = this.props.intl
        const plainOptions = this.state.plainOptions
        const logSwitchList = this.state.logSwitchList
        const __this = this

        let checkedList = []

        if (e.target.checked === false && _.indexOf(logSwitchList, 'cgi') > -1) {
            Modal.confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5605"})}} ></span>,
                onOk() {
                    plainOptions.map(function(item) {
                        checkedList.push(item.value)
                    })
                    __this.setState({
                        logSwitchList: e.target.checked ? checkedList : [],
                        switchAll: e.target.checked
                    })
                },
                onCancel() {

                },
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            plainOptions.map(function(item) {
                checkedList.push(item.value)
            })
            this.setState({
                logSwitchList: e.target.checked ? checkedList : [],
                switchAll: e.target.checked
            })
        }
    }
    _onChangeDynamic = (checkedList) => {
        const { formatMessage } = this.props.intl
        const plainOptions = this.state.plainOptions_dynamic
        const __this = this
        if (_.indexOf(this.state.dynamicSwitchList, "SECURITY") < 0 || _.indexOf(checkedList, "SECURITY") > -1) {
            this.setState({
                dynamicSwitchList: checkedList,
                dynamicAll: checkedList.length === plainOptions.length
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2997"})}} ></span>,
                onOk() {
                    __this.setState({
                        dynamicSwitchList: checkedList,
                        dynamicAll: checkedList.length === plainOptions.length
                    })
                },
                onCancel() {
                    checkedList.push('SECURITY')
                    __this.setState({
                        dynamicSwitchList: checkedList,
                        dynamicAll: checkedList.length === plainOptions.length
                    })
                },
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _onChangeDynamicAll = (e) => {
        const { formatMessage } = this.props.intl
        const plainOptions = this.state.plainOptions_dynamic
        const dynamicSwitchList = this.state.dynamicSwitchList
        const __this = this
        let checkedList = []

        if (e.target.checked === false && _.indexOf(dynamicSwitchList, 'SECURITY') > -1) {
            Modal.confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2997"})}} ></span>,
                onOk() {
                    plainOptions.map(function(item) {
                        checkedList.push(item.value)
                    })
                    __this.setState({
                        dynamicSwitchList: e.target.checked ? checkedList : [],
                        dynamicAll: e.target.checked
                    })
                },
                onCancel() {

                },
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            plainOptions.map(function(item) {
                checkedList.push(item.value)
            })
            this.setState({
                dynamicSwitchList: e.target.checked ? checkedList : [],
                dynamicAll: e.target.checked
            })
        }
    }
    _handleCancel = () => {
        // browserHistory.push('/maintenance/systemLog')
        this.props.form.resetFields()
        this._getInitData()
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        const staticSwitchAll = this.state.staticSwitchAll
        const dynamicSwitch = this.state.dynamicSwitch
        const logSwitchList = this.state.logSwitchList
        const loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        const errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG962" })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                message.loading(loadingMessage)
                console.log('Received values of form: ', values)
                let ret = true
                let action_syslog = {}
                let action_static = {}
                let action_dynamic = {}
                let action_logswitch = {}
                action_syslog.action = 'setSyslogValue'
                action_syslog['syslog-server'] = values['syslog-server']
                action_syslog.syslogbk_enabled = values.syslogbk_enabled ? '1' : '0'
                action_syslog.syslogbk_interval = values.syslogbk_interval

                action_static.action = 'updateLogSwitchStatic'
                action_static.ERROR = ''
                action_static.WARN = ''
                action_static.NOTIC = ''
                action_static.VERB = ''
                action_static.DEBUG = ''
                let static_data = []
                staticSwitchAll.map(function(item) {
                    if (item.id !== 0) {
                        let itemData = []
                        itemData.push(item.id)
                        itemData.push(parseInt(item.ERROR))
                        itemData.push(parseInt(item.WARN))
                        itemData.push(parseInt(item.NOTIC))
                        itemData.push(parseInt(item.DEBUG))
                        itemData.push(parseInt(item.VERB))
                        static_data.push(itemData)
                    }
                })
                action_static.log_switch_static = JSON.stringify({
                            "SCHEMA": ["id", "ERROR", "WARN", "NOTIC", "DEBUG", "VERB"],
                            "TYPE": ["INT", "INT", "INT", "INT", "INT", "INT"],
                            "data": static_data
                        })

                action_dynamic.action = 'updateLogSwitchDynamic'
                action_dynamic.switch = ''
                let dynamic_data = []
                let plainOptions_dynamic = this.state.plainOptions_dynamic
                let dynamicSwitchList = this.state.dynamicSwitchList
                plainOptions_dynamic.map(function(item, index) {
                    let itemData = []
                    if (($.inArray(item.value, dynamicSwitchList) > -1)) {
                        itemData.push(index + 1)
                        itemData.push(1)
                    } else {
                        itemData.push(index + 1)
                        itemData.push(0)
                    }
                    dynamic_data.push(itemData)
                })
                action_dynamic.log_switch_dynamic = JSON.stringify({
                            "SCHEMA": ["id", "switch"],
                            "TYPE": ["INT", "INT"],
                            "data": dynamic_data
                        })

                action_logswitch.action = 'setLogSwitch'
                action_logswitch.cdrapi = '0'
                action_logswitch.pbxmid = '0'
                action_logswitch.apply_python = '0'
                action_logswitch.cgi = '0'
                action_logswitch.warning = '0'
                action_logswitch.zeroconfig = '0'
                action_logswitch.other_logger = '0'
                logSwitchList.map(function(item) {
                    action_logswitch[item] = '1'
                })

                if (ret) {
                    $.ajax({
                        url: api.apiHost,
                        data: action_syslog,
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        error: function(e) {
                            message.error(e.statusText)
                            ret = false
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)
                            } else {
                                message.destroy()
                                message.error(errorMessage)
                                ret = false
                            }
                        }.bind(this)
                    })
                }

                if (ret) {
                    $.ajax({
                        url: api.apiHost,
                        data: action_static,
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        error: function(e) {
                            message.error(e.statusText)
                            ret = false
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)
                            } else {
                                message.destroy()
                                message.error(errorMessage)
                                ret = false
                            }
                        }.bind(this)
                    })
                }

                if (ret) {
                    $.ajax({
                        url: api.apiHost,
                        data: action_dynamic,
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        error: function(e) {
                            message.error(e.statusText)
                            ret = false
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)
                            } else {
                                message.destroy()
                                message.error(errorMessage)
                                ret = false
                            }
                        }.bind(this)
                    })
                }

                if (ret) {
                    $.ajax({
                        url: api.apiHost,
                        data: action_logswitch,
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        error: function(e) {
                            message.error(e.statusText)
                            ret = false
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)
                            } else {
                                message.destroy()
                                message.error(errorMessage)
                                ret = false
                            }
                        }.bind(this)
                    })
                }
                if (ret) {
                    const newSyslogServer = values['syslog-server']
                    const newSyslogbkEnabled = values.syslogbk_enabled ? '1' : '0'
                    const newSyslogbkInterval = values.syslogbk_interval
                    const oldSyslogServer = this.state.syslog_server
                    const oldSyslogbkEnabled = this.state.syslog_enable
                    const oldSyslogbkInterval = this.state.syslog_interval
                    if (newSyslogServer !== oldSyslogServer ||
                        newSyslogbkEnabled !== oldSyslogbkEnabled ||
                        newSyslogbkInterval !== oldSyslogbkInterval) {
                        $.ajax({
                            url: api.apiHost,
                            data: {
                                "action": "restartSyslog",
                                "syslog-restart": ""
                            },
                            type: 'POST',
                            dataType: 'json',
                            async: false,
                            error: function(e) {
                                message.error(e.statusText)
                                ret = false
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                if (bool) {
                                    message.destroy()
                                    message.success(successMessage)
                                    this.setState({
                                        syslog_server: newSyslogServer,
                                        syslog_enable: newSyslogbkEnabled,
                                        syslog_interval: newSyslogbkInterval
                                    })
                                } else {
                                    message.destroy()
                                    message.error(errorMessage)
                                    ret = false
                                }
                            }.bind(this)
                        })
                    }
                }
            }
        })
    }
    _onInputChange = (e) => {
        this.setState({
            searchText: e.target.value
        })
    }
    _onSearch = () => {
        const { searchText } = this.state
        const reg = new RegExp(searchText, 'gi')
        let staticSwitch = this.state.staticSwitch
        let staticSwitchAll = this.state.staticSwitchAll
        this.setState({
            filterDropdownVisible: false,
            staticSwitch: staticSwitchAll.map((record) => {
                const match = record.module_name.match(reg)
                if (!match) {
                  return null
                }
            return {
                ...record,
                module_name: (
                    <span>
                        {record.module_name.split(reg).map((text, i) => (
                            i > 0 ? [<span className="highlight">{match[0]}</span>, text] : text
                        ))}
                    </span>
                )
            }
          }).filter(record => !!record)
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const { getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const columns_dynamic = [{
                key: 'dlevel',
                dataIndex: 'dlevel',
                title: formatMessage({id: "LANG4161"}),
                width: 150
            }, {
                key: 'switch',
                dataIndex: 'switch',
                title: formatMessage({id: "LANG4162"}),
                width: 150,
                render: (text, record, index) => (
                    this._createDynamicSwitch(text, record, index)
                )
            }]
        const columns = [{
                key: 'module_name',
                dataIndex: 'module_name',
                title: formatMessage({id: "LANG4159"}),
                filterDropdown: (
                    <div className="custom-filter-dropdown">
                        <Input
                            placeholder={ formatMessage({id: "LANG803"}) + formatMessage({id: "LANG4159"}) }
                            value={ this.state.searchText }
                            onChange={ this._onInputChange }
                            onPressEnter={ this._onSearch }
                        />
                        <Button type="primary" onClick={ this._onSearch }>{ formatMessage({id: "LANG803"}) }</Button>
                    </div>
                ),
                filterDropdownVisible: this.state.filterDropdownVisible,
                onFilterDropdownVisibleChange: visible => this.setState({ filterDropdownVisible: visible }),
                width: 150
            }, {
                key: 'id',
                dataIndex: 'id',
                title: formatMessage({id: "LANG4158"}),
                width: 150,
                render: (text, record, index) => (
                    this._createID(text, record, index)
                )
            }, {
                key: 'ERROR',
                dataIndex: 'ERROR',
                title: <span>Error</span>,
                width: 150,
                render: (text, record, index) => (
                    this._createError(text, record, index)
                )
            }, {
                key: 'WARN',
                dataIndex: 'WARN',
                title: <span>Warn</span>,
                width: 150,
                render: (text, record, index) => (
                    this._createWarn(text, record, index)
                )
            }, {
                key: 'NOTIC',
                dataIndex: 'NOTIC',
                title: <span>Notice</span>,
                width: 150,
                render: (text, record, index) => (
                    this._createNotice(text, record, index)
                )
            }, {
                key: 'DEBUG',
                dataIndex: 'DEBUG',
                title: <span>Debug</span>,
                width: 150,
                render: (text, record, index) => (
                    this._createDebug(text, record, index)
                )
            }, {
                key: 'VERB',
                dataIndex: 'VERB',
                title: <span>Verbose</span>,
                width: 150,
                render: (text, record, index) => (
                    this._createVerb(text, record, index)
                )
            }]

        const pagination = {
                total: this.state.staticSwitch.length,
                showSizeChanger: true,
                showQuickJumper: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                },
                size: 'small'
            }

        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }
        const checkedList = this.state.logSwitchList
        const plainOptions = this.state.plainOptions
        const checkedList_dynamic = this.state.dynamicSwitchList 
        const plainOptions_dynamic = this.state.plainOptions_dynamic

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG67"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG67"}) }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel } 
                    isDisplay= "display-block"
                />
                <div className="content">
                    <div className="section-title">
                        <p><span>
                                { formatMessage({id: "LANG661" })}
                            </span>
                        </p>
                    </div>
                    <Form id="systemLog-form">
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1556" />}>
                                    <span>{formatMessage({id: "LANG1556"})}</span>
                                </Tooltip>
                            )}
                        >
                            {getFieldDecorator('syslog-server', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.host(data, value, callback, formatMessage, formatMessage({id: "LANG1395"})) 
                                    }
                                }],
                                width: 100,
                                initialValue: this.state.logServer['syslog-server']
                            })(
                                <Input maxLength='255' />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5250" />}>
                                    <span>{formatMessage({id: "LANG5249"})}</span>
                                </Tooltip>
                            )}
                        >
                            {getFieldDecorator('syslogbk_enabled', {
                                rules: [],
                                valuePropName: 'checked',
                                width: 100,
                                initialValue: this.state.logServer.syslogbk_enabled === '1'
                            })(
                                <Checkbox onChange={ this._onChangeSyslogbk } />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5252" />}>
                                    <span>{formatMessage({id: "LANG5251"})}</span>
                                </Tooltip>
                            )}
                        >
                            {getFieldDecorator('syslogbk_interval', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        this.state.logServer.syslogbk_enabled === '1' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.logServer.syslogbk_enabled === '1' ? Validator.range(data, value, callback, formatMessage, 3, 120) : callback()
                                    }
                                }],
                                width: 100,
                                initialValue: this.state.logServer.syslogbk_interval
                            })(
                                <Input min={ 3 } max={ 120 } disabled={ this.state.logServer.syslogbk_enabled === '0' }/>
                            )}
                        </FormItem>
                    </Form>
                </div>
                <div className="content">
                    <div className="section-title">
                        <p><span>
                                { formatMessage({id: "LANG67" })}
                            </span>
                        </p>
                    </div>
                    <div className="top-button">
                        <Button type="primary" icon="download" size='default' onClick={ this._download }>
                            { formatMessage({id: "LANG759" }, { 0: formatMessage({id: "LANG4146"})}) }
                        </Button>
                        <Button type="primary" icon="clear" size='default' onClick={ this._clean }>
                            { formatMessage({id: "LANG743"}) }
                        </Button>
                    </div>
                </div>
                <div className="content">
                    <div className="top-button">
                        <Card title={ formatMessage({id: "LANG5141" })} >
                            <Col span={ 1 }>
                                 <Checkbox checked={ this.state.switchAll } onChange={ this._onChangeSwitchAll } />
                            </Col>
                            <Col span={ 2 }>{formatMessage({id: "LANG4160"})}</Col>
                            <CheckboxGroup options={ plainOptions } value={ checkedList } onChange={ this._onChangeSwitch } />
                        </Card>
                    </div>
                    <div className="top-button">
                        <Card title={ formatMessage({id: "LANG662" })}>
                            <div className="content">
                                <Search
                                    placeholder={ formatMessage({id: "LANG803"}) + formatMessage({id: "LANG4159"}) }
                                    value={ this.state.searchText }
                                    onChange={ this._onInputChange }
                                    onPressEnter={ this._onSearch }
                                    onSearch={ this._onSearch }
                                />
                            </div>
                            <Table
                                rowKey="id"
                                columns={ columns }
                                pagination={ pagination }
                                dataSource={ this.state.staticSwitch }
                                showHeader={ !!this.state.staticSwitch.length }
                            />
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG4161"}) }</span>
                            </div>
                            <Col span={ 1 }>
                                 <Checkbox checked={ this.state.dynamicAll } onChange={ this._onChangeDynamicAll } />
                            </Col>
                            <Col span={ 2 }>{formatMessage({id: "LANG4160"})}</Col>
                            <CheckboxGroup options={ plainOptions_dynamic } value={ checkedList_dynamic } onChange={ this._onChangeDynamic } />
                        </Card>
                    </div>
                </div>
                <div>
                    <BackTop />
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(SystemLog))

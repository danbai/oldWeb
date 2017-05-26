'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Row, Col, Icon, Table, Button, message, Modal, Menu, Dropdown, Popconfirm, Select, Tooltip } from 'antd'
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import Title from '../../../views/title'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import _ from 'underscore'
import '../../../css/userWebRTC'

const FormItem = Form.Item
const baseServerURl = api.apiHost

global.checkPingTimer = null
global.oSipSessionRegister = null
global.oSipSessionTransferCall = null
global.oSipSessionCall = null

class UserWebrtc extends Component {
    constructor(props) {
        super(props)
        this.state = {
            txtRegStatusMsg: "",
            oWebrtcInputConf: {},
            SIPWebRTCHttpSettings: {},
            oConfigCall: {},
            sipUnRegisterFlag: true,
            oNotifICall: null,
            btnCall: true,
            btnHangUp: true,
            bDisableVideo: false,
            btnCallVal: "Call",
            btnHangUpVal: "",
            btnMuteVal: "Mute",
            btnHoldResumeVal: "Hold",
            sRemoteCalleeName: "",
            bFullScreen: false,
            isWebRtcSupported: false
        }
        this._handleSubmit = (e) => {
            const { formatMessage } = this.props.intl
            const form = this.props.form

            let action = {}

            this.props.form.validateFieldsAndScroll((err, values) => {
                let me = this
                let refs = this.refs

                for (let key in values) {
                    if (values.hasOwnProperty(key)) {
                        let divKey = refs["div_" + key]

                        if (!err || (err && typeof err[key] === "undefined")) {
                            action[key] = values[key]
                        } else {
                            return
                        }
                    }
                }
            })
        }
        this._handleCancel = () => {
            browserHistory.push('/user-value-added-features/userWebrtc')
        }
    }
    componentDidMount() {
        this._loadEnableWebrtcDefault()
    }
    componentWillUnmount() {
    }
    _initWebRTC = () => {
        let SIPml = window.SIPml
        let isTxtWebsocketServerUrl = !window.WebSocket || navigator.appName === "Microsoft Internet Explorer" // Do not use WS on IE
        this.setState({
            isTxtWebsocketServerUrl: isTxtWebsocketServerUrl
        })
        this._loadWebrtcInputConf()
        // Initialize call button
        // this._uiBtnCallSetText("Call")

        // document.onkeyup = this._onKeyUp
        // document.body.onkeyup = this._onKeyUp
        // divCallCtrl.onmousemove = this._onDivCallCtrlMouseMove

        // set debug level
        SIPml.setDebugLevel(this.state.oWebrtcInputConf.disable_debug_messages === "yes" ? "error" : "info")

        // initialize SIPML5
        this._preInit()

        // try {
        //     let pageTracker = _gat._getTracker("UA-6868621-19")
        //     pageTracker._trackPageview()
        // } catch (err) {}
    }
    _getPVal = (PName) => {
        let query = window.location.search.substring(1)
        let vars = query.split('&')

        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split('=')
            if (decodeURIComponent(pair[0]) === PName) {
                return decodeURIComponent(pair[1])
            }
        }
        return null
    }
    _preInit = () => {
        let SIPml = window.SIPml
        // set default webrtc type (before initialization)
        let s_webrtc_type = this._getPVal("wt")
        let s_fps = this._getPVal("fps")
        let s_mvs = this._getPVal("mvs") // maxVideoSize
        let s_mbwu = this._getPVal("mbwu") // maxBandwidthUp (kbps)
        let s_mbwd = this._getPVal("mbwd") // maxBandwidthUp (kbps)
        let s_za = this._getPVal("za") // ZeroArtifacts
        let s_ndb = this._getPVal("ndb") // NativeDebug

        if (s_webrtc_type) SIPml.setWebRtcType(s_webrtc_type)

        // initialize SIPML5
        SIPml.init(this._postInit)

        // set other options after initialization
        if (s_fps) SIPml.setFps(parseFloat(s_fps))
        if (s_mvs) SIPml.setMaxVideoSize(s_mvs)
        if (s_mbwu) SIPml.setMaxBandwidthUp(parseFloat(s_mbwu))
        if (s_mbwd) SIPml.setMaxBandwidthDown(parseFloat(s_mbwd))
        if (s_za) SIPml.setZeroArtifacts(s_za === "true")
        if (s_ndb === "true") SIPml.startNativeDebug()
    }
    _sendPing =() => {
        $.ajax({
            type: 'POST',
            url: baseServerURl,
            data: {
                action: "ping"
            },
            success: function(data) {
                // if (data.status != 0) {
                //     UCMGUI.loginFunction.switchToLoginPanel()
                // }
            }
        })
    }
    _checkPhoneNumber = (val, ele) => {
        if (val.match(/^[0-9#*.@:a-zA-Z]{0,64}$/)) {
            return true
        }

        return false
    }
    _loadEnableWebrtcDefault = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        let ucm_user_name = localStorage.getItem("username")

        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            data: {
                action: "listAccount",
                options: "account_type"
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let res = data.response

                    if (res) {
                        let account = res.account,
                            extType = account[0] ? account[0].account_type.slice(0, 3) : ""

                        if (extType.toLowerCase() !== 'sip') {
                            this.setState({
                                isWebRtcSupported: true
                            })
                            message.error(formatMessage({ id: "LANG4450" }))
                        } else {
                            $.ajax({
                                type: "POST",
                                url: baseServerURl,
                                data: {
                                    action: "getSIPAccount",
                                    extension: ucm_user_name
                                },
                                success: function(data) {
                                    let bool = UCMGUI.errorHandler(data, null, formatMessage)

                                    if (bool) {
                                        let res = data.response.extension,
                                            enable_webrtc = res.enable_webrtc,
                                            secret = res.secret

                                        // txtPassword.value = secret

                                        if (enable_webrtc === 'yes') {
                                            // loadWebrtcInputConf()

                                            if (getFieldValue("txtPrivateIdentity") === '' || getFieldValue("txtWebsocketServerUrl") === '') {
                                                $.ajax({
                                                    type: "POST",
                                                    url: baseServerURl,
                                                    data: {
                                                        action: "getSIPWebRTCHttpSettings"
                                                    },
                                                    success: function(data) {
                                                        let bool = UCMGUI.errorHandler(data, null, formatMessage)

                                                        if (bool) {
                                                            let res = data.response.webrtc_http_settings,
                                                                bindaddr = ((res.bindaddr === '0.0.0.0' || res.bindaddr === null) ? location.hostname : res.bindaddr),
                                                                bindport = (res.bindport === null ? '8088' : res.bindport),
                                                                SIPWebRTCHttpSettings = {}

                                                            SIPWebRTCHttpSettings["txtDisplayName"] = ucm_user_name
                                                            SIPWebRTCHttpSettings["txtPrivateIdentity"] = ucm_user_name
                                                            SIPWebRTCHttpSettings["txtPublicIdentity"] = 'sip:' + ucm_user_name + '@' + bindaddr
                                                            SIPWebRTCHttpSettings["txtPassword"] = secret
                                                            SIPWebRTCHttpSettings["txtWebsocketServerUrl"] = 'ws://' + bindaddr + ':' + bindport + '/ws'

                                                            this.setState({
                                                                SIPWebRTCHttpSettings: SIPWebRTCHttpSettings
                                                            })
                                                        }
                                                    }.bind(this)
                                                })
                                            }
                                            this._initWebRTC()
                                        } else {
                                            message.error(formatMessage({ id: "LANG4450" }))
                                            this.setState({
                                                isWebRtcSupported: true
                                            })
                                        }
                                    }
                                }.bind(this)
                            })
                        }
                    }
                }
            }.bind(this)
        })
    }
    _loadWebrtcInputConf = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        let ucm_user_name = localStorage.getItem("username")

        $.ajax({
            url: baseServerURl,
            data: {
                action: "getWebRTCUserLogins",
                user_name: ucm_user_name
            },
            type: 'POST',
            dataType: 'json',
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let oWebrtcInputConf = data.response.user_name

                    // $('#txtDisplayName').val(oWebrtcInputConf.register_account_name || '')
                    // $('#txtPrivateIdentity').val(oWebrtcInputConf.register_extension || '')
                    // $('#txtPublicIdentity').val(oWebrtcInputConf.register_public_id || '')
                    // $('#txtPassword').val(oWebrtcInputConf.register_password || '')
                    // $('#txtWebsocketServerUrl').val(oWebrtcInputConf.register_server_url || '')
                    // $('#txtPhoneNumber').val(oWebrtcInputConf.dial_number || '')
                    this.state["oWebrtcInputConf"] = oWebrtcInputConf
                    let bDisableVideo = (oWebrtcInputConf.disable_video === "yes")

                    this.setState({
                        txtCallStatusMsg: 'Video ' + (bDisableVideo ? 'disabled' : 'enabled')
                    })
                }
            }.bind(this)
        })
    }
    _postInit = () => {
        let SIPml = window.SIPml
        // check webrtc4all version
        if (SIPml.isWebRtc4AllSupported() && SIPml.isWebRtc4AllPluginOutdated()) {
            if (confirm("Your WebRtc4all extension is outdated (" + SIPml.getWebRtc4AllVersion() + "). A new version with critical bug fix is available. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {
                window.location = 'http://code.google.com/p/webrtc4all/downloads/list'
                return
            }
        }

        // check for WebRTC support
        if (!SIPml.isWebRtcSupported()) {
            // is it chrome?
            if (SIPml.getNavigatorFriendlyName() === 'chrome') {
                if (confirm("You're using an old Chrome version or WebRTC is not enabled.\nDo you want to see how to enable WebRTC?")) {
                    window.location = 'http://www.webrtc.org/running-the-demos'
                } else {
                    window.location = "index.html"
                }
                return
            }

            // for now the plugins (WebRTC4all only works on Windows)
            if (SIPml.getSystemFriendlyName() === 'windows') {
                // Internet explorer
                if (SIPml.getNavigatorFriendlyName() === 'ie') {
                    // Check for IE version
                    if (parseFloat(SIPml.getNavigatorVersion()) < 9.0) {
                        if (confirm("You are using an old IE version. You need at least version 9. Would you like to update IE?")) {
                            window.location = 'http://windows.microsoft.com/en-us/internet-explorer/products/ie/home'
                        } else {
                            window.location = "index.html"
                        }
                    }

                    // check for WebRTC4all extension
                    if (!SIPml.isWebRtc4AllSupported()) {
                        if (confirm("webrtc4all extension is not installed. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {
                            window.location = 'http://code.google.com/p/webrtc4all/downloads/list'
                        } else {
                            // Must do nothing: give the user the chance to accept the extension
                            // window.location = "index.html"
                        }
                    }
                    // break page loading ('window.location' won't stop JS execution)
                    if (!SIPml.isWebRtc4AllSupported()) {
                        return
                    }
                } else if (SIPml.getNavigatorFriendlyName() === "safari" || SIPml.getNavigatorFriendlyName() === "firefox" || SIPml.getNavigatorFriendlyName() === "opera") {
                    if (confirm("Your browser don't support WebRTC.\nDo you want to install WebRTC4all extension to enjoy audio/video calls?\nIMPORTANT: You must restart your browser after the installation.")) {
                        window.location = 'http://code.google.com/p/webrtc4all/downloads/list'
                    } else {
                        window.location = "index.html"
                    }
                    return
                }
            } else { // OSX, Unix, Android, iOS...
                if (confirm('WebRTC not supported on your browser.\nDo you want to download a WebRTC-capable browser?')) {
                    window.location = 'https://www.google.com/intl/en/chrome/browser/'
                } else {
                    window.location = "index.html"
                }
                return
            }
        }

        // checks for WebSocket support
        if (!SIPml.isWebSocketSupported() && !SIPml.isWebRtc4AllSupported()) {
            if (confirm('Your browser don\'t support WebSockets.\nDo you want to download a WebSocket-capable browser?')) {
                window.location = 'https://www.google.com/intl/en/chrome/browser/'
            }
            return
        }

        // FIXME: displays must be per session
        // attachs video displays
        let viewVideoLocal = document.getElementById("divVideoLocal"),
            viewVideoRemote = document.getElementById("divVideoRemote"),
            viewLocalScreencast = document.getElementById("divScreencastLocal"),
            videoLocal = document.getElementById("video_local"),
            videoRemote = document.getElementById("video_remote"),
            audioRemote = document.getElementById("audio_remote")

        if (SIPml.isWebRtc4AllSupported()) {
            window.WebRtc4all_SetDisplays(viewVideoLocal, viewVideoRemote, viewLocalScreencast) // FIXME: move to SIPml.* API
        } else {
            viewVideoLocal = videoLocal
            viewVideoRemote = videoRemote
        }

        if (!SIPml.isWebRtc4AllSupported() && !SIPml.isWebRtcSupported()) {
            if (confirm('Your browser don\'t support WebRTC.\naudio/video calls will be disabled.\nDo you want to download a WebRTC-capable browser?')) {
                window.location = 'https://www.google.com/intl/en/chrome/browser/'
            }
        }

        this.setState({
            btnRegister: false
        })

        this.state["oConfigCall"] = {
            audio_remote: audioRemote,
            video_local: viewVideoLocal,
            video_remote: viewVideoRemote,
            screencast_window_id: 0x00000000, // entire desktop
            bandwidth: {
                audio: undefined,
                video: undefined
            },
            video_size: {
                minWidth: undefined,
                minHeight: undefined,
                maxWidth: undefined,
                maxHeight: undefined
            },
            events_listener: {
                events: '*',
                listener: this._onSipEventSession
            },
            sip_caps: [{
                name: '+g.oma.sip-im'
            }, {
                name: 'language',
                value: '\"en,fr\"'
            }]
        }
    }
    _advanceSettings = () => {
        browserHistory.push({
            pathname: '/user-value-added-features/userWebrtc/settings',
            state: this.state.oWebrtcInputConf
        })
    }
    _saveCredentials = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        let ucm_user_name = localStorage.getItem("username")

        let action = {
            'action': 'updateWebRTCUserLogins',
            'user_name': ucm_user_name,
            'register_account_name': getFieldValue('txtDisplayName'),
            'register_extension': getFieldValue('txtPrivateIdentity'),
            'register_public_id': getFieldValue('txtPublicIdentity'),
            'register_password': getFieldValue('txtPassword'),
            'register_server_url': getFieldValue('txtWebsocketServerUrl'),
            'dial_number': getFieldValue('txtPhoneNumber')
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {}
            }
        })
    }
    // sends SIP REGISTER request to login
    _sipRegister = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        let ucm_user_name = localStorage.getItem("username")
        let SIPml = window.SIPml,
        self = this

        // catch exception for IE (DOM not ready)
        try {
            // this.setState({
            //     btnRegister: true
            // })
            if (!getFieldValue("txtPrivateIdentity") || !getFieldValue("txtPublicIdentity")) {
                this.setState({
                    txtRegStatusMsg: "<b>Please fill madatory fields (*)</b>",
                    btnRegister: false
                })
                return
            }
            let o_impu = window.tsip_uri.prototype.Parse(getFieldValue("txtPublicIdentity"))
            if (!o_impu || !o_impu.s_user_name || !o_impu.s_host) {
                this.setState({
                    txtRegStatusMsg: "<b>[" + getFieldValue("txtPublicIdentity") + "] is not a valid Public identity</b>",
                    btnRegister: false
                })
                return
            }

            // enable notifications if not already done
            if (window.webkitNotifications && window.webkitNotifications.checkPermission() !== 0) {
                window.webkitNotifications.requestPermission()
            }

            // save credentials
            this._saveCredentials()

            let oWebrtcInputConf = this.state.oWebrtcInputConf
            // update debug level to be sure new values will be used if the user haven't updated the page
            SIPml.setDebugLevel((oWebrtcInputConf.disable_debug_messages === "yes") ? "error" : "info")

            let tsk_string_to_object = window.tsk_string_to_object

            // create SIP stack
            this.state["oSipStack"] = new SIPml.Stack({
                realm: 'grandstream',
                impi: getFieldValue("txtPrivateIdentity"),
                impu: getFieldValue("txtPublicIdentity"),
                password: getFieldValue("txtPassword"),
                display_name: getFieldValue("txtDisplayName"),
                websocket_proxy_url: getFieldValue("txtWebsocketServerUrl"),
                outbound_proxy_url: oWebrtcInputConf.sip_outbound_proxy_url,
                ice_servers: tsk_string_to_object(oWebrtcInputConf.ice_service),
                enable_rtcweb_breaker: oWebrtcInputConf.enable_webrtc_breaker === "yes",
                events_listener: {
                    events: '*',
                    listener: this._onSipEventStack
                },
                enable_early_ims: oWebrtcInputConf.disable_3gpp_early_ims !== "yes", // Must be true unless you're using a real IMS network
                enable_media_stream_cache: oWebrtcInputConf.cache_media_stream === "yes",
                bandwidth: tsk_string_to_object(oWebrtcInputConf.max_bandwidth), // could be redefined a session-level
                video_size: tsk_string_to_object(oWebrtcInputConf.video_size), // could be redefined a session-level
                sip_headers: [{
                    name: 'User-Agent',
                    value: 'IM-client/OMA1.0 sipML5-v1.2015.03.18'
                }, {
                    name: 'Organization',
                    value: 'Doubango Telecom'
                }]
            })
            if (this.state.oSipStack.start() !== 0) {
                this.setState({
                    txtRegStatusMsg: '<b>Failed to start the SIP stack</b>'
                })
            } else return
        } catch (e) {
            self.setState({
                txtRegStatusMsg: "<b>2:" + e + "</b>"
            })
        }
        this.setState({
            btnRegister: false
        })
    }
    // sends SIP REGISTER (expires=0) to logout
    _sipUnRegister = () => {
        this.state.sipUnRegisterFlag = false
        let oSipStack = this.state.oSipStack
        if (oSipStack) {
            oSipStack.stop() // shutdown all sessions
        }
    }
    // makes a call (SIP INVITE)
    _sipCall = (s_type) => {
        const { getFieldValue } = this.props.form

        let me = this,
            state = this.state,
            SIPml = window.SIPml,
            txtPhoneNumberVal = getFieldValue("txtPhoneNumber"),
            tsk_string_to_object = window.tsk_string_to_object

        if (txtPhoneNumberVal === '') {
            this.setState({
                txtCallStatusMsg: "Dial number can not be empty"
            })
            setTimeout(() => {
                me.setState({
                txtCallStatusMsg: ""
            })
            }, 3000)
            return
        } else if (!txtPhoneNumberVal.match(/^[0-9#*.@:a-zA-Z]{0,64}$/)) {
            this.setState({
                txtCallStatusMsg: "Invalid format"
            })
            setTimeout(() => {
                me.setState({
                txtCallStatusMsg: ""
            })
            }, 3000)
            return
        }
        document.getElementById("divCallCtrl").style.display = 'block'
        $("#video_remote")[0].style.opacity = 1
        $("#video_local")[0].style.opacity = 1
        if (s_type === "call-audio") {
            $("#audioDiv").show()
        }
        this._sendPing()
        global.checkPingTimer = setInterval(() => {
            me._sendPing()
        }, 30000)

        if (state.oSipStack && !global.oSipSessionCall && !window.tsk_string_is_null_or_empty(txtPhoneNumberVal)) {
            if (s_type === 'call-screenshare') {
                if (!SIPml.isScreenShareSupported()) {
                    alert('Screen sharing not supported. Are you using chrome 26+?')
                    return
                }
                if (!location.protocol.match('https')) {
                    if (confirm("Screen sharing requires https://. Do you want to be redirected?")) {
                        this._sipUnRegister()
                        window.location = 'https://ns313841.ovh.net/call.htm'
                    }
                    return
                }
            }
            this.setState({
                btnCall: true,
                btnHangUp: false
            })
            // if (window.localStorage) {
                state.oConfigCall.bandwidth = tsk_string_to_object(state.oWebrtcInputConf.max_bandwidth) // already defined at stack-level but redifined to use latest values
                state.oConfigCall.video_size = tsk_string_to_object(state.oWebrtcInputConf.video_size) // already defined at stack-level but redifined to use latest values
            // }

            // create call session
            global.oSipSessionCall = this.state.oSipStack.newSession(s_type, state.oConfigCall)
            // make call
            if (global.oSipSessionCall.call(txtPhoneNumberVal) !== 0) {
                global.oSipSessionCall = null
                this.setState({
                    txtCallStatus: 'Failed to make call',
                    btnCall: false,
                    btnHangUp: true
                })
                return
            }
            this._saveCallOptions()
        } else if (global.oSipSessionCall) {
            this.setState({
                txtCallStatus: 'Connecting...',
                btnCall: false,
                btnHangUp: true
            })
            global.oSipSessionCall.accept(state.oConfigCall)
        }
    }
    _saveCallOptions() {
        const { getFieldValue } = this.props.form

        if (window.localStorage) {
            window.localStorage.setItem('org.doubango.call.phone_number', getFieldValue('txtPhoneNumber'))
            window.localStorage.setItem('org.doubango.expert.disable_video', this.state.bDisableVideo ? "true" : "false")
        }
    }
    _showNotifICall = (s_number) => {
        let state = this.state
        // permission already asked when we registered
        if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
            if (state.oNotifICall) {
                state.oNotifICall.cancel()
            }
            state.oNotifICall = window.webkitNotifications.createNotification('images/sipml-34x39.png', 'Incaming call', 'Incoming call from ' + s_number)
            state.oNotifICall.onclose = function() {
                state.oNotifICall = null
            }
            state.oNotifICall.show()
        }
    }

    _onKeyUp = (evt) => {
        let state = this.state
        evt = (evt || window.event)
        if (evt.keyCode === 27) {
            this._fullScreen(false)
        } else if (evt.ctrlKey && evt.shiftKey) { // CTRL + SHIFT
            if (evt.keyCode === 65 || evt.keyCode === 86) { // A (65) or V (86)
                state.bDisableVideo = (evt.keyCode === 65)
                this.setState({
                    txtCallStatusMsg: 'Video ' + (state.bDisableVideo ? 'disabled' : 'enabled')
                })
                window.localStorage.setItem('org.doubango.expert.disable_video', state.bDisableVideo)
            }
        }
    }

    _onDivCallCtrlMouseMove = (evt) => {
        try { // IE: DOM not ready
            if (window.tsk_utils_have_stream()) {
                this.setState({
                    btnCall: (!window.tsk_utils_have_stream() || !global.oSipSessionRegister || !global.oSipSessionRegister.is_connected())
                })
                document.getElementById("divCallCtrl").onmousemove = null // unsubscribe
            }
        } catch (e) {}
    }

    _uiOnConnectionEvent = (b_connected, b_connecting) => { // should be enum: connecting, connected, terminating, terminated
        this.setState({
            btnRegister: b_connected || b_connecting,
            btnUnRegister: !b_connected && !b_connecting,
            btnCall: !(b_connected && window.tsk_utils_have_webrtc() && window.tsk_utils_have_stream()),
            btnHangUp: !global.oSipSessionCall
        })
    }

    _uiVideoDisplayEvent = (b_local, b_added) => {
        let SIPml = window.SIPml
        let o_elt_video = b_local ? document.getElementById("video_local") : document.getElementById("video_remote")

        if (b_added) {
            if (SIPml.isWebRtc4AllSupported()) {
                if (b_local) {
                    if (window.WebRtc4all_GetDisplayLocal()) window.WebRtc4all_GetDisplayLocal().style.visibility = "visible"
                    if (window.WebRtc4all_GetDisplayLocalScreencast()) window.WebRtc4all_GetDisplayLocalScreencast().style.visibility = "visible"
                } else {
                    if (window.WebRtc4all_GetDisplayRemote()) window.WebRtc4all_GetDisplayRemote().style.visibility = "visible"
                }
            } else {
                o_elt_video.style.opacity = 1
            }
            this._uiVideoDisplayShowHide(true)
        } else {
            if (SIPml.isWebRtc4AllSupported()) {
                if (b_local) {
                    if (window.WebRtc4all_GetDisplayLocal()) window.WebRtc4all_GetDisplayLocal().style.visibility = "hidden"
                    if (window.WebRtc4all_GetDisplayLocalScreencast()) window.WebRtc4all_GetDisplayLocalScreencast().style.visibility = "hidden"
                    // viewVideoLocal.style.visibility = "hidden"
                    // viewLocalScreencast.style.visibility = "hidden"
                    // if (WebRtc4all_GetDisplayLocal()) WebRtc4all_GetDisplayLocal().hidden = true
                    // if (WebRtc4all_GetDisplayLocalScreencast()) WebRtc4all_GetDisplayLocalScreencast().hidden = true
                } else {
                    if (window.WebRtc4all_GetDisplayRemote()) window.WebRtc4all_GetDisplayRemote().style.visibility = "hidden"
                    // viewVideoRemote.style.visibility = "hidden"
                    // if (WebRtc4all_GetDisplayRemote()) WebRtc4all_GetDisplayRemote().hidden = true
                }
            } else {
                o_elt_video.style.opacity = 0
            }
            this._fullScreen(false)
        }
    }
    _uiVideoDisplayShowHide = (b_show) => {
        let divCallCtrl = document.getElementById("divCallCtrl")
        if (b_show) {
            divCallCtrl.style.display = 'block'

            this._scrollToBottom()
        } else {
            divCallCtrl.style.display = 'none'
        }
    }
    // _uiBtnCallSetText = (s_text) => {
    //     switch (s_text) {
    //         case "Call":
    //             {
    //                 let bDisableCallBtnOptions = false // (window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_callbtn_options') == "true")
    //                 // btnCall.value = btnCall.innerHTML = bDisableCallBtnOptions ? 'Call' : 'Call <span id="spanCaret" class="caret">'

    //                 btnCall.onClick = bDisableCallBtnOptions ? function() {
    //                     sipCall(bDisableVideo ? 'call-audio' : 'call-audiovideo')
    //                 } : null

    //                 ulCallOptions.style.visibility = bDisableCallBtnOptions ? "hidden" : "visible"
    //                 if (!bDisableCallBtnOptions && ulCallOptions.parentNode != divBtnCallGroup) {
    //                     divBtnCallGroup.appendChild(ulCallOptions)
    //                 } else if (bDisableCallBtnOptions && ulCallOptions.parentNode == divBtnCallGroup) {
    //                     document.body.appendChild(ulCallOptions)
    //                 }

    //                 break
    //             }
    //         default:
    //             {
    //                 btnCall.value = btnCall.innerHTML = s_text
    //                 btnCall.setAttribute("class", "btn btn-primary")
    //                 btnCall.onClick = function() {
    //                     sipCall(bDisableVideo ? 'call-audio' : 'call-audiovideo')
    //                 }
    //                 ulCallOptions.style.visibility = "hidden"
    //                 if (ulCallOptions.parentNode == divBtnCallGroup) {
    //                     document.body.appendChild(ulCallOptions)
    //                 }
    //                 break
    //             }
    //     }
    // }
    _uiCallTerminated = (s_description) => {
        let state = this.state
        window.clearInterval(global.checkPingTimer)
        // this._uiBtnCallSetText("Call")
        this.setState({
            btnHangUpVal: 'HangUp',
            btnHoldResumeVal: 'hold',
            btnMuteVal: "Mute",
            btnCall: false,
            btnHangUp: true
        })

        if (window.btnBFCP) window.btnBFCP.disabled = true

        global.oSipSessionCall = null

        this._stopRingbackTone()
        this._stopRingTone()

        this.setState({
            txtCallStatusMsg: s_description
        })
        this._uiVideoDisplayShowHide(false)
        document.getElementById("divCallOptions").style.display = 'none'
        this.setState({
            btnHoldResume: false,
            btnTransfer: false
        })

        if (state.oNotifICall) {
            state.oNotifICall.cancel()
            state.oNotifICall = null
        }

        this._uiVideoDisplayEvent(false, false)
        this._uiVideoDisplayEvent(true, false)

        setTimeout(() => {
            if (!global.oSipSessionCall) {
                this.setState({
                    txtCallStatusMsg: ""
                })
            }
        }, 2500)
    }
    // Callback function for SIP Stacks
    _onSipEventStack = (e) => { /* SIPml.Stack.Event */
        window.tsk_utils_log_info('==stack event = ' + e.type)
        let state = this.state,
            oSipSessionCall = global.oSipSessionCall,
            sipUnRegisterFlag = state.sipUnRegisterFlag,
            oConfigCall = this.state.oConfigCall

        switch (e.type) {
            case 'started':
                {
                    // catch exception for IE (DOM not ready)
                    try {
                        // LogIn (REGISTER) as soon as the stack finish starting
                        global.oSipSessionRegister = this.state.oSipStack.newSession('register', {
                            expires: 200,
                            events_listener: {
                                events: '*',
                                listener: this._onSipEventSession
                            },
                            sip_caps: [{
                                    name: '+g.oma.sip-im',
                                    value: null
                                },
                                // { name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
                                {
                                    name: '+audio',
                                    value: null
                                }, {
                                    name: 'language',
                                    value: '\"en,fr\"'
                                }
                            ]
                        })
                        global.oSipSessionRegister.register()
                    } catch (e) {
                        this.setState({
                            txtRegStatusMsg: "<b>1:" + e + "</b>",
                            btnRegister: false
                        })
                    }
                    break
                }
            case 'stopping':
            case 'stopped':
            case 'failed_to_start':
            case 'failed_to_stop':
                {
                    window.clearInterval(global.checkPingTimer)
                    let bFailure = (e.type === 'failed_to_start') || (e.type === 'failed_to_stop')
                    // this.state.oSipStack = null
                    global.oSipSessionRegister = null
                    global.oSipSessionCall = null

                    // uiOnConnectionEvent(false, false)
                    this._stopRingbackTone()
                    this._stopRingTone()
                    this._uiVideoDisplayShowHide(false)

                    document.getElementById("divCallOptions").style.display = 'none'
                    this.setState({
                        txtRegStatusMsg: bFailure ? "<i>Disconnected: <b>" + e.description + "</b></i>" : "<i>Disconnected</i>",
                        btnHoldResume: false,
                        btnTransfer: false,
                        txtCallStatusMsg: "",
                        btnRegister: false
                    })
                    if (sipUnRegisterFlag) {
                        this._sipUnRegister()
                    }
                    break
                }

            case 'i_new_call':
                {
                    if (oSipSessionCall) {
                        // do not accept the incoming call if we're already 'in call'
                        e.newSession.hangup() // comment this line for multi-line support
                    } else {
                        oSipSessionCall = e.newSession
                        // start listening for events
                        oSipSessionCall.setConfiguration(this.state.oConfigCall)

                        // scroll to bottom before answer a call
                        this._scrollToBottom()
                        // this._uiBtnCallSetText('Answer')
                        this.setState({
                            btnHangUpVal: 'Reject',
                            btnCall: false,
                            btnHangUp: false
                        })
                        this._startRingTone()

                        let sRemoteNumber = (oSipSessionCall.getRemoteFriendlyName() || 'unknown')
                        this.setState({
                            txtCallStatusMsg: "Incoming call from <b>" + (state.sRemoteCalleeName ? (state.sRemoteCalleeName + ' ') : '') + '[' + sRemoteNumber + "]</b>",
                            txtPhoneNumberVal: sRemoteNumber
                        })
                        this._showNotifICall(sRemoteNumber)
                    }
                    break
                }

            case 'm_permission_requested':
                {
                    document.getElementById("divGlassPanel").style.visibility = 'visible'
                    break
                }
            case 'm_permission_accepted':
            case 'm_permission_refused':
                {
                    document.getElementById("divGlassPanel").style.visibility = 'hidden'
                    if (e.type === 'm_permission_refused') {
                        this._uiCallTerminated('Media stream permission denied')
                    }
                    break
                }

            case 'starting':
            default:
                break
        }
    }
    // Callback function for SIP sessions (INVITE, REGISTER, MESSAGE...)
    _onSipEventSession = (e) => { /* SIPml.Session.Event */
        const { getFieldValue } = this.props.form
        let SIPml = window.SIPml,
            state = this.state,
            oSipSessionCall = global.oSipSessionCall
        window.tsk_utils_log_info('==session event = ' + e.type)

        switch (e.type) {
            case 'connecting':
            case 'connected':
                {
                    let bConnected = (e.type === 'connected')
                    if (e.session === global.oSipSessionRegister) {
                        this._uiOnConnectionEvent(bConnected, !bConnected)
                        this.setState({
                            txtRegStatusMsg: e.description
                        })
                    } else if (e.session === oSipSessionCall) {
                        this.setState({
                            btnHangUpVal: 'HangUp',
                            btnCall: true,
                            btnHangUp: false,
                            btnTransfer: false
                        })
                        if (window.btnBFCP) window.btnBFCP.disabled = false

                        if (bConnected) {
                            this._stopRingbackTone()
                            this._stopRingTone()

                            if (state.oNotifICall) {
                                state.oNotifICall.cancel()
                                state.oNotifICall = null
                            }
                        }

                        this.setState({
                            txtRegStatusMsg: e.description
                        })
                        if (e.session.o_session.o_uri_to.s_user_name !== getFieldValue("txtPrivateIdentity").value) {
                            document.getElementById("divCallOptions").style.display = bConnected ? 'inline-block' : 'none'
                            // if (document.getElementById("btnHangUp").disabled) {
                            //     document.getElementById("divCallOptions").style.display = "none"
                            // }
                            if (bConnected) {
                                $("#audioDiv").hide()
                                $("#callStatus").addClass("calledIcon")
                                this.setState({
                                    btnHoldResume: false,
                                    btnTransfer: false
                                })
                            } else {
                                $("#callStatus").removeClass("calledIcon")
                            }
                        }

                        if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback
                            this._uiVideoDisplayEvent(false, true)
                            this._uiVideoDisplayEvent(true, true)
                        }
                    }
                    break
                } // 'connecting' | 'connected'
            case 'terminating':
            case 'terminated':
                {
                    if (e.session === global.oSipSessionRegister) {
                        this._uiOnConnectionEvent(false, false)

                        global.oSipSessionCall = null
                        global.oSipSessionRegister = null
                        this.setState({
                            txtRegStatusMsg: e.description
                        })
                    } else if (e.session === oSipSessionCall) {
                        if (e.description === 'Request Cancelled') {
                            document.getElementById("divGlassPanel").style.visibility = 'hidden'
                        }

                        this._uiCallTerminated(e.description)
                    }
                    break
                } // 'terminating' | 'terminated'

            case 'm_stream_video_local_added':
                {
                    if (e.session === oSipSessionCall) {
                        this._uiVideoDisplayEvent(true, true)
                    }
                    break
                }
            case 'm_stream_video_local_removed':
                {
                    if (e.session === oSipSessionCall) {
                        this._uiVideoDisplayEvent(true, false)
                    }
                    break
                }
            case 'm_stream_video_remote_added':
                {
                    if (e.session === oSipSessionCall) {
                        this._uiVideoDisplayEvent(false, true)
                    }
                    break
                }
            case 'm_stream_video_remote_removed':
                {
                    if (e.session === oSipSessionCall) {
                        this._uiVideoDisplayEvent(false, false)
                    }
                    break
                }

            case 'm_stream_audio_local_added':
            case 'm_stream_audio_local_removed':
            case 'm_stream_audio_remote_added':
            case 'm_stream_audio_remote_removed':
                {
                    break
                }

            case 'i_ect_new_call':
                {
                    global.oSipSessionTransferCall = e.session
                    break
                }

            case 'i_ao_request':
                {
                    if (e.session === oSipSessionCall) {
                        let iSipResponseCode = e.getSipResponseCode()
                        if (iSipResponseCode === 180 || iSipResponseCode === 183) {
                            this._startRingbackTone()
                            this.setState({
                                txtCallStatusMsg: 'Remote ringing...'
                            })
                        }
                    }
                    break
                }

            case 'm_early_media':
                {
                    if (e.session === oSipSessionCall) {
                        this._stopRingbackTone()
                        this._stopRingTone()
                        this.setState({
                            txtCallStatusMsg: 'Early media started'
                        })
                    }
                    break
                }

            case 'm_local_hold_ok':
                {
                    if (e.session === oSipSessionCall) {
                        if (oSipSessionCall.bTransfering) {
                            global.oSipSessionCall.bTransfering = false
                            // this.AVSession.TransferCall(this.transferUri)
                        }
                        this.setState({
                            btnHoldResumeVal: 'Resume',
                            btnHoldResume: false,
                            txtCallStatusMsg: 'Call placed on hold'
                        })
                        global.oSipSessionCall.bHeld = true
                    }
                    break
                }
            case 'm_local_hold_nok':
                {
                    if (e.session === oSipSessionCall) {
                        global.oSipSessionCall.bTransfering = false
                        this.setState({
                            btnHoldResumeVal: 'Hold',
                            btnHoldResume: false,
                            txtCallStatusMsg: 'Failed to place remote party on hold'
                        })
                    }
                    break
                }
            case 'm_local_resume_ok':
                {
                    if (e.session === oSipSessionCall) {
                        global.oSipSessionCall.bTransfering = false
                        this.setState({
                            btnHoldResumeVal: 'Hold',
                            btnHoldResume: false,
                            txtCallStatusMsg: 'Call taken off hold'
                        })
                        global.oSipSessionCall.bHeld = false

                        if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet
                            this._uiVideoDisplayEvent(false, true)
                            this._uiVideoDisplayEvent(true, true)
                        }
                    }
                    break
                }
            case 'm_local_resume_nok':
                {
                    if (e.session === oSipSessionCall) {
                        global.oSipSessionCall.bTransfering = false
                        this.setState({
                            btnHoldResume: false,
                            txtCallStatusMsg: 'Failed to unhold call'
                        })
                    }
                    break
                }
            case 'm_remote_hold':
                {
                    if (e.session === oSipSessionCall) {
                        this.setState({
                            txtCallStatusMsg: 'Placed on hold by remote party'
                        })
                    }
                    break
                }
            case 'm_remote_resume':
                {
                    if (e.session === oSipSessionCall) {
                        this.setState({
                            txtCallStatusMsg: 'Taken off hold by remote party'
                        })
                    }
                    break
                }
            case 'm_bfcp_info':
                {
                    if (e.session === oSipSessionCall) {
                        this.setState({
                            txtCallStatusMsg: 'BFCP Info: ' + e.description
                        })
                    }
                    break
                }

            case 'o_ect_trying':
                {
                    if (e.session === oSipSessionCall) {
                        this.setState({
                            txtCallStatusMsg: 'Call transfer in progress...'
                        })
                    }
                    break
                }
            case 'o_ect_accepted':
                {
                    if (e.session === oSipSessionCall) {
                        this.setState({
                            txtCallStatusMsg: 'Call transfer accepted'
                        })
                    }
                    break
                }
            case 'o_ect_completed':
            case 'i_ect_completed':
                {
                    if (e.session === oSipSessionCall) {
                        this.setState({
                            txtCallStatusMsg: 'Call transfer completed',
                            btnTransfer: false
                        })
                        if (global.oSipSessionTransferCall) {
                            global.oSipSessionCall = global.oSipSessionTransferCall
                        }
                        global.oSipSessionTransferCall = null
                    }
                    break
                }
            case 'o_ect_failed':
            case 'i_ect_failed':
                {
                    if (e.session === oSipSessionCall) {
                        this.setState({
                            txtCallStatusMsg: 'Call transfer failed',
                            btnTransfer: false
                        })
                    }
                    break
                }
            case 'o_ect_notify':
            case 'i_ect_notify':
                {
                    if (e.session === oSipSessionCall) {
                        this.setState({
                            txtCallStatusMsg: "Call Transfer: <b>" + e.getSipResponseCode() + " " + e.description + "</b>"
                        })
                        if (e.getSipResponseCode() >= 300) {
                            if (oSipSessionCall.bHeld) {
                                oSipSessionCall.resume()
                            }
                            this.setState({
                                btnTransfer: false
                            })
                        }
                    }
                    break
                }
            case 'i_ect_requested':
                {
                    if (e.session === oSipSessionCall) {
                        let s_message = "Do you accept call transfer to [" + e.getTransferDestinationFriendlyName() + "]?" // FIXME
                        if (confirm(s_message)) {
                            this.setState({
                                txtCallStatusMsg: 'Call transfer in progress...'
                            })
                            oSipSessionCall.acceptTransfer()
                            break
                        }
                        oSipSessionCall.rejectTransfer()
                    }
                    break
                }
        }
    }

    _scrollToBottom = () => {
        window.scrollTo(0, document.body.scrollHeight)
    }
    // Share entire desktop aor application using BFCP or WebRTC native implementation
    _sipShareScreen = () => {
        let state = this.state,
            oSipSessionCall = global.oSipSessionCall,
            SIPml = window.SIPml

        if (SIPml.getWebRtcType() === 'w4a') {
            // Sharing using BFCP -> requires an active session
            if (!oSipSessionCall) {
                this.setState({
                        txtCallStatusMsg: "No active session"
                    })
                return
            }
            if (oSipSessionCall.bfcpSharing) {
                if (oSipSessionCall.stopBfcpShare(state.oConfigCall) !== 0) {
                    this.setState({
                        txtCallStatusMsg: "Failed to start BFCP share"
                    })
                } else {
                    global.oSipSessionCall.bfcpSharing = false
                }
            } else {
                state.oConfigCall.screencast_window_id = 0x00000000
                if (oSipSessionCall.startBfcpShare(state.oConfigCall) !== 0) {
                    this.setState({
                        txtCallStatusMsg: "Failed to start BFCP share"
                    })
                } else {
                    global.oSipSessionCall.bfcpSharing = true
                }
            }
        } else {
            this._sipCall('call-screenshare')
        }
    }

    // transfers the call
    _sipTransfer = () => {
        let state = this.state,
            oSipSessionCall = global.oSipSessionCall

        if (oSipSessionCall) {
            let s_destination = prompt('Enter destination number', '')
            if (!window.sk_string_is_null_or_empty(s_destination)) {
                this.setState({
                    btnTransfer: true
                })
                if (oSipSessionCall.transfer(s_destination) !== 0) {
                    this.setState({
                        txtCallStatusMsg: "Call transfer failed",
                        btnTransfer: false
                    })
                    return
                }
                this.setState({
                    txtCallStatusMsg: "Transfering the call...",
                    btnTransfer: false
                })
            }
        }
    }

    // holds or resumes the call
    _sipToggleHoldResume = () => {
        let state = this.state,
            oSipSessionCall = global.oSipSessionCall

        if (oSipSessionCall) {
            this.setState({
                txtCallStatusMsg: oSipSessionCall.bHeld ? 'Resuming the call...' : 'Holding the call...',
                btnHoldResume: false
            })
            let i_ret = oSipSessionCall.bHeld ? oSipSessionCall.resume() : oSipSessionCall.hold()
            if (i_ret !== 0) {
                this.setState({
                    txtCallStatusMsg: "Hold / Resume failed",
                    btnHoldResume: false
                })
                return
            }
        }
    }

    // Mute or Unmute the call
    _sipToggleMute = () => {
        let state = this.state,
            oSipSessionCall = global.oSipSessionCall

        if (oSipSessionCall) {
            let bMute = !oSipSessionCall.bMute
            this.setState({
                txtCallStatusMsg: bMute ? 'Mute the call...' : 'Unmute the call...'
            })
            let i_ret = oSipSessionCall.mute('audio' /* could be 'video' */, bMute)
            if (i_ret !== 0) {
                this.setState({
                    txtCallStatusMsg: 'Mute / Unmute failed'
                })
                return
            }
            oSipSessionCall.bMute = bMute
            document.getElementById("btnMute").value = bMute ? "Unmute" : "Mute"
        }
    }

    // terminates the call (SIP BYE or CANCEL)
    _sipHangUp = () => {
        let state = this.state,
            oSipSessionCall = global.oSipSessionCall
        window.clearInterval(global.checkPingTimer)

        if (oSipSessionCall) {
            this.setState({
                txtCallStatusMsg: "Terminating the call..."
            })
            $("#audioDiv").hide()
            document.getElementById("divCallOptions").style.display = "none"
            oSipSessionCall.hangup({
                events_listener: {
                    events: '*',
                    listener: this._onSipEventSession
                }
            })
        }
    }

    _sipSendDTMF = (c) => {
        let state = this.state,
            oSipSessionCall = global.oSipSessionCall

        if (oSipSessionCall && c) {
            if (oSipSessionCall.dtmf(c) === 0) {
                try {
                    this._dtmfTone.play()
                } catch (e) {}
            }
        }
    }

    _startRingTone = () => {
        try {
            document.getElementById("ringtone").play()
        } catch (e) {}
    }

    _stopRingTone = () => {
        try {
            document.getElementById("ringtone").pause()
        } catch (e) {}
    }

    _startRingbackTone = () => {
        try {
            document.getElementById("ringbacktone").play()
        } catch (e) {}
    }

    _stopRingbackTone = () => {
        try {
            document.getElementById("ringbacktone").pause()
        } catch (e) {}
    }

    _toggleFullScreen = () => {
        let videoRemote = document.getElementById("video_remote")
        if (videoRemote.webkitSupportsFullscreen) {
            this._fullScreen(!videoRemote.webkitDisplayingFullscreen)
        } else {
            this._fullScreen(!this.state.bFullScreen)
        }
    }

    _openKeyPad() {
        let divKeyPad = document.getElementById("divKeyPad")
        if (divKeyPad.style.visibility !== 'visible') {
            $(".anticon-keypad-up").addClass("anticon-keypad-down")
           divKeyPad.style.visibility = 'visible'
           $("#divKeyPad").show()
        } else {
            divKeyPad.style.visibility = 'hidden'
            $("#divKeyPad").hide()
            $(".anticon-keypad-up").removeClass("anticon-keypad-down")
        }

        // divKeyPad.style.left = ((document.body.clientWidth - this.props.C.divKeyPadWidth) >> 1) + 'px'
        // divKeyPad.style.top = '70px'
        // document.getElementById("divGlassPanel").style.visibility = 'visible'
    }

    _closeKeyPad = () => {
        let divKeyPad = document.getElementById("divKeyPad")
        divKeyPad.style.left = '0px'
        divKeyPad.style.top = '0px'
        divKeyPad.style.visibility = 'hidden'
        document.getElementById("divGlassPanel").style.visibility = 'hidden'
    }

    _fullScreen = (b_fs) => {
        let state = this.state,
            videoRemote = document.getElementById("video_remote")
        state.bFullScreen = b_fs
        if (window.tsk_utils_have_webrtc4native() && state.bFullScreen && videoRemote.webkitSupportsFullscreen) {
            if (state.bFullScreen) {
                videoRemote.webkitEnterFullScreen()
            } else {
                videoRemote.webkitExitFullscreen()
            }
        } else {
            if (window.tsk_utils_have_webrtc4npapi()) {
                try {
                    if (window.__o_display_remote) window.__o_display_remote.setFullScreen(b_fs)
                } catch (e) {
                    document.getElementById("divVideo").setAttribute("className", b_fs ? "full-screen" : "normal-screen")
                }
            } else {
                document.getElementById("divVideo").setAttribute("className", b_fs ? "full-screen" : "normal-screen")
            }
        }
    }
    _handleButtonClick = (e) => {
    }
    _handleMenuClick = (e) => {
        switch (e.key) {
            case "1":
                this._sipCall("call-audio")
                break
            case "2":
                this._sipCall("call-audiovideo")
                break
            case "3":
                // this._sipShareScreen()
                break
            default:
                break
        }
    }
    render() {
        const {formatMessage} = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const state = this.state
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }
        let SIPWebRTCHttpSettings = state.SIPWebRTCHttpSettings

        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name,
            1: formatMessage({id: "LANG4263"})
        })

        const menu = (
            <Menu onClick={ this._handleMenuClick }>
                <Menu.Item key="1">Audio</Menu.Item>
                <Menu.Item key="2">Video</Menu.Item>
                { /* <Menu.Item key="3">Screen Share</Menu.Item> */}
            </Menu>
        )
        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG4263"}) }
                    isDisplay='hidden'
                />
                <div className="content">
                    <div className="top-Button">
                        <Button icon="setting" type="primary" size="default" disabled={ state.isWebRtcSupported } onClick={ this._advanceSettings }>
                            { formatMessage({id: "LANG229"}) }
                        </Button>
                    </div>
                    <Form>
                        <div className={ "display-block" }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG3015"}) }</span>
                            </div>
                            <div className="section-body">
                                {/* 是否注册 */}
                                <FormItem
                                    { ...formItemLayout }
                                    label="">
                                    <span id="txtRegStatus" dangerouslySetInnerHTML={{__html: state.txtRegStatusMsg}}></span>
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4231" />}>
                                            <span>{ formatMessage({id: "LANG4230"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtDisplayName', {
                                        rules: [],
                                        initialValue: SIPWebRTCHttpSettings.txtDisplayName || ""
                                    })(
                                        <Input></Input>
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG1064" />}>
                                            <span>{ formatMessage({id: "LANG85"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtPrivateIdentity', {
                                        rules: [],
                                        initialValue: SIPWebRTCHttpSettings.txtPrivateIdentity || ""
                                    })(
                                        <Input></Input>
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4233" />}>
                                            <span>{ formatMessage({id: "LANG4232"}) }</span>
                                        </Tooltip>
                                    )}>
                                    <Input name="txtPublicIdentity" className="hidden"></Input>
                                    { getFieldDecorator('txtPublicIdentity', {
                                        rules: [],
                                        initialValue: SIPWebRTCHttpSettings.txtPublicIdentity || ""
                                    })(
                                        <Input></Input>
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG1076" />}>
                                            <span>{ formatMessage({id: "LANG73"}) }</span>
                                        </Tooltip>
                                    )}>
                                    <Input type="password" name="txtPassword" className="hidden"></Input>
                                    { getFieldDecorator('txtPassword', {
                                        rules: [],
                                        initialValue: SIPWebRTCHttpSettings.txtPassword || ""
                                    })(
                                        <Input type="password"></Input>
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4244" />}>
                                            <span>{ formatMessage({id: "LANG4243"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtWebsocketServerUrl', {
                                        rules: [],
                                        initialValue: SIPWebRTCHttpSettings.txtWebsocketServerUrl || ""
                                    })(
                                        <Input disabled={ state.isTxtWebsocketServerUrl }></Input>
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                >

                                    {/* <Button type="primary" size="default" id="btnUnRegister" onClick={ this._sipUnRegister } disabled={ state.btnRegister ? false : true}>
                                                                            { formatMessage({id: "LANG4451"}) }
                                                                        </Button> */}
                                    <Button type="primary" size="default" disabled={ state.isWebRtcSupported } id="btnRegister" onClick={ state.btnRegister ? this._sipUnRegister : this._sipRegister }>
                                        { formatMessage({id: state.btnRegister ? "LANG4451" : "LANG1892"}) }
                                    </Button>
                                </FormItem>
                                {/* /是否注册 */}
                                {/* 呼叫控制 */}
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG4228"}) }</span>
                                </div>
                                <div className="section-body">
                                    <FormItem
                                        { ...formItemLayout }
                                        label="">
                                        { getFieldDecorator('txtCallStatus')(
                                            <span id="txtRegStatus" dangerouslySetInnerHTML={{ __html: state.txtCallStatusMsg }}></span>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4237" />}>
                                                <span>{ formatMessage({id: "LANG4236"}) }</span>
                                            </Tooltip>
                                        )}>
                                        { getFieldDecorator('txtPhoneNumber', {
                                            rules: [],
                                            initialValue: ""
                                        })(
                                            <div>
                                                <Input style={{width: "25%"}}></Input>
                                                {/* <Button type="primary" size="default" id="btnHangUp" disabled={ state.btnHangUp } onClick={ this._sipHangUp }>
                                                    { state.btnHangUpVal ? state.btnHangUpVal : formatMessage({id: "LANG97"}) }
                                                    </Button>
                                                    <Dropdown.Button
                                                        onClick={ this._handleButtonClick } overlay={ menu }
                                                        disabled={ state.btnCall }
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                       { state.btnCallVal }
                                                    </Dropdown.Button> */}
                                                <Button
                                                    style={{marginLeft: "12px", padding: "1px 16px", position: "relative", top: "1px", lineHeight: "19px"}}
                                                    icon="audio"
                                                    type="primary"
                                                    disabled={ state.btnCall }
                                                    onClick={ this._sipCall.bind(this, "call-audio") }
                                                >
                                                </Button>
                                                <Button
                                                    style={{padding: "1px 15px", lineHeight: "21px"}}
                                                    icon="video"
                                                    type="primary"
                                                    disabled={ state.btnCall }
                                                    onClick={ this._sipCall.bind(this, "call-audiovideo") }
                                                >
                                                </Button>
                                            </div>
                                        )}
                                    </FormItem>
                                </div>
                                <div id="divCallCtrl">
                                    <div id="divVideo" className='div-video'>
                                        <div id="divVideoRemote" className="remote_wrapper">
                                            <video className="video" id="video_remote" autoPlay="autoplay" width="50%" height="100%"
                                                style={{ opacity: 0, backgroundColor: "#f3f7fa"}}>
                                            </video>
                                            <div id="audioDiv" style={{position: "absolute", top: "120px", left: "19%", display: "none"}}>
                                                <div id="callStatus" className="sprite callingIcon"></div>
                                                <div id="callNumber"></div>
                                                <div id="callTime"></div>
                                                <Button id="callingHangup" icon="hangup" style={{ marginTop: "40px", padding: "0 16px", lineHeight: "23px", marginLeft: "8px"}} type="danger" size="default" onClick={ this._sipHangUp }>
                                                    {/* Close */}
                                                </Button>
                                            </div>

                                            {/* /呼叫控制 */}
                                            {/* 四个按钮 */}
                                            <div id='divCallOptions' className='call-options' style={{display: "none", marginTop: "0px", position: "absolute", top: "320px", left: "10%"}}>
                                                {/* <input type="Button" style="" id="btnFullScreen" value="FullScreen" disabled onClick='toggleFullScreen()' /> */}
                                                <Button icon="unmute" style={{ padding: "0 16px", lineHeight: "20px", position: "relative", top: "1px"}} type="primary" size="default" id="btnMute" onClick={ this._sipToggleMute }>
                                                    {/* state.btnMuteVal */}
                                                </Button>
                                                <Button icon="hold" style={{lineHeight: "23px", marginLeft: "8px", padding: "0 18px"}} type="primary" size="default" id="btnHoldResume" onClick={ this._sipToggleHoldResume }>
                                                    {/* state.btnHoldResumeVal */}
                                                </Button>
                                                <Button icon="keypad-up" style={{ padding: "0 16px", lineHeight: "23px", marginLeft: "8px"}} type="primary" size="default" id="btnKeyPad" onClick={ this._openKeyPad }>
                                                    {/* Transfer */}
                                                </Button>
                                                <Button icon="transfer" style={{ padding: "0 16px", lineHeight: "23px", marginLeft: "8px"}} type="primary" size="default" id="btnTransfer" onClick={ this._sipTransfer }>
                                                    {/* KeyPad */}
                                                </Button>
                                                <Button icon="hangup" style={{ padding: "0 16px", lineHeight: "23px", marginLeft: "8px"}} type="danger" size="default" id="hangup" onClick={ this._sipHangUp }>
                                                    {/* Close */}
                                                </Button>
                                            </div>
                                            {/* /四个按钮 */}
                                            {/* KeyPad Div */}
                                            <div id='divKeyPad' className='div-keypad' style={{ width: "250px", height: "240px", position: "relative", top: "-330px", left: "11%", zIndex: 1, visibility: "hidden" }}>
                                                <table style={{ width: "100%", height: "100%", background: "#303440" }}>
                                                    <tbody>
                                                        {/* <tr>
                                                            <td style={{ height: "40px", paddingBottom: "18px", background: "#303440", color: "white", fontSize: "15px", border: 0}}>
                                                            </td>
                                                        </tr> */}
                                                        <tr>
                                                            <td>
                                                                <Button size="small" style={{ paddingBottom: "18px", background: "#303440", color: "white", fontSize: "15px", border: 0}} onClick={ this._sipSendDTMF.bind(this, '1') }>1</Button>
                                                            </td>
                                                            <td>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '2') }>2
                                                                    <br/>ABC</Button>
                                                            </td>
                                                            <td style={{borderRight: 0}}>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '3') }>3
                                                                    <br/>DEF</Button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '4') }>4
                                                                    <br/>GHI</Button>
                                                            </td>
                                                            <td>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '5') }>5
                                                                    <br/>JKL</Button>
                                                            </td>
                                                            <td style={{borderRight: 0}}>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '6') }>6
                                                                    <br/>MNO</Button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '7') }>7
                                                                    <br/>PQRS</Button>
                                                            </td>
                                                            <td>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '8') }>8
                                                                    <br/>TUV</Button>
                                                            </td>
                                                            <td style={{borderRight: 0}}>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '9') }>9
                                                                    <br/>WXYZ</Button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ borderBottom: 0 }}>
                                                                <Button size="small" style={{ paddingTop: "18px", background: "#303440", color: "white", fontSize: "14px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '*') }>*</Button>
                                                            </td>
                                                            <td style={{ borderBottom: 0 }}>
                                                                <Button size="small" style={{ background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '0') }>0
                                                                    <br/>OPER</Button>
                                                            </td>
                                                            <td style={{borderRight: 0, borderBottom: 0}}>
                                                                <Button size="small" style={{ paddingTop: "18px", background: "#303440", color: "white", fontSize: "15px", border: 0 }} onClick={ this._sipSendDTMF.bind(this, '#') }>#</Button>
                                                            </td>
                                                        </tr>
                                                        {/* <tr>
                                                            <td colSpan={ 3 }>
                                                                <Button type="danger" size="small" style={{ paddingTop: "18px" }} onClick={ this._closeKeyPad }>close</Button>
                                                            </td>
                                                        </tr> */}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div id="divVideoLocalWrapper" className="local-stream local-stream-audio room-preview">
                                            <div id="divVideoLocal" className="previewvideo">
                                                <video className="video" width="100%" height="100%" id="video_local" autoPlay="autoplay" muted="true"
                                                    style={{ opacity: 0, backgroundColor: "#f3f7fa"}}>
                                                </video>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Glass Panel */}
                                <div id='divGlassPanel' className='glass-panel' style={{ visibility: "hidden" }}></div>
                            </div>
                        </div>
                    </Form>
                </div>
                {/* Audios */}
                <audio id="audio_remote" autoPlay="autoplay" />
                <audio id="ringtone" loop src="../../sounds/ringtone.wav" />
                <audio id="ringbacktone" loop src="../../sounds/ringbacktone.wav" />
                <audio id="dtmfTone" src="../../sounds/dtmf.wav" />
            </div>
        )
    }
}

UserWebrtc.defaultProps = {
    C: {
        divKeyPadWidth: 220
    }
}

module.exports = Form.create()(injectIntl(UserWebrtc))

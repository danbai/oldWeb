/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2016 Grandstream Networks, Inc.
 *
 */
import $ from 'jquery'
import api from './api'
import _ from 'underscore'

import React from 'react'
import cookie from 'react-cookie'
import { message, Modal } from 'antd'
import { browserHistory } from 'react-router'
import { FormattedMessage } from 'react-intl'

window.loginInterval = null
window.checkInterval = null

let confirm = Modal.confirm
let baseServerURl = api.apiHost
let userAgent = window.navigator.userAgent.toLowerCase()

let UCMGUI = function() {}

UCMGUI.prototype = {
    initConfig: {
        paths: {
            baseServerURl: '/cgi'
        },
        isNeedReboot: false,
        needReboot: "",
        errorCodes: {
            "-80": "LANG5658",
            "-77": "LANG5239", // CGICODE_BACKUP_LOST_CONFERENCE
            "-75": "LANG5062", // CGICODE_BACKUP_LOST_CONFERENCE
            "-74": "LANG5061", // CGICODE_BACKUP_LOST_EXTENSION
            "-73": "LANG2313", // CGICODE_BACKUP_NET_MODE_ERR
            "-72": "LANG1658", // CGICODE_BACKUP_LOST_FXO_NUM
            "-71": "LANG4829", // username doesn't exist
            "-68": "LANG4757", // Login_Restriction
            "-66": "LANG4464", // GOOGLE_CODE
            "-65": "LANG4453", // CGICODE_DOWNLOAD_ZC_TEMPLATE_LIST_FAILED
            "-64": "LANG4144", // CGICODE_UPDATE_ZC_MODEL_FAILED
            "-63": "LANG4383", // FAX_SENDING
            "-62": "LANG4383", // FAX_SENDING
            "-61": "LANG4308", //
            "-60": "LANG4307", // USER_SENDING_FAX
            "-59": "LANG4306", // SEND_FAX_MEMBER
            "-58": "LANG4221", // GOOGLE_CALENDAR
            "-57": "LANG4196", // CGICODE_FORGET_PASSWORD_NOEMAIL
            "-56": "LANG4194", // CGICODE_FORGET_PASSWORD_NOEMAIL
            "-51": "LANG920", // CGICODE_ANOTHER_TASK_IS_RUNNING
            "-50": "LANG3964", // CGICODE_COMMAND_CONTAINS_SENSITIVE_CHARACTERS
            "-49": "LANG2146", // CGICODE_FILE_EXISTED
            "-48": "LANG3870", // CGICODE_FILESYSTEM_READ_ONLY
            "-47": "LANG914", // "CGICODE_NO_PERMISSION"
            "-46": "LANG3468", // "CGICODE_EXCLUSIVE_FILE_OPERATION"
            "-45": "LANG3468", // "CGICODE_EXCLUSIVE_CMD_OPERATION"
            "-44": "LANG3467", // "CGICODE_CONSTRAINT_UNIQUE"
            "-43": "LANG3466", // "CGICODE_CONSTRAINT_FOREIGNKEY"
            "-42": "LANG3465", // "CGICODE_REOPERATION"
            "-41": "LANG3464", // "CGICODE_TOO_MUCH_USER_LOGINING"
            "-40": "LANG3212", // "CGICODE_SFTP_CONNETION_FAILED"
            "-39": "LANG3211", // "CGICODE_SFTP_PUT_FAILED"
            "-38": "LANG3210", // "CGICODE_SFTP_MKDIR_FAILED"
            "-37": "LANG3209", // "CGICODE_WRONG_ACCOUNT_OR_PASSWORD"
            "-36": "LANG3208", // "CGICODE_NO_SERVER_ADDRESS"
            "-35": "LANG3070", // "CGICODE_ROUTE_BAD_IFACE"
            "-34": "LANG3069", // "CGICODE_ROUTE_BAD_DEST"
            "-33": "LANG3068", // "CGICODE_ROUTE_DEL_CMD_ERR"
            "-32": "LANG3067", // "CGICODE_ROUTE_DEL_GW_CONFLICT"
            "-31": "LANG3066", // "CGICODE_ROUTE_DEL_DB_ERR"
            "-30": "LANG3065", // "CGICODE_ROUTE_BAD_GW"
            "-29": "LANG3064", // "CGICODE_ROUTE_SVIP_CONFLICT"
            "-28": "LANG3063", // "CGICODE_ROUTE_BAD_MASK"
            "-27": "LANG3062", // "CGICODE_ROUTE_ADD_ERR"
            "-26": "LANG2982", // "CGICODE_DB_GET_ERR"
            "-25": "LANG2981", // "CGICODE_DB_UPDATE_ERR"
            "-24": "LANG2980", // "CGICODE_DB_OP_ERR"
            "-23": "LANG2979", // "CGICODE_MOD_NOT_MATCH"
            "-22": "LANG2978", // "CGICODE_DIR_NOT_EXIST"
            "-21": "LANG968", // "CGICODE_DISK_FULL"
            "-20": "LANG2977", // "CGICODE_FILE_INVALID"
            "-19": "LANG2976", // "CGICODE_UNSUPPORT"
            "-18": "LANG2975", // "CGICODE_NO_SUCH_TARGET"
            "-17": "LANG2974", // "CGICODE_TARGET_IS_REQURIED"
            "-16": "LANG2973", // "CGICODE_NO_SUCH_KEY"
            "-15": "LANG2972", // "CGICODE_INVALID_VALUE"
            "-14": "LANG2971", // "CGICODE_TSHOOT_RUNNING"
            "-13": "LANG2970", // "CGICODE_TSHOOT_INVALID"
            "-12": "LANG2969", // "CGICODE_TSHOOT_INVALID_FILTER"
            "-11": "LANG2968", // "CGICODE_FILE_ISNT_EXIST"
            "-9": "LANG909", // "CGICODE_ERROR"
            "-8": "LANG2967", // "CGICODE_TIMEOUT"
            "-7": "LANG2966", // "CGICODE_CONNECTION_CLOSED"
            "-6": "LANG2965", // "CGICODE_COOKIE_ERROR"
            "-5": "LANG2983", // "CGICODE_NEED_AUTH"
            "-1": "LANG962", // "CGICODE_INVALID_PARAM"
            "1": "LANG912", // CGICODE_FILE_OP_UNKNOWN_TYPE
            "2": "LANG913", // CGICODE_FILE_OP_ERR_NORMAL
            "3": "LANG914", // CGICODE_FILE_OP_NOT_PERMITTED
            "4": "LANG915", // CGICODE_FILE_OP_TOO_LARGE
            "5": "LANG2984", // CGICODE_FILE_OP_ERR_PROCESSING
            "6": "LANG2985" // CGICODE_FILE_OP_ERR_PRE_CHECK
        },
        msie: /msie/.test(userAgent),
        mozilla: /firefox/.test(userAgent),
        webkit: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        safari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        ie9: /msie 9\.0/i.test(userAgent),
        ie10: /msie 10\.0/i.test(userAgent)
    },
    addZero: function(num) {
        const number = Math.floor(num)

        return ((number <= 9) ? ('0' + number) : (number + ''))
    },
    askExtensionRange: function(ext, start, end, disabled, extEnd, formatMessage) {
        let res = 0

        if (!ext || !/^([0-9]\d+)$/.test(ext)) {
            return true
        }

        if (disabled === 'yes') {
            return true
        }

        if (!start || !end) {
            return true
        }

        let nExt = Number(ext)
        let nExtEnd = Number(extEnd)

        if (nExt < start || nExt > end || nExtEnd > end) {
            let str = formatMessage({id: "LANG2132" }, { 0: ext, 1: start, 2: end })

            if (nExtEnd > end) {
                str = formatMessage({id: "LANG2132" }, { 0: nExtEnd, 1: start, 2: end })
            }

            confirm({
                content: <span dangerouslySetInnerHTML={{ __html: str }}></span>,
                onCancel: () => {},
                okText: formatMessage({id: "LANG727" }),
                cancelText: formatMessage({id: "LANG726" }),
                onOk: () => {
                    browserHistory.push('/pbx-settings/pbxGeneralSettings')
                }
            })

            return false
        }

        return true
    },
    formatSeconds: function(value) { // xxx seconds to 00:00:00 format
        let second = parseInt(value)

        if (!isNaN(second)) {
            let minute = 0
            let hour = 0

            if (second > 60) {
                minute = parseInt(second / 60)
                second = parseInt(second % 60)

                if (minute > 60) {
                    hour = parseInt(minute / 60)
                    minute = parseInt(minute % 60)
                }
            }

            return this.addZero(hour) + ':' + this.addZero(minute) + ':' + this.addZero(second)
        } else {
            return '00:00:00'
        }
    },
    errorHandler: function(data, callback, formatMessage, localeData) {
        let bool = true

        if (typeof data === "object") {
            let status = data.status,
                res = data.response

            if (res.need_apply && res.need_apply === "yes") {
                $("#applyChanges_div").addClass("display-inline").removeClass("hidden")
            }

            if (status && status !== 0) {
                // if (callback && typeof callback == "function") {
                //     callback.call()
                // }

                if (status === -5 || status === -6 || status === -7 || status === -8) {
                    message.destroy()

                    // TODO: Need Logout First
                    UCMGUI.prototype.loginFunction.switchToLoginPanel()
                } else {
                    message.destroy()

                    if (typeof formatMessage === 'function') {
                        message.error(formatMessage({ id: (this.initConfig.errorCodes[status] || 'LANG916') }))
                    } else if (localeData) {
                        message.error(localeData[(this.initConfig.errorCodes[status] || 'LANG916')])
                    } else {
                        message.error("Please pass the \'formatMessage\' function.")
                    }

                    setTimeout(function() {
                        if (callback && typeof callback === "function") {
                            callback.call()
                        }
                    }, 0)
                }

                bool = false
            } else if ((status === undefined || status === null || status === "") && status !== 0) {
                message.destroy()
                message.error(JSON.stringify(data))

                setTimeout(function() {
                        if (callback && typeof callback === "function") {
                            callback.call()
                        }
                    }, 0)

                bool = false
            }
        } else if (typeof data === 'number') {
            if (data === 0) {
                return bool
            } else {
                message.destroy()

                if (typeof formatMessage === 'function') {
                    message.error(formatMessage({ id: (this.initConfig.errorCodes[data] || 'LANG916') }))
                } else {
                    message.error("Please pass the \'formatMessage\' function.")
                }

                setTimeout(function() {
                    if (callback && typeof callback === "function") {
                        callback.call()
                    }
                }, 0)

                bool = false
            }
        } else {
            message.destroy()
            message.error(data)

            setTimeout(function() {
                if (callback && typeof callback === "function") {
                    callback.call()
                }
            }, 0)

            bool = false
        }

        return bool
    },
    isExist: {
        getList: function(type, formatMessage) {
            let response = [],
                responseDataHead = {
                    getAccountList: "extension",
                    getSIPAccountList: "extension",
                    getNumberList: "number",
                    getIVRNameList: "ivr_name",
                    getUserNameList: "user_name",
                    getVMgroupNameList: "vmgroup_name",
                    getRinggroupNameList: "ringgroup_name",
                    getPageNameList: "page_name",
                    getConferenceList: "extension",
                    getVoicemailList: "extension",
                    getMohNameList: "moh_name",
                    getPaginggroupNameList: "paginggroup_name",
                    getQueueNameList: "queue_name",
                    getDISANameList: "display_name",
                    getDahdiList: "dahdi",
                    getTrunkList: "trunks",
                    getOutboundRouteList: "outbound_routes",
                    getAnalogTrunkNameList: "analog_trunks",
                    getToneZoneSettings: "tonezone_settings",
                    getAnalogTrunkChanList: "analog_trunk_chans",
                    getPickupgroupNameList: "pickupgroup_name",
                    getFaxNameList: "fax_name",
                    getLanguage: "languages",
                    getQueueList: 'queues',
                    getRinggroupList: 'ringgroups',
                    getPaginggroupList: 'paginggroups',
                    getVMgroupList: 'vmgroups',
                    getFaxList: 'fax',
                    getDISAList: 'disa',
                    getIVRList: 'ivr',
                    getEventListNameList: "uri",
                    listPhonebookDn: "ldap_phonebooks",
                    getExtensionGroupList: "extension_groups",
                    getExtensionGroupNameList: "group_name",
                    getPrivilege: "privilege",
                    getOpermodeSettings: "opermode_settings",
                    getZeroConfigSettings: "",
                    getZeroconfigExtension: "extension",
                    getZeroConfigModel: "zc_models",
                    getEmailSettings: "email_settings",
                    getDirectoryList: 'directorys',
                    getDirectoryNameList: 'name',
                    getSLATrunkNameList: 'trunk_name',
                    getOutrtFailoverTrunkIdList: 'failover_a_trunk_index',
                    getCallbackNameList: "name",
                    getCallbackList: 'callback',
                    listTimeConditionOfficeTime: 'time_conditions_officetime',
                    listTimeConditionHoliday: 'time_conditions_holiday'
                }

            $.ajax({
                type: "post",
                url: api.apiHost,
                data: {
                    action: type
                },
                async: false,
                error: function(jqXHR, textStatus, errorThrown) {
                },
                success: function(data) {
                    let bool = UCMGUI.prototype.errorHandler(data, formatMessage)

                    if (bool) {
                        if (responseDataHead[type]) {
                            let list = data.response[responseDataHead[type]]

                            if (list && !_.isEmpty(list)) {
                                response = list
                            }
                        } else {
                            response = data.response
                        }
                    }
                }
            })

            return response
        },
        getRange: function(type, formatMessage) {
            let response = []

            $.ajax({
                type: "post",
                url: api.apiHost,
                data: {
                    "action": "getExtenPrefSettings"
                },
                async: false,
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // })
                },
                success: function(data) {
                    let bool = UCMGUI.prototype.errorHandler(data, formatMessage)

                    if (bool) {
                        let extensionPrefSettings = data.response.extension_pref_settings

                        if (extensionPrefSettings && extensionPrefSettings !== {}) {
                            if (type === 'extension') {
                                let ueStart = extensionPrefSettings.ue_start,
                                    ueEnd = extensionPrefSettings.ue_end

                                response = [(ueStart ? parseInt(ueStart) : undefined), (ueEnd ? parseInt(ueEnd) : undefined)]
                            } else if (type === 'conference') {
                                let mmStart = extensionPrefSettings.mm_start,
                                    mmEnd = extensionPrefSettings.mm_end

                                response = [(mmStart ? parseInt(mmStart) : undefined), (mmEnd ? parseInt(mmEnd) : undefined)]
                            } else if (type === 'ivr') {
                                let vmeStart = extensionPrefSettings.vme_start,
                                    vmeEnd = extensionPrefSettings.vme_end

                                response = [(vmeStart ? parseInt(vmeStart) : undefined), (vmeEnd ? parseInt(vmeEnd) : undefined)]
                            } else if (type === 'vmgroup') {
                                let vmgStart = extensionPrefSettings.vmg_start,
                                    vmgEnd = extensionPrefSettings.vmg_end

                                response = [(vmgStart ? parseInt(vmgStart) : undefined), (vmgEnd ? parseInt(vmgEnd) : undefined)]
                            } else if (type === 'ringgroup') {
                                let rgeStart = extensionPrefSettings.rge_start,
                                    rgeEnd = extensionPrefSettings.rge_end

                                response = [(rgeStart ? parseInt(rgeStart) : undefined), (rgeEnd ? parseInt(rgeEnd) : undefined)]
                            } else if (type === 'queue') {
                                let rgeStart = extensionPrefSettings.qe_start,
                                    rgeEnd = extensionPrefSettings.qe_end

                                response = [(rgeStart ? parseInt(rgeStart) : undefined), (rgeEnd ? parseInt(rgeEnd) : undefined)]
                            } else if (type === 'fax') {
                                let rgeStart = extensionPrefSettings.fax_start,
                                    rgeEnd = extensionPrefSettings.fax_end

                                response = [(rgeStart ? parseInt(rgeStart) : undefined), (rgeEnd ? parseInt(rgeEnd) : undefined)]
                            } else if (type === 'directory') {
                                let dirStart = extensionPrefSettings.directory_start,
                                    dirEnd = extensionPrefSettings.directory_end

                                response = [(dirStart ? parseInt(dirStart) : undefined), (dirEnd ? parseInt(dirEnd) : undefined)]
                            }

                            response.push(extensionPrefSettings.disable_extension_ranges, extensionPrefSettings.rand_password, extensionPrefSettings.weak_password)
                        }
                    }
                }
            })

            return response
        }
    },
    clearAllInterval: function() {
        if (window.loginInterval) {
            clearInterval(window.loginInterval)

            window.loginInterval = null
        }

        if (window.checkInterval) {
            clearInterval(window.checkInterval)

            window.checkInterval = null
        }

        if (window.checkSingleIpInterval) {
            clearInterval(window.checkSingleIpInterval)

            window.checkSingleIpInterval = null
        }
    },
    loginFunction: { // login function
        checkifLoggedIn: function(type, formatMessage) {
            let username = cookie.load("username")

            if (username) {
                $.ajax({
                    type: "post",
                    url: baseServerURl,
                    data: {
                        action: 'checkInfo',
                        user: username
                    },
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // if (window.loginInterval) {
                            UCMGUI.prototype.loginFunction.switchToLoginPanel()

                            // if (type === "ping") {
                            //     clearInterval(window.loginInterval)

                            //     window.loginInterval = null
                            // }
                        // }
                    },
                    success: function(data) {
                        if (data && data.status === 0) {
                            let currentTime = data.response.current_time,
                                needApply = data.response.need_apply,
                                needReboot = data.response.need_reboot,
                                applyChangesDiv = $("#applyChanges_div"),
                                zcScanProgress = data.response.zc_scan_progress,
                                zcScanOperator = data.response.zc_scan_operator

                            if (type === "ping") { // check user whether has logged per minute.
                                if (needApply && needApply === 'yes') {
                                    applyChangesDiv.addClass("display-inline").removeClass("hidden")
                                } else {
                                    applyChangesDiv.addClass("hidden").removeClass("display-inline")
                                }

                                // if (currentTime) {
                                //     let time = currentTime.split(' ');

                                //     time[1] = time[1].slice(0, time[1].length - 3);

                                //     $(".sysTime", top.frames["frameContainer"].document).text(time.join(' '));
                                // }

                                let privilege = localStorage.getItem('role')

                                if (formatMessage) {
                                    if (needReboot && needReboot !== UCMGUI.prototype.initConfig.needReboot && privilege === "privilege_0") {
                                        let confirmMsg = ''

                                        if (needReboot.indexOf("upgrade") !== -1) {
                                            confirmMsg += formatMessage({id: "LANG924"}).split('<br />')[0] + ' '
                                        }

                                        if (needReboot.indexOf("network") !== -1) {
                                            confirmMsg += formatMessage({id: "LANG925"}).split('<br />')[0] + ' '
                                        }

                                        if (needReboot.indexOf("TCPChanged") !== -1) {
                                            confirmMsg += formatMessage({id: "LANG926"}).split('<br />')[0] + ' '
                                        }

                                        if (needReboot.indexOf("PCMAOverride") !== -1) {
                                            confirmMsg += formatMessage({id: "LANG1716"}) + '!'
                                        }

                                        if (confirmMsg && !UCMGUI.prototype.initConfig.isNeedReboot) {
                                            message.destroy()
                                            UCMGUI.prototype.initConfig.isNeedReboot = true
                                            Modal.confirm({
                                                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2709"}, {0: confirmMsg})}}></span>,
                                                okText: 'OK',
                                                cancelText: 'Cancel',
                                                onOk: () => {
                                                    UCMGUI.prototype.loginFunction.confirmReboot()
                                                },
                                                onCancel: () => {
                                                    UCMGUI.prototype.initConfig.needReboot = needReboot
                                                }
                                            })
                                            return false
                                        }
                                    }

                                    window.ZEROCONFIG.init("", formatMessage, message)
                                }

                                // if (zcScanProgress === '0' && UCMGUI.prototype.initConfig.zcScanProgress === '1' && zcScanOperator === username) {
                                //     top.dialog.clearDialog()
                                //     message.destroy()
                                //     Modal.confirm({
                                //         content: formatMessage({id: "LANG917"}),
                                //         okText: 'OK',
                                //         cancelText: 'Cancel',
                                //         onOk: () => {
                                //             browserHistory.push('/value-added-features/zeroConfig')
                                //         }
                                //     })
                                // }

                                // UCMGUI.prototype.initConfig.zcScanProgress = zcScanProgress
                            }
                            // else {
                            //     if (!window.loginInterval) {
                            //         UCMGUI.prototype.loginFunction.checkTrigger(formatMessage)
                            //     }
                            // }
                        } else {
                            UCMGUI.prototype.loginFunction.switchToLoginPanel()

                            // if (type === "ping") {
                            //     clearInterval(window.loginInterval)

                            //     window.loginInterval = null
                            // }
                        }
                    }
                })
            } else { // if username is null, switch to login page.
                UCMGUI.prototype.loginFunction.switchToLoginPanel()
            }
        },
        switchToLoginPanel: function() {
            message.destroy()

            UCMGUI.prototype.clearAllInterval()

            // top.$.gsec = null

            cookie.remove('user_id')
            cookie.remove('username')
            cookie.remove("enable_module")

            localStorage.removeItem('role')
            localStorage.removeItem('user_id')
            localStorage.removeItem('username')
            localStorage.removeItem('first_login')
            localStorage.removeItem('featureLimits')
            localStorage.removeItem('is_strong_password')

            // $(document).unbind('mousemove mouseenter scroll keydown click dblclick');

            UCMGUI.prototype.initConfig.needReboot = ""
            UCMGUI.prototype.initConfig.isNeedReboot = false

            browserHistory.push('/login')

            // reset unconditionally
            // top.ZEROCONFIG.reset();
        },
        checkTrigger: function(formatMessage) {
            setTimeout(() => {
                UCMGUI.prototype.loginFunction.checkifLoggedIn('ping', formatMessage)
            }, 100)

            clearInterval(window.loginInterval)

            // check user whether has logged per minute.
            window.loginInterval = setInterval(function() {
                UCMGUI.prototype.loginFunction.checkifLoggedIn('ping', formatMessage)
            }, 60000)
        },
        confirmReboot: function(cb) {
            let reload = function() {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: api.apiHost,
                    data: {
                        action: 'getInfo'
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        setTimeout(reload, 5000)
                    },
                    success: function(data) {
                        if (data.status === 0) {
                            // top.dialog.clearDialog()
                            // UCMGUI.logoutFunction.doLogout();

                            UCMGUI.prototype.loginFunction.switchToLoginPanel()
                        }
                    }
                })
                // UCMGUI.prototype.loginFunction.switchToLoginPanel()
            }

            let reboot = function() {
                // delete interval while reboot.
                // if (top.$.gsec && top.$.gsec.stopSessionCheck) {
                //     top.$.gsec.stopSessionCheck()
                // }

                // $(document).unbind('mousemove mouseenter scroll keydown click dblclick')

                UCMGUI.prototype.clearAllInterval()

                // UCMGUI.prototype.initConfig.needReloadPage = true

                // top.dialog.dialogMessage({
                //     type: 'loading',
                //     content: $.lang("LANG832")
                // });

                $.ajax({
                    type: "GET",
                    url: api.apiHost + "action=rebootSystem",
                    success: function() {
                        setTimeout(reload, 30000)
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        setTimeout(reload, 30000)
                    }
                })
            }

            if (cb) {
                // top.dialog.dialogConfirm({
                //     confirmStr: $.lang("LANG835"),
                //     buttons: {
                //         ok: reboot
                //     }
                // })
            } else {
                reboot()
            }
        },
        confirmReset: function(url, formatMessage) {
            // clearInterval(window.loginInterval);
            // window.loginInterval = null;

            // UCMGUI.prototype.initConfig.needReloadPage = true

            message.loading(formatMessage({ id: "LANG836" }))

            let reload = function() {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: baseServerURl,
                    data: {
                        action: 'getInfo'
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        setTimeout(reload, 5000)
                    },
                    success: function(data) {
                        if (data.status === 0) {
                            message.destroy()

                            // UCMGUI.logoutFunction.doLogout()
                        }
                    }
                })
            }

            $.ajax({
                type: "GET",
                url: url,
                success: function(data) {
                    setTimeout(reload, 30000)
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    setTimeout(reload, 30000)
                }
            })
        }
    },
    logoutFunction: { // logout function
        doLogout: function(formatMessage, localeData) {
            let username = cookie.load('username')

            $.ajax({
                type: "get",
                dataType: "json",
                async: false,
                url: api.apiHost + "action=logout&user=" + username,
                error: function(jqXHR, textStatus, errorThrown) {},
                success: function(data) {
                    const bool = UCMGUI.prototype.errorHandler(data, null, formatMessage, localeData)

                    if (bool) {
                        UCMGUI.prototype.loginFunction.switchToLoginPanel()
                    }
                }
            })
        }
    },
    filterHiddenEle: function(ele) {
        if (typeof ele[0] !== "undefined") {
            if (ele.is(":hidden")) {
                return false
            } else if (ele.is("[readonly]")) {
                return false
            } else if (ele.is(":disabled")) {
                return false
            }
        }
        return true
    },
    transCheckboxVal: function(val) {
        if (val === true || val === false) {
            return val ? "yes" : "no"
        }
        return val
    },
    triggerCheckInfo: function(formatMessage) {
        const checkInfo = () => {
            let username = cookie.load("username")

            if (username) {
                $.ajax({
                    async: false,
                    type: "post",
                    url: api.apiHost,
                    data: {
                        action: 'checkInfo',
                        user: username
                    },
                    success: function(data) {
                        if (data && data.status === 0) {
                            let zcScanProgress = data.response.zc_scan_progress

                            if (zcScanProgress === '0') {
                                clearInterval(window.checkInterval)

                                window.checkInterval = null

                                message.destroy()

                                Modal.confirm({
                                    content: formatMessage({id: "LANG917"}),
                                    okText: 'OK',
                                    cancelText: 'Cancel',
                                    onOk: () => {
                                        browserHistory.push('/value-added-features/zeroConfig/devices/res')
                                    },
                                    onCancel: () => {
                                    }
                                })
                            } else {

                            }
                        }
                    },
                    error: function(e) {
                        console.log(e.statusText)
                    }
                })
            }
        }

        window.checkInterval = setInterval(function() {
                            checkInfo()
                        }, 60000)
    },
    getPrivilegeAction: function(actionData, privilegeData, actionType) {
        let action = actionData['action'],
            obj = {}

        if (action) {
            obj['action'] = action

            if (!actionType) {
                actionType = action
            }
        }

        if (actionType) {
            for (let attr in actionData) {
                if (actionData.hasOwnProperty(attr) && attr !== 'action') {
                    let privilegeAttrVal = privilegeData[attr],
                        privilegeActionArr = UCMGUI.prototype.getPrivilegeActionArr({
                            id: attr,
                            attrVal: privilegeAttrVal,
                            actionType: actionType,
                            val: actionData[attr]
                        })

                    if (privilegeActionArr[0]) {
                        obj[privilegeActionArr[0]] = privilegeActionArr[1]
                    }
                }
            }

            return obj
        } else {
            return actionData
        }
    },
    getPrivilegeActionArr: function(obj) {
        let attrVal = obj.attrVal,
            actionType = obj.actionType,
            id = obj.id,
            val = obj.val,
            actionArr = []
            // attrVal = (attrVal != undefined) ? attrVal.toString() : ""

        if (UCMGUI.prototype.checkPrivilege(attrVal, actionType)) {
            actionArr.push(id)
            actionArr.push(val)
        }

        return actionArr
    },
    checkPrivilege: function(privilege, actionType) {
        let privilegeVal = (privilege !== undefined) ? privilege.toString() : ''

        if (!!privilegeVal && !!actionType) {
            if (privilegeVal === "-1") {
                privilegeVal = 15
            }

            let privInt = parseInt(privilegeVal, 10)

            if (!isNaN(privInt)) {
                let privBinary = privInt.toString(2),
                    arr = privBinary.split(''),
                    str = ''

                for (let i = 0; i < 4 - arr.length; i++) {
                    str += 0
                }

                privBinary = str + privBinary

                let matchArr = privBinary.match(/\d/g)

                if (matchArr.length !== 0) {
                    let add = Number(matchArr[0]),
                        del = Number(matchArr[1]),
                        edit = Number(matchArr[2]),
                        read = Number(matchArr[3])

                    // /^add/.test(actionType)
                    // /^delete/.test(actionType)
                    // /^update/.test(actionType)

                    if ((actionType.indexOf("add") !== -1 && add === 1) ||
                        (actionType.indexOf("delete") !== -1 && del === 1) ||
                        (actionType.indexOf("delete") !== -1 && del === 1) ||
                        (read === 1)) {
                        return true
                    } else {
                        return false
                    }
                }
            }
        } else {
            return true
        }
    },
    transUploadcode: function(rescode) {
        if (!isNaN(rescode)) {
            let rescode = parseInt(rescode)

            switch (rescode) {
                case 0:
                    return "LANG961"
                case 236:
                    return "LANG962"
                case 238:
                    return "LANG963"
                case 239:
                    return "LANG964"
                case 240:
                    return "LANG965"
                case 241:
                    return "LANG966"
                case 242:
                    return "LANG967"
                case 243:
                case 253:
                    return "LANG968"
                case 244:
                case 254:
                    return "LANG969"
                case 245:
                    return "LANG970"
                case 246:
                    return "LANG971"
                case 247:
                case 248:
                    return "LANG972"
                case 249:
                case 250:
                case 255:
                    return "LANG973"
                case 251:
                    return "LANG974"
                case 252:
                    return "LANG975"
                default:
                    return "LANG976"
            }
        } else {
            return "LANG976"
        }
    },
    isIPv6: function(value) {
        return !value || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.indexOf("[") > -1 && value.indexOf("]") > -1) || (!(value.indexOf("[") > -1) && !(value.indexOf("]") > -1)))) ||
                /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value)
    },
    isIPv6NoPort: function(value) {
        return (/^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))$/.test(value) && (!(value.indexOf("[") !== -1) && !(value.indexOf("]") !== -1)))
    },
    makeSyncRequest: function(params) { // for making synchronus requests
        // usage ::  UCMGUI.makeSyncRequest ( { action :'getconfig', filename: 'something.conf' } ) // no need for call back function
        let s = $.ajax({
            type: 'POST',
            data: params,
            async: false,
            url: this.initConfig.paths.baseServerURl
        })

        return s.responseText
    },
    bySort: function(name, type) {
        return function(o, p) {
            let left = 0,
                right = 0,
                a = "",
                b = ""

            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name]
                b = p[name]

                if (a === b) {
                    return 0
                }

                if (type === "down") {
                    if (typeof a === typeof b) {
                        if ((a.indexOf(" Bytes") !== -1 || a.indexOf(" KB") !== -1 || a.indexOf(" MB") !== -1 || a.indexOf(" GB")) !== -1 && (b.indexOf(" Bytes") !== -1 || b.indexOf(" KB") !== -1 || b.indexOf(" MB") !== -1 || b.indexOf(" GB") !== -1)) {
                            a = UCMGUI.prototype.untranSize(a)
                            b = UCMGUI.prototype.untranSize(b)
                        }

                        if (a.length !== b.length) {
                            return a.length < b.length ? -1 : 1
                        }

                        if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                            left = parseInt(a, 10)
                            right = parseInt(b, 10)
                            return left < right ? -1 : 1
                        } else {
                            return a < b ? -1 : 1
                        }
                    }

                    return typeof a < typeof b ? -1 : 1
                } else {
                    if (typeof a === typeof b) {
                        if ((a.indexOf(" Bytes") !== -1 || a.indexOf(" KB") !== -1 || a.indexOf(" MB") !== -1 || a.indexOf(" GB")) !== -1 && (b.indexOf(" Bytes") !== -1 || b.indexOf(" KB") !== -1 || b.indexOf(" MB") !== -1 || b.indexOf(" GB") !== -1)) {
                            a = UCMGUI.prototype.untranSize(a)
                            b = UCMGUI.prototype.untranSize(b)
                        }

                        if (a.length !== b.length) {
                            return a.length > b.length ? -1 : 1
                        }

                        if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                            left = parseInt(a, 10)
                            right = parseInt(b, 10)
                            return left > right ? -1 : 1
                        } else {
                            return a > b ? -1 : 1
                        }
                    }

                    return typeof a > typeof b ? -1 : 1
                }
            }
        }
    },
    tranSize: function(s) {
        let size = parseFloat(s),
            rank = 0,
            rankchar = 'Bytes'

        while (size > 1024) {
            size = size / 1024
            rank++
        }

        if (rank === 1) {
            rankchar = 'KB'
        } else if (rank === 2) {
            rankchar = 'MB'
        } else if (rank === 3) {
            rankchar = 'GB'
        }

        return size.toFixed(2) + ' ' + rankchar
    },
    untranSize: function(size) {
        if (size.indexOf(' Bytes') !== -1) {
            size = size.replace(' Bytes', '')
        } else if (size.indexOf(' KB') !== -1) {
            size = size.replace(' KB', '')
            size = parseFloat(size)
            size = size * 1024
        } else if (size.indexOf(' MB') !== -1) {
            size = size.replace(' MB', '')
            size = parseFloat(size)
            size = size * 1024 * 1024
        } else if (size.indexOf(' GB') !== -1) {
            size = size.replace(' GB', '')
            size = parseFloat(size)
            size = size * 1024 * 1024
        }

        return size
    },
    ObjectArray: {
        find: function(item, value, ary) {
            if (!item || !value || !ary) {
                return
            }

            let length = ary.length,
                i = 0,
                response = {}

            for (i; i < length; i++) {
                if (value === ary[i][item]) {
                    response = ary[i]
                    break
                }
            }

            return response
        }
    },
    serialize: function(data) {
        let arr = []
        for (let temp in data) {
            if (data.hasOwnProperty(temp)) {
                arr.push(temp + '=' + data[temp])
            }
        }
        return arr.join('&')
    },
    rChop: function(b, c) { // chop a string from the end of the string
        if (b.indexOf(c) === -1 || !b.endsWith(c)) {
            return String(b) // actually we should be doing 'return this;' but for some reason firebug is reporting the returned string as an object
        }
        return b.substr(0, b.length - c.length)
    },
    afterChar: function(j, k) {
        if (k.length > 1) {
            alert('String.afterChar() should be used with a single character')
            return null
        }
        let v = j.indexOf(k)
        if (v === -1) {
            return ''
        }
        return j.substring(v + 1)
    },
    beforeChar: function(j, k) {
        if (k.length > 1) {
            alert('String.beforeChar() should be used with a single character')
            return null
        }
        let v = j.indexOf(k)
        if (v === -1) {
            return ''
        }
        return j.substring(0, v)
    },
    betweenXY: function(R, X, Y) {
        if (X.length > 1 || Y.length > 1) {
            alert('String.betweenXY() accepts single character arguments')
            return null
        }
        let t = UCMGUI.prototype.afterChar(R, X)
        return UCMGUI.prototype.beforeChar(t, Y)
    },
    urlFunction: {
        // Match to the webcgi escape function
        escape: function(str) {
            let ret = "",
                strSpecial = "!\"#$%&@'()*+,/:;<=>?[]^`{|}~"

            for (let i = 0; i < str.length; i++) {
                let chr = str.charAt(i),
                    c = chr.charCodeAt(0)

                if (strSpecial.indexOf(chr) !== -1) {
                    ret += "%" + c.toString(16)
                } else {
                    ret += chr
                }
            }

            return ret
        },

        // Match to the webcgi decode function
        decode: function(val) {
            if (val === undefined || val === "") {
                return ""
            }

            val = val.replace(/\+/g, '%20')

            let str = val.split("%"),
                cval = str[0]

            for (let i = 1; i < str.length; i++) {
                cval += String.fromCharCode(parseInt(str[i].substring(0, 2), 16)) + str[i].substring(2)
            }

            return cval
        }
    },
    jqueryIdle: function() {
        // idle.js (c) Alexios Chouchoulas 2009
        // Released under the terms of the GNU Public License version 2.0 (or later).
        let _API_JQUERY = 1
        let _API_PROTOTYPE = 2
        let _api

        let _idleTimeout = 30000 // 30 seconds
        let _awayTimeout = 600000 // 10 minutes

        let _idleNow = false
        let _idleTimestamp = null
        let _idleTimer = null
        let _awayNow = false
        let _awayTimestamp = null
        let _awayTimer = null

        function setIdleTimeout(ms) {
            _idleTimeout = ms
            _idleTimestamp = new Date().getTime() + ms
            if (_idleTimer !== null) {
                clearTimeout(_idleTimer)
            }
            _idleTimer = setTimeout(_makeIdle, ms + 50)
            // console.log('idle in ' + ms + ', tid = ' + _idleTimer)
        }

        function setAwayTimeout(ms) {
            _awayTimeout = ms
            _awayTimestamp = new Date().getTime() + ms
            if (_awayTimer !== null) {
                clearTimeout(_awayTimer)
            }
            _awayTimer = setTimeout(_makeAway, ms + 50)
            // console.log('away in ' + ms)
        }

        function _makeIdle() {
            let t = new Date().getTime()
            if (t < _idleTimestamp) {
                // console.log('Not idle yet. Idle in ' + (_idleTimestamp - t + 50))
                _idleTimer = setTimeout(_makeIdle, _idleTimestamp - t + 50)
                return
            }
            // console.log('** IDLE **')
            _idleNow = true

            try {
                if (document.onIdle) document.onIdle()
            } catch (err) {}
        }

        function _makeAway() {
            let t = new Date().getTime()
            if (t < _awayTimestamp) {
                // console.log('Not away yet. Away in ' + (_awayTimestamp - t + 50));
                _awayTimer = setTimeout(_makeAway, _awayTimestamp - t + 50)
                return
            }
            // console.log('** AWAY **')
            _awayNow = true

            try {
                if (document.onAway) document.onAway()
            } catch (err) {}
        }

        function _active(event) {
            let t = new Date().getTime()
            _idleTimestamp = t + _idleTimeout
            _awayTimestamp = t + _awayTimeout
            // console.log('not idle.');

            if (_idleNow) {
                setIdleTimeout(_idleTimeout)
            }

            if (_awayNow) {
                setAwayTimeout(_awayTimeout)
            }

            try {
                // console.log('** BACK **')
                if ((_idleNow || _awayNow) && document.onBack) document.onBack(_idleNow, _awayNow)
            } catch (err) {}

            _idleNow = false
            _awayNow = false
        }

        // TODO [AH] Need to rewrite this plug-in... this isn't good structure
        function monitorIdle(doc) {
            if (doc !== null) {
                $(doc).on('mousemove mouseenter scroll keydown click dblclick', _active)
            }
        }

        function _initJQuery() {
            _api = _API_JQUERY
            let doc = $(document)
            doc.ready(function() {
                doc.mousemove(_active)

                try {
                    doc.mouseenter(_active)
                } catch (err) {}
                try {
                    doc.scroll(_active)
                } catch (err) {}
                try {
                    doc.keydown(_active)
                } catch (err) {}
                try {
                    doc.click(_active)
                } catch (err) {}
                try {
                    doc.dblclick(_active)
                } catch (err) {}
            })
        }

        _initJQuery()
    },
    GSession: function() {
        let _self_ = this,
            // fields
            _idle_state = "",
            _isRetry = false,
            _checking_timer = null,
            _repeatCheck = false

        this.idleState = function(val) {
            if (val === undefined) {
                return this._idle_state
            } else {
                this._idle_state = val
            }
        }

        this.repeatCheck = function() {
            return this._repeatCheck
        }

        this.retrying = function(val) {
            if (val !== undefined) {
                return this._isRetry
            } else {
                this._isRetry = val
            }
        }

        this.repeatCheckSession = function() {
            _self_.checkSession(true)
        }

        this.checkSession = function(repeat) {
            this._repeatCheck = repeat

            $.ajax({
                type: 'POST',
                url: baseServerURl,
                data: 'action=ping',
                success: function(data) {
                    if (data.status !== 0) {
                        _self_.stopSessionCheck()

                        message.destroy()

                        UCMGUI.prototype.loginFunction.switchToLoginPanel()

                        return true
                    } else if (_self_.retrying()) {}

                    if (_self_.repeatCheck()) {
                        if (_self_.idleState() === "") {
                            _checking_timer = setTimeout(_self_.repeatCheckSession, 30000) // repeat every 30 seconds when in active use
                        }
                    }

                    _self_.retrying(false)
                }
            })
        }

        this.stopSessionCheck = function() {
            clearTimeout(_checking_timer)
            _checking_timer = null
        }

        // set idle state
        UCMGUI.prototype.jqueryIdle.setIdleTimeout(1000 * 30) // put script into idle after 30 seconds
        UCMGUI.prototype.jqueryIdle.setAwayTimeout(1000 * 5) // 5 seconds

        // let doc = top.frames["frameContainer"].document

        document.onIdle = function() {
            _self_.idleState("idle")
        }

        document.onAway = function() {
            _self_.idleState("away")
            _self_.stopSessionCheck()
        }

        document.onBack = function(isIdle, isAway) {
            _self_.idleState("")
            if ($.cookie('username')) {
                _self_.checkSession(true)
            }
        }

        _self_.checkSession(true)
    },
    toggleErrorMessage: function(e, element) {
        let target = element ? element : e.target

        setTimeout(() => {
            if (target) {
                let errorMessage = $(target).parents('.ant-form-item').find('.ant-form-explain')

                if (errorMessage && errorMessage.length) {
                    errorMessage = errorMessage[0]

                    target.onfocus = () => {
                        errorMessage.style.display = "inline-block"
                    }

                    target.onblur = () => {
                        errorMessage.style.display = "none"
                    }

                    target.onmouseover = () => {
                        errorMessage.style.display = "inline-block"
                    }

                    target.onmouseleave = () => {
                        errorMessage.style.display = "none"
                    }
                }
            }
        }, 100)

        if (!e || !e.target) {
            return e
        }

        return target.type === 'checkbox' ? target.checked : target.value
    }
}

module.exports = new UCMGUI()

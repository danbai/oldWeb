/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var loginInterval = null;

(function($) {

    var userAgent = window.navigator.userAgent.toLowerCase();

    window.UCMGUI = {
        config: {
            paths: {
                baseServerURl: '/cgi'
            },
            zeroconfigErr: {
                "1": "LANG918",
                "2": "LANG919",
                "3": "LANG920",
                "4": "LANG2538",
                "5": "LANG4389"
            },
            zcScanProgress: null,
            monthArr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            baseModelName: 'UCM6102',
            needReboot: '',
            needReloadPage: false,
            promptNetHDLC: false,
            maxExtension: 500,
            maxFXSExtension: 2,
            maxFailoverTrunk: 3,
            maxTimeCondition: 1000000,
            msie: /msie/.test(userAgent),
            mozilla: /firefox/.test(userAgent),
            webkit: /webkit/.test(userAgent),
            opera: /opera/.test(userAgent),
            safari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
            ie6: (typeof document.body.style.maxHeight === "undefined"),
            ie7: /msie 7\.0/i.test(userAgent),
            ie8: /msie 8\.0/i.test(userAgent),
            ie9: /msie 9\.0/i.test(userAgent),
            ie10: /msie 10\.0/i.test(userAgent),
            userPage: 1, // TODO remove, add this only temporary
            FXS_PORTS_DETECTED: [], // TODO remove, add this only temporary
            userBy: '', // TODO remove, add this only temporary
            userSort: '', // TODO remove, add this only temporary
            directories: { // TODO remove, add this only temporary
                AGIBIN: "/app/asterisk/var/lib/asterisk/agi-bin/",
                ConfigBkp: "/app/asterisk/var/lib/asterisk/gui_backups/",
                ConfigBkp_dldPath: "/app/asterisk/var/lib/asterisk/static-http/config/private/bkps/",
                MOH: "/app/asterisk/var/lib/asterisk/moh/",
                Sounds: "/app/asterisk/var/lib/asterisk/sounds/",
                app_dahdi_genconf: "dahdi_genconf",
                app_flashupdate: "flashupdate",
                app_mISDNscan: "misdn-init scan",
                asteriskConfig: "/app/asterisk/etc/asterisk/",
                astspooldir: "/app/asterisk/var/spool/asterisk/",
                astvarlibdir: "/app/asterisk/var/lib/asterisk/",
                guiInstall: "/app/asterisk/var/lib/asterisk/static-http/config/",
                menusRecord: "/app/asterisk/var/lib/asterisk/sounds/record/",
                output_SysInfo: "./sysinfo_output.html",
                script_ListFiles: "sh /app/asterisk/var/lib/asterisk/scripts/listfiles",
                script_NetworkSettings: "sh /app/asterisk/var/lib/asterisk/scripts/networking.sh",
                script_Registerg729: "sh /app/asterisk/var/lib/asterisk/scripts/registerg729.sh",
                script_cpsysconf: "sh /app/asterisk/var/lib/asterisk/scripts/cpsysconf.sh",
                script_detectdahdi: "sh /app/asterisk/var/lib/asterisk/scripts/detectdahdi.sh",
                script_dldsoundpack: "sh /app/asterisk/var/lib/asterisk/scripts/dldsoundpack",
                script_generateZaptel: "sh /app/asterisk/var/lib/asterisk/scripts/editzap.sh",
                script_generatemISDN_init: "sh /app/asterisk/var/lib/asterisk/scripts/editmisdn.sh",
                script_mastercsvexists: "sh /app/asterisk/var/lib/asterisk/scripts/mastercsvexists",
                script_restoreBackup: "sh /app/asterisk/var/lib/asterisk/scripts/restorebackup",
                script_takeBackup: "sh /app/asterisk/var/lib/asterisk/scripts/takebackup",
                scripts: "/app/asterisk/var/lib/asterisk/scripts/",
                voicemails_dir: "/app/asterisk/var/spool/asterisk/voicemail/default/"
            },
            AsteriskVersion: "1.8.9", // TODO remove, add this only temporary
            AsteriskBranch: "1.8", // TODO remove, add this only temporary
            VersionCache: { // TODO remove, add this only temporary
                "1.6.0": true,
                "1.6.1": true
            },
            FileCache: {}, // TODO remove, add this only temporary
            model_info: {},
            featureLimits: {},
            countryObj: {
                "US": {
                    "languages": "en-US",
                    "englishName": "United States",
                    "localName": "English"
                },
                "CN": {
                    "languages": "zh-CN",
                    "englishName": "China",
                    "localName": "简体中文"
                },
                "TW": {
                    "languages": "zh-TW",
                    "englishName": "Taiwan",
                    "localName": "正體中文"
                },
                "ES": {
                    "languages": "es-ES",
                    "englishName": "Spain",
                    "localName": "Español"
                },
                "FR": {
                    "languages": "fr-FR",
                    "englishName": "France",
                    "localName": "Français"
                },
                "PT": {
                    "languages": "pt-PT",
                    "englishName": "Portugal",
                    "localName": "Português"
                },
                "RU": {
                    "languages": "ru",
                    "englishName": "Russia",
                    "localName": "Русский"
                },
                "IT": {
                    "languages": "it-IT",
                    "englishName": "Italy",
                    "localName": "Italiano"
                },
                "PL": {
                    "languages": "pl",
                    "englishName": "Poland",
                    "localName": "Polski"
                },
                "DE": {
                    "languages": "de-DE",
                    "englishName": "Germany",
                    "localName": "Deutsch"
                }
            },
            ddlData: [],
            version: null,
            timeOut: null,
            errorCodes: {
                "-77": "LANG5239", //CGICODE_BACKUP_LOST_CONFERENCE
                "-75": "LANG5062", //CGICODE_BACKUP_LOST_CONFERENCE
                "-74": "LANG5061", //CGICODE_BACKUP_LOST_EXTENSION
                "-73": "LANG2313", //CGICODE_BACKUP_NET_MODE_ERR
                "-72": "LANG1658", //CGICODE_BACKUP_LOST_FXO_NUM
                "-71": "LANG4829", //username doesn't exist
                "-68": "LANG4757", //Login_Restriction
                "-66": "LANG4464", //GOOGLE_CODE
                "-65": "LANG4453", //CGICODE_DOWNLOAD_ZC_TEMPLATE_LIST_FAILED
                "-64": "LANG4144", //CGICODE_UPDATE_ZC_MODEL_FAILED
                "-63": "LANG4383", //FAX_SENDING
                "-62": "LANG4383", //FAX_SENDING
                "-61": "LANG4308", //
                "-60": "LANG4307", //USER_SENDING_FAX
                "-59": "LANG4306", //SEND_FAX_MEMBER
                "-58": "LANG4221", //GOOGLE_CALENDAR
                "-57": "LANG4196", //CGICODE_FORGET_PASSWORD_NOEMAIL
                "-56": "LANG4194", //CGICODE_FORGET_PASSWORD_NOEMAIL
                "-51": "LANG920", //CGICODE_ANOTHER_TASK_IS_RUNNING
                "-50": "LANG3964", //CGICODE_COMMAND_CONTAINS_SENSITIVE_CHARACTERS
                "-49": "LANG2146", //CGICODE_FILE_EXISTED
                "-48": "LANG3870", //CGICODE_FILESYSTEM_READ_ONLY
                "-47": "LANG914", //"CGICODE_NO_PERMISSION"
                "-46": "LANG3468", //"CGICODE_EXCLUSIVE_FILE_OPERATION"
                "-45": "LANG3468", //"CGICODE_EXCLUSIVE_CMD_OPERATION"
                "-44": "LANG3467", //"CGICODE_CONSTRAINT_UNIQUE"
                "-43": "LANG3466", //"CGICODE_CONSTRAINT_FOREIGNKEY"
                "-42": "LANG3465", //"CGICODE_REOPERATION"
                "-41": "LANG3464", //"CGICODE_TOO_MUCH_USER_LOGINING"
                "-40": "LANG3212", //"CGICODE_SFTP_CONNETION_FAILED"
                "-39": "LANG3211", //"CGICODE_SFTP_PUT_FAILED"
                "-38": "LANG3210", //"CGICODE_SFTP_MKDIR_FAILED"
                "-37": "LANG3209", //"CGICODE_WRONG_ACCOUNT_OR_PASSWORD"
                "-36": "LANG3208", //"CGICODE_NO_SERVER_ADDRESS"
                "-35": "LANG3070", //"CGICODE_ROUTE_BAD_IFACE"
                "-34": "LANG3069", //"CGICODE_ROUTE_BAD_DEST"
                "-33": "LANG3068", //"CGICODE_ROUTE_DEL_CMD_ERR"
                "-32": "LANG3067", //"CGICODE_ROUTE_DEL_GW_CONFLICT"
                "-31": "LANG3066", //"CGICODE_ROUTE_DEL_DB_ERR"
                "-30": "LANG3065", //"CGICODE_ROUTE_BAD_GW"
                "-29": "LANG3064", //"CGICODE_ROUTE_SVIP_CONFLICT"
                "-28": "LANG3063", //"CGICODE_ROUTE_BAD_MASK"
                "-27": "LANG3062", //"CGICODE_ROUTE_ADD_ERR"
                "-26": "LANG2982", //"CGICODE_DB_GET_ERR"
                "-25": "LANG2981", //"CGICODE_DB_UPDATE_ERR"
                "-24": "LANG2980", //"CGICODE_DB_OP_ERR"
                "-23": "LANG2979", //"CGICODE_MOD_NOT_MATCH"
                "-22": "LANG2978", //"CGICODE_DIR_NOT_EXIST"
                "-21": "LANG968", //"CGICODE_DISK_FULL"
                "-20": "LANG2977", //"CGICODE_FILE_INVALID"
                "-19": "LANG2976", //"CGICODE_UNSUPPORT"
                "-18": "LANG2975", //"CGICODE_NO_SUCH_TARGET"
                "-17": "LANG2974", //"CGICODE_TARGET_IS_REQURIED"
                "-16": "LANG2973", //"CGICODE_NO_SUCH_KEY"
                "-15": "LANG2972", //"CGICODE_INVALID_VALUE"
                "-14": "LANG2971", //"CGICODE_TSHOOT_RUNNING"
                "-13": "LANG2970", //"CGICODE_TSHOOT_INVALID"
                "-12": "LANG2969", //"CGICODE_TSHOOT_INVALID_FILTER"
                "-11": "LANG2968", //"CGICODE_FILE_ISNT_EXIST"
                "-9": "LANG909", //"CGICODE_ERROR"
                "-8": "LANG2967", //"CGICODE_TIMEOUT"
                "-7": "LANG2966", //"CGICODE_CONNECTION_CLOSED"
                "-6": "LANG2965", //"CGICODE_COOKIE_ERROR"
                "-5": "LANG2983", //"CGICODE_NEED_AUTH"
                "-1": "LANG962", //"CGICODE_INVALID_PARAM"
                "1": "LANG912", //CGICODE_FILE_OP_UNKNOWN_TYPE
                "2": "LANG913", //CGICODE_FILE_OP_ERR_NORMAL
                "3": "LANG914", //CGICODE_FILE_OP_NOT_PERMITTED
                "4": "LANG915", //CGICODE_FILE_OP_TOO_LARGE
                "5": "LANG2984", //CGICODE_FILE_OP_ERR_PROCESSING
                "6": "LANG2985", //CGICODE_FILE_OP_ERR_PRE_CHECK
                "8": "LANG5403" //CGICODE_FILE_OP_ERR_PRE_CHECK
            },
            privilegeObj: {
                "13": "readonly",
                "1": "readonly",
                "12": "none",
                "0": "none"
            }
        },

        addZero: function(num) {
            var num = Math.floor(num);

            return ((num <= 9) ? ("0" + num) : num);
        },

        checkBrowserIfIE6: function() {
            if (UCMGUI.config.ie6) {
                alert($.lang("LANG2215"));
            }
        },

        getBasicInfo: function() {
            var config = UCMGUI.config,
                countryObj = config.countryObj,
                model_info = config.model_info,
                fxsPorts = config.FXS_PORTS_DETECTED,
                ddlData = config.ddlData,
                version = config.version;

            $.ajax({
                type: "GET",
                dataType: "json",
                url: "locale/country2lang.json",
                async: false,
                success: function(data) {
                    if (!$.isEmptyObject(data)) {
                        countryObj = data;
                    }
                }
            });

            $.ajax({
                type: "POST",
                dataType: "json",
                async: false,
                url: "../cgi",
                data: {
                    action: 'getInfo'
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    if (data.status === 0) {
                        model_info = data.response;
                        var numPri = model_info.num_pri,
                            numPri = numPri ? Number(numPri) : 0,
                            modelName = model_info.model_name;
                        model_info.num_pri = numPri;

                        if (numPri <= 0) {
                            if(modelName && modelName.toLowerCase() && modelName.toLowerCase().indexOf("ucm62") != -1) {
                                UCMGUI.config.maxExtension = 800;
                            } else {
                                UCMGUI.config.maxExtension = 500;
                            }
                        } else {
                            UCMGUI.config.maxExtension = 2000;
                        }

                        if (model_info.country) {
                            var langObj = countryObj[model_info.country.toUpperCase()];

                            if (!$.cookie('locale') && langObj) {
                                $.cookie('locale', langObj.languages, {
                                    expires: 365
                                });
                            }
                        }

                        if (model_info.prog_version) {
                            version = model_info.prog_version.split(".").join("") || Math.random();
                        }

                        if (model_info.num_fxs) {
                            var length = parseInt(model_info.num_fxs),
                                fxoPortsLength = model_info.num_fxo ? parseInt(model_info.num_fxo) : 0,
                                i = 1;

                            for (i; i <= length; i++) {
                                fxsPorts.push((fxoPortsLength + i) + '');
                            }
                        }
                    }
                }
            });
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "../cgi",
                data: {
                    action: 'getFeatureLimits'
                },
                async: true,
                success: function(data) {
                    if (data.status === 0) {
                        var res = data.response;

                        if (res) {
                            var featureLimits = res.feature_limits
                            UCMGUI.config.featureLimits = featureLimits;
                        }
                    }
                }
            });
            $.each(countryObj, function(index, value) {
                var lang = {};

                if ($.cookie('locale') == value.languages) {
                    lang.selected = true;
                }

                lang.text = value.localName;
                lang.value = value.languages;
                lang.localeDirection = value.localeDirection;
                // lang.imageSrc = "images/" + value.languages + ".png";

                ddlData.push(lang);
            });

            if (model_info.logo_url.toLocaleLowerCase().indexOf("http") == -1) {
                model_info.logo_url = "http://" + model_info.logo_url;
            }

            // $.each(model_info, function(item, value) {
            //     $.cookie(item, value, { expires: 365 });
            // });

            UCMGUI.config.countryObj = countryObj,
            UCMGUI.config.model_info = model_info,
            UCMGUI.config.FXS_PORTS_DETECTED = fxsPorts,
            UCMGUI.config.ddlData = ddlData,
            UCMGUI.config.version = version,
            UCMGUI.config.baseModelName = model_info.model_name;
        },

        isFunction: function(fn) { // if the parameter is a function
            return !!fn && !fn.nodeName && fn.constructor != String && fn.constructor != RegExp &&
                fn.constructor != Array && /function/i.test(fn + "");
        },

        loginFunction: { // login function
            checkifLoggedIn: function(type) {
                var username = $.cookie('username');

                if (username) {
                    $.ajax({
                        type: "post",
                        url: "cgi",
                        data: {
                            action: 'checkInfo',
                            user: username
                        },
                        async: false,
                        error: function(jqXHR, textStatus, errorThrown) {
                            if (loginInterval) {
                                top.dialog.clearDialog();

                                UCMGUI.loginFunction.switchToLoginPanel();

                                if (type === "ping") {
                                    clearInterval(loginInterval);

                                    loginInterval = null;
                                }
                            }
                        },
                        success: function(data) {
                            if (data && data.status == 0) {
                                var currentTime = data.response.current_time,
                                    needApply = data.response.need_apply,
                                    needReboot = data.response.need_reboot,
                                    zcScanProgress = data.response.zc_scan_progress,
                                    zcScanOperator = data.response.zc_scan_operator;
                                if (type === "ping") { // check user whether has logged per minute.
                                    var applyChanges = $("#applyChanges_Button", top.frames["frameContainer"].document),
                                        lineButton = $("#line_Button", top.frames["frameContainer"].document);
                                    
                                    if (needApply && needApply == 'yes') {
                                        top.$.cookie("needApplyChange", "yes");

                                        if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
                                            applyChanges.css("visibility", "visible");
                                            lineButton.css("visibility", "visible");
                                            // applyChanges.effect("shake", {
                                            //  direction: "up", distance: 2, times: 10000
                                            // }, 400);
                                        }
                                    } else {
                                        top.$.cookie("needApplyChange", "no");

                                        if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
                                            applyChanges.css("visibility", "hidden");
                                            lineButton.css("visibility", "hidden");
                                            // applyChanges.effect("shake", {
                                            //  direction: "up", distance: 2, times: 10000
                                            // }, 400);
                                        }
                                    }

                                    if (currentTime) {
                                        var time = currentTime.split(' ');

                                        time[1] = time[1].slice(0, time[1].length - 3);

                                        $(".sysTime", top.frames["frameContainer"].document).text(time.join(' '));
                                    }

                                    if (needReboot && needReboot !== UCMGUI.config.needReboot) {
                                        var confirmMsg = '';

                                        if (needReboot.contains("upgrade")) {
                                            confirmMsg += $.lang("LANG924").split('<br />')[0] + ' ';
                                        }

                                        if (needReboot.contains("network")) {
                                            confirmMsg += $.lang("LANG925").split('<br />')[0] + ' ';
                                        }

                                        if (needReboot.contains("TCPChanged")) {
                                            confirmMsg += $.lang("LANG926").split('<br />')[0] + ' ';
                                        }

                                        if (needReboot.contains("PCMAOverride")) {
                                            confirmMsg += $.lang("LANG1716") + '!';
                                        }

                                        if (confirmMsg) {
                                            top.dialog.clearDialog();

                                            top.dialog.dialogConfirm({
                                                confirmStr: $.lang('LANG2709').format(confirmMsg),
                                                buttons: {
                                                    ok: function() {
                                                        UCMGUI.loginFunction.confirmReboot();
                                                    },
                                                    cancel: function() {
                                                        UCMGUI.config.needReboot = needReboot;
                                                    }
                                                }
                                            });

                                            return false;
                                        }
                                    }

                                    if (zcScanProgress === '0' && UCMGUI.config.zcScanProgress === '1' && zcScanOperator == username) {
                                        top.dialog.clearDialog();

                                        top.dialog.dialogConfirm({
                                            confirmStr: $.lang("LANG917"),
                                            buttons: {
                                                ok: function() {
                                                    top.frames["frameContainer"].module.jumpMenu("zc_devices.html", "?filter=res");
                                                }
                                            }
                                        });
                                    }

                                    UCMGUI.config.zcScanProgress = zcScanProgress;
                                } else {
                                    var position = $.cookie("position"),
                                        menu = $.cookie("jumpMenu");

                                    if (position) {
                                        if (menu) {
                                            $("#frameContainer").show().attr("src", "html/" + position + ".html?menu=" + menu);
                                        } else {
                                            $("#frameContainer").show().attr("src", "html/" + position + ".html");
                                        }
                                    } else {
                                        $("#frameContainer").show().attr("src", "html/home.html");
                                    }

                                    if (!loginInterval) {
                                        UCMGUI.loginFunction.checkTrigger();
                                    }
                                }
                            } else {
                                top.dialog.clearDialog();

                                UCMGUI.loginFunction.switchToLoginPanel();

                                if (type === "ping") {
                                    clearInterval(loginInterval);

                                    loginInterval = null;
                                }
                            }
                        }
                    });
                } else { // if username is null, switch to login page.
                    top.dialog.clearDialog();

                    UCMGUI.loginFunction.switchToLoginPanel();
                }
            },
            switchToLoginPanel: function() {
                top.dialog.clearDialog();

                clearInterval(loginInterval);

                top.$.gsec = null;

                loginInterval = null;

                $.removeCookie('html');
                $.removeCookie('role');
                $.removeCookie('user_id');
                $.removeCookie('username');
                $.removeCookie("position");
                $.removeCookie("jumpMenu");
                $.removeCookie("first_login");
                $.removeCookie("enable_module");
                $.removeCookie("needApplyChange");
                $.removeCookie("en_conf_reflesh");
                $.removeCookie("is_strong_password");

                $(document).unbind('mousemove mouseenter scroll keydown click dblclick');

                UCMGUI.config.needReboot = "";

                $("#frameContainer").show().attr("src", "html/login.html");

                // reset unconditionally
                top.ZEROCONFIG.reset();
            },
            checkTrigger: function() {

                // check user whether has logged per minute.
                loginInterval = setInterval(function() {
                    UCMGUI.loginFunction.checkifLoggedIn('ping');
                }, 60000);
            },
            confirmReboot: function(cb) {
                var reload = function() {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        async: false,
                        url: "../cgi",
                        data: {
                            action: 'getInfo'
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            setTimeout(reload, 5000);
                        },
                        success: function(data) {
                            if (data.status === 0) {
                                top.dialog.clearDialog();

                                UCMGUI.logoutFunction.doLogout();
                            }
                        }
                    });
                };
                var reboot = function() {
                    // delete interval while reboot.
                    if (top.$.gsec && top.$.gsec.stopSessionCheck) {
                        top.$.gsec.stopSessionCheck();
                    }

                    $(document).unbind('mousemove mouseenter scroll keydown click dblclick');

                    clearInterval(loginInterval);

                    loginInterval = null;

                    UCMGUI.config.needReloadPage = true;

                    top.dialog.dialogMessage({
                        type: 'loading',
                        content: $.lang("LANG832")
                    });

                    $.ajax({
                        type: "GET",
                        url: "../cgi?action=rebootSystem",
                        success: function() {
                            setTimeout(reload, 30000);
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            setTimeout(reload, 30000);
                        }
                    });
                };
                if (cb) {
                    top.dialog.dialogConfirm({
                        confirmStr: $.lang("LANG835"),
                        buttons: {
                            ok: reboot
                        }
                    });
                } else {
                    reboot();
                }
            },
            confirmReset: function(url) {
                // delete interval while reboot.
                if (top.$.gsec && top.$.gsec.stopSessionCheck) {
                    top.$.gsec.stopSessionCheck();
                }

                $(document).unbind('mousemove mouseenter scroll keydown click dblclick');

                clearInterval(loginInterval);

                loginInterval = null;

                UCMGUI.config.needReloadPage = true;

                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $.lang("LANG836")
                });

                var reload = function() {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        async: false,
                        url: "../cgi",
                        data: {
                            action: 'getInfo'
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            setTimeout(reload, 5000);
                        },
                        success: function(data) {
                            if (data.status === 0) {
                                top.dialog.clearDialog();

                                UCMGUI.logoutFunction.doLogout();
                            }
                        }
                    });
                };

                $.ajax({
                    type: "GET",
                    url: url,
                    success: function(data) {
                        setTimeout(reload, 30000);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        setTimeout(reload, 30000);
                    }
                });
            }
        },

        logoutFunction: { // logout function
            // Object to store all sequence of functions that should execute on logout
            // example if appliance - need to save changes before logout
            doLogout: function() {
                $.ajax({
                    type: "get",
                    dataType: "json",
                    async: false,
                    url: "../cgi?action=logout&user=" + $.cookie('username'),
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.clearDialog();

                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            if (UCMGUI.config.needReloadPage) {
                                top.window.location.reload();
                            } else {
                                top.dialog.clearDialog();
                                UCMGUI.loginFunction.switchToLoginPanel();
                            }
                        }
                    }
                });
            },
            confirmlogout: function() {
                var msg = $.lang("LANG744");

                dialog.dialogConfirm({
                    confirmStr: msg,
                    buttons: {
                        ok: UCMGUI.logoutFunction.doLogout
                    }
                });
            }
        },

        setDefaultsWhenCreate: function(doc) {
            var eles = $("[dfalt]", doc).toArray();

            UCMGUI.domFunction.resetElementValue(eles);
        },

        deleteRowLikeDomain: function(btn, tableId) {
            var table = btn.parentElement.parentElement.parentElement.parentElement,
                rowCount = table.rows.length,
                rowIndex = btn.parentElement.parentElement.rowIndex;

            if (rowCount > rowIndex) {
                table.deleteRow(rowIndex);
            }
        },

        addRowLikeDomain: function(doc, config) {
            var tableId = config.tableId,
                rowNamePrefix = config.rowNamePrefix,
                rowIndex = config.rowIndex,
                rowidPrefix = config.rowIdPrefix ? config.rowIdPrefix : config.rowNamePrefix,
                maxRow = config.maxRow ? config.maxRow : 10,
                validRules = config.validRules,
                value = config.value,
                startWith1 = config.startWith1 ? config.startWith1 : false;

            if (typeof tableId === "undefined") return;
            if (typeof rowNamePrefix === "undefined") return;

            var table = doc.getElementById(tableId),
                rowCount = table.rows.length,
                start = startWith1 ? 1 : 0,
                row_domain_ID;

            if (rowCount >= maxRow) {
                // top.dialog.clearDialog();

                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: top.$.lang("LANG948")
                // });

                return;
            }

            var row = table.insertRow(rowCount),
                colCount = table.rows[0].cells.length;

            if (rowIndex) {
                row_domain_ID = rowIndex;
            } else {
                var existDomainList = [];
                $('#' + tableId + ' input[type="text"]', doc).each(function() {
                    existDomainList.push(parseInt($(this).attr('name').substr(rowNamePrefix.length)));
                });

                for (var i = start; i < maxRow + start; i++) {
                    if (!UCMGUI.inArray(i, existDomainList)) {
                        break;
                    }
                }

                row_domain_ID = i;
            }

            for (var i = 0; i < colCount; i++) {

                var newcell = row.insertCell(i),
                    children = $(table.rows[0].cells[i]).children().clone();

                $(newcell).append(children);

                switch (newcell.childNodes[0].type) {
                    case "text":
                        rowidPrefix = rowidPrefix ? rowidPrefix : rownamePrefix;
                        newcell.childNodes[0].value = "";
                        newcell.childNodes[0].id = rowidPrefix + row_domain_ID;
                        newcell.childNodes[0].name = rowNamePrefix + row_domain_ID;

                        if (validRules) {
                            $(newcell.childNodes[0]).rules("add", validRules);
                        }
                        if (value) {
                            $(newcell.childNodes[0]).val(value);
                        }
                        break;
                    case "button":
                        newcell.childNodes[0].className = "btn_del";
                        newcell.childNodes[0].id = "btn" + rowNamePrefix + row_domain_ID;
                        newcell.childNodes[0].onclick = Function("UCMGUI.deleteRowLikeDomain(this, '" + tableId + "');");
                        break;
                }
            }
        },

        domFunction: {
            // returns an array of selected checkbox values  from a set of checkboxes of class x
            get_checked: function(x, doc) {
                var chk = [],
                    y = $("." + x, doc); // jquery selector

                for (var g = 0, h = y.length; g < h; g++) {
                    if (y[g].checked) {
                        chk.push(y[g].value);
                    }
                }

                return chk;
            },
            setDfaltVal: function(doc) {
                var dfaltEles = $("[dfalt]", doc);
                if (doc[0]) {
                    dfaltEles = $(doc).filter("[dfalt]")
                }
                for (var i = 0; i < dfaltEles.length; i++) {
                    var el = dfaltEles.get(i);
                    var dfaltEle = dfaltEles.eq(i);
                    var dfalt = dfaltEle.attr("dfalt");

                    if (el && el.tagName == "DIV") {
                        dfaltEle.html(dfalt);
                    } else if (el && el.tagName == "SPAN") {
                        dfaltEle.text(dfalt);
                    } else if (el && el.type == "checkbox") {
                        dfalt = (dfalt == "yes") ? true : false;
                        dfaltEle.attr("checked", dfalt);
                    } else {
                        dfaltEle.val(dfalt);
                    }
                }
            },
            updateDocumentException: function(itemsData, doc, privilegeData, beforeOrsuffixObj) {
                var before = beforeOrsuffixObj ? beforeOrsuffixObj.before : "",
                    suffix = beforeOrsuffixObj ? beforeOrsuffixObj.suffix : "";

                if (typeof privilegeData == "object") {
                    for (var attr in privilegeData) {
                        if (privilegeData.hasOwnProperty(attr)) {
                            var el = $("#" + attr, doc),
                                priv = (privilegeData && privilegeData[attr] != undefined) ? privilegeData[attr].toString() : "";

                            if (before) {
                                el = $("#" + before + attr, doc);
                            } else if (suffix) {
                                el = $("#" + attr + suffix, doc);
                            } else if (before && suffix) {
                                el = $("#" + before + attr + suffix, doc);
                            }

                            var elDom = el[0];

                            if (!!priv) {
                                UCMGUI.domFunction.renderPrivilege(el, priv, doc);
                            }
                        }
                    }
                }
            },
            updateDocument: function(itemsData, doc, privilegeData) {
                if (typeof itemsData == "object") {
                    for (var attr in itemsData) {
                        if (itemsData.hasOwnProperty(attr)) {
                            var el = $("#" + attr, doc),
                                elDom = el[0],
                                priv = (privilegeData && privilegeData[attr] != undefined) ? privilegeData[attr].toString() : "",
                                attrVal = itemsData[attr];

                            var noSerialize = el.attr("noSerialize"),
                                noSerializeExcep = el.attr("noSerializeExcep");

                            if (priv) {
                                UCMGUI.domFunction.renderPrivilege(el, priv, doc);
                            }

                            if (!noSerialize || noSerializeExcep) {
                                if (elDom && elDom.tagName == "DIV") {
                                    el.html(attrVal);
                                } else if (elDom && elDom.tagName == "SPAN") {
                                    el.text(attrVal);
                                } else if (elDom && elDom.type == "checkbox") {
                                    el[0].checked = ((attrVal && attrVal.toLowerCase && attrVal.toLowerCase() === "yes") ? true : false);
                                } else {
                                    el.val(attrVal);
                                }
                            }
                        }
                    }
                }
            },
            updateElementValue: function(options, doc) {
                // UCMGUI.domFunction.updateElements(options, doc)
                var el = options.el,
                    val = options.val,
                    selectbox = UCMGUI.domFunction.selectbox;

                if (typeof el == 'string') {
                    el = $("#" + el, doc);
                }

                if (el == null) {
                    return;
                }

                var dfalt = $(el).attr('dfalt');

                switch (el[0].type) {
                    case 'text':
                        el.val(val);

                        if (dfalt && !val) {
                            el.val(dfalt);
                        }

                        break;
                    case 'textarea':
                        $(el, doc).val(val);

                        if (dfalt && !val) {
                            el.val(dfalt);
                        }

                        break;
                    case 'checkbox':
                        // val = (val == "yes") ? true : false;

                        // el.attr("checked", val);

                        // if (dfalt && (typeof val == 'undefined' || val == '')) {
                        //     el.attr("checked", dfalt);
                        // }

                        /*
                         * Pengcheng Zou Added.
                         *
                         * <input type="checkbox" id="id" name="name" dfalt="yes" />
                         */
                        el[0].checked = ((val && val.toLowerCase && val.toLowerCase() === 'yes') ? true : false);

                        if (typeof val == 'undefined' || val == '') {
                            el[0].checked = ((dfalt && dfalt.toLowerCase && dfalt.toLowerCase() === 'yes') ? true : false);
                        }

                        break;
                    case 'radio':
                        break;
                    case 'select-one':
                        selectbox.selectOption({
                            el: el,
                            val: val
                        }, doc);

                        if (dfalt && !val) {
                            selectbox.selectOption({
                                el: el,
                                val: dfalt
                            }, doc);
                        }

                        break;
                    case 'select-multiple':
                        selectbox.selectOptionMultiple({
                            el: el,
                            val: val
                        }, doc);

                        if (dfalt && !val) {
                            selectbox.selectOption({
                                el: el,
                                val: dfalt
                            }, doc);
                        }

                        break;
                    default:
                        break;
                }
                return;
            },
            renderPrivilege: function(el, priv, doc) {
                var priVal = UCMGUI.config.privilegeObj[priv],
                    elClosest = el.parent().parent().filter(".field-cell");
                //elClosest = el.closest(".field-cell", doc);

                if (priVal == "none") {
                    if (elClosest.length != 0) {
                        elClosest.hide();
                    } else {
                        el.attr({
                            "privilegeAttr": priv
                        }).hide();
                    }
                } else if (priVal == "readonly") {
                    el.attr({
                        readonly: "readonly",
                        "privilegeAttr": priv
                    });
                } else {
                    el.attr({
                        "privilegeAttr": priv
                    });
                }
            },
            resetElementValue: function(eles) {
                if (typeof eles == 'string') {
                    eles = [eles];
                }

                if (!$.isArray(eles)) {
                    return;
                }

                var resetElementValue = function(el) {
                    var tmp_dfalt = $(el).attr('dfalt');

                    switch (el.type) {
                        case 'text':
                            el.value = '';

                            if (tmp_dfalt) {
                                el.value = tmp_dfalt;
                            }

                            break;
                        case 'checkbox':
                            // el.checked = false;

                            // if (tmp_dfalt) {
                            //     $(el).attr('checked', tmp_dfalt);
                            // }

                            /*
                             * Pengcheng Zou Added.
                             *
                             * <input type="checkbox" id="id" name="name" dfalt="yes" />
                             */
                            el.checked = ((tmp_dfalt && tmp_dfalt.toLowerCase && tmp_dfalt.toLowerCase() === 'yes') ? true : false);

                            break;
                        case 'radio':
                            el.checked = false;

                            break;
                        case 'select-one':
                            el.selectedIndex = -1;

                            if (tmp_dfalt) {
                                if (typeof el == 'string') {
                                    el = _$(el);
                                }

                                el.selectedIndex = -1;

                                for (var x = 0; x < el.options.length; x++) {
                                    if (el.options[x].value == tmp_dfalt) {
                                        el.selectedIndex = x;
                                    }
                                }
                            }

                            break;
                        case 'textarea':
                            el.value = '';

                            if (tmp_dfalt) {
                                el.value = tmp_dfalt;
                            }

                            break;
                        default:
                            break;
                    }
                };

                var el;

                for (var i = 0; i < eles.length; i++) {
                    el = eles[i];

                    if (typeof el == 'string') {
                        el = $(el)[0];
                    }

                    el.disabled = false;

                    resetElementValue(el);
                }
            },
            enableCheckBox: function(options, doc) {
                var chk = options.enableCheckBox,
                    el = options.enableList,
                    doc = doc ? doc : document;

                if (typeof chk == 'string') {
                    chk = $("#" + chk, doc)[0];
                }

                if (typeof el == 'string') {
                    el = $("#" + el, doc)[0];
                }

                if (chk) {
                    if ($.isArray(el)) {
                        chk.updateStatus = function() {
                            el.each(function(elSelf) {
                                if (typeof elSelf == 'string') {
                                    elSelf = $("#" + elSelf, doc)[0];
                                }

                                if (elSelf) {
                                    elSelf.disabled = !(chk.checked);
                                    UCMGUI.domFunction.setBackgroundPosition(elSelf, chk.checked);
                                }
                            });

                        };
                    } else {
                        chk.updateStatus = function() {
                            el.disabled = !(chk.checked);

                            UCMGUI.domFunction.setBackgroundPosition(el, chk.checked);
                        };
                    }

                    $(chk, doc).bind("click", chk.updateStatus);
                }
            },
            disableCheckBox: function(options, doc) {
                var chk = options.enableCheckBox,
                    el = options.enableList,
                    doc = doc ? doc : document;

                if (typeof chk == 'string') {
                    chk = $("#" + chk, doc)[0];
                }

                if (typeof el == 'string') {
                    el = $("#" + el, doc)[0];
                }

                if ($.isArray(el)) {
                    chk.updateStatus = function() {
                        el.each(function(elSelf) {
                            if (typeof elSelf == 'string') {
                                elSelf = $("#" + elSelf, doc)[0];
                            }

                            if (elSelf) {
                                elSelf.disabled = (chk.checked);

                                UCMGUI.domFunction.setBackgroundPosition(elSelf, !chk.checked);
                            }
                        });
                    };
                } else {
                    chk.updateStatus = function() {
                        el.disabled = (chk.checked);

                        UCMGUI.domFunction.setBackgroundPosition(el, !chk.checked);
                    };
                }

                $(chk, doc).bind("click", chk.updateStatus);
            },
            setBackgroundPosition: function(elSelf, chkStatus) {
                var span = elSelf.previousSibling;

                if (span) {
                    if (span.tagName != "DIV") {
                        return false;
                    }

                    if (chkStatus) {
                        if (elSelf.tagName == "INPUT") {
                            if (elSelf.checked) {
                                span.style.backgroundPosition = "0 -50px";
                            } else {
                                span.style.backgroundPosition = "0 0";
                            }

                            span.onmouseover = top.Custom.pushed;
                            span.onmouseout = top.Custom.unpushed;
                            span.onmouseup = top.Custom.check;
                        } else {
                            span.children.item(1).style.backgroundPosition = "-139px 0px";

                            $(elSelf).bind({
                                focus: function() {
                                    top.Custom.select_focus_in(this);
                                },
                                blur: function() {
                                    top.Custom.select_focus_out(this);
                                },
                                change: function() {
                                    top.Custom.choose(this);
                                }
                            });
                        }

                        $(span.children.item(0)).removeClass("spanDesDisable");
                    } else {
                        if (elSelf.tagName == "INPUT") {
                            if (elSelf.checked) {
                                span.style.backgroundPosition = "0 -100px";
                            } else {
                                span.style.backgroundPosition = "0 -125px";
                            }

                            span.onmouseover = null;
                            span.onmouseout = null;
                            span.onmouseup = null;
                        } else {
                            span.children.item(1).style.backgroundPosition = "-139px -44px";

                            $(elSelf).unbind();
                        }

                        $(span.children.item(0)).addClass("spanDesDisable");
                    }
                }
            },
            tr_addCell: function(tr, nc) { // usage :: UCMGUI.domFunction.tr_addCell( el, { html:'newCell Text' , align:'center', width:'20px' }  )
                try {
                    var ih = nc.html;

                    delete nc.html;

                    var newcell = tr.insertCell(tr.cells.length);

                    if (nc.id) {
                        newcell.id = nc.id;

                        delete nc.id;
                    }

                    newcell.innerHTML = ih;

                    if (nc.onclickFunction && typeof nc.onclickFunction == "function") {
                        UCMGUI.events.add(newcell, 'click', nc.onclickFunction);

                        $(newcell).css('cursor', 'pointer');

                        delete nc.onclickFunction;
                    }

                    for (var k in nc) {
                        if (nc.hasOwnProperty(k)) {
                            if (k.toLowerCase() == 'colspan') {
                                newcell.colSpan = nc[k];
                            } else {
                                if (newcell[k] != undefined) {
                                    newcell[k] = nc[k];
                                } else {
                                    newcell.setAttribute(k, nc[k]);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.log(err.description);
                }
            },
            selectbox: {
                selectOption: function(options, doc) { // UCMGUI.domFunction.selectbox.selectOption(el,opt)
                    var el = options.el,
                        val = options.val;

                    if (typeof el == 'string') {
                        el = $("#" + el)[0];
                    }

                    el.selectedIndex = -1;

                    for (var x = 0; x < el.options.length; x++) {
                        if (el.options[x].value == opt) {
                            el.selectedIndex = x;
                        }
                    }
                },
                selectOptionMultiple: function(options, doc) { // UCMGUI.domFunction.selectbox.selectOption(el,opt)
                    var el = options.el,
                        val = options.val;

                    if (typeof el == 'string') {
                        el = $("#" + el)[0];
                    }

                    for (var x = 0; x < el.options.length; x++) {
                        if (el.options[x].value == opt) {
                            el.options[x].selected = true;
                        }
                    }
                },
                append: function(options, doc) {
                    var text = options.text,
                        val = options.val,
                        attr = options.attr,
                        className = options.className,
                        disable = options.disable, // disabled extension
                        fullname = options.fullname,
                        locale = options.locale,
                        option = "";

                    if (val == 0 && typeof val == "number") {
                        val = 0;
                    } else {
                        val = val ? val : "";
                    }

                    if (locale) {
                        option = $("<option>").attr({
                            'locale': locale,
                            'value': val,
                            'class': className
                        });

                        if (disable) {
                            option.attr({
                                'disable': disable
                            }).text($.lang('LANG567').format(locale, $.lang('LANG273'), '\>'));
                        } else {
                            option.text(text ? text : $.lang(locale));
                        }
                    } else if (attr) {
                        option = $("<option>").attr({
                            'attr': attr,
                            'value': val,
                            'class': className,
                            'title': text
                        }).text(text);
                    } else {
                        option = $("<option>").attr({
                            'locale': locale,
                            'value': val,
                            'class': className,
                            'title': text
                        }).text(text);
                    }

                    if (fullname) {
                        option.attr({
                            'fullname': fullname
                        });
                    }

                    return option;
                },
                appendOpts: function(options, doc) {
                    // Append  options in a select box
                    var doc = (doc ? doc : document),
                        el = options.el,
                        opts = options.opts,
                        selectedIndex = (options.selectedIndex ? options.selectedIndex : 0),
                        append = UCMGUI.domFunction.selectbox.append,
                        element = $("#" + el, doc),
                        optionArray = [];

                    element.empty();

                    for (var i = 0; i < opts.length; i++) {
                        var val = opts[i] ? opts[i]["val"] : '',
                            text = opts[i] ? opts[i]["text"] : '',
                            locale = opts[i] ? opts[i]["locale"] : '',
                            attr = opts[i] ? opts[i]["attr"] : '',
                            className = opts[i] ? opts[i]["class"] : '',
                            disable = opts[i] ? opts[i]["disable"] : '',
                            fullname = opts[i] ? opts[i]["fullname"] : '', // disabled extension
                            $option = '';

                        text = text ? text : val;

                        if (locale) {
                            $option = append({
                                val: val,
                                text: text,
                                locale: locale,
                                className: className,
                                disable: disable,
                                fullname: fullname
                            }, doc);
                        } else if (attr) {
                            $option = append({
                                val: val,
                                text: text,
                                attr: attr,
                                className: className,
                                disable: disable,
                                fullname: fullname
                            }, doc);
                        } else {
                            $option = append({
                                val: val,
                                text: text,
                                className: className,
                                disable: disable,
                                fullname: fullname
                            }, doc);
                        }

                        optionArray.push($option);
                    }

                    element.append(optionArray)[0].selectedIndex = selectedIndex;
                },
                getOptsVal: function(el) {
                    var arr = [];

                    $.each($(el).children(), function(index, item) {
                        arr.push($(item).val());
                    });

                    return arr;
                },
                electedSelect: function(options, doc) {
                    var selectbox = UCMGUI.domFunction.selectbox,
                        rightSelect = options.rightSelect,
                        leftSelect = options.leftSelect,
                        allToRight = options.allToRight,
                        oneToRight = options.oneToRight,
                        oneToLeft = options.oneToLeft,
                        allToLeft = options.allToLeft,
                        top = options.top,
                        up = options.up,
                        down = options.down,
                        bottom = options.bottom,
                        isSort = !options.isSort ? options.isSort : true;

                    if (isSort == undefined) {
                        isSort = true;
                    }

                    var cb = options.callback,
                        domRightSelect = $("#" + rightSelect, doc),
                        domLeftSelect = $("#" + leftSelect, doc);

                    var getSelectAllVal = function(type) {
                        var leftSelectChildren = $("#" + leftSelect, doc).children(),
                            rightSelectChildren = $("#" + rightSelect, doc).children(),
                            opts = [];

                        $.each(rightSelectChildren, function(index, item) {
                            var tmpObj = {},
                                val = $(item).val();

                            tmpObj["val"] = val;
                            tmpObj["text"] = $(item).text() || val;

                            var attr = $(item).attr("attr"),
                                locale = $(item).attr("locale"),
                                className = $(item).attr("class"),
                                fullname = $(item).attr("fullname");

                            if (attr) {
                                tmpObj["attr"] = attr;
                            }

                            if (locale) {
                                tmpObj["locale"] = locale;
                            }

                            if (className) {
                                tmpObj["class"] = className;
                            }

                            if (fullname) {
                                tmpObj["fullname"] = fullname;
                            }

                            opts.push(tmpObj);
                        });

                        $.each(leftSelectChildren, function(index, item) {
                            var tmpObj = {},
                                val = $(item).val();

                            tmpObj["val"] = val;
                            tmpObj["text"] = $(item).text() || val;

                            var attr = $(item).attr("attr"),
                                locale = $(item).attr("locale"),
                                className = $(item).attr("class"),
                                fullname = $(item).attr("fullname");

                            if (attr) {
                                tmpObj["attr"] = attr;
                            }

                            if (locale) {
                                tmpObj["locale"] = locale;
                            }

                            if (className) {
                                tmpObj["class"] = className;
                            }

                            if (fullname) {
                                tmpObj["fullname"] = fullname;
                            }

                            opts.push(tmpObj);
                        });

                        if (isSort || type == leftSelect) {
                            opts = opts.sort(UCMGUI.bySort("val", "down"));
                        }

                        var selectVal = {
                            el: type,
                            opts: opts
                        }

                        return selectVal;
                    };

                    /*
                     * Pengcheng Zou Added 'selectItem' parameter for doublle click event.
                     */
                    var getSelectOneVal = function(type, selectItem) {
                        var leftSelectChildren = $("#" + leftSelect, doc).children(),
                            rightSelectChildren = $("#" + rightSelect, doc).children(),
                            selected = [],
                            opts = [];

                        if (type == leftSelect) {
                            selected = (selectItem ? [$(selectItem)] : $("#" + rightSelect + " :selected", doc));

                            $.each(leftSelectChildren, function(index, item) {
                                var tmpObj = {},
                                    val = $(item).val();

                                tmpObj["val"] = val;
                                tmpObj["text"] = $(item).text() || val;

                                var attr = $(item).attr("attr"),
                                    locale = $(item).attr("locale"),
                                    className = $(item).attr("class"),
                                    fullname = $(item).attr("fullname");

                                if (attr) {
                                    tmpObj["attr"] = attr;
                                }

                                if (locale) {
                                    tmpObj["locale"] = locale;
                                }

                                if (className) {
                                    tmpObj["class"] = className;
                                }

                                if (fullname) {
                                    tmpObj["fullname"] = fullname;
                                }

                                opts.push(tmpObj);
                            });
                        }

                        if (type == rightSelect) {
                            selected = (selectItem ? [$(selectItem)] : $("#" + leftSelect + " :selected", doc));

                            $.each(rightSelectChildren, function(index, item) {
                                var tmpObj = {},
                                    val = $(item).val();

                                tmpObj["val"] = val;
                                tmpObj["text"] = $(item).text() || val;

                                var attr = $(item).attr("attr"),
                                    locale = $(item).attr("locale"),
                                    className = $(item).attr("class"),
                                    fullname = $(item).attr("fullname");

                                if (attr) {
                                    tmpObj["attr"] = attr;
                                }

                                if (locale) {
                                    tmpObj["locale"] = locale;
                                }

                                if (className) {
                                    tmpObj["class"] = className;
                                }

                                if (fullname) {
                                    tmpObj["fullname"] = fullname;
                                }

                                opts.push(tmpObj);
                            });
                        }

                        $.each(selected, function(idx, item) {
                            var tmpObj = {},
                                val = $(item).val();

                            tmpObj["val"] = val;
                            tmpObj["text"] = $(item).text() || val;

                            var attr = $(item).attr("attr"),
                                className = $(item).attr("class"),
                                fullname = $(item).attr("fullname");

                            if (attr) {
                                tmpObj["attr"] = attr;
                            }

                            if (className) {
                                tmpObj["class"] = className;
                            }

                            if (fullname) {
                                tmpObj["fullname"] = fullname;
                            }

                            $(item).remove();

                            opts.push(tmpObj);
                        });

                        if (isSort || type == leftSelect) {
                            opts = opts.sort(UCMGUI.bySort("val", "down"));
                        }

                        var selectVal = {
                            el: type,
                            opts: opts
                        }

                        return selectVal;
                    };

                    $("#" + allToRight, doc).bind("click", function(event) {
                        if ($(this).hasClass('disabled')) {
                            return;
                        }

                        var leftSelectVal = getSelectAllVal(rightSelect);

                        if (leftSelectVal.opts.length == 0) {
                            return;
                        }

                        domRightSelect.empty();

                        domLeftSelect.empty();

                        selectbox.appendOpts(leftSelectVal, doc);

                        if (options.cb && typeof options.cb == "function") {
                            options.cb.call();
                        }
                    });

                    $("#" + oneToRight, doc).bind("click", function(event) {
                        if ($(this).hasClass('disabled')) {
                            return;
                        }

                        if ($("#" + leftSelect + " :selected", doc).length == 0) {
                            return;
                        }

                        var rightSelectVal = getSelectOneVal(rightSelect);

                        domRightSelect.empty();

                        selectbox.appendOpts(rightSelectVal, doc);

                        if (options.cb && typeof options.cb == "function") {
                            options.cb.call();
                        }
                    });

                    $("#" + oneToLeft, doc).bind("click", function(event) {
                        if ($(this).hasClass('disabled')) {
                            return;
                        }

                        if ($("#" + rightSelect + " :selected", doc).length == 0) {
                            return;
                        }

                        var leftSelectVal = getSelectOneVal(leftSelect);

                        domLeftSelect.empty();

                        selectbox.appendOpts(leftSelectVal, doc);

                        if (options.cb && typeof options.cb == "function") {
                            options.cb.call();
                        }
                    });

                    $("#" + allToLeft, doc).bind("click", function(event) {
                        if ($(this).hasClass('disabled')) {
                            return;
                        }

                        var rightSelectVal = getSelectAllVal(leftSelect);

                        if (rightSelectVal.opts.length == 0) {
                            return;
                        }

                        domRightSelect.empty();

                        domLeftSelect.empty();

                        selectbox.appendOpts(rightSelectVal, doc);

                        if (options.cb && typeof options.cb == "function") {
                            options.cb.call();
                        }
                    });

                    /*
                     * Pengcheng Zou Added. Support Double Click Event.
                     */
                    domRightSelect.delegate('option', 'dblclick', function(event) {
                        var leftSelectVal = getSelectOneVal(leftSelect, this);

                        domLeftSelect.empty();

                        selectbox.appendOpts(leftSelectVal, doc);

                        if (options.cb && typeof options.cb == "function") {
                            options.cb.call();
                        }
                    });

                    domLeftSelect.delegate('option', 'dblclick', function(event) {
                        var rightSelectVal = getSelectOneVal(rightSelect, this);

                        domRightSelect.empty();

                        selectbox.appendOpts(rightSelectVal, doc);

                        if (options.cb && typeof options.cb == "function") {
                            options.cb.call();
                        }
                    });
                    /* -------- End -------- */

                    // bind up/down/top/bottom button
                    $("#" + up, doc).bind('click', function() {
                        if ($(this).hasClass('disabled')) {
                            return;
                        }

                        var op = $("#" + rightSelect + " option:selected", doc);

                        if (op.length) {
                            op.first().prev().before(op);
                        }
                    });

                    $("#" + down, doc).bind('click', function() {
                        if ($(this).hasClass('disabled')) {
                            return;
                        }

                        var op = $("#" + rightSelect + " option:selected", doc);

                        if (op.length) {
                            op.last().next().after(op);
                        }
                    });

                    $("#" + top, doc).bind('click', function() {
                        if ($(this).hasClass('disabled')) {
                            return;
                        }

                        var op = $("#" + rightSelect + " option:selected", doc),
                            all = $("#" + rightSelect + " option", doc);

                        if (op.length) {
                            if (all.first()[0] === op.first()[0]) {
                                return;
                            }

                            all.first().before(op);

                            $("#" + rightSelect, doc).scrollTop(0);
                        }
                    });

                    $("#" + bottom, doc).bind('click', function() {
                        if ($(this).hasClass('disabled')) {
                            return;
                        }

                        var op = $("#" + rightSelect + " option:selected", doc),
                            all = $("#" + rightSelect + " option", doc);

                        if (op.length) {
                            if (all.last()[0] === op.last()[0]) {
                                return;
                            }

                            all.last().after(op);

                            var selects = $("#" + rightSelect, doc);

                            selects.scrollTop(selects[0].scrollHeight);
                        }
                    });
                }
            }
        },

        urlFunction: {
            // Match to the webcgi escape function
            escape: function(str) {
                var ret = "",
                    strSpecial = "!\"#$%&@'()*+,/:;<=>?[]^`{|}~";

                for (var i = 0; i < str.length; i++) {
                    var chr = str.charAt(i),
                        c = chr.charCodeAt(0);

                    if (strSpecial.indexOf(chr) != -1) {
                        ret += "%" + c.toString(16);
                    } else {
                        ret += chr;
                    }
                }

                return ret;
            },

            // Match to the webcgi decode function
            decode: function(val) {
                if (val == undefined || val == "") {
                    return "";
                }

                val = val.replace(/\+/g, '%20');

                var str = val.split("%"),
                    cval = str[0];

                for (var i = 1; i < str.length; i++) {
                    cval += String.fromCharCode(parseInt(str[i].substring(0, 2), 16)) + str[i].substring(2);
                }

                return cval;
            }
        },

        makeSyncRequest: function(params) { // for making synchronus requests
            // usage ::  UCMGUI.makeSyncRequest ( { action :'getconfig', filename: 'something.conf' } ) // no need for call back function
            var s = $.ajax({
                type: 'POST',
                url: UCMGUI.config.paths.baseServerURl,
                data: params,
                async: false
            });

            return s.responseText;
        },

        resizeMainIframe: function(doc) { // resize the frame
            var config = UCMGUI.config,
                cMain = $("div#main-container", doc),
                contentPad = $("div#content-pad", doc),
                cBreadCrumb = $("div#crumbs-div", doc),
                cLeftPane = $("div#accordion_div", doc),
                cMenu = $("div#menu-div", doc),
                cHeader = $("div.header_row", doc),
                cFooter = $("div#footer-row", doc),
                cMainScreen = $("#mainScreen", doc),
                ww = document.body.offsetWidth,
                hh = document.body.offsetHeight;

            if (ww < $(cHeader).width())
                ww = $(cHeader).width();

            var mainW = ww - cLeftPane.width(),
                mainH = hh - cHeader.height() - cFooter.children().height(),
                frameH = mainH - cBreadCrumb.height();

            $("#center-row", doc).css("height", mainH + "px");
            $("#content-pad", doc).css("width", mainW + "px");
            $("div.right_bottom_shadow", doc).css("width", mainW + "px");

            if (config.msie && config.ie7) {
                cMainScreen.attr("height", (frameH - 4) + "px");
            } else if (config.msie && config.ie8) {
                cMainScreen.attr("height", (frameH - 8) + "px");
            } else {
                cMainScreen.attr("height", (frameH - 9) + "px");
            }

            cMainScreen.parent().height(cMainScreen.height() + 4);

            cLeftPane.css("height", mainH + "px");
            cMainScreen.attr("width", mainW + "px");
            cMenu.css("height", (mainH - 39) + "px");
        },

        getSysTime: function(doc) {
            $.ajax({
                type: 'GET',
                url: '../cgi',
                data: "action=getSystemStatus&system-time=",
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(res) {
                    var bool = UCMGUI.errorHandler(res);

                    if (bool) {
                        var sysTime = res.response["system-time"];

                        UCMGUI.showSysTime(sysTime, doc);
                    }
                }
            });
        },

        gup: function(name) { // get url param
            var name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"),
                regexS = "[\\?&]" + name + "=([^&#]*)",
                regex = new RegExp(regexS),
                results = regex.exec(this.location.href);

            if (results == null) {
                return undefined;
            } else {
                return results[1];
            }
        },

        showSysTime: function(sysTime, doc) {
            // Get client time
            var date = new Date(),
                dateArr = date.toString().split(" ");

            $(".sysTime", doc).text(sysTime);

            var sysTimeArr = sysTime.split(" "),
                yearMonthDay = sysTimeArr[0].split("-"),
                hourMinSecond = sysTimeArr[1],
                dateUtc = sysTimeArr[2];

            // if ($.browser.msie) {
            if (UCMGUI.config.msie) {
                dateArr[5] = yearMonthDay[0];
                dateArr[2] = yearMonthDay[2];
                dateArr[3] = hourMinSecond;
            } else {
                dateArr[3] = yearMonthDay[0];
                dateArr[2] = yearMonthDay[2];
                dateArr[4] = hourMinSecond;
            }

            // if ($.browser.msie || $.browser.safari) {
            if (UCMGUI.config.msie || UCMGUI.config.safari) {
                dateArr[1] = monthArr[parseInt(yearMonthDay[1], 10) - 1];
            } else {
                dateArr[1] = yearMonthDay[1];
            }

            dateArr = dateArr.join(" ");

            // Get server time
            severtime = new Date(dateArr);

            var year = severtime.getFullYear(),
                month = severtime.getMonth() + 1,
                day = severtime.getDate(),
                hour = severtime.getHours(),
                minu = severtime.getMinutes(),
                seco = severtime.getSeconds(),
                // Obtain time difference
                jtime = Math.abs(date.getTime() - severtime.getTime()),
                jdate = jtime / (24 * 60 * 60 * 1000),
                jhour = jtime % (24 * 60 * 60 * 1000) / (60 * 60 * 1000),
                jminu = jtime % (24 * 60 * 60 * 1000) % (60 * 60 * 1000) / (60 * 1000),
                jsecond = jtime % (24 * 60 * 60 * 1000) % (60 * 60 * 1000) % (60 * 1000) / 1000,
                // Formatted output server time
                addZero = UCMGUI.addZero;

            var getSeverTime = function() {
                seco++;

                if (seco == 60) {
                    minu += 1;
                    seco = 0;
                }

                if (minu == 60) {
                    hour += 1;
                    minu = 0;
                }

                if (hour == 24) {
                    day += 1;
                    hour = 0;
                }

                // Date processing
                if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                    if (day == 32) {
                        day = 1;
                        month += 1;
                    }
                }

                if (month == 4 || month == 6 || month == 9 || month == 11) {
                    if (day == 31) {
                        day = 1;
                        month += 1;
                    }
                } else if (month == 2) {
                    if ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) { //Leap year deal
                        if (day == 30) {
                            day = 1;
                            month += 1;
                        }
                    } else {
                        if (day == 29) {
                            day = 1;
                            month += 1;
                        }
                    }
                }

                if (month == 13) {
                    year += 1;
                    month = 1;
                }

                sseco = addZero(seco);
                sminu = addZero(minu);
                shour = addZero(hour);
                sdate = addZero(day);
                smonth = addZero(month);
                syear = year;

                $(".sysTime", doc).text(syear + "-" + smonth + "-" + sdate + " " + shour + ":" + sminu + ":" + sseco + " " + dateUtc);

                UCMGUI.config.timeOut = setTimeout(function() {
                    getSeverTime();
                }, 1000);
            }
            getSeverTime();
        },

        bySort: function(name, type) {
            return function(o, p) {
                var left = 0,
                    right = 0,
                    a = "",
                    b = "";

                if (typeof o === "object" && typeof p === "object" && o && p) {
                    a = o[name];
                    b = p[name];

                    if (a === b) {
                        return 0;
                    }

                    if (type == "down") {
                        if (typeof a === typeof b) {
                            if ((a.contains(" Bytes") || a.contains(" KB") || a.contains(" MB") || a.contains(" GB")) && (b.contains(" Bytes") || b.contains(" KB") || b.contains(" MB") || b.contains(" GB"))) {
                                a = UCMGUI.untranSize(a);
                                b = UCMGUI.untranSize(b);
                            }

                            if (a.length !== b.length) {
                                return a.length < b.length ? -1 : 1;
                            }

                            if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                                left = parseInt(a, 10);
                                right = parseInt(b, 10);
                                return left < right ? -1 : 1;
                            } else {
                                return a < b ? -1 : 1;
                            }
                        }

                        return typeof a < typeof b ? -1 : 1;
                    } else {
                        if (typeof a === typeof b) {
                            if ((a.contains(" Bytes") || a.contains(" KB") || a.contains(" MB") || a.contains(" GB")) && (b.contains(" Bytes") || b.contains(" KB") || b.contains(" MB") || b.contains(" GB"))) {
                                a = UCMGUI.untranSize(a);
                                b = UCMGUI.untranSize(b);
                            }

                            if (a.length !== b.length) {
                                return a.length > b.length ? -1 : 1;
                            }

                            if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                                left = parseInt(a, 10);
                                right = parseInt(b, 10);
                                return left > right ? -1 : 1;
                            } else {
                                return a > b ? -1 : 1;
                            }
                        }

                        return typeof a > typeof b ? -1 : 1;
                    }
                }
            }
        },

        tranSize: function(size) {
            var size = parseFloat(size),
                rank = 0,
                rankchar = 'Bytes';

            while (size > 1024) {
                size = size / 1024;
                rank++;
            }

            if (rank == 1) {
                rankchar = "KB";
            } else if (rank == 2) {
                rankchar = "MB";
            } else if (rank == 3) {
                rankchar = "GB";
            }

            return size.toFixed(2) + " " + rankchar;
        },

        untranSize: function(size) {
            if (size.contains(" Bytes")) {
                size = size.replace(" Bytes", "");
            } else if (size.contains(" KB")) {
                size = size.replace(" KB", "");
                size = parseFloat(size);
                size = size * 1024;
            } else if (size.contains(" MB")) {
                size = size.replace(" MB", "");
                size = parseFloat(size);
                size = size * 1024 * 1024;
            } else if (size.contains(" GB")) {
                size = size.replace(" GB", "");
                size = parseFloat(size);
                size = size * 1024 * 1024;
            }

            return size;
        },

        // For show the password in a input, and back to '*' after 10 seconds
        show_password: function(btn, spanId, timeoutID, inputId, doc) {
            var spanId = spanId,
                pwSpan = $("#" + spanId, doc),
                input = pwSpan.children('#' + inputId),
                value = input.val();

            if (!input.attr("disabled")) {
                if ($(btn).attr("class") == "lightOffBtn") {
                    // show
                    $(btn, doc).attr("class", "lightOnBtn");
                    $(btn, doc).attr("title", $.lang("LANG800"));

                    pwSpan[0].innerHTML = "<input type='text' style='display:none' /><input type='password' style='display:none'><input id=" + inputId + " name=" + inputId + " maxlength='32' type='text' autocomplete='off' value =" + value + ">";

                    clearTimeout(timeoutID);

                    timeoutID = setTimeout(function() {
                        value = pwSpan.children('#' + inputId).val();

                        pwSpan[0].innerHTML = "<input type='text' style='display:none' /><input type='password' style='display:none'><input id=" + inputId + " name=" + inputId + " maxlength='32' type='password' autocomplete='off' value =" + value + ">";

                        $(btn).attr("class", "lightOffBtn");
                        $(btn).attr("title", $.lang("LANG799"));
                    }, 10000);
                } else {
                    // hide
                    $(btn).attr("class", "lightOffBtn");

                    pwSpan[0].innerHTML = "<input type='text' style='display:none' /><input type='password' style='display:none'><input id=" + inputId + " name=" + inputId + " maxlength='32' type='password' autocomplete='off' value =" + value + ">";

                    $(btn).attr("title", $.lang("LANG799"));

                    clearTimeout(timeoutID);
                }
            }
        },

        array2object: function(list) {
            var obj = {};

            for (var idx = 0; list && idx < list.length; idx++) {
                var item = list[idx],
                    key = item.split('=')[0],
                    value = item.split('=')[1];

                key = key.replace(/^\s+|\s+$/g, '');
                value = value.replace(/^\s+|\s+$/g, '');

                obj[key] = value;
            }

            return obj;
        },

        object2array: function(obj) {
            var list = [];

            for (var k in obj) {
                if (typeof(k) == "string") {
                    var str = k + ' = ' + obj[k];

                    list.push(str);
                }
            }

            return list;
        },

        JSON_encode: function(string) {
            return string.replace(/(\\|\"|\n|\r|\t|\\b|\f)/g, "\\$1");
        },
        conversionChineseName: function(str){
            if(str){
                var len = str.length;
                if(UCMGUI.isChinese(str)){
                    // var firstName = str.substring(str.length - 1);
                    // var lastName = str.substring(0, str.length - 1);
                    return firstName + lastName;
                }
                return str;
            }
            return str;
        },
        isChinese: function(str) {
            return /[\u4e00-\u9fa5]/g.test(str);
        },
        enableWeakPw: {
            charMode: function(f) {
                var b = " 　`｀~～!！@·#＃$￥%％^…&＆()（）-－_—=＝+＋[]［］|·:：;；“\、'‘,，<>〈〉?？/／*＊.。{}｛｝\\\"",
                    e = f.charCodeAt(0);

                if (e >= 48 && e <= 57) {
                    return 1;
                } else {
                    if (e >= 65 && e <= 90) {
                        return 2;
                    } else {
                        if (e >= 97 && e <= 122) {
                            return 4;
                        } else {
                            if (-1 < b.indexOf(f)) {
                                return 8;
                            }
                        }
                    }
                }

                return 0;
            },
            checkPasswordStrength: function(e) {
                var d = 0,
                    f, c = 0;

                for (i = 0; i < e.length; i++) {
                    f = UCMGUI.enableWeakPw.charMode(e.charAt(i));

                    if (0 == f) {
                        return -1;
                    }

                    if (0 == (d & f)) {
                        d |= f;
                        ++c;
                    }
                }

                return c;
            },
            checkPassword: function(type, e) {
                var c = e.length;

                var a = {
                    repeat: function(c) {
                        return /^(.)\1+$/.test(c)
                    },
                    list: (function() {
                        var c = ["123123", "5201314", "7758521", "654321", "1314520", "123321", "123654", "5211314", "1230123", "987654321", "147258", "123123123", "7758258", "520520", "789456", "159357", "112233", "456123", "110110", "521521", "789456123", "159753", "987654", "115415", "123000", "123789", "100200", "121212", "111222", "123654789", "12301230", "456456", "666888", "168168", "4655321", "321321"];

                        return function(e) {
                            for (var d = 0; d < c.length; d++) {
                                if (e == c[d]) {
                                    return true;
                                }
                            }

                            return false;
                        }
                    })()
                };

                for (i = 0; i < c; i++) {
                    if (0 == UCMGUI.enableWeakPw.charMode(e.charAt(i))) {
                        return -3;
                    }

                    if (/^[0-9]*$/.test(e) || /^[a-z]*$/.test(e) || /^[A-Z]*$/.test(e)) {

                        if (typeof parseInt(e, 10) == "number") {
                            str = UCMGUI.enableWeakPw.increment(parseInt(e.substring(0, 1)), e.length - 1);

                            if (str != e) {
                                break;
                            }
                        }

                        if (e.charCodeAt(i) == e.charCodeAt(i - 1) + 1) {
                            times++;

                            if (times > 3) {
                                return -5;
                                break;
                            }
                        } else {
                            times = 1;
                        }
                    }
                }

                if (type == "digital") {
                    if (!/^[0-9]*$/.test(e)) {
                        return -1;
                    } else {
                        for (var d in a) {
                            if (a[d](e)) {
                                return -4;
                            }
                        }
                    }
                } else {
                    if (/^[0-9]*$/.test(e) || /^[a-z]*$/.test(e) || /^[A-Z]*$/.test(e)) {
                        return -1;
                    } else if (!/[0-9a-zA-Z 　A-Z`｀~～!！@·#＃$￥%％^…&＆()（）-－_—=＝+＋\[\]［］|·:：;；\"“\、'‘,，<>〈〉?？\/／*＊]+/g.test(e)) {
                        return -2;
                    } else {
                        for (var d in a) {
                            if (a[d](e)) {
                                return -4;
                            }
                        }
                    }

                }

                return 1;
            },
            increment: function(num, len) {
                var str = String(num);

                for (var i = 0; i < len; i++) {
                    num += 1;
                    str += num;
                }

                return str;
            },
            showCheckPassword: function(obj) {
                var pwsId = obj.pwsId,
                    type = obj.type,
                    pwsVal = $(pwsId, obj.doc).val();

                if (pwsId === '#edit_secret' && pwsVal.match(/^[~!@+#$%^*]+$/)) {
                    return false;
                }

                if (!pwsVal) {
                    return true;
                } else {
                    var isWeak = UCMGUI.enableWeakPw.checkPassword(type, pwsVal),
                        strength = UCMGUI.enableWeakPw.checkPasswordStrength(pwsVal);

                    if (pwsId === '#user_password' && pwsVal === '******') {
                        return true;
                    }

                    if (strength != 0) {
                        if (isWeak == 1) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            }
        },

        findInputFields: function(doc, iframe) {
            doc = (doc === undefined || doc === null) ? document : doc;

            var domBody = $(doc).contents().find("body"),
                context = domBody.length != 0 ? domBody : (iframe ? $(iframe).contents().find(doc) : $(doc));

            return $("input[id],select[id],textarea[id]", context);
        },

        formSerialize: function(doc, iframe) {
            var hash = {},
                fields = UCMGUI.findInputFields(doc, iframe);

            for (var i = 0; i < fields.length; i++) {
                var val = $(fields[i]).attr("id"),
                    noSerialize = $(fields[i]).attr("noSerialize");

                if (!noSerialize && val.length != 0) {
                    if ($(fields[i]).is(":hidden")) {
                        if ($(fields[i]).is("[readonly]")) {
                            if ($(fields[i]).attr("name").length != 0) {
                                val = $(fields[i]).attr("name");
                            }
                        } else {
                            continue;
                        }
                    }

                    if ($(fields[i]).is(":disabled")) {
                        continue;
                    }

                    hash[val] = "";
                }
            }

            return hash;
        },

        formSerializeVal: function(doc, context, actionType, allowDisable) { //isOnlyPrivilege
            var hash = {},
                fields = UCMGUI.findInputFields(doc, context);

            for (var i = 0; i < fields.length; i++) {
                var domVal = "",
                    el = $(fields[i]),
                    val = el.attr("id");

                var noSerialize = $(fields[i]).attr("noSerialize");
                if (!noSerialize && val.length != 0) {
                    if ($(fields[i]).is(":hidden")) {
                        if ($(fields[i]).is("[readonly]")) {
                            if ($(fields[i]).attr("name").length != 0) {
                                val = $(fields[i]).attr("name");
                            }
                        } else {
                            continue;
                        }
                    }
                    if ($(fields[i]).is(":disabled") && !allowDisable) {
                        continue;
                    }
                    switch (fields[i].type) {
                        case 'textarea':
                        case 'text':
                        case 'password':
                        case 'hidden':
                            domVal = $(fields[i]).val();
                            break;
                        case 'checkbox':
                            domVal = $(fields[i]).is(":checked") ? "yes" : "no";
                            break;
                        case 'radio':
                            break;
                        case 'select-one':
                            domVal = $(fields[i]).val();
                            break;
                        case 'select-multiple':
                            var options = new Array;
                            for (var i = 0; i < fields[i].options.length; i++) {
                                options.push(fields[i].options[i].value)
                            }
                            domVal = options.toString()
                            break;
                        default:
                            break;
                    }
                    if (actionType) {
                        var privilegeAttrVal = el.attr("privilegeAttr"),
                            privilegeActionArr = UCMGUI.getPrivilegeActionArr({
                                attrVal: privilegeAttrVal,
                                actionType: actionType,
                                id: val,
                                val: domVal
                            });

                        if (privilegeActionArr[0]) {
                            hash[privilegeActionArr[0]] = privilegeActionArr[1];
                        }
                    } else {
                        hash[val] = domVal;
                    }
                }
            };

            return hash;
        },
        getPrivilegeAction: function(actionData, privilegeData, actionType) {
            var action = actionData["action"],
                obj = {};

            if (action) {
                obj["action"] = action;
                if (!actionType) {
                    actionType = action;
                }
            }
            if (actionType) {
                for (var attr in actionData) {
                    if (actionData.hasOwnProperty(attr) && attr != "action") {
                        var privilegeAttrVal = privilegeData[attr],
                            privilegeActionArr = UCMGUI.getPrivilegeActionArr({
                                attrVal: privilegeAttrVal,
                                actionType: actionType,
                                id: attr,
                                val: actionData[attr]
                            });

                        if (privilegeActionArr[0]) {
                            obj[privilegeActionArr[0]] = privilegeActionArr[1];
                        }
                    }
                }
                return obj;
            } else {
                return actionData;
            }
        },
        getPrivilegeActionArr: function(obj) {
            var attrVal = obj.attrVal,
                actionType = obj.actionType,
                id = obj.id,
                val = obj.val,
                //attrVal = (attrVal != undefined) ? attrVal.toString() : "",
                actionArr = [];

            if (UCMGUI.checkPrivilege(attrVal, actionType)) {
                actionArr.push(id);
                actionArr.push(val);
            }
            return actionArr;
        },
        checkPrivilege: function(privilegeVal, actionType) {
            privilegeVal = (privilegeVal != undefined) ? privilegeVal.toString() : "";

            if (!!privilegeVal && !!actionType) {
                if (privilegeVal == "-1") {
                    privilegeVal = 15;
                }
                var privInt = parseInt(privilegeVal, 10);

                if (!isNaN(privInt)) {
                    var privBinary = privInt.toString(2),
                        arr = privBinary.split(""),
                        str = "";
                    for (var i = 0; i < 4 - arr.length; i++) {
                        str += 0;
                    }
                    privBinary = str + privBinary;

                    var matchArr = privBinary.match(/\d/g);

                    if (matchArr.length != 0) {
                        var add = Number(matchArr[0]),
                            del = Number(matchArr[1]),
                            edit = Number(matchArr[2]),
                            read = Number(matchArr[3]);
                        ///^add/.test(actionType);
                        ///^delete/.test(actionType);
                        ///^update/.test(actionType);

                        if ((actionType.indexOf("add") != -1 && add == 1) ||
                            (actionType.indexOf("delete") != -1 && del == 1) ||
                            (actionType.indexOf("delete") != -1 && del == 1) ||
                            (read == 1)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            } else {
                return true;
            }
        },
        isEmpty: function(val) {
            return val == undefined || val == null || $.trim(val).length == 0;
        },

        errorHandler: function(data, callback) {
            var bool = true;

            if (typeof data == "string") {
                data = eval("(" + data + ")");
            }

            if (typeof data == "object") {
                var status = data.status;

                if (status && status != 0) {
                    // if (callback && typeof callback == "function") {
                    // 	callback.call();
                    // }
                    if (status == -5 || status == -6 || status == -7 || status == -8) {
                        top.dialog.clearDialog();
                        UCMGUI.loginFunction.switchToLoginPanel();
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $.lang(UCMGUI.config.errorCodes[status] || 'LANG916'),
                            callback: function() {
                                if (callback && typeof callback == "function") {
                                    callback.call();
                                }
                                return;
                            }
                        });
                    }

                    bool = false;
                } else if ((status == undefined || status == null || status == "") && status !== 0) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: JSON.stringify(data),
                        callback: function() {
                            if (callback && typeof callback == "function") {
                                callback.call();
                            }
                            return;
                        }
                    });

                    bool = false;
                }
            } else if (typeof data === 'number') {
                if (data === 0) {
                    return bool;
                } else {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $.lang(UCMGUI.config.errorCodes[data] || 'LANG916'),
                        callback: function() {
                            if (callback && typeof callback == "function") {
                                callback.call();
                            }
                            return;
                        }
                    });

                    bool = false;
                }
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: data,
                    callback: function() {
                        if (callback && typeof callback == "function") {
                            callback.call();
                        }
                        return;
                    }
                });

                bool = false;
            }

            return bool;
        },

        isExist: {
            getList: function(type) {
                var response = [],
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
                        getLanguage: "languages",
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
                    };

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: type
                    },
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            if (responseDataHead[type]) {
                                var list = data.response[responseDataHead[type]];

                                if (list && !$.isEmptyObject(list)) {
                                    response = list;
                                }
                            } else {
                                response = data.response;
                            }

                            /*if (type === 'getMohNameList') {
                                for (var i = 0; i < response.length; i++) {
                                    if (response[i] === 'ringbacktone_default') {
                                        response.splice(i, 1);
                                        break;
                                    }
                                }
                            }*/
                        }
                    }
                });

                return response;
            },
            getRange: function(type) {
                var response = [];

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        "action": "getExtenPrefSettings"
                    },
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var extensionPrefSettings = data.response.extension_pref_settings;

                            if (extensionPrefSettings && extensionPrefSettings != {}) {
                                if (type == 'extension') {
                                    var ueStart = extensionPrefSettings.ue_start,
                                        ueEnd = extensionPrefSettings.ue_end;

                                    response = [(ueStart ? parseInt(ueStart) : undefined), (ueEnd ? parseInt(ueEnd) : undefined)];
                                } else if (type == 'conference') {
                                    var mmStart = extensionPrefSettings.mm_start,
                                        mmEnd = extensionPrefSettings.mm_end;

                                    response = [(mmStart ? parseInt(mmStart) : undefined), (mmEnd ? parseInt(mmEnd) : undefined)];
                                } else if (type == 'ivr') {
                                    var vmeStart = extensionPrefSettings.vme_start,
                                        vmeEnd = extensionPrefSettings.vme_end;

                                    response = [(vmeStart ? parseInt(vmeStart) : undefined), (vmeEnd ? parseInt(vmeEnd) : undefined)];
                                } else if (type == 'vmgroup') {
                                    var vmgStart = extensionPrefSettings.vmg_start,
                                        vmgEnd = extensionPrefSettings.vmg_end;

                                    response = [(vmgStart ? parseInt(vmgStart) : undefined), (vmgEnd ? parseInt(vmgEnd) : undefined)];
                                } else if (type == 'ringgroup') {
                                    var rgeStart = extensionPrefSettings.rge_start,
                                        rgeEnd = extensionPrefSettings.rge_end;

                                    response = [(rgeStart ? parseInt(rgeStart) : undefined), (rgeEnd ? parseInt(rgeEnd) : undefined)];
                                } else if (type == 'queue') {
                                    var rgeStart = extensionPrefSettings.qe_start,
                                        rgeEnd = extensionPrefSettings.qe_end;

                                    response = [(rgeStart ? parseInt(rgeStart) : undefined), (rgeEnd ? parseInt(rgeEnd) : undefined)];
                                } else if (type == 'fax') {
                                    var rgeStart = extensionPrefSettings.fax_start,
                                        rgeEnd = extensionPrefSettings.fax_end;

                                    response = [(rgeStart ? parseInt(rgeStart) : undefined), (rgeEnd ? parseInt(rgeEnd) : undefined)];
                                } else if (type == 'directory') {
                                    var dirStart = extensionPrefSettings.directory_start,
                                        dirEnd = extensionPrefSettings.directory_end;

                                    response = [(dirStart ? parseInt(dirStart) : undefined), (dirEnd ? parseInt(dirEnd) : undefined)];
                                }

                                response.push(extensionPrefSettings.disable_extension_ranges, extensionPrefSettings.rand_password, extensionPrefSettings.weak_password);
                            }

                        }
                    }
                });

                return response;
            },
            askExtensionRange: function(ext, start, end, disabled, extEnd) {
                var res = 0;

                if (!ext || !/^([0-9]\d+)$/.test(ext)) {
                    return true;
                }

                if (disabled == 'yes') {
                    return true;
                }

                if (!start || !end) {
                    return true;
                }

                var nExt = Number(ext);
                var nExtEnd = Number(extEnd);

                if (nExt < start || nExt > end || nExtEnd > end) {
                    var str = top.$.lang("LANG2132").format(ext, start, end);

                    if(nExtEnd > end) {
                        str = top.$.lang("LANG2132").format(nExtEnd, start, end);
                    }
                    top.dialog.dialogConfirm({
                        confirmStr: str,
                        buttons: {
                            ok: function() {
                                top.frames['frameContainer'].module.jumpMenu('preferences.html');
                            },
                            cancel: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        }
                    });
                    return false;
                }
                return true;
            }
        },

        inArray: function(item, ary) { // If item in ary?
            if (item == undefined || !ary || ary === []) {
                return false;
            }

            var i = 0,
                length = ary.length;

            for (i; i < length; i++) {
                if (item == ary[i]) {
                    return true;
                }
            }

            return false;
        },

        bySort: function(name, type) {
            return function(o, p) {
                var left = 0,
                    right = 0,
                    a = "",
                    b = "";

                if (typeof o === "object" && typeof p === "object" && o && p) {
                    if (name.indexOf(" ? ") > 0) {
                        var arr = name.split(" ? ");
                        a = o[arr[0]] ? o[arr[0]] : o[arr[1]];
                        b = p[arr[0]] ? p[arr[0]] : p[arr[1]];
                    } else {
                        a = o[name];
                        b = p[name];
                    }

                    if (a === b) {
                        return 0;
                    }

                    if (type == "down") {
                        if (name == "bridge_time ? alloc_time") {
                            return Date.parse(new Date(a.replace(/-/g, "/"))) < Date.parse(new Date(b.replace(/-/g, "/"))) ? -1 : 1;
                        }
                        if (typeof a === typeof b) {
                            if (a.length !== b.length) {
                                return a.length < b.length ? -1 : 1;
                            }

                            if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                                left = parseInt(a, 10);
                                right = parseInt(b, 10);

                                return left < right ? -1 : 1;
                            } else {
                                return a < b ? -1 : 1;
                            }
                        }

                        return typeof a < typeof b ? -1 : 1;
                    } else {
                        if (name == "bridge_time ? alloc_time") {
                            return Date.parse(new Date(a.replace(/-/g, "/"))) > Date.parse(new Date(b.replace(/-/g, "/"))) ? -1 : 1;
                        }
                        if (typeof a === typeof b) {
                            if (a.length !== b.length) {
                                return a.length > b.length ? -1 : 1;
                            }

                            if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                                left = parseInt(a, 10);
                                right = parseInt(b, 10);

                                return left > right ? -1 : 1;
                            } else {
                                return a > b ? -1 : 1;
                            }
                        }

                        return typeof a > typeof b ? -1 : 1;
                    }
                }
            }
        },

        events: { // TODO, Need to be replaced
            getTarget: function(x) {
                var x = x || window.event;

                return x.target || x.srcElement;
            },
            add: function(a, b, c) { // a is element , b is event (string) , c is the function
                // if (typeof a == 'string') {
                //  a = _$(a);
                // }

                if (UCMGUI.config.msie) {
                    if (a !== null) {
                        a.attachEvent('on' + b, c);
                        return;
                    };
                }

                if (a !== null && a.addEventListener) {
                    a.addEventListener(b, c, false);
                    return;
                }

                if (a != null) {
                    a['on' + b] = c;
                }
            },
            remove: function(a, b, c) {
                // if (typeof a == 'string') {
                //  a = _$(a);
                // }

                if (UCMGUI.config.msie) {
                    a.detachEvent('on' + b, c);
                    return;
                }

                if (a.removeEventListener) {
                    a.removeEventListener(b, c, false);
                    return;
                }

                if (a != null) {
                    a['on' + b] = null;
                }
            }
        },

        transcode: function(result) {
            var msg;

            if (!isNaN(result)) {
                result = parseInt(result);

                switch (result) {
                    case 0:
                        msg = $.lang("LANG906"); // Success
                        break;
                    case 1:
                        msg = $.lang("LANG912"); // Unknown type
                        break;
                    case 2:
                        // Normal Error
                    case 6:
                        msg = $.lang("LANG913"); // Pre check error
                        break;
                    case 3:
                        msg = $.lang("LANG914"); // Not permitted
                        break;
                    case 4:
                        msg = $.lang("LANG915"); // File too large
                        break;
                    case 5:
                        msg = $.lang("LANG881"); // Operation is processing
                        break;
                    case -49:
                        msg = $.lang("LANG2146"); // File has been uploaded
                        break;
                    case -76:
                        msg = $.lang("LANG2335"); // Transcoding failed
                        break;
                    default:
                        msg = $.lang("LANG916");
                        break;
                }
            } else {
                msg = $.lang("LANG916");
            }

            return msg;
        },

        showMembers: function(cellvalue, options, rowObject) {
            if (!cellvalue) {
                return "";
            }

            var memAry = cellvalue.split(','),
                memAryLength = memAry.length;

            if (memAryLength > 10) {
                return memAry[0] + ',' + memAry[1] + ',...,' + memAry[parseInt(memAryLength / 2)] + ',' + memAry[parseInt(memAryLength / 2) + 1] + ',...,' + memAry[memAryLength - 2] + ',' + memAry[memAryLength - 1];
            } else {
                return cellvalue;
            }
        },

        showMembersTitle: function(rowId, tv, rawObject, cm, rdata) {
            return 'title="' + (rawObject.members ? 　rawObject.members : "") + '"';
        },

        ObjectArray: {
            find: function(item, value, ary) {
                if (!item || !value || !ary) {
                    return;
                }

                var length = ary.length,
                    i = 0,
                    response;

                for (i; i < length; i++) {
                    if (value == ary[i][item]) {
                        response = ary[i];
                        break;
                    }
                }

                return response;
            }
        },

        // allow to register certain iframe event and trigger the given handler
        iFrameEventDelegate: new function() {
            var self = this,
                registeredEvent = {},
                boundEvents = {},
                regFrame = null,
                hasOwnerCounts = 0;

            var eventHandler = function(e) {
                var handler = registeredEvent[e.type];

                if (handler) {
                    for (var i = handler.length - 1; i > -1; i--) {
                        var item = handler[i];

                        item.apply(null, arguments);
                    }
                }
            };

            var removeInvalidHandler = function(e) {
                if (hasOwnerCounts > 0) {
                    jQuery.each(registeredEvent, function(key, val) {
                        for (var i = val.length - 1; i > -1; i--) {
                            var item = val[i];

                            if (item.doc === e.delegateTarget) {
                                self.unregisterEventHandler(key, item);
                            }
                        }
                    });
                }
            };

            var loadEventHandler = function(e) {
                boundEvents = {};

                bindAllRegisteredEvents();

                eventHandler(e);
            };

            var bindAllRegisteredEvents = function() {
                if (regFrame) {
                    var contents = regFrame.contents();

                    contents.ready(function() {
                        jQuery.each(registeredEvent, function(key, val) {
                            if (!boundEvents[key]) {
                                contents.on(key, eventHandler);

                                boundEvents[key] = true;
                            }
                        });
                    });
                }
            };

            var unbindAllRegisteredEvents = function() {
                if (regFrame) {
                    regFrame.on("load", loadEventHandler);

                    var actul = regFrame[0];

                    if (actul.contentDocument || actul.contentWindow) {
                        var contents = regFrame.contents();

                        jQuery.each(registeredEvent, function(key, val) {
                            contents.off(key, eventHandler);
                        });
                    }
                }
            };

            this.registerMainFrame = function(frame) {
                if (frame != regFrame) {
                    unbindAllRegisteredEvents();

                    regFrame = $(frame);

                    if (regFrame) {
                        regFrame.on("load", loadEventHandler);
                    }

                    bindAllRegisteredEvents();
                }
            };

            this.registerEventHandler = function(evt, fn, owner) {
                if (typeof fn === "function") {
                    var found = registeredEvent[evt];

                    if (!found) {
                        if (regFrame) {
                            boundEvents[evt] = true;

                            regFrame.contents().on(evt, eventHandler);
                        }

                        found = registeredEvent[evt] = [];
                    }

                    if (owner) {
                        fn.doc = owner;

                        hasOwnerCounts++;
                    }

                    found.push(fn);
                }
            };

            this.unregisterEventHandler = function(evt, fn) {
                var removeHandler = false;

                if (evt) {
                    var found = registeredEvent[evt];

                    if (found) {
                        if (fn) {
                            var idx = found.indexOf(fn);

                            if (idx > -1) {
                                if (fn.doc) {
                                    hasOwnerCounts--;
                                }

                                if (found.removeAt(idx) == 0) {
                                    removeHandler = true;
                                }
                            }
                        } else {
                            for (var i = 0; i < found.length; i++) {
                                if (found[i].doc) {
                                    hasOwnerCounts--;
                                }
                            }

                            found.length = 0;

                            removeHandler = true;
                        }
                    }
                }

                if (removeHandler) {
                    if (regFrame) {
                        regFrame.contents().off(evt, eventHandler);
                    }

                    delete registeredEvent[evt];

                    // frameswitch to invalid handler needs to always be kept
                    if (evt == "frameswitch") {
                        this.registerEventHandler("frameswitch", removeInvalidHandler);
                    }
                }
            }

            // NOTE: frameswitch is a custom event which is now only work when
            // page switching is able to trigger it from our source code
            // frameswitch handler should always be there
            this.registerEventHandler("frameswitch", removeInvalidHandler);
        },
        gSession: function() {
            var _self_ = this,
                // fields
                _idle_state = "",
                _isRetry = false,
                _checking_timer = null,
                _repeatCheck = false;

            this.idleState = function(val) {
                if (val == undefined) {
                    return this._idle_state;
                } else {
                    this._idle_state = val;
                }
            };

            this.repeatCheck = function() {
                return this._repeatCheck;
            };

            this.retrying = function(val) {
                if (val != undefined) {
                    return this._isRetry;
                } else {
                    this._isRetry = val;
                }
            };

            this.repeatCheckSession = function() {
                _self_.checkSession(true);
            };

            this.checkSession = function(repeat) {
                this._repeatCheck = repeat;

                $.ajax({
                    type: 'POST',
                    url: "/cgi",
                    data: 'action=ping',
                    success: function(data) {
                        if (data.status != 0) {
                            _self_.stopSessionCheck();
                            top.dialog.clearDialog();
                            UCMGUI.loginFunction.switchToLoginPanel();

                            return true;
                        } else if (_self_.retrying()) {
                            // $('#noResponseFromServer').hide();
                            // $("#main-container").show();
                        }

                        if (_self_.repeatCheck()) {
                            if (_self_.idleState() == "") {
                                _checking_timer = setTimeout(_self_.repeatCheckSession, 30000); // repeat every 30 seconds when in active use
                            }
                        }

                        _self_.retrying(false);
                    }
                    /*error: function() {
                        try {
                            if (_self_.retrying()) {
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: top.$.lang("LANG2315")
                                });
                            } else {
                                _self_.retrying(true);
                                _self_.stopSessionCheck();

                                UCMGUI.loginFunction.switchToLoginPanel();
                            }
                        } catch (err) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: top.$.lang("LANG986")
                            });
                        } finally {
                            top.dialog.clearDialog(); // TODO [AH] replace this, this will close all the open dialog
                        }
                    }*/
                });
            };

            this.stopSessionCheck = function() {
                clearTimeout(_checking_timer);
                _checking_timer = null;
            };

            // set idle state
            setIdleTimeout(1000 * 30); // put script into idle after 30 seconds
            setAwayTimeout(1000 * 5); // 5 seconds

            // var doc = top.frames["frameContainer"].document;

            document.onIdle = function() {
                _self_.idleState("idle");
            };

            document.onAway = function() {
                _self_.idleState("away");
                _self_.stopSessionCheck();
            };

            document.onBack = function(isIdle, isAway) {
                _self_.idleState("");
                if ($.cookie('username')) {
                    _self_.checkSession(true);
                }
            };

            _self_.checkSession(true);
        },
        strToObj: function (str){
            str = str.replace(/&/g,"','");
            str = str.replace(/=/g,"':'");
            str = "({'"+str +"'})";
            obj = eval(str);
            return obj;
        },
        escapeHTML: function (str) {
            return String(str).replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;')
                              .replace(/'/g, '&#039;');
        },
        unescapeHTML: function (str) {
            return String(str).replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&quot;/g, '"')
                              .replace(/&#039;/g, "'");
        },
        isIPv6: function (value) {
            return (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]")))) || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value);
        },
        isIPv6NoPort: function (value) {
            return (/^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))$/.test(value) && (!value.contains("[") && !value.contains("]")));
        }
    }
}(jQuery));

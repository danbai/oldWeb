/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    gup = UCMGUI.gup,
    config = UCMGUI.config,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    extensionPrefSettings = UCMGUI.isExist.getRange(), // [disable_extension_ranges, rand_password, weak_password]
    codecsArr = ["ilbc", "g722", "g726aal2", "adpcm", "g723", "h263", "h263p", "h264", "vp8", "ulaw", "alaw", "gsm", "g726", "g729", "opus"],
    codecsObj = {
        ilbc: "iLBC",
        g722: "G.722",
        g726aal2: "AAL2-G.726-32",
        adpcm: "ADPCM",
        g723: "G.723",
        h263: "H.263",
        h263p: "H.263p",
        h264: "H.264",
        vp8: "VP8",
        ulaw: "PCMU",
        alaw: "PCMA",
        gsm: "GSM",
        g726: "G.726",
        g729: "G.729",
        opus: "OPUS"
    },
    mode = "",
    technology = "",
    trunkId = "",
    oldTrunkName = "",
    trunkType = "",
    ifExisted = UCMGUI.inArray,
    openPort,
    loadValue;

String.prototype.format = top.String.prototype.format;
String.prototype.contains = top.String.prototype.contains;
String.prototype.trim = top.String.prototype.trim;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;

var isEnableWeakPw = function() {
    if (extensionPrefSettings[2] == 'yes') { // weak_password
        var obj = {
            pwsId: "#ldap_sync_passwd",
            doc: document
        };

        $P("#ldap_sync_passwd", document).rules("add", {
            checkAlphanumericPw: [UCMGUI.enableWeakPw.showCheckPassword, obj]
        });
    }
};

$(function() {
    $P.lang(doc, true);

    mode = gup.call(window, "mode");

    initForm();

    if (mode == 'edit') {
        prepareEditItemForm();
    } else if (mode == 'addSip') {
        prepareAddItemForm('addSip');
    } else if (mode == 'addIax') {
        prepareAddItemForm('addIax');
    }

    $.navSlide(false, true, true, true);

    initValidator();

    isEnableWeakPw();
});

/*function navSlide() {
    var aSettings = $(".settings"),
        aLi = $("#nav_settings").find("li");

    aLi.on('click', function() {
        if ($(this).hasClass("current")) {
            return;
        }

        if (!$P("#form", document).valid()) {
            $("input[titles],select[titles],textarea[titles]").focus();
            return;
        }

        var index = $(this).index();

        $(this).addClass("current").siblings().removeClass("current");

        aSettings.eq(index).addClass("current_position").siblings().removeClass("current_position");

        top.dialog.repositionDialog();
    });
}*/

function initForm() {
    var outboundproxyField = $("#outboundproxy_field"),
        rmvObpFromRouteField = $("#rmvObpFromRoute_field"),
        chkOutboundproxy = $("#chkOutboundproxy");

    $("#need_register_div, #allow_outgoing_calls_if_reg_failed_div, #div_fromdomain, #div_fromuser, #div_send_ppi, #div_send_pai, #div_send_pai_number, #div_use_dod_in_ppi, #ldapDiv, #div_codecs, #div_transport, #div_callerid, #editTrunk_Field_qualify, #editTrunk_Field_faxmode, #div_qualifyfreq, #div_out_maxchans").hide();

    if (!chkOutboundproxy.is(":checked")) {
        outboundproxyField.hide();
        rmvObpFromRouteField.hide();
    }

    chkOutboundproxy.bind("click", function(ev) {
        if ($(this).is(":checked")) {
            outboundproxyField.show();
            rmvObpFromRouteField.show();
        } else {
            outboundproxyField.hide();
            rmvObpFromRouteField.hide();
        }

        top.dialog.repositionDialog();

        ev.stopPropagation();
    });

    $("#trunk_type").change(function(ev) {
        if ($(this).val() == "peer") {
            if (mode == 'addSip') {
                var keepcid = $("#keepcid")[0];
                keepcid.checked = false;
                top.Custom.init(doc, keepcid);

                $("#need_register_div, #allow_outgoing_calls_if_reg_failed_div, #div_username, #div_password, #authid_field, #outboundproxy_field, #rmvObpFromRoute_field").hide();
            } else if (mode == 'addIax') {
                $("#div_username, #div_password").hide();
            }
        } else if ($(this).val() == "register") {
            if (mode == 'addSip') {
                var keepcid = $("#keepcid")[0];
                keepcid.checked = true;
                top.Custom.init(doc, keepcid);

                $("#need_register").attr("checked", true);
                top.Custom.init(doc, $("#need_register")[0]);

                $("#need_register_div, #allow_outgoing_calls_if_reg_failed_div, #div_username, #div_password, #authid_field, #auth_trunk_field, #outboundproxy_field, #rmvObpFromRoute_field").show();
            } else if (mode == 'addIax') {
                $("#div_username, #div_password").show();
            }
        }

        top.dialog.repositionDialog();
    });

    $("#tel_uri").change(function (ev) {
        var ele = $("#rmv_obp_from_route");

        if ($(this).val() != "disabled") {
            ele.attr("disabled", true);
        } else {
            ele.attr("disabled", false);
        }
        top.Custom.init(doc, ele[0]);
    });

    selectbox.electedSelect({
        rightSelect: "rightSelect",
        leftSelect: "leftSelect",
        allToRight: "allToRight",
        oneToRight: "oneToRight",
        oneToLeft: "oneToLeft",
        allToLeft: "allToLeft",
        top: "top",
        up: "up",
        down: "down",
        bottom: "bottom",
        isSort: false,
        cb: function() {
            $P("#rightSelect", doc).valid();
        }
    }, doc);

    $("#enable_cc").bind("click", function(event) {
        if ($(this).is(':checked')) {
            $(".cc-max-agents, .cc-max-monitors").css({
                "display": "block"
            });
        } else {
            $(".cc-max-agents, .cc-max-monitors").hide();
        }

        top.dialog.repositionDialog();
    });

    $('#send_ppi').change(function() {
        if (this.checked) {
            $('#send_pai').attr('disabled', true);
            $("#div_use_dod_in_ppi").show();
        } else {
            $('#send_pai').attr('disabled', false);
            $("#div_use_dod_in_ppi").hide();
        }

        top.Custom.init(doc, $('#send_pai')[0]);
    });

    $('#send_pai').change(function() {
        if (this.checked) {
            $('#send_ppi').attr('disabled', true);
            $("#div_send_pai_number").show();
        } else {
            $('#send_ppi').attr('disabled', false);
            $("#div_send_pai_number").hide();
        }

        top.Custom.init(doc, $('#send_ppi')[0]);
    });
}

function prepareAddItemForm(type) {
    $("#div_username, #div_password, #authid_field, #auth_trunk_field, #is_outboundproxy_field, #outboundproxy_field, #rmvObpFromRoute_field, #div_srtp, #div_dtmfmode,#nav_wrap").hide();

    $(".section-body").css("padding-top", 0);

    if (type == "addSip") {
        selectbox.appendOpts({
            el: "trunk_type",
            opts: [{
                val: "peer",
                text: $P.lang("LANG233"),
                locale: "LANG233"
            }, {
                val: "register",
                text: $P.lang("LANG234"),
                locale: "LANG234"
            }]
        }, doc);
    } else {
        $("#ccss, #div_keep_org_cid, #div_nat").hide();

        selectbox.appendOpts({
            el: "trunk_type",
            opts: [{
                val: "peer",
                text: $P.lang("LANG235"),
                locale: "LANG235"
            }, {
                val: "register",
                text: $P.lang("LANG236"),
                locale: "LANG236"
            }]
        }, doc);

        $("#auto_record_field, #auth_trunk_field, #div_tel_uri").hide();
    }

    var oTrunk = $('#trunk_type'),
        trunkAddType = oTrunk.val();

    if (trunkAddType.toLowerCase() == "peer") {
        $("#div_callerid").show();
    }

    oTrunk.on('change', function() {
        if ($(this).val() === "peer") {
            $("#div_callerid").show();
        } else {
            $("#div_callerid").hide();
        }
        top.dialog.repositionDialog();
    });

    top.Custom.init(doc);
}

function getOpenPort() {
    openPort = [];

    $.ajax({
        url: "../cgi?action=getNetstatInfo",
        type: "GET",
        //async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var netstat = data.response.netstat,
                    currentPort = '';

                for (var i = 0, length = netstat.length; i < length; i++) {
                    currentPort = netstat[i]['port'];

                    if (!ifExisted(currentPort, openPort)) {
                        openPort.push(currentPort);
                    }
                }
            }
        }
    });

    $.ajax({
        url: "../cgi?action=getSIPTCPSettings",
        type: "GET",
        //async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var tlsbindaddr = data.response.sip_tcp_settings.tlsbindaddr,
                    tcpbindaddr = data.response.sip_tcp_settings.tcpbindaddr;

                if (tlsbindaddr) {
                    var tlsPort = tlsbindaddr.split(":")[1];

                    if (tlsPort && !ifExisted(tlsPort, openPort)) {
                        openPort.push(tlsPort);
                    }
                }

                if (tcpbindaddr) {
                    var tcpPort = tcpbindaddr.split(":")[1];

                    if (tcpPort && !ifExisted(tcpPort, openPort)) {
                        openPort.push(tcpPort);
                    }
                }
            }
        }
    });
}

function checkOpenPort(val, element) {
    var ele;

    if (val === loadValue) {
        return true;
    }

    for (var i = 0; i < openPort.length; i++) {
        ele = openPort[i];

        if (val == ele) {
            return false;
        }
    }

    return true;
}

function prepareEditItemForm() {
    trunkId = gup.call(window, "trunkId");
    technology = gup.call(window, "technology");
    trunkType = gup.call(window, "trunkType");

    $("#div_trunktype, #more_details").hide();

    $("#editTrunk_Field_qualify, #editTrunk_Field_faxmode, #div_out_maxchans, #div_codecs").show();

    if (technology.toLowerCase() == "sip") {
        $("#div_transport, #didmode_field").show();

        if (trunkType.toLowerCase() == "peer") {
            var ldapSyncEnable = $("#ldap_sync_enable"),
                els = $("#div_ldap_sync_passwd, #div_ldap_sync_port, #div_ldap_default_outrt, #div_ldap_default_outrt_prefix, #div_ldap_last_sync_date");

            $("#div_callerid, #ldapDiv").show();
            $("#div_username, #div_password, #authid_field, #auth_trunk_field, #is_outboundproxy_field").hide();

            if (!ldapSyncEnable.is(":checked")) {
                els.hide();
            }

            ldapSyncEnable.bind("click", function(ev) {
                if ($(this).is(":checked")) {
                    els.show();
                } else {
                    els.hide();
                    // ldap_default_outrt
                    $("#ldap_sync_passwd, #ldap_sync_port, #ldap_outrt_prefix").val("");
                }

                top.dialog.repositionDialog();

                ev.stopPropagation();
            });
        } else {
            $("#need_register_div, #allow_outgoing_calls_if_reg_failed_div, #div_fromuser").show();
        }
        $("#div_fromdomain, #div_send_ppi, #div_send_pai, #div_send_pai_number, #div_use_dod_in_ppi").show();
        getSIPTrunk(trunkId);

        tectFax();

        getOpenPort();
    } else {
        $("#div_transport, #authid_field, #is_outboundproxy_field, #outboundproxy_field, #rmvObpFromRoute_field, #auto_record_field, #auth_trunk_field, #div_srtp, #div_tel_uri, #div_dtmfmode, #ccss, #div_keep_org_cid, #div_nat").hide();
        $("#div_callerid").show();

        if (trunkType.toLowerCase() == "peer") {
            $("#div_username, #div_password").hide();
        } else {
            $("#div_username, #div_password").show();
        }

        getIAXTrunk(trunkId);
    }

    var enableQualify = $("#enable_qualify");
    var qualifyfreqDiv = $("#div_qualifyfreq");

    enableQualify.bind("click", function(ev) {
        if ($(this).is(":checked")) {
            qualifyfreqDiv.show();
        } else {
            qualifyfreqDiv.hide();
        }

        top.dialog.repositionDialog();

        ev.stopPropagation();
    });
}

function tectFax() {
    var accountList = UCMGUI.isExist.getList("listAccount").account,
        faxList = UCMGUI.isExist.getList("listFax").fax,
        str = '',
        ele;

    for (var i = 0; i < accountList.length; i++) {
        ele = accountList[i];

        if (ele.account_type.match(/FXS/i)) {
            str += '<option value="' + ele.extension + '">' + ele.extension + '</option>';
        }
    }

    for (var i = 0; i < faxList.length; i++) {
        ele = faxList[i];

        str += '<option value="' + ele.extension + '">' + ele.extension + '</option>';

    }

    $('#fax_intelligent_route_destination').append(str);
    $('#faxmode').on('change', function() {
        if ($(this).val() === 'detect') {
            $('#detect_div').show();
        } else {
            $('#detect_div').hide();
        }
    });
    enableCheckBox({
        enableCheckBox: 'fax_intelligent_route',
        enableList: ['fax_intelligent_route_destination']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'need_register',
        enableList: ['allow_outgoing_calls_if_reg_failed']
    }, doc);
}

function isSelfIp(ele) {
    var selfIp = window.location.hostname,
        inputIp = $(ele).val().split(':')[0];

    if (inputIp == selfIp) {
        return false;
    } else {
        return true;
    }
}

function check_video_codec() {
    var AudioCodinglist = ["ulaw", "alaw", "gsm", "g726", "g726aal2", "ilbc", "g722", "adpcm", "g729", "g723"],
        res = false,
        valuelist = [],
        el = $('#rightSelect')[0],
        length = el.options.length;

    // get an array of all option values in a select box
    for (var x = 0; x < length; x++) {
        if (el.options[x].value.trim()) {
            valuelist.push(el.options[x].value);
        }
    }

    valuelist.each(function(value) {
        if (res == true) {
            return res;
        }

        AudioCodinglist.each(function(codec) {
            if (value == codec)
                res = true;
            return res;
        });
    });

    return res;
}

function check_ldap_prefix(value, element) {
    var default_ob = $('#ldap_outrt_prefix').val();

    if (default_ob && default_ob == 'custom' && value == "") {
        return false;
    }

    return true;
}

function trunkNameIsExist() {
    var trunkName = $("#trunk_name").val(),
        trunkNameList = mWindow.trunkNameList,
        tmpTrunkNameList = [];

    tmpTrunkNameList = trunkNameList.copy(tmpTrunkNameList);

    if (oldTrunkName) {
        tmpTrunkNameList.remove(oldTrunkName);
    }

    return !UCMGUI.inArray(trunkName, tmpTrunkNameList);
}

var isRightIP = function(id) {
    var val = $("#" + id).val();
    var ip = val.split(".");
    var ret = true;
    var ipDNSReg = /(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])/;
    
    if (ipDNSReg.test(val) && (ip[0] == "127" || ip[0] >= 224)) {
        ret = false;
    }

    return ret;
};

function check_cidnumber_required() {
    var isChecked = $('#keepcid')[0].checked;
    if ((isChecked && $("#cidnumber").val() != "") || !isChecked) {
        return true;
    }
    return false;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            // "trunk_type": {
            //     required: true
            // },
            "trunk_name": {
                required: true,
                minlength: 2,
                alphanumeric: true,
                isExist: [$P.lang("LANG2137"), trunkNameIsExist]
            },
            "host": {
                required: true,
                specialhost: [$P.lang('LANG1373').toLowerCase()],
                isExist: [$P.lang("LANG2542").format($P.lang("LANG1373")), isSelfIp],
                customCallback1: [$P.lang('LANG2167').format($P.lang('LANG1373').toLowerCase()),
                    function() {
                        return isRightIP("host");
                    }
                ],
            },
            "cidnumber": {
                //specialauthid: true,
                calleridSip: true,
                customCallback: [$P.lang('LANG5066'), check_cidnumber_required]
            },
            "cidname": {
                minlength: 2,
                // required: true,
                //alphanumeric: true // Unknown validation
                cidName: true
            },
            "user_name": {
                required: true,
                //specialauthid: true
                calleridSip: true
            },
            "password": {
                required: true,
                keyboradNoSpace: true
            },
            "fromdomain": {
                 specialhost: [$P.lang('LANG1369')]
            },
            "fromuser": {
                //authid: true
                calleridSip: true
            },
            "pai_number": {
                specailCalleridSip: true
            },
            "allow": {
                selectItemMin: 1 //,
                // customCallback: [$P.lang('LANG2138'), check_video_codec]
            },
            "rightSelect": {
                selectItemMin: 1,
                customCallback: [$P.lang("LANG2138"), check_video_codec]
            },
            // "qualify": {
            //     required: true,
            //     digits: true,
            //     range: [500, 9999]
            // },
            "qualifyfreq": {
                required: true,
                digits: true,
                range: [1, 3600]
            },
            "out_maxchans": {
                required: true,
                digits: true,
                max: 999
            },
            "callTime": {
                digits: true
            },
            "outboundproxy": {
                // required: true,
                specialhost: [$P.lang('LANG1395')],
                // customCallback: ["outbound proxy is required.", check_outboundproxy],
                isExist: [$P.lang("LANG2542").format($P.lang("LANG1378")), isSelfIp]
            },
            "authid": {
                specialauthid1: true
            },
            "ldap_sync_passwd": {
                required: true,
                alphanumeric: true,
                minlength: 4
            },
            "ldap_outrt_prefix": {
                required: true,
                digits: true,
                maxlength: 14,
                // alphanumeric: true,
                customCallback: ['prefix is required.', check_ldap_prefix]
            },
            "ldap_sync_port": {
                required: true,
                digits: true,
                range: [1, 65534],
                customCallback: [$P.lang("LANG3869"), checkOpenPort]
            },
            "cc_max_agents": {
                required: true,
                digits: true,
                range: [1, 999]
            },
            "cc_max_monitors": {
                required: true,
                digits: true,
                range: [1, 999]
            }
        },
        submitHandler: function() {
            var action = {},
                confirmStr = '';

            $(".settings").not(".current_position").addClass("none_position");

            action = UCMGUI.formSerializeVal(document);

            var fax = $('#faxmode').val();

            if (fax == "no") {
                action['faxdetect'] = "no";
                action['fax_gateway'] = "no";
            } else if (fax == "detect") {
                action['faxdetect'] = "yes";
                action['fax_gateway'] = "no";
            }

            if ((mode == "addSip") || (technology.toLowerCase() == "sip")) {
                if ($('#enable_cc').is(':checked')) {
                    action['cc_agent_policy'] = "native";
                    action['cc_monitor_policy'] = "native";
                    action['cc_max_agents'] = $('#cc_max_agents').val();
                    action['cc_max_monitors'] = $('#cc_max_monitors').val();
                    action['cc_offer_timer'] = "120";
                    action['ccnr_available_timer'] = "3600";
                    action['ccbs_available_timer'] = "3600";
                } else {
                    action['cc_agent_policy'] = "never";
                    action['cc_monitor_policy'] = "never";
                }

                if ($("#send_ppi").is(":checked")) {
                    action['send_ppi'] = "yes";
                    action['pai_number'] = "";
                } else if ($("#send_pai").is(":checked")) {
                    action['send_ppi'] = "pai";
                    action['use_dod_in_ppi'] = "no";
                } else {
                    action['send_ppi'] = "no";
                    action['pai_number'] = "";
                    action['use_dod_in_ppi'] = "no";
                }
            }

            if (mode == "addSip") {
                action["action"] = "addSIPTrunk";
                action["technology"] = "SIP";
            } else if (mode == "addIax") {
                action["action"] = "addIAXTrunk";
                action["technology"] = "IAX";
            } else if (mode == "edit") {
                if (technology.toLowerCase() == "sip") {
                    action["action"] = "updateSIPTrunk";

                    if (fax == "detect") {
                        var bEnableRoute = $('#fax_intelligent_route')[0].checked;
                        action['fax_intelligent_route'] = bEnableRoute ? 'yes' : 'no';
                        if (bEnableRoute) {
                            action['fax_intelligent_route_destination'] = $('#fax_intelligent_route_destination').val();
                        } //else {
                            //action['fax_intelligent_route_destination'] = 'no';
                        //}
                    }
                    if (trunkType.toLowerCase() == "peer" && $("#ldap_sync_enable").is(":checked")) {
                        var outrtVal = $("#ldap_default_outrt :selected").val(),
                            prefixVal = $("#ldap_outrt_prefix").val();

                        if (outrtVal != "custom") {
                            action["ldap_default_outrt"] = outrtVal;
                            action["ldap_default_outrt_prefix"] = prefixVal;
                            action["ldap_custom_prefix"] = "";
                        } else {
                            action["ldap_default_outrt"] = "";
                            action["ldap_default_outrt_prefix"] = "";
                            action["ldap_custom_prefix"] = prefixVal;
                        }
                    } else if (trunkType.toLowerCase() == "register") {
                        if (!$("#chkOutboundproxy").is(":checked")) {
                            action["outboundproxy"] = "";
                            action["rmv_obp_from_route"] = "no";
                        }
                        if ($("#tel_uri").val() != "disabled") {
                            action["rmv_obp_from_route"] = "no";
                        }
                    }
                } else {
                    action["action"] = "updateIAXTrunk";
                }

                var rightArr = [];

                $.each($("#rightSelect").children(), function(index, item) {
                    rightArr.push($(item).val());
                });

                action["allow"] = rightArr.toString();
                action["trunk"] = trunkId;
            }

            if (action["user_name"]) {
                action["username"] = action["user_name"];
                delete action["user_name"];
            }

            if (action["password"]) {
                action["secret"] = action["password"];
                delete action["password"];
            }

            if ((action["action"].toLowerCase().indexOf('sip') > -1) && /[a-zA-Z]/g.test(action['host']) && !UCMGUI.isIPv6(action['host'])) {
                confirmStr = $P.lang("LANG4163");
            } else if ((action["action"].toLowerCase().indexOf('iax') > -1) &&
                (/[a-zA-Z]/g.test(action['host']) || /:\d*$/.test(action['host'])) && !UCMGUI.isIPv6(action['host'])) {
                confirmStr = $P.lang("LANG4469");
            }

            if (confirmStr) {
                top.dialog.dialogConfirm({
                    confirmStr: confirmStr,
                    buttons: {
                        ok: function() {
                            updateOrAddVoipTrunksInfo(action);
                        },
                        cancel: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    }
                });
            } else {
                updateOrAddVoipTrunksInfo(action);
            }
        }
    });
}

function updateOrAddVoipTrunksInfo(action) {
    if (action["host"]) {
        if (UCMGUI.isIPv6NoPort(action["host"])) {
            action["host"] = "[" + action["host"] + "]"
        }
    }
    if (action["fromdomain"]) {
        if (UCMGUI.isIPv6NoPort(action["fromdomain"])) {
            action["fromdomain"] = "[" + action["fromdomain"] + "]"
        }
    }
    if (action["outboundproxy"]) {
        if (UCMGUI.isIPv6NoPort(action["outboundproxy"])) {
            action["outboundproxy"] = "[" + action["outboundproxy"] + "]"
        }
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#trunks-voip-list", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function getSIPTrunk() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getSIPTrunk",
            trunk: trunkId
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response,
                    trunk = response.trunk,
                    trunkType = trunk.trunk_type,
                    outboundproxy = trunk.outboundproxy,
                    PPI = trunk.send_ppi;

                loadValue = (trunk.ldap_sync_port === null ? null : trunk.ldap_sync_port.toString());

                oldTrunkName = trunk.trunk_name;

                UCMGUI.domFunction.updateDocument(trunk, document);

                $("#tel_uri").trigger("change");

                if ($('#fax_intelligent_route_destination').val() === null) {
                    $('#fax_intelligent_route_destination').val('no');
                }

                setUsernameAndSerect(trunk);

                if (trunk['cc_agent_policy'] && trunk['cc_agent_policy'] == 'native') {
                    $('#enable_cc')[0].checked = true;

                    $(".cc-max-agents, .cc-max-monitors").css({
                        "display": "block"
                    });

                    $("#cc_max_agents").val(trunk['cc_max_agents'] == 0 ? "" : trunk['cc_max_agents']);
                    $("#cc_max_monitors").val(trunk['cc_max_monitors'] == 0 ? "" : trunk['cc_max_monitors']);
                }

                if ((trunk['faxdetect'] === 'no') && (trunk['fax_gateway'] === 'no')) {
                    $('#faxmode').val('no');
                } else if (trunk['faxdetect'] === 'yes') {
                    $('#faxmode').val('detect');
                }

                var enableQualify = $("#enable_qualify"),
                    qualifyfreqDiv = $("#div_qualifyfreq");

                if (enableQualify.is(":checked")) {
                    qualifyfreqDiv.show();
                } else {
                    qualifyfreqDiv.hide();
                }

                var ldapSyncEnable = $("#ldap_sync_enable"),
                    els = $("#div_ldap_sync_passwd, #div_ldap_sync_port, #div_ldap_default_outrt, #div_ldap_default_outrt_prefix, #div_ldap_last_sync_date");

                if (trunk.div_ldap_sync_passwd || trunk.div_ldap_sync_port || trunk.div_ldap_default_outrt_prefix) {
                    ldapSyncEnable.attr("checked", true);
                }

                if ($("#ldap_sync_port").val() === "0") {
                    $("#ldap_sync_port").val("");
                }

                if (ldapSyncEnable.is(":checked")) {
                    els.show();
                }

                if (outboundproxy) {
                    $("#chkOutboundproxy").attr('checked', true);
                    $("#outboundproxy_field, #rmvObpFromRoute_field").show();
                }

                if (PPI) {
                    switch (PPI) {
                        case "yes":
                            $("#send_ppi")[0].checked = true;
                            $("#send_pai")[0].checked = false;
                            $("#send_pai")[0].disabled = true;

                            break;
                        case "no":
                            $("#send_ppi")[0].checked = false;
                            $("#send_pai")[0].checked = false;

                            break;
                        case "pai":
                            $("#send_ppi")[0].disabled = true;
                            $("#send_ppi")[0].checked = false;
                            $("#send_pai")[0].checked = true;

                            break;
                        default:
                            $("#send_ppi")[0].checked = false;
                            $("#send_pai")[0].checked = false;

                            break;
                    }
                }

                if ($("#chkOutboundproxy").is(":visible")) {
                    $P("#outboundproxy", doc).rules("add", {
                        required: true
                    });
                }

                var allow = (trunk.allow ? trunk.allow.split(",") : []),
                    leftOpts = transData(codecsArr.remove(allow), codecsObj),
                    rightOpts = transData(allow, codecsObj);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftOpts,
                    selectedIndex: -1
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightOpts,
                    selectedIndex: -1
                }, doc);

                if (trunkType.toLowerCase() == "peer") {
                    getOutbandRoutesList(trunk);
                    getldapdate(oldTrunkName);
                }
                $('#faxmode').trigger('change');
                $('#fax_intelligent_route_destination')[0].disabled = !$('#fax_intelligent_route')[0].checked;
                $('#allow_outgoing_calls_if_reg_failed')[0].disabled = !$('#need_register')[0].checked;
            }
            $('#send_ppi').trigger("change");
            $('#send_pai').trigger("change");
            top.Custom.init(doc);

            top.dialog.repositionDialog();
        }
    });
}

function getIAXTrunk(trunkId) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getIAXTrunk",
            trunk: trunkId
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response,
                    trunk = response.trunk,
                    disallow = trunk.disallow,
                    allow = trunk.allow ? trunk.allow.split(",") : [];

                oldTrunkName = trunk.trunk_name;

                UCMGUI.domFunction.updateDocument(trunk, document);

                $("#tel_uri").trigger("change");
                setUsernameAndSerect(trunk);

                if ((trunk['faxdetect'] === 'no') && (trunk['fax_gateway'] === 'no')) {
                    $('#faxmode').val('no');
                } else if (trunk['faxdetect'] === 'yes') {
                    $('#faxmode').val('detect');
                }

                var enableQualify = $("#enable_qualify"),
                    qualifyfreqDiv = $("#div_qualifyfreq");

                if (enableQualify.is(":checked")) {
                    qualifyfreqDiv.show();
                } else {
                    qualifyfreqDiv.hide();
                }

                var allow = (trunk.allow ? trunk.allow.split(",") : []),
                    leftOpts = transData(codecsArr.remove(allow), codecsObj),
                    rightOpts = transData(allow, codecsObj);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftOpts,
                    selectedIndex: -1
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightOpts,
                    selectedIndex: -1
                }, doc);
            }
            $("#leftSelect option[value=opus]").addClass("hide");
            top.Custom.init(doc);
        }
    });
}

function getOutbandRoutesList(trunk) {
    var trunkName = trunk.trunk_name,
        ldapDefaultOutrt = (trunk.ldap_default_outrt ? trunk.ldap_default_outrt : ""),
        ldapCustomPrefix = (trunk.ldap_custom_prefix ? trunk.ldap_custom_prefix : ""),
        ldapDefaultOutrtEle = $("#ldap_default_outrt"),
        outboundRtNameObj = {},
        outboundRtNameArr = [];

    $("#ldap_default_outrt").bind('change', outboundRtNameObj, function(ev) {
        var val = $(this).val(),
            ele = $("#ldap_outrt_prefix");

        if (val != "custom") {
            ele.attr("disabled", true);
        } else {
            ele.attr("disabled", false);
        }

        ele.val(outboundRtNameObj[val]);

        ev.stopPropagation();
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getOutbandRoutesList",
            trunk_name: trunkName
        },
        error: function() {
            outboundRtNameArr.push({
                text: $P.lang("LANG133"),
                val: ""
            });

            outboundRtNameArr.push({
                text: $P.lang("LANG2526"),
                val: "custom"
            });

            selectbox.appendOpts({
                el: "ldap_default_outrt",
                opts: outboundRtNameArr
            }, doc);

            ldapDefaultOutrtEle.val(ldapDefaultOutrt).trigger('change');

            top.Custom.init(doc, ldapDefaultOutrtEle[0]);
        },
        success: function(data) {
            var data = eval(data),
                response = data.response,
                status = data.status,
                outboundList = response.outbound_list;

            if (status == 0) {
                outboundRtNameArr.push({
                    text: $P.lang("LANG133"),
                    val: ""
                });

                $.each(outboundList, function(index, val) {
                    var outboundRtIndex = val.outbound_rt_index,
                        outboundRtName = val.outbound_rt_name,
                        perfix = val.perfix,
                        obj = {};

                    obj["text"] = outboundRtName;
                    obj["val"] = outboundRtIndex;

                    outboundRtNameObj[outboundRtIndex] = perfix;

                    outboundRtNameArr.push(obj);
                });

                outboundRtNameObj["custom"] = ldapCustomPrefix;

                outboundRtNameArr.push({
                    text: $P.lang("LANG2526"),
                    val: "custom"
                });

                selectbox.appendOpts({
                    el: "ldap_default_outrt",
                    opts: outboundRtNameArr,
                    selectedIndex: 3
                }, doc);
            } else {
                outboundRtNameArr.push({
                    text: $P.lang("LANG133"),
                    val: ""
                });

                outboundRtNameArr.push({
                    text: $P.lang("LANG2526"),
                    val: "custom"
                });

                selectbox.appendOpts({
                    el: "ldap_default_outrt",
                    opts: outboundRtNameArr
                }, doc);
            }

            if (ldapCustomPrefix) {
                $("#ldap_default_outrt").val("custom").trigger('change');
            } else {
                ldapDefaultOutrtEle.val(ldapDefaultOutrt).trigger('change');

                var arr = [];

                $.each($("#ldap_default_outrt").children(), function(index, val) {
                    arr.push($(val).val());
                });

                if ($.inArray(ldapDefaultOutrt.toString(), arr) == -1) {
                    $("#ldap_default_outrt")[0].selectedIndex = 0;
                }
            }

            top.Custom.init(doc, ldapDefaultOutrtEle[0]);
        }
    });
}

function getldapdate(trunkName) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getldapdate",
            ldap_last_sync_date: trunkName
        },
        success: function(data) {
            var data = eval(data),
                response = data.response,
                status = data.status,
                date = response.ldap_last_sync_date;

            if (status == 0) {
                $("#label_ldap_last_sync_date").html(date);
            } else {
                $("#label_ldap_last_sync_date").html($P.lang("LANG2403"));
            }
        }
    });
}

function setUsernameAndSerect(data) {
    $('#user_name').val((data && data.username) ? data.username : '');
    $('#password').val((data && data.secret) ? data.secret : '');
}

function transData(resArr, resObj) {
    var arr = [];

    for (var i = 0; i < resArr.length; i++) {
        var obj = {};

        obj["val"] = resArr[i];
        obj["text"] = resObj[resArr[i]];

        arr.push(obj);
    }

    return arr;
}
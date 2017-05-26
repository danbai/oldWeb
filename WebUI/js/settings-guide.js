/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2015 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    maxExtension = config.maxExtension,
    num_pri = config.model_info.num_pri,
    selectbox = UCMGUI.domFunction.selectbox,
    ifExisted = UCMGUI.inArray,
    lastTime = new Date().getTime(),
    userInfo = $("#userInfo"),
    currentUserId = $P.cookie('user_id'),
    currentUserName = $P.cookie('username'),
    allSteps = {
        '61': ['LANG55', 'LANG48', 'LANG4314', 'LANG87', 'LANG4315', 'LANG4316'],
        '65': ['LANG55', 'LANG48', 'LANG4314', 'LANG686', 'LANG87', 'LANG4315', 'LANG4316']
    },
    step2Oldpass = document.getElementById('oldpass'),
    step2Newpass = document.getElementById('newpass'),
    step2NewpassRep = document.getElementById('newpass_rep'),
    step2Email = document.getElementById('email'),
    batchNumber = document.getElementById('batch_number'),
    batchExtension = document.getElementById('batch_extension'),
    batchSecret = document.getElementById('batch_secret'),
    disableExtensionRanges = document.getElementById('disable_extension_ranges'),
    showCheckPassword = UCMGUI.enableWeakPw.showCheckPassword,
    extensionRange = UCMGUI.isExist.getRange('extension'),
    existedAccountList = UCMGUI.isExist.getList("getAccountList"),
    existedLocalLangList = UCMGUI.isExist.getList("getLanguage"),
    existedNumberList = UCMGUI.isExist.getList("getNumberList"),
    existedExtentionList = transAccountData(UCMGUI.isExist.getList("getAccountList")),
    existedOutboundRouteList = UCMGUI.isExist.getList("getOutboundRouteList"),
    existedTrunkList = UCMGUI.isExist.getList("getTrunkList"),
    existedChanList = UCMGUI.isExist.getList("getAnalogTrunkChanList"), // FXO Channel list
    existedTrunkNameList = [], // Existed Trunk Name List
    destinationAccountList = [], // Account List in Destination
    createdTrunksList = [], // Turnks you created in step 5
    createdAccountList = [], // Extensions you created in step 5
    portExtensionList = [], // Checked if the extension number is in the range of parking port
    priSettings = [], // Digital Hardware PRI Settings for UCM65XX
    ss7Settings = [], // Digital Hardware SS7 Settings for UCM65XX
    mfcR2Settings = [], // Digital Hardware MFC/R2 Settings for UCM65XX
    digitalGroup = [], // Digital Hardware digitalGroup for UCM65XX
    interfaceObj = { // Network Interface
        '0': 'eth1',
        '1': 'eth0',
        '2': {
            'LAN1': 'eth0',
            'LAN2': 'eth1'
        }
    },
    firstLogin = '',
    lastInterface = '',
    oldNetworkStr = '', // Check if the network settings is changed
    method = '', // Switch or Route or Dual
    ddlData = [], // Languages in web page
    steps, fieldsets, // Settings Guide Steps ang Content Fields
    originSpanType, oldDigitalGroupName, oldSingnaling, oldCoding, oldHardhdlc, // Used for Digital Hardware
    outboundRouteNameInEditMode, // outbound route name in edit mode
    trunkNameInEditMode, // trunk name in edit mode
    trunkIdInEditMode, // trunk id in edit mode
    trunkMode, // Add or Edit Trunk
    lastTimezone, // Last Time Zone
    lastSFTimezone, // Last Self Define Time Zone
    sLanguageId,
    sLanguageName,
    animating,
    currentField,
    nextField,
    previousField;

var nation2langObj = {
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
};

var permission2langObj = {
    "none": 'LANG273',
    "internal": 'LANG1071',
    "local": 'LANG1072',
    "national": 'LANG1073',
    "international": 'LANG1074',
};

Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.sortBy = top.Array.prototype.sortBy;
String.prototype.format = top.String.prototype.format;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;

$(function() {
    initPage();

    bindEvent();

    initValidator();

    getDatas();

    top.Custom.init(doc);

    if (!top.$.gsec) {
        top._initJQuery();

        top.$.gsec = new top.UCMGUI.gSession();
    }
});

function bigNumAdd(a) {
    if (!a) {
        a = "0";
    }

    var m = a.split('').reverse(),
        ret = [],
        s = 0,
        flag = 1,
        t;

    for (var i = 0; i < a.length; i++) {
        t = Number(m[i]) + flag;

        if (t > 9) {
            flag = 1;
        } else {
            flag = 0;
        }

        ret.push(t % 10);
    }

    if (flag) {
        ret.push(1);
    }

    return ret.reverse().join('');
}

function bigNumDelete(a) {
    if (!a) {
        a = "0";
    }

    var m = a.split('').reverse(),
        ret = [],
        s = 0,
        flag = 1,
        t;

    for (var i = 0; i < a.length; i++) {
        t = Number(m[i]) - flag;

        if (t < 0) {
            flag = 1;
        } else {
            flag = 0;
        }

        ret.push((t + 10) % 10);
    }

    return ret.reverse().join('').replace(/0*(\d+)/, "$1");
}

function bindEvent() {

    /*
     * Header
     */
    $P('#language', doc).ddslick({
        data: ddlData,
        doc: doc,
        onSelected: function(data) {
            var language = data.selectedData.value,
                localeDirection = data.selectedData.localeDirection;

            $P.cookie('locale', language, {
                expires: 365
            });

            $P.cookie('localeDirection', localeDirection, {
                expires: 365
            });

            if (!$P.langSwitch(language, topDoc)) {
                $P('#language', doc).ddslick('select', {index: 0 });
                return false;
            }

            $P.langSwitch(language, doc);

            if ($("select, input[type=checkbox]", doc).length) {
                top.Custom.init(doc);
            }

            topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang('LANG4283'));

            var script = topDoc.createElement("script");

            $.each($("script", topDoc), function(index, item) {
                var src = $(item).attr("src");

                if (src && src.contains("additional-methods.js")) {
                    script.src = src;
                }
            });

            script.type = "text/javascript";

            topDoc.getElementsByTagName("head").item(0).appendChild(script);

            if (initValidator) {
                $("#form", doc).tooltip("destroy");

                initValidator();
            }
        }
    });

    $(".main_logo img").bind("click", function(ev) {
        top.window.location.href = config.model_info.logo_url;

        ev.stopPropagation();
        return false;
    });


    /*
     * Control Buttons
     */
    $('#next').bind("click", function(ev) {
        if (animating) {
            return false;
        }

        if (!$P('#form', doc).valid()) {
            var elements = $("input[titles], select[titles], textarea[titles]");

            elements.each(function(index) {
                if (!$(this).is(':hidden')) {
                    $(this).focus();

                    return false;
                }
            });

            return;
        }

        var currentStep = $('.step-cur').parent().index();

        var jumpToNextStep = function() {
            var prev = $('#prev'),
                save = $('#save'),
                next = $('#next');

            animating = true;

            steps.eq(currentStep).removeClass('step-cur').addClass('step-done');
            steps.eq(currentStep + 1).addClass('step-cur');

            if (currentStep === (steps.length - 2)) {
                next.hide();
                save.show();

                summary();
            } else if (currentStep === (steps.length - 3)) {
                $("#trunkList")
                    .trigger("reloadGrid");
            }

            if (prev.is(':hidden')) {
                prev.show();
            }

            currentField = fieldsets.eq(currentStep);
            nextField = fieldsets.eq(currentStep + 1);

            nextField.show();

            var elements = nextField.find('input, select, textarea');

            if (elements.length && $(elements[0]).is(':visible')) {
                elements[0].focus();
            }

            currentField
                .animate({
                    opacity: 0
                }, {
                    step: function(now, mx) {
                        // as the opacity of currentField reduces to 0 - stored in "now"
                        // 1. scale currentField down to 80%
                        scale = 1 - (1 - now) * 0.2;
                        // 2. bring nextField from the right(50%)
                        left = (now * 50) + "%";
                        // 3. increase opacity of nextField to 1 as it moves in
                        opacity = 1 - now;

                        currentField.css({
                            'transform': 'scale(' + scale + ')'
                        });

                        nextField.css({
                            'left': left,
                            'opacity': opacity
                        });
                    },
                    duration: 800,
                    complete: function() {
                        currentField.hide();
                        animating = false;
                    }
                });
        };

        if ((currentStep == 0) && !step2Newpass.value) {
            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG4319"),
                buttons: {
                    ok: function() {
                        jumpToNextStep();
                    },
                    cancel: function() {}
                }
            });
        } else {
            jumpToNextStep();
        }

        ev.stopPropagation();
        return false;
    });

    $('#prev').bind("click", function(ev) {
        if (animating) {
            return false;
        }

        if (!$P('#form', doc).valid()) {
            var elements = $("input[titles], select[titles], textarea[titles]");

            elements.each(function(index) {
                if (!$(this).is(':hidden')) {
                    $(this).focus();

                    return false;
                }
            });

            return;
        }

        var currentStep = $('.step-cur').parent().index(),
            prev = $(this),
            save = $('#save'),
            next = $('#next');

        animating = true;

        steps.eq(currentStep).removeClass('step-cur');
        steps.eq(currentStep - 1).removeClass('step-done').addClass('step-cur');

        if (currentStep === (steps.length - 1)) {
            next.show();
            save.hide();

            $("#timeField > .section-body").append($("#summaryTimezone").children());

            $("#networkField > .section-body").append($("#summaryNetwork").children());

            if (num_pri > 0 && firstLogin) {
                $("#digitalHardwareField > .section-body").append($("#summaryDigital").children());
            }
        } else if (currentStep === 1) {
            prev.hide();
        }

        currentField = fieldsets.eq(currentStep);
        previousField = fieldsets.eq(currentStep - 1);

        previousField.show();

        var elements = previousField.find('input, select, textarea');

        if (elements.length && $(elements[0]).is(':visible')) {
            elements[0].focus();
        }

        currentField
            .animate({
                opacity: 0
            }, {
                step: function(now, mx) {
                    // as the opacity of currentField reduces to 0 - stored in "now"
                    // 1. scale previousField from 80% to 100%
                    scale = 0.8 + (1 - now) * 0.2;
                    // 2. take currentField to the right(50%) - from 0%
                    left = ((1 - now) * 50) + "%";
                    // 3. increase opacity of previousField to 1 as it moves in
                    opacity = 1 - now;

                    currentField.css({
                        'left': left
                    });

                    previousField.css({
                        'transform': 'scale(' + scale + ')',
                        'opacity': opacity
                    });
                },
                duration: 800,
                complete: function() {
                    currentField.hide();
                    animating = false;
                }
            });

        ev.stopPropagation();
        return false;
    });

    $('#save').bind("click", function(ev) {
        if (!$P('#form', doc).valid()) {
            var elements = $("input[titles], select[titles], textarea[titles]");

            elements.each(function(index) {
                if (!$(this).is(':hidden')) {
                    $(this).focus();

                    return false;
                }
            });

            return;
        }

        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG826")
        });

        setTimeout(function() {
            saveDatas();
        }, 100);

        ev.stopPropagation();
        return false;
    });

    $('#quit').bind("click", function(ev) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG4313"),
            buttons: {
                cancel: function() {},
                ok: jumpToHomePage
            }
        });

        ev.stopPropagation();
        return false;
    });


    /*
     * Contents
     */    
    $('#time_zone').bind("change", function(ev) {
        if (this.value === 'customize') {
            $('#self_defined_time_zone').removeAttr('disabled').removeClass('disabled');

            $P('#self_defined_time_zone', doc).rules('add', {
                required: true
            });
        } else {
            $('#self_defined_time_zone').attr('disabled', 'disabled').addClass('disabled');

            $P('#self_defined_time_zone', doc).rules('remove', 'required');
        }

        ev.stopPropagation();
        return false;
    });

    $("#dhcp_enable").bind("click", function(ev) {
        dhcpSwitch();

        ev.stopPropagation();
    });

    $(".password_change").bind("click", function(ev) {
        passwordChange();

        ev.stopPropagation();
    });

    $(disableExtensionRanges).bind("click", function(ev) {
        if (this.checked) {
            $P("input[name='edit_extension']", doc).rules("remove", "range");
        } else {
            $P("input[name='edit_extension']", doc).rules("add", {
                range: [extensionRange[0], extensionRange[1]]
            });
        }

        ev.stopPropagation();
    });

    $('#batch_extension, #batch_number').bind('focus keyup', function(ev) {
        if ($P('#batch_extension, #batch_number', doc).valid()) {
            showBatchExtensionsTips();
        } else {
            $('#extensionList').hide();
        }
    });

    $("#addTrunk").bind("click", function(ev) {
        $(this).attr('disabled', 'disabled');

        $('.trunk-content').show();

        $('.control-bottons, .trunk-list').hide();

        setDefaultTrunkContent();

        trunkMode = 'add';

        ev.stopPropagation();
    });

    $("#cancelTrunk").bind("click", function(ev) {
        $("#trunkContainer").find('input, select').removeClass('ui-state-highlight');

        callBackAfterAddOrEdit();

        ev.stopPropagation();
    });

    $("#saveTrunk").bind("click", function(ev) {
        if (!$P('#form', doc).valid()) {
            var elements = $("input[titles], select[titles], textarea[titles]");

            elements.each(function(index) {
                if (!$(this).is(':hidden')) {
                    $(this).focus();

                    return false;
                }
            });

            return;
        }

        var obj = saveTrunkContent();

        if (trunkMode === 'add') {
            createdTrunksList.push(obj);
        } else {
            createdTrunksList.splice((trunkIdInEditMode - 1), 1, obj);
        }

        $("#trunkList")
            .clearGridData(true)
            .setGridParam({
                datatype: 'local',
                data: createdTrunksList
            })
            .trigger("reloadGrid");

        callBackAfterAddOrEdit();

        ev.stopPropagation();
    });

    $("#trunkType").bind("change", function(ev) {
        var val = this.value,
            trunkName = $('#trunk_name');

        if (val === 'Analog') {
            $('.voip').hide();
            $('.analog').show();

            if (trunkName.val() === 'Digital_1') {
                trunkName.val('').removeAttr('disabled');
            }

            $('option[value="byDID"]').attr({'disabled': true})
            $('#destination_type').val('account').trigger('change');
        } else if (val === 'Digital') {
            trunkName.val('Digital_1').attr('disabled', 'disabled');
            $('.voip, .analog').hide();

            $('option[value="byDID"]').attr({
                'disabled': false
            });
        } else {
            $('.analog').hide();
            $('.voip').show();

            if (trunkName.val() === 'Digital_1') {
                trunkName.val('').removeAttr('disabled');
            }

            $('option[value="byDID"]').attr({
                'disabled': false
            });
        }

        if (val !== 'SIP') {
            $('#authid_field').hide();
        } else {
            $('#authid_field').show();
        }

        top.Custom.init(doc, $('#destination_type')[0]);

        ev.stopPropagation();
    });

    $("#existedDataContainer").bind('mouseenter mouseleave', function(ev) {
        var eventType = ev.type,
            tips = $('#existedOutboundRules'),
            width = tips.width(),
            popover = tips.next(),
            localeDirection = $P.cookie('localeDirection');

        if (eventType !== 'mouseleave') {
            if (popover.is(':hidden')) {
                if (localeDirection === 'ltr') {
                    popover.css({
                            'left': (width + 1 + 'px'),
                            'right': 'auto'
                        }).show();
                } else {
                    popover.css({
                            'right': (width + 1 + 'px'),
                            'left': 'auto'
                        }).show();
                }
            }
        } else {
            popover.hide();
        }
    });

    $("#FXOPorts").bind('mouseenter mouseleave', function(ev) {
        var eventType = ev.type,
            width = $(this).width(),
            popover = $(this).next();

        if (eventType !== 'mouseleave') {
            if (width > 160) {
                popover.css({
                    'width': '250px',
                    'left': (width + 15 + 'px')
                }).show();
            } else {
                popover.show();
            }
        } else {
            popover.hide();
        }
    });

    $("#FXOPorts").delegate('.port', 'click', function(ev) {
        var me = $(this);

        if (!me.hasClass('disabled')) {
            me.toggleClass('selected');
        }

        ev.stopPropagation();
    });

    $("#newpass, #number_head, #number_length").bind("focus blur", function(ev) {
        var eventType = ev.type,
            popover = $(this).next();

        if (eventType !== 'blur') {
            popover.show();
        } else {
            popover.hide();
        }
    });

    $("#permission").bind("focus blur change", function(ev) {
        var eventType = ev.type,
            val = this.value,
            popover = $(this).next();

        if (eventType !== 'blur') {
            if (val === 'internal') {
                popover
                    .find('.popover-content > span')
                    .attr('locale', 'LANG2535 LANG1071')
                    .text($P.lang('LANG2535').format($P.lang('LANG1071')));

                popover.show();
            } else if (val === 'none') {
                popover
                    .find('.popover-content > span')
                    .attr('locale', 'LANG3700')
                    .text($P.lang('LANG3700'));

                popover.show();
            } else {
                popover.hide();
            }
        } else {
            popover.hide();
        }
    });

    $('#destination_type').bind("change", function(ev) {
        var value = $('option:selected', this).val(),
            options = '';

        if (value == "byDID") {
            $('.selectDivValue').hide();
        } else {
            $.each(existedAccountList, function(item, value) {
                var extension = value.extension,
                    fullname = value.fullname,
                    disabled = value.out_of_service;

                if (disabled == 'yes') {
                    options += "<option class='disabledExtOrTrunk' value='" + extension + "'>" +
                        extension + (fullname ? ' "' + fullname + '"' : '') + ' &lt;' + $P.lang('LANG273') + '&gt;' + "</option>";
                } else {
                    options += "<option value='" + extension + "'>" + extension + (fullname ? ' "' + fullname + '"' : '') + "</option>";
                }
            });

            $.each(createdAccountList, function(index, value) {
                options += "<option value='" + value + "'>" + value + "</option>";
            });

            $('#destination_value').empty().append(options);

            $('.selectDivValue').show();

            top.Custom.init(doc, $('#destination_value')[0]);
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#trunkList')
        .delegate('.edit', 'click', function(ev) {
            trunkIdInEditMode = Number($(this).parents('tr').attr('id'));

            if (trunkIdInEditMode && (String(trunkIdInEditMode) !== 'NaN')) {
                var data = createdTrunksList[trunkIdInEditMode - 1];

                trunkMode = 'edit';

                setChanList();

                setTrunkContent(data);

                $("#addTrunk").attr({'disabled': 'disabled'});

                $('.trunk-content').show();

                $('.control-bottons, .trunk-list').hide();
            }
        })
        .delegate('.del', 'click', function(ev) {
            var id = Number($(this).parents('tr').attr('id'));

            if (id && (String(id) !== 'NaN')) {
                createdTrunksList.splice((id - 1), 1);

                $("#trunkList")
                    .clearGridData(true)
                    .setGridParam({
                        datatype: 'local',
                        data: createdTrunksList
                    })
                    .trigger("reloadGrid");
            }
        });

    /*
     * Window
     */ 
    $(window).resize(function() {
        UCMGUI.resizeMainIframe(doc);

        var width = $(this).width();

        if (width <= "1057") {
            $("body").css("width", "1057px");
        } else {
            $("body").css("width", "100%");
        }
    });

    // Prevent auto logout while user is operating.
    $(document).mouseover(function(ev) {
        var currentTime = new Date().getTime();

        if (currentTime > (lastTime + 30000)) {
            if (top.$.gsec && top.$.gsec.checkSession) {
                top.$.gsec.checkSession();
            }

            lastTime = currentTime;
        }
    });

    // detect CR key and Caps Lock
    $(document).keypress(function(e) {
        var e = e || window.event,
            capsLock = false,
            charCode = (e.charCode ? e.charCode : e.keyCode),
            warning = $('#cap_warning');

        if (charCode >= 97 && charCode <= 122) {
            capsLock = e.shiftKey;
        } else if (charCode >= 65 && charCode <= 90 && !(e.shiftKey && /Mac/.test(navigator.platform))) {
            capsLock = !e.shiftKey;
        } else { // digits and special chars
            return true;
        }

        capsLock ? warning.css('display', 'inline-block') : warning.css('display', 'none');
    });
}

function callBackAfterAddOrEdit() {
    $("#addTrunk").removeAttr('disabled');

    $('.trunk-content').hide();

    $('.control-bottons, .trunk-list').show();

    $('option[value="byDID"]').attr({
        'disabled': false
    });

    trunkMode = '';

    trunkIdInEditMode = null;

    trunkNameInEditMode = '';

    outboundRouteNameInEditMode = '';
}

function checkChannel() {
    var digitalGroupInfo = digitalGroup,
        spanTypeVal = $("#span_type").val(),
        hardhdlc = oldHardhdlc,
        totalGroupChanArr = [],
        result = true;

    for (var i = 0; i < digitalGroupInfo.length; i++) {
        var digitalGroupInfoIndex = digitalGroupInfo[i];

        totalGroupChanArr.push(digitalGroupInfoIndex.channel);
    }

    var totalGroupChan = getTotalArr(totalGroupChanArr);

    if ((originSpanType == 'E1') && (spanTypeVal == "T1" || spanTypeVal == "J1") &&
        Number(totalGroupChan[totalGroupChan.length - 1]) > 24) {

        if (!(totalGroupChan.length == 24 && hardhdlc == 0)) {
            result = false;
        }
    }

    return result;
}

function checkNumberLength(val, ele) {
    var totalLength = Number(val),
        headNumber = $('#number_head').val();

    if (headNumber && totalLength && (headNumber.length >= totalLength)) {
        return false;
    } else {
        return true;
    }
}

function checkIfSelectedPort(val, ele) {
    var trunkType = $('#trunkType').val();

    if ((trunkType === 'Analog') && !$('#FXOPorts > .selected').length) {
        return false;
    } else {
        return true
    }
}

function checkDestinationType(val, ele) {
    var trunkType = $('#trunkType').val(),
        username = $('#username').val();

    // Register Trunk can not choose 'byDID'.
    if (username && (trunkType === 'SIP') && (val === 'byDID')) {
        return false;
    } else {
        return true;
    }
}

function checkIsSelfIp(ele) {
    var selfIp = window.location.hostname,
        inputIp = $(ele).val().split(':')[0];

    if (inputIp == selfIp) {
        return false;
    } else {
        return true;
    }
}

function checkStripx(val, ele) {
    if (!val) {
        return true;
    }

    var totalLength = Number($('#number_length').val()),
        prepend = $('#prepend').val();

    if (prepend) {
        return Number(val) <= totalLength;
    } else {
        return Number(val) < totalLength;
    }
}

function checkOutboundRouteName(val, ele) {
    var outboundRouteNameList = [];

    $.each(existedOutboundRouteList, function(item, data) {
        outboundRouteNameList.push(data.outbound_rt_name);
    });

    $.each(createdTrunksList, function(item, data) {
        outboundRouteNameList.push(data.outbound_rt_name);
    });

    if (trunkMode == 'edit') {
        if (val == outboundRouteNameInEditMode) {
            return true;
        } else {
            if (ifExisted(val, outboundRouteNameList)) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        if (ifExisted(val, outboundRouteNameList)) {
            return false;
        } else {
            return true;
        }
    }
}

function checkExtensionRange() {
    if (!disableExtensionRanges.checked) {
        var startFrom = Number(batchExtension.value),
            largeOrEqualThanStartNumber = 0,
            maxExtensionNumber = extensionRange[1],
            length = existedExtentionList.length,
            i = 0;

        for (i; i < length; i++) {
            if (existedExtentionList[i] >= startFrom) {
                largeOrEqualThanStartNumber++;
            }
        }

        if ((Number(batchNumber.value) + largeOrEqualThanStartNumber) > (maxExtensionNumber - startFrom + 1)) {
            return false;
        }
    }

    return true;
}

function check_max_users() {
    if (maxExtension < existedExtentionList.length + Number(batchNumber.value)) {
        return false;
    } else {
        return true;
    }

    return true;
}

function checkIfInPort(val, ele) {
    var existed = true;

    if (ifExisted(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function checkInterface() {
    if ($("#method").val() == "2") {
        var def = $("#default_interface").val();

        if (def == "LAN1") {
            $(".LAN2").hide();
            $(".LAN1").show();
        } else {
            $(".LAN1").hide();
            $(".LAN2").show();
        }
    } else {
        $(".LAN2").show();
    }
}

function checkOldPassword(val, ele) {
    if (!val) {
        return true;
    }

    var response;

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            'action': 'checkOldPassword',
            'user_id': currentUserId,
            'old_password': val
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var data = eval(data);

            if (data.hasOwnProperty('status') && (data.status == 0)) {
                response = true;
            } else {
                response = false;
            }
        }
    });

    return response;
}

function checkIsInSameNetworkSegment(ip1, ip2, submask, mask, str) {
    var res = true;

    if ((ip2 == "dhcp_gateway" && $("#dhcp_enable").is(":checked")) || str == "other") {
        var tenTotwo = function(str) {
            str = parseInt(str, 10).toString(2);

            for (i = str.length; i < 8; i = str.length) {
                str = "0" + str;
            }

            return str;
        };

        ip1 = $("#" + ip1).val().split(".");
        ip2 = $("#" + ip2).val().split(".");
        submask = $("#" + submask).val().split(".");
        mask = $("#" + mask).val().split(".");

        ip1 = tenTotwo(ip1[0]) + tenTotwo(ip1[1]) + tenTotwo(ip1[2]) + tenTotwo(ip1[3]);
        ip2 = tenTotwo(ip2[0]) + tenTotwo(ip2[1]) + tenTotwo(ip2[2]) + tenTotwo(ip2[3]);
        submask = tenTotwo(submask[0]) + tenTotwo(submask[1]) + tenTotwo(submask[2]) + tenTotwo(submask[3]);
        mask = tenTotwo(mask[0]) + tenTotwo(mask[1]) + tenTotwo(mask[2]) + tenTotwo(mask[3]);

        ip1 = ip1.split("");
        ip2 = ip2.split("");
        submask = submask.split("");
        mask = mask.split("");

        for (i = 0; i < 32; i++) {
            if ((ip1[i] & submask[i]) != (ip2[i] & mask[i])) {
                res = false;
                break;
            }
        }  
    }

    return res;
}

function checkIsRightIP(ip) {
    ip = $("#" + ip).val().split(".");

    var ret = true;

    if (ip[0] == "127" || ip[0] >= 224) {
        ret = false;
    }

    return ret;
}

function checkIsRightClass(ipclass, ip, mask) {
    var ret = true;

    ip = $("#" + ip).val().split(".");
    mask = $("#" + mask).val();

    // Class A IP address
    if (ip[0] <= 126 && ipclass == "A") {
        ret = /^255.*$/.test(mask);
    } else if (ip[0] >= 128 && ip[0] <= 191 && ipclass == "B") { // Class B IP address
        ret = /^255.255.*$/.test(mask);
    } else if (ip[0] >= 192 && ip[0] <= 223 && ipclass == "C") { // Class C IP address
        ret = /^255.255.255.*$/.test(mask);
    }

    return ret;
}

function checkTrunkNameIsExist(val, ele) {
    var tmpTrunkNameList = [];

    $.each(existedTrunkNameList, function(index, value) {
        tmpTrunkNameList.push(value);
    });

    $.each(createdTrunksList, function(item, data) {
        tmpTrunkNameList.push(data.trunk_name);
    });

    if (trunkMode == 'edit') {
        if (val == trunkNameInEditMode) {
            return true;
        } else {
            if (ifExisted(val, tmpTrunkNameList)) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        if (ifExisted(val, tmpTrunkNameList)) {
            return false;
        } else {
            return true;
        }
    }
}

function createTrunkType(cellvalue, options, rowObject) {
    var type = '';

    if (rowObject.type === 'Analog') {
        type = '<div class="members wordBreak" locale="LANG639">' + $P.lang("LANG639") + '</div>';
    } else if (rowObject.type === 'Digital') {
        type = '<div class="members wordBreak" locale="LANG3141">' + $P.lang("LANG3141") + '</div>';
    } else {
        var trunktype;

        if (rowObject.type === 'SIP') {
            trunktype = (rowObject.trunk_type === 'peer' ? 'LANG233' : 'LANG234');
        } else {
            trunktype = (rowObject.trunk_type === 'peer' ? 'LANG235' : 'LANG236');
        }

        type = '<div class="members wordBreak" locale="' + trunktype + '">' + $P.lang(trunktype) + '</div>';
    }

    return type;
}

function createTrunk(cellvalue, options, rowObject) {
    var trunks = '';

    if (rowObject.type === 'Analog') {
        var country = nation2langObj[rowObject.countrytone];

        trunks = '<div class="members wordBreak"><span locale="LANG1351">' + $P.lang('LANG1351') + '</span>: ' + rowObject.trunk_name + '</div>' +
            '<div class="members wordBreak"><span locale="LANG1349">' + $P.lang('LANG1349') + '</span>: <span locale="' + country + '">' + $P.lang(country) + '</span></div>' +
            '<div class="members wordBreak"><span locale="LANG1329">' + $P.lang('LANG1329') + '</span>: ' + rowObject.chans + '</div>';
    } else if (rowObject.type === 'Digital') {
        trunks = '<div class="members wordBreak"><span locale="LANG1351">' + $P.lang('LANG1351') + '</span>: ' + rowObject.trunk_name + '</div>';
    } else {
        trunks = '<div class="members wordBreak"><span locale="LANG1351">' + $P.lang('LANG1351') + '</span>: ' + rowObject.trunk_name + '</div>' +
            '<div class="members wordBreak"><span locale="LANG1373">' + $P.lang('LANG1373') + '</span>: ' + rowObject.host + '</div>';
    }

    return trunks;
}

function createInbound(cellvalue, options, rowObject) {
    var destination = '',
        destinationType = rowObject.destination_type;

    switch (destinationType) {
        case 'byDID':
            destination = '<div class="members wordBreak" locale="LANG1563">' + $P.lang("LANG1563") + '</div>';
            break;
        case 'account':
            destination = showDestination('LANG248', rowObject[destinationType], destinationType);
            break;
        default:
            destination = '<div class="members>--</div>';
            break;
    }

    return destination;
}

function checkIfAcountInList(val) {
    var existed = false;

    $.each(existedExtentionList, function(item, value) {
        if (value && (value === val)) {
            existed = true;

            return false;
        }
    });

    $.each(createdAccountList, function(index, value) {
        if (value && (value === val)) {
            existed = true;

            return false;
        }
    });

    return existed;
}

function createOutbound(cellvalue, options, rowObject) {
    var outbound = '',
        permission = permission2langObj[rowObject.permission];

    outbound = '<div class="members wordBreak"><span locale="LANG1533">' + $P.lang('LANG1533') + '</span>: ' + rowObject.outbound_rt_name + '</div>' +
        '<div class="members wordBreak"><span locale="LANG246">' + $P.lang('LANG246') + '</span>: ' + rowObject.pattern + '</div>' +
        '<div class="members wordBreak"><span locale="LANG1543">' + $P.lang('LANG1543') + '</span>: <span locale="' + permission + '">' + $P.lang(permission) + '</span></div>';

    return outbound;
}

function createOptions(cellvalue, options, rowObject) {
    var options = "<button type='button' class='options edit' localeTitle='LANG738' title='" + $P.lang("LANG738") + "'></button>" +
            "<button type='button' class='options del' localeTitle='LANG739' title='" + $P.lang("LANG739") + "'></button>";

    return options;
}

function createPattern(cellvalue, options, rowObject) {
    var pattern = '',
        patternList = cellvalue.split(','),
        patternListLength = patternList.length;

    for (var i = 0; i < patternListLength; i++) {
        if (patternList[i]) {
            pattern += '<div style="line-height: 20px;">' + patternList[i] + '</div>';
        }
    }

    return pattern;
}

function createPermission(cellvalue, options, rowObject) {
    var privilegeName;

    switch (cellvalue) {
        case 'internal':
            privilegeName = '<span locale="LANG1071">' + $P.lang('LANG1071') + '</span>';
            break;
        case 'local':
            privilegeName = '<span locale="LANG1072">' + $P.lang('LANG1072') + '</span>';
            break;
        case 'national':
            privilegeName = '<span locale="LANG1073">' + $P.lang('LANG1073') + '</span>';
            break;
        case 'international':
            privilegeName = '<span locale="LANG1074">' + $P.lang('LANG1074') + '</span>';
            break;
        default:
            privilegeName = '<span locale="LANG273">' + $P.lang('LANG273') + '</span>';
    }

    return privilegeName;
}

function changeTitle(rowId, tv, rawObject, cm, rdata) {
    return 'title="' + rawObject.pattern + '"';
}

function createTable() {
    $("#outboundRulesList").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: 515,
        height: "auto",
        postData: {
            "action": "listOutboundRoute",
            "options": "outbound_rt_name,outbound_rt_index,permission,sequence,pattern"
        },
        colNames: [
            '<span locale="LANG656">' + $P.lang('LANG656') + '</span>',
            '<span locale="LANG246">' + $P.lang('LANG246') + '</span>',
            '<span locale="LANG1543">' + $P.lang('LANG1543') + '</span>'
        ],
        colModel: [{
            name: 'outbound_rt_name',
            index: 'outbound_rt_name',
            width: 100,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'pattern',
            index: 'pattern',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createPattern,
            cellattr: changeTitle,
            sortable: false
        }, {
            name: 'permission',
            index: 'permission',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createPermission,
            sortable: false
        }],
        pager: "#outboundRulesPager",
        rowNum: 5,
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'sequence',
        noData: "LANG129 LANG655",
        jsonReader: {
            root: "response.outbound_route",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#outboundRulesList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            if (!$("#outboundRulesList").getGridParam("records")) {
                $('#existedDataContainer').hide();
            }

            $('#outboundRulesPager_right').hide();
        }
    });

    $("#trunkList").jqGrid({
        data: createdTrunksList,
        datatype: 'local',
        width: 690,
        height: 'auto',
        colNames: [
            '<span locale="LANG4324">' + $P.lang('LANG4324') + '</span>',
            '<span locale="LANG83">' + $P.lang('LANG83') + '</span>',
            '<span locale="LANG4325">' + $P.lang('LANG4325') + '</span>',
            '<span locale="LANG4326">' + $P.lang('LANG4326') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'type',
            index: 'type',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createTrunkType,
            sortable: false
        }, {
            name: 'trunk_name',
            index: 'trunk_name',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createTrunk,
            sortable: false
        }, {
            name: 'outbound_rt_name',
            index: 'outbound_rt_name',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createOutbound,
            sortable: false
        }, {
            name: 'destination_type',
            index: 'destination_type',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createInbound,
            sortable: false
        }, {
            name: 'options',
            index: 'options',
            width: 80,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#trunkListPager",
        rowNum: 100000,
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        noData: "LANG4454 LANG769",
        loadComplete: function() {
            $("#trunkList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {}
    });

    $("#summaryTrunkList").jqGrid({
        data: createdTrunksList,
        datatype: 'local',
        width: 690,
        height: 'auto',
        colNames: [
            '<span locale="LANG4324">' + $P.lang('LANG4324') + '</span>',
            '<span locale="LANG83">' + $P.lang('LANG83') + '</span>',
            '<span locale="LANG4325">' + $P.lang('LANG4325') + '</span>',
            '<span locale="LANG4326">' + $P.lang('LANG4326') + '</span>'
        ],
        colModel: [{
            name: 'type',
            index: 'type',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createTrunkType,
            sortable: false
        }, {
            name: 'trunk_name',
            index: 'trunk_name',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createTrunk,
            sortable: false
        }, {
            name: 'outbound_rt_name',
            index: 'outbound_rt_name',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createOutbound,
            sortable: false
        }, {
            name: 'destination_type',
            index: 'destination_type',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createInbound,
            sortable: false
        }],
        pager: "#summaryTrunkListPager",
        rowNum: 100000,
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        noData: "LANG129 LANG83",
        loadComplete: function() {
            $("#summaryTrunkList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {}
    });
}

function dhcpSwitch() {
    var checked = !$("#dhcp_enable").is(":checked");

    $("#dhcp_dns1, #dhcp_dns2, #ipfrom, #ipto, #dhcp_gateway, #ipleasetime").attr("disabled", checked);
}

function generateNewExtension() {
    var startExt = extensionRange[0],
        endExt = extensionRange[1],
        i = startExt;

    for (i; i <= endExt; i++) {
        if (i < 10) {
            i = "0" + i;
        }

        if (!ifExisted(i, existedNumberList)) {
            return i;
        }
    }
}

function getTotalArr(arr) {
    var totalArr = [];

    for (var i = 0; i < arr.length; i++) {
        var index = arr[i],
            indexArr = [];

        if (/,/.test(index)) {
            indexArr = index.split(",");
        }

        if (indexArr.length == 0) {
            totalArr = totalArr.concat(getEndTotalArr(index));
        } else {
            for (var j = 0; j < indexArr.length; j++) {
                var indexArrIndex = indexArr[j];

                totalArr = totalArr.concat(getEndTotalArr(indexArrIndex));
            }
        }
    }

    return totalArr;
}

function getEndTotalArr(str) {
    var endTotalArr = [];

    if (/-/.test(str)) {
        var match = str.match(/(\d+)-(\d+)/);

        if (match[1] && match[2]) {
            var matchFirst = Number(match[1]),
                matchSecon = Number(match[2]);

            for (var j = 0; j < (matchSecon - matchFirst + 1); j++) {
                endTotalArr.push(String(matchFirst + j));
            }
        }
    } else if (str) {
        endTotalArr.push(str);
    }

    return endTotalArr;
}

function getBatchUsers() {
    var startExt = batchExtension.value,
        addNumber = parseInt(batchNumber.value),
        batchAddExtList = [];

    while (startExt.length && addNumber) {
        if (ifExisted(startExt, existedNumberList)) {
            startExt = bigNumAdd(startExt);
            continue;
        }

        batchAddExtList.push(startExt);

        startExt = bigNumAdd(startExt);

        addNumber--;
    }

    return batchAddExtList;
}

function getBatchExtensionsTips() {
    var addNumber = parseInt(batchNumber.value),
        newusersLists = [];

    createdAccountList = getBatchUsers();

    if (!createdAccountList.length) {
        newusersLists = '';
    } else {
        newusersLists.push("<font>" + createdAccountList[0] + "</font>");

        for (var i = 1; i < addNumber; i++) {
            var newusersItem = createdAccountList[i],
                prevItem = createdAccountList[i - 1],
                prev = bigNumDelete(newusersItem);

            if ((typeof prevItem == 'string' ? prevItem.replace(/0*(\d+)/, "$1") : prevItem) == prev) {
                newusersItem = "<font>" + newusersItem + "</font>";
            } else {
                newusersItem = "<font class='green bold'>" + newusersItem + "</font>";
            }

            newusersLists.push(newusersItem);
        }

        newusersLists = newusersLists.join('  ');
    }

    return newusersLists;
}

function getDomStr() {
    var domStr = "",
        dom = $("#networkContainer").find("input, select");

    dom.each(function() {
        if (this.type == 'checkbox') {
            domStr += (this.checked ? "yes" : "no");
        } else {
            domStr += this.value;
        }
    });

    return domStr;
}

function getDatas() {

    // Get Time Settings
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            'action': 'getTimeSettings',
            'self_defined_time_zone': '',
            'time_zone': ''
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
                lastSFTimezone = data.response.self_defined_time_zone;
                lastTimezone = data.response.time_zone;
                $('#self_defined_time_zone').val(lastSFTimezone);
                $('#time_zone').val(lastTimezone).trigger('change');
            }
        }
    });

    // Get Language
    $.ajax({
        type: "POST",
        url: "../cgi",
        async: false,
        data: {
            action: 'getLanguageSettings'
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
                var currentLanguage = data.response.language_settings.language;

                $("#" + currentLanguage).attr("checked", true);
            }
        }
    });

    // Get Password
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            'action': 'getUser',
            'user_name': currentUserName,
            'user_password': '',
            'email': ''
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
                if (data.response.user_name && data.response.user_name.hasOwnProperty('user_password')) {
                    var userInfo = data.response.user_name,
                        sEmail = userInfo.email;

                    // DOM_hidepass.val(userInfo.user_password);

                    if (sEmail) {
                        // $('#email').val(sEmail);
                    }
                }
            }
        }
    });

    // GetNetWorkSettings
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            'action': 'getNetworkSettings'
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
                    netSettings = response.network_settings,
                    dhcpSettings = response.dhcp_settings,
                    defaultInterface = (netSettings["default_interface"] || "LAN2");

                method = (netSettings["method"] || "1");

                $("#method").val(method);
                $("#altdns").val(netSettings["altdns"] == "0.0.0.0" ? '' : netSettings["altdns"]);
                $("#lan1_ip_method").val(netSettings["lan1_ip_method"] || "0");
                $("#lan1_ipaddr").val(netSettings["lan1_ipaddr"] || "0.0.0.0");
                $("#lan1_submask").val(netSettings["lan1_submask"] || "0.0.0.0");
                $("#lan1_gateway").val(netSettings["lan1_gateway"] || "0.0.0.0");
                $("#lan1_dns1").val(netSettings["lan1_dns1"] || "0.0.0.0");
                $("#lan1_dns2").val(netSettings["lan1_dns2"] == "0.0.0.0" ? '' : netSettings["lan1_dns2"]);
                $("#lan1_username").val(netSettings["lan1_username"] || "");
                $("#lan1_password").val(netSettings["lan1_password"] || "");
                // $("#lan1_vid").val(netSettings["lan1_vid"] || "");
                // $("#lan1_priority").val(netSettings["lan1_priority"] || "");

                if (Number(config.model_info.num_eth) >= 2) {
                    $("#default_interface").val(defaultInterface);
                    $("#lan2_ip_method").val(netSettings["lan2_ip_method"] || "0");
                    $("#lan2_ip").val(netSettings["lan2_ip"] || "");
                    $("#lan2_mask").val(netSettings["lan2_mask"] || "");
                    $("#lan2_gateway").val(netSettings["lan2_gateway"] || "");
                    $("#lan2_dns1").val(netSettings["lan2_dns1"] || "");
                    $("#lan2_dns2").val(netSettings["lan2_dns2"] || "");
                    $("#lan2_username").val(netSettings["lan2_username"] || "");
                    $("#lan2_password").val(netSettings["lan2_password"] || "");
                    // $("#lan2_vid").val(netSettings["lan2_vid"] || "");
                    // $("#lan2_priority").val(netSettings["lan2_priority"] || "");

                    if (config.model_info.allow_nat == "1") {
                        $("#dhcp_submask").val(dhcpSettings["dhcp_submask"] || "");
                        $("#dhcp_ipaddr").val(dhcpSettings["dhcp_ipaddr"] || "");
                        $("#dhcp_enable").attr("checked", netSettings["dhcp_enable"] == 1 ? true : false);
                        $("#dhcp_dns1").val(dhcpSettings["dhcp_dns1"] || "");
                        $("#dhcp_dns2").val(dhcpSettings["dhcp_dns2"] || "");
                        $("#ipfrom").val(dhcpSettings["ipfrom"] || "");
                        $("#ipto").val(dhcpSettings["ipto"] || "");
                        $("#dhcp_gateway").val(dhcpSettings["dhcp_gateway"] || "");
                        $("#ipleasetime").val(dhcpSettings["ipleasetime"] || "43200");

                        dhcpSwitch();
                    }
                }

                ipMethodSwitch();

                NetworkMethodSwitch();

                /* 
                 * Pengcheng Zou Added. Check if the port is eth0 or eth1.
                 */
                if (method === '2') {
                    lastInterface = interfaceObj[method][defaultInterface];
                } else {
                    lastInterface = interfaceObj[method];
                }

                oldNetworkStr = getDomStr();
            }
        }
    });

    // Get Feature Codes Parking Settings
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getFeatureCodes"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var featureSettings = data.response.feature_settings,
                    parkext = featureSettings.parkext,
                    parkpos = featureSettings.parkpos.split('-');

                portExtensionList.push(parseInt(parkext, 10));

                for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                    portExtensionList.push(i);
                }
            }
        }
    });

    // List All Tone Zone Settings
    $.ajax({
        url: '../cgi',
        type: 'POST',
        async: false,
        data: {
            'action': "listAllToneZoneSettings",
            'options': "description,country,busy,congestion",
            'sidx': "description"
        },
        success: function(data) {
            var data = eval(data);

            if (data && data.status == 0) {
                loadToneZone(data.response.CountryTone);
            }
        }
    });

    // List Digital Trunk Datas for UCM65XX
    if (num_pri > 0 && firstLogin) {
        $.ajax({
            url: "../cgi",
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                "action": "getDigitalHardwareSettings"
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    priSettings = data.response.digital_driver_settings;
                }
            }
        });

        $.ajax({
            url: "../cgi",
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                "action": "getDigitalHardwareSS7Settings"
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    ss7Settings = data.response.ss7_settings[0];
                }
            }
        });

        $.ajax({
            url: "../cgi",
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                "action": "getDigitalHardwareR2Settings"
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    mfcR2Settings = data.response.mfc_r2_settings[0];
                }
            }
        });

        $.ajax({
            url: "../cgi",
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                "action": "listDigitalGroup"
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    digitalGroup = data.response.digital_group;
                }
            }
        });

        loadDigitalList();
    }
}

function getExtRange() {
    var arr = [0, 100];

    if (num_pri > 0) {
        arr = [0, 500];
    }

    return arr;
}

function initNetworkMethod() {
    if (Number(config.model_info.num_eth) >= 2) {
        $("#mode_div").show();

        $("<option>").attr({
            value: 1,
            locale: "LANG551"
        }).text($P.lang("LANG551")).appendTo('#method');

        $("<option>").attr({
            value: 2,
            locale: "LANG2219"
        }).text($P.lang("LANG2219")).appendTo('#method');

        if (config.model_info.allow_nat == "1") {
            $("<option>").attr({
                value: 0,
                locale: "LANG550"
            }).text($P.lang("LANG550")).appendTo('#method');
        }
    } else {
        $("#mode_div").hide();
    }
}

function initPage() {
    var stepList = [], // Init Settings Guide Steps
        arr = [], // Init existedChanList
        stepLiClassName = '',
        stepString = '',
        i, length;

    /*
     * Init Value
     */
    firstLogin = (top.$.cookie("first_login") === 'yes' ? true : false);

    if (currentUserName.length > 6) {
        userInfo.attr("title", currentUserName);
        currentUserName = currentUserName.substring(0, 6) + "...";
    }

    userInfo.text(currentUserName);

    $("#copyright").html(config.model_info.copyright);

    $("#logo").attr("src", "../" + config.model_info.logo);

    $P.cookie('position', 'settings_guide', {
        expires: 365
    });

    $.each(config.countryObj, function(index, value) {
        var lang = {};

        if ($P.cookie('locale') == value.languages) {
            lang.selected = true;
        }

        lang.text = value.localName;
        lang.value = value.languages;
        lang.localeDirection = value.localeDirection;
        // lang.imageSrc = "../images/" + value.languages + ".png";

        ddlData.push(lang);
    });

    // Init existedChanList
    for (i = 0, length = existedChanList.length; i < length; i++) {
        arr.push(existedChanList[i]["chan"]);
    }

    existedChanList = arr;

    // get existed trunk name
    existedTrunkNameList = transTrunkData(existedTrunkList);


    /*
     * Init Behavior
     */
    $.fn.hoverClass = function() {
        var me = this;

        me.each(function(c) {
            me.eq(c).hover(function() {
                var subnav = $(".subnav");

                if (!subnav.is(":animated")) {
                    subnav.stop(true, false).animate({
                        width: ['show', 'swing'],
                        height: ['show', 'swing'],
                        opacity: 'show'
                    }, 300, 'linear');

                    $("#navbox .dd-pointer").addClass("dd-pointer-up");
                };
            }, function() {
                var subnav = $(".subnav");

                subnav.slideUp(50);

                $("#navbox .dd-pointer").removeClass("dd-pointer-up");
            })
        });

        return me;
    };

    $("#navbox").hoverClass();

    $("#main-container").show();


    /*
     * System Invoke
     */
    $P.lang(doc, true);

    UCMGUI.resizeMainIframe(doc);

    UCMGUI.loginFunction.checkifLoggedIn('ping');


    /*
     * Init Settings Guide
     */
    if (num_pri > 0 && firstLogin) {
        stepList = allSteps['65'];

        $('#progressbar').removeClass('UCM61XX').addClass('UCM65XX');

        $('#trunkType').append('<option value="Digital" locale="LANG3141"></option>');
    } else {
        stepList = allSteps['61'];

        $('#digitalHardwareField').remove();

        $('#summaryDigital').prev().remove().end().remove();
    }

    for (i = 0, length = stepList.length; i < length; i++) {
        if (i === 0) {
            stepLiClassName = 'step-first';
        } else if (i === (length - 1)) {
            stepLiClassName = 'step-last';
        } else {
            stepLiClassName = '';
        }

        stepString += '<li class="' + stepLiClassName + '">' +
                '<div class="step">' +
                    '<div class="step-name" locale="' + stepList[i] + '"></div>' +
                    '<div class="step-no">' + (i + 1) + '</div>' +
                '</div>' +
            '</li>';
    }

    $('#progressbar').append(stepString);

    for (i = 0, length = existedLocalLangList.length; i < length; i++) {
        sLanguageId = existedLocalLangList[i].language_id;
        sLanguageName = existedLocalLangList[i].language_name;

        $("#languagediv").append(
            '<div class="radio_wrap"><input id="' + sLanguageId +
            '" name="languageid" type="radio" class="" value="' + sLanguageId +
            '" /><span>' + sLanguageName + '</span></div>'
        );
    }

    steps = $('.step');

    fieldsets = $('fieldset');

    steps.eq(0).addClass('step-cur');

    fieldsets.eq(0).show();

    initNetworkMethod();

    disableExtensionRanges.checked = ((extensionRange[2] === 'yes') ? true : false);

    if (existedExtentionList.length < maxExtension) {
        batchExtension.value = generateNewExtension();
        batchNumber.value = '5';
    } else {
        $('#extensionField .fs-subtitle')
            .attr('locale', 'LANG4373 LANG3386')
            .text($P.lang('LANG4373').format($P.lang('LANG3386')));

        $('#extensionField input').attr('disabled', 'disabled');
    }

    createTable();
}

function initValidator() {
    var ipfrom = $('#ipfrom');

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "self_defined_time_zone": {
                maxlength: 64
            },
            "oldpass": {
                required: function() {
                    if (step2Newpass.value || step2NewpassRep.value || step2Email.value) {
                        return true;
                    } else {
                        return false;
                    }
                },
                keyboradNoSpace: true,
                minlength: 4,
                maxlength: 32,
                // customCallback: [$P.lang("LANG933"), checkPassword]
                customCallback: [$P.lang("LANG933"), checkOldPassword]
            },
            "newpass": {
                required: function() {
                    if (step2Oldpass.value || step2NewpassRep.value || step2Email.value) {
                        return true;
                    } else {
                        return false;
                    }
                },
                minlength: 8,
                maxlength: 32,
                // equalTo: '#newpass_rep',
                keyboradNoSpace: true,
                // Strong Password
                checkAlphanumericPw: [UCMGUI.enableWeakPw.showCheckPassword, {
                    pwsId: "#newpass",
                    doc: doc
                }]
            },
            "newpass_rep": {
                required: function() {
                    if (step2Oldpass.value || step2Newpass.value || step2Email.value) {
                        return true;
                    } else {
                        return false;
                    }
                },
                equalTo: step2Newpass,
                minlength: 8,
                maxlength: 32,
                keyboradNoSpace: true
            },
            "email": {
                required: function() {
                    if (step2Oldpass.value || step2Newpass.value || step2NewpassRep.value) {
                        return true;
                    } else {
                        return false;
                    }
                },
                email: true
            },
            "altdns": {
                ipDns: [$P.lang("LANG579")]
            },
            "lan1_gateway": {
                required: true,
                ipDnsSpecial: [$P.lang("LANG156")]
            },
            "lan1_submask": {
                required: true,
                mask: [$P.lang("LANG157")],
                customCallback: [$P.lang("LANG3035").format("A", "8"),
                    function() {
                        return checkIsRightClass("A", "lan1_ipaddr", "lan1_submask");
                    }
                ],
                customCallback1: [$P.lang("LANG3035").format("B", "16"),
                    function() {
                        return checkIsRightClass("B", "lan1_ipaddr", "lan1_submask");
                    }
                ],
                customCallback2: [$P.lang("LANG3035").format("C", "24"),
                    function() {
                        return checkIsRightClass("C", "lan1_ipaddr", "lan1_submask");
                    }
                ]
            },
            "lan1_ipaddr": {
                required: true,
                ipDnsSpecial: ["IP"],
                customCallback1: [$P.lang("LANG2176"),
                    function() {
                        if ($(".LAN2")[0].style.display != "none") {
                            return checkIsInSameNetworkSegment("lan1_ipaddr", "lan1_gateway", "lan1_submask", "lan1_submask", "other");
                        } else {
                            return true;
                        }
                    }
                ],
                customCallback: [$P.lang("LANG2430"),
                    function() {
                        if ($("#lan1")[0].style.display != "none" && $("#lan1_ip_method").val() == "1" && $("#lan2_ip_method").val() == "1") {
                            return !checkIsInSameNetworkSegment("lan1_ipaddr", "lan2_ip", "lan1_submask", "lan2_mask", "other");
                        } else {
                            return true;
                        }
                    }
                ]
            },
            "dns1": {
                required: true,
                ipDns: [$P.lang("LANG579")]
            },
            "dns2": {
                ipDns: [$P.lang("LANG579")]
            },
            "lan1_username": {
                required: true,
                maxlength: 64,
                keyboradNoSpaceSpecial: true
            },
            "lan1_password": {
                required: true,
                maxlength: 64,
                pppoeSecret: true
            },
            "lan1_vid": {
                digits: true,
                customCallback: [$P.lang("LANG2524"),
                    function(value) {
                        var val = Number(value);

                        if (val == 0 || val > 1 && val <= 4094) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                ]
            },
            "lan1_priority": {
                digits: true,
                range: [0, 7]
            },
            "dhcp_ipaddr": {
                required: true,
                ipDnsSpecial: ["IP"],
                customCallback1: [$P.lang("LANG3034"),
                    function() {
                        return checkIsRightIP("dhcp_ipaddr");
                    }
                ],
                customCallback2: [$P.lang("LANG2176"),
                    function() {
                        return checkIsInSameNetworkSegment("dhcp_ipaddr", "dhcp_gateway", "dhcp_submask", "dhcp_submask");
                    }
                ],
                customCallback: [$P.lang("LANG2430"),
                    function() {
                        if ($("#lan1_ip_method").val() == "1") {
                            return !checkIsInSameNetworkSegment("lan1_ipaddr", "dhcp_ipaddr", "lan1_submask", "dhcp_submask", "other");
                        } else {
                            return true;
                        }
                    }
                ]
            },
            "dhcp_submask": {
                required: true,
                mask: [$P.lang("LANG157")],
                customCallback: [$P.lang("LANG3035").format("A", "8"),
                    function() {
                        return checkIsRightClass("A", "dhcp_ipaddr", "dhcp_submask");
                    }
                ],
                customCallback1: [$P.lang("LANG3035").format("B", "16"),
                    function() {
                        return checkIsRightClass("B", "dhcp_ipaddr", "dhcp_submask");
                    }
                ],
                customCallback2: [$P.lang("LANG3035").format("C", "24"),
                    function() {
                        return checkIsRightClass("C", "dhcp_ipaddr", "dhcp_submask");
                    }
                ]
            },
            "lan2_gateway": {
                required: true,
                ipDnsSpecial: [$P.lang("LANG156")]
            },
            "lan2_mask": {
                required: true,
                mask: [$P.lang("LANG157")]
            },
            "lan2_ip": {
                required: true,
                ipDnsSpecial: ["IP"],
                customCallback: [$P.lang("LANG2176"),
                    function() {
                        if ($(".LAN1")[0].style.display != "none") {
                            return checkIsInSameNetworkSegment("lan2_ip", "lan2_gateway", "lan2_mask", "lan2_mask", "other");
                        } else {
                            return true;
                        }
                    }
                ]
            },
            "lan2_dns1": {
                required: true,
                ipDns: [$P.lang("LANG579")]
            },
            "lan2_dns2": {
                ipDns: [$P.lang("LANG579")]
            },
            "lan2_username": {
                required: true,
                maxlength: 64,
                keyboradNoSpace: true
            },
            "lan2_password": {
                required: true,
                maxlength: 64,
                pppoeSecret: true
            },
            "lan2_vid": {
                digits: true,
                customCallback: [$P.lang("LANG2524"),
                    function(value) {
                        var val = Number(value);

                        if (val == 0 || val > 1 && val <= 4094) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                ]
            },
            "lan2_priority": {
                digits: true,
                range: [0, 7]
            },
            "ipfrom": {
                required: true,
                ipDnsSpecial: ["IP"],
                checkSameNetworkSegment: [$('#dhcp_gateway'), $('#dhcp_submask')]
            },
            "ipto": {
                required: true,
                ipDnsSpecial: ["IP"],
                checkSameNetworkSegment: [$('#dhcp_gateway'), $('#dhcp_submask')],
                strbigger: [$P.lang("LANG1921"), $P.lang("LANG1919"), ipfrom],
                customCallback: [$P.lang("LANG2429").format($P.lang("LANG1915"), $P.lang("LANG1919"), $P.lang("LANG1921")),
                    function() {
                        return !($("#dhcp_ipaddr").val() == $("#ipfrom").val() && ($("#dhcp_ipaddr").val() == $("#ipto").val()));
                    }
                ]
            },
            "ipleasetime": {
                required: true,
                digits: true,
                range: [300, 172800]
            },
            "dhcp_gateway": {
                required: true,
                ipDnsSpecial: [$P.lang("LANG156")]
            },
            // "span_type": {
            //     customCallback: [$P.lang("LANG2783"), function() {
            //             return checkChannel();
            //         }
            //     ]
            // },
            "pointcode": {
                required: true,
                //digits: true,
                customCallback: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
                    function() {
                        return !($("#pointcode").val() == $("#defaultdpc").val());
                    }
                ],
                customCallback2: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
                    function() {
                        return !($("#pointcode").val() == $("#defaultdpc").val());
                    }
                ]
            },
            "defaultdpc": {
                required: true,
                // digits: true,
                customCallback: [$P.lang("LANG3263").format($P.lang("LANG3259"), $P.lang("LANG3257")),
                    function() {
                        return !($("#defaultdpc").val() && $("#pointcode").val() == $("#defaultdpc").val());
                    }
                ]
            },
            "cicbeginswith": {
                required: true,
                digits: true,
                range: function() {
                    if ($("#span_type").val() === "E1") {
                        return ($('#ss7type').val() === 'ansi') ? [0, 16353] : [0, 4065];
                    }

                    return ($('#ss7type').val() === 'ansi') ? [0, 16360] : [0, 4072];
                }
            },
            "edit_extension": {
                required: function() {
                    if (batchNumber.value && batchNumber.value != '0') {
                        return true;
                    } else {
                        return false;
                    }
                },
                digits: true,
                minlength: 2,
                customCallback1: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "batch_number": {
                digits: true,
                range: getExtRange,
                customCallback1: [$P.lang("LANG811").format(maxExtension, existedExtentionList.length), check_max_users],
                customCallback2: [$P.lang("LANG3508").format($P.lang('LANG1155'), $P.lang('LANG1157')), checkExtensionRange]
            },
            "batch_secret": {
                required: function() {
                    if (batchNumber.value && batchNumber.value != '0') {
                        return true;
                    } else {
                        return false;
                    }
                },
                keyboradNoSpacesemicolon: true,
                minlength: 4
            },
            "trunk_name": {
                required: true,
                minlength: 2,
                alphanumeric: true,
                customCallback: [$P.lang("LANG2137"), checkTrunkNameIsExist],
                customCallback1: [$P.lang('LANG2135').format(1, $P.lang('LANG1329')), checkIfSelectedPort]
            },
            "host": {
                required: true,
                host: [$P.lang('LANG1373').toLowerCase()],
                isExist: [$P.lang("LANG2542").format($P.lang("LANG1373")), checkIsSelfIp]
            },
            "username": {
                required: function(element) {
                    return $('#secret').val() ? true : false;
                },
                authid: true
            },
            "secret": {
                required: function(element) {
                    return $('#username').val() ? true : false;
                },
                keyboradNoSpace: true
            },
            "outbound_rt_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                customCallback: [$P.lang("LANG2137"), checkOutboundRouteName]
            },
            "number_head": {
                // required: true,
                digits: true
            },
            "number_length": {
                required: true,
                digits: true,
                range: [2, 31],
                customCallback: [$P.lang("LANG4334").format($P.lang("LANG4328"), $P.lang("LANG4327")), checkNumberLength]
            },
            "stripx": {
                digits: true,
                customCallback: [$P.lang('LANG2391').format($P.lang("LANG4328")), checkStripx]
            },
            "prepend": {
                phoneNumberOrExtension: true
            },
            "destination_value": {
                // required: true
            },
            "destination_type": {
                customCallback: [$P.lang('LANG4958'), checkDestinationType]
            },
            "authid": {
                authid: true
            }
        },
        newValidator: true
    });

    if (extensionRange[4] == "yes") { // weak_password
        $P("#batch_secret", doc).rules("add", {
            required: function() {
                if (batchNumber.value && batchNumber.value != '0') {
                    return true;
                } else {
                    return false;
                }
            },
            identical: [$P.lang("LANG85"), $P.lang("LANG4320"), getBatchUsers()],
            checkAlphanumericPw: [
                showCheckPassword, {
                    pwsId: "#batch_secret",
                    doc: doc
                }
            ]
        });
    }

    if (!disableExtensionRanges.checked) {
        $P("input[name='edit_extension']", doc).rules("add", {
            range: [extensionRange[0], extensionRange[1]]
        });
    }
}

function ipMethodSwitch() {
    var sval = $("#lan1_ip_method").val();

    if (sval == "0") {
        $("#divStatic").hide();
        $("#divPPPoE").hide();
        $("#divDHCP").show();
    } else if (sval == "1") {
        $("#divStatic").show();
        $("#divPPPoE").hide();
        $("#divDHCP").hide();
    } else {
        $("#divStatic").hide();
        $("#divPPPoE").show();
        $("#divDHCP").hide();
    }

    var sval = $("#lan2_ip_method").val();

    if (sval == "0") {
        $("#divStatic2").hide();
        $("#divPPPoE2").hide();
        $("#divDHCP2").show();
    } else if (sval == "1") {
        $("#divStatic2").show();
        $("#divPPPoE2").hide();
        $("#divDHCP2").hide();
    } else {
        $("#divStatic2").hide();
        $("#divPPPoE2").show();
        $("#divDHCP2").hide();
    }
}

function jumpToHomePage() {
    $P("#frameContainer").attr("src", "html/home.html");
}

function loadDigitalList() {
    var priSettingsInfo = {};

    for (var i = 0; i < priSettings.length; i++) {
        var priSettingsIndex = priSettings[i];

        priSettingsInfo = priSettingsIndex;

        $("#span_type").val(priSettingsInfo.span_type);

        originSpanType = priSettingsInfo.span_type;
        oldDigitalGroupName = priSettingsInfo.digital_group_name;
        oldSingnaling = priSettingsInfo.signalling;
        oldCoding = priSettingsInfo.coding;
        oldHardhdlc = priSettingsInfo.hardhdlc;
    }

    $("#span_type").bind("change", function(ev) {
        if ($(this).val() == "E1") {
            var opts = [{
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
            }];

            selectbox.appendOpts({
                el: "signalling",
                opts: opts
            }, doc);

            opts = [{
                val: "hdb3",
                text: "HDB3"
            }, {
                val: "ami",
                text: "AMI"
            }];

            selectbox.appendOpts({
                el: "coding",
                opts: opts
            }, doc);
        } else if ($(this).val() == "T1" || $(this).val() == "J1") {
            var opts = [{
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
            }];

            if ($(this).val() === "J1") {
                opts.length = 3;
            }

            selectbox.appendOpts({
                el: "signalling",
                opts: opts
            }, doc);

            opts = [{
                val: "b8zs",
                text: "B8ZS"
            }, {
                val: "ami",
                text: "AMI"
            }];

            selectbox.appendOpts({
                el: "coding",
                opts: opts
            }, doc);
        }

        if (oldSingnaling) {
            if ($('#signalling').children().filter("[value='" + oldSingnaling + "']").length == 0) {
                $('#signalling').val("pri_net");
            } else {
                $('#signalling').val(oldSingnaling);
            }
        }

        $('#coding').val(oldCoding);

        if ($(this).val() == "T1" || $(this).val() == "J1") {
            if (oldSingnaling == "mfcr2") {
                $('#signalling').val("pri_cpe");
            }
        }

        if ($(this).val() == "E1") {
            if (oldSingnaling == "em" || oldSingnaling == "em_w") {
                $('#signalling').val("pri_cpe");
            }
        }

        $('#signalling').trigger("change");

        top.Custom.init(doc, $("#coding")[0]);
        top.Custom.init(doc, $("#signalling")[0]);

        ev.stopPropagation();
    }).trigger("change", "firstLoad");

    $("#signalling").bind("change", function(ev) {
        var value = $(this).val();

        if (value == "ss7") {
            $("#ss7Options").show();
            $("#mfcR2Div").hide();
        } else if (value == "mfcr2") {
            $("#mfcR2Div").show();
            $("#ss7Options").hide();
        } else {
            $("#mfcR2Div, #ss7Options").hide();
        }

        // Bug 54721
        // $("#coding").val(oldCoding);

        var val = $("#span_type").val();

        if (val == "T1" || val == "J1") {
            if (oldCoding == "hdb3") {
                $('#coding').val("b8zs");
            }
        } else {
            if (oldCoding == "b8zs") {
                $('#coding').val("hdb3");
            }
        }

        oldSingnaling = value;

        top.Custom.init(doc, $("#coding")[0]);

        ev.stopPropagation();
    });

    $('#ss7type').bind("change", function(ev) {
        if ($(this).val() == "itu") {
            $P("#pointcode, #defaultdpc", document).rules("remove", "customCallback1");

            $P("#pointcode", document).rules("add", {
                digits: true,
                range: [0, 16383],
                customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
                    function() {
                        return $("#pointcode").val() != $("#defaultdpc").val();
                    }
                ]
            });

            $P("#defaultdpc", document).rules("add", {
                digits: true,
                range: [0, 16383],
                customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3259"), $P.lang("LANG3257")),
                    function() {
                        return $("#defaultdpc").val() != $("#pointcode").val();
                    }
                ]
            });

            $P("#pointcode, #defaultdpc", document).valid();
        } else {
            $P("#pointcode", document).rules("remove", "digits range");
            $P("#defaultdpc", document).rules("remove", "digits range");

            $P("#pointcode", document).rules("add", {
                customCallback1: [$P.lang("LANG3459").format(0, 16777215, 0, 255),
                    function(val, ele) {
                        return (/^\d+$/.test(val) && (0 <= Number(val) && Number(val) <= 16777215)) || /^([0-9]|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(val);
                    }
                ],
                customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
                    function() {
                        return $("#pointcode").val() != $("#defaultdpc").val();
                    }
                ]
            });

            $P("#defaultdpc", document).rules("add", {
                customCallback1: [$P.lang("LANG3459").format(0, 16777215, 0, 255),
                    function(val, ele) {
                        if (val) {
                            return (/^\d+$/.test(val) && (0 <= Number(val) && Number(val) <= 16777215)) || /^([0-9]|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(val);
                        } else {
                            return true;
                        }
                    }
                ],
                customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3259"), $P.lang("LANG3257")),
                    function() {
                        return $("#defaultdpc").val() != $("#pointcode").val();
                    }
                ]
            });

            $P("#pointcode, #defaultdpc", document).valid();
        }

        ev.stopPropagation();
    });

    if (ss7Settings) {
        for (var key in ss7Settings) {
            if (ss7Settings.hasOwnProperty(key)) {
                priSettingsInfo[key] = ss7Settings[key];
            }
        }
    }

    if (mfcR2Settings) {
        for (var key in mfcR2Settings) {
            if (mfcR2Settings.hasOwnProperty(key)) {
                priSettingsInfo[key] = mfcR2Settings[key];
            }
        }
    }

    UCMGUI.domFunction.updateDocument(priSettingsInfo, $("#digitalHardwareField")[0]);

    $("#signalling").trigger("change");
    $('#ss7type').trigger("change");
}

function loadToneZone(toneZoneSettings) {
    var arr = [];

    $.each(toneZoneSettings, function(index, item) {
        var obj = {},
            country = item["country"];

        obj["val"] = country;
        obj["locale"] = nation2langObj[country.toLowerCase()];
        obj["text"] = $P.lang(obj["locale"]);

        arr.push(obj);
    });

    selectbox.appendOpts({
        el: "countrytone",
        opts: arr
    }, doc);

    $('#countrytone').val("us");
}

function NetworkMethodSwitch() {
    var method = $("#method").val(),
        route = $("#route"),
        lan1 = $("#lan1"),
        titleWan = $("#title-wan"),
        titleLan2 = $("#title-lan2"),
        titleLan = $("#title-lan"),
        defaultLan = $("#default_lan");

    if (method == "0") {
        if (!$("#dhcp_enable").is(":checked") && method != "0") {
            $("#dhcp_enable").trigger("click");
        }

        route.show();
        lan1.hide();
        titleWan.show();
        titleLan2.hide();
        titleLan.hide();
        defaultLan.hide();
    } else if (method == "2") {
        route.hide();
        lan1.show();
        titleWan.hide();
        titleLan2.show();
        titleLan.hide();
        defaultLan.show();
    } else {
        route.hide();
        lan1.hide();
        titleWan.hide();
        titleLan2.hide();
        titleLan.show();
        defaultLan.hide();
    }

    checkInterface();
}

function passwordChange() {
    batchSecret.disabled = !$('#batch_same_secret')[0].checked;
}

function saveDatas() {
    var newNetworkStr = getDomStr(),
        needReboot = false,
        needLogout = false;

    if ((lastTimezone !== $('#time_zone').val()) ||
        (lastSFTimezone !== $('#self_defined_time_zone').val())) {
        needReboot = true;
    }

    if (oldNetworkStr != newNetworkStr) {
        needReboot = true;

        saveNetworkSettings();
    }

    if (step2Newpass.value) {
        needLogout = true;
    }

    saveOtherSettings(needReboot, needLogout);
}

function saveNetworkSettings() {
    var buf = {},
        flag = false,
        method = $("#method").val(),
        defaultInterface = $("#default_interface").val();

    buf["action"] = "updateNetworkSettings";
    buf["altdns"] = $("#altdns").val() || '0.0.0.0';

    if (Number(config.model_info.num_eth) >= 2) {
        buf["method"] = method;

        if (config.model_info.allow_nat == "1") {
            flag = true;
        }

        if (method == "0") {
            buf["dhcp_ipaddr"] = $("#dhcp_ipaddr").val();
            buf["dhcp_submask"] = $("#dhcp_submask").val();
        } else if (method == "2") {
            var sval = $("#lan2_ip_method").val();

            buf["default_interface"] = defaultInterface;
            buf["lan2_ip_method"] = sval;

            if (sval == "1") {
                buf["lan2_ip"] = $("#lan2_ip").val();
                buf["lan2_mask"] = $("#lan2_mask").val();
                buf["lan2_gateway"] = $("#lan2_gateway").val();
                buf["lan2_dns1"] = $("#lan2_dns1").val();
                buf["lan2_dns2"] = $("#lan2_dns2").val();
            } else if (sval == "2") {
                // buf["lan2_username"] = encodeURIComponent($("#lan2_username").val());
                // buf["lan2_password"] = encodeURIComponent($("#lan2_password").val());
                buf["lan2_username"] = $("#lan2_username").val();
                buf["lan2_password"] = $("#lan2_password").val();
            }
        }
    }

    sval = $("#lan1_ip_method").val();

    if (sval == "0") {
        buf["lan1_ip_method"] = "0";
    } else if (sval == "1") {
        buf["lan1_ip_method"] = "1";
        buf["lan1_ipaddr"] = $("#lan1_ipaddr").val();
        buf["lan1_submask"] = $("#lan1_submask").val();
        buf["lan1_gateway"] = $("#lan1_gateway").val();
        buf["lan1_dns1"] = $("#lan1_dns1").val();
        buf["lan1_dns2"] = $("#lan1_dns2").val() || '0.0.0.0';
    } else {
        buf["lan1_ip_method"] = "2";
        // buf["lan1_username"] = encodeURIComponent($("#lan1_username").val());
        // buf["lan1_password"] = encodeURIComponent($("#lan1_password").val());
        buf["lan1_username"] = $("#lan1_username").val();
        buf["lan1_password"] = $("#lan1_password").val();
    }

    if (flag) {
        var dhcpenable = (($("#dhcp_enable").is(":checked") && ($("#method").val() == "0")) ? 1 : 0);

        buf["dhcp_enable"] = dhcpenable;

        if (dhcpenable) {
            buf["dhcp_ipaddr"] = $("#dhcp_ipaddr").val();
            buf["dhcp_submask"] = $("#dhcp_submask").val();
            buf["dhcp_dns1"] = $("#dhcp_dns1").val();
            buf["dhcp_dns2"] = $("#dhcp_dns2").val();
            buf["ipfrom"] = $("#ipfrom").val();
            buf["ipto"] = $("#ipto").val();
            buf["dhcp_gateway"] = $("#dhcp_gateway").val();
            buf["ipleasetime"] = $("#ipleasetime").val();
        }
    }

    $.ajax({
        type: "post",
        url: '../cgi',
        async: false,
        data: buf,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, jumpToHomePage);

            if (bool) {

                /* 
                 * Pengcheng Zou Added. Check if need to set port.
                 */
                var currentInterface = '';

                if (method === '2') {
                    currentInterface = interfaceObj[method][defaultInterface];
                } else {
                    currentInterface = interfaceObj[method];
                }

                if (lastInterface !== currentInterface) {
                    $.ajax({
                        type: "POST",
                        url: "../cgi",
                        async: false,
                        data: {
                            'action': 'confPhddns',
                            'nicName': currentInterface,
                            'conffile': ''
                        },
                        error: function(jqXHR, textStatus, errorThrown) {},
                        success: function(data) {}
                    });
                }
            }
        }
    });
}

function saveOtherSettings(needReboot, needLogout) {
    var obj = {},
        extension = [],
        country = [],
        password = [],
        analog_trunk = [],
        sip_trunk = [],
        iax_trunk = [],
        hardware_digtal = {};
        node_hardware_digtal = [],
        action = {
            'action': 'addSettingGuide',
            'user_id': currentUserId
        };

    action.disable_extension_ranges = (disableExtensionRanges.checked ? 'yes' : 'no');

    // Extension Node
    if (createdAccountList.length) {
        obj.extension = createdAccountList.join();

        if ($('#batch_rand_secret').is(':checked')) {
            obj.secret = 'r';
        } else {
            obj.secret = batchSecret.value;
        }

        extension.push(obj);

        action.extension = JSON.stringify(extension);

        obj = {};
    }


    // Password Node
    if (step2Newpass.value) {
        obj.user_password = step2Newpass.value;

        obj.email = step2Email.value;

        password.push(obj);

        action.password = JSON.stringify(password);

        obj = {};
    }


    // Country Node
    obj.time_zone = $('#time_zone').val();

    obj.self_defined_time_zone = $('#self_defined_time_zone').val();

    obj.language = $("input[name=languageid]:checked").val();

    country.push(obj);

    action.country = JSON.stringify(country);

    obj = {};


    // Trunks Node
    $.each(createdTrunksList, function(item, data) {
        if (data.account) {
            if (!checkIfAcountInList(data.account)) {
                data.account = '';
            }
        }

        if (data.type === 'Analog') {
            analog_trunk.push(data);
        } else if (data.type === 'SIP') {
            sip_trunk.push(data);
        } else if (data.type === 'Digital') {
            hardware_digtal = data;
        } else {
            iax_trunk.push(data);
        }
    });

    if (num_pri > 0 && firstLogin) {
        hardware_digtal.span_type = $('#span_type').val();
        hardware_digtal.clock = $('#clock').val();
        hardware_digtal.coding = $('#coding').val();
        hardware_digtal.signalling = $('#signalling').val();

        if (hardware_digtal.signalling === 'pri_net' || hardware_digtal.signalling === 'pri_cpe') {
            hardware_digtal.type = 'PRI';
        } else if (hardware_digtal.signalling === 'ss7') {
            hardware_digtal.type = 'SS7';
            hardware_digtal.ss7type = $('#ss7type').val();
            hardware_digtal.pointcode = $('#pointcode').val();
            hardware_digtal.defaultdpc = $('#defaultdpc').val();
            hardware_digtal.cicbeginswith = $('#cicbeginswith').val();
        } else if (hardware_digtal.signalling === 'mfcr2') {
            hardware_digtal.type = 'MFC/R2';
            hardware_digtal.mfcr2_variant = $('#mfcr2_variant').val();
        } else if (hardware_digtal.signalling === 'em') {
            hardware_digtal.type = 'EM';
        } else if (hardware_digtal.signalling === 'em_w') {
            hardware_digtal.type = 'EM_W';
        }

        if (hardware_digtal.span_type === 'E1') {
            hardware_digtal.hardhdlc = '16';
            hardware_digtal.bchan = '1-15,17-31';

            if (hardware_digtal.signalling == 'mfcr2') {
                hardware_digtal.framing = "cas";
            } else {
                hardware_digtal.framing = "ccs";
            }
        } else {
            if (hardware_digtal.span_type === 'T1' &&
                (hardware_digtal.signalling == 'em' || hardware_digtal.signalling == 'em_w')) {

                hardware_digtal.bchan = '1-24';
            } else {
                hardware_digtal.hardhdlc = '24';
                hardware_digtal.bchan = '1-23';
            }

            hardware_digtal.framing = "esf";
        }

        delete hardware_digtal.trunk_name;

        node_hardware_digtal.push(hardware_digtal);
    }

    if (analog_trunk.length) {
        action.analog_trunk = JSON.stringify(analog_trunk);
    }

    if (sip_trunk.length) {
        action.sip_trunk = JSON.stringify(sip_trunk);
    }

    if (iax_trunk.length) {
        action.iax_trunk = JSON.stringify(iax_trunk);
    }

    if (node_hardware_digtal.length) {
        action.hardware_digtal = JSON.stringify(node_hardware_digtal);
    }


    // Seng Request
    $.ajax({
        type: "post",
        url: '../cgi',
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, jumpToHomePage);

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG806")
                });

                setTimeout(function() {
                    $.ajax({
                        url: '../cgi?action=applyChanges&settings=',
                        type: "GET",
                        success: function(data) {
                            var status = data.status,
                                settings = data.response.hasOwnProperty('settings') ? data.response.settings : '',
                                message = '';

                            if (status === 0 && settings === '0') {
                                top.$.removeCookie("needApplyChange");

                                if (needReboot) {
                                    top.dialog.dialogConfirm({
                                        confirmStr: $P.lang("LANG927"),
                                        buttons: {
                                            ok: UCMGUI.loginFunction.confirmReboot,
                                            cancel: jumpToHomePage
                                        }
                                    });
                                } else if (needLogout) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG3481"),
                                        callback: UCMGUI.logoutFunction.doLogout
                                    });
                                } else {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG844"),
                                        callback: jumpToHomePage
                                    });
                                }
                            } else if (status === -9 && settings.contains('-1')) {
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: $P.lang("LANG2805"),
                                    callback: jumpToHomePage
                                });
                            } else if (status === -9 && settings.contains('486')) {
                                top.dialog.dialogMessage({
                                    type: 'info',
                                    content: $P.lang("LANG2803"),
                                    callback: jumpToHomePage
                                });
                            } else if (status === -9 && settings.contains('485')) {
                                top.dialog.dialogMessage({
                                    type: 'info',
                                    content: $P.lang("LANG2804"),
                                    callback: jumpToHomePage
                                });
                            } else {
                                UCMGUI.errorHandler(data, jumpToHomePage);
                            }
                        }
                    });
                }, 100);
            }
        }
    });
}

function saveTrunkContent() {
    var obj = {},
        destinationValue = $('#destination_value').val(),
        numberHead = $('#number_head').val(),
        numberLength = Number($('#number_length').val());

    obj.trunk_name = $('#trunk_name').val();
    obj.type = $('#trunkType').val();
    obj.outbound_rt_name = $('#outbound_rt_name').val();
    obj.permission = $('#permission').val();
    obj.strip = $('#strip').val();
    obj.prepend = $('#prepend').val();
    obj.pattern = '_' + numberHead;
    obj.destination_type = $('#destination_type').val();
    obj.account = '';

    if (obj.type === 'Analog') {
        obj.countrytone = $('#countrytone').val();
        obj.chans = [];

        $('#FXOPorts > .selected').each(function() {
            obj.chans.push($(this).attr('id'));
        });

        obj.chans = obj.chans.join();
    } else if (obj.type !== 'Digital') {
        obj.host = $('#host').val();
        if (UCMGUI.isIPv6NoPort(obj["host"])) {
            obj.host = "[" + obj["host"] + "]";
        }
        obj.username = $('#username').val();
        obj.secret = $('#secret').val();

        if (obj.type === 'SIP') {
            obj.authid = $('#authid').val();
        }

        if (obj.username) {
            obj.trunk_type = 'register';
        } else {
            obj.trunk_type = 'peer';
        }
    }

    if ((obj.destination_type === 'account') && destinationValue) {
        obj.account = destinationValue;
    }

    for (var i = (numberHead.length + 1); i <= numberLength; i++) {
        obj.pattern += 'X';
    }

    return obj;
}

function setChanList() {
    var modelInfo = config.model_info,
        fxo_total = Number(modelInfo.num_fxo),
        // xo_total = 16,
        fxs_total = Number(modelInfo.num_fxs),
        total = (fxo_total + fxs_total),
        FXOPorts = $('#FXOPorts'),
        chanList = '',
        sub_width = 36,
        sub_height = 29;

    FXOPorts.empty();

    chanList = existedChanList.join();

    $.each(createdTrunksList, function(item, data) {
        if (data.chans) {
            chanList += (',' + data.chans);
        }
    });

    chanList = chanList.split(',');

    if (total <= 6) {
        // GXE5120, 5121
        for (i = 0; i < fxo_total; i++) {
            var chan = i + 1;

            var div = $("<div>").attr({
                    id: chan
                }).addClass("port up");

            var span = $("<span>").addClass("upindex").text(chan);

            div.append(span);

            if (ifExisted(chan, chanList)) {
                div.addClass("disabled");
            }

            FXOPorts.append(div);
        }

        FXOPorts.css({
            'height': sub_height.toString() + "px",
            'width': (sub_width * fxo_total).toString() + "px"
        });
    } else {
        // Others
        for (i = 0; i < fxo_total; i++) {
            var chan = i + 1;

            if (chan % 2 != 0) {
                var div = $("<div>").attr({
                        id: chan
                    }).addClass("port up");

                var span = $("<span>").addClass("upindex").text(chan);

                div.append(span);

                if (ifExisted(chan, chanList)) {
                    div.addClass("disabled");
                }

                FXOPorts.append(div);
            }
        }

        for (i = 0; i < fxo_total; i++) {
            var chan = i + 1;

            if (chan % 2 == 0) {
                var div = $("<div>").attr({
                        id: chan
                    }).addClass("port down");

                var span = $("<span>").addClass("downindex").text(chan);

                div.append(span);

                if (ifExisted(chan, chanList)) {
                    div.addClass("disabled");
                }

                FXOPorts.append(div);
            }
        }

        FXOPorts.css({
            'height': (2 * sub_height).toString() + "px",
            'width': (sub_width * fxo_total / 2).toString() + "px"
        });
    }
}

function setDefaultTrunkContent() {
    var inputs = $('#trunkContainer').find('input');

    inputs.each(function(index) {
        var me = $(this);

        if ((me.attr('type') === 'text') || (me.attr('type') === 'password')) {
            me.val('').removeAttr('disabled');
        }
    });

    $('#trunkType').val('SIP').removeAttr('disabled');

    $('#permission').val('local');

    $('option[value="byDID"]').attr({
        'disabled': false
    });

    $('#destination_type').val('byDID');

    $('.selectDivValue, .analog').hide();

    $('#authid_field, .voip').show();

    if (num_pri > 0 && firstLogin) {
        var hasDigital = false;

        $.each(createdTrunksList, function(item, data) {
            if (data.type === 'Digital') {
                hasDigital = true;

                return false;
            }
        });

        if (hasDigital) {
            $('#trunkType > option[value="Digital"]').attr('disabled', 'disabled');
        } else {
            $('#trunkType > option[value="Digital"]').removeAttr('disabled');
        }
    }

    setChanList();

    top.Custom.init(doc, $('#trunkContainer')[0]);
}

function setTrunkContent(obj) {
    if (!obj) {
        return;
    }

    trunkNameInEditMode = obj.trunk_name;
    outboundRouteNameInEditMode = obj.outbound_rt_name;

    var pattern = obj.pattern.slice(1);

    $('#trunk_name').val(obj.trunk_name);
    $('#trunkType').val(obj.type).attr({'disabled': 'disabled'});
    $('#outbound_rt_name').val(obj.outbound_rt_name);
    $('#permission').val(obj.permission);
    $('#strip').val(obj.strip);
    $('#prepend').val(obj.prepend);
    $('#number_length').val(pattern.length);
    $('#destination_type').prop('selectedIndex', -1).val(obj.destination_type).trigger('change');
    $('#number_head').val(pattern.replace(/X/g, ''));

    if (checkIfAcountInList(obj.account)) {
        $('#destination_value').val(obj.account);
    } else {
        $('#destination_value').prop('selectedIndex', -1);
    }

    if (obj.type === 'Analog') {
        var chans = obj.chans.split(',');

        $('#FXOPorts > .disabled').each(function() {
            var id = Number($(this).attr('id'));

            if (id && (String(id) !== 'NaN') && ifExisted(id, chans)) {
                $(this).removeClass('disabled').addClass('selected');
            }
        });

        $('#countrytone').val(obj.countrytone);

        $('.voip').hide();

        $('.analog').show();
    } else if (obj.type === 'Digital') {
        $('.analog, .voip').hide();
        $('#trunk_name').attr({'disabled': 'disabled'});
        $('#trunkType > option[value="Digital"]').removeAttr('disabled');
    } else {
        $('#host').val(obj.host);
        $('#username').val(obj.username);
        $('#secret').val(obj.secret);

        $('.analog').hide();

        $('.voip').show();
    }

    top.Custom.init(doc, $('#trunkContainer')[0]);
}

function showBatchExtensionsTips() {
    var tips = getBatchExtensionsTips(),
        ele = $('#extensionList');

    if (tips) {
        ele.find('.popover-content').html(tips);

        if (ele.is(':hidden')) {
            ele.css({
                'display': 'block'
            });
        }
    } else {
        ele.hide();
    }
}

function showDestination(lang, val, type) {
    var destination = '';

    if (!checkIfAcountInList(val)) {
        destination = '<div class="members wordBreak" locale="LANG566 ' + lang + ' ' + 'LANG2886' + '">' +
            $P.lang("LANG566").format($P.lang(lang), $P.lang('LANG2886')) + '</div>';
    } else {
        var item = UCMGUI.ObjectArray.find('extension', val, existedAccountList),
            fullname = (item ? item.fullname : ''),
            disable = (item ? item.out_of_service : '');

        if (disable && disable == 'yes') {
            destination = '<div class="disabledExtOrTrunk members wordBreak" locale="' + lang + '"' +
                (fullname ? (" fullname=' -- " + val + ' "' + fullname + '" \<' + "'") : (" fullname=' -- " + val + ' \<' + "'")) + '>' +
                $P.lang("LANG567").format($P.lang(lang), " -- " + val + (fullname ? ' "' + fullname + '"' : ''), ' &lt;' + $P.lang('LANG273') + '&gt;') + '</div>';
        } else {
            destination = '<div class="members wordBreak" locale="' + lang + '"' +
                (fullname ? (" fullname=' -- " + val + ' "' + fullname + '"' + "'") : (" fullname=' -- " + val + "'")) + '>' +
                $P.lang("LANG566").format($P.lang(lang), " -- " + val + (fullname ? ' "' + fullname + '"' : '')) + '</div>';
        }
    }

    return destination;
}

function summary() {
    $("#summaryTimezone").append($("#timeField > .section-body").children());

    $("#summaryNetwork").append($("#networkField > .section-body").children());

    if (num_pri > 0 && firstLogin) {
        $("#summaryDigital").append($("#digitalHardwareField > .section-body").children());
    }

    $("#summaryExtension").find('.field-content').html(getBatchExtensionsTips());

    $("#summaryTrunkList")
        .clearGridData(true)
        .setGridParam({
            datatype: 'local',
            data: createdTrunksList
        })
        .trigger("reloadGrid");
}

function transAccountData(res, cb) {
    var ary = [];

    for (var i = 0; i < res.length; i++) {
        var extension = res[i].extension;

        ary.push(extension);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return ary;
}

function transTrunkData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        arr.push(res[i]["trunk_name"]);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

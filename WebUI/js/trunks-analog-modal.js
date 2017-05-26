/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    disableCheckBox = UCMGUI.domFunction.disableCheckBox,
    config = UCMGUI.config,
    num_pri = config.model_info.num_pri,
    gup = UCMGUI.gup,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    mode = gup.call(window, "mode"),
    oldTrunkName = "",
    oldSLAMode = '',
    trunkId = "",
    countryObj = {},
    ch_chkbxClass = "FXO_ChkBoxes",
    trunkgroup = "",
    trunk_index = "",
    type = "",
    cidmodeObj = {
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
    };

var mappingErrCode = {
    "-1": "LANG2931", //"time out"
    0: "", // "no error return"
    1: "LANG2934", //"ACIM detect is running"
    2: "LANG2933", //"CPT detect is running"
    3: "LANG2936", //"unload dahdi module failed"
    4: "LANG2948", //"invaid extension number"
    5: "LANG2949", //"invaid fxo channel number"
    6: "LANG2937", //"fxo absent/busy"
    7: "LANG2950", //"fxo disconnect"
    8: "LANG2951", //"monitor task init failed"
    9: "LANG2952", //"fxo configure failed"
    10: "LANG2953", //"fxo offhook failed"
    11: "LANG2954", //"fxo dial failed"
    12: "LANG2955", //"no dial tone detected"
    13: "LANG2956", //"pickup the call failed"
    14: "LANG2957", //"user pickup the call timeout"
    15: "LANG2958", //"no ringback tone detected"
    16: "LANG2959", //"fxo dtmf send failed"
    17: "LANG2960", //"fxo no ringing, call setup failed"
    18: "LANG2961", //"hang up the call failed"
    19: "LANG2962", //"user hangup the call timeout"
    20: "LANG2963", //"no busy tone detected"
    21: "LANG2964", //"thread creat failed"
    //22: "end of error string"
};

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

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    initForm();

    if (mode == 'edit') {
        $("#out_maxchans_div").show();

        $('.fax_add_hide').removeClass('fax_add_hide');

        type = "edit";

        trunkId = gup.call(window, "trunkId");

        getAnalogTrunk(trunkId);
    } else {
        type = "add";

        // prepareAddItemForm();
        $('#countrytone').val("us").trigger('change');
    }

    $P.lang(doc, true);
    initValidator();

    top.Custom.init(doc);
});

//bug validate add
function checkToneCount(value, element) {
    if (value < 1 || value > 2 || value != parseInt(value)) {
        return false;
    }
    return true;
}

function initForm() {
    loadChans();

    // loadGroup();

    loadToneZone();

    // if (num_pri > 0) {
    //     $("div[tooltip='@LANG3555']").attr("tooltip", "@LANG4199");
    //     $("#faxmode option[value='gateway']").remove();
    // }

    $("#out_maxchans_div").hide();

    $("#usecallerid, #busydetect, #congestiondetect").attr("checked", true);

    $("#busydetect").click(function(ev) {
        if ($(this).is(":checked")) {
            $("#busycountfield").show();
        } else {
            $("#busycountfield").hide();
        }
    });

    $("#congestiondetect").click(function(ev) {
        if ($(this).is(":checked")) {
            $("#congestioncountfield").show();
        } else {
            $("#congestioncountfield").hide();
        }
    });

    $("#trunkmode").change(function(ev) {
        if ($(this).is(":checked")) {
            $("#slaOptions").show();

            // $('#polarityswitch').attr('disabled', true);

            // top.Custom.init(document, $('#polarityswitch')[0]);

            $P('#trunk_name', document).valid();

            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
                $(window.frameElement).css("width", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();
        } else {
            $("#slaOptions").hide();

            // $('#polarityswitch').attr('disabled', false);

            // top.Custom.init(document, $('#polarityswitch')[0]);

            $P('#trunk_name', document).valid();

            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
                $(window.frameElement).css("width", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();
        }
    });

    $("#polarityswitch").change(function(ev) {
        if ($(this).is(":checked")) {
            $("#polarityfield").show();
            $('#trunkmode').attr('disabled', true);

            top.Custom.init(document, $('#trunkmode')[0]);
        } else {
            $("#polarityfield").hide();
            $('#trunkmode').attr('disabled', false);

            top.Custom.init(document, $('#trunkmode')[0]);
        }
    });

    $("#polarityswitch").trigger("change");

    $("#enablecurrentdisconnectthreshold").click(function(ev) {
        if ($(this).is(":checked")) {
            $("#currentdisconnectthreshold").show();
        } else {
            $("#currentdisconnectthreshold").hide();
        }
    });

    $("#enablecurrentdisconnectthreshold").attr('checked', true);

    $("#faxmode")[0].selectedIndex = 0;

    $("#polarityonanswerdelay").val(600);
    $("#currentdisconnectthreshold").val(200);
    $("#fxooutbandcalldialdelay").val(0);
    $("#ringtimeout").val(8000);
    $("#rxgain").val(0);
    $("#txgain").val(0);
    $("#busycount").val(2);
    $("#congestioncount").val(2);

    $('#detect').on('click', pstnDetection);
    $('#pstn_cancel').on('click', pstnCancel);
    tectFax();
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
    disableCheckBox({
        enableCheckBox: 'trunkmode',
        enableList: ['polarityswitch', 'dahdilineselectmode', 'out_maxchans']
    }, doc);

}

function loadToneZone() {
    var toneZoneSettings = mWindow.toneZoneSettings,
        arr = [],
        regexBusy = /^([\d+*]+)\/(\d+),[\d+]+\/(\d+)(,[\d+*]+\/(\d+),[\d+]+\/(\d+))?(,[\d+*]+\/(\d+),[\d+]+\/(\d+))?$/,
        regexCongestion = /^([\d+*]+)\/(\d+),[\d+]+\/(\d+)(,[\d+*]+\/(\d+),[\d+]+\/(\d+))?(,[\d+*]+\/(\d+),[\d+]+\/(\d+))?$/;

    $.each(toneZoneSettings, function(index, item) {
        var countryItem = {},
            obj = {},
            country = item["country"];

        obj["text"] = item["description"];
        obj["val"] = country;
        obj["locale"] = nation2langObj[country.toLowerCase()];

        arr.push(obj);

        var match = item.busy.match(regexBusy);

        if (match) {
            countryItem.busyfreq = match[1];
            countryItem.busypattern = match[2] + ',' + match[3] + ((match[5]) ? ('-' + match[5] + ',' + match[6]) : '') + ((match[8]) ? ('-' + match[8] + ',' + match[9]) : '');
        }

        match = item.congestion.match(regexCongestion);

        if (match) {
            countryItem.congestionfreq = match[1];
            countryItem.congestionpattern = match[2] + ',' + match[3] + ((match[5]) ? ('-' + match[5] + ',' + match[6]) : '') + ((match[8]) ? ('-' + match[8] + ',' + match[9]) : '');
        }

        countryItem.desc = item.description;

        countryObj[item.country] = countryItem;
    });

    arr.push({
        val: "custom",
        text: "Custom",
        locale: "LANG231"
    });

    selectbox.appendOpts({
        el: "countrytone",
        opts: arr
    }, doc);

    $("#countrytone").change(function(ev) {
        var countrytone = $(this),
            val = countrytone.val(),
            busytone = '',
            congestiontone = '',
            freq_tmp;

        if (val === 'custom') {
            $('.tone-setting').removeAttr('disabled');
        } else {
            var countryTone = countryObj[val];

            if (countryTone) {
                // f1=500[@-11][,f2=440[@-11]],c=500/500[-600/600[-700/700]]; 
                freq_tmp = countryTone.busyfreq.split('+');

                for (var i = 0, len = freq_tmp.length; i < len; i++) {
                    busytone += 'f' + (i + 1) + '=' + freq_tmp[i] + '@-50' + ',';
                }

                busytone += 'c=' + countryTone.busypattern.replace(/,/g, '/');

                $('#busy').val(busytone);


                freq_tmp = countryTone.congestionfreq.split('+');

                for (var i = 0, len = freq_tmp.length; i < len; i++) {
                    congestiontone += 'f' + (i + 1) + '=' + freq_tmp[i] + '@-50' + ',';
                }

                congestiontone += 'c=' + countryTone.congestionpattern.replace(/,/g, '/');

                $('#congestion').val(congestiontone);
            }

            $('.tone-setting').attr('disabled', true).removeClass('ui-state-highlight');
        }
    });
}

function loadChans() {
    var chans = Number(UCMGUI.config.model_info.num_fxo),
        chanList = mWindow.chanList;

    for (var i = 1; i <= chans; i++) {
        var lbl = document.createElement('div'),
            label = document.createElement('label'),
            lbltext = document.createTextNode(i),
            ncbx = document.createElement('input');

        lbl.className = 'special';
        ncbx.type = 'checkbox';
        ncbx.setAttribute("noSerialize", true);
        ncbx.value = i;

        if (UCMGUI.inArray(i, chanList)) {
            ncbx.disabled = true;
        }

        ncbx.className = ch_chkbxClass;

        label.appendChild(lbltext);
        lbl.appendChild(ncbx);
        lbl.appendChild(label);

        document.getElementById("new_ATRNK_cls_container").appendChild(lbl);
    };

    $('.' + ch_chkbxClass).bind("click", function() {
        $P('#trunk_name', document).valid();

        btnDisable();
    });
}

function loadGroup() {
    var arr = [{
            val: "New",
            text: "--"
        }],
        trunkList = mWindow.trunkList;

    trunkList = transData(trunkList);
    trunkList = arr.concat(trunkList);

    selectbox.appendOpts({
        el: "trunkgroup",
        opts: trunkList,
        selectedIndex: -1
    }, doc);
}

function trunkNameIsExist(value, element) {
    if ($('.' + ch_chkbxClass + ':checked').length) {
        var trunkName = $("#trunk_name").val(),
            trunkNameList = mWindow.trunkNameList,
            tmpTrunkNameList = [];

        tmpTrunkNameList = trunkNameList.copy(tmpTrunkNameList);

        if (oldTrunkName) {
            tmpTrunkNameList.remove(oldTrunkName);
        }

        return !UCMGUI.inArray(trunkName, tmpTrunkNameList);
    }

    return false;
}

var check_freq = function(value, element) {
    if (!value) {
        return true;
    }

    if (/^[0-9]+\+?[0-9]+$/.test(value)) {
        return true;
    }

    return false;
};

var check_tone = function(value, element) {
    if (!value) {
        return true;
    }

    var regex = /^f1=(\d+)?(@(-\d+))?(,f2=(\d+)(@(-\d+))?)?,c=((\d+)\/(\d+))(-(\d+)\/(\d+))?(-(\d+)\/(\d+))?;?$/,
        match = value.match(regex);

    if (!match) {
        return false;
    }

    // match group fields example at pre_save_setting()
    // valid frequence range Tone frequency A in Hz; 0 <= Hz < 4000
    if (match[1] && match[1] > 4000) {
        return false;
    }

    if (match[5] && match[1] > 4000) {
        return false;
    }

    // valid levels range -300 < levelA < 0
    if (match[3] && (match[3] <= -300 || match[3] == 0)) {
        return false;
    }

    if (match[7] && (match[7] <= -300 || match[3] == 0)) {
        return false;
    }

    // valid pattern range  0 <= cadence <= 16383.
    var fields = [9, 10, 12, 13, 15, 16];

    for (var i = 0, len = fields.length; i < len; i++) {
        var idx = fields[i];

        if (match[idx] && match[idx] > 16383) {
            return false;
        }
    }

    return true;
};

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "busypattern": {
                // pattern: '[1-9][0-9]+,[1-9][0-9]+',
                required: true,
                // I18N, the busypattern rules can be removed, since it has not been used.
                customCallback: ['Invalid Format ( format example: 500,500 )',
                    function(value, element) {
                        if (!value) {
                            return true;
                        }

                        if (/^[0-9]+,[0-9]+$/.test(value)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                ]

            },
            "congestionpattern": {
                required: true,
                // I18N, the congestionpattern rules can be removed, since it has not been used.
                customCallback: ["Invalid Format ( format example: X,X ), the range of 'X' is [100,2000]",
                    function(value, element) {
                        if (!value) {
                            return true;
                        }

                        if (/^[0-9]+,[0-9]+$/.test(value)) {
                            var a = Number(value.split(',')[0]),
                                b = Number(value.split(',')[1]);

                            if (a >= 100 && a <= 2000 && b >= 100 && b <= 2000) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                ]
            },
            "ringtimeout": {
                required: true,
                digits: true,
                range: [4000, 20000]
            },
            "trunk_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang('LANG2135').format(1, $P.lang('LANG1329')), trunkNameIsExist],
                customCallback: [$P.lang('LANG3224'),
                    function(value, element) {
                        if ($('.' + ch_chkbxClass + ':checked').length > 1 && $('#trunkmode').is(':checked')) {
                            return false;
                        }

                        return true;
                    }
                ]
            },
            "trunkmode": {
                customCallback: [$P.lang('LANG3284'),
                    function(value, element) {
                        if (mode == 'edit' && $(element).is(':checked') && UCMGUI.inArray(trunkId, mWindow.failoverTrunkList)) {
                            return false;
                        }

                        return true;
                    }
                ]
            },
            "busycount": {
                required: true,
                digits: true,
                customCallback: [$P.lang('LANG3840'), checkToneCount]
            },
            "out_maxchans": {
                required: true,
                digits: true,
                customCallback: [$P.lang('LANG3972'),
                    function(value, element) {
                        if (parseInt(value) > $('.' + ch_chkbxClass + ':checked').length) {
                            return false;
                        }

                        return true;
                    }
                ]
            },
            "congestioncount": {
                required: true,
                digits: true,
                customCallback: [$P.lang('LANG3840'), checkToneCount]
            },
            "polarityonanswerdelay": {
                required: true,
                digits: true,
                range: [100, 2000]
            },
            "rxgain": {
                required: true,
                gain: [-13.5, 12]
            },
            "txgain": {
                required: true,
                gain: [-13.5, 12]
            },
            "busyfrequencies": {
                required: true,
                // I18N, the rule can be removed, since it has not been used.
                customCallback: ['Invalid format (format example: 450 or 480+620).', check_freq]
            },
            "congestionfrequencies": {
                required: true,
                // I18N, the rule can be removed, since it has not been used.
                customCallback: ['Invalid format (format example: 450 or 480+620).', check_freq]
            },
            "countrytone": {
                required: true
            },
            "busy": {
                required: true,
                customCallback: [$P.lang('LANG2136'), check_tone]
            },
            "congestion": {
                required: true,
                customCallback: [$P.lang('LANG2136'), check_tone]
            },
            "currentdisconnectthreshold": {
                required: true,
                digits: true,
                range: [50, 3000]
            },
            "fxooutbandcalldialdelay": {
                required: true,
                digits: true,
                range: [0, 3000]
            },
            "des_channels": {
                customCallback: [$P.lang('LANG2334'),
                    function() {
                        return !($("#src_channels").val() == $("#des_channels").val());
                    }
                ]
            },
            "des_number": {
                required: true,
                digits: true,
                minlength: 2
            }
        },
        submitHandler: function() {
            if (type == "pstn") {
                pstnSave();
            } else {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG904")
                });

                var action = {};

                action = UCMGUI.formSerializeVal(document);

                delete action.fax_intelligent_route_destination;

                var cidmodeVal = action["cidmode"];

                action["cidstart"] = cidmodeObj[cidmodeVal]["cidstart"];
                action["cidsignalling"] = cidmodeObj[cidmodeVal]["cidsignalling"];
                action["busy"] = $("#busy").val();
                action["congestion"] = $("#congestion").val();
                action["trunkmode"] = $("#trunkmode").is(':checked') ? 'sla' : 'normal';

                if (!$("#busydetect").is(":checked")) {
                    action["busycount"] = "";
                }

                if (!$("#congestiondetect").is(":checked")) {
                    action["congestioncount"] = "";
                }

                if (!$("#enablecurrentdisconnectthreshold").is(":checked")) {
                    action["currentdisconnectthreshold"] = 3000;
                }

                var fax = $('#faxmode').val();
                var bEnableRoute = $('#fax_intelligent_route')[0].checked;

                if (fax == "no") {
                    action['faxdetect'] = "no";
                    action['fax_gateway'] = "no";
                    //action['fax_intelligent_route'] = "no";
                    //action['fax_intelligent_route_destination'] = "no";
                } else if (fax == "detect") {
                    action['faxdetect'] = "incoming";
                    action['fax_gateway'] = "no";
                    //if (!bEnableRoute) {
                        //action['fax_intelligent_route_destination'] = "no";
                    //}
                } else if (fax == "gateway") {
                    action['faxdetect'] = "no";
                    action['fax_gateway'] = "yes";
                    //action['fax_intelligent_route'] = "no";
                    //action['fax_intelligent_route_destination'] = "no";
                }

                if (mode == "edit") {
                    action["trunkgroup"] = trunkgroup;
                    action["analogtrunk"] = trunk_index;
                }

                var arr = [];

                $.each($(".FXO_ChkBoxes"), function(index, item) {
                    if ($(item).is(":checked")) {
                        arr.push($(item).val());
                    }
                });

                action["chans"] = arr.toString();

                if (mode == "add") {
                    // var groupstr = $("#trunkgroup").children().last().val();

                    // if (groupstr != "New") {
                    //     action["trunkgroup"] = parseInt(groupstr) + 1;
                    // } else {
                    //     action["trunkgroup"] = 1;
                    // }

                    action["trunkgroup"] = '';
                }

                action["action"] = (mode == 'edit' ? "updateAnalogTrunk" : "addAnalogTrunk");

                if (mode == 'add') {
                    if ($("#trunkmode").is(':checked')) {
                        var slaAction = {
                            'action': 'addSLATrunk',
                            'trunk_name': action['trunk_name'],
                            'device': ('DAHDI/' + action["chans"]),
                            'bargeallowed': ($('#bargeallowed').is(':checked') ? 'yes' : 'no'),
                            'holdaccess': $('#holdaccess').val()
                        };

                        action["polarityswitch"] = 'no';

                        updateOrAddTrunkInfo(action, 'add', slaAction);
                    } else {
                        updateOrAddTrunkInfo(action);
                    }
                } else if (mode == 'edit') {
                    if (fax == "detect") {
                        action['fax_intelligent_route'] = bEnableRoute ? 'yes' : 'no';
                        if (bEnableRoute && $('#fax_intelligent_route_destination').val() !== 'no') {
                            action['fax_intelligent_route_destination'] = $('#fax_intelligent_route_destination').val();
                        }
                    }

                    if ($("#trunkmode").is(':checked')) {
                        action["polarityswitch"] = 'no';

                        if (oldSLAMode == 'sla') {
                            var slaAction = {
                                'action': 'updateSLATrunk',
                                'trunk_index': trunkId,
                                'trunk_name': action['trunk_name'],
                                'device': ('DAHDI/' + action["chans"]),
                                'bargeallowed': ($('#bargeallowed').is(':checked') ? 'yes' : 'no'),
                                'holdaccess': $('#holdaccess').val()
                            };

                            updateOrAddTrunkInfo(action, 'update', slaAction);
                        } else {
                            var slaAction = {
                                'action': 'addSLATrunk',
                                'trunk_index': trunkId,
                                'trunk_name': action['trunk_name'],
                                'device': ('DAHDI/' + action["chans"]),
                                'bargeallowed': ($('#bargeallowed').is(':checked') ? 'yes' : 'no'),
                                'holdaccess': $('#holdaccess').val()
                            };

                            updateOrAddTrunkInfo(action, 'add', slaAction);
                        }
                    } else if (oldSLAMode == 'sla') {
                        var slaAction = {
                            'action': 'deleteSLATrunk',
                            'trunk_index': trunkId
                        };

                        updateOrAddTrunkInfo(action, 'delete', slaAction);
                    } else {
                        updateOrAddTrunkInfo(action);
                    }
                }
            }
        }
    });
}

function updateOrAddTrunkInfo(action, slaActionMode, slaAction) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                var callback = function() {
                    top.dialog.clearDialog();

                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG815"),
                        callback: function() {
                            mWindow.$("#trunks-analog-list", mWindow.document).trigger('reloadGrid');
                            mWindow.getNameList();
                        }
                    });
                };

                if (slaActionMode) {
                    updateOrAddSLATrunkInfo(slaActionMode, slaAction, callback);
                } else {
                    callback();
                }
            }
        }
    });
}

function updateOrAddSLATrunkInfo(actionMode, action, callback) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                if (callback && typeof callback == "function") {
                    callback();
                }
            }
        }
    });
}

function getAnalogTrunk(trunkId) {
    var action = {
        "action": "getAnalogTrunk",
        "analogtrunk": trunkId
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var analogtrunk = data.response.analogtrunk,
                    busy = analogtrunk.busy,
                    congestion = analogtrunk.congestion,
                    chans = analogtrunk.chans ? analogtrunk.chans.split(",") : [];

                oldTrunkName = analogtrunk.trunk_name;
                trunkgroup = analogtrunk.trunkgroup;
                trunk_index = analogtrunk.trunk_index;
                oldSLAMode = analogtrunk.trunkmode;

                UCMGUI.domFunction.updateDocument(analogtrunk, document);

                if ($('#fax_intelligent_route_destination').val() === null) {
                    $('#fax_intelligent_route_destination').val('no');
                }

                $("#busy").val(busy);

                $("#congestion").val(congestion);

                if (Number($("#busycount").val()) == 0) {
                    $("#busycount").val(2);
                }

                if (Number($("#congestioncount").val()) == 0) {
                    $("#congestioncount").val(2);
                }

                $('#countrytone').trigger('change');

                $.each($('.' + ch_chkbxClass + ':disabled'), function(index, item) {
                    if (UCMGUI.inArray($(item).val(), chans)) {
                        $(item).attr({
                            disabled: false,
                            checked: true
                        });
                    }
                });

                if ((analogtrunk['faxdetect'] === 'no') && (analogtrunk['fax_gateway'] === 'no')) {
                    $('#faxmode').val('no');
                } else if (analogtrunk['faxdetect'] === 'incoming') {
                    $('#faxmode').val('detect');
                } else if (analogtrunk['fax_gateway'] === 'yes') {
                    $('#faxmode').val('gateway');
                }

                var currentdisconnectthreshold = $("#currentdisconnectthreshold"),
                    polarityfield = $("#polarityfield");

                if (analogtrunk.busydetect == "yes") {
                    $("#busycountfield").show();
                } else {
                    $("#busycountfield").hide();
                }

                if (analogtrunk.congestiondetect == "yes") {
                    $("#congestioncountfield").show();
                } else {
                    $("#congestioncountfield").hide();
                }

                if (analogtrunk.enablecurrentdisconnectthreshold == "yes") {
                    currentdisconnectthreshold.show();
                } else {
                    currentdisconnectthreshold.hide();
                    $("#currentdisconnectthreshold").val("200");
                }

                // if (analogtrunk.polarityswitch == "yes") {
                //     $('#trunkmode').attr('disabled', true);

                //     polarityfield.show();
                // } else {
                //     polarityfield.hide();
                // }
                $("#polarityswitch").trigger("change");

                if (analogtrunk.trunkmode == 'sla') {
                    var trunkmode = $('#trunkmode');
                    trunkmode.attr('checked', true);

                    $("#slaOptions").show();
                    trunkmode.get(0).updateStatus();
                    // $('#polarityswitch').attr('disabled', true);

                    getSLAData(trunkId);
                }
                $('#faxmode').trigger('change');
                $('#fax_intelligent_route_destination')[0].disabled = !$('#fax_intelligent_route')[0].checked;

                btnDisable();

                top.Custom.init(doc);
            }
        }
    });
}

function getSLAData(trunkId) {
    var action = {
        "action": "getSLATrunk",
        "trunk_index": trunkId
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var slaData = data.response.trunk_index,
                    bargeallowed = slaData.bargeallowed,
                    holdaccess = slaData.holdaccess;

                if (bargeallowed) {
                    $('#bargeallowed').attr('checked', bargeallowed == 'yes' ? true : false);
                }

                if (holdaccess) {
                    $('#holdaccess').val(holdaccess);
                }
            }
        }
    });
}

function getSelectedChannels() {
    return $("." + ch_chkbxClass + ":checked");
}

function pstnDetection() {
    if ($("#detect").attr("disabled") == "disabled") {
        return;
    }

    top.dialog.dialogCommands.hide();

    $("#editForm").hide();

    $("#pstn_div").show();

    $("#detect_model").change(function(ev) {
        if ($(this).val() == 1) {
            $("#dev_deschannel").hide();
        } else {
            $("#dev_deschannel").show();
        }
    });

    if (window.frameElement) {
        $(window.frameElement).css("height", "0px");
        $(window.frameElement).css("width", "0px");
    }

    top.dialog.repositionDialog();

    $("#src_number").val("6000");
    $("#des_number").val("");

    $('#is_save_record')[0].checked = false;

    $('#src_channels').empty();
    $('#des_channels').empty();

    selectChannel = getSelectedChannels();

    var srcArr = [],
        desArr = [];

    $.each(selectChannel, function(index, item) {
        srcArr.push($(item).val());
    });

    selectbox.appendOpts({
        el: "src_channels",
        opts: transSelectData(srcArr)
    }, doc);

    $.each($("." + ch_chkbxClass), function(index, item) {
        desArr.push($(item).val());
    });

    selectbox.appendOpts({
        el: "des_channels",
        opts: transSelectData(desArr)
    }, doc);

    top.Custom.init(document, $("#pstn_div")[0]);

    type = "pstn";
}

function pstnCancel() {
    $("#pstn_div").hide();

    $("#editForm").show();

    top.dialog.dialogCommands.show();

    type = "edit";

    if (window.frameElement) {
        $(window.frameElement).css("height", "0px");
        $(window.frameElement).css("width", "0px");
    }

    top.dialog.currentDialogType = "iframe";

    top.dialog.repositionDialog();
}

function pstnAfter() {
    top.dialog.container.show();

    top.dialog.shadeDiv.show();

    pstnCancel();
}

function pstnStop() {
    var des_channel = "";

    if ($("#detect_model").val() == "1") {
        des_channel = "-1";
    } else {
        des_channel = $("#des_channels").val();
    }

    var buf = {
        "action": "stopPSTNDetecting",
        "pstn_type": "pstn_cpt",
        "src_channel": $("#src_channels").val(),
        "dest_channel": des_channel,
        "src_extension": $("#src_number").val(),
        "dest_extension": $("#des_number").val(),
        'is_save_record': $('#is_save_record')[0].checked ? 'yes' : 'no'
    };

    $.ajax({
        type: "post",
        url: baseServerURl,
        data: buf,
        success: pstnAfter
    });
}

function pstnOver() {
    var i = 120,
        status_type = 1,
        getResponce = function(flag) {
            setTimeout(function() {
                var buf = {
                    action: "getPSTNDetecting",
                    pstn_type: "pstn_cpt"
                };

                $.ajax({
                    type: "post",
                    url: baseServerURl,
                    data: buf,
                    success: function(res) {
                        if (res.status == -5) {
                            UCMGUI.loginFunction.switchToLoginPanel();
                            return;
                        }
                        var bool = UCMGUI.errorHandler(res, function(argument) {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        });

                        if (bool) {
                            var result = res.response.result,
                                state = result.state,
                                errCode = Number(result.errCode),
                                currentDisconnect = result.current_disconnect,
                                currentDisconnectTime = Number(result.current_disconnect_time),
                                polarity = result.polarity,
                                busytone = result.busytone,
                                frequencies = result.frequencies,
                                cadence = result.cadence;

                            if (state == "done") {
                                flag = 0;

                                if (!errCode) {
                                    // currentDisconnectTime = Math.round(currentDisconnectTime * 0.085) * 10;
                                    var buf = "",
                                        sCon = 'LANG2338';

                                    if (currentDisconnect == "yes") {
                                        buf += $P.lang("LANG1694") + ": " + currentDisconnectTime + "<br/>";
                                    } else {
                                        buf += $P.lang("LANG1694") + ": " + currentDisconnect + "<br/>";
                                    }

                                    if (polarity) {
                                        buf += $P.lang("LANG1340") + ": " + polarity + "<br/>";
                                    }

                                    if (busytone == "yes") {
                                        buf += $P.lang("LANG1325") + ": frequencies=" + frequencies + " cadence=" + cadence + "<br/>";
                                    }

                                    if ($('#is_save_record')[0].checked && currentDisconnect === 'yes' && busytone === 'no') {
                                        sCon = 'LANG5151';
                                    }

                                    top.dialog.dialogConfirm({
                                        confirmStr: $P.lang(sCon).format(buf),
                                        buttons: {
                                            ok: function() {
                                                if (currentDisconnect == "yes") {
                                                    $("#enablecurrentdisconnectthreshold")[0].checked = true;
                                                    $("#currentdisconnectthreshold").val(currentDisconnectTime);
                                                    // $("#currentdisconnectthreshold").removeAttr('disabled');
                                                    $("#currentdisconnectthreshold").show();
                                                } else {
                                                    $("#enablecurrentdisconnectthreshold")[0].checked = false;
                                                    // $("#currentdisconnectthreshold").attr('disabled', true);
                                                    $("#currentdisconnectthreshold").hide();
                                                }

                                                if (polarity) {
                                                    $("#polarityswitch")[0].checked = (polarity.toLowerCase() == "yes" ? true : false);
                                                    $("#polarityswitch").trigger("change");
                                                }

                                                if (busytone == "yes") {
                                                    $("#countrytone").val("custom");
                                                    $("#busydetect")[0].checked = true;
                                                    $("#busycountfield").show();
                                                    $('.tone-setting').removeAttr('disabled');
                                                }

                                                if (frequencies && cadence) {
                                                    var frequenciesCadence = "f1=" + frequencies.split("+")[0] + "@-50," + "f2=" + frequencies.split("+")[1] + "@-50," + cadence;
                                                    $("#busy").val(frequenciesCadence);
                                                }

                                                top.Custom.init(document);

                                                pstnAfter();
                                            },
                                            cancel: function() {
                                                pstnAfter();
                                            }
                                        }
                                    });
                                } else {
                                    top.dialog.clearDialog();

                                    top.dialog.dialogMessage({
                                        type: 'error',
                                        content: $P.lang(mappingErrCode[errCode]),
                                        callback: pstnAfter
                                    });
                                }
                            } else if ($("#detect_model").val() == "1") {
                                if (state == "ring back tone") {
                                    flag = 0;

                                    top.dialog.dialogConfirm({
                                        confirmStr: $P.lang("LANG2412"),
                                        buttons: {
                                            ok: function() {
                                                $.ajax({
                                                    type: "post",
                                                    url: baseServerURl,
                                                    data: "action=PSTNDetectingPickup",
                                                    success: function() {
                                                        top.dialog.dialogMessage({
                                                            type: 'loading',
                                                            content: $P.lang("LANG2337")
                                                        });

                                                        status_type = 2;

                                                        getResponce(1);
                                                    }
                                                });
                                            },
                                            cancel: function() {
                                                pstnStop();
                                            }
                                        }
                                    });
                                } else if (state == "waiting for hangup" && status_type == 2) {
                                    flag = 0;

                                    top.dialog.dialogConfirm({
                                        confirmStr: $P.lang("LANG2413"),
                                        buttons: {
                                            ok: function() {
                                                $.ajax({
                                                    type: "post",
                                                    url: "../cgi",
                                                    data: "action=PSTNDetectingHangup",
                                                    success: function() {
                                                        top.dialog.dialogMessage({
                                                            type: 'loading',
                                                            content: $P.lang("LANG2337")
                                                        });

                                                        status_type = 3;

                                                        getResponce(1);
                                                    }
                                                });
                                            },
                                            cancel: function() {
                                                pstnStop();
                                            }
                                        }
                                    });
                                }
                            }
                        }

                        i--;

                        if (flag && i > 0) {
                            getResponce(1);
                        } else if (i <= 0) {
                            /* time out */
                            top.dialog.clearDialog();

                            top.dialog.dialogMessage({
                                type: 'warning',
                                content: $P.lang("LANG2339"),
                                callback: pstnAfter
                            });
                        }
                    }
                });
            }, 1000);
        };

    getResponce(1);
}

function pstnSave() {
    var des_channel = "";

    if ($("#detect_model").val() == "1") {
        des_channel = "-1";
    } else {
        des_channel = $("#des_channels").val();
    }

    var buf = {
        "action": "startPSTNDetecting",
        "pstn_type": "pstn_cpt",
        "src_channel": $("#src_channels").val(),
        "dest_channel": des_channel,
        "src_extension": $("#src_number").val(),
        "dest_extension": $("#des_number").val(),
        'is_save_record': $('#is_save_record')[0].checked ? 'yes' : 'no'
    };

    $.ajax({
        type: "post",
        url: baseServerURl,
        data: buf,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                pstnOver();
            }
        }
    });

    // pstnCancel();
    // SHOW_FLAG = true;
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG2337")
    });

    /* top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG2336"),
        buttons: {
            ok: function ()
            {
                var buf = "action=startPSTNDetecting&pstn-cpt=(" + _$("src_channels").value + "," + _$("src_number").value
                    + ")(" + _$("des_channels").value + "," + _$("des_number").value + ")";
                $.ajax({ type: "post", url: "/webcgi", data: buf, success: pstnOver });
                //pstnCancel();
                //SHOW_FLAG = true;
                top.dialog.dialogMessage({ type: 'loading', content: $P.lang("LANG2337")});
            },
            cancel: function ()
            {
                pstnAfter();
            }
        }
    }); */
};

function btnDisable() {
    selectChannel = getSelectedChannels();

    if (selectChannel && selectChannel.length > 0) {
        $("#detect").removeClass("disabled").removeAttr("disabled");
    } else {
        $("#detect").addClass("disabled").attr("disabled", "disabled");
    }
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj["text"] = "Group " + res[i]["trunkgroup"] + "(" + res[i]["trunk_name"] + ")";
        obj["val"] = res[i]["trunkgroup"];

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transSelectData(res) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        // obj["text"] = res[i];
        obj["val"] = res[i];

        arr.push(obj);
    }

    return arr;
}
/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    fxsSettings = [],
    fxoSettings = [],
    briSettings = [],
    globalSettings = {},
    oldAlawoverride = "";

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

var country2lngObj = {
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
};

String.prototype.format = top.String.prototype.format;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG32"));

    initToneZone();

    // initOpermode();
    // getAnalogSettings();

    $("#save").click(saveChanges);

    $("#fxs_override_tiss").bind("click", function(ev) {
        if (this.checked) {
            $("#fxs_tiss").show();
        } else {
            $("#fxs_tiss").hide();
        }

        top.Custom.init(document, this);
        top.Custom.init(document, $("#fxs_tiss")[0]);

        ev.stopPropagation();
    });

    $P.lang(doc, true);
    // top.Custom.init(doc);
});

function initToneZone() {
    var action = {
        action: "listAllToneZoneSettings",
        options: "description,country",
        sidx: "description",
        "fxs_surpport": 1
    };

    $.ajax({
        url: baseServerURl,
        type: 'POST',
        dataType: 'json',
        data: action,
        async: false,
        error: function() {
            initOpermode();
        },
        success: function(data) {
            var data = eval(data);

            if (data && data.status == 0) {
                var CountryTone = data.response.CountryTone,
                    arr = [];

                for (var i = 0; i < CountryTone.length; i++) {
                    var obj = {},
                        country = CountryTone[i]["country"];

                    obj["text"] = CountryTone[i]["description"];
                    obj["val"] = country;
                    obj["locale"] = nation2langObj[country.toLowerCase()];

                    arr.push(obj);
                }

                selectbox.appendOpts({
                    el: "fxs_tonezone",
                    opts: arr
                }, doc);

                top.Custom.init(doc, $("#fxs_tonezone")[0]);
            }

            initOpermode();
        }
    });
}

function initOpermode() {
    var action = {
        action: "listAllOpermodeSettings",
        sidx: "country_description"
    };

    $.ajax({
        url: baseServerURl,
        type: 'POST',
        dataType: 'json',
        data: action,
        async: false,
        error: function() {
            getAnalogSettings();

            if (UCMGUI.config.model_info.num_bri) {
                getBRISettings();
            }
        },
        success: function(data) {
            var data = eval(data);

            if (data && data.status == 0) {
                var opermodeSettings = data.response.CountryOpermode,
                    arr = [];

                for (var i = 0; i < opermodeSettings.length; i++) {
                    var obj = {},
                        opermode = opermodeSettings[i]["opermode"];;

                    obj["text"] = opermodeSettings[i]["country_description"];
                    obj["val"] = opermode;
                    obj["locale"] = country2lngObj[opermode.toLowerCase()];

                    arr.push(obj);
                }

                selectbox.appendOpts({
                    el: "fxo_opermode",
                    opts: arr
                }, doc);

                selectbox.appendOpts({
                    el: "fxs_opermode",
                    opts: arr
                }, doc);

                top.Custom.init(doc, $("#fxo_opermode")[0]);
                top.Custom.init(doc, $("#fxs_opermode")[0]);
            }

            getAnalogSettings();

            if (UCMGUI.config.model_info.num_bri) {
                getBRISettings();
            }
        }
    });
}

function getAnalogSettings(option) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getAnalogSettings"
        },
        async: true,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });

            top.Custom.init(doc);
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response;
                fxsSettings = res.fxs_settings;

                var fxsChans = transData(fxsSettings);
                fxoSettings = res.fxo_settings;

                // var fxoChans = transData(fxoSettings);
                globalSettings = res.hardware_global_settings;
                oldAlawoverride = globalSettings.alawoverride;

                if (!option) {
                    UCMGUI.domFunction.updateDocument(globalSettings, doc);

                    if (globalSettings && (globalSettings.fxs_override_tiss == '1')) {
                        $("#fxs_override_tiss")[0].checked = true;
                        $("#fxs_tiss").show();
                    } else {
                        $("#fxs_tiss").hide();
                    }

                    initTable();
                }
            }

            top.Custom.init(doc);
        }
    });
}

function getBRISettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "listBRIPort"
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
                var res = data.response;
                briSettings = res.bri_driver_settings;
            }
        }
    });
}

function initTable() {
    var table = $("#digitalcardstable");

    $("#digitalcardstable").empty();

    var fxoChansNum = Number(UCMGUI.config.model_info.num_fxo),
        fxsChansNum = Number(UCMGUI.config.model_info.num_fxs),
        fxoChans = [],
        fxsChans = [];

    for (var i = 1; i <= fxoChansNum; i++) {
        fxoChans.push(i);
    }

    for (var i = 1; i <= fxsChansNum; i++) {
        fxsChans.push(i);
    }

    var thead = $("<thead>").appendTo(table).addClass("thead"),
        tbody = $("<tbody>").appendTo(table).addClass("tbody");

    // render thead
    var theadContent = ["LANG84", "LANG237", "LANG74"],
        tr = $("<tr>").addClass("frow").appendTo(thead);

    for (var i = 0; i < theadContent.length; i++) {
        var spanTh = $("<th>").appendTo(tr);

        $("<span>").appendTo(spanTh).css('cursor', 'default').attr("locale", theadContent[i]).html($P.lang(theadContent[i]));
    }

    // render tbody
    var trEven = $("<tr>").appendTo(tbody).addClass("even");
    $("<td width='30%'>").appendTo(trEven).attr("locale", "LANG562 LANG1725").html($P.lang("LANG562").format($P.lang("LANG1725")));
    $("<td width='30%'>").appendTo(trEven).html(fxsChans.toString());
    $("<td width='40%'>").appendTo(trEven).html("<button type='button' class='options edit' id='FXS' localetitle='LANG738' title='Edit'></button>");

    if (!UCMGUI.config.model_info.num_bri) {
        var trOld = $("<tr>").appendTo(tbody).addClass("odd");

        $("<td width='30%'>").appendTo(trOld).attr("locale", "LANG562 LANG1724").html($P.lang("LANG562").format($P.lang("LANG1724")));
        $("<td width='30%'>").appendTo(trOld).html(fxoChans.toString());
        $("<td width='40%'>").appendTo(trOld).html("<button type='button' class='options edit' id='FXO' localetitle='LANG738' title='Edit'></button>");
    } else {
        $('#brihardware').show();

        var table = $("#bricardstable"),
            briPortsNum = Number(UCMGUI.config.model_info.num_bri),
            briPorts = [];

        for (var i = 1; i <= briPortsNum; i++) {
            briPorts.push(i);
        }

        var thead = $("<thead>").appendTo(table).addClass("thead"),
            tbody = $("<tbody>").appendTo(table).addClass("tbody");

        // render thead
        var theadContent = ["LANG84", "LANG237", "LANG74"],
            tr = $("<tr>").addClass("frow").appendTo(thead);

        for (var i = 0; i < theadContent.length; i++) {
            var spanTh = $("<th>").appendTo(tr);

            $("<span>").appendTo(spanTh).css('cursor', 'default').attr("locale", theadContent[i]).html($P.lang(theadContent[i]));
        }

        // render tbody
        var trEven = $("<tr>").appendTo(tbody).addClass("even");
        $("<td width='30%'>").appendTo(trEven).attr("locale", "LANG562 LANG2837").html($P.lang("LANG562").format($P.lang("LANG2837")));
        $("<td width='30%'>").appendTo(trEven).html(briPorts.toString());
        $("<td width='40%'>").appendTo(trEven).html("<button type='button' class='options edit' id='BRI' localetitle='LANG738' title='Edit'></button>");
    }

    $(".edit").delegate(theadContent, "click", function showEditAnalogForm() {
        var type = $(this).attr("id");

        if (type == "FXO") {
            var lang = "LANG2343";
        } else if (type == "BRI") {
            var lang = "LANG2878";
        } else {
            var lang = "LANG780";
        }

        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang(lang),
            displayPos: "editForm",
            frameSrc: "html/hardware_dahdi_analog_modal.html?type=" + type
        });
    });
}

function saveChanges() {
    var action = {};

    action = formSerializeVal(document);

    action["action"] = "updateAnalogSettings";

    action["fxs_override_tiss"] = ($("#fxs_override_tiss").is(":checked") ? 1 : 0);

    if (globalSettings.fxo_opermode != $("#fxo_opermode").val()) {
        action["ifACIMautodetect"] = "no";
    }

    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if ($("#alawoverride").val() != oldAlawoverride) {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG927"),
                        buttons: {
                            ok: UCMGUI.loginFunction.confirmReboot,
                            cancel: function() {
                                var config = context2json({
                                    filename: ASTGUI.globals.configfile,
                                    context: 'general',
                                    usf: 1
                                });

                                configAlawoverride = config.getProperty('alawoverride');
                            }
                        }
                    });
                } else {
                    top.dialog.dialogMessage({
                        type: "success",
                        content: $P.lang("LANG4782"),
                        callback: getAnalogSettings
                    });
                }
            }
        }
    });
}

function confirm_reboot() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG832")
    });

    $.ajax({
        type: "GET",
        url: "../webcgi?action=reboot",
        success: function() {
            if (typeof data == "string" && data.contains("Authentication failed")) {
                UCMGUI.logoutFunction.doLogout();
                return;
            }

            setTimeout("top.window.location.reload();", 120000);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            if (errorThrown != null && errorThrow.length > 0) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG853")
                });
            }
        }
    })
}

function setDefaultVal(id) {
    var ele = $("#" + id),
        dfalt = ele.attr('dfalt');

    if (dfalt) {
        if (ele[0] && ele[0].type == "checkbox") {
            ele[0].checked = ((dfalt == "yes") ? true : false);
        } else {
            ele.val(dfalt);
        }
    } else {
        ele[0].selectedIndex = 0;
    }

    if ("fxs_override_tiss" === id) {
        $("#fxs_tiss").hide();

        top.Custom.init(document, $("#fxs_tiss")[0]);
    }

    top.Custom.init(document, ele[0]);
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        arr.push(res[i]["chan"]);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function formSerializeVal(doc, iframe) {
    var hash = {},
        fields = UCMGUI.findInputFields(doc, iframe);

    for (var i = 0; i < fields.length; i++) {
        var domVal = "",
            id = $(fields[i]).attr("id"),
            val = $(fields[i]).val(),
            noSerialize = $(fields[i]).attr("noSerialize");

        if (!noSerialize && id.length != 0) {
            if ($(fields[i]).is(":hidden")) {
                continue;
            }

            if ($(fields[i]).is(":disabled")) {
                continue;
            }

            if (globalSettings[id] == val) {
                continue;
            }

            switch (fields[i].type) {
                case 'textarea':
                case 'text':
                case 'password':
                    domVal = val;
                    break;
                case 'checkbox':
                    domVal = $(fields[i]).is(":checked") ? "yes" : "no";
                    break;
                case 'radio':
                    break;
                case 'select-one':
                    domVal = val;
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

            // if (domVal) {
            hash[id] = domVal;
            // }
        }
    }

    return hash;
}
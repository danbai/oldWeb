/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2016 Grandstream Networks, Inc.
 *
 */

import $ from 'jquery'
import _ from 'underscore'

let Validator = function() {}

Validator.prototype = {
    initConfig: {
        // required: function(param, element, result) {
        //     var text = ''

        //     if (result === 1) {
        //         text = "LANG2818"
        //     } else {
        //         text = "LANG2150");
        //     }

        //     return text
        // },
        remote: "LANG2151",
        email: "LANG2152",
        url: "LANG2153",
        date: "LANG2154",
        dateISO: "LANG2155",
        number: "LANG2156",
        digits: "LANG2157",
        creditcard: "LANG2158",
        equalTo: "LANG2159",
        maxlength: "LANG2160",
        minlength: "LANG2161",
        rangelength: "LANG2162",
        range: "LANG2147",
        max: "LANG2163",
        min: "LANG2164",
        smaller: "LANG2165",
        bigger: "LANG2142",
        ipDns: "LANG2166",
        ipv4withcidr: "LANG2166",
        privateIpv4withcidr: "LANG5236",
        host: "LANG2167",
        urlWithoutProtocol: "LANG2167",
        selectItemMin: "LANG2168",
        selectItemMax: "LANG2169",
        extensionExists: "LANG2126",
        extensionRange: "LANG2170",
        numeric_pound_star: "LANG2171",
        notEqualTo: "LANG2172",
        dialpattern: "LANG2167",
        dialpattern_additional: "LANG2167",
        keyboradNoSpace: "LANG2173",
        keyboradNoSpaceSem: "LANG2174",
        keyboradNoSpaceSem1: "LANG2643",
        outgoingRuleNameExists: "LANG2137",
        stripMax: "LANG2391",
        domain: "LANG2167",
        custom_tz: "LANG2167",
        mask: "LANG2175",
        preip: "LANG2176",
        mac: "LANG2177",
        voicemenuExists: "LANG2178",
        numberOrExtension: "LANG3842",
        phoneNumberOrExtension: "LANG2179",
        callerid: "LANG2290",
        checkSameNetworkSegment: "LANG2176",
        authid: "LANG2489",
        specialauthid: "LANG4445",
        specialauthid1: "LANG4463",
        checkAlphanumericPw: "LANG2635",
        checkNumericPw: "LANG2636",
        identical: "LANG2637",
        versionNum: "LANG4148",
        minValue: "LANG2164",
        calleridSip: "LANG5031",
        specialStr: "LANG5140"
    },
    digits: function(data, value, callback, formatMessage) {
        if (!value || (value && /^\d+$/i.test(value))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2157"}))
        }
    },
    digitalAndQuote: function(data, value, callback, formatMessage) {
        if (!value || (value && /^\d+(,\d+)*(,)?$/i.test(value))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG3822"}))
        }
    },
    range: function(data, value, callback, formatMessage, min, max) {
        if (value && (value > max || value < min)) {
            callback(formatMessage({id: "LANG2147"}, {0: min + '', 1: max + ''}))
        } else {
            callback()
        }
    },
    required: function(data, value, callback, formatMessage, associate, otherInputValue) {
        if (associate) {
            if ((otherInputValue && !value)) {
                callback(formatMessage({id: "LANG2150"}))
            } else {
                callback()
            }
        } else {
            if (!value || !value.length) {
                callback(formatMessage({id: "LANG2150"}))
            } else {
                callback()
            }
        }
    },
    maxlength: function(data, value, callback, formatMessage, maxlength) {
        if (value && maxlength && value.length > maxlength) {
            callback(formatMessage({id: "LANG2160"}, {0: maxlength}))
        } else {
            callback()
        }
    },
    minlength: function(data, value, callback, formatMessage, minlength) {
        if (value && minlength && value.length < minlength) {
            callback(formatMessage({id: "LANG2161"}, {0: minlength}))
        } else {
            callback()
        }
    },
    notEqualTo: function(data, value, callback, formatMessage, otherInputValue, otherInputLabel) {
        if (value && otherInputValue && (value === otherInputValue)) {
            callback(formatMessage({id: "LANG2172"}, {0: otherInputLabel}))
        } else {
            callback()
        }
    },
    letterswithbasicpunc: function(data, value, callback, formatMessage) {
        if (value && !/^[a-zA-Z0-9\-.,()'"\s]+$/i.test(value)) {
            callback(formatMessage({id: "LANG2183"}))
        } else {
            callback()
        }
    },
    alphanumeric: function(data, value, callback, formatMessage) {
        if (value && !/^\w+$/i.test(value)) {
            callback(formatMessage({id: "LANG2184"}))
        } else {
            callback()
        }
    },
    specialhost: function(data, value, callback, formatMessage, errMsg) {
        if (!value || /^((([hH][Tt][Tt][Pp][Ss])|(([Tt][Ff]|[Ff]|[Hh][Tt])[Tt][Pp])):\/\/)?(((([a-z]|\d|-|\.|~|[A-Z])|(%[\da-f]{2})|[\-\.])*)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[A-Z])|(([a-z]|\d|[A-Z])([a-z]|\d|-|\.|~|[A-Z])*([a-z]|\d|[A-Z])))\.)+(([a-z]|[A-Z])|(([a-z]|[A-Z])([a-z]|\d|-|\.|~|[A-Z])*([a-z]|[A-Z]|\d)))\.?)(:\d*)?)$/.test(value) ||
            (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.indexOf("[") > -1 && value.indexOf("]") > -1) || (!value.indexOf("[") > -1 && !value.indexOf("]") > -1))) ||
            /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2167"}, {0: errMsg}))
        }
    },
    specialIpAddress: function(data, value, callback, formatMessage) {
        if (!value || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i.test(value) ||
            (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.indexOf("[") > -1 && value.indexOf("]") > -1) || (!value.indexOf("[") > -1 && !value.indexOf("]") > -1))) ||
            /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2195"}))
        }
    },
    specialIpAddressNoBrackets: function(data, value, callback, formatMessage) {
        if (!value || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i.test(value) ||
            /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value) ||
            /^\d+$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2195"}))
        }
    },
    ipAddressNoBrackets: function(data, value, callback, formatMessage) {
        if (!value || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])$/i.test(value) ||
            /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2195"}))
        }
    },
    iporrange: function(data, value, callback, formatMessage) {
        var pieces = value ? value.split("/") : []
        var reg = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}$/i
        var reg2 = /^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/
        var reg3 = /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/
        var res = true

        for (var j = 0; j < pieces.length; j++) {
            if (!(reg.test(pieces[j]) || reg2.test(pieces[j] && ((pieces[j].indexOf("[") > -1 && pieces[j].indexOf("]") > -1) || (!pieces[j].indexOf("[") > -1 && !pieces[j].indexOf("]") > -1))) || reg3.test(pieces[j]))) {
                 res = false
            }
        }

        if (res) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2194"}))
        }
    },
    ipAddress: function(data, value, callback, formatMessage) {
        if (!value || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])$/i.test(value) ||
            (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) &&
            ((value.indexOf("[") !== -1 && value.indexOf("]")) !== -1 || (!(value.indexOf("[") !== -1) && !(value.indexOf("]") !== -1))))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2195"}))
        }
    },
    ipAddressPort: function(data, value, callback, formatMessage) {
        if (!value || (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/i.test(value) ||
            (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.indexOf("[") !== -1 && value.indexOf("]")) !== -1 || (!(value.indexOf("[") !== -1) && !(value.indexOf("]") !== -1)))) ||
            /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2195"}))
        }
    },
    ipv4AddressPort: function(data, value, callback, formatMessage) {
        if (!value || (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/i.test(value))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG5135"}))
        }
    },
    ipv4Address: function(data, value, callback, formatMessage) {
        const reg = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG2195"}))
        } else {
            callback()
        }
    },
    ipv4: function(data, value, callback, formatMessage) {
        if (!value || (/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}$/i.test(value))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG5135"}))
        }
    },
    ipv6: function(data, value, callback, formatMessage) {
        const reg = /^\[?([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\]$|^\[:((:[0-9a-fA-F]{1,4}){1,6}|:)\]$|^\[[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)\]$|^\[([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)\]$|^\[([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)\]$|^\[([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)\]$|^\[([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?\]$|^\[([0-9a-fA-F]{1,4}:){6}:\]?$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG2196"}))
        } else {
            callback()
        }
    },
    ipv6Port: function(data, value, callback, formatMessage) {
        const reg = /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG2196"}))
        } else {
            callback()
        }
    },
    ipv6withcidr: function(data, value, callback, formatMessage) {
        const reg = /^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?(\/([1-9]|[1-9]\d|1[0-1]\d|12[0-8]?))?$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG2196"}))
        } else {
            callback()
        }
    },
    ipv4Dns: function(data, value, callback, formatMessage, msg) {
        const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/

        if (value && !reg.test(value) || value === "0.0.0.0") {
            callback(formatMessage({id: "LANG2166"}, {0: msg}))
        } else {
            callback()
        }
    },
    ipv6Dns: function(data, value, callback, formatMessage, msg) {
        const reg = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^:((:[0-9a-fA-F]{1,4}){1,6}|:)$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)$|^([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)$|^([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)$|^([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)$|^([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?$|^([0-9a-fA-F]{1,4}:){6}:$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG2166"}, {0: msg}))
        } else {
            callback()
        }
    },
    mask: function(data, value, callback, formatMessage) {
        const reg = /^(((254|252|248|240|224|192|128|0)\.0\.0\.0)|(255\.(254|252|248|240|224|192|128|0)\.0\.0)|(255\.255\.(254|252|248|240|224|192|128|0)\.0)|(255\.255\.255\.(254|252|248|240|224|192|128|0)))$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG2175"}))
        } else {
            callback()
        }
    },
    mac: function(data, value, callback, formatMessage) {
        const reg = /^([0-9a-fA-F]{2})(([0-9a-fA-F]{2}){5})$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG2177"}))
        } else {
            callback()
        }
    },
    letterDigitUndHyphen: function(data, value, callback, formatMessage) {
        if (value && !/^[a-zA-Z0-9_\-]+$/.test(value)) {
            callback(formatMessage({id: "LANG2200"}))
        } else {
            callback()
        }
    },
    numeric_pound_star: function(data, value, callback, formatMessage) {
        if (value && !/^[0-9#\*]+$/i.test(value)) {
            callback(formatMessage({id: "LANG2171"}))
        } else {
            callback()
        }
    },
    smallerTime: function(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel) {
        if (value && otherInputValue) {
            if (value._d.getTime() > otherInputValue._d.getTime()) {
                callback(formatMessage({id: "LANG2165"}, {
                        0: thisLabel,
                        1: otherInputLabel
                    }))
            } else {
                callback()
            }
        } else {
            callback()
        }
    },
    biggerTime: function(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel) {
        if (value && otherInputValue) {
            if (value._d.getTime() < otherInputValue._d.getTime()) {
                callback(formatMessage({id: "LANG2142"}, {
                        0: thisLabel,
                        1: otherInputLabel
                    }))
            } else {
                callback()
            }
        } else {
            callback()
        }
    },
    calleridSip: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9_\+\*#\-\.]*)$/.test(value)) {
            callback(formatMessage({id: "LANG5031"}))
        } else {
            callback()
        }
    },
    PRIDODNumber: function(data, value, callback, formatMessage) {
        if (value && !/^([0-9#\*]*)$/.test(value)) {
            callback(formatMessage({id: "LANG4758"}))
        } else {
            callback()
        }
    },
    SS7DODNumber: function(data, value, callback, formatMessage) {
        if (value && !/^([ABCDEFabcdef0-9#\*]*)$/.test(value)) {
            callback(formatMessage({id: "LANG4759"}))
        } else {
            callback()
        }
    },
    specailCalleridSip: function(data, value, callback, formatMessage, invalid) {
        let regex = /^([a-zA-Z0-9\_\+\*\#\-\.\<\>]*)$/
        if (value) {
            let have1 = (value.indexOf("<") > -1) && (value.indexOf(">") > -1) && /\>$/.test(value)
            let have2 = !(value.indexOf("<") > -1) && !(value.indexOf(">") > -1)
            if (!(regex.test(value) && (have1 || have2))) {
                if (invalid) {
                    callback(formatMessage({id: "LANG5617"}, {0: formatMessage({ id: "LANG5375" })}))
                } else {
                    callback(formatMessage({id: "LANG5375"}))
                }
            } else {
                callback()
            }
        } else {
            callback()
        }
    },
    specialCidName: function(data, value, callback, formatMessage) {
        if (value && !/^[^"@:;)(,!$%\^&*（）_+<>\\]*$/.test(value)) {
            callback(formatMessage({id: "LANG5091"}))
        } else {
            callback()
        }
    },
    cidName: function(data, value, callback, formatMessage) {
        if (value && !/^[^"@:;)(,]*$/.test(value)) {
            callback(formatMessage({id: "LANG3198"}))
        } else {
            callback()
        }
    },
    keyboradNoSpace: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9,\.\/<>\?;':"\[\]\\\{\}\|`~!@#\$%\^&\*\(\)\-_=\+]*)$/.test(value)) {
            callback(formatMessage({id: "LANG2173"}))
        } else {
            callback()
        }
    },
    keyboradNoSpaceSpecial: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9,\.\/<>\?;':\[\]\\\{\}\|~!@#\$%\^&\*\(\)\-_=\+]*)$/.test(value)) {
            callback(formatMessage({id: "LANG5212"}))
        } else {
            callback()
        }
    },
    keyboradNoSpacesemicolon: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9~!@#\$%\^\*]*)$/.test(value)) {
            callback(formatMessage({id: "LANG4475"}))
        } else {
            callback()
        }
    },
    keyboradNoSpacesemicolon1: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9~!+@%\*]*)$/.test(value)) {
            callback(formatMessage({id: "LANG2643"}))
        } else {
            callback()
        }
    },
    authid: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9\.'\|`~!#\$%\^&\*\-_\+]*)$/.test(value)) {
            callback(formatMessage({id: "LANG2489"}))
        } else {
            callback()
        }
    },
    specialauthid: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9,\.\/':\?~!\$\&\*\(\)\-_=\+]*)$/.test(value)) {
            callback(formatMessage({id: "LANG4445"}))
        } else {
            callback()
        }
    },
    specialauthid1: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9\.\|`~!#\$%\^\*\-_\+\@]*)$/.test(value)) {
            callback(formatMessage({id: "LANG4463"}))
        } else {
            callback()
        }
    },
    noSpaces: function(data, value, callback, formatMessage) {
        if (value && /\s/g.test(value)) {
            callback(formatMessage({id: "LANG2818"}))
        } else {
            callback()
        }
    },
    noSpacesInFrontAndEnd: function(data, value, callback, formatMessage) {
        if (value && /^\s+|\s+$/g.test(value)) {
            callback(formatMessage({id: "LANG4113"}))
        } else {
            callback()
        }
    },
    alphanumericStarPlusPound: function(data, value, callback, formatMessage) {
        if (value && !/^[a-zA-Z0-9#\*\+]+$/g.test(value)) {
            callback(formatMessage({id: "LANG3842"}))
        } else {
            callback()
        }
    },
    alphanumericUndDotAt: function(data, value, callback, formatMessage) {
        if (value && !/^[a-zA-Z_0-9@.]+$/i.test(value)) {
            callback(formatMessage({id: "LANG4537"}))
        } else {
            callback()
        }
    },
    alphanumericUnd: function(data, value, callback, formatMessage) {
        if (value && !/^[a-zA-Z_0-9]+$/i.test(value)) {
            callback(formatMessage({id: "LANG2203"}))
        } else {
            callback()
        }
    },
    gain: function(data, value, callback, formatMessage, param0, param1) {
        if (value && (!/^(-|\+)?[0-9]*\.?[0-9]*$/i.test(value) || parseFloat(value) < parseFloat(param0) || parseFloat(value) > parseFloat(param1))) {
            callback(formatMessage({id: "LANG2206"}, {0: param0, 1: param1}))
        } else {
            callback()
        }
    },
    email: function(data, value, callback, formatMessage, param) {
        if (value && !/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@(([-a-zA-Z0-9])+\.)+([a-zA-Z]{2,4})+$/i.test(value)) {
            callback(formatMessage({id: "LANG2152"}))
        } else {
            callback()
        }
    },
    multiEmail: function(data, value, callback, formatMessage) {
        if (value && !/^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@(([-a-zA-Z0-9])+\.)+([a-zA-Z]{2,4})+)(;[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@(([-a-zA-Z0-9])+\.)+([a-zA-Z]{2,4})+)*$/.test(value)) {
            callback(formatMessage({id: "LANG2152"}))
        } else {
            callback()
        }
    },
    numberOrExtension: function(data, value, callback, formatMessage, param) {
        if (value && !/^([0-9#\*\+]*)$/.test(value)) {
            callback(formatMessage({id: "LANG5626"}))
        } else {
            callback()
        }
    },
    phoneNumberOrExtension: function(data, value, callback, formatMessage, param) {
        if (value && !/^([a-zA-Z0-9#\*\-\+]*)$/i.test(value)) {
            callback(formatMessage({id: "LANG2179"}))
        } else {
            callback()
        }
    },
    host: function(data, value, callback, formatMessage, param) {
        if (!value || /^((https?|ftp|news):\/\/)?((([a-zA-Z0-9]([a-zA-Z0-9\-]*[\.])+([a-zA-Z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel))|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])))(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?)(\/[a-zA-Z0-9_\-\.~]+)*(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value) ||
            (/^((https?|ftp|news):\/\/)?\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value) && ((value.indexOf("[") > -1 && value.indexOf("]") > -1) || (!value.indexOf("[") > -1 && !value.indexOf("]") > -1))) ||
            /^((https?|ftp|news):\/\/)?\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2167"}, {0: formatMessage({id: param})}))
        }
    },
    hostWithoutIpv6: function(data, value, callback, formatMessage, param) {
        if (!value || /^((https?|ftp|news):\/\/)?((([a-zA-Z0-9]([a-zA-Z0-9\-]*[\.])+([a-zA-Z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel))|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])))(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?)(\/[a-zA-Z0-9_\-\.~]+)*(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2167"}, {0: formatMessage({id: param})}))
        }
    },
    ipv4withcidr: function(data, value, callback, formatMessage, param) {
        if (!value || /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/([1-9]|[12]\d|3[0-2]?))?$/i.test(value) ||
            (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\/([1-9]|[1-9]\d|1[0-1]\d|12[0-8]?))?\]?$/.test(value) && ((value.match(/\[/) && value.match(/\]/)) || (!value.match(/\[/) && !value.match(/\]/)))) ||
            /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\/([1-9]|[1-9]\d|1[0-1]\d|12[0-8]?))?\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2195"}))
        }
    },
    pppoeSecret: function(data, value, callback, formatMessage, param) {
        if (value && !/^[^`|^"]*$/g.test(value)) {
            callback(formatMessage({id: "LANG2996"}))
        } else {
            callback()
        }
    },
    urlWithoutProtocol: function(data, value, callback, formatMessage, param) {
        if (!value || /^(((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[A-Z])|(([a-z]|\d|[A-Z])([a-z]|\d|-|\.|_|~|[A-Z])*([a-z]|\d|[A-Z])))\.)+(([a-z]|[A-Z])|(([a-z]|[A-Z])([a-z]|\d|-|\.|_|~|[A-Z])*([a-z]|[A-Z])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/.test(value) ||
            (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.indexOf("[") !== -1 && value.indexOf("]")) !== -1 || (!(value.indexOf("[") !== -1) && !(value.indexOf("]") !== -1)))) ||
            /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2167"}, {0: formatMessage({id: param})}))
        }
    },
    specialStr: function(data, value, callback, formatMessage) {
        if (value && !/^[^#]*$/i.test(value)) {
            callback(formatMessage({id: "LANG5140"}))
        } else {
            callback()
        }
    },
    ipDnsSpecial: function(data, value, callback, formatMessage) {
        if (!value || /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-4])$/.test(value) ||
            /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG5140"}))
        }
    },
    ipDns: function(data, value, callback, formatMessage, param) {
        if (!value) {
            callback()
        } else if (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value)) {
            callback()
        } else if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^:((:[0-9a-fA-F]{1,4}){1,6}|:)$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)$|^([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)$|^([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)$|^([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)$|^([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?$|^([0-9a-fA-F]{1,4}:){6}:$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2166"}, {0: param}))
        }
    },
    userName: function(data, value, callback, formatMessage) {
        if (value && !/^[a-zA-Z_0-9]+$/.test(value)) {
            callback(formatMessage({id: "LANG2831"}))
        } else {
            callback()
        }
    },
    // validate wheather A is bigger than B,use to cmpare string
    strbigger: function(data, value, callback, formatMessage, thisLabel, otherInputLabel, otherInputValue) {
        let res = false

        if (value === "" || otherInputValue === "") {
            res = true
        } else if (value.length !== otherInputValue.length) {
            res = (value.length > otherInputValue.length)
        } else {
            res = (value >= otherInputValue)
        }

        if (!res) {
            callback(formatMessage({id: "LANG2142"}, {
                    0: thisLabel,
                    1: otherInputLabel
                }))
        } else {
            callback()
        }
    },
    realAlphanumeric: function(data, value, callback, formatMessage, errMsg) {
        if (value && !/^[a-zA-Z0-9]+$/i.test(value)) {
            callback(formatMessage({id: "LANG2708"}))
        } else {
            callback()
        }
    },
    charMode: function(f) {
        var b = " 　`｀~～!！@·#＃$￥%％^…&＆()（）-－_—=＝+＋[]［］|·:：;；“\、'‘,，<>〈〉?？/／*＊.。{}｛｝\\\"",
            e = f.charCodeAt(0)

        if (e >= 48 && e <= 57) {
            return 1
        } else {
            if (e >= 65 && e <= 90) {
                return 2
            } else {
                if (e >= 97 && e <= 122) {
                    return 4
                } else {
                    if (b.indexOf(f) > -1) {
                        return 8
                    }
                }
            }
        }

        return 0
    },
    checkPasswordStrength: function(e) {
        var d = 0,
            f, c = 0

        for (let i = 0; i < e.length; i++) {
            f = this.charMode(e.charAt(i))

            if (f === 0) {
                return -1
            }

            if ((d & f) === 0) {
                d |= f
                ++c
            }
        }

        return c
    },
    checkPassword: function(type, e) {
        var c = e.length

        var a = {
            repeat: function(c) {
                return /^(.)\1+$/.test(c)
            },
            list: (function() {
                var c = ["123123", "5201314", "7758521", "654321", "1314520", "123321", "123654", "5211314", "1230123", "987654321", "147258", "123123123", "7758258", "520520", "789456", "159357", "112233", "456123", "110110", "521521", "789456123", "159753", "987654", "115415", "123000", "123789", "100200", "121212", "111222", "123654789", "12301230", "456456", "666888", "168168", "4655321", "321321"]

                return function(e) {
                    for (var d = 0; d < c.length; d++) {
                        if (e === c[d]) {
                            return true
                        }
                    }

                    return false
                }
            })()
        }

        let times = 0
        for (let i = 0; i < c; i++) {
            if (this.charMode(e.charAt(i)) === 0) {
                return -3
            }

            if (/^[0-9]*$/.test(e) || /^[a-z]*$/.test(e) || /^[A-Z]*$/.test(e)) {
                if (typeof parseInt(e, 10) === "number") {
                    var str = this.increment(parseInt(e.substring(0, 1)), e.length - 1)

                    if (str !== e) {
                        break
                    }
                }

                if (e.charCodeAt(i) === e.charCodeAt(i - 1) + 1) {
                    times++

                    if (times > 3) {
                        return -5
                    }
                } else {
                    times = 1
                }
            }
        }

        if (type === "digital") {
            if (!/^[0-9]*$/.test(e)) {
                return -1
            } else {
                for (let d in a) {
                    if (a[d](e)) {
                        return -4
                    }
                }
            }
        } else {
            if (/^[0-9]*$/.test(e) || /^[a-z]*$/.test(e) || /^[A-Z]*$/.test(e)) {
                return -1
            } else if (!/[0-9a-zA-Z A-Z`｀~～!！@·#＃$￥%％^…&＆()（）-－_—=＝+＋\[\]［］|·:：;；\"“\、'‘,，<>〈〉?？\/／*＊]+/g.test(e)) {
                return -2
            } else {
                for (let d in a) {
                    if (a[d](e)) {
                        return -4
                    }
                }
            }
        }
        return 1
    },
    increment: function(num, len) {
        var str = String(num)

        for (var i = 0; i < len; i++) {
            num += 1
            str += num
        }

        return str
    },
    showCheckPassword: function(obj) {
        var pwsId = obj.pwsId,
            type = obj.type,
            pwsVal = obj.value

        if (pwsId === 'secret' && pwsVal.match(/^[~!@+#$%^*]+$/)) {
            return false
        }

        if (!pwsVal) {
            return true
        } else {
            var isWeak = this.checkPassword(type, pwsVal),
                strength = this.checkPasswordStrength(pwsVal)

            if (pwsId === 'user_password' && pwsVal === '******') {
                return true
            }

            if (strength !== 0) {
                if (isWeak === 1) {
                    return true
                } else {
                    return false
                }
            }
        }
    },
    checkAlphanumericPw: function(data, value, callback, formatMessage) {
        if (value && localStorage.weak_password === 'yes') {
            if (this.showCheckPassword({
                type: data.type,
                pwsId: data.field,
                value: value
            })) {
                callback()
            } else {
                callback(formatMessage({id: "LANG2635"}))
            }
        } else {
            callback()
        }
    },
    checkNumericPw: function(data, value, callback, formatMessage) {
        if (value && localStorage.weak_password === 'yes') {
            if (this.showCheckPassword({
                type: "digital",
                pwsId: data.field,
                value: value
            })) {
                callback()
            } else {
                callback(formatMessage({id: "LANG2636"}))
            }
        } else {
            callback()
        }
    },
    digitsWithHyphen: function(data, value, callback, formatMessage) {
        if (value && !/^(\+?\d+\-?\d+)$/.test(value)) {
            callback(formatMessage({id: "LANG4962"}))
        } else {
            callback()
        }
    },
    faxNumber: function(data, value, callback, formatMessage) {
        if (value && !/^[a-zA-Z0-9#\*\+\-]+$/i.test(value)) {
            callback(formatMessage({id: 'LANG4127'}))
        } else {
            callback()
        }
    },
    max: function(data, value, callback, formatMessage, max) {
        if (value && (value > max)) {
            callback(formatMessage({id: "LANG2163"}, {0: max}))
        } else {
            callback()
        }
    },
    min: function(data, value, callback, formatMessage, min) {
        if (value && (value < min)) {
            callback(formatMessage({id: "LANG2164"}, {0: min}))
        } else {
            callback()
        }
    },
    smaller: function(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel) {
        if (value && otherInputValue && !isNaN(parseInt(value)) && !isNaN(parseInt(otherInputValue))) {
            if (parseInt(value) > parseInt(otherInputValue)) {
                callback(formatMessage({id: "LANG2165"}, {
                        0: thisLabel,
                        1: otherInputLabel
                    }))
            } else {
                callback()
            }
        } else {
            callback()
        }
    },
    bigger: function(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel) {
        if (value && otherInputValue && !isNaN(parseInt(value)) && !isNaN(parseInt(otherInputValue))) {
            if (parseInt(value) < parseInt(otherInputValue)) {
                callback(formatMessage({id: "LANG2142"}, {
                        0: thisLabel,
                        1: otherInputLabel
                    }))
            } else {
                callback()
            }
        } else {
            callback()
        }
    },
    hostWithoutPort: function(data, value, callback, formatMessage, param) {
        if (!value || /^((https?|ftp|news):\/\/)?((([a-zA-Z0-9]([a-zA-Z0-9\-]*[\.])+([a-zA-Z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel))|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))))(\/[a-zA-Z0-9_\-\.~]+)*(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value) ||
            (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.indexOf("[") > -1 && value.indexOf("]") > -1) || (!value.indexOf("[") > -1 && !value.indexOf("]") > -1))) ||
            /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2167"}, {0: formatMessage({id: param})}))
        }
    },
    stripMax: function(data, value, callback, formatMessage, message, pattern, prepend) {
        let error = false

        if (value && pattern) {
            let patternList = pattern.split(','),
                min_pattern = $.trim(patternList[0])

            for (let i = 1; i < patternList.length; i++) {
                let currentPattern = $.trim(patternList[i])
                if (currentPattern && (currentPattern.length < min_pattern.length)) {
                    min_pattern = currentPattern
                }
            }

            let rpl_char = '~',
                substring = min_pattern.replace(/\[.+?\]/g, rpl_char)

            substring = substring.replace(/!|-/g, '')
            substring = substring.match(/[\da-zA-Z*.+#~]+/)

            if (substring) {
                let currentPrepend = prepend ? prepend : ''

                if (currentPrepend) {
                    error = Number(value) > substring[0].length
                } else {
                    error = Number(value) >= substring[0].length
                }
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG2391"}, { 0: message }))
        } else {
            callback()
        }
    },
    differentPatterns: function(data, value, callback, formatMessage, split) {
        let error = false

        if (value) {
            let str = value.toLocaleLowerCase().split(split ? split : ','),
                pattern = ''

            for (let j = 0; j < str.length; j++) {
                pattern = $.trim(str[j])

                if (!pattern) {
                    continue
                }

                for (let i = 0; i < str.length; i++) {
                    let thisValue = $.trim(str[i])

                    if (i === j) {
                        continue
                    }

                    if (!thisValue) {
                        continue
                    }

                    let tureValue = (thisValue[0] === '_' ? thisValue.slice(1, thisValue.length) : thisValue)

                    pattern = (pattern[0] === '_' ? pattern.slice(1, pattern.length) : pattern)

                    if (tureValue === pattern) {
                        error = true

                        break
                    }
                }
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG2992"}))
        } else {
            callback()
        }
    }
}

module.exports = new Validator()

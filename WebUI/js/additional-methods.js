/*! jQuery Validation Plugin - v1.10.0 - 9/7/2012
 * https://github.com/jzaefferer/jquery-validation
 * Copyright (c) 2012 Jörn Zaefferer; Licensed MIT, GPL */

/*!
 * jQuery Validation Plugin 1.10.0
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2011 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function() {
    jQuery.extend(jQuery.validator.messages, {
        required: function(param, element, result) {
            var text = '';

            if (result === 1) { // Pengcheng Zou Added. Check if has spaces.
                text = $.lang("LANG2818");
            } else {
                text = $.lang("LANG2150");
            }

            return text;
        },
        remote: $.lang("LANG2151"),
        email: $.lang("LANG2152"),
        url: $.lang("LANG2153"),
        date: $.lang("LANG2154"),
        dateISO: $.lang("LANG2155"),
        number: $.lang("LANG2156"),
        digits: $.lang("LANG2157"),
        creditcard: $.lang("LANG2158"),
        equalTo: $.lang("LANG2159"),
        maxlength: $.validator.format($.lang("LANG2160")),
        minlength: $.validator.format($.lang("LANG2161")),
        rangelength: $.validator.format($.lang("LANG2162")),
        range: $.validator.format($.lang("LANG2147")),
        max: $.validator.format($.lang("LANG2163")),
        min: $.validator.format($.lang("LANG2164")),
        smaller: $.validator.format($.lang("LANG2165")),
        bigger: $.validator.format($.lang("LANG2142")),
        ipDns: $.validator.format($.lang("LANG2166")),
        ipv4withcidr: $.validator.format($.lang("LANG2166")),
        privateIpv4withcidr: $.lang("LANG5236"),
        host: $.validator.format($.lang("LANG2167")),
        urlWithoutProtocol: $.validator.format($.lang("LANG2167")),
        selectItemMin: $.validator.format($.lang("LANG2168")),
        selectItemMax: $.validator.format($.lang("LANG2169")),
        extensionExists: $.validator.format($.lang("LANG2126")),
        extensionRange: $.validator.format($.lang("LANG2170")),
        numeric_pound_star: $.validator.format($.lang("LANG2171")),
        notEqualTo: $.validator.format($.lang("LANG2172")),
        dialpattern: $.validator.format($.lang("LANG2167")),
        dialpattern_additional: $.validator.format($.lang("LANG2167")),
        keyboradNoSpace: $.validator.format($.lang("LANG2173")),
        keyboradNoSpaceSem: $.validator.format($.lang("LANG2174")),
        keyboradNoSpaceSem1: $.validator.format($.lang("LANG2643")),
        outgoingRuleNameExists: $.validator.format($.lang("LANG2137")),
        stripMax: $.validator.format($.lang("LANG2391")),
        domain: $.validator.format($.lang("LANG2167")),
        custom_tz: $.validator.format($.lang("LANG2167")),
        mask: $.validator.format($.lang("LANG2175")),
        preip: $.validator.format($.lang("LANG2176")),
        mac: $.lang("LANG2177"),
        voicemenuExists: $.lang("LANG2178"),
        numberOrExtension: $.lang("LANG3842"),
        phoneNumberOrExtension: $.lang("LANG2179"),
        callerid: $.lang("LANG2290"),
        checkSameNetworkSegment: $.lang("LANG2176"),
        authid: $.validator.format($.lang("LANG2489")),
        specialauthid: $.validator.format($.lang("LANG4445")),
        specialauthid1: $.validator.format($.lang("LANG4463")),
        checkAlphanumericPw: $.validator.format($.lang("LANG2635")),
        checkNumericPw: $.validator.format($.lang("LANG2636")),
        identical: $.validator.format($.lang("LANG2637")),
        versionNum: $.lang("LANG4148"),
        minValue: $.lang("LANG2164"),
        calleridSip: $.validator.format($.lang("LANG5031")),
    });

    function stripHtml(value) {
        // remove html tags and space chars
        return value.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
            // remove punctuation
            .replace(/[.(),;:!?%#$'"_+=\/-]*/g, '');
    }

    jQuery.validator.addMethod("maxWords", function(value, element, params) {
        return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length <= params;
    }, jQuery.validator.format($.lang("LANG2180")));

    jQuery.validator.addMethod("minWords", function(value, element, params) {
        return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length >= params;
    }, jQuery.validator.format($.lang("LANG2181")));

    jQuery.validator.addMethod("rangeWords", function(value, element, params) {
        var valueStripped = stripHtml(value);
        var regex = /\b\w+\b/g;
        return this.optional(element) || valueStripped.match(regex).length >= params[0] && valueStripped.match(regex).length <= params[1];
    }, jQuery.validator.format($.lang("LANG2182")));

})();

jQuery.validator.addMethod("letterswithbasicpunc", function(value, element) {
    return this.optional(element) || /^[a-zA-Z0-9\-.,()'\"\s]+$/i.test(value);
}, $.lang("LANG2183"));

// this method can accept '_'
jQuery.validator.addMethod("alphanumeric", function(value, element) {
    return this.optional(element) || /^\w+$/i.test(value);
}, $.lang("LANG2184"));

// accept only digits and alphabet character
jQuery.validator.addMethod("realAlphanumeric", function(value, element) {
    return this.optional(element) || /^[a-zA-Z0-9]+$/i.test(value);
}, $.lang("LANG2708"));

jQuery.validator.addMethod("lettersonly", function(value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
}, $.lang("LANG2185"));

jQuery.validator.addMethod("nowhitespace", function(value, element) {
    return this.optional(element) || /^\S+$/i.test(value);
}, $.lang("LANG2186"));

jQuery.validator.addMethod("ziprange", function(value, element) {
    return this.optional(element) || /^90[2-5]\d\{2\}-\d{4}$/.test(value);
}, $.lang("LANG2187"));

jQuery.validator.addMethod("zipcodeUS", function(value, element) {
    return this.optional(element) || /\d{5}-\d{4}$|^\d{5}$/.test(value)
}, $.lang("LANG2188"));

jQuery.validator.addMethod("integer", function(value, element) {
    return this.optional(element) || /^-?\d+$/.test(value);
}, $.lang("LANG2189"));

/**
 * Return true, if the value is a valid vehicle identification number (VIN).
 *
 * Works with all kind of text inputs.
 *
 * @example <input type="text" size="20" name="VehicleID" class="{required:true,vinUS:true}" />
 * @desc Declares a required input element whose value must be a valid vehicle identification number.
 *
 * @name jQuery.validator.methods.vinUS
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("vinUS", function(v) {
    if (v.length != 17) {
        return false;
    }
    var i, n, d, f, cd, cdv;
    var LL = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var VL = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 7, 9, 2, 3, 4, 5, 6, 7, 8, 9];
    var FL = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    var rs = 0;
    for (i = 0; i < 17; i++) {
        f = FL[i];
        d = v.slice(i, i + 1);
        if (i == 8) {
            cdv = d;
        }
        if (!isNaN(d)) {
            d *= f;
        } else {
            for (n = 0; n < LL.length; n++) {
                if (d.toUpperCase() === LL[n]) {
                    d = VL[n];
                    d *= f;
                    if (isNaN(cdv) && n == 8) {
                        cdv = LL[n];
                    }
                    break;
                }
            }
        }
        rs += d;
    }
    cd = rs % 11;
    if (cd == 10) {
        cd = "X";
    }
    if (cd == cdv) {
        return true;
    }
    return false;
}, "The specified vehicle identification number (VIN) is invalid.");

/**
 * Return true, if the value is a valid date, also making this formal check dd/mm/yyyy.
 *
 * @example jQuery.validator.methods.date("01/01/1900")
 * @result true
 *
 * @example jQuery.validator.methods.date("01/13/1990")
 * @result false
 *
 * @example jQuery.validator.methods.date("01.01.1900")
 * @result false
 *
 * @example <input name="pippo" class="{dateITA:true}" />
 * @desc Declares an optional input element whose value must be a valid date.
 *
 * @name jQuery.validator.methods.dateITA
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("dateITA", function(value, element) {
    var check = false;
    var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (re.test(value)) {
        var adata = value.split('/');
        var gg = parseInt(adata[0], 10);
        var mm = parseInt(adata[1], 10);
        var aaaa = parseInt(adata[2], 10);
        var xdata = new Date(aaaa, mm - 1, gg);
        if ((xdata.getFullYear() == aaaa) && (xdata.getMonth() == mm - 1) && (xdata.getDate() == gg))
            check = true;
        else
            check = false;
    } else
        check = false;
    return this.optional(element) || check;
}, $.lang("LANG2190"));

jQuery.validator.addMethod("dateNL", function(value, element) {
    return this.optional(element) || /^\d\d?[\.\/-]\d\d?[\.\/-]\d\d\d?\d?$/.test(value);
}, "Vul hier een geldige datum in.");

jQuery.validator.addMethod("time", function(value, element) {
    return this.optional(element) || /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(value);
}, $.lang("LANG2191"));

jQuery.validator.addMethod("time12h", function(value, element) {
    return this.optional(element) || /^((0?[1-9]|1[012])(:[0-5]\d){0,2}(\ [AP]M))$/i.test(value);
}, $.lang("LANG2192"));

/**
 * matches US phone number format
 *
 * where the area code may not start with 1 and the prefix may not start with 1
 * allows '-' or ' ' as a separator and allows parens around area code
 * some people may want to put a '1' in front of their number
 *
 * 1(212)-999-2345 or
 * 212 999 2344 or
 * 212-999-0983
 *
 * but not
 * 111-123-5434
 * and not
 * 212 123 4567
 */
jQuery.validator.addMethod("phoneUS", function(phone_number, element) {
    phone_number = phone_number.replace(/\s+/g, "");
    return this.optional(element) || phone_number.length > 9 &&
        phone_number.match(/^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
}, $.lang("LANG2193"));

jQuery.validator.addMethod('phoneUK', function(phone_number, element) {
    phone_number = phone_number.replace(/\(|\)|\s+|-/g, '');
    return this.optional(element) || phone_number.length > 9 &&
        phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?)|(?:\(?0))(?:(?:\d{5}\)?\s?\d{4,5})|(?:\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3}))|(?:\d{3}\)?\s?\d{3}\s?\d{3,4})|(?:\d{2}\)?\s?\d{4}\s?\d{4}))$/);
}, $.lang("LANG2193"));

jQuery.validator.addMethod('mobileUK', function(phone_number, element) {
    phone_number = phone_number.replace(/\s+|-/g, '');
    return this.optional(element) || phone_number.length > 9 &&
        phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[45789]\d{2}|624)\s?\d{3}\s?\d{3})$/);
}, 'Please specify a valid mobile number');

//Matches UK landline + mobile, accepting only 01-3 for landline or 07 for mobile to exclude many premium numbers
jQuery.validator.addMethod('phonesUK', function(phone_number, element) {
    phone_number = phone_number.replace(/\s+|-/g, '');
    return this.optional(element) || phone_number.length > 9 &&
        phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[45789]\d{8}|624\d{6})))$/);
}, 'Please specify a valid uk phone number');
// On the above three UK functions, do the following server side processing:
//  Compare with ^((?:00\s?|\+)(44)\s?)?\(?0?(?:\)\s?)?([1-9]\d{1,4}\)?[\d\s]+)
//  Extract $2 and set $prefix to '+44<space>' if $2 is '44' otherwise set $prefix to '0'
//  Extract $3 and remove spaces and parentheses. Phone number is combined $2 and $3.
// A number of very detailed GB telephone number RegEx patterns can also be found at:
// http://www.aa-asterisk.org.uk/index.php/Regular_Expressions_for_Validating_and_Formatting_UK_Telephone_Numbers

//Matches UK postcode. based on http://snipplr.com/view/3152/postcode-validation/
jQuery.validator.addMethod('postcodeUK', function(postcode, element) {
    postcode = (postcode.toUpperCase()).replace(/\s+/g, '');
    return this.optional(element) || postcode.match(/^([^QZ][^IJZ]{0,1}\d{1,2})(\d[^CIKMOV]{2})$/) || postcode.match(/^([^QV]\d[ABCDEFGHJKSTUW])(\d[^CIKMOV]{2})$/) || postcode.match(/^([^QV][^IJZ]\d[ABEHMNPRVWXY])(\d[^CIKMOV]{2})$/) || postcode.match(/^(GIR)(0AA)$/) || postcode.match(/^(BFPO)(\d{1,4})$/) || postcode.match(/^(BFPO)(C\/O\d{1,3})$/);
}, 'Please specify a valid postcode');

// TODO check if value starts with <, otherwise don't try stripping anything
jQuery.validator.addMethod("strippedminlength", function(value, element, param) {
    return jQuery(value).text().length >= param;
}, jQuery.validator.format($.lang("LANG2161")));

// same as email, but TLD is optional
jQuery.validator.addMethod("email2", function(value, element, param) {
    return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
}, jQuery.validator.messages.email);

// same as url, but TLD is optional
jQuery.validator.addMethod("url2", function(value, element, param) {
    return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
}, jQuery.validator.messages.url);

// NOTICE: Modified version of Castle.Components.Validator.CreditCardValidator
// Redistributed under the the Apache License 2.0 at http://www.apache.org/licenses/LICENSE-2.0
// Valid Types: mastercard, visa, amex, dinersclub, enroute, discover, jcb, unknown, all (overrides all other settings)
jQuery.validator.addMethod("creditcardtypes", function(value, element, param) {
    if (/[^0-9-]+/.test(value)) {
        return false;
    }

    value = value.replace(/\D/g, "");

    var validTypes = 0x0000;

    if (param.mastercard)
        validTypes |= 0x0001;
    if (param.visa)
        validTypes |= 0x0002;
    if (param.amex)
        validTypes |= 0x0004;
    if (param.dinersclub)
        validTypes |= 0x0008;
    if (param.enroute)
        validTypes |= 0x0010;
    if (param.discover)
        validTypes |= 0x0020;
    if (param.jcb)
        validTypes |= 0x0040;
    if (param.unknown)
        validTypes |= 0x0080;
    if (param.all)
        validTypes = 0x0001 | 0x0002 | 0x0004 | 0x0008 | 0x0010 | 0x0020 | 0x0040 | 0x0080;

    if (validTypes & 0x0001 && /^(5[12345])/.test(value)) { //mastercard
        return value.length == 16;
    }
    if (validTypes & 0x0002 && /^(4)/.test(value)) { //visa
        return value.length == 16;
    }
    if (validTypes & 0x0004 && /^(3[47])/.test(value)) { //amex
        return value.length == 15;
    }
    if (validTypes & 0x0008 && /^(3(0[012345]|[68]))/.test(value)) { //dinersclub
        return value.length == 14;
    }
    if (validTypes & 0x0010 && /^(2(014|149))/.test(value)) { //enroute
        return value.length == 15;
    }
    if (validTypes & 0x0020 && /^(6011)/.test(value)) { //discover
        return value.length == 16;
    }
    if (validTypes & 0x0040 && /^(3)/.test(value)) { //jcb
        return value.length == 16;
    }
    if (validTypes & 0x0040 && /^(2131|1800)/.test(value)) { //jcb
        return value.length == 15;
    }
    if (validTypes & 0x0080) { //unknown
        return true;
    }
    return false;
}, $.lang("LANG2158"));

jQuery.validator.addMethod("iporrange", function(value, element, param) {
    if (this.optional(element)) {
        return true;
    }

    var pieces = value.split("/");
    for (var j = 0; j < pieces.length; j++) {
        if ((/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}$/i.test(pieces[j])) || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(pieces[j]) && ((pieces[j].contains("[") && pieces[j].contains("]")) || (!pieces[j].contains("[") && !pieces[j].contains("]")))) || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(pieces[j])) {
            return true;
        }
    }
    return false;
}, $.lang("LANG2194"));

//both ipv4 and ipv6
jQuery.validator.addMethod("ipAddress", function(value, element, param) {
    return this.optional(element) || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])$/i.test(value) //test ipv4
        || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]")))); //test ipv6
}, $.lang("LANG2195"));

jQuery.validator.addMethod("ipAddressWithoutIpv6", function(value, element, param) {
    return this.optional(element) || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])$/i.test(value); //test ipv4
}, $.lang("LANG2195"));

//both ipv4
jQuery.validator.addMethod("ipv4Address", function(value, element, param) {
    return this.optional(element) || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])$/i.test(value); 
}, $.lang("LANG2195"));


jQuery.validator.addMethod("ipAddressNoBrackets", function(value, element, param) {
    return this.optional(element) || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])$/i.test(value) //test ipv4
        || /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))$/.test(value); //test ipv6
}, $.lang("LANG2195"));

jQuery.validator.addMethod("specialIpAddress", function(value, element, param) {
    return this.optional(element) || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i.test(value) //test ipv4
        || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]"))))
        || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value); //test ipv6
}, $.lang("LANG2195"));

jQuery.validator.addMethod("specialIpAddressNoBrackets", function(value, element, param) {
    return this.optional(element) || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i.test(value) //test ipv4
        || /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value)  //test ipv6
        || /^\d+$/.test(value); 
}, $.lang("LANG2195"));

//both ipv4 and ipv6 ,port is optional // XXX port range is unvalidated
jQuery.validator.addMethod("ipAddressPort", function(value, element, param) {
    return this.optional(element) || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/i.test(value) //test ipv4 port optional
        || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]"))))
        || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value); //test ipv6 with port
}, $.lang("LANG2195"));

//only ipv4  ,port is optional // XXX port range is unvalidated
jQuery.validator.addMethod("ipv4AddressPort", function(value, element, param) {
    return this.optional(element) || /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-4])(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/i.test(value); //test ipv4 port optional
}, $.lang("LANG5135"));

jQuery.validator.addMethod("ipv4", function(value, element, param) {
    return this.optional(element) || /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}$/i.test(value);
}, $.lang("LANG5135"));

jQuery.validator.addMethod("ipv4withcidr", function(value, element, param) {
    return this.optional(element) || /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/([1-9]|[12]\d|3[0-2]?))?$/i.test(value)
           || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\/([1-9]|[1-9]\d|1[0-1]\d|12[0-8]?))?\]?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]"))))
           || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\/([1-9]|[1-9]\d|1[0-1]\d|12[0-8]?))?\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value); //ipv6
}, $.lang("LANG2195"));

jQuery.validator.addMethod("privateIpv4withcidr", function(value, element, param) {
    return this.optional(element) || /^(192)(\.168)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){2}(\/(1[6-9]|2[0-9]|3[0-2]))$/.test(value)
           || /^(172)(\.(1[6-9]|2[0-9]|3[0-1]))(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){2}(\/(1[2-9]|2[0-9]|3[0-2]))$/.test(value)
           || /^(10)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/([8-9]|[12]\d|3[0-2]))$/.test(value);
}, jQuery.validator.messages.privateIpv4withcidr);

jQuery.validator.addMethod("ipv6", function(value, element, param) {
    return this.optional(element) || /^\[?([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\]$|^\[:((:[0-9a-fA-F]{1,4}){1,6}|:)\]$|^\[[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)\]$|^\[([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)\]$|^\[([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)\]$|^\[([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)\]$|^\[([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?\]$|^\[([0-9a-fA-F]{1,4}:){6}:\]?$/.test(value);
}, $.lang("LANG2196"));

jQuery.validator.addMethod("ipv6Port", function(value, element, param) {
    return this.optional(element) || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value);
}, $.lang("LANG2196"));

jQuery.validator.addMethod("ipv6withcidr", function(value, element, param) {
    return this.optional(element) || /^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?(\/([1-9]|[1-9]\d|1[0-1]\d|12[0-8]?))?$/.test(value);
}, $.lang("LANG2196"));

/**
 * Return true if the field value matches the given format RegExp
 *
 * @example jQuery.validator.methods.pattern("AR1004",element,/^AR\d{4}$/)
 * @result true
 *
 * @example jQuery.validator.methods.pattern("BR1004",element,/^AR\d{4}$/)
 * @result false
 *
 * @name jQuery.validator.methods.pattern
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("pattern", function(value, element, param) {
    if (this.optional(element)) {
        return true;
    }

    if (typeof param === 'string') {
        param = new RegExp('^(?:' + param + ')$');
    }

    return param.test(value);
}, $.lang("LANG2139"));

/*
 * Lets you say "at least X inputs that match selector Y must be filled."
 *
 * The end result is that neither of these inputs:
 *
 *  <input class="productinfo" name="partnumber">
 *  <input class="productinfo" name="description">
 *
 *  ...will validate unless at least one of them is filled.
 *
 * partnumber:  {require_from_group: [1,".productinfo"]},
 * description: {require_from_group: [1,".productinfo"]}
 *
 */
jQuery.validator.addMethod("require_from_group", function(value, element, options) {
    var validator = this;
    var selector = options[1];
    var validOrNot = $(selector, element.form).filter(function() {
        return validator.elementValue(this);
    }).length >= options[0];

    if (!$(element).data('being_validated')) {
        var fields = $(selector, element.form);
        fields.data('being_validated', true);
        fields.valid();
        fields.data('being_validated', false);
    }
    return validOrNot;
}, jQuery.format($.lang("LANG2197")));

/*
 * Lets you say "either at least X inputs that match selector Y must be filled,
 * OR they must all be skipped (left blank)."
 *
 * The end result, is that none of these inputs:
 *
 *  <input class="productinfo" name="partnumber">
 *  <input class="productinfo" name="description">
 *  <input class="productinfo" name="color">
 *
 *  ...will validate unless either at least two of them are filled,
 *  OR none of them are.
 *
 * partnumber:  {skip_or_fill_minimum: [2,".productinfo"]},
 *  description: {skip_or_fill_minimum: [2,".productinfo"]},
 * color:       {skip_or_fill_minimum: [2,".productinfo"]}
 *
 */
jQuery.validator.addMethod("skip_or_fill_minimum", function(value, element, options) {
    var validator = this;

    numberRequired = options[0];
    selector = options[1];
    var numberFilled = $(selector, element.form).filter(function() {
        return validator.elementValue(this);
    }).length;
    var valid = numberFilled >= numberRequired || numberFilled === 0;

    if (!$(element).data('being_validated')) {
        var fields = $(selector, element.form);
        fields.data('being_validated', true);
        fields.valid();
        fields.data('being_validated', false);
    }
    return valid;
}, jQuery.format("Please either skip these fields or fill at least {0} of them."));

// Accept a value from a file input based on a required mimetype
jQuery.validator.addMethod("accept", function(value, element, param) {
    // Split mime on commas incase we have multiple types we can accept
    var typeParam = typeof param === "string" ? param.replace(/,/g, '|') : "image/*",
        optionalValue = this.optional(element),
        i, file;

    // Element is optional
    if (optionalValue) {
        return optionalValue;
    }

    if ($(element).attr("type") === "file") {
        // If we are using a wildcard, make it regex friendly
        typeParam = typeParam.replace("*", ".*");

        // Check if the element has a FileList before checking each file
        if (element.files && element.files.length) {
            for (i = 0; i < element.files.length; i++) {
                file = element.files[i];

                // Grab the mimtype from the loaded file, verify it matches
                if (!file.type.match(new RegExp(".?(" + typeParam + ")$", "i"))) {
                    return false;
                }
            }
        }
    }

    // Either return true because we've validated each file, or because the
    // browser does not support element.files and the FileList feature
    return true;
}, jQuery.format("Please enter a value with a valid mimetype."));

// Older "accept" file extension method. Old docs: http://docs.jquery.com/Plugins/Validation/Methods/accept
jQuery.validator.addMethod("extension", function(value, element, param) {
    param = typeof param === "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
    return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
}, jQuery.format($.lang("LANG2198")));

// validate wheather A is bigger than B
jQuery.validator.addMethod("bigger", function(value, element, params) {
    var equal;
    if (params[3]) {
        equal = params[3].equal;
    }
    if (params[2].val() == "" || isNaN(parseInt(params[2].val()))) {
        return this.optional(element) || true;
    } else if (!equal) {
        return this.optional(element) || parseInt(value) >= parseInt(params[2].val());
    } else {
        return this.optional(element) || parseInt(value) > parseInt(params[2].val());
    }
}, jQuery.validator.messages.bigger);

jQuery.validator.addMethod("notEqualTo", function(value, element, params) {
    return this.optional(element) || value !== $(params[1]).val();
}, jQuery.validator.messages.notEqualTo);

// validate wheather A is smaller than B
// modified: less than or equal will pass the validation, if you want restrict equal, using addtional method to validate equality
jQuery.validator.addMethod("smaller", function(value, element, params) {
    if (params[2].val() == "") {
        return this.optional(element) || true;
    } else {
        return this.optional(element) || parseInt(value) <= parseInt(params[2].val());
    }
}, jQuery.validator.messages.smaller);

// validate wheather A Time is smaller than B Time
jQuery.validator.addMethod("smallerTime", function(value, element, params) {
    var startStr = value,
        endStr = params[2].val();

    if (!startStr || !endStr) {
        return this.optional(element) || true;
    } else {

        startStr = startStr.replace(/-/g, '/');
        endStr = endStr.replace(/-/g, '/');

        /*
         * Pengcheng Zou Added.
         * new Date("2012-10-12 01:00:00"); not work in Firefox/IE/Safari but in Chrome.
         * new Date("2012/10/12 01:00:00"); works in all browsers as well.
         */
        var startDate = new Date(startStr.split('/').length > 2 ? startStr : (startStr + '/01')),
            endDate = new Date(endStr.split('/').length > 2 ? endStr : (endStr + '/01'));

        return this.optional(element) || startDate.getTime() <= endDate.getTime();
    }
}, jQuery.validator.messages.smaller);

// validate wheather A Time is bigger than B Time
jQuery.validator.addMethod("biggerTime", function(value, element, params) {
    var endStr = value,
        startStr = params[2].val();

    if (!startStr || !endStr) {
        return this.optional(element) || true;
    } else {

        startStr = startStr.replace(/-/g, '/');
        endStr = endStr.replace(/-/g, '/');

        /*
         * Pengcheng Zou Added.
         * new Date("2012-10-12 01:00:00"); not work in Firefox/IE/Safari but in Chrome.
         * new Date("2012/10/12 01:00:00"); works in all browsers as well.
         */
        var startDate = new Date(startStr.split('/').length > 2 ? startStr : (startStr + '/01')),
            endDate = new Date(endStr.split('/').length > 2 ? endStr : (endStr + '/01'));

        return this.optional(element) || startDate.getTime() <= endDate.getTime();
    }
}, jQuery.validator.messages.bigger);

jQuery.validator.addMethod("ipDns", function(value, element, param) {
    var regIP = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return this.optional(element) || regIP.test(value)
           || /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^:((:[0-9a-fA-F]{1,4}){1,6}|:)$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)$|^([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)$|^([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)$|^([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)$|^([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?$|^([0-9a-fA-F]{1,4}:){6}:$/.test(value);     //IPv6
}, jQuery.validator.messages.ipDns);

jQuery.validator.addMethod("ipv4Dns", function(value, element, param) {
    var regIP = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return this.optional(element) || regIP.test(value);
}, jQuery.validator.messages.ipDns);

jQuery.validator.addMethod("ipv6Dns", function(value, element, param) {
    var regIP = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^:((:[0-9a-fA-F]{1,4}){1,6}|:)$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)$|^([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)$|^([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)$|^([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)$|^([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?$|^([0-9a-fA-F]{1,4}:){6}:$/;
    return this.optional(element) || regIP.test(value);
}, jQuery.validator.messages.ipDns);

jQuery.validator.addMethod("ipDnsSpecial", function(value, element, param) {
    var regIP = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-4])$/;
    return this.optional(element) || regIP.test(value)
            || /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))$/.test(value);
}, jQuery.validator.messages.ipDns);

jQuery.validator.addMethod("mask", function(value, element, param) {
    var regMask = /^(((254|252|248|240|224|192|128|0)\.0\.0\.0)|(255\.(254|252|248|240|224|192|128|0)\.0\.0)|(255\.255\.(254|252|248|240|224|192|128|0)\.0)|(255\.255\.255\.(254|252|248|240|224|192|128|0)))$/;
    return this.optional(element) || regMask.test(value);
}, jQuery.validator.messages.mask);

// domain only , no port
jQuery.validator.addMethod("domain", function(value, element, param) {
    var regex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.domain);

jQuery.validator.addMethod("urlWithoutProtocol", function(value, element, param) {
    return this.optional(element) || /^(((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[A-Z])|(([a-z]|\d|[A-Z])([a-z]|\d|-|\.|_|~|[A-Z])*([a-z]|\d|[A-Z])))\.)+(([a-z]|[A-Z])|(([a-z]|[A-Z])([a-z]|\d|-|\.|_|~|[A-Z])*([a-z]|[A-Z])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/.test(value)
            || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]"))))
            || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value); //ipv6
}, jQuery.validator.messages.urlWithoutProtocol);

// some.domain.com or IP, port is optional
// TODO ipv6 is not supported
jQuery.validator.addMethod("host", function(value, element, param) {
    return this.optional(element) || /^((https?|ftp|news):\/\/)?((([a-zA-Z0-9]([a-zA-Z0-9\-]*[\.])+([a-zA-Z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel))|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])))(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?)(\/[a-zA-Z0-9_\-\.~]+)*(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value)
           || (/^((https?|ftp|news):\/\/)?\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]"))))
           || /^((https?|ftp|news):\/\/)?\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value); //ipv6
}, jQuery.validator.messages.host);

jQuery.validator.addMethod("hostWithoutIpv6", function(value, element, param) {
    return this.optional(element) || /^((https?|ftp|news):\/\/)?((([a-zA-Z0-9]([a-zA-Z0-9\-]*[\.])+([a-zA-Z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel))|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])))(\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?)(\/[a-zA-Z0-9_\-\.~]+)*(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value);
}, jQuery.validator.messages.host);

jQuery.validator.addMethod("hostWithoutPort", function(value, element, param) {
    return this.optional(element) || /^((https?|ftp|news):\/\/)?((([a-zA-Z0-9]([a-zA-Z0-9\-]*[\.])+([a-zA-Z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel))|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))))(\/[a-zA-Z0-9_\-\.~]+)*(\/([a-zA-Z0-9_\-\.]*)(\?[a-zA-Z0-9+_\-\.%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/.test(value)
            || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]"))))
            || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value); //ipv6
}, jQuery.validator.messages.host);

jQuery.validator.addMethod("specialhost", function(value, element, param) {
    return this.optional(element) || /^((([hH][Tt][Tt][Pp][Ss])|(([Tt][Ff]|[Ff]|[Hh][Tt])[Tt][Pp])):\/\/)?(((([a-z]|\d|-|\.|~|[A-Z])|(%[\da-f]{2})|[\-\.])*)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[A-Z])|(([a-z]|\d|[A-Z])([a-z]|\d|-|\.|~|[A-Z])*([a-z]|\d|[A-Z])))\.)+(([a-z]|[A-Z])|(([a-z]|[A-Z])([a-z]|\d|-|\.|~|[A-Z])*([a-z]|[A-Z]|\d)))\.?)(:\d*)?)$/.test(value)
            || (/^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/.test(value) && ((value.contains("[") && value.contains("]")) || (!value.contains("[") && !value.contains("]"))))
            || /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/.test(value);
}, jQuery.validator.messages.host);

jQuery.validator.addMethod("custom_tz", function(value, element, param) {
    return this.optional(element) || /^[\w\+,.\d]*$/.test(value);
}, jQuery.validator.messages.custom_tz);

jQuery.validator.addMethod("preip", function(value, element, param) {

    var gateway = $(param[0]).val().split('.');
    var newip = value.split('.');

    gateway = gateway[0] + '.' + gateway[1] + '.' + gateway[2];
    newip = newip[0] + '.' + newip[1] + '.' + newip[2];

    return this.optional(element) || gateway == newip;
}, jQuery.validator.messages.preip);

// validate wheather A is bigger than B,use to cmpare string
jQuery.validator.addMethod("strbigger", function(value, element, params) {

    var str1 = value;
    var str2 = params[2].val();

    if (str2 == "" || str1 == "") {
        return this.optional(element) || str2 == "";
    } else if (str1.length != str2.length) {
        return this.optional(element) || (str1.length > str2.length);
    } else {
        return this.optional(element) || str1 >= str2;
    }
}, jQuery.validator.messages.bigger);

jQuery.validator.addMethod("mac", function(value, element, params) {
    var reg = /^([0-9a-fA-F]{2})(([0-9a-fA-F]{2}){5})$/;
    return this.optional(element) || reg.test(value);
}, jQuery.validator.messages.mac);

jQuery.validator.addMethod("selectItemMin", function(value, element, param) {
    if (!Number(param)) {
        return true;
    }
    var length = element.length;
    return length >= Number(param);
}, jQuery.validator.messages.selectItemMin);

jQuery.validator.addMethod("selectItemMax", function(value, element, param) {
    if (!param || !Number(param[0])) {
        return true;
    }
    var length = element.length;
    return !length || length <= Number(param[0]);
}, jQuery.validator.messages.selectItemMax);

jQuery.validator.addMethod("extensionRange", function(value, element, param) {

    if (this.optional(element)) {
        return true;
    }

    if (param.length < 2) {
        return true;
    }

    return ASTGUI.miscFunctions.isExtensionInRange(value, param[0], param[1]);

}, jQuery.validator.messages.extensionRange);

/*
    jQuery.validator.addMethod("extensionRange", function(value, element, param) {

        if (this.optional(element)) {
            return true;
        }

        if (param.length < 2) {
            return true;
        }

        var tmp = ASTGUI.miscFunctions.isExtensionInRange(value, param[0], param[1]);
        if(!tmp) {
            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2170") + $P.lang("LANG843").format("General"),
                buttons: {
                    ok: function () {
                        top.module.jumpMenu('preferences.html');
                    },
                    cancel: function () {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                }
            });
        }

        return tmp;
    }, jQuery.validator.messages.extensionRange);
*/

//param  ['6002', '6003'] as exception
jQuery.validator.addMethod("extensionExists", function(value, element, param) {

    if (param instanceof Array) {
        //expcetion case, pass directly
        if (param.contains(value)) {
            return true;
        }
    }

    return this.optional(element) || !parent.miscFunctions.ifExtensionAlreadyExists(value);
}, jQuery.validator.messages.extensionExists);

/*
jQuery.validator.addMethod("selectItemMin", function(value, element, param) {
    var length = element.length || 0;
    return this.optional(element) || length <= param;
}, jQuery.validator.messages.selectItemMin);
*/

//the possibility to hit the case is pretty low
jQuery.validator.addMethod("selectMemberLength", function(value, element, param) {

    var TEMP_members = UCMGUI.domFunction.selectbox.getOptsVal(element);
    return TEMP_members.join('-').length <= Number(param);

    // return this.optional(element) || Number(param) < 200;
}, $.lang("LANG2199"));

jQuery.validator.addMethod("numeric_pound_star", function(value, element, param) {
    return this.optional(element) || /^[0-9#\*]+$/i.test(value);
}, jQuery.validator.messages.numeric_pound_star);

jQuery.validator.addMethod("dialpattern", function(value, element, param) {
    var str = value.split('\n');

    for (var i = 0; i < str.length; i++) {
        if (/[^a-zA-Z_0-9\#\*\.!\[\]\-\+\/]/.test(str[i])) {
            return false;
        }
    }

    // return this.optional(element) || !/[^a-zA-Z_0-9\#\*\.!\[\]\-\+]/.test(value);
    // return this.optional(element) || !/[^a-zA-Z_0-9\#\*\.!\[\]\-\+\/]/.test(value);
    return true;
}, jQuery.validator.messages.dialpattern);

jQuery.validator.addMethod("dialpattern_additional", function(value, element, param) {
    var res = false,
        str = value.split('\n');

    for (var i = 0; i < str.length; i++) {
        var off1 = str[i].indexOf('['),
            off2 = str[i].indexOf(']');

        if (off1 > -1 && off1 < off2) {
            res = true;
            var str = str[i],
                pos = str.indexOf('-');

            while (pos > -1) {
                var v1 = str[pos - 1],
                    v2 = str[pos + 1];

                if (pos < 2) {
                    return false;
                }
                if (/[^0-9a-zA-Z]/.test(v1) || /[^0-9a-zA-Z]/.test(v2)) {
                    return false;
                }
                if ((/[0-9]/.test(v1) && /[0-9]/.test(v2)) && v1 > v2) {
                    return false;
                }
                if ((/[a-z]/.test(v1) && /[a-z]/.test(v2)) && v1 > v2) {
                    return false;
                }
                if ((/[A-Z]/.test(v1) && /[A-Z]/.test(v2)) && v1 > v2) {
                    return false;
                }
                if ((/[0-9]/.test(v1) && /[^0-9]/.test(v2)) ||
                    (/[^0-9]/.test(v1) && /[0-9]/.test(v2))) {
                    return false;
                }
                if ((/[a-z]/.test(v1) && /[^a-z]/.test(v2)) ||
                    (/[A-Z]/.test(v1) && /[^A-Z]/.test(v2))) {
                    return false;
                }
                str = str.substr(pos + 1);
                pos = str.indexOf('-');
            }
        } else if (off1 == -1 && off2 == -1) {
            res = true;
        }
    }

    return res;
}, jQuery.validator.messages.dialpattern);

jQuery.validator.addMethod("keyboradNoSpace", function(value, element, param) {
    var regex = /^([a-zA-Z0-9,\.\/<>\?;':"\[\]\\\{\}\|`~!@#\$%\^&\*\(\)\-_=\+]*)$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.keyboradNoSpace);

jQuery.validator.addMethod("keyboradNoSpaceSpecial", function(value, element, param) {
    var regex = /^([a-zA-Z0-9,\.\/<>\?;':\[\]\\\{\}\|~!@#\$%\^&\*\(\)\-_=\+]*)$/;
    return this.optional(element) || regex.test(value);
}, $.lang("LANG5212"));

jQuery.validator.addMethod("authid", function(value, element, param) {
    var regex = /^([a-zA-Z0-9\.'\|`~!#\$%\^&\*\-_\+]*)$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.authid);

jQuery.validator.addMethod("specialauthid", function(value, element, param) {
    var regex = /^([a-zA-Z0-9,\.\/':\?~!\$\&\*\(\)\-_=\+]*)$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.specialauthid);

jQuery.validator.addMethod("specialauthid1", function(value, element, param) {
    var regex = /^([a-zA-Z0-9\.\|`~!#\$%\^\*\-_\+\@]*)$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.specialauthid1);

jQuery.validator.addMethod("keyboradNoSpacesemicolon", function(value, element, param) {
    var regex = /^([a-zA-Z0-9~!@#\$%\^\*]*)$/;
    return this.optional(element) || regex.test(value);
}, $.lang("LANG4475"));

jQuery.validator.addMethod("keyboradNoSpacesemicolon1", function(value, element, param) {
    var regex = /^([a-zA-Z0-9~!+@%\*]*)$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.keyboradNoSpaceSem1);

jQuery.validator.addMethod("letterDigitUndHyphen", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z0-9_\-]+$/.test(value);
}, $.lang("LANG2200"));

jQuery.validator.addMethod("calleridSip", function(value, element, param) {
    var regex = /^([a-zA-Z0-9_\+\*#\-\.]*)$/;
    return this.optional(element) || regex.test(value);
}, $.lang("LANG5031"));

jQuery.validator.addMethod("specailCalleridSip", function(value, element, param) {
    var regex = /^([a-zA-Z0-9_\+\*#\-\.<>]*)$/;
    return this.optional(element) || (regex.test(value) && ((value.contains("<") && value.contains(">") && /\>$/.test(value)) || (!value.contains("<") && !value.contains(">"))));
}, $.lang("LANG5375"));

// param: [ 'patterName', jQueryDOM ]
jQuery.validator.addMethod("stripMax", function(value, element, param) {
    if (this.optional(element)) {
        return true;
    }

    var tagName = param[1].prop('tagName');

    if (tagName.toLowerCase() == "table") {
        var pattern = param[1].find('#match0').val(),
            min_pattern = pattern;

        param[1].find('input[position="left"]').each(function(index) {
            var val = $(this).val();

            if (val && (val.length < min_pattern.length)) {
                min_pattern = $(this).val();
            }
        });
    } else if (tagName.toLowerCase() == "textarea") {
        var pattern = param[1].val().split('\n'),
            min_pattern = pattern[0];

        for (var i = 1; i < pattern.length; i++) {
            if (pattern[i] && (pattern[i].length < min_pattern.length)) {
                min_pattern = pattern[i];
            }
        }
    } else {
        var pattern = param[1].val(),
            min_pattern = pattern;

        if (!pattern) {
            return true;
        }
    }

    var rpl_char = '~',
        substring = min_pattern.replace(/\[.+?\]/g, rpl_char);

    substring = substring.replace(/!|-/g, '');
    substring = substring.match(/[\da-zA-Z*.+#~]+/);

    if (!substring) {
        return true;
    }

    var prepend = param[2] ? param[2][0].value : '';

    if (prepend) {
        return Number(value) <= substring[0].length;
    } else {
        return Number(value) < substring[0].length;
    }

}, jQuery.validator.messages.stripMax);

jQuery.validator.addMethod("tcptlsportdiff", function(value, element, param) {
    if (param[0].val().split(":")[1] != null && param[0].val().split(":")[1] == param[1].val().split(":")[1]) {
        return false;
    }

    return true;
}, $.lang("LANG2201"));

jQuery.validator.addMethod("tcptlsIPv6portdiff", function(value, element, param) {
    if (param[0].val().split("]:")[1] != null && param[0].val().split("]:")[1] == param[1].val().split("]:")[1]) {
        return false;
    }

    return true;
}, $.lang("LANG5129"));

// param[0] errmsg , param[1] callback function(value, element)
jQuery.validator.addMethod("customCallback", function(value, element, param) {
    var callback = param[1];

    if (typeof callback !== 'function') {
        return true;
    }

    return callback(value, element);
}, "{0}");

// you can use multiple customCallback functions in a validation rule.
jQuery.validator.addMethod("customCallback1", function(value, element, param) {
    var callback = param[1];

    if (typeof callback !== 'function') {
        return true;
    }

    return callback(value, element);
}, "{0}");

jQuery.validator.addMethod("customCallback2", function(value, element, param) {
    var callback = param[1];

    if (typeof callback !== 'function') {
        return true;
    }

    return callback(value, element);
}, "{0}");

jQuery.validator.addMethod("customCallback3", function(value, element, param) {
    var callback = param[1];

    if (typeof callback !== 'function') {
        return true;
    }

    return callback(value, element);
}, "{0}");

jQuery.validator.addMethod("customCallback4", function(value, element, param) {
    var callback = param[1];

    if (typeof callback !== 'function') {
        return true;
    }

    return callback(value, element);
}, "{0}");

jQuery.validator.addMethod("isExist", function(value, element, param) {
    var callback = param[1];

    if (typeof callback !== 'function') {
        return true;
    }

    return callback(element);
}, "{0}");

jQuery.validator.addMethod("isLimitsExist", function(value, element, param) {
    var showMsg = param[0],
        callback = param[1];

    if (typeof callback !== 'function') {
        return true;
    }

    return callback();
}, $.lang("LANG2390"));

jQuery.validator.addMethod("outgoingRuleNameExists", function(value, element, param) {
    if (this.optional(element)) {
        return true;
    }

    if (param instanceof Array) {
        // expcetion case, pass directly
        if (param.contains("outrt_" + value)) {
            return true;
        }
    }

    var tmp_data = parent.sessionData.pbxinfo.callingRules;

    value = value.toLowerCase();

    if (tmp_data.hasOwnProperty("outrt_" + value)) {
        return false;
    }

    return true;

}, jQuery.validator.messages.outgoingRuleNameExists);

jQuery.validator.addMethod("voicemenuExists", function(value, element, param) {
    var m = parent.sessionData.pbxinfo.voicemenus,
        exist = 0;

    for (l in m) {
        if (m.hasOwnProperty(l)) {
            if (param[0] == "add" && parent.sessionData.pbxinfo.voicemenus[l].getProperty('comment') == value) {
                exist = 1;
            }
            if (param[0] == "edit" && l != param[1] && parent.sessionData.pbxinfo.voicemenus[l].getProperty('comment') == value) {
                exist = 1;
            }
        }
    }

    return this.optional(element) || exist == 0;
}, jQuery.validator.messages.voicemenuExists);

jQuery.validator.addMethod("voicemenuKey", function(value, element, param) {
    return param[0].length != 0;
}, jQuery.validator.messages.voicemenuKey);

jQuery.validator.addMethod("cmpareRingtime", function(value, element, param) {
    var ringtime = param[0],
        res = true;

    if (Number(value) > Number(ringtime ? ringtime : '60')) {
        res = false;
    }

    return this.optional(element) || res;
}, $.lang("LANG2202"));

jQuery.validator.addMethod("alphanumericUnd", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z_0-9]+$/i.test(value);
}, $.lang("LANG2203"));

jQuery.validator.addMethod("alphanumericSpace", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z0-9 ]+$/i.test(value);
}, $.lang("LANG2204"));

jQuery.validator.addMethod("alphanumericUndSpace", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z_0-9\- ]+$/i.test(value);
}, $.lang("LANG2205"));

jQuery.validator.addMethod("digitsNumPoint", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z0-9\.]+$/i.test(value);
}, $.lang("LANG2467"));

jQuery.validator.addMethod("alphanumericStarPlusPound", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z0-9#\*\+]+$/g.test(value);
}, $.lang("LANG3842"));

jQuery.validator.addMethod("alphanumericUndDotAt", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z_0-9@.]+$/i.test(value);
}, $.lang("LANG4537"));

/*
 * Pengcheng Zou Added for Bug 35400、35291.
 */
jQuery.validator.addMethod("faxNumber", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z0-9#\*\+\-]+$/i.test(value);
}, $.lang("LANG4127"));
jQuery.validator.addMethod("faxFileName", function(value, element, param) {
    return this.optional(element) || /^[a-zA-Z0-9_\-\.]+$/g.test(value);
}, $.lang("LANG4128"));
/* -------- End -------- */

jQuery.validator.addMethod("gain", function(value, element, param) {
    return this.optional(element) || (/^(-|\+)?[0-9]*\.?[0-9]*$/i.test(value)) && parseFloat(value) >= parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1]);
}, $.lang("LANG2206"));

jQuery.validator.addMethod("serveremail", function(value, element, param) {
    return this.optional(element) || value.match(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/);
}, jQuery.validator.messages.email);

jQuery.validator.addMethod("numberOrExtension", function(value, element, param) {
    var regex = /^([0-9#\*\+]*)$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.numberOrExtension);

jQuery.validator.addMethod("phoneNumberOrExtension", function(value, element, param) {
    var regex = /^([a-zA-Z0-9#\*\-\+]*)$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.phoneNumberOrExtension);

jQuery.validator.addMethod("callerid", function(value, element, param) {
    var regex = /^([\dA-Za-z\-\_\.\!\~\*\'()\&\=\+\$\,\?\/]|%[0-9a-fA-F][0-9a-fA-F])*$/;
    return this.optional(element) || regex.test(value);
}, jQuery.validator.messages.callerid);

jQuery.validator.addMethod("checkSameNetworkSegment", function(value, element, param) {
    /* add the "0" to str , the length of str is 8 */
    var tenTotwo = function(str) {
        str = parseInt(str, 10).toString(2);
        for (i = str.length; i < 8; i = str.length) {
            str = "0" + str;
        }
        return str;
    }

    var res = true;
    var ip1 = value.split(".");
    var ip2 = param[0].val().split(".");
    var mask = param[1].val().split(".");

    ip1 = tenTotwo(ip1[0]) + tenTotwo(ip1[1]) + tenTotwo(ip1[2]) + tenTotwo(ip1[3]);
    ip2 = tenTotwo(ip2[0]) + tenTotwo(ip2[1]) + tenTotwo(ip2[2]) + tenTotwo(ip2[3]);
    mask = tenTotwo(mask[0]) + tenTotwo(mask[1]) + tenTotwo(mask[2]) + tenTotwo(mask[3]);

    ip1 = ip1.split("");
    ip2 = ip2.split("");
    mask = mask.split("");

    for (i = 0; i < 32; i++) {
        if ((ip1[i] & mask[i]) != (ip2[i] & mask[i])) {
            res = false;
            break;
        }
    }

    return this.optional(element) || res;
}, jQuery.validator.messages.checkSameNetworkSegment);

jQuery.validator.addMethod("differentEmails", function(value, element, param) {
    var emailAddresses = param[0].find('input[type="text"]'),
        different = true,
        address = value;

    emailAddresses.not(element).each(function() {
        if ($(this).is(element)) {
            different = false;
        }
        if ($(this).val() === address) {
            different = false;
        }
    });

    return this.optional(element) || different;
}, $.lang("LANG2624"));

jQuery.validator.addMethod("multiEmail", function(value, element, param) {
    var regexMultiEmail = /^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@(([-a-zA-Z0-9])+\.)+([a-zA-Z]{2,4})+)(;[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@(([-a-zA-Z0-9])+\.)+([a-zA-Z]{2,4})+)*$/;

    return this.optional(element) || regexMultiEmail.test(value);
}, $.lang("LANG2152"));

jQuery.validator.addMethod("differentIPs", function(value, element, param) {
    var localnetTable = param[0].find('input[position="left"]'),
        different = true,
        ip = value;

    localnetTable.each(function() {
        if ($(this).is(element)) {
            different = true;
            return false;
        }

        var thisValue = $(this).val(),
            thisRightValue = $(this).closest('tr').find('[position="right"]').val(),
            eleRightValue = $(element).closest('tr').find('[position="right"]').val();

        if ((thisValue === ip) && (thisRightValue == eleRightValue)) {
            if (thisValue == '0.0.0.0' && thisRightValue == '0.0.0.0') {
                different = true;
            } else {
                different = false;
            }

            return false;
        }
    });

    return this.optional(element) || different;
}, $.lang("LANG2816"));

jQuery.validator.addMethod("differentPatterns", function(value, element, param) {
    var str = value.toLocaleLowerCase().split(param[0] ? param[0] : '\n'),
        different = true,
        pattern = '';

    for (var j = 0; j < str.length; j++) {
        pattern = $.trim(str[j]);

        if (!pattern) {
            continue;
        }

        for (var i = 0; i < str.length; i++) {
            var thisValue = $.trim(str[i]);

            if (i == j) {
                continue;
            }

            if (!thisValue) {
                continue;
            }

            var tureValue = (thisValue[0] == '_' ? thisValue.slice(1, thisValue.length) : thisValue);

            pattern = (pattern[0] == '_' ? pattern.slice(1, pattern.length) : pattern);

            if (tureValue === pattern) {
                different = false;
                return false;
            }
        }
    }

    return this.optional(element) || different;
}, $.lang("LANG2992"));

jQuery.validator.addMethod("checkAlphanumericPw", function(value, element, param) {
    var callback = param[0];
    if (typeof callback !== 'function') {
        return true;
    }
    return callback(param[1]);
}, jQuery.validator.messages.checkAlphanumericPw);

jQuery.validator.addMethod("checkNumericPw", function(value, element, param) {
    var callback = param[0];
    if (typeof callback !== 'function' || !value) {
        return true;
    }
    return callback(param[1]);
}, jQuery.validator.messages.checkNumericPw);

jQuery.validator.addMethod("identical", function(value, element, param) {
    var res = true;
    var ele = param[2];
    if ($.isArray(ele)) {
        for (var i = 0; i < ele.length; i++) {
            if (value == ele[i]) {
                res = false;
            }
        }
    } else {
        var val = param[2].val();
        if (value == val) {
            res = false;
        }
    }
    return this.optional(element) || res;
}, jQuery.validator.messages.identical);

jQuery.validator.addMethod("isRequiredOrNot", function(value, element, param) {
    var length = param[0].find('input[type="text"]').length,
        empty = true;

    if (length > 1 && value === "") {
        empty = false;
    }

    return empty;
}, $.lang("LANG2150"));

jQuery.validator.addMethod("userName", function(value, element, param) {
    var userName = /^[a-zA-Z_0-9]+$/;

    return this.optional(element) || userName.test(value);
}, $.lang("LANG2831"));

jQuery.validator.addMethod("userPassword", function(value, element, param) {
    var userPassword = /^[a-zA-Z_0-9]+$/;

    return this.optional(element) || userPassword.test(value);
}, $.lang("LANG2832"));

jQuery.validator.addMethod("fullName", function(value, element, param) {
    var fullName = /^([\u4e00-\u9fa5]|[\ufe30-\uffa0]|[a-zA-Z0-9_])+$/;

    return this.optional(element) || fullName.test(value);
}, $.lang("LANG2833"));

// jQuery.validator.addMethod("homeNumber", function(value, element, param) {
//     var homeNumber = /^(?:\(?[0\+]\d{2,3}\)?)[\s-]?(?:(?:\(0{1,3}\))?[0\d]{1,4})[\s-](?:[\d]{7,8}|[\d]{3,4}[\s-][\d]{3,4})$/;

//     return this.optional(element) || homeNumber.test(value);
// }, $.lang("LANG2832"));

// jQuery.validator.addMethod("phoneNumber", function(value, element, param) {
//     var phoneNumber = /^(?:\(?[0\+]?\d{1,3}\)?)[\s-]?(?:0|\d{1,4})[\s-]?(?:(?:1[3|4|5|8]\d{9})|(?:\d{7,8}))$/;

//     return this.optional(element) || phoneNumber.test(value);
// }, $.lang("LANG2833"));

jQuery.validator.addMethod("startWithUnderline", function(value, element, param) {
    var fullName = /^_([a-zA-Z0-9_])*$/;

    return this.optional(element) || fullName.test(value);
}, $.lang("LANG2697"));

jQuery.validator.addMethod("pppoeSecret", function(value, element, param) {
    var secret = /^[^`|^"]*$/;

    return this.optional(element) || secret.test(value);
}, $.lang("LANG2996"));

jQuery.validator.addMethod("cidName", function(value, element, param) {
    var fullName = /^[^"@:;)(,]*$/;

    return this.optional(element) || fullName.test(value);
}, $.lang("LANG3198"));

jQuery.validator.addMethod("cidNameSpecial", function(value, element, param) {
    var fullName = /^[^"@:;)(,<>\[\]]*$/;

    return this.optional(element) || fullName.test(value);
}, $.lang("LANG5210"));

jQuery.validator.addMethod("specialStr", function(value, element, param) {
    var fullName = /^[^#]*$/;

    return this.optional(element) || fullName.test(value);
}, $.lang("LANG5140"));

jQuery.validator.addMethod("specialCidName", function(value, element, param) {
    var fullName = /^[^"@:;)(,!$%\^&*（）_+<>\\]*$/;

    return this.optional(element) || fullName.test(value);
}, $.lang("LANG5091"));

jQuery.validator.addMethod("digitalAndQuote", function(value, element, param) {
    var fullName = /^\d+(,\d+)*(,)?$/;

    return this.optional(element) || fullName.test(value);
}, $.lang("LANG3822"));

jQuery.validator.addMethod("noEmptyLine", function(value, element, param) {
    var notHaveEmptyLine = true;

    if (value) {
        var list = value.split('\n'),
            length = list.length;

        for (var i = 0; i < length; i++) {
            if (!list[i] && list[i] != "") {
                notHaveEmptyLine = false;

                break;
            }
        }
    }

    return notHaveEmptyLine;
}, $.lang("LANG4147"));

jQuery.validator.addMethod("noSpaces", function(value, element, param) {
    if (/\s/g.test(value)) {
        return false;
    }

    return true;
}, $.lang("LANG2818"));

jQuery.validator.addMethod("noSpacesInFrontAndEnd", function(value, element, param) {
    if (/^\s+|\s+$/g.test(value)) {
        return false;
    }

    return true;
}, $.lang("LANG4113"));

jQuery.validator.addMethod("versionNum", function(value, element, params) {
    var reg = /^([a-zA-Z0-9]+\.?)*$/;

    return this.optional(element) || reg.test(value);
}, jQuery.validator.messages.versionNum);

jQuery.validator.addMethod("minValue", function(value, element, params) {
    var val = parseInt(value);

    return this.optional(element) || val >= params;
}, jQuery.validator.messages.minValue);

jQuery.validator.addMethod("PRIDODNumber", function(value, element, params) {
    var reg = /^([0-9#\*]*)$/;

    return this.optional(element) || reg.test(value);
}, $.lang("LANG4758"));

jQuery.validator.addMethod("SS7DODNumber", function(value, element, params) {
    var reg = /^([ABCDEFabcdef0-9#\*]*)$/;

    return this.optional(element) || reg.test(value);
}, $.lang("LANG4759"));

jQuery.validator.addMethod("digitsWithHyphen", function(value, element, params) {
    var reg = /^(\+?\d+\-?\d+)$/;

    return this.optional(element) || reg.test(value);
}, $.lang("LANG4962"));

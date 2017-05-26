/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

/*
 * Array
 * Some custom methods to Array Objects
 */
Array.prototype.replaceAB = function(a, b) { // return new array with all instances of a replaced with b
    var x = [];
    for (var i = 0, j = this.length; i < j; i++) {
        if (this[i] === a) {
            x.push(b);
        } else {
            x.push(this[i]);
        }
    }
    return x;
};

if (!Array.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    }
}

Array.prototype.lastValue = function() {
    // [0,1,2]
    return (this.length) ? this[this.length - 1] : null;
};

Array.prototype.replaceLastWith = function(a) {
    if (this.length) {
        this[this.length - 1] = a;
    }
}

Array.prototype.contains = function(str) {
    return this.indexOf(str) != -1;
};

Array.prototype.containsLike = function(str) {
    return this.indexOfLike(str) != -1;
};

/*
 * This cannot be used if you need to return from the calling
 * function early. The return statement will return from this
 * anonymous function instead.
 * This method can also introduce race conditions if you use
 * the array right after calling it.
 */
Array.prototype.each = function(iterator) {
    for (var i = 0, j = this.length; i < j; i++) {
        iterator(this[i], i);
    }
};

Array.prototype.forEach = function(iterator) { // call a function on each element and update the element with the returned value
    var i = this.length;
    while (i--) {
        this[i] = iterator(this[i], i);
    }
};

Array.prototype.firstAvailable = function(start) {
    start = (!start) ? "1" : start;
    if (!this.length) {
        return start;
    }
    var x = [];
    for (var y = 0; y < this.length; y++) {
        var NT = this[y];
        if (NT < start) {
            continue;
        }
        x.push(NT);
    }
    if (!x.length) {
        return start;
    }
    while (true) {
        if (x.contains(start)) {
            start = bigNumAdd(start);
        } else {
            return start;
        }
    }
};

Array.prototype.removeFirst = function() { // opposite of push - removes the first element of the array
    this.splice(0, 1);
};

Array.prototype.removeLast = function() { // removes the last element of the array
    this.pop();
};

Array.prototype.indexOfLike = function(searchString) {
    if (!searchString.length) {
        return -1;
    }
    for (var i = 0; i < this.length; i++) {
        if (this[i].beginsWith(searchString)) {
            return i;
        }
    }
    return -1;
};

Array.prototype.lastIndexOfLike = function(searchString) {
    if (!searchString.length) {
        return -1;
    }
    var i = this.length;
    while (i--) {
        if (typeof this[i] == 'string' && this[i].beginsWith(searchString)) {
            return i;
        }
    }
    return -1;
};

Array.prototype.push_IfNotPresent = function(a) {
    if (!this.contains(a)) this.push(a);
};

Array.prototype.sortNumbers = function() {
    return this.sort(function(a, b) {
        return a - b
    });
};

Array.prototype.sortExtension = function() {
    return this.sort(function(a, b) {
        if (a.length !== b.length) {
            return a.length - b.length;
        }

        var leftNum = parseInt(a, 10);
        var rightNum = parseInt(b, 10);
        return leftNum - rightNum;
    });
};

Array.prototype.withOut = function(e) {
    var x = [];
    if (typeof e == 'string' || typeof e == 'number') {
        var y = [e];
    } else if (e instanceof Array) {
        var y = e;
    } else {
        return this;
    }

    for (var a = 0; a < y.length; a++) {
        var b = y[a];
        for (var i = 0, j = this.length; i < j; i++) {
            if (!(this[i] === b) && !y.contains(this[i]) && !x.contains(this[i])) {
                x.push(this[i]);
            }
        }
    }

    return x;
};

Array.prototype.isArray = function() {
    return this != null && typeof this == "object" &&
        'splice' in this && 'join' in this;
};

// Array Remove 
// - By John Resig (MIT Licensed)
Array.prototype.removeAt = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
// different version of the remove to remove the selected item
Array.prototype.removeItem = function(item) {
    var idx = this.indexOf(item);
    if (idx > -1)
        return this.removeAt(idx);
    else
        return this.length;
};
// END

Array.prototype.remove = function(e) {
    if (this.isArray()) {
        if (typeof e == "string" || typeof e == "number") {
            var index = this.indexOf(e);
            if (index != -1) {
                this.splice(index, 1);
            }
        } else {
            var me = this;
            e.each(function(i) {
                var index = me.indexOf(i);
                if (index != -1) {
                    me.splice(index, 1);
                }
            });
        }
        return this;
    }
};

Array.prototype.copy = function(destination) {
    var me = this;
    var getType = function(o) {
        var _t;
        return ((_t = typeof(o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
    }
    for (var p in me) {
        if (getType(me[p]) == "array" || getType(me[p]) == "object") {
            destination[p] = getType(me[p]) == "array" ? [] : {};
            arguments.callee(destination[p], me[p]);
        } else {
            destination[p] = me[p];
        }
    }
    return destination;
};

Array.prototype.sortBy = function(item) {
    var by = function(name) {
        return function(o, p) {
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            } else {
                throw ("error");
            }
        }
    };

    return this.sort(by(item));
};

Array.prototype.existsSameValues = function(arr) {
    var exists = false;
    if (this.isArray() && arr.isArray()) {
        for (var i = 0, iLen = this.length; i < iLen; i++) {
            for (var j = 0, jLen = arr.length; j < jLen; j++) {
                if (this[i] === arr[j]) {
                    return true;
                }
            }
        }
    }
    return exists;
};

/*
 * String
 * String Manipulation, and other custom methods for String Objects
 */
String.prototype.addZero = function() {
    return (Number(this) < 10) ? "0" + this : this;
};

String.prototype.afterChar = function(k) {
    if (k.length > 1) {
        alert('String.afterChar() should be used with a single character');
        return null;
    }
    var v = this.indexOf(k);
    if (v == -1) {
        return '';
    }
    return this.substring(v + 1);
};

String.prototype.afterStr = function(x) {
    if (!this.contains(x)) {
        return '';
    }
    if (x.length == 1) {
        return this.afterChar(x);
    }
    var pos = this.indexOf(x) + x.length;
    return this.substr(pos);
};

String.prototype.beforeChar = function(k) {
    if (k.length > 1) {
        alert('String.beforeChar() should be used with a single character');
        return null;
    }
    var v = this.indexOf(k);
    if (v == -1) {
        return '';
    }
    return this.substring(0, v);
};

String.prototype.beforeStr = function(x) {
    var r = this.afterStr(x);
    return this.withOut(x + r);
};

String.prototype.beginsWith = function(a) {
    return this.length >= a.length && this.substring(0, a.length) == a
};

String.prototype.betweenXY = function(X, Y) {
    if (X.length > 1 || Y.length > 1) {
        alert('String.betweenXY() accepts single character arguments');
        return null;
    }
    var t = this.afterChar(X);
    return t.beforeChar(Y);
};

String.prototype.bold_X = function(x) {
    if (x == '') {
        return this;
    }
    var position = this.toLowerCase().indexOf(x.toLowerCase());
    if (position == -1) {
        return this;
    }
    var c = this.substr(position, x.length);
    return this.replace(c, "<B>" + c + "</B>", "");
};

String.prototype.camelize = function() {
    var parts = this.split(' '),
        len = parts.length;
    var camelized = '';
    for (var i = 0; i < len; i++)
        camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1) + ' ';
    return camelized;
};

String.prototype.capitalizeFirstChar = function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};

String.prototype.contains = function(a) {
    return this.indexOf(a) != -1;
};

String.prototype.endsWith = function(a) {
    return this.length >= a.length && this.substring(this.length - a.length) == a
};

String.prototype.escapeHTML = function() {
    var a = document.createTextNode(this);
    var b = document.createElement('div');
    b.appendChild(a);
    return b.innerHTML;
};

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

String.prototype.isAstTrue = function() {
    return ["yes", "true", "y", "t", "1", "on"].contains(this.toLowerCase().trim());
};

String.prototype.getNoOp = function() {
    return (this.toLowerCase().indexOf('noop(') == -1) ? '' : this.betweenXY('(', ')'); // todo: handle multiple ')'s
};

String.prototype.getSetName = function() {
    return (this.toLowerCase().indexOf('setname=') == -1) ? '' : this.substring(this.toLowerCase().indexOf('setname=')).betweenXY('=', ')'); // todo: handle multiple ')'s
};

String.prototype.guiMetaData = function() {
    return this;
};

String.prototype.isValueInBetween = function(a, b) {
    a = Number(a);
    b = Number(b);
    var c = Number(this),
        a1 = Math.min(a, b),
        b1 = Math.max(a, b);

    return (c >= a1 && c <= b1) ? true : false;
};

String.prototype.lChop = function(c) { // chop a string from the beginning of the string
    if (this.beginsWith(c)) {
        return this.substr(c.length);
    }
    return this;
};

String.prototype.rChop = function(c) { // chop a string from the end of the string
    if (this.indexOf(c) == -1 || !this.endsWith(c)) {
        return String(this); //actually we should be doing 'return this;' but for some reason firebug is reporting the returned string as an object
    }
    return this.substr(0, this.length - c.length);
};

String.prototype.replaceXY = function(X, Y) {
    return this.split(X).join(Y);
};

String.prototype.nl2br = function() { // replace new lines with <BR>
    return this.split('\n').join('<BR>');
};

String.prototype.times = function(a) {
    return (a < 1) ? '' : new Array(a + 1).join(this);
};

String.prototype.stripTags = function() {
    return this.replace(/<\/?[^>]+>/gi, '');
};

String.prototype.trim = function() {
    /* Thanks to Steve Levithan (http://stevenlevithan.com) for this code */
    var str = this.replace(/^\s\s*/, ''),
        ws = /\s/,
        i = str.length;
    while (ws.test(str.charAt(--i)));
    return str.slice(0, i + 1);
};

String.prototype.withOut = function(k) {
    return this.split(k).join('');
};

String.prototype.versionGreaterOrEqualTo = function(c) {
    var v = this.split(".");
    var c = c.split(".");
    for (var i = 0; i < 6; i++) {
        c[i] = parseInt(c[i] || 0);
        v[i] = parseInt(v[i] || 0);
        if (v[i] > c[i]) {
            return true;
        } else if (v[i] < c[i]) {
            return false;
        }
    }
    return true; /* They are equal */
};

/*
 * Number
 * some custom methods for Number Objects
 */
Number.prototype.addZero = function() {
    return (this < 10) ? "0" + String(this) : String(this);
};

Number.prototype.isValueInBetween = function(a, b) {
    a = Number(a);
    b = Number(b);
    var a1 = Math.min(a, b),
        b1 = Math.max(a, b);
    return (this >= a1 && this <= b1) ? true : false;
};

Number.prototype.guiMetaData = function() {
    return String(this);
};

jQuery.customParam = function(data) {
    var str = "";
    if (typeof data == "object") {
        var arr = [];
        $.each(data, function(index, item) {
            arr.push(index + "=" + item);
        });
        str = arr.join("&");
    }
    return str;
};

// Ajax File Download
jQuery.download = function(url, data, method) {
    // get url and data
    if (url && data) {
        // data is string or array/object
        data = typeof data == 'string' ? data : jQuery.customParam(data);
        // The parameter assemble into form's input
        //var inputs = '';
        // jQuery.each(data.split('&'), function() {
        //     var pair = this.split('=');
        //     //inputs += '<input type="hidden" name="' + pair[0] + '" value="' + encodeURI(pair[1]) + '" />';
        // });
        // request ajax
        // jQuery('<form action="' + url + '" method="' + (method || 'post') + '">' + inputs + '</form>')
        //     .appendTo('body').submit().remove();
        var url = url + "?" + data;
        var iframeHTML = $('<iframe src="" id="downloadFile"></iframe>').hide();
        $('body').append(iframeHTML);
        iframeHTML.attr('src', url);
    }
};
$.extend({
    Object: {
        count: function(p) {
            p = p || false;

            return $.map(this, function(o) {
                if (!p) return o;

                return true;
            }).length;
        }
    }
});

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({
                toString: null
            }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [],
                prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}
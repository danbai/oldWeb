/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

(function($, document, undefined) {
    var self = this;

    var inited = false;
    var reload = false;
    var locales = new Object();

    // for local registered translation
    var LOCAL_TAG = "LOCAL";
    var LOCAL_TAG_LEN = LOCAL_TAG.length;
    var customLocale = null;

    var default_locale = "en-US";
    var ddlData = top.UCMGUI.config.ddlData;

    if (ddlData[0] && ddlData[0].value) {
        default_locale = ddlData[0].value;
    }

    var current_locale = default_locale;
    var _init = function() {
        if (inited) {
            return;
        }

        var langArr = new Array;

        for (var i = 0; i < ddlData.length; i++) {
            langArr[i] = ddlData[i].value;
        }

        if ($.inArray($.cookie('locale'), langArr) < 0) {
            $.cookie('locale', default_locale);
        }

        loadLocale(default_locale); // load default locale first. NOTE: if this fail, then locale won't work

        var _selected = $.cookie('locale');

        if (_selected != undefined && _selected != null && _selected != default_locale) {
            if (loadLocale(_selected)) {
                current_locale = _selected;
            } else {
                setCurrentLocale(default_locale);
            }
        } else {
            setCurrentLocale(default_locale);
        }

        inited = true;
    };

    var loadLocale = function(code) {
        var res = true;

        if (code.length == 0) {
            return !res;
        }

        if (locales[code] == undefined || locales[code] == null || reload) {
            var request = $.ajax({
                url: "locale/locale." + code + ".json",
                type: "GET",
                async: false,
                dataType: "json"
            });

            request.done(function(json) {
                locales[code] = json;
            });

            request.fail(function(jqXHR, textStatus) {
                res = false;

                if (code !== 'en-US') {
                    alert("The selected language file has error, Web UI will use English by default.");
                } else {
                    alert("The English language file has error, Web UI will display abnormal, please connect the administrator.");
                }
            });
        };

        return res; // locale loaded
    };

    var setCurrentLocale = function(code) {
        if (code == undefined || code == null || code.length == 0) {
            return;
        }

        current_locale = code;

        $.cookie('locale', code, {
            expires: 365
        });
    };

    var _switch = $.langSwitch = function(code, document, win) {
        if (!inited) {
            _init();
        }

        if (loadLocale(code)) {
            setCurrentLocale(code);
            _translate(document, true, undefined, win);
            return true;
        } else {
            return false;
        }
    };

    var _registerCustomLocales = $.registerCustomLocale = function(locale) {
        if (typeof locale === "object") {
            customLocale = locale;
        } else {
            customLocale = null;
        }
    };

    var _buildLabel = $.createGLabel = function(elm, label, tooltip, required) {
        var $elm = $(elm);
        var labelContainer = $("<span class=\"label\"></span>");
        var tipContainer = $("<span class=\"tooltip\"></span>");
        var flag = false;

        if ($elm.find(".sup").length != 0) {
            flag = true;
        }

        $elm.html("");

        if (label && label.charAt(0) == '@') {
            label = label.substr(1);
            labelContainer.attr("locale", label);
            labelContainer.attr("localeExt", "gLabel");

            var labelArr = label.split(" ");
            var labelArrStr = _translate(labelArr[0]);

            if (label.indexOf(" ") > 0) {
                for (var i = 1; i < labelArr.length; i++) {
                    if (labelArrStr.indexOf("{") < 0) {
                        labelArrStr += "{" + i + "}";
                    }

                    labelArrStr = labelArrStr.replace("{" + i + "}", "{0}");

                    if (/[\']/.test(labelArr[i])) {
                        labelArrStr = labelArrStr.format(labelArr[i].replace(/(\')/g, ""));
                    } else {
                        labelArrStr = labelArrStr.format(_translate(labelArr[i]));
                    }
                }

                label = labelArrStr;
            } else {
                label = _translate(label);
            }
        }

        if (flag) {
            label += "<label class=\"sup\">*</label>";
        }

        // append ':' for display 
        if (label.slice(-1) != ':') {
            label += ':';
        }

        labelContainer.html(label);

        if (tooltip && tooltip.length > 0) {
            $(tipContainer).addClass("on");
            $(tipContainer).attr("tip", tooltip);
        }

        var container = $("<div class=\"glab\" />");

        container.append(tipContainer).append(labelContainer);

        $elm.append(container[0].outerHTML);
    };

    var _translate = $.lang = function(req, isDoc, isReload, win) {
        reload = isReload;

        var sup = "<label class=\"sup\">*</label>";

        if (!inited || isReload) {
            inited = false;
            _init();
        }

        if (!isDoc) {
            // [AH] Add support for custom translation 
            var result = undefined;

            if (req && req.contains("^")) {
                var localeArr = req.split("^"),
                    localeArrStr = _translate(localeArr[0]);

                for (var i = 1; i < localeArr.length; i++) {
                    if (/[\']/.test(localeArr[i])) {
                        if (localeArrStr.contains("{0}")) {
                            localeArrStr = localeArrStr.format(localeArr[i].replace(/(\')/g, ""));
                        } else {
                            localeArrStr += " " + localeArr[i].replace(/(\')/g, "");
                        }
                    } else if (localeArrStr.contains("{0}")) {
                        localeArrStr = localeArrStr.format(_translate(localeArr[i]));
                    } else {
                        localeArrStr += " " + localeArr[i];
                    }

                    localeArrStr = localeArrStr.replace("{" + i + "}", "{0}");
                }

                return localeArrStr;
            } else {
                if (customLocale !== null &&
                    req.length > LOCAL_TAG_LEN &&
                    req.lastIndexOf(LOCAL_TAG, 0) === 0) {

                    var name = req.substring(LOCAL_TAG_LEN);
                    var cur = customLocale[name];

                    if (typeof cur === "object" && typeof cur.translate === "function") {
                        result = cur.translate(current_locale);
                    }
                } else {
                    var cur = locales[current_locale];

                    result = cur.translate[req];
                    if (result == undefined && current_locale != default_locale) {
                        result = locales[default_locale].translate[req];
                    }
                }

                // return result != undefined ? result : "XXXXX";
                // [AH] Change to return req directly when unable to find the match
                return result != undefined ? result : req;
            }
        } else {
            if (req == null || req == undefined) {
                req = $(document);
            }

            var body = $(req).contents().find("body"),
                localeDirection = $.cookie('localeDirection');

            $(req).bind("keydown", function(ev) {
                var obj = ev.target;
                var t = obj.type || obj.getAttribute('type');

                if (ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea") {
                    return false;
                }

                ev.stopPropagation();
            });

            // TODO [AH] this should be moved to different script file
            $("[gLabel]", body).each(function(i) {

                // checking to see if contains tooltip
                var label = $(this).attr("gLabel");
                var tooltip = $(this).attr("tooltip");
                var required = $(this).attr("required");

                _buildLabel(this, label, tooltip, required);
            });

            $("[locale]", body).each(function(i) {
                // only process when given translate keyword...
                var locale = $(this).attr("locale"),
                    disabled = $(this).attr("disable"),
                    localeExt = $(this).attr("localeExt"),
                    fullname = $(this).attr("fullname");

                // [AH] 1) is this code still using?
                //      2) this seems to be hardcoded logic which only apply to one case
                // [PC] Yes, this is still using for General Preference and One-Key Dial pages. 
                if ($(this)[0].tagName == 'OPTION' && body.hasClass('page') && disabled) { // Pengcheng Zou Added.
                    $(this).text(_translate("LANG565").format(locale + _translate('LANG273') + '>'));
                } else if (fullname) {
                    if ($(this).hasClass("disabledExtOrTrunk")) {
                        $(this).text(_translate("LANG567").format(_translate(locale), fullname, _translate('LANG273') + '>'));
                    } else {
                        $(this).text(_translate("LANG566").format(_translate(locale), fullname));
                    }
                } else {
                    var localeArr = locale.split(" "),
                        localeArrStr = _translate(localeArr[0]),
                        transLocale = _translate(locale),
                        nameLen = transLocale.length;

                    $(this).removeAttr("title");

                    var resultStr = "";

                    if (locale.contains(" ")) {
                        for (var i = 1; i < localeArr.length; i++) {
                            if (/[\']/.test(localeArr[i])) {
                                if (localeArrStr.contains("{0}")) {
                                    localeArrStr = localeArrStr.format(localeArr[i].replace(/(\')/g, ""));
                                } else {
                                    localeArrStr += " " + localeArr[i].replace(/(\')/g, "");
                                }
                            } else if (localeArrStr.contains("{0}")) {
                                localeArrStr = localeArrStr.format(_translate(localeArr[i]));
                            } else {
                                localeArrStr += " " + localeArr[i];
                            }

                            localeArrStr = localeArrStr.replace("{" + i + "}", "{0}");
                        }

                        resultStr = localeArrStr;
                    } else {
                        if (transLocale.contains("{0}")) {
                            transLocale = transLocale.replace("{0}", "").trim();
                        }

                        resultStr = transLocale;
                    }

                    if ($(this).html().indexOf(sup) > 0) {
                        resultStr += sup;
                    }

                    if (localeExt === "gLabel") {
                        if (resultStr.slice(-1) != ':') {
                            resultStr += ':';
                        }
                    }

                    $(this).html(resultStr);
                }
            });

            $("[localeTitle]", body).each(function(i) {
                // only process when given translate keyword...
                $(this).attr("title", _translate($(this).attr("localeTitle")));
            });

            $("[localeValue]", body).each(function(i) {
                // only process when given translate keyword...
                $(this).val(_translate($(this).attr("localeValue")));
            });

            // this will handle the tooltip locale prcoess
            if ($.fn.qtip) {
                $("[tip]", body).each(function(i) {
                    var value = $(this).attr('tip');

                    if (value.charAt(0) == '@') {
                        value = _translate(value.substr(1));
                    }

                    // add label at beginning of tooltip
                    var header = $(this).next().html();

                    if (header.indexOf(sup) > 0) {
                        header = header.replace(sup, "");
                    }
                    if (value.slice(0, 3) !== '<B>') {
                        value = '<B>' + header + '</B> ' + value;
                    }

                    $(this).qtip({
                        content: {
                            text: value
                        },
                        style: {
                            classes: 'ui-tooltip-plain ui-tooltip-shadow ui-tooltip-rounded'
                        },
                        position: {
                            my: "bottom center", // Use the corner...
                            at: "top center", // ...and opposite corner
                            target: "mouse"
                            // adjust: {
                            //     x: 216, // [AH] hardcoded for current style, should adjust in different skin layout
                            //     y: 125   // [AH] hardcoded for current style, should adjust in different skin layout
                            // }
                        }
                    });
                });
            }

            // Support languages start from right to left.
            if (localeDirection === 'rtl' && !body.hasClass('GSRTL')) {
                body.addClass('GSRTL').removeClass('GSLTR');
            } else if (localeDirection === 'ltr' && !body.hasClass('GSLTR')) {
                body.addClass('GSLTR').removeClass('GSRTL');
            }

            var hasReloaded = false;

            body.find('.ui-jqgrid').each(function(index) {
                var id = this.id;

                id = id.substr(5);

                if (win && win.$) {
                    var table =  win.$('#' + id),
                        tableDirection = table.getGridParam('direction');

                    if ((localeDirection !== tableDirection) && !hasReloaded) {
                        hasReloaded = true;

                        win.location.reload();

                        // Following code do not take effect
                        // table.setGridParam({
                        //     'direction': localeDirection
                        // }).trigger('reloadGrid');
                    }
                }
            });

            if (!body.is(":visible")) {
                body.show();
            }
        }
    };
})(jQuery, document);
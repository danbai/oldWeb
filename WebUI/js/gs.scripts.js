/*
* Description: UCM6100 WebGUI 
*
* Copyright (C) 2014 Grandstream Networks, Inc.
*
*/
(function ($, document, undefined)
{
    function gScript()
    {
        var _self_ = this;
        var _cached_ = {};

        this.isUndefined = function (val)
        {
            return typeof (val) == "undefined";
        }
        this.isFunction = function (val)
        {
            return typeof (val) == "function";
        }
        this.isObject = function (val)
        {
            return typeof (val) == "object";
        }
        this.isNumber = function (val)
        {
            return typeof (val) == "number";
        }
        this.isString = function (val)
        {
            return typeof (val) == "string";
        }
        this.isBoolean = function (val)
        {
            return typeof (val) == "boolean";
        }
        this.isArray = function (val)
        {
            return Object.prototype.toString.apply(val) === '[object Array]';
        }
        this.isEmpty = function (val)
        {
            return val == undefined || val == null || $.trim(val).length == 0;
        }

        this.valOrDefault = function (val, def)
        {
            return val == undefined || val == null ? def : val;
        }

        this.recentRequestResult = function (action)
        {
            return _cached_[action] ? _cached_[action] : {};
        }

        this._findInputFields = function (doc)
        {
            doc = _self_.__document(doc);

            return $("input[name],select[name],textarea[name]", $(doc).contents().find("body"));
        }

        this._findContentContainer = function (doc)
        {
            doc = _self_.__document(doc);

            return $("[container]", $(doc).contents().find("body"));
        }

        this.size = function (obj)
        {
            if (_self_.isObject(obj))
            {
                var size = 0, key;
                for (key in obj)
                {
                    if (obj.hasOwnProperty(key)) size++;
                }
                return size;
            }
            else
                obj.length;
        }

        _self_.__document = function (doc)
        {
            return (doc === undefined || doc === null) ? document : doc;
        }

        /*
        *   TAB MENU FEATURES:
        *   NOTE: we might no longer need this once changing the menu structure
        *   When we have a nav which contains whole website, we should use that one to generate tab list
        */
        var _tabs_ = {};
        this._grabTabMenu = function (name)
        {
            if (_self_.isEmpty(name))
                return [];

            if (_tabs_[name] == undefined || _tabs_[name] == null)
            {
                var request = $.ajax({
                    url: "../config/nav/tab." + name + ".json",
                    type: "GET",
                    async: false,
                    dataType: "json"
                });

                request.done(function (json)
                {
                    _tabs_[name] = json;
                });

                request.fail(function (jqXHR, textStatus)
                {
                    alert("FAILED: " + textStatus);
                });
            };

            if (_tabs_[name])
            {
                var tabs = _tabs_[name];
                $(tabs).each(function (i)
                {
                    // translate the description if needed 
                    if (!_self_.isEmpty(this.locale))
                        this.desc = $P.lang(this.locale);
                });

                return tabs;
            }
            else
                return [];
        }

        this.extractPageName = function (doc)
        {
            doc = _self_.__document(doc);

            // [AH] prepare for getting selected page
            var page, idx;
            page = doc.location.pathname;

            if ((idx = page.lastIndexOf('/')) >= 0)
                page = page.substring(idx + 1);

            return page;
        }

        // NOTE: [AH] this is ported directly from the original way of the tab drawing which might not be the best solution
        this.tabMenu = function (elm, name, doc)
        {
            if (elm === undefined || elm === null || _self_.isEmpty(name))
                return;

            doc = _self_.__document(doc);

            var container = $(elm, doc);
            var newTable = $("<table />");

            newTable.attr('align', 'center');
            newTable.attr('cellpadding', '0');
            newTable.attr('cellspacing', '0');
            newTable.css({ margin: '10px', padding: '10px' });

            newTable.append($("<tbody><tr></tr></tbody>"));

            var page = _self_.extractPageName(doc);

            _self_._grabTabMenu(name).each(function (item)
            {
                var newCell = $("<td />").css({ "text-align": "center", "borderBottom": "4px solid #000000" });
                newTable.find("tr:last").append(newCell);

                var tab = $("<a />").html(item.desc);

                if ((item.selected && item.selected == true) || item.url === page)
                {
                    tab.attr("href", "#");
                    tab.addClass("tabselected");
                }
                else
                {
                    tab.attr("href", item.url);
                    tab.addClass("tab");
                }

                if (!_self_.isEmpty(item.locale))
                    tab.attr("locale", item.locale);

                newCell.append(tab);
            });

            container.append(newTable);
        }       

        this.convertToTime = function (second, element)
        {
            var days;
            var vtime="";
            if (!isNaN(second))
            {
                //return (new Date).clearTime().addSeconds(second).toString('HH:mm:ss');
                var time = '';
                if (second >= 24 * 3600) {
                    days = parseInt(second / (24 * 3600));
                    time += days + $P.lang("LANG2392")+ " ";
                    second %= (24 * 3600);
                }
                
                if (second >= 3600) {
                    var tmp = parseInt(second / 3600);
                    time += (((tmp<10)?"0"+tmp:tmp) + ":");
                    vtime += (((tmp<10)?"0"+tmp:tmp) + ":");
                    second %= 3600;
                }
                else
                {
                    time += "00:";
                    vtime += "00:";
                }

                if (second >= 60) {
                    var tmp = parseInt(second / 60);
                    time += (((tmp<10)?"0"+tmp:tmp) + ":");
                    vtime += (((tmp<10)?"0"+tmp:tmp) + ":");
                    second %= 60;
                }
                else
                {
                    time += "00:";
                    vtime += "00:";
                }
                
                if (second > 0) {
                    var tmp = parseInt(second);
                    time += (tmp<10)?"0"+tmp:tmp;
                    vtime += (tmp<10)?"0"+tmp:tmp;
                }
                else
                {
                    time += "00";
                    vtime += "00";
                }
                
                if (days != undefined)
                { 
                    element.setAttribute('locale', "LANG2406 '"+days+"' '"+vtime+"'");
                }
                
                return time; 
            }
            else
                return second;
        }

        this._elementDataBind = function (type, element, request, response, options)
        {
            if (_self_.isEmpty(request) || element === undefined || element === null || !_self_.isObject(response))
                return; // no request, no run

            if (_self_.isEmpty(value))
                value = ""; // clean up NULL and UNDEFINED

            var val = request.toString().split(":");
            var json_type = "json";
            if ( options.dataType != undefined && options.dataType.toLowerCase() != json_type.toLowerCase() )
            {
                var value = UCMGUI.urlFunction.decode(response[val[0]]);
            }
            else
            {
                var value = response[val[0]];
            }

            var processed = false;
            if (_self_.isFunction(options.hasCustomFieldBinding))
            {
                processed = options.hasCustomFieldBinding(value);
            }

            if (!processed)
            {
                var option = "";
                var bound = false; // should turn true if option is to bind the value

                for (var i = 1; i < val.length; i++)
                {
                    var option = val[i];

                    if (option.toLowerCase() === "totime")
                    {
                        value = _self_.convertToTime(value, element);
                    }
                }

                // default to use this binding
                if (!bound)
                {
                    if (type === "input")
                    {
                        var inputType = $(element).attr('type');
                        if (inputType && (inputType.toLowerCase() === "radio" || inputType.toLowerCase() === "checkbox"))
                        {
                            if ($(element).val() == value)
                                $(element).attr("checked", true);
                            //$("input:radio[name='P231'][value=" + route_switch_mode + "]").attr('checked', 'checked');
                        }
                        else
                            $(element).val(value);
                    }
                    else
                    {
                        $(element).html(value);
                    }
                }
            }
        }

        this.text2Json = function (text, entry_delimiter, token_delimiter)
        {
            entry_delimiter = _self_.valOrDefault(entry_delimiter, "\n");
            token_delimiter = _self_.valOrDefault(token_delimiter, "=");

            var ret = {};
            var convertable = false;

            $.each(text.split(entry_delimiter), function (idx)
            {
                var entry = $.trim(this);
                if (!_self_.isEmpty(entry))
                {
                    var sep_idx = entry.indexOf(token_delimiter);

                    if (sep_idx > 0) // it must be greater than ZERO
                    {

                        var name = entry.substr(0, sep_idx);
                        var value = entry.substr(sep_idx + 1);

                        ret[name] = value;
                        convertable = true;
                    }
                }
            });

            if (convertable)
                return ret;
            else
                return text; // keep as string as unable to convert
        }

        // valid options format
        /* {
        *      [dataType: STRING,] // default json
        *      [auto: BOOLEAN,  // default TRUE whether to auto grab and set 
        *      [request: [STRING1,STRING2,...,STRING N]],  // manual request
        *      [onResponseReceived: function(x) {...}],
        *      [hasCustomFieldBinding: function(x) {...}], // should return true/false
        *      [onResponseProcessed: function(x) {...}],
        *      [onInvalidResponse: function(x) {...}],
        *      [onRequestFailed: function(x) {...}]
        * }
        */
        this.actionRequest = function (doc, action, target, options)
        {
            doc = _self_.__document(doc);

            if (!_self_.isEmpty(action))
            {
                options = $.extend({ "dataType": "json", "auto": true }, options || {});

                var data_type = _self_.valOrDefault(options.dataType, "json");
                var auto_scan = _self_.valOrDefault(options.auto, true);
                //$(doc).hide(); // TODO [AH] improve this

                // this process will collect and make sure there is no duplicate id
                var hash = {};
                if (_self_.isArray(options.request))
                {
                    $(options.request).each(function (i)
                    {
                        hash[this] = true;
                    });
                }

                // automatically collect the request when option is true
                if (auto_scan)
                {
                    _self_._findContentContainer(doc).each(function (i)
                    {
                        var val = $(this).attr("container").split(":");

                        if (!_self_.isEmpty(val))
                            hash[val[0]] = true;
                    });

                    _self_._findInputFields(doc).each(function (i)
                    {
                        var val = $(this).attr("name");

                        if (!_self_.isEmpty(val))
                            hash[val] = true;
                    });
                }

                var request = "";
                for (var name in hash)
                {
                    if (hash.hasOwnProperty(name))
                    {
                        if (request.length > 0)
                            request += "&";

                        request += name;

                        if (name.indexOf("=") < 0) request += "=";
                    }
                }

                // prepare to send request
                var url = "/webcgi?Action=" + action;

                if (target != undefined && target != null)
                    url += "&target=" + target;

                if ($.trim(request).length > 0)
                    url += "&" + request;

                var request = $.ajax({
                    url: url,
                    type: "GET",
                    async: true,
                    dataType: data_type
                });

                request.done(function (json)
                {
                    if (json != undefined && json != null)
                    {

                        if (data_type == "text")
                        {
                            // [AH] okay... we need to convert the text to json...
                            // NOTE: this part should be changed as all the return from device should always be in JSON format
                            var item = {};

                            item.response = "success";
                            item.body = _self_.text2Json(json);

                            json = item;
                        }

                        if (json.response && json.response.toLowerCase() == "success")
                        {
                            if (json.body)
                            {
                                if (_self_.isObject(json.body))
                                {
                                    var item = json.body;

                                    if (_self_.isFunction(options.onResponseReceived))
                                        options.onResponseReceived(item);

                                    //////////////////////////////////////////////////////////////////////////
                                    //  Binding response data into the given document
                                    ////////////////////////////////////////////////////////////////////////// 

                                    // process optional request first... and process when there has 
                                    // custom field binding function defined
                                    if (_self_.isArray(options.request) && _self_.isFunction(options.hasCustomFieldBinding))
                                    {
                                        $(options.request).each(function (i)
                                        {
                                            options.hasCustomFieldBinding(this);
                                        });
                                    }

                                    // automatically collect the request when option is true
                                    if (auto_scan)
                                    {
                                        // load the content container first....
                                        _self_._findContentContainer(doc).each(function (i)
                                        {
                                            var req = $(this).attr("container");
                                            _self_._elementDataBind("container", this, req, item, options);
                                        });

                                        _self_._findInputFields(doc).each(function (i)
                                        {
                                            var req = $(this).attr("name");
                                            _self_._elementDataBind("input", this, req, item, options);
                                        });
                                    }

                                }

                                // non-object response
                                _cached_[action] = json.body;

                                if (_self_.isFunction(options.onResponseProcessed))
                                    options.onResponseProcessed(json.body);
                            }
                            else
                            {
                                _cached_[action] = {};
                                if (_self_.isFunction(options.onInvalidResponse))
                                    options.onInvalidResponse(json);
                            }
                        }
                        else
                        {
                            _cached_[action] = {};
                            if (_self_.isFunction(options.onInvalidResponse))
                                options.onInvalidResponse(json);
                        }
                    }
                    else
                    {
                        _cached_[action] = {};
                        if (_self_.isFunction(options.onInvalidResponse))
                            options.onInvalidResponse("EMPTY_RESPONSE");
                    }
                    return true;
                });

                request.fail(function (jqXHR, textStatus, msg)
                {
                    top.dialog.dialogMessage({ type: 'error', content: msg });
                    _cached_[action] = {};

                    if (_self_.isFunction(options.onRequestFailed))
                        options.onRequestFailed(msg);

                    return false;
                });
            }
        }

        // valid options format
        /* {
        *      [dataType: STRING,] // default json
        *      [checkReload: BOOLEAN,]  // default TRUE whether to check for reload list
        *      [postToBody: TRUE|FALSE,] // default FALSE
        *      [ignoreFile: TRUE|FALSE,] // default TRUE
        *      [feedback: TRUE|FALSE,] // default TRUE
        *      [onResponseReceived: function(x) {...}],
        *      [onResponseProcessed: function(x) {...}],
        *      [onInvalidResponse: function(x) {...}],
        *      [onSubmitFailed: function(x) {...}]
        * }
        */
        this.actionSubmit = function (doc, action, target, options)
        {
            doc = _self_.__document(doc);

            if (!_self_.isEmpty(action))
            {
                top.dialog.dialogMessage({ type: 'loading', content: $P.lang("LANG826") });
                options = $.extend({ "dataType": "json", "checkReload": true, "postToBody": true, "ignoreFile": true, "feedback": true }, options || {});
                //////////////////////////////////////////////////////////////////////////
                // preparing the values
                //////////////////////////////////////////////////////////////////////////
                var data = {};


                //temporary  begin
                //override errorMsg when feedback is false and no onValidResponse callback
                if (!_self_.isFunction(options.onInvalidResponse))
                {
                    options.onInvalidResponse = function (err) {
                        if (!options.feedback)
                        {
                            top.dialog.dialogMessage({ type: 'error', content: msg }); 
                        }
                    }


                }
                //temporary  end

                if (options.data != undefined)
                {
                    $.each(options.data, function (key, val)
                    {
                        data[key] = val;
                    });
                }
                else
                {
                    _self_._findInputFields(doc).each(function (i)
                    {
                        // we only need to collect the value for input elements 

                        var id = $(this).attr("name");
                        var type = $(this).attr("type");
                        if (type != undefined && type != null)
                            type = type.toLowerCase();
                        if (options.ignoreFile == false || type != "file")
                        {
                            if (!_self_.isEmpty(id))
                            {
                                if (type && (type === "radio" || type === "checkbox"))
                                {
                                    if ($(this).attr("checked"))
                                    {
                                        data[id] = $(this).val();
                                    }
                                }
                                else
                                    data[id] = $(this).val();
                            }
                        }

                    });
                }

                // prepare to send request
                var url = "/webcgi";

                if (!options.postToBody)
                {
                    url += "?action=" + action;

                    if (target != undefined && target != null)
                        url += "&target=" + target;

                    var request = "";
                    for (var name in data)
                    {
                        if (data.hasOwnProperty(name))
                        {
                            if (request.length > 0)
                                request += "&";

                            request += name + "=" + data[name];
                        }
                    }

                    url += "&" + request;
                }
                else
                {
                    data["action"] = action;

                    if (target != undefined && target != null)
                        data["target"] = target;
                }

                var request = $.ajax({
                    url: url,
                    type: "POST",
                    async: false,
                    dataType: options.dataType,
                    data: options.postToBody ? data : undefined
                });

                request.done(function (json)
                {
                    var msg = "";
                    if (json != undefined && json != null)
                    {
                        // converting response to JSON
                        if (options.dataType == "text")
                        {
                            // [AH] okay... we need to convert the text to json...
                            // NOTE: this part should be changed as all the return from device should always be in JSON format
                            var item = {};

                            item.response = "success";
                            item.body = _self_.text2Json(json);

                            json = item;
                        }

                        if (json.response && json.response.toLowerCase() == "success" && json.body)
                        {
                            if (_self_.isFunction(options.onResponseReceived))
                                options.onResponseReceived(json.body);

                            if (options.checkReload)
                            {
                                if (top.config2json)
                                {
                                    if (_self_.isObject(json.body))
                                    {
                                        var list = json.body["reload files"]; // TODO [AH] hmmm... key with space...?
                                        if (_self_.isArray(list))
                                        {
                                            var found = false;
                                            $(list).each(function (i)
                                            {
                                                if (top.sessionData.FileCache[this])
                                                {
                                                    if (top.sessionData.FileCache[name] != undefined) {
                                                        top.sessionData.FileCache[name].modified = true;
                                                    }
                                                    found = true;
                                                }

                                                top.config2json({ filename: this, usf: 0 }); // [AH] not sure if this really reload the file
                                            });

                                            if (found)
                                            {
                                                for (var name in top.readcfg)
                                                {
                                                    if (top.readcfg.hasOwnProperty(name))
                                                    {
                                                        top.readcfg[name]();
                                                    }
                                                }
                                                top.dialog.clearDialog();
                                            }
                                        }
                                    }
                                }
                                // else
                                //     console.log("[ACTIONSUBMIT] [ERR] UNSUPPORTED FUNCTION");
                            }

                            msg = $P.lang("LANG844");

                            // [AH] turn on apply button
                            // top.$.cookie('configFilesChanged', 'yes');
                            // top.$('#applyChanges_Button', top.document).css("visibility", "visible");
                            // top.$('#line_Button', top.document).css("visibility", "visible");
                            // top.$('#applyChanges_Button').effect("shake", {
                            //  direction: "up", distance: 2, times:10000
                            // }, 400);

                            if (_self_.isFunction(options.onResponseProcessed))
                                options.onResponseProcessed(json.body);
                        }
                        else
                        {
                            msg = "[ACTIONSUBMIT] [ERR] PROCESSED FAILED OR INVALID BODY";

                            if (_self_.isFunction(options.onInvalidResponse))
                                options.onInvalidResponse(msg);
                        }
                    }
                    else
                    {
                        msg = "[ACTIONSUBMIT] [ERR] EMPTY RESPONSE";
                        _cached_[action] = {};
                        if (_self_.isFunction(options.onInvalidResponse))
                            options.onInvalidResponse(msg);

                    }

                    if (options.feedback === true)
                    {
                        if ( msg == $P.lang("LANG844") )
                        {
                            //top.dialog.clearDialog();
                            top.dialog.dialogMessage({ type: 'success', content: msg });
                        }
                        else
                        {
                            //top.dialog.clearDialog();
                            top.dialog.dialogMessage({ type: 'error', content: msg });
                        }
                    }
                });

                request.fail(function (jqXHR, textStatus, msg)
                {
                    //dialog.clearDialog();
                    top.dialog.dialogMessage({ type: 'error', content: "[ACTIONSUBMIT] [ERR] REQUEST FAILED: " + msg });

                    if (_self_.isFunction(options.onSubmitFailed))
                        options.onSubmitFailed(msg);

                    return false;
                });
            }
        }

        // this.log = function (msg)
        // {
        //     console.log(msg);
        // }
    }

    function gSession()
    {
        var _self_ = this;

        // fields 
        var _idle_state = "";
        var _isRetry = false;
        var _checking_timer = null;
        var _repeatCheck = false;

        this.idleState = function (val)
        {
            if (val == undefined)
            {
                return this._idle_state;
            }
            else
                this._idle_state = val;
        }

        this.repeatCheck = function ()
        {
            return this._repeatCheck;
        }

        this.retrying = function (val)
        {
            if (val != undefined)
                return this._isRetry;
            else
                this._isRetry = val;
        }
        this.repeatCheckSession = function ()
        {
            _self_.checkSession(true);
        }

        this.checkSession = function (repeat)
        {
            this._repeatCheck = repeat;

            $.ajax({
                type: 'GET',
                url: "/infocgi",
                data: 'action=ping',
                success: function (t)
                {
                    var t = arguments[2].responseText;
                    if (!t.toLowerCase().contains('pong'))
                    {
                        top.log.debug('PING Request: INVALID SESSION');
                        if (sessionData.DEBUG_MODE)
                        {
                            alert('PING Request: INVALID SESSION' + '\n' + 'Click OK to reload');
                        }
                        _self_.stopSessionCheck();
                        top.window.location.reload();
                        return true;
                    }
                    else if (_self_.retrying())
                    {
                        $('#noResponseFromServer').hide();
                        $("#main-container").show();
                    }

                    if (_self_.repeatCheck())
                    {
                        if (_self_.idleState() == "")
                        {
                            _checking_timer = setTimeout(_self_.repeatCheckSession, 6000); // repeat every 4 seconds when in active use
                        }
                    }

                    _self_.retrying(false);
                },
                error: function ()
                {
                    try
                    {
                        top.log.debug("PING Request: REQUEST FAILED ");
                        if (_self_.retrying())
                        {
                            top.dialog.dialogMessage({ type: 'error', content: $P.lang("LANG2315") });
                        }
                        else
                        {
                            _self_.retrying(true);
                            _self_.stopSessionCheck();

                            _$('noResponseFromServer').style.height = top.document.body.scrollHeight;
                            $('#noResponseFromServer').show();
                            $("#main-container").hide();
                            //$('#mainscreen').hide();
                        }
                    }
                    catch (err)
                    {
                        top.dialog.dialogMessage({ type: 'error', content: $P.lang("LANG986") });
                    }
                    finally
                    {
                        top.dialog.clearDialog();  // TODO [AH] replace this, this will close all the open dialog
                    }
                }
            });
        }
        this.stopSessionCheck = function ()
        {
            clearTimeout(_checking_timer);
        }

        $.getScript("/config/js/jquery.idle.js", function (data, textStatus, jqxhr)
        {
            //console.log(data); //data returned
            //console.log(textStatus); //success
            //console.log(jqxhr.status); //200
            // set idle state
            top.setIdleTimeout(1000 * 30); // put script into idle after 30 seconds 
            top.setAwayTimeout(1000 * 5); // 5 seconds
            top.document.onIdle = function ()
            {
                _self_.idleState("idle");
            }
            top.document.onAway = function ()
            {
                _self_.idleState("away");
                //_self_.stopSessionCheck();
            }
            top.document.onBack = function (isIdle, isAway)
            {
                _self_.idleState("");

                if (sessionData.isLoggedIn) // [AH] sessionData might be removed in the future
                    _self_.checkSession(true);
            }
            if (typeof sessionData !== "undefined")
            {
                if (sessionData.isLoggedIn) // [AH] again... we should move around sessionData in the future
                    _self_.checkSession(true);
            };
        });
    }


    $.gs = new gScript();
    $.gsec = new gSession();

    $.gui = {
        showHideByChecked: function (element, target, callback)
        {
            var type = $(element).attr("type");

            if ((/checkbox/i).test(type))
            {
                var showHide = function (show)
                {
                    if (show)
                        $(target).show();
                    else
                        $(target).hide();
                }

                $(element).change(function ()
                {
                    var value = $(element).attr("checked");
                    showHide(value);

                    if (typeof callback === "function")
                    {
                        setTimeout(function () { callback(value) }, 1);
                        //callback(value);
                    }
                });

                //                $(element).bind("click", function (event)
                //                {
                //                    var value = $(this).attr("checked");
                //                    showHide(value);

                //                    if (typeof callback === "function")
                //                    {
                //                        callback(value);
                //                    }
                //                });

                showHide($(element).attr("checked"));
            }
        }
    }

    $P = top.$;

})(jQuery, document);
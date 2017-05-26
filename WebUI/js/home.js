/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var module = window.module,
    topDoc = top.document,
    doc = document,
    $P = top.$,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    ddlData = [],
    gup = UCMGUI.gup,
    menu = gup.call(window, "menu"),
    role = top.$.cookie('role'),
    is_strong_password = top.$.cookie('is_strong_password'),
    userPortal = false,
    username = top.$.cookie("username"),
    userInfo = $("#userInfo");

String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;

$(function() {
    initPage();

    bindEvent();

    checkPwdAndMail();
});

function initPage() {
    if (role !== 'privilege_0' && role !== 'privilege_1') {
        $("#reboot_Button").remove();
    }

    if (role === 'privilege_3') {
        userPortal = true;
    }

    if (role !== 'privilege_0') {
        $('#settingsGuide')
            .parent().next().remove()
            .end().remove();

        $('#sysTime').attr({
            'colspan': '5'
        });
    }

    module = new moduleMenu({
        modulePos: 'moduleList',
        menuPos: 'menu-div', // menuList position
        crumbsPos: 'crumbs-div', // crumbs position
        isDisplayName: {
            'modelName': config.baseModelName,
            'hideName': {
                nat: ['LANG50', 'LANG54'],
                digital: ['LANG3141', 'LANG3573', 'LANG686', 'LANG2788', 'LANG3264', 'LANG3252', 'LANG4023', 'LANG4360']
            }
        },
        model_info: config.model_info,
        changes: {
            'originalName': 'LANG49',
            'newName': 'LANG50'
        },
        userPortal: userPortal
    });

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

    if (username.length > 6) {
        userInfo.attr("title", username);
        username = username.substring(0, 6) + "...";
    }

    userInfo.text(username);

    $("#navbox").hoverClass();

    $("#copyright").html(config.model_info.copyright.replace('2014', '2014-' + new Date().getFullYear()));

    $P.lang(doc, true);

    UCMGUI.resizeMainIframe(doc);

    // UCMGUI.getSysTime(doc);
    // topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG583"));

    $("#logo").attr("src", "../" + config.model_info.logo);

    $P.cookie('position', 'home', {
        expires: 365
    });

    if (menu) {
        module.jumpMenu(menu);
    } else {
        // $("#mainScreen").attr("src", "welcome.html");
        $(".module").find("a").eq(0).trigger("click");
    }

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

    $("#main-container").show();

    UCMGUI.loginFunction.checkifLoggedIn('ping');

    $("#menu-div").mCustomScrollbar({
        // scrollInertia: 0,
        scrollButtons: {
            enable: false
        }
    });
}

function bindEvent() {
    $P('#language', doc).ddslick({
        data: ddlData,
        doc: doc,
        onSelected: function(data) {
            var language = data.selectedData.value,
                localeDirection = data.selectedData.localeDirection,
                mWindow = top.frames["frameContainer"].frames["mainScreen"];

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
            $P.langSwitch(language, mWindow.document, mWindow);

            if ($("select, input[type=checkbox]", mWindow.document).length) {
                top.Custom.init(mWindow.document);
            }

            var title = $("title", mWindow.document).attr("locale");

            if (title) {
                topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang(title));
            }

            var script = top.document.createElement("script");

            $.each($("script", top.document), function(index, item) {
                var src = $(item).attr("src");

                if (src && src.contains("additional-methods.js")) {
                    script.src = src;
                }
            });

            script.type = "text/javascript";

            top.document.getElementsByTagName("head").item(0).appendChild(script);

            if (mWindow.initValidator) {
                $("#form", mWindow.document).tooltip("destroy");

                mWindow.initValidator();
            }

            if (mWindow.transTable) {
                mWindow.transTable();
            }

            if (mWindow.location.href.indexOf('extension') > -1) {
                var add = mWindow.$("#add", mWindow.document),
                    addChosen = mWindow.$("#add_chosen", mWindow.document),
                    batchAdd = mWindow.$("#batchAdd", mWindow.document),
                    batchAddChosen = mWindow.$("#batchAdd_chosen", mWindow.document),
                    importSel = mWindow.$("#import", mWindow.document),
                    importSelChosen = mWindow.$("#import_chosen", mWindow.document);

                addChosen.css("width", add.width() + (config.safari ? 50 : 25) + 'px');

                batchAddChosen.css("width", batchAdd.width() + (config.safari ? 50 : 25) + 'px');

                importSelChosen.css("width", importSel.width() + (config.safari ? 50 : 25) + 'px');
            }

            if (mWindow.location.href.indexOf('html') > -1 && mWindow.$("table.ui-jqgrid-btable", mWindow.document).length > 0) {
                var oTable = mWindow.$("table.ui-jqgrid-btable", mWindow.document),
                    aTxt = [],
                    achild;

                oTable.find('td.wordBreak').each(function() {
                    achild = $(this).children();

                    if (achild.length > 0 && $(this).attr('title')) {
                        achild.each(function() {
                            aTxt.push($(this).text());
                        });

                        $(this).attr('title', aTxt.join(' '));

                        aTxt = [];
                    }
                });
            }
        }
    });

    $(".main_logo img").bind("click", function(ev) {
        top.window.location.href = config.model_info.logo_url;

        ev.stopPropagation();
        return false;
    });

    $("#settingsGuide").bind("click", function(ev) {
        top.$.cookie('first_login', 'no');

        $P("#frameContainer").attr("src", "html/settings_guide.html");

        ev.stopPropagation();
        return false;
    });

    $(window).resize(function() {
        UCMGUI.resizeMainIframe(doc);

        var width = $(this).width();

        if (width <= "1057") {
            $("body").css("width", "1057px");
        } else {
            $("body").css("width", "100%");
        }
    });

    $('#check_msg')
        .on('click', '#pwd_prompt font', function() {
            top.frames["frameContainer"].module.jumpMenu("password.html");
        })
        .on('click', '#email_prompt font', function() {
            top.frames["frameContainer"].module.jumpMenu("bind_email.html");
        });

    // register main frame for event delegate
    UCMGUI.iFrameEventDelegate.registerMainFrame($("#mainScreen"));
}

function checkPwdAndMail() {
    $.ajax({
        type: "GET",
        url: "../cgi",
        data: {
            "action": "getUser",
            "user_name": top.$.cookie("username")
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data),
                oCheckMsg = $('#check_msg');

            if (bool) {
                var res = data.response.user_name,
                    sMail = res.email;

                // sPwd = res.user_password,
                // nDigital = /\d/.test(sPwd) ? 1 : 0,
                // nAlpha = /[a-zA-Z]/.test(sPwd) ? 1 : 0,
                // nSpecial = /[`｀~～!！@\·#＃$￥%％^…&＆()（）-－_—=＝+＋\[\]［］|·:：;；“\、\'‘,，<>〈〉?？\/\／*＊.。{}｛｝\\\"]/.test(sPwd) ? 1 : 0;

                if (is_strong_password === '0') {
                    $('#check_msg, #pwd_prompt').show();
                } else if (is_strong_password === '1' && !sMail) {
                    $('#check_msg, #email_prompt').show();
                }
            }
        }
    });
}

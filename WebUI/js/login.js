/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var doc = document,
    topDoc = top.document,
    $P = top.$,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    height = document.body.clientHeight,
    mtop = (height - 419) / 2 - 109,
    ddlData = [],
    DOM_username = doc.getElementById('username'),
    DOM_secret = doc.getElementById('secret'),
    logo = doc.getElementById("logo");

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG269"));

    initPage();

    bindEvent();

    getPwd();
});

function initPage() {
    if (mtop > 0) {
        $("#container").css("margin-top", function() {
            return mtop + "px";
        });
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

    $("#model_name").html(config.model_info.model_name);
    $("#description").html(config.model_info.description);
    $("#copyright").html(config.model_info.copyright.replace('2014', '2014-' + new Date().getFullYear()));

    logo.src = "../" + config.model_info.logo;

    if (config.msie) {
        $("#username").addClass("lineHeight");
        $("#secret").addClass("lineHeight");

        $('input').bind('focus', function() {
            $(this).addClass('ieFocusHack');
        }).bind('blur', function() {
            $(this).removeClass('ieFocusHack');
        });
    }

    $("#username").focus();
}

function bindEvent() {
    $(".main_logo img").bind("click", function(ev) {
        top.window.location.href = config.model_info.logo_url;

        ev.stopPropagation();
        return false;
    });

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

            topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG269"));
        }
    });

    $("form").submit(function() {
        var username_value = DOM_username.value,
            secret_value = DOM_secret.value,
            language = $P.cookie('locale');

        top.dialog.clearDialog();
        
        if (username_value == "") {
            $(".errorInfo").css("visibility", "visible").fadeIn("slow");

            setTimeout(function() {
                $(".errorInfo").html("");
            }, 3000);

            DOM_username.focus();

            return false;
        }

        if (secret_value == "") {
            $(".errorInfo").css("visibility", "visible");

            setTimeout(function() {
                $(".errorInfo").html("");
            }, 3000);

            DOM_secret.focus();

            return false;
        }

        var r = UCMGUI.makeSyncRequest({
            action: 'challenge',
            user: DOM_username.value
        });

        r = top.JSON.parse(r);

        if ((typeof r == 'object') && r.hasOwnProperty('response') && r.response.hasOwnProperty('challenge')) {
            var challenge = r.response.challenge,
                md5key = MD5(challenge + DOM_secret.value);

        } else {
            if(r.status == -68) {
                var remainTime = r.response.remain_time;
                var minute = parseInt((Number(remainTime)/60)) + $P.lang("LANG5148");
                if (Number(remainTime) < 60) {
                    minute = Number(remainTime) + $P.lang("LANG5147");
                }
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG4725").format(minute)
                });
                return false;
            } else if(r.response && r.response.remain_num && r.status == -37) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG4794").format(r.response.remain_num)
                });
                return false;
            } else if(r.status == -70) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG4795")
                });
                return false;
            } else {
                $(".errorInfo").html($P.lang("LANG984")).attr("locale", "LANG984").css("visibility", "visible");

                setTimeout(function() {
                    $(".errorInfo").html("");
                }, 3000);

                DOM_username.focus();
                DOM_username.select();

                return false;
            }
        }

        var f = UCMGUI.makeSyncRequest({
            action: 'login',
            user: DOM_username.value,
            token: md5key
        });

        f = top.JSON.parse(f);

        if ((typeof f == 'object') && f.hasOwnProperty('status')) {
            if (f.status == 0) {
                DOM_secret.blur();

                $P.cookie('username', username_value);
                $P.cookie('user_id', f.response.user.user_id);
                $P.cookie('html', top.JSON.stringify(f.response.user.html_privilege));
                $P.cookie('role', f.response.user.user_role);
                $P.cookie('is_strong_password', f.response.user.is_strong_password);
                $P.cookie('first_login', 'no');

                if (f.response.module_switch && f.response.module_switch.hasOwnProperty('enable_module')) {
                    $P.cookie('enable_module', f.response.module_switch.enable_module);
                }

                if (config.webkit && window.localStorage) {
                    $("#secret").val("");
                } else {
                    $("#secret").attr("disabled", "disabled");
                }

                if ((f.response.user.user_role === 'privilege_0') && (f.response.user.is_first_login === 'yes')) {
                    $P.cookie('first_login', 'yes');

                    $(this).attr({
                        'action': './settings_guide.html'
                    });
                }

                UCMGUI.loginFunction.checkTrigger();

                $(".errorInfo").css("visibility", "hidden");

                $P.lang(doc, true, true);
            } else if(f.status == -68) {
                var remainTime = f.response.remain_time;
                var minute = parseInt((Number(remainTime)/60)) + $P.lang("LANG5148");
                if (Number(remainTime) < 60) {
                    minute = Number(remainTime) + $P.lang("LANG5147");
                }
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG4725").format(minute)
                });
                DOM_secret.blur();
                return false;
            } else if(f.response && f.response.remain_num && f.status == -37) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG4794").format(f.response.remain_num)
                });
                DOM_secret.blur();
                return false;
            } else if(f.status == -70) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG4795")
                });
                return false;
            } else {
                $(".errorInfo").html($P.lang("LANG984")).attr("locale", "LANG984").css("visibility", "visible");

                setTimeout(function() {
                    $(".errorInfo").html("");
                }, 3000);

                DOM_secret.focus();
                DOM_secret.select();

                return false;
            }
        }
    });
}

function getPwd() {
    $('#forget_pwd').on('click', function() {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG4190"),
            displayPos: "login_modal",
            frameSrc: "html/login_modal.html"
        });
        return false;
    });
}

/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    gup = UCMGUI.gup,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    signalling = gup.call(window, "signalling"),
    mode = gup.call(window, "mode"),
    dodExt = [],
    dodExtList = [],
    optionType = "",
    trunkIndex = "",
    membersArr = [],
    editDodData = [],
    dodNumberArr = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    trunkIndex = gup.call(window, "trunkIndex");

    setTimeout(function() {
        createTable();

        bindButtonEvent();
    }, 100);

    getList();

    $("#edit_DOD_cancel, #edit_DOD_save").hide();

    initValidator();
});

function getList() {
    dodExtList = transAccountVoicemailData(UCMGUI.isExist.getList("getAccountList"));

    // Only VoIP Trunks
    if (!signalling) {
        $.ajax({
            async: false,
            type: "post",
            url: "../cgi",
            data: {
                "action": "getPhonebookListDnAndMembers"
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
                    var memberLDAP = data.response.extension;

                    for (var i = 0; i < memberLDAP.length; i++) {
                        var phonebook = memberLDAP[i]["phonebook_dn"];

                        if (phonebook && (phonebook !== "ou=pbx,dc=pbx,dc=com")) {
                            var members = memberLDAP[i]["members"] ? memberLDAP[i]["members"].split('|') : [];

                            for (var j = 0, length = members.length; j < length; j++) {
                                var text = '',
                                    value = '',
                                    extension = members[j];

                                if (extension) {
                                    text = extension + '(' + phonebook.split(',')[0] + ')';
                                    value = extension + '#' + phonebook;

                                    dodExt.push(value);
                                    dodExtList.push({
                                        'val': value,
                                        'attr': 'LDAP',
                                        'text': text
                                    });
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': "listDODVoIPTrunk",
            'trunk': trunkIndex,
            'options': "members,members_ldap"
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                var dod = data.response.dod;

                membersArr = [];

                $.each(dod, function(index, item) {
                    var members = (item.members ? item.members.split(",") : []),
                        members_ldap = (item.members_ldap ? item.members_ldap.split("|") : []);

                    $.each(members, function(index, item) {
                        membersArr.push(item);
                    });

                    $.each(members_ldap, function(index, item) {
                        membersArr.push(item);
                    });
                });
            }
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            optionType = "add";

            editSingleDod();

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnEdit', 'click', function(ev) {
            optionType = "edit";

            editSingleDod();

            ev.stopPropagation();
            return false;
        });

    $("#dod_list")
        .delegate('.del', 'click', function(ev) {
            var number = $(this).attr('number'),
                trunk = gup.call(window, "trunkIndex");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG2677"), number),
                buttons: {
                    ok: function() {
                        var action = {
                            action: "deleteDODVoIPTrunk",
                            trunk: trunk,
                            number: number
                        };

                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            data: action,
                            error: function(jqXHR, textStatus, errorThrown) {
                                top.dialog.clearDialog();

                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown
                                // });
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data, function() {
                                    top.dialog.container.show();
                                    top.dialog.shadeDiv.show();
                                });

                                if (bool) {
                                    // $("#dod_list").trigger('reloadGrid');
                                    // getList();
                                    mWindow.delAstdb(trunk);

                                    top.dialog.dialogInnerhtml({
                                        dialogTitle: $P.lang("LANG2675"),
                                        displayPos: "editForm",
                                        frameSrc: "html/trunk_dod_modal.html?&trunkIndex=" + trunk
                                    });
                                }
                            }
                        });
                    },
                    cancel: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                }
            });

            return false;
        });
}

function createTable() {
    $("#dod_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: 650,
        height: "auto",
        rowNum: 6,
        postData: {
            action: "listDODVoIPTrunk",
            trunk: trunkIndex,
            options: "number,add_extension,members,members_ldap"
        },
        colNames: [
            '<span locale="LANG2677">' + $P.lang('LANG2677') + '</span>',
            '<span locale="LANG87">' + $P.lang('LANG87') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'number',
            index: 'number',
            width: 100,
            align: "center"
        }, {
            name: 'members',
            index: 'members',
            width: 100,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#dod_list_pager",
        // multiselect: false,
        // multiboxonly: false,
        viewrecords: true,
        sortname: 'number',
        noData: "LANG2678",
        jsonReader: {
            root: "response.dod",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#dod_list .jqgrow:even").addClass("ui-row-even");

            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();
        },
        gridComplete: function(data) {
            editDodData = data.response.dod;

            if (editDodData.length == 0) {
                $("#btnEdit").attr("disabled", true).addClass("disabled");
            }

            $P.lang(doc, true);
        }
    });
}

function createOptions(cellvalue, options, rowObject) {
    var del = '<button number="' + rowObject.number + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return del;
}

function dodNumberIsExist() {
    var numberVal = $("#number").val(),
        tmpDodNumberArr = [];

    tmpDodNumberArr = dodNumberArr.copy(tmpDodNumberArr);

    return !UCMGUI.inArray(numberVal, tmpDodNumberArr);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "number": {
                required: true,
                //authid: true,
                calleridSip: true,
                minlength: 2,
                isExist: [$P.lang("LANG270").format($P.lang("LANG2680")), dodNumberIsExist]
            },
            "rightSelect": {
                selectItemMin: 1
            }
        },
        submitHandler: function() {
            var action = {},
                members = [],
                members_ldap = [];

            action["number"] = optionType == 'edit' ? $("#selectbox_dod").val() : $("#number").val();
            action["action"] = optionType == 'edit' ? "updateDODVoIPTrunk" : "addDODVoIPTrunk";
            action["trunk"] = trunkIndex;

            if (optionType == 'edit') {}

            $.each($("#rightSelect").children(), function(index, item) {
                var option = $(item),
                    attr = option.attr('attr');

                if (attr === 'LDAP') {
                    members_ldap.push(option.val());
                } else {
                    members.push(option.val());
                }
            });

            if (members.length) {
                action["members"] = members.toString();
            }

            if (members_ldap.length) {
                action["members_ldap"] = members_ldap.join('|');
            }

            action["add_extension"] = $("#add_extension").is(":checked") ? "yes" : "no";

            updateOrAddDodInfo(action);
        }
    });
}

function updateOrAddDodInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                mWindow.delAstdb(action.trunk);

                $(".dod_flipbox").flippyReverse();

                // $("#edit_DOD_back").show();
                $("#edit_DOD_cancel, #edit_DOD_save").hide();
            }
        }
    });
}

function editSingleDod() {
    var editHTML = "";

    $("#edit_DOD_cancel").removeAttr("onclick");

    if (optionType == 'edit') {
        editHTML = "<div class='dod_editor'>\
            <div class=\"field-cell\">\
            <div class=\"field-label\" glabel=\"@LANG2680\">\
            " + $P.lang("LANG2680") + "</div>\
            <div class=\"field-content\">\
            <select id=\"selectbox_dod\" name=\"select_dod\" class=\"styled\" style=\"width: 70px;\"></select>\
            </div>\
            </div>\
            <div class=\"field-cell\">\
            <div class=\"field-label\" glabel=\"@LANG5184\" tooltip=\"@LANG5185\">\
            " + $P.lang("LANG5184") + "</div>\
            <div class=\"field-content\">\
            <input type=\"checkbox\" id=\"add_extension\" name=\"add_extension\" />\
            </div>\
            </div>\
            <div class=\"field-cell\">\
            <div class=\"field-label\">\
            </div>\
            <div class=\"field-content\">\
            <div id='edit_includeCheckboxes_div'>\
            <table cellpadding=\"2\" cellspacing=\"2\" border=\"0\" width=\"90%\" align=\"center\">\
            <tr>\
            <td align=\"center\" valign=\"top\">\
            <b locale=\"LANG2484\">\</b>\
            </td>\
            <td width=\"50\" align=\"center\">\
            </td>\
            <td align=\"center\" valign=\"top\">\
            <b locale=\"LANG2483\">\</b>\
            </td>\
            </tr>\
            <tr>\
            <td align=\"left\" valign=\"top\">\
            <select id=\"leftSelect\" multiple style=\"width: 240px; height: 95px\" size=\"8\" >\
            </select>\
            </td>\
            <td width=\"80\" align=\"center\" valign=\"center\">\
            <span class=\"selectIcon addAll\" id=\"allToRight\"></span>\
            <span class=\"selectIcon addRight\" id=\"oneToRight\"></span>\
            <span class=\"selectIcon addLeft\" id=\"oneToLeft\"></span>\
            <span class=\"selectIcon removeAll\" id=\"allToLeft\"></span>\
            </td>\
            <td align=\"right\" valign=\"top\">\
            <select name=\"rightSelect\" id=\"rightSelect\" multiple style=\"width: 240px; height: 95px\" size=\"8\" >\
            </select>\
            </td>\
            </tr>\
            </table>\
            </div>\
            </div>\
            </div>\
            </div>";
    } else {
        editHTML = "<div class='dod_editor'>\
            <div class=\"field-cell\">\
            <div class=\"field-label\" glabel=\"@LANG2680\">\
            " + $P.lang("LANG2680") + "</div>\
            <div class=\"field-content\">\
            <input type=\"text\" id=\"number\" name=\"number\" maxlength=\"32\" />\
            </div>\
            </div>\
            <div class=\"field-cell\">\
            <div class=\"field-label\" glabel=\"@LANG5184\" tooltip=\"@LANG5185\">\
            " + $P.lang("LANG5184") + "</div>\
            <div class=\"field-content\">\
            <input type=\"checkbox\" id=\"add_extension\" name=\"add_extension\" />\
            </div>\
            </div>\
            <div class=\"field-cell\">\
            <div class=\"field-label\">\
            </div>\
            <div class=\"field-content\">\
            <div id='edit_includeCheckboxes_div'>\
            <table cellpadding=\"2\" cellspacing=\"2\" border=\"0\" width=\"90%\" align=\"center\">\
            <tr>\
            <td align=\"center\" valign=\"top\">\
            <b locale=\"LANG2484\">\</b>\
            </td>\
            <td width=\"50\" align=\"center\">\
            </td>\
            <td align=\"center\" valign=\"top\">\
            <b locale=\"LANG2483\">\</b>\
            </td>\
            </tr>\
            <tr>\
            <td align=\"left\" valign=\"top\">\
            <select id=\"leftSelect\" multiple style=\"width: 240px; height: 95px\" size=\"8\" >\
            </select>\
            </td>\
            <td width=\"80\" align=\"center\" valign=\"center\">\
            <span class=\"selectIcon addAll\" id=\"allToRight\"></span>\
            <span class=\"selectIcon addRight\" id=\"oneToRight\"></span>\
            <span class=\"selectIcon addLeft\" id=\"oneToLeft\"></span>\
            <span class=\"selectIcon removeAll\" id=\"allToLeft\"></span>\
            </td>\
            <td align=\"right\" valign=\"top\">\
            <select name=\"rightSelect\" id=\"rightSelect\" multiple style=\"width: 240px; height: 95px\" size=\"8\" >\
            </select>\
            </td>\
            </tr>\
            </table>\
            </div>\
            </div>\
            </div>\
            </div>";
    }

    $(".dod_flipbox").flippy({
        color_target: "white",
        duration: "500",
        recto: $("#dod_mapping").innerHTML,
        verso: editHTML,
        direction: "BOTTOM",
        onFinish: function() {
            $P.lang(document, true);

            var tmpDodExt = [];

            tmpDodExt = dodExt.copy(tmpDodExt);
            tmpDodExt.remove(membersArr);

            selectbox.appendOpts({
                el: "leftSelect",
                opts: transData(tmpDodExt)
            }, doc);

            var dodNumberObj = {};
            var dodAddExtensionObj = {};

            dodNumberArr = [];

            $.each(editDodData, function(index, item) {
                var num = item.number;

                dodNumberArr.push(num);
            });

            if (optionType == "edit") {
                $.each(editDodData, function(index, item) {
                    var num = item.number;

                    dodNumberObj[num] = item.members ? item.members.split(",") : [];

                    if (item.members_ldap) {
                        dodNumberObj[num] = dodNumberObj[num].concat(item.members_ldap.split("|"));
                    }

                    dodAddExtensionObj[num] = item.add_extension;
                });

                selectbox.appendOpts({
                    el: "selectbox_dod",
                    opts: transData(dodNumberArr)
                }, doc);

                var selectboxDodVal = $("#selectbox_dod").val(),
                    transSelectboxDodVal = transData(dodNumberObj[selectboxDodVal]);

                $("#add_extension").attr("checked", (dodAddExtensionObj[selectboxDodVal] == "yes" ? true : false));

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: transSelectboxDodVal
                }, doc);

                $("#selectbox_dod").change(function(ev) {
                    var dodVal = $(this).val();
                    var dodMembersArr = dodNumberObj[dodVal];
                    var addExtensionVal = (dodAddExtensionObj[dodVal] == "yes" ? true : false);

                    $("#add_extension").attr("checked", addExtensionVal);

                    top.Custom.init(document, $("#add_extension")[0]);

                    selectbox.appendOpts({
                        el: "rightSelect",
                        opts: transData(dodMembersArr)
                    }, doc);
                });
            } else {
                var new_rule = {
                    required: true,
                    minlength: 2,
                    isExist: [$P.lang("LANG270").format($P.lang("LANG2680")), dodNumberIsExist]
                };

                if (signalling === 'PRI') {
                    new_rule.PRIDODNumber = true;
                } else if (signalling === 'SS7') {
                    new_rule.SS7DODNumber = true;
                } else if (signalling === 'MFC/R2') {
                    new_rule.digits = true;
                } else {
                    new_rule.calleridSip = true;
                }

                $P('#number', document).rules("remove");

                $P('#number', document).rules("add", new_rule);
            }

            selectbox.electedSelect({
                rightSelect: "rightSelect",
                leftSelect: "leftSelect",
                allToRight: "allToRight",
                oneToRight: "oneToRight",
                oneToLeft: "oneToLeft",
                allToLeft: "allToLeft",
                cb: function() {
                    $P("#rightSelect", doc).valid();
                }
            }, doc);

            $("#edit_DOD_cancel").unbind();
            $("#edit_DOD_cancel").click(function() {
                $(".dod_flipbox").flippyReverse();
                $("#edit_DOD_cancel, #edit_DOD_save").hide();
                // $("#edit_DOD_back").show();
            });

            $("#edit_DOD_cancel, #edit_DOD_save").show();
            // $("#edit_DOD_back").hide();

            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            top.Custom.init(document);
        },
        onReverseFinish: function() {
            $P.lang(document, true);

            $(".flipbox-container").remove();

            var flipboxContainer = "<div class='flipbox-container' style='width:650px; margin: 0 auto;'>\
                <div class='dod_flipbox'>\
                    <div class='top_buttons'>\
                        <button type='button' id='btnAdd' class='btn btn-update' align='left' locale='LANG2676'></button>\
                        <button type='button' id='btnEdit' class='btn btn-update' align='left' locale='LANG2675'></button>\
                    </div>\
                    <table id='dod_list'></table>\
                    <div id='dod_list_pager'></div>\
                </div>\
            </div>";

            $(flipboxContainer).insertAfter(".lite_desc");

            setTimeout(function() {
                createTable();
            }, 100);

            getList();                

            bindButtonEvent();

            $("#edit_DOD_cancel").unbind();

            $("#edit_DOD_cancel").click(function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            top.dialog.container.fadeIn('slow');

            top.Custom.init(document);
        }
    });
};

function hide() {
    top.dialog.clearDialog();
}

function transAccountVoicemailData(res, cb) {
    var arr = [];

    dodExt = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"': '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"': '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"': '');
        }

        dodExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            value = UCMGUI.ObjectArray.find('val', res[i], dodExtList);

        if (value) {
            arr.push(value);
        } else {
            obj['val'] = res[i];
            arr.push(obj);
        }
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
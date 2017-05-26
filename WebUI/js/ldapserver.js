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
    AST_BASE = "/app/asterisk",
    timeoutID = 0,
    extensionPrefSettings = UCMGUI.isExist.getRange(); // [disable_extension_ranges, rand_password, weak_password]

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;

function error_cb(jqXHR, textStatus, errorThrown) {
    top.dialog.clearDialog();

    top.dialog.dialogMessage({
        type: 'error',
        content: errorThrown,
        callback: function() {
            // UCMGUI.logoutFunction.doLogout();
        }
    });
}

function bindButtonEvent() {
    $("#pb-list")
        .delegate('.edit', 'click', function(ev) {
            var phonebookdn = $(this).attr('dn'),
                id = $(this).attr('id');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG953").format(phonebookdn),
                displayPos: "main",
                frameSrc: "../html/ldapserver_modal.html?mode=edit_phonebook&item=" + phonebookdn + "&id=" + id
            });
        })
        .delegate('.del', 'click', function(ev) {
            if ($(this).attr('id') == '1') {
                return;
            }

            var phonebookdn = $(this).attr('dn');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG952"), // $P.lang("LANG818").format(a),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deletePhonebook",
                            "ldap_phonebooks": phonebookdn
                        };

                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            async: false,
                            data: action,
                            error: error_cb,
                            success: function(data) {
                                var cmd_action = {
                                    "action": "phonebookDel",
                                    "phonebook_del": phonebookdn
                                };

                                $.ajax({
                                    type: "post",
                                    url: "../cgi",
                                    async: false,
                                    data: cmd_action,
                                    error: error_cb,
                                    success: function(data) {
                                        jumpPageOrNot(1);

                                        // $('#pb-list').trigger("reloadGrid");
                                    }
                                });
                            }
                        });
                    }
                }
            });
        });
}

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG712"));

    var ldap_configs = null,
        pbxdn = null,
        prefix_attr = null;

    var configs_action = {
        "action": "getLDAPConfig",
        "ldap_configs": null
    };  

    initValidator();

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: configs_action,
        error: error_cb,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data.response.ldap_configs) {
                    ldap_configs = data.response.ldap_configs[0];
                    pbx_dn = ldap_configs.pbxdn;
                    prefix_attr = ldap_configs.prefix_attr;

                    $("#basedn").val(ldap_configs.basedn);
                    $("#pbxdn").val(ldap_configs.pbxdn);
                    $("#rootdn").val(ldap_configs.rootdn);
                    $("#rootpw").val(ldap_configs.root_passwd);
                    $("#rootpwCfm").val(ldap_configs.root_passwd);
                }
            }
        }
    });

    createTable();

    createClient();

    bindButtonEvent();

    var add_phonebook = function() {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG955"),
            displayPos: "add_phonebookname",
            frameSrc: "../html/ldapserver_modal.html?mode=add_phonebook"
        });
    };
    var lead_phonebook = function() {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG3914"),
            displayPos: "lead_phonebook_div",
            frameSrc: "../html/ldapserver_modal.html?mode=lead_phonebook"
        });
    }
    var export_phonebook = function() {
        var sPhonebookList = sPhonebookData = "";
        var aCboxSelected = $("#pb-list").find("input.cbox:checked");
        aCboxSelected.each(function(){
            var txt = $(this).closest("td").siblings("td[aria-describedby='pb-list_dn']").text();
            sPhonebookList += txt.split(",")[0].split("=")[1] + ', ';
            sPhonebookData += "'"+txt + "',";
        });
        sPhonebookData = sPhonebookData.slice(0,-1);
        sPhonebookList = sPhonebookList.slice(0,-2);
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG3915"),
            displayPos: "export_phonebook_div",
            frameSrc: '../html/ldapserver_modal.html?mode=export_phonebook&data=' + sPhonebookData + '&book=' + sPhonebookList
        });
    }
    var isEnableWeakPw = function() {
        if (extensionPrefSettings[2] == 'yes') { // weak_password
            var obj = {
                pwsId: "#rootpw",
                doc: document
            };

            $P("#rootpw", document).rules("add", {
                checkAlphanumericPw: [UCMGUI.enableWeakPw.showCheckPassword, obj]
            });
        }
    };

    isEnableWeakPw();

    $('button#add_phonebook').on('click', add_phonebook);
    $('button#lead_phonebook').on('click', lead_phonebook);
    $('button#export_phonebook').on('click', export_phonebook);

    $("#show_pwd").on('click', function() {
        top.UCMGUI.show_password(this, 'pwSpan', timeoutID, 'rootpw', document)
    });

    top.Custom.init(document);
});

function jumpPageOrNot(selectedRows) {
    var table = $("#pb-list"),
        totalPage = table.getGridParam("lastpage"),
        page = table.getGridParam("page"),
        reccount = table.getGridParam("reccount");

    if (page === totalPage && totalPage > 1 && reccount === selectedRows) {
        table.setGridParam({
            page: totalPage - 1
        }).trigger('reloadGrid');
    } else {
        table.trigger('reloadGrid');
    }
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button id="' + rowObject.id + '" dn="' + rowObject.dn + '" title="Edit" localetitle="LANG738" class="options edit"></button>';

    if (rowObject.id == 1) {
        var del = '<button id="' + rowObject.id + '" dn="' + rowObject.dn + '" title="Delete" localetitle="LANG739" class="options del disabled" style="cursor: default;"></button>';
    } else {
        var del = '<button id="' + rowObject.id + '" dn="' + rowObject.dn + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    }

    return (edit + del);
}

function createTable() {
    $("#pb-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listPhonebookDn"
        },
        colNames: [
            '<span locale="LANG2003">' + $P.lang('LANG2003') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'dn',
            index: 'dn',
            width: 150,
            resizable: false,
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
        //rownumbers: true,
        //rownumWidth: 75,
        loadui: 'disable',
        pager: "#pb-pager",
        rowNum: 5,
        rowList: [5, 10, 15],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'id',
        noData: "LANG129 LANG576",
        jsonReader: {
            root: "response.ldap_phonebooks",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#pb-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            top.Custom.init(doc);
            $P.lang(doc, true);
        }
    });
}

function confUpdate() {
    if ($P("#form", document).valid()) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG904")
        });

        setTimeout(function() {
            var basedn = $("#basedn").val(),
                rootdn = $("#rootdn").val(),
                rootpw = $("#rootpw").val(),
                pbxdn = $("#pbxdn").val();

            var eq_pos = pbxdn.indexOf('='),
                prefix_attr = pbxdn.substring(0, eq_pos);

            /*
                var action = "action=systemcmdwithoutput",
                    cmd = 'sh ' + AST_BASE + '/bin/update_slapd_conf.sh ' + basedn + ' ' + rootdn + ' ' + rootpw + ' anonymous' + ' ' + prefix;

                var cb = function(op) {
                    var output = eval("(" + op + ")").body;

                    if (output.match(/LDAP_UPDATE_SUCCESS$/)) {
                        var after = function() {
                            top.dialog.dialogMessage({
                                type: "success",
                                content: $P.lang("LANG940")
                            });

                            window.location.reload();
                        };

                        var c = listOfActions("phonebookdn.conf");

                        c.new_action("autoupdate", "general", "basedn", basedn);
                        c.new_action("autoupdate", "1", "prefix", prefix);
                        c.callActions(after);
                    } else if (output.match(/LDAP_UPDATE_ERROR$/)) {
                        top.dialog.dialogMessage({
                            type: "error",
                            content: $P.lang("LANG2010")
                        });
                    } else if (output.match(/LDAP_SERVER_ERROR$/)) {
                        top.dialog.dialogMessage({
                            type: "error",
                            content: $P.lang("LANG2012")
                        });
                    } else {
                        top.dialog.dialogMessage({
                            type: "error",
                            content: $P.lang("LANG2013")
                        });
                    }
                }
            */

            var action = {
                "action": "updateLDAPConfig",
                "basedn": basedn,
                "pbxdn": pbxdn,
                "prefix_attr": prefix_attr,
                "rootdn": rootdn,
                "root_passwd": rootpw
            };

            $.ajax({
                type: "post",
                url: "../cgi",
                async: false,
                data: action,
                error: error_cb,
                success: function(data) {
                    var after = function() {
                        top.dialog.clearDialog();

                        top.dialog.dialogMessage({
                            type: "success",
                            content: $P.lang("LANG940"),
                            callback: function() {
                                window.location.reload();
                            }
                        });
                    };

                    var cmd_action = {
                        "action": "reloadLDAP",
                        "reload_ldap": null
                    };

                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: cmd_action,
                        error: error_cb,
                        success: after
                    });
                }
            });
        }, 200);
    }
}

/*
 * LDAP tooltips:
 *
 * "LDAP_INVALID_CHARS":"{0} can only contain such characters in square brackets:[=,a-zA-Z0-9] .",
 * "LDAP_BASEDN":"Base dn",
 * "LDAP_ROOTDN":"Root dn",
 * "LDAP_ROOTPW":"Root password",
 * "LDAP_PASSWD_CONFIRM_FAILED":"Twice passwords input are not the same !",
 * "LDAP_PBXDN":"Pbx dn",
 * "LDAP_INVALID_DN":"Invilid DN syntax !",
 * "LDAP_INVALID_ATTR":"Unknown attribute",
 * "LDAP_PBXDN_UNDER_BASEDN":"Pbx dn should end with base dn and be a immediate child of base dn !",
 * "LDAP_PBXDN_PREFIX_CONFLICT":"Prefix of pbx dn conflicts with another existing phonebook !",
 * "LDAP_ROOTDN_ENDWITH_BASEDN":"Root dn should end with base dn !",
 */

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "basedn": {
                required: true,
                customCallback: [$P.lang("LANG2014").format($P.lang('LANG1999')), valid_ldap_chars],
                customCallback1: [$P.lang("LANG2017"), valid_dn],
                customCallback2: ["", valid_attr]
            },
            "pbxdn": {
                required: true,
                customCallback: [$P.lang("LANG2014").format($P.lang('LANG2016')), valid_ldap_chars],
                customCallback1: [$P.lang("LANG2017"), valid_dn],
                customCallback2: ["", valid_attr],
                customCallback3: [$P.lang("LANG2019"), is_under_basedn],
                customCallback4: [$P.lang("LANG2020"), is_prefix_exist]
            },
            "rootdn": {
                required: true,
                customCallback: [$P.lang("LANG2014").format($P.lang('LANG2001')), valid_ldap_chars],
                customCallback1: [$P.lang("LANG2017"), valid_dn],
                customCallback2: ["", valid_attr],
                customCallback3: [$P.lang("LANG2021"), is_endWith_basedn]
            },
            "rootpw": {
                required: true,
                keyboradNoSpacesemicolon1: true,
                minlength: 4
            },
            "rootpwCfm": {
                required: true,
                customCallback: [$P.lang("LANG2015"),
                    function(val, ele) {
                        if (val != $("#rootpw").val())
                            return false;
                        return true;
                    }
                ]
            }
        }
    });

    if ($("#form_client").tooltip) {
        $("#form_client").tooltip();
    }

    $P("#form_client", document).validate({
        rules: {
            "ldap_server_name": {
                required: true,
                alphanumeric: true,
                customCallback: [$P.lang("LANG4198"), valid_ldap_server_name]
            },
            "ldap_server_address": {
                required: true,
                hostWithoutPort: [$P.lang('LANG1373').toLowerCase()]
            },
            "ldap_base": {
                required: true,
                customCallback: [$P.lang("LANG2014").format($P.lang('LANG1999')), valid_ldap_chars],
                customCallback1: [$P.lang("LANG2017"), valid_dn],
                customCallback2: ["", valid_attr]
            },
            "ldap_user": {
                //required: true,
                customCallback: [$P.lang("LANG2014").format($P.lang('LANG2001')), valid_client_ldap_chars],
                customCallback1: [$P.lang("LANG2017"), valid_client_dn],
                customCallback2: ["", valid_attr]
                //customCallback3: [$P.lang("LANG2021"), is_client_endWith_basedn]
            },
            "ldap_passwd": {
                //required: true,
                keyboradNoSpacesemicolon1: true,
                minlength: 4
            },
            /*"ldap_name_attrs": {
                letterswithbasicpunc: true
            },
            "ldap_number_attrs": {
                letterswithbasicpunc: true
            },*/
            "ldap_number_filter": {
                required: true,
                customCallback: [$P.lang("LANG2969"), valid_client_filter]
            },
            /*"ldap_name_filter": {
                customCallback: [$P.lang("LANG2969"), valid_client_filter],
            },
            "ldap_display_name": {
                letterswithbasicpunc: true
            },
            "ldap_version": {
                digits: true
            },*/
            "ldap_port": {
                required: true,
                digits: true,
                range: [1, 65535]
            },
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG904")
            });

            updateClient();
        }
    });
}

function createClient() {
    $.ajax({
        type: "GET",
        url: "../cgi?action=getLDAPClientConfig",
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
                var oData = data.response;
                $("#form_client input:visible").each(function() {
                    $(this).val(oData[this.id]);
                });
            }
        }
    });
}

function updateClient() {
    var action = {
        "action": "updateLDAPClientConfig"
    };

    $("#form_client input:visible").each(function() {
        action[this.id] = $(this).val();
    });

    var ldapServerAddress = action["ldap_server_address"];
    if (UCMGUI.isIPv6NoPort(ldapServerAddress)) {
        action["ldap_server_address"] = "[" + ldapServerAddress + "]";
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $.ajax({
                    type: 'GET',
                    url: '../cgi?action=runLDAPClient&runldapclient',
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown
                        });
                    }, 
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data),
                            sRes = data.response.runldapclient,
                            sError;

                        if (bool) {
                            if (sRes === "") {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG844"),
                                    callback: function() {
                                        $("#pb-list", document).trigger('reloadGrid');
                                    }
                                });
                            }
                            else {
                                switch(sRes) {
                                    case "-1":
                                    sError = "LANG4121";
                                    break;
                                    case "-2":
                                    sError = "LANG4122";
                                    break;
                                    case "-3":
                                    sError = "LANG2969";
                                    break;
                                    case "-4":
                                    sError = "LANG4123";
                                    break;
                                    default:
                                    sError = "LANG909";
                                    break;
                                }
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: $P.lang(sError)
                                });
                            }
                        }
                    }
                });
            }
        }
    });
}

function valid_client_filter(val, ele) {
    if (val == "") {
        return true;
    }
    var rFilter = /^\(.+\)$/;
    if (rFilter.test(val)) {
        return true;
    }
    return false;
}

function is_prefix_exist(val, ele) {
    var dn_list = null,
        prefix = val.rChop(',' + $("#basedn").val()),
        action = {
            "action": "listPhonebookDn",
            "options": "id, dn"
        };

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: action,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                dn_list = data.response.ldap_phonebooks;
            }
        }
    });

    if (dn_list) {
        for (var key in dn_list) {
            if (dn_list.hasOwnProperty(key) && dn_list[key].id !== 1) {
                var this_prefix = dn_list[key].dn.split(',')[0];

                if (this_prefix === prefix) {
                    return false;
                }
            }
        }
    }

    return true;
}

function valid_ldap_chars(val, ele) {
    if (!val.match(/^[a-zA-Z0-9=,_]+$/)) {
        return false;
    }

    return true;
}

function valid_client_ldap_chars(val, ele) {
    if (val == "") {
        return true;
    }
    if (!val.match(/^[a-zA-Z0-9=,_]+$/)) {
        return false;
    }

    return true;
}

function valid_dn(val, ele) {
    /*
     * eg:
     *    dc=_ab
     *    cn=_0ab,dc=com   
     *    ou=ab,dc=com,dc=cc
 
     * attr:   [a-z]+
     * val:    [a-z0-9_]+
     * Reg expression match DN: (attr=val,)*(attr=val)
     * use "i" to ignore case sensitive
     */

    if (!val.match(/^([a-z]+=[a-z0-9_]+,)*([a-z]+=[a-z0-9_]+)$/i)) {
        return false;
    }

    return true;
}

function valid_client_dn(val, ele) {
    if (val == "") {
        return true;
    }
    /*
     * eg:
     *    dc=_ab
     *    cn=_0ab,dc=com   
     *    ou=ab,dc=com,dc=cc
 
     * attr:   [a-z]+
     * val:    [a-z0-9_]+
     * Reg expression match DN: (attr=val,)*(attr=val)
     * use "i" to ignore case sensitive
     */

    if (!val.match(/^([a-z]+=[a-z0-9_]+,)*([a-z]+=[a-z0-9_]+)$/i)) {
        return false;
    }

    return true;
}

/*
 * # =====attribute types=====
 * st|stateorprovincename|street|streetaddress|l|localityname|c|countryname|o|organizationname|ou|organizationalunitname|cn|commonname|dc|domaincomponent|uid|userid
 * # =========================
 */
function valid_attr(val, ele) {
    var pos_eq = 0,
        pos_com = 0,
        str = val;

    while ((pos_eq = str.indexOf("=")) >= 0) {
        $P(ele).removeData('msg-customcallback2');

        if (!str.match(/^(st|stateorprovincename|street|streetaddress|l|localityname|c|countryname|o|organizationname|ou|organizationalunitname|cn|commonname|dc|domaincomponent|uid|userid)=/i)) {
            var attrname = str.substring(0, pos_eq);

            $P(ele).data('msg-customcallback2', $P.lang("LANG2018") + ' : ' + attrname);

            return false;
        }

        pos_com = str.indexOf(",");

        if (pos_com < 0) {
            break;
        }

        str = str.substring(pos_com + 1);
    }

    return true;
}

function is_endWith_basedn(val, ele) {

    // String.prototype.endsWith = top.String.prototype.endsWith
    if (!val.endsWith($("#basedn").val())) {
        return false;
    }

    return true;
}

function is_client_endWith_basedn(val, ele) {

    if (val == "") {
        return true;
    }

    // String.prototype.endsWith = top.String.prototype.endsWith
    if (!val.endsWith($("#ldap_base").val())) {
        return false;
    }

    return true;
} 

function is_under_basedn(val, ele) {
    if (!val.endsWith($("#basedn").val())) {
        return false;
    }

    var prefix = val.rChop($("#basedn").val());

    if (!prefix.match(/^[a-z]+=[a-z0-9_]+,$/i)) {
        return false;
    }

    return true;
}

function valid_ldap_server_name(val, ele) {
    if (val === 'pbx') {
        return false;
    }

    return true;
}
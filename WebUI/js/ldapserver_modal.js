/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

String.prototype.format = top.String.prototype.format;
String.prototype.betweenXY = top.String.prototype.betweenXY;
String.prototype.beforeChar = top.String.prototype.beforeChar;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.rChop = top.String.prototype.rChop;
String.prototype.endsWith = top.String.prototype.endsWith;
Array.prototype.contains = top.Array.prototype.contains;
Array.prototype.indexOf = top.Array.prototype.indexOf;

var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    upload = $("#upload"), // local upload firmware
    fileUrl = document.getElementById('fileUrl'),
    udo = $('#lead_btn'),
    config = UCMGUI.config,
    AST_BASE = "/app/asterisk",
    uploadObj = {},
    uploadErrObj = {
        "1": "LANG890",
        "2": "LANG891",
        "3": "LANG892",
        "4": "LANG893",
        "5": "LANG894",
        "6": "LANG895",
        "7": "LANG896",
        "8": "LANG897",
        "9": "LANG898",
        "10": "LANG899"
    };

var item = UCMGUI.gup.call(window, "item"),
    mode = UCMGUI.gup.call(window, "mode"),
    mWindow = top.frames['frameContainer'].frames['mainScreen']; // this will be the main window
// phonebook_script = "/app/asterisk/bin/ast_phonebook.sh";

$(function() {
    $P.lang(document, true);

    var ldap_attrs = [
        "accountnumber",
        "calleridname",
        "email",
        "mobilenumber",
        "homenumber",
        "department",
        "fax",
        "firstname",
        "lastname"
    ];

    if (mode == 'edit_phonebook') {

        // var phonebookArr = new Array,
        //     phonebookObj = new ASTGUI.customObject;

        // $.each(phonebook_conf, function(index) {
        //     if (phonebook_conf.getProperty(index)) {
        //         phonebookArr.push(index);
        //     }
        // });

        // phonebookArr = phonebookArr.sortExtension();

        // $.each(phonebookArr, function(index) {
        //     index = phonebookArr[index];
        //     phonebookObj[index] = phonebook_conf[index]
        // });

        if (item_id == "1") {
            var action = {
                "action": "listPBXContacts",
                "pbx_contacts": null
            };
        } else {
            var action = {
                "action": "listLDAPContacts",
                "phonebook_dn": item
            };
        }

        var contacts = null;

        $.ajax({
            type: "post",
            url: "../cgi",
            async: false,
            data: action,
            error: error_cb,
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    if (item_id == "1") {
                        if (data.response.pbx_contacts) {
                            contacts = data.response.pbx_contacts;
                        }
                    } else {
                        if (data.response.phonebook_dn) {
                            contacts = data.response.phonebook_dn;
                        }
                    }
                }
            }
        });

        list_contacts = {};

        if (item_id == "1") {
            var len = contacts.extension.length;

            for (var i = 0; i < len; i++) {
                var account = contacts.extension[i],
                    contact = {};

                contact["accountnumber"] = account;
                contact["calleridname"] = contacts.fullname[i];
                contact["email"] = contacts.email[i];
                contact["mobilenumber"] = contacts.phone_number[i];
                contact["homenumber"] = contacts.family_number[i];
                contact["department"] = contacts.department[i];
                contact["fax"] = contacts.fax[i];
                contact["firstname"] = contacts.first_name[i];
                contact["lastname"] = contacts.last_name[i];

                list_contacts[account] = contact;
            }
        } else {
            for (var key in contacts) {
                if (contacts.hasOwnProperty(key)) {
                    var contact = contacts[key],
                        account = contact["accountnumber"];

                    list_contacts[account] = contact;
                }
            }
        }

        cache_contacts = $.extend(true, {}, list_contacts);

        $("#contact_list").createList(list_contacts);

        var list_click = function() {
            var account = $(this).find("td:first").text();

            if ($('#contact_list tr.selected').hasClass('changed')) {
                $('#contact_list tr.selected').addClass('colorchange');
            }

            $('#contact_list tr.selected').removeClass("selected").removeAttr('oldid');

            if ($(this).hasClass('changed')) {
                $(this).removeClass('colorchange');
            }

            $(this).addClass("selected").attr('oldid', account);

            $('div.add-button').hide();

            if (item_id == "1") {
                $('div.edit-button').hide();
            } else {
                $('div.edit-button').show();
            }

            for (var key in cache_contacts) {
                if (cache_contacts.hasOwnProperty(key)) {
                    var accountnum = key;

                    if (accountnum === account) {
                        for (var i = 0; i < ldap_attrs.length; i++) {
                            var attr_val = cache_contacts[key][ldap_attrs[i]]

                            attr_val = attr_val ? attr_val : "";

                            $('#' + ldap_attrs[i]).val(attr_val);
                        }
                    }
                }
            }

            if (item_id == "1") {
                for (var i = 0; i < ldap_attrs.length; i++) {
                    $('#' + ldap_attrs[i]).css('background', '#e5e5e5').attr('readonly', true);
                }

                $('div.top-buttons').hide();
                $('#save_contacts').hide();
            } else {
                $('div.top-buttons').show();
            }
        };

        var delete_contact = function(event) {
            event.stopPropagation();

            var ele = event.target,
                account = $(ele).attr('id');

            // var dn = $(ele).attr('dn'),
            //     action = {
            //         "action" : "deleteContact",
            //         "ldap_contacts" :  {
            //             "phonebook_dn" : dn,
            //             "accountnumber" : account
            //         }
            //     };

            // $.ajax({
            //     type: "post",
            //     url: "../cgi",
            //     async: false,
            //     data: action,
            //     error: error_cb,
            //     success: function(data) {}
            // });

            delete cache_contacts[account];

            if (!change_list.contains(account)) {
                change_list.push(account);
            }

            $(ele).parent().parent().remove();

            if ($('#contact_list tr.selected').length == 0) {
                $('div.edit-button').hide();
                $('div.add-button').show();
            }
        };

        $("#contact_list > tbody > tr").on('click', list_click);

        var update_cache = function() {
            if (cache_contacts[$('#accountnumber').val()]) {
                delete cache_contacts[$('#accountnumber').val()];
            }

            cache_contacts[$('#accountnumber').val()] = {};

            for (var i = 0; i < ldap_attrs.length; i++) {
                cache_contacts[$('#accountnumber').val()][ldap_attrs[i]] = $('#' + ldap_attrs[i]).val();
            }
        };

        var showLoadGif = function() {
            var l = parseInt($("#main").width() - $('#contact_loading').width()) / 2,
                t = parseInt($("#main").height() - $('#contact_loading').height()) / 2;
            $('#contact_loading').css('left', l).css('top', t).show();
        };

        var moveup = function(z) {
            $('#contact_loading').hide();

            top.dialog.container.css('z-index', z);

            var ele = $('#contact_list tr.selected');

            if (!ele.hasClass('changed')) {
                ele.addClass('changed');
            }

            ele.removeClass('selected').addClass('colorchange').addClass('selected');
        };

        $('#add_contact').on('click', function(event) {
            if ($P("#form", document).valid()) {
                event.preventDefault();

                var oldZindex = top.dialog.container.css('z-index'),
                    shadeZindex = parseInt(top.$('div.shadeDiv').css('z-index')),
                    acctnum = $('#accountnumber').val();

                top.dialog.container.css('z-index', shadeZindex - 1);

                showLoadGif();

                $('div.add-button').hide();
                $('div.edit-button').show();

                update_cache();

                if (!change_list.contains(acctnum)) {
                    change_list.push(acctnum);
                }

                $('#contact_list > tbody')
                    .append('<tr align="center"></tr>').find('tr:last')
                    .append('<td>' + acctnum + '</td>')
                    .append('<td>' + $('#calleridname').val() + '</td>')
                    .append('<td><button id="' + acctnum + '" class="options del" localeTitle="LANG739" title="' + $P.lang("LANG739") + '"></button></td>')
                    .on('click', list_click)
                    .trigger('click')
                    .find('button.del')
                    .on('click', delete_contact);

                setTimeout(function() {
                    moveup(oldZindex)
                }, 300);
            }
        });

        $('#update_contact').on('click', function(event) {
            if ($P("#form", document).valid()) {
                event.preventDefault();

                var oldZindex = top.dialog.container.css('z-index'),
                    shadeZindex = parseInt(top.$('div.shadeDiv').css('z-index')),
                    oldid = $('#contact_list tr.selected').attr('oldid'),
                    acctnum = $('#accountnumber').val();

                top.dialog.container.css('z-index', shadeZindex - 1);

                showLoadGif();

                update_cache();

                if (oldid === acctnum) {
                    if (!change_list.contains(acctnum)) {
                        change_list.push(acctnum);
                    }
                } else {
                    delete cache_contacts[oldid];

                    if (!change_list.contains(oldid)) {
                        change_list.push(oldid);
                    }
                    if (!change_list.contains(acctnum)) {
                        change_list.push(acctnum);
                    }
                }

                // update 'oldid' attribute
                $('#contact_list tr.selected').attr('oldid', $('#accountnumber').val());
                $('#contact_list tr.selected >td:eq(0)').text($('#accountnumber').val())
                    .next().text($('#calleridname').val())
                    .next().find('button.del').attr('id', $('#accountnumber').val());

                setTimeout(function() {
                    moveup(oldZindex)
                }, 300);
            }
        });

        $('#contact_list button.del').on('click', delete_contact);

        var clear = function() {
            for (var i = 0; i < ldap_attrs.length; i++) {
                if (item_id == "1") {
                    if (ldap_attrs[i] == "accountnumber" || ldap_attrs[i] == "calleridname" || ldap_attrs[i] == "email") {
                        continue;
                    }
                }

                $('#' + ldap_attrs[i]).val('');
            }
        };

        var create_contact = function() {
            clear();

            $('#contact_list tr.selected').removeClass('selected');
            $('#accountnumber').focus();
            $('div.edit-button').hide();
            $('div.add-button').show();
        }

        $('#create_contact').on('click', create_contact);
        $('button.clear').on('click', clear);

        $('#save_contacts').on('click', function(event) {
            event.preventDefault();

            top.dialog.container.hide();

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG2439")
            });

            var after = function() {
                var cmd_action = {
                    "action": "phonebookUpdate",
                    "phonebook_update": item
                };

                top.dialog.clearDialog();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    async: false,
                    data: cmd_action,
                    error: error_cb,
                    success: function() {}
                });

                // TODO: export ldif
            };

            for (var key in change_list) {
                if (change_list.hasOwnProperty(key)) {
                    var change = true,
                        acctnum = change_list[key];

                    if (list_contacts.hasOwnProperty(acctnum) && cache_contacts.hasOwnProperty(acctnum)) {
                        var action = {
                            "action": "updateContact",
                            "ldap_contacts": JSON.stringify({
                                "phonebook_dn": item,
                                "accountnumber": acctnum
                            }),
                            "phonebook_dn": item,
                            "accountnumber": acctnum,
                            "calleridname": cache_contacts[acctnum]["calleridname"],
                            "email": cache_contacts[acctnum]["email"],
                            "firstname": cache_contacts[acctnum]["firstname"],
                            "lastname": cache_contacts[acctnum]["lastname"],
                            "department": cache_contacts[acctnum]["department"],
                            "mobilenumber": cache_contacts[acctnum]["mobilenumber"],
                            "homenumber": cache_contacts[acctnum]["homenumber"],
                            "fax": cache_contacts[acctnum]["fax"]
                        };
                    } else if (list_contacts.hasOwnProperty(acctnum) && false === cache_contacts.hasOwnProperty(acctnum)) {
                        var action = {
                            "action": "deleteContact",
                            "ldap_contacts": JSON.stringify({
                                "phonebook_dn": item,
                                "accountnumber": acctnum,
                            }),
                            "ringgroup_mem_exten": JSON.stringify({
                                "phonebook_dn": item,
                                "member_extension": acctnum
                            })
                        };
                    } else if (false === list_contacts.hasOwnProperty(acctnum) && cache_contacts.hasOwnProperty(acctnum)) {
                        var action = {
                            "action": "addContact",
                            "phonebook_dn": item,
                            "accountnumber": acctnum,
                            "calleridname": cache_contacts[acctnum]["calleridname"],
                            "email": cache_contacts[acctnum]["email"],
                            "firstname": cache_contacts[acctnum]["firstname"],
                            "lastname": cache_contacts[acctnum]["lastname"],
                            "department": cache_contacts[acctnum]["department"],
                            "mobilenumber": cache_contacts[acctnum]["mobilenumber"],
                            "homenumber": cache_contacts[acctnum]["homenumber"],
                            "fax": cache_contacts[acctnum]["fax"]
                        };

                    } else {
                        change = false;
                    }

                    if (change) {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            async: false,
                            data: action,
                            error: error_cb,
                            success: function(data) {}
                        });
                    }
                }
            }

            after();

        });
    } else if (mode === 'add_phonebook') {
        var autofill = function() {
            var reg = new RegExp('=' + pbxdn.betweenXY('=', ',') + ','),
                phonebookname = $('input#phonebookname').val(),
                phonebookdn = pbxdn.rChop(basedn).replace(reg, '=' + phonebookname + ',') + basedn;

            $('input#phonebookdn').val(phonebookname ? phonebookdn : '');
        };

        $('input#phonebookname').on('keydown', autofill).on('keyup', autofill);

        $('button#add_phonebook').on('click', function(event) {
            if ($P("#form_phonebook", document).valid()) {
                event.preventDefault();

                top.dialog.clearDialog();

                var prefix = $("#phonebookname").val(),
                    phonebookdn = $("#phonebookdn").val(),
                    action = {
                        "action": "addPhonebook",
                        "ldap_phonebooks": phonebookdn,
                        "phonebook_prefix": prefix,
                        "dn_id": null
                    };

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    async: false,
                    data: action,
                    error: error_cb,
                    success: function(data) {
                        var cmd_action = {
                            "action": "phonebookAdd",
                            "phonebook_add": phonebookdn
                        };

                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            async: false,
                            data: cmd_action,
                            error: error_cb,
                            success: function() {
                                mWindow.location.reload();
                            }
                        });
                    }
                });

            }
        });
    } else if (mode === "lead_phonebook") {
        initUpload()
        initForm();
    } else if (mode === "export_phonebook") {
        exportBook();
    }

    $('#lead_type').change(function(event) {
        uploadObj = {};

        fileUrl.value = '';

        initUpload();
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    });
});

function initUpload() {
    var leadTypeStr = 'import_' + $("#lead_type").val() + '_phonebooks';

    uploadObj = new AjaxUpload(upload, {
        action: baseServerURl + '?action=uploadfile&type=' + leadTypeStr,
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileUrl.value = file;
            // $P("#form_moh", document).valid();
        },
        onSubmit: function(file, ext) {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: function(file, data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });
            if (bool) {
                if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result')) {
                    if (data.response.result == 0) {
                        // import extensions after upload successfully
                        top.dialog.closeCurrentDialog();

                        // if there is any failed extensions.
                        $.ajax({
                            type: "GET",
                            async: false,
                            dataType: "json",
                            url: "../import_phonebook_response.json",
                            error: function(jqXHR, textStatus, errorThrown) {},
                            success: function(data) {

                                var aErr = {
                                    '-2': 'LANG4365',
                                    '-3': 'LANG3203',
                                    '-4': 'LANG4366',
                                    '-5': 'LANG2152'
                                };

                                var nRes = data.result,
                                    sResult = $P.lang("LANG3917").format(data.success, data.failed) + ' ',
                                    sErrMsg = '';

                                if (nRes === -4) {
                                    var sDn = mWindow.$("#pbxdn", mWindow.document).val().split(',')[0].split('=')[1];
                                    sErrMsg = nRes === 0 ? '' : $P.lang("LANG4364").format($P.lang(aErr[nRes])).format(sDn);
                                } else {
                                    sErrMsg = nRes === 0 ? '' : $P.lang("LANG4364").format($P.lang(aErr[nRes]));
                                }

                                sResult = sResult + sErrMsg;

                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: sResult,
                                    callback: function(argument) {
                                        if (data.success != 0) {
                                            mWindow.$("#pb-list", mWindow.document).trigger('reloadGrid');
                                        }
                                    }
                                });

                            }
                        });
                    } else if (data.response.result == -1) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang('LANG3204')
                        });
                    } else {
                        top.dialog.clearDialog();

                        var message = $P.lang("LANG907");

                        if (parseInt(data.response.result) < 0) {
                            message = $P.lang(uploadErrObj[Math.abs(parseInt(data.response.result)).toString()]);
                        } else if (parseInt(data.response.result) == 4) {
                            message = $P.lang("LANG915");
                        } else if (data.response.body) {
                            message = data.response.body;
                        }


                        top.dialog.dialogMessage({
                            type: 'error',
                            content: message,
                            callback: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        });
                    }
                }

                fileUrl.value = "";
            }
        }
    });
}

if (mode == 'add_phonebook') {
    var configs_action = {
            "action": "getLDAPConfig",
            "ldap_configs": null
        },
        basedn = null,
        pbxdn = null;

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
                    var ldap_configs = data.response.ldap_configs[0];

                    basedn = ldap_configs.basedn;
                    pbxdn = ldap_configs.pbxdn;
                }
            }
        }
    });
} else if (mode == 'edit_phonebook') {
    var item_id = UCMGUI.gup.call(window, "id"),
        list_contacts = null,
        cache_contacts = null,
        change_list = [];

    // LDAP sync script may change phonebook conf file , we always read phonebook conf file other than file cache.  
    // if (top.sessionData.FileCache.hasOwnProperty(item)) {
    //     top.sessionData.FileCache[item].modified = true;
    // }

    // var phonebook_conf = config2json({
    //         filename: item,
    //         usf: 1
    //     }),
    //     needwrite = [];
}

$.fn.extend({
    createList: function(list) {
        if (item_id === "1") {
            $(this).append('<thead class="thead"></thead>').find('thead')
                .append('<tr align="center"></tr>').find('tr')
                .append('<td width="40%"  locale="LANG2222">' + $P.lang("LANG2222") + '</td><td width="60%" locale="LANG1361">' + $P.lang("LANG1361") + '</td>');
        } else {
            $(this).append('<thead class="thead"></thead>').find('thead')
                .append('<tr align="center"></tr>').find('tr')
                .append('<td width="35%" locale="LANG2222">' + $P.lang("LANG2222") + '</td><td width="35%" locale="LANG1361">' + $P.lang("LANG1361") + '</td><td width="30%" locale="LANG74">' + $P.lang("LANG74") + '</td>');
        }

        var tbody = $(this).append('<tbody class="tbody"></tbody>').find('tbody');

        $.each(list, function(i, entry) { // i is accountnumber
            if (list.hasOwnProperty(i)) {
                var accountNum = i,
                    calleridName = entry['calleridname'] ? entry['calleridname'] : "--";

                if (item_id === "1") {
                    tbody.append('<tr align="center"></tr>').find('tr:last')
                        .append('<td>' + accountNum + '</td>')
                        .append('<td>' + calleridName + '</td>');
                } else {
                    tbody.append('<tr align="center"></tr>').find('tr:last')
                        .append('<td>' + accountNum + '</td>')
                        .append('<td>' + calleridName + '</td>')
                        .append('<td><button id="' + accountNum + '" class="options del" localeTitle="LANG739" title="' + $P.lang("LANG739") + '"></button></td>');
                }
            }
        });
    }
});

window.onload = function() {
    // var url = top.$.url(window.location.href, true);

    if (mode === "edit_phonebook") {
        $('div#add_phonebookname').hide();
        $("#lead_phonebook_div").hide();
        $("#export_phonebook_div").hide();

        if ($("#contact_list > tbody > tr").length > 0) {
            $("#contact_list > tbody > tr:first").trigger('click');
            $("#edit_phonebook_div").show();
        } else {
            if (item_id == "1") {
                $('div#main').hide();

                top.dialog.dialogMessage({
                    type: 'info',
                    content: $P.lang("LANG954")
                });
            } else {
                $('div.add-button').show();
                $('div.edit-button').hide();
                $('div.top-buttons').show();
                $("#edit_phonebook_div").show();
            }
        }

        contact_validate();
    } else if (mode === 'add_phonebook') {
        $('div#main').hide();

        $("#lead_phonebook_div").hide();
        $("#export_phonebook_div").hide();
        $('div#add_phonebookname').show();

        phonebookName_valid();
    } else if (mode === "lead_phonebook") {
        $('div#main').hide();

        $('div#add_phonebookname').hide();
        $("#lead_phonebook_div").show();
        $("#export_phonebook_div").hide();
    } else if (mode === "export_phonebook") {
        $('div#main').hide();

        $('div#add_phonebookname').hide();
        $("#lead_phonebook_div").hide();
        $("#export_phonebook_div").show();
    }

    top.Custom.init(doc);
};

function error_cb(jqXHR, textStatus, errorThrown) {
    top.dialog.clearDialog();

    // top.dialog.dialogMessage({
    //     type: 'error',
    //     content: errorThrown,
    //     callback: function() {
    //         // UCMGUI.logoutFunction.doLogout();
    //     }
    // });
}

function exportBook() {
    var sPhonebookData = UCMGUI.gup.call(window, "data"),
        sBooks = decodeURIComponent(UCMGUI.gup.call(window, "book"));

    $("#phonebook_wrap").html(sBooks || $P.lang("LANG3916"));

    $("#export_btn").on('click', function() {
        top.window.open('/cgi?action=downloadFile&type=export_' + $("#export_type").val() + '_phonebooks&data=' + sPhonebookData, '_self');

        top.dialog.clearDialog();

        return false;
    });
}

function checkFileType(val, ele) {
    var sType = $("#lead_type").val();

    if ((val.toLowerCase().endsWith(".csv") && sType == "csv") || (val.toLowerCase().endsWith(".vcf") && sType == "vcf")) {
        return true;
    }

    return false;
}

function initForm() {
    $("#lead_phonebook").tooltip();

    $P("#lead_phonebook", document).validate({
        rules: {
            "fileUrl": {
                required: true,
                customCallback: [$P.lang("LANG4085"), checkFileType]
            }
        }
    });

    udo.on('click', function(ev) {
        if (!$P("#lead_phonebook", document).valid()) {
            return;
        }

        uploadObj.submit();

        ev.preventDefault();
    });
}

function phonebookName_valid() {
    $("#form_phonebook").tooltip();

    $P("#form_phonebook", document).validate({
        debug: true,
        rules: {
            'phonebookname': {
                required: true,
                alphanumericUnd: true,
                customCallback: [$P.lang("LANG2210"), is_phonebook_exist]
            }
        }
    });
}

function contact_validate() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        debug: true,
        rules: {
            "accountnumber": {
                required: true,
                digits: true,
                customCallback: [$P.lang("LANG2211"), is_account_exist]
            },
            "calleridname": {
                minlength: 1,
                cidName: true,
                maxlength: 64
            },
            "firstname": {
                minlength: 1,
                cidName: true,
                maxlength: 32
            },
            "lastname": {
                minlength: 1,
                cidName: true,
                maxlength: 32
            },
            "department": {
                minlength: 1,
                cidName: true,
                maxlength: 32
            },
            "email": {
                email: true
            },
            "mobilenumber": {
                digitsWithHyphen: true
            },
            "homenumber": {
                digitsWithHyphen: true
            },
            "fax": {
                digitsWithHyphen: true
            }
        }
    });
}

function is_phonebook_exist() {
    var dn_list = null,
        bool = true,
        action = {
            "action": "listPhonebookDn",
            "options": "dn"
        },
        add_dn = $("#phonebookdn").val();

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: action,
        error: error_cb,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                dn_list = data.response.ldap_phonebooks;
            }
        }
    });

    if (dn_list) {
        for (var key in dn_list) {
            if (dn_list.hasOwnProperty(key)) {
                var this_dn = dn_list[key].dn;

                if (this_dn === add_dn) {
                    bool = false;

                    return bool;
                }
            }
        }
    }

    return bool;
}

function is_account_exist(val) {
    var new_val = $('#accountnumber').val();

    if ($('#contact_list tr.selected').length > 0) {
        var old_accountnum = $('#contact_list tr.selected').find('td:first').text();

        if (new_val == old_accountnum) { // AccountNumber has't been modified.
            return true;
        }
    }

    if (cache_contacts) {
        for (var key in cache_contacts) {
            if (cache_contacts.hasOwnProperty(key)) {
                var this_accountnum = key;

                if (new_val == this_accountnum) {
                    return false;
                }
            }
        }
    }

    return true;
}
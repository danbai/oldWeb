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
    numberList = "",
    uriList = [],
    eventlistExt = [],
    eventlistExtList = [],
    extgroupList = [],
    extgroupListObj = {},
    selectbox = UCMGUI.domFunction.selectbox,
    uriVal = "",
    voipTrunkListObj = {},
    phonebookExtArr = [],
    phonebookExtObj = {},
    phonebookDnArr = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
String.prototype.contains = top.String.prototype.contains;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2474"));

    createTable();

    bindButtonEvent();

    // getAccountList();
    // getNameList();

    $('#sub_div').hide();

    top.Custom.init(doc);
});

function listVoIPTrunk() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "listVoIPTrunk",
            options: "trunk_index,trunk_name"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            getAccountList();
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);
            if (bool) {
                var voipTrunkList = data.response.voip_trunk;
                for (var i = 0; i < voipTrunkList.length; i++) {
                    var index = voipTrunkList[i];
                    voipTrunkListObj[index.trunk_name] = "trunk_" + index.trunk_index;
                }
                getAccountList();
            }
        }
    });
}

function getAccountList() {
    var accountList = UCMGUI.isExist.getList("getAccountList");

    eventlistExtList = transData(accountList);

    extgroupList = UCMGUI.isExist.getList("getExtensionGroupList");

    for (var i = 0; i < extgroupList.length; i++) {
        var groupId = extgroupList[i]["group_id"],
            groupName = extgroupList[i]["group_name"];

        eventlistExt.push(groupId);

        extgroupListObj[groupId] = {
            val: groupId,
            text: groupName
        };
    }

    var listPhonebookDn = UCMGUI.isExist.getList("listPhonebookDn");

    phonebookExtArr.length = 0;
    phonebookDnArr.length = 0;
    phonebookExtObj = {};
    $.each(listPhonebookDn, function(index, item) {
        var dn = item.dn,
            ou = dn ? dn.split(",")[0].split("=")[1] : "",
            prefix = item["prefix"],
            action = {
                'action': "listLDAPContacts",
                'phonebook_dn': dn
            };

        $.ajax({
            type: "post",
            url: "/cgi",
            data: action,
            async: false,
            // error: function(jqXHR, textStatus, errorThrown) {
            //     top.dialog.clearDialog();
            //     top.dialog.dialogMessage({
            //         type: 'error',
            //         content: $P.lang("LANG909")
            //     });
            // },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    var phonebookDn = data.response.phonebook_dn;

                    $.each(phonebookDn, function(index, item) {
                        var obj = {},
                            accountnumber = item.accountnumber,
                            trunkIndex = voipTrunkListObj[ou] || ou,
                            trunkDes = trunkIndex + ":" + accountnumber,
                            ouName = ou + "--" + accountnumber,
                            fullname = item.calleridname;

                        obj["val"] = accountnumber;
                        obj["text"] = ouName + (fullname ? ' "' + fullname + '"' : '');
                        obj["attr"] = trunkIndex;

                        if (fullname) {
                            obj["fullname"] = fullname;
                        }

                        phonebookDnArr.push(obj);
                        phonebookExtArr.push(trunkDes);
                        phonebookExtObj[trunkDes] = obj;
                    });

                    top.Custom.init(doc);
                }
            }
        });
    });

    setTimeout(function() {
        getNameList();
    }, 300);
}

function getNameList() {
    numberList = UCMGUI.isExist.getList("getNumberList");

    var action = {
        'action': "listEventList",
        'options': "uri"
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        // error: function(jqXHR, textStatus, errorThrown) {
        //     top.dialog.clearDialog();
        //     top.dialog.dialogMessage({
        //         type: 'error',
        //         content: $P.lang("LANG909")
        //     });
        // },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                uriList = [];

                var eventlist = data.response.eventlist;

                $.each(eventlist, function(index, item) {
                    uriList.push(item.uri);
                });
            }
        }
    });
}

function createNumber(cellvalue, options, rowObject) {
    return (cellvalue ? cellvalue : 0);
}

function createOptions(cellvalue, options, rowObject) {
    var edit = ('<button uri="' + rowObject.uri + '" title="Edit" localetitle="LANG738" class="options edit"></button>'),
        del = ('<button uri="' + rowObject.uri + '" title="Delete" localetitle="LANG739" class="options del"></button>');

    return (edit + del);
}

function createTable() {
    $("#eventlist").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listEventList"
        },
        colNames: [
            '<span locale="LANG2478">' + $P.lang('LANG2478') + '</span>',
            '<span locale="LANG2917">' + $P.lang('LANG2917') + '</span>',
            '<span locale="LANG2477">' + $P.lang('LANG2477') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'uri',
            index: 'uri',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'total_item',
            index: 'total_item',
            width: 100,
            resizable: false,
            formatter: createNumber,
            align: "center"
        }, {
            name: 'total_subscriber',
            index: 'total_subscriber',
            width: 100,
            resizable: false,
            formatter: createNumber,
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
        pager: "#eventlist_pager",
        loadui: 'disable',
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: false,
        subGrid: true,
        subGridRowExpanded: function(subgrid_id, row_id) {
            var subgrid_table_id = subgrid_id + "_t",
                pager_id = "p_" + subgrid_table_id;

            var table = $("<table>").attr({
                id: "table_userlist",
                width: '100%',
                cellpadding: 0,
                cellspacing: 0,
                border: 0,
                align: "center"
            }).css("display", "none");

            var thead = $("<thead>").attr("id", "").appendTo(table);
            var theadTr = $("<tr>").addClass('frow threaduser').appendTo(thead);
            var theadTrTd = $("<td width='13px' ></td>" + "<td width='100px' locale='LANG85' align='center'>" + $P.lang('LANG85') + "</td>" + "<td width='100px' locale='LANG0' align='center'>" + $P.lang('LANG0') + "</td> " + "<td width='100px' locale='LANG84' align='center'>" + $P.lang('LANG84') + "</td>" + "<td width='150px' locale='LANG1351' align='center'>" + $P.lang('LANG1351') + "</td>").appendTo(theadTr);

            var tbody = $("<tbody>").attr("id", "usercontain").appendTo(table);
            var action = {
                "action": "listEventlistExtens",
                "uri": $("#" + row_id).children().eq(1).text(),
                "item_num": 1000000
            };

            $.ajax({
                type: "post",
                url: "../cgi",
                data: action,
                // error: function(jqXHR, textStatus, errorThrown) {
                //     top.dialog.clearDialog();
                //     top.dialog.dialogMessage({
                //         type: 'error',
                //         content: $P.lang("LANG909")
                //     });
                // },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {
                        var uri = data.response.uri;

                        $.each(uri, function(index, item) {
                            // "uri": "uri5", "extension": "5000", "location": "local", "trunk": "-", "status": "offline"
                            var tr = $("<tr>").addClass('').appendTo(tbody);
                            var extension = item.extension;
                            var group = extgroupListObj[extension];

                            if (group) {
                                var text = group["text"];
                                extension = $P.lang("LANG2714") + "--" + text;
                                $("<td></td>" + "<td locale=\"LANG2989 '" + text + "'\">" + extension + "</td>" + "<td>" + item.status + "</td> " + "<td>" + item.location + "</td>" + "<td>-</td>").appendTo(tr);
                            } else if (extension.contains("group-")) {
                                text = $P.lang("LANG2714") + "--" + extension;
                                $("<td></td>" + "<td locale=\"LANG2989 '" + extension + "'\">" + text + "</td>" + "<td>" + item.status + "</td> " + "<td>" + item.location + "</td>" + "<td>-</td>").appendTo(tr);
                            } else {
                                $("<td></td>" + "<td>" + extension + "</td>" + "<td>" + item.status + "</td> " + "<td>" + item.location + "</td>" + "<td>-</td>").appendTo(tr);
                            }
                        });
                        if ($('#edit_sub').children().length != 0 && uri[0]) {
                            $('#edit_sub').val(uri[0].uri).trigger("change");
                        }
                        top.Custom.init(doc);
                    }
                }
            });

            $("#" + subgrid_id).append(table);

            table.show();
        },
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'uri',
        noData: "LANG129 LANG2474",
        jsonReader: {
            root: "response.eventlist",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadError: function() {
            listVoIPTrunk();
        },
        loadComplete: function() {
            $("#eventlist .jqgrow:even").addClass("ui-row-even");
            listVoIPTrunk();
        },
        gridComplete: function() {
            $P.lang(doc, true);
            loadSubURI();
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            var limit = 999; /*default*/
            var listNumber = uriList.length;
            if (listNumber < limit) {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG2475"),
                    displayPos: "editForm",
                    frameSrc: "html/eventlist_modal.html?mode=add"
                });
            } else {
                /*Reach the limitation*/
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG808").format(limit, $P.lang("LANG2474"))
                });
            }
            ev.stopPropagation();
            return false;
        });

    $('#eventlist')
        .delegate('.edit', 'click', function(ev) {
            var uri = $(this).attr('uri');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG2474"), uri),
                displayPos: "editForm",
                frameSrc: "html/eventlist_modal.html?mode=edit&uri=" + uri
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var uri = $(this).attr('uri');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(uri),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteEventList",
                            "eventlist": uri
                        };

                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            data: action,
                            // error: function(jqXHR, textStatus, errorThrown) {
                            //     top.dialog.clearDialog();
                            //     top.dialog.dialogMessage({
                            //         type: 'error',
                            //         content: $P.lang("LANG909")
                            //     });
                            // },
                            success: function(data) {
                                if (data.status == 0) {
                                    top.dialog.clearDialog();
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            var table = $("#eventlist"),
                                                totalPage = table.getGridParam("lastpage"),
                                                page = table.getGridParam("page"),
                                                reccount = table.getGridParam("reccount");

                                            if (page === totalPage && totalPage > 1 && reccount === 1) {
                                                table.setGridParam({
                                                    page: totalPage - 1
                                                }).trigger('reloadGrid');
                                            } else {
                                                table.trigger('reloadGrid');
                                            }
                                            //$("#eventlist").trigger('reloadGrid');
                                            getNameList();
                                        }
                                    });
                                }
                            }
                        });
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });
            ev.stopPropagation();
            return false;
        });

    $("#edit_sub").change(checkSubscribers);

    setTimeout(refleshStatus, 3000);
}

function refleshStatus() {
    if ($("#en_auto_reflesh").is(":checked")) {
        var table = $("#eventlist"),
            page = table.getGridParam("page"),
            rowNum = table.getGridParam("rowNum"),
            sidx = table.getGridParam("sortname"),
            sord = table.getGridParam("sortorder"),
            dataIDs = table.getDataIDs(),
            dataIDsLength = dataIDs.length;

        $.ajax({
            type: "post",
            url: "../cgi",
            data: {
                "action": "listEventList",
                "auto-refresh": Math.random(),
                "options": "uri,total_item,total_subscriber",
                "item_num": rowNum,
                "page": page,
                "sidx": sidx,
                "sord": sord
            },
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);
                if (bool) {
                    var dataWithStatus = data.response.eventlist,
                        dataWithStatusLength = dataWithStatus.length,
                        i = 0;

                    if (dataWithStatusLength == dataIDsLength) {
                        for (i; i < dataWithStatusLength; i++) {
                            var rowId = dataIDs[i],
                                rowObject = table.getRowData(rowId),
                                subscriber = dataWithStatus[i].total_subscriber;

                            rowObject.total_subscriber = subscriber;

                            table.setRowData(rowId, rowObject);
                        }
                    }

                }
            }
        });

        getStatus();

        loadSubURI();
    }

    setTimeout(refleshStatus, 3000);
}

function loadSubURI() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getEventlistSubsList",
            "auto-refresh": Math.random()
        },
        async: false,
        // error: function(jqXHR, textStatus, errorThrown) {
        //     top.dialog.clearDialog();
        //     top.dialog.dialogMessage({
        //         type: 'error',
        //         content: $P.lang("LANG909")
        //     });
        // },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var eventlistSubsList = data.response.eventlist_subscriber,
                    options = transSubsListData(eventlistSubsList),
                    lastUriInNewList = false;

                $('#edit_sub').empty();

                selectbox.appendOpts({
                    el: "edit_sub",
                    opts: options
                }, doc);

                for (var i = 0; i < options.length; i++) {
                    if (options[i].val == uriVal) {
                        lastUriInNewList = true;
                        break;
                    }
                }

                if (options.length && lastUriInNewList) {
                    $("#edit_sub").val(uriVal);
                    $('#sub_div').show();
                    checkSubscribers();
                } else if (options.length && !lastUriInNewList) {
                    $("#edit_sub")[0].selectIndex = 1;
                    $('#sub_div').show();
                    checkSubscribers();
                } else {
                    $('#sub_div').hide();
                }

                top.Custom.init(doc);
            }
        }
    });
};

function getStatus() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getEventlistExtenList",
            "auto-refresh": Math.random()
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            if (data && data.status == 0) {
                var eventlistExtens = data.response.eventlist_extens;

                $.each(eventlistExtens, function(index, val) {
                    var status = val.status;
                    var uri = val.uri;
                    var extension = val.extension;
                    var location = val.location;
                    var trunk = val.trunk;
                    var nextEles = $("[title='" + uri + "']").parent().next();

                    if (nextEles.hasClass("ui-subgrid")) {
                        var trEles = nextEles.find("tbody tr")

                        $.each(trEles, function(index, item) {
                            var childrenEles = $(item).children();

                            if (val.extension == childrenEles.eq(1).text()) {
                                childrenEles.eq(2).text(status);
                                childrenEles.eq(3).text(location);
                                childrenEles.eq(4).text(trunk);
                            }
                        });
                    }
                });
            }
        }
    });
}

function checkSubscribers() {
    uriVal = $('#edit_sub').val();

    var action = {
        'action': "getEventlistSubs",
        'uri': uriVal
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        // error: function(jqXHR, textStatus, errorThrown) {
        //     top.dialog.clearDialog();
        //     top.dialog.dialogMessage({
        //         type: 'error',
        //         content: $P.lang("LANG909")
        //     });
        // },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var uri = data.response.uri;
                var tableContainer = $("#userslist");

                tableContainer.empty();
                tableContainer.attr({
                    align: 'center',
                    cellpadding: 0,
                    cellspacing: 0,
                    border: 0
                }).addClass('table');

                var thead = $("<thead>").appendTo(tableContainer).addClass("thead");
                var title_tr = $("<tr>");

                title_tr.append("<th locale='LANG2477'>" + $P.lang("LANG2477") + "</th>");
                thead.append(title_tr);

                var tbody = $("<tbody>").appendTo(tableContainer);

                $.each(uri, function(index, item) {
                    var tr = $("<tr>");
                    tr.append("<td style='text-align: center; height: 20px;'>" + item.extension + "</td>");
                    tbody.append(tr);
                });

                $("#sub_div").append(tableContainer);
                $(".table tbody tr:even").addClass("even");
                $(".table tbody tr:odd").addClass("odd");

                top.Custom.init(doc);
            }
        }
    });
}

function transData(res, cb) {
    var arr = [];

    eventlistExt = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
        }

        if (fullname) {
            obj["fullname"] = fullname;
        }

        eventlistExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transSubsListData(res, cb) {
    var arr = [],
        existed = false;

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        // obj["val"] = res[i].extension;
        obj["val"] = res[i].uri;

        for (var j = 0; j < arr.length; j++) {
            if (arr[j].val == obj.val) {
                existed = true;
                break;
            }
        }

        if (!existed) {
            arr.push(obj);
        }

        existed = false;
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
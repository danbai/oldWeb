/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    config = UCMGUI.config,
    addZero = UCMGUI.addZero,
    ifExisted = UCMGUI.inArray,
    maxTimeCondition = config.maxTimeCondition,
    selectbox = UCMGUI.domFunction.selectbox,
    maxFailoverTrunk = config.maxFailoverTrunk,
    addOrEdit = gup.call(window, "mode"),
    outboundRouteIndex = gup.call(window, "item"),
    name = gup.call(window, "name"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    outboundRouteList = mWindow.outboundRouteList,
    officeTimeType = mWindow.officeTimeType,
    trunkList = mWindow.trunkList,
    accountList = mWindow.accountList,
    groupList = mWindow.groupList,
    slaTrunkNameList = mWindow.slaTrunkNameList,
    extensionPrefSettings = UCMGUI.isExist.getRange(), // [disable_extension_ranges, rand_password, weak_password]
    datactol = {
        "clicked": false,
        "timeout": null
    },
    failoverOutboundDataLen,
    maxFailoverTrunk = 10;

var isEnableWeakPw = function() {
    if (extensionPrefSettings[2] == 'yes') { // weak_password
        var new_crl_name = $P.lang("LANG1533"),
            password = $P.lang("LANG73");

        $P("#password", document).rules("add", {
            checkNumericPw: [
                UCMGUI.enableWeakPw.showCheckPassword, {
                    type: "digital",
                    pwsId: "#password",
                    doc: document
                }
            ],
            identical: [new_crl_name, password, $("#outbound_rt_name")]
        });
    }
};

var OrderTable = {
    "lists": [],
    "table_id": '',
    "operater_switch": true,
    "newCell": [],
    "click_val": null,
    "bind_event": function() {
        var TBL = document.getElementById(this.table_id);

        $(TBL).on('click', '.table-add', function(ev) {
            if (failoverOutboundDataLen >= maxFailoverTrunk) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: top.$.lang("LANG5351").format(maxFailoverTrunk, maxFailoverTrunk),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
                return false;
            }
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            /*if (OrderTable.max_failover > 0 && OrderTable.max_failover <= OrderTable.lists.length) {
                var target = $(this);
                // XXX it doesn't work until I set tooltip position twice.
                $(this).tooltip({
                    position: {
                        my: "right center",
                        at: "left center"
                    }
                });

                var max_msg = $P.lang("LANG2141").format(OrderTable.max_failover);
                $(this).attr("titles", max_msg).addClass("ui-state-highlight").trigger("focusin");
                setTimeout(function() {
                    target.removeAttr("titles").removeClass("ui-state-highlight").trigger("focusout");
                }, 2000);
                return;
            }*/

            top.dialog.dialogCommands.hide();

            var clickRow = $(this).parent().parent();
            var newCell = document.createElement('tr');
            OrderTable.newCell = $(newCell);
            $(newCell).css('background', '#CAECFF');

            var cell = document.createElement('td');
            $(cell).attr('colspan', 4);
            newCell.appendChild(cell);
            // $(newCell).append($('<td /><td /><td /><td />'));

            // new add div
            var div = document.createElement('div');
            $(div).attr('class', 'testdiv');
            cell.appendChild(div);
            $('#table_edit_template').appendTo($(div));
            clickRow.after(newCell);
            // $('#modal_btn').css('visibility', 'hidden');
            $('#table-add-btn').show();
            $('#table-edit-btn').hide();

            // default edit value
            OrderTable.set_edit_values(-1);

            if (clickRow.attr('data-item-val') === 'add_item') {
                clickRow.hide();
            }

            // $('#table-add-btn').show();
            OrderTable.click_val = $(this).parent().parent().attr('data-item-val');

            // top.Custom.init(document, $('#table_edit_template')[0]);
            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            OrderTable.operater_switch = 'add';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;

            // TODO
            // disable operator -- add/edit/up/down...
        });

        $(TBL).on('click', '.table-del', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            var clickRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('trunk', clickRow.attr('data-item-val'));

            // remove select item from lists
            OrderTable.lists.splice(curIdx, 1);
            failoverOutboundDataLen = OrderTable.lists.length;
            OrderTable.refresh_failover();

            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-edit', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            top.dialog.dialogCommands.hide();

            var clickRow = $(this).parent().parent();
            var newCell = document.createElement('tr');
            OrderTable.newCell = $(newCell);
            $(newCell).css('background', '#CAECFF');

            var cell = document.createElement('td');
            $(cell).attr('colspan', 4);
            newCell.appendChild(cell);
            // $(newCell).append($('<td /><td /><td /><td />'));

            var curIdx = OrderTable.getOptionOrder('trunk', clickRow.attr('data-item-val'));
            OrderTable.set_edit_values(curIdx);

            // new add div
            var div = document.createElement('div');
            $(div).attr('class', 'testdiv');
            cell.appendChild(div);
            $('#table_edit_template').appendTo($(div));

            clickRow.after(newCell);
            $('#table-add-btn').hide();
            $('#table-edit-btn').show();
            // $('#modal_btn').css('visibility', 'hidden');
            clickRow.hide();

            // $('#table-add-btn').show();
            OrderTable.click_val = $(this).parent().parent().attr('data-item-val');

            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            OrderTable.operater_switch = 'edit';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-up', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('trunk', currentRow.attr('data-item-val'));
            if (curIdx <= 0) {
                return;
            }

            var prevRow = currentRow.prev();
            var prevIdx = OrderTable.getOptionOrder('trunk', prevRow.attr('data-item-val'));

            // row.before(prev);
            var lists = OrderTable.lists;
            var tmp = lists[curIdx];
            lists[curIdx] = lists[prevIdx];
            lists[prevIdx] = tmp;

            OrderTable.refresh_failover();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-down', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }
            var currentRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('trunk', currentRow.attr('data-item-val'));
            var last = OrderTable.lists.length - 1;
            if (curIdx >= last) {
                return;
            }

            var nextRow = currentRow.next();
            var nextIdx = OrderTable.getOptionOrder('trunk', nextRow.attr('data-item-val'));

            // row.before(prev);
            var lists = OrderTable.lists;
            var tmp = lists[curIdx];
            lists[curIdx] = lists[nextIdx];
            lists[nextIdx] = tmp;

            OrderTable.refresh_failover();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-top', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }
            var currentRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('trunk', currentRow.attr('data-item-val'));
            if (curIdx <= 0) {
                return;
            }

            var item = OrderTable.lists[curIdx];
            OrderTable.lists.splice(curIdx, 1);
            OrderTable.lists.splice(0, 0, item);

            OrderTable.refresh_failover();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-bottom', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }
            var currentRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('trunk', currentRow.attr('data-item-val'));
            var lastIdx = OrderTable.lists.length - 1;
            if (curIdx >= lastIdx) {
                return;
            }

            var item = OrderTable.lists[curIdx];
            OrderTable.lists.splice(curIdx, 1);
            OrderTable.lists.splice(lastIdx, 0, item);

            OrderTable.refresh_failover();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });
    },
    "getOptionOrder": function(key, val) {
        var len = this.lists.length;
        for (var i = 0; i < len; i++) {
            if (this.lists[i][key] == val) {
                return i;
            }
        }

        return -1;
    },
    "tbl_btn_cancel": function(ev) {
        if ($('#table_edit_template_timecondition').is(':hidden')) {
            top.dialog.dialogCommands.show();
        }

        $('#table_edit_template').appendTo($('#table_template_placeholder'));
        $('#table_failover tr[data-item-val="' + this.click_val + '"]').show();

        this.newCell.remove();
        this.newCell = [];

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
        OrderTable.operater_switch = true;
        OrderTable.click_val = null;
    },
    "tbl_btn_add": function(ev) {

        if (!$P("#new_crl_fotrunk, #new_crl_fotr_stripx, #new_crl_fotr_prepend", document).valid()) {
            return;
        }

        var trunk_val = $('#new_crl_fotrunk').val() || '',
            trunkName = getTrunkName(trunk_val),
            newTrunk = {
                "trunk": parseInt(trunk_val),
                "name": trunkName || '',
                "strip": Number($('#new_crl_fotr_stripx').val()) || 0,
                "prepend": $('#new_crl_fotr_prepend').val().trim() || ''
                //"indexName": getIndexName()
            };

        $('#table_edit_template').appendTo($('#table_template_placeholder'));

        this.newCell = [];

        var order = this.getOptionOrder('trunk', this.click_val);
        this.lists.splice(order + 1, 0, newTrunk);
        this.refresh_failover();
        failoverOutboundDataLen = this.lists.length;
        if ($('#table_edit_template_timecondition').is(':hidden')) {
            top.dialog.dialogCommands.show();
        }

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
        OrderTable.operater_switch = true;
        OrderTable.click_val = null;

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        return false;
    },
    "tbl_btn_update": function(ev) {

        if (!$P("#new_crl_fotrunk, #new_crl_fotr_stripx, #new_crl_fotr_prepend", document).valid()) {
            return;
        }

        var trunk_val = $('#new_crl_fotrunk').val() || '',
            order = this.getOptionOrder('trunk', this.click_val),
            trunkName = getTrunkName(trunk_val);

        this.lists[order].trunk = parseInt(trunk_val);
        this.lists[order].name = trunkName || '';
        this.lists[order].strip = Number($('#new_crl_fotr_stripx').val()) || 0;
        this.lists[order].prepend = $('#new_crl_fotr_prepend').val().trim() || '';

        $('#table_edit_template').appendTo($('#table_template_placeholder'));

        // this.newCell.remove();
        this.newCell = [];

        this.refresh_failover();

        if ($('#table_edit_template_timecondition').is(':hidden')) {
            top.dialog.dialogCommands.show();
        }

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
        OrderTable.operater_switch = true;
        OrderTable.click_val = null;

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        return false;
    },
    "refresh_failover": function() {
        var TBL = document.getElementById(this.table_id);
        $(TBL).children().remove();
        var addCell = UCMGUI.domFunction.tr_addCell;

        (function() { // add first row
            var newRow = TBL.insertRow(-1);
            newRow.className = "frow";
            addCell(newRow, {
                html: $P.lang('LANG83'),
                locale: 'LANG83'
            });
            addCell(newRow, {
                html: $P.lang('LANG1547'),
                locale: 'LANG1547'
            });
            addCell(newRow, {
                html: $P.lang('LANG1541'),
                locale: 'LANG1541'
            });
            addCell(newRow, {
                html: $P.lang('LANG74'),
                locale: 'LANG74'
            });
        })();

        var len = this.lists.length;
        if (len <= 0) {
            var newRow = TBL.insertRow(-1);
            newRow.className = "odd";
            var td = $('<td colspan=4 style="text-align: center;"/>');
            $(newRow).append(td);
            $(newRow).attr('data-item-val', 'add_item');
            $(td).append('<span class="table-add">' + $P.lang('LANG1555') + '</span>');
            top.dialog.repositionDialog();
            return;
        }

        // show item list
        for (var i = 0; i < len; i++) {
            var item = this.lists[i];
            var newRow = TBL.insertRow(-1);
            newRow.className = ((TBL.rows.length) % 2 == 1) ? 'odd' : 'even';
            addCell(newRow, {
                html: item.name || ''
            });
            addCell(newRow, {
                html: item.strip
            });
            addCell(newRow, {
                html: item.prepend || ''
            });
            var newCell = newRow.insertCell(newRow.cells.length);
            var $tmp;

            // add icon
            $tmp = $('<span />').addClass('table-add tableIcon table-add-icon').attr('localeTitle', 'LANG769').attr('title', $P.lang('LANG769')).appendTo(newCell);

            // top,up,down,bottom icons
            $tmp = $('<span />').addClass('table-top clickTop tableIcon').attr('localeTitle', 'LANG793').attr('title', $P.lang('LANG793')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-up clickUp tableIcon').attr('localeTitle', 'LANG794').attr('title', $P.lang('LANG794')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-down clickDown tableIcon').attr('localeTitle', 'LANG795').attr('title', $P.lang('LANG795')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-bottom clickBottom tableIcon').attr('localeTitle', 'LANG796').attr('title', $P.lang('LANG796')).appendTo(newCell);

            // empty icon 
            // $tmp = $('<span />').addClass('tableIcon').appendTo(newCell);

            // edit, delete icons
            $tmp = $('<span />').addClass('table-edit tableIcon').attr('localeTitle', 'LANG738').attr('title', $P.lang('LANG738')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-del tableIcon').attr('localeTitle', 'LANG739').attr('title', $P.lang('LANG739')).appendTo(newCell);

            $(newRow).attr('data-item-val', item.trunk);
        }


        $('.table-add').tooltip({
            position: {
                my: "right center",
                at: "left center"
            }
        });

        top.dialog.repositionDialog();
        // TODO add title to icons, title attr conflict with validate-tooltip
        // $('.table-del').attr('title', 'delete');
        // $('.table-del').tooltip({disabled: true});
        // $('.table-del').tooltip('disable');
    },
    "set_edit_values": function(idx) {
        var item = this.lists[idx] || {};
        if (item.trunk) {
            $('#new_crl_fotrunk').val(item.trunk || '');
        } else {
            $('#new_crl_fotrunk')[0].selectedIndex = -1;
        }

        $('#new_crl_fotr_stripx').val(item.strip || 0);
        $('#new_crl_fotr_prepend').val(item.prepend || '');
    }
};

var OrderTableTimeCondition = {
    "lists": [],
    "table_id": '',
    "operater_switch": true,
    "newCell": [],
    "click_val": null,
    "bind_event": function() {
        var TBL = $('#' + this.table_id)[0];

        $(TBL).on('click', '.table-add', function(ev) {
            if (OrderTableTimeCondition.operater_switch !== true) {
                return false;
            }

            if (OrderTableTimeCondition.max_timecondition > 0 && OrderTableTimeCondition.max_timecondition <= OrderTableTimeCondition.lists.length) {
                var target = $(this),
                    max_msg = $P.lang("LANG808").format(OrderTable.max_timecondition, $P.lang("LANG1557"));

                // XXX it doesn't work until I set tooltip position twice.
                $(this).tooltip({
                    position: {
                        my: "right center",
                        at: "left center"
                    }
                });

                $(this).attr("titles", max_msg).addClass("ui-state-highlight").trigger("focusin");

                setTimeout(function() {
                    target.removeAttr("titles").removeClass("ui-state-highlight").trigger("focusout");
                }, 2000);

                return;
            }

            top.dialog.dialogCommands.hide();

            append_time_value();

            var clickRow = $(this).parent().parent();
            var newCell = doc.createElement('tr');

            OrderTableTimeCondition.newCell = $(newCell);

            $(newCell)
                .css('background', '#CAECFF')
                .attr("id", 'new_time_condition');

            var cell = doc.createElement('td');

            $(cell).attr('colspan', 3);

            newCell.appendChild(cell);

            // new add div
            var div = doc.createElement('div');

            $(div).attr('class', 'testdiv');

            cell.appendChild(div);

            $('#table_edit_template_timecondition').appendTo($(div));

            clickRow.after(newCell);

            $('#tm_add').show();
            $('#tm_edit').hide();

            // default edit value
            OrderTableTimeCondition.set_edit_values(-1);

            if (clickRow.attr('data-item-val') === 'add_item') {
                clickRow.hide();
            }

            // $('#tm_add').show();
            OrderTableTimeCondition.click_val = $(this).parent().parent().attr('data-item-val');

            $("#table_edit_template_timecondition input[type=checkbox]:checked").each(function(index) {
                this.checked = false;
                this.previousSibling.style.backgroundPosition = "0 0";
            });

            $("#table_edit_template_timecondition input[type=radio]").each(function(index) {
                if (!this.checked) {
                    this.previousSibling.style.backgroundPosition = "0 0";
                }
            });

            $("#new_itrl_stime_hour").change(function() {
                if (!$("#new_itrl_stime_minute").val()) {
                    $("#new_itrl_stime_minute").val("00");
                    top.Custom.init(doc, $('#new_itrl_stime_minute')[0]);
                }
            });

            $("#new_itrl_ftime_hour").change(function() {
                if (!$("#new_itrl_ftime_minute").val()) {
                    $("#new_itrl_ftime_minute").val("00");
                    top.Custom.init(doc, $('#new_itrl_ftime_minute')[0]);
                }
            });

            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "500px");
            }

            top.dialog.currentDialogType = "iframe";

            // top.dialog.repositionDialog("none");
            top.dialog.repositionDialog();

            OrderTableTimeCondition.operater_switch = 'add';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;

            // TODO
            // disable operator -- add/edit/up/down...
        });

        $(TBL).on('click', '.table-del', function(ev) {
            if (OrderTableTimeCondition.operater_switch !== true) {
                return false;
            }

            var clickRow = $(this).parent().parent();
            var curIdx = OrderTableTimeCondition.getOptionOrder('index', clickRow.attr('data-item-val'));

            // remove select item from lists
            OrderTableTimeCondition.lists.splice(curIdx, 1);

            OrderTableTimeCondition.refresh_timecondition();

            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "500px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-edit', function(ev) {
            if (OrderTableTimeCondition.operater_switch !== true) {
                return false;
            }

            top.dialog.dialogCommands.hide();

            var clickRow = $(this).parent().parent();
            var newCell = doc.createElement('tr');

            OrderTableTimeCondition.newCell = $(newCell);

            $(newCell).css('background', '#CAECFF');


            var cell = doc.createElement('td');

            $(cell).attr('colspan', 3);

            newCell.appendChild(cell);

            var curIdx = OrderTableTimeCondition.getOptionOrder('index', clickRow.attr('data-item-val'));

            OrderTableTimeCondition.set_edit_values(curIdx);


            // new add div
            var div = doc.createElement('div');

            $(div).attr('class', 'testdiv');

            cell.appendChild(div);

            $('#table_edit_template_timecondition').appendTo($(div));

            clickRow.after(newCell);

            $('#tm_add').hide();
            $('#tm_edit').show();

            clickRow.hide();

            OrderTableTimeCondition.click_val = $(this).parent().parent().attr('data-item-val');

            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "500px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            OrderTableTimeCondition.operater_switch = 'edit';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-up', function(ev) {
            if (OrderTableTimeCondition.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTableTimeCondition.getOptionOrder('index', currentRow.attr('data-item-val'));

            if (curIdx <= 0) {
                return;
            }

            var prevRow = currentRow.prev();
            var prevIdx = OrderTableTimeCondition.getOptionOrder('index', prevRow.attr('data-item-val'));
            var lists = OrderTableTimeCondition.lists;
            var tmp = lists[curIdx];

            lists[curIdx] = lists[prevIdx];
            lists[prevIdx] = tmp;

            OrderTableTimeCondition.refresh_timecondition();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-down', function(ev) {
            if (OrderTableTimeCondition.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTableTimeCondition.getOptionOrder('index', currentRow.attr('data-item-val'));
            var last = OrderTableTimeCondition.lists.length - 1;

            if (curIdx >= last) {
                return;
            }

            var nextRow = currentRow.next();
            var nextIdx = OrderTableTimeCondition.getOptionOrder('index', nextRow.attr('data-item-val'));
            var lists = OrderTableTimeCondition.lists;
            var tmp = lists[curIdx];

            lists[curIdx] = lists[nextIdx];
            lists[nextIdx] = tmp;

            OrderTableTimeCondition.refresh_timecondition();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-top', function(ev) {
            if (OrderTableTimeCondition.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTableTimeCondition.getOptionOrder('index', currentRow.attr('data-item-val'));

            if (curIdx <= 0) {
                return;
            }

            var item = OrderTableTimeCondition.lists[curIdx];

            OrderTableTimeCondition.lists.splice(curIdx, 1);
            OrderTableTimeCondition.lists.splice(0, 0, item);

            OrderTableTimeCondition.refresh_timecondition();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-bottom', function(ev) {
            if (OrderTableTimeCondition.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTableTimeCondition.getOptionOrder('index', currentRow.attr('data-item-val'));
            var lastIdx = OrderTableTimeCondition.lists.length - 1;

            if (curIdx >= lastIdx) {
                return;
            }

            var item = OrderTableTimeCondition.lists[curIdx];

            OrderTableTimeCondition.lists.splice(curIdx, 1);
            OrderTableTimeCondition.lists.splice(lastIdx, 0, item);

            OrderTableTimeCondition.refresh_timecondition();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

    },
    "getOptionOrder": function(key, val) {
        var len = this.lists.length;

        for (var i = 0; i < len; i++) {
            if (this.lists[i][key] == val) {
                return i;
            }
        }

        return -1;
    },
    "tbl_btn_cancel": function(ev) {
        if ($('#table_edit_template').is(':hidden')) {
            top.dialog.dialogCommands.show();
        }

        $('#table_edit_template_timecondition').appendTo($('#table_template_timecondition'));

        $('#table_timecondition tr[data-item-val="' + this.click_val + '"]').show();

        this.newCell.remove();

        this.newCell = [];

        OrderTableTimeCondition.operater_switch = true;

        OrderTableTimeCondition.click_val = null;

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
    },
    "tbl_btn_add": function(ev) {
        // TODO
        // var elements = '#new_itrl_tc_dest, #new_itrl_tc_dest_val, #new_itrl_tc_digits, ' +
        //         '#new_itrl_stime_hour, #new_itrl_ftime_hour, #new_itrl_stime_minute, ' +
        //         '#new_itrl_ftime_minute, #new_itrl_month_jan, #new_itrl_week_sun';

        if (!$P('#form', document).valid()) {
            return;
        }

        if ($('#mode')[0].checked) {
            if (!check_days_required()) {
                // check failed
                return;
            }
        }

        var stime_hour = $('#new_itrl_stime_hour')[0].value,
            stime_minute = $('#new_itrl_stime_minute')[0].value,
            ftime_hour = $('#new_itrl_ftime_hour')[0].value,
            ftime_minute = $('#new_itrl_ftime_minute')[0].value,
            time = '';

        if (stime_hour == "" && stime_minute == "" && ftime_hour == "" && ftime_minute == "") {
            stime_hour = '00';
            stime_minute = '00';
            ftime_hour = '23';
            ftime_minute = '59';
            time = "00:00-23:59";
        } else {
            time = stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute;
        }

        var date_add = function(container, key, el_id) {
            el = doc.getElementById(el_id);

            if (el.checked == false) {
                return;
            }

            var offset = el_id.indexOf(key) + key.length + 1,
                value = el_id.substring(offset);

            if (container['value'] == '') {
                container['value'] = value;
            } else {
                container['value'] = container['value'] + '&' + value;
            }
        };

        var mode = '';

        if ($('#mode')[0].checked) {
            mode = 'byDay';
        } else {
            mode = 'byWeek';
        }

        // week
        var week = {
                value: ''
            };

        date_add(week, 'week', 'new_itrl_week_sun');
        date_add(week, 'week', 'new_itrl_week_mon');
        date_add(week, 'week', 'new_itrl_week_tue');
        date_add(week, 'week', 'new_itrl_week_wed');
        date_add(week, 'week', 'new_itrl_week_thu');
        date_add(week, 'week', 'new_itrl_week_fri');
        date_add(week, 'week', 'new_itrl_week_sat');

        // month
        var month = {
                value: ''
            },
            day = {
                value: ''
            };

        if (!$('#mode')[0].checked) {
            month.value = '*';
            day.value = '*';
        } else {
            date_add(month, 'month', 'new_itrl_month_jan');
            date_add(month, 'month', 'new_itrl_month_feb');
            date_add(month, 'month', 'new_itrl_month_mar');
            date_add(month, 'month', 'new_itrl_month_apr');
            date_add(month, 'month', 'new_itrl_month_may');
            date_add(month, 'month', 'new_itrl_month_jun');
            date_add(month, 'month', 'new_itrl_month_jul');
            date_add(month, 'month', 'new_itrl_month_aug');
            date_add(month, 'month', 'new_itrl_month_sep');
            date_add(month, 'month', 'new_itrl_month_oct');
            date_add(month, 'month', 'new_itrl_month_nov');
            date_add(month, 'month', 'new_itrl_month_dec');

            var tmp_days = [];

            $('.day_selected').each(function(item) {
                var day_number = $(this).attr('id').afterChar('_');

                tmp_days.push(day_number);
            });

            day.value = tmp_days.join('&');
        }

        $('#table_edit_template_timecondition').appendTo($('#table_template_timecondition'));

        // display time condition
        this.newCell = [];

        var order = this.getOptionOrder('index', this.click_val);

        order = parseInt(order, 10);

        var office = $('#office').val(),
            isSpecific = (office == '6'),
            timetype;

        if (isSpecific) {
            timetype = $('#timetype')[0].checked ? '7' : '6';
        } else {
            timetype = office;
        }

        // time condition object
        var newTimeCondition = {
            'index': getTimeCondationIndexName(),
            'start_hour': (isSpecific ? stime_hour : '00'),
            'start_min': (isSpecific ? stime_minute : '00'),
            'end_hour': (isSpecific ? ftime_hour : '23'),
            'end_min': (isSpecific ? ftime_minute : '59'),
            'time': (isSpecific ? time : '00:00-23:59'),
            'mode': (isSpecific ? mode : 'byWeek'),
            'week_day': (isSpecific ? week['value'] : '*'),
            'month': (isSpecific ? month['value'] : '*'),
            'day': (isSpecific ? day['value'] : '*'),
            'timetype': timetype
        };

        this.lists.splice(order + 1, 0, newTimeCondition);
        this.refresh_timecondition();

        if ($('#table_edit_template').is(':hidden')) {
            top.dialog.dialogCommands.show();
        }

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();

        OrderTableTimeCondition.operater_switch = true;
        OrderTableTimeCondition.click_val = null;

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    },
    "tbl_btn_update": function(ev) {
        // TODO
        // var elements = '#new_itrl_tc_dest, #new_itrl_tc_dest_val, #new_itrl_tc_digits, ' +
        //         '#new_itrl_stime_hour, #new_itrl_ftime_hour, #new_itrl_stime_minute, ' +
        //         '#new_itrl_ftime_minute, #new_itrl_month_jan, #new_itrl_week_sun';

        if (!$P('#form', document).valid()) {
            return;
        }

        if ($('#mode')[0].checked) {
            if (!check_days_required()) {
                // check failed
                return;
            }
        }

        // Prevent form submit by pressing enter key. Pengcheng Zou Added.
        // if (!check_week_required()) {
        //     return false;
        // }

        var office = $('#office').val(),
            isSpecific = (office == '6'),
            timetype;

        if (isSpecific) {
            timetype = $('#timetype')[0].checked ? '7' : '6';
        } else {
            timetype = office;
        }

        var order = this.getOptionOrder('index', this.click_val),
            stime_hour = $('#new_itrl_stime_hour')[0].value,
            stime_minute = $('#new_itrl_stime_minute')[0].value,
            ftime_hour = $('#new_itrl_ftime_hour')[0].value,
            ftime_minute = $('#new_itrl_ftime_minute')[0].value,
            time = stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute;

        var mode = '';

        if ($('#mode')[0].checked) {
            mode = 'byDay';
        } else {
            mode = 'byWeek';
        }

        this.lists[order]['start_hour'] = (isSpecific ? stime_hour : '00');
        this.lists[order]['start_min'] = (isSpecific ? stime_minute : '00');
        this.lists[order]['end_hour'] = (isSpecific ? ftime_hour : '23');
        this.lists[order]['end_min'] = (isSpecific ? ftime_minute : '59');
        this.lists[order]['time'] = (isSpecific ? time : '00:00-23:59');
        this.lists[order]['mode'] = (isSpecific ? mode : 'byWeek');
        this.lists[order]['timetype'] = timetype;

        var date_add = function(container, key, el_id) {
            el = doc.getElementById(el_id);

            if (el.checked == false) {
                return;
            }

            var offset = el_id.indexOf(key) + key.length + 1,
                value = el_id.substring(offset);

            if (container['value'] == '') {
                container['value'] = value;
            } else {
                container['value'] = container['value'] + '&' + value;
            }
        };

        // week
        var week = {
                value: ''
            };

        date_add(week, 'week', 'new_itrl_week_sun');
        date_add(week, 'week', 'new_itrl_week_mon');
        date_add(week, 'week', 'new_itrl_week_tue');
        date_add(week, 'week', 'new_itrl_week_wed');
        date_add(week, 'week', 'new_itrl_week_thu');
        date_add(week, 'week', 'new_itrl_week_fri');
        date_add(week, 'week', 'new_itrl_week_sat');

        this.lists[order]['week_day'] = (isSpecific ? week.value : '*');

        // month
        var month = {
                value: ''
            },
            day = {
                value: ''
            };

        if (!$('#mode')[0].checked) {
            month.value = '*';
            day.value = '*';
        } else {
            date_add(month, 'month', 'new_itrl_month_jan');
            date_add(month, 'month', 'new_itrl_month_feb');
            date_add(month, 'month', 'new_itrl_month_mar');
            date_add(month, 'month', 'new_itrl_month_apr');
            date_add(month, 'month', 'new_itrl_month_may');
            date_add(month, 'month', 'new_itrl_month_jun');
            date_add(month, 'month', 'new_itrl_month_jul');
            date_add(month, 'month', 'new_itrl_month_aug');
            date_add(month, 'month', 'new_itrl_month_sep');
            date_add(month, 'month', 'new_itrl_month_oct');
            date_add(month, 'month', 'new_itrl_month_nov');
            date_add(month, 'month', 'new_itrl_month_dec');

            var tmp_days = [];

            $('.day_selected').each(function(item) {
                var day_number = $(this).attr('id').afterChar('_');

                tmp_days.push(day_number);
            });

            day.value = tmp_days.join('&');
        }

        this.lists[order]['month'] = (isSpecific ? month.value : '*');
        this.lists[order]['day'] = (isSpecific ? day.value : '*');

        $('#table_edit_template_timecondition').appendTo($('#table_template_timecondition'));

        // this.newCell.remove();
        this.newCell = [];

        this.refresh_timecondition();

        if ($('#table_edit_template').is(':hidden')) {
            top.dialog.dialogCommands.show();
        }

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();

        OrderTableTimeCondition.operater_switch = true;
        OrderTableTimeCondition.click_val = null;

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    },
    "refresh_timecondition": function() {
        var TBL = $('#' + this.table_id)[0];
        var addCell = UCMGUI.domFunction.tr_addCell;

        $(TBL).children().remove();

        (function() { // add first row
            var newRow = TBL.insertRow(-1);

            newRow.className = "frow";

            addCell(newRow, {
                html: $P.lang('LANG1557'),
                locale: 'LANG1557'
            });
            addCell(newRow, {
                html: $P.lang('LANG247'),
                locale: 'LANG247'
            });
            addCell(newRow, {
                html: $P.lang('LANG74'),
                locale: 'LANG74'
            });
        })();

        var len = this.lists.length;

        if (len <= 0) {
            var newRow = TBL.insertRow(-1);
            var td = $('<td colspan="3" />');

            $(newRow)
                .addClass("odd")
                .append(td)
                .attr('data-item-val', 'add_item');

            $(td).append('<span class="table-add">' + $P.lang('LANG1562') + '</span>');

            return;
        }

        // show item list
        for (var i = 0; i < len; i++) {
            var item = this.lists[i],
                newRow = TBL.insertRow(-1);

            newRow.className = ((TBL.rows.length) % 2 == 1) ? 'odd' : 'even';

            addCell(newRow, {
                html: $P.lang((item.timetype >= 6) ? officeTimeType[6] : officeTimeType[item.timetype])
            });

            addCell(newRow, {
                html: ((item.timetype >= 6) ? (item.time || '--') : '--')
            });

            // addCell(newRow, { html: "<div locale=\"LANG566 "+tmp_dest+"\">"+"$P.lang(\""+lang+"\") -- "+tmp_str+"</div>"});
            var newCell = newRow.insertCell(newRow.cells.length);
            var $tmp;

            // add icons
            $tmp = $('<span />').addClass('table-add tableIcon table-add-icon').attr('localeTitle', 'LANG769').attr('title', $P.lang('LANG769')).appendTo(newCell);

            // top,up,down,bottom icons
            $tmp = $('<span />').addClass('table-top clickTop tableIcon').attr('localeTitle', 'LANG793').attr('title', $P.lang('LANG793')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-up clickUp tableIcon').attr('localeTitle', 'LANG794').attr('title', $P.lang('LANG794')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-down clickDown tableIcon').attr('localeTitle', 'LANG795').attr('title', $P.lang('LANG795')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-bottom clickBottom tableIcon').attr('localeTitle', 'LANG796').attr('title', $P.lang('LANG796')).appendTo(newCell);

            // empty icon 
            // $tmp = $('<span />').addClass('tableIcon').appendTo(newCell);
            // edit, delete icons
            $tmp = $('<span />').attr('title', $P.lang('LANG738')).attr('localeTitle', 'LANG738').addClass('table-edit tableIcon').appendTo(newCell);
            $tmp = $('<span />').attr('title', $P.lang('LANG739')).attr('localeTitle', 'LANG739').addClass('table-del tableIcon').appendTo(newCell);

            $(newRow).attr('data-item-val', item.index);
        }

        $('.table-add').tooltip({
            position: {
                my: "right center",
                at: "left center"
            }
        });
    },
    "set_edit_values": function(idx) {
        $('#office')[0].selectedIndex = -1;
        $(".chk_week").attr("checked", false);
        $("#new_itrl_week_all").attr("checked", false);
        $(".chk_month").attr("checked", false);
        $("#new_itrl_month_all").attr("checked", false);

        var set_chkbox_all = function(type, value) {
            var str = '#new_itrl_' + type + '_container',
                container = $(str).children();

            for (var i = 0; i < container.length; i++) {
                var it = container[i];

                if (it.type == 'checkbox') {
                    it.checked = value;
                }
            }
        };

        var set_selected_chkbox = function(str, type, value) {
            var template = 'new_itrl_' + type + '_';

            if (str.split("&").length == 7 && str.indexOf("mon&tue") > -1) {
                $("#new_itrl_week_all")[0].checked = true;
            }

            if (str.split("&").length == 12 && str.indexOf("jan&feb") > -1) {
                $("#new_itrl_month_all")[0].checked = true;
            }

            while (str.indexOf('&') != -1) {
                var offset = str.indexOf('&'),
                    sstr = str.substring(0, offset),
                    chkbox = doc.getElementById(template + sstr);

                if (chkbox) {
                    chkbox.checked = value;
                }

                $('day_' + sstr).attr('class', 'day_selected');

                str = str.substring(offset + 1);
            }

            if (str != '') {
                var chkbox = doc.getElementById(template + str);

                if (chkbox) {
                    chkbox.checked = value;
                }
            }
        };

        if (idx == -1) {
            $('#office').val('1').trigger('change');

            $('#new_itrl_stime_hour')[0].selectedIndex = -1;
            $('#new_itrl_stime_minute')[0].selectedIndex = -1;
            $('#new_itrl_ftime_hour')[0].selectedIndex = -1;
            $('#new_itrl_ftime_minute')[0].selectedIndex = -1;

            set_chkbox_all('week', false);
            set_chkbox_all('month', false);

            $('.local_month, .local_day').hide();
            $('#new_itrl_day_container td').removeClass('day_selected').addClass('day_unselected');
            return false;
        }

        var item = this.lists[idx] || {},
            tmp_str,
            mode,
            timetype;

        // time
        $('#new_itrl_stime_hour').val(item.start_hour);
        $('#new_itrl_stime_minute').val(item.start_min);
        $('#new_itrl_ftime_hour').val(item.end_hour);
        $('#new_itrl_ftime_minute').val(item.end_min);

        // week
        tmp_str = item.week_day;

        set_chkbox_all('week', false);

        set_selected_chkbox(tmp_str.toLowerCase(), 'week', true);

        mode = item.mode;

        if (mode == 'byDay') {
            $('#mode')[0].checked = true;

            $('.local_month, .local_day, #new_itrl_day_container').show();
        } else {
            $('#mode')[0].checked = false;

            $('.local_month, .local_day, #new_itrl_day_container').hide();
        }

        timetype = item.timetype;

        if (timetype == '7') {
            $('#timetype')[0].checked = true;
        } else {
            $('#timetype')[0].checked = false;
        }

        // office
        $('#office').val((timetype >= 6) ? '6' : timetype).trigger('change');

        // month
        tmp_str = item.month;

        set_chkbox_all('month', false);

        if (tmp_str == '*') {
            // Do nothing
        } else {
            set_selected_chkbox(tmp_str.toLowerCase(), 'month', true);
        }

        var chkbox_all = function(value) {
            var i = 1,
                t = doc.getElementById('new_itrl_day_' + i);

            while (t) {
                t.checked = value;

                i++;

                t = doc.getElementById('new_itrl_day_' + i);
            }
        };

        var chkbox_selected = function(str, value) {
            $(".day_selected").removeClass("day_selected");

            str.split('&').each(function(item) {
                $('#day_' + item).attr('class', 'day_selected');
            });
        };

        // day
        tmp_str = item.day;

        chkbox_all(false);

        if (tmp_str == '*') {
            // Do nothing
            $('#new_itrl_day_container td').removeClass('day_selected').addClass('day_unselected');
        } else {
            chkbox_selected(tmp_str.toLowerCase(), true);
        }
    }
};

Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.sortBy = top.Array.prototype.sortBy;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;

$(function() {
    var PinSetsList = [{
            text: $P.lang("LANG133"),
            val: ""
        }];

    PinSetsList = PinSetsList.concat(mWindow.PinSetsList);

    selectbox.appendOpts({
        el: "pin_sets_id",
        opts: PinSetsList,
        selectedIndex: 0
    }, doc);

    // Pengcheng Zou Moved. Set Trunk Options First.
    $.each(trunkList, function(item, data) {
        var option, hasClass,
            text = '',
            value = data.trunk_index,
            technology = data.technology,
            name = data.trunk_name,
            disabled = (data.out_of_service && data.out_of_service == 'yes'),
            isSLA = ifExisted(name, slaTrunkNameList);

        // Pengcheng Zou Added. locale="{0}{1}{2}{3}" or locale="{0}{1}{2}{3}{4}{5}"
        //locale = (disabled || isSLA) ? 'LANG564' : 'LANG2696';

        if (technology == 'Analog') {
            text += $P.lang('LANG105');
        } else if (technology == 'SIP') {
            text += $P.lang('LANG108');
        } else if (technology == 'IAX') {
            text += $P.lang('LANG107');
        } else if (technology == 'BRI') {
            text += $P.lang('LANG2835');
        } else if (technology == 'PRI' || technology == 'SS7' || technology == 'MFC/R2' || technology == 'EM' || technology == 'EM_W') {
            text += technology;
        }

        text += $P.lang('LANG83') + " -- " + name;

        if (disabled) {
            text += " -- " + $P.lang('LANG273');
        } else if (isSLA) {
            text += " -- " + $P.lang('LANG3218');
        }

        hasClass = (disabled || isSLA) ? ' class="disabledExtOrTrunk"' : '';

        option = '<option technology="' + technology +
            '" value="' + value + '"' + hasClass + '>' + text + '</option>';

        $("#default_trunk_index").append(option);

        if (!UCMGUI.inArray(data.trunk_name, slaTrunkNameList)) {
            $("#new_crl_fotrunk").append(option);
        }
    });

    $("#new_crl_fotrunk")[0].selectedIndex = -1;

    $("#default_trunk_index")[0].selectedIndex = -1;


    $P.lang(doc, true);

    bindEvents();

    append_time_value(addOrEdit);

    initValidator();

    if (addOrEdit === 'edit') {
        getOutboundRouteValue();
    } else {
        $(".noneTip").css({
            'display': 'inline'
        });

        initFailoverTrunkTable();

        initTimeConditionTable();

        prepareAddItemForm();

        top.Custom.init(doc);
    }

    isEnableWeakPw();

    return false; // bypass reload dialog
});

function addRow(btn, tableID) {

    var table = doc.getElementById(tableID),
        rowIndex = btn.parentElement.parentElement.rowIndex,
        rowCount = table.rows.length,
        existPatternList = [],
        row_ID;

    // if (rowCount >= 10) {
    //     top.dialog.clearDialog();
    //     top.dialog.dialogMessage({
    //         type: 'error',
    //         content: $P.lang("LANG808").format(10, $P.lang('LANG246')),
    //         callback: function() {
    //             top.dialog.container.show();
    //             top.dialog.shadeDiv.show();
    //         }
    //     });
    //     return;
    // }

    var row = table.insertRow(rowCount),
        colCount = table.rows[0].cells.length,
        patterns = $('#patternTable input[position="left"]');

    patterns.each(function() {
        existPatternList.push(parseInt($(this).attr('id').substr(5)));
    });

    for (var i = 0, length = (patterns.length + 1); i < length; i++) {
        if (!ifExisted(i, existPatternList)) {
            break;
        }
    }

    row_ID = i;

    for (var i = 0; i < colCount; i++) {

        var newcell = row.insertCell(i);

        newcell.innerHTML = table.rows[0].cells[i].innerHTML;

        switch (newcell.childNodes[0].type) {
            case "text":
                if (i === 0) {
                    newcell.childNodes[0].value = "";
                    newcell.childNodes[0].id = "match" + row_ID;
                    newcell.childNodes[0].name = "match" + row_ID;
                    $P(newcell.childNodes[0]).rules("add", {
                        required: true,
                        // startWithUnderline : true,
                        customCallback1: [$P.lang('LANG2139'), check_pattern_format],
                        customCallback2: [$P.lang('LANG2139'), check_pattern_with_cid],
                        differentPatterns: [$('#patternTable')]
                    });
                } else if (i === 2) {
                    // newcell.childNodes[0].id = "allow" + row_ID;
                    // newcell.childNodes[0].name = "allow" + row_ID;
                    // $P(newcell.childNodes[0]).rules("add", {
                    //     // required: true,
                    //     // startWithUnderline : true,
                    //     customCallback1: [$P.lang('LANG2139'), check_pattern_format],
                    //     customCallback2: ["Invalid format! The format of CID Identification should be numbers.", check_pattern_with_cid]
                    // });
                }
                break;
            case "button":
                newcell.childNodes[0].className = "btn_del";
                newcell.childNodes[0].id = "btn" + row_ID;
                newcell.childNodes[0].onclick = Function("deleteRow(this, '" + tableID + "');");
                break;
        }
    }

    top.dialog.repositionDialog();

    top.Custom.init(doc);
}

function append_time_value(type) {
    var shour = $('#new_itrl_stime_hour'),
        fhour = $('#new_itrl_ftime_hour');

    shour.children().remove();
    fhour.children().remove();

    for (var i = 0; i < 24; i++) {
        var value = '';

        if (i < 10) {
            value = '0' + i;
        } else {
            value = '' + i;
        }

        shour.append($('<option>').html(value).val(value));
        fhour.append($('<option>').html(value).val(value));
    }

    var sminute = $('#new_itrl_stime_minute'),
        fminute = $('#new_itrl_ftime_minute');

    sminute.children().remove();
    fminute.children().remove();

    for (var i = 0; i < 60; i++) {
        var value = '';

        if (i < 10) {
            value = '0' + i;
        } else {
            value = '' + i;
        }

        sminute.append($('<option>').html(value).val(value));
        fminute.append($('<option>').html(value).val(value));
    }

    if (type == "add") {
        shour[0].selectedIndex = -1;
        fhour[0].selectedIndex = -1;
        sminute[0].selectedIndex = -1;
        fminute[0].selectedIndex = -1;
    }
}

function bindEvents() {
    selectbox.electedSelect({
        rightSelect: "rightSelect",
        leftSelect: "leftSelect",
        allToRight: "allToRight",
        oneToRight: "oneToRight",
        oneToLeft: "oneToLeft",
        allToLeft: "allToLeft"
    }, doc);

    var enableOutLimitime = $("#enable_out_limitime"),
        outLimitimeDiv = $("#div_out_limitime");

    enableOutLimitime.bind("click", function(ev) {
        if ($(this).is(":checked")) {
            outLimitimeDiv.show();
        } else {
            outLimitimeDiv.hide();
        }

        ev.stopPropagation();
        top.dialog.repositionDialog();
    });


    $("#pin_sets_id").bind("change", function(ev) {
        var val = $(this).val();

        if (val) {
            $('#password, #permission, #enable_wlist, #leftSelect, #rightSelect').attr({'disabled': 'disabled'});
            $('#dynamicRoute .selectIcon').addClass('disabled');
            $(".internalTip, .noneTip").hide();
        } else {
            if ($('#enable_wlist').is(':checked')) {
                $('#password, #enable_wlist, #leftSelect, #rightSelect').removeAttr('disabled');
            } else {
                $('#password, #permission, #enable_wlist, #leftSelect, #rightSelect').removeAttr('disabled');
            }

            $('#dynamicRoute .selectIcon').removeClass('disabled');

            if (!$("#permission").is(':disabled')) {
                var levelVal = $("#permission").val();

                if (levelVal == "internal") {
                    $(".internalTip").show();
                } else if (levelVal == "none") {
                    $(".noneTip").show();
                }
            }
        }

        top.Custom.init(doc, $('.pin-sets')[0]);

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $("#permission").bind("change", function(ev) {
        var levelVal = $(this).val();

        if (levelVal == "internal") {
            $(".internalTip").show();
            $(".noneTip").hide();
        } else if (levelVal == 'none') {
            $(".noneTip").show();
            $(".internalTip").hide();
        } else {
            $(".internalTip, .noneTip").hide();
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $("#enable_wlist").bind("click", function(ev) {
        var permission = $("#permission"),
            levelVal = permission.val();

        if ($(this)[0].checked) {
            $("#dynamicRoute").css({
                "display": "inline-block"
            });

            permission.attr("disabled", true);

            $(".internalTip, .noneTip").hide();

            top.Custom.init(doc, permission.get(0));

            top.dialog.repositionDialog();
        } else {
            $("#dynamicRoute").css({
                "display": "none"
            });

            permission.attr("disabled", false);

            if (levelVal == "internal") {
                $(".internalTip").show();
                $(".noneTip").hide();
            } else if (levelVal == 'none') {
                $(".noneTip").show();
                $(".internalTip").hide();
            } else {
                $(".internalTip, .noneTip").hide();
            }

            top.Custom.init(doc, permission.get(0));

            top.dialog.repositionDialog();
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });


    // Prevent form submit by pressing enter key. Pengcheng Zou Added.
    $("#form").keypress(function(e) {
        if (e.which == 13) {
            var tagName = e.target.tagName.toLowerCase();

            if (tagName !== "textarea") {
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                return false;
            }
        }
    });


    $('#failover_cancel').on('click', function(ev) {
        OrderTable.tbl_btn_cancel(ev)
    });

    $('#table-add-btn').on('click', function(ev) {
        OrderTable.tbl_btn_add(ev)
    });

    $('#table-edit-btn').on('click', function(ev) {
        OrderTable.tbl_btn_update(ev)
    });


    $('#tm_cancel').on('click', function(ev) {
        OrderTableTimeCondition.tbl_btn_cancel(ev);
    });

    $('#tm_add').on('click', function(ev) {
        OrderTableTimeCondition.tbl_btn_add(ev);
    });

    $('#tm_edit').on('click', function(ev) {
        OrderTableTimeCondition.tbl_btn_update(ev);
    });


    $("#custom_member").bind("change", function(ev) {
        var customMemberVal = this.value;

       if (customMemberVal && customMemberVal.length > 22) {
            $(this).attr("title", customMemberVal);
       } else {
            $(this).removeAttr("title");
       }
    });


    $('#office').bind("change", function(ev) {
        var value = $('option:selected', this).val(),
            hasOfficeTime = (mWindow.officeTimeList.length > 0),
            hasHoliday = (mWindow.holidayList.length > 0);

        if (value == '6') {
            $('#specificTime').show();
            $('.timecondition-tips').hide();
        } else {
            var text = '';

            $('#specificTime').hide();

            if (value == '1' || value == '2') {
                if (!hasOfficeTime) {
                    text = generateTimeConditionTips('officeTime');

                    $('.timecondition-tips').html(text).css({
                        'display': 'block'
                    });
                } else {
                    $('.timecondition-tips').hide();
                }
            } else if (value == '3' || value == '4') {
                if (!hasHoliday) {
                    text = generateTimeConditionTips('holiday');

                    $('.timecondition-tips').html(text).css({
                        'display': 'block'
                    });
                } else {
                    $('.timecondition-tips').hide();
                }
            } else {
                if (!(hasOfficeTime || hasHoliday)) {
                    if (!hasOfficeTime && !hasHoliday) {
                        text = generateTimeConditionTips('all');
                    } else if (!hasOfficeTime) {
                        text = generateTimeConditionTips('officeTime');
                    } else if (!hasHoliday) {
                        text = generateTimeConditionTips('holiday');
                    }

                    $('.timecondition-tips').html(text).css({
                        'display': 'block'
                    })
                } else {
                    $('.timecondition-tips').hide();
                }
            }
        }

        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
        }

        top.dialog.repositionDialog();
    });

    $('#mode').bind("click", function(ev) {
        if ($(this).is(':checked')) {
            $('.local_month').show();
            $('.local_day').show();
            $('#new_itrl_day_container').show();
        } else {
            $('.local_month').hide();
            $('.local_day').hide();
            $('#new_itrl_day_container').hide();
        }

        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
        }

        top.dialog.repositionDialog();
    });

    // init days
    var day_container = doc.getElementById('new_itrl_day_container'),
        tbl = doc.createElement('table'),
        addCell = UCMGUI.domFunction.tr_addCell;

    var days_add = function(table, length) {
        var addCell = UCMGUI.domFunction.tr_addCell;

        for (var i = 0; i < length; i++) {
            if ((i % 7) == 0) {
                var newRow = table.insertRow(-1);

                $(newRow).css('background', '#CAECFF');
            }

            // var cell = "<input type='checkbox' id='new_itrl_day_" + i + "' value='" + i + "'>" + i;
            var cell = i + 1;

            addCell(newRow, {
                html: cell,
                className: 'day_unselected',
                title: $P.lang('LANG563'),
                localeTitle: 'LANG563',
                id: 'day_' + (i + 1)
            });
        }
    };

    days_add(tbl, 31);
    day_container.appendChild(tbl);

    $('#new_itrl_day_container').delegate('td', 'mousedown', function(ev) {
        var $this = $(this);

        if (datactol.clicked === false) {
            datactol.clicked = $this;
        }

        // if (datactol.clicked == true)

        if ($(this).hasClass('day_selected')) {
            $this.removeClass('day_selected');
            $this.addClass('day_unselected');
        } else {
            $this.removeClass('day_unselected');
            $this.addClass('day_selected');
        }

        // this.className = 'day_selected';
        // $('#new_itrl_day_container').delegate('td', 'mouseenter', dayMouseEnter);

        $('#new_itrl_day_container').delegate('td', 'mouseover', dayMouseEnter);
        $('#new_itrl_day_container').css('cursor', 'col-resize');

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $(doc).on('mouseup', function(ev) {
        datactol.clicked = false;

        $('.day_selected_pending').attr('class', 'day_selected');
        $('.day_unselected_pending').attr('class', 'day_unselected');
        $('#new_itrl_day_container').undelegate('td', 'mouseover', dayMouseEnter);
        $('#new_itrl_day_container').css('cursor', 'auto');

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        // return false;
    });

    var week_all = $('#new_itrl_week_all'),
        month_all = $('#new_itrl_month_all'),
        chk_week = $(".chk_week"),
        chk_month = $(".chk_month");

    week_all.bind("click", function(ev) {
        var week_chkbox_all = function(value) {
            var children = $('#new_itrl_week_container').children().find("input");

            for (var i = 0; i < children.length; i++) {
                if (children[i].type == 'checkbox') {
                    children[i].checked = value;
                }

                if (value) {
                    $(children[i]).prev().css("backgroundPosition", "0px -50px");
                } else {
                    $(children[i]).prev().css("backgroundPosition", "0px 0px");
                }
            }
        };

        var all = $('#new_itrl_week_all')[0];

        if (all.checked) {
            week_chkbox_all(true);
        } else {
            week_chkbox_all(false);
        }
    });

    month_all.bind("click", function(ev) {
        var month_chkbox_all = function(value) {
            var children = $('#new_itrl_month_container').children().find("input");

            for (var i = 0; i < children.length; i++) {
                if (children[i].type == 'checkbox') {
                    children[i].checked = value;
                }

                if (value) {
                    $(children[i]).prev().css("backgroundPosition", "0px -50px");
                } else {
                    $(children[i]).prev().css("backgroundPosition", "0px 0px");
                }
            }
        };

        var all = $('#new_itrl_month_all')[0];

        if (all.checked) {
            month_chkbox_all(true);
        } else {
            month_chkbox_all(false);
        }
    });

    chk_week.bind("click", function(ev) {
        if (chk_week.filter(":checked").length != chk_week.length) {
            week_all[0].checked = false;
            week_all.prev().css("backgroundPosition", "0px 0px");
        } else {
            week_all[0].checked = true;
            week_all.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });

    chk_month.bind("click", function(ev) {
        if (chk_month.filter(":checked").length != chk_month.length) {
            month_all[0].checked = false;
            month_all.prev().css("backgroundPosition", "0px 0px");
        } else {
            month_all[0].checked = true;
            month_all.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });
}

function check_days_required() {
    if (!$('.day_selected').length) {
        var target = $('#day_1');

        if (datactol.timeout) {
            clearTimeout(datactol.timeout);
        }

        target.attr("titles", $P.lang("LANG3531").format('1', $P.lang('LANG242').toLowerCase())).addClass("ui-state-highlight").trigger("focusin");

        datactol.timeout = setTimeout(function() {
            target.removeAttr("titles").removeClass("ui-state-highlight").trigger("focusout");
        }, 2000);

        return false;
    }

    return true;
}

function check_month_required(element, value) {
    if ($('.chk_month:checked').length) {
        return true;
    }

    return false;
}

function check_week_required(element, value) {
    if ($('.chk_week:checked').length) {
        return true;
    }

    return false;
}

function check_time(value, element) {
    var stime_hour = parseInt($('#new_itrl_stime_hour').val() || -1, 10),
        stime_min = parseInt($('#new_itrl_stime_minute').val() || -1, 10),
        ftime_hour = parseInt($('#new_itrl_ftime_hour').val() || -1, 10),
        ftime_min = parseInt($('#new_itrl_ftime_minute').val() || -1, 10);

    if (stime_hour == -1 && stime_min == -1 && ftime_hour == -1 && ftime_min == -1) {
        return true;
    }

    if (stime_hour > -1 && stime_min > -1 && ftime_hour > -1 && ftime_min > -1 && stime_hour * 60 + stime_min < ftime_hour * 60 + ftime_min) {
        return true;
    }

    return false;
}

function checkCustomNumberLength(val, ele) {
    var str = processCustomNumber();

    if (str.length > 128) {
        return false;
    } else {
        return true;
    }
}

function checkOutboundRouteName(val, ele) {
    var outboundRouteNameList = [];

    $.each(outboundRouteList, function(item, data) {
        outboundRouteNameList.push(data.outbound_rt_name);
    });

    if (addOrEdit == 'edit') {
        if (val == name) {
            return true;
        } else {
            if (ifExisted(val, outboundRouteNameList)) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        if (ifExisted(val, outboundRouteNameList)) {
            return false;
        } else {
            return true;
        }
    }
}

function check_pattern_format(value, element) {
    var additional = function(value) {
        var res = false,
            off1 = value.indexOf('['),
            off2 = value.indexOf(']');

        if (off1 > -1 && off1 < off2) {
            res = true;
            var str = value;
            var pos = str.indexOf('-');

            while (pos > -1) {
                var v1 = str[pos - 1];
                var v2 = str[pos + 1];

                if (pos < 2) {
                    res = false;
                    break;
                }

                if (/[^0-9a-zA-Z]/.test(v1) || /[^0-9a-zA-Z]/.test(v2)) {
                    res = false;
                    break;
                }

                if ((/[0-9]/.test(v1) && /[0-9]/.test(v2)) && v1 > v2) {
                    res = false;
                    break;
                }
                if ((/[a-z]/.test(v1) && /[a-z]/.test(v2)) && v1 > v2) {
                    res = false;
                    break;
                }

                if ((/[A-Z]/.test(v1) && /[A-Z]/.test(v2)) && v1 > v2) {
                    res = false;
                    break;
                }

                if ((/[0-9]/.test(v1) && /[^0-9]/.test(v2)) ||
                    (/[^0-9]/.test(v1) && /[0-9]/.test(v2))) {
                    res = false;
                    break;
                }

                if ((/[a-z]/.test(v1) && /[^a-z]/.test(v2)) ||
                    (/[A-Z]/.test(v1) && /[^A-Z]/.test(v2))) {
                    res = false;
                    break;
                }

                str = str.substr(pos + 1);
                pos = str.indexOf('-');
            }
        } else if (off1 == -1 && off2 == -1) {
            res = true;
        }

        return res;
    };

    var split = '\n';

    if (element.id === 'custom_member') {
        split = ',';
    }

    var str = value.split(split),
        res = false;

    for (var i = 0; i < str.length; i++) {
        var item = $.trim(str[i]);

        if (/^_$/.test(item) || /(\[.*?(\.|\!).*?\])|(\[\])/g.test(item)) {
            return false;
        }

        if (/^_/.test(item)) {
            item = item.substr(1);
        }

        if (/^_$/.test(item) || item.length > 32 || /^[!\.]/.test(item)) {
            return false;
        }

        if (!/[^a-zA-Z0-9\#\*\.!\[\]\-\+\/_]/.test(item) && additional(item)) {
            res = true;
        } else {
            return false;
        }
    }

    return res;
}

function check_pattern_with_cid(value, element) {
    var split = '\n';

    if (element.id === 'custom_member') {
        split = ',';
    }

    var str = value.split(split),
        res = false;

    for (var i = 0; i < str.length; i++) {
        var item = $.trim(str[i]);

        if (!/^_/.test(item)) {
            item = '_' + item;
        }

        if (/^_[0-9a-zA-Z!\[\]\-\.\?\+\*\#]+[0-9]+$/.test(item)) {
            res = true;
        } else if (!/\//.test(item)) {
            res = true;
        } else {
            return false;
        }
    }

    return res;
}

function checkTimeLarger(val, ele) {
    var maximumTime = Number($("#maximumTime").val(), 10),
        warningTime = Number($("#warningTime").val(), 10),
        repeatTime = Number($("#repeatTime").val(), 10);

    if (warningTime >= maximumTime || repeatTime >= maximumTime) {
        if (warningTime || repeatTime || maximumTime) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

function dayMouseEnter(ev) {
    if (datactol.clicked === false) {
        return;
    }

    var clickedElement = $(datactol.clicked),
        clickedDay = parseInt(clickedElement.attr('id').afterChar('_'), 10),
        mouseDay = parseInt(this.id.afterChar('_'), 10),
        newClass = clickedElement.hasClass('day_selected') ? 'day_selected_pending' : 'day_unselected_pending';

    var start = (clickedDay < mouseDay) ? clickedDay : mouseDay,
        end = (clickedDay > mouseDay) ? clickedDay : mouseDay;

    $('.day_selected_pending').removeClass('day_selected_pending');
    $('.day_unselected_pending').removeClass('day_unselected_pending');

    for (var i = start; i <= end; i++) {
        $('#day_' + i).addClass(newClass);
    }
}

function deleteRow(btn, tableID) {
    var table = doc.getElementById(tableID),
        rowCount = table.rows.length,
        rowIndex = btn.parentElement.parentElement.rowIndex;

    if (rowCount > rowIndex) {
        table.deleteRow(rowIndex);
    }

    top.dialog.repositionDialog();
}

function doNew_crl_save_go() {
    var params = ['outbound_rt_name', 'default_trunk_index', 'pin_sets_id', 'password', 'strip', 'prepend'],
        OrderTableLength = OrderTable.lists.length,
        paramLength = params.length,
        patternText = $('#match').val().split('\n'),
        patternLength = patternText.length,
        matchText = [],
        pattern = '[',
        action = {},
        i = 0;

    var permission = $('#permission');
    var permissionVal = permission.val();

    action["action"] = (addOrEdit == 'edit' ? "updateOutboundRoute" : "addOutboundRoute");

    if (addOrEdit == 'edit') {
        action["outbound_route"] = outboundRouteIndex;
    }

    if ($("#enable_out_limitime").get(0).checked) {
        var maximumTime = $("#maximumTime").val(),
            warningTime = $("#warningTime").val(),
            repeatTime = $("#repeatTime").val();

        maximumTime = maximumTime ? (parseInt(maximumTime) * 1000) : '';
        warningTime = warningTime ? (parseInt(warningTime) * 1000) : '';
        repeatTime = repeatTime ? (parseInt(repeatTime) * 1000) : '';

        action["limitime"] = "L(" + maximumTime + ":" + warningTime + ":" + repeatTime + ")";
    } else {
        action["limitime"] = "";
    }

    for (i; i < paramLength; i++) {
        action[params[i]] = $('#' + params[i]).val();
    }

    if (permission.is(':disabled')) {
        action['permission'] = "none";
    } else {
        action['permission'] = permissionVal;
    }

    // remover empty value
    for (var i = 0; i < patternLength; i++) {
        if (!patternText[i]) {
            continue;
        } else {
            matchText.push(patternText[i]);
        }
    }

    for (var i = 0; i < matchText.length; i++) {
        var matchValue = matchText[i];
        // allowValue = $(this).closest('tr').find('input[position="right"]').val();

        matchValue = (matchValue[0] !== '_') ? '_' + matchValue : matchValue;
        // allowValue = (allowValue && allowValue[0] !== '_') ? '_' + allowValue : allowValue;

        if (i < matchText.length - 1) {
            //pattern += '{"match": "' + matchValue + '", "allow": "' + allowValue + '"}, ';
            pattern += '{"match": "' + matchValue + '"}, ';
        } else {
            //pattern += '{"match": "' + matchValue + '", "allow": "' + allowValue + '"}]';
            pattern += '{"match": "' + matchValue + '"}]';
        }
    }

    action["pattern"] = pattern;

    var failover_outbound_data_array = [],
        failover_outbound_data_object = {},
        OrderTableList = {};

    for (i = 0; i < OrderTableLength; i++) {
        OrderTableList = OrderTable.lists[i];

        failover_outbound_data_object = {
            failover_trunk_index: OrderTableList.trunk,
            failover_trunk_sequence: i + 1,
            failover_strip: OrderTableList.strip,
            failover_prepend: OrderTableList.prepend
        };

        failover_outbound_data_array.push(failover_outbound_data_object);
    }

    action['failover_outbound_data'] = JSON.stringify(failover_outbound_data_array);

    action['enable_wlist'] = $('#enable_wlist')[0].checked ? 'yes' : 'no';
    action['out_of_service'] = $('#out_of_service')[0].checked ? 'yes' : 'no';

    var menbers = $("#rightSelect")[0],
        options = [];

    for (i = 0; i < menbers.options.length; i++) {
        options.push(menbers.options[i].value)
    }

    action['members'] = options.toString();

    action['custom_member'] = processCustomNumber();

    var tcLength = OrderTableTimeCondition.lists.length;

    if (tcLength) {
        for (i = 0; i < tcLength; i++) {
            OrderTableTimeCondition.lists[i].sequence = i + 1;

            delete OrderTableTimeCondition.lists[i]['condition_index'];
            delete OrderTableTimeCondition.lists[i]['index'];
            delete OrderTableTimeCondition.lists[i]['time'];
        }
    }

    action['time_condition'] = JSON.stringify(OrderTableTimeCondition.lists);

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {

                // top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                var DO_RELOAD = function() { // DO_RELOAD();
                    var mainScreen = top.frames['frameContainer'].frames['mainScreen'];
                    mainScreen.$("#table_CRLS_list", mainScreen.document).trigger('reloadGrid');

                    // update outboundRouteList, trunkList
                    mWindow.updateLists();
                }

                setTimeout(DO_RELOAD, 500);
            }
        }
    });
}

function failoverTrunkConflictValidate(value, element) {
    if (!value) {
        return true;
    }

    var len = OrderTable.lists.length;
    var lists = OrderTable.lists;
    for (var i = 0; i < len; i++) {
        if (lists[i].trunk == value) {
            // except editing failover itself
            if (OrderTable.operater_switch != 'edit' || lists[i].trunk != OrderTable.click_val) {
                return false;
            }
        }
    }
    return true;
}

/*function getIndexName() {
    var name = ['a', 'b', 'c'],
        length = name.length,
        indexName = '',
        orderTableListsLength = OrderTable.lists.length,
        i = 0,
        j;

    for (i; i < length; i++) {

        var exist = false;

        for (j = 0; j < orderTableListsLength; j++) {
            if (name[i] == OrderTable.lists[j]['indexName']) {
                exist = true;
                break;
            }
        }

        if (!exist) {
            break;
        }
    }

    return name[i];
}*/

function getTimeCondationIndexName() {
    var length = 1000000,
        timeConditionListsLength = OrderTableTimeCondition.lists.length,
        i = 0,
        j;

    for (i; i < length; i++) {
        var exist = false;

        for (j = 0; j < timeConditionListsLength; j++) {
            if (i == OrderTableTimeCondition.lists[j]['index']) {
                exist = true;
                break;
            }
        }

        if (!exist) {
            break;
        }
    }

    return i;
}

function getMinLengthMatchDoc() {
    var minLength = 100,
        minLengthDoc = {};

    $('#patternTable input[position="left"]').each(function(index) {
        if ($(this).val().length < minLength) {
            minLength = $(this).val().length;
            minLengthDoc = $(this);
        }
    });

    return minLengthDoc;
}

function generateTimeConditionTips(type) {
    var text = '';

    if (type == 'all') {
        text = $P.lang('LANG4218').format(
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG3266').toLowerCase(),
            $P.lang('LANG47'),
            $P.lang('LANG718'),
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG3266').toLowerCase());
    } else if (type == 'officeTime') {
        text = $P.lang('LANG4217').format(
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG47'),
            $P.lang('LANG718'),
            $P.lang('LANG3271'),
            $P.lang('LANG3271').toLowerCase());
    } else if (type == 'holiday') {
        text = $P.lang('LANG4217').format(
            $P.lang('LANG3266').toLowerCase(),
            $P.lang('LANG47'),
            $P.lang('LANG718'),
            $P.lang('LANG3266'),
            $P.lang('LANG3266').toLowerCase());
    }

    return text;
}

function getOutboundRouteValue() {
    var action = {},
        params = ['outbound_rt_name', 'outbound_rt_index', 'default_trunk_index', 'pin_sets_id', 'permission',
            'password', 'strip', 'prepend', 'pattern', 'members', 'enable_wlist', 'custom_member', 'limitime',
            'out_of_service', 'failover_outbound_data'
        ],
        paramLength = params.length;

    // action = UCMGUI.formSerialize(doc);
    action["action"] = "getOutboundRoute";
    action["outbound_route"] = outboundRouteIndex;

    for (var i = 0; i < paramLength; i++) {
        action[params[i]] = '';
    }

    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        data: action,
        async: false,
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
                var outbound_route = data.response.outbound_route,
                    pattern = data.response.pattern,
                    failover_outbound_data = data.response.failover_outbound_data,
                    length = pattern.length,
                    matchs = [],
                    i = 0;
                failoverOutboundDataLen = failover_outbound_data.length;

                var outLimitime = (outbound_route.limitime ? outbound_route.limitime : ""),
                    enableOutLimitime = $("#enable_out_limitime"),
                    outLimitimeDiv = $("#div_out_limitime"),
                    outLimitimeArr = outLimitime.match(/\d+/g);

                $('#pin_sets_id').val(outbound_route.pin_sets_id).trigger('change');

                if (outLimitimeArr && outLimitimeArr.length != 0) {
                    outLimitimeDiv.show();

                    enableOutLimitime.get(0).checked = true;

                    $("#maximumTime").val(outLimitimeArr[0] ? (parseInt(outLimitimeArr[0] / 1000)) : "");
                    $("#warningTime").val(outLimitimeArr[1] ? (parseInt(outLimitimeArr[1] / 1000)) : "");
                    $("#repeatTime").val(outLimitimeArr[2] ? (parseInt(outLimitimeArr[2] / 1000)) : "");
                } else {
                    outLimitimeDiv.hide();
                }

                var trunk, name, strip, prepend;

                for (var i = 0; i < failover_outbound_data.length; i++) {
                        trunk = failover_outbound_data[i].failover_trunk_index,
                        name = getTrunkName(trunk),
                        strip = failover_outbound_data[i].failover_strip,
                        prepend = failover_outbound_data[i].failover_prepend;

                    OrderTable.lists.push({
                        'name': name,
                        'prepend': prepend,
                        'strip': strip,
                        'trunk': trunk
                    });
                }

                UCMGUI.domFunction.updateDocument(outbound_route, doc);

                var customMember = outbound_route.custom_member;

                if (customMember && customMember.length > 22) {
                    $("#custom_member").attr("title", customMember);
                }

                for (i = 0; i < length; i++) {
                    // addRow(doc.getElementById('btn0'), "patternTable");
                    matchs.push(pattern[i].match);
                }

                $('#match').val(matchs.join('\n'));

                // $('#patternTable input[position="left"]').each(function(index) {
                //     $(this).val(pattern[index].match)
                //         .closest('tr').find('input[position="right"]').val(pattern[index].allow);
                // });

                if (!outbound_route.pin_sets_id) {
                    var levelVal = $("#permission").val();

                    if (levelVal == "internal") {
                        $(".internalTip").show();
                    } else if (levelVal == "none") {
                        $(".noneTip").show();
                    }
                }

                if (outbound_route.enable_wlist == 'yes') {
                    $("#dynamicRoute").css({
                        "display": "inline-block"
                    });

                    $("#permission").attr("disabled", true);

                    $(".internalTip, .noneTip").hide();
                }

                var members = outbound_route.members,
                    allMember = transGroupExtData(),
                    leftMemberExt = [],
                    rightMemberExt = [];

                if (members) {
                    var memberList = members.split(',');

                    for (var i = 0, length = memberList.length; i < length; i++) {
                        var obj = {};

                        if (memberList[i].indexOf('group') != -1) {
                            obj["val"] = memberList[i];
                            obj["text"] = getGroupName(memberList[i]);
                        } else {
                            obj = UCMGUI.ObjectArray.find('val', memberList[i], allMember);
                        }

                        rightMemberExt.push(obj);
                    }

                    leftMemberExt = member_array_minus(allMember, rightMemberExt);
                } else {
                    leftMemberExt = allMember;
                }

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftMemberExt
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightMemberExt
                }, doc);

                initFailoverTrunkTable();

                $("#permission").trigger("change");
            }
        }
    });

    // Load Time Condition Data
    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        data: {
            "action": "listOutboundTimeCondition",
            "outbound_route": outboundRouteIndex,
            "page": 1,
            "item_num": 1000000,
            "sidx": "sequence",
            "options": "condition_index,timetype,sequence,start_hour,start_min,end_hour,end_min,mode,week_day,month,day"
        },
        async: false,
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
                var time_condition = data.response.time_condition,
                    translateTime = time_condition.sortBy('sequence'),
                    translateTimeLength = translateTime.length,
                    i = 0;

                OrderTableTimeCondition.lists = [];

                for (i; i < translateTimeLength; i++) {
                    if (translateTime[i].timetype) {
                        var obj = translateTime[i];

                        obj.index = i;

                        obj.start_hour = addZero(obj.start_hour);
                        obj.start_min = addZero(obj.start_min);
                        obj.end_hour = addZero(obj.end_hour);
                        obj.end_min = addZero(obj.end_min);

                        var stime_hour = obj.start_hour,
                            stime_minute = obj.start_min,
                            ftime_hour = obj.end_hour,
                            ftime_minute = obj.end_min;

                        if (stime_hour == "" && stime_minute == "" &&
                            ftime_hour == "" && ftime_minute == "") {

                            obj.time = "00:00-23:59";
                        } else {
                            obj.time = stime_hour + ':' + stime_minute + '-' +
                                ftime_hour + ':' + ftime_minute;
                        }

                        OrderTableTimeCondition.lists.push(obj);
                    }
                }

                initTimeConditionTable();
            }
        }
    });

    top.dialog.repositionDialog();

    top.Custom.init(doc);
}

function getGroupName(index) {
    var name = '';

    $.each(groupList, function(item, data) {
        if (index == data.group_id) {
            name = data.group_name;
            return false;
        }
    });

    return $P.lang('LANG2714') + ' -- ' + name;
}

function getTrunkName(trunk_val) {
    var trunkName;

    $.each(trunkList, function(item, data) {
        if (data.trunk_index == trunk_val) {
            if (data.technology == 'Analog') {
                trunkName = (data.out_of_service && data.out_of_service == 'yes' ? "<span class='disabledExtOrTrunk'>" : "<span>") +
                    $P.lang('LANG105') + ' ' + $P.lang('LANG83') + ' -- ' + data.trunk_name +
                    (data.out_of_service && data.out_of_service == 'yes' ? (' -- ' + $P.lang('LANG273') + '</span>') : '</span>');
            } else {
                trunkName = (data.out_of_service && data.out_of_service == 'yes' ? "<span class='disabledExtOrTrunk'>" : "<span>") +
                    data.technology + ' ' + $P.lang('LANG83') + ' -- ' + data.trunk_name +
                    (data.out_of_service && data.out_of_service == 'yes' ? (' -- ' + $P.lang('LANG273') + '</span>') : '</span>');
            }
        }
    });

    return trunkName;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "outbound_rt_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                customCallback: [$P.lang("LANG2137"), checkOutboundRouteName]
            },
            "maximumTime": {
                required: true,
                digits: true,
                customCallback: [$P.lang("LANG4346"), checkTimeLarger]
            },
            "warningTime": {
                digits: true,
                min: 1,
                bigger: [$P.lang("LANG3019"), $P.lang("LANG3021"), $("#repeatTime")],
                required: function() {
                    return ($("#repeatTime").val() != "");
                }
            },
            "repeatTime": {
                digits: true,
                min: 1,
                smaller: [$P.lang("LANG3021"), $P.lang("LANG3019"), $('#warningTime')]
            },
            "match": {
                noEmptyLine: true,
                required: true,
                // startWithUnderline : true,
                customCallback1: [$P.lang('LANG2139'), check_pattern_format],
                customCallback2: [$P.lang('LANG2994'), check_pattern_with_cid],
                differentPatterns: ['\n']
            },
            // "allow0": {
            //     // required: true,
            //     // startWithUnderline : true,
            //     customCallback1: [$P.lang('LANG2139'), check_pattern_format],
            //     customCallback2: [$P.lang('LANG2994'), check_pattern_with_cid]
            // },
            // "permission": {
            //     required: true
            // },
            "password": {
                digits: true,
                minlength: 4
            },
            "rightSelect": {
                customCallback1: [$P.lang('LANG4264').format($P.lang('LANG2702'), $P.lang('LANG2703')), function(value, element) {
                    if ($("#custom_member").val() || $("option", element).length) {
                        return true;
                    }

                    return false;
                }]
            },
            "custom_member": {
                customCallback: [$P.lang('LANG4470'), checkCustomNumberLength],
                customCallback1: [$P.lang('LANG2139'), check_pattern_format],
                customCallback2: [$P.lang('LANG2994'), check_pattern_with_cid],
                customCallback3: [$P.lang('LANG4264').format($P.lang('LANG2702'), $P.lang('LANG2703')), function(value, element) {
                    if ($("#rightSelect option").length || element.value) {
                        return true;
                    }

                    return false;
                }],
                differentPatterns: [',']
            },
            "toLocalDest": {
                required: true
            },
            "default_trunk_index": {
                required: true,
                customCallback: [$P.lang("LANG2140"), failoverTrunkConflictValidate]
            },
            "stripx": {
                digits: true,
                stripMax: ['pattern length', $('#match'), $('#prepend')]
            },
            "prepend": {
                phoneNumberOrExtension: true
            },
            "new_crl_fotrunk": {
                required: true,
                notEqualTo: ['Primary Trunk', $('#default_trunk_index')],
                customCallback: [$P.lang("LANG2140"), failoverTrunkConflictValidate]
            },
            "new_crl_fotr_stripx": {
                digits: true,
                stripMax: ['pattern length', $('#match'), $('#new_crl_fotr_prepend')]
            },
            "new_crl_fotr_prepend": {
                phoneNumberOrExtension: true
            },
            "new_itrl_stime_hour": {
                // required: true,
                digits: true,
                range: [0, 23],
                // LANG184  LANG169
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG184'), $P.lang('LANG169')), check_time] //end time's value cannot small than start time's value.
            },
            "new_itrl_ftime_hour": {
                // required: true,
                digits: true,
                range: [0, 23],
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG184'), $P.lang('LANG169')), check_time]
            },
            "new_itrl_stime_minute": {
                // required: true,
                digits: true,
                range: [0, 59],
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG184'), $P.lang('LANG169')), check_time]
            },
            "new_itrl_ftime_minute": {
                // required: true,
                digits: true,
                range: [0, 59],
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG184'), $P.lang('LANG169')), check_time]
            },
            // "new_itrl_date_week": {
            //     required: true
            //     // customCallback: ['Choose one detailed date', check_date]
            // },
            "new_itrl_month_jan": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG244').toLowerCase()), check_month_required]
            },
            "new_itrl_week_sun": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG243').toLowerCase()), check_week_required]
            }
        },
        submitHandler: function(ev) {
            var target = this.submitButton;

            if ($(target).attr('id') !== 'save') {
                return;
            }

            new_crl_save_go();
        }
    });
}

function initFailoverTrunkTable() {
    OrderTable.table_id = 'table_failover';
    OrderTable.max_failover = maxFailoverTrunk;
    OrderTable.refresh_failover();
    OrderTable.bind_event();
}

function initTimeConditionTable() {
    OrderTableTimeCondition.table_id = 'table_timecondition';
    OrderTableTimeCondition.max_timecondition = maxTimeCondition;
    OrderTableTimeCondition.refresh_timecondition();
    OrderTableTimeCondition.bind_event();
}

function member_array_minus(arr1, arr2) {
    var arr3 = [];
    for (var i = 0; i < arr1.length; i++) {
        var flag = true;
        for (var j = 0; j < arr2.length; j++) {
            if (arr2[j].val == arr1[i].val) {
                flag = false;
            }
        }
        if (flag) {
            arr3.push(arr1[i]);
        }
    }
    return arr3;
}

function new_crl_save_go() {
    var levelVal = $("#permission").val();

    if (levelVal == "internal" && !$("#permission").is(":disabled")) {
        top.dialog.dialogConfirm({
            type: "warning",
            confirmStr: $P.lang("LANG2534").format($P.lang("LANG1071"), $P.lang("LANG1071")),
            buttons: {
                ok: function() {
                    doNew_crl_save_go();
                },
                cancel: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            }
        });
    } else if (levelVal == "none" && !$("#permission").is(":disabled")) {
        top.dialog.dialogConfirm({
            type: "warning",
            confirmStr: $P.lang("LANG3701"),
            buttons: {
                ok: function() {
                    doNew_crl_save_go();
                },
                cancel: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            }
        });
    } else {
        doNew_crl_save_go();
    }
}

function prepareAddItemForm() {
    selectbox.appendOpts({
        el: "leftSelect",
        opts: transGroupExtData()
    }, doc);
}

function processCustomNumber() {
    var customMember = $("#custom_member").val(),
        customMemberList = customMember.split(','),
        processedCustomMemberList = [],
        length, str, i;

    for (i = 0, length = customMemberList.length; i < length; i++) {
        str = $.trim(customMemberList[i]);

        if (str) {
            if (str[0] !== '_') {
                str = '_' + str;
            }

            processedCustomMemberList.push(str);
        }
    }

    return processedCustomMemberList.toString();
}

function transGroupExtData() {
    var arr = [];

    for (var i = 0, length = accountList.length; i < length; i++) {
        var obj = {},
            extension = accountList[i].extension,
            fullname = accountList[i].fullname,
            disabled = accountList[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
        }

        arr.push(obj);
    }

    for (var i = 0, length = groupList.length; i < length; i++) {
        var obj = {};
        obj["val"] = groupList[i].group_id;
        obj["text"] = $P.lang('LANG2714') + ' -- ' + groupList[i].group_name;
        arr.push(obj);
    }

    return arr;
}
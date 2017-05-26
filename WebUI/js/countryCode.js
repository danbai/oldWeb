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
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    uploadObj = {},
    blacklist_array = [],
    BLACKLIST = 'blacklist',
    delAction = {},
    maxOutboundBlacklist = 500,
    outboundBlacklist = [];

Array.prototype.contains = top.Array.prototype.contains;
Array.prototype.sortExtension = top.Array.prototype.sortExtension;
Array.prototype.indexOf = top.Array.prototype.indexOf;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG655"));

    getCountryCodes();
    getOutboundBlacklist();
    initForm();
});

function init_blacklist_table() {
    $("#blacklist_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: 600,
        height: "auto",
        postData: {
            "action": "listOutboundBlacklist"
        },
        colNames: [
            '<span locale="LANG5340">' + $P.lang('LANG5327') + '</span>',
            '<span locale="LANG5341">' + $P.lang('LANG5341') + '</span>',
            '<span locale="LANG5339">' + $P.lang('LANG5339') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'Continent',
            index: 'Continent',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'country',
            index: 'country',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'country_code',
            index: 'country_code',
            width: 100,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#blacklist_listpager",
        rowNum: 6,
        //rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: 'Continent',
        noData: "LANG129 LANG5339",
        jsonReader: {
            root: "response.country_code",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function(data) {
            // if (data.response && data.response.number && data.response.number.length != 0) {
            //     $("#blacklist_list_div .ui-jqgrid").style.display = "block";
            // } else {
            //     $("#blacklist_list_div .ui-jqgrid")[0].style.display = "none";
            // }
            $("#blacklist_listpager .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function(data) {
            // if (data.response && data.response.number && data.response.number.length != 0) {
            //     $("#blacklist_list_div .ui-jqgrid")[0].style.display = "block";
            // } else {
            //     $("#blacklist_list_div .ui-jqgrid")[0].style.display = "none";
            // }
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function createOptions(cellvalue, options, rowObject) {
    var del = '<button country="' + rowObject.country + '" countryCode="' + rowObject.country_code + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return del;
}

function transData(cellvalue, options, rowObject) {
    var str = cellvalue;

    if (str.length > 24) {
        str = "<span title="+cellvalue+">"+str.substring(0, 24) +"..."+"</span>";
    }

    return str;
}

function bindButtonEvent() {
    $("#blacklist_list")
        .delegate('.del', 'click', function(ev) {
            var countryCode = $(this).attr('countryCode');
            delAction = {
                "action": "deleteOutboundBlacklist",
                "blacklist": countryCode
            };
            var country = $(this).attr('country');

            if (country != "Custom") {
                delAction = {
                    "action": "updateCountryCodes",
                    "country_codes": JSON.stringify([{
                        country: country,
                        disable_code: "no"
                    }])
                }
            }

            $.ajax({
                type: "post",
                url: "/cgi",
                data: delAction,
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
                        jumpPageOrNot(1);
                        getOutboundBlacklist();
                        if (delAction.country_codes) {
                            $(".states").find("button[country='"+JSON.parse(delAction.country_codes)[0].country+"']").removeClass("countryDel").addClass("countryAdd");
                        }
                        checkParentCheckboxStatus();
                    }
                }
            });
            ev.stopPropagation();
            return false;
        });

    $('#countryContainer')
        .delegate('.close', 'click', function(ev) {
            var me = $(this);

            me.text('-').addClass('open').removeClass('close');

            me.parent().find('.countries').show();

            ev.stopPropagation();
            return false;
        })
        .delegate('.open', 'click', function(ev) {
            var me = $(this);

            me.text('+').addClass('close').removeClass('open');

            me.parent().find('.countries').hide();

            ev.stopPropagation();
            return false;
        })
        .delegate('.parent', 'click', function(ev) {
            var me = $(this),
                parentName = me.attr('name'),
                childUl = me.parent().find('.countries'),
                childLi = me.parent().find('.country');
                arr = [],
                isChecked = true,
                action = {};

            if (me.is(':checked')) {
                isChecked = true;
                childLi.each(function() {
                    arr.push({
                        country: $(this).children().filter("button").attr("country"),
                        disable_code: "yes"
                    });
                });
            } else {
                isChecked = false;
                childLi.each(function() {
                    arr.push({
                        country: $(this).children().filter("button").attr("country"),
                        disable_code: "no"
                    });
                });
            }
            action = {
                "action": "updateCountryCodes",
                "country_codes": JSON.stringify(arr)
            }
            $.ajax({
                type: "post",
                url: "/cgi",
                data: action,
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
                        
                        childLi.each(function() {
                            var btn = $(this).children().filter("button");

                            if (isChecked) {
                                btn.removeClass("countryAdd").addClass("countryDel");
                            } else {
                                btn.removeClass("countryDel").addClass("countryAdd");
                            }
                        });
                        jumpPageOrNot(arr.length);
                        getOutboundBlacklist();
                    }
                }
            });
            top.Custom.init(doc, childUl[0]);
        })
        // .delegate('.child', 'click', function(ev) {
        //     var me = $(this),
        //         parentName = me.attr('parent'),
        //         parentCheckbox = $('input[name="' + parentName + '"]'),
        //         parentUl = me.parents('.countries'),
        //         otherChildCheckbox = parentUl.find('.child').not(me),
        //         otherChildCheckboxIsAllChecked = true;

        //     if (me.is(':checked')) {
        //         otherChildCheckbox.each(function() {
        //             if (!this.checked) {
        //                 otherChildCheckboxIsAllChecked = false;
        //                 return false;
        //             }
        //         });

        //         parentCheckbox[0].checked = otherChildCheckboxIsAllChecked;
        //     } else {
        //         parentCheckbox[0].checked = false;
        //     }

        //     top.Custom.init(doc, parentUl[0]);
        //     top.Custom.init(doc, parentCheckbox[0]);
        // })
        .delegate('.countryAdd', 'click', function(ev) {
            var me = this;
            var countryCode = $(me).attr('countryCode');
            var action = {
                "action": "addOutboundBlacklist",
                "blacklist": countryCode
            };
            var country = $(this).attr('country');

            if (country != "Custom") {
                action = {
                    "action": "updateCountryCodes",
                    "country_codes": JSON.stringify([{
                        country: country,
                        disable_code: "yes"
                    }])
                }
            }

            $.ajax({
                type: "post",
                url: "/cgi",
                data: action,
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
                        $(me).removeClass("countryAdd").addClass("countryDel");
                        jumpPageOrNot(1);
                        getOutboundBlacklist();
                        checkParentCheckboxStatus();
                    }
                }
            });
            ev.stopPropagation();
            return false;
        })
        .delegate('.countryDel', 'click', function(ev) {
            var me = this;
            var countryCode = $(this).attr('countryCode');
            var action = {
                "action": "deleteOutboundBlacklist",
                "blacklist": countryCode
            };
            var country = $(this).attr('country');

            if (country != "Custom") {
                action = {
                    "action": "updateCountryCodes",
                    "country_codes": JSON.stringify([{
                        country: country,
                        disable_code: "no"
                    }])
                }
            }

            $.ajax({
                type: "post",
                url: "/cgi",
                data: action,
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
                        $(me).removeClass("countryDel").addClass("countryAdd");
                        jumpPageOrNot(1);
                        getOutboundBlacklist();
                        checkParentCheckboxStatus();
                    }
                }
            });
            ev.stopPropagation();
            return false;
        });
}

function getCountryCodes() {
    $.ajax({
        type: "post",
        url: "/cgi",
        data: {
            'action': 'getCountryCodes'
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response;

                if (response && response.hasOwnProperty('country_codes') && !$.isEmptyObject(response.country_codes)) {
                    countryCodes = response.country_codes;

                    renderCountryCodes(countryCodes);
                }
            }
        }
    });
}

function strip(codes) {
    var codeList = codes.split(','),
        result = '';

    if (codeList.length > 5) {
        result = codeList.slice(0, 5).join(',') + '...';
    } else {
        result = codeList.join(',');
    }

    return result;
}

function renderCountryCodes(countryCodes) {
    if (!countryCodes) {
        return false;
    }

    var statesUl = $('<ul class="states"></ul>');

    for (var state in countryCodes) {
        var stateObj = countryCodes[state],
            length = stateObj.length,
            stateLi = $('<li></li>'),
            countryUl = $('<ul class="countries" parent="' + state + '"></ul>');

        stateLi.append('<span class="close">+</span><input type="checkbox" class="parent" name="' + state + '" /><span class="state-name">' + state + '</span>');

        for (var i = 0; i < length; i++) {
            var country = stateObj[i],
                countryLi = $('<li class="country"></li>');

            countryLi.append('<button type="button" class="'+(country.disable_code === 'yes' ? 'countryDel' : 'countryAdd')+'" country="'+country.country+'" countryCode="'+country.country_code+'" disableCode="'+country.disable_code+'"></button><span class="country-name">' + country.country +
                '</span><span class="country-code" title="' + country.country_code + '">' + strip(country.country_code) + '</span>');

            countryLi.appendTo(countryUl);
        }

        if (length) {
            stateLi.append(countryUl);
        }

        stateLi.appendTo(statesUl);
    }

    $('#countryContainer').append(statesUl);

    checkParentCheckboxStatus();
}

function jumpPageOrNot(selectedRows) {
    var table = $("#blacklist_list"),
        totalPage = table.getGridParam("lastpage"),
        page = table.getGridParam("page"),
        reccount = table.getGridParam("reccount");

    if (page === totalPage && totalPage > 1 && reccount === selectedRows) {
        table.setGridParam({
            page: totalPage - 1
        }).trigger('reloadGrid');
    } else if(selectedRows > 1) {
        table.setGridParam({
            page: 1
        }).trigger('reloadGrid');
    }else {
        table.trigger('reloadGrid');
    }
}

function initForm() {
    init_blacklist_table();

    bindButtonEvent();
    top.Custom.init(doc);
    initValidator();
}

function checkParentCheckboxStatus() {
    $('ul.countries').each(function() {
        var me = $(this),
            parentName = me.attr('parent'),
            parentCheckbox = $('input[name="' + parentName + '"]'),
            childCheckbox = me.find('.country'),
            childCheckboxIsAllChecked = true;

        childCheckbox.each(function() {
            if ($(this).children().filter("button").attr("class") == "countryAdd") {
                childCheckboxIsAllChecked = false;
                return false;
            }
        });

        parentCheckbox[0].checked = childCheckboxIsAllChecked;
    });
}

// check the new number is already exists in blacklist or not
function check_blacklist_existance(value, element) {
    if (!value) {
        return true;
    }

    if (blacklist_array.contains(value)) {
        return false;
    }

    return true;
};

function check_pattern_format(value, element) {
    var res = false;

    var item = $.trim(value);

    if (!/[^a-zA-Z0-9\#\*\.!\-\+\/]/.test(item)) {
        res = true;
    } else {
        return false;
    }

    return res;
}

function check_pattern_with_cid(value, element) {
    var res = false;

    var item = $.trim(value);

    if (/^[0-9a-zA-Z!\-\.\?\+\*\#]+[0-9]+$/.test(item)) {
        res = true;
    } else if (!/\//.test(item)) {
        res = true;
    } else {
        return false;
    }

    return res;
}

function initValidator() {
    $("#form").tooltip();

    $P("#form", doc).validate({
        rules: {
            "new_number": {
                required: true,
                customCallback1: [$P.lang('LANG5343'), check_pattern_format],
                customCallback2: [$P.lang('LANG2994'), check_pattern_with_cid],
                // callerid: true,
                customCallback: [$P.lang('LANG5342'), check_blacklist_existance]
            } 
        },
        submitHandler: function() {
            save_changes()
        }
    });
}

function getOutboundBlacklist() {
    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            action: "getOutboundBlacklist"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                outboundBlacklist = data.response.outbound_blacklist;
                for (var i = 0; i <= outboundBlacklist.length; i++) {
                    if(outboundBlacklist[i]) {
                        blacklist_array.push(outboundBlacklist[i].blacklist);
                    }
                }
            }
        }
    });
}

function save_changes() {
    var action = {
        "action": "addOutboundBlacklist",
        "blacklist": $("#new_number").val()
    };

    if (outboundBlacklist.length >= maxOutboundBlacklist) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang('LANG5416').format(maxOutboundBlacklist, outboundBlacklist.length),
            callback: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        });
        return;
    }
    $.ajax({
        type: "post",
        url: "/cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);
            $("#new_number").val("");

            if (bool) {
                jumpPageOrNot(1);
                getOutboundBlacklist();
            }
        }
    });
}
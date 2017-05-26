/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
(function($) {
    window.tableWidget = function(config) {
        var me = this;
        var jumpPage = config.jumpPage;
        if (jumpPage && jumpPage.page) {
            config.page = jumpPage.page;
        } else {
            config.page = 1;
        }
        me.config = $.extend(me.initConfig, config);
        me.init();
    }
    tableWidget.prototype = {
        initConfig: {
            position: 'divId',
            width: '100%',
            height: '',
            theadContent: [],
            tbodyContent: {},
            showNum: '9',
            noData: '',
            buttons: {},
            footContent: {
                total: 'Total',
                show: 'Show',
                go: 'Go',
                jump: 'Jump to',
                first: 'First',
                prev: 'Prev',
                next: 'Next',
                last: 'Last'
            },
            jumpPage: {
                page: "",
                callBack: function() {}
            },
            status: {}
        },
        /*
        ###	initialized component and create component main structure
        */
        init: function() {
            var me = this,
                config = me.config;
            var position = config.position;
            var width = config.width;
            var height = config.height;
            var page = config.page;
            var table = me.table = $("<table>").appendTo("#" + position)
                .attr({
                    cellpadding: "0",
                    cellspacing: "0",
                    align: "center",
                    id: "tableWidget"
                })
                .css({
                    width: width
                })
                .addClass("tableWidget");
            me.thead = $("<thead>").appendTo(table).addClass("thead");
            me.tbody = $("<tbody>").appendTo(table).addClass("tbody");
            me.tfoot = $("<tfoot>").appendTo(table).addClass("tfoot");
            me.createThead();
            if (page) {
                me.createTbody(page);
            } else {
                me.createTbody(1);
            }
            me.createTfoot();
        },
        createThead: function() {
            var me = this,
                config = me.config;
            var thead = me.thead;
            var tr = $("<tr>").addClass("frow").appendTo(thead);
            var theadContent = config.theadContent;
            for (var i = 0; i < theadContent.length; i++) {
                if (theadContent[i] == "checkbox") {
                    var checkboxTh = $("<th>").appendTo(tr);
                    checkboxTh.css("width", "30px");
                    $("<input type='checkbox'>").appendTo(checkboxTh).attr({
                        id: "CHECKALL",
                        title: $P.lang("LANG559"),
                        localetitle: "LANG559"
                    })
                } else {
                    var spanTh = $("<th>").appendTo(tr);
                    if (theadContent[i] == "disNone") {
                        spanTh.hide();
                    } else {
                        $("<span>").appendTo(spanTh).attr("locale", theadContent[i]).html($P.lang(theadContent[i]));
                    }
                }
            }
        },
        createTbody: function(page) {
            var me = this,
                listsLen, isDisable, config = me.config;
            var thead = me.thead;
            var tbody = me.tbody;
            var tfoot = me.tfoot;
            var tbodyContent = config.tbodyContent;
            var buttons = tbodyContent.buttons;
            var label = tbodyContent.label;
            var id = tbodyContent.id;
            var showNum = parseInt(config.showNum);
            var content = tbodyContent.content;
            var listId = content.listId;
            var special = content.special;
            var rules = content.rules;
            var module = config.module;
            var total = me.total = Math.floor(parseInt(id.length) / showNum);
            var theadContent = config.theadContent;
            if (total != parseInt(id.length) / showNum) {
                total = me.total = Math.floor(parseInt(id.length) / showNum) + 1;
            }
            if (page > total) {
                page = page - 1;
            }
            // top.sessionData.userPage = page;
            top.UCMGUI.config.userPage = page;
            me.page = page;
            var pageList = me.pageList = (parseInt(page) - 1) * showNum;
            if (page == total) {
                listsLen = parseInt(id.length);
            } else {
                listsLen = showNum + pageList;
            }
            if (id.length == 0) {
                $(thead).hide();
                $(tfoot).hide();
                var tr = $("<tr>").appendTo(tbody).attr("align", "center");
                var data = config.noData.split(" ");
                $("<td>").appendTo(tr).html($P.lang(data[0]).format($P.lang(data[1]))).attr("locale", config.noData).addClass("noUser");
                return;
            }
            for (var i = pageList; i < listsLen; i++) {
                var tr = $("<tr>").appendTo(tbody).attr("align", "center");
                var btn_id = '';
                if (label != undefined) {
                    var checkboxTd = $("<td>").appendTo(tr);
                    $("<input type='checkbox'>").appendTo(checkboxTd).addClass("selected_extensions").val(content.list[i].id);
                }
                for (var j = 0; j < listId.length; j++) {
                    var bool = false;
                    var listInfo = '--';
                    if (rules) {
                        $.each(rules, function(index, item) {
                            if (item.id == listId[j]) {
                                listInfo = item.getInfo(i);
                                btn_id = item.getBtnId(i);
                                bool = true;
                                return false;
                            }
                        });
                    }
                    if (!bool && module !== 'LDAP Server') {
                        if (content.list[id[i]] && content.list[id[i]].getProperty) {
                            listInfo = content.list[id[i]].getProperty(listId[j])
                        } else {
                            listInfo = content.list[i][listId[j]];
                        }
                    }
                    var contentList = listInfo ? listInfo : '--';
                    if (listInfo == "no") {
                        contentList = '--';
                    }
                    if (listId[j] == "id") {
                        contentList = id[i];
                    }
                    if (content.list[i] && content.list[i].id && listId[j] == "id") {
                        contentList = content.list[i].id;
                    }
                    if (content.list[i] && listId[j] == "status") {
                        var status = config.status[content.list[i].status];
                        var stateLang = $P.lang(status);
                        if (status) {
                            contentList = "<span id=" + content.list[i].id + " class=" + status + " localeTitle=" + status + " title=" + stateLang + "></span>"
                        } else {
                            var Unavailable = config.status["Unavailable"];
                            var UnavailableLang = $P.lang(Unavailable);
                            contentList = "<span class=" + Unavailable + " localeTitle=" + Unavailable + " title=" + UnavailableLang + "></span>"
                        }
                        if (listInfo == "Idle") {
                            isDisable = false;
                        } else {
                            isDisable = true;
                        }
                    }
                    // listId[j] == "dahdichan" ? (contentList = listInfo ? 1 + parseInt(listInfo - top.sessionData.FXS_PORTS_DETECTED[0]) : '--') : 'do nothing';
                    listId[j] == "dahdichan" ? (contentList = listInfo ? 1 + parseInt(listInfo - top.UCMGUI.config.FXS_PORTS_DETECTED[0]) : '--') : 'do nothing';
                    if (config.theadContent[0] == "disNone" && j == 0) {
                        $("<td>").appendTo(tr).html(contentList).hide();
                    } else {
                        $("<td>").appendTo(tr).html(contentList);
                    }
                };
                me.optionsTd = $("<td>").appendTo(tr);
                if (module === 'LDAP Server') {
                    me.createOPtions(buttons, btn_id, isDisable);
                    if (btn_id === '1') {
                        me.optionsTd.find(".del").addClass("disabled").attr("disabled", "disabled");
                    }
                } else if (content.list[i] && content.list[i].id) {
                    me.createOPtions(buttons, content.list[i].id, isDisable);
                } else {
                    me.createOPtions(buttons, id[i], isDisable);
                }
            };
            top.Custom.init(document);
            $(".tableWidget tbody tr:even").addClass("even");
            $(".tableWidget tbody tr:odd").addClass("odd");
        },
        createOPtions: function(btns, id, isDisable) {
            var me = this;
            if (btns != undefined) {
                for (var k = 0; k < btns.des.length; k++) {
                    var button = $("<button>").appendTo(me.optionsTd)
                        .attr({
                            id: id,
                            title: btns.des[k].title,
                            localeTitle: btns.des[k].localeTitle
                        })
                        .addClass(btns.des[k].className);
                    if (btns.des[k].disable && isDisable) {
                        button.addClass("disabled").attr("disabled", "disabled");
                    }
                };
            }
            $("#CHECKALL").unbind("click");
            $(".selected_extensions").unbind("click");
            $(".del").unbind("click");
            $(".edit").unbind("click");
            $(".reboot").unbind("click");
            $(".download").unbind("click");
            $(".reboot").bind("click", function(ev) {
                if (!this.className.contains("disabled")) {
                    btns.options.reboot(this);
                }
                ev.stopPropagation();
                return false;
            });
            $(".del").bind("click", function(ev) {
                if (!this.className.contains("disabled")) {
                    btns.options.del(this);
                }
                ev.stopPropagation();
                return false;
            });
            $(".edit").bind("click", function(ev) {
                if (!this.className.contains("disabled")) {
                    btns.options.edit(this);
                }
                ev.stopPropagation();
                return false;
            });
            $(".download").bind("click", function(ev) {
                if (!this.className.contains("disabled")) {
                    btns.options.download(this);
                }
                ev.stopPropagation();
                return false;
            });
            // $("#CHECKALL").bind("click", function(ev) {
            //     if ($(this).attr("checked") == "checked") {
            //         $(".selected_extensions").attr("checked", "checked");
            //         $(".selected_extensions").prev().css("backgroundPosition", "0px -50px");
            //     } else {
            //         $(".selected_extensions").removeAttr("checked");
            //         $(".selected_extensions").prev().css("backgroundPosition", "0px 0px");
            //     }
            //     ev.stopPropagation();
            // });
            // $(".selected_extensions").bind("click", function(ev) {
            //     if ($(".selected_extensions").filter(":checked").length != $(".selected_extensions").length) {
            //         $("#CHECKALL").removeAttr("checked");
            //         $("#CHECKALL").prev().css("backgroundPosition", "0px 0px");
            //     } else {
            //         $("#CHECKALL").attr("checked", "checked");
            //         $("#CHECKALL").prev().css("backgroundPosition", "0px -50px");
            //     }
            //     ev.stopPropagation();
            // });
            $("#CHECKALL").bind("click", function(ev) {
                var selected = $(".selected_extensions"),
                    length = $(".selected_extensions").length;

                if ($(this).length > 0 && $(this)[0].checked) {
                    for (var i = 0; i < length; i++) {
                        selected[i].checked = true;
                    }
                    $(".selected_extensions").prev().css("backgroundPosition", "0px -50px");
                } else {
                    for (var i = 0; i < length; i++) {
                        selected[i].checked = false;
                    }
                    $(".selected_extensions").prev().css("backgroundPosition", "0px 0px");
                }
                ev.stopPropagation();
            });
            $(".selected_extensions").bind("click", function(ev) {
                if ($(".selected_extensions").filter(":checked").length != $(".selected_extensions").length) {
                    $("#CHECKALL")[0].checked = false;
                    $("#CHECKALL").prev().css("backgroundPosition", "0px 0px");
                } else {
                    $("#CHECKALL")[0].checked = true;
                    $("#CHECKALL").prev().css("backgroundPosition", "0px -50px");
                }
                ev.stopPropagation();
            });
        },
        createTfoot: function() {
            var me = this,
                prevPage, nextPage, config = me.config;
            var theadContent = config.theadContent;
            var tbodyContent = config.tbodyContent;
            var tbody = me.tbody;
            var tfoot = me.tfoot;
            var footContent = config.footContent;
            var showNum = config.showNum;
            var totalInfo = tbodyContent.id.length;
            var total = me.total;
            var tr = $("<tr>").appendTo(tfoot);
            var colspan = theadContent.length;
            var td = $("<td>").appendTo(tr).attr("colspan", colspan);
            var pageDes = $("<div>").appendTo(td).addClass("pageDes");
            var pageOptions = $("<div>").appendTo(td).addClass("pageOptions");
            var page = parseInt(me.page);
            if (page != 1) {
                prevPage = page - 1;
            } else {
                prevPage = 1;
            }
            if (page == total) {
                nextPage = total;
            } else {
                nextPage = page + 1;
            }
            $("<span>").appendTo(pageDes).html($P.lang("LANG115")).attr("locale", "LANG115");
            $("<strong>").appendTo(pageDes).html(totalInfo).addClass("total");
            $("<span>").appendTo(pageDes).html($P.lang("LANG118")).attr("locale", "LANG118");
            $("<strong>").appendTo(pageDes).html(page + "/" + total).addClass("current");
            $("<span>").appendTo(pageDes).html($P.lang("LANG119")).attr("locale", "LANG119");
            $("<input>").appendTo(pageDes).addClass("jump").attr("maxlength", "4");
            $("<button>").appendTo(pageDes).html($P.lang("LANG120")).attr("locale", "LANG120").addClass("btn btn-paging");
            var firstBtn = $("<button>").appendTo(pageOptions).html($P.lang("LANG121")).attr("locale", "LANG121").addClass("btn btn-paging").val("1");
            var prevBtn = $("<button>").appendTo(pageOptions).html($P.lang("LANG122")).attr("locale", "LANG122").addClass("btn btn-paging").val(prevPage);
            var nextBtn = $("<button>").appendTo(pageOptions).html($P.lang("LANG123")).attr("locale", "LANG123").addClass("btn btn-paging").val(nextPage);
            var lastBtn = $("<button>").appendTo(pageOptions).html($P.lang("LANG124")).attr("locale", "LANG124").addClass("btn btn-paging").val(total);

            if (page == 1) {
                firstBtn.addClass("disabled").attr("disabled", "disabled");
                prevBtn.addClass("disabled").attr("disabled", "disabled");
            } else if (page == total) {
                nextBtn.addClass("disabled").attr("disabled", "disabled");
                lastBtn.addClass("disabled").attr("disabled", "disabled");
            }

            if (total == 1) {
                firstBtn.addClass("disabled").attr("disabled", "disabled");
                prevBtn.addClass("disabled").attr("disabled", "disabled");
                nextBtn.addClass("disabled").attr("disabled", "disabled");
                lastBtn.addClass("disabled").attr("disabled", "disabled");
            }

            me.addEventJump();
        },
        jumpFocus: function(me) {
            var jumpPage = me.config.jumpPage;
            $(".jump").focus();
            if (jumpPage && jumpPage.callback) {
                jumpPage.callback.call();
            }

        },
        addEventJump: function() {
            var me = this;
            var tbody = me.tbody;
            var tfoot = me.tfoot;
            var total = me.total;
            $(".btn-paging").bind("click", function(ev) {
                var page = parseInt($(this).val());
                if (isNaN(page)) {
                    page = parseInt($(".jump").val());
                }
                me.jumpToPage(page);
                ev.stopPropagation();
                return false;
            });
            $(".jump").bind({
                mousedown: function(ev) {
                    if (ev.button == 2) {
                        $(this).val($(this).val().replace(/\D|^0/g, ''));
                        ev.stopPropagation();
                        return false;
                    }
                },
                keydown: function(ev) {
                    if (ev.keyCode == 13) {
                        var page = parseInt($(".jump").val());
                        me.jumpToPage(page);
                        ev.stopPropagation();
                        return false;
                    }
                },
                keyup: function(ev) { //keyup event
                    $(this).val($(this).val().replace(/\D|^0/g, ''));
                    ev.stopPropagation();
                    return false;
                },
                paste: function(ev) {
                    $(this).val($(this).val().replace(/\D|^0/g, ''));
                    ev.stopPropagation();
                    return false;
                }
            });
        },
        jumpToPage: function(page) {
            var me = this;
            var table = me.table;
            var thead = me.thead;
            var tbody = me.tbody;
            var tfoot = me.tfoot;
            var total = me.total;
            var jumpPage = me.config.jumpPage;
            $('.jump').val('');
            if (page < 1 || page > total || isNaN(page)) {
                $(".jump").blur();
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG929"),
                    callback: function() {
                        me.jumpFocus(me);
                    }
                })
                return;
            }
            // top.sessionData.userPage = page;
            top.UCMGUI.config.userPage = page;
            //$(thead).empty();
            $(tbody).empty();
            $(tfoot).empty();
            //me.createThead();
            me.createTbody(page);
            // $("#CHECKALL").removeAttr("checked");
            if ($("#CHECKALL").length > 0) {
                $("#CHECKALL")[0].checked = false;
                $("#CHECKALL").prev().css("backgroundPosition", "0px 0px");
            }
            me.createTfoot();
            if (jumpPage && jumpPage.callback) {
                jumpPage.callback.call();
            }
        }
    }
})(jQuery)
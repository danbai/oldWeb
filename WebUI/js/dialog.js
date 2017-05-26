/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

(function($) {

    //var prevDialog = null;
    var dialogQueue = [],
        clearNext = null;

    // the following functions are declared as private purposely
    function processUnloadDialog(sender, immediate) {
        var type = sender.currentDialogType;
        var callback = sender.closeCallback;

        if (type != "dialog") {
            $(sender.shadeDiv).hide();
            $(sender.container).hide();
            $(sender.confirm).hide();
        }
        sender.dialog.hide();

        sender.currentDialogType = "";
        sender.closeCallback = null;
        sender.config.dialogLevel = "";

        if (type == "iframe" && sender.contentIframe) {
            sender.contentIframe.hide();
            //sender.contentIframe.remove();

            if (clearNext != null) {
                clearNext.remove();
                clearNext = null;
            }

            if (immediate)
                sender.contentIframe.remove();
            else
                clearNext = sender.contentIframe;

            //sender.contentIframe = null;
        }

        // callback should be triggered AFTER all the unload is completed
        if (typeof callback === "function") {
            callback.call(sender);
        }
    }

    function unloadPreviousContentDialog(prev) {
        if (prev.currentDialogType == "iframe") {
            var last = dialogQueue[dialogQueue.length - 1];
            if (last) {
                // do not need to process anything if is same iframe
                if (prev.contentIframe == last.contentIframe) {
                    return;
                }

                // hide last content iframe. Now we are supporting more than one frames
                if (last.contentIframe) {
                    last.contentIframe.hide();
                    //last.contentIframe.remove();
                }
                // [AH] logic change to keep dialog in queues, so can't remove it now
                //dialogQueue.shift();
            }

            var prevDialog = {};

            // record the states need to be carried
            prevDialog.config = $.extend({}, prev.config);
            prevDialog.currentDialogType = prev.currentDialogType;
            prevDialog.contentIframe = prev.contentIframe;
            prevDialog.dialogLevel = prev.dialogLevel;
            prevDialog.closeCallback = prev.closeCallback;
            prevDialog.dialogTitle = prev.dialogTitle;
            prevDialog.displayDialogCommands = prev.displayDialogCommands;

            dialogQueue.push(prevDialog);
        }
    }

    window.dialog = function(config) {
        var me = this;

        // calculating scrollbar size
        var getScrollbarWidth = function() {
            var parent, child, width;

            parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
            child = parent.children();
            width = child.innerWidth() - child.height(99).innerWidth();
            parent.remove();

            return width;
        };

        me.currentDialogType = "";
        me.scrollbarWidth = getScrollbarWidth();
        me.config = $.extend(me.initConfig, config);
        me.init();
    }
    dialog.prototype = {
        initConfig: {
            url: './images/',
            iconType: 'png',
            timer: 3000,
            containerWidth: 600,
            level: {
                // 'info': 0,
                // 'warning': 1,
                // 'loading': 2,
                // 'success': 3,
                // 'upload': 4,
                // 'error': 5,
                // 'low': 6,
                // 'high': 7,
                // 'supeme': 8
            },
            dialogLevel: ''
        },
        /*
        ### initialized component and create component main structure
        */
        init: function() {
            var me = this,
                dialogLeft, dialogTop, containerLeft, containerTop, confirmLeft, confirmTop;
            /*create shade div and dialog div*/
            var shadeDiv = me.shadeDiv = $("<div>").appendTo(document.body).addClass("shadeDiv");
            var dialog = me.dialog = $("<div>").appendTo(document.body).addClass("dialog");
            var dialogClose = me.dialogClose = $("<span>").appendTo(dialog)
                .addClass("dialogClose");

            var table = me.table = $("<table>").appendTo(dialog).attr({
                cellpadding: "0",
                cellspacing: "0"
            });
            var trTitle = me.trTitle = $("<tr>").appendTo(table);
            var tdTitle = me.tdTitle = $("<td>").appendTo(trTitle).addClass("dialog-title").attr("colspan", "2");
            var trContent = $("<tr>").appendTo(table);
            var tableTrIconTd = me.tableTrIconTd = $("<td>").appendTo(trContent).addClass("dialog-icon");
            var tableTrContentTd = me.tableTrContentTd = $("<td>").appendTo(trContent).addClass("dialog-content");
            me.iconImg = $("<img>").appendTo(tableTrIconTd);
            me.contentSpan = $("<span>").appendTo(tableTrContentTd);

            /* dialogContainer div */
            var container = me.container = $("<div>").appendTo(document.body).addClass("dialogContainer");
            var dialogTitle = me.dialogTitle = $("<div>").appendTo(container).addClass("dialogContainer-title");
            dialogTitle.attr("onselectstart", "return false");
            var dialogTable = me.dialogTable = $("<table>").appendTo(dialogTitle).attr({
                cellpadding: "0",
                cellspacing: "0"
            }).addClass("dialogContainer-table");
            var dialogTr = me.dialogTr = $("<tr>").appendTo(dialogTable);
            me.titleSpan = $("<td>").addClass('dialogContainer-title-content').appendTo(dialogTr);
            var titleClose = me.titleClose = $("<td>").addClass("dialogContainer-title-close").appendTo(dialogTr).html("x"); //.css("left", me.config.containerWidth - 100);
            var content = me.dialogContent = $("<div>").appendTo(container).addClass("dialogContainer-content");
            var commands = me.dialogCommands = $("<div>").appendTo(container).addClass("dialogContainer-commands");


            /* dialogConfirm div*/
            var confirm = me.confirm = $("<div>").appendTo(document.body).addClass("dialogConfirm");
            var confirmTitle = me.confirmTitle = $("<div>").appendTo(confirm).addClass("dialogConfirm-title");
            var confirmClose = me.confirmClose = $("<span>").appendTo(confirmTitle).addClass("dialogConfirm-title-close").html("x");
            me.confirmTitleSapn = $("<span>").appendTo(confirmTitle).addClass("dialogConfirm-title-content");
            var confirmContent = me.confirmContent = $("<div>").appendTo(confirm).addClass("dialogConfirm-content");
            var confirmTable = me.confirmTable = $("<table>").appendTo(confirmContent).attr({
                cellpadding: "0",
                cellspacing: "0",
                width: "100%"
            });
            var trConfirm = $("<tr>").appendTo(confirmTable);
            var confirmTableIcon = me.confirmTableIcon = $("<td>").appendTo(trConfirm).addClass("dialogConfirm-icon");
            var confirmTableContent = me.confirmTableContent = $("<td>").appendTo(trConfirm).addClass("dialogConfirm-content");
            me.confirmIconImg = $("<img>").appendTo(confirmTableIcon);
            me.confirmContentSpan = $("<span>").appendTo(confirmTableContent);
            var confirmOption = me.confirmOption = $("<div>").appendTo(confirm).addClass("dialogConfirm-option");
            var optionCancel = me.optionCancel = $("<button type='button' value='cancel'>").appendTo(confirmOption).addClass("btn dialogConfirm-option-cancel").attr("locale", "LANG726").html($.lang("LANG726"));
            var optionEmail = me.optionEmail = $("<button type='button' value='email'>").appendTo(confirmOption).addClass("btn dialogConfirm-option-update").attr("locale", "LANG4576").html($.lang("LANG4576"));
            var optionSure = me.optionSure = $("<button type='button' value='ok'>").appendTo(confirmOption).addClass("btn dialogConfirm-option-sure").attr("locale", "LANG727").html($.lang("LANG727"));

            $(titleClose).bind("click", function(ev) {
                //$(shadeDiv).hide();
                //$(container).hide();
                var iframeSrc = container.find("iframe").attr("src").toLowerCase();
                if (iframeSrc.contains(".wav") || iframeSrc.contains(".gsm")) {
                    container.find("iframe").remove();
                }

                if (iframeSrc.contains('premeet_modal.html?mode=add')) {
                    var mainScreen = top.frames['frameContainer'].frames['mainScreen'];
                    mainScreen.$('.drag-chip-wrapper', mainScreen.document).remove();
                }

                //me.config.dialogLevel = '';

                processUnloadDialog(me, true);

                ev.stopPropagation();
                return false;
            });

            $(top.window).bind("resize", function() {
                me.repositionDialog();
            });
            me.repositionDialog();
        },
        repositionDialog: function(type) {
            var me = this;
            var _x, _y, m, allscreen = false;
            if (!me.currentDialogType)
                return;

            var dialog = me.dialog;
            var confirm = me.confirm;
            var container = me.container;
            var contentIframe = me.contentIframe;

            var bWidth = $("body").width();
            var bHeight = $("body").height();

            var dialogWidth = $(dialog).width();
            var dialogHeight = $(dialog).height();

            if (me.currentDialogType === "iframe") {
                var bestVisibleH = bHeight - 100;
                var disDiv = $(contentIframe).contents().find("form:first").children();
                var dHeight, dWidth;
                dHeight = $(contentIframe).contents().height();
                dWidth = $(contentIframe).contents().width();
                for (var i = 0; i < disDiv.length; i++) {
                    if (disDiv.eq(i).css("display") == "block") {
                        dHeight = disDiv.eq(i).height();
                        dWidth = disDiv.eq(i).width();
                        break;
                    }
                }
                if (UCMGUI.config.msie && (UCMGUI.config.ie7 || UCMGUI.config.ie8)) {
                    dWidth += 5;
                }
                if (dHeight > bestVisibleH) {
                    dHeight = bestVisibleH;
                }
                dHeight += 7;
                $(contentIframe).height(dHeight);
                $(contentIframe).width(dWidth);

                // if we can get the width from iframe, attempt to resize the container
                $(container).css("width", ""); // this will remove the fix size of the dialog
            }
            if (contentIframe && contentIframe.is(":visible")) {
                var body = contentIframe.contents()[0].body;
                var scrollWidth = body.scrollWidth;
                var clientWidth = body.clientWidth;
                if (scrollWidth - clientWidth) {
                    $(contentIframe).height(dHeight - 50);
                    contentIframe.width(contentIframe.width() + 18);
                }
                $(container).width(contentIframe.width() + 24); //dialogContainer-content offsetLeft*2
            }
            var contentWidth = $(container).width();
            var contentHeight = $(container).height();
            var top = parseInt(bHeight - dialogHeight) / 2;

            dialogLeft = parseInt(bWidth - dialogWidth) / 2;
            dialogTop = ((top > 200) ? (top - 200) : top);
            containerLeft = parseInt(bWidth - contentWidth) / 2;
            containerTop = parseInt(bHeight - contentHeight) / 2; //160;
            if (type == undefined) {
                $(dialog).css({
                    left: dialogLeft + "px",
                    top: dialogTop + "px"
                });
                $(container).css({
                    left: containerLeft + "px",
                    top: containerTop + "px"
                });
                $(confirm).css({
                    left: dialogLeft + "px",
                    top: dialogTop + "px"
                });
            }
            // var commandsTop = contentHeight - 108;
            // $(".modal-commands", frames["frameDialog"].contentDocument).css({position: "fixed", top: "610px", left: "0px"})
            var marginLeft = parseInt(contentWidth / 2);
            var marginTop = parseInt(contentHeight / 2);
            var winWidth = parseInt($(window).width() / 2);
            var winHeight = parseInt($(window).height() / 2.2);
            var left = winWidth - marginLeft;
            var top = winHeight - marginTop;
            /*if (($.browser.msie && parseInt($.browser.version) >= 9) || !$.browser.msie) {*/
            if ((UCMGUI.config.msie && (UCMGUI.config.ie9 || UCMGUI.config.ie10)) || !UCMGUI.config.msie) {
                $('.dialogContainer-title').mousedown(function(e) {
                    $(".dialogContainer").css({
                        opacity: ".3",
                        filter: "Alpha(Opacity=30)"
                    });
                    if (e.which) {
                        m = true;
                        _x = e.pageX - parseInt($('.dialogContainer').css('left'));
                        _y = e.pageY - parseInt($('.dialogContainer').css('top'));
                    }
                }).mousemove(function(e) {
                    $('.dialogContainer-title').css("cursor", "move");
                    if (m && !allscreen) {
                        var x = e.pageX - _x;
                        var y = e.pageY - _y;
                        if ($("body").width() < (x + $('.dialogContainer').width() + 4)) {
                            m = false;
                            return;
                        }
                        $('.dialogContainer').css({
                            left: x,
                            top: y
                        });
                    }
                }).mouseout(function() {
                    $(".dialogContainer").css({
                        opacity: "1",
                        filter: "Alpha(Opacity=100)"
                    });
                    m = false;
                }).mouseup(function() {
                    $(".dialogContainer").css({
                        opacity: "1",
                        filter: "Alpha(Opacity=100)"
                    });
                    m = false;
                });
            }
        },
        dialogMessage: function(obj) {
            var me = this;

            unloadPreviousContentDialog(me);

            var wait = function(dtd) {
                var tasks = function() {
                    dtd.resolve();
                };
                setTimeout(tasks, 1);
                return dtd.promise();
            };
            $.Deferred(wait).done(function() {
                me._dialogMessage(obj);
            })
        },
        _dialogMessage: function(obj) {
            var me = this,
                imgSrc;
            // set current display dialog type
            me.currentDialogType = "message";
            me.closeCallback = obj.closeCallback;
            me.dialogLevel = 'supeme';
            if (me.config.level[me.config.type] > me.config.level[obj.type] && me.dialog.is(":visible")) {
                return;
            }
            if (obj.dialogLevel && me.config.level[me.config.dialogLevel] != undefined) {
                me.dialogLevel = obj.dialogLevel;
                if (me.config.level[me.dialogLevel] < me.config.level[me.config.dialogLevel]) {
                    // TODO [AH] remove this log or change to centralize logging control
                    return;
                }
            } else {
                if (me.config.level[me.dialogLevel] < me.config.level[me.config.dialogLevel]) {
                    // TODO [AH] remove this log or change to centralize logging control
                    return;
                }
                me.config.dialogLevel = me.dialogLevel;
            }
            me.config = $.extend(me.initConfig, obj);
            var type = me.config.type;
            var dialog = me.dialog;
            var dialogClose = me.dialogClose;
            var shadeDiv = me.shadeDiv;
            var container = me.container;
            var confirm = me.confirm;
            var timer = me.config.timer;
            var tdTitle = me.tdTitle;
            var title = me.config.title;
            var callback = obj.callback;
            var table = me.table;
            var tableTrIconTd = me.tableTrIconTd;
            var tableTrContentTd = me.tableTrContentTd;
            var iconImg = me.iconImg;
            $(tableTrIconTd).show();
            $(iconImg).attr("src", "");
            $(tdTitle).show();
            var hideDialog = function(ev) {
                clearTimeout(me.timeOut);
                if (type != "loading") {
                    if (type != "upload") {
                        me._clearDialog(); // close all open dialog
                        //me.config.dialogLevel = '';
                        if (callback && typeof(callback) == "function") {
                            try {
                                callback.call();
                            } catch (e) {

                            }
                        }
                    }
                }
                ev.stopPropagation();
                return false;
            }
            if (type == "loading") {
                $(shadeDiv).unbind("click");
                $(tdTitle).removeClass("upload-title").addClass("dialog-title");
                $(dialog).addClass("dialog-loading");
                tableTrContentTd.addClass("dialog-content-loading");
                if (obj.title) {
                    $(tdTitle).html(title);
                } else {
                    $(tdTitle).html($.lang("LANG904"));
                }
                imgSrc = me.config.url + 'loading.gif';
                $(iconImg).attr("src", imgSrc);
                $(me.contentSpan).html(me.config.content);
                $(dialogClose).remove();
                me.config.dialogLevel = '';
            } else if (type == "upload") {
                $(shadeDiv).unbind("click");
                $(tableTrIconTd).hide();
                $(dialogClose).remove();
                $(tdTitle).removeClass("dialog-title").addClass("upload-title");
                $(dialog).addClass("dialog-loading");
                tableTrContentTd.removeClass("dialog-content-loading");
                $(tdTitle).html($.lang("LANG905"));
                setTimeout(function() {
                    $("#spaceused1").removeAttr("style");
                }, 10);
                $(me.contentSpan).html($("#spaceused1")[0]);
                if (callback && typeof(callback) == "function") {
                    try {
                        callback.call();
                    } catch (e) {

                    }
                }
            } else {
                $(dialogClose).insertBefore(table);
                $(dialog).removeClass("dialog-loading");
                tableTrContentTd.removeClass("dialog-content-loading");
                $(tdTitle).hide();
                imgSrc = me.config.url + me.config.type + '.' + me.config.iconType;
                $(iconImg).attr("src", imgSrc);
                $(me.contentSpan).html(me.config.content);
                $(shadeDiv).one("click", hideDialog);
            }
            if ($(container).css("display") == "block") {
                $(shadeDiv).hide();
                $(container).hide();
                //me.config.dialogLevel = '';
            }
            $(shadeDiv).show();
            $(dialog).show();
            if (timer != "none" || timer != 0) {
                me.timeOut = setTimeout(function() {
                    me._clearDialog("message"); // close all open dialog

                    //me.config.dialogLevel = '';
                    if (callback && typeof(callback) == "function") {
                        try {
                            callback.call();
                        } catch (e) {

                        }
                    }

                }, timer);
            }
            if (type == "loading" || type == "error" || type == "upload") {
                clearTimeout(me.timeOut);
            }
            $(dialogClose).one("click", hideDialog);
            me.config.dialogLevel = '';
            $(container).hide();
            $(confirm).hide();

            me.repositionDialog();
        },
        dialogInnerhtml: function(obj) {
            var me = this;

            unloadPreviousContentDialog(me);

            //$(dialog).hide();

            var wait = function(dtd) {
                var tasks = function() {
                    dtd.resolve();
                };
                setTimeout(tasks, 1);
                return dtd.promise();
            };

            $.Deferred(wait).done(function() {
                if (me.contentIframe)
                    $(me.contentIframe).hide();

                if (me.displayDialogCommands)
                    $(me.displayDialogCommands).detach();

                var content = me.dialogContent;
                //content.empty();
                //if (!me.closeCallback && me.contentIframe) {
                //    // WHY???
                //    me.contentIframe.remove();
                //}
                var contentIframe = me.contentIframe = $("<iframe frameborder='0'>").appendTo(content).attr({
                    id: 'frameDialog',
                    name: 'frameDialog',
                    marginheight: '0',
                    marginwidth: '0',
                    scrolling: 'auto',
                    width: '100%',
                    height: '100%'
                });
                $(contentIframe).load(function() {
                    setTimeout(function() {
                        me.repositionDialog();
                    }, 1);
                });

                me._dialogInnerhtml(obj);
            })
        },
        _dialogInnerhtml: function(obj) {
            var me = this,
                containerLeft, containerTop = 160;
            var commands = me.dialogCommands;
            clearTimeout(me.timeOut);
            // set current display dialog type
            me.currentDialogType = "iframe"; // TODO [AH] this will need to be changed if post HTML content
            me.closeCallback = obj.closeCallback;
            me.dialogLevel = 'low';
            if (obj.dialogLevel && me.config.level[me.config.dialogLevel]) {
                me.dialogLevel = obj.dialogLevel;
                if (me.config.level[me.dialogLevel] < me.config.level[me.config.dialogLevel]) {
                    return;
                }
            } else {
                if (me.config.level[me.dialogLevel] < me.config.level[me.config.dialogLevel]) {
                    return;
                }
                me.config.dialogLevel = me.dialogLevel;
            }
            me.config = $.extend(me.initConfig, obj);
            var shadeDiv = me.shadeDiv;
            var dialog = me.dialog;
            var confirm = me.confirm;
            var container = me.container;
            var containerWidth = obj.containerWidth;
            var hideContainer = obj.hideContainer; //If container is displayed immediately
            var configWidth = me.config.containerWidth;
            var titleClose = me.titleClose;
            var dialogTitle = me.dialogTitle;
            var titleSpan = me.titleSpan;
            var contentIframe = me.contentIframe;
            if (!obj.displayPos) {
                me.config.displayPos = "";
            }

            $(container).hide();

            //reset iframe size
            contentIframe.css({
                width: "0px",
                height: "0px"
            });
            var titleName = me.config.dialogTitle;

            var titleNameLen = titleName.length;
            if (titleNameLen > 55) {
                var subname = titleName.substring(0, 55) + "...";
                $(titleSpan).attr("title", titleName.substring(titleName.indexOf(":") + 1));
                $(titleSpan).html(subname);
            } else {
                $(titleSpan).removeAttr('title').html(titleName);
            }
            $(shadeDiv).unbind("click");
            $(shadeDiv).show();

            commands.css("display", "none").empty();
            setTimeout(function() {
                $(contentIframe).attr("src", me.config.frameSrc);
                $(contentIframe).load(function() {
                    var dispalyWidth,
                        displayDiv,
                        //docDiv = $("#frameDialog").contents().find("form").children();
                        docDiv = $(contentIframe).contents().find("form:first").children();
                    if (me.config.displayPos) {
                        //displayDiv = $("#frameDialog").contents().find("#" + me.config.displayPos);
                        displayDiv = $(contentIframe).contents().find("#" + me.config.displayPos);
                        dispalyWidth = displayDiv.width();
                    } else {
                        for (var i = 0; i < docDiv.length; i++) {
                            if ($(docDiv[i]).is(":visible")) {
                                displayDiv = $(docDiv[i]);
                                dispalyWidth = displayDiv.width();
                            }
                        }
                    }
                    if (displayDiv && $(".dialogContainer-commands", displayDiv).length > 0) {
                        commands.css("display", "block");
                        disCommands = $(".dialogContainer-commands", displayDiv).clone().css({
                            display: "block",
                            width: "auto"
                        }).appendTo(commands);
                        // original code using hardcoded index which might not
                        // always be the correct element to bind 'click' event
                        $(disCommands).find("[type='submit']").unbind("click");
                        $(disCommands).find("[type='submit']").bind("click", function(ev) {
                            $("#" + this.id, displayDiv).trigger("click");
                        });
                        if (me.config.hideCommand) {
                            commands.css({
                                display: "none"
                            });
                            me.initConfig.hideCommand = false;
                            me.repositionDialog();
                        } else {
                            commands.css({
                                display: "block"
                            });
                        }

                        me.displayDialogCommands = disCommands;
                    } else
                        me.displayDialogCommands = null;
                    /*if ($.browser.msie && ($.browser.version == "7.0")) {*/
                    if (UCMGUI.config.ie7) {
                        dispalyWidth = dispalyWidth + 41;
                        dialogTitle.width(dispalyWidth);
                    }
                    if (!hideContainer) {
                        $(container).fadeIn("slow");
                        $(dialog).hide();
                    }
                });
            }, 500);
            me.config.dialogLevel = '';
            $(confirm).hide();
        },
        restorePrevContentDialog: function() {
            var me = this;
            setTimeout(function() {
                var prevDialog = dialogQueue[dialogQueue.length - 1];
                if (prevDialog) {
                    var commands = me.dialogCommands;
                    var shadeDiv = me.shadeDiv;
                    var container = me.container;
                    var titleSpan = me.titleSpan;

                    // first we need to remove previous iframe
                    if (me.contentIframe && prevDialog.contentIframe != me.contentIframe) {
                        me.contentIframe.remove();
                    }

                    me.config = prevDialog.config;
                    me.contentIframe = prevDialog.contentIframe;
                    me.currentDialogType = prevDialog.currentDialogType;
                    me.dialogLevel = prevDialog.dialogLevel;
                    me.closeCallback = prevDialog.closeCallback;
                    me.displayDialogCommands = prevDialog.displayDialogCommands;
                    me.contentIframe.show();

                    var titleName = me.config.dialogTitle;
                    if (titleName.length > 55) {
                        var subname = titleName.substring(0, 55) + "...";
                        $(titleSpan).attr("title", titleName.substring(titleName.indexOf(":") + 1));
                        $(titleSpan).html(subname);
                    } else {
                        $(titleSpan).html(titleName);
                    }
                    commands.css("display", "none").empty();

                    if (me.displayDialogCommands) {
                        var displayDiv = null;
                        var docDiv = $(me.contentIframe).contents().find("form:first").children();
                        if (me.config.displayPos) {
                            displayDiv = $(me.contentIframe).contents().find("#" + me.config.displayPos);
                        } else {
                            for (var i = 0; i < docDiv.length; i++) {
                                if ($(docDiv[i]).is(":visible")) {
                                    displayDiv = $(docDiv[i]);
                                }
                            }
                        }

                        me.displayDialogCommands.appendTo(commands);

                        if (me.config.hideCommand) {
                            commands.css({
                                display: "none"
                            });
                            me.initConfig.hideCommand = false;
                        } else {
                            commands.css({
                                display: "block"
                            });
                        }

                        // reassociate with the event trigger
                        $(commands).find("[type='submit']").unbind("click");
                        $(commands).find("[type='submit']").bind("click", function(ev) {
                            $("#" + this.id, displayDiv).trigger("click");
                        });
                    }

                    $(shadeDiv).unbind("click");
                    $(shadeDiv).show();
                    $(container).show();

                    me.repositionDialog();

                    dialogQueue.splice(-1, 1);
                    //prevDialog = null;
                }
            }, 1);
        },
        dialogConfirm: function(obj) {
            var me = this;

            unloadPreviousContentDialog(me);

            var wait = function(dtd) {
                var tasks = function() {
                    dtd.resolve();
                };
                setTimeout(tasks, 1);
                return dtd.promise();
            };
            $.Deferred(wait).done(function() {
                me._dialogConfirm(obj);
            })
        },
        _dialogConfirm: function(obj) {
            var me = this,
                imgSrc;
            clearTimeout(me.timeOut);
            // set current display dialog type
            me.currentDialogType = "confirm";
            me.closeCallback = obj.closeCallback;
            me.dialogLevel = 'high';
            if (obj.dialogLevel && me.config.level[me.config.dialogLevel] != undefined) {
                me.dialogLevel = obj.dialogLevel;
                if (me.config.level[me.dialogLevel] < me.config.level[me.config.dialogLevel]) {
                    // TODO [AH] remove this log or change to centrailize logging control
                    return;
                }
            } else {
                if (me.config.level[me.dialogLevel] < me.config.level[me.config.dialogLevel]) {
                    // TODO [AH] remove this log or change to centrailize logging control
                    return;
                }
                me.config.dialogLevel = me.dialogLevel;
            }
            me.config = $.extend(me.initConfig, obj);
            var shadeDiv = me.shadeDiv;
            var dialog = me.dialog;
            var container = me.container;
            var confirm = me.confirm;
            var confirmTitleSapn = me.confirmTitleSapn;
            var confirmContent = me.confirmContent;
            var type = obj.type;
            var iconType = me.config.iconType;
            var confirmTableIcon = me.confirmTableIcon;
            var confirmIconImg = me.confirmIconImg;
            var confirmContentSpan = me.confirmContentSpan;
            var confirmClose = me.confirmClose
            var optionCancel = me.optionCancel;
            var optionEmail = me.optionEmail;
            var optionSure = me.optionSure;
            var okFun = obj.buttons.ok;
            var emailFun = obj.buttons.email;
            var cancleFun = obj.buttons.cancel;
            confirmTitleSapn.html($.lang("LANG543"));
            confirmTableIcon.hide();
            confirmContent.addClass("dialogConfirm-content-center");
            confirmIconImg.removeAttr("src");
            if (type) {
                confirmTableIcon.show();
                confirmContent.removeClass("dialogConfirm-content-center");
                imgSrc = me.config.url + type + "." + iconType;
                confirmIconImg.attr("src", imgSrc);
            }
            confirmContentSpan.html(obj.confirmStr);
            if ($(container).css("display") == "block") {
                $(container).hide();
            }
            $(shadeDiv).unbind("click");
            $(shadeDiv).show();
            $(confirm).fadeIn("slow");
            $(optionCancel).unbind("click");
            $(optionSure).unbind("click");
            $(confirmClose).unbind("click");
            var option = function(ev) {
                me._clearDialog(); // close all open dialog
                if ($(ev.target).val().trim() == "ok" && typeof(okFun) == "function") {
                    try {
                        okFun.call();
                    } catch (e) {

                    }
                }

                if ($(ev.target).val().trim() == "cancel" && typeof(cancleFun) == "function") {
                    try {
                        cancleFun.call();
                    } catch (e) {

                    }
                }

                if ($(ev.target).val().trim() == "email" && typeof(emailFun) == "function") {
                    try {
                        emailFun.call();
                    } catch (e) {

                    }
                }

                ev.stopPropagation();
                return false;
            }
            $(optionCancel).bind("click", option);
            $(optionSure).bind("click", option);
            if (emailFun) {
                $(optionEmail).unbind("click").bind("click", option).show();
            } else {
                $(optionEmail).hide();
            }
            $(confirmClose).bind("click", function(ev) {
                me._clearDialog(); // close all open dialog
                if ($(ev.target).html().trim() == "x" && typeof(cancleFun) == "function") {
                    cancleFun.call();
                }
                ev.stopPropagation();
                return false;
            })
            me.config.dialogLevel = '';
            $(container).hide();
            $(dialog).hide();

            me.repositionDialog();
        },
        closeCurrentDialog: function() {
            // intent to ONLY close the current dialog (diff from clearDialog which will ALSO clear prevDialog)
            var me = this;

            setTimeout(function() {
                me._clearDialog(me.currentDialogType);

                //if (prevDialog != null)
                //    me.restorePrevContentDialog();
            }, 1);
        },
        clearDialog: function(type, callback, clearId) {
            var me = this;

            // make sure the type is match type before clear
            if (type && type !== "*" && type !== me.currentDialogType && type != "dialog")
                return;

            var wait = function(dtd) {
                var tasks = function() {
                    dtd.resolve();
                };
                setTimeout(tasks, 1);
                return dtd.promise();
            };
            $.Deferred(wait).done(function() {
                me._clearDialog(type, callback, clearId);

                // everytime clear is called, we should clear dialog queue
                // [AH] added hacking solution to make the dialog change compatiable with existing code:
                // prevDialog.contentIframe != me.contentIframe
                var prevDialog = dialogQueue[dialogQueue.length - 1];
                if (prevDialog && prevDialog.contentIframe && (type === "*" || prevDialog.contentIframe != me.contentIframe)) {
                    prevDialog.contentIframe.remove();
                    // move prevDialog in as the result of this change
                    // prevDialog = null;
                    // [AH] remove all previous dialogs
                    dialogQueue.length = 0;
                }
            })

            //me.dialogContent.empty();
        },
        _clearDialog: function(type, callback, clearId) {
            var me = this;
            var currentDialogType = me.currentDialogType;
            clearTimeout(me.timeOut);
            // define to only close one type of the dialog
            if (type && type !== "*" && type !== currentDialogType && type != "dialog")
                return;

            var immediateUnload = type && type.length > 0;

            processUnloadDialog(me, immediateUnload);

            //// set current display dialog type
            //me.currentDialogType = "";

            //var shadeDiv = me.shadeDiv;
            //var dialog = me.dialog;
            //var container = me.container;
            //var confirm = me.confirm;

            ////me.config.type = "";
            //if (type == "dialog") {
            //    $(dialog).hide();
            //} else {
            //    $(shadeDiv).hide();
            //    $(dialog).hide();
            //    $(container).hide();
            //    $(confirm).hide();
            //}

            //me.config.dialogLevel = '';

            if (clearId) {
                var mainScreen = top.frames['frameContainer'].frames['mainScreen'];
                mainScreen.$(clearId, mainScreen.document).remove();
            }

            if (callback && typeof callback == "function") {
                callback.call();
            }
        }
    }
})(jQuery)
/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
(function($) {
    window.moduleMenu = function(config) {
        var me = this;

        me.config = $.extend(me.initConfig, config);

        var data = me.config.data;

        if (data) {
            me.parsePrivilegeData(data);
            // me.init();
        } else {
            me.getData();
        }

        if (me.config.gSessionFlag && !top.$.gsec) {
            me.config.gSessionFlag = false;

            top._initJQuery();

            top.$.gsec = new top.UCMGUI.gSession();
        }
    };

    moduleMenu.prototype = {
        initConfig: {
            url: "../locale/moduleMenuData.json",
            modulePos: '', // moduleList position
            menuPos: 'menuList', // menuList position
            crumbPos: 'crumbs_div', // crumbs position
            isDisplayName: {
                'modelName': '5120',
                'hideName': {
                    nat: ['LAN', 'DHCP'],
                    digital: []
                }
            },
            model_info: "",
            gSessionFlag: true,
            userPortal: false,
            onComplete: function() {}
        },
        getData: function() {
            var me = this,
                config = me.config,
                url = config.url,
                role = top.$.cookie('role');

            $.ajax({
                type: "GET",
                url: url,
                dataType: "json",
                async: false,
                success: function(data) {
                    config.data = eval(data);

                    me.parsePrivilegeData(eval(data));
                }
            });
        },
        /*
         * Pengcheng Zou Added.
         * xpqin completed this function.
         */
        parsePrivilegeData: function(originaldata) {
            var me = this,
                config = me.config,
                data = originaldata,
                html = top.$.cookie('html'),
                arr = [],
                htmlPrivilege = {};

            if (!!html) {
                htmlPrivilege = top.JSON.parse(html);
            }
            var nameArr = [];
            for (var i = 0; i < data.length; i++) {
                var firstArr = [],
                    userPortal = config.userPortal,
                    privilege = data[i].privilege;

                data[i].id = "m" + (i + 1);

                if (userPortal && !privilege) {
                    continue;
                } else if (!userPortal && !!privilege) {
                    continue;
                }
                for (var j = 0; j < data[i].submenu.length; j++) {
                    var secondArr = [];
                    data[i].submenu[j].id = "m" + (i + 1) + "_" + (j + 1);
                    for (var k = 0; k < data[i].submenu[j].submenu.length; k++) {
                        var name = data[i].submenu[j].submenu[k].url.split('.')[0];
                        nameArr.push(name);
                        data[i].submenu[j].submenu[k].id = "m" + (i + 1) + "_" + (j + 1) + "_" + (k + 1),
                        htmlPrivilegeName = htmlPrivilege[name];

                        // Use the following code to show the new page for debugging.
                        // if ((htmlPrivilegeName && (htmlPrivilegeName == 1)) || htmlPrivilegeName == undefined) {
                        if (htmlPrivilegeName && (htmlPrivilegeName == 1)) {
                            secondArr.push(data[i].submenu[j].submenu[k]);
                        }
                    }

                    data[i].submenu[j].submenu = secondArr;
                    if (data[i].submenu[j].submenu.length != 0) {
                        firstArr.push(data[i].submenu[j]);
                    }
                }

                data[i].submenu = firstArr;
                if (data[i].submenu.length != 0) {
                    arr.push(data[i]);
                }
            }
            top.moduleMenuName = nameArr;
            data = arr;
            me.config.data = data;
            me.init();
            me.getOptions2Lang();
        },
        generalId: function() {
            var me = this,
                config = me.config,
                data = config.data;

            for (var i = 0; i < data.length; i++) {
                data[i].id = "m" + (i + 1);

                for (var j = 0; j < data[i].submenu.length; j++) {
                    data[i].submenu[j].id = "m" + (i + 1) + "_" + (j + 1);

                    for (var k = 0; k < data[i].submenu[j].submenu.length; k++) {
                        data[i].submenu[j].submenu[k].id = "m" + (i + 1) + "_" + (j + 1) + "_" + (k + 1);
                    }
                }
            }

            me.config.data = data;

            me.init();
        },
        /*
         * ### initialized component and create component main structure
         */
        init: function() {
            var me = this,
                config = me.config,
                modulePos = config.modulePos,
                menuPos = config.menuPos,
                crumbsPos = config.crumbsPos;

            $("#" + modulePos).empty();
            $("#" + menuPos).empty();
            $("#" + crumbsPos).empty();
            // create main dom's elements
            me.moduleList = $("<ul class='module'>").appendTo("#" + modulePos); // moduleList ul
            me.dropDiv = $("<div class='dropdown'>").appendTo("#" + menuPos); // menuList ul

            $("<div class='right_bg_shadow'>").appendTo("#" + crumbsPos); // crumbs div
            $("<span class='crumbs'></span>").appendTo("#" + crumbsPos);
            $("<img class='refresh_icon'>").attr({
                localeTitle: "LANG109",
                title: top.$.lang("LANG109"),
                border: "0",
                src: "../images/iframeRefresh.png"
            }).appendTo("#" + crumbsPos);

            // if config have data it shoud render directly 
            if (config.data) {
                me.loadData(config.data);
            };
        },
        /*
         * ### create moduleList and menuList
         * data: [JSON] According to the specified JSON format to generate moduleList and menuList
         */
        loadData: function(data) {
            var me = this;

            me.render(me.config.data = data);
        },
        render: function() {
            var me = this;

            me.renderModule(); // render moduleList
        },
        renderModule: function() {
            var me = this,
                data = me.config.data;

            for (var i = 0; i < data.length; i++) {
                var moduleLi = $("<li>").appendTo(me.moduleList);

                me.menuList = $("<ul class='dropdown-menu' id='" + data[i].id + "'>").appendTo(me.dropDiv);

                $("<a>").attr({
                    "href": "#",
                    "localeMenu": data[i].id,
                    "locale": data[i].name,
                    "id": data[i].id
                }).html(top.$.lang(data[i].name)).appendTo(moduleLi);

                me.renderMenu(data[i]);
            }

            // $(me.moduleList.children()[0]).addClass("active");
            me.moduleList.bind("click", function(ev) {
                var moduleId = $(ev.target).attr('id');

                // var muduleName = $(ev.target).html();
                if (typeof moduleId != "undefined") {
                    $(".submenu-menu-img").hide();
                    $(".module-active").removeClass("module-active");
                    $(".menu-active").removeClass("menu-active");
                    $(".submenu-menu-a-active").removeClass("submenu-menu-a-active");
                    $(".dropdown-menu").hide();
                    $(".dropdown-menu")
                        .filter("#" + moduleId)
                        .css("display", "block");

                    $(ev.target.parentNode)
                        .addClass("module-active")
                        .siblings()
                        .removeClass("module-active");

                    me.locationMenu(moduleId, 1);

                    $("#menu-div").mCustomScrollbar("update");
                };
            });
        },
        renderMenu: function(moduleData) {
            var me = this,
                menuLists = moduleData.submenu;

            for (var i = 0; i < menuLists.length; i++) {
                var menuLi = $("<li>").appendTo(me.menuList),
                    menuLevelData = menuLists[i];

                $("<a>").appendTo(menuLi)
                    .addClass("menu-a")
                    .attr({
                        "href": menuLevelData.url,
                        "id": menuLevelData.id,
                        "localeMenu": menuLevelData.id,
                        "locale": menuLevelData.name
                    })
                    .html(top.$.lang(menuLevelData.name));

                me.renderMenuLevel(menuLevelData);
            }

            $("#" + moduleData.id).closest("ul.module").children("a").addClass("module-active");

            // me.locationMenu(moduleData.id, 0);

            $(".dropdown-menu").css("display", "block");
            $(".dropdown-submenu").unbind("click mouseover mouseleave");

            // bind menu click event
            var menuClick = function(ev) {

                if ($(this).children("a.menu-active").length != 0) {
                    // click an active menu, do nothing to prevent fold the active submenu.
                    $(this).next().stop().slideToggle(200, function() {
                        $("#menu-div").mCustomScrollbar("update");
                    });

                    ev.stopPropagation();
                    return false;
                }

                // var menuId = me.getMenuId(ev);
                var sibling = $(this).next(),
                    toggleUl = $(sibling),
                    toggleStyle = toggleUl.siblings("ul"),
                    submenuState = toggleUl.children().children(),
                    evTarget = submenuState.eq(1),
                    url = evTarget.attr("href");

                $(this).children("a").addClass("menu-active");
                $(this).siblings("li").children("a").removeClass("menu-active");
                $(".submenu-menu-a-active").removeClass("submenu-menu-a-active");
                $(this).children("ul").removeClass("submenu-menu");

                var siblingsUl = toggleUl.filter("ul");

                siblingsUl.removeClass("submenu-menu");
                siblingsUl.attr("click", "click");
                $(this).siblings().bind("mouseover", menuMouseover);
                submenuState.removeClass("submenu-menu-line-active submenu-menu-a-active submenu-menu-line-hover submenu-menu-a-hover");
                submenuState.filter(".submenu-menu-img")
                    .css("display", "none");
                submenuState.filter(".submenu-menu-imgIe")
                    .css("display", "none");
                toggleUl.children()
                    .children(".submenu-menu-line")
                    .css("display", "inline-block");
                toggleStyle.hide();

                toggleUl.filter("ul").slideToggle(function() {
                    me.setIframe(url);
                    me.crumbs();
                    $("#dropdownSubmenuOverUl").empty();
                    $("#menu-div").mCustomScrollbar("update");
                });

                evTarget.prev().addClass("submenu-menu-line-active");
                evTarget.addClass("submenu-menu-a-active");
                evTarget.next().css("display", "inline-block");

                ev.stopPropagation();
                return false;
            };

            // menuMouseover function
            var menuMouseover = function(ev) {
                var thisElement = this,
                    menuId = me.getMenuId(ev),
                    overUl = $("#" + menuId).next(),
                    dropdownSubmenuOverUl = $("#dropdownSubmenuOverUl");

                if (overUl.length != 0) {
                    $(thisElement).addClass("dropdown-submenu-hover")
                        .siblings("li")
                        .removeClass("dropdown-submenu-hover")
                        .children("a")
                        .removeClass("dropdown-submenu-hover");
                    overUl.parent()
                        .siblings("li")
                        .children("ul")
                        .removeClass("submenu-menu");
                }

                $(".submenu-menu-line-hover").removeClass("submenu-menu-line-hover");
                $(".submenu-menu-a-hover").removeClass("submenu-menu-a-hover");

                if ($(thisElement).next().css("display") == "none") {
                    clearTimeout(me.config.timeOut);

                    $(thisElement).children().eq(1).addClass("submenu-menu");
                    // $(this).children().eq(1).css("display", "block");

                    $(thisElement).siblings("li")
                        .children("ul")
                        .children()
                        .children()
                        .removeClass("submenu-menu-line-active submenu-menu-a-active submenu-menu-line-hover submenu-menu-a-hover");

                    var top = $(thisElement).offset().top, // 130 = headerHeight(96px) + dropdown(30px) + dropdown-submenu / 3
                        sibling = ev.target.nextSibling,
                        windowHeight = $(window).height();

                    $(thisElement).children("ul")
                        .parent()
                        .siblings()
                        .children("ul")
                        .removeClass("submenu-menu");

                    var lists = overUl.children();

                    lists.eq(0).addClass("dropdown-submenu-overUlFirstLi");
                    lists.eq(lists.length - 1).addClass("dropdown-submenu-overUlLastLi");

                    var siblingsUl = $(sibling).filter("ul");

                    siblingsUl.children("span")
                        .addClass("submenu-span");

                    siblingsUl.bind("mouseleave", function() {
                        siblingsUl.removeClass("submenu-menu");
                    });

                    var thisElementChildrenSecond = $(thisElement).children().eq(1);

                    dropdownSubmenuOverUl.empty();

                    thisElementChildrenSecond.clone().appendTo("#dropdownSubmenuOverUl").show();

                    dropdownSubmenuOverUl.css({
                        top: top
                        //left: "210px"
                    });

                    thisElementChildrenSecond.hide();

                    var submenuClick = function(ev) {
                        var url = $(ev.target).attr("href");

                        $(".submenu-menu").removeClass("submenu-menu");

                        me.jumpMenu(url);

                        ev.stopPropagation();
                        return false;
                    };

                    $("#dropdownSubmenuOverUl").find(".submenu-menu-a").bind("click", submenuClick);

                    $(".dropdown-submenu-overUl").bind("mouseover", function(ev) {
                        clearTimeout(me.config.timeOut);

                        ev.stopPropagation();
                        return false;
                    }).bind("mouseleave", function(ev) {
                        $(this).removeClass("submenu-menu");

                        ev.stopPropagation();
                        return false;
                    });

                    dropdownSubmenuOverUl.show();

                    var dropdownSubmenuOverUlHeight = dropdownSubmenuOverUl.height(),
                        bottomHeight = windowHeight - top;

                    if ((bottomHeight - 30) < dropdownSubmenuOverUlHeight) { // 30 is copright height
                        var top = (dropdownSubmenuOverUlHeight - bottomHeight + 30),
                            li = dropdownSubmenuOverUl.find("li");

                        for (var i = 0; i < li.length; i++) {
                            var liIndex = li.eq(i);

                            liIndex.css({
                                top: -top
                            });
                        };
                    }
                } else {
                    dropdownSubmenuOverUl.hide();
                }

                var menuA = $(thisElement).children("a"),
                    menuText = menuA.text(),
                    result = moduleMenu.prototype.textSize({
                        fontSize: "15px",
                        fontWeight: "bold"
                    }, menuA);

                if (menuA[0] && result.width > menuA[0].offsetWidth) {
                    $(menuA).attr("title", menuText);
                } else {
                    $(menuA).removeAttr("title");
                }

                ev.stopPropagation();
                return false;
            };

            // menuMouseleave function
            var menuMouseleave = function(ev) {
                //$(ev.target).removeClass("dropdown-submenu-hover");

                me.config.timeOut = setTimeout(function() {
                    $(".submenu-menu").removeClass("submenu-menu");
                }, 100);

                ev.stopPropagation();
                return false;
            };

            // bind submenu mouseover and mouseleave event
            $(".dropdown-submenu").bind({
                click: menuClick,
                mouseover: menuMouseover,
                mouseleave: menuMouseleave
            });
        },
        renderMenuLevel: function(obj) {
            var me = this,
                menuLevels = obj.submenu,
                parentLi = $("#" + obj.id).parent().addClass("dropdown-submenu"),
                levelUl = $("<ul>").insertAfter(parentLi).addClass("dropdown-submenu-menu"),
                mouseoverUl = $("<ul>").appendTo(parentLi).addClass("dropdown-submenu-overUl");

            for (var i = 0; i < menuLevels.length; i++) {
                var menuLevelData = menuLevels[i],
                    url = menuLevelData.url,
                    id = menuLevelData.id,
                    name = menuLevelData.name,
                    attrObj = {
                        "href": url,
                        "id": id,
                        "localeMenu": id
                    },
                    nameLen = name.length;

                if (me.isDisplay(name)) {
                    var levelLi = $("<li>").appendTo(levelUl),
                        overLi = $("<li>").appendTo(mouseoverUl),
                        name = me.changeName(name),
                        transName = top.$.lang(name);

                    attrObj["locale"] = name;

                    var submenuA = $("<a>").appendTo(levelLi)
                        .attr(attrObj)
                        .addClass("submenu-menu-a")
                        .html(transName);

                    $("<a>").appendTo(overLi)
                        .attr(attrObj)
                        .addClass("submenu-menu-a")
                        .html(transName);

                    $("<a>").insertBefore(submenuA).addClass("submenu-menu-line");
                    $("<a>").appendTo(levelLi).addClass("submenu-menu-img");
                }
                // if (menuLevelData.submenu.length > 0) {
                //  me.renderMenuLevel(menuLevelData);
                // };
            }

            $(".submenu-menu-a").unbind("click");

            // bind submenu click event
            var submenuClick = function(ev) {

                // var titleName = $(ev.target).attr("title");
                var evTarget = ev.target,
                    url = $(evTarget).attr("href"),
                    //name = $(evTarget).html(),
                    evTargetParent = evTarget.parentNode,
                    parentNode = evTargetParent.parentNode,
                    parent = parentNode.parentNode;

                $(".submenu-menu-a-active").removeClass("submenu-menu-a-active");

                if ($(parentNode).filter(".dropdown-submenu-overUl").length > 0) {
                    $(parent).children("a").addClass("menu-active");
                    $(parent).siblings("li").children("a").removeClass("menu-active");
                    $(parentNode).removeClass("submenu-menu");
                    $(evTargetParent).children("a").attr("id");

                    evTarget = $(parent.nextSibling.children).children("#" + $(evTargetParent.children + " a").attr("id"))[0];

                    $(parentNode).siblings("ul[style*='block']").hide();
                    // $(evTargetParent.parentNode).slideToggle(function() {
                    //     $("#menu-div").mCustomScrollbar("update");

                    // });
                }

                var parentSiblings = $(evTargetParent).siblings();

                parentSiblings
                    .children()
                    .removeClass("submenu-menu-line-active submenu-menu-a-active");
                parentSiblings
                    .children(".submenu-menu-img")
                    .css("display", "none");

                var evTargetFirstChild = evTargetParent.firstChild;

                if ($(evTargetFirstChild).not(".submenu-menu-a").length > 0) {
                    $(evTargetFirstChild).addClass("submenu-menu-line-active");
                }

                $(evTarget).addClass("submenu-menu-a-active");
                $(evTarget)
                    .next()
                    .css("display", "inline-block");

                me.setIframe(url);
                me.crumbs();

                ev.stopPropagation();
                return false;
            }

            $(".submenu-menu-a").bind("click", submenuClick);

            // bind submenu-a mouseover event
            $(".submenu-menu-a").bind("mouseover", function(ev) {
                var evTarget = ev.target,
                    evTargetParent = ev.target.parentNode,
                    firstChild = evTargetParent.firstChild,
                    submenu = evTargetParent.parentNode;

                // clear all a tags in the mouseover and click state
                $(evTargetParent).siblings()
                    .children()
                    .removeClass("submenu-menu-line-hover submenu-menu-a-hover");

                if ($(firstChild).not(".submenu-menu-a").length > 0) {
                    $(firstChild).addClass("submenu-menu-line-hover");
                }

                $(evTarget).addClass("submenu-menu-a-hover");
                $(submenu).prev()
                    .filter("li")
                    .children("a")
                    .addClass("menu-active");

                var result = moduleMenu.prototype.textSize({
                    fontSize: "14px",
                    fontWeight: ""
                }, $(this));

                if (result.width > this.offsetWidth) {
                    $(this).attr("title", $(this).text());
                } else {
                    $(this).removeAttr("title");
                }

                ev.stopPropagation();
                return false;
            });

            // bind dropdown-submenu-overUl mouseleave event
            $(".dropdown-submenu-overUl").bind("mouseleave", function(ev) {
                $(this).parent().removeClass("dropdown-submenu-hover");
                $(this).removeClass("submenu-menu");

                ev.stopPropagation();
                return false;
            });
        },
        getMenuId: function(ev) {
            var target = ev.target,
                menuId = $(target.children).attr('id');

            if (typeof menuId == "undefined") {
                menuId = $(target).attr('id');

                if (typeof menuId == "undefined") {
                    return;
                }
            }

            return menuId;
        },
        locationMenu: function(id, status) {
            var me = this,
                firstLi = $(".dropdown-menu").filter("#" + id).children().eq(0),
                firstLiChildren = firstLi.next().children().eq(0).children(),
                firstLiSiblings = firstLi.siblings(),
                url = firstLiChildren.eq(1).attr("href");

            if (status == 1) {
                $(".submenu-menu-line-hover").removeClass("submenu-menu-line-hover");
                $(".submenu-menu-a-hover").removeClass("submenu-menu-a-hover");
                $(".submenu-menu-line-active").removeClass("submenu-menu-line-active");
                $(".submenu-menu-a-active").removeClass("submenu-menu-a-active");
                $(".submenu-menu-img").css("display", "none");

                me.setIframe(url);
            }

            firstLi.children("ul")
                .removeClass("submenu-menu")
                .parent()
                .siblings()
                .children("ul")
                .removeClass("submenu-menu");

            firstLi
                .addClass("dropdown-submenu-hover")
                .children("a")
                .addClass("menu-active");
            firstLiSiblings
                .filter("ul")
                .hide();

            var firstLiSiblingsLi = firstLiSiblings.filter("li");

            firstLiSiblingsLi
                .children("a")
                .removeClass("dropdown-submenu-hover");
            firstLiSiblingsLi
                .removeClass("dropdown-submenu-hover")
                .children()
                .removeClass("menu-active");

            firstLiChildren.eq(0).addClass("submenu-menu-line-active");
            firstLiChildren.eq(1).addClass("submenu-menu-a-active");
            firstLiChildren.eq(2).css("display", "inline-block");
            firstLi.next().css("display", "block");

            me.crumbs();
        },
        jumpMenu: function(src, transParam) {
            var me = this,
                labelA = $("a[href='" + src + "']");

            // jump module
            var moduleId = labelA.parents("ul.dropdown-menu").attr('id'),
                modulePos = me.initConfig.modulePos;

            if (typeof moduleId != "undefined") {
                $(".dropdown-submenu-hover").removeClass("dropdown-submenu-hover");
                $(".module-active").removeClass("module-active");
                $(".menu-active").removeClass("menu-active");
                $(".submenu-menu-a-active").removeClass("submenu-menu-a-active");
                $(".dropdown-menu").hide();
                $(".dropdown-menu").filter("#" + moduleId).css("display", "block");

                if (modulePos && modulePos !== '') { // Pengcheng Zou Add
                    $('#' + modulePos + ' #' + moduleId)
                        .parent().addClass("module-active")
                        .siblings()
                        .removeClass("module-active");
                } else {
                    $('#menu-div #' + moduleId)
                        .parent().addClass("module-active")
                        .siblings()
                        .removeClass("module-active");
                }
                // me.locationMenu(moduleId, 1);
            }

            // jump menu
            var labelUl = $("a[href='" + src + "']").closest(".dropdown-submenu-menu"),
                labelUlPrev = labelUl.prev();

            isJump = true;

            if (labelUl.css("display") == "none" && isJump) {
                isJump = false;

                labelUl.slideToggle(function() {
                    me.setIframe(src, transParam);

                    me.crumbs();

                    $("#menu-div").mCustomScrollbar("update");
                });
            } else if (labelUl.length > 0) { // [AH] Added to set the iframe to the url as long as the label can be located.
                me.setIframe(src, transParam);
            }

            labelUl.siblings("ul").hide();

            me.clearClass();

            labelUlPrev.addClass("dropdown-submenu-hover");
            labelUlPrev.find("a").eq(0).addClass("menu-active");
            labelA.addClass("submenu-menu-a-active");

            var labelASiblings = labelA.siblings();

            labelASiblings.eq(0).addClass("submenu-menu-line-active");
            labelASiblings.eq(1).css("display", "inline-block");

            if (labelUl.css("display") != "none" && isJump) {
                me.setIframe(src, transParam);
                me.crumbs();
            }
        },
        clearClass: function() {
            $(".submenu-menu-img").hide();

            $(".menu-active, .submenu-menu-line-hover, .submenu-menu-a-hover, .submenu-menu-a-active, .submenu-menu-line-active").removeClass("menu-active submenu-menu-line-hover submenu-menu-a-hover submenu-menu-a-active submenu-menu-line-active");
        },
        crumbs: function() {
            var crumbsStr,
                moduleName = $(".module-active > a").attr("locale"),
                menuName = $(".menu-active").attr("locale"),
                submenuName = $(".submenu-menu-a-active").attr("locale"),
                me = this;

            if (typeof submenuName == "undefined") {
                submenuName = $(".submenu-menu-a-active").attr("locale");
            }
            if (!moduleName) {
                moduleName = $(".module").children().attr("locale");
            }

            crumbsStr = "<font locale=" + moduleName + ">" + top.$.lang(moduleName) + "</font>" + " >> " + "<font locale=" + menuName + ">" + top.$.lang(menuName) + "</font>" + " >> " + "<font locale=" + submenuName + ">" + top.$.lang(submenuName) + "</font>";

            $(".crumbs").html(crumbsStr);

            $(".refresh_icon").bind("click", function(ev) {
                var src = $(".submenu-menu-a-active").attr("href");

                me.setIframe(src);
                ev.stopPropagation();

                return false;
            });

            if (top.UCMGUI.isFunction(me.config.onComplete)) {
                me.config.onComplete();
            }
        },
        setIframe: function(url, transParam) {
            setTimeout(function() {
                // event to inform the ucmgui when content is about to unload
                var mainScreen = $("#mainScreen"),
                    contents = mainScreen.contents();

                if (top.$) {
                    var e = jQuery.Event("frameswitch");

                    e.targetSrc = url;
                    e.targetParam = transParam;

                    top.$(contents).trigger(e);
                }

                contents.empty();

                if (url) {
                    if (transParam) {
                        mainScreen.attr("src", url + transParam);
                    } else {
                        mainScreen.attr("src", url);
                    }

                    top.$.cookie("jumpMenu", url);
                }
                // setTimeout(function() {
                //     $("#menu-div").mCustomScrollbar("update");
                // }, 300);
            }, 300);
        },
        isDisplay: function(submenuName) {
            var me = this,
                config = me.config,
                isDisplayName = config.isDisplayName,
                modelInfo = config.model_info,
                name = isDisplayName.modelName,
                hideName = isDisplayName.hideName,
                namePos = modelInfo.model_name.indexOf(name),
                allow_nat = modelInfo.allow_nat,
                num_pri = modelInfo.num_pri,
                p231 = modelInfo.P231;

            // hide the dynamic defense in the switch mode
            if (p231 != null && p231 == "1") {
                if (submenuName == "LANG2303") {
                    return false;
                }
            }

            // show BRI Trunks Page in UCM62XX
            if (!config.model_info.num_bri) {
                if (submenuName == "LANG2834") {
                    return false;
                }
            } else {
                if (submenuName == "LANG12") {
                    return false;
                }
            }

            // OpenVPN
            if ((submenuName == "LANG3990") &&
                config.model_info.support_openvpn && (config.model_info.support_openvpn == "0")) {
                return false;
            }

            // WebRTC Smart Routes / WebRTC Cloud Service
            if ((submenuName == "LANG4496" || submenuName == "LANG4505") &&
                config.model_info.support_webrtc_cloud && (config.model_info.support_webrtc_cloud == "0")) {
                return false;
            }

            // hide dhcp client list
            if (submenuName === "LANG4586") {
                var bRoute = true;

                $.ajax({
                    type: "GET",
                    url: "../cgi?action=getNetworkSettings",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var sMethod = data.response.network_settings.method;

                            if (sMethod !== '0') {
                                bRoute = false;
                            }
                        }
                    }
                });

                return bRoute;
            }

            if (num_pri <= 0 && $.inArray(submenuName, hideName.digital) != -1) {
                return false;
            }

            if ((allow_nat != null && allow_nat == "0") || (allow_nat == null && namePos < 0)) {
                if ($.inArray(submenuName, hideName.nat) != -1) {
                    return false;
                }

                return true;
            }

            return true;
        },
        changeName: function(name) {
            var me = this,
                config = me.config,
                modelName = config.isDisplayName.modelName,
                modelInfo = config.model_info.model_name,
                originalName = config.changes.originalName,
                newName = config.changes.newName,
                allow_nat = config.model_info.allow_nat;

            if ((allow_nat != null && allow_nat == "0") || (allow_nat == null && modelName.indexOf(modelInfo) < 0)) {
                if (originalName == name) {
                    return newName;
                } else {
                    return name;
                }
            } else {
                return name;
            }
        },
        textSize: function(styles, obj) {
            var text = obj.text(),
                a = document.createElement("a"),
                result = {};

            result.width = a.offsetWidth;
            result.height = a.offsetWidth;

            if (obj instanceof jQuery && obj.hasClass("submenu-menu-a-active")) {
                $(a).addClass("submenu-menu-a-active");
            }

            a.style.fontSize = styles.fontSize;
            a.style.fontWeight = styles.fontWeight;
            a.style.visibility = "hidden";

            document.body.appendChild(a);

            if (typeof a.textContent != "undefined") {
                a.textContent = text;
            } else {
                a.innerText = text;
            }

            result.width = a.offsetWidth - result.width;
            result.height = a.offsetHeight - result.height;

            a.parentNode.removeChild(a);

            return result;
        },
        getOptions2Lang: function () {
            if (!top.options2Lang) {
                $.ajax({
                    type: "GET",
                    url: "../locale/locale.params.json",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {},
                    success: function(data) {
                        top.options2Lang = JSON.parse(data);
                        var tmpModuleMenuName = [];
                        tmpModuleMenuName = top.moduleMenuName.copy(tmpModuleMenuName);

                        for(var i in top.options2Lang){
                            if (top.moduleMenuName.indexOf(i) > -1) {
                                tmpModuleMenuName.remove(i);
                            }
                        }
                        if (tmpModuleMenuName.length != 0) {
                            console.error(tmpModuleMenuName); 
                        }
                    }
                });
            }
        }
    };
})(jQuery)
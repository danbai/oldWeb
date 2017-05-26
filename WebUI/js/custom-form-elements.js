/*
CUSTOM FORM ELEMENTS

Created by Ryan Fait
www.ryanfait.com

The only things you may need to change in this file are the following
variables: checkboxHeight, radioHeight and selectWidth (lines 24, 25, 26)

The numbers you set for checkboxHeight and radioHeight should be one quarter
of the total height of the image want to use for checkboxes and radio
buttons. Both images should contain the four stages of both inputs stacked
on top of each other in this order: unchecked, unchecked-clicked, checked,
checked-clicked.

You may need to adjust your images a bit if there is a slight vertical
movement during the different stages of the button activation.

The value of selectWidth should be the width of your select list image.

Visit http://ryanfait.com/ for more information.
*/

/*
 * Description: UCM6100 WebGUI
 *
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var checkboxHeight = "25",
    radioHeight = "25",
    selectHeight = "22",
    fontSize = "12px",
    defaultWidth = "35px",
    fontWeight = "normal",
    iconPosition = "-139px",
    iconWidth = 18,
    modelSelMaxWidth = 154,
    mainSelMaxWidth = 300,
    mDocument;

/* No need to change anything after this */

var Custom = {
    init: function(document, elDom) {
        if (top.UCMGUI.config.msie && !(top.UCMGUI.config.ie9 || top.UCMGUI.config.ie8)) {
            if (document != mDocument && $("body", document).hasClass("modal")) {
                $(document).find("input:visible, textarea:visible").not(":disabled").eq(0).focus().blur();
            }
        }

        // Added to skip custom process when body is marked nocustom
        if ($("body", document).attr("nocustom"))
            return;


        mDocument = document;

        var inputs = [],
            div = [],
            a = 0;

        // input element
        if (elDom && elDom.tagName == "SELECT") {
            inputs = [];
        } else if (elDom && elDom.tagName == "INPUT") {
            inputs = [];
            inputs[0] = elDom;
        } else if (elDom) {
            inputs = $(elDom).find("input[type=checkbox], input[type=radio]");
        } else {
            inputs = $(document).find("input[type=checkbox], input[type=radio]");
        }

        for (a; a < inputs.length; a++) {
            //if ((inputs[a].type == "checkbox" || inputs[a].type == "radio")) {
            inputs[a].parentNode.style.position = "relative";

            if (!inputs[a].className.contains("styled")) {
                $(inputs[a]).addClass("styled");
            }

            var prev = inputs[a].previousSibling,
                clsName;

            if (prev) {
                clsName = prev.className
            }

            if (clsName && prev && clsName.contains(inputs[a].type.toLowerCase())) {
                div[a] = inputs[a].previousSibling;
            } else {
                div[a] = document.createElement("div");
                div[a].className = inputs[a].type;
            }

            if (inputs[a].checked) {
                if (inputs[a].type == "checkbox") {
                    div[a].style.backgroundPosition = "0 -" + (checkboxHeight * 2) + "px";
                } else {
                    div[a].style.backgroundPosition = "0 -" + (radioHeight * 2) + "px";
                }
            } else if (!inputs[a].checked && !inputs[a].disabled) {
                div[a].style.backgroundPosition = "0 0";
            }

            inputs[a].parentNode.insertBefore(div[a], inputs[a]);

            inputs[a].onchange = Custom.clear;

            if (!inputs[a].disabled) {
                div[a].onmouseover = Custom.pushed;
                div[a].onmouseout = Custom.unpushed;
                div[a].onmouseup = Custom.check;
            } else {
                div[a].className = div[a].className += " disabled";

                if (inputs[a].checked) {
                    if (inputs[a].type == "checkbox") {
                        div[a].style.backgroundPosition = "0 -" + (checkboxHeight * 4) + "px";
                    } else {
                        div[a].style.backgroundPosition = "0 -" + (radioHeight * 4) + "px";
                    }
                } else {
                    if (inputs[a].type == "checkbox") {
                        div[a].style.backgroundPosition = "0 -" + (checkboxHeight * 5) + "px";
                    } else {
                        div[a].style.backgroundPosition = "0 -" + (radioHeight * 5) + "px";
                    }
                }

                div[a].onmouseover = null;
                div[a].onmouseout = null;
                div[a].onmouseup = null;
            }
            //}
        }

        // select element
        if (elDom && elDom.tagName == "INPUT") {
            inputs = [];
        } else if (elDom && elDom.tagName == "SELECT") {
            inputs = [];
            inputs[0] = elDom;
        } else if (elDom) {
            inputs = $(elDom).find("select");
        } else {
            inputs = $(document).find("select");
        }

        for (a = 0; a < inputs.length; a++) {
            var textnode = "",
                option = $(inputs[a]).children(),
                $input_a = $(inputs[a]),
                selectIndex = inputs[a].selectedIndex,
                widthArr = [],
                disabledOption,
                clsName;

            $input_a.removeAttr("title");

            if (!mDocument.body.className.contains("modal")) {
                selMaxWidth = mainSelMaxWidth;
            } else {
                selMaxWidth = modelSelMaxWidth;
            }

            if (!inputs[a].size && !$input_a.attr('nocustom')) {
                if ($input_a.attr("mSelect")) {
                    selMaxWidth = mainSelMaxWidth;
                }

                if (!inputs[a].className.contains("styled")) {
                    $input_a.addClass("styled");
                }

                var optionSelectedValue = $input_a.val();

                for (b = 0; b < option.length; b++) {
                    if (option[b].text.match(/\.{3,}$/) && option[b].title) {
                        option[b].text = option[b].title;
                    }

                    $(option[b]).removeAttr("title");

                    var optionValue = option[b].text,
                        hasChinese = /.*[\u4e00-\u9fa5]+.*$/.test(optionValue);

                    if (((hasChinese && optionValue.length <= 10) || (!hasChinese && optionValue.length <= 20)) && (optionValue.length > 2)) {
                        result = {
                            width: 130,
                            height: 15
                        };
                    } else {
                        result = this.textSize(option[b]);
                    }


                    // if (!optionSelectedValue && optionSelectedValue != "") {
                    //     inputs[a].selectedIndex = -1;
                    // }

                    // Improve performance in IE
                    // if (option[b].childNodes[0] && selectIndex != -1) {
                    //     option[b].childNodes[0].nodeValue = optionValue;
                    // }

                    if (result.width > selMaxWidth) {
                        var pos = 0;

                        for (var i = parseInt(optionValue.length / 2); i < optionValue.length; i++) {

                            option[b].text = optionValue.substring(0, i);

                            var optResult = this.textSize(option[b]);

                            if (optResult.width > selMaxWidth) {
                                result.width = optResult.width;

                                pos = i - 3;

                                i = optionValue.length;
                                break;
                            }
                        }

                        if (pos != 0) {
                            option[b].text = optionValue.substring(0, pos) + "...";

                            option[b].title = optionValue;
                        }
                    }

                    widthArr.push(result.width);

                    if (option[b].selected) {
                        textnode = document.createTextNode(optionValue);

                        if ($(option[b]).hasClass('disabledExtOrTrunk')) {
                            disabledOption = true;
                        } else {
                            disabledOption = false;
                        }
                    }
                }

                if (!optionSelectedValue && optionSelectedValue != "") {
                    textnode = document.createTextNode("");
                }

                var prev = inputs[a].previousSibling;

                if (prev) {
                    clsName = prev.className;
                }

                if (prev && prev.className && prev.className.contains("divSelect")) {
                    $(prev).remove();
                }

                div[a] = document.createElement("div");

                if (disabledOption) {
                    div[a].className = "divSelect disabledExtOrTrunk";
                } else {
                    div[a].className = "divSelect";
                }

                var spanDes = document.createElement("span");

                if (!mDocument.body.className.contains("modal")) {
                    spanDes.className = "mainSpanDes";
                } else {
                    spanDes.className = "modelSpanDes";
                }

                if ($input_a.attr("mSelect")) {
                    spanDes.className = "mainSpanDes";
                }

                var spanIcon = document.createElement("span");

                spanIcon.className = inputs[a].type;

                div[a].appendChild(spanDes);

                div[a].appendChild(spanIcon);

                spanIcon.className = "select";

                div[a].id = "select" + inputs[a].name;

                inputs[a].parentNode.insertBefore(div[a], inputs[a]);

                spanDes.innerText = "";

                spanDes.appendChild(textnode);

                if (widthArr.length == 0) {
                    spanDes.style.width = defaultWidth;
                } else {
                    var maxWidth = $input_a.attr("maxWidth");

                    if (maxWidth) {
                        spanDes.style.width = maxWidth;
                    } else {
                        spanDes.style.width = Math.max.apply(Math, widthArr) + "px";
                    }
                }

                var inputWidth = "";

                if ((spanDes.offsetWidth == 0 || spanIcon.offsetWidth == 0) && widthArr.length != 0) {
                    inputWidth = (Math.max.apply(Math, widthArr) + 9 + iconWidth);
                } else {
                    inputWidth = (spanDes.offsetWidth + spanIcon.offsetWidth + 2);
                }

                if (inputWidth > selMaxWidth) {
                    inputWidth = selMaxWidth;
                }

                inputs[a].style.width = inputWidth + "px";

                if ($input_a.css("display") == "none") {
                    $(div[a]).css("display", "none");
                }

                $input_a.bind({
                    focus: function(ev) {
                        Custom.select_focus_in(this);

                        ev.stopPropagation();
                    },
                    blur: function(ev) {
                        Custom.select_focus_out(this);

                        ev.stopPropagation();
                    }
                });

                $input_a.bind("mouseover", function(ev) {
                    var span = this.previousSibling.children.item(0),
                        result = Custom.textSize(span);

                    if (result.width > span.offsetWidth && result.width > selMaxWidth) {
                        var text;

                        if (typeof span.textContent != "undefined") {
                            text = span.textContent;
                        } else {
                            text = span.innerText;
                        }

                        $(this).attr("title", text);
                    } else {
                        $(span).removeAttr("title");
                    }

                    ev.stopPropagation();
                });

                if (!inputs[a].disabled) {
                    if (top.UCMGUI.config.ie8 && $input_a.hasClass('subnetSelect')) {
                        inputs[a].onchange = function(ev) {
                            Custom.choose(this);
                        };
                    } else {
                        $input_a.bind("change", function(ev) {
                            Custom.choose(this);

                            ev.stopPropagation();
                        });
                    }
                } else {
                    inputs[a].previousSibling.children.item(0).className += " spanDesDisable";
                    inputs[a].previousSibling.children.item(1).style.backgroundPosition = iconPosition + " -" + selectHeight * 2 + "px";
                }
            }
        }

        document.onmouseup = Custom.clear;
    },
    pushed: function() {
        var element = this.nextSibling;

        if (element.checked && element.type == "checkbox") {
            this.style.backgroundPosition = "0 -" + checkboxHeight * 3 + "px";
        } else if (element.checked && element.type == "radio") {
            this.style.backgroundPosition = "0 -" + radioHeight * 3 + "px";
        } else if (!element.checked && element.type == "checkbox") {
            this.style.backgroundPosition = "0 -" + checkboxHeight + "px";
        } else {
            this.style.backgroundPosition = "0 -" + radioHeight + "px";
        }
    },
    unpushed: function() {
        var element = this.nextSibling;

        if (element.checked && element.type == "checkbox") {
            this.style.backgroundPosition = "0 -" + checkboxHeight * 2 + "px";
        } else if (element.checked && element.type == "radio") {
            this.style.backgroundPosition = "0 -" + radioHeight * 2 + "px";
        } else if (!element.checked && element.type == "checkbox") {
            this.style.backgroundPosition = "0 0";
        } else {
            this.style.backgroundPosition = "0 0";
        }
    },
    check: function() {
        var element = this.nextSibling;

        if (element.checked == true && element.type == "checkbox") {
            this.style.backgroundPosition = "0 0";
        } else {
            if (element.type == "checkbox") {
                this.style.backgroundPosition = "0 -" + checkboxHeight * 2 + "px";
            } else {
                this.style.backgroundPosition = "0 -" + radioHeight * 2 + "px";

                var group = this.nextSibling.name,
                    inputs = $(element).parents('body').find("input[type=radio]");

                /*
                 * Pengcheng Zou Comment.
                 *
                 * Fixed the problem that the mDocument will still
                 * point to the dialog window after closing dialog.
                 *
                 */

                // inputs = mDocument.getElementsByTagName("input");

                for (var a = 0; a < inputs.length; a++) {
                    if (inputs[a].name == group && inputs[a] != this.nextSibling) {
                        inputs[a].previousSibling.style.backgroundPosition = "0 0";

                        $(element).attr("checked", true);

                        $(inputs[a]).attr("checked", false);
                    }
                }
            }
        }

        if (($(element).attr("id") && $(element).attr("id").contains("cb_")) || !$(element).hasClass("cbox")) {
            $(element).trigger("click");
        }
    },
    clear: function() {
        var inputs = $(document).find("input[type=checkbox], input[type=radio]");

        for (var b = 0; b < inputs.length; b++) {
            if (inputs[b].type == "checkbox" && inputs[b].checked && inputs[b].className.contains("styled")) {
                inputs[b].previousSibling.style.backgroundPosition = "0 -" + checkboxHeight * 2 + "px";
            } else if (inputs[b].type == "checkbox" && inputs[b].className) {
                inputs[b].previousSibling.style.backgroundPosition = "0 0";
            } else if (inputs[b].type == "radio" && inputs[b].checked && inputs[b].className.contains("styled")) {
                inputs[b].previousSibling.style.backgroundPosition = "0 -" + radioHeight * 2 + "px";
            } else if (inputs[b].type == "radio" && inputs[b].className.contains("styled")) {
                inputs[b].previousSibling.style.backgroundPosition = "0 0";
            }
        }
    },
    choose: function(obj) {
        var option = $(obj).children();

        $(obj).removeAttr("title");

        var span = obj.previousSibling.children.item(0),
            icon = obj.previousSibling.children.item(1);


        for (d = 0; d < option.length; d++) {
            if (option[d].selected == true) {
                var optionValue = option[d].childNodes[0].nodeValue,
                    optionTitle = option[d].title;

                if ($(option[d]).hasClass('disabledExtOrTrunk')) {
                    obj.previousSibling.className = "divSelect disabledExtOrTrunk";
                } else {
                    obj.previousSibling.className = "divSelect";
                }

                if (optionValue.match(/\.{3,}$/)) {
                    this.text(span, optionTitle);
                } else {
                    this.text(span, optionValue);
                }
            }
        }

        icon.className = "select";

        // if ($.browser.msie || $.browser.mozilla) {
        // 	   icon.className += " selectIe";
        // }

        obj.style.width = (span.offsetWidth + icon.offsetWidth) + "px";
    },
    select_focus_in: function(obj) {
        $(obj.previousSibling).addClass("divSelectFocus");

        if (obj.previousSibling) {
            obj.previousSibling.children.item(1).style.backgroundPosition = iconPosition + " -" + selectHeight + "px";
        }
    },
    select_focus_out: function(obj) {
        $(obj.previousSibling).removeClass("divSelectFocus");

        if (obj.previousSibling) {
            obj.previousSibling.children.item(1).style.backgroundPosition = iconPosition + " 0px";
        }
    },
    select_disable: function(obj) {
        $(obj.previousSibling.children.item(0)).addClass("spanDesDisable");

        if (obj.previousSibling) {
            obj.previousSibling.children.item(1).style.backgroundPosition = iconPosition + " -" + selectHeight * 2 + "px";
        }
    },
    textSize: function(obj) {
        var text = obj.text || obj.innerText;
        var span = document.createElement("span");
        var customFormEleDes = document.getElementById("customFormEleDes");

        if (!mDocument.body.className.contains("modal")) {
            span.className = "mainSpanDes";
        } else {
            span.className = "modelSpanDes";
        }
        var result = {};
        result.width = span.offsetWidth;
        result.height = span.offsetWidth;
        span.style.fontSize = fontSize;
        span.style.fontWeight = fontWeight;
        span.style.visibility = "hidden";
        customFormEleDes.appendChild(span);
        this.text(span, text);
        result.width = span.offsetWidth + 9 - result.width;
        result.height = span.offsetHeight - result.height;
        customFormEleDes.removeChild(span);
        return result;
    },
    text: function(el, text) {
        if (typeof el.textContent != "undefined")
            el.textContent = text;
        else
            el.innerText = text;
    }
}
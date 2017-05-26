import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

export default StyleSheet.create({
    "divucm-container": {
        "display": "block",
        "position": "relative",
        "minHeight": 26
    },
    "ucm-container": {
        "display": "block",
        "position": "relative",
        "minHeight": 26
    },
    "divucm-element": {
        "display": "block",
        "position": "relative",
        "minHeight": 26
    },
    "ucm-element": {
        "display": "block",
        "position": "relative",
        "minHeight": 26
    },
    "ucm-container label": {
        "display": "inline-block",
        "width": 100,
        "verticalAlign": "top"
    },
    "ucm-checklist": {
        "display": "inline-block"
    },
    "ucm-fileselector": {
        "display": "inline-block"
    },
    "ucm-fileselector imgpreview": {
        "display": "block",
        "maxHeight": 200,
        "maxWidth": 300,
        "marginTop": 6
    },
    "ucm-fileselector divdimension": {
        "fontStyle": "italic",
        "color": "#888",
        "fontSize": 12
    },
    "divitem-holder divfield:hover ucm-fileselector divcontrols": {
        "display": "inline-block"
    },
    "ucm-fileselector divcontrols": {
        "display": "none",
        "verticalAlign": "middle",
        "marginLeft": 10
    },
    "ucm-fileselector divcontrols spanbutton": {
        "width": 16,
        "height": 16,
        "cursor": "pointer",
        "display": "inline-block",
        "paddingRight": 4
    },
    "ucm-fileselector divcontrols spanbuttonreload": {
        "background": "url('../images/icn_list_reload_inactive.png') center center no-repeat"
    },
    "ucm-fileselector divcontrols spanbuttonreload:hover": {
        "background": "url('../images/icn_list_reload.png') center center no-repeat"
    },
    "ucm-fileselector divcontrols spanbuttonmanage": {
        "background": "url('../images/icn_list_manage_inactive.png') center center no-repeat"
    },
    "ucm-fileselector divcontrols spanbuttonmanage:hover": {
        "background": "url('../images/icn_list_manage.png') center center no-repeat"
    },
    "ucm-fileselector divcontrols spanbuttondelete": {
        "background": "url('../images/icn_list_delete_inactive.png') center center no-repeat"
    },
    "ucm-fileselector divcontrols spanbuttondelete:hover": {
        "background": "url('../images/icn_list_delete.png') center center no-repeat"
    },
    "divdisable-glass": {
        "position": "absolute",
        "left": 0,
        "right": 0,
        "top": 0,
        "bottom": 0
    },
    "spanwarning": {
        "background": "url(\"../images/icn_warning_orange.png\") no-repeat 0 0",
        "display": "inline-block",
        "paddingLeft": 18,
        "lineHeight": 18
    },
    "ucm-tooltip": {
        "display": "block",
        "border": "1px dotted #F1D031",
        "background": "#FFFFA3 url(\"../images/icn_info_lightblue.png\") no-repeat 4px 4px",
        "marginTop": 4,
        "marginBottom": 4,
        "paddingTop": 4,
        "paddingRight": 4,
        "paddingBottom": 4,
        "paddingLeft": 24,
        "fontSize": 12,
        "color": "#555"
    },
    "ucm-tooltip alink": {
        "outline": "1px solid transparent"
    },
    "ucm-tooltiperror": {
        "border": "1px dotted #D95252",
        "background": "#F78B83 url(\"../images/icn_error_white.png\") no-repeat 4px 4px",
        "color": "#fff"
    },
    "ucm-tooltipwarning": {
        "background": "#FFFFA3 url(\"../images/icn_warning_orange.png\") no-repeat 4px 4px"
    },
    "navBar": {
        "height": 36,
        "width": 720,
        "zIndex": 10000
    },
    "navBar-inner": {
        "height": 26,
        "width": 710,
        "zIndex": 10000,
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "backgroundColor": "#6babd1",
        "borderTop": "1px solid #225783",
        "borderBottom": "1px solid #225783",
        "display": "table"
    },
    "navBar-inner divcell": {
        "display": "table-cell"
    },
    "navBar-inner divlabel": {
        "lineHeight": 26,
        "paddingRight": 5,
        "paddingLeft": 5,
        "color": "#fff",
        "fontSize": 14,
        "width": 100,
        "textAlign": "right"
    },
    "navBar-inner divcombo": {},
    "navBar-inner divcontrol": {
        "verticalAlign": "middle"
    },
    "navBar-inner divsideControl": {
        "textAlign": "right",
        "verticalAlign": "middle",
        "paddingRight": 5,
        "paddingLeft": 5
    },
    "navBar-inner divsideControl a": {
        "color": "#eee",
        "textDecoration": "none"
    },
    "navBar-inner divsideControl a:hover": {
        "color": "#225783"
    },
    "scrolling": {
        "position": "fixed",
        "top": 0
    },
    "navBar-innerscrolling": {
        "boxShadow": "0px 3px 5px #888888"
    },
    "ucm-navibox": {
        "position": "relative",
        "display": "inline-block"
    },
    "ucm-navibox-control": {
        "display": "inline-block",
        "marginLeft": 36
    },
    "ucm-navibox-toggle": {
        "position": "absolute",
        "top": 0,
        "bottom": 0,
        "marginLeft": -1,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "Height": 1.7,
        "Top": 0.1
    },
    "ucm-navibox-input": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0.2,
        "paddingRight": 0.2,
        "paddingBottom": 0.2,
        "paddingLeft": 0.2,
        "width": 280
    },
    "ui-autocomplete": {
        "maxHeight": 200,
        "width": 300,
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 5,
        "overflowY": "auto",
        "overflowX": "hidden"
    },
    "ui-autocompleteui-widget-content": {
        "background": "#fff"
    },
    "ui-autocomplete highlight": {
        "backgroundColor": "#8cc7ea",
        "color": "#fff"
    },
    "ui-menu ui-menu-item asel": {
        "fontWeight": "bold",
        "fontStyle": "italic"
    },
    "ui-menu ui-menu-itemlevel1": {
        "background": "#eee"
    },
    "ui-menu ui-menu-itemlevel1 a": {
        "color": "#666"
    },
    "ui-menu ui-menu-itemlevel2": {
        "borderTop": "1px solid #808080",
        "borderBottom": "1px solid #808080"
    },
    "ui-menu ui-menu-itemlevel2 a": {
        "paddingLeft": 1,
        "color": "#666"
    },
    "ui-menu ui-menu-itemlevel3": {},
    "ui-menu ui-menu-itemlevel3 a": {
        "paddingLeft": 2,
        "color": "#333"
    },
    "ui-menu ui-menu-itemlevel3 aactive": {
        "color": "#3cb878"
    },
    "ui-menuui-widget-content ui-state-focus": {
        "border": "1px solid #91c6e5",
        "background": "#c2e5f9",
        "fontWeight": "normal",
        "color": "inherit"
    },
    "divfield-tooltip": {
        "width": 300
    },
    "divfield-tooltip divmessage": {},
    "divfield-tooltip divcontrol": {
        "display": "table"
    },
    "divfield-tooltip divcontrol div": {
        "display": "table-cell"
    },
    "divfield-tooltip divcontrol divlabel": {
        "fontWeight": "bold",
        "paddingRight": 4
    },
    "divfield-container": {
        "marginTop": 10
    },
    "divfield-container divempty": {
        "background": "#ccc",
        "lineHeight": 30,
        "textAlign": "center"
    },
    "divitemContainer": {
        "width": 720
    },
    "divbuttons": {
        "width": 720,
        "marginTop": 10,
        "marginBottom": 10,
        "textAlign": "center"
    },
    "divfield-group": {
        "marginTop": 4
    },
    "divfield-group divgroup-header": {
        "display": "table",
        "background": "#acacac",
        "color": "#fff",
        "lineHeight": 22,
        "fontSize": 14,
        "borderBottom": "1px solid #eee",
        "width": "100%"
    },
    "divfield-group divgroup-header divlabel": {
        "display": "table-cell",
        "paddingTop": 5,
        "paddingRight": 1,
        "paddingBottom": 5,
        "paddingLeft": 1,
        "width": "auto"
    },
    "divfield-group divgroup-header divcontrol": {
        "display": "table-cell",
        "paddingTop": 6,
        "paddingRight": 6,
        "paddingBottom": 6,
        "paddingLeft": 6,
        "width": 24,
        "textAlign": "center"
    },
    "divfield-group divitem-holder": {
        "display": "block"
    },
    "divfield-group divitem-holder divsubgroup-header": {
        "display": "block",
        "background": "#fff",
        "color": "#333",
        "fontSize": 13,
        "paddingTop": 5,
        "paddingRight": 2,
        "paddingBottom": 5,
        "paddingLeft": 2,
        "borderTop": "1px solid #898989",
        "borderBottom": "1px solid #898989"
    },
    "divfield-subgroup divitem-holder divfield": {
        "display": "table",
        "width": "100%",
        "borderBottom": "1px dashed #666",
        "fontSize": 12,
        "color": "#666",
        "position": "relative"
    },
    "divfield-subgroup divitem-holder divfieldreadonly": {
        "backgroundColor": "#e0e0e0"
    },
    "divfield-subgroup divitem-holder divfield:hover": {
        "background": "linear-gradient(to bottom, #ffffff 23%,#e5e5e5 100%)",
        "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#e5e5e5',GradientType=0 )"
    },
    "divfield-subgroup divitem-holder divfield:hover divcell spancontrol": {
        "display": "inline-block"
    },
    "divfield-subgroup divitem-holder divfield divcell": {
        "display": "table-cell",
        "paddingTop": 8,
        "paddingRight": 0,
        "paddingBottom": 8,
        "paddingLeft": 0,
        "verticalAlign": "top",
        "position": "relative"
    },
    "divfield-subgroup divitem-holder divfield divcellsel": {
        "width": 30
    },
    "divfield-subgroup divitem-holder divfield divcellsel aremove": {
        "marginLeft": 10,
        "background": "transparent",
        "width": 24,
        "height": 24,
        "display": "inline-block",
        "verticalAlign": "middle",
        "textAlign": "center",
        "border": 0,
        "cursor": "none"
    },
    "divfield-subgroup divitem-holder divfield:hover divcellsel aremove": {
        "marginLeft": 10,
        "background": "transparent url(\"../images/delete_unpressed.png\") no-repeat center center",
        "width": 24,
        "height": 24,
        "display": "inline-block",
        "verticalAlign": "middle",
        "textAlign": "center",
        "border": 0,
        "cursor": "pointer"
    },
    "divfield-subgroup divitem-holder divfield divcelllabel": {
        "width": 240
    },
    "divfield-subgroup divitem-holder divfield divcellcontents": {
        "width": "auto"
    },
    "divfield-subgroup divitem-holder divfield divcellstate": {
        "width": 30
    },
    "divfield-subgroup divitem-holder divfield divcellstatelocked": {
        "background": "url(\"../images/icn_lock.png\") no-repeat center 10px"
    },
    "divfield-subgroup divitem-holder divfield divcellstatelinked": {
        "background": "url(\"../images/icn_linked.png\") no-repeat center 10px"
    },
    "divfield-subgroup divitem-holder divfield:last-child": {
        "borderBottom": "1px dashed transparent"
    },
    "divfield spancontrol": {
        "width": 24,
        "height": 24,
        "display": "none",
        "verticalAlign": "middle",
        "textAlign": "center",
        "cursor": "pointer"
    },
    "divfield spancontrolreset": {
        "background": "url(\"../images/icn_reset.png\") no-repeat center center"
    },
    "divfield spancontrolresetdisabled": {
        "background": "transparent",
        "cursor": "default"
    },
    "divfield divcelllabel divglab": {
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 2,
        "paddingLeft": 2,
        "height": "auto",
        "lineHeight": "normal"
    },
    "divfield-group group-header control aexpand": {
        "background": "#c2c2c2 url(\"../images/icn_w_expend_20.png\") no-repeat center center",
        "width": 20,
        "height": 20,
        "display": "inline-block",
        "verticalAlign": "middle",
        "textAlign": "center",
        "borderTop": "1px solid #aaa",
        "borderRight": "1px solid #fff",
        "borderBottom": "1px solid #fff",
        "borderLeft": "1px solid #aaa",
        "outline": "1px solid #e1e1e1",
        "cursor": "pointer"
    },
    "divfield-group group-header control aexpand:hover": {
        "backgroundColor": "#ddd"
    },
    "divfield-group group-header control acollapse": {
        "background": "#b5b5b5 url(\"../images/icn_w_collapse_20.png\") no-repeat center center",
        "width": 20,
        "height": 20,
        "display": "inline-block",
        "verticalAlign": "middle",
        "textAlign": "center",
        "borderTop": "1px solid #fff",
        "borderRight": "1px solid #aaa",
        "borderBottom": "1px solid #aaa",
        "borderLeft": "1px solid #fff",
        "outline": "1px solid #e1e1e1",
        "cursor": "pointer"
    },
    "field-group group-header control acollapse:hover": {
        "backgroundColor": "#c2c2c2"
    },
    "divucm-view divwrapper": {},
    "ucm-view divwrapper": {},
    "divucm-element select": {
        "width": 180,
        "backgroundColor": "#fff",
        "marginRight": 2
    },
    "ucm-element select": {
        "width": 180,
        "backgroundColor": "#fff",
        "marginRight": 2
    },
    "divucm-element selecterror": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "ucm-element selecterror": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "divucm-element input[type=\"text\"]error": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "ucm-element input[type=\"text\"]error": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "divucm-element input[type=\"password\"]error": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "ucm-element input[type=\"password\"]error": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "divucm-containererror input": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "ucm-containererror input": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "divucm-containererror select": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "ucm-containererror select": {
        "border": "1px solid #EDC7C6",
        "background": "#FFE6E7",
        "color": "#363636"
    },
    "ucm-element input[type=\"text\"]": {
        "width": 176,
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 3,
        "paddingLeft": 2
    },
    "ucm-element input[type=\"password\"]": {
        "width": 176,
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 3,
        "paddingLeft": 2
    },
    "ucm-element input[type=\"text\"]short": {
        "width": 88
    },
    "ucm-element input[type=\"password\"]short": {
        "width": 88
    },
    "ucm-element input[type=\"text\"]tiny": {
        "width": 44
    },
    "ucm-element input[type=\"password\"]tiny": {
        "width": 44
    },
    "ucm-element spanblock": {
        "display": "block"
    },
    "ucm-element spanunknown": {
        "color": "#a0a0a0"
    },
    "divucm-zeroconfig divfield-cell": {
        "borderBottom": "1px dashed #aaa"
    },
    "divucm-zeroconfig divfield-cellno-border": {
        "borderBottom": "1px dashed transparent"
    },
    "divinfo-container": {
        "display": "block"
    },
    "divinfo-container divcell": {
        "display": "table-cell"
    },
    "divinfo-container divthumbnail": {
        "paddingTop": 0,
        "paddingRight": 10,
        "paddingBottom": 0,
        "paddingLeft": 10,
        "textAlign": "center",
        "verticalAlign": "middle",
        "width": 180,
        "position": "relative"
    },
    "divinfo-container divthumbnail imgthumbnail": {
        "maxHeight": 170,
        "maxWidth": 170
    },
    "divinfo-container divthumbnail imgsm_thumbnail": {
        "maxHeight": 148,
        "maxWidth": 148
    },
    "divinfo-container divthumbnail divzoon-glass": {
        "width": "99%",
        "height": "100%",
        "position": "absolute",
        "left": 1,
        "right": 0,
        "top": 1,
        "bottom": 0,
        "opacity": 0,
        "cursor": "pointer"
    },
    "divinfo-container divthumbnail divzoon-glass:hover": {
        "backgroundColor": "#6babd1",
        "opacity": 0.3,
        "WebkitTransition": "opacity 1s",
        "transition": "opacity 1s",
        "backgroundImage": "url(../images/icn_zoomin_24.png)",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "right bottom"
    },
    "divoption-container": {
        "paddingTop": 6,
        "borderBottom": "1px solid #225783"
    },
    "divoption-container ul": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "listStyleType": "none",
        "textAlign": "left",
        "height": 31
    },
    "divoption-container ul li": {
        "lineHeight": 26,
        "display": "inline"
    },
    "divoption-container ul li a": {
        "textDecoration": "none",
        "paddingTop": 5,
        "paddingRight": 20,
        "paddingBottom": 5,
        "paddingLeft": 20,
        "color": "#225783",
        "fontSize": 14
    },
    "divoption-container ul li a:hover": {
        "cursor": "pointer",
        "color": "#6babd1",
        "borderBottom": "5px solid #6babd1"
    },
    "divoption-container ul lisel": {},
    "divoption-container ul lisel a": {
        "fontWeight": "bold",
        "borderBottom": "5px solid #225783"
    },
    "divoption-container ul lisel a:hover": {
        "borderBottom": "5px solid #225783"
    },
    "divcontent-pad divsubgroup-header": {
        "display": "block",
        "background": "#fff",
        "color": "#333",
        "fontSize": 13,
        "paddingTop": 5,
        "paddingRight": 2,
        "paddingBottom": 5,
        "paddingLeft": 2,
        "borderTop": "1px solid #898989",
        "borderBottom": "1px solid #898989"
    },
    "divdev-advanced": {
        "display": "table",
        "width": "100%",
        "marginTop": 1
    },
    "divdev-advanced divtemplate-pad": {
        "display": "table-cell",
        "width": "45%",
        "verticalAlign": "top"
    },
    "divdev-advanced divtemplate-pad divsection-head": {
        "backgroundColor": "#68a6ca",
        "height": 30,
        "color": "#fff"
    },
    "divdev-advanced divtemplate-pad divsection-head spannum": {
        "display": "inline-block",
        "background": "url('../images/bg_white_circle.png') center center no-repeat",
        "height": 28,
        "width": 28,
        "lineHeight": 28,
        "paddingTop": 1,
        "paddingRight": 4,
        "paddingBottom": 1,
        "paddingLeft": 4,
        "color": "#68a6ca",
        "fontWeight": "bold",
        "fontSize": 14,
        "textAlign": "center",
        "verticalAlign": "middle"
    },
    "divdev-advanced divtemplate-pad divsection-head spanlabel": {
        "display": "inline-block",
        "height": 28,
        "lineHeight": 28,
        "color": "#fff",
        "fontSize": 14,
        "verticalAlign": "middle"
    },
    "divdev-advanced divtemplate-pad divsection-content": {
        "paddingTop": 5,
        "paddingRight": 5,
        "paddingBottom": 5,
        "paddingLeft": 10
    },
    "ucm-fileselector controlButton": {
        "cursor": "pointer"
    },
    "divsection-content controlButton": {
        "cursor": "pointer",
        "display": "inline-block"
    },
    "divsection-content controlButton icon": {
        "display": "inline-block",
        "height": 24,
        "width": 24,
        "lineHeight": 28,
        "paddingTop": 1,
        "paddingRight": 0,
        "paddingBottom": 1,
        "paddingLeft": 4
    },
    "ucm-fileselector controlButton icon": {
        "display": "inline-block",
        "height": 24,
        "width": 24,
        "lineHeight": 28,
        "paddingTop": 1,
        "paddingRight": 0,
        "paddingBottom": 1,
        "paddingLeft": 4
    },
    "divsection-content controlButton iconadd": {
        "background": "url('../images/icn_list_add_dark.png') center center no-repeat"
    },
    "divsection-content controlButton iconedit": {
        "background": "url('../images/icn_list_edit_dark.png') center center no-repeat"
    },
    "ucm-fileselector controlButton iconedit": {
        "background": "url('../images/icn_list_edit_dark.png') center center no-repeat"
    },
    "divsection-content controlButton label": {
        "display": "inline-block",
        "height": 24,
        "lineHeight": 24,
        "color": "#225783",
        "fontSize": 13,
        "fontWeight": "bold",
        "verticalAlign": "middle"
    },
    "ucm-fileselector controlButton label": {
        "display": "inline-block",
        "height": 24,
        "lineHeight": 24,
        "color": "#225783",
        "fontSize": 13,
        "fontWeight": "bold",
        "verticalAlign": "middle"
    },
    "divsection-content controlButton:hover": {},
    "divsection-content controlButton:hover iconadd": {
        "background": "url('../images/icn_list_add.png') center center no-repeat"
    },
    "divsection-content controlButton:hover iconedit": {
        "background": "url('../images/icn_list_edit.png') center center no-repeat"
    },
    "divsection-content controlButton:hover label": {
        "color": "#6babd1"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list": {
        "display": "table",
        "width": "100%"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcell": {
        "display": "table-cell",
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 2,
        "paddingLeft": 2,
        "lineHeight": 22,
        "verticalAlign": "top"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcelllabel": {
        "width": "25%",
        "textAlign": "right"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcellcontent": {
        "width": "70%"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcellcontent select": {
        "width": "100%"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcelloption": {
        "width": "5%"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcelloption spancontrol": {
        "width": 16,
        "height": 16,
        "cursor": "pointer",
        "display": "block",
        "marginTop": 6
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcelloption spancontrolup": {
        "background": "url('../images/icn_list_up.png') center center no-repeat"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcelloption spancontroldown": {
        "background": "url('../images/icn_list_down.png') center center no-repeat"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcelloption spancontroladd": {
        "background": "url('../images/icn_list_add.png') center center no-repeat"
    },
    "divdev-advanced divtemplate-pad divsection-content divtemplate-list divcelloption spancontroldelete": {
        "background": "url('../images/icn_list_delete.png') center center no-repeat"
    },
    "divdev-advanced divseparator-pad": {
        "display": "table-cell",
        "width": 4
    },
    "divdev-advanced divpreview-pad": {
        "display": "table-cell",
        "width": "auto",
        "verticalAlign": "top"
    },
    "divdev-advanced divpreview-pad divsection-head": {
        "backgroundColor": "#888",
        "height": 30,
        "color": "#fff"
    },
    "divdev-advanced divpreview-pad divsection-head spanicon": {
        "display": "inline-block",
        "background": "url('../images/icn_preview_w.png') center center no-repeat",
        "height": 28,
        "width": 28,
        "lineHeight": 28,
        "paddingTop": 1,
        "paddingRight": 4,
        "paddingBottom": 1,
        "paddingLeft": 4
    },
    "divdev-advanced divpreview-pad divsection-head spanlabel": {
        "display": "inline-block",
        "height": 28,
        "lineHeight": 28,
        "color": "#fff",
        "fontSize": 14,
        "verticalAlign": "middle"
    },
    "divcustomContainer": {
        "width": 720,
        "marginTop": 4
    },
    "divcustomContainer divsection-head": {
        "backgroundColor": "#8ec6e6",
        "height": 30,
        "color": "#fff"
    },
    "divcustomContainer divsection-head spanlabel": {
        "display": "inline-block",
        "paddingLeft": 10,
        "height": 28,
        "lineHeight": 28,
        "color": "#fff",
        "fontSize": 14,
        "verticalAlign": "middle"
    },
    "divfieldContainer": {
        "display": "table",
        "width": "100%",
        "marginTop": 1
    },
    "divfieldContainer divrow": {
        "display": "table-row"
    },
    "divfieldContainer divrowhead divcell": {
        "borderTop": "1px solid #898989",
        "borderBottom": "1px solid #898989",
        "background": "#fff",
        "color": "#333",
        "fontSize": 13,
        "paddingTop": 5,
        "paddingRight": 0,
        "paddingBottom": 5,
        "paddingLeft": 0
    },
    "divfieldContainer divrow divcell": {
        "display": "table-cell"
    },
    "divfieldContainer divrowhead divcellcontrol": {
        "width": 30
    },
    "divfieldContainer divrowhead divcellname": {
        "width": 240
    },
    "divfieldContainer divrowhead divcellvalue": {
        "width": 240
    },
    "divfieldContainer divrowhead divcelldesc": {
        "width": 200
    },
    "divfieldContainer divrowfield": {
        "backgroundColor": "#f0f0f0",
        "height": 30
    },
    "divfieldContainer divrowfield:last-child divcell": {
        "borderBottom": "1px solid #e0e0e0"
    },
    "divfieldContainer divrowfield divcell": {
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 2,
        "paddingLeft": 2
    },
    "divfieldContainer divrowfield divcell input": {
        "width": "96%",
        "height": 24,
        "paddingTop": 0,
        "paddingRight": 4,
        "paddingBottom": 0,
        "paddingLeft": 4
    },
    "divfieldContainer divrowfield divcell ucm-tooltip": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "divfieldContainer divrowfield:hover divcell aremove": {
        "marginLeft": 2,
        "background": "transparent url(\"../images/delete_unpressed.png\") no-repeat center center",
        "width": 24,
        "height": 24,
        "display": "inline-block",
        "verticalAlign": "middle",
        "textAlign": "center",
        "border": 0,
        "cursor": "pointer"
    },
    "divfield-container-preview": {
        "marginTop": 0
    },
    "divfield-container-preview divempty": {
        "background": "#ccc",
        "lineHeight": 30,
        "textAlign": "center",
        "marginTop": 1
    },
    "divfield-container-preview divfield-group": {
        "lineHeight": 18
    },
    "divfield-container-preview divfield-group divgroup-header": {
        "lineHeight": 18
    },
    "divfield-container-preview divfield-group divgroup-header divlabel": {
        "paddingTop": 4,
        "paddingRight": 10,
        "paddingBottom": 4,
        "paddingLeft": 10
    },
    "divfield-container-preview divfield-group divitem-holder divsubgroup-header": {
        "paddingTop": 4,
        "paddingRight": 10,
        "paddingBottom": 4,
        "paddingLeft": 10
    },
    "divfield-container-preview divfield-group divfield-subgroup": {},
    "divfield-container-preview divfield-group divfield-subgroup divitem-holder divfield": {
        "fontSize": 12
    },
    "divfield-container-preview divfield-group divfield-subgroup divitem-holder divfield:hover": {
        "background": "transparent"
    },
    "divfield-container-preview divfield-group divfield-subgroup divitem-holder divfield divcellsel": {
        "width": 20
    },
    "divfield-container-preview divfield-group divfield-subgroup divitem-holder divfield divcelllabel": {
        "width": 120
    },
    "divfield-container-preview divfield divpreview-entity": {
        "minHeight": 20
    },
    "divfield-container-preview divfield divpreview-entity label": {
        "paddingRight": 5,
        "color": "gray",
        "fontStyle": "italic"
    },
    "divfield-container-preview divfield divpreview-entity spanvalue": {
        "color": "green",
        "minWidth": 6,
        "minHeight": 16,
        "paddingLeft": 2,
        "paddingRight": 2,
        "background": "#f0f0f0",
        "display": "inline-block",
        "wordBreak": "break-all"
    },
    "divupload-container": {
        "position": "relative"
    },
    "optionhighlight": {
        "background": "#fff799",
        "color": "#333"
    },
    "divmore-holder": {
        "textAlign": "center"
    },
    "divmore-holder spancontrol": {
        "paddingTop": 6,
        "paddingRight": 6,
        "paddingBottom": 6,
        "paddingLeft": 6,
        "display": "block",
        "fontSize": 13,
        "borderTop": "1px solid transparent",
        "borderBottom": "1px solid transparent"
    },
    "divmore-holder spancontrolloading": {
        "background": "#f0f0f0"
    },
    "divmore-holder spancontrolmore": {
        "background": "#ccc",
        "color": "#fff"
    },
    "divmore-holder spancontrolmore:hover": {
        "borderTop": "1px solid #fff",
        "borderBottom": "1px solid #888",
        "background": "#aaa",
        "color": "#fff",
        "cursor": "pointer"
    },
    "divfield-container input[type=checkbox]:not(old)": {
        "width": 19,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "opacity": 0
    },
    "divfield-subgroup input[type=checkbox]:not(old) + label": {
        "display": "inline-block",
        "marginLeft": -19,
        "paddingLeft": 19,
        "left": 10,
        "top": -2,
        "background": "url('../images/checkbox.png') no-repeat 0 0",
        "lineHeight": 26
    },
    "GSRTL divfield-subgroup input[type=checkbox]:not(old) + label": {
        "marginLeft": 0,
        "marginRight": -19
    },
    "divfield-subgroup input[type=checkbox]:not(old):hover + label": {
        "backgroundPosition": "0 -25px"
    },
    "divfield-subgroup input[type=checkbox]:not(old):checked + label": {
        "backgroundPosition": "0 -50px"
    },
    "divfield-subgroup input[type=checkbox]:not(old):hover:checked + label": {
        "backgroundPosition": "0 -75px"
    },
    "divfield-subgroup input[type=checkbox]:not(old):disabled:checked + label": {
        "backgroundPosition": "0 -100px"
    },
    "divfield-subgroup input[type=checkbox]:not(old):disabled + label": {
        "backgroundPosition": "0 -125px"
    },
    "divmodel-container": {
        "display": "table",
        "height": "100%"
    },
    "divmodel-container divcell": {
        "display": "inline-block",
        "height": "99%"
    },
    "divmodel-container divcellthumbnail": {
        "verticalAlign": "middle",
        "textAlign": "center",
        "position": "relative"
    },
    "divmodel-container divcellthumbnail divt-holder": {
        "display": "table-cell",
        "verticalAlign": "middle",
        "height": 148,
        "width": 148,
        "background": "#fff",
        "borderRight": "1px solid #eee"
    },
    "divmodel-container divcellthumbnail imgthumbnail": {
        "maxHeight": 148,
        "maxWidth": 148
    },
    "divmodel-container divcellthumbnail divnav-glass": {
        "backgroundColor": "#000",
        "width": "99%",
        "height": "100%",
        "position": "absolute",
        "left": 1,
        "right": 0,
        "top": 1,
        "bottom": 0,
        "opacity": 0.6,
        "cursor": "pointer"
    },
    "divmodel-container divcellthumbnail divnav-glass:hover": {
        "opacity": 0.9,
        "WebkitTransition": "opacity 1s",
        "transition": "opacity 1s"
    },
    "divmodel-container divcellthumbnail divnav-glassleft": {
        "backgroundImage": "url(../images/slider_arrow_left.png)",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "right center"
    },
    "divmodel-container divcellthumbnail divnav-glassright": {
        "backgroundImage": "url(../images/slider_arrow_right.png)",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "left center"
    },
    "divmodel-container divcellcontents": {
        "overflow": "hidden",
        "verticalAlign": "top",
        "textAlign": "left",
        "borderSpacing": 0
    },
    "divmodel-container divcellcontents divtitle": {
        "fontSize": 13,
        "fontWeight": "bold",
        "color": "#fff",
        "lineHeight": 24,
        "paddingLeft": 4,
        "whiteSpace": "nowrap",
        "background": "#225783",
        "width": "99%"
    },
    "divmodel-container divcellcontents divdevice": {
        "display": "inline-block",
        "paddingTop": 4,
        "paddingRight": 3,
        "paddingBottom": 3,
        "paddingLeft": 3,
        "verticalAlign": "top",
        "fontSize": 13,
        "fontFamily": "arial,sans-serif",
        "color": "#666"
    },
    "divmodel-container divcellcontents divdevices": {
        "overflowY": "auto",
        "overflowX": "hidden"
    },
    "divmodel-container divcellcontents divdevicesel spanholder": {
        "backgroundColor": "#fff",
        "cursor": "default"
    },
    "divmodel-container divcellcontents divdevice spanholder": {
        "backgroundColor": "#eef9ff",
        "border": "1px solid #d9d9d9",
        "cursor": "pointer",
        "display": "block",
        "height": 20,
        "whiteSpace": "nowrap",
        "WebkitBorderRadius": 3,
        "borderRadius": 3,
        "boxShadow": "0px 1px 1px #aaa"
    },
    "divmodel-container divcellcontents divdevice spanholder:hover": {
        "borderColor": "#888",
        "backgroundColor": "#fffde7"
    },
    "divmodel-container divcellcontents divdevice spanholder divname": {
        "display": "inline-block",
        "marginTop": 2,
        "marginRight": 5,
        "marginBottom": 2,
        "marginLeft": 5,
        "maxWidth": 325,
        "maxHeight": 17,
        "overflow": "hidden",
        "textOverflow": "ellipsis",
        "direction": "ltr",
        "lineHeight": 17
    },
    "divmodel-container divcellcontents divdevice spanholder divcontrol": {
        "display": "inline-block",
        "width": 20,
        "height": 20,
        "verticalAlign": "top",
        "cursor": "pointer",
        "background": "url(../images/icn_small_remove.png) no-repeat"
    },
    "ucm-unslider": {
        "position": "relative",
        "width": "100%",
        "overflow": "hidden",
        "fontSize": 18,
        "lineHeight": 24,
        "textAlign": "center",
        "background": "linear-gradient(to bottom, rgba(255,255,255,1) 0%,rgba(229,229,229,1) 100%)",
        "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#e5e5e5',GradientType=0 )"
    },
    "ucm-unslider divitem": {
        "border": "1px solid transparent",
        "opacity": 0.8,
        "height": 130
    },
    "ucm-unslider divitemcurrent": {
        "height": 150,
        "border": "1px solid #aaa",
        "background": "linear-gradient(to bottom, rgba(255,255,255,1) 0%,rgba(243,243,243,1) 82%,rgba(243,243,243,1) 82%,rgba(237,237,237,1) 83%,rgba(255,255,255,1) 100%)",
        "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#ffffff',GradientType=0 )",
        "opacity": 1
    },
    "ucm-unslider divitemcurrent divmodel-container divcellcontents": {},
    "ucm-unslider btn": {
        "WebkitFilter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
        "MozFilter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
        "MsFilter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
        "OFilter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
        "filter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))"
    },
    "ucm-unslider dot": {
        "WebkitFilter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
        "MozFilter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
        "MsFilter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
        "OFilter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
        "filter": "drop-shadow(0 1px 2px rgba(0,0,0,.3))"
    },
    "ucm-unslider dots": {
        "position": "absolute",
        "left": 0,
        "right": 0,
        "bottom": -10,
        "width": "100%"
    },
    "ucm-unslider dots li": {
        "display": "inline-block",
        "Display": "inline",
        "zoom": 1,
        "width": 10,
        "height": 10,
        "lineHeight": 10,
        "marginTop": 0,
        "marginRight": 4,
        "marginBottom": 0,
        "marginLeft": 4,
        "textIndent": -999,
        "TextIndent": 0,
        "border": "2px solid #fff",
        "borderRadius": 6,
        "cursor": "pointer",
        "opacity": 0.4,
        "WebkitTransition": "background .5s, opacity .5s",
        "MozTransition": "background .5s, opacity .5s",
        "transition": "background .5s, opacity .5s"
    },
    "ucm-unslider dots liactive": {
        "background": "#fff",
        "opacity": 1
    },
    "ucm-unslider arrows": {
        "position": "absolute",
        "bottom": 20,
        "right": 20,
        "color": "#fff"
    },
    "ucm-unslider arrow": {
        "display": "inline",
        "paddingLeft": 10,
        "cursor": "pointer"
    },
    "divsection-message": {
        "lineHeight": 24,
        "height": 26,
        "paddingTop": 4,
        "paddingRight": 4,
        "paddingBottom": 4,
        "paddingLeft": 20,
        "background": "#fff799",
        "border": "1px solid #aaa",
        "marginBottom": 4
    },
    "mfp-bg": {
        "top": 0,
        "left": 0,
        "width": "100%",
        "height": "100%",
        "zIndex": 1042,
        "overflow": "hidden",
        "position": "fixed",
        "background": "#0b0b0b",
        "opacity": 0.8,
        "filter": "alpha(opacity=80)"
    },
    "mfp-wrap": {
        "top": 0,
        "left": 0,
        "width": "100%",
        "height": "100%",
        "zIndex": 1043,
        "position": "fixed",
        "outline": "none !important",
        "WebkitBackfaceVisibility": "hidden"
    },
    "mfp-container": {
        "textAlign": "center",
        "position": "absolute",
        "width": "100%",
        "height": "100%",
        "left": 0,
        "top": 0,
        "paddingTop": 0,
        "paddingRight": 8,
        "paddingBottom": 0,
        "paddingLeft": 8,
        "WebkitBoxSizing": "border-box",
        "MozBoxSizing": "border-box",
        "boxSizing": "border-box"
    },
    "mfp-container:before": {
        "content": "''",
        "display": "inline-block",
        "height": "100%",
        "verticalAlign": "middle"
    },
    "mfp-align-top mfp-container:before": {
        "display": "none"
    },
    "mfp-content": {
        "position": "relative",
        "display": "inline-block",
        "verticalAlign": "middle",
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto",
        "textAlign": "left",
        "zIndex": 1045
    },
    "mfp-inline-holder mfp-content": {
        "width": "100%",
        "cursor": "auto"
    },
    "mfp-ajax-holder mfp-content": {
        "width": "100%",
        "cursor": "auto"
    },
    "mfp-ajax-cur": {
        "cursor": "progress"
    },
    "mfp-zoom-out-cur": {
        "cursor": "zoom-out"
    },
    "mfp-zoom-out-cur mfp-image-holder mfp-close": {
        "cursor": "zoom-out"
    },
    "mfp-zoom": {
        "cursor": "zoom-in"
    },
    "mfp-auto-cursor mfp-content": {
        "cursor": "auto"
    },
    "mfp-close": {
        "WebkitUserSelect": "none",
        "MozUserSelect": "none",
        "userSelect": "none",
        "width": 44,
        "height": 44,
        "lineHeight": 44,
        "position": "absolute",
        "right": 0,
        "top": 0,
        "textDecoration": "none",
        "textAlign": "center",
        "opacity": 0.65,
        "filter": "alpha(opacity=65)",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 18,
        "paddingLeft": 10,
        "color": "white",
        "fontStyle": "normal",
        "fontSize": 28,
        "fontFamily": "Arial, Baskerville, monospace"
    },
    "mfp-arrow": {
        "WebkitUserSelect": "none",
        "MozUserSelect": "none",
        "userSelect": "none",
        "position": "absolute",
        "opacity": 0.65,
        "filter": "alpha(opacity=65)",
        "marginTop": -55,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "top": "50%",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "width": 90,
        "height": 110,
        "WebkitTapHighlightColor": "rgba(0, 0, 0, 0)"
    },
    "mfp-preloader": {
        "WebkitUserSelect": "none",
        "MozUserSelect": "none",
        "userSelect": "none",
        "color": "#cccccc",
        "position": "absolute",
        "top": "50%",
        "width": "auto",
        "textAlign": "center",
        "marginTop": -0.8,
        "left": 8,
        "right": 8,
        "zIndex": 1044
    },
    "mfp-counter": {
        "WebkitUserSelect": "none",
        "MozUserSelect": "none",
        "userSelect": "none",
        "position": "absolute",
        "top": 0,
        "right": 0,
        "color": "#cccccc",
        "fontSize": 12,
        "lineHeight": 18
    },
    "mfp-loadingmfp-figure": {
        "display": "none"
    },
    "mfp-hide": {
        "display": "none !important"
    },
    "mfp-preloader a": {
        "color": "#cccccc"
    },
    "mfp-preloader a:hover": {
        "color": "white"
    },
    "mfp-s-ready mfp-preloader": {
        "display": "none"
    },
    "mfp-s-error mfp-content": {
        "display": "none"
    },
    "buttonmfp-close": {
        "overflow": "visible",
        "cursor": "pointer",
        "background": "transparent",
        "border": 0,
        "WebkitAppearance": "none",
        "display": "block",
        "outline": "none",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "zIndex": 1046,
        "WebkitBoxShadow": "none",
        "boxShadow": "none"
    },
    "buttonmfp-arrow": {
        "overflow": "visible",
        "cursor": "pointer",
        "background": "transparent",
        "border": 0,
        "WebkitAppearance": "none",
        "display": "block",
        "outline": "none",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "zIndex": 1046,
        "WebkitBoxShadow": "none",
        "boxShadow": "none"
    },
    "button::-moz-focus-inner": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "border": 0
    },
    "mfp-close:hover": {
        "opacity": 1,
        "filter": "alpha(opacity=100)"
    },
    "mfp-close:focus": {
        "opacity": 1,
        "filter": "alpha(opacity=100)"
    },
    "mfp-close:active": {
        "top": 1
    },
    "mfp-close-btn-in mfp-close": {
        "color": "#333333"
    },
    "mfp-image-holder mfp-close": {
        "color": "white",
        "right": -6,
        "textAlign": "right",
        "paddingRight": 6,
        "width": "100%"
    },
    "mfp-iframe-holder mfp-close": {
        "color": "white",
        "right": -6,
        "textAlign": "right",
        "paddingRight": 6,
        "width": "100%",
        "top": -40
    },
    "mfp-arrow:active": {
        "marginTop": -54
    },
    "mfp-arrow:hover": {
        "opacity": 1,
        "filter": "alpha(opacity=100)"
    },
    "mfp-arrow:focus": {
        "opacity": 1,
        "filter": "alpha(opacity=100)"
    },
    "mfp-arrow:before": {
        "content": "''",
        "display": "block",
        "width": 0,
        "height": 0,
        "position": "absolute",
        "left": 0,
        "top": 0,
        "marginTop": 35,
        "marginLeft": 35,
        "border": "medium inset transparent",
        "borderTopWidth": 21,
        "borderBottomWidth": 21,
        "opacity": 0.7
    },
    "mfp-arrow:after": {
        "content": "''",
        "display": "block",
        "width": 0,
        "height": 0,
        "position": "absolute",
        "left": 0,
        "top": 8,
        "marginTop": 35,
        "marginLeft": 35,
        "border": "medium inset transparent",
        "borderTopWidth": 13,
        "borderBottomWidth": 13
    },
    "mfp-arrow mfp-b": {
        "content": "''",
        "display": "block",
        "width": 0,
        "height": 0,
        "position": "absolute",
        "left": 0,
        "top": 0,
        "marginTop": 35,
        "marginLeft": 35,
        "border": "medium inset transparent",
        "borderTopWidth": 21,
        "borderBottomWidth": 21,
        "opacity": 0.7
    },
    "mfp-arrow mfp-a": {
        "content": "''",
        "display": "block",
        "width": 0,
        "height": 0,
        "position": "absolute",
        "left": 0,
        "top": 8,
        "marginTop": 35,
        "marginLeft": 35,
        "border": "medium inset transparent",
        "borderTopWidth": 13,
        "borderBottomWidth": 13
    },
    "mfp-arrow-left": {
        "left": 0
    },
    "mfp-arrow-left:after": {
        "borderRight": "17px solid white",
        "marginLeft": 31
    },
    "mfp-arrow-left mfp-a": {
        "borderRight": "17px solid white",
        "marginLeft": 31
    },
    "mfp-arrow-left:before": {
        "marginLeft": 25,
        "borderRight": "27px solid #3f3f3f"
    },
    "mfp-arrow-left mfp-b": {
        "marginLeft": 25,
        "borderRight": "27px solid #3f3f3f"
    },
    "mfp-arrow-right": {
        "right": 0
    },
    "mfp-arrow-right:after": {
        "borderLeft": "17px solid white",
        "marginLeft": 39
    },
    "mfp-arrow-right mfp-a": {
        "borderLeft": "17px solid white",
        "marginLeft": 39
    },
    "mfp-arrow-right:before": {
        "borderLeft": "27px solid #3f3f3f"
    },
    "mfp-arrow-right mfp-b": {
        "borderLeft": "27px solid #3f3f3f"
    },
    "mfp-iframe-holder": {
        "paddingTop": 40,
        "paddingBottom": 40
    },
    "mfp-iframe-holder mfp-content": {
        "lineHeight": 0,
        "width": "100%",
        "maxWidth": 900
    },
    "mfp-iframe-scaler": {
        "width": "100%",
        "height": 0,
        "overflow": "hidden",
        "paddingTop": "56.25%"
    },
    "mfp-iframe-scaler iframe": {
        "position": "absolute",
        "display": "block",
        "top": 0,
        "left": 0,
        "width": "100%",
        "height": "100%",
        "boxShadow": "0 0 8px rgba(0, 0, 0, 0.6)",
        "background": "black"
    },
    "imgmfp-img": {
        "width": "auto",
        "maxWidth": "100%",
        "height": "auto",
        "display": "block",
        "lineHeight": 0,
        "WebkitBoxSizing": "border-box",
        "MozBoxSizing": "border-box",
        "boxSizing": "border-box",
        "paddingTop": 40,
        "paddingRight": 0,
        "paddingBottom": 40,
        "paddingLeft": 0,
        "marginTop": 0,
        "marginRight": "auto",
        "marginBottom": 0,
        "marginLeft": "auto"
    },
    "mfp-figure": {
        "lineHeight": 0
    },
    "mfp-figure:after": {
        "content": "''",
        "position": "absolute",
        "left": 0,
        "top": 40,
        "bottom": 40,
        "display": "block",
        "right": 0,
        "width": "auto",
        "height": "auto",
        "zIndex": -1,
        "boxShadow": "0 0 8px rgba(0, 0, 0, 0.6)",
        "background": "#444444"
    },
    "mfp-figure small": {
        "color": "#bdbdbd",
        "display": "block",
        "fontSize": 12,
        "lineHeight": 14
    },
    "mfp-figure figure": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
    },
    "mfp-bottom-bar": {
        "marginTop": -36,
        "position": "absolute",
        "top": "100%",
        "left": 0,
        "width": "100%",
        "cursor": "auto"
    },
    "mfp-title": {
        "textAlign": "left",
        "lineHeight": 18,
        "color": "#f3f3f3",
        "wordWrap": "break-word",
        "paddingRight": 36
    },
    "mfp-image-holder mfp-content": {
        "maxWidth": "100%"
    },
    "mfp-gallery mfp-image-holder mfp-figure": {
        "cursor": "pointer"
    },
    "mfp-ie7 mfp-img": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "mfp-ie7 mfp-bottom-bar": {
        "width": 600,
        "left": "50%",
        "marginLeft": -300,
        "marginTop": 5,
        "paddingBottom": 5
    },
    "mfp-ie7 mfp-container": {
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "mfp-ie7 mfp-content": {
        "paddingTop": 44
    },
    "mfp-ie7 mfp-close": {
        "top": 0,
        "right": 0,
        "paddingTop": 0
    },
    "white-popup": {
        "position": "relative",
        "background": "#FFF",
        "paddingTop": 20,
        "paddingRight": 20,
        "paddingBottom": 20,
        "paddingLeft": 20,
        "width": "auto",
        "maxWidth": 500,
        "marginTop": 20,
        "marginRight": "auto",
        "marginBottom": 20,
        "marginLeft": "auto"
    },
    "chosen-container": {
        "position": "relative",
        "display": "inline-block",
        "verticalAlign": "middle",
        "fontSize": 12,
        "zoom": 1,
        "Display": "inline",
        "WebkitUserSelect": "none",
        "MozUserSelect": "none",
        "userSelect": "none",
        "marginRight": 4
    },
    "chosen-container *": {
        "WebkitBoxSizing": "border-box",
        "MozBoxSizing": "border-box",
        "boxSizing": "border-box"
    },
    "chosen-container chosen-drop": {
        "position": "absolute",
        "top": "100%",
        "left": -9999,
        "zIndex": 1010,
        "width": "100%",
        "border": "1px solid #aaa",
        "borderTop": 0,
        "background": "#fff",
        "boxShadow": "0 4px 5px rgba(0, 0, 0, 0.15)"
    },
    "chosen-containerchosen-with-drop chosen-drop": {
        "left": 0
    },
    "chosen-container a": {
        "cursor": "pointer"
    },
    "chosen-container-single chosen-single": {
        "position": "relative",
        "display": "block",
        "overflow": "hidden",
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 8,
        "height": 25,
        "border": "1px solid #aaa",
        "backgroundColor": "#fff",
        "backgroundClip": "padding-box",
        "boxShadow": "0 0 3px white inset, 0 1px 1px rgba(0, 0, 0, 0.1)",
        "color": "#444",
        "textDecoration": "none",
        "whiteSpace": "nowrap",
        "lineHeight": 24
    },
    "chosen-container-single chosen-default": {
        "color": "#999"
    },
    "chosen-container-single chosen-single span": {
        "display": "block",
        "overflow": "hidden",
        "marginRight": 26,
        "textOverflow": "ellipsis",
        "whiteSpace": "nowrap"
    },
    "chosen-container-single chosen-single-with-deselect span": {
        "marginRight": 38
    },
    "chosen-container-single chosen-single abbr": {
        "position": "absolute",
        "top": 6,
        "right": 26,
        "display": "block",
        "width": 12,
        "height": 12,
        "background": "url('../images/chosen-sprite.png') -42px 1px no-repeat",
        "fontSize": 1
    },
    "chosen-container-single chosen-single abbr:hover": {
        "backgroundPosition": "-42px -10px"
    },
    "chosen-container-singlechosen-disabled chosen-single abbr:hover": {
        "backgroundPosition": "-42px -10px"
    },
    "chosen-container-single chosen-single div": {
        "position": "absolute",
        "top": 0,
        "right": 0,
        "display": "block",
        "width": 18,
        "height": "100%"
    },
    "chosen-container-single chosen-single div b": {
        "display": "block",
        "width": "100%",
        "height": "100%",
        "background": "url('../images/chosen-sprite.png') no-repeat 0px 2px"
    },
    "chosen-container-single chosen-search": {
        "position": "relative",
        "zIndex": 1010,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 3,
        "paddingRight": 4,
        "paddingBottom": 3,
        "paddingLeft": 4,
        "whiteSpace": "nowrap"
    },
    "chosen-container-single chosen-search input[type=\"text\"]": {
        "marginTop": 1,
        "marginRight": 0,
        "marginBottom": 1,
        "marginLeft": 0,
        "paddingTop": 4,
        "paddingRight": 20,
        "paddingBottom": 4,
        "paddingLeft": 5,
        "width": "100%",
        "height": "auto",
        "outline": 0,
        "border": "1px solid #aaa",
        "background": "url('../images/chosen-sprite.png') no-repeat 100% -20px",
        "fontSize": 1,
        "fontFamily": "sans-serif",
        "lineHeight": "normal",
        "borderRadius": 0
    },
    "chosen-container-single chosen-drop": {
        "marginTop": -1,
        "backgroundClip": "padding-box"
    },
    "chosen-container-singlechosen-container-single-nosearch chosen-search": {
        "position": "absolute",
        "left": -9999
    },
    "chosen-container chosen-results": {
        "color": "#444",
        "position": "relative",
        "overflowX": "hidden",
        "overflowY": "auto",
        "marginTop": 0,
        "marginRight": 4,
        "marginBottom": 4,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 4,
        "maxHeight": 180,
        "WebkitOverflowScrolling": "touch"
    },
    "chosen-container chosen-results li": {
        "display": "none",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 5,
        "paddingRight": 6,
        "paddingBottom": 5,
        "paddingLeft": 6,
        "listStyle": "none",
        "lineHeight": 15,
        "wordWrap": "break-word",
        "WebkitTouchCallout": "none"
    },
    "chosen-container chosen-results liactive-result": {
        "display": "list-item",
        "cursor": "pointer"
    },
    "chosen-container chosen-results lidisabled-result": {
        "display": "list-item",
        "color": "#ccc",
        "cursor": "default"
    },
    "chosen-container chosen-results lihighlighted": {
        "backgroundColor": "#3875d7",
        "backgroundImage": "linear-gradient(#3875d7 20%, #2a62bc 90%)",
        "color": "#fff"
    },
    "chosen-container chosen-results lino-results": {
        "color": "#777",
        "display": "list-item",
        "background": "#f4f4f4"
    },
    "chosen-container chosen-results ligroup-result": {
        "display": "list-item",
        "fontWeight": "bold",
        "cursor": "default"
    },
    "chosen-container chosen-results ligroup-option": {
        "paddingLeft": 15
    },
    "chosen-container chosen-results li em": {
        "fontStyle": "normal",
        "textDecoration": "underline"
    },
    "chosen-container-multi chosen-choices": {
        "position": "relative",
        "overflow": "hidden",
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 5,
        "paddingBottom": 0,
        "paddingLeft": 5,
        "width": "100%",
        "height": "1%",
        "border": "1px solid #aaa",
        "backgroundColor": "#fff",
        "backgroundImage": "linear-gradient(#eeeeee 1%, #ffffff 15%)",
        "cursor": "text"
    },
    "chosen-container-multi chosen-choices li": {
        "float": "left",
        "listStyle": "none"
    },
    "chosen-container-multi chosen-choices lisearch-field": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "whiteSpace": "nowrap"
    },
    "chosen-container-multi chosen-choices lisearch-field input[type=\"text\"]": {
        "marginTop": 1,
        "marginRight": 0,
        "marginBottom": 1,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0,
        "height": 25,
        "outline": 0,
        "border": "0 !important",
        "background": "transparent !important",
        "boxShadow": "none",
        "color": "#999",
        "fontSize": "100%",
        "fontFamily": "sans-serif",
        "lineHeight": "normal",
        "borderRadius": 0
    },
    "chosen-container-multi chosen-choices lisearch-choice": {
        "position": "relative",
        "marginTop": 3,
        "marginRight": 5,
        "marginBottom": 3,
        "marginLeft": 0,
        "paddingTop": 3,
        "paddingRight": 20,
        "paddingBottom": 3,
        "paddingLeft": 5,
        "border": "1px solid #aaa",
        "maxWidth": "100%",
        "backgroundColor": "#eeeeee",
        "backgroundImage": "linear-gradient(#f4f4f4 20%, #f0f0f0 50%, #e8e8e8 52%, #eeeeee 100%)",
        "backgroundSize": "100% 19px",
        "backgroundRepeat": "repeat-x",
        "backgroundClip": "padding-box",
        "boxShadow": "0 0 2px white inset, 0 1px 0 rgba(0, 0, 0, 0.05)",
        "color": "#333",
        "lineHeight": 13,
        "cursor": "default"
    },
    "chosen-container-multi chosen-choices lisearch-choice span": {
        "wordWrap": "break-word"
    },
    "chosen-container-multi chosen-choices lisearch-choice search-choice-close": {
        "position": "absolute",
        "top": 4,
        "right": 3,
        "display": "block",
        "width": 12,
        "height": 12,
        "background": "url('../images/chosen-sprite.png') -42px 1px no-repeat",
        "fontSize": 1
    },
    "chosen-container-multi chosen-choices lisearch-choice search-choice-close:hover": {
        "backgroundPosition": "-42px -10px"
    },
    "chosen-container-multi chosen-choices lisearch-choice-disabled": {
        "paddingRight": 5,
        "border": "1px solid #ccc",
        "backgroundColor": "#e4e4e4",
        "backgroundImage": "linear-gradient(top, #f4f4f4 20%, #f0f0f0 50%, #e8e8e8 52%, #eeeeee 100%)",
        "color": "#666"
    },
    "chosen-container-multi chosen-choices lisearch-choice-focus": {
        "background": "#d4d4d4"
    },
    "chosen-container-multi chosen-choices lisearch-choice-focus search-choice-close": {
        "backgroundPosition": "-42px -10px"
    },
    "chosen-container-multi chosen-results": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "paddingTop": 0,
        "paddingRight": 0,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "chosen-container-multi chosen-drop result-selected": {
        "display": "list-item",
        "color": "#ccc",
        "cursor": "default"
    },
    "chosen-container-active chosen-single": {
        "border": "1px solid #5897fb",
        "boxShadow": "0 0 5px rgba(0, 0, 0, 0.3)"
    },
    "chosen-container-activechosen-with-drop chosen-single": {
        "border": "1px solid #aaa",
        "MozBorderRadiusBottomright": 0,
        "borderBottomRightRadius": 0,
        "MozBorderRadiusBottomleft": 0,
        "borderBottomLeftRadius": 0,
        "backgroundImage": "linear-gradient(#eeeeee 20%, #ffffff 80%)",
        "boxShadow": "0 1px 0 #fff inset"
    },
    "chosen-container-activechosen-with-drop chosen-single div": {
        "borderLeft": "none",
        "background": "transparent"
    },
    "chosen-container-activechosen-with-drop chosen-single div b": {
        "backgroundPosition": "-18px 2px"
    },
    "chosen-container-active chosen-choices": {
        "border": "1px solid #5897fb",
        "boxShadow": "0 0 5px rgba(0, 0, 0, 0.3)"
    },
    "chosen-container-active chosen-choices lisearch-field input[type=\"text\"]": {
        "color": "#222 !important"
    },
    "chosen-disabled": {
        "opacity": "0.5 !important",
        "cursor": "default"
    },
    "chosen-disabled chosen-single": {
        "cursor": "default"
    },
    "chosen-disabled chosen-choices search-choice search-choice-close": {
        "cursor": "default"
    },
    "chosen-rtl": {
        "textAlign": "right"
    },
    "chosen-rtl chosen-single": {
        "overflow": "visible",
        "paddingTop": 0,
        "paddingRight": 8,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "chosen-rtl chosen-single span": {
        "marginRight": 0,
        "marginLeft": 26,
        "direction": "rtl"
    },
    "chosen-rtl chosen-single-with-deselect span": {
        "marginLeft": 38
    },
    "chosen-rtl chosen-single div": {
        "right": "auto",
        "left": 3
    },
    "chosen-rtl chosen-single abbr": {
        "right": "auto",
        "left": 26
    },
    "chosen-rtl chosen-choices li": {
        "float": "right"
    },
    "chosen-rtl chosen-choices lisearch-field input[type=\"text\"]": {
        "direction": "rtl"
    },
    "chosen-rtl chosen-choices lisearch-choice": {
        "marginTop": 3,
        "marginRight": 5,
        "marginBottom": 3,
        "marginLeft": 0,
        "paddingTop": 3,
        "paddingRight": 5,
        "paddingBottom": 3,
        "paddingLeft": 19
    },
    "chosen-rtl chosen-choices lisearch-choice search-choice-close": {
        "right": "auto",
        "left": 4
    },
    "chosen-rtlchosen-container-single-nosearch chosen-search": {
        "left": 9999
    },
    "chosen-rtl chosen-drop": {
        "left": 9999
    },
    "chosen-rtlchosen-container-single chosen-results": {
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 4,
        "marginLeft": 4,
        "paddingTop": 0,
        "paddingRight": 4,
        "paddingBottom": 0,
        "paddingLeft": 0
    },
    "chosen-rtl chosen-results ligroup-option": {
        "paddingRight": 15,
        "paddingLeft": 0
    },
    "chosen-rtlchosen-container-activechosen-with-drop chosen-single div": {
        "borderRight": "none"
    },
    "chosen-rtl chosen-search input[type=\"text\"]": {
        "paddingTop": 4,
        "paddingRight": 5,
        "paddingBottom": 4,
        "paddingLeft": 20,
        "background": "url('../images/chosen-sprite.png') no-repeat -30px -20px",
        "direction": "rtl"
    },
    "chosen-rtlchosen-container-single chosen-single div b": {
        "backgroundPosition": "6px 2px"
    },
    "chosen-rtlchosen-container-singlechosen-with-drop chosen-single div b": {
        "backgroundPosition": "-12px 2px"
    },
    "clearfix:after": {
        "clear": "both",
        "height": 0,
        "display": "block",
        "visibility": "hidden",
        "content": "."
    },
    "nav_settings": {
        "marginBottom": 5,
        "position": "relative",
        "top": -2
    },
    "nav_settings li": {
        "float": "left",
        "borderRight": "1px solid #e5e5e5"
    },
    "nav_settings li_last": {
        "borderRight": 0,
        "position": "relative"
    },
    "nav_settings li a": {
        "fontSize": 14,
        "display": "block",
        "textDecoration": "none",
        "paddingTop": 0,
        "paddingRight": 7,
        "paddingBottom": 0,
        "paddingLeft": 7,
        "height": 22,
        "lineHeight": 22,
        "borderBottom": 0,
        "color": "#545454",
        "outline": "none"
    },
    "nav_settings current": {
        "marginRight": 0
    },
    "nav_settings current > a": {
        "color": "#225683",
        "borderBottom": "2px solid #225683"
    },
    "settings_hr": {
        "height": 2,
        "background": "#e5e5e5",
        "position": "relative",
        "top": 22
    },
    "nav_wrap": {
        "position": "relative",
        "left": 0,
        "top": 0,
        "background": "#fff",
        "width": "100%",
        "zIndex": 10
    },
    "section-body-top": {
        "paddingTop": 30
    },
    "item_parent settings": {
        "display": "none"
    },
    "item_parent current_position": {
        "display": "block"
    },
    "item_parent none_position": {
        "position": "absolute",
        "left": -9999,
        "top": -9999,
        "display": "block"
    },
    "li_last ui-icon": {
        "width": 16,
        "height": 16,
        "display": "inline-block",
        "position": "absolute",
        "right": -10,
        "top": 3,
        "backgroundImage": "url(../stylesheet/ui-lightness/images/ui-icons_222222_256x240.png)"
    },
    "li_last:hover > a": {
        "color": "#225683"
    },
    "li_last:hover ui-icon": {
        "backgroundImage": "url(../stylesheet/redmond/images/ui-icons_217bc0_256x240.png)"
    },
    "li_last:focus ui-icon": {
        "backgroundImage": "url(../stylesheet/redmond/images/ui-icons_217bc0_256x240.png)"
    },
    "li_last ui-icon-triangle-1-s": {
        "backgroundPosition": "-64px -16px"
    },
    "li_last dropdown-menu": {
        "position": "absolute",
        "top": 21,
        "left": -1,
        "zIndex": 1000,
        "display": "none",
        "float": "left",
        "width": "100%",
        "minWidth": 100,
        "paddingTop": 5,
        "paddingRight": 0,
        "paddingBottom": 5,
        "paddingLeft": 0,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0,
        "fontSize": 14,
        "textAlign": "center",
        "listStyle": "none",
        "backgroundColor": "#fff",
        "WebkitBackgroundClip": "padding-box",
        "backgroundClip": "padding-box",
        "border": "1px solid rgba(0,0,0,.15)",
        "WebkitBoxShadow": "0 6px 12px rgba(0,0,0,.175)",
        "boxShadow": "0 6px 12px rgba(0,0,0,.175)"
    },
    "li_last dropdown-menu a": {
        "display": "block",
        "paddingTop": 3,
        "paddingRight": 20,
        "paddingBottom": 3,
        "paddingLeft": 20,
        "clear": "both",
        "fontWeight": "400",
        "lineHeight": 1.42857143,
        "color": "#333",
        "whiteSpace": "nowrap",
        "textDecoration": "none",
        "backgroundColor": "transparent"
    },
    "li_last dropdown-menu > li": {
        "float": "none",
        "borderRight": "0 none"
    },
    "li_last dropdown-menu divider": {
        "height": 1,
        "marginTop": 5,
        "marginRight": 0,
        "marginBottom": 5,
        "marginLeft": 0,
        "overflow": "hidden",
        "backgroundColor": "#e5e5e5"
    },
    "li_last dropdown-menu > liselected > a": {
        "color": "#fff",
        "textDecoration": "none",
        "backgroundColor": "#337ab7",
        "outline": 0
    },
    "li_last dropdown-menu > liselected > a:focus": {
        "color": "#fff",
        "textDecoration": "none",
        "backgroundColor": "#337ab7",
        "outline": 0
    },
    "li_last dropdown-menu > liselected > a:hover": {
        "color": "#fff",
        "textDecoration": "none",
        "backgroundColor": "#337ab7",
        "outline": 0
    },
    "li_last dropdown-menu > li > a:focus": {
        "color": "#262626",
        "textDecoration": "none",
        "backgroundColor": "#f5f5f5"
    },
    "li_last dropdown-menu > li > a:hover": {
        "color": "#262626",
        "textDecoration": "none",
        "backgroundColor": "#f5f5f5"
    },
    "li_last:hover dropdown-menu": {
        "display": "block"
    },
    "li_last:focus dropdown-menu": {
        "display": "block"
    }
});
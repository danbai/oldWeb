/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

$(function() {

    var $P = top.$,
        topDoc = top.document,
        doc = document,
        UCMGUI = top.UCMGUI,
        config = UCMGUI.config;

    String.prototype.format = top.String.prototype.format;

    $P.lang(doc, true);
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG692"));

    top.Custom.init(doc);

    $('body').show();
});
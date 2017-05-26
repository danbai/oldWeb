var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    oWebrtcInputConf = mWindow.oWebrtcInputConf,
    cbVideoDisable = $("#cbVideoDisable")[0],
    cbRTCWebBreaker = $("#cbRTCWebBreaker")[0],
    //txtWebsocketServerUrl = $("#txtWebsocketServerUrl")[0],
    txtSIPOutboundProxyUrl = $("#txtSIPOutboundProxyUrl")[0],
    txtStunServer = $("#txtStunServer")[0],
    txtTurnServerUri = $("#txtTurnServerUri")[0],
    txtTurnServerUsr = $("#txtTurnServerUsr")[0],
    txtTurnServerPws = $("#txtTurnServerPws")[0];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, '');

    //txtWebsocketServerUrl.disabled = !window.WebSocket || navigator.appName == "Microsoft Internet Explorer"; // Do not use WS on IE
    //$("#btnSave")[0].disabled = !window.localStorage;
    //$("#btnRevert")[0].disabled = !window.localStorage;

    settingsRevert(true);

    initValidator();
    top.Custom.init(doc);
});

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "txtSIPOutboundProxyUrl": {
                host: ['IP or URL']
            },
            "txtStunServer": {
                host: ['IP or URL']
            },
            "txtTurnServerUri": {
                host: ['IP or URL']
            },
            "txtTurnServerPws": {
                keyboradNoSpacesemicolon: true
            }
        },
        submitHandler: function() {
            settingsSave();
        }
    });
}

function settingsSave() {
    var txtIceServersVal = [];
    var txtStunServerVal = $("#txtStunServer").val();
    var txtTurnServerUriVal = $("#txtTurnServerUri").val();
    var txtTurnServerUsrVal = $("#txtTurnServerUsr").val();
    var txtTurnServerPwsVal = $("#txtTurnServerPws").val();

    if (txtStunServerVal) {
        txtIceServersVal.push({
            url: "stun:" + txtStunServerVal
        });
    } else if (config.mozilla) {
        txtIceServersVal = [{ url: 'stun:23.21.150.121:3478'}, { url: 'stun:216.93.246.18:3478'}, { url: 'stun:66.228.45.110:3478'}, { url: 'stun:173.194.78.127:19302'}];
    }

    if (txtTurnServerUriVal && txtTurnServerUsrVal && txtTurnServerPwsVal) {
        var turnServer = {
            url: "turn:" + txtTurnServerUsrVal + "@" + txtTurnServerUriVal,
            credential: txtTurnServerPwsVal
        }

        if (config.mozilla) {
            turnServer = {
                url: "turn:" + txtTurnServerUriVal,
                username: txtTurnServerUsrVal,
                credential: txtTurnServerPwsVal
            }
        }
        txtIceServersVal.push(turnServer);
    }

    if (txtIceServersVal.length != 0) {
        txtIceServersVal = JSON.stringify(txtIceServersVal);
    }
    else{
        txtIceServersVal = "";
    }
    /*window.localStorage.setItem('org.doubango.expert.disable_video', cbVideoDisable.checked ? "true" : "false");
    window.localStorage.setItem('org.doubango.expert.enable_rtcweb_breaker', cbRTCWebBreaker.checked ? "true" : "false");
    //if (!txtWebsocketServerUrl.disabled) {
        //window.localStorage.setItem('org.doubango.expert.websocket_server_url', txtWebsocketServerUrl.value);
    //}
    window.localStorage.setItem('org.doubango.expert.sip_outboundproxy_url', txtSIPOutboundProxyUrl.value);
    window.localStorage.setItem('org.doubango.expert.ice_servers', txtIceServersVal);
    window.localStorage.setItem('org.doubango.expert.txtStunServer', txtStunServer.value);
    window.localStorage.setItem('org.doubango.expert.txtTurnServerUri', txtTurnServerUri.value);
    window.localStorage.setItem('org.doubango.expert.txtTurnServerUsr', txtTurnServerUsr.value);
    window.localStorage.setItem('org.doubango.expert.txtTurnServerPws', txtTurnServerPws.value);
    window.localStorage.setItem('org.doubango.expert.bandwidth', txtBandwidth.value);
    window.localStorage.setItem('org.doubango.expert.video_size', txtSizeVideo.value);
    window.localStorage.setItem('org.doubango.expert.disable_early_ims', cbEarlyIMS.checked ? "true" : "false");
    window.localStorage.setItem('org.doubango.expert.disable_debug', cbDebugMessages.checked ? "true" : "false");
    window.localStorage.setItem('org.doubango.expert.enable_media_caching', cbCacheMediaStream.checked ? "true" : "false");
    //window.localStorage.setItem('org.doubango.expert.disable_callbtn_options', cbCallButtonOptions.checked ? "true" : "false");
    top.dialog.clearDialog();
    top.dialog.dialogMessage({
        type: 'success',
        content: $P.lang("LANG844")
    });*/
    var action = {
        'action': 'updateWebRTCUserLogins',
        'user_name': mWindow.ucm_user_name,
        'disable_video': $('#cbVideoDisable')[0].checked ? 'yes' : 'no',
        'enable_webrtc_breaker': $('#cbRTCWebBreaker')[0].checked ? 'yes' : 'no',
        'sip_outbound_proxy_url': $('#txtSIPOutboundProxyUrl').val(),
        'stun_server_addr': $('#txtStunServer').val(),
        'turn_server_addr': $('#txtTurnServerUri').val(),
        'turn_server_user_name': $('#txtTurnServerUsr').val(),
        'turn_server_password': $('#txtTurnServerPws').val(),
        'max_bandwidth': $('#txtBandwidth').val(),
        'video_size': $('#txtSizeVideo').val(),
        'disable_3gpp_early_ims': $('#cbEarlyIMS')[0].checked ? 'yes' : 'no',
        'disable_debug_messages': $('#cbDebugMessages')[0].checked ? 'yes' : 'no',
        'cache_media_stream': $('#cbCacheMediaStream')[0].checked ? 'yes' : 'no',
        'ice_service': JSON.stringify(txtIceServersVal)
    };
    var sip_outbound_proxy_url = action["sip_outbound_proxy_url"];
    if (UCMGUI.isIPv6NoPort(sip_outbound_proxy_url)) {
        action["sip_outbound_proxy_url"] = "[" + sip_outbound_proxy_url + "]";
    }
    var stun_server_addr = action["stun_server_addr"];
    if (UCMGUI.isIPv6NoPort(stun_server_addr)) {
        action["stun_server_addr"] = "[" + stun_server_addr + "]";
    }
    var turn_server_addr = action["turn_server_addr"];
    if (UCMGUI.isIPv6NoPort(turn_server_addr)) {
        action["turn_server_addr"] = "[" + turn_server_addr + "]";
    }
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                $.ajax({
                    url: '../cgi?action=getWebRTCUserLogins&user_name=' + mWindow.ucm_user_name,
                    type: 'GET',
                    dataType: 'json',
                    error: function(jqXHR, textStatus, errorThrown) {},
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            mWindow.oWebrtcInputConf = oWebrtcInputConf = data.response.user_name;
                        }
                    }
                });

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4426")
                });
            }
        }
    });
}

function settingsRevert(bNotUserAction) {
    cbVideoDisable.checked = (oWebrtcInputConf.disable_video === 'yes');
    cbRTCWebBreaker.checked = (oWebrtcInputConf.enable_webrtc_breaker === 'yes');
    //txtWebsocketServerUrl.value = (window.localStorage.getItem('org.doubango.expert.websocket_server_url') || "");
    txtSIPOutboundProxyUrl.value = (oWebrtcInputConf.sip_outbound_proxy_url || "");
    txtStunServer.value = (oWebrtcInputConf.stun_server_addr || "");
    txtTurnServerUri.value = (oWebrtcInputConf.turn_server_addr || "");
    txtTurnServerUsr.value = (oWebrtcInputConf.turn_server_user_name || "");
    txtTurnServerPws.value = (oWebrtcInputConf.turn_server_password || "");
    //txtIceServers.value = (window.localStorage.getItem('org.doubango.expert.ice_servers') || "");
    txtBandwidth.value = (oWebrtcInputConf.max_bandwidth || "");
    txtSizeVideo.value = (oWebrtcInputConf.video_size || "");
    cbEarlyIMS.checked = (oWebrtcInputConf.disable_3gpp_early_ims === 'yes');
    cbDebugMessages.checked = (oWebrtcInputConf.disable_debug_messages === 'yes');
    cbCacheMediaStream.checked = (oWebrtcInputConf.cache_media_stream === 'yes');
    //cbCallButtonOptions.checked = (window.localStorage.getItem('org.doubango.expert.disable_callbtn_options') == "true");
}
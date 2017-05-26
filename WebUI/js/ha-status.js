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
    baseServerURl = config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4359"));

    getHaStatus();
    ReadRearrangeLog();
    ReadBackLog();
    $("#clean_rearrange").on('click', function() {
        clean_rearrange();
    });
    $("#clean_backup").on('click', function() {
        clean_backup();
    });

});

function getHaStatus() {
    $.ajax({
        url: "../cgi?action=getHaStatus",
        type: "GET",
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data),
                data = data.response,
                haOL = '',
                bkp4web = '',
                haERR = '',
                mac = data.mac;

            if (bool) {
                switch (data.haOL) {
                    case '0':
                       haOL = '单机状态'
                       break;
                    case '1':
                       haOL = '双机状态'
                       break;
                }

                switch (data.bkp4web) {
                    case '1':
                       bkp4web = '未备份'
                       break;
                    case '2':
                       bkp4web = '主UCM正在备份'
                       break;
                    case '3':
                       bkp4web = '备UCM正在还原'
                       break;
                    case '4':
                       bkp4web = '空闲'
                       break;
                    case '5':
                       bkp4web = '正在进行文件同步'
                       break;
                }

                switch (data.haERR) {
                    case '0':
                       haERR = ''
                       break;
                    case '1':
                       haERR = '版本比较失败'
                       break;
                    case '2':
                       haERR = '对端不在线'
                       break;
                }

                $('#haOL').text(haOL);
                $('#bkpSt').text(bkp4web);
                $('#haERR').text(haERR);
                $('#mac').text(mac);
            }
        }
    });
}

function ReadRearrangeLog() {
    $.ajax({
        type: "GET",
        url: "./userdefined/ha_rearrange_results",
        dataType: "text",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            if (jqXHR.status != 404) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });
            }
        },
        success: function(data) {
            $("#rearrange_log")[0].innerHTML = '';

            var arr = data.split("\n").reverse();

            for (var i = 0; i < arr.length; i++) {
                if (arr[i] != "") {
                    $("div#rearrange_log").append($("<div />").html(arr[i])); 
                }
            }
        }
    });
}

function ReadBackLog() {
    $.ajax({
        type: "GET",
        url: "./userdefined/ha_backup_results",
        dataType: "text",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            if (jqXHR.status != 404) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });
            }
        },
        success: function(data) {
            $("#backup_log")[0].innerHTML = '';

            var arr = data.split("\n").reverse();

            for (var i = 0; i < arr.length; i++) {
                if (arr[i] != "") {
                    $("div#backup_log").append($("<div />").html(arr[i])); 
                }
            }
        }
    });
}

function clean_backup() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG3902"),
        buttons: {
            ok: function() {
                $.ajax({
                    type: "GET",
                    url: "../cgi?action=reloadHABackupLog&backuplog=",
                    dataType: "json",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {

                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG3903"),
                                callback: function() {
                                    ReadBackLog();
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

function clean_rearrange() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG3902"),
        buttons: {
            ok: function() {
                $.ajax({
                    type: "GET",
                    url: "../cgi?action=reloadRearrangeLog&rearrangelog=",
                    dataType: "json",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {

                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG3903"),
                                callback: function() {
                                    ReadRearrangeLog();
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

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
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    filter = mWindow.$("#filter", mWindow.document),
    deviceList = mWindow.$("#zc_devices_list", mWindow.document),
    zeroConfigSettings = mWindow.zeroConfigSettings,
    MODE = "",
    IP = "",
    Interface,
    checkInterval,
    rangeFromArray = new Array(4),
    rangeToArray = new Array(4);

var zeroconfigErr = {
    "1": "LANG918",
    "2": "LANG919",
    "3": "LANG920",
    "4": "LANG2538",
    "5": "LANG4389"
};

String.prototype.lChop = top.String.prototype.lChop;

$(function() {
    $P.lang(doc, true);

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "ip2": {
              required: true,
              digits: true
            },
            "ip3": {
                required: true,
                digits: true
            },
            "ip4": {
                required: true,
                digits: true
              }
        },
        submitHandler: function() {
            save_changes();
        }
    });

    $.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: "/cgi?action=getNetworkInformation",
        error: function() {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG909")
            });
        },
        success: function(data) {
            data = eval(data);

            MODE = data.response;

            if (data.status == 0) {
                var LIST = ["wan", "lan", "lan1", "lan2"],
                    i;

                for (i = 3; i >= 0; i--) {
                    var mode = data.response[LIST[i]];
                    // ZeroConfig AutoDiscover only available for lan/lan1
                    if (mode && mode.ip && mode.mask && LIST[i] != 'wan'&& LIST[i] != 'lan2') {
                        Interface = LIST[i];

                        IP = mode.ip;

                        $('#ip1')[0].value = IP.split('.')[0];
                        $('#ip2')[0].value = IP.split('.')[1];
                        $('#ip3')[0].value = IP.split('.')[2];
                        $('#ip4')[0].value = "";
                        process_net_range( IP, mode.mask );

                    } else {
                        $("[name=capture]").children().eq(i).remove();
                    }
                }

                if ($("[name=capture]").children().length < 2) {
                    $("#interface").hide();
                } else {
                    $("#interface").show();
                }

                return false;
            }
        }
    });

    top.Custom.init(doc);
});

function IntervalForSingleIP() {
    var username = $P.cookie('username');

    if (username) {
        $.ajax({
            type: "post",
            url: "../cgi",
            data: {
                action: 'checkInfo',
                user: username
            },
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.status == 0) {
                    var zcScanProgress = data.response.zc_scan_progress;

                    if (zcScanProgress === '0') {
                        clearInterval(checkInterval);

                        checkInterval = null;

                        UCMGUI.config.zcScanProgress = zcScanProgress;

                        top.dialog.clearDialog();

                        top.dialog.dialogConfirm({
                            confirmStr: $P.lang("LANG917"),
                            buttons: {
                                ok: function() {
                                    filter.val('res');

                                    deviceList
                                        .setGridParam({
                                            postData: {
                                                "filter": 'res'
                                            },
                                            page: 1
                                        })
                                        .trigger('reloadGrid');

                                    top.Custom.init(mWindow.document);
                                }
                            }
                        });
                    }
                } else {
                    UCMGUI.config.zcScanProgress = zcScanProgress;
                }
            }
        });
    }
}

function scan_cgi(buf) {
    $.ajax({
        type: "GET",
        url: "/cgi",
        data: buf,
        error: function() {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG909")
            });
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == '0') {
                var res = data.response.scanDevices;

                if (res == "Scanning Device") {
                    if (isBroadcastIp()) {
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG3768")
                        });

                        UCMGUI.config.zcScanProgress = '1';
                    } else {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            title: $P.lang("LANG3769"),
                            content: $P.lang("LANG905")
                        });

                        // check whether single ip scanning has done per second.
                        checkInterval = setInterval(function() {
                            IntervalForSingleIP();
                        }, 1000);
                    }
                } else {
                    var num = res.slice("ZCERROR_".length);

                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang(zeroconfigErr[num])
                    });
                }
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });
            }
        }
    });
}


function save_changes() {
    var username = $P.cookie('username');

    var buf = "action=scanDevices&username=" + username + "&method=" + $('#method')[0].value + "&ip=";

    buf += $('#ip1')[0].value + "." +
        $('#ip2')[0].value + "." +
        $('#ip3')[0].value + "." +
        $('#ip4')[0].value +
        "&interface=" + (Interface == 'lan2' ? 2 : 1);
    if (isBroadcastIp()) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG2221"),
            buttons: {
                ok: function() {
                    scan_cgi(buf);
                },
                cancel: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            }
        });
    } else {
        scan_cgi(buf);
    }
}

function process_net_range ( ipStr, maskStr ) {

    var ipArray = ipStr.split(".");
    var netMaskArray = maskStr.split(".");

    if ( ipArray.length != 4 || netMaskArray.length != 4 ) {
        return;
    }

    for ( var i = 0; i < 4; i++ ) {
        var ip_octet = Number( ipArray[i] );
        var mask_octet = Number( netMaskArray[i] );
        var re_cidr = 8 - calculateCIDR(mask_octet);
        var tmp = i + 1;
        var ip_el = '#ip'+ tmp;

        if ( mask_octet != 255 ) {
            $(ip_el)[0].disabled = false;
        }
        rangeFromArray[i] = ip_octet & mask_octet;
        rangeToArray[i] = ( ip_octet >> re_cidr ) + Math.pow( 2, re_cidr ) -1;
        $P(ip_el, doc).rules( "add", {
          range: [rangeFromArray[i], rangeToArray[i]]
        });

        if ( i == 3 ) {
          $P(ip_el, doc).rules( "add", {
              customCallback: [$P.lang("LANG4822"),
                  function() {
                      return isNotFirstInNet();
                  }
              ],
              customCallback1: [$P.lang("LANG4823"),
                  function() {
                      return isNotUCMIP();
                  }
              ]
          });
        }
    }

    var network_info = new Object();
    network_info.ucm_ip = ipStr;
    network_info.network_segment = rangeFromArray.join(".") + " - " + rangeToArray.join(".");
    network_info.broadcast_ip = rangeToArray.join(".");
    UCMGUI.domFunction.updateDocument(network_info, doc);
}

function calculateCIDR ( mask ) {
  var count = 0;
  var cidr = 0;

  if ( mask == 0 ) {
    return cidr;
  }
  while ( !(mask & 0x1) ) {
      mask = mask >> 1;
      count++;
  }
  if ( count < 8 )
  cidr = 8 - count;
  return cidr;
}

function isNotFirstInNet () {
  for ( var i = 1; i < 5; i++ ) {
      var ip = $('#ip'+ i)[0].value;
      var ip_min = rangeFromArray[i-1];
      if ( ip > ip_min ) {
          return true;
      }
  }
  return false;
}

function isNotUCMIP () {
  for ( var i = 1; i < 5; i++ ) {
      var ip = $('#ip'+ i)[0].value;
      var ip_ucm = IP.split('.')[i-1];
      if ( ip != ip_ucm ) {
          return true;
      }
  }
  return false;
}

function isBroadcastIp () {
  for ( var i = 1; i < 5; i++ ) {
      var ip = $('#ip'+ i)[0].value;
      var ip_max = rangeToArray[i-1];
      if ( ip < ip_max ) {
          return false;
      }
  }
  return true;
}

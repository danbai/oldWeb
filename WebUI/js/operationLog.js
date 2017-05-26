/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    selectbox = UCMGUI.domFunction.selectbox,
    operActionData = {},
    detailNum = 0,
    detailObj = {}

String.prototype.format = top.String.prototype.format

$(function() {
    $P.lang(document, true)

    top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3908"))

    getUserLists()

    getOptions2Lang()

    createTable()

    initValidator()

    bindEvent()
})

function checkTime(val, ele) {
    if (val === '' || val.match(/^\d{4}\-\d{2}\-\d{2}\s\d{2}:\d{2}$/)) {
        return true
    }

    return false
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip()
    }

    $P("#form", doc).validate({
        rules: {
            "fromDate": {
                customCallback: [$P.lang("LANG2767"), checkTime],
                smallerTime: [$P.lang("LANG1048"), $P.lang("LANG1049"), $('#toDate')]
            },
            "toDate": {
                customCallback: [$P.lang("LANG2767"), checkTime]
                // biggerTime: [$P.lang("LANG1049"), $P.lang("LANG1048"), $('#fromDate')]
            },
            "operLogIP": {
                ipAddress: true
            }
        },
        newValidator: true,
        submitHandler: function() {
            var fromDateVal = $("#fromDate").val(),
                toDateVal = $("#toDate").val(),
                operLogIPVal = $("#operLogIP").val(),
                operLogUsrVal = $("#operLogUsr").val(),
                postData = {
                    "action": "listOperationLog",
                    "options": "date,user_name,ipaddress,result,action,operation,detailed_log"
                }
            var txt = $P.lang("LANG3773")

            top.dialog.dialogMessage({
                type: "loading",
                title: txt,
                content: txt
            })

            operActionData = {
                "start_date": fromDateVal,
                "end_date": toDateVal,
                "ipaddress": operLogIPVal,
                "user_name": operLogUsrVal
            }

            $.extend(postData, operActionData)

            setTimeout(function() {
                $('#operationLog')
                    .setGridParam({
                        postData: postData,
                        page: 1
                    })
                    .trigger('reloadGrid')
            }, 200)
        }
    })
}

function getOptions2Lang() {
    if (!top.options2Lang) {
        $.ajax({
            type: "GET",
            url: "../locale/locale.params.json",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                top.options2Lang = JSON.parse(data)
            }
        })
    }
}

function createTable(name, val) {
    $("#operationLog").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: (doc.documentElement.clientWidth - 50),
        height: "auto",
        postData: {
            "action": "listOperationLog",
            "options": "date,user_name,ipaddress,result,action,operation,detailed_log"
        },
        colNames: [
            '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
            '<span locale="LANG2809">' + $P.lang('LANG2809') + '</span>',
            '<span locale="LANG155">' + $P.lang('LANG155') + '</span>',
            '<span locale="LANG3909">' + $P.lang('LANG3909') + '</span>',
            '<span locale="LANG3922">' + $P.lang('LANG3922') + '</span>',
            '<span locale="LANG3927">' + $P.lang('LANG3927') + '</span>'
        ],
        colModel: [{
            name: 'date',
            index: 'date',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'user_name',
            index: 'user_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'ipaddress',
            index: 'ipaddress',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'result',
            index: 'result',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transResults
        }, {
            name: 'action',
            index: 'action',
            width: 300,
            resizable: false,
            align: "center",
            formatter: transAction
        }, {
            name: 'operation',
            index: 'operation',
            width: 300,
            resizable: false,
            align: "center",
            formatter: transOperation
        }],
        loadui: 'disable',
        pager: "#operationLogPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'date',
        sortorder: 'desc',
        noData: "LANG129 LANG3908",
        jsonReader: {
            root: "response.operation",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#operationLog .jqgrow:even").addClass("ui-row-even")
        },
        gridComplete: function() {
            $P.lang(doc, true)

            top.Custom.init(doc)

            top.dialog.clearDialog()
        }
    })
}

function getUserLists() {
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": "listUser",
            "options": "user_name"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data)

            if (bool) {
                var userLists = data.response.user_id,
                    arr = []

                arr.push({
                    val: "",
                    text: $P.lang("LANG3921"),
                    locale: "LANG3921"
                })

                for (var i = 0; i < userLists.length; i++) {
                    var obj = {}

                    obj["val"] = userLists[i].user_name

                    arr.push(obj)
                }

                selectbox.appendOpts({
                    el: "operLogUsr",
                    opts: arr
                }, doc)
            }
        }
    })
}

function deleteOperationLog(ev) {
    if (ev.target.id == "DelSearchOperLog") {
        var nTotal = $("#operationLog").getGridParam("records"),
            sConfirm = "LANG4072"

        if (nTotal == 0) {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG129").format($P.lang("LANG3908"))
            })

            return false
        }
    } else {
        var sConfirm = "LANG840"

        operActionData = {
            "start_date": "",
            "end_date": "",
            "ipaddress": "",
            "user_name": ""
        }
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang(sConfirm),
        buttons: {
            ok: function() {
                var fromDateVal = $("#fromDate").val(),
                    toDateVal = $("#toDate").val(),
                    operLogIPVal = $("#operLogIP").val(),
                    operLogUsrVal = $("#operLogUsr").val(),
                    action = {
                        action: "deleteOperationLog"
                    }

                $.extend(action, operActionData)

                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: "../cgi?",
                    data: action,
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.clearDialog()

                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data)

                        if (bool) {
                            var table = $("#operationLog"),
                                totalPage = table.getGridParam("lastpage"),
                                page = table.getGridParam("page"),
                                reccount = table.getGridParam("reccount")

                            if (page === totalPage && totalPage > 1 && reccount === 1) {
                                table.setGridParam({
                                    page: totalPage - 1
                                }).trigger('reloadGrid')
                            } else {
                                table.trigger('reloadGrid')
                            }
                        }
                    }
                })
            },
            cancel: function() {
                top.dialog.clearDialog()
            }
        }
    })
}

function bindEvent() {
    $("#fromDate").datetimepicker({
        showOn: "button",
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm'
    })

    $("#toDate").datetimepicker({
        showOn: "button",
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm'
    })

    $('.top_buttons')
        .delegate('#DelSearchOperLog, #btnDelAll', 'click', function(ev) {
            deleteOperationLog(ev)

            ev.stopPropagation()
            return false
        })
        .delegate('#allOperLog', 'click', function(ev) {
            var postData = {
                "action": "listOperationLog",
                "options": "date,user_name,ipaddress,result,action,operation,detailed_log"
            }
            var txt = $P.lang("LANG3773")

            top.dialog.dialogMessage({
                type: "loading",
                title: txt,
                content: txt
            })

            $('#fromDate, #toDate, #operLogIP, #operLogUsr').val('')

            operActionData = {
                "start_date": '',
                "end_date": '',
                "ipaddress": '',
                "user_name": ''
            }

            $.extend(postData, operActionData)

            setTimeout(function() {
                $('#operationLog')
                    .setGridParam({
                        postData: postData,
                        page: 1
                    })
                    .trigger('reloadGrid')
            }, 200)

            ev.stopPropagation()
            return false
        })

    $("#operationLog")
        .delegate('.detail', 'click', function(ev) {
            var id = $(this).attr('id')

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3926"),
                displayPos: "editForm",
                frameSrc: "html/operationLog_modal.html?detailNum=" + id
            })

            ev.stopPropagation()
            return false
        })
        .delegate('.jumpPage', 'click', function(ev) {
            var jumpPage = $(this).attr('jumpPage')

            top.frames['frameContainer'].module.jumpMenu(jumpPage + ".html")

            ev.stopPropagation()
            return false
        })
        .delegate('.more', 'click', function(ev) {
            $(this).next().show()
                .end().remove()

            ev.stopPropagation()
            return false
        })
}

function transResults(cellvalue, options, rowObject) {
    var erroeCodes = config.errorCodes,
        val = erroeCodes[cellvalue]

    if (!val) {
        val = "LANG3910" // Operate Successfully 
    }

    return "<span locale='" + val + "'>" + $P.lang(val) + "</span>"
}

function transAction(cellvalue, options, rowObject) {
    var _location = rowObject.operation._location,
        options2Lang = top.options2Lang,
        locationObj = options2Lang[_location],
        page = ""

    if (options2Lang && locationObj) {
        var lang = locationObj["_LOCATION"]

        if (lang && _location != "operationLog") {
            page = "<span class='jumpPage' localeTitle='LANG3984' title='" + $P.lang('LANG3984') + "' jumpPage='" + _location + "' locale='" + lang + "'>" + $P.lang(lang) + "</span>" + ": "
        } else {
            page = "<span locale='" + lang + "'>" + $P.lang(lang) + "</span>" + ": "
        }
    }

    if (locationObj && locationObj[cellvalue]) {
        var sVal = locationObj[cellvalue]

        if (sVal.match(/\sLANG\d+$/)) {
            var aTranLang = sVal.split(' ')

            cellvalue = '<span locale="' + sVal + '">' + $P.lang(aTranLang[0]).format($P.lang(aTranLang[1])) + '</span>'
        } else {
            cellvalue = "<span locale='" + locationObj[cellvalue] + "'>" + $P.lang(locationObj[cellvalue]) + "</span>"
        }
    } else if (options2Lang && options2Lang[cellvalue]) {
        var _LOCATION = options2Lang[cellvalue]["_LOCATION"]

        if (_LOCATION) {
            cellvalue = "<span locale='" + _LOCATION + "'>" + $P.lang(_LOCATION) + "</span>"
        } else {
            cellvalue = "<span locale='" + options2Lang[cellvalue] + "'>" + $P.lang(options2Lang[cellvalue]) + "</span>"
        }
    }

    return page + cellvalue
}

function transOperation(cellvalue, options, rowObject) {
    var optStr = "",
        _location = rowObject.operation._location,
        action = rowObject.action,
        options2Lang = top.options2Lang,
        locationObj = options2Lang[_location],
        detailedLog = rowObject.detailed_log

    if (detailedLog) {
        if ($P.Object.count.call(cellvalue) > 1) {
            var obj = getOptStr({
                data: cellvalue,
                options2Lang: options2Lang,
                locationObj: locationObj,
                action: action
            })

            optStr += obj.data
        } else {
            var count = 0,
                maxLen = 3,
                obj = getOptStr({
                    data: cellvalue,
                    options2Lang: options2Lang,
                    locationObj: locationObj,
                    action: action,
                    count: count,
                    maxLen: maxLen
                })

            optStr += obj.data
        }

        var id = "detail" + detailNum

        optStr += "<button type='button' id='" + id + "' class='options detail' localeTitle='LANG3923' title='" + $P.lang('LANG3923') + "'></button>"

        rowObject.detailed_log["action"] = action

        detailObj[id] = rowObject.detailed_log

        detailNum++
    } else {
        var count = 0,
            maxLen = 3,
            obj = getOptStr({
                data: cellvalue,
                options2Lang: options2Lang,
                locationObj: locationObj,
                action: action,
                count: count,
                maxLen: maxLen
            })

        optStr += obj.data
        count = obj.count

        if (count > maxLen) {
            var id = "detail" + detailNum

            optStr += "<button type='button' id='" + id + "' class='options detail' localeTitle='LANG3923' title='" + $P.lang('LANG3923') + "'></button>"

            // rowObject.detailed_log["action"] = action;
            detailObj[id] = cellvalue

            detailNum++
        } else {
            if (action === "updateCountryCodes") {
                optStr = '<div>' + optStr.substr(0, 40) + '<span class="more" localeTitle="LANG4719">...</span><span class="more-content">' + optStr.substr(40) + '</span>' + '</div>'
            }
        }
    }

    if (/;\s+$/.test(optStr)) {
        optStr = optStr.replace(/;\s+$/, ".")
    }

    return optStr
}

function getOptStr(obj) {
    var optStr = "",
        data = obj.data,
        options2Lang = obj.options2Lang,
        locationObj = obj.locationObj,
        action = obj.action,
        count = obj.count,
        maxLen = obj.maxLen

    for (var prop in data) {
        if (data.hasOwnProperty(prop) && prop != "action" && prop != "_location" && prop != "_") {
            var param = prop,
                options2LangAction = options2Lang[action]

            if (count && maxLen) {
                if (count > maxLen) {
                    break
                }

                count++
            }

            if (locationObj && locationObj[prop]) {
                param = "<span locale='" + locationObj[prop] + "'>" + $P.lang(locationObj[prop]) + "</span>"
            }

            if (options2LangAction && options2LangAction[prop]) {
                param = "<span locale='" + options2LangAction[prop] + "'>" + $P.lang(options2LangAction[prop]) + "</span>"
            }

            optStr += param + ": " + (data[prop] ? data[prop] : "") + ";  "
        }
    }

    return {
        data: optStr,
        count: count
    }
}
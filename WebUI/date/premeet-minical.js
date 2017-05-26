var minical = new minicalendar({
    onchange: datechange
});

minical.init("#minical");

var op = {
    view: "week",
    theme: 1,
    autoload: true,
    showday: new Date(),
    EditCmdhandler: edit,
    DeleteCmdhandler: dcal,
    ViewCmdhandler: view,
    onWeekOrMonthToDay: wtd,
    url: "../cgi?action=listMeetmeCalendar"
};

var _MH = document.documentElement.clientHeight;
op.height = _MH - 90;
op.eventItems = [];

var p = $("#xgcalendarp").bcalendar(op).BcalGetOp();

if (p && p.datestrshow) {
    $("#dateshow").text(p.datestrshow);
}

$("#daybtn").click(function() {
    switchview.call(this, "day");
});

$("#weekbtn").click(function() {
    switchview.call(this, "week");
});

$("#monthbtn").click(function() {
    switchview.call(this, "month");
});

$("#prevbtn").click(function() {
    var p = $("#xgcalendarp").BCalPrev().BcalGetOp();
    if (p && p.datestrshow) {
        $("#dateshow").text(p.datestrshow);
    }
});

$("#nextbtn").click(function() {
    var p = $("#xgcalendarp").BCalNext().BcalGetOp();
    if (p && p.datestrshow) {
        $("#dateshow").text(p.datestrshow);
    }
});

$("#todaybtn").click(function(e) {
    var p = $("#xgcalendarp").BCalGoToday().BcalGetOp();
    if (p && p.datestrshow) {
        $("#dateshow").text(p.datestrshow);
    }
});

function switchview(view) {
    $("#viewswithbtn button.current").each(function() {
        $(this).removeClass("current");
    })
    $(this).addClass("current");
    var p = $("#xgcalendarp").BCalSwtichview(view).BcalGetOp();
    if (p && p.datestrshow) {
        $("#dateshow").text(p.datestrshow);
    }
}

function datechange(r, ifMinical) {
    var p = $("#xgcalendarp").BCalGoToday(r, ifMinical).BcalGetOp();
    if (p && p.datestrshow) {
        $("#dateshow").text(p.datestrshow);
    }
}

function cal_beforerequest(type) {
    var t = 'loadingmsg';
    switch (type) {
    case 1:
        t = 'loadingmsg';
        break;
    case 2:
    case 3:
    case 4:
        t = 'processdatamsg';
        break;
    }
    $("#errorpannel").hide();
    $("#loadingpannel").html(t).show();
}

function cal_afterrequest(type) {
    switch (type) {
    case 1:
        $("#loadingpannel").hide();
        break;
    case 2:
    case 3:
    case 4:
        $("#loadingpannel").html(sucessmsg);
        window.setTimeout(function() {
            $("#loadingpannel").hide();
        }, 2000);
        break;
    }
}

function cal_onerror(type, data) {
    $("#errorpannel").show();
}

function view(data) {

}

function edit(data) {
    var bookid = data[0],
        confname = data[1],
        confno = data[1].split(' ')[0];

    bindEdit(bookid, confname, confno);

    return false;
}

function dcal(data, callback) {
    var bookid = data[0],
        confname = data[1],
        confno = data[1].split(' ')[0];

    bindDel(bookid, confname, confno);
}

function wtd(p) {
    if (p && p.datestrshow) {
        $("#txtdatetimeshow").text(p.datestrshow);
    }
    $("#viewswithbtn button.current").each(function() {
        $(this).removeClass("current");
    })
    $("#daybtn").addClass("current");
}

$('#todaybtn').trigger('click');
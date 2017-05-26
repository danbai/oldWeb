/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    config = UCMGUI.config,
    baseServerURl = config.paths.baseServerURl,
    fileType = gup.call(window, "type"),
    previousHTML = '',
    HTMLContent = '',
    subjectType = {
        'account': 'account_subject',
        'cdr': 'cdr_subject',
        'conference': 'conference_subject',
        'alert': 'alert_subject',
        'fax': 'fax_subject',
        'password': 'password_subject',
        'voicemail': 'voicemail_subject',
        'sip_account': 'sip_account_subject',
        'iax_account': 'iax_account_subject',
        'fxs_account': 'fxs_account_subject'
    };

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;

$(function() {
    $P.lang(doc, true);

    $('.variables:not(".' + fileType + '")').hide();

    getMailSubject(fileType);

    getMailHTMLPreview(fileType);

    window.ue = UE.getEditor('container', {
            // ueditor.config.js
            toolbars: [[
                'undo', 'redo', '|',
                'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
                'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                'paragraph', 'fontfamily', 'fontsize', '|',
                'indent', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
                'link', 'unlink'
            ]],
            insertorderedlist: {
                'num': '1,2,3...',
                'num1': '1),2),3)...',
                'num2': '(1),(2),(3)...',
                'decimal': '', // '1,2,3...'
                'lower-alpha': '', // 'a,b,c...'
                'lower-roman': '', // 'i,ii,iii...'
                'upper-alpha': '', // 'A,B,C'
                'upper-roman': '' // 'I,II,III...'
            },
            disabledTableInTable: false,
            autoHeightEnabled: false,
            enableContextMenu: false,
            elementPathEnabled: false,
            enableAutoSave: false,
            wordCount: false,
            allowDivTransToP: false
        });

    ue.ready(function() {
        $P.lang(doc, true);

        getHTMLTemplate(fileType);

        getTextTemplate(fileType);
    });

    $('#mail_context_mode').change(function(ev) {
        if (this.value == 'html') {
            $('#container').css({'display': 'block'});
            $('#preview').css({'display': 'inline-block'});
            $('#plainText').hide();
        } else {
            $('#plainText').css({'display': 'block'});
            $('#container, #preview').hide();
        }

        ev.stopPropagation();
        return false;
    });

    $('#preview').click(function(ev) {
        var editContent = ue.getContent(),
            w = top.window.open('', '_blank', ''),
            d = w.document;

        d.open();

        d.write(HTMLContent);

        if (d.getElementById('content')) {
            d.getElementById('content').innerHTML = editContent;
        }

        d.close();

        ev.stopPropagation();
        return false;
    });

    $('.restore').click(function(ev) {
        var mode = $(this).attr('mode');

        restoreMailTemplate(fileType, mode);

        ev.stopPropagation();
        return false;
    });

    $('#save').click(function(ev) {
        // var content = ue.getContent();
        var contentHTML = ue.body.innerHTML,
            contentText = $('#plainText').val();
            // contentText = strip(contentHTML);
        
        if (!contentHTML) {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG4577").format($P.lang("LANG4576")),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });
        } else {
            var subjectAction = {
                    'action': 'updateMailSubject'
                },
                action = {
                    'action': 'writeMailTemplate',
                    'module': fileType
                };

            subjectAction[subjectType[fileType]] = $('#emailsubject').val();
            action['html_content'] = contentHTML;
            action['txt_content'] = contentText;
            
            $.ajax({
                type: "post",
                url: "../cgi",
                data: subjectAction,
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data, function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    });

                    if (bool) {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: action,
                            error: function(jqXHR, textStatus, errorThrown) {
                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown
                                // });
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data, function() {
                                    top.dialog.container.show();
                                    top.dialog.shadeDiv.show();
                                });

                                if (bool) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG844"),
                                        callback: function() {
                                            mWindow.$("#emailTemplateList", mWindow.document).trigger('reloadGrid');
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }

        ev.stopPropagation();
        return false;
    });

    $('.more').click(function(ev) {
        var me = $(this);

        me.hide();
        me.next().show();
        me.parents('ul').next().show();

        ev.stopPropagation();
        return false;
    });

    $('.more-hide').click(function(ev) {
        var me = $(this);

        me.hide();
        me.prev().show();
        me.parents('ul').next().hide();

        ev.stopPropagation();
        return false;
    });

    top.Custom.init(doc);
});

function getHTMLTemplate(type) {
    $.ajax({
        type: "GET",
        url: '../mail_template/' + type + '_template.html',
        dataType: "html",
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            ue.setContent(data);
        }
    });
}

function getTextTemplate(type) {
    $.ajax({
        type: "GET",
        url: '../mail_template/' + type + '_template.txt',
        dataType: "html",
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            $('#plainText').val(data);
        }
    });
}

function getMailSubject(type) {
    var action = {
            'action': 'getMailSubject'
        };

    action[subjectType[type]] = '';
    
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var settings = data.response.mail_subject_settings,
                    subject = settings[subjectType[type]];

                if (subject) {
                    $('#emailsubject').val(subject);
                }
            }
        }
    });
}

function getMailHTMLPreview(type) {
    var action = {
            'action': 'getMailHtml'
        };

    action['mail_preview'] = type;
    
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response;

                HTMLContent = response['mail_preview'];
            }
        }
    });
}

function restoreMailTemplate(type, mode) {
    var isHTMLFormat = (mode === 'html' ? true : false);

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': (isHTMLFormat ? 'restoreHtmlMailTemplate' : 'restoreTextMailTemplate'),
            'mail_template': type
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (isHTMLFormat) {
                    getHTMLTemplate(type);
                } else {
                    getTextTemplate(type);
                }

                getMailSubject(type);
            }
        }
    });
}

function strip(html) {
   var tmp = document.createElement("DIV");

   tmp.innerHTML = html;

   return tmp.textContent || tmp.innerText || "";
}
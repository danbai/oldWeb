/*
 * navSlide jlwang add 2015-01-22
 */

(function($) {
    $.navSlide = function(ifExtension, ifReposition, ifCommand, ifForm, ifTime) {
        var aSettings = $(".settings"),
            aLi = $("#nav_settings > li"),
            oAdvance = aLi.eq(1),
            oCommand = ifCommand === true ? top.dialog.dialogCommands : $(ifCommand),
            oForm = ifForm === true ? $("#form", document) : $(ifForm, document),
            bFirstLoad = true;

        if (navigator.userAgent.toLowerCase().indexOf('mac os x') > -1 && Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
            $('.nav_wrap').css({'position': 'absolute', '-webkit-transform': 'translateZ(0)'});

            $(window).on('scroll', function() {
                $('.nav_wrap').css('top', parseInt($(window).scrollTop(), 10));
            });
        }

        aLi.on('click', function(ev) {
            var index = $(this).index();

            if (ev.target.tagName !== 'A') {
                return;
            }

            if ($(this).hasClass("current")) {
                return;
            }

            if (ev.target.id !== 'slide_novalidate') {
                // if (!oForm.valid()) {
                //     $("input[titles], select[titles], textarea[titles]").focus();
                //
                //     return;
                // }
            }

            $(this).addClass("current").siblings().removeClass("current");

            aSettings.eq(index).addClass("current_position").removeClass("none_position").siblings().removeClass("current_position");

            if (ifTime) {
                if (ev.target.id === 'slide_novalidate') {
                    oCommand.hide();
                } else {
                    if (oCommand.is(":hidden")) {
                        oCommand.show();
                    }
                }
            }

            if (ifExtension) {
                if (index == 3) {
                    if ($("#table-add-btn").is(":visible") || $("#table-edit-btn").is(":visible")) {
                        oCommand.hide();
                    }
                } else {
                    if (oCommand.is(":hidden")) {
                        oCommand.show();
                    }
                }
            }

            if (ifReposition) {
                top.dialog.currentDialogType = "iframe";
                top.dialog.repositionDialog();
            }
        });
    };
})(window.jQuery);

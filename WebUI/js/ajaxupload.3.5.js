(function() {
    var d = document,
        w = window;

    function get(element) {
        if (typeof element == "string")
            element = d.getElementById(element);
        return element;
    }

    function addEvent(el, type, fn) {
        if (w.addEventListener) {
            el.addEventListener(type, fn, false);
        } else if (w.attachEvent) {
            var f = function() {
                fn.call(el, w.event);
            };
            el.attachEvent('on' + type, f)
        }
    }
    var toElement = function() {
        var div = d.createElement('div');
        return function(html) {
            div.innerHTML = html;
            var el = div.childNodes[0];
            div.removeChild(el);
            return el;
        }
    }();

    function hasClass(ele, cls) {
        return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    function addClass(ele, cls) {
        if (!hasClass(ele, cls))
            ele.className += " " + cls;
    }

    function removeClass(ele, cls) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
    }
    if (d.documentElement["getBoundingClientRect"]) {
        var getOffset = function(el) {
            var box = el.getBoundingClientRect(),
                doc = el.ownerDocument,
                body = doc.body,
                docElem = doc.documentElement,
                clientTop = docElem.clientTop || body.clientTop || 0,
                clientLeft = docElem.clientLeft || body.clientLeft || 0,
                zoom = 1;
            if (body.getBoundingClientRect) {
                var bound = body.getBoundingClientRect();
                zoom = (bound.right - bound.left) / body.clientWidth;
            }
            if (zoom > 1) {
                clientTop = 0;
                clientLeft = 0;
            }
            var top = box.top / zoom + (w.pageYOffset || docElem && docElem.scrollTop / zoom || body.scrollTop / zoom) - clientTop,
                left = box.left / zoom + (w.pageXOffset || docElem && docElem.scrollLeft / zoom || body.scrollLeft / zoom) - clientLeft;
            return {
                top: top,
                left: left
            };
        }
    } else {
        var getOffset = function(el) {
            if (w.jQuery) {
                return w.jQuery(el).offset();
            }
            var top = 0,
                left = 0;
            do {
                top += el.offsetTop || 0;
                left += el.offsetLeft || 0;
            } while (el = el.offsetParent);
            return {
                left: left,
                top: top
            };
        }
    }

    function getBox(el) {
        //el = $(el);

        var offset = $(el).offset();

        return {
            left: offset.left,
            top: offset.top,
            right: offset.left + $(el).width(),
            bottom: offset.top + $(el).height()
        };
    }

    function getMouseCoords(e) {
        if (!e.pageX && e.clientX) {
            var zoom = 1;
            var body = d.body;
            if (body.getBoundingClientRect) {
                var bound = body.getBoundingClientRect();
                zoom = (bound.right - bound.left) / body.clientWidth;
            }
            return {
                x: e.clientX / zoom + d.body.scrollLeft + d.documentElement.scrollLeft,
                y: e.clientY / zoom + d.body.scrollTop + d.documentElement.scrollTop
            };
        }
        return {
            x: e.pageX,
            y: e.pageY
        };
    }
    var getUID = function() {
        var id = 0;
        return function() {
            return 'ValumsAjaxUpload' + id++;
        }
    }();

    function fileFromPath(file) {
        return file.replace(/.*(\/|\\)/, "");
    }

    function getExt(file) {
        return (/[.]/.exec(file)) ? /[^.]+$/.exec(file.toLowerCase()) : '';
    }
    Ajax_upload = AjaxUpload = function(button, options) {
        d = options.doc ? options.doc : document;
        w = options.win ? options.win : window;


        if (button.jquery) {
            button = button[0];
        } else if (typeof button == "string" && /^#.*/.test(button)) {
            button = button.slice(1);
        }
        button = get(button);
        this._input = null;
        this._button = button;
        this._disabled = false;
        this._submitting = false;
        this._justClicked = false;
        //this._parentDialog = d.body;
        this._parentDialog = this._button.parentNode;
        this._realinput = w.jQuery(this._parentDialog).find('input')[0];
        if (w.jQuery && w.jQuery.ui && w.jQuery.ui.dialog) {
            var parentDialog = w.jQuery(this._button).parents('.ui-dialog');
            if (parentDialog.length) {
                this._parentDialog = parentDialog[0];
            }
        };
        this._settings = {
            action: 'upload.php',
            name: 'userfile',
            data: {},
            autoSubmit: true,
            responseType: false,
            onChange: function(file, extension) {},
            onSubmit: function(file, extension) {},
            onComplete: function(file, response) {}
        };
        for (var i in options) {
            this._settings[i] = options[i];
        }
        this._createInput();
        this._rerouteClicks();
    }
    AjaxUpload.prototype = {
        setData: function(data) {
            this._settings.data = data;
        },
        disable: function() {
            this._disabled = true;

            if (this._input)
                this._input.disabled = true;
        },
        enable: function() {
            this._disabled = false;
            if (this._input)
                this._input.disabled = false;
        },
        destroy: function() {
            if (this._input) {
                if (this._input.parentNode) {
                    this._input.parentNode.removeChild(this._input);
                }
                this._input = null;
            }
        },
        _createInput: function() {
            var self = this;
            var input = d.createElement("input");
            input.setAttribute('type', 'file');
            input.setAttribute('name', this._settings.name);
            input.setAttribute('localeTitle', 'LANG4494');
            var styles = {
                'position': 'absolute',
                'margin': '0px 0 0 0px',
                'padding': 0,
                'fontSize': '14px',
                'opacity': 0,
                'cursor': 'pointer',
                'display': 'block',
                'width': '100px',
                'height': '27px',
                'z-index': 50
            };
            for (var i in styles) {
                input.style[i] = styles[i];
            }
            if (!(input.style.opacity === "0")) {
                input.style.filter = "alpha(opacity=0)";
            }
            input.style.top = 0;
            input.style.left = 0;
            var inputs = $(this._parentDialog).find("[name=" + this._settings.name + "]");
            if (inputs.length != 0) {
                inputs.remove();
            }
            this._parentDialog.appendChild(input);
            addEvent(input, 'change',
                function() {
                    var file = fileFromPath(this.value);
                    if (self._settings.onChange.call(self, file,
                        getExt(file)) == false) {
                        return;
                    }
                    if (self._settings.autoSubmit) {
                        self.submit();
                    }
                });
            addEvent(input, 'click', function() {
                self.justClicked = true;
                setTimeout(function() {
                    self.justClicked = false;
                }, 3000);
            });
            this._input = input;
        },
        _rerouteClicks: function() {
            var self = this;
            var box, dialogOffset = {
                    top: 5,
                    left: 5
                },
                over = false;
            addEvent(self._realinput, 'mouseover', function(e) {
                if (parseInt(self._input.style.width) != parseInt($(self._button.parentNode).width())) {
                    self._input.style.width = $(self._button.parentNode).width() + "px";
                    self._input.style.height = $(self._button.parentNode).height() + "px";
                }
            });
            addEvent(self._button, 'mouseover', function(e) {
                if (parseInt(self._input.style.width) != parseInt($(self._button.parentNode).width())) {
                    self._input.style.width = $(self._button.parentNode).width() + "px";
                    self._input.style.height = $(self._button.parentNode).height() + "px";
                }
            });

            addEvent(self._input, 'mouseover', function(e) {
                if (parseInt(self._input.style.width) != parseInt($(self._button.parentNode).width())) {
                    self._input.style.width = $(self._button.parentNode).width() + "px";
                    self._input.style.height = $(self._button.parentNode).height() + "px";
                }
            });
        },
        _createIframe: function() {
            var id = getUID();
            var iframe = toElement('<iframe src="javascript:false;" name="' + id + '" />');
            iframe.id = id;
            iframe.style.display = 'none';
            d.body.appendChild(iframe);
            return iframe;
        },
        submit: function(type) {
            var self = this,
                file, settings = this._settings;
            if (this._input) {
                file = fileFromPath(this._input.value);
                if (this._input.value == '') {
                    return;
                }
            }
            if (!(settings.onSubmit.call(this, file, getExt(file)) == false)) {
                var iframe = this._createIframe();
                var form = this._createForm(iframe);
                form.appendChild(this._input);
                form.submit();
                d.body.removeChild(form);
                form = null;
                this._input = null;
                this._realinput.value = '';
                this._createInput();
                var toDeleteFlag = false;
                addEvent(
                    iframe,
                    'load',
                    function(e) {
                        if (iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" || iframe.src == "javascript:'<html></html>';") {
                            if (toDeleteFlag) {
                                setTimeout(function() {
                                    d.body.removeChild(iframe);
                                }, 0);
                            }
                            return;
                        }
                        var doc = iframe.contentDocument ? iframe.contentDocument : frames[iframe.id].document;
                        if (doc.readyState && doc.readyState != 'complete') {
                            return;
                        }
                        if (doc.body && doc.body.innerHTML == "false") {
                            return;
                        }
                        var response;
                        if (doc.XMLDocument) {
                            response = doc.XMLDocument;
                        } else if (doc.body) {
                            response = doc.body.innerHTML;
                            if (settings.responseType && settings.responseType.toLowerCase() == 'json') {
                                if (doc.body.firstChild && doc.body.firstChild.nodeName
                                    .toUpperCase() == 'PRE') {
                                    response = doc.body.firstChild.firstChild.nodeValue;
                                }
                                if (response) {
                                    response = w["eval"]("(" + response + ")");
                                } else {
                                    response = {};
                                }
                            }
                        } else {
                            var response = doc;
                        }
                        settings.onComplete.call(self, file, response);
                        toDeleteFlag = true;
                        iframe.src = "javascript:'<html></html>';";
                    });
            } else {
                this._input.value = '';
            }
            // else
            // {
            //     d.body.removeChild(this._input);
            //     this._input = null;
            //     this._createInput();
            // }
        },
        _createForm: function(iframe) {
            var settings = this._settings;
            var form = toElement('<form method="post" enctype="multipart/form-data"></form>');
            form.style.display = 'none';
            form.action = settings.action;
            form.target = iframe.name;
            d.body.appendChild(form);
            for (var prop in settings.data) {
                var el = d.createElement("input");
                el.type = 'hidden';
                el.name = prop;
                el.value = settings.data[prop];
                form.appendChild(el);
            }
            return form;
        }
    };
})();
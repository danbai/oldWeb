// import $ from 'jquery'

(function () {

    // fix the model is not supporting console error
    // TODO: this is temporary solution to disabled the console printout 
    window.debug = false;

    var nativeConsole = window.console;
    if (!nativeConsole) nativeConsole = {};
    if (!nativeConsole.log) nativeConsole.log = function () { };
    if (!nativeConsole.warn) nativeConsole.warn = function () { };
    if (!nativeConsole.error) nativeConsole.error = function () { };

    // window.console = {
    //     log: function () {
    //         if (debug)
    //             nativeConsole.log.apply(nativeConsole, arguments);
    //     },
    //     warn: function () {
    //         if (debug)
    //             nativeConsole.warn.apply(nativeConsole, arguments);
    //     },
    //     error: function () {
    //         if (debug)
    //             nativeConsole.error.apply(nativeConsole, arguments);
    //     }
    // };
    var hasMovement = false;
    
    // $(document).on('mousemove mouseenter scroll keydown click dblclick', function () {
    //     hasMovement = true;
    // });

    var initializing = false,
        classSeed = 0,
        superPattern =  // Determine if functions can be serialized
          /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/,
        valuePattern =
          /xyz/.test(function () { xyz; }) ? /\b(_private|_protected)\b/ : /.*/;

    var base = this.Class = function () {
    };

    var classes = {};

    var supportDefineProperty = true;
    //emulate legacy getter/setter API using ES5 APIs
    try {
        if (!Object.prototype.__defineGetter__ &&
             Object.defineProperty({}, "x", { get: function () { return true } }).x) {
            Object.defineProperty(Class.prototype, "__defineGetter__",
              {
                  enumerable: false, configurable: true,
                  value: function (name, func) {
                      Object.defineProperty(this, name,
                         { get: func, enumerable: true, configurable: true });
                  }
              });
            Object.defineProperty(Class.prototype, "__defineSetter__",
               {
                   enumerable: false, configurable: true,
                   value: function (name, func) {
                       Object.defineProperty(this, name,
                          { set: func, enumerable: true, configurable: true });
                   }
               });
        }
    }
    catch (defPropException) {
        /*Do nothing if an exception occurs*/
        supportDefineProperty = false;
    };

    var updateClassTree = function (classid, proto) {
        if (!proto)
            return;

        if (!classes[classid])
            classes[classid] = [];

        classes[classid].push(proto);

        if (proto.__proto__ !== base.prototype)
            updateClassTree(classid, proto.__proto__);
    }
    this.SimpleTimer = function () {
        this.timerID = 0;
        this.timers = [];
        this.afterTimers = [];
        this.add = function (fn) {
            this.timers.push(fn);
        };
        this.addAfter = function (fn) {
            this.afterTimers.push(fn);
        }
        this.start = function (callback) {
            var self = this;
            var runAfter = false;
            if (this.timerID) return;
            (function runNext() {
                if (self.timers.length > 0) {
                    // the timer will execute chunk function at the time
                    var chunk = self.timers.length;
                    if (chunk > 5) chunk = 5;
                    for (var i = 0; i < chunk; i++)
                    {
                        self.timers[i]();
                    }
                    
                    self.timers.splice(0, chunk);
                    //self.timerID = setTimeout(runNext, chunk * 10);

                    self.timerID = setTimeout(runNext, hasMovement ? 300 : chunk);
                    hasMovement = false;
                    return;
                }

                // need to stop or it might continue running
                self.stop();

                if (!runAfter)
                {
                    if (typeof callback === "function")
                        callback.call(null);

                    if (self.afterTimers.length > 0) {
                        // having after timers
                        runAfter = true;
                        self.timers = self.afterTimers;
                        runNext();
                    }
                }

            })();
        }
        this.stop = function () {
            clearTimeout(this.timerID);
            this.timerID = 0;
        }
    };

    // Creates a new Class that inherits from this class
    Class.subClass = function (properties) {
        var _super = this.prototype;

        // define unique class id for each super class
        //if (this == base)
        //    properties._classid = 0;
        //else
        //properties._classid = (++classSeed);

        //classes[properties._classid] = properties;
        var DataObject = function () {
            var m_privates = {};
            var m_protected = {};
            var m_classes = classes[Class.prototype._classid];

            this.private = function (sender) {
                if (sender) {
                    // NOTE: disable this logic to increase performance
                    //if (m_classes.indexOf(sender) < 0) {
                    //    console.error("invalid request to private data");
                    //    return;
                    //}

                    if (!m_privates[sender._classid])
                        m_privates[sender._classid] = {};

                    return m_privates[sender._classid];
                }
                else {
                    if (arguments.callee.caller.toString() == this.copyFrom.toString())
                        return m_privates;
                }
            }
            this.protected = function (sender) {
                if (sender) {
                    // NOTE: disable this logic to increase performance
                    //if (m_classes.indexOf(sender) < 0) {
                    //    console.error("invalid request to protected data");
                    //    return;
                    //}

                    return m_protected;
                }

                if (arguments.callee.caller.toString() == this.copyFrom.toString())
                    return m_protected;
            }
            this.copyFrom = function (from) {
                m_privates = jQuery.extend(true, {}, from.private());
                m_protected = jQuery.extend(true, {}, from.protected());
            }
        }

        var setDataObject = function (obj) {
            if (!obj["_"]) {
                if (supportDefineProperty) {
                    Object.defineProperty(obj, "_", {
                        value: new DataObject(),
                        writable: false,
                        configurable: false,
                        enumerable: false
                    });
                }
                else {
                    obj["_"] = new DataObject();
                }
            }
        }

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var proto = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in properties) {
            // Check if we're overwriting an existing function
            var supTested = superPattern.test(properties[name]);
            var valTested = valuePattern.test(properties[name]);
            var typeProp = typeof properties[name];
            var typeSuper = typeof _super[name];
            var processed = false;

            if (typeProp === "function") {
                if (supTested && typeSuper === "function") {
                    proto[name] = (function (name, fn) {
                        // NOTE: there is actually an overhead on this process
                        // the advantage of using this is making code easier to 
                        //  maintain than boots the performance...
                        var ret = function () {
                            var tmpSup = this._super;
                            var tmpPvt = this._private;
                            var tmpPtd = this._protected;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];
                            this._private = this._.private(Class.prototype);
                            this._protected = this._.protected(Class.prototype);

                            var inFn = fn.apply(this, arguments);

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            this._super = tmpSup;
                            this._private = tmpPvt;
                            this._protected = tmpPtd;

                            return inFn;
                        };
                        //ret.sender = proto;
                        return ret;
                    })(name, properties[name]);

                    processed = true;
                }
                else if (valTested) {
                    proto[name] = (function (name, fn) {
                        // NOTE: there is actually an overhead on this process
                        // the advantage of using this is making code easier to 
                        // maintain than boots the performance...
                        var ret = function () {
                            var tmpPvt = this._private;
                            var tmpPtd = this._protected;

                            this._private = this._.private(Class.prototype);
                            this._protected = this._.protected(Class.prototype);

                            var inFn = fn.apply(this, arguments);

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            this._private = tmpPvt;
                            this._protected = tmpPtd;

                            return inFn;
                        };
                        //ret.sender = proto;
                        return ret;
                    })(name, properties[name]);

                    processed = true;
                }
            }

            if (!processed)
                proto[name] = properties[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing) {
                // TODO: this is fake private/protected value collection 
                setDataObject(this);

                if (this.init)
                    this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = proto;

        Class.prototype._classid = (++classSeed);

        // build class tree
        updateClassTree(Class.prototype._classid, Class.prototype);

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extendable
        Class.subClass = arguments.callee;

        Class.clone = function (from) {
            var ret = new this();
            if (from._classid == ret._classid) {
                ret._.copyFrom(from._);
                return ret;
            }
            else
                console.error("Invalid clone from different source class");
        }

        return Class;
    };
    window.Class = Class
    window.SimpleTimer = SimpleTimer
})();


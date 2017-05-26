/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var BLL = zc;

//=======================================================
// Constants
//=======================================================
var CGI_DATA_BLOCK = "block";
var CGI_DATA_BLOCKELEMENT = "blockelement";
var CGI_DATA_ELEMENT = "element";
var CGI_DATA_GLOBAL_LIST = "globalList";
var CGI_DATA_GLOBAL_TYPE = "globalType";
var CGI_DATA_MODEL = "model";
var CGI_DATA_MODEL_ALIAS = "modelAlias";
var CGI_DATA_MODEL_LIST = "modelList";
var CGI_DATA_MODEL_TYPE = "modelType";
var CGI_DATA_MODEL_PROPERTY = "modelProperty";
var CGI_DATA_MODEL_GROUP = "modelGroup";
var CGI_DATA_MODEL_GROUPFIELD = "modelGroupfield";
var CGI_DATA_MODEL_FIELD = "modelField";
var CGI_DATA_MODEL_FIELD_MAPPING = "modelFieldMapping";
var CGI_DATA_MODEL_LANGUAGE = "modelLanguage";
var CGI_DATA_MODEL_LANGUAGE_EXTENSION = "modelLanguageExtension";
var CGI_DATA_MODEL_IMAGEMAPPING = "modelImageMapping";
var CGI_DATA_MODEL_IMAGEMAPPING_REGION = "modelImageMappingRegion";
var CGI_DATA_MODEL_IMAGEMAPPING_REGION_LINK = "modelImageMappingRegionLink";
var CGI_DATA_LIST_ITEM = "listItem";
var CGI_DATA_TYPE_ENTITY = "typeEntity";

var CGI_STATE_DOWNLOADING = 1;
var CGI_STATE_DOWNLOADED = 2;
var CGI_STATE_PROCESSED = 3;

var CGI_DATA_CHUCK_SIZE = 10;

var VALUE_TYPE_UNKNOWN = 0;
var VALUE_TYPE_SHARE_VARIABLE = 1;
var VALUE_TYPE_CONSTANT = 2;
var VALUE_TYPE_FUNC_CONCAT = 3;
var VALUE_TYPE_FUNC_ADD = 4;

var DATA_STATE_UNKNOWN = -1;
var DATA_STATE_COMPLETION = 0;
var DATA_STATE_STRING = 1;
var DATA_STATE_SHARED_VARIABLE = 2;
var DATA_STATE_SHARED_VARIABLE_2 = 3;
var DATA_STATE_FUNCTION = 4;
var DATA_STATE_FUNCTION_2 = 5;
var DATA_STATE_FUNCTION_3 = 6;
var DATA_STATE_FUNCTION_4 = 7;
var DATA_STATE_FUNCTION_5 = 8;
var DATA_STATE_FUNCTION_6 = 9;
var DATA_STATE_FUNCTION_7 = 10;
var DATA_STATE_FUNCTION_8 = 11;
var DATA_STATE_FUNCTION_9 = 12;
var DATA_STATE_FUNCTION_10 = 13;
var DATA_STATE_FUNCTION_11 = 14;



//=======================================================
// Central Timer Control: manage multiple handlers
// This implement is based on Resign J. and Bibeault B.,
// Secrets of the JavaScript Ninja
//=======================================================
// Central timer control: timer
function Timer(handler, data, callback) {
    var _handler = handler;
    var _data = data;
    var _callback = callback;

    // Getters
    this.getHandler = function() {
        return _handler;
    };

    this.getData = function() {
        return _data;
    };

    this.getCallback = function() {
        return _callback;
    };
}

// Central timer control: controller
function Timers() {
    var _timerId = 0;
    var _timers = [];

    // Helpers
    this.add = function(handler, data, callback) {
        // Sanity check
        if (typeof(handler) !== "function") {
            console.log("handler is invalid");
            return -1;
        }

        _timers.push(new Timer(handler, data, callback));

        return 0;
    };

    this.start = function() {
        if (_timerId)
            return;

        (function timerHandler() {
            if (_timers.length > 0) {
                for (var index = 0; index < _timers.length; index++) {
                    var timer = _timers[index],
                        handler = timer.getHandler(),
                        data = timer.getData(),
                        callback = timer.getCallback();

                    if (handler(data) === false) {
                        // Execute given call back
                        if (typeof(callback) === "function") {
                            callback(data);
                        }

                        // Remove current timer
                        _timers.splice(index, 1);
                        index--;
                    }
                }
            }

            _timerId = setTimeout(timerHandler, 0);
        })();
    };

    this.stop = function() {
        clearTimeout(_timerId);
        _timerId = 0;
    };
}

//=======================================================
// Data Object
//=======================================================
function DataObject(source, type) {
    this._valueType = type;
    this._arguments = [];
    this._source = source;
    this._request = null;
    this._values = {};

    this.appendArgument = function(arg) {
        this._arguments.push(arg);
    };

    this.prepare = function() {
        if (this._valueType === VALUE_TYPE_SHARE_VARIABLE && this._arguments.length === 2 && this._arguments[0] === "UCM" && this._arguments[1]) {

            // Prepare a request
            if (this._request === null) {
                this._request = this._arguments[0] + "::" + this._arguments[1];
            }

            // Append a request to the value delegation
            ZEROCONFIG.valueDelegation.appendRequest(this._request, this);
        }
    }

    this.update = function(name, data) {
        var response;

        console.log("[TK] DataObject-name: " + name + ", data: ", data);

        // Sanity check
        if (data.status !== 0) {
            console.warn("DataObject-Invalid status, name: " + name +
                ", data: ", data);
            return;
        }

        // Get the response object
        response = data.response;

        // Parser
        // for (var key in response) {
        //     // LDAP phonebook
        //     if (key === "ldap_phonebooks") {
        //
        //     }
        // }
    };
}

// Overriding prototypes
DataObject.prototype.toString = function() {
    var name;
    var item;

    // Sanity check
    if (this._arguments.length === 0) {
        return "";
    }

    if (this._valueType === VALUE_TYPE_SHARE_VARIABLE &&
        this._arguments.length === 2) {

        name = this._arguments[1].toString();

        if (this._arguments[0] === null) {
            // Get current object values
            if (this.__scope__ !== "undefined" &&
                this.__scope__.item !== "undefined") {
                item = this.__scope__.item;
                return item[name] ? item[name].toString() : "";
            }
        }
        // Get value based on scope and name
        else {
            if (this._arguments[0] === "model") {
                // Get model object
                var model = BLL.ConfigPage.modelInfo();

                if (model === undefined) {
                    return "";
                }

                // Get model property value
                return model.property(this._arguments[1].toString());
            } else if (this._arguments[0] === "entity") {
                // Get current object's entities
                if (this.__scope__ !== "undefined" &&
                    this.__scope__.elementWidget !== "undefined" &&
                    this.__scope__.elementWidget.elementValue() !== "undefined") {
                    item = this.__scope__.elementWidget.elementValue();
                    return item[name] ? item[name].toString() : "";
                }
            } else if (this._arguments[0] === "device") {
                var ret = "";
                var obj = BLL.ConfigPage.currentDevice();

                if (typeof obj === "object")
                    ret = obj[name];

                return ret || "";
            } else if (this._arguments[0] === "page") {
                var ret = "";
                if (typeof BLL.ConfigPage[name] === "function")
                    ret = BLL.ConfigPage[name]();

                return ret || "";
            } else if (this._arguments[0] === "env") {
                return UCMGUI.gup.call(BLL.ConfigPage.currentWindow(), name) || "";
            } else if (this._arguments[0] === "this") {
                var current = this.__current__;

                if (current)
                    return current[name] || ""

                return "";
            } else if (this._arguments[0] === "monitor") {
                var monitor = ZEROCONFIG.ValueMonitor._data._refs[name];

                if (monitor !== undefined) {
                    return monitor.getResult().toString() || "";
                }
            } else if (this._arguments[0] === "element") {
                if (this.__scope__ !== undefined &&
                    this.__scope__.item !== undefined &&
                    typeof this.__scope__.item.generateElementInfo == 'function') {
                    item = this.__scope__.item.generateElementInfo();
                    return item[name] ? item[name].toString() : "";
                }
            } else {
                console.log("[TK] TODO: Handle scope: " + this._arguments[0]);
                return "";
            }
        }
    } else if (this._valueType === VALUE_TYPE_FUNC_CONCAT &&
        this._arguments.length === 2) {
        return this._arguments[0].toString() + this._arguments[1].toString();
    } else if (this._valueType === VALUE_TYPE_FUNC_ADD &&
        this._arguments.length === 2) {

        return (Number(this._arguments[0].toString()) + Number(this._arguments[1].toString())).toString();
    }

    return "";
};

//=======================================================
// Data container
//=======================================================
function DataContainer(data) {
    this._data = data;
}

DataContainer.prototype.toString = function(item) {
    var length = this._data.length;
    var string = "";

    for (var index = 0; index < length; index++) {
        this._data[index].__current__ = item;
        string = string + this._data[index].toString();
    }

    // Convert constant string
    length = string.length;
    if (length > 0 && string[0] === '\'' && string[length - 1] === '\'') {
        string = string.replace(/^'/g, "").replace(/'$/g, "");
    }

    return string;
}

// Get next tokenization state
function getNextState(currentState, input) {
    var nextState = DATA_STATE_UNKNOWN;

    if (currentState === DATA_STATE_UNKNOWN ||
        currentState === DATA_STATE_STRING) {
        if (input === '$') {
            nextState = DATA_STATE_SHARED_VARIABLE;
        } else if (input === '[') {
            nextState = DATA_STATE_FUNCTION;
        } else {
            nextState = DATA_STATE_STRING;
        }
    } else if (currentState === DATA_STATE_SHARED_VARIABLE) {
        if (input === '{') {
            nextState = DATA_STATE_SHARED_VARIABLE_2;
        } else {
            nextState = DATA_STATE_STRING;
        }
    } else if (currentState === DATA_STATE_SHARED_VARIABLE_2) {
        if (input === '}') {
            nextState = DATA_STATE_COMPLETION;
        } else {
            nextState = DATA_STATE_SHARED_VARIABLE_2;
        }
    } else if (currentState === DATA_STATE_FUNCTION) {
        if (input === 'F') {
            nextState = DATA_STATE_FUNCTION_2;
        } else {
            nextState = DATA_STATE_STRING;
        }
    } else if (currentState === DATA_STATE_FUNCTION_2) {
        if (input === '[') {
            nextState = DATA_STATE_FUNCTION_3;
        } else {
            nextState = DATA_STATE_STRING;
        }
    } else if (currentState === DATA_STATE_FUNCTION_3) {
        if (input === ']') {
            nextState = DATA_STATE_FUNCTION_4;
        } else {
            nextState = DATA_STATE_FUNCTION_3;
        }
    } else if (currentState === DATA_STATE_FUNCTION_4) {
        if (input === ',') {
            nextState = DATA_STATE_FUNCTION_5;
        } else {
            nextState = DATA_STATE_FUNCTION_4;
        }
    } else if (currentState === DATA_STATE_FUNCTION_5) {
        if (input === '[') {
            nextState = DATA_STATE_FUNCTION_6;
        } else if (input === ']') {
            nextState = DATA_STATE_COMPLETION;
        } else {
            nextState = DATA_STATE_FUNCTION_5;
        }
    }else if (currentState === DATA_STATE_FUNCTION_6) {
        if (input === 'F') {
            nextState = DATA_STATE_FUNCTION_7;
        } else {
            nextState = DATA_STATE_STRING;
        }
    } else if (currentState === DATA_STATE_FUNCTION_7) {
        if (input === '[') {
            nextState = DATA_STATE_FUNCTION_8;
        } else {
            nextState = DATA_STATE_STRING;
        }
    } else if (currentState === DATA_STATE_FUNCTION_8) {
        if (input === ']') {
            nextState = DATA_STATE_FUNCTION_9;
        } else {
            nextState = DATA_STATE_FUNCTION_8;
        }
    } else if (currentState === DATA_STATE_FUNCTION_9) {
        if (input === ',') {
            nextState = DATA_STATE_FUNCTION_10;
        } else {
            nextState = DATA_STATE_FUNCTION_9;
        }
    } else if (currentState === DATA_STATE_FUNCTION_10) {
        if (input === ']') {
            nextState = DATA_STATE_FUNCTION_11;
        } else {
            nextState = DATA_STATE_FUNCTION_10;
        }
    }
    else if (currentState === DATA_STATE_FUNCTION_11) {
        if (input === ']') {
            nextState = DATA_STATE_COMPLETION;
        } else {
            nextState = DATA_STATE_FUNCTION_11;
        }
    }

    return nextState;
}

function tokenization(str) {
    var length = -1;
    var current = null;
    var token = "";
    var container = [];
    var currentState = DATA_STATE_UNKNOWN;
    var nextState = DATA_STATE_UNKNOWN;

    // Sanity check
    if (!str) {
        return container;
    }

    // console.log("[TK] str: ", str);

    // Initialize variables
    length = str.length;

    for (var index = 0; index < length; index++) {
        current = str[index];
        nextState = getNextState(currentState, current);

        // console.log("[TK] current state: ", currentState, ", input: ", current,
        //             ", next state: ", nextState);

        // Update token and container
        if (nextState == DATA_STATE_STRING &&
            (currentState == DATA_STATE_SHARED_VARIABLE ||
                currentState == DATA_STATE_FUNCTION ||
                currentState == DATA_STATE_FUNCTION_2)) {
            container.push(token);
            token = current;
        } else if (currentState != DATA_STATE_UNKNOWN &&
            (nextState == DATA_STATE_SHARED_VARIABLE ||
                nextState == DATA_STATE_FUNCTION)) {
            container.push(token);
            token = current;
        } else if (nextState == DATA_STATE_COMPLETION) {
            token = token + current;
            container.push(token);
            token = "";
        } else if (nextState != DATA_STATE_UNKNOWN) {
            token = token + current;
        }

        // Update current state status
        if (nextState == DATA_STATE_COMPLETION) {
            currentState = DATA_STATE_UNKNOWN;
        } else {
            currentState = nextState;
        }
    }

    // Insert last token
    if (nextState != DATA_STATE_COMPLETION) {
        container.push(token);
    }

    return container;
}

function parseToken(str, sharedScope) {
    var obj = null;
    var scope = null;
    var name = null;
    var indicator = null;
    var content = null;
    var contentList = null;

    // Sanity check
    if (!str) {
        return str;
    }

    indicator = str.charAt(0);

    if (indicator === '$') {
        content = str.replace(/^\${/g, "").replace(/}$/g, "");

        // Split share variable pattern
        if (content.search("::") !== -1) {
            contentList = content.split(/\s*(::)\s*/);

            // Sanity check
            if (contentList.length !== 3) {
                console.error("Invalid share variable pattern: " + content + ", string: " + str);
                return str;
            }

            scope = contentList[0];
            name = contentList[2];
        } else {
            name = content;
        }

        obj = new DataObject(str, VALUE_TYPE_SHARE_VARIABLE);
        obj.appendArgument(scope);
        obj.appendArgument(name);
        obj.__scope__ = sharedScope;

        return obj;
    } else if (indicator === '[') {
        content = str.replace(/^\[/g, "").replace(/\]$/g, "");
        contentList = splitXMLFunctionPara(content);
        
        // Sanity check
        if (contentList.length < 2) {
            console.log("Invalid function variable pattern: " + content + ", string: " + str);
            return str;
        }

        if (contentList[0] === "F[concat]" && contentList.length === 3) {
            var arg1 = ZEROCONFIG.dataFactory(contentList[1].replace(/\s+/, ""), sharedScope);
            var arg2 = ZEROCONFIG.dataFactory(contentList[2].replace(/\s+/, ""), sharedScope);
            obj = new DataObject(str, VALUE_TYPE_FUNC_CONCAT);
            obj.appendArgument(arg1);
            obj.appendArgument(arg2);
            obj.__scope__ = sharedScope;
            return obj;
        }
        else if(contentList[0] === "F[add]" && contentList.length === 3) {
            var arg1 = ZEROCONFIG.dataFactory(contentList[1].replace(/\s+/, ""), sharedScope);
            var arg2 = ZEROCONFIG.dataFactory(contentList[2].replace(/\s+/, ""), sharedScope);

            obj = new DataObject(str, VALUE_TYPE_FUNC_ADD);
            obj.appendArgument(arg1);
            obj.appendArgument(arg2);
            obj.__scope__ = sharedScope;
            return obj;
        }

        console.log("Unrecognized function: " + contentList[0] + ", string: " + str);
        return str;
    }

    return str;
}

function splitXMLFunctionPara(str) {
  var left = 0;
  var right = 0;
  var start = 0;
  var num = 0;
  var arr = new Array();

  for (var i = 0; i < str.length; i++) {
      switch (str.charAt(i)) {
          case '[':
              left++;
              break;
          case ']':
              right++;
              if (left == right) {
                  arr[num] = str.substring(start, i+1);
                  num++;
                  left = 0;
                  right = 0;
                  i = i + 2;
                  start = i;
              }
              break;
          case ',':
             if (left == 0) {
                 arr[num] = str.substring(start, i);
                 num++;
                 start = i + 1;
             }
             break;
          default:
      }
  }

  if (start < str.length) {
      arr[num] = str.substring(start, str.length);
  }
  return arr;
}

//=======================================================
// Value Delegation
//=======================================================
// Value delegation: request queue
function RequestQueue(name) {
    var _name = name;
    var _requests = {};
    var _isBusy = 0;

    // Getters
    this.getName = function() {
        return _name;
    };

    this.getRequests = function() {
        return _requests;
    };

    this.isBusy = function() {
        return _isBusy;
    };

    // Setters
    this.setBusy = function(busy) {
        _isBusy = busy;
    };

    this.showInfo = function() {
        console.log("RequestQueue", _name, _requests, _isBusy);
    }
}

// Value delegation: observer list
// This implementation is based on Learning JavaScript Design Patterns by Addy Osmani
// http://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript
function ObserverList() {
    var _observerList = [];

    this.append = function(observer) {
        return _observerList.push(observer);
    };

    this.count = function() {
        return _observerList.length;
    };

    this.get = function(index) {
        if (index > -1 && index < _observerList.length) {
            return _observerList[index];
        }

        return null;
    };

    this.indexOf = function(observer, startIndex) {
        var i = startIndex;

        while (i < _observerList.length) {
            if (_observerList[i] === observer) {
                return i;
            }

            i++;
        }

        return -1;
    };

    this.removeAt = function(index) {
        _observerList.splice(index, 1);
    };
}

// Value delegation: request
function ValueRequest(request) {
    var _request = request;
    var _observers = new ObserverList();
    var _result;

    // Getters
    this.getRequest = function() {
        return _request;
    };

    this.getObservers = function() {
        return _observers;
    };

    this.getResult = function() {
        return _result || "";
    };

    // Setters
    this.setResult = function(result) {
        _result = result;
    };

    // Helpers
    this.appendObserver = function(observer) {
        // Sanity check
        if (_observers.indexOf(observer, 0) !== -1) {
            return -1;
        }

        _observers.append(observer);

        return 0;
    };
}

//=======================================================
// CGI Data
//=======================================================
// CGI data: data
function CGIData(name, command) {
    var _name = name;
    var _command = command;
    var _data = null;
    var _iteration = 0;
    var _chuckSize = 0;
    var _state = CGI_STATE_DOWNLOADING;
    var _numTry = 0;
    var _startTime = 0;
    var _handler = null;

    // Getters
    this.getName = function() {
        return _name;
    };

    this.getCommand = function() {
        return _command;
    };

    this.getData = function() {
        return _data;
    };

    this.getIteration = function() {
        return _iteration;
    };

    this.getChuckSize = function() {
        return _chuckSize;
    };

    this.getCurrentIndex = function() {
        return _iteration * _chuckSize;
    };

    this.getEndIndex = function() {
        // Sanity check
        if (_data === null) {
            return 0;
        }

        var endIndex = (_iteration + 1) * _chuckSize;

        if (endIndex > _data.length) {
            endIndex = _data.length;
        }

        return endIndex;
    }

    this.getState = function() {
        return _state;
    };

    this.getStartTime = function() {
        return _startTime;
    };

    this.getHandler = function() {
        return _handler;
    };

    // Setters
    this.setData = function(data, chuckSize) {
        _data = data;
        _chuckSize = chuckSize;
    };

    this.setState = function(state) {
        _state = state;
    };

    this.setHandler = function(handler) {
        _handler = handler;
    };

    // Helpers
    this.increaseIteration = function() {
        _iteration++;
    };

    this.nextIteration = function(index) {
        // Sanity check
        if (_data === null) {
            return false;
        }

        if (index < _data.length) {
            _iteration++;

            return true;
        }

        _state = CGI_STATE_PROCESSED;

        return false;
    };

    this.executeCommand = function(resetLimit) {
        if (resetLimit === true) {
            _numTry = 0;
        }

        if (_numTry === 3) {
            console.log("Stop executing command " + _command);
            return -1;
        }

        _numTry++;
        _state = CGI_STATE_DOWNLOADING
        eval(_command);

        return 0;
    };

    this.updateStartTime = function() {
        _startTime = new Date();
    };
}

// CGI data: handler
function handleCGIData(currentData, dependentDataStatus) {
    var currentHandler = currentData.getHandler();

    // Dependent data is not ready
    if (dependentDataStatus === true) {
        return true;
    }

    // Current data is processed
    if (currentData.getState() === CGI_STATE_PROCESSED) {
        return false;
    }

    return currentHandler(currentData);
}

// CGI data: processor
function processCGIData(data) {
    var continued = false;
    var currentTime = new Date();

    // Validate CGI data state
    for (var name in data) {
        if (data[name].getState() === CGI_STATE_DOWNLOADING) {
            continued = true;
        }
    }

    // Process CGI data
    if (continued === false) {
        // provision building blocks: block
        continued = handleCGIData(data[CGI_DATA_BLOCK], continued);

        // provision building blocks: blockelement
        continued = handleCGIData(data[CGI_DATA_BLOCKELEMENT], continued);

        // provision building blocks: element
        continued = handleCGIData(data[CGI_DATA_ELEMENT], continued);

        // Global list
        continued = handleCGIData(data[CGI_DATA_GLOBAL_LIST], continued);

        // Global type
        continued = handleCGIData(data[CGI_DATA_GLOBAL_TYPE], continued);

        // model-based provision: model
        continued = handleCGIData(data[CGI_DATA_MODEL], continued);

        // model-based provision: model alias
        continued = handleCGIData(data[CGI_DATA_MODEL_ALIAS], continued);

        // model-based provision: list
        continued = handleCGIData(data[CGI_DATA_MODEL_LIST], continued);

        // model-based provision: type
        continued = handleCGIData(data[CGI_DATA_MODEL_TYPE], continued);

        // model-based provision: property
        continued = handleCGIData(data[CGI_DATA_MODEL_PROPERTY], continued);

        // model-based provision: group
        continued = handleCGIData(data[CGI_DATA_MODEL_GROUP], continued);

        // model-based provision: groupfield
        continued = handleCGIData(data[CGI_DATA_MODEL_GROUPFIELD], continued);

        // model-based provision: field
        continued = handleCGIData(data[CGI_DATA_MODEL_FIELD], continued);

        // model-based provision: field mapping
        continued = handleCGIData(data[CGI_DATA_MODEL_FIELD_MAPPING], continued);

        // model-based provision: language
        continued = handleCGIData(data[CGI_DATA_MODEL_LANGUAGE], continued);

        // model-based provision: language extension
        continued = handleCGIData(data[CGI_DATA_MODEL_LANGUAGE_EXTENSION], continued);

        // model-based provision: image mapping
        continued = handleCGIData(data[CGI_DATA_MODEL_IMAGEMAPPING], continued);

        // model-based provision: image mapping region
        continued = handleCGIData(data[CGI_DATA_MODEL_IMAGEMAPPING_REGION], continued);

        // model-based provision: image mapping region link
        continued = handleCGIData(data[CGI_DATA_MODEL_IMAGEMAPPING_REGION_LINK], continued);

        // Data for both global and model: list item
        continued = handleCGIData(data[CGI_DATA_LIST_ITEM], continued);

        // Data for both global and model: type entity
        continued = handleCGIData(data[CGI_DATA_TYPE_ENTITY], continued);
    }

    return continued;
}

//=======================================================
// Main Library
//=======================================================
(function($) {
    var timers = new Timers();
    var initialized = 0;

    window.ZEROCONFIG = {
        _data: {
            cgiData: {},
            data: BLL.DataCollection,
            ready: 0,
            blocks: {},
            typeBlocks: {},
            blockelements: {},
            elements: {},
            globalListsById: {},
            globalTypes: {},
            globalTypesById: {},
            models: {},
            modelListsById: {},
            modelTypesById: {},
            modelGroups: {},
            modelGroupfields: {},
            modelFields: {},
            modelLanguages: {},
            modelMappings: {},
            modelMappingRegions: {}
        },
        reset: function() {
            console.log("Clear Cache data...");
            this._data.ready = 0;
            initialized = 0;
            BLL.DataCollection.reset();
        },
        init: function(callback) {
            if (initialized === 1){
              if (typeof callback === "function")
                  callback.call({});
              return;
            }

            console.log("Initialize...");
            // Initialize variables
            ZEROCONFIG._data.blocks = {};
            ZEROCONFIG._data.typeBlocks = {};
            ZEROCONFIG._data.blockelements = {};
            ZEROCONFIG._data.elements = {};
            ZEROCONFIG._data.globalListsById = {};
            ZEROCONFIG._data.globalTypes = {};
            ZEROCONFIG._data.globalTypesById = {};
            ZEROCONFIG._data.models = {};
            ZEROCONFIG._data.modelListsById = {};
            ZEROCONFIG._data.modelTypesById = {};
            ZEROCONFIG._data.modelGroups = {};
            ZEROCONFIG._data.modelGroupfields = {};
            ZEROCONFIG._data.modelFields = {};
            ZEROCONFIG._data.modelLanguages = {};
            ZEROCONFIG._data.modelMappings = {};
            ZEROCONFIG._data.modelMappingRegions = {};

            // provision building blocks: block
            var data = new CGIData(CGI_DATA_BLOCK,
                "ZEROCONFIG.connector.getAllBlocks()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // provision building blocks: blockelement
            data = new CGIData(CGI_DATA_BLOCKELEMENT,
                "ZEROCONFIG.connector.getAllBlockelements()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // provision building blocks: element
            data = new CGIData(CGI_DATA_ELEMENT,
                "ZEROCONFIG.connector.getAllElements()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // Global list
            data = new CGIData(CGI_DATA_GLOBAL_LIST,
                "ZEROCONFIG.connector.getAllGlobalLists()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // Global type
            data = new CGIData(CGI_DATA_GLOBAL_TYPE,
                "ZEROCONFIG.connector.getAllGlobalTypes()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: model
            data = new CGIData(CGI_DATA_MODEL,
                "ZEROCONFIG.connector.getAllModels()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            data = new CGIData(CGI_DATA_MODEL_ALIAS,
                "ZEROCONFIG.connector.getAllModelAliases()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: list
            data = new CGIData(CGI_DATA_MODEL_LIST,
                "ZEROCONFIG.connector.getAllModelLists()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: type
            data = new CGIData(CGI_DATA_MODEL_TYPE,
                "ZEROCONFIG.connector.getAllModelTypes()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: property
            data = new CGIData(CGI_DATA_MODEL_PROPERTY,
                "ZEROCONFIG.connector.getAllModelProperties()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: group
            data = new CGIData(CGI_DATA_MODEL_GROUP,
                "ZEROCONFIG.connector.getAllModelGroups()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: groupfield
            data = new CGIData(CGI_DATA_MODEL_GROUPFIELD,
                "ZEROCONFIG.connector.getAllModelGroupfields()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: field
            data = new CGIData(CGI_DATA_MODEL_FIELD,
                "ZEROCONFIG.connector.getAllModelFields()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: field mapping
            data = new CGIData(CGI_DATA_MODEL_FIELD_MAPPING,
                "ZEROCONFIG.connector.getAllModelFieldMappings()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: language
            data = new CGIData(CGI_DATA_MODEL_LANGUAGE,
                "ZEROCONFIG.connector.getAllModelLanguages()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: language extension
            data = new CGIData(CGI_DATA_MODEL_LANGUAGE_EXTENSION,
                "ZEROCONFIG.connector.getAllModelLanguageExtensions()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: image mapping
            data = new CGIData(CGI_DATA_MODEL_IMAGEMAPPING,
                "ZEROCONFIG.connector.getAllModelImageMappings()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: image mapping region
            data = new CGIData(CGI_DATA_MODEL_IMAGEMAPPING_REGION,
                "ZEROCONFIG.connector.getAllModelImageMappingRegions()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // model-based provision: image mapping region link
            data = new CGIData(CGI_DATA_MODEL_IMAGEMAPPING_REGION_LINK,
                "ZEROCONFIG.connector.getAllModelImageMappingRegionLinks()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // Data for both global and model: list item
            data = new CGIData(CGI_DATA_LIST_ITEM,
                "ZEROCONFIG.connector.getAllListItems()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // Data for both global and model: type entity
            data = new CGIData(CGI_DATA_TYPE_ENTITY,
                "ZEROCONFIG.connector.getAllTypeEntities()");
            ZEROCONFIG._data.cgiData[data.getName()] = data

            // Initialize modules
            ZEROCONFIG.valueDelegation.init();

            // Check Invalid Models
            ZEROCONFIG.connector.checkZeroConfigInvalidModels(null, false);

            // Start a timer to wait for parsing XML files
            (function checkParserStatus() {
                if (top.$.cookie('role') !== 'privilege_3') {
                    ZEROCONFIG.connector.getParserStatus().done(function(result) {
                        status = result.response.status;

                        // Get provision building blocks' data
                        if (status == 0) {
                            // Execute all required data
                            for (var name in ZEROCONFIG._data.cgiData) {
                                ZEROCONFIG._data.cgiData[name].executeCommand(false);
                            }

                            // Start a timer to process returned CGI data
                            timers.add(processCGIData, ZEROCONFIG._data.cgiData, function(data) {
                                ZEROCONFIG._data.ready = 1;

                                if (typeof callback === "function")
                                    callback.call({});
                            });
                            timers.start();
                        } else {
                            ZEROCONFIG._data.ready = -1;
                            setTimeout(checkParserStatus, 30 * 1000);
                        }
                    }).fail(function() {
                        console.warn("Failed to get the parser status");
                    });
                }
            })();

            initialized = 1;
        },
        getList: function(scope, model_id, name) {
            var list;

            if (scope === "global") {
                list = BLL.DataCollection.getGlobalLis(name);
            } else if (scope === "model") {
                var model = BLL.DataCollection.getModel(model_id);

                if (model !== "undefined") {
                    list = model.list(name);
                }
            }

            // Sanity check
            if (typeof(list) === "undefined") {
                return null;
            }

            // Update list items
            if (list.getSource()) {

            }

            return list;
        },
        isDataReady: function() {
            return ZEROCONFIG._data.ready;
        },
        dataFactory: function(str, sharedScope) {
            var container = [];
            var length = -1;

            // Sanity check
            if (!str) {
                return str;
            }

            // Tokenization
            length = str.length;
            if (str[0] == '{' && str[length - 1] == '}') {
                try {
                    container = JSON.parse(str);

                    for (var name in container) {
                        container[name] = ZEROCONFIG.dataFactory(container[name], sharedScope);
                    }

                    return container;
                } catch (e) {
                    return str;
                }
            } else {
                container = tokenization(str);
                length = container.length;

                for (var index = 0; index < length; index++) {
                    container[index] = parseToken(container[index], sharedScope);
                }

                return new DataContainer(container);
            }
        },
        // // Select object's type based on given string pattern
        // dataFactory: function (str, sharedScope) {
        //     var obj = null;
        //     var scope = null;
        //     var name = null;
        //     var indicator = null;
        //     var content = null;
        //     var contentList = null;
        //
        //     // Sanity check
        //     if (!str) {
        //         return str;
        //     }
        //
        //     indicator = str.charAt(0);
        //
        //     if (indicator === '$') {
        //         content = str.replace(/^\${/g, "").replace(/}$/g, "");
        //
        //         // Split share variable pattern
        //         if (content.search("::") !== -1) {
        //             contentList = content.split(/\s*(::)\s*/);
        //
        //             // Sanity check
        //             if (contentList.length !== 3) {
        //                 console.error("Invalid share variable pattern: " + content
        //                             + ", string: " + str);
        //                 return str;
        //             }
        //
        //             scope = contentList[0];
        //             name = contentList[2];
        //         }
        //         else {
        //             name = content;
        //         }
        //
        //         obj = new DataObject(str, VALUE_TYPE_SHARE_VARIABLE);
        //         obj.appendArgument(scope);
        //         obj.appendArgument(name);
        //         obj.__scope__ = sharedScope;
        //
        //         return obj;
        //     }
        //     else if (indicator === '[') {
        //         content = str.replace(/^\[/g, "").replace(/\]$/g, "");
        //         contentList = content.split(/,/g);
        //
        //         // Sanity check
        //         if (contentList.length < 2) {
        //             console.error("Invalid function variable pattern: " + content
        //                         + ", string: " + str);
        //             return str;
        //         }
        //
        //         if (contentList[0] === "F[concat]" && contentList.length === 3) {
        //             var arg1 = ZEROCONFIG.dataFactory(contentList[1].replace(/\s+/, ""), sharedScope);
        //             var arg2 = ZEROCONFIG.dataFactory(contentList[2].replace(/\s+/, ""), sharedScope);
        //
        //             obj = new DataObject(str, VALUE_TYPE_FUNC_CONCAT);
        //             obj.appendArgument(arg1);
        //             obj.appendArgument(arg2);
        //             obj.__scope__ = sharedScope;
        //
        //             return obj;
        //         }
        //
        //         console.error("Unrecognized function: " + contentList[0]
        //                           + ", string: " + str);
        //         return str;
        //     }
        //     else if (indicator === '{') {
        //         contentList = JSON.parse(str);
        //
        //         for (var name in contentList) {
        //             contentList[name] = ZEROCONFIG.dataFactory(contentList[name], sharedScope);
        //         }
        //
        //         return contentList;
        //     }
        //     else if (indicator === '\'') {
        //         return str.replace(/^'/g, "").replace(/'$/g, "");
        //     }
        //
        //     return str;
        // },
        valueDelegation: {
            _data: {
                requestQueues: {},
                pendingRequests: {}
            },
            init: function() {
                var queues = ZEROCONFIG.valueDelegation._data.requestQueues;

                queues["UCM"] = new RequestQueue("UCM");
                //                queues["form"] = new RequestQueue("form");
            },
            resetQueue: function(scope_name) {
                var queue;

                queue = ZEROCONFIG.valueDelegation._data.requestQueues[scope_name];

                if (typeof(queue) !== "undefined") {
                    ZEROCONFIG.valueDelegation._data.requestQueues[scope_name] = new RequestQueue(scope_name);
                }
            },
            splitor: function(name) {
                var pattern = /\s*(::)\s*/;

                return name.split(pattern);
            },
            getRequests: function(scope_name) {
                var queue;
                var requests;

                queue = ZEROCONFIG.valueDelegation._data.requestQueues[scope_name];

                if (typeof(queue) !== "undefined") {
                    requests = queue.getRequests();
                }

                return requests;
            },
            isBusy: function() {
                var queues = ZEROCONFIG.valueDelegation._data.requestQueues;

                for (var name in queues) {
                    if (queues[name].isBusy() === 1) {
                        return 1;
                    }
                }

                return 0;
            },
            setBusy: function(scope_name, busy) {
                var queue = ZEROCONFIG.valueDelegation._data.requestQueues[scope_name];

                if (queue === "undefined") {
                    console.error("No request queue for scope" + scope_name);
                    return;
                }

                queue.setBusy(busy);
            },
            appendRequest: function(request, observer) {
                var requestInfo = ZEROCONFIG.valueDelegation.splitor(request);
                var requests;

                // Sanity check
                if (requestInfo.length !== 3) {
                    console.warn("Invalid pattern, request: " + request);
                    return -1;
                }

                // The observer instance MUST implement update function
                if (!observer || typeof(observer.update) !== "function") {
                    console.warn("Invalid observer instance, request: " + request);
                    return -1;
                }

                requests = ZEROCONFIG.valueDelegation.getRequests(requestInfo[0]);

                if (typeof(requests) === "undefined") {
                    console.warn("Invalid request lists, scope: " + requestInfo[0] + ", name: " + requestInfo[2]);
                    return -1;
                }

                // If one of the current queues is busy,
                // we will put new requests into pending request queue.
                if (ZEROCONFIG.valueDelegation.isBusy() === 1) {
                    var pendingRequests = ZEROCONFIG.valueDelegation._data.pendingRequests;

                    if (typeof(pendingRequests[request]) === "undefined") {
                        pendingRequests[request] = new ValueRequest(request);
                    }

                    return pendingRequests[request].appendObserver(observer);
                }

                // Append new observer list
                if (typeof(requests[request]) === "undefined") {
                    requests[request] = new ValueRequest(request);
                }

                // Append new observe into the observer list
                return requests[request].appendObserver(observer);
            },
            notify: function(observers, name, value) {
                // Sanity check
                if (typeof(observers) === "undefined") {
                    console.error("Invalid observer lists, name: " + name + ", value: " + value);
                    return -1;
                }

                var observerCount = observers.count();

                for (var i = 0; i < observerCount; i++) {
                    observers.get(i).update(name, value);
                }

                return 0;
            },
            executeRequests: function(callback) {
                var queues = ZEROCONFIG.valueDelegation._data.requestQueues;
                var noRequest = 1;

                // Sanity check
                if (ZEROCONFIG.valueDelegation.isBusy() === 1) {
                    console.warn("Skip to execute current requests: Current queues are busy");
                    return -1;
                }

                // Set all queues with busy status
                for (var name in queues) {
                    queues[name].showInfo();

                    if (Object.keys(queues[name].getRequests()).length > 0) {
                        queues[name].setBusy(1);
                        noRequest = 0;
                    }
                }

                // Execute requests based on their queue name
                if (noRequest == 0) {
                    for (name in queues) {
                        console.log("[TK] Queue name: " + name + ", isBusy: " + queues[name].isBusy() +
                            ", keys: " + Object.keys(queues[name].getRequests()).toString());

                        if (name === "UCM") {
                            ZEROCONFIG.connector.getSharedVariables(queues[name].getRequests());
                        }
                    }
                }

                // Start a timer to monitor queues' status
                timers.add(function() {
                    // Handler
                    if (ZEROCONFIG.valueDelegation.isBusy() === 1) {
                        return true;
                    } else {
                        // Process pending requests
                        var pendingRequests = ZEROCONFIG.valueDelegation._data.pendingRequests;

                        for (var request in pendingRequests) {
                            var observers = pendingRequests[request].getObservers();

                            console.log("[TK] Pending requests: " + request + "Observers: ", observers);

                            for (var observer in observers) {
                                ZEROCONFIG.valueDelegation.appendRequest(request, observer);
                            }
                        }
                    }

                    return false;
                }, callback, function(callback) {
                    // Execute given callback
                    if (typeof callback === "function") {
                        callback.apply(null, [true]);
                    }
                });
            }
        },
        ValueMonitor: {
            _data: {
                _refs: {}
            },
            init: function() {
                ZEROCONFIG.ValueMonitor._data._refs = {};
            },
            register: function(ref, receiver) {
                var monitor = null;

                // The receiver instance MUST implement notify function
                if (!receiver || typeof(receiver.notify) !== "function") {
                    console.warn("Missing notify function, ref:", ref, " , receiver:", receiver);
                    return null;
                }

                // Monitor instance
                if (!(ref in ZEROCONFIG.ValueMonitor._data._refs)) {
                    ZEROCONFIG.ValueMonitor._data._refs[ref] = new ValueRequest(ref);
                }

                monitor = ZEROCONFIG.ValueMonitor._data._refs[ref];

                // Append new receiver
                monitor.appendObserver(receiver);

                return monitor.getResult();
            },
            updateValue: function(sender, ref, value) {
                var monitor = null;
                var observers = null;
                var observerCount = null;

                // Sanity check
                if (!sender) {
                    console.warn("Sender IS NULL");
                    return false;
                }

                // Monitor instance
                if (!(ref in ZEROCONFIG.ValueMonitor._data._refs)) {
                    ZEROCONFIG.ValueMonitor._data._refs[ref] = new ValueRequest(ref);
                }

                monitor = ZEROCONFIG.ValueMonitor._data._refs[ref];

                // Update reference's value
                monitor.setResult(value);

                // Notify receivers with updated reference's value
                observers = monitor.getObservers();
                observerCount = observers.count();

                for (var index = 0; index < observerCount; index++) {
                    var observer = observers.get(index);

                    if (observer !== sender) {
                        observer.notify(ref, value);
                    }
                }

                return true;
            },
            sync: function() {
                var monitor = null;
                var observers = null;
                var observerCount = null;

                for (var ref in ZEROCONFIG.ValueMonitor._data._refs) {
                    monitor = ZEROCONFIG.ValueMonitor._data._refs[ref];
                    observers = monitor.getObservers();
                    observerCount = observers.count();

                    for (var index = 0; index < observerCount; index++) {
                        console.log("[TK] ref: ", ref, ", value: ", monitor.getResult());
                        observers.get(index).notify(ref, monitor.getResult());
                    }
                }
            }
        },
        connector: {
            getAllBlocks: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_BLOCK];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllBlocks: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllBlocks"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_block, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var blocks = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = blocks[index];
                                    var block = new zc.Block(item.id,
                                        item.name,
                                        ZEROCONFIG.dataFactory(item.label),
                                        item.isType,
                                        item.visibility);
                                    if (item.isType === 0) {
                                        BLL.DataCollection.addBlock(block);
                                    } else {
                                        BLL.DataCollection.addTypeBlock(block);
                                    }
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllBlockelements: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_BLOCKELEMENT];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllBlockelements: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllBlockelements"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_blockelement, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var blockelements = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = blockelements[index];
                                    var block_id = item.block_id.toString(),
                                        block = BLL.DataCollection.getBlock(item.block_id);

                                    // Look at type blocks if given block id does not exist
                                    // on list of provision building blocks
                                    if (typeof(block) === "undefined") {
                                        block = BLL.DataCollection.getTypeBlock(item.block_id);
                                    }

                                    if (typeof(block) === "undefined") {
                                        console.warn("Invalid block id: " + item.block_id, item);
                                        continue;
                                    }

                                    var blockElement = new zc.BlockElement(item.id,
                                        item.name,
                                        ZEROCONFIG.dataFactory(item.label),
                                        item.visibility);
                                    block.appendItem(blockElement);
                                    ZEROCONFIG._data.blockelements[item.id] = blockElement;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllElements: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_ELEMENT];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllElements: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllElements"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_element, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var elements = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = elements[index];
                                    var blockelement_id = elements[index].blockelement_id.toString(),
                                        blockelement = ZEROCONFIG._data.blockelements[blockelement_id];

                                    if (typeof(blockelement) === "undefined") {
                                        console.warn("Invalid blockelement id: " + blockelement_id, item);
                                        continue;
                                    }

                                    var element = new zc.Element(item.id,
                                        item.name,
                                        ZEROCONFIG.dataFactory(item.label),
                                        item.type,
                                        ZEROCONFIG.dataFactory(item.defaultValue),
                                        ZEROCONFIG.dataFactory(item.tooltip),
                                        item.regex,
                                        ZEROCONFIG.dataFactory(item.validation),
                                        item.monitor,
                                        ZEROCONFIG.dataFactory(item.maxoccurs),
                                        item.visibility);

                                    blockelement.appendItem(element);
                                    ZEROCONFIG._data.elements[item.id] = element;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllGlobalLists: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_GLOBAL_LIST];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllGlobalLists: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllGlobalLists",
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_global_list, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var lists = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var list = new zc.List(lists[index].id,
                                        lists[index].name,
                                        ZEROCONFIG.dataFactory(lists[index].source),
                                        lists[index].default_label,
                                        lists[index].default_value);

                                    BLL.DataCollection.setGlobalList(lists[index].name, list);
                                    ZEROCONFIG._data.globalListsById[lists[index].id] = list;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllListItems: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_LIST_ITEM];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllListItems: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllListItems",
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_list_item, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var items = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    // Scope handling
                                    var list,
                                        list_id = items[index].list_id.toString();

                                    if (items[index].scope_name === "global") {
                                        list = ZEROCONFIG._data.globalListsById[list_id];
                                    } else if (items[index].scope_name === "model") {
                                        list = ZEROCONFIG._data.modelListsById[list_id];
                                    }

                                    // Sanity check
                                    if (typeof(list) === "undefined") {
                                        console.warn("Invalid list:" + list_id, items[index]);

                                        continue;
                                    }

                                    list.appendItem(ZEROCONFIG.dataFactory(items[index].label),
                                        ZEROCONFIG.dataFactory(items[index].value));
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllGlobalTypes: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_GLOBAL_TYPE];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllGlobalTypes: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllGlobalTypes",
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_global_type, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var types = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = types[index];
                                    var type = new zc.CustomElementType(item.id,
                                        item.name,
                                        item.view);

                                    BLL.DataCollection.setGlobalType(item.name, type);
                                    ZEROCONFIG._data.globalTypesById[item.id] = type;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllTypeEntities: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_TYPE_ENTITY];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllTypeEntities: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllTypeEntities",
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_type_entity, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var entities = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = entities[index];
                                    // Scope handling
                                    var type,
                                        type_id = entities[index].type_id.toString();

                                    if (entities[index].scope_name === "global") {
                                        type = ZEROCONFIG._data.globalTypesById[type_id];
                                    } else if (entities[index].scope_name === "model") {
                                        type = ZEROCONFIG._data.modelTypesById[type_id];
                                    }

                                    // Sanity check
                                    if (typeof(type) === "undefined") {
                                        console.warn("Invalid type:" + type_id, item);

                                        continue;
                                    }

                                    var entity = new zc.DataEntity(item.name,
                                        ZEROCONFIG.dataFactory(item.defaultValue),
                                        item.regex,
                                        ZEROCONFIG.dataFactory(item.validation));

                                    type.dataEntities(item.name, entity);
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModels: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModels: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModels"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var models = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = models[index];
                                    var model = new zc.Model(item.id,
                                        item.type,
                                        item.vendor,
                                        item.name,
                                        item.image_path,
                                        item.base_version,
                                        item.xml_version);

                                    BLL.DataCollection.setModel(item.id, model);
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelAliases: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_ALIAS];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelAliases: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelAliases"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_alias, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var aliases = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = aliases[index];
                                    BLL.DataCollection.setModelAlias(item.model_id, item.origin_id);
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelProperties: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_PROPERTY];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelProperties: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelProperties"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_property, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var properties = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = properties[index];
                                    var model = BLL.DataCollection.getModel(item.model_id);

                                    if (typeof(model) === "undefined") {
                                        console.warn("Invalid model id: " + item.model_id, item);
                                        continue;
                                    }

                                    model.updateProperty(item.name,
                                        item.value);
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelLists: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_LIST];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelLists: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelLists"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_list, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var lists = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = lists[index];
                                    var model = BLL.DataCollection.getModel(item.model_id);

                                    if (typeof(model) === "undefined") {
                                        console.warn("Invalid model id:" + item.model_id, item);
                                        continue;
                                    }

                                    var list = new zc.List(item.id,
                                        item.name,
                                        item.source,
                                        item.default_label,
                                        item.default_value);

                                    model.updateList(item.name, list);
                                    ZEROCONFIG._data.modelListsById[item.id] = list;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelTypes: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_TYPE];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelTypes: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelTypes"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_type, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var types = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = types[index];
                                    var model = BLL.DataCollection.getModel(item.model_id);

                                    if (typeof(model) === "undefined") {
                                        console.warn("Invalid model id: " + item.model_id, item);
                                        continue;
                                    }

                                    var type = new BLL.CustomElementType(item.id,
                                        item.name,
                                        item.view);

                                    model.updateType(item.name, type);
                                    ZEROCONFIG._data.modelTypesById[item.id] = type;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelGroups: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_GROUP];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelGroups: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelGroups"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_group, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var groups = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = groups[index];
                                    var model = BLL.DataCollection.getModel(item.model_id);

                                    if (typeof(model) === "undefined") {
                                        console.warn("Invalid model id: " + item.model_id, item);
                                        continue;
                                    }

                                    var group = new zc.ModelGroup(item.id,
                                        item.name,
                                        ZEROCONFIG.dataFactory(item.label),
                                        item.visibility);
                                    model.updateGroup(item.id, group);
                                    ZEROCONFIG._data.modelGroups[item.id] = group;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelGroupfields: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_GROUPFIELD];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelGroupfields: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelGroupfields"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_groupfield, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var groupfields = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = groupfields[index];
                                    var group_id = item.group_id.toString(),
                                        group = ZEROCONFIG._data.modelGroups[group_id];

                                    if (typeof(group) === "undefined") {
                                        console.warn("Invalid group id: " + group_id, item);
                                        continue;
                                    }

                                    var groupfield = new zc.ModelGroupfield(item.id,
                                        item.name,
                                        ZEROCONFIG.dataFactory(item.label),
                                        item.visibility,
                                        item.associatedfield);
                                    group.appendItem(groupfield);
                                    ZEROCONFIG._data.modelGroupfields[item.id] = groupfield;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelFields: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_FIELD];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelFields: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelFields"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_field, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var fields = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = fields[index];
                                    var groupfield_id = item.groupfield_id.toString(),
                                        groupfield = ZEROCONFIG._data.modelGroupfields[groupfield_id];

                                    if (typeof(groupfield) === "undefined") {
                                        console.warn("Invalid groupfield id: " + groupfield_id, item);
                                        continue;
                                    }

                                    var element = ZEROCONFIG._data.elements[item.element_id];
                                    var field;

                                    // Override field information based on element information
                                    // if fieldreused
                                    if (element !== undefined) {
                                        // default value can be overridden in fieldreused
                                        if (!item.defaultValue) {
                                            item.defaultValue = element.defaultValue;
                                        } else {
                                            item.defaultValue = ZEROCONFIG.dataFactory(item.defaultValue);
                                        }

                                        field = new zc.ModelField(item.id,
                                            item.name,
                                            item.label ? ZEROCONFIG.dataFactory(item.label) : element.label,
                                            element.type,
                                            item.defaultValue,
                                            element.tooltip,
                                            element.validateRegex,
                                            element.validateError,
                                            item.monitor ? item.monitor : element.monitor,
                                            item.visibility,
                                            item.associatedfield,
                                            item.element_id,
                                            item.element_number);
                                    } else {
                                        field = new zc.ModelField(item.id,
                                            item.name,
                                            ZEROCONFIG.dataFactory(item.label),
                                            item.type,
                                            ZEROCONFIG.dataFactory(item.defaultValue),
                                            ZEROCONFIG.dataFactory(item.tooltip),
                                            item.regex,
                                            ZEROCONFIG.dataFactory(item.validation),
                                            item.monitor,
                                            item.visibility,
                                            item.associatedfield,
                                            item.element_id,
                                            item.element_number);

                                    }

                                    groupfield.appendItem(field);
                                    ZEROCONFIG._data.modelFields[fields[index].id] = field;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelFieldMappings: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_FIELD_MAPPING];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelFieldMappings: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelFieldMappings"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_field_mapping, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var mappings = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = mappings[index],
                                        field_id = item.field_id.toString(),
                                        field = ZEROCONFIG._data.modelFields[field_id];

                                    if (typeof(field) === "undefined") {
                                        console.warn("Invalid field id: " + field_id, item);
                                        continue;
                                    }

                                    field.mappings[item.devname] = item.name;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelLanguages: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_LANGUAGE];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelLanguages: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelLanguages"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_language, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var languages = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = languages[index];
                                    var model = BLL.DataCollection.getModel(item.model_id);

                                    if (typeof(model) === "undefined") {
                                        console.warn("Invalid model id: " + item.model_id, item);
                                        continue;
                                    }

                                    var language = new BLL.ModelLanguage(item.id,
                                        item.name,
                                        ZEROCONFIG.dataFactory(item.defaultValue));
                                    model.updateLanguage(item.name, language);
                                    ZEROCONFIG._data.modelLanguages[item.id] = language;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelLanguageExtensions: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_LANGUAGE_EXTENSION];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelLanguageExtensions: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelLanguageExtensions"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_language_extension, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var extensions = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = extensions[index];
                                    var language_id = item.language_id.toString(),
                                        language = ZEROCONFIG._data.modelLanguages[language_id];

                                    if (typeof(language) === "undefined") {
                                        console.warn("Invalid language id: " + language_id, item);
                                        continue;
                                    }

                                    language.extensions[item.code] = item.value;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelImageMappings: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_IMAGEMAPPING];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelImageMappings: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelImageMappings"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_imagemapping, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var mappings = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = mappings[index];
                                    var model = BLL.DataCollection.getModel(item.model_id);
                                    var mapping = null;

                                    if (typeof(model) === "undefined") {
                                        console.warn("Invalid model id: " + item.model_id, item);
                                        continue;
                                    }

                                    mapping = new zc.ImageMapping(item.id, item.path);
                                    model.setImageMapping(item.id, mapping);
                                    ZEROCONFIG._data.modelMappings[item.id] = mapping;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelImageMappingRegions: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_IMAGEMAPPING_REGION];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelImageMappingRegions: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelImageMappingRegions"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_imagemapping_region, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var regions = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = regions[index];
                                    var mapping = ZEROCONFIG._data.modelMappings[item.image_id];
                                    var region = null;

                                    if (typeof(mapping) === "undefined") {
                                        console.warn("Invalid image mapping: " + item);
                                        continue;
                                    }

                                    region = new zc.ImageMappingRegion(item.id, item.x, item.y,
                                        item.width, item.height);
                                    mapping.appendRegion(item.id, region);
                                    ZEROCONFIG._data.modelMappingRegions[item.id] = region;
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            getAllModelImageMappingRegionLinks: function() {
                var myData = ZEROCONFIG._data.cgiData[CGI_DATA_MODEL_IMAGEMAPPING_REGION_LINK];

                // Sanity check
                if (typeof(myData) === "undefined") {
                    console.log("getAllModelImageMappingRegionLinks: Failed to get cgiData");
                    return;
                }

                // Update the start time to execute this function
                myData.updateStartTime();

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelImageMappingRegionLinks"
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            myData.setData(data.response.zc_model_imagemapping_region_link, CGI_DATA_CHUCK_SIZE);
                            myData.setState(CGI_STATE_DOWNLOADED);
                            myData.setHandler(function(arg) {
                                var links = arg.getData(),
                                    index = arg.getCurrentIndex(),
                                    endIndex = arg.getEndIndex();

                                for (index; index < endIndex; index++) {
                                    var item = links[index];
                                    var region = ZEROCONFIG._data.modelMappingRegions[item.region_id];
                                    var link = null;

                                    if (typeof(region) === "undefined") {
                                        console.warn("Invalid image mapping region: " + item);
                                        continue;
                                    }

                                    link = new zc.ImageMappingRegionLink(item.page_name,
                                        item.scope_name, item.level1,
                                        item.level2, item.level3);
                                    region.appendLink(item.page_name, link);
                                }

                                return arg.nextIteration(index);
                            });
                        }
                    }
                });
            },
            // Provision Template
            // Type can be global, model, or all.
            getAllTemplates: function(type, filter) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllTemplates",
                        template_type: type,
                        filter: filter || ""
                    },
                    async: true,
                });
            },
            getAllModelTemplates: function(modelId, enabled) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getAllModelTemplates",
                        model_id: modelId,
                        enabled: enabled || ""
                    },
                    async: true,
                });
            },
            getTemplate: function(id) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getTemplate",
                        id: id
                    },
                    async: true,
                });
            },
            getTemplateByName: function(name, modelId) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getTemplateByName",
                        name: name.toString(),
                        model_id: modelId || ""
                    },
                    async: false // purposely make it not sync call
                });
            },
            // If id is -1, this operation will insert new template;
            // otherwise, update given template id.
            // If modelId is null, the template type is global; otherwise, model.
            updateTemplate: function(id, name, modelId, description, enabled, isDefault) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "updateTemplate",
                        id: id,
                        name: name,
                        model_id: modelId,
                        description: description,
                        enabled: enabled,
                        is_default: isDefault,
                        last_modified: 0
                    },
                    async: true,
                });
            },
            deleteTemplate: function(id) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteTemplate",
                        id: id.toString()
                    },
                    async: true,
                });
            },
            toggleTemplateEnable: function(id) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "toggleTemplateEnable",
                        id: id.toString()
                    },
                    async: true,
                });
            },
            // Provision template settings
            getTemplateSettings: function(templateId) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getTemplateSettings",
                        template_id: templateId
                    },
                    async: true,
                });
            },
            updateTemplateSettings: function(templateId, elementId, elementNumber, entityName, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "updateTemplateSettings",
                        template_id: templateId.toString(),
                        element_id: elementId.toString(),
                        element_number: elementNumber.toString(),
                        entity_name: entityName.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            deleteTemplateSettings: function(templateId, elementId, elementNumber, entityName) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteTemplateSettings",
                        template_id: templateId.toString(),
                        element_id: elementId.toString(),
                        element_number: elementNumber.toString(),
                        entity_name: entityName.toString()
                    },
                    async: true,
                });
            },
            deleteAllTemplateSettings: function(templateId) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteAllTemplateSettings",
                        template_id: templateId.toString()
                    },
                    async: true,
                });
            },
            // Provision model template settings
            getModelTemplateSettings: function(templateId) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getModelTemplateSettings",
                        template_id: templateId
                    },
                    async: true,
                });
            },
            updateModelTemplateSettings: function(templateId, fieldId, entityName, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "updateModelTemplateSettings",
                        template_id: templateId.toString(),
                        field_id: fieldId.toString(),
                        entity_name: entityName.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            deleteModelTemplateSettings: function(templateId, fieldId, entityName) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteModelTemplateSettings",
                        template_id: templateId.toString(),
                        field_id: fieldId.toString(),
                        entity_name: entityName.toString()
                    },
                    async: true,
                });
            },
            deleteAllModelTemplateSettings: function(templateId) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteAllModelTemplateSettings",
                        template_id: templateId.toString()
                    },
                    async: true,
                });
            },
            // Provision model template custom settings
            getModelTemplateCustomSettings: function(templateId) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getModelTemplateCustomSettings",
                        template_id: templateId
                    },
                    async: true,
                });
            },
            updateModelTemplateCustomSettings: function(templateId, devName, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "updateModelTemplateCustomSettings",
                        template_id: templateId.toString(),
                        devname: devName.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            deleteModelTemplateCustomSettings: function(templateId, devName) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteModelTemplateCustomSettings",
                        template_id: templateId.toString(),
                        devname: devName.toString()
                    },
                    async: true,
                });
            },
            deleteAllModelTemplateCustomSettings: function(templateId) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteAllModelTemplateCustomSettings",
                        template_id: templateId.toString()
                    },
                    async: true,
                });
            },
            // Provision device template mapping
            getDeviceTemplateMappings: function(mac) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getDeviceTemplateMappings",
                        mac: mac
                    },
                    async: true,
                });
            },
            updateDeviceTemplateMappings: function(mac, templateId, priority) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "updateDeviceTemplateMappings",
                        mac: mac.toString(),
                        template_id: templateId.toString(),
                        priority: priority.toString()
                    },
                    async: true,
                });
            },
            deleteDeviceTemplateMappings: function(mac, keepModelTemps) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteDeviceTemplateMappings",
                        mac: mac.toString(),
                        keepModelTemplates: keepModelTemps.toString()
                    },
                    async: true,
                });
            },
            // Provision device settings
            getDeviceSettings: function(mac) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getDeviceSettings",
                        mac: mac
                    },
                    async: true,
                });
            },
            insertDeviceSettings: function(mac, fieldId, entityName, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "insertDeviceSettings",
                        mac: mac.toString(),
                        field_id: fieldId.toString(),
                        entity_name: entityName.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            updateDeviceSettings: function(mac, fieldId, entityName, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "updateDeviceSettings",
                        mac: mac.toString(),
                        field_id: fieldId.toString(),
                        entity_name: entityName.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            deleteDeviceSettings: function(mac, fieldId, entityName) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteDeviceSettings",
                        mac: mac.toString(),
                        field_id: fieldId.toString(),
                        entity_name: entityName.toString()
                    },
                    async: true,
                });
            },
            deleteAllDeviceSettings: function(mac) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteAllDeviceSettings",
                        mac: mac.toString()
                    },
                    async: true,
                });
            },
            // Provision device custom settings
            getDeviceCustomSettings: function(mac) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getDeviceCustomSettings",
                        mac: mac
                    },
                    async: true,
                });
            },
            insertDeviceCustomSettings: function(mac, devname, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "insertDeviceCustomSettings",
                        mac: mac.toString(),
                        devname: devname.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            updateDeviceCustomSettings: function(mac, devname, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "updateDeviceCustomSettings",
                        mac: mac.toString(),
                        devname: devname.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            deleteDeviceCustomSettings: function(mac, devname) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteDeviceCustomSettings",
                        mac: mac.toString(),
                        devname: devname.toString()
                    },
                    async: true,
                });
            },
            deleteAllDeviceCustomSettings: function(mac) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteAllDeviceCustomSettings",
                        mac: mac.toString()
                    },
                    async: true,
                });
            },
            // Provision device type settings
            getDeviceTypeSettings: function(mac) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getDeviceTypeSettings",
                        mac: mac
                    },
                    async: true,
                });
            },
            insertDeviceTypeSettings: function(mac, elementId, elementNumber, entityName, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "insertDeviceTypeSettings",
                        mac: mac.toString(),
                        element_id: elementId.toString(),
                        element_number: elementNumber.toString(),
                        entity_name: entityName.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            updateDeviceTypeSettings: function(mac, elementId, elementNumber, entityName, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "updateDeviceTypeSettings",
                        mac: mac.toString(),
                        element_id: elementId.toString(),
                        element_number: elementNumber.toString(),
                        entity_name: entityName.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            deleteDeviceTypeSettings: function(mac, elementId, elementNumber, entityName) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteDeviceTypeSettings",
                        mac: mac.toString(),
                        element_id: elementId.toString(),
                        element_number: elementNumber.toString(),
                        entity_name: entityName.toString()
                    },
                    async: true,
                });
            },
            checkDeviceTypeSettings: function(mac, elementId, elementNumber, entityName, value) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "checkDeviceTypeSettings",
                        mac: mac.toString(),
                        element_id: elementId.toString(),
                        element_number: elementNumber.toString(),
                        entity_name: entityName.toString(),
                        value: value.toString()
                    },
                    async: true,
                });
            },
            deleteAllDeviceTypeSettings: function(mac, keepExtensions) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "deleteAllDeviceTypeSettings",
                        mac: mac.toString(),
                        keepExtensions: keepExtensions.toString()
                    },
                    async: true,
                });
            },
            getZeroConfigPreview: function(mac, modelid, globaltemplates, modeltemplates) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getZeroConfigPreview",
                        mac: mac.toString(),
                        modelid: modelid.toString(),
                        globalTemps: globaltemplates.toString(),
                        modelTemps: modeltemplates.toString()
                    },
                    async: true,
                });
            },
            getZeroConfigCustomSettings: function(mac, modelid, modeltemplates) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getZeroConfigCustomSettings",
                        mac: mac.toString(),
                        model_id: modelid.toString(),
                        modelTemps: modeltemplates.toString()
                    },
                    async: true,
                });
            },
            // Share variabiles
            getSharedVariables: function(requests) {
                // Sanity check
                if (typeof(requests) === "undefined") {
                    return null;
                }

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "getSharedVariables",
                        requests: Object.keys(requests).toString()
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error: " + textStatus);
                    },
                    success: function(data) {
                        var noError = UCMGUI.errorHandler(data);

                        if (noError) {
                            var responses = data.response;
                            var requests = ZEROCONFIG.valueDelegation.getRequests("UCM");

                            for (var name in responses) {
                                var request = requests[name];

                                if (request !== "undefined") {
                                    ZEROCONFIG.valueDelegation.notify(request.getObservers(),
                                        name,
                                        responses[name]);
                                } else {
                                    console.error("Failed to get the request " + name +
                                        " on UCM queue, data", responses[name]);
                                }
                            }
                        }

                        // Clean up UCM queue
                        ZEROCONFIG.valueDelegation.resetQueue("UCM");
                        ZEROCONFIG.valueDelegation.setBusy("UCM", 0);
                    }
                });
            },
            getZeroConfig: function(mac, ip) {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        "action": "getZeroConfig",
                        "mac": mac,
                        "original_ip": ip,
                        "ip": "",
                        "version": "",
                        "vendor": "",
                        "model": "",
                        "members": "",
                        "hot_desking": ""
                    }
                })
            },
            getParserStatus: function() {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        "action": "getParserStatus"
                    }
                })
            },
            getAllDeviceExtensions: function() {
                return $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        "action": "getAllDeviceExtensions"
                    }
                })
            },
            // View interfaces
            listZeroConfigDirectory: function(path, option) {
                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "listZeroConfigDirectory",
                        rootdir: path,
                        options: option
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error");
                    },
                    success: function(data) {
                        // Responses are pairs of directory/file name and type.
                        // If type is 0, the name is a file.
                        // If type is 1, the name is a directory.
                        console.warn("success");
                    }
                });
            },
            saveZeroConfigFile: function(data, destdir, filename) {
                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: "saveZeroConfigFile",
                        data: data,
                        rootdir: destdir,
                        filename: filename
                    },
                    async: true,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.warn("error");
                    },
                    success: function(data) {
                        // Response is the file path saved under given destination.
                        console.warn("success");
                    }
                });
            },
            checkZeroConfigInvalidModels: function(source, flagJump) {
                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        "action": "checkZeroConfigInvalidModels"
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                    },
                    success: function(result) {
                        var bool = UCMGUI.errorHandler(result, function () {
                        });
                        if (bool) {
                            var response = result.response;
                            response.warning_msg = top.$.lang("LANG4489");
                            response.go_restore = top.$.lang("LANG4490");
                            response.restore_here = top.$.lang("LANG4491");

                            var numOfInvalidModel = response.models.length;
                            BLL.DataCollection.resetInvalidModel();
                            if (numOfInvalidModel > 0) {
                                for (var i = 0; i < numOfInvalidModel; i++) {
                                    BLL.DataCollection.setInvalidModel(i, response.models[i]);
                                }
                                if (source == null) {
                                    return;
                                }
                                var template = Handlebars.compile(source);
                                var responsehtml = template(response);
                                var dissmiss_warning =  top.$.cookie('dismiss_zcmodel_missing_warning');
                                if (dissmiss_warning != 'yes') {
                                    top.dialog.clearDialog();
                                    top.dialog.dialogConfirm({
                                        confirmStr: responsehtml,
                                        buttons: {
                                            ok: function() {
                                              if (flagJump == true)
                                                top.frames['frameContainer'].module.jumpMenu('zc_template_management.html');
                                            },
                                            cancel: function() {
                                                top.dialog.dialogConfirm({
                                                    confirmStr: top.$.lang("LANG4466"),
                                                    buttons: {
                                                        ok: function() {
                                                          top.$.cookie('dismiss_zcmodel_missing_warning', 'yes');
                                                        },
                                                        cancel: function() {

                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
            }
        }
    }
})(jQuery);

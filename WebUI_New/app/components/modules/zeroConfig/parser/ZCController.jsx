import $ from 'jquery'
import api from "../../../api/api"
import UCMGUI from "../../../api/ucmgui"

/********************************************************/
/*                  Internal Functions                  */
/********************************************************/

// =======================================================
// Central Timer Control: manage multiple handlers
// This implement is based on Resign J. and Bibeault B.,
// Secrets of the JavaScript Ninja
// =======================================================
// Central timer control: timer
function Timer(handler, data, callback) {
    this._handler = handler
    this._data = data
    this._callback = callback

    // Getters
    this.getHandler = () => this._handler

    this.getData = () => this._data

    this.getCallback = () => this._callback
}

// =======================================================
// Value Delegation
// =======================================================
// Value delegation: request queue
function RequestQueue(name) {
    this._name = name
    this._requests = {}
    this._isBusy = 0

    // Getters
    this.getName = () => this._name

    this.getRequests = () => this._requests

    this.isBusy = () => this._isBusy

    // Setters
    this.setBusy = busy => {
        this._isBusy = busy
    }

    this.showInfo = () => {
        console.log("RequestQueue", this._name, this._requests, this._isBusy)
    }
}

// Value delegation: observer list
// This implementation is based on Learning JavaScript Design Patterns by Addy Osmani
// http://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript
function ObserverList() {
    this._observerList = []

    this.append = observer => this._observerList.push(observer)

    this.count = () => this._observerList.length

    this.get = index => {
        if (index > -1 && index < this._observerList.length) {
            return this._observerList[index]
        }

        return null
    }

    this.indexOf = (observer, startIndex) => {
        let i = startIndex

        while (i < this._observerList.length) {
            if (this._observerList[i] === observer) {
                return i
            }

            i++
        }

        return -1
    }

    this.removeAt = index => {
        this._observerList.splice(index, 1)
    }
}

// Value delegation: request
function ValueRequest(request) {
    this._request = request
    this._observers = new ObserverList()
    this._result

    // Getters
    this.getRequest = () => this._request

    this.getObservers = () => this._observers

    this.getResult = () => this._result || ""

    // Setters
    this.setResult = result => {
        this._result = result
    }

    // Helpers
    this.appendObserver = observer => {
        // Sanity check
        if (this._observers.indexOf(observer, 0) !== -1) {
            return -1
        }

        this._observers.append(observer)

        return 0
    }
}

/********************************************************/
/*                  Shared Functions                    */
/********************************************************/

// Central timer control: controller
let Timers = function () {
    this._timerId = 0
    this._timers = []
}

Timers.prototype = {
    add: function(handler, data, callback) {
        // Sanity check
        if (typeof (handler) !== "function") {
            console.log("handler is invalid")
            return -1
        }

        this._timers.push(new Timer(handler, data, callback))

        return 0
    },
    start: function() {
        if (this._timerId) {
            return
        }

        let timerHandler = () => {
            if (this._timers.length > 0) {
                for (let index = 0; index < this._timers.length; index++) {
                    let timer = this._timers[index],
                        handler = timer.getHandler(),
                        data = timer.getData(),
                        callback = timer.getCallback()
                    if (handler(data) === false) {
                        // Execute given call back
                        if (typeof (callback) === "function") {
                            callback(data)
                        }

                        // Remove current timer
                        this._timers.splice(index, 1)
                        index--
                    }
                }
            }

            this._timerId = setTimeout(timerHandler, 0)
        }
        timerHandler()
    },
    stop: function() {
        clearTimeout(this._timerId)
        this._timerId = 0
    }
}

let ConfigPage = function() {
    this.m_modelId = -1
    this.m_currentType = ""
    this.m_currentItem = null
    this.m_noTypeOverride = false
    this.m_document = document
    this.m_window = window
    this.m_lastModify = null
    this.m_pageMode = ""
    this.m_current_dev = null
    this.m_current_mac = null
    this.m_modelInfo = null
}

ConfigPage.prototype = {
    updateCurrentDevice: function(dev) {
        this.m_current_dev = dev
        this.m_current_mac = $(this.m_current_dev['mac']).text()
    }, 
    updatePageDOM: function(mode, window, document) {
        this.m_pageMode = mode
        this.m_window = window
        this.m_document = document
    },
    updatePageConfig: function(mid, model, loadedType, loadedItem, noTypeOverride) {
        this.m_modelId = mid
        this.m_currentType = loadedType
        this.m_currentItem = loadedItem
        this.m_noTypeOverride = noTypeOverride

        if (model) {
            this.m_modelInfo = model
            // TODO: WL figure out what registerCustomLangauge
            // model.registerCustomLangauge()
        }

        // reset everytime when updatePageConfig is called
        this.m_lastModify = null
    },
    currentDevice: function() {
        return this.m_current_dev
    }, 
    currentMac: function() {
        return this.m_current_mac
    },
    loadedType: function() {
        return this.m_currentType
    },
    loadedItem: function() {
        return this.m_currentItem
    }, 
    modelId: function() {
        return this.m_modelId
    },
    noTypeOverride: function() {
        return this.m_noTypeOverride
    }, 
    modelInfo: function() {
        return this.m_modelInfo
    }, 
    mode: function() {
        return this.m_pageMode
    },
    currentDocument: function() {
        return this.m_document
    },
    currentWindow: function() {
        return this.m_window
    },
    pageModified: function() {
        return this.m_lastModify != null
    },
    updateModifiedInput: function(ipt) {
        if (ipt) {
            this.m_lastModify = ipt
        }
    },
    resetStatus: function() {
        this.m_modelId = -1
        this.m_currentType = ""
        this.m_currentItem = null
        this.m_noTypeOverride = false

        this.m_document = document
        this.m_window = window
        this.m_lastModify = null
        this.m_pageMode = ""
        this.m_current_dev = null
        this.m_modelInfo = null
    }
}

let ValueDelegation = function() {
    this._data = {
        requestQueues: {},
        pendingRequests: {}
    }
}

ValueDelegation.prototype = {
    init: function() {
        let queues = this._data.requestQueues

        queues["UCM"] = new RequestQueue("UCM")
    },
    resetQueue: function(scope_name) {
        const queue = this._data.requestQueues[scope_name]

        if (typeof (queue) !== "undefined") {
            this._data.requestQueues[scope_name] = new RequestQueue(scope_name)
        }
    },
    splitor: function(name) {
        const pattern = /\s*(::)\s*/

        return name.split(pattern)
    },
    getRequests: function(scope_name) {
        const queue = this._data.requestQueues[scope_name]
        let requests
        if (typeof (queue) !== "undefined") {
            requests = queue.getRequests()
        }
        return requests
    },
    isBusy: function() {
        const queues = this._data.requestQueues

        for (const name in queues) {
            if (queues[name].isBusy() === 1) {
                return 1
            }
        }

        return 0
    },
    setBusy: function(scope_name, busy) {
        let queue = this._data.requestQueues[scope_name]

        if (queue === "undefined") {
            console.error("No request queue for scope" + scope_name)
            return
        }

        queue.setBusy(busy)
    },
    appendRequest: function(request, observer) {
        const requestInfo = this.splitor(request)
        let requests

        // Sanity check
        if (requestInfo.length !== 3) {
            console.warn("Invalid pattern, request: " + request)
            return -1
        }

        // The observer instance MUST implement update function
        if (!observer || typeof (observer.update) !== "function") {
            console.warn("Invalid observer instance, request: " + request)
            return -1
        }

        requests = this.getRequests(requestInfo[0])

        if (typeof (requests) === "undefined") {
            console.warn("Invalid request lists, scope: " + requestInfo[0] + ", name: " + requestInfo[2])
            return -1
        }

        // If one of the current queues is busy,
        // we will put new requests into pending request queue.
        if (this.isBusy() === 1) {
            let pendingRequests = this._data.pendingRequests

            if (typeof (pendingRequests[request]) === "undefined") {
                pendingRequests[request] = new ValueRequest(request)
            }

            return pendingRequests[request].appendObserver(observer)
        }

        // Append new observer list
        if (typeof (requests[request]) === "undefined") {
            requests[request] = new ValueRequest(request)
        }

        // Append new observe into the observer list
        return requests[request].appendObserver(observer)
    },
    notify: function(observers, name, value) {
        // Sanity check
        if (typeof (observers) === "undefined") {
            console.error("Invalid observer lists, name: " + name + ", value: " + value)
            return -1
        }

        let observerCount = observers.count()

        for (let i = 0; i < observerCount; i++) {
            observers.get(i).update(name, value)
        }

        return 0
    },
    executeRequests: function(callback) {
        let queues = this._data.requestQueues
        let noRequest = 1

        // Sanity check
        if (this.isBusy() === 1) {
            console.warn("Skip to execute current requests: Current queues are busy")
            return -1
        }

        // Set all queues with busy status
        for (const name in queues) {
            queues[name].showInfo()

            if (Object.keys(queues[name].getRequests()).length > 0) {
                queues[name].setBusy(1)
                noRequest = 0
            }
        }

        // Execute requests based on their queue name
        if (noRequest === 0) {
            for (const name in queues) {
                console.log("[TK] Queue name: " + name + ", isBusy: " + queues[name].isBusy() +
                    ", keys: " + Object.keys(queues[name].getRequests()).toString())

                if (name === "UCM") {
                    this.getSharedVariables(queues[name].getRequests())
                }
            }
        }

        // Start a timer to monitor queues' status
        timers.add(() => {
            // Handler
            if (this.isBusy() === 1) {
                return true
            } else {
                // Process pending requests
                let pendingRequests = this._data.pendingRequests

                for (const request in pendingRequests) {
                    let observers = pendingRequests[request].getObservers()

                    console.log("[TK] Pending requests: " + request + "Observers: ", observers)

                    for (let observer in observers) {
                        this.appendRequest(request, observer)
                    }
                }
            }

            return false
        }, callback, function(callback) {
            // Execute given callback
            if (typeof callback === "function") {
                callback() // callback.apply(null, [true])
            }
        })
    },
    // Share variabiles
    getSharedVariables: function(requests) {
        // Sanity check
        if (typeof (requests) === "undefined") {
            return null
        }

        $.ajax({
            method: "post",
            url: api.apiHost,
            data: {
                action: "getSharedVariables",
                requests: Object.keys(requests).toString()
            },
            async: true,
            error: (jqXHR, textStatus, errorThrown) => {
                console.warn("error: " + textStatus)
            },
            success: data => {
                const noError = UCMGUI.errorHandler(data)

                if (noError) {
                    let responses = data.response,
                        requests = ValueDelegationObj.getRequests("UCM")

                    for (const name in responses) {
                        let request = requests[name]

                        if (request !== "undefined") {
                            ValueDelegationObj.notify(request.getObservers(),
                                name,
                                responses[name])
                        } else {
                            console.error("Failed to get the request " + name +
                                " on UCM queue, data", responses[name])
                        }
                    }
                }

                // Clean up UCM queue
                ValueDelegationObj.resetQueue("UCM")
                ValueDelegationObj.setBusy("UCM", 0)
            }
        })
    }
}

let ValueMonitor = function () {
    this._data = {
        _refs: {}
    }
}

ValueMonitor.prototype = {    
    init: function() {
        this._data._refs = {}
    },
    register: function(ref, receiver) {
        let monitor = null

        // The receiver instance MUST implement notify function
        if (!receiver || typeof (receiver.notify) !== "function") {
            console.warn("Missing notify function, ref:", ref, " , receiver:", receiver)
            return null
        }

        // Monitor instance
        if (!(ref in this._data._refs)) {
            this._data._refs[ref] = new ValueRequest(ref)
        }

        monitor = this._data._refs[ref]

        // Append new receiver
        monitor.appendObserver(receiver)

        return monitor.getResult()
    },
    updateValue: function(sender, ref, value) {
        let monitor = null
        let observers = null
        let observerCount = null

        // Sanity check
        if (!sender) {
            console.warn("Sender IS NULL")
            return false
        }

        // Monitor instance
        if (!(ref in this._data._refs)) {
            this._data._refs[ref] = new ValueRequest(ref)
        }

        monitor = this._data._refs[ref]

        // Update reference's value
        monitor.setResult(value)

        // Notify receivers with updated reference's value
        observers = monitor.getObservers()
        observerCount = observers.count()

        for (let index = 0; index < observerCount; index++) {
            let observer = observers.get(index)

            if (observer !== sender) {
                observer.notify(ref, value)
            }
        }

        return true
    },
    sync: function() {
        let monitor = null
        let observers = null
        let observerCount = null

        for (const ref in this._data._refs) {
            monitor = this._data._refs[ref]
            observers = monitor.getObservers()
            observerCount = observers.count()

            for (let index = 0; index < observerCount; index++) {
                console.log("[TK] ref: ", ref, ", value: ", monitor.getResult())
                observers.get(index).notify(ref, monitor.getResult())
            }
        }
    }
}

export let PrepareSubmitConfigurations = function (refId, source, callback) {
    let idList = refId.toString().split(",")
    let ret = {
        "update": {
            "refId": [],
            "elementId": [],
            "elementNum": [],
            "entityName": [],
            "value": []
        },
        "remove": {
            "refId": [],
            "elementId": [],
            "elementNum": [],
            "entityName": []
        },
        "error": []
    }

    let waiting = 0
    let processNode = function (item) {
        if (item.items) {
            for (let i = 0; i < item.items.length; i++) {
                processNode(item.items[i])
            }
        } else {
            if (item._selected) {
                let ew
                if (item.__scope__ && (ew = item.__scope__.elementWidget)) {
                    waiting++

                    ew.processSubmitElementValue(function (values, processError) {
                        let type = ew.elementType()

                        if (processError) {
                            ret.error.push(item)
                        } else {
                            for (const name in values) {
                                if (values.hasOwnProperty(name)) {
                                    let usingVal = encodeURIComponent(values[name])
                                    for (let i = 0; i < idList.length; i++) {
                                        ret.update.refId.push(idList[i])
                                        ret.update.elementId.push(item.id)
                                        ret.update.elementNum.push(item.elementNum)
                                        ret.update.entityName.push(name)
                                        ret.update.value.push(usingVal)
                                    }
                                }
                            }
                        }

                        waiting--
                    })
                } else {
                    console.warn("Invalid LEAF item", item)
                }
            } else if (item._loadedValue) {
                let ew
                if (item.__scope__ && (ew = item.__scope__.elementWidget)) {
                    let values = ew.elementValue()
                    for (const name in values) {
                        for (let i = 0; i < idList.length; i++) {
                            ret.remove.refId.push(idList[i])
                            ret.remove.elementId.push(item.id)
                            ret.remove.elementNum.push(item.elementNum)
                            ret.remove.entityName.push(name)
                        }
                    }
                }
            }
        }
    }

    for (let i = 0; i < source.length; i++) {
        processNode(source[i])
    }

    let waitForReturn = () => {
        if (waiting > 0) {
            setTimeout(waitForReturn, 100)
        } else {
            if (typeof callback === "function") {
                callback.call({}, ret)
            }
        }
    }
    waitForReturn()
}

export let timers = new Timers(),
           ZCCurConfig = new ConfigPage(), 
           ValueDelegationObj = new ValueDelegation(),
           ValueMonitorObj = new ValueMonitor()


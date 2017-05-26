/* eslint no-eval: 0 */

import $ from 'jquery'
import UCMGUI from "../../../api/ucmgui"
import { ZCCurConfig, ValueDelegationObj, ValueMonitorObj} from './ZCController'
import * as global from './global'

/********************************************************/
/*                  Internal Functions                  */
/********************************************************/

// =======================================================
// Data Object
// =======================================================
function DataObject(source, type) {
    this._valueType = type
    this._arguments = []
    this._source = source
    this._request = null
    this._values = {}

    this.appendArgument = arg => {
        this._arguments.push(arg)
    }

    this.prepare = () => {
        if (this._valueType === global.VALUE_TYPE.VALUE_TYPE_SHARE_VARIABLE && 
            this._arguments.length === 2 && 
            this._arguments[0] === "UCM" && 
            this._arguments[1]) {
            // Prepare a request
            if (this._request === null) {
                this._request = this._arguments[0] + "::" + this._arguments[1]
            }

            // Append a request to the value delegation
            ValueDelegationObj.appendRequest(this._request, this)
        }
    }

    this.update = (name, data) => {
        let response

        console.log("[TK] DataObject-name: " + name + ", data: ", data)

        // Sanity check
        if (data.status !== 0) {
            console.warn("DataObject-Invalid status, name: " + name +
                ", data: ", data)
            return
        }

        // Get the response object
        response = data.response
    }
}

// Overriding prototypes
DataObject.prototype.toString = function() {
    let name
    let item
    
    // Sanity check
    if (this._arguments.length === 0) {
        return ""
    }

    if (this._valueType === global.VALUE_TYPE.VALUE_TYPE_SHARE_VARIABLE && 
        this._arguments.length === 2) {
        name = this._arguments[1].toString()

        if (this._arguments[0] === null) {
            // Get current object values
            if (this.__scope__ !== "undefined" &&
                this.__scope__.item !== "undefined") {
                item = this.__scope__.item
                return item[name] ? item[name].toString() : ""
            }
        } else { 
            // Get value based on scope and name                                   
            if (this._arguments[0] === "model") {
                // Get model object                
                let model = ZCCurConfig.modelInfo()
                if (model === null || model === undefined) {
                    return ""
                }

                // Get model property value
                return model.property(this._arguments[1].toString())
            } else if (this._arguments[0] === "entity") {
                // Get current object's entities
                if (this.__scope__ !== "undefined" &&
                    this.__scope__.elementWidget !== "undefined" &&
                    this.__scope__.elementWidget.elementValue() !== "undefined") {
                    item = this.__scope__.elementWidget.elementValue()
                    return item[name] ? item[name].toString() : ""
                }
            } else if (this._arguments[0] === "device") {
                let ret = ""
                let obj = ZCCurConfig.currentDevice()

                if (typeof obj === "object") {
                    ret = obj[name]
                }

                return ret || ""
            } else if (this._arguments[0] === "page") {
                let ret = ""
                if (typeof ZCCurConfig[name] === "function") {
                    ret = ZCCurConfig[name]()
                }

                return ret || ""
            } else if (this._arguments[0] === "env") {
                return UCMGUI.gup.call(ZCCurConfig.currentWindow(), name) || ""
            } else if (this._arguments[0] === "this") {
                let current = this.__current__

                if (current) {
                    return current[name] || ""
                }

                return ""
            } else if (this._arguments[0] === "monitor") {
                let monitor = ValueMonitorObj._data._refs[name]

                if (monitor !== undefined) {
                    return monitor.getResult().toString() || ""
                }
            } else if (this._arguments[0] === "element") {
                if (this.__scope__ !== undefined &&
                    this.__scope__.item !== undefined &&
                    typeof this.__scope__.item.generateElementInfo === 'function') {
                    item = this.__scope__.item.generateElementInfo()
                    return item[name] ? item[name].toString() : ""
                }
            } else {
                console.log("[TK] TODO: Handle scope: " + this._arguments[0])
                return ""
            }
        }
    } else if (this._valueType === global.VALUE_TYPE.VALUE_TYPE_FUNC_CONCAT &&
        this._arguments.length === 2) {
        return this._arguments[0].toString() + this._arguments[1].toString()
    } else if (this._valueType === global.VALUE_TYPE.VALUE_TYPE_FUNC_ADD &&
        this._arguments.length === 2) {
        return (Number(this._arguments[0].toString()) + Number(this._arguments[1].toString())).toString()
    }

    return ""
}

// =======================================================
// Data container
// =======================================================
function DataContainer(data) {
    this._data = data
}

DataContainer.prototype.toString = function(item) {
    /* if (this._data === null || this._data === undefined) {
        return ""
    } */
    let length = this._data.length
    let string = ""

    for (let index = 0; index < length; index++) {
        // TODO
        // this._data[index].__current__ = item
        string = string + this._data[index].toString()
    }

    // Convert constant string
    length = string.length
    if (length > 0 && string[0] === '\'' && string[length - 1] === '\'') {
        string = string.replace(/^'/g, "").replace(/'$/g, "")
    }

    return string
}

function getNextState(currentState, input) {
    let nextState = global.DATA_STATE_TYPE.DATA_STATE_UNKNOWN

    if (currentState === global.DATA_STATE_TYPE.DATA_STATE_UNKNOWN ||
        currentState === global.DATA_STATE_TYPE.DATA_STATE_STRING) {
        if (input === '$') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_SHARED_VARIABLE
        } else if (input === '[') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_STRING
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_SHARED_VARIABLE) {
        if (input === '{') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_SHARED_VARIABLE_2
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_STRING
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_SHARED_VARIABLE_2) {
        if (input === '}') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_COMPLETION
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_SHARED_VARIABLE_2
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION) {
        if (input === 'F') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_2
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_STRING
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_2) {
        if (input === '[') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_3
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_STRING
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_3) {
        if (input === ']') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_4
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_3
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_4) {
        if (input === ',') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_5
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_4
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_5) {
        if (input === '[') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_6
        } else if (input === ']') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_COMPLETION
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_5
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_6) {
        if (input === 'F') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_7
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_STRING
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_7) {
        if (input === '[') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_8
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_STRING
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_8) {
        if (input === ']') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_9
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_8
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_9) {
        if (input === ',') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_10
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_9
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_10) {
        if (input === ']') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_11
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_10
        }
    } else if (currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_11) {
        if (input === ']') {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_COMPLETION
        } else {
            nextState = global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_11
        }
    }

    return nextState
}

function tokenization(str) {
    let length = -1
    let current = null
    let token = ""
    let container = []
    let currentState = global.DATA_STATE_TYPE.DATA_STATE_UNKNOWN
    let nextState = global.DATA_STATE_TYPE.DATA_STATE_UNKNOWN
    // Sanity check
    if (!str) {
        return container
    }

    // Initialize variables
    length = str.length

    for (let index = 0; index < length; index++) {
        current = str[index]
        nextState = getNextState(currentState, current)

        // Update token and container
        if (nextState === global.DATA_STATE_TYPE.DATA_STATE_STRING &&
            (currentState === global.DATA_STATE_TYPE.DATA_STATE_SHARED_VARIABLE ||
                currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION ||
                currentState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION_2)) {
            container.push(token)
            token = current
        } else if (currentState !== global.DATA_STATE_TYPE.DATA_STATE_UNKNOWN &&
            (nextState === global.DATA_STATE_TYPE.DATA_STATE_SHARED_VARIABLE ||
                nextState === global.DATA_STATE_TYPE.DATA_STATE_FUNCTION)) {
            container.push(token)
            token = current
        } else if (nextState === global.DATA_STATE_TYPE.DATA_STATE_COMPLETION) {
            token = token + current
            container.push(token)
            token = ""
        } else if (nextState !== global.DATA_STATE_TYPE.DATA_STATE_UNKNOWN) {
            token = token + current
        }

        // Update current state status
        if (nextState === global.DATA_STATE_TYPE.DATA_STATE_COMPLETION) {
            currentState = global.DATA_STATE_TYPE.DATA_STATE_UNKNOWN
        } else {
            currentState = nextState
        }
    }

    // Insert last token
    if (nextState !== global.DATA_STATE_TYPE.DATA_STATE_COMPLETION) {
        container.push(token)
    }

    return container
}

function splitXMLFunctionPara(str) {
  let left = 0
  let right = 0
  let start = 0
  let num = 0
  let arr = []

  for (let i = 0; i < str.length; i++) {
      switch (str.charAt(i)) {
          case '[':
              left++
              break
          case ']':
              right++
              if (left === right) {
                  arr[num] = str.substring(start, i + 1)
                  num++
                  left = 0
                  right = 0
                  i = i + 2
                  start = i
              }
              break
          case ',':
             if (left === 0) {
                 arr[num] = str.substring(start, i)
                 num++
                 start = i + 1
             }
             break
          default:
      }
  }

  if (start < str.length) {
      arr[num] = str.substring(start, str.length)
  }
  return arr
}

// Expression parser: operator code
function toOperator(str) {
    let op = global.EXPRESSION_OP.EXPRESSION_OP_UNKNOWN

    if (str === "-eq") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_EQ
    } else if (str === "-ne") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_NE
    } else if (str === "-gt") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_GT
    } else if (str === "-ge") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_GE
    } else if (str === "-lt") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_LT
    } else if (str === "-le") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_LE
    } else if (str === "-a") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_AND
    } else if (str === "-o") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_OR
    } else if (str === "-in") {
        op = global.EXPRESSION_OP.EXPRESSION_OP_IN
    }

    return op
}

// Expression parser: expression
function Expression(type) {
    this._type = type
    this._leftValue = null
    this._rightValue = null
    this._operatorType = global.EXPRESSION_OP.EXPRESSION_OP_UNKNOWN
    this._value = null

    // Getters
    this.getType = () => {
        return this._type
    }

    this.getLeftValue = () => {
        return this._leftValue
    }

    this.getRightValue = () => {
        return this._rightValue
    }

    this.getOperatorType = () => {
        return this._operatorType
    }

    this.getValue = () => {
        return this._value
    }

    // Setters
    this.setOperatorType = operatorType => {
        this._operatorType = operatorType
    }

    // Helpers
    this.appendValue = value => {
        let ret = 0

        if (this._type === global.EXPRESSION_TYPE.EXPRESSION_TYPE_VALUE) {
            this._value = value
        } else {
            if (this._leftValue === null) {
                this._leftValue = value
            } else if (this._rightValue === null) {
                this._rightValue = value
            } else {
                console.log("Invalid appending value: All left and right values are assigned")
                ret = -1
            }
        }

        return ret
    }

    this.showInfo = () => {
        if (this._type === global.EXPRESSION_TYPE.EXPRESSION_TYPE_VALUE) {
            console.log(this._value)
        } else {
            console.log("Operator type: " + this._operatorType)
        }
    }
}

// Expression parser: parser
function ExpressionParser() {
    this._strList = []
    this._expression = null

    this.reinit = () => {
        while (this._strList.length > 0) {
            this._strList.pop()
        }

        this._expression = new Expression(global.EXPRESSION_TYPE.EXPRESSION_TYPE_EXPRESSION)
    }

    this.parse = (str, sharedScope) => {
        let length = 0
        let tmpList = null
        let curValue = null
        let curExpression = null
        let curRoot = null

        // Reinitialize variables
        this.reinit()
        curRoot = this._expression
        curExpression = this._expression

        // Sanity check
        if (!str || (str.toString().split(" ").length % 2 === 0)) {
            return -1
        }

        // Convert to a string list
        this._strList = str.toString().split(" ")
        length = this._strList.length

        // Build an expression tree
        for (let index = 0; index < length; index++) {
            let curString = this._strList[index]
            let indicator = curString.charAt(0)

            // Value
            if (indicator === '$' || indicator === '\'') {
                let value = dataFactory(curString, sharedScope)

                // Sanity check
                if (curValue !== null) {
                    console.log("Invalid syntax-consecutive values, string: " + str)
                    this.reinit()

                    return -1
                }

                curValue = new Expression(global.EXPRESSION_TYPE.EXPRESSION_TYPE_VALUE)
                curValue.appendValue(value)

                // Append the last value to the current expression
                if (index === (length - 1)) {
                    curExpression.appendValue(curValue)
                }
            } else if (indicator === '-') {                
                // Operator            
                let op = toOperator(curString)

                // Sanity check
                if (op === global.EXPRESSION_OP.EXPRESSION_OP_UNKNOWN || 
                    curValue === null) {
                    console.log("Invalid operator or current value, operator:" + curString +
                                ",current value: " + curValue + ", string: " + str)
                    this.reinit()

                    return -1
                }

                // Append current value to current expression
                curExpression.appendValue(curValue)

                if (op === global.EXPRESSION_OP.EXPRESSION_OP_AND || 
                    op === global.EXPRESSION_OP.EXPRESSION_OP_OR) {
                    // Update root expression tree
                    this._expression = new Expression(global.EXPRESSION_OP.EXPRESSION_TYPE_EXPRESSION)
                    this._expression.setOperatorType(op)

                    // Append current root to new root as a left value
                    this._expression.appendValue(curRoot)

                    // Append dummy expression to new root as a right value
                    curExpression = new Expression(global.EXPRESSION_OP.EXPRESSION_TYPE_EXPRESSION)
                    this._expression.appendValue(curExpression)

                    // Update current root expression tree
                    curRoot = this._expression
                } else {
                    // Update operator
                    curExpression.setOperatorType(op)
                }

                // Clean up
                curValue = null
            } else {
                console.log("Invalid syntax-Unrecognized string: " + curString +
                            ", string: " + str)
                this.reinit()

                return -1
            }
        }

        // Validate current expression
        if (curExpression.getOperatorType() === global.EXPRESSION_OP.EXPRESSION_OP_UNKNOWN ||
            curExpression.getLeftValue() === null || 
            curExpression.getRightValue() === null) {
            console.log("Incompleted syntax, current expression type:  " +
                        curExpression.getOperatorType() + ", left: " +
                        curExpression.getLeftValue() + ", right: " +
                        curExpression.getRightValue() + ", string: " + str)
            this.reinit()

            return -1
        }

        return 0
    }

    this.postOrderTraverse = node => {
        if (node === null || 
            node.getType() === global.EXPRESSION_TYPE.EXPRESSION_TYPE_VALUE) {
            if (node !== null) {
                node.showInfo()
            }

            return
        }

        this.postOrderTraverse(node.getLeftValue())
        this.postOrderTraverse(node.getRightValue())
        node.showInfo()
    }

    this.postOrderEvaluate = (node, evaluateItem) => {
        let left = null
        let leftValue = null
        let right = null
        let rightValue = null
        let op = global.EXPRESSION_OP.EXPRESSION_OP_UNKNOWN

        if (node === null) {
            return false
        }

        if (node.getType() === global.EXPRESSION_TYPE.EXPRESSION_TYPE_VALUE) {
            let val = node.getValue()

            return val.toString(evaluateItem)
        }

        leftValue = this.postOrderEvaluate(node.getLeftValue(), evaluateItem)
        rightValue = this.postOrderEvaluate(node.getRightValue(), evaluateItem)

        // Evaluating based on node operator
        left = node.getLeftValue()
        right = node.getRightValue()
        op = node.getOperatorType()

        // Sanity check
        if (op === global.EXPRESSION_OP.EXPRESSION_OP_UNKNOWN || 
            left === null || 
            right === null) {
            return false
        }

        if (op === global.EXPRESSION_OP.EXPRESSION_OP_EQ) {
            return leftValue === rightValue
        } else if (op === global.EXPRESSION_OP.EXPRESSION_OP_NE) {
            return leftValue !== rightValue
        } else if (op === global.EXPRESSION_OP.EXPRESSION_OP_GT) {
            return leftValue > rightValue
        } else if (op === global.EXPRESSION_OP.EXPRESSION_OP_GE) {
            return leftValue >= rightValue
        } else if (op === global.EXPRESSION_OP.EXPRESSION_OP_LT) {
            return leftValue < rightValue
        } else if (op === global.EXPRESSION_OP.EXPRESSION_OP_LE) {
            return leftValue <= rightValue
        } else if (op === global.EXPRESSION_OP.EXPRESSION_OP_AND) {
            return leftValue && rightValue
        } else if (op === global.EXPRESSION_OP.EXPRESSION_OP_OR) {
            return leftValue || rightValue
        } else if (op === global.EXPRESSION_OP.EXPRESSION_OP_IN) {
            let originalArray = rightValue.split(",")
            return (originalArray.indexOf(leftValue) !== -1) ? true : false
        }

        return false
    }

    this.traverse = () => {
        if (this._expression === null) {
            console.log("Root expression tree is NULL")
        } else {
            this.postOrderTraverse(this._expression)
        }
    }

    this.evaluate = item => {
        if (this._expression === null) {
            console.log("Root expression tree is NULL")
            return false
        }

        return this.postOrderEvaluate(this._expression, item)
    }
}

/********************************************************/
/*                  Shared Functions                    */
/********************************************************/

export function parseToken(str, sharedScope = null) {
    let obj = null
    let scope = null
    let name = null
    let indicator = null
    let content = null
    let contentList = null

    // Sanity check
    if (!str) {
        return str
    }

    indicator = str.charAt(0)

    if (indicator === '$') {
        content = str.replace(/^\${/g, "").replace(/}$/g, "")

        // Split share variable pattern
        if (content.search("::") !== -1) {
            contentList = content.split(/\s*(::)\s*/)

            // Sanity check
            if (contentList.length !== 3) {
                console.error("Invalid share variable pattern: " + content + ", string: " + str)
                return str
            }

            scope = contentList[0]
            name = contentList[2]
        } else {
            name = content
        }

        obj = new DataObject(str, global.VALUE_TYPE.VALUE_TYPE_SHARE_VARIABLE)
        obj.appendArgument(scope)
        obj.appendArgument(name)
                
        obj.__scope__ = sharedScope
        return obj
    } else if (indicator === '[') {
        content = str.replace(/^\[/g, "").replace(/\]$/g, "")
        contentList = splitXMLFunctionPara(content)
        // Sanity check
        if (contentList.length < 2) {
            console.log("Invalid function variable pattern: " + content + ", string: " + str)
            return str
        }

        if (contentList[0] === "F[concat]" && contentList.length === 3) {
            let arg1 = dataFactory(contentList[1].replace(/\s+/, ""), sharedScope)
            let arg2 = dataFactory(contentList[2].replace(/\s+/, ""), sharedScope)
            obj = new DataObject(str, global.VALUE_TYPE.VALUE_TYPE_FUNC_CONCAT)
            obj.appendArgument(arg1)
            obj.appendArgument(arg2)

            obj.__scope__ = sharedScope
            return obj
        } else if (contentList[0] === "F[add]" && contentList.length === 3) {
            let arg1 = dataFactory(contentList[1].replace(/\s+/, ""), sharedScope)
            let arg2 = dataFactory(contentList[2].replace(/\s+/, ""), sharedScope)

            obj = new DataObject(str, global.VALUE_TYPE.VALUE_TYPE_FUNC_ADD)
            obj.appendArgument(arg1)
            obj.appendArgument(arg2)

            obj.__scope__ = sharedScope
            return obj
        }

        console.log("Unrecognized function: " + contentList[0] + ", string: " + str)
        return str
    }

    return str
}

export function dataFactory(str, sharedScope = null) {
    let container = []
    let length = -1

    // Sanity check
    if (!str) {
        return str
    }

    // Tokenization
    length = str.length
    if (str[0] === '{' && str[length - 1] === '}') {
        try {
            container = JSON.parse(str)

            for (const name in container) {
                container[name] = dataFactory(container[name], sharedScope)
            }

            return container
        } catch (e) {
            return str
        }
    } else {
        container = tokenization(str)
        length = container.length
        for (let index = 0; index < length; index++) {
            container[index] = parseToken(container[index], sharedScope)
        }

        return new DataContainer(container)
    }
}

export function deepItemClone(obj, sharedScope) {
    // Handle the 3 simple types, and null or undefined
    if (obj === null || typeof obj !== "object") {
        return obj
    }  
    // Handle Date
    if (obj instanceof Date) {
        let copy = new Date()
        copy.setTime(obj.getTime())
        return copy
    }

    // Handle Array
    if (obj instanceof Array) {
        let copy = []

        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepItemClone(obj[i], sharedScope)
        }

        return copy
    }

    // Handle Object
    if (typeof obj === "object") {
        let copy = new obj.constructor()
        for (const attr in obj) {
            if (obj.hasOwnProperty(attr)) {                    
                if (attr === "items" && obj[attr] instanceof Array) {
                    copy[attr] = []
                } else {
                    copy[attr] = deepItemClone(obj[attr], sharedScope)
                 }
            }
        }
        // setting proxy object to all the cloned objects
        copy.__scope__ = sharedScope

        // calling prepare function when available
        if (copy.prepare instanceof Function) {
            // copy.prepare.call(copy, sharedScope)
            copy.prepare() // .call(copy, [])
        }

        if (copy.visibility !== undefined) {
            if (!copy.visibility) {
                copy.visibility = function () {
                    return true
                }
            } else {
               let expParser = new ExpressionParser()
                expParser.parse(copy.visibility, sharedScope)

                copy.visibility = function () {
                    return expParser.evaluate()
                }
            }
        }

        return copy
    }

    throw new Error("Unable to copy obj! Its type isn't supported.")
}

export function CGIData(name, command, context) {
    this._name = name
    this._command = command
    this._data = null
    this._iteration = 0
    this._chuckSize = 0
    this._state = global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADING 
    this._numTry = 0
    this._startTime = 0
    this._handler = null
    this._context = context

    // Getters
    this.getName = () => this._name

    this.getCommand = () => this._command

    this.getData = () => this._data

    this.getIteration = () => this._iteration

    this.getChuckSize = () => this._chuckSize

    this.getCurrentIndex = () => {
        return this._iteration * this._chuckSize
    }

    this.getEndIndex = () => {
        // Sanity check
        if (this._data === null) {
            return 0
        }

        let endIndex = (this._iteration + 1) * this._chuckSize

        if (endIndex > this._data.length) {
            endIndex = this._data.length
        }

        return endIndex
    }

    this.getState = () => this._state

    this.getStartTime = () => this._startTime

    this.getHandler = () => this._handler

    this.getContext = () => this._context

    // Setters
    this.setData = (data, chuckSize) => {
        this._data = data
        this._chuckSize = chuckSize
    }

    this.setState = state => {
        this._state = state
    }

    this.setHandler = handler => {
        this._handler = handler
    }

    // Helpers
    this.increaseIteration = () => {
        this._iteration++
    }

    this.nextIteration = index => {
        // Sanity check
        if (this._data === null) {
            return false
        }

        if (index < this._data.length) {
            this._iteration++

            return true
        }

        this._state = global.CGI_STATE_TYPE.CGI_STATE_PROCESSED

        return false
    }

    this.executeCommand = resetLimit => {
        if (resetLimit === true) {
            this._numTry = 0
        }

        if (this._numTry === 3) {
            console.log("Stop executing command " + this._command)
            return -1
        }

        this._numTry++
        this._state = global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADING
        eval(`${this._command}.apply(this._context, [])`)

        return 0
    }

    this.updateStartTime = () => {
        this._startTime = new Date()
    }

    this.handleCGIData = dependentDataStatus => {       
        let currentHandler = this.getHandler()

        // Dependent data is not ready
        if (dependentDataStatus === true) {
            return true
        }

        // Current data is processed
        if (this.getState() === global.CGI_STATE_TYPE.CGI_STATE_PROCESSED) {
            return false
        }
        return currentHandler.apply(this._context, [this])
    }
}

export function processCGIData(data) {
    let continued = false

    // Validate CGI data state
    for (const name in data) {
        if (data[name].getState() === global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADING) {
            continued = true
        }
    }

    // Process CGI data
    if (continued === false) {
        for (const name in data) {
            continued = data[name].handleCGIData(continued)
        }
    }
    return continued
}

export function createGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

export function pad(num, size) {
    let s = String(num)
    if (typeof (size) !== "number") { 
        size = 2
    }

    while (s.length < size) { s = "0" + s }
    return s
}

export function prepareLocalizedLabel(label) {
    let labelValue = label.toString()

    if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
        labelValue = labelValue.substring(1)
    }
    return labelValue
}

export function testVisibleCondition(item) {
    if (typeof item.visibility === "function") {
        return item.visibility()
    }

    return true
}


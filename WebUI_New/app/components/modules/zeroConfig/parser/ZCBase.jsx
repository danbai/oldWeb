import $ from 'jquery'
import { browserHistory } from 'react-router'
import api from "../../../api/api"
import UCMGUI from "../../../api/ucmgui"

// base abstract classes
let idSeed = 0
function ElementType(name) {
    this._private = {}
    this._private.typename = name
    this._private.entities = {}
    this._private.overrideDataEntities = false
}

ElementType.prototype = {
    // private
    typename: function() {
        return this._private.typename
    },
    dataEntities: function(name, entity) {
        let ret = this._private.entities
        if (name || name === "") {
            if (!this._private.overrideDataEntities) {
                // if (entity instanceof ns.DataEntity) {
                    ret[name] = entity
                // }
            }

            ret = ret[name]
        }

        return ret
    },
    overrideDataEntties: function(entities) {
        this._private.overrideDataEntities = true
        this._private.entities = entities
    },
    renderWidget: function(field) {
        console.error("[TODO] Function needs override")
    }
}

function CustomElementType(id, name, view) {
    ElementType.call(this, name)

    this._private.id = id
    this._private.name = name
    this._private.view = view
}

CustomElementType.prototype = Object.create(ElementType.prototype, {
    id: function () {
        return this._private.id
    },
    // override existing
    renderWidget: function (field) {
        if (this._private.view) {
            // return ns.WidgetFactory.makeWidget(field, this._private.view)
        }

        return $("<span/>").text("INVALID")
    },
    showInfo: function () {
        console.log("Type id: " + this._private.id +
                    ", name: " + this._private.name +
                    ", view: " + this._private.view)
    }
})
CustomElementType.prototype.constructor = CustomElementType

module.exports = CustomElementType

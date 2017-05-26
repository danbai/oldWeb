import $ from 'jquery'
import * as global from './global'
import * as ZCHelper from './ZCHelper'
import { ZCCurConfig, ValueDelegationObj, ValueMonitorObj} from './ZCController'
import CustomElementType from './ZCBase'

let ZCParser = function() {}

ZCParser.prototype = {
    // public classes
    // Provision building block: block
    Block: function (id, name, label, isType, visibility) {
        // private
        let m_key_item_mapping = null

        // public
        this.id = id
        this.name = name
        this.label = label
        this.isType = isType
        this.visibility = visibility
        this.items = []

        // helper functions
        this.appendItem = function(item) {
            if (!m_key_item_mapping) {
                m_key_item_mapping = {}
            }                
            this.items.push(item)
            m_key_item_mapping[item.id] = item
        }

        this.rebuildKeyItemMapping = function() {
            m_key_item_mapping = {}

            for (let i = 0; i < this.items.length; i++) {
                m_key_item_mapping[this.items[i]] = this.items[i]
            }
        }

        this.findItemByKey = function(key) {
            if (!m_key_item_mapping) {
                this.rebuildKeyItemMapping()
            }

            return m_key_item_mapping[key]
        }
    },
    // Provision building block: blockelement
    BlockElement: function (id, name, label, visibility) {
        // private
        let m_key_item_mapping = null

        // public
        this.id = id
        this.name = name
        this.label = label
        this.visibility = visibility
        this.items = []

        // helper functions
        this.appendItem = function(item) {
            if (!m_key_item_mapping) {
                m_key_item_mapping = {}
            }

            this.items.push(item)
            m_key_item_mapping[item.uniqueId()] = item
        }

        this.rebuildKeyItemMapping = function() {
            m_key_item_mapping = {}

            for (let i = 0; i < this.items.length; i++) {
                m_key_item_mapping[this.items[i].uniqueId()] = this.items[i]
            }
        }

        this.findItemByKey = function(key) {
            if (!m_key_item_mapping) {
                this.rebuildKeyItemMapping()
            }

            return m_key_item_mapping[key]
        }
    },
    // Provision building block: element
    Element: function (id, name, label, type, defaultValue, tooltip, regex, validation, monitor, maxoccurs, visibility) {
        this.id = id
        this.name = name
        this.label = label
        this.type = type
        this.defaultValue = defaultValue
        this.tooltip = tooltip
        this.validateRegex = regex
        this.validateError = validation
        this.monitor = monitor
        this.maxoccurs = maxoccurs
        this.visibility = visibility
        this.elementNum = 1
        this.mac = null

        this.uniqueId = function() {
            return this.id + "#" + this.elementNum
        }

        this.updateMac = function(mac) {
            if (mac) {
                this.mac = mac
            }
        }

        this.generateElementInfo = function() {
            let ret = {}
            ret["unqueIdWithMac"] = this.uniqueIdWithMac()
            return ret
        }

        this.uniqueIdWithMac = function() {
            return `${this.mac}.${this.id}.${this.elementNum}`
        }
    },
    // Provision building block: list
    List: function (id, name, source, defaultLabel, defaultValue) {
        this.id = id
        this.name = name
        this.defaultLabel = defaultLabel
        this.defaultValue = defaultValue
        this.items = []

        // Share letiable data
        this.source = source
        this.labelfield = null
        this.valuefield = null
        this.request = null

        // Getters
        this.getID = function() {
            return this.id
        }

        this.getName = function() {
            return this.name
        }

        this.getSource = function() {
            return this.source
        }

        this.getItems = function() {
            return this.items
        }

        // Helpers
        this.removeItems = function() {
            while (this.items.length > 0) {
                this.items.pop()
            }
        }

        this.appendItem = function(label, value) {
            let item = {}
            item.label = label
            item.value = value
            this.items[this.items.length] = item
        }

        this.appendObjectItem = function(obj) {
            this.items.push(obj)
        }

        this.prepare = function() {
            if (!this.source) {
                return
            }

            // Dynamic list
            // Initialize share letiable data
            if (!this.request) {
                // Constructing the request with options
                if (this.items.length === 1) {
                    // Get label and value fields
                    this.labelfield = this.items[0].label
                    this.valuefield = this.items[0].value

                    // Assign argument value
                    if (this.labelfield && this.valuefield) {
                        this.request = this.source.toString() + "[options=" +
                        this.labelfield.toString() + "," +
                        this.valuefield.toString() + "]"
                    } else {
                        // Constructing the request without options
                        this.labelfield = ""
                        this.valuefield = ""
                        this.request = this.source.toString()
                    }
                }

                // Clean up
                this.removeItems()
            }

            // Append a request to the value delegation
            if (this.request) {
                this.removeItems()

                ValueDelegationObj.appendRequest(this.request, this)
            }
        }

        this.update = function(name, data) {
            let response,
                label,
                value,
                index,
                length

            console.log("[TK] List-name: " + name + ", data: ", data)

            // Sanity check
            if (data.status !== 0) {
                console.warn("List-Invalid status, name: " + name +
                              ", data: ", data)
                return
            }

            // Append default option
            this.appendItem(this.defaultLabel, this.defaultValue)

            // Get the response object
            response = data.response

            // Parser
            for (const key in response) {
                // LDAP phonebook
                if (key === "ldap_phonebooks") {
                    let phonebooks = response[key]
                    length = phonebooks.length

                    for (index = 0; index < length; index++) {
                        if (this.labelfield && this.valuefield) {
                            label = phonebooks[index][this.labelfield].toUpperCase()
                            value = phonebooks[index][this.valuefield]

                            this.appendItem(label, value)
                        } else {
                            this.appendObjectItem(phonebooks[index])
                        }
                    }
                } else if (key === "listAvailableSIPAccount") {
                    // Available SIP Account
                    let accounts = response[key]
                    length = accounts.length

                    for (index = 0; index < length; index++) {
                        if (this.labelfield && this.valuefield) {
                            label = accounts[index][this.labelfield]
                            value = accounts[index][this.valuefield]

                            this.appendItem(label, value)
                        } else {
                            this.appendObjectItem(accounts[index])
                        }
                    }
                } else {
                    let ret = response[key]
                    length = ret.length

                    for (index = 0; index < length; index++) {
                        if (this.labelfield && this.valuefield) {
                            label = ret[index][this.labelfield]
                            value = ret[index][this.valuefield]

                            this.appendItem(label, value)
                        } else {
                            this.appendObjectItem(ret[index])
                        }
                    }
                }
            }
        }
    },
    Model: function(id, type, vendor, name, thumbnail, baseVersion, xmlVersion) {
        this._private = {}
        this._private.id = id
        this._private.type = type
        this._private.vendor = vendor
        this._private.name = name
        this._private.thumbnail = thumbnail
        this._private.baseVersion = baseVersion
        this._private.xmlVersion = xmlVersion
        this._private.originModel = undefined
        this._private.properties = {}
        this._private.lists = {}
        this._private.types = {}
        this._private.groups = []
        this._private.groupsIdMapping = {}
        this._private.languages = {}
        this._private.sharedScope = {}
        this._private.imageMappings = {}

        this.id = function() {
            return this._private.id
        }

        this.modelType = function() {
            if (this._private.originModel !== undefined) {
                return this._private.originModel.modelType()
            }

            return this._private.type
        }

        this.vendor = function() {
            return this._private.vendor || ""
        }

        this.name = function() {
            return this._private.name
        }

        this.thumbnail = function() {
            let pvt = this._private
            let thumbnail = pvt.thumbnail

            if (!thumbnail && pvt.originModel !== undefined) {
                thumbnail = pvt.originModel.thumbnail()
            }

            return thumbnail
        }

        this.baseVersion = function() {
            return this._private.baseVersion
        }

        this.xmlVersion = function() {
            return this._private.xmlVersion
        }
        this.resourcePath = function() {
            let pvt = this._private

            if (pvt.originModel !== undefined) {
                return pvt.originModel.resourcePath()
            }

            return "/zeroconfig/" + pvt.name + "/"
        }
        this.property = function(name) {
            let pvt = this._private
            let property = pvt.properties[name]

            if (!property && pvt.originModel !== undefined) {
                property = pvt.originModel.property(name)
            }

            return property ? property.toString() : ""
        }
        this.imageMappings = function() {
            let pvt = this._private

            if (pvt.originModel !== undefined) {
                return pvt.originModel.imageMappings()
            }

            return pvt.imageMappings
        }
        this.list = function(name) {
            let pvt = this._private

            if (pvt.originModel !== undefined) {
                return pvt.originModel.list(name)
            }

            return pvt.lists[name]
        }
        this.type = function(name) {
            let pvt = this._private

            if (pvt.originModel !== undefined) {
                return pvt.originModel.type(name)
            }

            return pvt.types[name]
        }
        this.group = function(name) {
            let pvt = this._private

            if (pvt.originModel !== undefined) {
                return pvt.originModel.group(name)
            }

            return pvt.groups[name]
        }
        this.languages = function() {
            let pvt = this._private

            if (pvt.originModel !== undefined) {
                return pvt.originModel.languages()
            }

            return pvt.languages
        }
        this.language = function(name) {
            let pvt = this._private

            if (pvt.originModel !== undefined) {
                return pvt.originModel.language(name)
            }

            return pvt.languages[name]
        }
        this.registerCustomLangauge = function() {
            if ($.registerCustomLocale) {
                $.registerCustomLocale(this.languages())
            } else {
                console.warn("WARNING: required function unavailable")
            }
        }
        this.setOriginModel = function (origin) {
            this._private.originModel = origin
        }
        this.setImageMapping = function (id, mapping) {
            let pvt = this._private

            // only take "ImageMapping"
            if (mapping && mapping instanceof ZCParser.prototype.ImageMapping) {
                this._private.imageMappings[id] = mapping
            }
        }
        this.updateProperty = function (name, val) {
            let pvt = this._private
            if (name) {
                if (val || val === "") {
                    pvt.properties[name] = ZCHelper.dataFactory(val, pvt.sharedScope)
                } else if (val === null) {
                    delete pvt.properties[name]
                }
            }
        }
        this.updateList = function (name, val) {
            if (name) {
                // only take "LIST"
                if (val instanceof ZCParser.prototype.List) {
                    this._private.lists[name] = val
                } else if (val === null) {
                    delete this._private.lists[name]
                }
            }
        }
        this.updateType = function (name, val, type) {
            if (name) {
                // only take "CustomElementType"
                if (val instanceof CustomElementType) {
                    this._private.types[name] = val

                    // attempt to find override type
                    if (type) {
                        val.overrideDataEntties(type.dataEntities())
                    }
                } else if (val === null) {
                    delete this._private.types[name]
                }
            }
        }
        this.updateGroup = function (name, val) {
            if (name) {
                let pvt = this._private
                // only take "ModelGroup"
                if (val instanceof ZCParser.prototype.ModelGroup) {
                    if (!pvt.groupsIdMapping[name]) {
                        pvt.groups.push(val)
                        pvt.groupsIdMapping[name] = val
                    }
                } else if (val === null) {
                    delete this._private.groups[name]
                }
            }
        }
        this.updateLanguage = function (name, val) {
            if (name) {
                // only take "ModelLanguage"
                if (val instanceof ZCParser.prototype.ModelLanguage) {
                    this._private.languages[name] = val
                } else if (val === null) {
                    delete this._private.languages[name]
                }
            }
        }
        this.prepareListData = function() {
            let lists = this._private.lists
            for (let name in lists) {
                if (lists.hasOwnProperty(name)) {
                    lists[name].prepare()
                }
            }
        }
        this.generateFieldList = function(data) {
            let ret = {
                "source": [],
                "devmapping": {},
                "fieldMapping": {}
            }

            if (this._private.originModel !== undefined) {
                return this._private.originModel.generateFieldList(data)
            }

            let oriGroups = this._private.groups,
                oriGroupsLen = oriGroups.length
            for (let i = 0; i < oriGroupsLen; i++) {
                let orgLevel1 = oriGroups[i]
                let level1Scope = {}
                let newLevel1 = ZCHelper.deepItemClone(orgLevel1, level1Scope)
                newLevel1.pathName = newLevel1.name

                level1Scope.item = newLevel1
                level1Scope.parent = null

                let orgLevel1Len = orgLevel1.items ? orgLevel1.items.length : 0
                for (let j = 0; j < orgLevel1Len; j++) {
                    let orgLevel2 = orgLevel1.items[j]
                    let level2Scope = {}
                    let newLevel2 = ZCHelper.deepItemClone(orgLevel2, level2Scope)
                    newLevel2.pathName = newLevel1.pathName + "." + newLevel2.name

                    newLevel1.appendItem(newLevel2)

                    level2Scope.item = newLevel2
                    level2Scope.parent = newLevel1

                    let lastProcessElmId = 0
                    newLevel2._hasRepeatItem = false

                    let orgLevel2Len = orgLevel2.items ? orgLevel2.items.length : 0
                    for (let k = 0; k < orgLevel2Len; k++) {
                        let orgLevel3 = orgLevel2.items[k]
                        let found
                        let level3Scope = {}
                        let newLevel3 = ZCHelper.deepItemClone(orgLevel3, level3Scope)
                        newLevel3.pathName = newLevel2.pathName + "." + newLevel3.name

                        if (newLevel3.elementId > 0 && newLevel3.elementId === lastProcessElmId) {
                            newLevel2._hasRepeatItem = true
                        }

                        lastProcessElmId = newLevel3.elementId

                        if (data && (found = data[newLevel3.id])) {
                            newLevel3._loadedValue = found
                            newLevel3._selected = true
                        }

                        newLevel2.appendItem(newLevel3)
                        ret.fieldMapping[newLevel3.id] = newLevel3
                        if (newLevel3.mappings) {
                            for (let name in newLevel3.mappings) {
                                if (newLevel3.mappings.hasOwnProperty(name) && name !== "__scope__") {
                                    let nameUpper = name
                                    if (!ret.devmapping[nameUpper]) {
                                        ret.devmapping[nameUpper] = []
                                    }

                                    ret.devmapping[nameUpper].push(newLevel3)
                                }
                            }
                        }

                        level3Scope.item = newLevel3
                        level3Scope.parent = newLevel2
                    }
                }
                ret.source.push(newLevel1)
            }
            return ret
        }

        this.showInfo = function() {
            console.log("MODEL:" + this._private.id, this._private)
            // console.log("Model id: " + this._private.id + ", type: " + this._private.type +
            //            ", vendor: " + this._private.vendor + ", name: " + this._private.name +
            //            ", thumbnail path: " + this._private.thumbnail);

            // Model property
            // for (let key in this._private.properties) {
            //    console.log("|-- Property name: " + key +
            //    ", value: " + this._private.properties[key]);
            // }

            // Model list
            // for (key in this._private.lists) {
            //    let list = this._private.lists[key];
            //    list.showInfo();
            // }

            // // Model type
            // for (key in this._private.types) {
            //    let type = this._private.types[key];
            //    type.showInfo();
            // }

            // // Model group
            // for (key in this._private.groups) {
            //    let group = this._private.groups[key];
            //    group.showInfo();
            // }

            // // Model user-defined language
            // for (key in this._private.languages) {
            //    let language = this._private.languages[key];
            //    language.showInfo();
            // }
        }
    },
    // Provision modelling: group
    ModelGroup: function (id, name, label, visibility) {
        // private
        let m_key_item_mapping = null

        // public
        this._id = id
        this._name = name
        this._label = label
        this._visibility = visibility
        this._items = []

        // helper functions
        this.appendItem = function(item) {
            if (!m_key_item_mapping) {
                m_key_item_mapping = {}
            }

            this._items.push(item)
            m_key_item_mapping[item.id] = item
        }

        this.rebuildKeyItemMapping = function() {
            m_key_item_mapping = {}

            for (let i = 0; i < this._items.length; i++) {
                m_key_item_mapping[this._items[i]] = this._items[i]
            }
        }

        this.findItemByKey = function(key) {
            if (!m_key_item_mapping) {
                this.rebuildKeyItemMapping()
            }

            return m_key_item_mapping[key]
        }
    },
    // Provision modelling: groupfield
    ModelGroupfield: function (id, name, label, visibility, associatedfield) {
        // private
        let m_key_item_mapping = null

        // public
        this._id = id
        this._name = name
        this._label = label
        this._visibility = visibility
        this._associatedfield = associatedfield
        this._items = []

        // helper functions
        this.appendItem = function(item) {
            if (!m_key_item_mapping) {
                m_key_item_mapping = {}
            }

            this._items.push(item)
            m_key_item_mapping[item.id] = item
        }

        this.rebuildKeyItemMapping = function() {
            m_key_item_mapping = {}

            for (let i = 0; i < this._items.length; i++) {
                m_key_item_mapping[this._items[i]] = this._items[i]
            }
        }

        this.findItemByKey = function(key) {
            if (!m_key_item_mapping) {
                this.rebuildKeyItemMapping()
            }

            return m_key_item_mapping[key]
        }
    },
    // Provision modelling: field
    ModelField: function (id, name, label, type, defaultValue, tooltip,
                         regex, validation, monitor, visibility, associatedfield,
                         element_id, element_number) {
        this._id = id
        this._name = name
        this._label = label
        this._type = type
        this._defaultValue = defaultValue
        this._tooltip = tooltip
        this._validateRegex = regex
        this._validateError = validation
        this._monitor = monitor
        this._visibility = visibility
        this._associatedfield = associatedfield
        this._elementId = element_id
        this._elementNum = element_number
        this._mappings = {}

        this.updateMapping = function(key, value) {
            if (key) {
                this._mappings[key] = value
            }
        }
    },
    // Provision modelling: user-defined language
    ModelLanguage: function (id, name, defaultValue) {
        this._id = id
        this._name = name
        this._defaultValue = defaultValue
        this._extensions = {}

        this.translate = function(code) {
            let ret = this._extensions[code] || this._defaultValue
            return ret.toString()
        }

        this.updateExtension = function(key, value) {
            if (key) {
                this._extensions[key] = value
            }
        }
    },
    ImageMapping: function (id, path) {
        this._id = id
        this._path = path
        this._regions = {}

        // Getters
        this.getID = function() {
            return this._id
        }

        this.getPath = function() {
            return this._path
        }

        this.getRegions = function() {
            return this._regions
        }

        // Helpers
        this.appendRegion = function(id, region) {
            this._regions[id] = region
        }
    },
    ImageMappingRegion: function (id, x, y, width, height) {
        this._id = id
        this._x = x
        this._y = y
        this._width = width
        this._height = height
        this._links = {}

        // Getters
        this.getID = function() {
            return this._id
        }

        this.getX = function() {
            return this._x
        }

        this.getY = function() {
            return this._y
        }

        this.getWidth = function() {
            return this._width
        }

        this.getHeight = function() {
            return this._height
        }

        this.toCoords = function() {
            return `${this._x},${this._y},${this._x + this._width},${this._y + this._height}`
        }

        this.getLink = function(pageName) {
            return this._links[pageName]
        }

        // Helpers
        this.appendLink = function(page_name, link) {
            this._links[page_name] = link
        }
    },
    ImageMappingRegionLink: function (page_name, scope_name, level1, level2, level3) {
        this._pageName = page_name
        this._scopeName = scope_name
        this._level1 = level1
        this._level2 = level2
        this._level3 = level3

        // Getters
        this.getPageName = function() {
            return this._pageName
        }

        this.getScopeName = function() {
            return this._scopeName
        }

        this.getLevel1 = function() {
            return this._level1
        }

        this.getLevel2 = function() {
            return this._level2
        }

        this.getLevel3 = function() {
            return this._level3
        }

        this.getFullPath = function() {
            let ret = ""
            if (this._level1) {
                ret += this._level1
                if (this._level2) {
                    ret += "." + this._level2

                    if (this._level3) {
                        ret += "." + this._level3
                    }
                }
            }

            return ret
        }
    },
    DataEntity: function (name, def, validateRegex, validateError) {
        this._private = {}
        this._private.name = name
        this._private.defaultValue = def
        this._private.validateRegex = validateRegex
        this._private.validateError = validateError

        this.name = function(val) {
            if (val) {
                this._private.name = val
            }

            return this._private.name
        }

        this.defaultValue = function(val) {
            if (val) {
                this._private.defaultValue = val
            }

            return this._private.defaultValue
        }

        this.validateRegex = function(val) {
            if (val) {
                this._private.validateRegex = val
            }

            return this._private.validateRegex
        }

        this.validateError = function(val) {
            if (val) {
                this._private.validateError = val
            }

            return this._private.validateError
        }
    },
    DataCollection: function() {
        this.m_blocks = []
        this.m_blocksIdMapping = {}
        this.m_typeBlocks = []
        this.m_typeBlocksIdMapping = {}
        this.m_globalLists = {}
        this.m_globalTypes = {}
        this.m_models = {}
        this.m_invalidModels = {}

        this.reset = function() {
            this.m_blocks.length = 0
            this.m_blocksIdMapping = {}
            this.m_typeBlocks.length = 0
            this.m_typeBlocksIdMapping = {}
            this.m_globalLists = {}
            this.m_globalTypes = {}
            this.m_models = {}
            this.m_invalidModels = {}
        }

        // for debugging
        this.showInfo = function() {
            console.log("BLOCKS", this.m_blocks)
            console.log("TYPEBLOCKS", this.m_typeBlocks)
            console.log("GLOBALLISTS", this.m_globalLists)
            console.log("GLOBALTYPES", this.m_globalTypes)
            console.log("MODELS", this.m_models)
        }

        this.generateTypeBlockList = function(type, data) {
            let ret = []
            let original = null

            if (type) {
                for (let i = 0; i < this.m_typeBlocks.length; i++) {
                    if (type === this.m_typeBlocks[i].name) {
                        original = this.m_typeBlocks[i]
                        break
                    }
                }

                if (original) {
                    for (let j = 0; j < original.items.length; j++) {
                        let orgBlockElm = original.items[j]
                        let blockElmScope = {}
                        let newBlockElm = ZCHelper.deepItemClone(orgBlockElm, blockElmScope)
                        let hasChild = false
                        newBlockElm.pathName = "TypeBlock." + newBlockElm.name
                        blockElmScope.item = newBlockElm
                        blockElmScope.parent = null

                        for (let k = 0; k < orgBlockElm.items.length; k++) {
                            let orgElement = orgBlockElm.items[k]
                            let max = 1
                            if (orgElement.maxoccurs) {
                                max = parseInt(orgElement.maxoccurs.toString())
                            }

                            if (max > 1) {
                                newBlockElm._hasRepeatItem = true
                            }

                            for (let l = 0; l < max; l++) {
                                let found
                                let elementScope = {}
                                let newElement = ZCHelper.deepItemClone(orgElement, elementScope)
                                newElement.pathName = newBlockElm.pathName + "." + newElement.name
                                newElement.elementNum = l + 1
                                if (data && (found = data[newElement.uniqueId()])) {
                                    newElement._loadedValue = found
                                    newElement._selected = true
                                }

                                newBlockElm.appendItem(newElement)

                                elementScope.item = newElement
                                elementScope.parent = newBlockElm
                                hasChild = true
                            }
                        }
                        if (hasChild) {
                            ret.push(newBlockElm)
                        }
                    }
                }
            }

            return ret
        }

        this.generateGlobalBlockList = function(data) {
            let ret = []
            for (let i = 0; i < this.m_blocks.length; i++) {
                let orgBlock = this.m_blocks[i]
                let blockScope = {}
                let newBlock = ZCHelper.deepItemClone(orgBlock, blockScope)
                newBlock.pathName = newBlock.name
                blockScope.item = newBlock
                blockScope.parent = null
                let orgBlockLen = orgBlock.items.length
                for (let j = 0; j < orgBlock.items.length; j++) {
                    let orgBlockElm = orgBlock.items[j]
                    let blockElmScope = {}
                    
                    let newBlockElm = ZCHelper.deepItemClone(orgBlockElm, blockElmScope)
                    newBlockElm.pathName = newBlock.pathName + "." + newBlockElm.name
                    newBlock.appendItem(newBlockElm)
                    
                    blockElmScope.item = newBlockElm
                    blockElmScope.parent = newBlock
                    let orgBlockElmLen = orgBlockElm.items.length
                    for (let k = 0; k < orgBlockElm.items.length; k++) {
                        let orgElement = orgBlockElm.items[k]
                        let max = 1
                        if (orgElement.maxoccurs) {
                            max = parseInt(orgElement.maxoccurs.toString())
                        }

                        if (max > 1) {
                            newBlockElm._hasRepeatItem = true
                        }

                        for (let l = 0; l < max; l++) {
                            let found
                            let elementScope = {}
                            let newElement = ZCHelper.deepItemClone(orgElement, elementScope)
                            
                            newElement.pathName = newBlockElm.pathName + "." + newElement.name
                            newElement.elementNum = l + 1
                            if (data && (found = data[newElement.uniqueId()])) {
                                newElement._loadedValue = found
                                newElement._selected = true
                            }

                            newBlockElm.appendItem(newElement)

                            elementScope.item = newElement
                            elementScope.parent = newBlockElm
                        }
                    }
                }
                ret.push(newBlock)
            }
            return ret
        }

        this.generateBasicModelList = function() {
            let ret = []
            for (const name in this.m_models) {
                if (this.m_models.hasOwnProperty(name)) {
                    let model = this.m_models[name]
                    let newModel = {}
                    newModel.id = model.id()
                    newModel.modelType = model.modelType()
                    newModel.vendor = model.vendor()
                    newModel.name = model.name()
                    newModel.thumbnail = model.thumbnail()

                    ret.push(newModel)
                }
            }

            ret.sort((a, b) => {
                return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
            })

            return ret
        }

        // BLOCK
        this.getBlock = function(id) {
            if (id) {
                return this.m_blocksIdMapping[id]
            }

            return undefined
        }

        this.addBlock = function(item) {
            if (!this.m_blocksIdMapping[item.id]) {
                this.m_blocks.push(item)
                this.m_blocksIdMapping[item.id] = item
            }
        }

        // TYPEBLOCK
        this.getTypeBlock = function(id) {
            if (id) {
                return this.m_typeBlocksIdMapping[id]
            }

            return undefined
        }

        this.getTypeBlockByName = function(name) {
            for (let i = 0; i < this.m_typeBlocks.length; i++) {
                if (this.m_typeBlocks[i].name === name) {
                    return this.m_typeBlocks[i]
                }
            }

            return undefined
        }

        this.addTypeBlock = function(item) {
            if (!this.m_typeBlocksIdMapping[item.id]) {
                this.m_typeBlocks.push(item)
                this.m_typeBlocksIdMapping[item.id] = item
            }
        }

        // List
        this.prepareGlobalList = function() {
            for (const name in this.m_globalLists) {
                if (this.m_globalLists.hasOwnProperty(name)) {
                    this.m_globalLists[name].prepare()
                }
            }
        }

        // GLOBALTYPES
        this.getGlobalType = function(key) {
            if (key) {
                return this.m_globalTypes[key]
            }

            return undefined
        }

        this.setGlobalType = function(key, val) {
            this.m_globalTypes[key] = val
        }

        // GLOBALLISTS
        this.getGlobalList = function(key) {
            if (key) {
                return this.m_globalLists[key]
            }

            return undefined
        }

        this.setGlobalList = function(key, val) {
            this.m_globalLists[key] = val
        }

        // MODEL
        this.getModelByName = function(vendor, modelName) {
            for (const name in this.m_models) {
                if (this.m_models.hasOwnProperty(name)) {
                    const model = this.m_models[name]
                    if (vendor !== undefined && modelName !== undefined &&
                        vendor.toLowerCase() === model.vendor().toLowerCase() &&
                        modelName.toLowerCase() === model.name().toLowerCase()) {
                        return model
                    }
                }
            }
            return undefined
        }

        this.getModel = function(key) {
            if (key) {
                return this.m_models[key]
            }

            return undefined
        }

        this.setModel = function(key, val) {
            this.m_models[key] = val
        }

        this.setModelAlias = function(modelId, originId) {
            let model = this.getModel(modelId)
            let origin = this.getModel(originId)

            // Sanity check
            if (model === undefined || origin === undefined) {
                console.log("ERR! invalid model alias, model id: ", modelId,
                            ", origin id: ", originId)
                return
            }

            model.setOriginModel(origin)
        }

        this.resetInvalidModel = function() {
            this.m_invalidModels = {}
        }

        this.setInvalidModel = function(key, val) {
            this.m_invalidModels[key] = val
        }

        this.getInvalidModelByName = function(vendorName, modelName) {
          for (const item in this.m_invalidModels) {
              let model = this.m_invalidModels[item].name
              let vendor = this.m_invalidModels[item].vendor

              if (model !== undefined && vendor !== undefined &&
                  vendorName.toLowerCase() === vendor.toLowerCase() &&
                  modelName.toLowerCase() === model.toLowerCase()) {
                  return model
              }
          }
          return undefined
        }
    }
}

module.exports = new ZCParser()
/* eslint no-eval: 0 */

import $ from 'jquery'
import { browserHistory } from 'react-router'
import api from "../../../api/api"
import UCMGUI from "../../../api/ucmgui"
import * as global from './global'
import * as ZCHelper from './ZCHelper'
import ZCParser from './ZCParser'
import { timers, ZCCurConfig, ValueDelegationObj, ValueMonitorObj } from './ZCController'
import CustomElementType from './ZCBase'

let initialized = 0
let ZEROCONFIG = function() {
	this._data = {
	    cgiData: {},
	    DataCollection: null,
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
	}
}

ZEROCONFIG.prototype = {	
	reset: function() {
	    console.log("Clear Cache data...")
	    this._data.ready = 0
	    initialized = 0
	    this._data.DataCollection.reset()
	},
	init: function(callback) {
		if (initialized === 1) {
			if (typeof callback === "function") {
				callback.call({})
			}
		return
	    } 

	    console.log("Initialize...")
	    // Initialize variables
	    this._data.DataCollection = new ZCParser.DataCollection()
	    this._data.blocks = {}
	    this._data.typeBlocks = {}
	    this._data.blockelements = {}
	    this._data.elements = {}
	    this._data.globalListsById = {}
	    this._data.globalTypes = {}
	    this._data.globalTypesById = {}
	    this._data.models = {}
	    this._data.modelListsById = {}
	    this._data.modelTypesById = {}
	    this._data.modelGroups = {}
	    this._data.modelGroupfields = {}
	    this._data.modelFields = {}
	    this._data.modelLanguages = {}
	    this._data.modelMappings = {}
	    this._data.modelMappingRegions = {}

	    // provision building blocks: block
	    let data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_BLOCK,
	        "this.getContext().connector.getAllBlocks", this)
	    this._data.cgiData[data.getName()] = data

	    // provision building blocks: blockelement
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_BLOCKELEMENT,
	        "this.getContext().connector.getAllBlockelements", this)
	    this._data.cgiData[data.getName()] = data

	    // provision building blocks: element
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_ELEMENT,
	        "this.getContext().connector.getAllElements", this)
	    this._data.cgiData[data.getName()] = data

	    // Global list
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_GLOBAL_LIST,
	        "this.getContext().connector.getAllGlobalLists", this)
	    this._data.cgiData[data.getName()] = data

	    // Global type
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_GLOBAL_TYPE,
	        "this.getContext().connector.getAllGlobalTypes", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: model
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL,
	        "this.getContext().connector.getAllModels", this)
	    this._data.cgiData[data.getName()] = data

	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_ALIAS,
	        "this.getContext().connector.getAllModelAliases", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: list
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_LIST,
	        "this.getContext().connector.getAllModelLists", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: type
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_TYPE,
	        "this.getContext().connector.getAllModelTypes", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: property
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_PROPERTY,
	        "this.getContext().connector.getAllModelProperties", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: group
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_GROUP,
	        "this.getContext().connector.getAllModelGroups", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: groupfield
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_GROUPFIELD,
	        "this.getContext().connector.getAllModelGroupfields", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: field
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_FIELD,
	        "this.getContext().connector.getAllModelFields", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: field mapping
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_FIELD_MAPPING,
	        "this.getContext().connector.getAllModelFieldMappings", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: language
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_LANGUAGE,
	        "this.getContext().connector.getAllModelLanguages", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: language extension
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_LANGUAGE_EXTENSION,
	        "this.getContext().connector.getAllModelLanguageExtensions", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: image mapping
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_IMAGEMAPPING,
	        "this.getContext().connector.getAllModelImageMappings", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: image mapping region
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_IMAGEMAPPING_REGION,
	        "this.getContext().connector.getAllModelImageMappingRegions", this)
	    this._data.cgiData[data.getName()] = data

	    // model-based provision: image mapping region link
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_MODEL_IMAGEMAPPING_REGION_LINK,
	        "this.getContext().connector.getAllModelImageMappingRegionLinks", this)
	    this._data.cgiData[data.getName()] = data

	    // Data for both global and model: list item
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_LIST_ITEM,
	        "this.getContext().connector.getAllListItems", this)
	    this._data.cgiData[data.getName()] = data

	    // Data for both global and model: type entity
	    data = new ZCHelper.CGIData(global.CGI_DATA_TYPE.CGI_DATA_TYPE_ENTITY,
	        "this.getContext().connector.getAllTypeEntities", this)
	    this._data.cgiData[data.getName()] = data 

	    // Initialize modules
	    ValueDelegationObj.init()

	    // Check Invalid Models
	     this.connector.checkZeroConfigInvalidModels(null, false)

	    // Start a timer to wait for parsing XML files
	    let checkParserStatus = () => {
	        // if (top.$.cookie('role') !== 'privilege_3') {
	        	this.connector.getParserStatus().done(result => {
	            	const status = result.status
	            	
	                // Get provision building blocks' data
	                if (status === 0) {
	                    // Execute all required data
	                    for (const name in this._data.cgiData) {
	                    	this._data.cgiData[name].executeCommand(false)
	                    }
	                        
	                    // Start a timer to process returned CGI data
	                    timers.add(ZCHelper.processCGIData, this._data.cgiData, data => {
	                    	this._data.ready = 1
	                        if (typeof (callback) === "function") {
	                        	callback.call({})
	                        }
	                    })
	                    timers.start()
	                } else {
	                    this._data.ready = -1
	                    setTimeout(checkParserStatus, 30 * 1000)
	                }
	            }).fail(function() {
	                console.warn("Failed to get the parser status")
	            })
	        // }
	    }
	    checkParserStatus()
	    
	    initialized = 1
	},
	getDataCollection: function() {
		return this._data.DataCollection
	}, /*
	getList: function(scope, model_id, name) {
	    var list

	    if (scope === "global") {
	        list = BLL.DataCollection.getGlobalLis(name)
	    } else if (scope === "model") {
	        var model = BLL.DataCollection.getModel(model_id)

	        if (model !== "undefined") {
	            list = model.list(name)
	        }
	    }

	    // Sanity check
	    if (typeof (list) === "undefined") {
	        return null
	    }

	    // Update list items
	    if (list.getSource()) {

	    }

	    return list
	}, */
	isDataReady: function() {
	    return this._data.ready
	},
	connector: {
	    getAllBlocks: function() {
	    	let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_BLOCK]
	        
	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllBlocks: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllBlocks"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                	myData.setData(data.response.zc_block, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let blocks = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()
                            for (; index < endIndex; index++) {
	                            let item = blocks[index]
	                            let block = new ZCParser.Block(item.id,
	                                item.name,
	                                ZCHelper.dataFactory(item.label),
	                                item.isType,
	                                item.visibility)
	                            
	                            if (item.isType === 0) {
	                                this._data.DataCollection.addBlock(block)
	                            } else {
	                                this._data.DataCollection.addTypeBlock(block)
	                            }	                            
	                        }
	                        return arg.nextIteration(index) 
	                    })
	                }
	            }
	        })
	    }, 
	    getAllBlockelements: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_BLOCKELEMENT]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllBlockelements: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllBlockelements"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_blockelement, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let blockelements = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = blockelements[index],
	                            	block_id = item.block_id.toString(),
	                                block = this._data.DataCollection.getBlock(item.block_id)

	                            // Look at type blocks if given block id does not exist
	                            // on list of provision building blocks
	                            if (typeof (block) === "undefined") {
	                                block = this._data.DataCollection.getTypeBlock(item.block_id)
	                            }

	                            if (typeof (block) === "undefined") {
	                                console.warn("Invalid block id: " + item.block_id, item)
	                                continue
	                            }
	                            let blockElement = new ZCParser.BlockElement(item.id,
	                                item.name,
	                                ZCHelper.dataFactory(item.label),
	                                item.visibility)
	                            block.appendItem(blockElement)
	                            this._data.blockelements[item.id] = blockElement
	                        }

	                        return arg.nextIteration(index) 
	                    })
	                }
	            }
	        })
	    }, 
	    getAllElements: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_ELEMENT]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllElements: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllElements"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_element, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let elements = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                        	let item = elements[index],
	                                blockelement_id = elements[index].blockelement_id.toString(),
	                                blockelement = this._data.blockelements[blockelement_id]

	                            if (typeof (blockelement) === "undefined") {
	                                console.warn("Invalid blockelement id: " + blockelement_id, item)
	                                continue
	                            }
	                            
	                            let element = new ZCParser.Element(item.id,
	                                item.name,
	                                ZCHelper.dataFactory(item.label),
	                                item.type,
	                                ZCHelper.dataFactory(item.defaultValue),
	                                ZCHelper.dataFactory(item.tooltip),
	                                item.regex,
	                                ZCHelper.dataFactory(item.validation),
	                                item.monitor,
	                                ZCHelper.dataFactory(item.maxoccurs),
	                                item.visibility)
	                            blockelement.appendItem(element)
	                            this._data.elements[item.id] = element
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    }, 
	    getAllGlobalLists: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_GLOBAL_LIST]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllGlobalLists: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllGlobalLists"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_global_list, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let lists = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let list = new ZCParser.List(lists[index].id,
	                                lists[index].name,
	                                ZCHelper.dataFactory(lists[index].source),
	                                lists[index].default_label,
	                                lists[index].default_value)

	                            this._data.DataCollection.setGlobalList(lists[index].name, list)
	                            this._data.globalListsById[lists[index].id] = list
	                        }
	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    }, 
	    getAllGlobalTypes: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_GLOBAL_TYPE]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllGlobalTypes: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllGlobalTypes"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_global_type, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let types = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = types[index]
	                            let type = new CustomElementType(item.id,
	                                item.name,
	                                item.view)

	                            this._data.DataCollection.setGlobalType(item.name, type)
	                            this._data.globalTypesById[item.id] = type
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModels: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModels: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModels"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let models = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = models[index]
	                            let model = new ZCParser.Model(item.id,
	                                item.type,
	                                item.vendor,
	                                item.name,
	                                item.image_path,
	                                item.base_version,
	                                item.xml_version)

	                            this._data.DataCollection.setModel(item.id, model)
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelAliases: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_ALIAS]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelAliases: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelAliases"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_alias, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let aliases = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = aliases[index]
	                            this._data.DataCollection.setModelAlias(item.model_id, item.origin_id)
	                        }
	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelLists: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_LIST]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelLists: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelLists"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_list, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let lists = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()
                        	for (; index < endIndex; index++) {
	                            let item = lists[index]
	                            let model = this._data.DataCollection.getModel(item.model_id)
								if (typeof (model) === "undefined") {
	                                console.warn("Invalid model id:" + item.model_id, item)
	                                continue
	                            }

	                            let list = new ZCParser.List(item.id,
	                                item.name,
	                                item.source,
	                                item.default_label,
	                                item.default_value)
	                            model.updateList(item.name, list)
	                            this._data.modelListsById[item.id] = list
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelTypes: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_TYPE]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelTypes: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelTypes"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_type, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let types = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = types[index]
	                            let model = this._data.DataCollection.getModel(item.model_id)

	                            if (typeof (model) === "undefined") {
	                                console.warn("Invalid model id: " + item.model_id, item)
	                                continue
	                            }

	                            let type = new CustomElementType(item.id,
	                                item.name,
	                                item.view)

	                            model.updateType(item.name, 
                            		type, 
                            		this._data.DataCollection.getGlobalType(item.name))
	                            this._data.modelTypesById[item.id] = type
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelProperties: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_PROPERTY]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelProperties: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelProperties"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_property, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let properties = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = properties[index]
	                            let model = this._data.DataCollection.getModel(item.model_id)

	                            if (typeof (model) === "undefined") {
	                                console.warn("Invalid model id: " + item.model_id, item)
	                                continue
	                            }

	                            model.updateProperty(item.name,
	                                item.value)
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    }, 
	    getAllModelGroups: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_GROUP]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelGroups: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelGroups"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_group, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let groups = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = groups[index]
	                            let model = this._data.DataCollection.getModel(item.model_id)

	                            if (typeof (model) === "undefined") {
	                                console.warn("Invalid model id: " + item.model_id, item)
	                                continue
	                            }

	                            let group = new ZCParser.ModelGroup(item.id,
	                                item.name,
	                                ZCHelper.dataFactory(item.label),
	                                item.visibility)
	                            model.updateGroup(item.id, group)
	                            this._data.modelGroups[item.id] = group
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelGroupfields: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_GROUPFIELD]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelGroupfields: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelGroupfields"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_groupfield, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        var groupfields = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = groupfields[index]
	                            let group_id = item.group_id.toString(),
	                                group = this._data.modelGroups[group_id]

	                            if (typeof (group) === "undefined") {
	                                console.warn("Invalid group id: " + group_id, item)
	                                continue
	                            }

	                            let groupfield = new ZCParser.ModelGroupfield(item.id,
	                                item.name,
	                                ZCHelper.dataFactory(item.label),
	                                item.visibility,
	                                item.associatedfield)
	                            group.appendItem(groupfield)
	                            this._data.modelGroupfields[item.id] = groupfield
	                        }
	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelFields: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_FIELD]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelFields: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelFields"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_field, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let fields = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = fields[index]
	                            let groupfield_id = item.groupfield_id.toString(),
	                                groupfield = this._data.modelGroupfields[groupfield_id]

	                            if (typeof (groupfield) === "undefined") {
	                                console.warn("Invalid groupfield id: " + groupfield_id, item)
	                                continue
	                            }

	                            let element = this._data.elements[item.element_id]
	                            let field

	                            // Override field information based on element information
	                            // if fieldreused
	                            if (element !== undefined) {
	                                // default value can be overridden in fieldreused
	                                if (!item.defaultValue) {
	                                    item.defaultValue = element.defaultValue
	                                } else {
	                                    item.defaultValue = ZCHelper.dataFactory(item.defaultValue)
	                                }

	                                field = new ZCParser.ModelField(item.id,
	                                    item.name,
	                                    item.label ? ZCHelper.dataFactory(item.label) : element.label,
	                                    element.type,
	                                    item.defaultValue,
	                                    element.tooltip,
	                                    element.validateRegex,
	                                    element.validateError,
	                                    item.monitor ? item.monitor : element.monitor,
	                                    item.visibility,
	                                    item.associatedfield,
	                                    item.element_id,
	                                    item.element_number)
	                            } else {
	                                field = new ZCParser.ModelField(item.id,
	                                    item.name,
	                                    ZCHelper.dataFactory(item.label),
	                                    item.type,
	                                    ZCHelper.dataFactory(item.defaultValue),
	                                    ZCHelper.dataFactory(item.tooltip),
	                                    item.regex,
	                                    ZCHelper.dataFactory(item.validation),
	                                    item.monitor,
	                                    item.visibility,
	                                    item.associatedfield,
	                                    item.element_id,
	                                    item.element_number)
	                            }

	                            groupfield.appendItem(field)
	                            this._data.modelFields[fields[index].id] = field
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelFieldMappings: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_FIELD_MAPPING]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelFieldMappings: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelFieldMappings"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_field_mapping, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let mappings = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = mappings[index],
	                                field_id = item.field_id.toString(),
	                                field = this._data.modelFields[field_id]
	                            if (typeof (field) === "undefined") {
	                                console.warn("Invalid field id: " + field_id, item)
	                                continue
	                            }

	                            field.updateMapping(item.devname, item.name)
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelLanguages: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_LANGUAGE]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelLanguages: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelLanguages"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_language, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let languages = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = languages[index]
	                            let model = this._data.DataCollection.getModel(item.model_id)
	                            if (typeof (model) === "undefined") {
	                                console.warn("Invalid model id: " + item.model_id, item)
	                                continue
	                            }
	                            let language = new ZCParser.ModelLanguage(item.id,
	                                item.name,
	                                ZCHelper.dataFactory(item.defaultValue))
	                            model.updateLanguage(item.name, language)
	                            this._data.modelLanguages[item.id] = language
	                        }
	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelLanguageExtensions: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_LANGUAGE_EXTENSION]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelLanguageExtensions: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelLanguageExtensions"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_language_extension, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let extensions = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = extensions[index]
	                            let language_id = item.language_id.toString(),
	                                language = this._data.modelLanguages[language_id]

	                            if (typeof (language) === "undefined") {
	                                console.warn("Invalid language id: " + language_id, item)
	                                continue
	                            }

	                            language.updateExtension(item.code, item.value)
	                        }
	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelImageMappings: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_IMAGEMAPPING]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelImageMappings: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelImageMappings"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_imagemapping, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let mappings = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = mappings[index]
	                            let model = this._data.DataCollection.getModel(item.model_id)
	                            let mapping = null

	                            if (typeof (model) === "undefined") {
	                                console.warn("Invalid model id: " + item.model_id, item)
	                                continue
	                            }

	                            mapping = new ZCParser.ImageMapping(item.id, item.path)
	                            model.setImageMapping(item.id, mapping)
	                            this._data.modelMappings[item.id] = mapping
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelImageMappingRegions: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_IMAGEMAPPING_REGION]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelImageMappingRegions: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelImageMappingRegions"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_imagemapping_region, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let regions = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = regions[index]
	                            let mapping = this._data.modelMappings[item.image_id]
	                            let region = null

	                            if (typeof (mapping) === "undefined") {
	                                console.warn("Invalid image mapping: " + item)
	                                continue
	                            }

	                            region = new ZCParser.ImageMappingRegion(item.id, item.x, item.y,
	                                item.width, item.height)
	                            mapping.appendRegion(item.id, region)
	                            this._data.modelMappingRegions[item.id] = region
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllModelImageMappingRegionLinks: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_MODEL_IMAGEMAPPING_REGION_LINK]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllModelImageMappingRegionLinks: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelImageMappingRegionLinks"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_model_imagemapping_region_link, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let links = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = links[index]
	                            let region = this._data.modelMappingRegions[item.region_id]
	                            let link = null

	                            if (typeof (region) === "undefined") {
	                                console.warn("Invalid image mapping region: " + item)
	                                continue
	                            }

	                            link = new ZCParser.ImageMappingRegionLink(item.page_name,
	                                item.scope_name, 
	                                item.level1,
	                                item.level2, 
	                                item.level3)
	                            region.appendLink(item.page_name, link)
	                        }	                        

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllListItems: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_LIST_ITEM]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllListItems: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllListItems"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_list_item, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let items = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            // Scope handling
	                            let list,
	                                list_id = items[index].list_id.toString()

	                            if (items[index].scope_name === "global") {
	                                list = this._data.globalListsById[list_id]
	                            } else if (items[index].scope_name === "model") {
	                                list = this._data.modelListsById[list_id]
	                            }

	                            // Sanity check
	                            if (typeof (list) === "undefined") {
	                                console.warn("Invalid list:" + list_id, items[index])

	                                continue
	                            }

	                            list.appendItem(ZCHelper.dataFactory(items[index].label),
	                                ZCHelper.dataFactory(items[index].value))
	                        }

	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    },
	    getAllTypeEntities: function() {
	        let myData = this._data.cgiData[global.CGI_DATA_TYPE.CGI_DATA_TYPE_ENTITY]

	        // Sanity check
	        if (typeof (myData) === "undefined") {
	            console.log("getAllTypeEntities: Failed to get cgiData")
	            return
	        }

	        // Update the start time to execute this function
	        myData.updateStartTime()

	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllTypeEntities"
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error: " + textStatus)
	            },
	            success: data => {
	                const noError = UCMGUI.errorHandler(data)

	                if (noError) {
	                    myData.setData(data.response.zc_type_entity, global.CGI_DATA_CHUCK_SIZE)
	                    myData.setState(global.CGI_STATE_TYPE.CGI_STATE_DOWNLOADED)
	                    myData.setHandler(arg => {
	                        let entities = arg.getData(),
	                            index = arg.getCurrentIndex(),
	                            endIndex = arg.getEndIndex()

	                        for (; index < endIndex; index++) {
	                            let item = entities[index]
	                            // Scope handling
	                            let type,
	                                type_id = entities[index].type_id.toString()

	                            if (entities[index].scope_name === "global") {
	                                type = this._data.globalTypesById[type_id]
	                            } else if (entities[index].scope_name === "model") {
	                                type = this._data.modelTypesById[type_id]
	                            }

	                            // Sanity check
	                            if (typeof (type) === "undefined") {
	                                console.warn("Invalid type:" + type_id, item)

	                                continue
	                            }

	                            let entity = new ZCParser.DataEntity(item.name,
	                                ZCHelper.dataFactory(item.defaultValue),
	                                item.regex,
	                                ZCHelper.dataFactory(item.validation))

	                            type.dataEntities(item.name, entity)
	                        }
	                        return arg.nextIteration(index)
	                    })
	                }
	            }
	        })
	    }, 
	    // Provision Template
	    // Type can be global, model, or all.
	    /* getAllTemplates: function(type, filter) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllTemplates",
	                template_type: type,
	                filter: filter || ""
	            },
	            async: true,
	        })
	    },
	    getAllModelTemplates: function(modelId, enabled) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getAllModelTemplates",
	                model_id: modelId,
	                enabled: enabled || ""
	            },
	            async: true,
	        })
	    }, */
	    getTemplate: function(id) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getTemplate",
	                id: id
	            },
	            async: true
	        })
	    },
	    /* getTemplateByName: function(name, modelId) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getTemplateByName",
	                name: name.toString(),
	                model_id: modelId || ""
	            },
	            async: false // purposely make it not sync call
	        })
	    },
	    // If id is -1, this operation will insert new template
	    // otherwise, update given template id.
	    // If modelId is null, the template type is global otherwise, model.
	    updateTemplate: function(id, name, modelId, description, enabled, isDefault) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
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
	        })
	    },
	    deleteTemplate: function(id) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteTemplate",
	                id: id.toString()
	            },
	            async: true,
	        })
	    },
	    toggleTemplateEnable: function(id) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "toggleTemplateEnable",
	                id: id.toString()
	            },
	            async: true,
	        })
	    }, */
	    // Provision template settings
	    getTemplateSettings: function(templateId) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getTemplateSettings",
	                template_id: templateId
	            },
	            async: true
	        })
	    }, /*
	    updateTemplateSettings: function(templateId, elementId, elementNumber, entityName, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "updateTemplateSettings",
	                template_id: templateId.toString(),
	                element_id: elementId.toString(),
	                element_number: elementNumber.toString(),
	                entity_name: entityName.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    deleteTemplateSettings: function(templateId, elementId, elementNumber, entityName) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteTemplateSettings",
	                template_id: templateId.toString(),
	                element_id: elementId.toString(),
	                element_number: elementNumber.toString(),
	                entity_name: entityName.toString()
	            },
	            async: true,
	        })
	    },
	    deleteAllTemplateSettings: function(templateId) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteAllTemplateSettings",
	                template_id: templateId.toString()
	            },
	            async: true,
	        })
	    }, */
	    // Provision model template settings
	    getModelTemplateSettings: function(templateId) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getModelTemplateSettings",
	                template_id: templateId
	            },
	            async: true
	        })
	    },
	    /* updateModelTemplateSettings: function(templateId, fieldId, entityName, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "updateModelTemplateSettings",
	                template_id: templateId.toString(),
	                field_id: fieldId.toString(),
	                entity_name: entityName.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    deleteModelTemplateSettings: function(templateId, fieldId, entityName) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteModelTemplateSettings",
	                template_id: templateId.toString(),
	                field_id: fieldId.toString(),
	                entity_name: entityName.toString()
	            },
	            async: true,
	        })
	    },
	    deleteAllModelTemplateSettings: function(templateId) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteAllModelTemplateSettings",
	                template_id: templateId.toString()
	            },
	            async: true,
	        })
	    }, */
	    // Provision model template custom settings
	    getModelTemplateCustomSettings: function(templateId) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getModelTemplateCustomSettings",
	                template_id: templateId
	            },
	            async: true
	        })
	    },
	    /* updateModelTemplateCustomSettings: function(templateId, devName, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "updateModelTemplateCustomSettings",
	                template_id: templateId.toString(),
	                devname: devName.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    deleteModelTemplateCustomSettings: function(templateId, devName) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteModelTemplateCustomSettings",
	                template_id: templateId.toString(),
	                devname: devName.toString()
	            },
	            async: true,
	        })
	    },
	    deleteAllModelTemplateCustomSettings: function(templateId) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteAllModelTemplateCustomSettings",
	                template_id: templateId.toString()
	            },
	            async: true,
	        })
	    },
	    // Provision device template mapping
	    getDeviceTemplateMappings: function(mac) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getDeviceTemplateMappings",
	                mac: mac
	            },
	            async: true,
	        })
	    },
	    updateDeviceTemplateMappings: function(mac, templateId, priority) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "updateDeviceTemplateMappings",
	                mac: mac.toString(),
	                template_id: templateId.toString(),
	                priority: priority.toString()
	            },
	            async: true,
	        })
	    },
	    deleteDeviceTemplateMappings: function(mac, keepModelTemps) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteDeviceTemplateMappings",
	                mac: mac.toString(),
	                keepModelTemplates: keepModelTemps.toString()
	            },
	            async: true,
	        })
	    },
	    // Provision device settings
	    getDeviceSettings: function(mac) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getDeviceSettings",
	                mac: mac
	            },
	            async: true,
	        })
	    },
	    insertDeviceSettings: function(mac, fieldId, entityName, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "insertDeviceSettings",
	                mac: mac.toString(),
	                field_id: fieldId.toString(),
	                entity_name: entityName.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    updateDeviceSettings: function(mac, fieldId, entityName, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "updateDeviceSettings",
	                mac: mac.toString(),
	                field_id: fieldId.toString(),
	                entity_name: entityName.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    deleteDeviceSettings: function(mac, fieldId, entityName) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteDeviceSettings",
	                mac: mac.toString(),
	                field_id: fieldId.toString(),
	                entity_name: entityName.toString()
	            },
	            async: true,
	        })
	    },
	    deleteAllDeviceSettings: function(mac) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteAllDeviceSettings",
	                mac: mac.toString()
	            },
	            async: true,
	        })
	    },
	    // Provision device custom settings
	    getDeviceCustomSettings: function(mac) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getDeviceCustomSettings",
	                mac: mac
	            },
	            async: true,
	        })
	    },
	    insertDeviceCustomSettings: function(mac, devname, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "insertDeviceCustomSettings",
	                mac: mac.toString(),
	                devname: devname.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    updateDeviceCustomSettings: function(mac, devname, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "updateDeviceCustomSettings",
	                mac: mac.toString(),
	                devname: devname.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    deleteDeviceCustomSettings: function(mac, devname) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteDeviceCustomSettings",
	                mac: mac.toString(),
	                devname: devname.toString()
	            },
	            async: true,
	        })
	    },
	    deleteAllDeviceCustomSettings: function(mac) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteAllDeviceCustomSettings",
	                mac: mac.toString()
	            },
	            async: true,
	        })
	    },
	    // Provision device type settings
	    getDeviceTypeSettings: function(mac) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getDeviceTypeSettings",
	                mac: mac
	            },
	            async: true,
	        })
	    },
	    insertDeviceTypeSettings: function(mac, elementId, elementNumber, entityName, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "insertDeviceTypeSettings",
	                mac: mac.toString(),
	                element_id: elementId.toString(),
	                element_number: elementNumber.toString(),
	                entity_name: entityName.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    updateDeviceTypeSettings: function(mac, elementId, elementNumber, entityName, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "updateDeviceTypeSettings",
	                mac: mac.toString(),
	                element_id: elementId.toString(),
	                element_number: elementNumber.toString(),
	                entity_name: entityName.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    deleteDeviceTypeSettings: function(mac, elementId, elementNumber, entityName) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteDeviceTypeSettings",
	                mac: mac.toString(),
	                element_id: elementId.toString(),
	                element_number: elementNumber.toString(),
	                entity_name: entityName.toString()
	            },
	            async: true,
	        })
	    },
	    checkDeviceTypeSettings: function(mac, elementId, elementNumber, entityName, value) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "checkDeviceTypeSettings",
	                mac: mac.toString(),
	                element_id: elementId.toString(),
	                element_number: elementNumber.toString(),
	                entity_name: entityName.toString(),
	                value: value.toString()
	            },
	            async: true,
	        })
	    },
	    deleteAllDeviceTypeSettings: function(mac, keepExtensions) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "deleteAllDeviceTypeSettings",
	                mac: mac.toString(),
	                keepExtensions: keepExtensions.toString()
	            },
	            async: true,
	        })
	    },
	    getZeroConfigPreview: function(mac, modelid, globaltemplates, modeltemplates) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getZeroConfigPreview",
	                mac: mac.toString(),
	                modelid: modelid.toString(),
	                globalTemps: globaltemplates.toString(),
	                modelTemps: modeltemplates.toString()
	            },
	            async: true,
	        })
	    },
	    getZeroConfigCustomSettings: function(mac, modelid, modeltemplates) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getZeroConfigCustomSettings",
	                mac: mac.toString(),
	                model_id: modelid.toString(),
	                modelTemps: modeltemplates.toString()
	            },
	            async: true,
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
	                    var responses = data.response
	                    var requests = ValueDelegationObj.getRequests("UCM")

	                    for (var name in responses) {
	                        var request = requests[name]

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
	    },
	    getZeroConfig: function(mac, ip) {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
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
	    }, */
	    getParserStatus: function() {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "getParserStatus"
	            }
	        })
	    },
	    /* getAllDeviceExtensions: function() {
	        return $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                "action": "getAllDeviceExtensions"
	            }
	        })
	    },
	    // View interfaces
	    listZeroConfigDirectory: function(path, option) {
	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "listZeroConfigDirectory",
	                rootdir: path,
	                options: option
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error")
	            },
	            success: data => {
	                // Responses are pairs of directory/file name and type.
	                // If type is 0, the name is a file.
	                // If type is 1, the name is a directory.
	                console.warn("success")
	            }
	        })
	    },
	    saveZeroConfigFile: function(data, destdir, filename) {
	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                action: "saveZeroConfigFile",
	                data: data,
	                rootdir: destdir,
	                filename: filename
	            },
	            async: true,
	            error: (jqXHR, textStatus, errorThrown) => {
	                console.warn("error")
	            },
	            success: data => {
	                // Response is the file path saved under given destination.
	                console.warn("success")
	            }
	        })
	    }, */
	    checkZeroConfigInvalidModels: function(source, flagJump) {
	        $.ajax({
	            method: "post",
	            url: api.apiHost,
	            data: {
	                "action": "checkZeroConfigInvalidModels"
	            },
	            error: (jqXHR, textStatus, errorThrown) => {
	            },
	            success: function(result) {
	            	const noError = UCMGUI.errorHandler(result)

	                /* if (noError) {
	                    let response = result.response
	                    response.warning_msg = top.$.lang("LANG4489")
	                    response.go_restore = top.$.lang("LANG4490")
	                    response.restore_here = top.$.lang("LANG4491")

	                    let numOfInvalidModel = response.models.length
	                    this._data.DataCollection.resetInvalidModel()
	                    if (numOfInvalidModel > 0) {
	                        for (var i = 0; i < numOfInvalidModel; i++) {
	                            this._data.DataCollection.setInvalidModel(i, response.models[i])
	                        }
	                        if (source == null) {
	                            return
	                        }
	                        let template = Handlebars.compile(source)
	                        let responsehtml = template(response)
	                        let dissmiss_warning =  top.$.cookie('dismiss_zcmodel_missing_warning')
	                        if (dissmiss_warning != 'yes') {
	                            top.dialog.clearDialog()
	                            top.dialog.dialogConfirm({
	                                confirmStr: responsehtml,
	                                buttons: {
	                                    ok: function() {
	                                      if (flagJump == true)
	                                        top.frames['frameContainer'].module.jumpMenu('zc_template_management.html')
	                                    },
	                                    cancel: function() {
	                                        top.dialog.dialogConfirm({
	                                            confirmStr: top.$.lang("LANG4466"),
	                                            buttons: {
	                                                ok: function() {
	                                                  top.$.cookie('dismiss_zcmodel_missing_warning', 'yes')
	                                                },
	                                                cancel: function() {

	                                                }
	                                            }
	                                        })
	                                    }
	                                }
	                            })
	                        }
	                    }
	                } */
	            }
	        })
	    }
	},
	interface: {
		prepareGlobalTemplateSource: function(templateId, callback) {
			let pageValueLoadedCallback = result => {
	            let data = {}

	            if (result.status === 0) {
	                // NOTE: it is weird the return data is stored under object.template_id
	                for (let i = 0; i < result.response.template_id.length; i++) {
	                    let item = result.response.template_id[i]
	                    let key = item.element_id + "#" + item.element_number
	                    if (!data[key]) {
	                        data[key] = { "values": {}, "originName": "", "originType": "" }
	                    }
	                    data[key].values[item.entity_name] = item.value
	                }
	            } else { 
	                return
	            }

	            let source = this.getDataCollection().generateGlobalBlockList(data)
	            if (typeof callback === "function") {
					callback(source)
				}
	        }

	        this.connector.getTemplateSettings(templateId)
                .done(result => {
                    setTimeout(() => {
                        pageValueLoadedCallback(result)
                    }, 1)
                }).fail(() => {
                    // TODO: add error display here
                    console.error("FAIL", arguments)
                    return
                })
		},
		prepareModelTemplateSource: function(templateId, callback) {
			let pageValueLoadedCallback = result => {
	            let data = {}
	            if (result.status === 0) {
	            	// NOTE: it is weird the return data is stored under object.template_id
	                for (let i = 0; i < result.response.template_id.length; i++) {
	                    let item = result.response.template_id[i]
	                    let key = item.element_id + "#" + item.element_number
	                    if (!data[key]) {
	                        data[key] = { "values": {}, "originName": "", "originType": "" }
	                    }
	                    data[key].values[item.entity_name] = item.value
	                }
	            } else { 
	                return
	            }

	            let using = null
		        let model = ZCCurConfig.modelInfo()
		        if (model) {
		            using = model.generateFieldList(data)
		            // TODO:
		            // devmappings = using.devmapping
		            // 	source = using.source
		            // bindModelThumbnail(model)
		        }

		        if (typeof callback === "function") {
					callback(using)
				}
	        }

	        this.connector.getModelTemplateSettings(templateId)
                .done(result => {
                    setTimeout(() => {
                        pageValueLoadedCallback(result)
                    }, 1)
                }).fail(() => {
                    // TODO: add error display here
                    console.error("FAIL", arguments)
                    return
                })
		}
	} 
}

module.exports = new ZEROCONFIG()
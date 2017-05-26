export const HIDE_SPIN = 'HIDE_SPIN'
export const DISPLAY_SPIN = 'DISPLAY_SPIN'
export const LISTAllTRUNK = 'LISTAllTRUNK'
export const GET_PBXSTATUS = 'GET_PBXSTATUS'
export const GET_STORAGEUSAGE = 'GET_STORAGEUSAGE'
export const GET_RESOURCEUSAGE = 'GET_RESOURCEUSAGE'
export const DIFF_RESOURCEUSAGE = 'DIFF_RESOURCEUSAGE'
export const GET_INTERFACESTATUS = 'GET_INTERFACESTATUS'
export const GET_QUEUEMEMBERS = 'GET_QUEUEMEMBERS'
export const SET_CURRENTQUEUE = 'SET_CURRENTQUEUE'
export const SET_QUEUEMEMBERROLE = 'SET_QUEUEMEMBERROLE'
export const GET_QUEUEBYCHAIRMAN = 'GET_QUEUEBYCHAIRMAN'
export const GET_QUEUECALLINGANSWERED = 'GET_QUEUECALLINGANSWERED'
export const GET_QUEUECALLINGWAITING = 'GET_QUEUECALLINGWAITING'
export const GET_BRIDGECHANNEL = 'GET_BRIDGECHANNEL'

import $ from 'jquery'
import _ from 'underscore'
import api from "../components/api/api"

export const getStorageUsage = () => (dispatch) => {
    $.ajax({
        type: 'post',
        url: api.apiHost,
        data: { 
            action: 'getStorageUsage'
        },
        success: function(res) {
            let storageUsage = res.response
            let storageUsageData = storageUsage.body

            if (storageUsageData) {
                let cfgObj = {
                        space: {},
                        inode: {}
                    },
                    dataObj = {
                        space: {},
                        inode: {}
                    },
                    sdaObj = {
                        space: {
                            usage: 0,
                            total: 0
                        }
                    },
                    usbObj = {
                        space: {
                            usage: 0,
                            total: 0
                        }
                    }

                for (var temp in storageUsageData) {
                    if (storageUsageData.hasOwnProperty(temp)) {
                        let storageUsageDataIndex = storageUsageData[temp]

                        for (var i = storageUsageDataIndex.length - 1; i >= 0; i--) {
                            if (temp === "disk-avail") {
                                if (storageUsageDataIndex[i].diskname === "cfg") {
                                    cfgObj.space["avail"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname === "data") {
                                    dataObj.space["avail"] = storageUsageDataIndex[i].value
                                } 

                                if (storageUsageDataIndex[i].diskname.indexOf("sda") >= 0) {
                                    usbObj.space["avail"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname.indexOf("mmcblk") >= 0) {
                                    sdaObj.space["avail"] = storageUsageDataIndex[i].value
                                }
                            }

                            if (temp === "disk-total") {
                                if (storageUsageDataIndex[i].diskname === "cfg") {
                                    cfgObj.space["total"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname === "data") {
                                    dataObj.space["total"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname.indexOf("sda") >= 0) {
                                    usbObj.space["total"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname.indexOf("mmcblk") >= 0) {
                                    sdaObj.space["total"] = storageUsageDataIndex[i].value
                                }
                            }

                            if (temp === "disk-usage") {
                                if (storageUsageDataIndex[i].diskname === "cfg") {
                                    cfgObj.space["usage"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname === "data") {
                                    dataObj.space["usage"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname.indexOf("sda") >= 0) {
                                    usbObj.space["usage"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname.indexOf("mmcblk") >= 0) {
                                    sdaObj.space["usage"] = storageUsageDataIndex[i].value
                                }
                            }

                            if (temp === "inode-avail") {
                                if (storageUsageDataIndex[i].diskname === "cfg") {
                                    cfgObj.inode["avail"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname === "data") {
                                    dataObj.inode["avail"] = storageUsageDataIndex[i].value
                                }
                            }

                            if (temp === "inode-total") {
                                if (storageUsageDataIndex[i].diskname === "cfg") {
                                    cfgObj.inode["total"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname === "data") {
                                    dataObj.inode["total"] = storageUsageDataIndex[i].value
                                }
                            }

                            if (temp === "inode-usage") {
                                if (storageUsageDataIndex[i].diskname === "cfg") {
                                    cfgObj.inode["usage"] = storageUsageDataIndex[i].value
                                }

                                if (storageUsageDataIndex[i].diskname === "data") {
                                    dataObj.inode["usage"] = storageUsageDataIndex[i].value
                                }
                            }
                        }
                    }
                }

                let storageUsage = {
                    cfgPartition: cfgObj,
                    dataPartition: dataObj,
                    sdPartition: sdaObj,
                    usbPartition: usbObj
                }

                dispatch({type: 'GET_STORAGEUSAGE', storageUsage: storageUsage})
            }
        }.bind(this),
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getResourceUsage = () => (dispatch) => {
    $.ajax({
        type: 'post',
        url: api.apiHost,
        data: { 
            action: 'getResourceUsage'
        },
        success: function(res) {
            let data = res.response

            if (data) {
                let resourceUsage = data.body

                dispatch({type: 'GET_RESOURCEUSAGE', resourceUsage: resourceUsage})
            }
        }.bind(this),
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getPbxStatus = () => (dispatch) => {
    $.ajax({
        type: 'post',
        url: api.apiHost,
        data: { 
            action: 'getPbxStatus'
        },
        success: function(res) {
            let data = res.response

            if (data) {
                let pbxStatus = data.pbx_status

                dispatch({type: 'GET_PBXSTATUS', pbxStatus: pbxStatus})
            }
        }.bind(this),
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const listAllTrunk = () => (dispatch) => {
    $.ajax({
        type: 'post',
        url: api.apiHost,
        data: { action: 'listAllTrunk' },
        success: function(res) {
            let trunksData = res.response

            dispatch({type: 'LISTAllTRUNK', trunksData: trunksData})
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getInterfaceStatus = () => (dispatch) => {
    $.ajax({
        type: 'post',
        url: api.apiHost,
        data: { action: 'getInterfaceStatus' },
        success: function(res) {
            let interfaceStatus = res.response

            dispatch({type: 'GET_INTERFACESTATUS', interfaceStatus: interfaceStatus || {}})
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getCallQueuesMessage = (userportalname) => (dispatch) => {
    let data = {}

    if (userportalname) {
        data.userportalname = userportalname
    }

    data.action = 'getCallQueuesMessage'

    $.ajax({
        data: data,
        type: 'post',
        url: api.apiHost,
        success: function(res) {
            let activeTabKey = ''
            let callQueueList = []
            let response = res.response || {}

            if (userportalname) {
                if (response.hasOwnProperty('CallQueuesMessage')) {
                    callQueueList = response.CallQueuesMessage || []

                    if (response.hasOwnProperty('CallQueuesAgent') && response.CallQueuesAgent.length) {
                        callQueueList = callQueueList.concat(response.CallQueuesAgent)
                    }

                    dispatch({type: 'SET_QUEUEMEMBERROLE', queueMemberRole: 'chairman'})
                } else if (response.hasOwnProperty('CallQueuesAgent')) {
                    callQueueList = response.CallQueuesAgent || []

                    dispatch({type: 'SET_QUEUEMEMBERROLE', queueMemberRole: 'agent'})
                } else {
                    dispatch({type: 'SET_QUEUEMEMBERROLE', queueMemberRole: 'extension'})
                } 
            } else {
                callQueueList = response.CallQueuesMessage || []
            }

            callQueueList = _.sortBy(callQueueList, function(item) { return item.extension })
            activeTabKey = callQueueList.length ? callQueueList[0].extension : ''

            dispatch({type: 'SET_CURRENTQUEUE', currentQueue: activeTabKey})
            dispatch({type: 'GET_QUEUEBYCHAIRMAN', callQueueList: callQueueList})

            // TODO: Optimization Later
            if (activeTabKey) {
                let queueMemberAction = {
                        extension: activeTabKey,
                        action: 'getCallQueuesMemberMessage'
                    },
                    answerAction = {
                        role: 'answer',
                        extension: activeTabKey,
                        action: 'getQueueCalling'
                    },
                    waitingAction = {
                        role: '',
                        extension: activeTabKey,
                        action: 'getQueueCalling'
                    }

                if (userportalname) {
                    queueMemberAction.userportalname = userportalname
                    answerAction.userportalname = userportalname
                    waitingAction.userportalname = userportalname
                }

                $.ajax({
                    type: 'json',
                    method: 'post',
                    url: api.apiHost,
                    data: queueMemberAction,
                    success: function(res) {
                        let queueMembers = []
                        const response = res.response || {}

                        if (response.CallQueueMembersMessage && response.CallQueueMembersMessage.member) {
                            queueMembers = response.CallQueueMembersMessage.member
                        }

                        dispatch({type: 'GET_QUEUEMEMBERS', queueMembers: queueMembers})
                    },
                    error: function(e) {
                        console.log(e.statusText)
                    }
                })

                $.ajax({
                    type: 'json',
                    method: 'post',
                    url: api.apiHost,
                    data: answerAction,
                    success: function(res) {
                        let answerCallings = []
                        const response = res.response || {}

                        if (response.CallQueues && response.CallQueues.member) {
                            answerCallings = response.CallQueues.member
                        }

                        dispatch({type: 'GET_QUEUECALLINGANSWERED', answerCallings: answerCallings})
                    },
                    error: function(e) {
                        console.log(e.statusText)
                    }
                })

                $.ajax({
                    type: 'json',
                    method: 'post',
                    url: api.apiHost,
                    data: waitingAction,
                    success: function(res) {
                        let waitingCallings = []
                        const response = res.response || {}

                        if (response.CallQueues && response.CallQueues.member) {
                            waitingCallings = response.CallQueues.member
                        }

                        dispatch({type: 'GET_QUEUECALLINGWAITING', waitingCallings: _.sortBy(waitingCallings, function(item) { return item.position })})
                    },
                    error: function(e) {
                        console.log(e.statusText)
                    }
                })
            } else {
                dispatch({type: 'GET_QUEUEMEMBERS', queueMembers: []})
                dispatch({type: 'GET_QUEUECALLINGANSWERED', answerCallings: []})
                dispatch({type: 'GET_QUEUECALLINGWAITING', waitingCallings: []})
            }
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getCallQueuesMemberMessage = (queue, userportalname) => (dispatch) => {
    let action = {
            extension: queue,
            action: 'getCallQueuesMemberMessage'
        }

    if (userportalname) {
        action.userportalname = userportalname
    }

    $.ajax({
        type: 'post',
        data: action,
        url: api.apiHost,
        success: function(res) {
            let queueMembers = []
            const response = res.response || {}

            if (response.CallQueueMembersMessage && response.CallQueueMembersMessage.member) {
                queueMembers = response.CallQueueMembersMessage.member
            }

            dispatch({type: 'SET_CURRENTQUEUE', currentQueue: queue})
            dispatch({type: 'GET_QUEUEMEMBERS', queueMembers: queueMembers})
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getQueueCallingAnswered = (queue, userportalname) => (dispatch) => {
    let action = {
            role: 'answer',
            extension: queue,
            action: 'getQueueCalling'
        }

    if (userportalname) {
        action.userportalname = userportalname
    }

    $.ajax({
        type: 'post',
        data: action,
        url: api.apiHost,
        success: function(res) {
            let answerCallings = []
            const response = res.response || {}

            if (response.CallQueues && response.CallQueues.member) {
                answerCallings = response.CallQueues.member
            }

            dispatch({type: 'GET_QUEUECALLINGANSWERED', answerCallings: answerCallings})
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getQueueCallingWaiting = (queue, userportalname) => (dispatch) => {
    let action = {
            role: '',
            extension: queue,
            action: 'getQueueCalling'
        }

    if (userportalname) {
        action.userportalname = userportalname
    }

    $.ajax({
        type: 'post',
        data: action,
        url: api.apiHost,
        success: function(res) {
            let waitingCallings = []
            const response = res.response || {}

            if (response.CallQueues && response.CallQueues.member) {
                waitingCallings = response.CallQueues.member
            }

            dispatch({type: 'GET_QUEUECALLINGWAITING', waitingCallings: _.sortBy(waitingCallings, function(item) { return item.position })})
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const setSpinLoading = (obj) => (dispatch) => {
    if (obj.loading) {
        dispatch({type: 'DISPLAY_SPIN', spinLoading: {loading: true, tip: obj.tip}})
    } else {
        dispatch({type: 'HIDE_SPIN', spinLoading: {loading: false}})
    }
}

export const loadBridgeChannel = () => (dispatch) => {
    $.ajax({
        type: 'post',
        url: api.apiHost,
        data: {
            "action": 'listBridgedChannels',
            "sidx": "callerid1",
            "sord": "asc"
        },
        success: function(res) {
            var bridgeChannel = []
            const response = res.response || {}

            if (response.channel) {
                bridgeChannel = response.channel
            }

            $.ajax({
                type: 'post',
                url: api.apiHost,
                data: {
                    "sord": "asc",
                    "sidx": "state",
                    "action": 'listUnBridgedChannels'
                },
                success: function(res) {
                    var unBridgeChannel = []
                    const response = res.response || {}

                    if (response.channel) {
                        unBridgeChannel = response.channel
                    }

                    _.each(bridgeChannel, function(item) {
                        unBridgeChannel.push(item)
                    })

                    dispatch({type: 'GET_BRIDGECHANNEL', activeCallStatus: unBridgeChannel})
                },
                error: function(e) {
                    console.log(e.statusText)
                }
            })
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}
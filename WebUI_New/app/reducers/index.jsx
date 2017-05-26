import msg from './message'
import { combineReducers } from 'redux'
import * as Actions from '../actions/'
import systemInfo from '../components/modules/systemInfo/reducers/getNetworkInformation'
import systemGeneralStatus from '../components/modules/systemInfo/reducers/getSystemGeneralStatus'
import systemStatus from '../components/modules/systemInfo/reducers/getSystemStatus'
// import ctiServer from '../components/modules/ctiServer/reducers/getCTIMidSettings'
// import serviceCheck from '../components/modules/serviceCheck/reducers/getServiceCheck'
import account from '../components/modules/extension/reducers/listAccount'

const storageUsage = (state = {}, action) => {
    switch (action.type) {
        case Actions.GET_STORAGEUSAGE:
            return action.storageUsage
        default:
            return state
    }
}

const resourceUsage = (state = {}, action) => {
    switch (action.type) {
        case Actions.GET_RESOURCEUSAGE:
            return action.resourceUsage
        case Actions.DIFF_RESOURCEUSAGE:
            return action.resourceUsage
        default:
            return state
    }
}

const pbxStatus = (state = {}, action) => {
    switch (action.type) {
        case Actions.GET_PBXSTATUS:
            return action.pbxStatus
        default:
            return state
    }
}

const trunksData = (state = [], action) => {
    switch (action.type) {
        case Actions.LISTAllTRUNK:
            return action.trunksData
        default:
            return state
    }
}

const interfaceStatus = (state = {}, action) => {
    switch (action.type) {
        case Actions.GET_INTERFACESTATUS:
            return action.interfaceStatus
        default:
            return state
    }
}

const callQueueList = (state = [], action) => {
    switch (action.type) {
        case Actions.GET_QUEUEBYCHAIRMAN:
            return action.callQueueList
        default:
            return state
    }
}

const queueMembers = (state = [], action) => {
    switch (action.type) {
        case Actions.GET_QUEUEMEMBERS:
            return action.queueMembers
        default:
            return state
    }
}

const currentQueue = (state = '', action) => {
    switch (action.type) {
        case Actions.SET_CURRENTQUEUE:
            return action.currentQueue
        default:
            return state
    }
}

const queueMemberRole = (state = '', action) => {
    switch (action.type) {
        case Actions.SET_QUEUEMEMBERROLE:
            return action.queueMemberRole
        default:
            return state
    }
}

const answerCallings = (state = [], action) => {
    switch (action.type) {
        case Actions.GET_QUEUECALLINGANSWERED:
            return action.answerCallings
        default:
            return state
    }
}

const waitingCallings = (state = [], action) => {
    switch (action.type) {
        case Actions.GET_QUEUECALLINGWAITING:
            return action.waitingCallings
        default:
            return state
    }
}

const spinLoading = (state = {}, action) => {
    switch (action.type) {
        case Actions.DISPLAY_SPIN:
            return action.spinLoading
        case Actions.HIDE_SPIN:
            return action.spinLoading
        default:
            return state
    }
}

const conferenceStatus = (state = [], action) => {
    switch (action.type) {
        case 'GET_CONFERENCESTATUS':
            return action.conferenceStatus
        default:
            return state
    }
}

const activeCallStatus = (state = [], action) => {
    switch (action.type) {
        case 'GET_BRIDGECHANNEL':
            return action.activeCallStatus
        default:
            return state
    }
}

const voiceMailStatus = (state = [], action) => {
    switch (action.type) {
        case 'GET_VOICEMAILSTATUS':
            return action.voiceMailStatus
        default:
            return state
    }
}

const configReloadStatus = (state = [], action) => {
    switch (action.type) {
        case 'GET_CONFIGRELOADSTATUS':
            return action.configReloadStatus
        default:
            return state
    }
}

const zcFoundConfig = (state = [], action) => {
    switch (action.type) {
        case 'GET_ZCFOUNDSTATUS':
            return action.zcFoundConfig
        default:
            return state
    }
}

// ues redux's combineReducers
const rootReducer = combineReducers({
    msg,
    systemInfo,
    systemGeneralStatus,
    systemStatus,
    // ctiServer,
    // serviceCheck,
    storageUsage,
    resourceUsage,
    pbxStatus,
    trunksData,
    account,
    interfaceStatus,
    callQueueList,
    queueMemberRole,
    queueMembers,
    currentQueue,
    answerCallings,
    waitingCallings,
    spinLoading,
    conferenceStatus,
    activeCallStatus,
    voiceMailStatus,
    configReloadStatus,
    zcFoundConfig
})

export default rootReducer

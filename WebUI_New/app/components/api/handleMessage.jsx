import _ from 'underscore'
import SubscribeEvent from './subscribeEvent'

export const handleRequest = (msg, store) => {
    const interPageSubscribeEvent = SubscribeEvent[window.LEAVEPAGE]

    if (window.LEAVEPAGE) {
        let action = msg.action,
            eventBody = msg.eventbody,
            state = store.getState()
            
        if (msg.eventname === "ResourceUsageStatus") {
            // SubscribeEvent[window.LEAVEPAGE].eventnamesForAction[msg.eventname]
            store.dispatch({type: 'DIFF_RESOURCEUSAGE', resourceUsage: eventBody})
        } else if (msg.eventname === "TrunkStatus") {
            
        } else if (msg.eventname === "InterfaceStatus") {
            // Assign a new obj to trigger render()
            let newInterfaceStatus = {}
            let interfaceStatus = state.interfaceStatus ? state.interfaceStatus : {}

            _.map(interfaceStatus, (value, key) => {
                if (eventBody && eventBody.hasOwnProperty(key)) {
                    newInterfaceStatus[key] = eventBody[key]
                } else {
                    newInterfaceStatus[key] = value
                }
            })

            store.dispatch({type: 'GET_INTERFACESTATUS', interfaceStatus: newInterfaceStatus})
        } else if (msg.eventname === "EquipmentCapacityStatus") {

        } else if (msg.eventname === "CallQueueStatus") {
            let currentQueue = state.currentQueue

            if (eventBody.length) {
                const queue = eventBody[0]

                if (_.has(queue, 'member')) {
                    if (queue.member.length && (currentQueue === queue.extension)) {
                        const member = queue.member[0]
                        const action = member.queue_action

                        if (action === 'CallQueueAddMember' || action === 'CallQueueUpdateMember' || action === 'CallQueueDeleteMember') {
                            let queueMembers = state.queueMembers

                            queueMembers = _.filter(queueMembers, function(item) {
                                    return (item.member_extension !== member.member_extension)
                                })

                            if (action !== 'CallQueueDeleteMember') {
                                queueMembers.push(member)
                            }

                            queueMembers = _.sortBy(queueMembers, function(item) { return item.member_extension })

                            store.dispatch({type: 'GET_QUEUEMEMBERS', queueMembers: queueMembers})
                        } else if (action === 'CallQueueWaiting') {
                            let waitingCallings = state.waitingCallings

                            waitingCallings = _.filter(waitingCallings, function(item) {
                                    return (item.callerid !== member.callerid)
                                })

                            waitingCallings.push(member)

                            waitingCallings = _.sortBy(waitingCallings, function(item) { return item.position })

                            store.dispatch({type: 'GET_QUEUECALLINGWAITING', waitingCallings: waitingCallings})
                        } else if (action === 'CallQueueAnswered') {
                            let answerCallings = state.answerCallings
                            let waitingCallings = state.waitingCallings

                            if (member.callerchannel && member.calleechannel) {
                                answerCallings = _.filter(answerCallings, function(item) {
                                        return (item.callerchannel !== member.callerchannel &&
                                                item.calleechannel !== member.calleechannel)
                                    })

                                answerCallings.push(member)

                                answerCallings = _.sortBy(answerCallings, function(item) { return item.bridge_time })

                                waitingCallings = _.filter(waitingCallings, function(item) {
                                        return (item.callerchannel !== member.callerchannel)
                                    })

                                store.dispatch({type: 'GET_QUEUECALLINGANSWERED', answerCallings: answerCallings})
                                store.dispatch({type: 'GET_QUEUECALLINGWAITING', waitingCallings: waitingCallings})
                            }
                        } else if (action === 'CallQueueHangup') {
                            let answerCallings = state.answerCallings
                            let waitingCallings = state.waitingCallings

                            answerCallings = _.filter(answerCallings, function(item) {
                                    return (item.callerchannel !== member.callerchannel)
                                })

                            waitingCallings = _.filter(waitingCallings, function(item) {
                                    return (item.callerchannel !== member.callerchannel)
                                })

                            store.dispatch({type: 'GET_QUEUECALLINGANSWERED', answerCallings: answerCallings})
                            store.dispatch({type: 'GET_QUEUECALLINGWAITING', waitingCallings: waitingCallings})
                        }
                    }
                } else {
                    let callQueueList = state.callQueueList

                    callQueueList = _.filter(callQueueList, function(item) {
                            return (item.extension !== queue.extension)
                        })

                    callQueueList.push(queue)

                    callQueueList = _.sortBy(callQueueList, function(item) { return item.extension })

                    store.dispatch({type: 'GET_QUEUEBYCHAIRMAN', callQueueList: callQueueList})
                }
            }
        } else if (msg.eventname === "ConferenceStatus") {
            store.dispatch({type: 'GET_CONFERENCESTATUS', conferenceStatus: eventBody})
        } else if (msg.eventname === "ActiveCallStatus") {
            store.dispatch({type: 'GET_BRIDGECHANNEL', activeCallStatus: eventBody})
        } else if (msg.eventname === "VoiceMailStatus") {
            store.dispatch({type: 'GET_VOICEMAILSTATUS', voiceMailStatus: eventBody})
        } else if (msg.eventname === "ConfigReloadStatus") {
            store.dispatch({type: 'GET_CONFIGRELOADSTATUS', configReloadStatus: eventBody})
        } else if (msg.eventname === "ZCFoundStatus") {
            store.dispatch({type: 'GET_ZCFOUNDSTATUS', zcFoundConfig: eventBody})
        }
    }
}

export const handleResponse = (msg, store) => {
  
}
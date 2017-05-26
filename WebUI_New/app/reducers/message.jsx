import { ADD_MESSAGE, ADD_RESPONSE } from '../actions/message'

const messages = (currentMessages = "initMsg", action) => {
    switch (action.type) {
        case ADD_MESSAGE:
        case ADD_RESPONSE:
            return action.message
        default:
            return currentMessages
    }
}

export default messages

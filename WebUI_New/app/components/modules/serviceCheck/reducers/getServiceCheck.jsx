import { GET_SERVICECHECK } from '../actions/getServiceCheck'

const serviceCheck = (state = {}, action) => {
    switch (action.type) {
        case GET_SERVICECHECK:
            return action.serviceCheck
        default:
            return state
    }
}

export default serviceCheck
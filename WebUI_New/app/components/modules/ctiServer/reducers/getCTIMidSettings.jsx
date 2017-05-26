import { GET_CTIMIDSETTINGS } from '../actions/getCTIMidSettings'

const ctiServer = (state = {}, action) => {
    switch (action.type) {
        case GET_CTIMIDSETTINGS:
            return action.ctimidSettings
        default:
            return state
    }
}

export default ctiServer
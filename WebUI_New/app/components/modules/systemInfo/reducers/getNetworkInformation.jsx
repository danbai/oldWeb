import { GET_NETWORKINFOMATION } from '../actions/getNetworkInformation'

const systemInfo = (state = {}, action) => {
    switch (action.type) {
        case GET_NETWORKINFOMATION:
            return action.networkInformation
        default:
            return state
    }
}

export default systemInfo
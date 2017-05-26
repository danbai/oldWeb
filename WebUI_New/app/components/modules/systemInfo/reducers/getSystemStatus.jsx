import { GET_SYSTEMSTATUS } from '../actions/getNetworkInformation'

const systemStatus = (state = {}, action) => {
    switch (action.type) {
        case GET_SYSTEMSTATUS:
            return action.systemStatus
        default:
            return state
  }
}

export default systemStatus
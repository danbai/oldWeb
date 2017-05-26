import { GET_SYSTEMGENERALSTATUS } from '../actions/getNetworkInformation'

const systemGeneralStatus = (state = {}, action) => {
    switch (action.type) {
        case GET_SYSTEMGENERALSTATUS:
            return action.systemGeneralStatus
        default:
            return state
  }
}

export default systemGeneralStatus
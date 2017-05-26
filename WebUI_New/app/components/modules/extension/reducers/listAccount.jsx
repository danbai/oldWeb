import { LISTACCOUNT } from '../actions/'

const account = (state = [], action) => {
    switch (action.type) {
        case LISTACCOUNT:
            return action.account
        default:
            return state
    }
}

export default account
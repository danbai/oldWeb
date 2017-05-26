'use strict'

import { createStore, applyMiddleware } from 'redux'
// import persistState, {mergeState} from 'redux-localstorage'
// import adapter from 'redux-localstorage/lib/adapters/localStorage'
// import persistState from 'redux-localstorage'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'
const loggerMiddleware = createLogger()

export default function configureStore(initialState) {
    const reducer = applyMiddleware(
        // mergeState()
    )(rootReducer, initialState)

    // const socket = io(`${location.protocol}//${location.hostname}:7681`)
    const createPersistentStore = applyMiddleware(
        thunkMiddleware,
        loggerMiddleware// ,
        // persistState(storage, 'state')
    )(createStore)

    const store = createPersistentStore(reducer)
    if (module.hot) {
            // Enable Webpack hot module replacement for reducers
            module.hot.accept('../reducers', () => {
            const nextReducer = require('../reducers').default
            store.replaceReducer(nextReducer)
        })
    }
    return store
}

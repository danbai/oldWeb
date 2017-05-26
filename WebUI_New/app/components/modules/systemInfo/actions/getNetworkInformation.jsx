export const GET_NETWORKINFOMATION = 'GET_NETWORKINFOMATION'
export const GET_SYSTEMSTATUS = 'GET_SYSTEMSTATUS'
export const GET_SYSTEMGENERALSTATUS = 'GET_SYSTEMGENERALSTATUS'

import $ from 'jquery'
import api from "../../../api/api"

export const getNetworkInformation = () => (dispatch) => {
    $.ajax({
        url: api.apiHost,
        method: 'post',
        data: { action: 'getNetworkInformation' },
        type: 'json',
        async: true,
        success: function(res) {
            let networkInformation = res.response
            dispatch({type: 'GET_NETWORKINFOMATION', networkInformation: networkInformation}) 
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getSystemStatus = () => (dispatch) => {
    $.ajax({
        url: api.apiHost,
        method: 'post',
        data: { action: 'getSystemStatus' },
        type: 'json',
        success: function(res) {
            let systemStatus = res.response
            dispatch({type: GET_SYSTEMSTATUS, systemStatus: systemStatus}) 
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}

export const getSystemGeneralStatus = () => (dispatch) => {
    $.ajax({
        url: api.apiHost,
        method: 'post',
        data: { action: 'getSystemGeneralStatus' },
        type: 'json',
        success: function(res) {
            let systemGeneralStatus = res.response
            dispatch({type: GET_SYSTEMGENERALSTATUS, systemGeneralStatus: systemGeneralStatus}) 
        }.bind(this),
        error: function(e) {
            console.log(e.statusText)
        }.bind(this)
    })
}


export const GET_SERVICECHECK = 'GET_SERVICECHECK'

import $ from 'jquery'
import api from "../../../api/api"

export const getServiceCheck = () => (dispatch) => {
    $.ajax({
        url: api.apiHost,
        method: 'post',
        data: { action: 'getServiceCheck' },
        type: 'json',
        async: true,
        success: function(res) {
            let serviceCheck = res.response

            dispatch({type: 'GET_SERVICECHECK', serviceCheck: serviceCheck}) 
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}


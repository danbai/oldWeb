export const GET_CTIMIDSETTINGS = 'GET_CTIMIDSETTINGS'

import $ from 'jquery'
import api from "../../../api/api"

export const getCTIMidSettings = () => (dispatch) => {
    $.ajax({
        url: api.apiHost,
        method: 'post',
        data: { action: 'getCTIMidSettings' },
        type: 'json',
        async: true,
        success: function(res) {
            let ctimidSettings = res.response

            dispatch({type: 'GET_CTIMIDSETTINGS', ctimidSettings: ctimidSettings}) 
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}


export const LISTACCOUNT = 'LISTACCOUNT'

import $ from 'jquery'
import api from "../../../api/api"

export const listAccount = () => (dispatch) => {
    $.ajax({
        url: api.apiHost,
        method: 'post',
        data: { action: 'listAccount' },
        type: 'json',
        async: true,
        success: function(res) {
            let account = res.response.account
            dispatch({type: 'LISTACCOUNT', account: account}) 
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
}
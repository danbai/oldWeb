'use strict'

import $ from 'jquery'
import routes from './routes'
import actions from './actions/'
import createStore from './store'
import cookie from 'react-cookie'
import api from "./components/api/api"
import { handleResponse, handleRequest } from './components/api/handleMessage'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import { LocaleProvider } from 'antd'
import { IntlProvider, FormattedMessage, addLocaleData } from 'react-intl'

import Socketjs from './socket.js'
import './css/index'

import en from 'react-intl/locale-data/en'
import zh from 'react-intl/locale-data/zh'
// import tw from 'react-intl/locale-data/zh'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import pt from 'react-intl/locale-data/pt'
import ru from 'react-intl/locale-data/ru'
import it from 'react-intl/locale-data/it'
import pl from 'react-intl/locale-data/pl'
import de from 'react-intl/locale-data/de'
import tr from 'react-intl/locale-data/tr'
import cs from 'react-intl/locale-data/cs'
// import localeData from './locale/data.json'

import enUS from 'antd/lib/locale-provider/en_US'
import esES from 'antd/lib/locale-provider/es_ES'
import frBE from 'antd/lib/locale-provider/fr_BE'
import ptBR from 'antd/lib/locale-provider/pt_BR'
import deDE from 'antd/lib/locale-provider/de_DE'
import trTR from 'antd/lib/locale-provider/tr_TR'
import ruRU from 'antd/lib/locale-provider/ru_RU'
import csCZ from 'antd/lib/locale-provider/cs_CZ'

let localeData = {}

$.ajax({
    type: 'GET',
    async: false,
    dataType: 'json',
    url: api.serverRoot + '/locale/data.json',
    success: function(res) {
        localeData = res
    },
    error: function(e) {
        console.log(e.statusText)
    }
})

addLocaleData([...en, ...zh, ...es, ...fr, ...pt, ...ru, ...it, ...pl, ...de, ...tr, ...cs])

const store = createStore()
// import zc from './components/modules/zeroConfig/parser/ZCNss.jsx'

// window.zc = zc
window.jQuery = $
// window.jQuery = jQuery

const chooseLocale = () => {
    // Try full locale, try locale without region code, fallback to 'en'
    return localeData[language]

    // Render our root component into the div with id "root"
    // We select the messages to pass to IntlProvider based on the user's locale
}

// Get Basic Info
(() => {
    let countryArr = [{
            languages: "zh-CN",
            localName: "简体中文"
        }, {
            languages: "en-US",
            localName: "English"
        }]

    let countryObj = {},
        model_info = {}

    $.ajax({
        type: 'GET',
        async: false,
        dataType: "json",
        url: "/locale/country2lang.json",
        success: function(res) {
            countryObj = res
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })

    $.ajax({
        type: 'post',
        async: false,
        url: api.apiHost,
        data: { action: 'getInfo' },
        success: function(res) {
            if (res.status === 0) {
                let numPri

                model_info = res.response
                numPri = model_info.num_pri
                // modelName = model_info.model_name

                numPri = numPri ? Number(numPri) : 0

                model_info.num_pri = numPri

                // if (numPri <= 0) {
                //     if (modelName && modelName.toLowerCase() && modelName.toLowerCase().indexOf("ucm62") != -1) {
                //         localStorage.setItem('maxExtension', 800)
                //     } else {
                //         localStorage.setItem('maxExtension', 500)
                //     }
                // } else {
                //     localStorage.setItem('maxExtension', 2000)
                // }

                if (model_info.country) {
                    let langObj = countryObj[model_info.country.toUpperCase()]
                    let arr = []

                    if (!localStorage.getItem('locale') && langObj) {
                        localStorage.setItem('locale', langObj.languages)
                    }

                    for (let item in countryObj) {
                        if (countryObj.hasOwnProperty(item)) {
                            arr.push({
                                languages: countryObj[item].languages,
                                localName: countryObj[item].localName
                            })
                        }
                    }

                    countryArr = arr

                    // if (this.isMounted()) {
                    //     this.setState({
                    //         countryObj: countryObj,
                    //         model_info: model_info,
                    //         countryArr: arr
                    //     })
                    // }
                    // return {locale: langObj.languages}
                }

                // if (model_info.prog_version) {
                //     version = model_info.prog_version.split(".").join("") || Math.random()
                // }

                // if (model_info.num_fxs) {
                //     var length = parseInt(model_info.num_fxs),
                //         fxoPortsLength = model_info.num_fxo ? parseInt(model_info.num_fxo) : 0,
                //         i = 1

                //     for (i; i <= length; i++) {
                //         fxsPorts.push((fxoPortsLength + i) + '')
                //     }
                // }

                // for (let item in model_info) {
                //     if (model_info.hasOwnProperty(item) &&
                //         (item !== 'copyright') && (item !== 'logo')) {
                //         localStorage.setItem(item, model_info[item])
                //     }
                // }

                localStorage.setItem('countryObj', JSON.stringify(countryObj))
                localStorage.setItem('model_info', JSON.stringify(model_info))
                localStorage.setItem('countryArr', JSON.stringify(countryArr))
            }
        },
        error: function(e) {
            console.log(e.statusText)
        }
    })
})()

// Define user's language. Different browsers have the user locale defined
// on different fields on the `navigator` object, so we make sure to account
// for these different by checking all of them

// localStorage.setItem('locale', "en-US")
let language = localStorage.getItem("locale"),
    antdLanguage = enUS

switch (language) {
    case 'en-US':
        antdLanguage = enUS
        break
    case 'zh-CN':
        antdLanguage = {}
        break
    case 'zh-TW':
        antdLanguage = {}
        break
    case 'es-ES':
        antdLanguage = esES
        break
    case 'fr-FR':
        antdLanguage = frBE
        break
    case 'pt-PT':
        antdLanguage = ptBR
        break
    case 'ru':
        antdLanguage = ruRU
        break
    case 'it-IT':
        antdLanguage = enUS
        break
    case 'pl':
        antdLanguage = enUS
        break
    case 'de-DE':
        antdLanguage = deDE
        break
    case 'tr':
        antdLanguage = trTR
        break
    case 'cs':
        antdLanguage = csCZ
        break
}

if (!language || !localeData[language]) {
    language = "en-US"
    localStorage.setItem("locale", language)
}

let currentLocaleData = chooseLocale()

window.currentLocale = language
window.currentLocaleData = currentLocaleData
window.DEFAULT_MESSAGES = localeData["en-US"]

const startSocket = () => {
    // make sure socket.js is supported
    if (Socketjs.isSupported()) {
        // connect to the server
        // const socket = Socketjs.connect("192.168.124.167:7681")
        const socket = Socketjs.connect(`${location.hostname}:7681`)

        window.socket = socket

        let LEAVEPAGE = "login",
            ISREFRESHPAGE = false

        window.LEAVEPAGE = LEAVEPAGE
        window.ISREFRESHPAGE = ISREFRESHPAGE

        // log messages as they arrive
        socket.receive('response', function(msg) {
            handleResponse(msg, store)
            // store.dispatch(actions.addResponse(msg))
        })

        socket.receive('request', function(msg) {
            handleRequest(msg, store)
            console.log(JSON.stringify(msg))
        })

        // log a message if we get disconnected
        socket.disconnect(function() {
          console.log('Temporarily disconnected.')
        })

        // log a message when we reconnect
        socket.reconnect(function() {
          console.log('Reconnected.')

          // whatever we return here is sent back to the server
          return 'reconnected'
        })

        // if the server disconnects, stop sending messages to it
        socket.close(function() {
          console.log('Connection closed.')
        })
    } else {
        // let the user know that socket.js is not supported
        // alert('Your browser does not support WebSockets.')
    }
}

startSocket()

ReactDOM.render(
    <Provider store={store}>
        <LocaleProvider locale={ antdLanguage }>
            <IntlProvider locale={ language } messages={ currentLocaleData }>
                <Router history={ browserHistory }>
                    { routes(store.getState(), currentLocaleData) }
                </Router>
            </IntlProvider>
        </LocaleProvider>
    </Provider>,
    document.getElementById('app-root')
)

// if (module.hot) {
//     module.hot.accept()
// }

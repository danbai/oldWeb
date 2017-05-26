'use strict'

import React from 'react'

export default class Footer extends React.Component {
    render () {
        let model_info = JSON.parse(localStorage.getItem('model_info'))

        return (
            <footer className="app-footer">
                <section className="foot">
                    <h3>{ model_info.copyright.replace('2014', '2014-' + new Date().getFullYear()) }</h3>
                </section>
            </footer>
        )
    }
}

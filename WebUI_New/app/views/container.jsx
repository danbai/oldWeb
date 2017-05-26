'use strict'

import React from 'react'

export default class Container extends React.Component {
    render() {
        return (
            <section className="app-content">
                { this.props.children }
            </section>
        )
    }
}

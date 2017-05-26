'use strict'

import $ from 'jquery'
import _ from 'underscore'
import React from 'react'
import { Icon, Spin } from 'antd'
import { injectIntl} from 'react-intl'
import { connect } from 'react-redux'
import * as Actions from '../actions/'
import { bindActionCreators } from 'redux'

import Header from './header'
import Footer from './footer'
import SideBar from './sidebar'
import Container from './container'
import menusData from './../locale/menusData.json'

let Home = React.createClass({
    render() {
        return (
            <div className="home-page">
                <div className="home-logo"><Icon type="home" /></div>
                <div className="f14">new Date()</div>
                <div className="f16">{ this.props.username }，Welcome to Grandstream.</div>
            </div>
        )
    }
})

let App = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },
    getInitialState() {
        return {
            collapse: false,
            loading: false,
            mode: 'inline'
        }
    },
    handleCollapseChange() {
        this.setState({
            collapse: !this.state.collapse,
            mode: this.state.mode === 'inline' ? 'vertical' : 'inline'
        })
    },
    componentDidMount() {
        this.props.setSpinLoading({loading: false})
    },
    _parseMenuPrivilege(menus) {
        let parsedMenu = []
        let html_privilege = JSON.parse(localStorage.getItem('html_privilege'))

        _.map(menus, (top, topIndex) => {
            let topmenu = _.clone(top)

            topmenu.items = []

            _.map(top.items, (sub, subIndex) => {
                if (html_privilege[sub.path] === 1) {
                    topmenu.items.push(sub)
                }
            })

            if (topmenu.items.length) {
                parsedMenu.push(topmenu)
            }
        })

        return parsedMenu
    },
    _renderChild() {
        const { children } = this.props

        if (children) {
            return (
                <div>
                    { children }
                </div>
            )
        }

        return (
            <div>
                <Home username={ "hi" } />
            </div>
        )
    },
    render() {
        const collapse = this.state.collapse
        const { formatMessage } = this.props.intl

        let containerSub
        let subMenus = menusData.subMenus
        let role = localStorage.getItem('role') === 'privilege_3'
        let showSideBar = window.location.href.indexOf('/setup-wizard') > -1

        if (role) {
            subMenus = menusData.userPortalMenus
        }

        subMenus = this._parseMenuPrivilege(subMenus)

        if (!showSideBar) {
            containerSub = (
                <div className="app-container">
                    <Header />
                    <SideBar
                        subMenus={ subMenus }
                        className={ showSideBar }
                        collapse={ this.state.collapse }
                        mode = { this.state.mode }
                        onChangeCollpase={ this.handleCollapseChange }
                    />
                    <div className="app-main">
                        <Container>
                            { this._renderChild() }
                        </Container>
                    </div>
                </div>
                )
        } else {
            containerSub = (
                <div className="app-container">
                    <Header />
                    <div className="">
                        <Container>
                            { this._renderChild() }
                        </Container>
                    </div>
                </div>
                )
        }

        const container = (
                <div className={ collapse ? "app-wrapper app-wrapper-collapse" : "app-wrapper" }>
                    { containerSub }
                    <Footer />
                </div>
            )

        let tip = this.props.spinLoading.tip
        let loading = this.props.spinLoading.loading

        return (
            <Spin
                spinning={ loading ? loading : false }
                tip={ tip ? tip : formatMessage({id: "LANG904"}) }
            >
                { container }
            </Spin>
        )
    }
})

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(App))

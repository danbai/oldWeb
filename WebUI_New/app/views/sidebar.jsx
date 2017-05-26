'use strict'

import $ from 'jquery'
import React from 'react'
import { Icon, Menu } from 'antd'
import { injectIntl } from 'react-intl'
import { browserHistory } from 'react-router'
import api from "../components/api/api"
import '../css/sidebar'
import { Scrollbars } from 'react-custom-scrollbars'

const SubMenu = Menu.SubMenu

let SideBar = React.createClass({
    getInitialState() {
        const pathname = location.pathname.split('/')
        const state = {
            current: pathname[2] ? pathname[2] : 'dashboard',
            openKeys: [(pathname[1] ? pathname[1] : 'system-status')],
            collapse: true
        }

        return state
    },
    componentDidMount() {
        setTimeout(function() {
            const minHeight = $('.app-sidebar .ant-menu').height() + 20

            $('#app-root .app-main').css({'min-height': minHeight + 'px'})
        }, 300)
    },
    componentDidUpdate() {
        setTimeout(function() {
            const minHeight = $('.app-sidebar .ant-menu').height() + 20

            $('#app-root .app-main').css({'min-height': minHeight + 'px'})
        }, 300)
    },
    handleClick(item) {
        const keyPath = item.keyPath.reverse()

        browserHistory.push('/' + keyPath.join('/'))

        this.setState({
            current: item.key
        })
    },
    onOpenChange(openKeys) {
        let topmenu = localStorage.getItem('topmenu')
        let latestOpenKey = openKeys.find(key => !(topmenu.indexOf(key) > -1))

        localStorage.setItem('topmenu', latestOpenKey)

        if (this.props.collapse && this.props.mode === 'inline') {
            this.onCollapseChange()
        }
        this.setState({
            openKeys: [latestOpenKey]
        })
    },
    onCollapseChange() {
        this.props.onChangeCollpase()
    },
    render() {
        const { formatMessage } = this.props.intl

        let topmenu = localStorage.getItem('topmenu')
        let submenu = localStorage.getItem('submenu')
        let model_info = JSON.parse(localStorage.getItem('model_info'))
        let mode = this.props.mode

        topmenu = topmenu === 'undefined' ? undefined : topmenu

        return (
          <Scrollbars style={{ width: 224, height: "100%", position: "absolute"}}>
              <aside className="app-sidebar">
                    <div className="aside-action" onClick={this.onCollapseChange} >
                        {this.props.collapse ? <div className="aside-bars"><Icon type="sprite sprite-bars-left" /></div> : <div className="aside-bars"><span className="bars-text">Menus</span><Icon type="sprite sprite-bars-right" /></div>}
                    </div>
                    <div>
                        <Menu
                            theme="dark"
                            mode={ mode }
                            // openKeys={ [this.state.openKeys] }
                            // selectedKeys={ [this.state.current] }
                            openKeys={ [topmenu] }
                            selectedKeys={ [submenu] }
                            onClick={ this.handleClick }
                            onOpenChange={ this.onOpenChange }
                        >
                            { this.props.subMenus.map(function(subMenu, subIndex) {
                                return (
                                    <SubMenu
                                        key={ subMenu.name }
                                        title={ <div><Icon type={"sprite sprite-menu " + subMenu.icon} /><span className="subMenuTitle">{ formatMessage({ id: subMenu.title }) }</span></div> }
                                    >
                                        {subMenu.items.map(function(item) {
                                            return <Menu.Item key= { item.path }>{ formatMessage({ id: item.name }) }</Menu.Item>
                                        })}
                                    </SubMenu>
                                )
                            }) }
                        </Menu>
                    </div>
              </aside>
          </Scrollbars>
        )
    }
})

module.exports = injectIntl(SideBar)

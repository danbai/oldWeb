'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Button, message, Modal, Table, Card, Select, Form, Input, Tooltip, Checkbox, BackTop } from 'antd'

const Option = Select.Option
const FormItem = Form.Item

class NetworkState extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataInternetHeader: [],
            dataUnixHeader: [],
            dataInternet: [],
            dataUnix: []
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let netstat = []
        let dataInternet = this.state.dataInternet
        let dataUnix = this.state.dataUnix
        let dataInternetHeader = this.state.dataInternetHeader
        let dataUnixHeader = this.state.dataUnixHeader

        $.ajax({
            url: api.apiHost + 'action=getNetCmd&netstat=',
            method: 'GET',
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    netstat = response.body.netstat || []
                    let table_internet = true
                    netstat.map(function(item) {
                        let dataStr = item
                        let ele = dataStr.replace(/\[\s+/g, "[").replace(/\s+\]/g, "]").split(/\s+/)

                        if (table_internet && dataStr.indexOf("RefCnt") > -1) {
                            table_internet = false
                        }
                        if (dataStr.indexOf("Recv-Q") > -1) {
                            dataInternetHeader[0] = ele[0]
                            dataInternetHeader[1] = ele[1]
                            dataInternetHeader[2] = ele[2]
                            dataInternetHeader[3] = ele[3]
                            dataInternetHeader[4] = ele[4]
                            dataInternetHeader[5] = ele[5]
                        } else if (dataStr.indexOf("RefCnt") > -1) {
                            dataUnixHeader[0] = ele[0]
                            dataUnixHeader[1] = ele[1]
                            dataUnixHeader[2] = ele[2]
                            dataUnixHeader[3] = ele[3]
                            dataUnixHeader[4] = ele[4]
                            dataUnixHeader[5] = ele[5]
                        } else if (table_internet) {
                            dataInternet.push({
                                row0: ele[0] === 'NULL' ? '' : ele[0],
                                row1: ele[1] === 'NULL' ? '' : ele[1],
                                row2: ele[2] === 'NULL' ? '' : ele[2],
                                row3: ele[3] === 'NULL' ? '' : ele[3],
                                row4: ele[4] === 'NULL' ? '' : ele[4],
                                row5: ele[5] === 'NULL' ? '' : ele[5]
                            })
                        } else {
                            dataUnix.push({
                                row0: ele[0] === 'NULL' ? '' : ele[0],
                                row1: ele[1] === 'NULL' ? '' : ele[1],
                                row2: ele[2] === 'NULL' ? '' : ele[2],
                                row3: ele[3] === 'NULL' ? '' : ele[3],
                                row4: ele[4] === 'NULL' ? '' : ele[4],
                                row5: ele[5] === 'NULL' ? '' : ele[5]
                            })
                        }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            dataInternetHeader: dataInternetHeader,
            dataInternet: dataInternet,
            dataUnixHeader: dataUnixHeader,
            dataUnix: dataUnix
        })
    }
    __createCol = () => {

    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const { getFieldDecorator } = this.props.form
        const dataInternetHeader = this.state.dataInternetHeader
        const dataUnixHeader = this.state.dataUnixHeader

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const columns_internet = [{
                key: 'row0',
                dataIndex: 'row0',
                title: dataInternetHeader[0],
                width: 150
            }, {
                key: 'row1',
                dataIndex: 'row1',
                title: dataInternetHeader[1],
                width: 150
            }, {
                key: 'row2',
                dataIndex: 'row2',
                title: dataInternetHeader[2],
                width: 150
            }, {
                key: 'row3',
                dataIndex: 'row3',
                title: dataInternetHeader[3],
                width: 150
            }, {
                key: 'row4',
                dataIndex: 'row4',
                title: dataInternetHeader[4],
                width: 150
            }, {
                key: 'row5',
                dataIndex: 'row5',
                title: dataInternetHeader[5],
                width: 150
            }]

            const columns_unix = [{
                key: 'row0',
                dataIndex: 'row0',
                title: dataUnixHeader[0],
                width: 150
            }, {
                key: 'row1',
                dataIndex: 'row1',
                title: dataUnixHeader[1],
                width: 150
            }, {
                key: 'row2',
                dataIndex: 'row2',
                title: dataUnixHeader[2],
                width: 150
            }, {
                key: 'row3',
                dataIndex: 'row3',
                title: dataUnixHeader[3],
                width: 150
            }, {
                key: 'row4',
                dataIndex: 'row4',
                title: dataUnixHeader[4],
                width: 150
            }, {
                key: 'row5',
                dataIndex: 'row5',
                title: dataUnixHeader[5],
                width: 150
            }]

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG4010"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG4010"}) }
                    isDisplay= "hidden"
                />
                <div className="content">
                    <div className="section-title">
                        Active Internet Connections (Servers And Established)
                    </div>
                    <div style={{ maxHeight: 250, overflow: 'auto', marginBottom: 50 }}>
                        <Table
                            rowKey=""
                            columns={ columns_internet }
                            pagination={ false }
                            dataSource={ this.state.dataInternet }
                            showHeader={ !!this.state.dataInternet.length }
                        />
                    </div>
                    <div className="section-title">
                        Active Unix Domain Sockets (Servers And Established)
                    </div>
                    <div style={{ maxHeight: 250, overflow: 'auto' }}>
                        <Table
                            rowKey=""
                            columns={ columns_unix }
                            pagination={ false }
                            dataSource={ this.state.dataUnix }
                            showHeader={ !!this.state.dataUnix.length }
                        />
                    </div>
                </div>
                <div>
                    <BackTop />
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(NetworkState))
'use strict'

import React, { Component, PropTypes } from 'react'
import { browserHistory } from 'react-router'
import { Table, message, Popconfirm, Switch } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"

global.dataTrunkDisableReconnect = false

const encapsulationObj = {
        "hdlc": "HDLC",
        "hdlc-eth": "HDLC-ETH",
        "cisco": "Cisco",
        "fr": "Frame Relay",
        "ppp": "PPP"
    }

class dataTrunksList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pingcheck: 0,
            rxcheck: 0,
            dataTrunk: []
        }
    }
    componentDidMount() {
        this._listDataTrunk()
    }
    _listDataTrunk = () => {
        this._checkNetHdlcStatus("firstLoad")
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listDataTrunk'
            },
            type: 'json',
            async: true,
            success: function(res) {
                let nethdlcSettings = res.response.nethdlc_settings
                this.setState({
                    dataTrunk: nethdlcSettings
                })
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _deleteTrunk = (data) => {
        const { formatMessage } = this.props.intl

        let trunkIndex = data.trunk_index
        message.loading(formatMessage({ id: "LANG825" }, {0: "LANG11"}), 0)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteAnalogTrunk",
                "analogtrunk": trunkIndex
            },
            type: 'json',
            async: true,
            success: function(res) {
                var bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    // message.success(formatMessage({ id: "LANG816" }))
                    this._listAnalogTrunk()
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _editTrunk = (e) => {
        browserHistory.push('/extension-trunk/dataTrunk/editDataTrunk')
    }
    _reconnect = (e) => {
        const { formatMessage } = this.props.intl
        // $(this).removeClass("reconnection").addClass("reconnecting").attr({
        //     localetitle: "LANG3890",
        //     title: $P.lang("LANG3890"),
        //     disabled: true
        // });
        global.dataTrunkDisableReconnect = true
        message.loading(formatMessage({id: "LANG905"}))
        $.ajax({
            url: api.apiHost,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                "action": "reloadNetHDLC",
                "nethdlc": ""
            },
            success: function(data) {
                message.info(formatMessage({id: "LANG3875"}))
                // UCMGUI.config.promptNetHDLC = true
                // if (retryFlag) {
                //     retryFlag = false;
                //     retryTimeout = window.setInterval(function() {
                //         checkNetHdlcStatus();
                //     }, 6000);
                // }
            }
        })
    }
    _checkNetHdlcStatus = (firstLoad) => {
        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                action: 'getnethdlcStatus',
                "auto-refresh": Math.random()
            },
            async: false,
            success: function(data) {
                let res = data.response

                if (res) {
                    this.setState({
                        pingcheck: Number(res.pingcheck),
                        rxcheck: Number(res.rxcheck)
                    })
                    if (!firstLoad) {
                        // $("td").eq(0).html(transStatus())
                    }
                }
            }.bind(this)
        })
    }
    _transStatus = (text, record, index) => {
        const { formatMessage } = this.props.intl
        var status = <span className='sprite sprite-status-unavailable'></span>
        var reconnecting = $(".reconnecting")
        var isChangeStatus = false
        const pingcheck = this.state.pingcheck
        const rxcheck = this.state.rxcheck

        if (pingcheck === 9) {
            status = <span className="sprite sprite-status-unavailable" title={ formatMessage({id: "LANG113"}) }></span>
            isChangeStatus = true
        } else if (pingcheck === 8 || rxcheck === 8) {
            status = <span className="sprite sprite-status-idle" title={ formatMessage({id: "LANG2396"}) }></span>
            isChangeStatus = true
        } else if (pingcheck === 1) {
            status = <span className="sprite sprite-status-unavailable" title={ formatMessage({id: "LANG3882"}) }></span>
            isChangeStatus = true
        } else if (pingcheck === 7) {
            status = <span className="sprite sprite-status-unavailable" title={ formatMessage({id: "LANG3883"}) }></span>
            isChangeStatus = true
        }
        if (isChangeStatus) {
            // reconnecting.removeClass("reconnecting").addClass("reconnection").attr({
            //     localetitle: formatMessage({id: "LANG3874"}),
            //     title: formatMessage({id: "LANG3874"}),
            //     disabled: false
            // })
            // UCMGUI.config.promptNetHDLC = false;
            global.dataTrunkDisableReconnect = false
        }
        return status
    }
    render() {
        const {formatMessage} = this.props.intl

        const columns = [
            {
                title: formatMessage({id: "LANG81"}),
                dataIndex: 'hdlc0__enable',
                render: (text, record, index) => {
                    return this._transStatus(text, record, index)
                }
            }, {
                title: formatMessage({id: "LANG2772"}),
                dataIndex: '',
                render: (text, record, index) => (
                    <span>{ record.hdlc0__enable === 0 ? formatMessage({id: "LANG5399"}) : formatMessage({id: "LANG5398"}) }</span>
                )
            }, {
                title: formatMessage({id: "LANG237"}),
                dataIndex: 'span',
                render: (text, record, index) => (
                    <span>{(Number(text) - 2)}</span>
                )
            }, {
                title: formatMessage({id: "LANG3558"}),
                dataIndex: 'hdlc0__encapsulation',
                render: (text, record, index) => {
                    return <span>{ encapsulationObj[text] }</span>
                }
            }, {
                title: formatMessage({id: "LANG74"}),
                dataIndex: '',
                key: 'x',
                render: (text, record, index) => {
                    if (record.hdlc0__enable === 0) {
                        global.dataTrunkDisableReconnect = true
                    } else {
                        global.dataTrunkDisableReconnect = false
                    }
                    if (global.dataTrunkDisableReconnect === false) {
                        return <span>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"})}
                                onClick={this._editTrunk.bind(this, record)}
                            ></span>
                            <span
                                className={ "sprite sprite-reconnect" }
                                title={ formatMessage({id: "LANG3874"}) }
                                onClick={this._reconnect.bind(this)}></span>
                        </span>
                    } else {
                        return <span>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"})}
                                onClick={this._editTrunk.bind(this, record)}
                            ></span>
                            <span
                                className={ "sprite sprite-reconnect-disabled" }
                                title={ formatMessage({id: "LANG3874"}) }></span>
                        </span>
                    }
                }
            }
        ]

        return (
            <div className="no-pagination">
                <Table
                    rowSelection={ false }
                    columns={ columns }
                    dataSource={ this.state.dataTrunk }
                />
            </div>
        )
    }
}

dataTrunksList.defaultProps = {

}

export default injectIntl(dataTrunksList)

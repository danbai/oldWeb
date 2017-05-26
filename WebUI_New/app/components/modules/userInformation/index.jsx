'use strict'

import {Row, Col, message } from 'antd'
import '../../../css/userInformation'
import VoiceMail from './voicemail'
import AlarmClock from './alarmClock'
import DOD from './dod'
import Transfer from './transfer'
import MissCall from './missCall'
import FollowMe from './followMe'
import ConferenceSchedule from './conferenceSchedule'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'
import _ from 'underscore'

class UserInformation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            infoList: {}
        }
    }
    componentDidMount() {
        this._getInfo()
    }
    _getInfo = () => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                'action': 'getUserInfo',
                'extension': localStorage.getItem('username')
            },
            async: false,
            success: function(res) {
                let infoList = res.response
                this.setState({
                    infoList: infoList
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    componentWillUnmount() {
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG2802"})
        })

        let infoList = this.state.infoList

        let configReloadStatus = this.props.configReloadStatus,
            module = configReloadStatus.module,
            moduleFormat = ''

        if (module) {
            if (module === 'wakeup') {
                moduleFormat = formatMessage({id: "LANG4858"})
            } else if (module === 'extension') {
                moduleFormat = formatMessage({id: "LANG87"})
            } else if (module === 'meetme') {
                moduleFormat = formatMessage({id: "LANG3775"})
            } else if (module === 'follow_me') {
                moduleFormat = formatMessage({id: "LANG568"})
            }
            message.warning(moduleFormat + ' ' + formatMessage({id: "LANG2691"}))
        }

        return (
            <div className="user-information">
                <div className="app-content-main" id="app-content-main">
                    <Row gutter={16}>
                        <Col className="gutter-row" span={ 6 }>
                            <VoiceMail voicemailData={ infoList.voicemail } socketVoiceMailData={ this.props.voiceMailStatus } />
                        </Col>
                        <Col className="gutter-row" span={ 6 }>
                            <AlarmClock wakeupData={ infoList.wakeup } />
                        </Col>
                        <Col className="gutter-row" span={ 6 }>
                            <DOD dodData = { infoList.dndwhitelist } />
                        </Col>
                        <Col className="gutter-row" span={ 6 }>
                            <Transfer transferData={ infoList.transfer } />
                        </Col>
                        <Col className="gutter-row" span={ 8 }>
                            <MissCall missCallData={ infoList.failed_call } />
                        </Col>
                        <Col className="gutter-row" span={ 8 }>
                            <FollowMe followMeData={ infoList.followme } />
                        </Col>
                        <Col className="gutter-row" span={ 8 }>
                            <ConferenceSchedule conferenceData={ infoList.meetme_sche } />
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    configReloadStatus: state.configReloadStatus,
    voiceMailStatus: state.voiceMailStatus
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserInformation))

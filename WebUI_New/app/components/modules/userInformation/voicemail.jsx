import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col, Button } from 'antd'
import _ from 'underscore'

class VoiceMail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    _jumpVoicemail = () => {
        browserHistory.push('/user-personal-data/userVoicemail')
    }
    render() {
        const {formatMessage} = this.props.intl

        let voicemailData = this.props.voicemailData || {},
            socketVoiceMailData = this.props.socketVoiceMailData

        if (socketVoiceMailData.length > 0) {
            voicemailData = socketVoiceMailData[0]
        }

        let newmsg = voicemailData.newmsg,
            oldmsg = voicemailData.oldmsg,
            urgemsg = voicemailData.urgemsg,
            totalmsg = (newmsg + oldmsg + urgemsg) || 0
            
        return (
            <div className="voicemail">
                <Card
                    title={ formatMessage({id: "LANG20"}) }
                    bordered={ true }
                    className={ newmsg === 0 ? 'hidden' : 'display-block'}
                >
                    <Row align="middle" justify="center" type="flex" style={{ marginBottom: 40 }}>
                        <Col className="gutter-row">
                            <span className="sprite sprite-voicemail-data"></span>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row" span={ 6 }>
                            <div className="num-font">{ newmsg }</div>
                            <div>{ formatMessage({id: "LANG5254"}) }</div>
                        </Col>
                        <Col className="gutter-row" span={ 2 }>
                            <div className="voice-border"></div>
                        </Col>
                        <Col className="gutter-row" span={ 6 }>
                            <div className="num-font">{ totalmsg }</div>
                            <div>{ formatMessage({id: "LANG20"}) }</div>
                        </Col>
                    </Row>
                </Card>
                <Card
                    title={ formatMessage({id: "LANG20"}) }
                    bordered={ true }
                    className={ newmsg === 0 ? 'display-block' : 'hidden'}
                >
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            <span className="sprite sprite-voicemail-no-data"></span>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" style={{ marginBottom: 20, marginTop: -40 }}>
                        <Col className="gutter-row">
                            { formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG5254"})}) }
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            <Button className="start-btn" onClick={ this._jumpVoicemail }>
                                { formatMessage({id: "LANG560"}) }
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

export default injectIntl(VoiceMail)
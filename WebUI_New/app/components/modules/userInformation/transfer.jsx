import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col, Button } from 'antd'
import _ from 'underscore'

class Transfer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    _jumpExtension = () => {
        browserHistory.push('/user-basic-information/userExtension')
    }
    render() {
        const {formatMessage} = this.props.intl

        let transferData = this.props.transferData || {},
            cfu = transferData.cfu,
            cfn = transferData.cfn,
            cfb = transferData.cfb,
            cfu_timetype = transferData.cfu_timetype || 0,
            cfb_timetype = transferData.cfb_timetype || 0,
            cfn_timetype = transferData.cfn_timetype || 0,
            localeArray = ['LANG3285', 'LANG3271', 'LANG3275', 'LANG3266', 'LANG3286', 'LANG3287', 'LANG3288']

        return (
            <div className="transfer">
                <Card
                    title={ formatMessage({id: "LANG3887"}) }
                    bordered={ true }
                    className={ (cfu === null && cfn === null && cfb === null) ? 'hidden' : 'display-block' }
                >
                    <Row align="middle" justify="center" type="flex" style={{ marginBottom: 10 }}>
                        <Col className="gutter-row">
                            <span className="sprite sprite-transfer"></span>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="gutter-row" style={{ marginBottom: 20 }}>
                            <hr />
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row" span={ 6 }>
                            <div>{ formatMessage({id: "LANG1083"}) }</div>
                            <div className="num-font">{ cfu }</div>
                            <div>{ formatMessage({id: localeArray[cfu_timetype]}) }</div>
                        </Col>
                        <Col className="gutter-row" span={ 2 }>
                            <div className="voice-border"></div>
                        </Col>
                        <Col className="gutter-row" span={ 6 }>
                            <div>{ formatMessage({id: "LANG1085"}) }</div>
                            <div className="num-font">{ cfn }</div>
                            <div>{ formatMessage({id: localeArray[cfb_timetype]}) }</div>
                        </Col>
                        <Col className="gutter-row" span={ 2 }>
                            <div className="voice-border"></div>
                        </Col>
                        <Col className="gutter-row" span={ 6 }>
                            <div>{ formatMessage({id: "LANG1087"}) }</div>
                            <div className="num-font">{ cfb }</div>
                            <div>{ formatMessage({id: localeArray[cfn_timetype]}) }</div>
                        </Col>
                    </Row>
                </Card>
                <Card
                    title={ formatMessage({id: "LANG3887"}) }
                    bordered={ true }
                    className={ (cfu === null && cfn === null && cfb === null) ? 'display-block' : 'hidden' }
                >
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            <span className="sprite sprite-no-transfer"></span>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" style={{ marginBottom: 20, marginTop: -40 }}>
                        <Col className="gutter-row">
                            { formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG3887"})}) }
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            <Button className="start-btn" onClick={ this._jumpExtension }>
                                { formatMessage({id: "LANG560"}) }
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

export default injectIntl(Transfer)
import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col, Button } from 'antd'
import _ from 'underscore'

class AlarmClock extends Component {
    constructor(props) {
        super(props)
        this.state = {
            
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    _jumpWakeUp = () => {
        browserHistory.push('/user-value-added-features/userWakeupService')
    }
    render() {
        const {formatMessage} = this.props.intl

        let wakeupData = this.props.wakeupData || [],
            wakeupDataNum = wakeupData.length
            
        return (
            <div className="wakeup">
                <Card
                    title={ formatMessage({id: "LANG4858"}) }
                    bordered={true}
                    className={ wakeupDataNum === 0 ? 'hidden' : 'display-block'}
                >
                    <Row align="middle" justify="center" type="flex" style={{ marginBottom: 10 }}>
                        <Col className="gutter-row">
                            <span className="sprite sprite-wakeup"></span>
                            <span className="num-font">{ wakeupDataNum }</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="gutter-row" style={{ marginBottom: 20 }}>
                            <hr />
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            {
                                wakeupData.map(function(item, key) {
                                    return (
                                        <div key={ key }
                                            className="display-inline"
                                            style={{ marginBottom: 10, marginRight: (key % 2 === 0 ? 30 : 0) }}
                                        >
                                            <span className="sprite sprite-wakeup-clock"></span>
                                            <span className="font-bold wakeup-list">{ item.custom_date + ' ' + item.time }</span>
                                        </div>
                                    )
                                })
                            }
                        </Col>
                    </Row>                
                </Card>
                <Card
                    title={ formatMessage({id: "LANG4858"}) }
                    bordered={ true }
                    className={ wakeupDataNum === 0 ? 'display-block' : 'hidden'}
                >
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            <span className="sprite sprite-no-wakeup"></span>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" style={{ marginBottom: 20, marginTop: -40 }}>
                        <Col className="gutter-row">
                            { formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG4858"})}) }
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            <Button className="start-btn" onClick={ this._jumpWakeUp }>
                                { formatMessage({id: "LANG560"}) }
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

export default injectIntl(AlarmClock)
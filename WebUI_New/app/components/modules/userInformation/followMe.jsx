import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col, Button } from 'antd'
import _ from 'underscore'

class FollowMe extends Component {
    constructor(props) {
        super(props)
        this.state = {
            
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    _jumpFollowMe = () => {
        browserHistory.push('/user-personal-data/userFollowMe')
    }
    render() {
        const {formatMessage} = this.props.intl

        let followMeData = this.props.followMeData || []

        return (
            <div className="followme">
                <Card
                    title={ formatMessage({id: "LANG568"}) }
                    bordered={ true }
                    className={ followMeData.length === 0 ? 'hidden' : 'display-block'}
                >
                    <Row style={{ marginBottom: 10 }}>
                        <Col className="gutter-row">
                            <div className="display-inline" style={{ marginRight: 60 }}>
                                <span className="sprite sprite-while-ring"></span>
                                <span>{ formatMessage({id: "LANG1062"}) }</span>
                            </div>
                            <div className="display-inline">
                                <span className="sprite sprite-order-ring"></span>
                                <span>{ formatMessage({id: "LANG1063"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex">
                        {
                            followMeData.map(function(item, key) {
                                let extensionArray = item.extension.split(',')

                                return (
                                    <Col className="gutter-row" key={ key } span={ 24 }>
                                        <div className="followme-col">
                                            <span className="sprite sprite-while-ring"></span>
                                            {
                                                extensionArray.map(function(itemExten, key) {
                                                    return (
                                                        <div key={ key }
                                                            className="display-inline font-bold followme-list"
                                                        >
                                                            { itemExten }
                                                        </div>
                                                    )
                                                })
                                            }
                                            <div
                                                style={{ textAlign: 'right' }}
                                                className="font-bold"
                                            >
                                                { item.ringtime }s
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', marginBottom: 5 }}>
                                            <span className={ "sprite sprite-order-ring" + (key === followMeData.length - 1 ? 'hidden' : '') }></span>
                                        </div>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </Card>
                <Card
                    title={ formatMessage({id: "LANG568"}) }
                    bordered={ true }
                    className={ followMeData.length === 0 ? 'display-block' : 'hidden'}
                >
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row" style={{ marginTop: 130 }}>
                            <span className="sprite sprite-no-data"></span>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" style={{ marginTop: 20, marginBottom: 20 }}>
                        <Col className="gutter-row">
                            { formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG568"})}) }
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            <Button className="start-btn" onClick={ this._jumpFollowMe }>
                                { formatMessage({id: "LANG560"}) }
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

export default injectIntl(FollowMe)
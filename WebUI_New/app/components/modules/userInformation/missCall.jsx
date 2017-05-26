import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col, Button } from 'antd'
import _ from 'underscore'

class MissCall extends Component {
    constructor(props) {
        super(props)
        this.state = {
            
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    render() {
        const {formatMessage} = this.props.intl

        let missCallData = this.props.missCallData || []

        return (
            <div className="missCall">
                <Card
                    title={ formatMessage({id: "LANG4864"}) }
                    bordered={ true }
                    className={ missCallData.length === 0 ? 'hidden' : 'display-block'}
                >
                    <Row align="middle" justify="center" type="flex">
                        {
                            missCallData.map(function(item, key) {
                                let type = item.disposition,
                                    typeClassName = ''

                                if (type === 'FAILED') {
                                    typeClassName = 'sprite-cdr-fail'
                                } else if (type === 'NO ANSWER') {
                                    typeClassName = 'sprite-cdr-no-answer'
                                }

                                return (
                                    <Col className="gutter-row misscall-border" key={ key } span={ 24 }>
                                        <span className="font-bold misscall-time">{ item.start }</span>
                                        <span className={ "sprite " + typeClassName }></span>
                                        <span className="font-bold">{ item.src }</span>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </Card>
                <Card
                    title={ formatMessage({id: "LANG4864"}) }
                    bordered={ true }
                    className={ missCallData.length === 0 ? 'display-block' : 'hidden'}
                >
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row" style={{ marginTop: 130 }}>
                            <span className="sprite sprite-no-data"></span>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" style={{ marginTop: 20 }}>
                        <Col className="gutter-row">
                            { formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG4864"})}) }
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

export default injectIntl(MissCall)
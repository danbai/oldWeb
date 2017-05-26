import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col, Button } from 'antd'
import _ from 'underscore'

class ConferenceSchedule extends Component {
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

        let conferenceData = this.props.conferenceData || []

        return (
            <div className="conference">
                <Card
                    title={ formatMessage({id: "LANG3775"}) }
                    bordered={ true }
                    className={ conferenceData.length === 0 ? 'hidden' : 'display-block'}
                >
                    <Row align="middle" justify="center" type="flex">
                        {
                            conferenceData.map(function(item, key) {
                                let starttime = item.starttime,
                                    endtime = item.endtime

                                let nShour = parseInt(starttime.slice(11, 13), 10),
                                    nSmin = parseInt(starttime.slice(14, 16), 10),
                                    nEhour = parseInt(endtime.slice(11, 13), 10),
                                    nEmin = parseInt(endtime.slice(14, 16), 10)

                                endtime = (nEhour - nShour) * 60 + nEmin - nSmin

                                return (
                                    <Col className="gutter-row conference-col" key={ key } span={ 24 }>
                                        <div className="conference-list">
                                            <span>{ formatMessage({id: "LANG3783"}) }</span>
                                            <span className="font-bold" style={{ marginLeft: 20, marginRight: 10 }}>{ item.confname }</span>
                                            <span className={ item.recurringevent === 'COMMON' ? '' : 'sprite sprite-circle' }></span>
                                        </div>
                                        <div className="conference-list">
                                            <span>{ formatMessage({id: "LANG3777"}) }</span>
                                            <span className="font-bold" style={{ marginLeft: 20, marginRight: 10 }}>{ item.confno }</span>
                                        </div>
                                        <div className="conference-list">
                                            <span>{ formatMessage({id: "LANG2229"}) }</span>
                                            <span className="font-bold" style={{ marginLeft: 20, marginRight: 10 }}>{ starttime }</span>
                                        </div>
                                        <div className="conference-list">
                                            <span>{ formatMessage({id: "LANG2230"}) }</span>
                                            <span className="font-bold" style={{ marginLeft: 20, marginRight: 10 }}>{ endtime }</span>
                                        </div>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </Card>
                <Card
                    title={ formatMessage({id: "LANG3775"}) }
                    bordered={ true }
                    className={ conferenceData.length === 0 ? 'display-block' : 'hidden'}
                >
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row" style={{ marginTop: 130 }}>
                            <span className="sprite sprite-no-data"></span>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" style={{ marginTop: 20, marginBottom: 20 }}>
                        <Col className="gutter-row">
                            { formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG3775"})}) }
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

export default injectIntl(ConferenceSchedule)
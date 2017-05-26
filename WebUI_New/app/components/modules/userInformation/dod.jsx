import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col, Button } from 'antd'
import _ from 'underscore'

class DOD extends Component {
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

        let dndwhitelist = this.props.dodData || {},
            dndList = dndwhitelist.dndwhitelist,
            dndArray = [],
            dndNum = 0

        if (dndList) {
            dndArray = dndList.split(',')
            dndNum = dndArray.length
        }
            
        return (
            <div className="dod">
                <Card
                    title={ formatMessage({id: "LANG5178"}) }
                    bordered={true}
                    className={ dndNum === 0 ? 'hidden' : 'display-block'}
                >
                    <Row align="middle" justify="center" type="flex" style={{ marginBottom: 10 }}>
                        <Col className="gutter-row">
                            <span className="sprite sprite-userportal-dod"></span>
                            <span className="num-font">{ dndNum }</span>
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
                                dndArray.map(function(item, key) {
                                    return (
                                        <div key={ key }
                                            className="display-inline font-bold dod-list"
                                        >
                                            { item }
                                        </div>
                                    )
                                })
                            }
                        </Col>
                    </Row>                
                </Card>
                <Card
                    title={ formatMessage({id: "LANG5178"}) }
                    bordered={ true }
                    className={ dndNum === 0 ? 'display-block' : 'hidden'}
                >
                    <Row align="middle" justify="center" type="flex">
                        <Col className="gutter-row">
                            <span className="sprite sprite-no-dod"></span>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" style={{ marginBottom: 20, marginTop: -40 }}>
                        <Col className="gutter-row">
                            { formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG5178"})}) }
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

export default injectIntl(DOD)
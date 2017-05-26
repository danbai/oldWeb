'use strict'

import { injectIntl } from 'react-intl'
import { Badge, Popover, Table, Tag } from 'antd'
import React, { Component, PropTypes } from 'react'

class ReportInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl

        const infoColumns = [{
                key: 'queue',
                dataIndex: 'queue',
                title: formatMessage({id: "LANG91"}),
                render: (text, record, index) => {
                    let members = text ? text.split(',') : []

                    if (members.length <= 5) {
                        return <div>
                                {
                                    members.map(function(value, index) {
                                        return <Tag key={ value }>{ value }</Tag>
                                    }.bind(this))
                                }
                            </div>
                    } else {
                        const content = <div>
                                    {
                                        members.map(function(value, index) {
                                            if (index >= 4) {
                                                return <Tag key={ value }>{ value }</Tag>
                                            }
                                        }.bind(this))
                                    }
                                </div>

                        return <div>
                                {
                                    [0, 1, 2, 3].map(function(value, index) {
                                        return <Tag key={ members[value] }>{ members[value] }</Tag>
                                    }.bind(this))
                                }
                                <Popover
                                    title=""
                                    content={ content }
                                >
                                    <Badge
                                        overflowCount={ 10 }
                                        count={ members.length - 4 }
                                    />
                                </Popover>
                            </div>
                    }
                }
            }, {
                key: 'agent',
                dataIndex: 'agent',
                title: formatMessage({id: "LANG143"}),
                render: (text, record, index) => {
                    let members = text ? text.split(',') : []
                    const extgroupLabel = formatMessage({id: "LANG2714"})

                    members = members.map(function(value, index) {
                            const item = this.props.ExtensionGroup[value]

                            if (item) {
                                return extgroupLabel + "--" + item.group_name
                            } else {
                                return value
                            }
                        }.bind(this))

                    if (members.length <= 5) {
                        return <div>
                                {
                                    members.map(function(value, index) {
                                        return <Tag key={ value }>{ value }</Tag>
                                    }.bind(this))
                                }
                            </div>
                    } else {
                        const content = <div>
                                    {
                                        members.map(function(value, index) {
                                            if (index >= 4) {
                                                return <Tag key={ value }>{ value }</Tag>
                                            }
                                        }.bind(this))
                                    }
                                </div>

                        return <div>
                                {
                                    [0, 1, 2, 3].map(function(value, index) {
                                        return <Tag key={ members[value] }>{ members[value] }</Tag>
                                    }.bind(this))
                                }
                                <Popover
                                    title=""
                                    content={ content }
                                >
                                    <Badge
                                        overflowCount={ 10 }
                                        count={ members.length - 4 }
                                    />
                                </Popover>
                            </div>
                    }
                }
            }, {
                key: 'startDate',
                dataIndex: 'startDate',
                title: formatMessage({id: "LANG1048"})
            }, {
                key: 'endDate',
                dataIndex: 'endDate',
                title: formatMessage({id: "LANG1049"})
            }, {
                key: 'period',
                dataIndex: 'period',
                title: formatMessage({id: "LANG2261"})
            }]

        return (
            <Table
                pagination={ false }
                columns={ infoColumns }
                dataSource={ this.props.QueueReport }
            />
        )
    }
}

module.exports = injectIntl(ReportInfo)
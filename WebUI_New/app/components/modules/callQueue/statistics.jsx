'use strict'

import $ from 'jquery'
import _ from 'underscore'
import moment from 'moment'
import Filter from './filter'
import Report from './report'
import api from "../../api/api"
import '../../../css/call-queue'
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Button, Card, Checkbox, Col, DatePicker, Form, Input, message, Row, Select, Tooltip, Transfer, TreeSelect } from 'antd'

const NewDate = new Date()
const FormItem = Form.Item
const Option = Select.Option
const AddZero = UCMGUI.addZero
const TreeNode = TreeSelect.TreeNode
const CheckboxGroup = Checkbox.Group
const SHOW_PARENT = TreeSelect.SHOW_PARENT

const DateFormat = 'YYYY-MM-DD'
const CurrentDate = NewDate.getFullYear() + '-' + AddZero(NewDate.getMonth() + 1) + '-' + AddZero(NewDate.getDate())

class Statistics extends Component {
    constructor(props) {
        super(props)

        this.state = {
            queues: [],
            agents: [],
            period: '1',
            accounts: {},
            extgroupObj: {},
            QueueReport: [],
            selectQueues: [],
            selectAgents: [],
            QueueStatTotal: [],
            agentTreeData: [],
            queueTreeData: [],
            endDate: CurrentDate,
            startDate: CurrentDate,
            checkboxValues: ['getQueueReport'],
            QueueStatDistributionByDay: [],
            QueueStatDistributionByHour: [],
            QueueStatDistributionByWeek: [],
            QueueStatDistributionByQueue: [],
            QueueStatDistributionByAgent: [],
            QueueStatDistributionByMonth: [],
            QueueStatDistributionByDayOfWeek: [],
            VQStatDistributionByQueue: [],
            VQStatDistributionByAgent: [],
            VQStatDistributionByHour: [],
            VQStatDistributionByDay: [],
            VQStatDistributionByWeek: [],
            VQStatDistributionByMonth: [],
            VQStatDistributionByDayOfWeek: []
        }
    }
    componentWillMount() {
        this._getInitData()
    }
    componentDidMount() {
        this._getStatisticDetails(this.state.checkboxValues)
    }
    _checkTimeFormat = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        value = value ? value.format(DateFormat) : ''

        if (value && !/^\d{4}\-\d{2}\-\d{2}$/.test(value)) {
            callback(formatMessage({id: "LANG2767"}))
        } else {
            callback()
        }
    }
    _daysBetween(start, end) {
        return Math.round((end - start) / (1000 * 60 * 60 * 24))
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl

        let queues = []
        let agents = []
        let accounts = {}
        let queueList = []
        let extgroupObj = {}
        let queueReport = {
                queue: [],
                agent: [],
                period: '1',
                end_date: CurrentDate,
                start_date: CurrentDate
            }

        let agentTreeData = [{
                key: 'all',
                value: 'all',
                children: [],
                label: formatMessage({id: "LANG104"})
            }]

        let queueTreeData = [{
                key: 'all',
                value: 'all',
                children: [],
                label: formatMessage({id: "LANG104"})
            }]

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getAccountList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const accountList = response.extension || []

                    accountList.map(function(item) {
                        accounts[item.extension] = item
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getExtensionGroupList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extgroupList = response.extension_groups || []

                    extgroupList.map(function(item) {
                        extgroupObj[item.group_id] = item
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                sord: 'asc',
                sidx: 'extension',
                action: 'listQueue',
                options: 'extension,members'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}

                    queueList = response.queue || []

                    queueList.map(function(item) {
                        if (item.extension) {
                            queues.push({
                                key: item.extension,
                                value: item.extension,
                                label: item.extension
                            })
                        }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getQueueReport'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    queueReport = response.queue_report_info || {}

                    queueReport.start_date = queueReport.start_date ? queueReport.start_date : CurrentDate
                    queueReport.end_date = queueReport.end_date ? queueReport.end_date : CurrentDate
                    queueReport.period = queueReport.period ? queueReport.period : '1'
                    queueReport.queue = queueReport.queue ? queueReport.queue.split(',') : []
                    queueReport.agent = queueReport.agent ? queueReport.agent.split(',') : []

                    if (queueReport.queue.length) {
                        let obj = {}
                        let members = []
                        let agentKeys = []
                        let disabled = formatMessage({id: "LANG273"})
                        let extgroupLabel = formatMessage({id: "LANG2714"})

                        _.map(queueReport.queue, function(value) {
                            let item = _.find(queueList, (data) => { return data.extension === value })

                            if (item.members) {
                                members = item.members.split(',')

                                members.map(function(member) {
                                    if (agentKeys.indexOf(member) === -1) {
                                        obj = extgroupObj[member] || accounts[member] || {}

                                        if (obj.out_of_service) {
                                            agents.push({
                                                key: member,
                                                value: member,
                                                out_of_service: obj.out_of_service,
                                                label: (obj.extension +
                                                        (obj.fullname ? ' "' + obj.fullname + '"' : '') +
                                                        (obj.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                                            })
                                        } else {
                                            agents.push({
                                                key: member,
                                                value: member,
                                                label: extgroupLabel + " -- " + obj.group_name
                                            })
                                        }

                                        agentKeys.push(member)
                                    }
                                })
                            }
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        agentTreeData[0].children = agents
        queueTreeData[0].children = queues

        this.setState({
            queues: queues,
            agents: agents,
            accounts: accounts,
            queueList: queueList,
            extgroupObj: extgroupObj,
            period: queueReport.period,
            agentTreeData: agentTreeData,
            queueTreeData: queueTreeData,
            endDate: queueReport.end_date,
            selectQueues: queueReport.queue,
            selectAgents: queueReport.agent,
            startDate: queueReport.start_date
        })
    }
    _getStatisticDetails = (selectCheckbox) => {
        _.map(selectCheckbox, (value) => {
            this['_' + value]()
        })

        // this._getQueueReport()
        // this._getQueueStatTotal()
        // this._listQueueStatDistributionByQueue()
        // this._listQueueStatDistributionByAgent()
        // this._listQueueStatDistributionByHour()
        // this._listQueueStatDistributionByDay()
        // this._listQueueStatDistributionByWeek()
        // this._listQueueStatDistributionByMonth()
        // this._listQueueStatDistributionByDayOfWeek()
    }
    _getQueueReport = () => {
        const { formatMessage } = this.props.intl

        let QueueReport = [{
                key: '1',
                queue: this.state.selectQueues.join(),
                agent: this.state.selectAgents.join(),
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                period: this.state.period + ' ' + formatMessage({id: "LANG3594"}).toLowerCase()
            }]

        this.setState({
            QueueReport: QueueReport
        })
    }
    _getQueueStatTotal = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: { action: 'getQueueStatTotal' },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const total = response.distribution_total || {}

                    let QueueStatTotal = [{
                            key: '1',
                            agent_login: total.agent_login,
                            agent_logoff: total.agent_logoff,
                            avg_talk: UCMGUI.formatSeconds(total.avg_talk),
                            avg_wait: UCMGUI.formatSeconds(total.avg_wait),
                            answered_rate: parseFloat(total.answered_rate).toFixed(2) + ' %',
                            abandoned_rate: parseFloat(total.abandoned_rate).toFixed(2) + ' %',
                            unanswered_rate: parseFloat(total.unanswered_rate).toFixed(2) + ' %',
                            transferred_rate: parseFloat(total.transferred_rate).toFixed(2) + ' %',
                            received_calls: total.received_calls,
                            answered_calls: total.answered_calls,
                            abandoned_calls: total.abandoned_calls,
                            unanswered_calls: total.unanswered_calls,
                            transferred_calls: total.transferred_calls
                        }]

                    this.setState({
                        QueueStatTotal: QueueStatTotal
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getVQStatTotal = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: { action: 'getVQStatTotal' },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const total = response.vq_distribution_total || {}

                    let VQStatTotal = [{
                            key: '1',
                            avg_talk: UCMGUI.formatSeconds(total.avg_talk),
                            avg_wait: UCMGUI.formatSeconds(total.avg_wait),
                            answered_rate: parseFloat(total.answered_rate).toFixed(2) + ' %',
                            unanswered_rate: parseFloat(total.unanswered_rate).toFixed(2) + ' %',
                            transferred_rate: parseFloat(total.transferred_rate).toFixed(2) + ' %',
                            total_calls: total.total_calls,
                            answered_calls: total.answered_calls,
                            transferred_calls: total.transferred_calls,
                            agent_unanswered_calls: total.agent_unanswered_calls,
                            usr_unanswered_calls: total.usr_unanswered_calls
                        }]

                    this.setState({
                        VQStatTotal: VQStatTotal
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleAgentChange = (targetKeys) => {
        const { form } = this.props

        let selectAgents = []

        if (_.indexOf(targetKeys, 'all') !== -1) {
            _.map(this.state.agentTreeData[0].children, (data) => {
                selectAgents.push(data.value)
            })
        } else {
            selectAgents = targetKeys
        }

        this.setState({
            selectAgents: selectAgents
        })

        // form.setFieldsValue({
        //     agent: selectAgents
        // })

        // form.validateFields(['agent'], { force: true })

        console.log('targetKeys: ', selectAgents)
    }
    _handleQueueChange = (targetKeys) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let selectQueues = []
        let agentTreeData = this.state.agentTreeData

        if (_.indexOf(targetKeys, 'all') !== -1) {
            _.map(this.state.queues, (data) => {
                selectQueues.push(data.value)
            })
        } else {
            selectQueues = targetKeys
        }

        if (selectQueues.length) {
            let obj = {}
            let agents = []
            let members = []
            let agentKeys = []
            let accounts = this.state.accounts
            let queueList = this.state.queueList
            let extgroupObj = this.state.extgroupObj
            let disabled = formatMessage({id: "LANG273"})
            let extgroupLabel = formatMessage({id: "LANG2714"})

            _.map(selectQueues, function(value) {
                let item = _.find(queueList, (data) => { return data.extension === value })

                if (item.members) {
                    members = item.members.split(',')

                    members.map(function(member) {
                        if (agentKeys.indexOf(member) === -1) {
                            obj = extgroupObj[member] || accounts[member] || {}

                            if (obj.out_of_service) {
                                agents.push({
                                    key: member,
                                    value: member,
                                    out_of_service: obj.out_of_service,
                                    label: (obj.extension +
                                            (obj.fullname ? ' "' + obj.fullname + '"' : '') +
                                            (obj.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                                })
                            } else {
                                agents.push({
                                    key: member,
                                    value: member,
                                    label: extgroupLabel + " -- " + obj.group_name
                                })
                            }

                            agentKeys.push(member)
                        }
                    })
                }
            })

            agentTreeData[0].children = agents
        } else {
            agentTreeData[0].children = []
        }

        this.setState({
                selectAgents: [],
                selectQueues: selectQueues,
                agentTreeData: agentTreeData
            }, () => {
                form.setFieldsValue({
                    agent: []
                })
            })

        // form.setFieldsValue({
        //     queue: selectQueues
        // })

        // form.validateFields(['queue'], { force: true })

        console.log('targetKeys: ', selectQueues)
    }
    _handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        // this.setState({ targetContactKeys: nextTargetKeys })
        console.log('sourceSelectedKeys: ', sourceSelectedKeys)
        console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/callQueue')
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG5360" }), 0)

                let selectQueues = []
                let selectAgents = []
                let endDate = this._parseDateToString(values.end_date._d)
                let startDate = this._parseDateToString(values.start_date._d)
                let period = (1 + this._daysBetween(
                            values.start_date._d,
                            values.end_date._d
                        ))

                if (_.indexOf(values.queue, 'all') !== -1) {
                    _.map(this.state.queues, (data) => {
                        selectQueues.push(data.value)
                    })
                } else {
                    selectQueues = values.queue
                }

                if (_.indexOf(values.agent, 'all') !== -1) {
                    _.map(this.state.agentTreeData[0].children, (data) => {
                        selectAgents.push(data.value)
                    })
                } else {
                    selectAgents = values.agent
                }

                this.setState({
                    period: period,
                    endDate: endDate,
                    startDate: startDate
                })

                let action = {
                    period: period,
                    end_date: endDate,
                    start_date: startDate,
                    queue: selectQueues.join(),
                    agent: selectAgents.join(),
                    action: 'updateQueueReport'
                }

                $.ajax({
                    data: action,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(formatMessage({ id: "LANG5361" }))

                            this._getStatisticDetails(this.state.checkboxValues)
                        }
                    }.bind(this)
                })
            }
        })
    }
    _listQueueStatDistributionByQueue = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listQueueStatDistributionByQueue',
                sidx: 'queue',
                sord: 'asc'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const QueueStatDistributionByQueue = response.distribution_by_queue || []

                    this.setState({
                        QueueStatDistributionByQueue: QueueStatDistributionByQueue
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listQueueStatDistributionByAgent = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listQueueStatDistributionByAgent',
                sidx: 'agent',
                sord: 'asc'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const QueueStatDistributionByAgent = response.distribution_by_agent || []

                    this.setState({
                        QueueStatDistributionByAgent: QueueStatDistributionByAgent
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listQueueStatDistributionByHour = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listQueueStatDistributionByHour'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const QueueStatDistributionByHour = response.distribution_by_hour || []

                    this.setState({
                        QueueStatDistributionByHour: QueueStatDistributionByHour
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listQueueStatDistributionByDay = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listQueueStatDistributionByDay'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const QueueStatDistributionByDay = response.distribution_by_day || []

                    this.setState({
                        QueueStatDistributionByDay: QueueStatDistributionByDay
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listQueueStatDistributionByDayOfWeek = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listQueueStatDistributionByDayOfWeek'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const QueueStatDistributionByDayOfWeek = response.distribution_by_day_of_week || []

                    this.setState({
                        QueueStatDistributionByDayOfWeek: QueueStatDistributionByDayOfWeek
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listQueueStatDistributionByWeek = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listQueueStatDistributionByWeek'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const QueueStatDistributionByWeek = response.distribution_by_week || []

                    this.setState({
                        QueueStatDistributionByWeek: QueueStatDistributionByWeek
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listQueueStatDistributionByMonth = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listQueueStatDistributionByMonth'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const QueueStatDistributionByMonth = response.distribution_by_month || []

                    this.setState({
                        QueueStatDistributionByMonth: QueueStatDistributionByMonth
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listVQStatDistributionByQueue = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listVQStatDistributionByQueue'
                // sidx: 'queue',
                // sord: 'asc'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const VQStatDistributionByQueue = response.vq_distribution_by_queue || []

                    this.setState({
                        VQStatDistributionByQueue: VQStatDistributionByQueue
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listVQStatDistributionByAgent = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listVQStatDistributionByAgent'
                // sidx: 'agent',
                // sord: 'asc'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const VQStatDistributionByAgent = response.vq_distribution_by_agent || []

                    this.setState({
                        VQStatDistributionByAgent: VQStatDistributionByAgent
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listVQStatDistributionByHour = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listVQStatDistributionByHour'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const VQStatDistributionByHour = response.vq_distribution_by_hour || []

                    this.setState({
                        VQStatDistributionByHour: VQStatDistributionByHour
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listVQStatDistributionByDay = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listVQStatDistributionByDay'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const VQStatDistributionByDay = response.vq_distribution_by_day || []

                    this.setState({
                        VQStatDistributionByDay: VQStatDistributionByDay
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listVQStatDistributionByDayOfWeek = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listVQStatDistributionByDayOfWeek'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const VQStatDistributionByDayOfWeek = response.vq_distribution_by_day_of_week || []

                    this.setState({
                        VQStatDistributionByDayOfWeek: VQStatDistributionByDayOfWeek
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listVQStatDistributionByWeek = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listVQStatDistributionByWeek'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const VQStatDistributionByWeek = response.vq_distribution_by_week || []

                    this.setState({
                        VQStatDistributionByWeek: VQStatDistributionByWeek
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listVQStatDistributionByMonth = () => {
        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listVQStatDistributionByMonth'
            },
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const VQStatDistributionByMonth = response.vq_distribution_by_month || []

                    this.setState({
                        VQStatDistributionByMonth: VQStatDistributionByMonth
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onCheckboxChange = (checkedValues) => {
        let lastCheckboxValues = this.state.checkboxValues
        let changedCheckbox = []

        _.map(checkedValues, (value) => {
            if (_.indexOf(lastCheckboxValues, value) === -1) {
                changedCheckbox.push(value)
            }
        })

        this.setState({
                checkboxValues: checkedValues
            })

        this._getStatisticDetails(changedCheckbox)
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    _parseStringToDate = (str) => {
        const ymd = str.split('-')

        return new Date(ymd[0], ymd[1] - 1, ymd[2])
    }
    _parseDateToString = (date) => {
        return (date.getFullYear() + '-' + AddZero(date.getMonth() + 1) + '-' + AddZero(date.getDate()))
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
                labelCol: { span: 6 },
                wrapperCol: { span: 12 }
            }

        const formItemLayoutTransfer = {
                labelCol: { span: 6 },
                wrapperCol: { span: 18 }
            }

        const checkboxOptions = [
                { label: formatMessage({id: 'LANG5352'}), value: 'getQueueReport' },
                { label: formatMessage({id: 'LANG5353'}), value: 'getQueueStatTotal', disabled: false },
                { label: formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG5355"})}), value: 'listQueueStatDistributionByQueue', disabled: false },
                { label: formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG5356"})}), value: 'listQueueStatDistributionByAgent', disabled: false },
                { label: formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG201"})}), value: 'listQueueStatDistributionByHour', disabled: false },
                { label: formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG200"})}), value: 'listQueueStatDistributionByDay', disabled: false },
                { label: formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG5358"})}), value: 'listQueueStatDistributionByDayOfWeek', disabled: false },
                { label: formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG199"})}), value: 'listQueueStatDistributionByWeek', disabled: false },
                { label: formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG198"})}), value: 'listQueueStatDistributionByMonth', disabled: false },
                { label: formatMessage({id: 'LANG5412'}), value: 'getVQStatTotal', disabled: false },
                { label: formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG5355"})}), value: 'listVQStatDistributionByQueue', disabled: false },
                { label: formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG5356"})}), value: 'listVQStatDistributionByAgent', disabled: false },
                { label: formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG201"})}), value: 'listVQStatDistributionByHour', disabled: false },
                { label: formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG200"})}), value: 'listVQStatDistributionByDay', disabled: false },
                { label: formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG5358"})}), value: 'listVQStatDistributionByDayOfWeek', disabled: false },
                { label: formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG199"})}), value: 'listVQStatDistributionByWeek', disabled: false },
                { label: formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG198"})}), value: 'listVQStatDistributionByMonth', disabled: false }
            ]

        let agentProps = {
                multiple: true,
                treeCheckable: true,
                treeDefaultExpandAll: true,
                treeNodeFilterProp: 'label',
                showCheckedStrategy: SHOW_PARENT,
                treeData: this.state.agentTreeData,
                onChange: this._handleAgentChange,
                searchPlaceholder: formatMessage({id: "LANG5636"})
            }

        let queueProps = {
                multiple: true,
                treeCheckable: true,
                treeDefaultExpandAll: true,
                treeNodeFilterProp: 'label',
                showCheckedStrategy: SHOW_PARENT,
                treeData: this.state.queueTreeData,
                onChange: this._handleQueueChange
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG5359"})
                })

        return (
            <div className="app-content-main app-content-queue-stat">
                <Title
                    isDisplay='display-block'
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit }
                    headerTitle={ formatMessage({id: "LANG5359"}) }
                />
                <Form>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ formatMessage({id: "LANG1048"}) }>
                                            <span>{ formatMessage({id: "LANG1048"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('start_date', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        type: 'object',
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: this._checkTimeFormat
                                    }, {
                                        validator: (data, value, callback) => {
                                            const thisLabel = formatMessage({id: "LANG1048"})
                                            const otherInputValue = form.getFieldValue('end_date')
                                            const otherInputLabel = formatMessage({id: "LANG1049"})

                                            Validator.smallerTime(data, value, callback,
                                                    formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                        }
                                    }],
                                    initialValue: moment(this.state.startDate, DateFormat)
                                })(
                                    <DatePicker
                                        allowClear={ false }
                                        format={ DateFormat }
                                        style={{ 'width': '100%' }}
                                        placeholder={ formatMessage({id: "LANG5373"}) }
                                    />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ formatMessage({id: "LANG1049"}) }>
                                            <span>{ formatMessage({id: "LANG1049"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('end_date', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        type: 'object',
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: this._checkTimeFormat
                                    }, {
                                        validator: (data, value, callback) => {
                                            const thisLabel = formatMessage({id: "LANG1049"})
                                            const otherInputValue = form.getFieldValue('start_date')
                                            const otherInputLabel = formatMessage({id: "LANG1048"})

                                            Validator.biggerTime(data, value, callback,
                                                    formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                        }
                                    }],
                                    initialValue: moment(this.state.endDate, DateFormat)
                                })(
                                    <DatePicker
                                        allowClear={ false }
                                        format={ DateFormat }
                                        style={{ 'width': '100%' }}
                                        placeholder={ formatMessage({id: "LANG5373"}) }
                                    />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ formatMessage({id: "LANG91"}) }>
                                            <span>{ formatMessage({id: "LANG91"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('queue', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        type: 'array',
                                        required: true,
                                        message: formatMessage({id: "LANG4762"}, {0: formatMessage({id: "LANG2377"}).toLowerCase()})
                                    }],
                                    initialValue: this.state.selectQueues
                                })(
                                    <TreeSelect { ...queueProps } />
                                ) }
                                {/* <Transfer
                                    showSearch
                                    render={ item => item.title }
                                    dataSource={ this.state.queues }
                                    onChange={ this._handleQueueChange }
                                    targetKeys={ this.state.selectQueues }
                                    filterOption={ this._filterTransferOption }
                                    notFoundContent={ formatMessage({id: "LANG133"}) }
                                    onSelectChange={ this._handleTransferSelectChange }
                                    searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                    titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                /> */}
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ formatMessage({id: "LANG143"}) }>
                                            <span>{ formatMessage({id: "LANG143"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('agent', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        type: 'array',
                                        required: true,
                                        message: formatMessage({id: "LANG4762"}, {0: formatMessage({id: "LANG143"}).toLowerCase()})
                                    }],
                                    initialValue: this.state.selectAgents
                                })(
                                    this.state.agentTreeData[0].children.length
                                        ? <TreeSelect
                                                multiple={ true }
                                                treeCheckable={ true }
                                                treeDefaultExpandAll={ true }
                                                treeNodeFilterProp={ 'label' }
                                                showCheckedStrategy={ SHOW_PARENT }
                                                onChange={ this._handleAgentChange }
                                                searchPlaceholder={ formatMessage({id: "LANG5636"}) }
                                            >
                                                <TreeNode value="all" title={ formatMessage({id: "LANG104"}) } key="all">
                                                    {
                                                        _.map(this.state.agentTreeData[0].children, (data) => {
                                                            return <TreeNode
                                                                        key={ data.key }
                                                                        value={ data.value }
                                                                        title={ data.label }
                                                                    />
                                                        })
                                                    }
                                                </TreeNode>
                                            </TreeSelect>
                                        : <TreeSelect
                                                multiple={ true }
                                                treeCheckable={ true }
                                                treeDefaultExpandAll={ true }
                                                treeNodeFilterProp={ 'label' }
                                                showCheckedStrategy={ SHOW_PARENT }
                                                onChange={ this._handleAgentChange }
                                                searchPlaceholder={ formatMessage({id: "LANG5636"}) }
                                            />
                                ) }
                                {/* <Transfer
                                    showSearch
                                    render={ item => item.title }
                                    dataSource={ this.state.agents }
                                    onChange={ this._handleAgentChange }
                                    targetKeys={ this.state.selectAgents }
                                    filterOption={ this._filterTransferOption }
                                    notFoundContent={ formatMessage({id: "LANG133"}) }
                                    onSelectChange={ this._handleTransferSelectChange }
                                    searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                    titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                /> */}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
                <div className="content">
                    <Card title={ formatMessage({id: "LANG5374"}) } className="ant-card-custom">
                        <CheckboxGroup disabled options={ checkboxOptions } value={ this.state.checkboxValues } onChange={ this._onCheckboxChange } />
                        <Report
                            CheckedValues= { this.state.checkboxValues }
                            QueueReport= { this.state.QueueReport }
                            ExtensionGroup= { this.state.extgroupObj }
                            QueueStatTotal= { this.state.QueueStatTotal }
                            VQStatTotal= { this.state.VQStatTotal }
                            QueueStatDistributionByQueue= { this.state.QueueStatDistributionByQueue }
                            QueueStatDistributionByAgent= { this.state.QueueStatDistributionByAgent }
                            QueueStatDistributionByHour= { this.state.QueueStatDistributionByHour }
                            QueueStatDistributionByDay= { this.state.QueueStatDistributionByDay }
                            QueueStatDistributionByWeek= { this.state.QueueStatDistributionByWeek }
                            QueueStatDistributionByMonth= { this.state.QueueStatDistributionByMonth }
                            QueueStatDistributionByDayOfWeek= { this.state.QueueStatDistributionByDayOfWeek }
                            VQStatDistributionByQueue= { this.state.VQStatDistributionByQueue }
                            VQStatDistributionByAgent= { this.state.VQStatDistributionByAgent }
                            VQStatDistributionByHour= { this.state.VQStatDistributionByHour }
                            VQStatDistributionByDay= { this.state.VQStatDistributionByDay }
                            VQStatDistributionByWeek= { this.state.VQStatDistributionByWeek }
                            VQStatDistributionByMonth= { this.state.VQStatDistributionByMonth }
                            VQStatDistributionByDayOfWeek= { this.state.VQStatDistributionByDayOfWeek }
                        />
                    </Card>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(Statistics))
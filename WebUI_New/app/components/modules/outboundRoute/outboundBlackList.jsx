'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Badge, Button, Col, Form, Input, Icon, message, Popconfirm, Popover, Row, Table, Tag, Tooltip, Tree } from 'antd'

const FormItem = Form.Item
const TreeNode = Tree.TreeNode

class OutboundBlackList extends Component {
    constructor(props) {
        super(props)

        this.state = {
            blacklist: [],
            countryCodes: [],
            customBlacklist: [],
            maxCustomBlacklist: 500,
            rightTreeCheckedKeys: [],
            leftTreeSelectedKeys: ['North America'],
            rightTreeExpandedKeys: ['North America'],
            maxOutboundBlacklist: 500
        }
    }
    componentDidMount() {
        this._getInitData()
        this._getCountryCodes()
    }
    _addBlackList = (e) => {
        // e.preventDefault()

        let action = {}
        let form = this.props.form
        let { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG826" }) }}></span>
        let successMessage = <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG4764" }) }}></span>

        if (this.state.customBlacklist.length >= this.state.maxOutboundBlacklist) {
            message.warning(<span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG5416" }, {
                                                0: this.state.maxOutboundBlacklist,
                                                1: this.state.customBlacklist.length
                                            })
                                        }}
                                    ></span>)

            return false
        }

        form.validateFields({ force: true }, (err, values) => {
            if (!err) {
                let action = {
                        blacklist: values.new_number,
                        action: 'addOutboundBlacklist'
                    }

                message.loading(loadingMessage, 0)

                $.ajax({
                    data: action,
                    type: 'json',
                    method: "post",
                    url: api.apiHost,
                    error: function(e) {
                        message.destroy()
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            form.setFieldsValue({
                                new_number: ''
                            })

                            this._getInitData()
                        }
                    }.bind(this)
                })
            }
        })
    }
    _checkExist = (rule, value, callback) => {
        let exist
        let val = $.trim(value)
        const { formatMessage } = this.props.intl

        exist = _.find(this.state.customBlacklist, function(data) {
            return data.blacklist === val
        })

        if (val && exist) {
            callback(formatMessage({id: "LANG5342"}))
        } else {
            callback()
        }
    }
    _checkFormat = (rule, value, callback) => {
        let val = $.trim(value)
        const { formatMessage } = this.props.intl

        if (val && /[^a-zA-Z0-9\#\*\.!\-\+\/]/.test(val)) {
            callback(formatMessage({id: "LANG5343"}))
        } else {
            callback()
        }
    }
    _checkPattern = (rule, value, callback) => {
        let val = $.trim(value)
        const { formatMessage } = this.props.intl

        if (!val || (val && (/^[0-9a-zA-Z!\-\.\?\+\*\#]+[0-9]+$/.test(val) || !/\//.test(val)))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2994"}))
        }
    }
    _deleteBlackList = (record) => {
        let action = {}
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG819" })}}></span>

        message.loading(loadingMessage)

        action = {
            'blacklist': record.country_code,
            'action': 'deleteOutboundBlacklist'
        }

        if (record.country !== 'Custom') {
            action = {
                'action': 'updateCountryCodes',
                'country_codes': JSON.stringify([{
                    disable_code: 'no',
                    country: record.country
                }])
            }
        }

        $.ajax({
            data: action,
            type: 'json',
            method: 'post',
            url: api.apiHost,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getInitData()
                    this._getCountryCodes()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _filterCheckedKeys = (country, list) => {
        let checkedKeys = []

        list.map(function(data, index) {
            if (data.disable_code === 'yes') {
                checkedKeys.push(data.country)
            }
        })

        if (checkedKeys.length === list.length) {
            checkedKeys.push(country)
        }

        return checkedKeys
    }
    _getCountryCodes = () => {
        let countryCodes = []
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const leftTreeSelectedKey = this.state.leftTreeSelectedKeys[0]

        $.ajax({
            type: 'json',
            method: 'post',
            url: api.apiHost,
            data: {
                action: 'getCountryCodes'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    countryCodes = response.country_codes || {}

                    this.setState({
                        countryCodes: countryCodes,
                        rightTreeCheckedKeys: this._filterCheckedKeys(leftTreeSelectedKey, countryCodes[leftTreeSelectedKey])
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getCustomBlacklist = () => {
        let customBlacklist = []
        const form = this.props.form
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'json',
            method: 'post',
            url: api.apiHost,
            data: {
                action: 'getOutboundBlacklist'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    customBlacklist = response.outbound_blacklist || []

                    this.setState({
                        customBlacklist: customBlacklist
                    })

                    let newNumber = form.getFieldValue('new_number')

                    if (newNumber) {
                        form.validateFields(['new_number'], { force: true })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getInitData = () => {
        this._getCustomBlacklist()
        this._getOutboundBlacklist()
    }
    _getOutboundBlacklist = () => {
        let blacklist = []
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'json',
            method: 'post',
            url: api.apiHost,
            data: {
                action: 'listOutboundBlacklist',
                sidx: 'Continent',
                sord: 'asc'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    blacklist = response.country_code || []

                    blacklist = _.map(blacklist, function(data, index) {
                        data.key = index

                        return data
                    })

                    this.setState({
                        blacklist: blacklist
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        browserHistory.push('/extension-trunk/outboundRoute')
    }
    _onCheck = (info) => {
        console.log('onCheck', info)
    }
    _onCheckRightTree = (info) => {
        let action = {}
        let countryCodes = []
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const leftTreeSelectedKey = this.state.leftTreeSelectedKeys[0]

        loadingMessage = <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG826" }) }}></span>
        successMessage = <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG844" }) }}></span>

        message.loading(loadingMessage)

        _.map(this.state.countryCodes[leftTreeSelectedKey], (data, key) => {
            let obj = {
                    country: data.country
                }
            
            if (info.indexOf(data.country) > -1) {
                obj.disable_code = 'yes'
            } else {
                obj.disable_code = 'no'
            }

            countryCodes.push(obj)
        })

        action = {
            'action': 'updateCountryCodes',
            'country_codes': JSON.stringify(countryCodes)
        }

        $.ajax({
            data: action,
            type: 'json',
            method: 'post',
            url: api.apiHost,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this.setState({
                        rightTreeCheckedKeys: info
                    })

                    this._getInitData()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onExpandRightTree = (expandedKeys) => {
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.setState({
            rightTreeExpandedKeys: expandedKeys
        })
    }
    _onSelectLeftTree = (info) => {
        let dataSource = {}
        let country = info.length ? info[0] : ''

        dataSource[country] = this.state.countryCodes[country]

        this.setState({
            leftTreeSelectedKeys: [country],
            rightTreeExpandedKeys: [country],
            rightTreeCheckedKeys: this._filterCheckedKeys(country, dataSource[country])
        })
    }
    _renderCodes = (text, record, index) => {
        const codes = text ? text.split(',') : []

        if (codes.length <= 5) {
            return <span>
                    {
                        codes.map(function(code, index) {
                            return <Tag key={ code }>{ code }</Tag>
                        }.bind(this))
                    }
                </span>
        } else {
            const content = <span>
                        {
                            codes.map(function(code, index) {
                                if (index >= 4) {
                                    return <Tag key={ code }>{ code }</Tag>
                                }
                            }.bind(this))
                        }
                    </span>

            return <span>
                    {
                        [0, 1, 2, 3].map(function(value, index) {
                            const code = codes[value]

                            return <Tag key={ code }>{ code }</Tag>
                        }.bind(this))
                    }
                    <Popover
                        title=""
                        content={ content }
                    >
                        <Badge
                            overflowCount={ 10 }
                            count={ codes.length - 4 }
                        />
                    </Popover>
                </span>
        }
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const leftTreeSelectedKey = this.state.leftTreeSelectedKeys[0]
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemSpecialLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }

        const formItemRowLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        }

        const columns = [{
                width: 100,
                key: 'Continent',
                dataIndex: 'Continent',
                title: formatMessage({id: "LANG5340"}),
                sorter: (a, b) => a.Continent.length - b.Continent.length
            }, {
                width: 100,
                key: 'country',
                dataIndex: 'country',
                title: formatMessage({id: "LANG5341"}),
                sorter: (a, b) => a.country.length - b.country.length
            }, {
                width: 150,
                key: 'country_code',
                dataIndex: 'country_code',
                title: formatMessage({id: "LANG5339"}),
                render: (text, record, index) => {
                    return this._renderCodes(text, record, index)
                }
            }, {
                width: 50,
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._deleteBlackList.bind(this, record) }
                            >
                                <span className="sprite sprite-del"></span>
                            </Popconfirm>
                        </div>
                }
            }]

        const pagination = {
                showSizeChanger: true,
                total: this.state.blacklist.length,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                },
                showTotal: (total) => {
                    return formatMessage({ id: "LANG115" }) + total
                }
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG5336"})
                })

        return (
            <div className="app-content-main">
                <Title
                    isDisplay='display-block'
                    isDisplaySubmit="hidden"
                    onCancel={ this._handleCancel }
                    headerTitle={ formatMessage({id: "LANG5336"}) }
                />
                <div className="content">
                    <Form>
                        <div className="function-description">
                            <span>{ formatMessage({id: "LANG5390"}) }</span>
                        </div>
                        <FormItem
                            { ...formItemRowLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4747" /> }>
                                        <span>{ formatMessage({id: "LANG4746"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <div className="tree-container clearfix">
                                <Tree
                                    showLine
                                    onCheck={ this._onCheck }
                                    onSelect={ this._onSelectLeftTree }
                                    className="custom-tree rightBorder"
                                    selectedKeys={ this.state.leftTreeSelectedKeys }
                                >
                                    {
                                        _.map(this.state.countryCodes, (data, key) => {
                                            return <TreeNode title={ key } key={ key }></TreeNode>
                                        })
                                    }
                                </Tree>
                                <Tree
                                    showLine
                                    checkable
                                    autoExpandParent={ false }
                                    className="custom-tree autoFlow"
                                    onCheck={ this._onCheckRightTree }
                                    onExpand={ this._onExpandRightTree }
                                    checkedKeys={ this.state.rightTreeCheckedKeys }
                                    expandedKeys={ this.state.rightTreeExpandedKeys }
                                >
                                    <TreeNode
                                        key={ leftTreeSelectedKey }
                                        title={ leftTreeSelectedKey }
                                    >
                                        {
                                            _.map(this.state.countryCodes[leftTreeSelectedKey], (data, key) => {
                                                let code = this._renderCodes(data.country_code)

                                                return <TreeNode
                                                            key={ data.country }
                                                            title={
                                                                    <span>
                                                                        <span>{ data.country + ' ' }</span>
                                                                        { code }
                                                                    </span>
                                                                }
                                                        ></TreeNode>
                                            })
                                        }
                                    </TreeNode>
                                </Tree>
                            </div>
                        </FormItem>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG2277"}) }</span>
                        </div>
                        <Row className="row-section-content">
                            <Row>
                                <Col span={ 12 }>
                                    <FormItem
                                        { ...formItemSpecialLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG5344" /> }>
                                                    <span>{ formatMessage({id: "LANG5338"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('new_number', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.maxlength(data, value, callback, formatMessage, 20)
                                                }
                                            }, {
                                                validator: this._checkFormat
                                            }, {
                                                validator: this._checkPattern
                                            }, {
                                                validator: this._checkExist
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 12 }>
                                    <FormItem>
                                        <Button
                                            icon="plus"
                                            type="primary"
                                            shape="circle"
                                            onClick={ this._addBlackList }
                                            style={{ 'margin-left': '10px' }}
                                        />
                                    </FormItem>
                                </Col>
                            </Row>
                            <FormItem
                                { ...formItemRowLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5345" /> }>
                                            <span>{ formatMessage({id: "LANG2280"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                <Table
                                    rowKey="key"
                                    columns={ columns }
                                    pagination={ pagination }
                                    dataSource={ this.state.blacklist }
                                />
                            </FormItem>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(OutboundBlackList))
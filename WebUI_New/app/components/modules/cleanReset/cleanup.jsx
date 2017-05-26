'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Modal, Tooltip, Select, Table, Popconfirm, Tree } from 'antd'

const FormItem = Form.Item
const confirm = Modal.confirm
const TreeNode = Tree.TreeNode

class Cleanup extends Component {
    constructor(props) {
        super(props)

        this.state = {
            current: 1,
            treeData: [],
            fileList: [],
            pageSize: 10,
            loading: false,
            selectedRows: [],
            deviceNameList: [],
            currentFilePath: '',
            selectedRowKeys: [],
            selectedTreeKeys: [],
            defaultExpandedKeys: []
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this._getMediaFile()
    }
    componentWillUnmount() {
    }
    _batchDelete = () => {
        let selectList = []
        let modalContent = ''
        let loadingMessage = ''
        let successMessage = ''
        let startWithPBX = false
        let selectedRowKeys = this.state.selectedRowKeys
        let currentFilePath = this.state.currentFilePath

        const { formatMessage } = this.props.intl

        modalContent = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG3512"})}}></span>
        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG871"})}}></span>

        _.map(selectedRowKeys, (fileName, index) => {
            selectList.push(currentFilePath + '/' + fileName)

            if (fileName.indexOf('PBX_') === 0) {
                startWithPBX = true
            }
        })

        if (startWithPBX) {
            message.warning(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG5183" })}}></span>)

            return false
        }

        confirm({
            content: modalContent,
            onOk: () => {
                message.loading(loadingMessage)

                $.ajax({
                    async: true,
                    type: 'json',
                    method: 'post',
                    url: api.apiHost,
                    data: {
                        'action': 'removeFile',
                        'type': 'clean_usb_sd_file',
                        'data': selectList.join('\t')
                    },
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            this._reloadTableList(selectList.length)

                            this.setState({
                                selectedRows: [],
                                selectedRowKeys: []
                            })
                        }
                    }.bind(this),
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            },
            onCancel() {}
        })
    }
    _checkFile = (action) => {
        let result = false
        const { formatMessage } = this.props.intl

        if (action || !$.isEmptyObject(action)) {
            $.ajax({
                type: 'post',
                async: false,
                data: action,
                url: api.apiHost,
                error: function(e) {
                    message.destroy()
                    message.error(e.statusText)
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        result = true
                    }
                }.bind(this)
            })
        }

        if (!result) {
            message.destroy()
            message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3868" })}}></span>)
        }

        return result
    }
    _delete = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        message.loading(loadingMessage)

        let currentFilePath = this.state.currentFilePath
        
        let action = {
                action: 'removeFile',
                type: 'clean_usb_sd_file',
                data: currentFilePath + '/' + record.n
            },
            checkAction = {
                action: 'checkFile',
                type: 'clean_usb_sd_file',
                data: currentFilePath + '/' + record.n
            }

        if (this._checkFile(checkAction)) {
            $.ajax({
                async: true,
                type: 'json',
                method: 'post',
                url: api.apiHost,
                data: action,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        message.destroy()
                        message.success(successMessage)

                        this._reloadTableList(1)
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
    }
    _getMediaFile = () => {
        let treeData = []
        let fileList = []
        let directoryList = []
        let deviceNameList = []
        let currentFilePath = ''
        let defaultShowNode = []
        const { formatMessage } = this.props.intl

        this.setState({
            loading: true
        })

        $.ajax({
            type: 'json',
            async: false,
            method: 'post',
            url: api.apiHost,
            data: {
                page: 1,
                sidx: 'd',
                sord: 'desc',
                type: 'media',
                item_num: 20000,
                action: 'listFile'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let obj = {}
                    let SDName = 0
                    let USBDiskName = 0
                    let media = res.response.media || []

                    media = _.sortBy(media, (data) => {
                        return data.n.length
                    })

                    _.map(media, (data, index) => {
                        let name = data.n

                        if (name.indexOf('mmcblk') !== -1) {
                            SDName++
                            deviceNameList.push(name)

                            treeData.push({
                                key: name,
                                name: formatMessage({id: "LANG262"}) + ' -- ' + name
                            })
                        } else if (name.indexOf('sd') !== -1) {
                            USBDiskName++
                            deviceNameList.push(name)

                            treeData.push({
                                key: name,
                                name: formatMessage({id: "LANG263"}) + ' -- ' + name
                            })
                        }
                    })

                    if (deviceNameList.length) {
                        // Get All Directory
                        let responseData = this._getFileList(deviceNameList[0])

                        if (responseData.fileList.length) {
                            fileList = responseData.fileList
                        }

                        if (responseData.directoryList.length) {
                            treeData[0].children = responseData.directoryList
                        }

                        if (!SDName) {
                            treeData.push({
                                key: 'nosd',
                                isLeaf: true,
                                name: formatMessage({id: "LANG998"})
                            })
                        } else if (!USBDiskName) {
                            treeData.push({
                                key: 'nousb',
                                isLeaf: true,
                                name: formatMessage({id: "LANG1000"})
                            })
                        }

                        currentFilePath = deviceNameList[0]
                        defaultShowNode = [deviceNameList[0]]
                    } else {
                        treeData = [{
                            key: 'nosd',
                            isLeaf: true,
                            name: formatMessage({id: "LANG998"})
                        }, {
                            key: 'nousb',
                            isLeaf: true,
                            name: formatMessage({id: "LANG1000"})
                        }]

                        fileList = []

                        defaultShowNode = []
                    }

                    this.setState({
                        loading: false,
                        treeData: treeData,
                        fileList: fileList,
                        deviceNameList: deviceNameList,
                        currentFilePath: currentFilePath,
                        selectedTreeKeys: defaultShowNode,
                        defaultExpandedKeys: defaultShowNode
                    })

                    console.log(currentFilePath)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getFileList = (path) => {
        let fileList = []
        let directoryList = []
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'json',
            async: false,
            method: 'post',
            url: api.apiHost,
            data: {
                sidx: 'd',
                data: path,
                sord: 'desc',
                type: 'media',
                action: 'listFile',
                filter: JSON.stringify({
                    'list_dir': 1,
                    'list_file': 1
                })
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    fileList = response.media || []

                    _.map(fileList, (data, index) => {
                        if (data.t === 'directory') {
                            directoryList.push({
                                name: data.n,
                                key: path + '/' + data.n
                            })
                        }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        return {
                fileList: fileList,
                directoryList: directoryList
            }
    }
    _generateTreeNodes = (treeNode) => {
        const arr = []
        const key = treeNode.props.eventKey
        const children = this._getFileList(key)

        for (let i = 0; i < 3; i++) {
            arr.push({ name: `leaf ${key}-${i}`, key: `${key}-${i}` })
        }

        return arr
    }
    _getNewTreeData = (treeData, curKey, child, level) => {
        const loop = (data) => {
            // if (level < 1 || curKey.length - 3 > level * 2) return

            data.forEach((item) => {
                if (curKey.indexOf(item.key) === 0) {
                    if (item.children) {
                        loop(item.children)
                    } else {
                        item.children = child
                    }
                }
            })
        }

        loop(treeData)

        // this._setLeaf(treeData, curKey, level)
    }
    _onSelect = (selectedKeys) => {
        console.log('selected', selectedKeys)

        if (selectedKeys.length) {
            let path = selectedKeys[0]

            if (path === 'nosd' || path === 'nousb') {
                this.setState({
                    currentFilePath: path,
                    selectedTreeKeys: selectedKeys
                })

                return
            }

            this.setState({
                loading: true,
                currentFilePath: path,
                selectedTreeKeys: selectedKeys
            })

            setTimeout(() => {
                let list = this._getFileList(path).fileList

                this.setState({
                    current: 1,
                    loading: false,
                    fileList: list,
                    selectedRows: [],
                    selectedRowKeys: []
                })
            }, 300)
        } else {
            this.setState({
                selectedTreeKeys: selectedKeys
            })
        }
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRows changed: ', selectedRows)
        console.log('selectedRowKeys changed: ', selectedRowKeys)

        this.setState({
            selectedRows: selectedRows,
            selectedRowKeys: selectedRowKeys
        })
    }
    _onLoadData = (treeNode) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let treeData = [...this.state.treeData]
                let children = this._getFileList(treeNode.props.eventKey).directoryList

                this._getNewTreeData(treeData, treeNode.props.eventKey, children, 2)

                this.setState({ treeData })

                resolve()
            }, 300)
        })
    }
    _reloadTableList = (selectedRowLenth) => {
        let total = this.state.fileList.length,
            current = this.state.current,
            pageSize = this.state.pageSize

        pageSize = pageSize ? pageSize : this.state.pagination.defaultPageSize

        let page = current,
            surplus = total % pageSize,
            totalPage = Math.ceil(total / pageSize),
            lastPageNumber = surplus === 0 ? pageSize : surplus

        if ((totalPage === current) && (totalPage > 1) && (lastPageNumber === selectedRowLenth)) {
            page = current - 1
        }

        let list = this._getFileList(this.state.currentFilePath).fileList

        this.setState({
            current: page,
            fileList: list
        })
    }
    _setLeaf = (treeData, curKey, level) => {
        const loopLeaf = (data, lev) => {
            const l = lev - 1

            data.forEach((item) => {
                if ((item.key.length > curKey.length) ? item.key.indexOf(curKey) !== 0 : curKey.indexOf(item.key) !== 0) {
                    return
                }

                if (item.children) {
                    loopLeaf(item.children, l)
                } else if (l < 1) {
                    item.isLeaf = true
                }
            })
        }

        loopLeaf(treeData, level + 1)
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    render() {
        const { formatMessage } = this.props.intl

        const loop = data => data.map((item) => {
            if (item.children) {
                return <TreeNode
                            key={ item.key }
                            title={ item.name }
                        >
                            { loop(item.children) }
                        </TreeNode>
            }

            return <TreeNode
                        key={ item.key }
                        title={ item.name }
                        isLeaf={ item.isLeaf }
                        disabled={ item.key === '0-0-0' }
                    />
        })

        const treeNodes = loop(this.state.treeData)

        const columns = [{
                key: 'n',
                dataIndex: 'n',
                title: formatMessage({id: "LANG135"}),
                sorter: (a, b) => a.n.length - b.n.length
            }, {
                key: 't',
                dataIndex: 't',
                title: formatMessage({id: "LANG1950"}),
                sorter: (a, b) => a.t.length - b.t.length,
                render: (text, record, index) => {
                    let type

                    if (text === 'directory') {
                        type = <span>{ formatMessage({id: 'LANG5146'}) }</span>
                    } else if (text === 'file') {
                        type = <span>{ formatMessage({id: 'LANG3652'}) }</span>
                    } else {
                        type = <span>{ formatMessage({id: 'LANG2403'}) }</span>
                    }

                    return type
                }
            }, {
                key: 'd',
                dataIndex: 'd',
                title: formatMessage({id: "LANG203"}),
                sorter: (a, b) => a.d.length - b.d.length
            }, {
                key: 's',
                dataIndex: 's',
                title: formatMessage({id: "LANG2257"}),
                sorter: (a, b) => a.s - b.s,
                render: (text, record, index) => {
                    return UCMGUI.tranSize(text)
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    let del
                    let filename = record.n

                    if (filename && filename.indexOf('PBX_') === 0) {
                        del = <span
                                    className="sprite sprite-del-disabled"
                                ></span>
                    } else {
                        del = <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._delete.bind(this, record) }
                            >
                                <span className="sprite sprite-del"></span>
                            </Popconfirm>
                    }

                    return del
                }
            }]

        const pagination = {
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: this._showTotal,
                current: this.state.current,
                pageSize: this.state.pageSize,
                total: this.state.fileList.length,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)

                    this.setState({
                        current: current,
                        pageSize: pageSize
                    })
                },
                onChange: (current) => {
                    console.log('Current: ', current)

                    this.setState({
                        current: current
                    })
                }
            }

        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        return (
            <div className="app-content-main" id="app-content-main">
                <Form>
                    <Row>
                        <Col span={ 6 }>
                            <div
                                style={{
                                    'clear': 'both',
                                    'height': '514px',
                                    'overflow': 'auto',
                                    'marginRight': '10px',
                                    'border': '1px solid #b8bdcc'
                                }}
                            >
                                <Tree
                                    onSelect={ this._onSelect }
                                    loadData={ this._onLoadData }
                                    selectedKeys={ this.state.selectedTreeKeys }
                                    defaultExpandedKeys={ this.state.defaultExpandedKeys }
                                >
                                    { treeNodes }
                                </Tree>
                            </div>
                        </Col>
                        <Col span={ 18 }>
                            <div className="top-button">
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    onClick={ this._batchDelete }
                                    disabled={ !this.state.selectedRowKeys.length }
                                >
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </div>
                            <Table
                                rowKey="n"
                                columns={ columns }
                                pagination={ pagination }
                                rowSelection={ rowSelection }
                                loading={ this.state.loading }
                                dataSource={ this.state.fileList }
                            />
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

Cleanup.propTypes = {
}

export default Form.create()(injectIntl(Cleanup))
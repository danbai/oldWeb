'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import React, { Component, PropTypes } from 'react'
import { injectIntl, formatMessage } from 'react-intl'

let UE = window.UE

class Editor extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }
    componentDidMount() {
        let ue = UE.getEditor(this.props.id, {
            // ueditor.config.js
            toolbars: [[
                'undo', 'redo', '|',
                'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
                'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                'paragraph', 'fontfamily', 'fontsize', '|',
                'indent', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
                'link', 'unlink'
            ]],
            insertorderedlist: {
                'num': '1,2,3...',
                'num1': '1),2),3)...',
                'num2': '(1),(2),(3)...',
                'decimal': '', // '1,2,3...'
                'lower-alpha': '', // 'a,b,c...'
                'lower-roman': '', // 'i,ii,iii...'
                'upper-alpha': '', // 'A,B,C'
                'upper-roman': '' // 'I,II,III...'
            },
            wordCount: false,
            enableAutoSave: false,
            allowDivTransToP: false,
            autoHeightEnabled: false,
            enableContextMenu: false,
            elementPathEnabled: false,
            disabledTableInTable: false
        })

        ue.ready(() => {
            ue.setContent(this.props.value)
        })
    }
    componentWillMount() {
    }
    render() {
        return (
            <script id={ this.props.id } name="content" type="text/plain"></script>
        )
    }
}

export default injectIntl(Editor)
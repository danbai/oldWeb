'use strict'

import { Affix, Button, icon } from 'antd'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'

class Title extends Component {
    _triggerCancel = () => {
        this.props.onCancel()
    }
    _triggerSave = () => {
        this.props.onSubmit()
    }
    _triggerSearch =(e) => {
        this.props.onSearch()
    }
    static defaultProps = {
        saveTxt: 'Save',
        cancelTxt: 'Cancel'
    }
    render() {
        const {formatMessage} = this.props.intl

        return (
            <div className="app-content-title clearfix">
                <span className="content-name">{ this.props.headerTitle }</span>
                <div className={ "content-operation " + this.props.isDisplay }>
                    <Button type="primary" onClick={ this._triggerSave } className={ "save " + this.props.isDisplaySubmit }>
                        { this.props.saveTxt }
                    </Button>
                    <Button type="ghost" onClick={ this._triggerCancel } className={ "cancel " + this.props.isDisplayCancel }>
                        { this.props.cancelTxt }
                    </Button>
                    <Button type="primary" onClick={ this._triggerSearch } className={ "filter " + this.props.isDisplayFilter } icon="filter">
                        { formatMessage({id: "LANG1288" }) }
                    </Button>
                </div>
            </div>
        )
    }
}

export default injectIntl(Title)

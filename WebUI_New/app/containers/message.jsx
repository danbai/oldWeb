import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as CounterActions from '../actions/message'

const Msg = ({msg}) => (
  <p>
    ws: {msg}
  </p>
)

Msg.propTypes = {
  // msg: PropTypes.string.isRequired
}

const mapStateToProps = (state) => ({
  msg: state.msg
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(CounterActions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Msg)
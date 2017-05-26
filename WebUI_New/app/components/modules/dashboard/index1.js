import React from 'react'
import AsyncElement from '../common/AsyncElement'

var Dashboard = React.createClass({
  mixins: [ AsyncElement ],
  bundle: require('bundle?lazy!./dashboards.js'),
  preRender: function () {
    return <div></div>
  }
})

export default Dashboard
import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class ReingenieriaFinanciero extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero planeación"
      src="https://app.powerbi.com/reportEmbed?reportId=393686bd-88d1-4286-98d4-9dd6b1b67804&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
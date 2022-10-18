import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class PlaneacionFinanciero extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero planeación"
      src="https://app.powerbi.com/reportEmbed?reportId=6d86e89d-f035-4141-ac78-d5e0ae84ae23&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
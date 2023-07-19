import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class OperacionesFinanciero extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero operaciones"
      src="https://app.powerbi.com/reportEmbed?reportId=53b75ba0-f072-4d32-a3a9-b2686da04c94&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
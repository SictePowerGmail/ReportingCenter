import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class MantenimientoFinanciero extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero mantenimiento"
      src="https://app.powerbi.com/reportEmbed?reportId=c2ea719b-48cf-4f95-864a-25ed37f69dcc&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
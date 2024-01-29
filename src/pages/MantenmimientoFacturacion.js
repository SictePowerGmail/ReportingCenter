import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class MantenimientoFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero facturacion"
      src="https://app.powerbi.com/reportEmbed?reportId=4add5674-5fcb-4aa1-8684-1cb0cd45958b&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
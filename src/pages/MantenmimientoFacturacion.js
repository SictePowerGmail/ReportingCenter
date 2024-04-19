import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class MantenimientoFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero facturacion"
      src="https://app.powerbi.com/reportEmbed?reportId=123fb101-834e-40e9-ab2d-13e00d95683e&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
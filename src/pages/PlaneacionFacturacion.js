import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class PlaneacionFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Planeación facturacióm"
      src="https://app.powerbi.com/reportEmbed?reportId=dd92722e-002b-4619-a1e9-62107c347d74&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
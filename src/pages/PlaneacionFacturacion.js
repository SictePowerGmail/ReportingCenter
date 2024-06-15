import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class PlaneacionFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Planeación facturación"
      src="https://app.powerbi.com/reportEmbed?reportId=cb14eb01-0b57-48f0-9ce9-eb2dc88f2ab5&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
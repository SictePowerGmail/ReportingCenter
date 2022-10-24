import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class PlaneacionFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Facturación planeación"
      src="https://app.powerbi.com/reportEmbed?reportId=af6308a7-6b49-4228-aef9-a4066929e15c&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
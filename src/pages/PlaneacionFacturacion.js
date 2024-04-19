import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class PlaneacionFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Planeación facturación"
      src="https://app.powerbi.com/reportEmbed?reportId=639db64f-8a17-4f59-8ad9-4a441da81612&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
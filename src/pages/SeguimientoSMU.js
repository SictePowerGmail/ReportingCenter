import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class SeguimientoSMU extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Seguimiento SMU"
      src="https://app.powerbi.com/reportEmbed?reportId=ee926062-977b-4ec2-91f5-0446b090efda&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
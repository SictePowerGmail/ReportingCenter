import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class PlaneacionTecnico extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Técnico planeación"
      src="https://app.powerbi.com/reportEmbed?reportId=04ab71de-6d2c-484d-9e3e-ac2b6ffd6562&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
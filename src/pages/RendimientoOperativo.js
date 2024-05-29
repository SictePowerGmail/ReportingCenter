import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class RendimientoOperativo extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Rendimiento operativo"
      src="https://app.powerbi.com/reportEmbed?reportId=2a2436dd-8521-414a-b213-0d7ebcffef48&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
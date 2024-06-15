import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class SeguimientoProyectos extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero corporativo"
      src="https://app.powerbi.com/reportEmbed?reportId=665f5d73-d0dd-409f-94a9-e19be1e1121c&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class MantenimientoTecnico extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Técnico mantenimiento"
      src="https://app.powerbi.com/reportEmbed?reportId=9b320c98-22f1-439a-8952-324ccdf56222&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
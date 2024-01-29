import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class OperacionesFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Facturación operaciones"
      src="https://app.powerbi.com/reportEmbed?reportId=786516c0-41b2-4225-9c9e-dd0dc4a66c41&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
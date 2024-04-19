import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class OperacionesFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Facturación operaciones"
      src="https://app.powerbi.com/reportEmbed?reportId=dca84934-e4bb-468b-9e14-79d0321bc280&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
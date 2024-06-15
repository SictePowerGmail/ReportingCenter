import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class OperacionesFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Facturación operaciones"
      src="https://app.powerbi.com/reportEmbed?reportId=18dca057-81ed-47ba-9cbc-fdc150f22621&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
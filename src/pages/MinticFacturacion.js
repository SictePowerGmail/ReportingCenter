import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class MinticFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Mintic facturacion"
      src="https://app.powerbi.com/reportEmbed?reportId=dd98d693-7e56-407b-8c6e-aed9585316c2&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
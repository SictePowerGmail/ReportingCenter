import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class CorporativoFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero corporativo"
      src="https://app.powerbi.com/reportEmbed?reportId=f3c01404-dcf3-455e-aa3d-3a32e4b79936&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
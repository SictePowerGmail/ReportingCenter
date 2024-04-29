import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class FacturacionConsolidado extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero corporativo"
      src="https://app.powerbi.com/reportEmbed?reportId=6c2f4751-e317-4c88-ad2e-3c0030a4be4b&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
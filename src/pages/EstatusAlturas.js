import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class Penalizaciones extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Estatus de alturas"
      src="https://app.powerbi.com/reportEmbed?reportId=de65c91f-3a24-4216-90eb-041e5bffac56&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
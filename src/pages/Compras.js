import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class Compras extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Financiero corporativo"
      src="https://app.powerbi.com/reportEmbed?reportId=fda6bbc0-4538-4196-b42e-82aba4354892&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class Compras extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Compras"
      src="https://app.powerbi.com/reportEmbed?reportId=9a12192e-ddee-47e8-a732-e5b404a1a41a&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class Seguimiento extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="WhatsApp"
      src="https://app.powerbi.com/reportEmbed?reportId=67e62a23-ba78-49a3-923a-ea9099776801&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
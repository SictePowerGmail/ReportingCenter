import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class Capacidades extends Component {
  render() {
    return (
      <PowerBi
      title="Empalmes"
      src="https://app.powerbi.com/reportEmbed?reportId=34b80d2b-bf64-4be8-b2c9-472d60cb2ac2&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBi>
    )
  }
}
import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class Capacidades extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Capacidades"
      src="https://app.powerbi.com/reportEmbed?reportId=c42043e2-fe67-423b-a5b3-fa0ab010dc9b&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
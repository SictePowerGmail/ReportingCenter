import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class Penalizaciones extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Penalizaciones"
      src="https://app.powerbi.com/reportEmbed?reportId=cecaa9a6-d468-43fd-a05f-924a429f864e&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
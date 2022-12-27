import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class Seguimiento extends Component {
  render() {
    return (           
      <PowerBiPrivate
      title="Seguimiento empalmes"
      src="https://app.powerbi.com/reportEmbed?reportId=1875abf9-817c-4164-a0e7-0685547a88a9&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
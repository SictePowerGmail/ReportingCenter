import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class SeguimientoSMU extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Seguimiento SMU"
      src="https://app.powerbi.com/view?r=eyJrIjoiMjQyOGYxYjAtNDUxOC00OWRjLTk2MzgtMzY0MTViOWZiMWY5IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBiPrivate>
    )
  }
}
import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class SeguimientoSMU extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="SMU"
      src="https://app.powerbi.com/view?r=eyJrIjoiMTMwNzMwNWMtMWMyNS00NmI5LTk4OGUtYjJmNjUzNjI4MjdlIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBiPrivate>
    )
  }
}
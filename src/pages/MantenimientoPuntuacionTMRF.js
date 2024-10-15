import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class MantenimientoPuntuacionTMRF extends Component {
  render() {
    return (
      <PowerBi
        title="Puntuación mantenimiento"
        src="https://app.powerbi.com/view?r=eyJrIjoiOTFiYTAxMjgtYjc1Mi00ZmVhLWE3MDUtYzE1Nzc3MzAzOWU4IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9&pageName=ReportSection">
      </PowerBi>
    )
  }
}
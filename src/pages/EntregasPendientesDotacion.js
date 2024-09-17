import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class EntregasPendientesDotacion extends Component {
  render() {
    return (           
      <PowerBi
        title="Entregas Pendientes Dotacion"
        src="https://app.powerbi.com/view?r=eyJrIjoiN2NkYWVlZjQtMWQ5Yy00OGMxLThkYmQtYzhiYTUzM2Y3YjlmIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
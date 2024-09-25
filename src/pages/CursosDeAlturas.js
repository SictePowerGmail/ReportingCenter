import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class CursosDeAlturas extends Component {
  render() {
    return (
      <PowerBi
        title="Cursos de Alturas"
        src="https://app.powerbi.com/view?r=eyJrIjoiNWM4NGZiZDAtZTJiNi00MTA0LTg1NDItMmU2MzAxMzg0MThjIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
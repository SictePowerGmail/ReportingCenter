import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class GestionNomina extends Component {
  render() {
    return (
      <PowerBi
      title="Puntuación corporativo"
      src="https://app.powerbi.com/view?r=eyJrIjoiNmZiNmZjNzgtN2JmYi00NWYxLTlkNjMtNzhjNTg4MTZjYTFmIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
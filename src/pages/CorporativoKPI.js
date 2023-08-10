import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class CorporativoPuntuacion extends Component {
  render() {
    return (
      <PowerBi
      title="Puntuación corporativo"
      src="https://app.powerbi.com/view?r=eyJrIjoiZmYwNDY5NWEtZmMyYy00NzhhLTkzOTYtNTllMDIwMTM0OWJkIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class CorporativoPuntuacion extends Component {
  render() {
    return (
      <PowerBi
      title="Puntuación corporativo"
      src="https://app.powerbi.com/view?r=eyJrIjoiNjQwMjcxOTEtNmM3Ni00ODNhLThhOTctODdmODMwZGZjNTg5IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class Inicio extends Component {
  render() {
    return (
      <PowerBi
      title="Inicio"
      src="https://app.powerbi.com/view?r=eyJrIjoiYmQ2MjM3MjctZjIwNC00ODI0LWFlODctMzczMjY3MWY4NmFhIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9&pageName=ReportSection">
      </PowerBi>
    )
  }
}
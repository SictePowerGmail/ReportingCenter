import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class PlaneacionTecnico extends Component {
  render() {
    return (
      <PowerBi
      title="Técnico planeación"
      src="https://app.powerbi.com/view?r=eyJrIjoiYmJkODQ3NjItMWRlMy00OTQ0LWIwMjUtMGI2MmZlNGYyNWI2IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9&pageName=ReportSection">
      </PowerBi>
    )
  }
}
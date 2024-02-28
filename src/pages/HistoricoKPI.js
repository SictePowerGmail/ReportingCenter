import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class HistoricoKPI extends Component {
  render() {
    return (
      <PowerBi
      title="HistoricoKPI"
      src="https://app.powerbi.com/view?r=eyJrIjoiYjUyYjVhYjUtNDMwNC00OGYwLTgzZmItODRiZjFhOTFiZmI3IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
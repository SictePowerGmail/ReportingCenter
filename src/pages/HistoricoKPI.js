import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class HistoricoKPI extends Component {
  render() {
    return (
      <PowerBi
      title="HistoricoKPI"
      src="https://app.powerbi.com/view?r=eyJrIjoiZGM4ZWM0ZDctOTc0Yy00ZjBiLWJkZWItODIzMmEyMDU5MGJjIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class MantenimientoFinanciero extends Component {
  render() {
    return (
      <PowerBi
      title="Financiero mantenimiento"
      src="https://app.powerbi.com/reportEmbed?reportId=4ff38bc5-96c8-48b6-a04f-740c386412ad&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBi>
    )
  }
}
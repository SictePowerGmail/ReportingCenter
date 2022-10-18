import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class PBRB_IndicadoresMantenimiento extends Component {
  render() {
    return (
      <PowerBi
      title="Técnico mantenimiento"
      src="https://app.powerbi.com/rdlEmbed?reportId=e89876a0-52c7-494a-b03e-f8e578c8d536&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBi>
    )
  }
}
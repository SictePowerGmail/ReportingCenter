import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class PBRB_SeguimientoEmpalmes extends Component {
  render() {
    return (           
      <PowerBiPrivate
      title="Seguimiento empalmes"
      src="https://app.powerbi.com/rdlEmbed?reportId=027abcdf-b719-4d1e-ba34-468e5bc71aa8&autoAuth=true&ctid=e0bfe90d-20e0-410b-b6f1-429b043d3608">
      </PowerBiPrivate>
    )
  }
}
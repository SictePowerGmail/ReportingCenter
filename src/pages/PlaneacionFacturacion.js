import React, { Component } from 'react'
import { PowerBiPrivate } from '../components/Navbar/Narbar.elements'

export default class PlaneacionFacturacion extends Component {
  render() {
    return (
      <PowerBiPrivate
      title="Planeación facturación"
      src="https://app.powerbi.com/view?r=eyJrIjoiYmFlNjdjNTktNTRiNS00YTkwLWIxMjktY2Q0Y2RkMTBmNGZmIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBiPrivate>
    )
  }
}
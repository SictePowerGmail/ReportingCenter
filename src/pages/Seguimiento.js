import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class Seguimiento extends Component {
  render() {
    return (           
      <PowerBi
      title="Seguimiento empalmes"
      src="https://app.powerbi.com/view?r=eyJrIjoiMWU2N2QwMTctNjJkYi00ZmVlLWFmY2UtZTE0YjU4MmE2ODQzIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
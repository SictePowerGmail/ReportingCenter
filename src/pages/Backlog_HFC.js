import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class BacklogHFC extends Component {
  render() {
    return (
      <PowerBi
      title="Backlog HFC"
      src="https://app.powerbi.com/view?r=eyJrIjoiM2Y0OGMwMTItMmUxZS00YzU2LThlNGQtOTYxZTAzYTZjNGE0IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
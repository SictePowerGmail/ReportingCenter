import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class BacklogHFC extends Component {
  render() {
    return (
      <PowerBi
        title="Backlog HFC"
        src="https://app.powerbi.com/view?r=eyJrIjoiODVkZThmM2ItZmJlZC00NjkyLThkNGUtYjUwZGFhNmNhM2RjIiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
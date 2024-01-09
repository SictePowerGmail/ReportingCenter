import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class TorreControl extends Component {
  render() {
    return (
      <PowerBi
      title="Técnico SMU"
      src="https://app.powerbi.com/view?r=eyJrIjoiOTAyZjVlYWQtNWVjYS00NGFlLWEzYzctMWJmYjU5YWQ3Zjk4IiwidCI6ImUwYmZlOTBkLTIwZTAtNDEwYi1iNmYxLTQyOWIwNDNkMzYwOCJ9">
      </PowerBi>
    )
  }
}
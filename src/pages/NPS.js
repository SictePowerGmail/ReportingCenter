import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class NPS extends Component {
  render() {
    return (
      <PowerBi
      title="NPS"
      src="https://app.powerbi.com/view?r=eyJrIjoiMDcwMzcwY2YtODUzYy00NzJkLWE3YTctYzQxNDNkMGI3N2U4IiwidCI6ImE4NjhmMmMwLWEzZWMtNDQ3Ni1hMmEzLTRhZmMyYjkyZGI3OCIsImMiOjR9">
      </PowerBi>
    )
  }
}
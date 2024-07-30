import React, { Component } from 'react'
import { PowerBi } from '../components/Navbar/Narbar.elements'

export default class NPS extends Component {
  render() {
    return (
      <PowerBi
      title="NPS"
      src="https://app.powerbi.com/view?r=eyJrIjoiNDEyMTA3ZmYtNTZlYi00NDljLTljN2YtZDA0OTljN2EyMzc1IiwidCI6IjE0MDQ0M2FmLThlNzktNGZjZS1iM2VkLWRlMDAxMzEyOTg0ZiIsImMiOjR9">
      </PowerBi>
    )
  }
}
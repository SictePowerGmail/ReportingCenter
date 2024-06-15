import React, { Component } from 'react'
import imagen from '../images/01.jpg'

export default class Inicio extends Component {
  render() {
    return (
      <div class="div-Imagen">
        <img src={imagen} class="Imagen" alt="Imagen 1"/>
      </div>
    )
  }
}
import React from 'react'
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { Component } from 'react';
import swal from 'sweetalert';

const url = "https://sicte.herokuapp.com/api/login";



class Inicio extends Component {
  state = {
    data: [],
    form: {
      email: '',
      password: ''
    }
  }

  peticionGet = () => {
    axios.get(url).then(response => {
      this.setState({ data: response.data });
    }).catch(error => {
      console.log(error.message);
    })
  }

  peticionPost = async () => {
    await axios.post(url, this.state.form).then(response => {
      this.peticionGet();
    }).catch(error => {
      if (error.response) {
        var MensajeDeError = error.response.data.errors
        var ErrorMensaje = MensajeDeError.map(function (MensajeDeError) {
          return MensajeDeError.msg
        })
        swal(ErrorMensaje[0], "", "error");
        console.log(ErrorMensaje);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
      console.log(error);
    })
  }

  handleChange = async e => {
    e.persist();
    await this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    });
    console.log(this.state.form);
  }

  render() {
    const { form } = this.state;
    return (
      <div className="form-group">

        <label className="email">Email</label>
        <input className="form-control" type="text" name="email" id="email" onChange={this.handleChange} value={form ? form.email : ''} />
        <br />

        <label className="password">Trabajo</label>
        <input className="form-control" type="text" name="password" id="password" onChange={this.handleChange} value={form ? form.password : ''} />
        <br />
        <button className="btn btn-success" onClick={() => this.peticionPost()}>
          Insertar
        </button>
      </div>

      

    )
  }
}

export default Inicio
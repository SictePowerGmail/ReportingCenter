import React from 'react'
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { Component } from 'react';
import { useState } from 'react';
import swal from 'sweetalert';

const url = "https://sicte.herokuapp.com/api/login";



class Inicio extends Component {

  state = {
    tokenSession: [],
    form: {
      email: '',
      password: ''
    }
  }

  peticionGet = () => {
    axios.get(url + "/" + this.state.form.id).then(response => {
      this.setState({ tokenSession: response.tokenSession });
      alert(this.setState({ tokenSession: response.tokenSession }));
    }).catch(error => {
      console.log(error.message);
    })
  }

  peticionPost = async () => {
    await axios.post(url, this.state.form).then(response => {
      this.modalInsertar();
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

  render() {
    const { form } = this.state;
    return (
      <div>
      <section>
        <div className="container mt-5 pt-5">
          <div className="row">
            <div className="col-12 col-sm-7 col-md-6 m-auto">
              <div className="card border-0 shadow">
                <div className="card-body">
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-person-circle my-3 mx-auto" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                  </svg>

                  <form action="">
                    <input type="text" name="email" id="email" className="form-control my-4 py-2" placeholder="Username" onChange={this.handleChange} value={form ? form.email : ''} />
                    <input type="text" name="password" id="password" className="form-control my-4 py-2" placeholder="Password" onChange={this.handleChange} value={form ? form.password : ''} />
                    <div className="text-center mt-3">
                      <button className="btn btn-primary" onClick={() => this.peticionPost()}>Login</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div>
    )
  }
}

export default Inicio
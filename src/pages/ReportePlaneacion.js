import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Component } from 'react';
import swal from 'sweetalert';

const url = "https://sicte.herokuapp.com/api/PlaGesRep";

class ReportePlaneacion extends Component {
    state = {
        data: [],
        modalInsertar: false,
        modalEliminar: false,
        form: {
            Cedula: '',
            Nombre: '',
            Fecha: '',
            Empalme: '',
            Direccion: '',
            Cantidad: '',
            CodigoSap: '',
            Identificador: '',
            Observaciones: '',
            Gestor: ''
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
            this.modalInsertar();
            this.peticionGet();
        }).catch(error => {
            if (error.response) {
                var MensajeDeError = error.response.data.errors
                var ErrorMensaje = MensajeDeError.map(function(MensajeDeError){
                    return MensajeDeError.msg
                })
                swal(ErrorMensaje[0],"", "error");
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

    peticionPut=()=>{
        axios.put(url+"/"+this.state.form.id, this.state.form).then(response=>{
          this.modalInsertar();
          this.peticionGet();
        }).catch(error => {
            if (error.response) {
                var MensajeDeError = error.response.data.errors
                var ErrorMensaje = MensajeDeError.map(function(MensajeDeError){
                    return MensajeDeError.msg
                })
                swal(ErrorMensaje[0],"", "error");
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

    peticionDelete=()=>{
        axios.delete(url+"/"+this.state.form.id).then(response=>{
            this.setState({modalEliminar: false});
            this.peticionGet();
        })
    }

    modalInsertar = () => {
        this.setState({ modalInsertar: !this.state.modalInsertar });
    }

    seleccionarPlaRepGes = (plaRepGes) => {
        this.setState({
            tipoModal: 'actualizar',
            form: {
                id: plaRepGes._id,
                Cedula: plaRepGes.Cedula,
                Nombre: plaRepGes.Nombre,
                Fecha: plaRepGes.Fecha,
                Empalme: plaRepGes.Empalme,
                Direccion: plaRepGes.Direccion,
                Cantidad: plaRepGes.Cantidad,
                CodigoSap: plaRepGes.CodigoSap,
                Identificador: plaRepGes.Identificador,
                Observaciones: plaRepGes.Observaciones,
                Gestor: plaRepGes.Gestor
            }
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

    componentDidMount() {
        this.peticionGet();
    }

    render() {
        const { form } = this.state;
        return (
            <div className="App">
                <br />
                <button className="btn btn-success" onClick={()=>{this.setState({form: null, tipoModal: 'insertar'}); this.modalInsertar()}}>Agregar</button>
                <br />
                <table className="table">
                    <thead>
                        <tr>
                            <td>Cedula</td>
                            <td>Nombre</td>
                            <td>Fecha</td>
                            <td>Empalme</td>
                            <td>Dirección</td>
                            <td>Cantidad</td>
                            <td>Codigo Sap</td>
                            <td>ID</td>
                            <td>Observaciones</td>
                            <td>Gestor</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.data.map(plaRepGes => {
                            return (
                                <tr key={plaRepGes._id}>
                                    <td>{plaRepGes.Cedula}</td>
                                    <td>{plaRepGes.Nombre}</td>
                                    <td>{plaRepGes.Fecha}</td>
                                    <td>{plaRepGes.Empalme}</td>
                                    <td>{plaRepGes.Direccion}</td>
                                    <td>{plaRepGes.Cantidad}</td>
                                    <td>{plaRepGes.CodigoSap}</td>
                                    <td>{plaRepGes.Identificador}</td>
                                    <td>{plaRepGes.Observaciones}</td>
                                    <td>{plaRepGes.Gestor}</td>
                                    <td>
                                    <button className="btn btn-primary" onClick={()=>{this.seleccionarPlaRepGes(plaRepGes); this.modalInsertar()}}><FontAwesomeIcon icon={faEdit}/></button>
                                        {"   "}
                                    <button className="btn btn-danger" onClick={()=>{this.seleccionarPlaRepGes(plaRepGes); this.setState({modalEliminar: true})}}><FontAwesomeIcon icon={faTrashAlt}/></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                

                <Modal isOpen={this.state.modalInsertar}>
                    <ModalHeader style={{ display: 'block' }}>
                        <span style={{ float: 'right' }}></span>
                    </ModalHeader>
                    <ModalBody>
                        <div className="form-group">

                            <label className="Cedula">Cedula</label>
                            <input className="form-control" type="text" name="Cedula" id="Cedula" onChange={this.handleChange} value={form ? form.Cedula : ''}/>
                            <br />

                            <label className="Nombre">Nombre</label>
                            <input className="form-control" type="text" name="Nombre" id="Nombre" onChange={this.handleChange} value={form ? form.Nombre : ''} />
                            <br />

                            <label className="Fecha">Fecha</label>
                            <input className="form-control" type="text" name="Fecha" id="Fecha" onChange={this.handleChange} value={form ? form.Fecha : ''} />
                            <br />

                            <label className="Empalme">Empalme</label>
                            <input className="form-control" type="text" name="Empalme" id="Empalme" onChange={this.handleChange} value={form ? form.Empalme : ''} />
                            <br />

                            <label className="Direccion">Direccion</label>
                            <input className="form-control" type="text" name="Direccion" id="Direccion" onChange={this.handleChange} value={form ? form.Direccion : ''} />
                            <br />

                            <label className="Cantidad">Cantidad</label>
                            <input className="form-control" type="text" name="Cantidad" id="Cantidad" onChange={this.handleChange} value={form ? form.Cantidad : ''} />
                            <br />

                            <label className="CodigoSap">Codigo Sap</label>
                            <input className="form-control" type="text" name="CodigoSap" id="CodigoSap" onChange={this.handleChange} value={form ? form.CodigoSap : ''} />
                            <br />

                            <label className="Identificador">Identificador</label>
                            <input className="form-control" type="text" name="Identificador" id="Identificador" onChange={this.handleChange} value={form ? form.Identificador : ''} />
                            <br />

                            <label className="Observaciones">Observaciones</label>
                            <input className="form-control" type="text" name="Observaciones" id="Observaciones" onChange={this.handleChange} value={form ? form.Observaciones : ''} />
                            <br />

                            <label className="Gestor">Gestor</label>
                            <input className="form-control" type="text" name="Gestor" id="Gestor" onChange={this.handleChange} value={form ? form.Gestor : ''} />
                            <br />
                        </div>

                    
                    </ModalBody>

                    <ModalFooter>
                        {this.state.tipoModal === 'insertar' ?
                            <button className="btn btn-success" onClick={() => this.peticionPost()}>
                                Insertar
                            </button> : <button className="btn btn-primary" onClick={() => this.peticionPut()}>
                                Actualizar
                            </button>
                        }
                        <button className="btn btn-danger" onClick={() => this.modalInsertar()}>Cancelar</button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.modalEliminar}>
                    <ModalBody>
                        Seguro que desea eliminar este registro
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-danger" onClick={()=>this.peticionDelete()}>Sí</button>
                        <button className="btn btn-secundary" onClick={()=>this.setState({modalEliminar: false})}>No</button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

export default ReportePlaneacion;
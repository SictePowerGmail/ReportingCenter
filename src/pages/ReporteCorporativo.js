import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Component } from 'react';

const url = "https://sicte.herokuapp.com/api/tasks";



class ReporteCorporativo extends Component {
    state = {
        data: [],
        modalInsertar: false,
        modalEliminar: false,
        form: {
            TipoTrabajo: '',
            OT: '',
            CM: '',
            DiaAgenda: '',
            Trabajo: '',
            Cantidad: '',
            NombreResponsable: '',
            Cedula: '',
            tipoModal: ''
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
            console.log(error.message);
        })
    }

    peticionPut=()=>{
        axios.put(url+"/"+this.state.form.id, this.state.form).then(response=>{
          this.modalInsertar();
          this.peticionGet();
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

    seleccionarTask = (task) => {
        this.setState({
            tipoModal: 'actualizar',
            form: {
                id: task._id,
                TipoTrabajo: task.TipoTrabajo,
                OT: task.OT,
                CM: task.CM,
                DiaAgenda: task.DiaAgenda,
                Trabajo: task.Trabajo,
                Cantidad: task.Cantidad,
                NombreResponsable: task.NombreResponsable,
                Cedula: task.Cedula
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
                            <td>Tipo de rabajo</td>
                            <td>OT</td>
                            <td>CM</td>
                            <td>Dia agenda</td>
                            <td>Trabajo</td>
                            <td>Cantidad</td>
                            <td>Nombre responsable</td>
                            <td>Cedula</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.data.map(task => {
                            return (
                                <tr key={task._id}>
                                    <td>{task.TipoTrabajo}</td>
                                    <td>{task.OT}</td>
                                    <td>{task.CM}</td>
                                    <td>{task.DiaAgenda}</td>
                                    <td>{task.Trabajo}</td>
                                    <td>{task.Cantidad}</td>
                                    <td>{task.NombreResponsable}</td>
                                    <td>{task.Cedula}</td>
                                    <td>
                                    <button className="btn btn-primary" onClick={()=>{this.seleccionarTask(task); this.modalInsertar()}}><FontAwesomeIcon icon={faEdit}/></button>
                                        {"   "}
                                    <button className="btn btn-danger" onClick={()=>{this.seleccionarTask(task); this.setState({modalEliminar: true})}}><FontAwesomeIcon icon={faTrashAlt}/></button>
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

                            <label className="TipoTrabajo">Tipo de trabajo</label>
                            <input className="form-control" type="text" name="TipoTrabajo" id="TipoTrabajo" onChange={this.handleChange} value={form ? form.TipoTrabajo : ''} />
                            <br />

                            <label className="OT">OT</label>
                            <input className="form-control" type="text" name="OT" id="OT" onChange={this.handleChange} value={form ? form.OT : ''} />
                            <br />

                            <label className="CM">CM</label>
                            <input className="form-control" type="text" name="CM" id="CM" onChange={this.handleChange} value={form ? form.CM : ''} />
                            <br />

                            <label className="DiaAgenda">DiaAgenda</label>
                            <input className="form-control" type="text" name="DiaAgenda" id="DiaAgenda" onChange={this.handleChange} value={form ? form.DiaAgenda : ''} />
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-calendar"></span>
                            </span>
                            <br />

                            <label className="Trabajo">Trabajo</label>
                            <input className="form-control" type="text" name="Trabajo" id="Trabajo" onChange={this.handleChange} value={form ? form.Trabajo : ''} />
                            <br />

                            <label className="Cantidad">Cantidad</label>
                            <input className="form-control" type="text" name="Cantidad" id="Cantidad" onChange={this.handleChange} value={form ? form.Cantidad : ''} />
                            <br />

                            <label className="NombreResponsable">NombreResponsable</label>
                            <input className="form-control" type="text" name="NombreResponsable" id="NombreResponsable" onChange={this.handleChange} value={form ? form.NombreResponsable : ''} />
                            <br />

                            <label className="Cedula">Cedula</label>
                            <input className="form-control" type="text" name="Cedula" id="Cedula" onChange={this.handleChange} value={form ? form.Cedula : ''} />
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
                        Estás seguro que desar eliminar el registro
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

export default ReporteCorporativo;
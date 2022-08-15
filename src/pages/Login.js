import { useState,  useCallback } from "react";
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M…DE0fQ.o8xwsgWERC5xPlH0JSH0k9c2AkpljxJUscZN7y5w7oI';

const url = "https://sicte.herokuapp.com/api/login";

axios.interceptors.request.use(
    config => {
        config.headers.authorization = 'Bearer ${accessToken}';
        console.log(config.headers.authorization)
        return config;
    },
    error => {
        return Promise.reject(error);
    }
)

/*

class Login extends Component {
    state = {
        data: [],
        form: {
            email: '',
            password: ''
        }
    }

    peticionPost = async () => {
        await axios.post(url, this.state.form).then(response => {
            this.modalInsertar();
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
            <section>
            <div className="container mt-5 pt-5">
                <div className="row justify-content-sm-center h-100">
                    <div className="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9">
                        <div className="card shadow-lg">
                            <div className="card-body p-5">
                                <h1 className="fs-4 card-title fw-bold mb-4">Login</h1>
                                <form className="needs-validation" autoComplete="off">
                                    <div className="mb-3">
                                        <label className="mb-2 text-muted" htmlFor="email">Email</label>
                                        <input className="form-control" type="text" name="email" id="email" onChange={this.handleChange} value={form ? form.email : ''} />
                                    </div>
                                    <div className="mb-3">
                                        <div className="mb-2 w-100">
                                            <label className="text-muted" htmlFor="password">Contraseña</label>
                                        </div>
                                        <input className="form-control" type="password" name="password" id="password" onChange={this.handleChange} value={form ? form.password : ''}/>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="form-check">
                                            <input type="checkbox" name="remember" id="remember" className="form-check-input" />
                                            <label htmlFor="remember" className="form-check-label">Recordarme</label>
                                        </div>
                                        <button className="btn btn-primary ms-auto" onClick={() => this.peticionPost()}>
                                            <i className="bi bi-box-arrow-in-right"></i> Ingresar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        )
    }

}

export default Login;

*/


function Login() {

    //se guarda la i9nfo de las cajas de texto
    const [datos, setDatos] = useState({
        email: "",
        password: ""
    });

        //Se manejan los ccambios
    const handleInputChange = (e) => {
        let { name, value } = e.target;
        let newDatos = { ...datos, [name]: value };
        setDatos(newDatos);
    }

    //Envio del formulario
 
    const handleSubmit = async (e) => {
        e.preventDefault();
            let res = await axios.post(url, datos);
            console.log(res.data);                 //respuesta de ester servicio
    };

    return (
        <section>
            <div className="container mt-5 pt-5">
                <div className="row justify-content-sm-center h-100">
                    <div className="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9">
                        <div className="card shadow-lg">
                            <div className="card-body p-5">
                                <h1 className="fs-4 card-title fw-bold mb-4">Login</h1>
                                <form onSubmit={handleSubmit} className="needs-validation" noValidate={true} autoComplete="off">
                                    <div className="mb-3">
                                        <label className="mb-2 text-muted" htmlFor="email">Email</label>
                                        <input id="email" type="text" onChange={handleInputChange} value={datos.email} className="form-control" name="email" required autoFocus />
                                        <div className="invalid-feedback">
                                            Email inválido
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="mb-2 w-100">
                                            <label className="text-muted" htmlFor="password">Contraseña</label>
                                        </div>
                                        <input id="password" type="password" onChange={handleInputChange} value={datos.password} className="form-control" name="password" required />
                                        <div className="invalid-feedback">
                                            Contraseña es requirida
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="form-check">
                                            <input type="checkbox" name="remember" id="remember" className="form-check-input" />
                                            <label htmlFor="remember" className="form-check-label">Recordarme</label>
                                        </div>
                                        <button type="submit" className="btn btn-primary ms-auto">
                                            <i className="bi bi-box-arrow-in-right"></i> Ingresar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;


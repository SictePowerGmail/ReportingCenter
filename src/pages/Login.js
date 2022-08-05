import { useState } from "react";
import axios from "axios";

const url = "https://sicte.herokuapp.com/api/login";

function Login() {

    const [datos, setDatos] = useState({
        email: "",
        password: ""
    });

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        let newDatos = { ...datos, [name]: value };
        setDatos(newDatos);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            console.log("no enviar");
        } else {
            let res = await axios.post(url, datos);
            console.log(res.data);
        }
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
                                            email inválido
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
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import './ControlUsuarios.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import { ObtenerRolUsuario, cargarDirectores } from '../../funciones';

function ControlUsuarios() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEdicionVisible, setModalEdicionVisible] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [usuarioEditado, setUsuarioEditado] = useState(null);

    const cargarDatos = async () => {
        try {
            const response = await axios.get("https://sicteferias.from-co.net:8120/user");
            const ajustandoRol = response.data
                .map(usuario => ({
                    ...usuario,
                    rol: ObtenerTextoMejorado(ObtenerRolUsuario(usuario.rol))
                }));
            const usuariosOrdenados = ajustandoRol
                .sort((a, b) => a.rol.localeCompare(b.rol))
            setUsuarios(usuariosOrdenados);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const role = Cookies.get('userRole');
        if (role !== "admin") {
            navigate('/ReportingCenter');
        }

        cargarDatos();
        cargarDirectores();
    }, []);

    const ObtenerTextoMejorado = (rol) => {
        if (!rol) return "";
        return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
    };

    const [filtro, setFiltro] = useState("");

    const usuariosFiltrados = usuarios.filter(usuario =>
        Object.values(usuario).some(valor =>
            valor.toString().toLowerCase().includes(filtro.toLowerCase())
        )
    );

    const [reportes, setReportes] = useState(false);
    const [subChecksReportes, setSubChecksReportes] = useState({
        Capacidades: false,
        Supervision: false
    });

    const handleReportesChange = () => {
        const newState = !reportes;
        setReportes(newState);
        setSubChecksReportes((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangeReportes = (name) => {
        setSubChecksReportes(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const [facturacion, setFacturacion] = useState(false);
    const [subChecksFacturacion, setSubChecksFacturacion] = useState({
        ConsolidadoNacional: false,
        Proyectos: false,
        Corporativo: false,
        Mantenimiento: false,
        Operaciones: false,
        Mintic: false,
        Smu: false,
        ImplementacionMovil: false,
        MedicionesMovil: false,
        ObraCivilMovil: false
    });

    const handleFacturacionChange = () => {
        const newState = !facturacion;
        setFacturacion(newState);
        setSubChecksFacturacion((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangeFacturacion = (name) => {
        setSubChecksFacturacion(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const [produccion, setProduccion] = useState(false);
    const [subChecksProduccion, setSubChecksProduccion] = useState({
        ProducionNacional: false,
        Proyectos: false,
        Corporativo: false,
        Mantenimiento: false,
        Reingenierias: false,
        Operaciones: false
    });

    const handleProduccionChange = () => {
        const newState = !produccion;
        setProduccion(newState);
        setSubChecksProduccion((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangeProduccion = (name) => {
        setSubChecksProduccion(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const [indicadores, setIndicadores] = useState(false);
    const [subChecksIndicadores, setSubChecksIndicadores] = useState({
        HistoricoKpi: false,
        G1Mantenimiento: false,
        Nps: false
    });

    const handleIndicadoresChange = () => {
        const newState = !indicadores;
        setIndicadores(newState);
        setSubChecksIndicadores((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangeIndicadores = (name) => {
        setSubChecksIndicadores(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const [puntuacion, setPuntuacion] = useState(false);
    const [subChecksPuntuacion, setSubChecksPuntuacion] = useState({
        Proyectos: false,
        Corporativo: false,
        Mantenimiento: false,
        Reingenierias: false
    });

    const handlePuntuacionChange = () => {
        const newState = !puntuacion;
        setPuntuacion(newState);
        setSubChecksPuntuacion((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangePuntuacion = (name) => {
        setSubChecksPuntuacion(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const [operacion, setOperacion] = useState(false);
    const [subChecksOperacion, setSubChecksOperacion] = useState({
        CumplimientoSlaFo: false,
        CumplimientoSlaHfc: false,
        CorrectivoPreventivo: false,
        SeguimientoMttoCentro: false,
        SeguimientoOperaciones: false,
        SeguimientoSmu: false,
        TecnicoSmu: false,
        TorreDeControl: false
    });

    const handleOperacionChange = () => {
        const newState = !operacion;
        setOperacion(newState);
        setSubChecksOperacion((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangeOperacion = (name) => {
        setSubChecksOperacion(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const [logistica, setLogistica] = useState(false);
    const [subChecksLogistica, setSubChecksLogistica] = useState({
        EquiposEnMovilesR2: false,
        EquiposEnMovilesR4: false,
        ConsumosOperaciones: false,
        DesmonteMantenimiento: false,
        SolicitudDeMaterial: false,
        ReporteMaterialFerretero: false,
        InventarioMaterial: false
    });

    const handleLogisticaChange = () => {
        const newState = !logistica;
        setLogistica(newState);
        setSubChecksLogistica((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangeLogistica = (name) => {
        setSubChecksLogistica(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const [direccion, setDireccion] = useState(false);
    const [subChecksDireccion, setSubChecksDireccion] = useState({
        Penalizaciones: false,
        CentroDeCostos: false,
        ComposicionMoviles: false,
        Compras: false
    });

    const handleDireccionChange = () => {
        const newState = !direccion;
        setDireccion(newState);
        setSubChecksDireccion((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangeDireccion = (name) => {
        setSubChecksDireccion(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const [ssta, setSsta] = useState(false);
    const [subChecksSsta, setSubChecksSsta] = useState({
        Ssta: false,
        CursoDeAlturas: false,
        EntregasPendientesDotacion: false
    });

    const handleSstaChange = () => {
        const newState = !ssta;
        setSsta(newState);
        setSubChecksSsta((prevState) =>
            Object.fromEntries(Object.keys(prevState).map(key => [key, newState]))
        );
    };

    const handleSubCheckChangeSsta = (name) => {
        setSubChecksSsta(prevState => ({
            ...prevState,
            [name]: !prevState[name]
        }));
    };

    const handleUsuarioEditadoChange = (e) => {
        setUsuarioEditado({
            ...usuarioEditado,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className='BasesDeDatos'>
            <div className='contenedor'>
                {loading ? (
                    <div className="CargandoPagina">
                        <ThreeDots
                            type="ThreeDots"
                            color="#0B1A46"
                            height={200}
                            width={200}
                        />
                        <p>... Cargando Datos ...</p>
                    </div>
                ) : (
                    <>
                        <div className="input-group mb-3 entradaTexto">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Escriba para filtrar informacion"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                            />
                            <button className="btn btn-success" type="submit">
                                <i className="fa fa-search"></i>
                            </button>
                        </div>

                        <div className="contenedor-usuarios">
                            {usuariosFiltrados.map((usuario, index) => (
                                <div key={index} className="carta" onClick={() => {
                                    setUsuarioSeleccionado(usuario);
                                    setUsuarioEditado(usuario);
                                    setModalVisible(true);
                                }}>
                                    <i className="fa fa-user"></i>
                                    <div className='linea'></div>
                                    <div className="texto">
                                        <span><strong>Nombre:</strong> {usuario.nombre}</span>
                                        <span><strong>Cédula:</strong> {usuario.cedula}</span>
                                        <span><strong>Correo:</strong> {usuario.correo}</span>
                                        <span><strong>Teléfono:</strong> {usuario.telefono}</span>
                                        <span><strong>Rol:</strong> {usuario.rol}</span>
                                    </div>
                                </div>
                            ))}

                            {modalVisible && usuarioSeleccionado && (
                                <div className="modal" onClick={() => setModalVisible(false)}>
                                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                                        <span className='titulo'>Permisos Concedidos</span>

                                        <div className='datos'>
                                            <div>
                                                <span><strong>Nombre:</strong> {usuarioSeleccionado.nombre}</span>
                                                <span><strong>Cédula:</strong> {usuarioSeleccionado.cedula}</span>
                                                <span><strong>Correo:</strong> {usuarioSeleccionado.correo}</span>
                                                <span><strong>Teléfono:</strong> {usuarioSeleccionado.telefono}</span>
                                                <span><strong>Rol:</strong> {usuarioSeleccionado.rol}</span>
                                            </div>
                                            <div>
                                                <button className='btn btn-secondary' onClick={() => {
                                                    setModalEdicionVisible(true);
                                                }}>Editar</button>
                                            </div>
                                        </div>

                                        <div className='fila'>
                                            <div className='columna'>
                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={reportes}
                                                        onChange={handleReportesChange}
                                                    />
                                                    <span>Reportes</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksReportes).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksReportes[key]}
                                                                onChange={() => handleSubCheckChangeReportes(key)}
                                                                disabled={reportes}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={facturacion}
                                                        onChange={handleFacturacionChange}
                                                    />
                                                    <span>Facturación</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksFacturacion).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksFacturacion[key]}
                                                                onChange={() => handleSubCheckChangeFacturacion(key)}
                                                                disabled={facturacion}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="linea-vertical"></div>

                                            <div className='columna'>
                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={produccion}
                                                        onChange={handleProduccionChange}
                                                    />
                                                    <span>Produccion</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksProduccion).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksProduccion[key]}
                                                                onChange={() => handleSubCheckChangeProduccion(key)}
                                                                disabled={produccion}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={indicadores}
                                                        onChange={handleIndicadoresChange}
                                                    />
                                                    <span>Indicadores</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksIndicadores).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksIndicadores[key]}
                                                                onChange={() => handleSubCheckChangeIndicadores(key)}
                                                                disabled={indicadores}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={ssta}
                                                        onChange={handleSstaChange}
                                                    />
                                                    <span>Ssta</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksSsta).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksSsta[key]}
                                                                onChange={() => handleSubCheckChangeSsta(key)}
                                                                disabled={ssta}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="linea-vertical"></div>

                                            <div className='columna'>
                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={puntuacion}
                                                        onChange={handlePuntuacionChange}
                                                    />
                                                    <span>Puntuacion</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksPuntuacion).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksPuntuacion[key]}
                                                                onChange={() => handleSubCheckChangePuntuacion(key)}
                                                                disabled={puntuacion}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={operacion}
                                                        onChange={handleOperacionChange}
                                                    />
                                                    <span>Operacion</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksOperacion).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksOperacion[key]}
                                                                onChange={() => handleSubCheckChangeOperacion(key)}
                                                                disabled={operacion}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="linea-vertical"></div>

                                            <div className='columna'>
                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={logistica}
                                                        onChange={handleLogisticaChange}
                                                    />
                                                    <span>Logistica</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksLogistica).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksLogistica[key]}
                                                                onChange={() => handleSubCheckChangeLogistica(key)}
                                                                disabled={logistica}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={direccion}
                                                        onChange={handleDireccionChange}
                                                    />
                                                    <span>Direccion</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(subChecksDireccion).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={subChecksDireccion[key]}
                                                                onChange={() => handleSubCheckChangeDireccion(key)}
                                                                disabled={direccion}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="modal-botones">
                                            <button className='btn btn-danger' onClick={() => setModalVisible(false)}>Cancelar</button>
                                            <button
                                                className='btn btn-success'
                                                onClick={() => alert("Acción confirmada")}
                                            >
                                                Confirmar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalEdicionVisible && (
                                <div className="modal modal-secundario" onClick={() => setModalEdicionVisible(false)}>
                                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                                        <span className='titulo'>Editar Usuario</span>
                                        <div className='datosUsuario'>
                                            <label>Nombre: <input type="text" name="nombre" value={usuarioEditado.nombre} onChange={handleUsuarioEditadoChange} /></label>
                                            <label>Cédula: <input type="text" name="cedula" value={usuarioEditado.cedula} onChange={handleUsuarioEditadoChange} /></label>
                                            <label>Correo: <input type="text" name="correo" value={usuarioEditado.correo} onChange={handleUsuarioEditadoChange} /></label>
                                            <label>Teléfono: <input type="text" name="telefono" value={usuarioEditado.telefono} onChange={handleUsuarioEditadoChange} /></label>
                                            <label>Rol: <input type="text" name="rol" value={usuarioEditado.rol} onChange={handleUsuarioEditadoChange} /></label>
                                        </div>
                                        <div className='modal-botones'>
                                            <button className='btn btn-danger' onClick={() => setModalEdicionVisible(false)}>Cancelar</button>
                                            <button className='btn btn-success' onClick={() => {
                                                setUsuarioSeleccionado(usuarioEditado);
                                                setModalEdicionVisible(false);
                                            }}>Guardar</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ControlUsuarios;
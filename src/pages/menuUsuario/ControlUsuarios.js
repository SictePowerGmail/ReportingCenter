import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import './ControlUsuarios.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import { ObtenerRolUsuario, cargarDirectores } from '../../funciones';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Activos from '../logistica/Activos';

function ControlUsuarios() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEdicionVisible, setModalEdicionVisible] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [usuarioEditado, setUsuarioEditado] = useState(null);
    const [pageUsuarioSeleccionado, setPageUsuarioSeleccionado] = useState([]);

    const cargarDatos = async () => {
        try {
            const responseUser = await axios.get(`${process.env.REACT_APP_API_URL}/usuarios/users`);

            const ajustandoRol = responseUser.data
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

        cargarDirectores();
        cargarDatos();
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

    const [grupos, setGrupos] = useState({
        aplicativos: {
            activo: false,
            subChecks: {
                Capacidades: false,
                Supervision: false,
                SolicitudDeMaterial: false,
                ReporteMaterialFerretero: false,
                ChatBot: false,
                Carnetizacion: false,
            }
        },
        facturacion: {
            activo: false,
            subChecks: {
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
            }
        },
        productividad: {
            activo: false,
            subChecks: {
                ProducionNacional: false,
                Proyectos: false,
                Corporativo: false,
                Mantenimiento: false,
                Reingenierias: false,
                Operaciones: false
            }
        },
        indicadores: {
            activo: false,
            subChecks: {
                HistoricoKpi: false,
                G1Mantenimiento: false,
                Nps: false,
                G2G8MasivoCentro: false
            }
        },
        puntuacion: {
            activo: false,
            subChecks: {
                Proyectos: false,
                Corporativo: false,
                Mantenimiento: false,
                Reingenierias: false
            }
        },
        operacion: {
            activo: false,
            subChecks: {
                CumplimientoSlaFo: false,
                CumplimientoSlaHfc: false,
                CorrectivoPreventivo: false,
                RecursoOperaciones: false,
                SeguimientoOperacionesCentro: false,
                SeguimientoOperacionesNorte: false,
                SeguimientoSmu: false,
                TecnicoSmu: false,
                EnelCronograma: false,
            }
        },
        logistica: {
            activo: false,
            subChecks: {
                EquiposEnMoviles: false,
                DesmonteMantenimiento: false,
                InventarioMaterial: false,
                EstadoProyectosR4: false,
                Activos: false,
                ReporteSicte: false,
                CriticidadEquipos: false,
                EnelControlMateriales: false,
            }
        },
        administracion: {
            activo: false,
            subChecks: {
                Penalizaciones: false,
                CentroDeCostos: false,
                ComposicionMoviles: false,
                Compras: false,
                Capacidades: false,
            }
        },
        hseq: {
            activo: false,
            subChecks: {
                Ssta: false,
                CursoDeAlturas: false,
                EntregasPendientesDotacion: false,
                UbicacionDeActividades: false,
                InspeccionesEnel: false,
            }
        },
        parqueAutomotor: {
            activo: false,
            subChecks: {
                Moviles: false
            }
        }
    });

    const handleUsuarioEditadoChange = (e) => {
        setUsuarioEditado({
            ...usuarioEditado,
            [e.target.name]: e.target.value
        });
    };

    const EditarUsuario = async (usuarioEditado) => {
        try {
            setLoading(true);

            const usuarioActualizado = {
                ...usuarioEditado,
                rol: usuarioEditado.rol.toLowerCase()
            };

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/usuarios/users/${usuarioActualizado.id}`,
                usuarioActualizado,
                { headers: { "Content-Type": "application/json" } }
            );

            const nuevaListaUsuarios = usuarios.map(usuario =>
                usuario.id === usuarioEditado.id ? { ...usuario, ...usuarioEditado } : usuario
            );

            if (response.status === 200) {
                setUsuarios(nuevaListaUsuarios);
                setUsuarioSeleccionado(usuarioEditado);
                setModalEdicionVisible(false);
                Cookies.set('userCedula', usuarioActualizado.cedula, { expires: 7 });
                Cookies.set('userNombre', usuarioActualizado.nombre, { expires: 7 });
                Cookies.set('userCorreo', usuarioActualizado.correo, { expires: 7 });
                Cookies.set('userTelefono', usuarioActualizado.telefono, { expires: 7 });
                Cookies.set('userRole', usuarioActualizado.rol, { expires: 7 });
                toast.success(`Se edito la informacion correctamente de: ${usuarioActualizado.nombre}`, { className: 'toast-success' });
            } else {
                toast.error(`Error al editar los datos de: ${usuarioActualizado.nombre}`, { className: 'toast-success' });
            }

        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleGrupo = (grupo) => {
        setGrupos(prev => {
            const nuevoEstado = !prev[grupo].activo;
            const nuevosSubChecks = Object.fromEntries(
                Object.keys(prev[grupo].subChecks).map(key => [key, nuevoEstado])
            );

            return {
                ...prev,
                [grupo]: {
                    activo: nuevoEstado,
                    subChecks: nuevosSubChecks
                }
            };
        });
    };

    const toggleSubCheck = (grupo, key) => {
        setGrupos(prev => {
            const nuevosSubChecks = {
                ...prev[grupo].subChecks,
                [key]: !prev[grupo].subChecks[key]
            };

            const todosActivos = Object.values(nuevosSubChecks).every(val => val === true);

            return {
                ...prev,
                [grupo]: {
                    activo: todosActivos,
                    subChecks: nuevosSubChecks
                }
            };
        });
    };

    const mapearGrupoDesdeUsuario = (usuario, prefijo) => {
        const subChecks = Object.entries(usuario)
            .filter(([key]) => key.startsWith(prefijo))
            .reduce((acc, [key, value]) => {
                const nombre = key.replace(prefijo, "");
                acc[nombre] = value === "1" || value === 1;
                return acc;
            }, {});

        const activo = Object.values(subChecks).every(Boolean);
        return { activo, subChecks };
    };

    const cargarDatosPagesUser = async (usuario) => {
        try {
            setLoading(true);

            const responsePagesUser = await axios.get(`${process.env.REACT_APP_API_URL}/usuarios/pagesUser`);
            const data = responsePagesUser.data;
            const usuarioEncontrado = data.find(user => user.cedula === usuario.cedula);
            setPageUsuarioSeleccionado(usuarioEncontrado);

            if (usuarioEncontrado) {
                const nuevoGrupos = {
                    aplicativos: mapearGrupoDesdeUsuario(usuarioEncontrado, "aplicativos"),
                    facturacion: mapearGrupoDesdeUsuario(usuarioEncontrado, "facturacion"),
                    productividad: mapearGrupoDesdeUsuario(usuarioEncontrado, "productividad"),
                    indicadores: mapearGrupoDesdeUsuario(usuarioEncontrado, "indicadores"),
                    hseq: mapearGrupoDesdeUsuario(usuarioEncontrado, "hseq"),
                    puntuacion: mapearGrupoDesdeUsuario(usuarioEncontrado, "puntuacion"),
                    operacion: mapearGrupoDesdeUsuario(usuarioEncontrado, "operacion"),
                    logistica: mapearGrupoDesdeUsuario(usuarioEncontrado, "logistica"),
                    administracion: mapearGrupoDesdeUsuario(usuarioEncontrado, "administracion"),
                    parqueAutomotor: mapearGrupoDesdeUsuario(usuarioEncontrado, "parqueAutomotor"),
                };

                setGrupos(nuevoGrupos);

            } else {
                console.log("Usuario no encontrado");
            }

        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const EditarPagesUsuario = async () => {
        try {
            setLoading(true);

            const body = {
                cedula: pageUsuarioSeleccionado.cedula,
            };

            Object.entries(grupos).forEach(([grupo, data]) => {
                Object.entries(data.subChecks).forEach(([subKey, isChecked]) => {
                    const keyName = `${grupo}${subKey}`;
                    body[keyName] = isChecked ? 1 : 0;
                });
            });

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/usuarios/pagesUser/${pageUsuarioSeleccionado.id}`,
                body,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status === 200) {
                setModalEdicionVisible(false);
                setModalVisible(false);

                toast.success(`Se edito permisos correctamente de: ${usuarioEditado.nombre}`, { className: 'toast-success' });
            } else {
                toast.error(`Error al editar los datos de: ${usuarioEditado.nombre}`, { className: 'toast-success' });
            }

        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='ControlUsuarios'>
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
                                    cargarDatosPagesUser(usuario);
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
                                                        checked={grupos.aplicativos.activo}
                                                        onChange={() => toggleGrupo("aplicativos")}
                                                    />
                                                    <span>Aplicativos</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.aplicativos.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.aplicativos.subChecks[key]}
                                                                onChange={() => toggleSubCheck("aplicativos", key)}
                                                                disabled={grupos.aplicativos.activo}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={grupos.facturacion.activo}
                                                        onChange={() => toggleGrupo("facturacion")}
                                                    />
                                                    <span>Facturación</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.facturacion.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.facturacion.subChecks[key]}
                                                                onChange={() => toggleSubCheck("facturacion", key)}
                                                                disabled={grupos.facturacion.activo}
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
                                                        checked={grupos.productividad.activo}
                                                        onChange={() => toggleGrupo("productividad")}
                                                    />
                                                    <span>Productividad</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.productividad.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.productividad.subChecks[key]}
                                                                onChange={() => toggleSubCheck("productividad", key)}
                                                                disabled={grupos.productividad.activo}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={grupos.indicadores.activo}
                                                        onChange={() => toggleGrupo("indicadores")}
                                                    />
                                                    <span>Indicadores</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.indicadores.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.indicadores.subChecks[key]}
                                                                onChange={() => toggleSubCheck("indicadores", key)}
                                                                disabled={grupos.indicadores.activo}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={grupos.hseq.activo}
                                                        onChange={() => toggleGrupo("hseq")}
                                                    />
                                                    <span>Hseq</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.hseq.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.hseq.subChecks[key]}
                                                                onChange={() => toggleSubCheck("hseq", key)}
                                                                disabled={grupos.hseq.activo}
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
                                                        checked={grupos.puntuacion.activo}
                                                        onChange={() => toggleGrupo("puntuacion")}
                                                    />
                                                    <span>Puntuacion</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.puntuacion.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.puntuacion.subChecks[key]}
                                                                onChange={() => toggleSubCheck("puntuacion", key)}
                                                                disabled={grupos.puntuacion.activo}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={grupos.operacion.activo}
                                                        onChange={() => toggleGrupo("operacion")}
                                                    />
                                                    <span>Operacion</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.operacion.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.operacion.subChecks[key]}
                                                                onChange={() => toggleSubCheck("operacion", key)}
                                                                disabled={grupos.operacion.activo}
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
                                                        checked={grupos.logistica.activo}
                                                        onChange={() => toggleGrupo("logistica")}
                                                    />
                                                    <span>Logistica</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.logistica.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.logistica.subChecks[key]}
                                                                onChange={() => toggleSubCheck("logistica", key)}
                                                                disabled={grupos.logistica.activo}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={grupos.administracion.activo}
                                                        onChange={() => toggleGrupo("administracion")}
                                                    />
                                                    <span>Administracion</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.administracion.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.administracion.subChecks[key]}
                                                                onChange={() => toggleSubCheck("administracion", key)}
                                                                disabled={grupos.administracion.activo}
                                                            />
                                                            <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <label className='subTitulo'>
                                                    <input
                                                        type="checkbox"
                                                        checked={grupos.parqueAutomotor.activo}
                                                        onChange={() => toggleGrupo("parqueAutomotor")}
                                                    />
                                                    <span>Parque Automotor</span>
                                                </label>

                                                <div className='lista'>
                                                    {Object.keys(grupos.parqueAutomotor.subChecks).map((key) => (
                                                        <label key={key} style={{ display: "block" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={grupos.parqueAutomotor.subChecks[key]}
                                                                onChange={() => toggleSubCheck("parqueAutomotor", key)}
                                                                disabled={grupos.parqueAutomotor.activo}
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
                                                onClick={() => EditarPagesUsuario()}
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
                                                EditarUsuario(usuarioEditado);
                                            }}>Guardar</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className='Notificaciones'>
                            <ToastContainer />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ControlUsuarios;
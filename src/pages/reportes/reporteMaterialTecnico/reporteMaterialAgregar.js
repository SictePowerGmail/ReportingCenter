import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './reporteMaterialAgregar.css'
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import Cookies from 'js-cookie';

const ReporteMaterialAgregar = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [dataKgprod, setDataKgprod] = useState(null);

    const [fecha, setFecha] = useState('');
    const cedulaUsuario = Cookies.get('userCedula');
    const nombreUsuario = Cookies.get('userNombre');
    const [otEntradaTexto, setOtEntradaTexto] = useState(Cookies.get('repMatOt'));
    const [movilEntradaTexto, setMovilEntradaTexto] = useState(Cookies.get('repMatMovil'));
    const [responsableEntradaTexto, setResponsableEntradaTexto] = useState(Cookies.get('repMatResponsable'));
    const [nodoEntradaTexto, setNodoEntradaTexto] = useState(Cookies.get('repMatNodo'));
    const [filasTabla, setFilasTabla] = useState([]);
    const tipoActividad = ['Instalacion', 'Desmonte'];
    const [tipo, setTipo] = useState('');
    const [codigoSap, setCodigoSap] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [serial, setSerial] = useState('');

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const enviarFormulario = async (event) => {

        event.preventDefault();

        if (!fecha) {
            toast.error('Se requiere recargar la pagina', { className: 'toast-error' });
            return;
        }

        if (!nombreUsuario) {
            toast.error('Por favor agregar la cedula del solicitante', { className: 'toast-error' });
            return;
        }

        if (!otEntradaTexto) {
            toast.error('Por favor agregar la OT', { className: 'toast-error' });
            return;
        }

        if (!movilEntradaTexto) {
            toast.error('Por favor agregar la movil', { className: 'toast-error' });
            return;
        }

        if (!responsableEntradaTexto) {
            toast.error('Por favor agregar el/los responsable(s)', { className: 'toast-error' });
            return;
        }

        if (!nodoEntradaTexto) {
            toast.error('Por favor agregar el nodo', { className: 'toast-error' });
            return;
        }

        if (filasTabla.some(fila =>
            !fila.tipo ||
            !fila.codigoSap ||
            !fila.descripcion ||
            !fila.unidadMedida ||
            !fila.cantidad ||
            !fila.serial
        )) {
            toast.error('Por favor completa todos los campos de la tabla', { className: 'toast-error' });
            return;
        }

        setEnviando(true)

        const fechaCorregida = formatDate(fecha);

        try {
            for (const fila of filasTabla) {
                const { tipo, codigoSap, descripcion, unidadMedida, cantidad, serial } = fila;

                await axios.post("https://sicteferias.from-co.net:8120/reporteMaterialTecnico/cargarDatosReporteMaterialTecnico", {
                    fecha: fechaCorregida,
                    cedula: cedulaUsuario,
                    nombre: nombreUsuario,
                    ot: otEntradaTexto,
                    movil: movilEntradaTexto,
                    responsable: responsableEntradaTexto,
                    nodo: nodoEntradaTexto,
                    tipoActividad: tipo,
                    codigoSap: codigoSap,
                    descripcion: descripcion,
                    unidadMedida: unidadMedida,
                    cantidad: cantidad,
                    serial: serial
                });
            }
            
            Cookies.set('repMatOt', "", { expires: 7 });
            Cookies.set('repMatMovil', "", { expires: 7 });
            Cookies.set('repMatResponsable', "", { expires: 7 });
            Cookies.set('repMatNodo', "", { expires: 7 });
            Cookies.set('repMatFilas', "", { expires: 7 });

            setEnviando(false)
            navigate('/ReporteMaterialPrincipal', { state: { estadoNotificacion: true } });
            console.log('Datos enviados exitosamente');

        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
        }
    };

    useEffect(() => {
        setFecha(new Date());

        const filasGuardadas = Cookies.get('repMatFilas');
        if (filasGuardadas) {
            setFilasTabla(JSON.parse(filasGuardadas));
        }

        CargarDatos();
    }, []);

    const agregarFila = () => {
        if (!tipo || !codigoSap || !descripcion || !unidadMedida || !cantidad || (!serialRequerido && !serial)) {
            alert("Todos los campos son obligatorios");
            return;
        }

        if (cantidad <= 0) {
            alert("La cantidad no puede ser menor o igual a 0");
            return;
        }

        let nuevaFila;
        if (serialRequerido && !serial) {
            nuevaFila = { tipo, codigoSap, descripcion, unidadMedida, cantidad, serial: "No requiere Serial" };
        } else {
            nuevaFila = { tipo, codigoSap, descripcion, unidadMedida, cantidad, serial };
        }
        
        const filasActualizadas = [...filasTabla, nuevaFila];
        Cookies.set('repMatFilas', JSON.stringify(filasActualizadas), { expires: 7 });
        setFilasTabla(filasActualizadas);

        setTipo('');
        setCodigoSap('');
        setDescripcion('');
        setUnidadMedida('');
        setCantidad('');
        setSerial('');
    };

    const borrarFila = (index) => {
        const nuevasFilas = filasTabla.filter((_, i) => i !== index);
        Cookies.set('repMatFilas', JSON.stringify(nuevasFilas), { expires: 7 });
        setFilasTabla(nuevasFilas);
    };

    const [opcionesCodigo, setOpcionesCodigo] = useState([]);
    const [opcionesDescripcion, setOpcionesDescripcion] = useState([]);
    const [serialRequerido, setSerialRequerido] = useState(true);

    const CargarDatos = async () => {
        try {
            const responseKgprod = await axios.get('https://sicteferias.from-co.net:8120/bodega/kgprod');
            let ciudad = ['KGPROD_RED_BOG'];

            const datosFiltradosKgprod = ciudad.length ? responseKgprod.data.filter(item => ciudad.includes(item.bodega)) : responseKgprod.data;
            setDataKgprod(datosFiltradosKgprod);

            setLoading(false);

        } catch (error) {
            toast.error(`Error: ${error}`, { className: 'toast-error' });
        }
    }

    useEffect(() => {
        if (dataKgprod) {
            const opcionesCodigos = Array.from(new Set(dataKgprod.map((item) => item.codigo))).sort();
            const opcionesDescripciones = Array.from(new Set(dataKgprod.map((item) => item.descrip))).sort();
            setOpcionesCodigo(opcionesCodigos);
            setOpcionesDescripcion(opcionesDescripciones);
        }
    }, [dataKgprod]);

    const handleCodigoSapChange = (e) => {
        const valor = e.target.value;
        setCodigoSap(valor);

        const material = dataKgprod.find((item) => item.codigo === valor);
        if (material) {
            setDescripcion(material.descrip);
            setUnidadMedida(material.unimed)
            if (material.serial === "S") {
                setSerialRequerido(false);
            } else if (material.serial === "N") {
                setSerialRequerido(true);
            }
        } else {
            setDescripcion('');
            setUnidadMedida('')
            setSerialRequerido(true);
        }
    };

    const handleDescripcionChange = (e) => {
        const valor = e.target.value;
        setDescripcion(valor);

        const material = dataKgprod.find((item) => item.descrip === valor);
        if (material) {
            setCodigoSap(material.codigo);
            setUnidadMedida(material.unimed)
            if (material.serial === "S") {
                setSerialRequerido(false);
            } else if (material.serial === "N") {
                setSerialRequerido(true);
            }
        } else {
            setCodigoSap('');
            setUnidadMedida('')
            setSerialRequerido(true);
        }
    };

    const [mostrarOpcionesCodigo, setMostrarOpcionesCodigo] = useState(false);
    const [mostrarOpcionesDescripcion, setMostrarOpcionesDescripcion] = useState(false);

    return (
        <div className="reporteMaterialAgregar">
            {loading ? (
                <div id="CargandoPagina">
                    <ThreeDots
                        type="ThreeDots"
                        color="#0B1A46"
                        height={200}
                        width={200}
                    />
                    <p>... Cargando Datos ...</p>
                </div>
            ) : (
                <div className='Contenido'>
                    {enviando ? (
                        <div id="CargandoPagina">
                            <ThreeDots
                                type="ThreeDots"
                                color="#0B1A46"
                                height={200}
                                width={200}
                            />
                            <p>... Enviando Datos ...</p>
                        </div>
                    ) : (
                        <form className='Formulario'>
                            <div className='Titulo'>
                                <h3>Reporte de Material Tecnico</h3>
                            </div>

                            <div className='contenido'>
                                <div className='Fecha'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Fecha Solicitud</h5>
                                    </div>
                                    <input type="text" disabled
                                        value={fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    />
                                </div>

                                <div className='Solicitante'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Nombre Solicitante</h5>
                                    </div>
                                    <input type="text" disabled
                                        value={nombreUsuario}
                                    />
                                </div>

                                <div className='Ot'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>OT</h5>
                                    </div>
                                    <input type="text"
                                        value={otEntradaTexto}
                                        placeholder="Digite la OT"
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setOtEntradaTexto(valor);
                                            Cookies.set('repMatOt', event.target.value, { expires: 7 });
                                        }}
                                    />
                                </div>

                                <div className='Movil'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Movil</h5>
                                    </div>
                                    <input type="text"
                                        value={movilEntradaTexto}
                                        placeholder="Digite la Movil"
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setMovilEntradaTexto(valor);
                                            Cookies.set('repMatMovil', event.target.value, { expires: 7 });
                                        }}
                                    />
                                </div>

                                <div className='Responsable'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Responsable</h5>
                                    </div>
                                    <input type="text"
                                        value={responsableEntradaTexto}
                                        placeholder="Digite el responsable"
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setResponsableEntradaTexto(valor);
                                            Cookies.set('repMatResponsable', event.target.value, { expires: 7 });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className='contenido'>
                                <div className='Nodo'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Nodo</h5>
                                    </div>
                                    <input type="text"
                                        value={nodoEntradaTexto}
                                        placeholder="Digite el nodo"
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setNodoEntradaTexto(valor);
                                            Cookies.set('repMatNodo', event.target.value, { expires: 7 });
                                        }}
                                    />
                                </div>

                                <div className='CuadroAjuste'></div>

                                <div className='CuadroAjuste'></div>

                                <div className='CuadroAjuste'></div>

                                <div className='CuadroAjuste'></div>
                            </div>

                            <div className='lineaHorizaontal'></div>

                            <div className='SubTitulo'>
                                <h4>Agregar Material</h4>
                            </div>

                            <div className="Tabla Agregar">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Tipo de Actividad</th>
                                            <th>Codigo SAP</th>
                                            <th>Descripción del Material</th>
                                            <th>Unidad de Medida</th>
                                            <th>Cantidad</th>
                                            <th>Serial</th>
                                            <th>Accion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td data-label="Tipo de Actividad">
                                                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                                                    <option value="">Seleccione</option>
                                                    {tipoActividad.map((actividad) => (
                                                        <option key={actividad} value={actividad}>{actividad}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td data-label="Codigo SAP">
                                                <input
                                                    type="text"
                                                    value={codigoSap}
                                                    onChange={(e) => handleCodigoSapChange(e)}
                                                    onFocus={() => setMostrarOpcionesCodigo(true)}
                                                    onBlur={() => setTimeout(() => setMostrarOpcionesCodigo(false), 200)}
                                                />
                                                {mostrarOpcionesCodigo && (
                                                    <ul>
                                                        {opcionesCodigo
                                                            .filter((codigo) => codigo.toLowerCase().includes(codigoSap.toLowerCase()))
                                                            .map((codigo) => (
                                                                <li
                                                                    key={codigo}
                                                                    style={{
                                                                        padding: '8px',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                    onMouseDown={() => {
                                                                        setCodigoSap(codigo);
                                                                        const material = dataKgprod.find((item) => item.codigo === codigo);
                                                                        if (material) {
                                                                            setDescripcion(material.descrip);
                                                                            setUnidadMedida(material.unimed);
                                                                            if (material.serial === "S") {
                                                                                setSerialRequerido(false);
                                                                            } else if (material.serial === "N") {
                                                                                setSerialRequerido(true);
                                                                            }
                                                                        }
                                                                        setMostrarOpcionesCodigo(false);
                                                                    }}
                                                                >
                                                                    {codigo}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </td>
                                            <td data-label="Descripción del Material">
                                                <input
                                                    type="text"
                                                    value={descripcion}
                                                    onChange={(e) => handleDescripcionChange(e)}
                                                    onFocus={() => setMostrarOpcionesDescripcion(true)}
                                                    onBlur={() => setTimeout(() => setMostrarOpcionesDescripcion(false), 200)}
                                                />
                                                {mostrarOpcionesDescripcion && (
                                                    <ul>
                                                        {opcionesDescripcion
                                                            .filter((desc) => desc.toLowerCase().includes(descripcion.toLowerCase()))
                                                            .map((desc) => (
                                                                <li
                                                                    key={desc}
                                                                    style={{
                                                                        padding: '8px',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                    onMouseDown={() => {
                                                                        setDescripcion(desc);
                                                                        const material = dataKgprod.find((item) => item.descrip === desc);
                                                                        if (material) {
                                                                            setCodigoSap(material.codigo);
                                                                            setUnidadMedida(material.unimed);
                                                                            if (material.serial === "S") {
                                                                                setSerialRequerido(false);
                                                                            } else if (material.serial === "N") {
                                                                                setSerialRequerido(true);
                                                                            }
                                                                        }
                                                                        setMostrarOpcionesDescripcion(false);
                                                                    }}
                                                                >
                                                                    {desc}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </td>
                                            <td data-label="Unidad de Medida"><input type="text" value={unidadMedida} disabled /></td>
                                            <td data-label="Cantidad"><input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" /></td>
                                            <td data-label="Serial"><input type="text" value={serial} onChange={(e) => setSerial(e.target.value)} disabled={serialRequerido} /></td>
                                            <td data-label="Acción"><button className='Agregar' onClick={agregarFila}>Agregar</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {filasTabla.length > 0 && (
                                <>
                                    <div className='lineaHorizaontal'></div>

                                    <div className='SubTitulo'>
                                        <h4>Material Agregado</h4>
                                    </div>

                                    <div className="Tabla Agregados">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Tipo de Actividad</th>
                                                    <th>Codigo SAP</th>
                                                    <th>Descripción del Material</th>
                                                    <th>Unidad de Medida</th>
                                                    <th>Cantidad</th>
                                                    <th>Serial</th>
                                                    <th>Accion</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filasTabla.map((fila, index) => (
                                                    <tr key={index}>
                                                        <td>{fila.tipo}</td>
                                                        <td>{fila.codigoSap}</td>
                                                        <td>{fila.descripcion}</td>
                                                        <td>{fila.unidadMedida}</td>
                                                        <td>{fila.cantidad}</td>
                                                        <td>{fila.serial}</td>
                                                        <td><button className='Borrar' onClick={() => borrarFila(index)}>Borrar</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className='Enviar'>
                                        <button type="submit" id='Enviar' onClick={enviarFormulario} className="btn btn-primary">Enviar</button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReporteMaterialAgregar;
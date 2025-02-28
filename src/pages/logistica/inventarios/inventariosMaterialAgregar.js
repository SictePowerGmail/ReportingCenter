import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './inventariosMaterialAgregar.css'
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import SignatureCanvas from "react-signature-canvas";


const InventariosMaterialAgregar = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [dataKgprod, setDataKgprod] = useState(null);
    const [dataLconsum, setDataLconsum] = useState(null);
    const [fecha, setFecha] = useState('');
    const cedulaUsuario = Cookies.get('userCedula');
    const nombreUsuario = Cookies.get('userNombre');
    const [codigoMovilEntradaTexto, setCodigoMovilEntradaTexto] = useState(Cookies.get('invMatCodMovil'));
    const [movilEntradaTexto, setMovilEntradaTexto] = useState(Cookies.get('invMatMovil'));
    const [responsableEntradaTexto, setResponsableEntradaTexto] = useState(Cookies.get('invMatResponsable'));
    const [filasTabla, setFilasTabla] = useState([]);
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

        if (!codigoMovilEntradaTexto) {
            toast.error('Por favor agregar la movil', { className: 'toast-error' });
            return;
        }

        if (!movilEntradaTexto) {
            toast.error('Por favor agregar la movil', { className: 'toast-error' });
            return;
        }

        if (!responsableEntradaTexto) {
            toast.error('Por favor agregar la movil', { className: 'toast-error' });
            return;
        }

        if (filasTabla.some(fila =>
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
                const { codigoSap, descripcion, unidadMedida, cantidad, serial } = fila;
                
                await axios.post(`${process.env.REACT_APP_API_URL}/inventarioMaterial/cargarDatos`, {
                    fecha: fechaCorregida,
                    cedula: cedulaUsuario,
                    nombre: nombreUsuario,
                    codigoMovil: codigoMovilEntradaTexto,
                    movil: movilEntradaTexto,
                    responsable: responsableEntradaTexto,
                    codigoSap: codigoSap,
                    descripcion: descripcion,
                    unidadMedida: unidadMedida,
                    cantidad: cantidad,
                    serial: serial
                });
            }

            Cookies.set('invMatCodMovil', "", { expires: 7 });
            Cookies.set('invMatMovil', "", { expires: 7 });
            Cookies.set('invMatResponsable', "", { expires: 7 });
            Cookies.set('invMatFilas', "", { expires: 7 });

            setEnviando(false)
            navigate('/InventariosMaterialPrincipal', { state: { estadoNotificacion: true } });
            console.log('Datos enviados exitosamente');

        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
        }
    };

    useEffect(() => {
        setFecha(new Date());

        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/InventariosMaterialLogin', { state: { estadoNotificacion: false } });
        }

        const filasGuardadas = Cookies.get('invMatFilas');
        if (filasGuardadas) {
            setFilasTabla(JSON.parse(filasGuardadas));
        }

        CargarDatos();
    }, []);

    const agregarFila = () => {
        if (!codigoSap || !descripcion || !unidadMedida || !cantidad || (!serialRequerido && !serial)) {
            toast.error('Todos los campos son obligatorios', { className: 'toast-error' });
            return;
        }

        if (cantidad <= 0) {
            toast.error('La cantidad no puede ser menor o igual a 0', { className: 'toast-error' });
            return;
        }

        let nuevaFila;
        if (serialRequerido && !serial) {
            nuevaFila = { codigoSap, descripcion, unidadMedida, cantidad, serial: "No requiere Serial" };
        } else {
            nuevaFila = { codigoSap, descripcion, unidadMedida, cantidad, serial };
        }

        const filasActualizadas = [...filasTabla, nuevaFila];
        Cookies.set('invMatFilas', JSON.stringify(filasActualizadas), { expires: 7 });
        setFilasTabla(filasActualizadas);

        setCodigoSap('');
        setDescripcion('');
        setUnidadMedida('');
        setCantidad('');
        setSerial('');
    };

    const borrarFila = (index) => {
        const nuevasFilas = filasTabla.filter((_, i) => i !== index);
        Cookies.set('invMatFilas', JSON.stringify(nuevasFilas), { expires: 7 });
        setFilasTabla(nuevasFilas);
    };

    const [opcionesMovil, setOpcionesMovil] = useState([]);
    const [opcionesCodigo, setOpcionesCodigo] = useState([]);
    const [opcionesDescripcion, setOpcionesDescripcion] = useState([]);
    const [serialRequerido, setSerialRequerido] = useState(true);

    const CargarDatos = async () => {
        try {
            const responseKgprod = await axios.get(`${process.env.REACT_APP_API_URL}/bodega/kgprod`);
            let ciudadKgprod = ['KGPROD_RED_BOG'];

            const datosFiltradosKgprod = ciudadKgprod.length ? responseKgprod.data.filter(item => ciudadKgprod.includes(item.bodega)) : responseKgprod.data;
            setDataKgprod(datosFiltradosKgprod);

            const responseLconsum = await axios.get(`${process.env.REACT_APP_API_URL}/bodega/lconsum`);
            let ciudadLconsum = ['LCONSUM_RED_BOG'];

            const datosFiltradosLconsum = ciudadLconsum.length ? responseLconsum.data.filter(item => ciudadLconsum.includes(item.bodega)) : responseLconsum.data;
            setDataLconsum(datosFiltradosLconsum);

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

    useEffect(() => {
        if (dataLconsum) {
            const opcionesMoviles = Array.from(new Set(dataLconsum.map((item) => item.nombre))).sort();
            setOpcionesMovil(opcionesMoviles);
        }
    }, [dataLconsum]);

    const handleMovilChange = (e) => {
        const valor = e.target.value;
        setMovilEntradaTexto(valor);
        Cookies.set('invMatMovil', e.target.value, { expires: 7 });

        const consumidor = dataLconsum.find((item) => item.nombre === valor);
        if (consumidor) {
            setCodigoMovilEntradaTexto(consumidor.llave);
            Cookies.set('invMatCodMovil', consumidor.llave, { expires: 7 });
            setResponsableEntradaTexto(consumidor.responsable)
            Cookies.set('invMatResponsable', consumidor.responsable, { expires: 7 });
        } else {
            setCodigoMovilEntradaTexto('');
            setResponsableEntradaTexto('')
        }
    };

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

    const [mostrarOpcionesMovil, setMostrarOpcionesMovil] = useState(false);
    const [mostrarOpcionesCodigo, setMostrarOpcionesCodigo] = useState(false);
    const [mostrarOpcionesDescripcion, setMostrarOpcionesDescripcion] = useState(false);



    const sigCanvas = useRef(null);

    // Limpiar la firma
    const clear = () => {
        sigCanvas.current.clear();
    };

    // Guardar la firma como imagen
    const save = () => {
        const dataURL = sigCanvas.current.toDataURL();
        console.log(dataURL); // Esto contiene la imagen como base64
    };

    return (
        <div className="inventarioMaterialAgregar">
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
                                <h3>Inventario de Material</h3>
                            </div>

                            <div className='contenido'>
                                <div className='Fecha'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Fecha Inventario</h5>
                                    </div>
                                    <input type="text" disabled
                                        value={fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    />
                                </div>

                                <div className='Solicitante'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Nombre Responsable</h5>
                                    </div>
                                    <input type="text" disabled
                                        value={nombreUsuario}
                                    />
                                </div>

                                <div className='CodigoMovil'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Codigo Movil</h5>
                                    </div>
                                    <input type="text"
                                        value={codigoMovilEntradaTexto}
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setCodigoMovilEntradaTexto(valor);
                                            Cookies.set('invMatCodMovil', event.target.value, { expires: 7 });
                                        }}
                                        disabled
                                    />
                                </div>

                                <div className='Movil'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Movil</h5>
                                    </div>
                                    <input
                                        type="text"
                                        value={movilEntradaTexto}
                                        placeholder="Digite la Movil"
                                        onChange={(e) => handleMovilChange(e)}
                                        onFocus={() => setMostrarOpcionesMovil(true)}
                                        onBlur={() => setTimeout(() => setMostrarOpcionesMovil(false), 200)}
                                    />
                                    {mostrarOpcionesMovil && (
                                        <ul>
                                            {opcionesMovil
                                                .filter((nombre) => nombre.toLowerCase().includes(nombre.toLowerCase()))
                                                .map((nombre) => (
                                                    <li
                                                        key={nombre}
                                                        style={{
                                                            padding: '8px',
                                                            cursor: 'pointer',
                                                        }}
                                                        onMouseDown={() => {
                                                            setMovilEntradaTexto(nombre);
                                                            Cookies.set('invMatMovil', nombre, { expires: 7 });
                                                            const data = dataLconsum.find((item) => item.nombre === nombre);
                                                            if (data) {
                                                                setCodigoMovilEntradaTexto(data.llave);
                                                                Cookies.set('invMatCodMovil', data.llave, { expires: 7 });
                                                                setResponsableEntradaTexto(data.responsable)
                                                                Cookies.set('invMatResponsable', data.responsable, { expires: 7 });
                                                            }
                                                            setMostrarOpcionesMovil(false);
                                                        }}
                                                    >
                                                        {nombre}
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>

                                <div className='Responsable'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Responsable</h5>
                                    </div>
                                    <input type="text"
                                        value={responsableEntradaTexto}
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setResponsableEntradaTexto(valor);
                                            Cookies.set('invMatResponsable', event.target.value, { expires: 7 });
                                        }}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className='lineaHorizaontal'></div>

                            <div className='SubTitulo'>
                                <h4>Agregar Material</h4>
                            </div>

                            <div className="Tabla Agregar">
                                <table>
                                    <thead>
                                        <tr>
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
                                                        <td data-label="Codigo Sap"><span>{fila.codigoSap}</span></td>
                                                        <td data-label="Descripion del Material"><span>{fila.descripcion}</span></td>
                                                        <td data-label="Unidad de Medida"><span>{fila.unidadMedida}</span></td>
                                                        <td data-label="Cantidad"><span>{fila.cantidad}</span></td>
                                                        <td data-label="Serial"><span>{fila.serial}</span></td>
                                                        <td data-label="Accion"><span><button className='Borrar' onClick={() => borrarFila(index)}>Borrar</button></span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div>
                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            penColor="black"
                                            canvasProps={{
                                                width: 400,
                                                height: 200,
                                                className: "signatureCanvas"
                                            }}
                                        />
                                        <div>
                                            <button onClick={clear}>Limpiar</button>
                                            <button onClick={save}>Guardar</button>
                                        </div>
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

export default InventariosMaterialAgregar;
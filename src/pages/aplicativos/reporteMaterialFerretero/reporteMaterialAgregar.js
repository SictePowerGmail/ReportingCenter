import React, { useState, useEffect, useRef } from 'react';
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
import SignatureCanvas from "react-signature-canvas";

const ReporteMaterialAgregar = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [dataKgprod, setDataKgprod] = useState(null);
    const [dataLconsum, setDataLconsum] = useState(null);

    const [fecha, setFecha] = useState('');
    const cedulaUsuario = Cookies.get('userCedula');
    const nombreUsuario = Cookies.get('userNombre');
    const [otsExistentes, setOtsExistentes] = useState([]);
    const [otEntradaTexto, setOtEntradaTexto] = useState(Cookies.get('repMatOt'));
    const [codigoMovilEntradaTexto, setCodigoMovilEntradaTexto] = useState(Cookies.get('repMatCodMovil'));
    const [movilEntradaTexto, setMovilEntradaTexto] = useState(Cookies.get('repMatMovil'));
    const [responsableEntradaTexto, setResponsableEntradaTexto] = useState(Cookies.get('repMatResponsable'));
    const [nodoEntradaTexto, setNodoEntradaTexto] = useState(Cookies.get('repMatNodo'));
    const [filasTabla, setFilasTabla] = useState([]);
    const [codigoSap, setCodigoSap] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [serial, setSerial] = useState('');
    const [firma, setFirma] = useState(null);

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const formatDate2 = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}-${minutes}`;
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

        if (otsExistentes.includes(otEntradaTexto)) {
            toast.error('La OT ingresada ya existe.', { className: 'toast-error' });
            return;
        }

        if (!codigoMovilEntradaTexto) {
            toast.error('Por favor agregar el codigo de la movil', { className: 'toast-error' });
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
            !fila.codigoSap ||
            !fila.descripcion ||
            !fila.unidadMedida ||
            !fila.cantidad ||
            !fila.serial
        )) {
            toast.error('Por favor completa todos los campos de la tabla', { className: 'toast-error' });
            return;
        }

        try {
            const result = await validarImagen();
            if (!result) {
                toast.error('Por favor firmar con Nombre y Cedula.', { className: 'toast-error' });
                return;
            }

        } catch (error) {
            toast.error(`Hubo un error al validar la imagen: ${error.message || error}`, { className: 'toast-error' });
        }

        setEnviando(true)

        const fechaCorregida = formatDate(fecha);
        const fechaCorregidaImagen = formatDate2(fecha);
        const nombreImagen = `${fechaCorregidaImagen}_${otEntradaTexto}_${nombreUsuario}.png`

        try {
            for (const fila of filasTabla) {
                const { codigoSap, descripcion, unidadMedida, cantidad, serial } = fila;
                
                await axios.post(`${process.env.REACT_APP_API_URL}/reporteFerretero/crearRegistro`, {
                    fecha: fechaCorregida,
                    cedula: cedulaUsuario,
                    nombre: nombreUsuario,
                    ot: otEntradaTexto,
                    codigoMovil: codigoMovilEntradaTexto,
                    movil: movilEntradaTexto,
                    responsable: responsableEntradaTexto,
                    nodo: nodoEntradaTexto,
                    codigoSap: codigoSap,
                    descripcion: descripcion,
                    unidadMedida: unidadMedida,
                    cantidad: cantidad,
                    serial: serial,
                    firma: nombreImagen,
                });
            }

            const blob = await (await fetch(firma)).blob(); // Convierte el DataURL a un Blob
            const file = new File([blob], 'firma.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('filename', nombreImagen);
            
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/reporteFerretero/cargarImagen`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 200) {
                    console.log('Imagen enviada correctamente');
                } else {
                    console.error('Error al enviar la imagen');
                }
            } catch (error) {
                console.error('Error al enviar la imagen:', error);
            }

            Cookies.set('repMatOt', "", { expires: 7 });
            Cookies.set('repMatCodMovil', "", { expires: 7 });
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

        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/MaterialLogin', { state: { estadoNotificacion: false } });
        }

        const filasGuardadas = Cookies.get('repMatFilas');
        if (filasGuardadas) {
            setFilasTabla(JSON.parse(filasGuardadas));
        }

        CargarDatos();
    }, []);

    const agregarFila = () => {
        if (!codigoSap || !descripcion || !unidadMedida || !cantidad || (!serialRequerido && !serial)) {
            alert("Todos los campos son obligatorios");
            return;
        }

        if (cantidad <= 0) {
            alert("La cantidad no puede ser menor o igual a 0");
            return;
        }

        let nuevaFila;
        if (serialRequerido && !serial) {
            nuevaFila = { codigoSap, descripcion, unidadMedida, cantidad, serial: "No requiere Serial" };
        } else {
            nuevaFila = { codigoSap, descripcion, unidadMedida, cantidad, serial };
        }

        const filasActualizadas = [...filasTabla, nuevaFila];
        Cookies.set('repMatFilas', JSON.stringify(filasActualizadas), { expires: 7 });
        setFilasTabla(filasActualizadas);

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

    const [opcionesMovil, setOpcionesMovil] = useState([]);
    const [opcionesCodigo, setOpcionesCodigo] = useState([]);
    const [opcionesDescripcion, setOpcionesDescripcion] = useState([]);
    const [serialRequerido, setSerialRequerido] = useState(true);

    const CargarDatos = async () => {
        try {
            const responseKgprod = await axios.get(`${process.env.REACT_APP_API_URL}/reporteFerretero/kgprod`);
            let ciudadKgprod = ['KGPROD_RED_BOG'];

            const datosFiltradosKgprod = ciudadKgprod.length ? responseKgprod.data.filter(item => ciudadKgprod.includes(item.Bodega) && item.ind_comprado_2 === 'S') : responseKgprod.data;
            setDataKgprod(datosFiltradosKgprod);

            const responseLconsum = await axios.get(`${process.env.REACT_APP_API_URL}/reporteFerretero/lconsum`);
            let ciudadLconsum = ['LCONSUM_RED_BOG'];

            const datosFiltradosLconsum = ciudadLconsum.length ? responseLconsum.data.filter(item => ciudadLconsum.includes(item.Bodega)) : responseLconsum.data;
            setDataLconsum(datosFiltradosLconsum);

            const responseReportes = await axios.get(`${process.env.REACT_APP_API_URL}/reporteFerretero/registros`)
            const ots = responseReportes.data.map(item => item.ot);
            setOtsExistentes(ots);

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
        Cookies.set('repMatMovil', e.target.value, { expires: 7 });

        const consumidor = dataLconsum.find((item) => item.nombre === valor);
        if (consumidor) {
            setCodigoMovilEntradaTexto(consumidor.llave);
            Cookies.set('repMatCodMovil', consumidor.llave, { expires: 7 });
            setResponsableEntradaTexto(consumidor.responsable)
            Cookies.set('repMatResponsable', consumidor.responsable, { expires: 7 });
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

    const handleOtChange = (event) => {
        const valor = event.target.value;
        setOtEntradaTexto(valor);

        if (otsExistentes.includes(valor)) {
            toast.error('La OT ingresada ya existe.', { className: 'toast-error' });
            return;
        }

        Cookies.set('repMatOt', valor, { expires: 7 });
    };

    const sigCanvas = useRef(null);

    const clear = () => {
        sigCanvas.current.clear();
    };

    const validarImagen = async () => {
        const dataURL = sigCanvas.current.toDataURL();
        const img = new Image();
        img.src = dataURL;

        return new Promise((resolve, reject) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;

                let hasBlackPixel = false;

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];

                    if (r === 0 && g === 0 && b === 0 && a !== 0) {
                        hasBlackPixel = true;
                        break;
                    }
                }

                resolve(hasBlackPixel);
            };

            img.onerror = (error) => {
                reject(error);
            };
        });
    };

    const guardarFirmaEnCambio = () => {
        if (sigCanvas.current) {
            const dataURL = sigCanvas.current.toDataURL();
            setFirma(dataURL);
        }
    };

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
                                        <i className="fas fa-user"></i>
                                        <h5>Nombre Supervisor</h5>
                                    </div>
                                    <input type="text" disabled
                                        value={nombreUsuario}
                                    />
                                </div>

                                <div className='Ot'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-tools"></i>
                                        <h5>OT</h5>
                                    </div>
                                    <input type="text"
                                        value={otEntradaTexto}
                                        placeholder="Digite la OT"
                                        onChange={handleOtChange}
                                    />
                                </div>

                                <div className='CodigoMovil'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-tag"></i>
                                        <h5>Codigo Movil</h5>
                                    </div>
                                    <input type="text"
                                        value={codigoMovilEntradaTexto}
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setCodigoMovilEntradaTexto(valor);
                                            Cookies.set('repMatCodMovil', event.target.value, { expires: 7 });
                                        }}
                                        disabled
                                    />
                                </div>

                                <div className='Movil'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-car"></i>
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
                                                            Cookies.set('repMatMovil', nombre, { expires: 7 });
                                                            const data = dataLconsum.find((item) => item.nombre === nombre);
                                                            if (data) {
                                                                setCodigoMovilEntradaTexto(data.llave);
                                                                Cookies.set('repMatCodMovil', data.llave, { expires: 7 });
                                                                setResponsableEntradaTexto(data.responsable)
                                                                Cookies.set('repMatResponsable', data.responsable, { expires: 7 });
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
                            </div>

                            <div className='contenido'>
                                <div className='Responsable'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-user-check"></i>
                                        <h5>Responsable</h5>
                                    </div>
                                    <input type="text"
                                        value={responsableEntradaTexto}
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setResponsableEntradaTexto(valor);
                                            Cookies.set('repMatResponsable', event.target.value, { expires: 7 });
                                        }}
                                        disabled
                                    />
                                </div>

                                <div className='Nodo'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-project-diagram"></i>
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

                                    <div className='lineaHorizaontal'></div>

                                    <div className='SubTitulo'>
                                        <h4>A continuacion firme con Nombre y Cedula</h4>
                                    </div>

                                    <div className='firmaSupervisor'>
                                        <div className="canvasWrapper">
                                            <SignatureCanvas
                                                ref={sigCanvas}
                                                penColor="black"
                                                canvasProps={{
                                                    className: "signatureCanvas"
                                                }}
                                                onEnd={guardarFirmaEnCambio}
                                            />
                                        </div>
                                        <div className='botones'>
                                            <button className='btn btn-secondary' onClick={clear}>Limpiar</button>
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

export default ReporteMaterialAgregar;
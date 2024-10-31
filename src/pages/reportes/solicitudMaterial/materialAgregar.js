import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialAgregar.css'
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import Cookies from 'js-cookie';

const MaterialAgregar = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [dataKgprod, setDataKgprod] = useState(null);
    const [fecha, setFecha] = useState('');
    const cedulaUsuario = Cookies.get('userCedula');
    const nombreUsuario = Cookies.get('userNombre');
    const [ciudadesEntradaTexto, setCiudadesEntradaTexto] = useState(Cookies.get('solMatCiudad'));
    const [ciudadesSugerencias, setCiudadesSugerencias] = useState([]);
    const Ciudades = ['Armenia', 'Bogota', 'Manizales', 'Pereira'];
    const [ciudadElgida, setCiudadElgida] = useState(Cookies.get('solMatCiudad'));
    const [uuidEntradaTexto, setUuidEntradaTexto] = useState(Cookies.get('solMatUUID'));
    const [nombreProyetoEntradaTexto, setNombreProyetoEntradaTexto] = useState(Cookies.get('solMatNombreProyecto'));
    const [entregaProyetoEntradaTexto, setEntregaProyetoEntradaTexto] = useState(Cookies.get('solMatEntregaProyectada'));
    const [diseñoArchivo, setDiseñoArchivo] = useState('');
    const [kmzArchivo, setKmzArchivo] = useState('');
    const [filasTabla, setFilasTabla] = useState([{ propiedad: '', codigoSap: '', descripcion: '', unidadMedida: '', cantidadDisponible: '', cantidadSolicitada: '' }]);
    const propiedades = ['Sicte', 'Claro'];
    const [descripciones, setDescripciones] = useState('');
    const [sugerenciasPorFila, setSugerenciasPorFila] = useState([]);
    const [codigoSap, setCodigoSap] = useState(Array(filasTabla.length).fill(""));
    const [unidadMedida, setUnidadMedida] = useState(Array(filasTabla.length).fill(""));
    const [cantidadDisponible, setCantidadDisponible] = useState(Array(filasTabla.length).fill(""));
    const [enviando, setEnviando] = useState(false);

    const accionCambioEntradaTextoTabla = (index, field, value) => {
        const actualizarFilas = [...filasTabla];
        actualizarFilas[index][field] = value;
        setFilasTabla(actualizarFilas);
    };

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

        return `${year}-${month}-${day}`;
    };

    const formatDate3 = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}-${minutes}`;
    };

    const enviarFormulario = async (event) => {

        event.preventDefault();
        setError('');

        if (!nombreUsuario) {
            toast.error('Por favor agregar la cedula del solicitante', { className: 'toast-error' });
            return;
        }

        if (!ciudadElgida) {
            toast.error('Por favor agregar la ciudad', { className: 'toast-error' });
            return;
        }

        if (!diseñoArchivo) {
            toast.error('Por favor agregar el diseño', { className: 'toast-error' });
            return;
        }

        if (!kmzArchivo) {
            toast.error('Por favor agrega el kmz', { className: 'toast-error' });
            return;
        }

        if (!uuidEntradaTexto) {
            toast.error('Por favor agregar el UUID', { className: 'toast-error' });
            return;
        }

        if (!uuidEntradaTexto.includes('-')) {
            toast.error('El UUID debe contener al menos un guion', { className: 'toast-error' });
            return;
        }

        if (!nombreProyetoEntradaTexto) {
            toast.error('Por favor agregar el nombre del proyecto', { className: 'toast-error' });
            return;
        }

        if (!entregaProyetoEntradaTexto) {
            toast.error('Por favor agregar la fecha proyectada del proyecto', { className: 'toast-error' });
            return;
        }

        if (!filasTabla || filasTabla.length === 0) {
            toast.error('Por favor agrega al menos una fila antes de enviar', { className: 'toast-error' });
            return;
        }

        if (filasTabla.some(fila =>
            fila.cantidadDisponible === "0"
        )) {
            const filaConCantidadCero = filasTabla.find(fila => fila.cantidadDisponible === "0");
            toast.error(`Cantidad Disponible en cero en el codigo sap ${filaConCantidadCero.codigoSap}`, { className: 'toast-error' });
            return;
        }

        if (filasTabla.some(fila =>
            !fila.propiedad ||
            !fila.codigoSap ||
            !fila.descripcion ||
            !fila.unidadMedida ||
            !fila.cantidadDisponible ||
            !fila.cantidadSolicitada
        )) {
            toast.error('Por favor completa todos los campos de la tabla', { className: 'toast-error' });
            return;
        }

        if (filasTabla.some(fila =>
            fila.cantidadSolicitada === "0"
        )) {
            toast.error('No se admiten solicitudes con cantidad en cero', { className: 'toast-error' });
            return;
        }

        setEnviando(true)

        const fechaCorregida = formatDate(fecha);
        const entregaProyectoCorregida = formatDate2(new Date(entregaProyetoEntradaTexto));
        const formattedDate = formatDate3(fecha);
        const formDataKmz = new FormData();
        const kmzNombre = `${formattedDate}_${kmzArchivo.name}`
        formDataKmz.append('file', kmzArchivo);
        formDataKmz.append("filename", kmzNombre);
        const formDataDiseño = new FormData();
        const diseñoNombre = `${formattedDate}_${diseñoArchivo.name}`
        formDataDiseño.append('file', diseñoArchivo);
        formDataDiseño.append("filename", diseñoNombre);

        try {
            for (const fila of filasTabla) {
                const { propiedad, codigoSap, descripcion, unidadMedida, cantidadDisponible, cantidadSolicitada } = fila;

                await axios.post("https://sicteferias.from-co.net:8120/solicitudMaterial/cargarDatos", {
                    fecha: fechaCorregida,
                    cedula: cedulaUsuario,
                    nombre: nombreUsuario,
                    ciudad: ciudadElgida,
                    diseño: diseñoNombre,
                    kmz: kmzNombre,
                    uuid: uuidEntradaTexto,
                    nombreProyecto: nombreProyetoEntradaTexto,
                    entregaProyecto: entregaProyectoCorregida,
                    propiedadMaterial: propiedad,
                    codigoSapMaterial: codigoSap,
                    descripcionMaterial: descripcion,
                    unidadMedidaMaterial: unidadMedida,
                    cantidadDisponibleMaterial: cantidadDisponible,
                    cantidadSolicitadaMaterial: cantidadSolicitada,
                    aprobacionDirector: "Pendiente",
                    aprobacionDireccionOperacion: "Pendiente",
                    entregaBodega: "Pendiente"
                });
            }

            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/cargarKmz', formDataKmz, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await axios.post('https://sicteferias.from-co.net:8120/solicitudMaterial/cargarDiseño', formDataDiseño, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setEnviando(false)
            navigate('/MaterialPrincipal', { state: { estadoNotificacion: true } });
            console.log('Datos enviados exitosamente');

        } catch (error) {
            console.error('Error al subir el archivo o enviar los datos:', error);
            toast.error('Error al subir el archivo o enviar los datos', { className: 'toast-error' });
        }
    };

    const cargarDatosKgprod = () => {
        axios.get('https://sicteferias.from-co.net:8120/bodega/kgprod')
            .then(response => {
                let ciudad;
                let datosFiltrados;

                if (ciudadElgida === "Manizales") {
                    ciudad = ['KGPROD_MZL'];
                } else if (ciudadElgida === "Pereira") {
                    ciudad = ['KGPROD_PER'];
                } else if (ciudadElgida === "Armenia") {
                    ciudad = ['KGPROD_ARM'];
                } else if (ciudadElgida === "Bogota") {
                    ciudad = ['KGPROD_CORP_BOG', 'KGPROD_RED_BOG'];
                } else {
                    ciudad = ''
                }

                if (ciudad === "") {
                    datosFiltrados = response.data;
                } else {
                    datosFiltrados = response.data.filter(item => ciudad.includes(item.bodega));
                }

                setDataKgprod(datosFiltrados);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
            });
    };

    useEffect(() => {
        setFecha(new Date());
        cargarDatosKgprod();
    }, []);

    useEffect(() => {
        cargarDatosKgprod();
    }, [ciudadesEntradaTexto]);

    return (
        <div className="materialAgregar">
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
                                <h3>Solicitud de Material</h3>
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

                                <div className='Ciudad'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Ciudad</h5>
                                    </div>
                                    <input type="text"
                                        value={ciudadesEntradaTexto}
                                        onChange={(event) => {
                                            setCiudadesEntradaTexto(event.target.value);
                                            const sugerenciasFiltradas = Ciudades.filter((option) =>
                                                option.toLowerCase().includes(event.target.value.toLowerCase())
                                            );
                                            setCiudadesSugerencias(sugerenciasFiltradas);
                                        }}
                                        onBlur={() => {
                                            if (!Ciudades.includes(ciudadesEntradaTexto)) {
                                                setCiudadesEntradaTexto('');
                                            }
                                        }}
                                        placeholder="Digite la Ciudad"
                                        disabled={Boolean(ciudadElgida)}
                                    />
                                    <div className="Sugerencias">
                                        {ciudadesSugerencias.map((sugerencia, index) => (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    Cookies.set('solMatCiudad', sugerencia, { expires: 7 });
                                                    setCiudadElgida(sugerencia);
                                                    setCiudadesEntradaTexto(sugerencia);
                                                    setCiudadesSugerencias([]);
                                                }}
                                                className="Sugerencia-item"
                                            >
                                                {sugerencia}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='ArchivoDiseño'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Cargar Diseño</h5>
                                    </div>
                                    <label className="Archivo">
                                        <input
                                            type="file"
                                            accept=".zip, .rar, .7z"
                                            onChange={(e) => setDiseñoArchivo(e.target.files[0])}
                                        />
                                        {diseñoArchivo ? (
                                            <span>{diseñoArchivo.name}</span>
                                        ) : (
                                            <span>Formatos ".zip, .rar, .7z"</span>
                                        )}
                                    </label>
                                </div>

                                <div className='ArchivoKMZ'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Cargar KMZ</h5>
                                    </div>
                                    <label className="Archivo">
                                        <input
                                            type="file"
                                            accept=".kmz"
                                            onChange={(e) => setKmzArchivo(e.target.files[0])}
                                        />
                                        {kmzArchivo ? (
                                            <span>{kmzArchivo.name}</span>
                                        ) : (
                                            <span>Formato ".kmz"</span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className='contenido'>
                                <div className='UUID'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>UUID</h5>
                                    </div>
                                    <input type="text"
                                        value={uuidEntradaTexto}
                                        placeholder="Digite el UUID"
                                        onChange={(event) => {
                                            const valor = event.target.value;
                                            setUuidEntradaTexto(valor);
                                            Cookies.set('solMatUUID', event.target.value, { expires: 7 });
                                        }}
                                        onBlur={() => {
                                            if (!uuidEntradaTexto.includes('-')) {
                                                toast.info('El UUID debe contener al menos un guion', { className: 'toast-error' });
                                            }
                                        }}
                                    />
                                </div>

                                <div className='NombreProyecto'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Nombre del Proyecto</h5>
                                    </div>
                                    <input type="text"
                                        value={nombreProyetoEntradaTexto}
                                        placeholder="Digite el Nombre del Proyecto"
                                        onChange={(event) => {
                                            setNombreProyetoEntradaTexto(event.target.value);
                                            Cookies.set('solMatNombreProyecto', event.target.value, { expires: 7 });
                                        }}
                                    />
                                </div>

                                <div className='EntregaProyecto'>
                                    <div className='Subtitulo'>
                                        <i className="fas fa-calendar-alt"></i>
                                        <h5>Entrega Proyectada UUID</h5>
                                    </div>
                                    <input
                                        type="date"
                                        value={entregaProyetoEntradaTexto}
                                        onChange={(e) => {
                                            setEntregaProyetoEntradaTexto(e.target.value);
                                            Cookies.set('solMatEntregaProyectada', e.target.value, { expires: 7 });
                                        }}
                                        placeholder="Seleccione una fecha"
                                    />
                                </div>

                                <div className='CuadroAjuste'></div>

                                <div className='CuadroAjuste'></div>
                            </div>

                            <div className='lineaHorizaontal'></div>

                            <div className="Tabla">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Propiedad del Material</th>
                                            <th>Codigo SAP</th>
                                            <th>Descripción del Material</th>
                                            <th>Unidad de Medida</th>
                                            <th>Cantidad Disponible</th>
                                            <th>Cantidad Solicitada</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filasTabla.map((fila, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <select
                                                        value={fila.propiedad}
                                                        onChange={(e) => {
                                                            const propiedad = e.target.value;
                                                            accionCambioEntradaTextoTabla(index, 'propiedad', propiedad);

                                                            let datosFiltrados;

                                                            if (propiedad === "Sicte") {
                                                                datosFiltrados = dataKgprod.filter(item => item.indComprado === "S");
                                                            } else if (propiedad === "Claro") {
                                                                datosFiltrados = dataKgprod.filter(item => item.indComprado === "N");
                                                            } else {
                                                                datosFiltrados = dataKgprod;
                                                            }

                                                            datosFiltrados.sort((a, b) => a.descrip.localeCompare(b.descrip));

                                                            const descripcionesUnicas = [...new Set(datosFiltrados.map(item => item.descrip))].sort();
                                                            setDescripciones(descripcionesUnicas);

                                                            const nuevaSugerenciasPorFila = [...sugerenciasPorFila];
                                                            nuevaSugerenciasPorFila[index] = datosFiltrados.map(item => item.descrip);
                                                            setSugerenciasPorFila(nuevaSugerenciasPorFila);
                                                        }}
                                                        disabled={!Boolean(ciudadElgida)}
                                                        required
                                                    >
                                                        <option value="">-- Seleccionar --</option>
                                                        {propiedades.map((propiedad, i) => (
                                                            <option key={i} value={propiedad}>
                                                                {propiedad}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <span>{codigoSap[index]}</span>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={fila.descripcion}
                                                        onChange={(event) => {
                                                            accionCambioEntradaTextoTabla(index, 'descripcion', event.target.value);
                                                            const sugerenciasFiltradas = descripciones.filter((option) =>
                                                                option.toLowerCase().includes(event.target.value.toLowerCase())
                                                            );
                                                            const nuevaSugerencias = [...sugerenciasPorFila];
                                                            nuevaSugerencias[index] = sugerenciasFiltradas;
                                                            setSugerenciasPorFila(nuevaSugerencias);
                                                        }}
                                                        onBlur={() => {
                                                            if (!descripciones.includes(fila.descripcion)) {
                                                                accionCambioEntradaTextoTabla(index, 'descripcion', '');
                                                            }
                                                        }}
                                                        placeholder="Digite la Descripción"
                                                        disabled={!fila.propiedad}
                                                        required
                                                    />
                                                    {fila.propiedad && (
                                                        <div className="Sugerencias">
                                                            {sugerenciasPorFila[index] && sugerenciasPorFila[index].map((sugerencia, i) => (
                                                                <div
                                                                    key={i}
                                                                    onClick={() => {
                                                                        accionCambioEntradaTextoTabla(index, 'descripcion', sugerencia);

                                                                        const elementoEncontrado = dataKgprod.find(item => item.descrip === sugerencia);
                                                                        const nuevaUnidadMedida = [...unidadMedida];
                                                                        nuevaUnidadMedida[index] = elementoEncontrado.unimed;
                                                                        setUnidadMedida(nuevaUnidadMedida);
                                                                        accionCambioEntradaTextoTabla(index, 'unidadMedida', elementoEncontrado.unimed);

                                                                        const nuevoCodigoSap = [...codigoSap];
                                                                        nuevoCodigoSap[index] = elementoEncontrado.codigo;
                                                                        setCodigoSap(nuevoCodigoSap);
                                                                        accionCambioEntradaTextoTabla(index, 'codigoSap', elementoEncontrado.codigo);

                                                                        const nuevoCantidadDisponible = [...cantidadDisponible];
                                                                        nuevoCantidadDisponible[index] = elementoEncontrado.candisp;
                                                                        setCantidadDisponible(nuevoCantidadDisponible);
                                                                        accionCambioEntradaTextoTabla(index, 'cantidadDisponible', elementoEncontrado.candisp);

                                                                        const nuevasSugerencias = [...sugerenciasPorFila];
                                                                        nuevasSugerencias[index] = [];
                                                                        setSugerenciasPorFila(nuevasSugerencias);
                                                                    }}
                                                                    className="Sugerencia-item"
                                                                >
                                                                    {sugerencia}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span>{unidadMedida[index]}</span>
                                                </td>
                                                <td>
                                                    <span>{cantidadDisponible[index]}</span>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={fila.cantidadSolicitada}
                                                        onChange={(e) => accionCambioEntradaTextoTabla(index, 'cantidadSolicitada', e.target.value)}
                                                        disabled={!fila.propiedad | cantidadDisponible[index] === "0"}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            const nuevasFilas = filasTabla.filter((_, i) => i !== index);
                                                            setFilasTabla(nuevasFilas);
                                                            setUnidadMedida(unidadMedida.filter((_, i) => i !== index));
                                                            setCodigoSap(codigoSap.filter((_, i) => i !== index));
                                                            setCantidadDisponible(cantidadDisponible.filter((_, i) => i !== index));
                                                        }}
                                                    >Borrar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div>
                                    <button
                                        onClick={() => {
                                            setFilasTabla([...filasTabla, { propiedad: '', codigoSap: '', descripcion: '', unidadMedida: '', cantidadDisponible: '', cantidadSolicitada: '' }]);
                                        }}
                                    >Agregar Fila</button>
                                </div>
                            </div>

                            <div className='Enviar'>
                                <button type="submit" id='Enviar' onClick={enviarFormulario} className="btn btn-primary">Enviar</button>
                            </div>
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

export default MaterialAgregar;
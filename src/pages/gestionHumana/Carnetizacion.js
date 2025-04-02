import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import './Carnetizacion.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Carnetizacion() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const columnasVisibles = ["id", "registro", "nombreSupervisor", "nombreTecnico", "tipoCarnet", "solicitud", "segmento", "estado"];
    const [data, setData] = useState(true);
    const [dataAll, setDataAll] = useState(true);
    const cedulaUsuario = Cookies.get('userCedula');
    const nombreUsuario = Cookies.get('userNombre');
    const rolUsuario = Cookies.get('userRole');
    const columnasMapeadas = {
        id: "id",
        registro: "fechaRegistro",
        nombreSupervisor: "nombreSupervisor",
        nombreTecnico: "nombreTecnico",
        tipoCarnet: "tipoCarnet",
        solicitud: "solicitud",
        segmento: "segmento",
        estado: "estado"
    };

    const formatFechaHora = (fechaTexto) => {
        const meses = {
            "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
            "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
            "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12"
        };

        const regex = /(\d{1,2}) de (\w+) de (\d{4}) a las (\d{1,2}):(\d{2}) (\w{2})/;
        const match = fechaTexto.match(regex);

        if (!match) return ""; // Si el formato es incorrecto, retorna vacío

        let [, dia, mesTexto, año, horas, minutos, ampm] = match;
        let mes = meses[mesTexto.toLowerCase()];

        // Convertir horas a formato 24h
        if (ampm.toLowerCase() === "pm" && horas !== "12") horas = String(Number(horas) + 12);
        if (ampm.toLowerCase() === "am" && horas === "12") horas = "00";

        return `${año}-${mes}-${dia.padStart(2, "0")}T${horas.padStart(2, "0")}:${minutos}`;
    };

    const cargarDatos = async () => {
        try {
            const responseChatbot = await axios.get(`${process.env.REACT_APP_API_URL}/carnetizacion/Registros`);

            const sortedData = responseChatbot.data.sort((a, b) => b.id - a.id);
            setDataAll(sortedData)

            const sortedData2 = sortedData.map(row => Object.fromEntries(
                Object.entries(row)
                    .filter(([key]) => columnasVisibles.includes(key))
                    .map(([key, value]) => [columnasMapeadas[key] || key, value])
            ));
            setData(sortedData2);

            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const yaRecargado = localStorage.getItem('yaRecargado');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/ReportingCenter', { state: { estadoNotificacion: false } });
        } else if (!yaRecargado) {
            localStorage.setItem('yaRecargado', 'true');
            window.location.reload();
        }

        cargarDatos();
    }, []);

    const [filters, setFilters] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const formatHeader = (key) => {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    const filteredData = Array.isArray(data)
        ? data
            .filter((row) =>
                Object.keys(filters).every((key) =>
                    row[key]?.toString().toLowerCase().includes(filters[key]?.toLowerCase() || "")
                )
            ) : [];

    // Ordenar datos
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
            ? valA.toString().localeCompare(valB.toString())
            : valB.toString().localeCompare(valA.toString());
    });

    // Manejo de filtros
    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    // Manejo de ordenamiento
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const descargarArchivo = () => {

        const dataProcesada = dataAll.map(row =>
            Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key, value || "-"])
            )
        );

        const hoja = XLSX.utils.json_to_sheet(dataProcesada);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
        const archivoExcel = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([archivoExcel], { type: 'application/octet-stream' });
        saveAs(blob, 'Registros Carnetizacion.xlsx');
    };


    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRowEdit, setSelectedRowEdit] = useState(null);
    const [editedRow, setEditedRow] = useState({});

    const handleRowClick = (row) => {
        const selectedData = dataAll.find(item => item.id === row.id);
        setEnviando(true);
        setSelectedRowEdit(true);

        if (selectedData && selectedData.foto) {
            fetchImage(selectedData.foto)
                .then(imageUrl => {
                    setSelectedRowEdit({ ...selectedData, imageUrl });
                    setEditedRow(selectedData);
                    setEnviando(false);
                })
                .catch(error => console.error("Error al obtener la imagen:", error));
        }
    };

    const handleInputChangeEdit = (key, value) => {
        setEditedRow((prev) => ({ ...prev, [key]: value }));
    };

    const closeModal = () => {
        setSelectedRow(null);
        setSelectedRowEdit(null);
        setFormData({
            cedulaSupervisor: "",
            nombreSupervisor: "",
            cedulaTecnico: "",
            nombreTecnico: "",
            tipoCarnet: "",
            solicitud: "",
            foto: "",
            segmento: "",
            estado: ""
        });
    };

    const formatFechaHoraSalida = (fechaISO) => {
        if (!fechaISO) return "";

        const fecha = new Date(fechaISO);
        const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

        const diaSemana = diasSemana[fecha.getDay()];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];
        const año = fecha.getFullYear();

        let horas = fecha.getHours();
        const minutos = fecha.getMinutes().toString().padStart(2, "0");
        const ampm = horas >= 12 ? "pm" : "am";
        horas = horas % 12 || 12;

        return `${diaSemana}, ${dia} de ${mes} de ${año} a las ${horas}:${minutos} ${ampm}`;
    };

    const enviarDatosEditados = async () => {

        if (!editedRow.fechaHora || !editedRow.estadoFinal) {
            toast.error("Debe completar la fecha y el estado final.");
            return;
        }

        const validarFormatoFechaHora = (fechaHora) => {
            const regex = /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo), \d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de \d{4} a las \d{1,2}:\d{2} (am|pm)$/i;
            return regex.test(fechaHora);
        };

        if (!validarFormatoFechaHora(editedRow.fechaHora)) {
            toast.error("El formato de la fecha no es válido.");
            return;
        }

        const datosAEnviar = {
            id: editedRow.id,
            fechaHora: editedRow.fechaHora,
            estadoFinal: editedRow.estadoFinal,
            observaciones: editedRow.observaciones || ""
        };

        try {
            const response = await fetch("https://sicte-sas-capacidades-backend.onrender.com/recursosHumanos/actualizarDatosChatBot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datosAEnviar),
            });

            if (!response.ok) {
                toast.error('Error al actualizar los datos.', { className: 'toast-error' });
            } else {
                toast.success('Datos enviados correctamente.');
                closeModal();
                setTimeout(() => {
                    cargarDatos();
                }, 700);
            }

        } catch (error) {
            toast.error(`Error al actualizar: ${error.message}`, { className: "toast-error" });
        }
    };

    const [formData, setFormData] = useState({
        cedulaSupervisor: "",
        nombreSupervisor: "",
        cedulaTecnico: "",
        nombreTecnico: "",
        tipoCarnet: "",
        solicitud: "",
        foto: "",
        segmento: "",
        estado: ""
    });

    const handleInputChangeCargar = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const obtenerFechaActual = () => {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");
        const horas = String(fecha.getHours()).padStart(2, "0");
        const minutos = String(fecha.getMinutes()).padStart(2, "0");
        const segundos = String(fecha.getSeconds()).padStart(2, "0");

        return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}-${minutes}`;
    };

    const enviarDatosCargar = async () => {
        if (!formData.cedulaSupervisor || !formData.nombreSupervisor || !formData.cedulaTecnico || !formData.nombreTecnico || !formData.tipoCarnet || !formData.solicitud || !formData.foto || !formData.segmento) {
            toast.error("Todos los campos son obligatorios");
            return;
        }

        setEnviando(true);
        const formattedDate = formatDate(new Date());
        const formDataImagen = new FormData();
        const fotoNombre = `${formattedDate}_${formData.foto.name}`
        formDataImagen.append('file', formData.foto);
        formDataImagen.append("filename", fotoNombre);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/carnetizacion/cargarImagen`, formDataImagen, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            toast.error(`Error: ${error.message}`, { className: "toast-error" });
        }

        const datosAEnviar = {
            registro: obtenerFechaActual(),
            cedulaSupervisor: formData.cedulaSupervisor,
            nombreSupervisor: formData.nombreSupervisor,
            cedulaTecnico: formData.cedulaTecnico,
            nombreTecnico: formData.nombreTecnico,
            tipoCarnet: formData.tipoCarnet,
            solicitud: formData.solicitud,
            foto: fotoNombre,
            segmento: formData.segmento,
            estado: "Pendiente"
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/carnetizacion/crearRegistro`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datosAEnviar),
            });

            if (!response.ok) {
                toast.error('Error al actualizar los datos.', { className: 'toast-error' });
            } else {
                setEnviando(false);
                toast.success('Datos enviados correctamente.');
                closeModal();
                cargarDatos();
            }

        } catch (error) {
            toast.error(`Error al actualizar: ${error.message}`, { className: "toast-error" });
        }
    };

    const fetchImage = async (imageName) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/carnetizacion/ObtenerImagen?imageName=${encodeURIComponent(imageName)}`);

            if (!response.ok) {
                console.error(`Error fetching image: ${response.status} ${response.statusText}`);
                return null;
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                console.error('Received an empty image blob');
                return null;
            }

            const imageUrl = URL.createObjectURL(blob);
            return imageUrl;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };

    return (
        <div className='Carnetizacion'>
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
                        <div className='Titulo'>
                            <h2>Registros Carnetizacion</h2>
                        </div>

                        <div className='botones'>
                            <button className='btn btn-success' onClick={descargarArchivo}>Descargar Registros</button>
                            <button className="btn-flotante"
                                onClick={() => {
                                    setSelectedRow(true);
                                }}
                            >+</button>
                        </div>

                        <div className='Subtitulo'>
                            <span>Solicitudes</span>
                        </div>
                        <div className='tabla'>
                            <table className="table table-bordered">
                                <thead >
                                    <tr>
                                        {Object.keys(data[0]).map((key) => (
                                            <th key={key} onClick={() => handleSort(key)}>
                                                {formatHeader(key)} {sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    onChange={(e) => handleFilterChange(key, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((row) => (
                                        <tr key={row.id} onClick={() => handleRowClick(row)}>
                                            {Object.values(row).map((cell, i) => (
                                                <td key={i} >{cell || "-"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='registros primero'>
                            <span>Total de registros: {sortedData.length}</span>
                        </div>

                        {selectedRowEdit && (rolUsuario === 'AUXILIAR GH' || rolUsuario === 'admin') && (
                            <div className="modal-overlay" onClick={closeModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    {enviando ? (
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
                                            <div className="detalle-fijo">
                                                <h4>Detalle</h4>
                                            </div>
                                            <div className="modal-form">
                                                {Object.entries(selectedRowEdit)
                                                    .filter(([key]) => key !== "imageUrl")
                                                    .map(([key, value], index, array) => (
                                                        <div key={key} className="form-group">
                                                            <label>{formatHeader(key)}:</label>
                                                            {key === "estadoFinal" ? (
                                                                <select
                                                                    className="form-control"
                                                                    value={editedRow[key] || ""}
                                                                    onChange={(e) => handleInputChangeEdit(key, e.target.value)}
                                                                >
                                                                    <option value="">Seleccionar...</option>
                                                                    <option value="Pendiente">Pendiente</option>
                                                                    <option value="No Continua">No Continua</option>
                                                                    <option value="Confirmado">Confirmado</option>
                                                                </select>
                                                            ) : key === "fechaHora" ? (
                                                                <input
                                                                    type="datetime-local"
                                                                    className="form-control"
                                                                    value={formatFechaHora(editedRow[key] || "")}
                                                                    onChange={(e) => {
                                                                        const fechaIngresada = new Date(e.target.value);
                                                                        const fechaActual = new Date();
                                                                        fechaActual.setHours(0, 0, 0, 0);

                                                                        if (fechaIngresada >= fechaActual) {
                                                                            handleInputChangeEdit(key, formatFechaHoraSalida(e.target.value));
                                                                        } else {
                                                                            toast.error("No puedes seleccionar una fecha anterior a hoy.");
                                                                        }
                                                                    }}
                                                                    min={new Date().toISOString().slice(0, 16)}
                                                                />
                                                            ) : key === "foto" ? (
                                                                <>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={editedRow[key] || ""}
                                                                        onChange={(e) => handleInputChangeEdit(key, e.target.value)}
                                                                        disabled
                                                                    />
                                                                    {selectedRowEdit?.imageUrl && (
                                                                        <button className='btn btn-primary' onClick={() => window.open(selectedRowEdit.imageUrl, "_blank")}>
                                                                            Ver Imagen
                                                                        </button>
                                                                    )}
                                                                </>
                                                            ) : key === "estado" ? (
                                                                <select
                                                                    className="form-control"
                                                                    value={editedRow[key] || ""}
                                                                    onChange={(e) => handleInputChangeEdit(key, e.target.value)}
                                                                >
                                                                    {(() => {
                                                                        if (editedRow.tipoCarnet === "Claro" && editedRow.solicitud === "Perdida") {
                                                                            return (
                                                                                <>
                                                                                    <option value="Pendiente">Pendiente</option>
                                                                                    <option value="Asignacion Consecutivo">Asignacion Consecutivo</option>
                                                                                    <option value="Solicitud Envianda a Claro">Solicitud Envianda a Claro</option>
                                                                                    <option value="Recoger Carnet en Recepcion">Recoger Carnet en Recepcion</option>
                                                                                </>
                                                                            );
                                                                        } else if (editedRow.tipoCarnet === "Claro" && editedRow.solicitud === "Deterioro") {
                                                                            return (
                                                                                <>
                                                                                    <option value="Pendiente">Pendiente</option>
                                                                                    {editedRow.segmento !== "Operaciones" && (
                                                                                        <option value="Asignacion Consecutivo">Asignacion Consecutivo</option>
                                                                                    )}
                                                                                    <option value="Solicitud Envianda a Claro">Solicitud Envianda a Claro</option>
                                                                                    <option value="Recoger Carnet en Recepcion">Recoger Carnet en Recepcion</option>
                                                                                </>
                                                                            );
                                                                        } else if ((editedRow.tipoCarnet === "Sicte" || editedRow.tipoCarnet === "Tarjeta de Acceso") && (editedRow.solicitud === "Perdida" || editedRow.solicitud === "Deterioro")) {
                                                                            return (
                                                                                <>
                                                                                    <option value="Pendiente">Pendiente</option>
                                                                                    <option value="Asignado">Asignado</option>
                                                                                    <option value="Asignado y Entregado">Asignado y Entregado</option>
                                                                                </>
                                                                            );
                                                                        } else if ((editedRow.tipoCarnet === "Sicte" || editedRow.tipoCarnet === "Tarjeta de Acceso") && editedRow.solicitud === "Primera Vez") {
                                                                            return (
                                                                                <>
                                                                                    <option value="Pendiente">Pendiente</option>
                                                                                    <option value="Entregado">Entregado</option>
                                                                                </>
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <>
                                                                                    <option value="Pendiente">Pendiente</option>
                                                                                    <option value="Entregado">Entregado</option>
                                                                                </>
                                                                            );
                                                                        }
                                                                    })()}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={editedRow[key] || ""}
                                                                    onChange={(e) => handleInputChangeEdit(key, e.target.value)}
                                                                    disabled={index < array.length - 1}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>

                                            <div className='botones'>
                                                <button className='btn btn-danger' onClick={closeModal}>Cerrar</button>
                                                <button className='btn btn-success' onClick={enviarDatosEditados}>Actualizar</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedRow && (
                            <div className="modal-overlay" onClick={closeModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    {enviando ? (
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
                                            <div className="detalle-fijo">
                                                <h4>Nueva Solicitud</h4>
                                            </div>
                                            <div className="modal-form">
                                                {Object.entries(formData)
                                                    .filter(([key]) => key !== "estado")
                                                    .map(([key, value], index, array) => (
                                                        <div key={key} className="form-group">
                                                            <label>{formatHeader(key)}:</label>
                                                            {key === "tipoCarnet" ? (
                                                                <select
                                                                    className="form-control"
                                                                    value={formData[key] || ""}
                                                                    onChange={(e) => handleInputChangeCargar(key, e.target.value)}
                                                                >
                                                                    <option value="">Seleccionar...</option>
                                                                    <option value="Claro">Claro</option>
                                                                    <option value="Sicte">Sicte</option>
                                                                    <option value="Tarjeta de Acceso">Tarjeta de Acceso</option>
                                                                </select>
                                                            ) : key === "solicitud" ? (
                                                                <select
                                                                    className="form-control"
                                                                    value={formData[key] || ""}
                                                                    onChange={(e) => handleInputChangeCargar(key, e.target.value)}
                                                                    disabled = {!formData.tipoCarnet}
                                                                >
                                                                    <option value="">Seleccionar...</option>
                                                                    {(() => {
                                                                        if (formData.tipoCarnet === "Claro") {
                                                                            return (
                                                                                <>
                                                                                    <option value="Deterioro">Deterioro</option>
                                                                                    <option value="Perdida">Perdida</option>
                                                                                </>
                                                                            );
                                                                        } else if (formData.tipoCarnet === "Sicte" || formData.tipoCarnet === "Tarjeta de Acceso") {
                                                                            return (
                                                                                <>
                                                                                    <option value="Deterioro">Deterioro</option>
                                                                                    <option value="Perdida">Perdida</option>
                                                                                    <option value="Primera Vez">Primera Vez</option>
                                                                                </>
                                                                            );
                                                                        }
                                                                    })()}
                                                                </select>
                                                            ) : key === "segmento" ? (
                                                                <select
                                                                    className="form-control"
                                                                    value={formData[key] || ""}
                                                                    onChange={(e) => handleInputChangeCargar(key, e.target.value)}
                                                                >
                                                                    <option value="">Seleccionar...</option>
                                                                    <option value="Operaciones">Operaciones</option>
                                                                    <option value="Red Externa">Red Externa</option>
                                                                    <option value="Corporativo">Corporativo</option>
                                                                </select>
                                                            ) : key === "cedulaSupervisor" ? (
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={formData[key] || ""}
                                                                    onChange={(e) => handleInputChangeCargar(key, e.target.value.replace(/\D/g, ""))}
                                                                    onInput={(e) => e.target.value = e.target.value.replace(/\D/g, "")}
                                                                    pattern="\d*"
                                                                />
                                                            ) : key === "cedulaTecnico" ? (
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={formData[key] || ""}
                                                                    onChange={(e) => handleInputChangeCargar(key, e.target.value.replace(/\D/g, ""))}
                                                                    onInput={(e) => e.target.value = e.target.value.replace(/\D/g, "")}
                                                                    pattern="\d*"
                                                                />
                                                            ) : key === "foto" ? (
                                                                <input
                                                                    type="file"
                                                                    className="form-control"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleInputChangeCargar(key, e.target.files[0])}
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={formData[key] || ""}
                                                                    onChange={(e) => handleInputChangeCargar(key, e.target.value)}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className='botones'>
                                                <button className='btn btn-danger' onClick={closeModal}>Cerrar</button>
                                                <button className='btn btn-success' onClick={enviarDatosCargar}>Crear</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className='Notificaciones'>
                            <ToastContainer />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Carnetizacion;
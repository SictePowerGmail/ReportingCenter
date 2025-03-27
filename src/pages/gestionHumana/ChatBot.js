import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import './ChatBot.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cargarRelacionPersonal, ObtenerRelacionCiudadAuxiliar } from '../../funciones';
import { FaBriefcase } from "react-icons/fa";

function ChatBot() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const columnasVisiblesPendientes = ["id", "registro", "fechaHora", "nombreApellido", "ciudad", "cargo", "observaciones", "estadoFinal"];
    const columnasVisiblesConfirmados = ["id", "fechaHora", "nombreApellido", "ciudad", "cargo", "observaciones", "estadoFinal"];
    const columnasVisiblesHistorico = ["id", "fechaHora", "nombreApellido", "ciudad", "cargo", "observaciones", "estadoContratacion"];
    const [data, setData] = useState(true);
    const [dataConfirmados, setDataConfirmados] = useState(true);
    const [dataAll, setDataAll] = useState(true);
    const [dataHistorico, setDataHistorico] = useState(true);
    const cedulaUsuario = Cookies.get('userCedula');
    const nombreUsuario = Cookies.get('userNombre');
    const columnasMapeadasPendientes = {
        id: "id",
        registro: "registro",
        fechaHora: "fechaEntrevista",
        nombreApellido: "nombreApellido",
        ciudad: "ciudad",
        cargo: "cargo",
        observaciones: "observaciones",
        estadoFinal: "estadoProceso"
    };
    const columnasMapeadasConfirmados = {
        id: "id",
        fechaHora: "fechaEntrevista",
        nombreApellido: "nombreApellido",
        ciudad: "ciudad",
        cargo: "cargo",
        observaciones: "observaciones",
        estadoFinal: "estadoProceso"
    };
    const columnasMapeadasHistorico = {
        id: "id",
        fechaHora: "fechaEntrevista",
        nombreApellido: "nombreApellido",
        ciudad: "ciudad",
        cargo: "cargo",
        observaciones: "observaciones",
        estadoContratacion: "estadoContratacion"
    };

    const formatFechaHora = (fechaTexto) => {
        if (fechaTexto === "-") return "-";

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

        return `${año}-${mes}-${dia.padStart(2, "0")} ${horas.padStart(2, "0")}:${minutos}`;
    };

    const cargarDatos = async () => {
        try {
            const responseChatbot = await axios.get(`${process.env.REACT_APP_API_URL}/recursosHumanos/RegistrosChatbot`);

            const sortedData = responseChatbot.data.sort((a, b) => b.id - a.id);
            setDataAll(sortedData)

            const ciudad = ObtenerRelacionCiudadAuxiliar(nombreUsuario);

            const datafiltrada = ciudad
                ? sortedData.filter(item => ciudad.includes(item.ciudad))
                : sortedData;

            const sortedData2 = datafiltrada.length > 0 ? datafiltrada.map(row =>
                Object.fromEntries(
                    columnasVisiblesPendientes
                        .filter(key => key in row)
                        .map(key => [
                            columnasMapeadasPendientes[key] || key,
                            key === "fechaHora" ? formatFechaHora(row[key]) : row[key]
                        ])
                )
            ) : [];

            setData(sortedData2);

            const hoy = new Date();
            const hoyISO = hoy.toISOString().split("T")[0]; // Obtiene 'YYYY-MM-DD'

            const dataFiltrada2 = (datafiltrada || [])
                .filter(row => row.estadoFinal === "Confirmado" || row.estadoFinal === "Finalizado")
                .filter((row) => {

                    if (!row.fechaHora) {
                        return false;
                    }

                    const fechaISO = formatFechaHora(row.fechaHora);
                    if (!fechaISO) {
                        return false;
                    }

                    const fechaSolo = fechaISO.split("T")[0];

                    return fechaSolo === hoyISO || fechaSolo > hoyISO;
                });

            const sortedData3 = dataFiltrada2.length > 0 ? dataFiltrada2.map(row =>
                Object.fromEntries(
                    columnasVisiblesConfirmados
                        .filter(key => key in row)
                        .map(key => [
                            columnasMapeadasConfirmados[key] || key,
                            key === "fechaHora" ? formatFechaHora(row[key]) : row[key]
                        ])
                )
            ) : [];

            setDataConfirmados(sortedData3);

            const dataFiltrada3 = (datafiltrada || [])
                .filter(row => row.estadoFinal === "Confirmado" || row.estadoFinal === "Finalizado");

            const sortedData4 = dataFiltrada3.length > 0 ? dataFiltrada3.map(row =>
                Object.fromEntries(
                    columnasVisiblesHistorico
                        .filter(key => key in row)
                        .map(key => [
                            columnasMapeadasHistorico[key] || key,
                            key === "fechaHora" ? formatFechaHora(row[key]) : row[key]
                        ])
                )
            ) : [];

            setDataHistorico(sortedData4)

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

        cargarRelacionPersonal();
        cargarDatos();
    }, []);

    const formatHeader = (key) => {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    const [filtersPendientes, setFiltersPendientes] = useState({});
    const [sortConfigPendientes, setSortConfigPendientes] = useState({ key: "fechaEntrevista", direction: "asc" });

    const filteredDataPendientes = Array.isArray(data)
        ? data
            .filter(row => row.estadoProceso === "Pendiente")
            .filter((row) =>
                Object.keys(filtersPendientes).every((key) =>
                    row[key]?.toString().toLowerCase().includes(filtersPendientes[key]?.toLowerCase() || "")
                )
            ) : [];

    // Ordenar datos
    const sortedDataPendientes = [...filteredDataPendientes].sort((a, b) => {
        if (!sortConfigPendientes.key) return 0;
        const valA = a[sortConfigPendientes.key] || "";
        const valB = b[sortConfigPendientes.key] || "";
        return sortConfigPendientes.direction === "asc"
            ? valA.toString().localeCompare(valB.toString())
            : valB.toString().localeCompare(valA.toString());
    });

    // Manejo de filtros
    const handleFilterChangePendientes = (key, value) => {
        setFiltersPendientes({ ...filtersPendientes, [key]: value });
    };

    // Manejo de ordenamiento
    const handleSortPendientes = (key) => {
        setSortConfigPendientes((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const [filtersConfirmado, setFiltersConfirmado] = useState({});
    const [sortConfigConfirmado, setSortConfigConfirmado] = useState({ key: 'fechaEntrevista', direction: "asc" });

    const filteredDataConfirmado = Array.isArray(dataConfirmados)
        ? dataConfirmados
            .filter((row) =>
                Object.keys(filtersConfirmado).every((key) =>
                    row[key]?.toString().toLowerCase().includes(filtersConfirmado[key]?.toLowerCase() || "")
                )
            ) : [];

    // Ordenar datos
    const sortedDataConfirmado = [...filteredDataConfirmado].sort((a, b) => {
        if (!sortConfigConfirmado.key) return 0;
        const valA = a[sortConfigConfirmado.key] || "";
        const valB = b[sortConfigConfirmado.key] || "";

        return sortConfigConfirmado.direction === "asc"
            ? valA.toString().localeCompare(valB.toString())
            : valB.toString().localeCompare(valA.toString());
    });

    // Manejo de filtros
    const handleFilterChangeConfirmado = (key, value) => {
        setFiltersConfirmado({ ...filtersConfirmado, [key]: value });
    };

    // Manejo de ordenamiento
    const handleSortConfirmado = (key) => {
        setSortConfigConfirmado((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const [filtersHistorico, setFiltersHistorico] = useState({});
    const [sortConfigHistorico, setSortConfigHistorico] = useState({ key: 'fechaEntrevista', direction: "desc" });

    const filteredDataHistorico = Array.isArray(dataHistorico)
        ? dataHistorico
            .filter((row) =>
                Object.keys(filtersHistorico).every((key) =>
                    row[key]?.toString().toLowerCase().includes(filtersHistorico[key]?.toLowerCase() || "")
                )
            ) : [];

    // Ordenar datos
    const sortedDataHistorico = [...filteredDataHistorico].sort((a, b) => {
        if (!sortConfigHistorico.key) return 0;
        const valA = a[sortConfigHistorico.key] || "";
        const valB = b[sortConfigHistorico.key] || "";

        return sortConfigHistorico.direction === "asc"
            ? valA.toString().localeCompare(valB.toString())
            : valB.toString().localeCompare(valA.toString());
    });

    // Manejo de filtros
    const handleFilterChangeHistorico = (key, value) => {
        setFiltersHistorico({ ...filtersHistorico, [key]: value });
    };

    // Manejo de ordenamiento
    const handleSortHistorico = (key) => {
        setSortConfigHistorico((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const descargarArchivo = () => {
        const ciudad = ObtenerRelacionCiudadAuxiliar(nombreUsuario);

        const datafiltrada = ciudad
            ? dataAll.filter(item => ciudad.includes(item.ciudad))
            : dataAll;

        const dataProcesada = datafiltrada.map(row =>
            Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key, value || "-"])
            )
        );

        const hoja = XLSX.utils.json_to_sheet(dataProcesada);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
        const archivoExcel = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([archivoExcel], { type: 'application/octet-stream' });
        saveAs(blob, 'Registros Chatbot.xlsx');
    };

    const [selectedCreateRow, setSelectedCreateRow] = useState(null);
    const [createRow, setCreateRow] = useState({});
    const [selectedEditedRow, setSelectedEditedRow] = useState(null);
    const [editedRow, setEditedRow] = useState({});

    const handleRowClick = (row) => {
        const selectedData = dataAll.find(item => item.id === row.id);

        const columnasAEliminar = {
            "Ayudante (Sin Moto)": ["respuestaFiltro1", "respuestaFiltro2", "respuestaFiltro3"],
            "Conductor": ["respuestaFiltro3"],
        };

        const filteredRow = Object.fromEntries(
            Object.entries(selectedData).filter(
                ([key]) => !(columnasAEliminar[row.cargo] || []).includes(key)
            )
        );

        const nombresColumnas = {
            "Conductor": {
                "respuestaFiltro1": "Experiencia de conduccion",
                "respuestaFiltro2": "Tipo de Licencia",
            },
            "Motorizados": {
                "respuestaFiltro1": "Motocicleta Propia",
                "respuestaFiltro2": "Moto Tipo Scooter",
                "respuestaFiltro3": "Antiguedad de Licencia A2",
            },
        };

        const renamedRow = Object.fromEntries(
            Object.entries(filteredRow).map(([key, value]) => [
                nombresColumnas[selectedData.cargo]?.[key] || key,
                value
            ])
        );

        setSelectedEditedRow(renamedRow);
        setEditedRow(renamedRow);
    };

    const handleInputChangeEdit = (key, value) => {
        setEditedRow((prev) => ({ ...prev, [key]: value }));
    };

    const closeModal = () => {
        setSelectedEditedRow(null);
        setSelectedCreateRow(null);
        setCreateRow({
            nombreApellido: "",
            celular: "",
            ciudad: "",
            cargo: "",
            fechaHora: ""
        });
    };

    const handleInputChangeCreate = (key, value) => {
        setCreateRow((prev) => ({ ...prev, [key]: value }));
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

    const enviarDatosEdit = async () => {

        if (!editedRow.fechaHora || !editedRow.estadoFinal || !editedRow.cargo) {
            toast.error("Debe completar todos los campos.");
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

        const estadoContratacion =
            editedRow.estadoFinal === "No Continua"
                ? "No continua"
                : editedRow.asistencia === "Si" && editedRow.seleccion === "Si" && editedRow.examenesMedicos === "Si" && editedRow.contratacion === "Si"
                    ? "Contratado"
                    : [editedRow.asistencia, editedRow.seleccion, editedRow.examenesMedicos, editedRow.contratacion].includes("No")
                        ? "No continua"
                        : "En proceso";

        const datosAEnviar = {
            id: editedRow.id,
            cargo: editedRow.cargo,
            fechaHora: editedRow.fechaHora,
            estadoFinal: editedRow.estadoFinal,
            observaciones: editedRow.observaciones || "",
            asistencia: editedRow.asistencia || "",
            seleccion: editedRow.seleccion || "",
            examenesMedicos: editedRow.examenesMedicos || "",
            contratacion: editedRow.contratacion || "",
            estadoContratacion
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

    const enviarDatosCreate = async () => {

        if (!createRow.nombreApellido || !createRow.celular || !createRow.ciudad || !createRow.cargo || !createRow.fechaHora) {
            toast.error("Debe completar todos los campos.");
            return;
        }

        const validarFormatoFechaHora = (fechaHora) => {
            const regex = /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo), \d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de \d{4} a las \d{1,2}:\d{2} (am|pm)$/i;
            return regex.test(fechaHora);
        };

        if (!validarFormatoFechaHora(createRow.fechaHora)) {
            toast.error("El formato de la fecha no es válido.");
            return;
        }

        const registroFecha = obtenerFechaActual();

        const datosAEnviar = {
            registro: registroFecha,
            fuente: "Computrabajo",
            stage: "Completado",
            nombreApellido: createRow.nombreApellido,
            celular: createRow.celular,
            ciudad: createRow.ciudad || "",
            cargo: createRow.cargo || "",
            fechaHora: createRow.fechaHora || "",
            fechaHoraInicial: createRow.fechaHora || "",
            estadoFinal: "Confirmado"
        };

        try {
            const response = await axios.post(
                "https://sicte-sas-capacidades-backend.onrender.com/recursosHumanos/registrarDatosChatBot",
                datosAEnviar,
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            toast.success('Datos enviados correctamente.');
            closeModal();
            setTimeout(() => {
                cargarDatos();
            }, 700);

        } catch (error) {
            toast.error(`Error al crear el usuario: ${error.message}`, { className: "toast-error" });
        }
    };

    const [clickHistorico, setClickHistorico] = useState(false);

    const getEstadoClass = (estado) => {
        switch (estado) {
            case "Contratado":
                return "contratado";
            case "No continua":
                return "no-continua";
            case "En proceso":
                return "en-proceso";
            default:
                return "";
        }
    };

    return (
        <div className='ChatBot'>
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
                            <h2>Registros Chatbot</h2>
                        </div>

                        <div className='botones'>
                            <button className="btn btn-primary" onClick={() => {
                                setSelectedCreateRow(true);
                            }}>
                                <FaBriefcase className='icono-computrabajo' />
                                Computrabajo
                            </button>
                            <button className='btn btn-success' onClick={descargarArchivo}>Descargar Registros</button>
                        </div>

                        <div className='Subtitulo'>
                            <span>Solicitudes Pendientes</span>
                        </div>
                        <div className='tabla'>
                            <table className="table table-bordered">
                                <thead >
                                    <tr>
                                        {Object.keys(data[0]).map((key) => (
                                            <th key={key} onClick={() => handleSortPendientes(key)}>
                                                {formatHeader(key)} {sortConfigPendientes.key === key ? (sortConfigPendientes.direction === "asc" ? "▲" : "▼") : ""}
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    onChange={(e) => handleFilterChangePendientes(key, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedDataPendientes.map((row) => (
                                        <tr key={row.id} onClick={() => {
                                            handleRowClick(row);
                                            setClickHistorico(false);
                                        }}>
                                            {Object.values(row).map((cell, i) => (
                                                <td key={i} >{cell || "-"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='registros primero'>
                            <span>Total de registros: {sortedDataPendientes.length}</span>
                        </div>

                        <div className='Subtitulo'>
                            <span>Solicitudes Confirmadas</span>
                        </div>
                        <div className='tabla'>
                            <table className="table table-bordered">
                                <thead >
                                    <tr>
                                        {Object.keys(dataConfirmados[0]).map((key) => (
                                            <th key={key} onClick={() => handleSortConfirmado(key)}>
                                                {formatHeader(key)} {sortConfigConfirmado.key === key ? (sortConfigConfirmado.direction === "asc" ? "▲" : "▼") : ""}
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    onChange={(e) => handleFilterChangeConfirmado(key, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedDataConfirmado.map((row) => (
                                        <tr key={row.id} onClick={() => {
                                            handleRowClick(row);
                                            setClickHistorico(false);
                                        }}>
                                            {Object.keys(row).map((columnKey, i) => (
                                                <td key={i} >{row[columnKey] || "-"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='registros segundo'>
                            <span>Total de registros: {sortedDataConfirmado.length}</span>
                        </div>

                        <div className='Subtitulo'>
                            <span>Solicitudes Historicas Confirmados</span>
                        </div>
                        <div className='tabla'>
                            <table className="table table-bordered">
                                <thead >
                                    <tr>
                                        {Object.keys(dataHistorico[0]).map((key) => (
                                            <th key={key} onClick={() => handleSortHistorico(key)}>
                                                {formatHeader(key)} {sortConfigHistorico.key === key ? (sortConfigHistorico.direction === "asc" ? "▲" : "▼") : ""}
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    onChange={(e) => handleFilterChangeHistorico(key, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedDataHistorico.map((row) => (
                                        <tr key={row.id} onClick={() => {
                                            handleRowClick(row);
                                            setClickHistorico(true);
                                        }}>
                                            {Object.keys(row).map((columnKey, i) => (
                                                <td
                                                    key={i}
                                                    className={columnKey === "estadoContratacion" ? getEstadoClass(row[columnKey]) : ""}
                                                >
                                                    {row[columnKey] || "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='registros'>
                            <span>Total de registros: {sortedDataHistorico.length}</span>
                        </div>

                        {selectedEditedRow && (
                            <div className="modal-overlay" onClick={closeModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="detalle-fijo">
                                        <h4>Detalle</h4>
                                    </div>
                                    <div className="modal-form">
                                        {Object.entries(selectedEditedRow).map(([key, value], index, array) => (
                                            !["asistencia", "fechaHoraInicial", "seleccion", "examenesMedicos", "contratacion", "estadoContratacion"].includes(key) && (
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
                                                    ) : key === "cargo" ? (
                                                        <select
                                                            className="form-control"
                                                            value={editedRow[key] || ""}
                                                            onChange={(e) => handleInputChangeEdit(key, e.target.value)}
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="Ayudante (Sin Moto)">Ayudante (Sin Moto)</option>
                                                            <option value="Conductor">Conductor</option>
                                                            <option value="Motorizados">Motorizados</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={editedRow[key] || ""}
                                                            onChange={(e) => handleInputChangeEdit(key, e.target.value)}
                                                            disabled={!["observaciones", "estadoFinal", "fechaHora"].includes(key)}
                                                        />
                                                    )}
                                                </div>
                                            )
                                        ))}
                                        {clickHistorico === true && (
                                            <>
                                                <div className="form-group">
                                                    <label>Asistencia:</label>
                                                    <select
                                                        className="form-control"
                                                        value={editedRow.asistencia || ""}
                                                        onChange={(e) => handleInputChangeEdit("asistencia", e.target.value)}
                                                        disabled={editedRow.estadoFinal !== "Confirmado"}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Si">Sí</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Seleccion:</label>
                                                    <select
                                                        className="form-control"
                                                        value={editedRow.seleccion || ""}
                                                        onChange={(e) => handleInputChangeEdit("seleccion", e.target.value)}
                                                        disabled={editedRow.asistencia !== "Si"}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Si">Sí</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Examenes Medicos:</label>
                                                    <select
                                                        className="form-control"
                                                        value={editedRow.examenesMedicos || ""}
                                                        onChange={(e) => handleInputChangeEdit("examenesMedicos", e.target.value)}
                                                        disabled={editedRow.asistencia !== "Si" || editedRow.seleccion !== "Si"}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Si">Sí</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Contratacion:</label>
                                                    <select
                                                        className="form-control"
                                                        value={editedRow.contratacion || ""}
                                                        onChange={(e) => handleInputChangeEdit("contratacion", e.target.value)}
                                                        disabled={editedRow.asistencia !== "Si" || editedRow.seleccion !== "Si" || editedRow.examenesMedicos !== "Si"}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Si">Sí</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Estado Contratacion:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={editedRow.estadoContratacion || ""}
                                                        disabled
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className='botones'>
                                        <button className='btn btn-danger' onClick={closeModal}>Cerrar</button>
                                        <button className='btn btn-success' onClick={enviarDatosEdit}>Actualizar</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedCreateRow && (
                            <div className="modal-overlay" onClick={closeModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="detalle-fijo">
                                        <h4>Computrabajo</h4>
                                    </div>
                                    <div className="modal-form">
                                        {["nombreApellido", "celular", "ciudad", "cargo", "fechaHora"].map((key) => (
                                            <div key={key} className="form-group">
                                                <label>{formatHeader(key)}:</label>
                                                {key === "cargo" ? (
                                                    <select
                                                        className="form-control"
                                                        value={createRow[key] || ""}
                                                        onChange={(e) => handleInputChangeCreate(key, e.target.value)}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Ayudante (Sin Moto)">Ayudante (Sin Moto)</option>
                                                        <option value="Conductor">Conductor</option>
                                                        <option value="Motorizados">Motorizados</option>
                                                    </select>
                                                ) : key === "fechaHora" ? (
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control"
                                                        value={formatFechaHora(createRow[key] || "")}
                                                        onChange={(e) => {
                                                            const fechaIngresada = new Date(e.target.value);
                                                            const fechaActual = new Date();
                                                            fechaActual.setHours(0, 0, 0, 0);

                                                            if (fechaIngresada >= fechaActual) {
                                                                handleInputChangeCreate(key, formatFechaHoraSalida(e.target.value));
                                                            } else {
                                                                toast.error("No puedes seleccionar una fecha anterior a hoy.");
                                                            }
                                                        }}
                                                        min={new Date().toISOString().slice(0, 16)}
                                                    />
                                                ) : key === "ciudad" ? (
                                                    <select
                                                        className="form-control"
                                                        value={createRow[key] || ""}
                                                        onChange={(e) => handleInputChangeCreate(key, e.target.value)}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        <option value="Armenia">Armenia</option>
                                                        <option value="Bogotá">Bogotá</option>
                                                        <option value="Manizales">Manizales</option>
                                                        <option value="Pereira">Pereira</option>
                                                        <option value="Zipaquirá y Sabana Norte">Zipaquirá y Sabana Norte</option>
                                                    </select>
                                                ) : key === "celular" ? (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={createRow[key] || ""}
                                                        onChange={(e) => handleInputChangeCreate(key, e.target.value.replace(/\D/g, ""))}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={createRow[key] || ""}
                                                        onChange={(e) => handleInputChangeCreate(key, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className='botones'>
                                        <button className='btn btn-danger' onClick={closeModal}>Cerrar</button>
                                        <button className='btn btn-success' onClick={enviarDatosCreate}>Crear</button>
                                    </div>
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

export default ChatBot;
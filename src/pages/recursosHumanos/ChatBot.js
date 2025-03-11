import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import './ChatBot.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import { cargarDirectores } from '../../funciones';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ChatBot() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const columnasVisibles = ["id", "registro", "stage", "nombreApellido", "ciudad", "cargo", "estadoFinal"];
    const [data, setData] = useState(true);
    const [dataAll, setDataAll] = useState(true);
    const columnasMapeadas = {
        id: "id",
        registro: "registro",
        stage: "estadoChat",
        nombreApellido: "nombreApellido",
        ciudad: "ciudad",
        cargo: "cargo",
        estadoFinal: "estadoProceso"
    };

    const cargarDatos = async () => {
        try {
            const responseChatbot = await axios.get(`${process.env.REACT_APP_API_URL}/recursosHumanos/RegistrosChatbot`);
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
        const role = Cookies.get('userRole');
        if (role !== "admin") {
            navigate('/ReportingCenter');
        }

        cargarDirectores();
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

    const filteredData = Array.isArray(data) ? data.filter((row) =>
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
        saveAs(blob, 'Registros Chatbot.xlsx');
    };

    const [selectedRow, setSelectedRow] = useState(null);
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

        setSelectedRow(renamedRow);
        setEditedRow(renamedRow);
    };

    const handleInputChange = (key, value) => {
        setEditedRow((prev) => ({ ...prev, [key]: value }));
    };

    const closeModal = () => {
        setSelectedRow(null);
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

    const enviarDatos = async () => {

        if (!editedRow.fechaHora || !editedRow.estadoFinal) {
            toast.error("Debe completar la fecha y el estado final.");
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
                            <button className='btn btn-success' onClick={descargarArchivo}>Descargar Registros</button>
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

                        {selectedRow && (
                            <div className="modal-overlay" onClick={closeModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="detalle-fijo">
                                        <h4>Detalle</h4>
                                    </div>
                                    <div className="modal-form">
                                        {Object.entries(selectedRow).map(([key, value], index, array) => (
                                            <div key={key} className="form-group">
                                                <label>{formatHeader(key)}:</label>
                                                {key === "estadoFinal" ? (
                                                    <select
                                                        className="form-control"
                                                        value={editedRow[key] || ""}
                                                        onChange={(e) => handleInputChange(key, e.target.value)}
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
                                                        onChange={(e) => handleInputChange(key, formatFechaHoraSalida(e.target.value))}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={editedRow[key] || ""}
                                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                                        disabled={index < array.length - 3}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className='botones'>
                                        <button className='btn btn-danger' onClick={closeModal}>Cerrar</button>
                                        <button className='btn btn-success' onClick={enviarDatos}>Actualizar</button>
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
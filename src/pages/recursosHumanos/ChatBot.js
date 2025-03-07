import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import './ChatBot.css'
import Cookies from 'js-cookie';
import axios from 'axios';
import { ObtenerRolUsuario, cargarDirectores } from '../../funciones';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ChatBot() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(true);

    const cargarDatos = async () => {
        try {
            const responseChatbot = await axios.get(`${process.env.REACT_APP_API_URL}/recursosHumanos/RegistrosChatbot`);
            const sortedData = responseChatbot.data.sort((a, b) => b.id - a.id);
            setData(sortedData);

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

        const dataProcesada = data.map(row =>
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
                                        <tr key={row.id} >
                                            {Object.values(row).map((cell, i) => (
                                                <td key={i} >{cell || "-"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

export default ChatBot;
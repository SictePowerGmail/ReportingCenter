import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import './tablas.css';
import Entradas from '../entradas/entradas';
import Botones from '../botones/botones';
import Textos from '../textos/textos';

const Tablas = ({
    columnas = [],       // [{ header: 'Nombre', key: 'nombre' }, ...]
    datos = [],          // [{ nombre: 'Juan', edad: 30 }, ...]
    className = '',
    filasPorPagina = 10,
    leer = false,
    editar = false,
    eliminar = false,
    onLeer = () => { },
    onEditar = () => { },
    onEliminar = () => { },
}) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const [filtro, setFiltro] = useState('');
    const [filtros, setFiltros] = useState({});

    const datosFiltrados = Array.isArray(datos)
        ? datos.filter((fila) => {
            const coincideFiltrosColumna = columnas.every((col) => {
                const filtroValor = filtros[col.key] || "";
                if (!filtroValor) return true;
                return String(fila[col.key] || "")
                    .toLowerCase()
                    .includes(filtroValor.toLowerCase());
            });

            const coincideFiltroGeneral = !filtro
                ? true
                : columnas.some((col) =>
                    String(fila[col.key] || "")
                        .toLowerCase()
                        .includes(filtro.toLowerCase())
                );

            return coincideFiltrosColumna && coincideFiltroGeneral;
        })
        : [];


    const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / filasPorPagina));
    const inicio = (paginaActual - 1) * filasPorPagina;
    const datosPagina = datosFiltrados.slice(inicio, inicio + filasPorPagina);

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
        }
    };

    useEffect(() => {
        setPaginaActual(1);
    }, [filtros, filtro]);

    return (
        <div className={`tabla-contenedor ${className}`}>
            <div className="tabla-buscador">
                <i
                    className="fas fa-search icono-buscar"
                    onClick={() => {
                        setPaginaActual(1);
                    }}
                ></i>
                <Entradas
                    type="text"
                    placeholder="Filtro General ..."
                    value={filtro}
                    onChange={(e) => {
                        setFiltro(e.target.value);
                        setPaginaActual(1);
                    }}
                />
            </div>

            <div className='tabla-encapsula'>
                <div className="scroll-wrapper">
                    <table className="tabla">
                        <thead>
                            <tr>
                                {columnas.length > 0 ? (
                                    <>
                                        {columnas.map((col) => (
                                            <th key={col.key} className='titulo'>{col.header}</th>
                                        ))}
                                        {(editar || eliminar) && (
                                            <th key={'acciones'} className='titulo'>Acciones</th>
                                        )}
                                    </>
                                ) : (
                                    <th>No hay columnas definidas</th>
                                )}
                            </tr>
                            <tr>
                                {columnas.map((col) => (
                                    <th key={col.key} className='filtros'>
                                        <Entradas
                                            type="text"
                                            value={filtros[col.key] || ""}
                                            onChange={(e) =>
                                                setFiltros({ ...filtros, [col.key]: e.target.value })
                                            }
                                        />
                                    </th>
                                ))}
                                {(editar || eliminar) && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {datosPagina.length > 0 ? (
                                <>
                                    {datosPagina.map((fila, index) => (
                                        <tr key={index}
                                            onClick={(e) => {
                                                if (e.target.closest('button') === null && leer === true) {
                                                    onLeer(fila);
                                                }
                                            }}
                                        >
                                            {columnas.map((col) => (
                                                <td key={col.key}>{fila[col.key]}</td>
                                            ))}
                                            {(editar || eliminar) && (
                                                <td className='acciones' key={'acciones'}>
                                                    {editar && (
                                                        <button className='editar' onClick={() => onEditar(fila)}>
                                                            <FaPencilAlt />
                                                        </button>
                                                    )}
                                                    {eliminar && (
                                                        <button className='eliminar' onClick={() => onEliminar(fila)}>
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={columnas.length + 1 || 1}>
                                        No hay datos disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="tabla-footer">
                <Botones
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                >
                    Anterior
                </Botones>
                <Textos className='parrafo'>
                    Página {paginaActual} de {totalPaginas}
                    &nbsp;|&nbsp; Mostrando {datosPagina.length} ítem{datosPagina.length !== 1 ? 's' : ''}
                    &nbsp;de {datosFiltrados.length} filtrado{datosFiltrados.length !== 1 ? 's' : ''}
                    &nbsp;|&nbsp; Total: {datos.length} ítem{datos.length !== 1 ? 's' : ''}
                </Textos>
                <Botones
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                >
                    Siguiente
                </Botones>
            </div>
        </div >
    );
};

export default Tablas;
import React, { useState } from 'react';
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

    const datosFiltrados = datos.filter((fila) =>
        columnas.some((col) =>
            String(fila[col.key]).toLowerCase().includes(filtro.toLowerCase())
        )
    );

    const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / filasPorPagina));
    const inicio = (paginaActual - 1) * filasPorPagina;
    const datosPagina = datosFiltrados.slice(inicio, inicio + filasPorPagina);

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
        }
    };

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
                    placeholder="Buscar..."
                    value={filtro}
                    onChange={(e) => {
                        setFiltro(e.target.value);
                        setPaginaActual(1);
                    }}
                />
            </div>

            <div className='tabla-encapsula'>
                <table className="tabla">
                    <thead>
                        <tr>
                            {columnas.length > 0 ? (
                                <>
                                    {columnas.map((col) => (
                                        <th key={col.key}>{col.header}</th>
                                    ))}
                                    <th key={'acciones'}>Acciones</th>
                                </>
                            ) : (
                                <th>No hay columnas definidas</th>
                            )}
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

            <div className="tabla-footer">
                <Botones
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                >
                    Anterior
                </Botones>
                <Textos className='parrafo'>Página {paginaActual} de {totalPaginas} &nbsp;|&nbsp; Total: {datosPagina.length} ítem{datosPagina.length !== 1 ? 's' : ''}</Textos>
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

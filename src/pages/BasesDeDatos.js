import React, { useState } from 'react'
import './BasesDeDatos.css'

function BasesDeDatos() {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [selectedBD, setSelectedBD] = useState(null);
    const [selectedDateStart, setSelectedDateStart] = useState("");
    const [selectedDateEnd, setSelectedDateEnd] = useState("");

    const modulos = [
        "Modulo O&M 1",
        "Modulo O&M 2",
        "Modulo O&M 3",
        "Modulo O&M 4",
    ];

    return (
        <div className='BasesDeDatos'>
            <div className='contenedor'>
                <div className='filtros'>
                    <div>
                        <label htmlFor="date-input">Fecha Inicio</label>
                        <input
                            type="date"
                            id="date-input"
                            value={selectedDateStart}
                            onChange={(e) => {
                                setSelectedDateStart(e.target.value);
                            }}
                            style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                    </div>
                    <div>
                        <label htmlFor="date-input">Fecha Fin</label>
                        <input
                            type="date"
                            id="date-input"
                            value={selectedDateEnd}
                            onChange={(e) => {
                                setSelectedDateEnd(e.target.value);
                            }}
                            style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                    </div>
                    <div>
                        <label htmlFor="search">Buscador</label>
                        <div>
                            <input type="text" placeholder="Buscar..." className="search-input" />
                            <i className="fas fa-search search-icon"></i>
                        </div>
                    </div>
                    <div className='resumenFiltros'>
                        <span className='subtitulo'>Base de Datos Seleccionada: <span>{selectedBD ? selectedBD : 'No selecionada'}</span></span>
                        <span className='subtitulo'>Fecha Inicio: <span>{selectedDateStart ? selectedDateStart : 'No selecionada'}</span></span>
                        <span className='subtitulo'>Fecha Fin: <span>{selectedDateEnd ? selectedDateEnd : 'No selecionada'}</span></span>
                    </div>
                </div>
                <div className='linea'></div>
                <div className='BD'>
                    {modulos.map((modulo, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                if (selectedIndex === index) {
                                    setSelectedIndex(null);
                                    setSelectedBD(null);
                                } else {
                                    setSelectedIndex(index);
                                    setSelectedBD(modulo);
                                }
                            }}

                            className={selectedIndex === index ? 'select' : 'none'}
                        >
                            <i className="fas fa-database"></i>
                            <span>{modulo}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default BasesDeDatos;
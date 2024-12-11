import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { calculoMaterial } from './calculoMaterial';

const MaterialPrincipalBodega = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [resultadoMaterialDisponible, setResultadoMaterialDisponible] = useState([]);
    const [resultadoMaterialDisponibleCorto, setResultadoMaterialDisponibleCorto] = useState([]);

    const MaterialDisponible = async () => {
        const ciudades = [
            "Manizales",
            "Pereira",
            "Armenia",
            "Bogota San Cipriano Corporativo",
            "Bogota San Cipriano Red Externa"
        ];

        const resultados = [];

        for (const ciudad of ciudades) {
            const resultado = await calculoMaterial(ciudad);
            resultados.push(...resultado);
        }

        setResultadoMaterialDisponible(resultados);

        const datosMaterialDisponible = resultados
            .map(({ bodega, codigo, descrip, unimed, cantidadRestada, indComprado2 }) => ({
                Bodega: bodega, 
                Codigo: codigo, 
                Descripcion: descrip, 
                Unidad: unimed, 
                CantidadDisponible: cantidadRestada,
                IndComprado: indComprado2 
            }))
            .filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.Bodega === value.Bodega && t.Codigo === value.Codigo
                ))
            );

        setResultadoMaterialDisponibleCorto(datosMaterialDisponible);

        setLoading(false);
    };

    useEffect(() => {
        const cedulaUsuario = Cookies.get('userCedula');
        const nombreUsuario = Cookies.get('userNombre');

        if (cedulaUsuario === undefined && nombreUsuario === undefined) {
            navigate('/MaterialLogin', { state: { estadoNotificacion: false } });
        }

        MaterialDisponible();
    }, []);

    const formatearNombreColumna = (columna) => {
        return columna
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    const [filtradoMaterialDisponible, setFiltradoMaterialDisponible] = useState({});
    const [expandidoMaterialDisponible, setExpandidoMaterialDisponible] = useState(false);

    const datosFiltradosMaterialDisponible = resultadoMaterialDisponibleCorto.filter((fila) => {
        return Object.keys(filtradoMaterialDisponible).every((columna) => {
            return (
                !filtradoMaterialDisponible[columna] ||
                fila[columna]?.toString().toLowerCase().includes(filtradoMaterialDisponible[columna].toLowerCase())
            );
        });
    });

    const manejarCambioFiltroMaterialDisponible = (columna, valor) => {
        setFiltradoMaterialDisponible({
            ...filtradoMaterialDisponible,
            [columna]: valor,
        });
    };

    const descargarArchivoMaterialDisponible = () => {
        const hoja = XLSX.utils.json_to_sheet(resultadoMaterialDisponible);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Datos');
        const archivoExcel = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([archivoExcel], { type: 'application/octet-stream' });
        saveAs(blob, 'Material Disponible.xlsx');
    };

    const [orden, setOrden] = useState({ columna: null, ascendente: true });

    const manejarOrden = (columna) => {
        setOrden((prev) => ({
            columna,
            ascendente: prev.columna === columna ? !prev.ascendente : true,
        }));
    };

    const datosOrdenados = [...datosFiltradosMaterialDisponible].sort((a, b) => {
        if (!orden.columna) return 0;
        const valorA = a[orden.columna];
        const valorB = b[orden.columna];

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return orden.ascendente ? valorA - valorB : valorB - valorA;
        } else {
            return orden.ascendente
                ? valorA.toString().localeCompare(valorB.toString())
                : valorB.toString().localeCompare(valorA.toString());
        }
    });

    return (
        <div className='Solicitudes'>
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
                    <div className='Botones'>
                        <button className='btn btn-success' onClick={descargarArchivoMaterialDisponible}>Descargar Material</button>
                    </div>
                    <div className='Subtitulo'>
                        <span>Material en Bodega</span>
                    </div>
                    <div className='Tabla'>
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(resultadoMaterialDisponibleCorto[0] || {}).map((columna) => (
                                        <th key={columna} onClick={() => manejarOrden(columna)}>
                                            {formatearNombreColumna(columna)}
                                            {orden.columna === columna ? (orden.ascendente ? <i className="fa-solid fa-sort-up"></i> : <i className="fa-solid fa-sort-down"></i>) : <i className="fa-solid fa-sort"></i>}
                                            <br />
                                            <input
                                                type="text"
                                                onChange={(e) => manejarCambioFiltroMaterialDisponible(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosOrdenados.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(resultadoMaterialDisponibleCorto[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    datosOrdenados.slice(0, expandidoMaterialDisponible ? datosOrdenados.length : 6).map((fila, index) => (
                                        <tr key={`${fila.Bodega}-${fila.Codigo}`}>
                                            {Object.values(fila).map((valor, idx) => (
                                                <td key={idx}>
                                                    {valor}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className='Boton'>
                        <span onClick={() => {
                            setExpandidoMaterialDisponible(!expandidoMaterialDisponible);
                        }}>
                            {expandidoMaterialDisponible ? "Mostrar menos" : "Mostrar mas"}
                        </span>
                    </div>

                    <div className='Notificaciones'>
                        <ToastContainer />
                    </div>
                </>
            )}
        </div>
    );
};

export default MaterialPrincipalBodega;
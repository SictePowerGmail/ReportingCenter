import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materialPrincipal.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { calculoMaterial } from './calculoMaterial';

const MaterialPrincipalBodega = ({ dataKgprod }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [resultadoMaterialDisponible, setResultadoMaterialDisponible] = useState([]);
    const [resultadoMaterialDisponibleCorto, setResultadoMaterialDisponibleCorto] = useState([]);

    const MaterialDisponible = async () => {

        const ciudades = [
            "Manizales",
            "Pereira Operaciones",
            "Armenia",
            "Bogota San Cipriano Corporativo",
            "Bogota San Cipriano Red Externa",
            "Pereira Corporativo Red Externa",
        ];

        const resultados = [];

        for (const ciudad of ciudades) {
            const resultado = await calculoMaterial(ciudad, dataKgprod);
            resultados.push(...resultado);
        }

        setResultadoMaterialDisponible(resultados);

        const datosMaterialDisponible = resultados
            .map(({ Bodega, codigo, descrip, unimed, cantidadDisponible, cantidadSolicitada, cantidadPendienteDespacho, ind_comprado_2 }) => {

                return {
                    Bodega: Bodega,
                    Codigo: codigo,
                    Descripcion: descrip,
                    Unidad: unimed,
                    IndComprado: ind_comprado_2,
                    CantidadDisponible: cantidadDisponible,
                    CantidadReservada: cantidadSolicitada + cantidadPendienteDespacho
                };
            })
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

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = datosOrdenados.slice(indexOfFirstRow, indexOfLastRow);

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
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => manejarCambioFiltroMaterialDisponible(columna, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={Object.keys(resultadoMaterialDisponibleCorto[0] || {}).length} style={{ textAlign: 'center' }}>
                                            No hay registros
                                        </td>
                                    </tr>
                                ) : (
                                    currentRows.map((fila, index) => (
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
                    <div className="paginacion">
                        <button className='btn btn-secondary'
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span>Página {currentPage} de {Math.ceil(datosOrdenados.length / rowsPerPage)}</span>
                        <button className='btn btn-secondary'
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    prev < Math.ceil(datosOrdenados.length / rowsPerPage)
                                        ? prev + 1
                                        : prev
                                )
                            }
                            disabled={currentPage >= Math.ceil(datosOrdenados.length / rowsPerPage)}
                        >
                            Siguiente
                        </button>
                    </div>
                    <div className='Boton'>
                        <span>Total de ítems: {datosOrdenados.length}</span>
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
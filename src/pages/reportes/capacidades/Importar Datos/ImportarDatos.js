import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ImportarDatos = ({ role }) => {
    let datosAgregadosBandera = [];
    const [datos, setDatos] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [error, setError] = useState('');
    const [datosAgregados, setDatosAgregados] = useState([]);
    const [datosCompletosAgregados, setDatosCompletosAgregados] = useState([]);
    const [datosMovil, setDatosMovil] = useState([]);
    const [tipoMovilAdmon, setTipoMovilAdmon] = useState([]);
    const [tipoMovilEvento, setTipoMovilEvento] = useState([]);
    const [tipoFacturacion, setTipoFacturacion] = useState([]);
    const [filtrosAgregados, setFiltrosAgregados] = useState({});
    const [ordenarCampo, setOrdenarCampo] = useState('nombre');
    const [ordenarCampoAgregados, setOrdenarCampoAgregados] = useState('nombreCompleto');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [ordenarOrdenAgregados, setOrdenarOrdenAgregados] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [totalItemsAgregados, setTotalItemsAgregados] = useState(0);
    const [filasSeleccionadas, setFilasSeleccionadas] = useState(new Set());
    const [carpeta, setCarpeta] = useState("");
    const [placa, setPlaca] = useState("");
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const [selectedItemTipoFacturacion, setSelectedItemTipoFacturacion] = useState('Seleccionar opción');
    const [selectedItemTipoMovil, setSelectedItemTipoMovil] = useState('Seleccionar opción');
    const [selectedItemCoordinador, setSelectedItemCoordinador] = useState('Seleccionar opción');
    const [coordinadores, setCoordinadores] = useState([]);
    const [cedulas, setCedulas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtrosLimpiados, setFiltrosLimpiados] = useState(false);
    const archivoEntradaRef = useRef(null);
    const [archivoInfo, setArchivoInfo] = useState({ name: '', lastModified: '' });
    const [excelData, setExcelData] = useState([]);

    const cargarDatosCoordinador = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/Coordinador')
            .then(response => response.json())
            .then(data => {
                const coordDirect = new Set();
                data.forEach(item => {
                    coordDirect.add(item.coordinador);
                    coordDirect.add(item.director);
                });
                const unirCoordDirect = Array.from(coordDirect).sort((a, b) => a.localeCompare(b));
                
                setCoordinadores(unirCoordDirect);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const cargarDatosMovil = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/Movil')
            .then(response => response.json())
            .then(data => {

                const facturacion = data
                    .sort((a, b) => a.tipoFacturacion.localeCompare(b.tipoFacturacion))
                    .map(item => item.tipoFacturacion);

                const facturacionUnica = [...new Set(facturacion)];

                const admon = data
                    .filter(item => item.tipoFacturacion === 'ADMON')
                    .sort((a, b) => a.tipoMovil.localeCompare(b.tipoMovil))
                    .map(item => item.tipoMovil);
                
                const evento = data
                    .filter(item => item.tipoFacturacion === 'EVENTO')
                    .sort((a, b) => a.tipoMovil.localeCompare(b.tipoMovil))
                    .map(item => item.tipoMovil);

                setDatosMovil(data);
                setTipoFacturacion(facturacionUnica);
                setTipoMovilAdmon(admon);
                setTipoMovilEvento(evento);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const cargarDatos = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/ContinuaEnPlantaSinCapacidad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        })
            .then(response => response.json())
            .then(data => {
                const nit = data
                    .sort((a, b) => a.nit.localeCompare(b.nit))
                    .map(item => item.nit);

                const nitUnica = [...new Set(nit)];
                setCedulas(nitUnica);
                setDatos(data);
                setTotalItems(data.length);
                setLoading(false);
            })
            .catch(error => {
                setError('Error al cargar los datos: ' + error.message);
                setLoading(false); 
            });
    };

    const cargarDatosAgregados = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/Todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        })
            .then(response => response.json())
            .then(data => {
                const datosFiltrados = data.filter(item => {
                    const fecha = new Date(item.fechaReporte);
                    const dia = fecha.getDate();
                    return dia === 2;
                });
                setDatosCompletosAgregados(data);
                setDatosAgregados(datosFiltrados);
                setTotalItemsAgregados(datosFiltrados.length);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    useEffect(() => {
        cargarDatosCoordinador();
        //setDatosCompletosAgregados([]);
        //setDatosAgregados([]);
        //datosAgregadosBandera = [];
        //setDatos([]);
        cargarDatos();
        cargarDatosAgregados();
        cargarDatosMovil();
        //BotonLimpiarFiltros();
    }, []);

    const BotonLimpiarFiltros = () => {
        setFiltrosAgregados({});
        setFiltros({});
        document.querySelectorAll('.tabla-container input[type="text"]').forEach(input => {
            input.value = '';
        });
        setSelectedItemTipoFacturacion('Seleccionar opción');
        setSelectedItemTipoMovil('Seleccionar opción');
        setSelectedItemCoordinador('Seleccionar opción');
        setCarpeta("");
        setPlaca("");
    };

    const clickEncabezados = (columna) => {
        if (ordenarCampo === columna) {
            // Cambiar el orden de clasificación si ya se ha ordenado por la misma columna
            setOrdenarOrden(ordenarOrden === 'asc' ? 'desc' : 'asc');
        } else {
            // Si se selecciona una nueva columna, ordenarla de forma ascendente
            setOrdenarCampo(columna);
            setOrdenarOrden('asc');
        }
    };

    useEffect(() => {
        setTotalItems(filtrarDatos.length);
        setTotalItemsAgregados(filtrarDatosAgregados.length);
    }, [filtros, filtrosAgregados]);

    const clickAplicarFiltros = (e, columna) => {
        const Valor = e.target.value;
        setFiltros({ ...filtros, [columna]: Valor });
    };

    const filtrarDatos = datos.filter(item => {
        for (let key in filtros) {
            if (filtros[key] && item[key] && !item[key].toLowerCase().includes(filtros[key].toLowerCase())) {
                return false;
            }
        }
        return true;
    });

    const ordenarDatos = filtrarDatos.sort((a, b) => {
        if (ordenarCampo) {
            // Convertir los valores a minúsculas para asegurar una comparación insensible a mayúsculas y minúsculas
            const valueA = typeof a[ordenarCampo] === 'string' ? a[ordenarCampo].toLowerCase() : a[ordenarCampo];
            const valueB = typeof b[ordenarCampo] === 'string' ? b[ordenarCampo].toLowerCase() : b[ordenarCampo];

            if (valueA < valueB) {
                return ordenarOrden === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return ordenarOrden === 'asc' ? 1 : -1;
            }
            return 0;
        } else {
            return 0;
        }
    });

    const getIconoFiltro = (columna) => {
        if (ordenarCampo === columna) {
            return ordenarOrden === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
        return 'fas fa-sort';
    };

    const validarCapacidadMovil = (data) => {
        if (data.tipoFacturacion === 'EVENTO' && data.tipoMovil !== 'BACKUP') {
            const datos = {
                placa: data.placa,
                tipoFacturacion: data.tipoFacturacion,
                tipoDeMovil: data.tipoMovil,
                cedula: data.cedula,
                coordinador: data.coordinador
            };

            const movilesExistente = datosCompletosAgregados.filter(movil => movil.placa === data.placa);
            const movilesExistenteBandera = datosAgregadosBandera.filter(movil => movil.placa === data.placa);

            if (movilesExistente.length > 0) {
                const capacidadMaxima = parseFloat(movilesExistente[0].personas) * parseFloat(movilesExistente[0].turnos);
                const capacidadActual = movilesExistente.length;
                let capacidadActualBandera = 0;

                if (movilesExistenteBandera.length > 0) {
                    capacidadActualBandera = movilesExistenteBandera.length;
                }

                if ((capacidadActual + capacidadActualBandera) >= capacidadMaxima) {
                    return false;
                }

                datosAgregadosBandera.push(datos);
                return true;

            } else if (movilesExistente.length === 0 && movilesExistenteBandera.length === 0) {
                datosAgregadosBandera.push(datos);
                return true;
            } else if (movilesExistente.length === 0 && movilesExistenteBandera.length > 0) {
                const tipoDeMovilBandera = datosMovil.filter(movil => movil.tipoMovil === movilesExistenteBandera[0].tipoDeMovil);
                const capacidadMaxima = parseFloat(tipoDeMovilBandera[0].personas) * parseFloat(tipoDeMovilBandera[0].turnos);
                const capacidadActual = movilesExistenteBandera.length;

                if (capacidadActual >= capacidadMaxima) {
                    return false;
                }

                datosAgregadosBandera.push(datos);
                return true;
            }
        } else {
            return true;
        }
    };

    const limpiarFiltros = () => {
        setFiltrosAgregados({});
        setFiltros({});
        document.querySelectorAll('.tabla-container input[type="text"]').forEach(input => {
            input.value = '';
        });
        setFiltrosLimpiados(true);
    };

    useEffect(() => {
        if (filtrosLimpiados) {
            let cedulasSeleccionadas = [];

            if (!excelData || excelData.length === 0) {
                toast.error(`Datos no importados`);
            }

            excelData.forEach(row => {
                const cedulaExcel = row['Cedula'];
                const tipoFacturacionExcel = row['Tipo Facturacion'];
                const tipoMovilExcel = row['Tipo Movil'];
                const coordinadorExcel = row['Coordinador'];
                const carpetaExcel = row['Carpeta'];
                const placaExcel = row['Placa'];

                cedulasSeleccionadas.push({
                    cedula: cedulaExcel,
                    tipoFacturacion: tipoFacturacionExcel,
                    tipoMovil: tipoMovilExcel,
                    coordinador: coordinadorExcel,
                    carpeta: carpetaExcel,
                    placa: placaExcel
                });
            });

            const promises = cedulasSeleccionadas.map(item => {
                const data = {
                    id: 1,
                    carpeta: item.carpeta,
                    placa: item.placa,
                    tipoFacturacion: item.tipoFacturacion,
                    tipoMovil: item.tipoMovil,
                    cedula: item.cedula,
                    coordinador: item.coordinador
                };

                if (cedulas.includes(item.cedula)) {
                } else {
                    toast.error(`Cedula '${item.cedula}' no valido: `, { className: 'toast-error' });
                    return Promise.reject('Cedula no valido');
                }

                if (tipoFacturacion.includes(item.tipoFacturacion)) {
                    if (item.tipoFacturacion === "ADMON" && tipoMovilAdmon.includes(item.tipoMovil)) {
                    } else if (item.tipoFacturacion === "EVENTO" && tipoMovilEvento.includes(item.tipoMovil)) {
                    } else {
                        toast.error(`Tipo Movil '${item.tipoMovil}' no valido: `, { className: 'toast-error' });
                        return Promise.reject('Tipo Movil no valido');
                    }
                } else {
                    toast.error(`Tipo Facturacion '${item.tipoFacturacion}' no valido: `, { className: 'toast-error' });
                    return Promise.reject('Tipo Facturacion no valido');
                }
    
                if (coordinadores.includes(item.coordinador)) {
                } else {
                    toast.error(`Coordinador '${item.tipoMovil}' no valido: `, { className: 'toast-error' });
                    return Promise.reject('Coordinador no valido');
                }

                if (!validarPlaca(data)) {
                    toast.error('Placa no válida, Ejemplo - ABC001 o ABC01D: ', { className: 'toast-error' });
                    return Promise.reject('Placa no válida');
                }

                if (!validarCapacidadMovil(data)) {
                    toast.error(`La movil con placa ${data.placa} ha excedido su capacidad.`);
                    return Promise.reject('Placa Capacidad Maxima');
                } else {
                    return fetch('https://sicteferias.from-co.net:8120/capacidad/agregarPersonal', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    })
                    .then(response => {
                        if (!response.ok) {
                            toast.error('No se cargaron los datos', { className: 'toast-error' });
                            throw new Error(`Error al agregar los datos: ${response.status}`);
                        } else {
                            console.log('Fila enviada correctamente');
                            toast.success('Datos cargados', { className: 'toast-success' });
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        toast.error(`Error al enviar la fila: ${error.message}`, { className: 'toast-error' });
                        setError('Error al enviar los datos al backend: ' + error.message);
                    });
                }
            });

            Promise.all(promises)
                .then(() => {
                    setDatosAgregados([]);
                    setDatos([]);
                    setFilasSeleccionadas(new Set());
                    BotonLimpiarFiltros();
                    datosAgregadosBandera = [];
                    setFiltrosLimpiados(false);
                    return delay(1000);
                })
                .then(() => {
                    cargarDatos();
                    cargarDatosAgregados();
                })
                .catch(error => {
                    setError('Error al aplicar los cambios: ' + error.message);
                });
        }
    }, [filtrosLimpiados]);

    const ClickCargar = () => {
        limpiarFiltros();
    };

    const clickEncabezadosAgregados = (columna) => {
        if (ordenarCampoAgregados === columna) {
            // Cambiar el orden de clasificación si ya se ha ordenado por la misma columna
            setOrdenarOrdenAgregados(ordenarOrdenAgregados === 'asc' ? 'desc' : 'asc');
        } else {
            // Si se selecciona una nueva columna, ordenarla de forma ascendente
            setOrdenarCampoAgregados(columna);
            setOrdenarOrdenAgregados('asc');
        }
    };

    const clickAplicarFiltrosAgregados = (e, columna) => {
        const Valor = e.target.value;
        setFiltrosAgregados({ ...filtrosAgregados, [columna]: Valor });
    };

    const filtrarDatosAgregados = datosAgregados.filter(item => {
        for (let key in filtrosAgregados) {
            if (filtrosAgregados[key] && item[key] && !item[key].toLowerCase().includes(filtrosAgregados[key].toLowerCase())) {
                return false;
            }
        }
        return true;
    });

    const ordenarDatosAgregados = filtrarDatosAgregados.sort((c, d) => {
        if (ordenarCampoAgregados) {
            // Convertir los valores a minúsculas para asegurar una comparación insensible a mayúsculas y minúsculas
            const valueC = typeof c[ordenarCampoAgregados] === 'string' ? c[ordenarCampoAgregados].toLowerCase() : c[ordenarCampoAgregados];
            const valueD = typeof d[ordenarCampoAgregados] === 'string' ? d[ordenarCampoAgregados].toLowerCase() : d[ordenarCampoAgregados];

            if (valueC < valueD) {
                return ordenarOrdenAgregados === 'asc' ? -1 : 1;
            }
            if (valueC > valueD) {
                return ordenarOrdenAgregados === 'asc' ? 1 : -1;
            }
            return 0;
        } else {
            return 0;
        }
    });

    const getIconoFiltroAgregados = (columna) => {
        if (ordenarCampoAgregados === columna) {
            return ordenarOrdenAgregados === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
        return 'fas fa-sort';
    };

    const formatearValorEsperado = (valorEsperado) => {
        const valor = valorEsperado !== "null" ? valorEsperado : 0;
        const formatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        });
        return formatter.format(valor);
    };

    const validarPlaca = (item) => {
        const placa = item.placa;
        if (item.tipoFacturacion === 'EVENTO' && item.tipoMovil !== 'BACKUP') {

            if (placa && placa.length === 6) {
                const primerosTres = placa.substring(0, 3);
                const cuartoYQuinto = placa.substring(3, 5);
                const sexto = placa.substring(5, 6);

                const regexLetras = /^[A-Z]+$/;
                const regexNumeros = /^[0-9]+$/;

                if (regexLetras.test(primerosTres) && regexNumeros.test(cuartoYQuinto) && (regexLetras.test(sexto) || regexNumeros.test(sexto))) {
                    return true;
                }
            }
        } else if (item.tipoFacturacion === 'ADMON' || (item.tipoFacturacion === 'EVENTO' && item.tipoMovil === 'BACKUP')) {
            if (placa === null || placa === "" || placa === undefined ) {
                return true;
            } else if (placa.length === 6) {
                const primerosTres = placa.substring(0, 3);
                const cuartoYQuinto = placa.substring(3, 5);
                const sexto = placa.substring(5, 6);

                const regexLetras = /^[A-Z]+$/;
                const regexNumeros = /^[0-9]+$/;

                if (regexLetras.test(primerosTres) && regexNumeros.test(cuartoYQuinto) && (regexLetras.test(sexto) || regexNumeros.test(sexto))) {
                    return true;
                }
            }
        }
        return false;
    };

    const exportarPlantaPendientes = () => {
        const ws = XLSX.utils.json_to_sheet(ordenarDatos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Planta Pendientes.xlsx');
    };

    const ClickImportar = () => {
        archivoEntradaRef.current.click();
    };

    const CambioArchivoCargado = (event) => {
        const file = event.target.files[0];
        setArchivoInfo({
            name: file.name,
            lastModified: new Date(file.lastModified).toLocaleDateString()
        });

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setExcelData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div>
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
                <div id="Principal-Container">
                    <div id='Principal-Agregar'>
                        <div id="Principal-Agregar-Botones-Importar">
                            {/* Original: https://drive.google.com/file/d/FILE_ID/view?usp=sharing */}
                            {/* Para Descargar: https://drive.google.com/uc?export=download&id=FILE_ID */}
                            <div id='Botones-Descargar'>
                                <a href={'https://docs.google.com/uc?export=download&id=1UQYv7YV86f6P7sDIMpn8RunhnbXhxMjT'}>
                                    <button id='Boton-Descargar' className="btn btn-secondary">Descargar Archivo Plano</button>
                                </a>
                                <button id='Boton-Descargar' className="btn btn-secondary" onClick={exportarPlantaPendientes}>Descargar Planta de Pendientes</button>
                            </div>
                            <div>
                                <button id='Boton-Importar' className="btn btn-secondary" onClick={ClickImportar}>Importar</button>
                                <input
                                    type="file"
                                    ref={archivoEntradaRef}
                                    style={{ display: 'none' }}
                                    onChange={CambioArchivoCargado}
                                />
                            </div>
                            <div id='Archivo-Cargado'>
                                <h6>Datos Cargados:</h6>
                                <p>
                                    {archivoInfo.name && `${archivoInfo.name}`}
                                </p>
                            </div>
                            <div>
                                <button id='Boton-Cargar' className="btn btn-primary" onClick={ClickCargar}>Cargar Datos</button>
                            </div>
                        </div>

                        <div id="Principal-Agregar-Pendientes">
                            <div id='Titulo'>
                                <span>Pendientes</span>
                            </div>
                            <div className="tabla-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {['nit', 'nombre', 'cargo', 'perfil', 'director'].map(columna => (
                                                <th key={columna}>
                                                    <div>
                                                        {columna.charAt(0).toUpperCase() + columna.slice(1)} <i className={getIconoFiltro(columna)} onClick={() => clickEncabezados(columna)} style={{ cursor: 'pointer' }}></i>
                                                    </div>
                                                    <input type="text" onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                clickAplicarFiltros(e, columna);
                                                            }
                                                        }}
                                                    />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordenarDatos.map((item) => (
                                            <tr key={item.nit}>
                                                <td>{item.nit}</td>
                                                <td>{item.nombre}</td>
                                                <td>{item.cargo}</td>
                                                <td>{item.perfil}</td>
                                                <td>{item.director}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div id='piePagina'>
                                <p>Total de items: {totalItems}</p>
                                <div id='Botones-piePagina'>

                                </div>
                            </div>
                        </div>

                        <div id="Principal-Agregar-Agregados">
                            <div id='Titulo'>
                                <span>Agregados</span>
                            </div>
                            <div className="tabla-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {['cedula', 'nombreCompleto', 'cargo', 'centroCosto', 'nomina', 'regional', 'ciudadTrabajo', 'red', 'cliente', 'area', 'subArea', 'tipoDeMovil', 'tipoFacturacion', 'movil', 'coordinador', 'director', 'valorEsperado', 'placa', 'fechaReporte', 'mes', 'año', 'turnos', 'personas', 'carpeta'].map(columna => (
                                                <th key={columna}>
                                                    <div>
                                                        {columna.charAt(0).toUpperCase() + columna.slice(1)} <i className={getIconoFiltroAgregados(columna)} onClick={() => clickEncabezadosAgregados(columna)} style={{ cursor: 'pointer' }}></i>
                                                    </div>
                                                    <input type="text" onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                clickAplicarFiltrosAgregados(e, columna);
                                                            }
                                                        }}
                                                    />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordenarDatosAgregados.map((item) => (
                                            <tr key={item.cedula}>
                                                {Object.keys(item).slice(1)
                                                    .filter(key => key !== 'codigoSap')
                                                    .filter(key => key !== 'contratista')
                                                    .filter(key => key !== 'tipoCarro')
                                                    .map((key, i) => (
                                                        <td key={i}>
                                                            {key === 'valorEsperado' ? formatearValorEsperado(item[key]) : item[key]}
                                                        </td>
                                                    ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div id='piePagina'>
                                <p>Total de items: {totalItemsAgregados}</p>
                                <div id='Botones-piePagina'>

                                </div>
                            </div>
                        </div>
                        <ToastContainer />
                    </div>
                </div>
            )} 
        </div>
    );
};

export default ImportarDatos;
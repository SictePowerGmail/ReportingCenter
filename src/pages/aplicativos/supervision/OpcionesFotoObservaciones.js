import { useEffect } from 'react';
import Entradas from "../../../components/entradas/entradas";
import Botones from "../../../components/botones/botones";
import Textos from "../../../components/textos/textos";
import AreaTextos from "../../../components/areaTextos/areaTextos";
import Imagenes from "../../../components/imagenes/imagenes";

export const OpcionesFotoObservaciones = ({
    texto,
    keyPrin,
    keyBase,
    fotoKey,
    observacionKey,
    activarinput,
    onChange,
    data,
    setImagen,
    disabled = false,
    imagenBool = false,
    imagenKey,
    fechaVencimientoBool = false,
    fechaVencimientoKey,
    cantidadEstimadaBool = false,
    cantidadEstimadaKey,
    cantidadExistenteBool = false,
    cantidadExistenteKey,
    tituloOpcionesBotones = 'Inspeccion',
    opcionesBotones = ["C", "NC", "NA"],
}) => {
    const fechaVencimientoStr = data[keyPrin]?.[fechaVencimientoKey];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let vencido = false;

    const parseFechaLocal = (fechaStr) => {
        const [año, mes, dia] = fechaStr.split('-').map(Number);
        return new Date(año, mes - 1, dia);
    };

    if (fechaVencimientoStr) {
        const fechaVencimiento = parseFechaLocal(fechaVencimientoStr);
        fechaVencimiento.setHours(0, 0, 0, 0);
        vencido = !isNaN(fechaVencimiento) && fechaVencimiento < hoy;
    }

    useEffect(() => {
        if (vencido && data[keyPrin][keyBase] !== "NC") {
            onChange(`${keyPrin}.${keyBase}`, "NC");
        }
    }, [vencido, data, keyPrin, keyBase, onChange]);

    return (
        <div className={`cartas ${data[keyPrin][cantidadEstimadaKey] === "0" ? 'oculto' : ''}`}>
            <Textos className='subtitulo sub'>{texto}</Textos>
            <div className={`opciones imagenElemento ${imagenBool === false ? 'oculto' : ''}`}>
                <img src={imagenKey} alt={imagenKey} />
            </div>
            <div className={`opciones fecha ${fechaVencimientoBool === false ? 'oculto' : ''}`}>
                <Textos className='parrafo'>Fecha de vencimiento</Textos>
                <Entradas
                    type="date"
                    placeholder="Seleccione una fecha"
                    value={data[keyPrin][fechaVencimientoKey]}
                    onChange={(e) => onChange(`${keyPrin}.${fechaVencimientoKey}`, e.target.value)}
                    disabled={data[keyPrin][keyBase] === 'NA'}
                />
            </div>
            <div className={`opciones cantidad ${cantidadEstimadaBool === false ? 'oculto' : ''}`} >
                <Textos className='parrafo'>Cantidad estimada</Textos>
                <Entradas
                    disabled
                    value={data[keyPrin][cantidadEstimadaKey]}
                />
            </div>
            <div className={`opciones cantidad ${cantidadExistenteBool === false ? 'oculto' : ''}`} >
                <Textos className='parrafo'>Cantidad existente</Textos>
                <Entradas
                    type="number"
                    min="0"
                    placeholder="Ingrese la cantidad existente"
                    onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === '+') {
                            e.preventDefault();
                        }
                    }}
                    value={data[keyPrin][cantidadExistenteKey]}
                    onChange={(e) => onChange(`${keyPrin}.${cantidadExistenteKey}`, e.target.value)}
                    disabled={data[keyPrin][keyBase] === 'NA'}
                />
            </div>
            <div className='opciones'>
                <Textos className='parrafo'>{tituloOpcionesBotones}</Textos>
                <div className="Botones">
                    {opcionesBotones.map((opcion) => (
                        <Botones
                            key={opcion}
                            onClick={() => onChange(`${keyPrin}.${keyBase}`, opcion)}
                            className={data[keyPrin][keyBase] === opcion ? 'formulario selected' : ''}
                            disabled={disabled || vencido}
                        >
                            {opcion}
                        </Botones>
                    ))}
                </div>
            </div>
            <div className={`opciones fotos ${data[keyPrin][keyBase] === 'NC' || data[keyPrin][keyBase] === 'No' ? '' : activarinput === true ? '' : 'oculto'}`} >
                <Textos className='parrafo'>Imagen(es)</Textos>
                <Imagenes disableInput={disabled} fotoKey={fotoKey} foto={data[keyPrin][fotoKey]} onChange={(fotoKey, data) => onChange(`${keyPrin}.${fotoKey}`, data)} capture={data.tipoInspeccion === 'Presencial' ? true : false} setImagen={(data) => setImagen(data)} />
            </div>
            <div className={`opciones ${data[keyPrin][keyBase] === 'NC' || data[keyPrin][keyBase] === 'Malo' || data[keyPrin][keyBase] === 'Regular' || data[keyPrin][keyBase] === 'No' ? '' : 'oculto'}`} >
                <Textos className='parrafo'>Observacion</Textos>
                <AreaTextos
                    type="text"
                    placeholder="Agregue las observacion pertinentes"
                    defaultValue={data[keyPrin][observacionKey]}
                    onChange={(e) => onChange(`${keyPrin}.${observacionKey}`, e.target.value)}
                    rows={4}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};
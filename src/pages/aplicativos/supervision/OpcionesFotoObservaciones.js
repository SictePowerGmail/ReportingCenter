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
}) => {

    return (
        <>
            <Textos className='subtitulo sub'>{texto}</Textos>
            <div className='opciones'>
                {["C", "NC", "NA"].map((opcion) => (
                    <Botones
                        key={opcion}
                        onClick={() => onChange(`${keyPrin}.${keyBase}`, opcion)}
                        className={data[keyPrin][keyBase] === opcion ? 'formulario selected' : ''}
                        disabled={disabled}
                    >
                        {opcion}
                    </Botones>
                ))}
            </div>
            <div className={`opciones ${data[keyPrin][keyBase] !== 'NC' ? activarinput !== true ? 'oculto' : '' : ''}`} >
                <Imagenes disableInput={disabled} fotoKey={fotoKey} foto={data[keyPrin][fotoKey]} onChange={(fotoKey, data) => onChange(`${keyPrin}.${fotoKey}`, data)} capture={data[keyPrin].tipoInpseccion !== 'Virtual' ? true : false} setImagen={(data) => setImagen(data)}/>
            </div>
            <div className={`opciones ${data[keyPrin][keyBase] !== 'NC' ? 'oculto' : ''}`} >
                <AreaTextos
                    type="text"
                    placeholder="Agregue las observacion pertinentes"
                    defaultValue={data[keyPrin][observacionKey]}
                    onChange={(e) => onChange(`${keyPrin}.${observacionKey}`, e.target.value)}
                    rows={4}
                    disabled={disabled}
                />
            </div>
        </>
    );
};
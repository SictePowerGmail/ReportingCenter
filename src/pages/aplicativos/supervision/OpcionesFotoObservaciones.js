import Entradas from "../../../components/entradas/entradas";
import Botones from "../../../components/botones/botones";
import Textos from "../../../components/textos/textos";
import AreaTextos from "../../../components/areaTextos/areaTextos";
import Imagenes from "../../../components/imagenes/imagenes";

export const OpcionesFotoObservaciones = ({ texto, keyBase, fotoKey, observacionKey, activarinput, onChange, data, setImagen }) => {

    return (
        <>
            <Textos className='subtitulo sub'>{texto}</Textos>
            <div className='opciones'>
                {["C", "NC", "NA"].map((opcion) => (
                    <Botones
                        key={opcion}
                        onClick={() => onChange(keyBase, opcion)}
                        className={data[keyBase] === opcion ? 'formulario selected' : ''}
                    >
                        {opcion}
                    </Botones>
                ))}
            </div>
            <div className={`opciones ${data[keyBase] !== 'NC' ? activarinput !== true ? 'oculto' : '' : ''}`} >
                <Imagenes fotoKey={fotoKey} foto={data[fotoKey]} onChange={(fotoKey, data) => onChange(fotoKey, data)} capture={data.tipoInpseccion !== 'Virtual' ? true : false} setImagen={(data) => setImagen(data)}/>
            </div>
            <div className={`opciones ${data[keyBase] !== 'NC' ? 'oculto' : ''}`} >
                <AreaTextos
                    type="text"
                    placeholder="Agregue las observacion pertinentes"
                    defaultValue={data[observacionKey]}
                    onChange={(e) => onChange(observacionKey, e.target.value)}
                    rows={4}
                />
            </div>
        </>
    );
};
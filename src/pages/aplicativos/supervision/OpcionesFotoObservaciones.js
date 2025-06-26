import Entradas from "../../../components/entradas/entradas";
import Botones from "../../../components/botones/botones";
import Textos from "../../../components/textos/textos";
import AreaTextos from "../../../components/areaTextos/areaTextos";

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
                <Entradas
                    type="file"
                    className="image"
                    accept="image/*"
                    capture={data.tipoInpseccion !== 'Virtual' ? "environment" : ''}
                    onChange={(e) => onChange(fotoKey, e.target.files[0])}
                />
                <Textos className='parrafo'>{data[fotoKey]?.name || 'Ningún archivo ingresado'}</Textos>
                <Botones className={`imagenes ${data[fotoKey]?.data ? '' : 'oculto'}`} onClick={() => setImagen(data[fotoKey].data)}>Ver imagen</Botones>
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
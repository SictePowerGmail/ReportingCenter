import Entradas from '../entradas/entradas';
import Textos from '../textos/textos';
import Botones from '../botones/botones';
import './imagenes.css';

const Imagenes = ({
    onChange,
    capture = false,
    fotoKey,
    foto,
    setImagen,
    disableInput = false,
    ocultarDiv = false,
}) => {
    return (
        <div className={`imagen ${ocultarDiv === true ? 'ocultar' : ''}`}>
            <Entradas
                type="file"
                className="image"
                accept="image/*"
                capture={capture === true ? "environment" : undefined}
                onChange={(e) => onChange(fotoKey, e.target.files[0])}
                disabled={disableInput}
            />
            <Textos className='parrafo'>{foto?.name || 'Ningún archivo ingresado'}</Textos>
            <Botones className={`imagenes ${foto?.data ? '' : 'oculto'}`} onClick={() => setImagen(foto.data)}>Ver imagen</Botones>
        </div>
    );
};

export default Imagenes;
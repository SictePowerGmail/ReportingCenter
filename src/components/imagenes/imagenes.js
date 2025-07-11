import { useState, useEffect } from 'react';
import Entradas from '../entradas/entradas';
import Textos from '../textos/textos';
import Botones from '../botones/botones';
import './imagenes.css';
import { isConstructorDeclaration } from 'typescript';

const Imagenes = ({
    onChange,
    capture = false,
    fotoKey,
    foto,
    setImagen,
    disableInput = false,
    ocultarDiv = false,
}) => {

    const procesarImagen = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const base64Resized = canvas.toDataURL(file.type);
                    resolve(base64Resized);
                };
            };
            reader.onerror = (error) => reject(error);

        });

    const imagenes = Array.isArray(foto) ? foto : foto && foto.name ? [foto] : [];

    const handleImagenChange = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await procesarImagen(file);
        const nuevaImagen = { name: file.name, data: base64 };
        const nuevasImagenes = Array.isArray(imagenes) ? [...imagenes] : [];
        nuevasImagenes.push(nuevaImagen);
        onChange(fotoKey, nuevasImagenes);
    };

    const eliminarImagen = (index) => {
        const nuevasImagenes = [...imagenes];
        nuevasImagenes.splice(index, 1);
        onChange(fotoKey, nuevasImagenes);
    };

    return (
        <>
            <div className={`imagen ${ocultarDiv ? 'ocultar' : ''}`}>
                {imagenes.map((img, index) => (
                    <div key={index} className="grupo-imagen">
                        <Entradas
                            type="file"
                            className="image"
                            accept="image/*"
                            capture={capture ? 'environment' : undefined}
                            onChange={(e) => handleImagenChange(e, index)}
                            disabled={disableInput}
                        />
                        <Textos className='parrafo'>{img?.name || 'Ningún archivo ingresado'}</Textos>
                        <div className="botones-imagen">
                            {img?.data && (
                                <Botones className='imagenes' onClick={() => setImagen(img.data)}>
                                    Ver imagen
                                </Botones>
                            )}
                            <Botones className='eliminar' disabled={disableInput} onClick={() => eliminarImagen(index)}>
                                Eliminar
                            </Botones>
                        </div>
                    </div>
                ))}

                <div className={`grupo-imagen`}>
                    <Entradas
                        type="file"
                        className="image"
                        accept="image/*"
                        capture={capture ? 'environment' : undefined}
                        onChange={(e) => handleImagenChange(e, imagenes.length)}
                        disabled={disableInput}
                    />
                    <Textos className={`parrafo`}>{disableInput ? imagenes.length > 0 ? '' : 'Sin imagen' : 'Cargar nueva imagen'}</Textos>
                </div>
            </div>
        </>
    );
};

export default Imagenes;
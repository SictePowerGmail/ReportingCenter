import { useRef, useState, useEffect } from "react";
import './camaraHD.css'
import Botones from "../botones/botones";

const CamaraHD = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        const iniciarCamara = async () => {
            try {
                const constraints = {
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: "environment"
                    }
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                videoRef.current.srcObject = stream;
                setStream(stream);
            } catch (error) {
                console.error("Error al acceder a la cámara:", error);
            }
        };

        iniciarCamara();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturar = () => {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 800;
        canvas.height = (video.videoHeight / video.videoWidth) * 800;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64 = canvas.toDataURL("image/jpeg", 0.5);
        onCapture(base64);
        cerrarCamara();
    };

    const cerrarCamara = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onClose();
    };

    return (
        <div className="modal-fondo">
            <div className="modal-contenido-foto">
                <video ref={videoRef} autoPlay playsInline width="100%" />
                <div className="botonesCamara">
                    <Botones id="botonCamara" className="guardar" onClick={capturar}>Capturar</Botones>
                    <Botones id="botonCamara" className="eliminar" onClick={cerrarCamara}>Cerrar</Botones>
                </div>
            </div>
        </div>
    );
};

export default CamaraHD;

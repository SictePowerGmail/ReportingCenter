import { ThreeDots } from 'react-loader-spinner';
import './cargandoDatos.css'

const CargandoDatos = ({ }) => {
  return (
    <div className='CargandoDatos'>
      <ThreeDots
        type="ThreeDots"
        color="#0B1A46"
        height={200}
        width={200}
      />
      <p>... Cargando Datos ...</p>
    </div>
  );
};

export default CargandoDatos;

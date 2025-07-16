import React, { useEffect, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import './cargandoDatos.css'

const CargandoDatos = ({
  text,
}) => {
  const [loaderColor, setLoaderColor] = useState('');

  useEffect(() => {
    const getColor = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--background-menu-cuerpo-contrario')
        .trim();

    setLoaderColor(getColor());

    const observer = new MutationObserver(() => {
      setLoaderColor(getColor());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className='CargandoDatos'>
      <ThreeDots
        type="ThreeDots"
        color={loaderColor}
        height={200}
        width={200}
      />
      <p>... {text} ...</p>
    </div>
  );
};

export default CargandoDatos;

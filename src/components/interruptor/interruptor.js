import React from 'react';
import './interruptor.css';
import Entradas from '../entradas/entradas';
import Textos from '../textos/textos';

const Interruptor = ({
    checked,
    onChange,
    pregunta,
    ...rest
}) => {
    return (
        <div className="switch-control">
            <label className="switch">
                <Entradas
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                />
                <span className="slider"></span>
            </label>
            <Textos className="parrafo switch-label">{pregunta}</Textos>
        </div>
    );
};

export default Interruptor;
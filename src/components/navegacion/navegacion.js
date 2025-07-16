import './navegacion.css'

const Navegacion = ({
    items,
    value,
    onChange
}) => {
    return (
        <div className="navegacion">
            <ul className="nav nav-tabs">
                {items.map((item) => (
                    <li className="nav-item" key={item}>
                        <a
                            className={`nav-link ${value === item ? 'active' : ''}`}
                            onClick={() => onChange(item)}
                            role="button"
                        >
                            {item}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Navegacion;

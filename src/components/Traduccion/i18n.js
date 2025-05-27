import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookies from 'js-cookie';

const idiomaGuardado = Cookies.get('idioma') || 'es';

const resources = {
    en: {
        translation: {
            navbar: {
                home: "Home",
            }
        },
    },
    es: {
        translation: {
            navbar: {
                home: "Inicio",
            }
        },
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: idiomaGuardado,
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;

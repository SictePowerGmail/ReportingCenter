import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-BRQ955KJG5");
};

export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
};
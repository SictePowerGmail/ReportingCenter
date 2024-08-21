import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-BRQ955KJG5");
};

export const logPageView = () => {
  const page = window.location.hash.substring(1) || window.location.pathname;
  console.log("Logging page view for:", page);
  ReactGA.send({ hitType: "pageview", page });
};
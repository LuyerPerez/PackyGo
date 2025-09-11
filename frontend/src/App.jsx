import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./assets/NavBar.css";
import Home from "./pages/home";
import LoginPage from "./pages/Login";
import Logout from "./pages/Logout";
import NavBar from "./components/NavBar";
import RegisterPage from "./pages/Register";
import Vehiculos from "./pages/Vehiculos";
import NotFound from "./components/NotFound";
import TruckLoader from "./components/TruckLoader";
import PasswordReset from "./components/PasswordReset";
import Explorar from "./pages/Explorar"; // Importar la página Explorar
import { GoogleOAuthProvider } from "@react-oauth/google";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";

const GOOGLE_CLIENT_ID = "710600040256-60ttnabd8kjbr1051o2giq3gubd0ab4g.apps.googleusercontent.com";
const NAVBAR_HIDDEN_ROUTES = ["/login", "/register", "/recuperar-contrasena"];

export default function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/") {
      const timer = setTimeout(() => setLoading(false), 2500);
      return () => clearTimeout(timer);
    }
    setLoading(false);
  }, [pathname]);

  if (loading && pathname === "/") return <TruckLoader />;

  const showNavBar = !NAVBAR_HIDDEN_ROUTES.includes(pathname);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar-contrasena" element={<PasswordReset />} />
        <Route path="/mis-vehiculos" element={<Vehiculos />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/explorar" element={<Explorar />} /> {/* Ruta para la página Explorar */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}
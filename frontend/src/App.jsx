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
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "710600040256-60ttnabd8kjbr1051o2giq3gubd0ab4g.apps.googleusercontent.com";

export default function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => setLoading(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [location.pathname]);

  if (loading && location.pathname === "/") {
    return <TruckLoader />;
  }

  const hideNavBar = ["/login", "/register", "/recuperar-contrasena"].includes(location.pathname);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar-contrasena" element={<PasswordReset />} />
        <Route path="/administracion" />
        <Route path="/mis-vehiculos" element={<Vehiculos />}></Route>
        <Route path="/pedidos"></Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}
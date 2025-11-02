import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./assets/NavBar.css";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import Logout from "./pages/Logout";
import NavBar from "./components/NavBar";
import RegisterPage from "./pages/Register";
import Vehiculos from "./pages/Vehiculos";
import NotFound from "./components/NotFound";
import TruckLoader from "./components/TruckLoader";
import PasswordReset from "./components/PasswordReset";
import Explorar from "./pages/Explorar"; 
import { GoogleOAuthProvider } from "@react-oauth/google";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import Reserva from "./pages/Reserva"; 
import MisReservas from "./pages/MisReservas";
import Pedidos from "./pages/Pedidos";
import Administracion from "./pages/Administracion";
import AdminCrud from "./pages/AdminCrud";
import HomePrincipal from "./pages/HomePrincipal";
import HomeCamionero from "./pages/HomeCamionero";
import Nosotros from "./pages/Nosotros";
import AprobacionVehiculosPage from "./pages/AprobacionVehiculosPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Perfil from "./pages/Perfil";

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
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar-contrasena" element={<PasswordReset />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/HomePrincipal" element={<HomePrincipal />} />

        {/* Ruta de perfil personalizada */}
        <Route path="/:nombreCompleto/perfil" element={<ProtectedRoute allowedRoles={["cliente", "camionero", "admin"]}><Perfil /></ProtectedRoute>} />

        {/* Rutas protegidas - Solo usuarios autenticados */}
        <Route 
          path="/logout" 
          element={
            <ProtectedRoute allowedRoles={["cliente", "camionero", "admin"]}>
              <Logout />
            </ProtectedRoute>
          } 
        />

        {/* Rutas para CLIENTE */}
        <Route 
          path="/reserva" 
          element={
            <ProtectedRoute allowedRoles={["cliente"]}>
              <Reserva />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-reservas" 
          element={
            <ProtectedRoute allowedRoles={["cliente"]}>
              <MisReservas />
            </ProtectedRoute>
          } 
        />

        {/* Rutas para CAMIONERO */}
        <Route 
          path="/HomeCamionero" 
          element={
            <ProtectedRoute allowedRoles={["camionero"]}>
              <HomeCamionero />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-vehiculos" 
          element={
            <ProtectedRoute allowedRoles={["camionero"]}>
              <Vehiculos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pedidos" 
          element={
            <ProtectedRoute allowedRoles={["camionero"]}>
              <Pedidos />
            </ProtectedRoute>
          } 
        />

        {/* Rutas para ADMIN */}
        <Route 
          path="/administracion" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Administracion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/:tabla" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCrud />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/aprobacion-vehiculos" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AprobacionVehiculosPage />
            </ProtectedRoute>
          } 
        />

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}
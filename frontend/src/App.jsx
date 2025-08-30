import { Routes, Route, Link } from "react-router-dom";
import "./assets/NavBar.css";
import Home from "./pages/home";
import LoginPage from "./pages/Login";
import Logout from "./pages/Logout";
import NavBar from "./components/NavBar";
import RegisterPage from "./pages/Register";
import NotFound from "./components/NotFound";
import TruckLoader from "./components/TruckLoader";
import { useEffect, useState } from "react";
import PasswordReset from "./components/PasswordReset";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.location.pathname === "/") {
      const timer = setTimeout(() => setLoading(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading && window.location.pathname === "/") {
    return <TruckLoader />;
  }

  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar-contrasena" element={<PasswordReset />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
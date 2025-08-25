
import { Routes, Route, Link } from "react-router-dom";
import "./assets/NavBar.css";
import Home from "./pages/home";
import LoginPage from "./pages/Login";
import Logout from "./pages/Logout";
import NavBar from "./components/NavBar";
import RegisterPage from "./pages/Register";

export default function App() {
  return (
    <div>
      <NavBar></NavBar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  );
}
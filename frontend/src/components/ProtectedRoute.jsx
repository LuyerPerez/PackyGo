import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [], redirectTo = "/login" }) {
  const userStorage = localStorage.getItem("user");
  const user = userStorage ? JSON.parse(userStorage) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    const roleRedirects = {
      cliente: "/HomePrincipal",
      camionero: "/HomeCamionero",
      admin: "/administracion"
    };
    
    return <Navigate to={roleRedirects[user.rol] || redirectTo} replace />;
  }

  return children;
}

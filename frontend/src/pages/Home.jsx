import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
	const navigate = useNavigate();

		useEffect(() => {
			const usuario = JSON.parse(localStorage.getItem("user"));
      console.log("user", usuario);
			const rol = usuario?.rol;
			if (rol === "camionero") {
				navigate("/HomeCamionero", { replace: true });
			} else {
				navigate("/HomePrincipal", { replace: true });
			}
		}, [navigate]);

		return null;
}

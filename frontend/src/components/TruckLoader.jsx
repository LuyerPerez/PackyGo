import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import "../assets/TruckLoader.css";

export default function TruckLoader() {
  return (
    <div className="truck-loader-container">
      <div className="truck-icon">
        <FontAwesomeIcon icon={faTruck} size="6x" color="#fff" />
      </div>
      <div className="truck-text">
        Cargando...
      </div>
    </div>
  );
}
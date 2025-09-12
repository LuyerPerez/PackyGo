import React, { useState, useEffect } from "react";
import { registrarVehiculo, editarVehiculo } from "../api";
import "./../assets/RegistroVehiculo.css";

function RegistroVehiculo({ onSuccess, editVehiculo }) {
  const [form, setForm] = useState({
    tipo_vehiculo: "",
    placa: "",
    modelo: "",
    ano_modelo: "",
    imagen_url: "",
    tarifa_diaria: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editVehiculo) {
      setForm({
        tipo_vehiculo: editVehiculo.tipo_vehiculo || "",
        placa: editVehiculo.placa || "",
        modelo: editVehiculo.modelo || "",
        ano_modelo: editVehiculo.ano_modelo || "",
        imagen_url: editVehiculo.imagen_url || "",
        tarifa_diaria: editVehiculo.tarifa_diaria || "",
      });
    } else {
      setForm({
        tipo_vehiculo: "",
        placa: "",
        modelo: "",
        ano_modelo: "",
        imagen_url: "",
        tarifa_diaria: "",
      });
    }
  }, [editVehiculo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || user.rol !== "camionero") {
        setError("Solo camioneros pueden registrar vehículos.");
        setLoading(false);
        return;
      }
      if (editVehiculo) {
        await editarVehiculo(editVehiculo.id, form);
      } else {
        await registrarVehiculo({
          camionero_id: user.id,
          ...form,
        });
      }
      setLoading(false);
      if (onSuccess) onSuccess();
      setForm({
        tipo_vehiculo: "",
        placa: "",
        modelo: "",
        ano_modelo: "",
        imagen_url: "",
        tarifa_diaria: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Error al registrar/editar el vehículo. Verifica los datos."
      );
      setLoading(false);
    }
  };

  return (
    <form className="registro-form" onSubmit={handleSubmit}>
      <h2 className="registro-title">
        {editVehiculo ? "Editar Vehículo" : "Registrar Vehículo"}
      </h2>
      <div className="form-group">
        <label>Tipo de vehículo</label>
        <select
          name="tipo_vehiculo"
          value={form.tipo_vehiculo}
          onChange={handleChange}
          required
          className="input"
        >
          <option disabled>Seleccione un tipo</option>
          <option value="Camioneta pequeña">Camioneta pequeña</option>
          <option value="Furgón cerrado">Furgón cerrado</option>
          <option value="Camión ½ o 3/4 de carga">3/4 de carga</option>
          <option value="Camión sencillo">Camión sencillo</option>
          <option value="Camión estacas">Camión estacas</option>
          <option value="Camión turbo">Camión turbo</option>
        </select>
      </div>
      <div className="form-group">
        <label>Placa</label>
        <input
          name="placa"
          value={form.placa}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Modelo</label>
        <input
          name="modelo"
          value={form.modelo}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Año modelo</label>
        <input
          name="ano_modelo"
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          value={form.ano_modelo}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Imagen (URL)</label>
        <input
          name="imagen_url"
          value={form.imagen_url}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Tarifa diaria ($)</label>
        <input
          name="tarifa_diaria"
          type="number"
          min="0"
          step="0.01"
          value={form.tarifa_diaria}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      {error && (
        <div className="registro-error">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="registro-btn"
      >
        {loading
          ? editVehiculo
            ? "Guardando..."
            : "Registrando..."
          : editVehiculo
            ? "Guardar cambios"
            : "Registrar"}
      </button>
    </form>
  );
}

export default RegistroVehiculo;
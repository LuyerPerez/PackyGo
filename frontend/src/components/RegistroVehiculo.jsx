import React, { useState, useEffect } from "react";
import { registrarVehiculo, editarVehiculo } from "../api";
import "./../assets/RegistroVehiculo.css";

function RegistroVehiculo({ onSuccess, editVehiculo }) {
  const [form, setForm] = useState({
    tipo_vehiculo: "",
    placa: "",
    modelo: "",
    ano_modelo: "",
    tarifa_diaria: "",
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [tarjetaPropiedadFile, setTarjetaPropiedadFile] = useState(null);
  const [soatFile, setSoatFile] = useState(null);
  const [revisionTecnomecanicaFile, setRevisionTecnomecanicaFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editVehiculo) {
      setForm({
        tipo_vehiculo: editVehiculo.tipo_vehiculo || "",
        placa: editVehiculo.placa || "",
        modelo: editVehiculo.modelo || "",
        ano_modelo: editVehiculo.ano_modelo || "",
        tarifa_diaria: editVehiculo.tarifa_diaria || "",
      });
      setImagenFile(null);
      setTarjetaPropiedadFile(null);
      setSoatFile(null);
      setRevisionTecnomecanicaFile(null);
    } else {
      setForm({
        tipo_vehiculo: "",
        placa: "",
        modelo: "",
        ano_modelo: "",
        tarifa_diaria: "",
      });
      setImagenFile(null);
      setTarjetaPropiedadFile(null);
      setSoatFile(null);
      setRevisionTecnomecanicaFile(null);
    }
  }, [editVehiculo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImagenFile(e.target.files[0]);
  };

  const handleTarjetaPropiedadChange = (e) => {
    setTarjetaPropiedadFile(e.target.files[0]);
  };

  const handleSoatChange = (e) => {
    setSoatFile(e.target.files[0]);
  };

  const handleRevisionTecnomecanicaChange = (e) => {
    setRevisionTecnomecanicaFile(e.target.files[0]);
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
      const data = new FormData();
      data.append("camionero_id", user.id);
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (imagenFile) data.append("imagen", imagenFile);
      if (tarjetaPropiedadFile) data.append("tarjeta_propiedad", tarjetaPropiedadFile);
      if (soatFile) data.append("soat", soatFile);
      if (revisionTecnomecanicaFile) data.append("revision_tecnomecanica", revisionTecnomecanicaFile);

      if (editVehiculo) {
        await editarVehiculo(editVehiculo.id, data, true); // true para indicar FormData
      } else {
        await registrarVehiculo(data, true);
      }
      setLoading(false);
      if (onSuccess) onSuccess();
      setForm({
        tipo_vehiculo: "",
        placa: "",
        modelo: "",
        ano_modelo: "",
        tarifa_diaria: "",
      });
      setImagenFile(null);
      setTarjetaPropiedadFile(null);
      setSoatFile(null);
      setRevisionTecnomecanicaFile(null);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Error al registrar/editar el vehículo. Verifica los datos."
      );
      setLoading(false);
    }
  };

  return (
    <form
      className="registro-form"
      onSubmit={handleSubmit}
      encType="multipart/form-data"
    >
      <h2 className="registro-title">
        {editVehiculo ? "Editar Vehículo" : "Registrar Vehículo"}
      </h2>
      <div className="registro-info-message" style={{
        backgroundColor: "#e3f2fd",
        border: "1px solid #2196f3",
        borderRadius: "5px",
        padding: "12px",
        marginBottom: "15px",
        fontSize: "14px",
        color: "#1565c0"
      }}>
        <strong>Importante:</strong> Tu vehículo solo será enviado para aprobación cuando hayas subido todos los documentos requeridos (Tarjeta de propiedad, SOAT y Revisión técnico-mecánica).
      </div>
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
        <label>Imagen del vehículo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="input"
        />
      </div>
      <div className="form-group">
        <label>Tarjeta de propiedad (opcional)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleTarjetaPropiedadChange}
          className="input"
        />
        {editVehiculo?.tarjeta_propiedad && (
          <small style={{ color: "#666" }}>
            Documento actual: {editVehiculo.tarjeta_propiedad.split('/').pop()}
          </small>
        )}
      </div>
      <div className="form-group">
        <label>SOAT (opcional)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleSoatChange}
          className="input"
        />
        {editVehiculo?.soat && (
          <small style={{ color: "#666" }}>
            Documento actual: {editVehiculo.soat.split('/').pop()}
          </small>
        )}
      </div>
      <div className="form-group">
        <label>Revisión técnico-mecánica (opcional)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleRevisionTecnomecanicaChange}
          className="input"
        />
        {editVehiculo?.revision_tecnomecanica && (
          <small style={{ color: "#666" }}>
            Documento actual: {editVehiculo.revision_tecnomecanica.split('/').pop()}
          </small>
        )}
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
      {error && <div className="registro-error">{error}</div>}
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
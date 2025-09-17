import React, { useState, useEffect } from "react";
import "../assets/Administracion.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const tiposVehiculo = [
  { value: "", label: "Seleccione un tipo", disabled: true },
  { value: "Camioneta pequeña", label: "Camioneta pequeña" },
  { value: "Furgón cerrado", label: "Furgón cerrado" },
  { value: "Camión ½ o 3/4 de carga", label: "3/4 de carga" },
  { value: "Camión sencillo", label: "Camión sencillo" },
  { value: "Camión estacas", label: "Camión estacas" },
  { value: "Camión turbo", label: "Camión turbo" }
];

const ModalCrear = ({
  visible,
  onClose,
  onSubmit,
  columnas,
  initialData = {},
  titulo = "Crear",
  selectOptions = {}, 
}) => {
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData || {});
    setFile(null);
  }, [initialData, visible]);

  const handleChange = (e, key) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (columnas.some(col => col.key === "placa")) {
        const fd = new FormData();
        Object.entries(form).forEach(([key, value]) => fd.append(key, value));
        if (file) fd.append("imagen", file);
        await onSubmit(fd);
      } else {
        await onSubmit(form);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBgClick = (e) => {
    if (e.target.classList.contains("modal-bg")) {
      onClose();
    }
  };

  if (!visible) return null;
  
  const columnasFormulario = columnas
    .filter((col) => col.formOnly || typeof col.formOnly === "undefined")
    .filter((col) => col.key !== "id" && col.key !== "usuario_correo" && col.key !== "reserva_fecha_inicio" && col.key !== "reserva_fecha_fin")
    .filter((col) => !(col.key === "contrasena" && initialData?.id))
    .filter((col) => col.key !== "cliente_correo" && col.key !== "vehiculo_placa")
    .filter((col) => col.key !== "imagen_url" && col.key !== "camionero_correo");

  return (
    <div className="modal-bg" onClick={handleBgClick}>
      <div className="modal-crear">
        <h2>{titulo}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {columnasFormulario.map((col) => (
            col.key === "tipo_vehiculo" ? (
              <div className="modal-field" key={col.key}>
                <label>Tipo de vehículo</label>
                <select
                  name="tipo_vehiculo"
                  value={form.tipo_vehiculo || ""}
                  onChange={(e) => handleChange(e, "tipo_vehiculo")}
                  required={col.required !== false}
                >
                  {tiposVehiculo.map(opt => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : col.type === "datetime-local" ? (
              <div className="modal-field" key={col.key}>
                <label>{col.label}</label>
                <input
                  type="datetime-local"
                  value={form[col.key] || ""}
                  onChange={(e) => handleChange(e, col.key)}
                  required={col.required !== false}
                />
              </div>
            ) : col.type === "file" ? (
              <div className="modal-field" key={col.key}>
                <label>{col.label}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="modal-field" key={col.key}>
                <label>{col.label}</label>
                {col.type === "select" && selectOptions[col.key] ? (
                  <select
                    value={String(form[col.key] ?? "")}
                    onChange={(e) => handleChange(e, col.key)}
                    required={col.required !== false}
                  >
                    <option value="">Seleccione...</option>
                    {selectOptions[col.key].map((opt) => (
                      <option key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : col.type === "select" ? (
                  <select
                    value={form[col.key] || ""}
                    onChange={(e) => handleChange(e, col.key)}
                    required={col.required !== false}
                  >
                    <option value="">Seleccione...</option>
                    {col.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={col.type || "text"}
                    value={form[col.key] || ""}
                    onChange={(e) => handleChange(e, col.key)}
                    required={col.required !== false}
                    autoFocus={col.key === columnasFormulario[0]?.key}
                  />
                )}
              </div>
            )
          ))}
          {columnas.some(col => col.key === "placa") && (
            <div className="modal-field">
              <label>Foto del vehículo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}
          <div className="modal-actions">
            <button type="submit" className="btn-crear" disabled={loading}>
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                "Guardar"
              )}
            </button>
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrear;
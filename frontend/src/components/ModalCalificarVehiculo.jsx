import { useState } from "react";
import { calificarVehiculo } from "../api";

export default function ModalCalificarVehiculo({ open, onClose, vehiculo, reserva, onCalificado }) {
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setLoading(true);
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    await calificarVehiculo({
      autor_id: usuario.id,
      vehiculo_destino_id: vehiculo.id,
      reserva_id: reserva.id,
      estrellas,
      comentario
    });
    setLoading(false);
    onCalificado && onCalificado();
  };

  return (
    <div className="modal-overlay-chimba">
      <div className="modal-content-chimba">
        <button className="modal-close-btn" onClick={onClose} disabled={loading}>×</button>
        <h2>Calificar vehículo</h2>
        <p>
          ¿Cómo calificarías el vehículo <b>{vehiculo?.modelo}</b> ({vehiculo?.placa})?
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "12px 0" }}>
          {[1,2,3,4,5].map(n => (
            <span
              key={n}
              className={`star-chimba ${estrellas >= n ? "filled" : ""}`}
              onClick={() => !loading && setEstrellas(n)}
              style={{cursor: loading ? "not-allowed" : "pointer", fontSize: "2rem"}}
              title={`${n} estrella${n>1?"s":""}`}
            >★</span>
          ))}
        </div>
        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          disabled={loading}
          placeholder="¿Qué te gustaría destacar del vehículo?"
          style={{ width: "100%", minHeight: 60, borderRadius: 8, border: "1.5px solid #b2ebf2", marginTop: 4, fontSize: "1rem", padding: 8, background: "#f7fcfc" }}
        />
        <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={handleSubmit} className="btn-finalizar" disabled={loading}>
            Enviar calificación
          </button>
          <button onClick={onClose} className="btn-cancelar" disabled={loading}>
            Cancelar
          </button>
        </div>
      </div>
      <style>{`
        .modal-overlay-chimba {
          position: fixed; top:0; left:0; right:0; bottom:0;
          background: rgba(0,0,0,0.32);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000;
        }
        .modal-content-chimba {
          background: linear-gradient(120deg, #e0f7fa 0%, #fff 100%);
          border-radius: 18px;
          box-shadow: 0 12px 36px 0 rgba(0,151,167,0.18);
          border: 2px solid #b2ebf2;
          padding: 38px 32px 28px 32px;
          min-width: 340px;
          max-width: 98vw;
          width: 370px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .modal-close-btn {
          position: absolute;
          top: 14px; right: 18px;
          background: none;
          border: none;
          font-size: 2rem;
          color: #0097a7;
          cursor: pointer;
          font-weight: bold;
          transition: color 0.18s;
          z-index: 10;
        }
        .modal-close-btn:hover { color: #c62828; }
        .star-chimba {
          color: #b2ebf2;
          transition: color 0.18s, transform 0.13s;
          user-select: none;
        }
        .star-chimba.filled {
          color: #ffb300;
          text-shadow: 0 2px 8px #ffe08255;
          transform: scale(1.13);
        }
        .star-chimba:hover, .star-chimba:active {
          color: #ffb300;
          transform: scale(1.18);
        }
      `}</style>
    </div>
  );
}
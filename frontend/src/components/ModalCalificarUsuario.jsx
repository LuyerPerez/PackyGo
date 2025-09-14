import React, { useState, useRef, useEffect } from "react";

export default function ModalCalificarUsuario({
  open,
  onClose,
  onSubmit,
  nombreUsuario = "usuario",
  rol = "cliente",
  loading = false
}) {
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");
  const modalRef = useRef(null);

  // Reset campos al abrir/cerrar
  useEffect(() => {
    if (open) {
      setEstrellas(5);
      setComentario("");
    }
  }, [open]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay-chimba">
      <div className="modal-content-chimba animate-in" ref={modalRef}>
        <button className="modal-close-btn" onClick={onClose} title="Cerrar" disabled={loading}>
          ×
        </button>
        <h2 className="modal-title">
          Calificar {rol === "cliente" ? "al cliente" : "al camionero"}
        </h2>
        <p className="modal-subtitle">
          ¿Cómo calificarías a <b>{nombreUsuario}</b>?
        </p>
        <div className="modal-stars">
          {[1,2,3,4,5].map(n => (
            <span
              key={n}
              className={`star-chimba ${estrellas >= n ? "filled" : ""}`}
              onClick={() => !loading && setEstrellas(n)}
              style={{cursor: loading ? "not-allowed" : "pointer"}}
              title={`${n} estrella${n>1?"s":""}`}
            >★</span>
          ))}
        </div>
        <div className="modal-select-mobile">
          <label>Calificación:&nbsp;</label>
          <select
            value={estrellas}
            onChange={e => setEstrellas(Number(e.target.value))}
            disabled={loading}
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>
                {n} estrella{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="modal-label">Comentario (opcional):</label>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            disabled={loading}
            className="modal-textarea"
            placeholder="¿Qué te gustaría destacar de la experiencia?"
          />
        </div>
        <div className="modal-btns">
          <button
            onClick={() => onSubmit(estrellas, comentario)}
            className="btn-finalizar"
            disabled={loading}
          >
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
          animation: modalFadeIn 0.2s;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
          animation: modalPopIn 0.22s cubic-bezier(.6,-0.28,.74,.05);
        }
        @keyframes modalPopIn {
          from { transform: scale(0.85) translateY(40px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
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
        .modal-title {
          margin: 0 0 2px 0;
          font-size: 1.35rem;
          font-weight: 800;
          color: #1565c0;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .modal-subtitle {
          color: #0097a7;
          font-size: 1.07rem;
          text-align: center;
          margin-bottom: 6px;
        }
        .modal-stars {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .star-chimba {
          font-size: 2.1rem;
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
        .modal-select-mobile {
          display: none;
        }
        .modal-label {
          font-weight: bold;
          color: #1565c0;
        }
        .modal-textarea {
          width: 100%;
          min-height: 60px;
          border-radius: 8px;
          border: 1.5px solid #b2ebf2;
          margin-top: 4px;
          font-size: 1rem;
          padding: 8px;
          resize: vertical;
          background: #f7fcfc;
        }
        .modal-btns {
          margin-top: 10px;
          display: flex;
          gap: 14px;
          justify-content: center;
        }
        @media (max-width: 600px) {
          .modal-content-chimba {
            min-width: 0;
            width: 98vw;
            padding: 18px 6vw 18px 6vw;
          }
          .modal-stars { font-size: 1.2rem; }
          .modal-select-mobile { display: block; margin-bottom: 10px; }
        }
      `}</style>
    </div>
  );
}
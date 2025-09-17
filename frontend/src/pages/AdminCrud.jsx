import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SideBar from "../components/SideBar";
import TablaAdmin from "../components/TablaAdmin";
import ModalCrear from "../components/ModalCrear";
import api from "../api";
import "../assets/Administracion.css";

const config = {
  usuarios: {
    titulo: "Usuarios",
    columnas: [
      { key: "id", label: "ID" },
      { key: "nombre", label: "Nombre" },
      { key: "noDocumento", label: "Documento" },
      { key: "correo", label: "Correo" },
      { key: "telefono", label: "Teléfono" },
      { 
        key: "rol", 
        label: "Rol", 
        type: "select", 
        options: [
          { value: "admin", label: "Admin" },
          { value: "camionero", label: "Camionero" },
          { value: "cliente", label: "Cliente" }
        ]
      },
      { key: "contrasena", label: "Contraseña", type: "password", formOnly: true }
    ],
    endpoint: "/usuarios",
    endpointDetallado: "/usuarios-detallado",
    endpointCrud: "/usuarios",
    extraeDatos: (res) => res.data?.usuarios || res.usuarios || res,
    extraeDatosDetallado: (res) => res.data?.usuarios || res.usuarios || res,
  },
  vehiculos: {
    titulo: "Vehículos",
    columnas: [
      { key: "camionero_id", label: "ID Conductor", type: "select", formOnly: true },
      { key: "id", label: "ID" },
      { key: "tipo_vehiculo", label: "Tipo" },
      { key: "placa", label: "Placa" },
      { key: "modelo", label: "Modelo" },
      { key: "ano_modelo", label: "Año" },
      { key: "tarifa_diaria", label: "Tarifa" },
      { key: "imagen_url", label: "Imagen" },
      { key: "camionero_correo", label: "Correo conductor" } 
    ],
    endpoint: "/vehiculos",
    endpointDetallado: "/vehiculos",
    endpointCrud: "/vehiculos",
    extraeDatos: (res) => res.data?.vehiculos || res.vehiculos || res,
    extraeDatosDetallado: (res) => res.data?.vehiculos || res.vehiculos || res,
  },
  reservas: {
    titulo: "Reservas",
    columnas: [
      { key: "cliente_id", label: "ID Cliente", type: "select", formOnly: true },
      { key: "vehiculo_id", label: "ID Vehículo", type: "select", formOnly: true },
      { key: "id", label: "ID" },
      { key: "cliente_correo", label: "Correo cliente" },
      { key: "vehiculo_placa", label: "Placa vehículo" },
      { key: "fecha_inicio", label: "Fecha inicio", type: "datetime-local" },
      { key: "fecha_fin", label: "Fecha fin", type: "datetime-local" },
      { key: "direccion_inicio", label: "Dirección inicio" },
      { key: "direccion_destino", label: "Dirección destino" },
      { key: "estado_reserva", label: "Estado", type: "select", options: [
        { value: "activa", label: "Activa" },
        { value: "cancelada", label: "Cancelada" },
        { value: "finalizada", label: "Finalizada" }
      ]}
    ],
    endpoint: "/reservas-todas",
    endpointDetallado: "/reservas-detallado",
    endpointCrud: "/reservas",
    extraeDatos: (res) => res.data?.reservas || res.reservas || res,
    extraeDatosDetallado: (res) => res.data?.reservas || res.reservas || res,
  },
  reportes: {
    titulo: "Reportes",
    columnas: [
      { key: "usuario_id", label: "ID Usuario", type: "select", formOnly: true },
      { key: "reserva_id", label: "ID Reserva", type: "select", formOnly: true },
      { key: "id", label: "ID" },
      { key: "usuario_correo", label: "Correo usuario" },
      { key: "descripcion", label: "Descripción" },
      { key: "estado_reporte", label: "Estado", type: "select", options: [
        { value: "abierto", label: "Abierto" },
        { value: "cerrado", label: "Cerrado" }
      ]},
      { key: "reserva_fecha_inicio", label: "Inicio reserva" },
      { key: "reserva_fecha_fin", label: "Fin reserva" },
      { key: "vehiculo_placa", label: "Placa vehículo" }
    ],
    endpoint: "/reportes",
    endpointDetallado: "/reportes-detallado",
    endpointCrud: "/reportes",
    extraeDatos: (res) => res.data?.reportes || res.reportes || res,
    extraeDatosDetallado: (res) => res.data?.reportes || res.reportes || res,
  }
};

const AdminCrud = () => {
  const { tabla } = useParams();
  const [datos, setDatos] = useState([]);
  const [recargar, setRecargar] = useState(false);
  const [modal, setModal] = useState({ visible: false, modo: "crear", data: null });
  const [selectOptions, setSelectOptions] = useState({});

  const conf = config[tabla];

  useEffect(() => {
    if (!conf) return;
    api.get(conf.endpointDetallado || conf.endpoint)
      .then((res) => {
        let datos = (conf.extraeDatosDetallado || conf.extraeDatos)(res);
        if (tabla === "vehiculos") {
          datos = datos.map(v => ({
            ...v,
            camionero_nombre: v.conductor?.nombre || "",
            camionero_correo: v.conductor?.correo || "",
            camionero_telefono: v.conductor?.telefono || ""
          }));
        }
        setDatos(datos);
      });

    if (tabla === "vehiculos") {
      api.get("/usuarios?rol=camionero").then((res) => {
        setSelectOptions((opts) => ({
          ...opts,
          camionero_id: (res.usuarios || res.data?.usuarios || []).map(u => ({
            value: u.id,
            label: `${u.id} - ${u.nombre}`
          }))
        }));
      });
    }

    if (tabla === "reservas") {
      api.get("/usuarios?rol=cliente").then((res) => {
        setSelectOptions((opts) => ({
          ...opts,
          cliente_id: (res.usuarios || res.data?.usuarios || []).map(u => ({
            value: u.id,
            label: `${u.id} - ${u.nombre}`
          }))
        }));
      });

      api.get("/vehiculos").then((res) => {
        setSelectOptions((opts) => ({
          ...opts,
          vehiculo_id: (res.vehiculos || res.data?.vehiculos || []).map(v => ({
            value: v.id,
            label: `${v.placa} - ${v.modelo}`
          }))
        }));
      });
    }

    if (tabla === "reportes") {
      api.get("/usuarios").then((res) => {
        setSelectOptions((opts) => ({
          ...opts,
          usuario_id: (res.usuarios || res.data?.usuarios || []).map(u => ({
            value: u.id,
            label: `${u.id} - ${u.nombre}`
          }))
        }));
      });
      api.get("/reservas-todas").then((res) => {
        setSelectOptions((opts) => ({
          ...opts,
          reserva_id: (res.reservas || res.data?.reservas || []).map(r => ({
            value: r.id,
            label: `Reserva ${r.id} (${r.fecha_inicio?.slice(0,16)} - ${r.fecha_fin?.slice(0,16)})`
          }))
        }));
      });
    }
  }, [tabla, recargar, conf]);

  if (!conf)
    return (
      <div>
        <SideBar />
        <div className="tabla-admin">
          <h2>Tabla no soportada</h2>
        </div>
      </div>
    );

  const handleCrear = () => setModal({ visible: true, modo: "crear", data: null });
  const handleEditar = (item) => setModal({ visible: true, modo: "editar", data: item });

  const handleSubmit = async (form) => {
    if (modal.modo === "crear") {
      await api.post(conf.endpointCrud, form);
    } else if (modal.modo === "editar") {
      await api.put(`${conf.endpointCrud}/${modal.data.id}`, form);
    }
    setModal({ visible: false, modo: "crear", data: null });
    setRecargar((r) => !r);
  };

  const handleEliminar = async (item) => {
    if (window.confirm("¿Eliminar este registro?")) {
      await api.delete(`${conf.endpointCrud}/${item.id}`);
      setRecargar((r) => !r);
    }
  };

  return (
    <div>
      <SideBar />
      <TablaAdmin
        titulo={conf.titulo}
        columnas={conf.columnas}
        datos={datos}
        onCrear={handleCrear}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
      <ModalCrear
        visible={modal.visible}
        onClose={() => setModal({ visible: false, modo: "crear", data: null })}
        onSubmit={handleSubmit}
        columnas={conf.columnas}
        initialData={modal.data}
        titulo={modal.modo === "crear" ? `Crear ${conf.titulo.slice(0, -1)}` : `Editar ${conf.titulo.slice(0, -1)}`}
        selectOptions={selectOptions} 
      />
    </div>
  );
};

export default AdminCrud;
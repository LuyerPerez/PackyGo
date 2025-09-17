from flask import Flask, request, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from db import get_connection
from werkzeug.security import generate_password_hash, check_password_hash
import os
import random
from datetime import datetime

from envioCorreos import (
    enviarCorreo,
    enviarCorreoCambio,
    enviarCorreoVerificacion,
    enviarCorreoReserva,
    enviarCorreoCancelacion 
)

from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()
email_sender = "packygonotificaciones@gmail.com"
password = os.getenv("PASSWORD")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

verification_codes = {}
reset_codes = {}

def redondear_hora(dt_str):
    dt = datetime.fromisoformat(dt_str)
    return dt.replace(minute=0, second=0, microsecond=0)

@app.route("/api/request-reset", methods=["POST"])
def request_reset():
    data = request.json
    correo = data.get("correo")
    if not correo:
        return {"error": "Correo es obligatorio"}, 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuario WHERE correo=%s", (correo,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        return {"error": "No existe usuario con ese correo"}, 404
    codigo = str(random.randint(100000, 999999))
    reset_codes[correo] = codigo
    enviarCorreo(correo, codigo)
    return {"message": "Código de recuperación enviado al correo."}, 200

@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    correo = data.get("correo")
    code = data.get("code")
    nueva = data.get("nueva")
    if not all([correo, code, nueva]):
        return {"error": "Todos los campos son obligatorios"}, 400
    codigo = reset_codes.get(correo)
    if not codigo or codigo != code:
        return {"error": "Código incorrecto"}, 400
    hashed_password = generate_password_hash(nueva)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE usuario SET contrasena=%s WHERE correo=%s", (hashed_password, correo))
        conn.commit()
        reset_codes.pop(correo)
        enviarCorreoCambio(correo)
        return {"message": "Contraseña actualizada exitosamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    nombre = data.get("nombre")
    noDocumento = data.get("noDocumento")
    correo = data.get("correo")
    telefono = data.get("telefono")
    contrasena = data.get("contrasena")
    rol = data.get("rol")

    if not all([nombre, noDocumento, correo, telefono, contrasena, rol]):
        return {"error": "Todos los campos son obligatorios"}, 400

    codigo = str(random.randint(100000, 999999))
    verification_codes[correo] = {
        "code": codigo,
        "data": {
            "nombre": nombre,
            "noDocumento": noDocumento,
            "correo": correo,
            "telefono": telefono,
            "contrasena": contrasena,
            "rol": rol
        }
    }
    enviarCorreo(correo, codigo)
    return {"message": "Código enviado. Verifica tu correo.", "correo": correo}, 200

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    correo = data.get("correo")
    contrasena = data.get("contrasena")

    if not correo or not contrasena:
        return {"error": "Correo y contraseña son obligatorios"}, 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuario WHERE correo=%s", (correo,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and check_password_hash(user[5], contrasena):
        codigo = str(random.randint(100000, 999999))
        verification_codes[correo] = {
            "code": codigo,
            "user": {
                "id": user[0],
                "nombre": user[1],
                "correo": user[3],
                "rol": user[6] 
            }
        }
        enviarCorreo(correo, codigo)
        return {"message": "Código enviado. Verifica tu correo.", "correo": correo}, 200
    else:
        return {"error": "Credenciales inválidas"}, 401

@app.route("/api/verify", methods=["POST"])
def verify():
    data = request.json
    correo = data.get("correo")
    code = data.get("code")
    tipo = data.get("tipo")

    if tipo == "reset":
        codigo = reset_codes.get(correo)
        if not codigo or codigo != code:
            return {"error": "Código incorrecto"}, 400
        return {"code": code, "message": "Código verificado"}, 200

    verif = verification_codes.get(correo)
    if not verif or verif["code"] != code:
        return {"error": "Código incorrecto"}, 400

    if tipo == "register":
        datos = verif["data"]
        hashed_password = generate_password_hash(datos["contrasena"])
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO usuario (nombre, noDocumento, correo, telefono, contrasena, rol) VALUES (%s, %s, %s, %s, %s, %s)",
                (datos["nombre"], datos["noDocumento"], datos["correo"], datos["telefono"], hashed_password, datos["rol"])
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            error_msg = str(e)
            if "Duplicate entry" in error_msg and "'correo'" in error_msg:
                return {"error": "El correo ya está registrado."}, 400
            if "Duplicate entry" in error_msg and "'noDocumento'" in error_msg:
                return {"error": "El documento ya está registrado."}, 400
            return {"error": error_msg}, 400
        finally:
            cursor.close()
            conn.close()
        verification_codes.pop(correo)
        return {"message": "Usuario registrado exitosamente."}, 201

    elif tipo == "login":
        user = verif["user"]
        verification_codes.pop(correo)
        return user, 200

    return {"error": "Tipo de verificación inválido"}, 400

@app.route("/api/google-login", methods=["POST"])
def google_login():
    token = request.json.get("token")
    if not token:
        return {"error": "Token requerido"}, 400
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), os.getenv("GOOGLE_CLIENT_ID"))
        correo = idinfo["email"]
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuario WHERE correo=%s", (correo,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if not user:
            return {"error": "No existe usuario con ese correo"}, 404
        return {"user": {
            "id": user[0],
            "nombre": user[1],
            "correo": user[3],
            "rol": user[6] 
        }}, 200
    except Exception as e:
        return {"error": str(e)}, 400

@app.route("/api/google-register", methods=["POST"])
def google_register():
    token = request.json.get("token")
    rol = request.json.get("rol", "cliente")
    if not token:
        return {"error": "Token requerido"}, 400
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), os.getenv("GOOGLE_CLIENT_ID"))
        nombre = idinfo.get("name", "")
        correo = idinfo["email"]
        noDocumento = None
        telefono = None
        contrasena = os.urandom(16).hex()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuario WHERE correo=%s", (correo,))
        user = cursor.fetchone()
        if user:
            cursor.close()
            conn.close()
            return {"error": "El correo ya está registrado."}, 400
        hashed_password = generate_password_hash(contrasena)
        cursor.execute(
            "INSERT INTO usuario (nombre, noDocumento, correo, telefono, contrasena, rol) VALUES (%s, %s, %s, %s, %s, %s)",
            (nombre, noDocumento, correo, telefono, hashed_password, rol)
        )
        conn.commit()
        cursor.execute("SELECT * FROM usuario WHERE correo=%s", (correo,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return {"user": {
            "id": user[0],
            "nombre": user[1],
            "correo": user[3],
            "rol": user[6]
        }}, 201
    except Exception as e:
        return {"error": str(e)}, 400

@app.route("/api/vehiculos", methods=["POST"])
def registrar_vehiculo():
    camionero_id = request.form.get("camionero_id")
    tipo_vehiculo = request.form.get("tipo_vehiculo")
    placa = request.form.get("placa")
    modelo = request.form.get("modelo")
    ano_modelo = request.form.get("ano_modelo")
    tarifa_diaria = request.form.get("tarifa_diaria")
    imagen_url = None

    imagen = request.files.get("imagen")
    if imagen:
        filename = secure_filename(imagen.filename)
        imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        imagen_url = f"/uploads/{filename}" 

    if not all([camionero_id, tipo_vehiculo, placa, modelo, ano_modelo, tarifa_diaria]):
        return {"error": "Todos los campos son obligatorios."}, 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO vehiculo (camionero_id, tipo_vehiculo, placa, modelo, ano_modelo, imagen_url, tarifa_diaria)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (camionero_id, tipo_vehiculo, placa, modelo, ano_modelo, imagen_url, tarifa_diaria)
        )
        conn.commit()
        return {"message": "Vehículo registrado correctamente."}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/vehiculos", methods=["GET"])
def listar_vehiculos():
    camionero_id = request.args.get("camionero_id")
    conn = get_connection()
    cursor = conn.cursor()
    if camionero_id:
        cursor.execute(
            """
            SELECT v.id, v.tipo_vehiculo, v.placa, v.modelo, v.ano_modelo, v.imagen_url, v.tarifa_diaria,
                   u.nombre, u.correo, u.telefono
            FROM vehiculo v
            JOIN usuario u ON v.camionero_id = u.id
            WHERE v.camionero_id=%s
            """,
            (camionero_id,)
        )
    else:
        cursor.execute(
            """
            SELECT v.id, v.tipo_vehiculo, v.placa, v.modelo, v.ano_modelo, v.imagen_url, v.tarifa_diaria,
                   u.nombre, u.correo, u.telefono
            FROM vehiculo v
            JOIN usuario u ON v.camionero_id = u.id
            """
        )
    vehiculos = cursor.fetchall()
    lista = []
    for v in vehiculos:
        vehiculo_id = v[0]
        cursor.execute(
            "SELECT AVG(estrellas) FROM calificacion_vehiculo WHERE vehiculo_destino_id=%s", (vehiculo_id,)
        )
        calificacion = cursor.fetchone()[0]
        lista.append({
            "id": v[0],
            "tipo_vehiculo": v[1],
            "placa": v[2],
            "modelo": v[3],
            "ano_modelo": v[4],
            "imagen_url": v[5],
            "tarifa_diaria": float(v[6]),
            "calificacion": calificacion,
            "conductor": {
                "nombre": v[7],
                "correo": v[8],
                "telefono": v[9]
            }
        })
    cursor.close()
    conn.close()
    return {"vehiculos": lista}, 200

@app.route("/api/vehiculos/<int:vehiculo_id>", methods=["PUT"])
def editar_vehiculo(vehiculo_id):
    camionero_id = request.form.get("camionero_id")
    tipo_vehiculo = request.form.get("tipo_vehiculo")
    placa = request.form.get("placa")
    modelo = request.form.get("modelo")
    ano_modelo = request.form.get("ano_modelo")
    tarifa_diaria = request.form.get("tarifa_diaria")
    imagen_url = None

    imagen = request.files.get("imagen")
    if imagen:
        filename = secure_filename(imagen.filename)
        imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        imagen_url = f"/uploads/{filename}"

    if not all([camionero_id, tipo_vehiculo, placa, modelo, ano_modelo, tarifa_diaria]):
        return {"error": "Todos los campos son obligatorios."}, 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        if imagen_url:
            cursor.execute(
                """
                UPDATE vehiculo SET camionero_id=%s, tipo_vehiculo=%s, placa=%s, modelo=%s, ano_modelo=%s, imagen_url=%s, tarifa_diaria=%s
                WHERE id=%s
                """,
                (camionero_id, tipo_vehiculo, placa, modelo, ano_modelo, imagen_url, tarifa_diaria, vehiculo_id)
            )
        else:
            cursor.execute(
                """
                UPDATE vehiculo SET camionero_id=%s, tipo_vehiculo=%s, placa=%s, modelo=%s, ano_modelo=%s, tarifa_diaria=%s
                WHERE id=%s
                """,
                (camionero_id, tipo_vehiculo, placa, modelo, ano_modelo, tarifa_diaria, vehiculo_id)
            )
        conn.commit()
        return {"message": "Vehículo actualizado correctamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/vehiculos/<int:vehiculo_id>", methods=["DELETE"])
def eliminar_vehiculo(vehiculo_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM vehiculo WHERE id=%s", (vehiculo_id,))
        conn.commit()
        return {"message": "Vehículo eliminado correctamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/reservas", methods=["POST"])
def crear_reserva():
    data = request.json
    cliente_id = data.get("cliente_id")
    vehiculo_id = data.get("vehiculo_id")
    fecha_inicio = data.get("fecha_inicio")
    fecha_fin = data.get("fecha_fin")
    direccion_inicio = data.get("direccion_inicio")
    direccion_destino = data.get("direccion_destino")
    if not all([cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino]):
        return {"error": "Todos los campos son obligatorios."}, 400

    fecha_inicio = redondear_hora(fecha_inicio)
    fecha_fin = redondear_hora(fecha_fin)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT COUNT(*) FROM reserva
            WHERE vehiculo_id=%s AND (
                (fecha_inicio <= %s AND fecha_fin >= %s) OR
                (fecha_inicio <= %s AND fecha_fin >= %s) OR
                (fecha_inicio >= %s AND fecha_fin <= %s)
            ) AND estado_reserva='activa'
        """, (vehiculo_id, fecha_inicio, fecha_inicio, fecha_fin, fecha_fin, fecha_inicio, fecha_fin))
        if cursor.fetchone()[0] > 0:
            return {"error": "El vehículo no está disponible en ese rango de fechas."}, 400

        cursor.execute("""
            INSERT INTO reserva (cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino, estado_reserva)
            VALUES (%s, %s, %s, %s, %s, %s, 'activa')
        """, (cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino))
        conn.commit()

        cursor.execute("""
            SELECT u.nombre, u.correo FROM usuario u
            JOIN vehiculo v ON v.camionero_id = u.id
            WHERE v.id=%s
        """, (vehiculo_id,))
        conductor = cursor.fetchone()
        cursor.execute("SELECT nombre, correo FROM usuario WHERE id=%s", (cliente_id,))
        cliente = cursor.fetchone()
        if conductor and cliente:
            mensaje_conductor = (
                f"Hola {conductor[0]},\n\n"
                f"{cliente[0]} te hizo una reserva para el vehículo {vehiculo_id} "
                f"del {fecha_inicio} al {fecha_fin}.\n"
                f"Dirección de inicio: {direccion_inicio}\n"
                f"Dirección de destino: {direccion_destino}\n\n"
                "Por favor, revisa tu panel para más detalles."
            )
            enviarCorreoReserva(conductor[1], mensaje_conductor)

            mensaje_cliente = (
                f"Hola {cliente[0]},\n\n"
                f"Tu reserva para el vehículo {vehiculo_id} fue realizada exitosamente.\n"
                f"Del {fecha_inicio} al {fecha_fin}.\n"
                f"Dirección de inicio: {direccion_inicio}\n"
                f"Dirección de destino: {direccion_destino}\n\n"
                f"El conductor es: {conductor[0]}, correo: {conductor[1]}.\n"
                "¡Gracias por usar PackyGo!"
            )
            enviarCorreoReserva(cliente[1], mensaje_cliente)
        return {"message": "Reserva realizada y correos enviados."}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/reservas", methods=["GET"])
def listar_reservas():
    vehiculo_id = request.args.get("vehiculo_id")
    cliente_id = request.args.get("cliente_id")  
    conn = get_connection()
    cursor = conn.cursor()
    if vehiculo_id:
        cursor.execute(
            """
            SELECT id, cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino, estado_reserva
            FROM reserva
            WHERE vehiculo_id=%s AND estado_reserva='activa'
            """,
            (vehiculo_id,)
        )
    elif cliente_id:
        cursor.execute(
            """
            SELECT id, cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino, estado_reserva
            FROM reserva
            WHERE cliente_id=%s
            ORDER BY fecha_inicio DESC
            """,
            (cliente_id,)
        )
    else:
        cursor.execute(
            """
            SELECT id, cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino, estado_reserva
            FROM reserva
            WHERE estado_reserva='activa'
            """
        )
    reservas = cursor.fetchall()
    lista = []
    for r in reservas:
        lista.append({
            "id": r[0],
            "cliente_id": r[1],
            "vehiculo_id": r[2],
            "fecha_inicio": r[3].isoformat() if hasattr(r[3], "isoformat") else str(r[3]),
            "fecha_fin": r[4].isoformat() if hasattr(r[4], "isoformat") else str(r[4]),
            "direccion_inicio": r[5],
            "direccion_destino": r[6],
            "estado_reserva": r[7]
        })
    cursor.close()
    conn.close()
    return {"reservas": lista}

@app.route("/api/reservas-todas", methods=["GET"])
def listar_todas_reservas():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino, estado_reserva
        FROM reserva
        ORDER BY fecha_inicio DESC
        """
    )
    reservas = cursor.fetchall()
    lista = []
    for r in reservas:
        lista.append({
            "id": r[0],
            "cliente_id": r[1],
            "vehiculo_id": r[2],
            "fecha_inicio": r[3].isoformat() if hasattr(r[3], "isoformat") else str(r[3]),
            "fecha_fin": r[4].isoformat() if hasattr(r[4], "isoformat") else str(r[4]),
            "direccion_inicio": r[5],
            "direccion_destino": r[6],
            "estado_reserva": r[7]
        })
    cursor.close()
    conn.close()
    return {"reservas": lista}, 200

@app.route("/api/reservas/<int:reserva_id>/cancelar", methods=["PUT"])
def cancelar_reserva(reserva_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT cliente_id, vehiculo_id, fecha_inicio, fecha_fin FROM reserva WHERE id=%s", (reserva_id,)
        )
        reserva = cursor.fetchone()
        if not reserva:
            return {"error": "Reserva no encontrada."}, 404
        cliente_id, vehiculo_id, fecha_inicio, fecha_fin = reserva

        cursor.execute("SELECT nombre, correo FROM usuario WHERE id=%s", (cliente_id,))
        cliente = cursor.fetchone()

        cursor.execute("""
            SELECT u.nombre, u.correo FROM usuario u
            JOIN vehiculo v ON v.camionero_id = u.id
            WHERE v.id=%s
        """, (vehiculo_id,))
        conductor = cursor.fetchone()

        cursor.execute(
            "UPDATE reserva SET estado_reserva='cancelada' WHERE id=%s", (reserva_id,)
        )
        conn.commit()

        if cliente:
            mensaje_cliente = (
                f"Tu reserva del {fecha_inicio} al {fecha_fin} ha sido cancelada."
            )
            enviarCorreoCancelacion(cliente[1], cliente[0], mensaje_cliente, es_cliente=True)
        if conductor:
            mensaje_conductor = (
                f"Una reserva de tu vehículo del {fecha_inicio} al {fecha_fin} ha sido cancelada."
            )
            enviarCorreoCancelacion(conductor[1], conductor[0], mensaje_conductor, es_cliente=False)

        return {"message": "Reserva cancelada correctamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/reservas/<int:reserva_id>/finalizar", methods=["PUT"])
def finalizar_reserva(reserva_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE reserva SET estado_reserva='finalizada' WHERE id=%s", (reserva_id,)
        )
        conn.commit()
        return {"message": "Reserva finalizada correctamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/pedidos-camionero/<int:camionero_id>", methods=["GET"])
def pedidos_camionero(camionero_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(""" 
            SELECT r.id, r.cliente_id, r.vehiculo_id, r.fecha_inicio, r.fecha_fin, r.direccion_inicio, r.direccion_destino, r.estado_reserva,
                   v.tipo_vehiculo, v.placa, v.modelo, v.ano_modelo, v.imagen_url, v.tarifa_diaria,
                   u.nombre, u.correo, u.telefono
            FROM reserva r
            JOIN vehiculo v ON r.vehiculo_id = v.id
            JOIN usuario u ON r.cliente_id = u.id
            WHERE v.camionero_id = %s
            ORDER BY r.fecha_inicio DESC
        """, (camionero_id,))
        pedidos = []
        for row in cursor.fetchall():
            reserva = {
                "id": row[0],
                "cliente_id": row[1],
                "vehiculo_id": row[2],
                "fecha_inicio": row[3].isoformat() if hasattr(row[3], "isoformat") else str(row[3]),
                "fecha_fin": row[4].isoformat() if hasattr(row[4], "isoformat") else str(row[4]),
                "direccion_inicio": row[5],
                "direccion_destino": row[6],
                "estado_reserva": row[7]
            }
            vehiculo = {
                "id": row[2],
                "tipo_vehiculo": row[8],
                "placa": row[9],
                "modelo": row[10],
                "ano_modelo": row[11],
                "imagen_url": row[12],
                "tarifa_diaria": float(row[13])
            }
            cliente = {
                "id": row[1],
                "nombre": row[14],
                "correo": row[15],
                "telefono": row[16]
            }
            cursor.execute(
                "SELECT AVG(estrellas) FROM calificacion_usuario WHERE usuario_destino_id=%s", (row[1],)
            )
            calif = cursor.fetchone()[0]
            cliente["calificacion"] = float(calif) if calif is not None else None
            pedidos.append({
                "reserva": reserva,
                "vehiculo": vehiculo,
                "cliente": cliente
            })
        return {"pedidos": pedidos}, 200
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/calificar-cliente", methods=["POST"])
def calificar_cliente():
    data = request.json
    usuario_destino_id = data.get("usuario_destino_id")
    autor_id = data.get("usuario_origen_id")
    estrellas = data.get("estrellas")
    comentario = data.get("comentario", "")
    if not all([usuario_destino_id, autor_id, estrellas]):
        return {"error": "Datos incompletos"}, 400
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO calificacion_usuario (usuario_destino_id, autor_id, estrellas, comentario) VALUES (%s, %s, %s, %s)",
            (usuario_destino_id, autor_id, estrellas, comentario)
        )
        conn.commit()
        return {"message": "Calificación registrada"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/calificaciones-vehiculo", methods=["GET"])
def calificaciones_vehiculo():
    autor_id = request.args.get("autor_id")
    vehiculo_id = request.args.get("vehiculo_id")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, reserva_id FROM calificacion_vehiculo WHERE autor_id=%s AND vehiculo_destino_id=%s",
        (autor_id, vehiculo_id)
    )
    calificaciones = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"calificaciones": [{"id": c[0], "reserva_id": c[1]} for c in calificaciones]}, 200

@app.route("/api/calificar-vehiculo", methods=["POST"])
def calificar_vehiculo():
    data = request.json
    autor_id = data.get("autor_id")
    vehiculo_destino_id = data.get("vehiculo_destino_id")
    reserva_id = data.get("reserva_id")
    estrellas = data.get("estrellas")
    comentario = data.get("comentario", "")
    if not all([autor_id, vehiculo_destino_id, reserva_id, estrellas]):
        return {"error": "Datos incompletos"}, 400
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO calificacion_vehiculo (autor_id, vehiculo_destino_id, reserva_id, estrellas, comentario) VALUES (%s, %s, %s, %s, %s)",
            (autor_id, vehiculo_destino_id, reserva_id, estrellas, comentario)
        )
        conn.commit()
        return {"message": "Calificación registrada"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/api/usuarios", methods=["GET"])
def listar_usuarios():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, noDocumento, correo, telefono, rol FROM usuario")
    usuarios = cursor.fetchall()
    lista = []
    for u in usuarios:
        lista.append({
            "id": u[0],
            "nombre": u[1],
            "noDocumento": u[2],
            "correo": u[3],
            "telefono": u[4],
            "rol": u[5]
        })
    cursor.close()
    conn.close()
    return jsonify(usuarios=lista), 200

@app.route("/api/usuarios", methods=["POST"])
def crear_usuario():
    data = request.json
    nombre = data.get("nombre")
    correo = data.get("correo")
    rol = data.get("rol")
    if not all([nombre, correo, rol]):
        return {"error": "Faltan datos"}, 400
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO usuario (nombre, correo, rol, contrasena) VALUES (%s, %s, %s, %s)",
            (nombre, correo, rol, generate_password_hash("123456"))
        )
        conn.commit()
        return {"message": "Usuario creado"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

@app.route("/api/usuarios/<int:usuario_id>", methods=["PUT"])
def editar_usuario(usuario_id):
    data = request.json
    nombre = data.get("nombre")
    correo = data.get("correo")
    noDocumento = data.get("noDocumento")
    telefono = data.get("telefono")
    rol = data.get("rol")
    if not all([nombre, correo, noDocumento, telefono, rol]):
        return {"error": "Faltan datos"}, 400
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE usuario SET nombre=%s, correo=%s, noDocumento=%s, telefono=%s, rol=%s WHERE id=%s",
            (nombre, correo, noDocumento, telefono, rol, usuario_id)
        )
        conn.commit()
        return {"message": "Usuario actualizado"}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

@app.route("/api/usuarios/<int:usuario_id>", methods=["DELETE"])
def eliminar_usuario(usuario_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM usuario WHERE id=%s", (usuario_id,))
        conn.commit()
        return {"message": "Usuario eliminado"}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

@app.route("/api/usuarios-detallado", methods=["GET"])
def usuarios_detallado():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.nombre, u.noDocumento, u.correo, u.telefono, u.rol,
            COUNT(DISTINCT v.id) as vehiculos,
            COUNT(DISTINCT r.id) as reservas
        FROM usuario u
        LEFT JOIN vehiculo v ON v.camionero_id = u.id
        LEFT JOIN reserva r ON r.cliente_id = u.id
        GROUP BY u.id
    """)
    usuarios = cursor.fetchall()
    lista = []
    for u in usuarios:
        lista.append({
            "id": u[0],
            "nombre": u[1],
            "noDocumento": u[2],
            "correo": u[3],
            "telefono": u[4],
            "rol": u[5],
            "vehiculos": u[6],
            "reservas": u[7]
        })
    cursor.close()
    conn.close()
    return {"usuarios": lista}, 200

@app.route("/api/reservas/<int:reserva_id>", methods=["PUT"])
def editar_reserva(reserva_id):
    data = request.json
    cliente_id = data.get("cliente_id")
    vehiculo_id = data.get("vehiculo_id")
    fecha_inicio = data.get("fecha_inicio")
    fecha_fin = data.get("fecha_fin")
    direccion_inicio = data.get("direccion_inicio")
    direccion_destino = data.get("direccion_destino")
    estado_reserva = data.get("estado_reserva")
    if not all([cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino, estado_reserva]):
        return {"error": "Todos los campos son obligatorios."}, 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE reserva SET cliente_id=%s, vehiculo_id=%s, fecha_inicio=%s, fecha_fin=%s,
            direccion_inicio=%s, direccion_destino=%s, estado_reserva=%s
            WHERE id=%s
        """, (cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino, estado_reserva, reserva_id))
        conn.commit()
        return {"message": "Reserva actualizada correctamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/reservas/<int:reserva_id>", methods=["DELETE"])
def eliminar_reserva(reserva_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM reserva WHERE id=%s", (reserva_id,))
        conn.commit()
        return {"message": "Reserva eliminada correctamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/reportes", methods=["POST"])
def crear_reporte():
    data = request.json
    reserva_id = data.get("reserva_id")
    usuario_id = data.get("usuario_id")
    descripcion = data.get("descripcion")
    estado_reporte = data.get("estado_reporte", "abierto")
    fecha_reporte = data.get("fecha_reporte", datetime.now())
    if not all([reserva_id, usuario_id, descripcion]):
        return {"error": "Todos los campos son obligatorios."}, 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO reporte (reserva_id, usuario_id, descripcion, estado_reporte, fecha_reporte)
            VALUES (%s, %s, %s, %s, %s)
        """, (reserva_id, usuario_id, descripcion, estado_reporte, fecha_reporte))
        conn.commit()
        return {"message": "Reporte creado correctamente."}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/reportes", methods=["GET"])
def listar_reportes():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.reserva_id, r.usuario_id, u.nombre, r.descripcion, r.estado_reporte, r.fecha_reporte
        FROM reporte r
        JOIN usuario u ON r.usuario_id = u.id
        ORDER BY r.fecha_reporte DESC
    """)
    reportes = cursor.fetchall()
    lista = []
    for rep in reportes:
        lista.append({
            "id": rep[0],
            "reserva_id": rep[1],
            "usuario_id": rep[2],
            "usuario_nombre": rep[3],
            "descripcion": rep[4],
            "estado_reporte": rep[5],
            "fecha_reporte": rep[6].isoformat() if hasattr(rep[6], "isoformat") else str(rep[6])
        })
    cursor.close()
    conn.close()
    return {"reportes": lista}, 200

@app.route("/api/reportes/<int:reporte_id>", methods=["PUT"])
def editar_reporte(reporte_id):
    data = request.json
    reserva_id = data.get("reserva_id")
    usuario_id = data.get("usuario_id")
    descripcion = data.get("descripcion")
    estado_reporte = data.get("estado_reporte")
    fecha_reporte = data.get("fecha_reporte")
    if not all([reserva_id, usuario_id, descripcion, estado_reporte, fecha_reporte]):
        return {"error": "Todos los campos son obligatorios."}, 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE reporte SET reserva_id=%s, usuario_id=%s, descripcion=%s, estado_reporte=%s, fecha_reporte=%s
            WHERE id=%s
        """, (reserva_id, usuario_id, descripcion, estado_reporte, fecha_reporte, reporte_id))
        conn.commit()
        return {"message": "Reporte actualizado correctamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/reportes/<int:reporte_id>", methods=["DELETE"])
def eliminar_reporte(reporte_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM reporte WHERE id=%s", (reporte_id,))
        conn.commit()
        return {"message": "Reporte eliminado correctamente."}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/reportes-detallado", methods=["GET"])
def reportes_detallado():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.descripcion, r.estado_reporte, r.fecha_reporte,
               u.id, u.nombre, u.correo,
               res.id, res.fecha_inicio, res.fecha_fin,
               v.id, v.placa
        FROM reporte r
        JOIN usuario u ON r.usuario_id = u.id
        JOIN reserva res ON r.reserva_id = res.id
        JOIN vehiculo v ON res.vehiculo_id = v.id
        ORDER BY r.fecha_reporte DESC
    """)
    reportes = cursor.fetchall()
    lista = []
    for rep in reportes:
        lista.append({
            "id": rep[0],
            "descripcion": rep[1],
            "estado_reporte": rep[2],
            "fecha_reporte": rep[3].isoformat() if hasattr(rep[3], "isoformat") else str(rep[3]),
            "usuario_id": rep[4],
            "usuario_nombre": rep[5],
            "usuario_correo": rep[6],
            "reserva_id": rep[7],
            "reserva_fecha_inicio": rep[8].isoformat() if hasattr(rep[8], "isoformat") else str(rep[8]),
            "reserva_fecha_fin": rep[9].isoformat() if hasattr(rep[9], "isoformat") else str(rep[9]),
            "vehiculo_id": rep[10],
            "vehiculo_placa": rep[11]
        })
    cursor.close()
    conn.close()
    return {"reportes": lista}, 200

@app.route("/api/reservas-detallado", methods=["GET"])
def reservas_detallado():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.fecha_inicio, r.fecha_fin, r.direccion_inicio, r.direccion_destino, r.estado_reserva,
               c.id, c.nombre, c.correo,
               v.id, v.tipo_vehiculo, v.placa,
               u.id, u.nombre
        FROM reserva r
        JOIN usuario c ON r.cliente_id = c.id
        JOIN vehiculo v ON r.vehiculo_id = v.id
        JOIN usuario u ON v.camionero_id = u.id
        ORDER BY r.fecha_inicio DESC
    """)
    reservas = cursor.fetchall()
    lista = []
    for r in reservas:
        lista.append({
            "id": r[0],
            "fecha_inicio": r[1].isoformat() if hasattr(r[1], "isoformat") else str(r[1]),
            "fecha_fin": r[2].isoformat() if hasattr(r[2], "isoformat") else str(r[2]),
            "direccion_inicio": r[3],
            "direccion_destino": r[4],
            "estado_reserva": r[5],
            "cliente_id": r[6],
            "cliente_nombre": r[7],
            "cliente_correo": r[8],
            "vehiculo_id": r[9],
            "vehiculo_tipo": r[10],
            "vehiculo_placa": r[11],
            "camionero_id": r[12],
            "camionero_nombre": r[13]
        })
    cursor.close()
    conn.close()
    return {"reservas": lista}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
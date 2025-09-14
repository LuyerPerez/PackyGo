from flask import Flask, request
from flask_cors import CORS
from db import get_connection
from werkzeug.security import generate_password_hash, check_password_hash
import os
import random
from datetime import datetime

from dotenv import load_dotenv
from email.message import EmailMessage
import ssl
import smtplib
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()
email_sender = "packygonotificaciones@gmail.com"
password = os.getenv("PASSWORD")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

def enviarCorreo(correo, codigoVerificacion):
    try:
        em = EmailMessage()
        em["From"] = email_sender
        em["To"] = correo
        em["Subject"] = "Código de verificación"
        em.set_content(f"Su código de verificación es: {codigoVerificacion}")

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(email_sender, password)
            smtp.send_message(em)
        print("Correo enviado correctamente")
    except Exception as e:
        print("Error al enviar correo:", e)

def enviarCorreoCambio(correo):
    try:
        em = EmailMessage()
        em["From"] = email_sender
        em["To"] = correo
        em["Subject"] = "Contraseña actualizada"
        em.set_content("Tu contraseña ha sido cambiada exitosamente. Si no fuiste tú, contacta soporte de inmediato.")

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(email_sender, password)
            smtp.send_message(em)
        print("Correo de cambio de contraseña enviado")
    except Exception as e:
        print("Error al enviar correo de cambio:", e)

def enviarCorreoVerificacion(correo, codigoVerificacion):
    try:
        em = EmailMessage()
        em["From"] = email_sender
        em["To"] = correo
        em["Subject"] = "Código de verificación"
        em.set_content(f"Su código de verificación es: {codigoVerificacion}")

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(email_sender, password)
            smtp.send_message(em)
        print("Correo de verificación enviado correctamente")
    except Exception as e:
        print("Error al enviar correo de verificación:", e)

def enviarCorreoReserva(correo, mensaje):
    try:
        em = EmailMessage()
        em["From"] = email_sender
        em["To"] = correo
        em["Subject"] = "Nueva reserva recibida"
        em.set_content(mensaje)

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(email_sender, password)
            smtp.send_message(em)
        print("Correo de reserva enviado correctamente")
    except Exception as e:
        print("Error al enviar correo de reserva:", e)

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
            "rol": user[6]  # <-- Agrega esto
        }}, 201
    except Exception as e:
        return {"error": str(e)}, 400

@app.route("/api/vehiculos", methods=["POST"])
def registrar_vehiculo():
    data = request.json
    camionero_id = data.get("camionero_id")
    tipo_vehiculo = data.get("tipo_vehiculo")
    placa = data.get("placa")
    modelo = data.get("modelo")
    ano_modelo = data.get("ano_modelo")
    imagen_url = data.get("imagen_url")
    tarifa_diaria = data.get("tarifa_diaria")

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
    data = request.json
    tipo_vehiculo = data.get("tipo_vehiculo")
    placa = data.get("placa")
    modelo = data.get("modelo")
    ano_modelo = data.get("ano_modelo")
    imagen_url = data.get("imagen_url")
    tarifa_diaria = data.get("tarifa_diaria")
    if not all([tipo_vehiculo, placa, modelo, ano_modelo, tarifa_diaria]):
        return {"error": "Todos los campos son obligatorios."}, 400
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE vehiculo SET tipo_vehiculo=%s, placa=%s, modelo=%s, ano_modelo=%s, imagen_url=%s, tarifa_diaria=%s
            WHERE id=%s
            """,
            (tipo_vehiculo, placa, modelo, ano_modelo, imagen_url, tarifa_diaria, vehiculo_id)
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

        # Obtener datos del conductor y cliente
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
from flask import Flask, request
from flask_cors import CORS
from db import get_connection
from werkzeug.security import generate_password_hash, check_password_hash
import os
import random

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
    if not camionero_id:
        return {"error": "camionero_id es obligatorio"}, 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, tipo_vehiculo, placa, modelo, ano_modelo, imagen_url, tarifa_diaria FROM vehiculo WHERE camionero_id=%s",
        (camionero_id,)
    )
    vehiculos = cursor.fetchall()
    cursor.close()
    conn.close()
    lista = [
        {
            "id": v[0],
            "tipo_vehiculo": v[1],
            "placa": v[2],
            "modelo": v[3],
            "ano_modelo": v[4],
            "imagen_url": v[5],
            "tarifa_diaria": float(v[6]),
        }
        for v in vehiculos
    ]
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

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
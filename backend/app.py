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

load_dotenv()
email_sender = "packygonotificaciones@gmail.com"
password = os.getenv("PASSWORD")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

verification_codes = {}

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
                "correo": user[3]
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

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
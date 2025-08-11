from flask import Flask, render_template, request, session, redirect, url_for, flash
from flaskext.mysql import MySQL
import pymysql
import datetime
import random

import os
from dotenv import load_dotenv
from email.message import EmailMessage
import ssl
import smtplib
from werkzeug.utils import secure_filename

load_dotenv()
email_sender = "notificacionespackygo@gmail.com"
password = os.getenv("PASSWORD")
email_reciver = ""

mysql =MySQL()
app = Flask(__name__, template_folder='../frontend')

app.secret_key = 'secretkey'

app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_DB'] = 'packygo'
app.config['MYSQL_DATABASE_PASSWORD'] = ''
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Asegúrate de que esta carpeta exista

mysql.init_app(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/InicioSesion', methods=['GET', 'POST'])
def InicioSesion():
    text = ''
    if request.method == 'POST' and 'correo' in request.form and 'contrasena' in request.form:
        username = request.form['correo']
        password = request.form['contrasena']

        conn = mysql.connect()
        cur = conn.cursor(pymysql.cursors.DictCursor)
        cur.execute('SELECT * FROM usuario WHERE correo = %s AND contrasena = %s', (username, password, ))
        user = cur.fetchone()

        if user:
            session['loggedin'] = True
            session['id'] = user['correo']
            session['nombre'] = user['nombre']
            return render_template('index.html', msg=text)
        else:
            text = 'Contraseña Incorrecta'

    elif request.method == 'POST':
        text = "Rellene los formularios"

    return render_template('login.html', msg=text)

@app.route('/registro', methods=['GET', 'POST'])
def registro():
    text = ''
    if request.method == 'POST':
        if 'codigo' in request.form:
            # Segunda fase: verificar código
            codigo_ingresado = request.form['codigo']
            if session.get('codigo_verificacion') == codigo_ingresado:
                # Registrar usuario
                nombre = session.get('nombre')
                noDocumento = session.get('noDocumento')
                correo = session.get('correo')
                telefono = session.get('telefono')
                rol = session.get('rol')
                contrasena = session.get('contrasena')

                conn = mysql.connect()
                cur = conn.cursor(pymysql.cursors.DictCursor)
                cur.execute("SELECT * FROM usuario WHERE correo = %s", (correo,))
                accounts = cur.fetchone()

                if accounts:
                    text = "La cuenta ya existe"
                else:
                    cur.execute("INSERT INTO usuario (nombre, noDocumento, correo, telefono, contrasena, rol) VALUES (%s, %s, %s, %s, %s, %s)", 
                                (nombre, noDocumento, correo, telefono, contrasena, rol,))
                    conn.commit()
                    text = "Cuenta creada correctamente"
                session.pop('codigo_verificacion', None)
                session.pop('nombre', None)
                session.pop('noDocumento', None)
                session.pop('correo', None)
                session.pop('telefono', None)
                session.pop('rol', None)
                session.pop('contrasena', None)
                return render_template('register.html', text=text)
            else:
                text = "Código incorrecto"
                return render_template('verificaCodigo.html', text=text)
        else:
            # Primera fase: enviar código
            nombre = request.form['nombre']
            noDocumento = request.form['noDocumento']
            correo = request.form['correo']
            telefono = request.form['telefono']
            rol = request.form['rol']
            contrasena = request.form['contrasena']

            conn = mysql.connect()
            cur = conn.cursor(pymysql.cursors.DictCursor)
            cur.execute("SELECT * FROM usuario WHERE correo = %s", (correo,))
            accounts = cur.fetchone()

            if accounts:
                text = "La cuenta ya existe"
                return render_template('register.html', text=text)
            else:
                codigoVerificacion = str(random.randint(1000,9999))
                session['codigo_verificacion'] = codigoVerificacion
                session['nombre'] = nombre
                session['noDocumento'] = noDocumento
                session['correo'] = correo
                session['telefono'] = telefono
                session['rol'] = rol
                session['contrasena'] = contrasena
                enviarCorreo(correo, codigoVerificacion)
                return render_template('verificaCodigo.html', text="Se envió un código a tu correo")
    return render_template('register.html', text=text)

@app.route('/enviarCorreo', methods=['GET', 'POST'])
def enviarCorreo():
    if request.method == 'POST':
        em = EmailMessage()
        em["from"] = email_sender
        em["to"] = request.form['email']
        em["subject"] = request.form['asunto']
        em.set_content(request.form['mensaje'])

        context = ssl.create_default_context()

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(email_sender, password)
            smtp.send_message(em)

        return render_template('enviaCorreo.html', msg='Correo enviado correctamente')
    return render_template('enviaCorreo.html')


@app.route('/registroVehiculo', methods=['GET', 'POST'])
def registroVehiculo():
    camioneros = []
    conn = mysql.connect()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT * FROM usuario WHERE rol = 'camionero'")
    camioneros = cur.fetchall()

    if request.method == 'POST':
        try:
            id_camionero = request.form['id_camionero']
            tipo = request.form['tipo']
            placa = request.form['placa']
            modelo = request.form['modelo']
            anio = request.form['año']
            tarifa = request.form['tarifa']

            imagen_file = request.files['imagen']
            if imagen_file and imagen_file.filename != '':
                filename = secure_filename(imagen_file.filename)
                imagen_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                imagen_file.save(imagen_path)
                imagen_url = f"../uploads/{filename}"
            else:
                imagen_url = ''

            cur.execute("INSERT INTO vehiculo (camionero_id, tipo_vehiculo, placa, modelo, anio_modelo, imagen_url, tarifa_diaria) VALUES (%s, %s, %s, %s, %s, %s, %s)", 
                        (id_camionero, tipo, placa, modelo, anio, imagen_url, tarifa))
            conn.commit()
            return render_template('registroVehiculo.html', camioneros=camioneros, success=True)
        except KeyError as e:
            return render_template('registroVehiculo.html', camioneros=camioneros, error=f"Missing form field: {str(e)}")
    return render_template('registroVehiculo.html', camioneros=camioneros)

def enviarCorreo(correo, codigoVerificacion):
    em = EmailMessage()
    em["from"] = email_sender
    em["to"] = correo
    em["subject"] = "Código de verificación"
    em.set_content("Su código de verificación es: " + str(codigoVerificacion))

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
        smtp.login(email_sender, password)
        smtp.send_message(em)

if __name__ == '__main__':
    app.run(debug=True)
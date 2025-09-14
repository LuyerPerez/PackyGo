import os
from email.message import EmailMessage
import ssl
import smtplib
from dotenv import load_dotenv

load_dotenv()
email_sender = "packygonotificaciones@gmail.com"
password = os.getenv("PASSWORD")

def enviarCorreo(correo, codigoVerificacion):
    try:
        em = EmailMessage()
        em["From"] = email_sender
        em["To"] = correo
        em["Subject"] = "Código de verificación"
        em.set_content(f"Su código de verificación es: {codigoVerificacion}")

        html = f"""
        <div style="font-family: Arial, sans-serif; background:#fff; padding:24px;">
            <div style="max-width:420px;margin:auto;background:#f4f8fb;border-radius:12px;padding:24px 28px;box-shadow:0 2px 12px #0097a722;">
                <h2 style="color:#0097a7;text-align:center;">Verificación de correo</h2>
                <p style="font-size:1.1em;color:#083c5d;">Tu código de verificación es:</p>
                <div style="font-size:2em;font-weight:bold;color:#083c5d;background:#e0f7fa;padding:12px 0;border-radius:8px;text-align:center;letter-spacing:4px;margin:18px 0;">
                    {codigoVerificacion}
                </div>
                <p style="color:#888;text-align:center;font-size:0.98em;">Ingresa este código en PackyGo para continuar.</p>
            </div>
        </div>
        """
        em.add_alternative(html, subtype="html")

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

        html = """
        <div style="font-family: Arial, sans-serif; background:#f4f8fb; padding:24px;">
            <div style="max-width:420px;margin:auto;background:#fff;border-radius:12px;padding:24px 28px;box-shadow:0 2px 12px #0097a722;">
                <h2 style="color:#0097a7;text-align:center;">Contraseña actualizada</h2>
                <p style="font-size:1.1em;color:#083c5d;">Tu contraseña ha sido cambiada exitosamente.</p>
                <p style="color:#888;font-size:0.98em;">Si no fuiste tú, contacta soporte de inmediato.</p>
            </div>
        </div>
        """
        em.add_alternative(html, subtype="html")

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

        html = f"""
        <div style="font-family: Arial, sans-serif; background:#f4f8fb; padding:24px;">
            <div style="max-width:420px;margin:auto;background:#fff;border-radius:12px;padding:24px 28px;box-shadow:0 2px 12px #0097a722;">
                <h2 style="color:#0097a7;text-align:center;">Verificación de correo</h2>
                <p style="font-size:1.1em;color:#083c5d;">Tu código de verificación es:</p>
                <div style="font-size:2em;font-weight:bold;color:#083c5d;background:#e0f7fa;padding:12px 0;border-radius:8px;text-align:center;letter-spacing:4px;margin:18px 0;">
                    {codigoVerificacion}
                </div>
                <p style="color:#888;text-align:center;font-size:0.98em;">Ingresa este código en PackyGo para continuar.</p>
            </div>
        </div>
        """
        em.add_alternative(html, subtype="html")

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

        html = f"""
        <div style="font-family: Arial, sans-serif; background:#f4f8fb; padding:24px;">
            <div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:24px 28px;box-shadow:0 2px 12px #0097a722;">
                <h2 style="color:#0097a7;text-align:center;">¡Tienes una nueva reserva!</h2>
                <div style="font-size:1.08em;color:#083c5d;margin:18px 0 10px 0;white-space:pre-line;">
                    {mensaje}
                </div>
                <p style="color:#888;text-align:center;font-size:0.98em;margin-top:18px;">Gracias por usar PackyGo.</p>
            </div>
        </div>
        """
        em.add_alternative(html, subtype="html")

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(email_sender, password)
            smtp.send_message(em)
        print("Correo de reserva enviado correctamente")
    except Exception as e:
        print("Error al enviar correo de reserva:", e)

def enviarCorreoCancelacion(correo, nombre, mensaje_extra, es_cliente=True):
    try:
        em = EmailMessage()
        em["From"] = email_sender
        em["To"] = correo
        em["Subject"] = "Reserva cancelada"
        if es_cliente:
            texto = f"Hola {nombre}, tu reserva ha sido cancelada. {mensaje_extra}"
        else:
            texto = f"Hola {nombre}, una reserva de tu vehículo ha sido cancelada. {mensaje_extra}"
        em.set_content(texto)

        html = f"""
        <div style="font-family: Arial, sans-serif; background:#f4f8fb; padding:24px;">
            <div style="max-width:420px;margin:auto;background:#fff;border-radius:12px;padding:24px 28px;box-shadow:0 2px 12px #0097a722;">
                <h2 style="color:#0097a7;text-align:center;">Reserva cancelada</h2>
                <p style="font-size:1.1em;color:#083c5d;">{texto}</p>
                <p style="color:#888;text-align:center;font-size:0.98em;">PackyGo</p>
            </div>
        </div>
        """
        em.add_alternative(html, subtype="html")

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(email_sender, password)
            smtp.send_message(em)
        print("Correo de cancelación enviado correctamente")
    except Exception as e:
        print("Error al enviar correo de cancelación:", e)
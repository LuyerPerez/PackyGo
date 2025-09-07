# PackyGo

PackyGo es una plataforma web para gestión de usuarios y envíos, desarrollada con **React + Vite** en el frontend y **Flask** en el backend.

---

## Estructura de Carpetas

```
PackyGo/
├── backend/         # Backend Flask (API, lógica de negocio, envío de correos)
│   ├── app.py
│   ├── requirements.txt
│   └── .env
├── db/              # Scripts y archivos de base de datos
│   └── scripts.sql
├── docs/            # Documentación técnica y manuales
├── frontend/        # Frontend React + Vite
│   ├── public/      # Archivos públicos y estáticos
│   ├── src/         # Componentes, estilos y lógica de React
│   │   ├── assets/  # Archivos CSS e imágenes
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/   # Vistas principales
│   │   ├── api.js   # Conexión con el backend
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── ...
├── .gitignore
├── Git_Workflow.md
├── README.md
```

---

## Instalación y ejecución

## Base de datos 

1. En la carpeta db esta el script de la base de datos, ejecutar en MySQL Workbench o PhpMyAdmin

### Backend

1. Ejecutar o crear su entorno virtual:

   ```
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

#### Ejemplo de archivo `.env` para el backend

```properties
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=packygo
FLASK_DEBUG=1
FLASK_PORT=5000

PASSWORD=tu_contraseña_de_aplicacion_gmail
SECRET_KEY=tu_clave_secreta_google
GOOGLE_CLIENT_ID=tu_client_id_google
```

### Frontend

1. Instala dependencias:
   ```
   npm install
   ```
2. Ejecuta la app:
   ```
   npm run dev
   ```

---

## Funcionalidades principales


Las funcionalidades principales de PackyGo son:

- **Registro y autenticación de usuarios:**
   - Registro de nuevos usuarios con verificación por correo electrónico.
   - Login seguro y recuperación de contraseña.
   - Encriptación de contraseñas usando Werkzeug.

- **Gestión de roles:**
   - Roles diferenciados: cliente, camionero y administrador.
   - Permisos y vistas específicas según el tipo de usuario.

- **Registro y gestión de vehículos:**
   - Los camioneros pueden registrar sus vehículos (camión, camioneta, etc.) con detalles como placa, modelo, año, imagen y tarifa diaria.
   - Edición y eliminación de vehículos propios.

- **Reservación y alquiler de vehículos:**
   - Los clientes pueden buscar y reservar vehículos disponibles según fechas y tarifas.
   - Visualización de detalles del vehículo y del camionero.
   - Gestión del estado de la reserva (activa, finalizada, cancelada).
   - Cálculo automático del total a pagar según la tarifa y duración.

- **Calificaciones y comentarios:**
   - Los usuarios pueden calificar y dejar comentarios tanto a camioneros como a vehículos.
   - Visualización de reputación y comentarios en los perfiles.

- **Reportes y notificaciones:**
   - Los usuarios pueden reportar incidencias relacionadas con reservas.
   - El sistema gestiona el estado de los reportes (abierto, en revisión, resuelto).
   - Notificaciones automáticas sobre reservas, calificaciones y reportes.

- **Administración y seguridad:**
   - El administrador puede gestionar usuarios, vehículos, reservas y reportes.
   - Conexión segura con MySQL y validaciones de datos.

- **Interfaz moderna y responsiva:**
   - Frontend desarrollado con React + Vite, adaptado a dispositivos móviles y escritorio.

---

## Documentación adicional

- **db/scripts.sql**: Estructura y datos de la base de datos.
- **docs/**: Manuales y guías técnicas.
- **Git_Workflow.md**: Flujo de trabajo recomendado con Git.

---

## Requisitos

- Python 3.10+
- Node.js 18+
- XAMPP o MySQL SERVER
- Git Bash
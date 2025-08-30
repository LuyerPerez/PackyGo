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

### Backend

1. Instala dependencias:
   ```
   pip install -r requirements.txt
   ```
2. Configura el archivo `.env` con tus credenciales de MySQL y correo.
3. Ejecuta el servidor:
   ```
   python app.py
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

- Registro y login de usuarios con verificación por correo electrónico.
- Encriptación de contraseñas (Werkzeug).
- Gestión de roles (cliente, camionero, admin).
- Conexión segura con MySQL.
- Interfaz moderna y responsiva con React.

---

## Documentación adicional

- **db/scripts.sql**: Estructura y datos de la base de datos.
- **docs/**: Manuales y guías técnicas.
- **Git_Workflow.md**: Flujo de trabajo recomendado con Git.

---

## Requisitos

- Python 3.10+
- Node.js 18+
- MySQL Server
- Contraseña de aplicación de Gmail para envío de correos
# Estructura de Carpetas del Proyecto

El proyecto está organizado de la siguiente manera:

```
PackyGo
├── backend/         # Código fuente del backend (API, lógica de negocio, etc.)
│   └── app.py
├── db/              # Scripts y archivos relacionados con la base de datos
│   └── scripts.sql
├── docs/            # Documentación adicional del proyecto
├── frontend/        # Código fuente del frontend (React + Vite)
│   ├── public/      # Archivos públicos y estáticos
│   ├── src/         # Código fuente de React
│   ├── index.html   # HTML principal de la aplicación
│   ├── package.json # Configuración de dependencias y scripts de npm
│   └── ...otros archivos de configuración
├── .gitignore       # Archivos y carpetas ignorados por git
├── Git_Workflow.md  # Guía de flujo de trabajo con Git
├── README.md        # Este archivo
```

## Descripción de carpetas principales

- **backend/**: Contiene el código del servidor, API y lógica de negocio.
- **db/**: Incluye scripts SQL para la creación y gestión de la base de datos.
- **docs/**: Espacio para documentación técnica o manuales adicionales.
- **frontend/**: Todo el código del cliente, construido con React y Vite.
  - **public/**: Archivos estáticos accesibles públicamente.
  - **src/**: Componentes, estilos y lógica de la aplicación React.
- **.gitignore**: Define qué archivos/directorios no se suben al repositorio.
- **Git_Workflow.md**: Explica el flujo de trabajo recomendado con Git.
- **README.md**: Documentación principal
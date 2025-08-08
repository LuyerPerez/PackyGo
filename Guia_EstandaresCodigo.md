# Lenguajes y Tecnologías Utilizadas

Este proyecto utiliza las siguientes tecnologías:

- **Python**: Lenguaje principal de desarrollo.
- **MySQL**: Sistema de gestión de bases de datos utilizado para almacenar la información.
- **Read**: Biblioteca o función para lectura de archivos o entradas, en contexto del manejo de datos.

---

# Guía de Estándares de Código – Proyecto Python

Esta guía define los estándares de codificación que deben seguirse durante el desarrollo del proyecto utilizando el lenguaje Python. El objetivo es mantener un código limpio, legible y consistente para todo el equipo de desarrollo.

---

## a. Reglas de nombres

### Variables
- Utilizar **snake_case** (minúsculas y guiones bajos).
- Los nombres deben ser descriptivos.

```python
# Aceptado
total_ventas = 150

# No aceptado
TotalVentas = 150
tv = 150
```

### Clases
- Utilizar **CamelCase** (Primera letra de cada palabra en mayúscula, sin guiones bajos).

```python
# Aceptado
class ClienteVIP:
    pass

# No aceptado
class cliente_vip:
    pass
```

### Métodos y funciones
- Utilizar **snake_case**.

```python
# Aceptado
def calcular_total():
    pass

# No aceptado
def CalcularTotal():
    pass
```

### Constantes
- Usar letras mayúsculas y guiones bajos.

```python
# Aceptado
PI = 3.14

# No aceptado
pi = 3.14
```

---

## b. Comentarios y documentación interna

### Comentarios en línea
- Explican partes específicas del código, sin redundancia.

```python
# Calcula el total con descuento
total = subtotal * 0.9
```

### Comentarios de bloque
- Se colocan antes de secciones complejas de código.

```python
# Verifica si el usuario está autenticado
# y tiene permisos de administrador
if usuario.autenticado and usuario.rol == "admin":
    ...
```

### Docstrings
- Usar triple comilla doble `"""` para documentar módulos, clases y funciones.

```python
def calcular_total(productos):
    """
    Calcula el total de una lista de productos.

    Args:
        productos (list): Lista de precios.

    Returns:
        float: Total sumado de los productos.
    """
    return sum(productos)
```

---

## c. Identación y estilo de código

- Usar **4 espacios** por nivel de indentación (no usar tabulaciones).
- Seguir la guía de estilo **PEP 8**.
- Longitud máxima de línea: **79 caracteres**.
- Dejar una línea en blanco entre funciones y clases.

```python
def funcion_ejemplo():
    if True:
        print("Correcto")
```

---

## d. Ejemplos aceptados y no aceptados

### Variables

```python
# Aceptado
nombre_usuario = "Carlos"

# No aceptado
NombreUsuario = "Carlos"
nu = "Carlos"
```

### Clases

```python
# Aceptado
class ReporteMensual:
    pass

# No aceptado
class reporte_mensual:
    pass
```

### Funciones

```python
# Aceptado
def obtener_datos_cliente():
    pass

# No aceptado
def ObtenerDatosCliente():
    pass
```

### Comentarios

```python
# Aceptado
# Calcula el promedio de las notas

# No aceptado
# promedio notas
```

---

## Referencias
- [PEP 8 – Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)

---

> Esta guía debe ser consultada y aplicada por todos los desarrolladores del proyecto para asegurar calidad y coherencia en el código fuente.
---

## Aplicación de las tecnologías en el proyecto

- **Python (Back-end)**: Se utiliza como lenguaje principal del lado del servidor para desarrollar la lógica del sistema, manejo de peticiones, procesamiento de datos y conexión con la base de datos.
- **React (Front-end)**: Se emplea en el lado del cliente para la lectura y visualización de datos, ya sea desde archivos o interfaces interactivas.
- **MySQL (Base de Datos)**: Se usa para almacenar, organizar y gestionar los datos de la aplicación como productos, usuarios, ventas, etc.

Estas tecnologías trabajan juntas para ofrecer una arquitectura funcional, organizada y escalable.

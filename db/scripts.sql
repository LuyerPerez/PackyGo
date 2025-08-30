DROP DATABASE IF EXISTS packygo;
CREATE DATABASE IF NOT EXISTS packygo CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE packygo;

-- Tabla usuario
CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  noDocumento VARCHAR(20) UNIQUE,
  correo VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(15),
  contrasena VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla vehiculo
CREATE TABLE vehiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  camionero_id INT NOT NULL,
  tipo_vehiculo VARCHAR(50),
  placa VARCHAR(20) NOT NULL UNIQUE,
  modelo VARCHAR(50),
  ano_modelo SMALLINT,
  imagen_url TEXT,
  tarifa_diaria DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (camionero_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla reserva
CREATE TABLE reserva (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  vehiculo_id INT NOT NULL,
  fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_fin DATETIME,
  estado_reserva VARCHAR(20) DEFAULT 'activa',
  total_pago DECIMAL(10,2),
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla calificacion_usuario
CREATE TABLE calificacion_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  autor_id INT NOT NULL,
  usuario_destino_id INT NOT NULL,
  estrellas TINYINT NOT NULL,
  comentario TEXT,
  fecha_calificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_destino_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla calificacion_vehiculo
CREATE TABLE calificacion_vehiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  autor_id INT NOT NULL,
  vehiculo_destino_id INT NOT NULL,
  estrellas TINYINT NOT NULL,
  comentario TEXT,
  fecha_calificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (vehiculo_destino_id) REFERENCES vehiculo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla reporte
CREATE TABLE reporte (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT NOT NULL,
  usuario_id INT NOT NULL,
  descripcion TEXT NOT NULL,
  estado_reporte VARCHAR(20) DEFAULT 'abierto',
  fecha_reporte DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reserva_id) REFERENCES reserva(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla notificacion
CREATE TABLE notificacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

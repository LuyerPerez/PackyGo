DROP DATABASE IF EXISTS packygo;
CREATE DATABASE IF NOT EXISTS packygo CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE packygo;

-- Tabla usuario
CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  noDocumento VARCHAR(10) UNIQUE NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(15),
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'cliente', 'camionero') NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla vehiculo
CREATE TABLE vehiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  camionero_id INT NOT NULL,
  tipo_vehiculo VARCHAR(50) NOT NULL,
  placa VARCHAR(20) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  ano_modelo INT NOT NULL,
  imagen_url VARCHAR(255),
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
  estado_reserva ENUM('activa', 'cancelada', 'finalizada') DEFAULT 'activa',
  total_pago DECIMAL(10,2),
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE reserva
ADD COLUMN direccion_inicio VARCHAR(255) NOT NULL AFTER fecha_fin,
ADD COLUMN direccion_destino VARCHAR(255) NOT NULL AFTER direccion_inicio;

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

-- Usuarios
INSERT INTO usuario (nombre, noDocumento, correo, telefono, contrasena, rol) VALUES
('Luyer Perez', '1025143367', 'luyerperez0@gmail.com', '3219423757', 'pass1', 'admin'),
('Alison Ospina', '1034289794', 'alisonospinaariza0126@gmail.com', '3145975921', 'pass10', 'cliente'),
('Dina Monroy', '1031423129', 'milaniamalaver94@gmail.com', '3019122987', 'pass2', 'camionero');

-- Vehículos (20 vehículos asignados al camionero Dina Monroy)
INSERT INTO `vehiculo` (`camionero_id`, `tipo_vehiculo`, `placa`, `modelo`, `ano_modelo`, `imagen_url`, `tarifa_diaria`) VALUES
(3, 'Camion', 'ABC123', 'Volvo FH', 2020, 'https://tractomulasdecolombia.com/wp-content/uploads/2020/08/volvo-FH-1.jpg', 150.00),
(3, 'Camioneta', 'DEF456', 'Chevrolet Express', 2019, 'https://www.chevrolet.com/content/dam/chevrolet/na/us/english/index/vehicles/2025/commercial/express-vans/01-images/safety/2025-express-van-safety-01.png', 120.00),
(3, 'Camion', 'GHI789', 'Mercedes Actros', 2021, 'https://i.ytimg.com/vi/7s_bLvlohHE/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCB8HFGEc7_5V_wVlIJWurwj0y5sA', 180.00),
(3, 'Camioneta', 'JKL012', 'Toyota Hilux', 2022, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/2016_Toyota_HiLux_%28GUN136R%29_SR5_4-door_utility_%282018-09-03%29_01.jpg/1200px-2016_Toyota_HiLux_%28GUN136R%29_SR5_4-door_utility_%282018-09-03%29_01.jpg', 130.00);

-- Reservas (clientes reservan vehículos)
INSERT INTO reserva (cliente_id, vehiculo_id, fecha_fin, estado_reserva, total_pago) VALUES
(2, 1, '2025-09-01 10:00:00', 'activa', 300.00),
(2, 2, '2025-09-02 12:00:00', 'finalizada', 240.00),
(2, 3, '2025-09-03 14:00:00', 'cancelada', 0.00);

-- Calificación usuario (admin y cliente califican al camionero)
INSERT INTO calificacion_usuario (autor_id, usuario_destino_id, estrellas, comentario) VALUES
(1, 3, 5, 'Excelente camionero'),
(2, 3, 4, 'Muy puntual'),
(1, 2, 5, 'Cliente recomendado');

-- Calificación vehículo (admin y cliente califican vehículos del camionero)
INSERT INTO calificacion_vehiculo (autor_id, vehiculo_destino_id, estrellas, comentario) VALUES
(1, 1, 5, 'Camión en excelente estado'),
(2, 2, 4, 'Camioneta cómoda'),
(1, 3, 3, 'Vehículo regular');

-- Reportes (clientes y admin reportan reservas)
INSERT INTO reporte (reserva_id, usuario_id, descripcion, estado_reporte) VALUES
(1, 2, 'Retraso en la entrega', 'abierto'),
(2, 1, 'Vehículo sucio', 'en revision'),
(3, 2, 'Problema con el pago', 'resuelto');

-- Notificaciones (para los 3 usuarios)
INSERT INTO notificacion (usuario_id, mensaje) VALUES
(1, 'Tu reserva ha sido confirmada'),
(2, 'Tienes una nueva calificación'),
(3, 'Tu reporte ha sido recibido');
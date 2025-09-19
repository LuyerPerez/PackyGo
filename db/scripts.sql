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
  tipo_vehiculo ENUM('Camioneta pequeña', 'Furgón cerrado', '3/4 de carga', 'Camión sencillo', 'Camión estacas', 'Camión turbo') NOT NULL,
  placa VARCHAR(20) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  ano_modelo INT NOT NULL,
  imagen_url TEXT NOT NULL,
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

-- Tabla cal
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

ALTER TABLE calificacion_vehiculo ADD COLUMN reserva_id INT NULL AFTER id;

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

INSERT INTO usuario VALUES 
(1, 'Luyer Perez', '1025143367', 'luyerperez0@gmail.com', '3219423757', 'pass1', 'admin', DEFAULT),
(2, 'Alison Ospina', '1034289794', 'alisonospinaariza0126@gmail.com', '3145975921', 'pass2', 'cliente', DEFAULT),
(3, 'Dina Monroy', '1031423129', 'milaniamalaver94@gmail.com', '3019122987', 'pass3', 'camionero', DEFAULT),
(4, 'Evelin Amaya', '1074812760', 'evelinjasbleidya@gmail.com', '3222165858', 'pass4', 'camionero', DEFAULT);

INSERT INTO vehiculo VALUES 
(1, 3, 'Camión sencillo', 'TZX123', 'Chevrolet NHR', 2021, '/uploads/Chevrolet_NHR.jpg', 180000),
(2, 3, 'Camioneta pequeña', 'VBG456', 'Toyota Hilux', 2020, '/uploads/Toyota_Hilux.jpg', 130000),
(3, 3, 'Furgón cerrado', 'JKL789', 'Renault Master', 2022, '/uploads/Renault_Master.webp', 150000),
(4, 4, 'Camión turbo', 'QWE321', 'Isuzu NPR Turbo', 2021, '/uploads/Isuzu_NPR_Turbo.webp', 200000),
(5, 4, 'Camioneta pequeña', 'RTY654', 'Ford Ranger', 2019, '/uploads/Ford_Ranger.jpg', 120000),
(6, 4, 'Furgón cerrado', 'UIO987', 'Mercedes Sprinter', 2020, '/uploads/Mercedes_Sprinter.webp', 140000);

INSERT INTO reserva (id, cliente_id, vehiculo_id, fecha_inicio, fecha_fin, direccion_inicio, direccion_destino, estado_reserva, total_pago, fecha_creacion) VALUES
(1, 2, 1, '2025-09-01 08:00:00', '2025-09-03 18:00:00', 'Cra 10 #20-30', 'Calle 50 #15-10', 'activa', 450.00, '2025-09-01 07:50:00'),
(2, 2, 2, '2025-09-04 09:00:00', '2025-09-05 17:00:00', 'Av 5 #12-45', 'Av 8 #22-33', 'finalizada', 240.00, '2025-09-04 08:55:00'),
(3, 2, 3, '2025-09-06 10:00:00', '2025-09-07 16:00:00', 'Calle 100 #30-20', 'Cra 80 #10-50', 'cancelada', 130.00, '2025-09-06 09:50:00'),
(4, 2, 4, '2025-09-08 11:00:00', '2025-09-09 15:00:00', 'Cra 15 #40-60', 'Calle 60 #25-15', 'activa', 320.00, '2025-09-08 10:55:00'),
(5, 2, 5, '2025-09-10 12:00:00', '2025-09-11 14:00:00', 'Av 9 #18-22', 'Av 11 #30-40', 'finalizada', 220.00, '2025-09-10 11:50:00'),
(6, 2, 6, '2025-09-12 13:00:00', '2025-09-13 13:00:00', 'Calle 70 #12-34', 'Cra 60 #45-23', 'activa', 125.00, '2025-09-12 12:55:00'),
(7, 2, 1, '2025-09-14 14:00:00', '2025-09-15 18:00:00', 'Cra 20 #50-10', 'Calle 80 #30-20', 'finalizada', 300.00, '2025-09-14 13:50:00'),
(8, 2, 2, '2025-09-16 15:00:00', '2025-09-17 17:00:00', 'Av 15 #40-60', 'Av 18 #22-33', 'activa', 240.00, '2025-09-16 14:55:00'),
(9, 2, 3, '2025-09-18 16:00:00', '2025-09-19 16:00:00', 'Calle 120 #30-20', 'Cra 90 #10-50', 'cancelada', 130.00, '2025-09-18 15:50:00'),
(10, 2, 4, '2025-09-19 17:00:00', '2025-09-20 15:00:00', 'Cra 25 #40-60', 'Calle 70 #25-15', 'activa', 320.00, '2025-09-19 16:55:00');      

-- Calificaciones de vehículo
INSERT INTO calificacion_vehiculo (autor_id, vehiculo_destino_id, estrellas, comentario, reserva_id) VALUES
(2, 1, 5, 'Camión en excelente estado.', 1),
(2, 2, 4, 'Camioneta cómoda y segura.', 2),
(2, 3, 2, 'El furgón tenía problemas mecánicos.', 3),
(2, 4, 5, 'Camión nuevo y potente.', 4),
(2, 5, 4, 'Camioneta útil para mudanza.', 5),
(2, 6, 3, 'Furgón aceptable, pero algo sucio.', 6);

-- Calificaciones del camionero al cliente (solo reservas finalizadas)
INSERT INTO calificacion_usuario (autor_id, usuario_destino_id, estrellas, comentario) VALUES
(3, 2, 5, 'Cliente puntual y cordial.'),          
(4, 2, 5, 'Excelente comunicación y trato.'),     
(3, 2, 4, 'Todo bien, buen trato.');
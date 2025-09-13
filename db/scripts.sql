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
  estado_reserva VARCHAR(20) DEFAULT 'activa',
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
(3, 'Camion', 'ABC123', 'Volvo FH', 2020, 'https://www.volvotrucks.com/media/volvo-fh-gallery-01.jpg', 150.00),
(3, 'Camioneta', 'DEF456', 'Chevrolet Express', 2019, 'https://www.chevrolet.com/content/dam/chevrolet/na/us/english/index/vehicles/2024/commercial/express-vans/01-images/2024-express-van-01.jpg', 120.00),
(3, 'Camion', 'GHI789', 'Mercedes Actros', 2021, 'https://www.mercedes-benz-trucks.com/en_GB/models/actros/_jcr_content/root/slider/sliderchilditems/slideritem/image.component.damq5.338110.jpg/mercedes-benz-actros-gallery-01.jpg', 180.00),
(3, 'Camioneta', 'JKL012', 'Toyota Hilux', 2022, 'https://toyota.com.co/wp-content/uploads/2022/03/hilux-gris.png', 130.00),
(3, 'Camion', 'MNO345', 'Scania R500', 2018, 'https://www.scania.com/content/dam/scanianoe/market/master/home/products-and-services/trucks/r-series/r-series-gallery/r-series-gallery-01.jpg', 170.00),
(3, 'Camioneta', 'PQR678', 'Ford Ranger', 2020, 'https://www.ford.com.co/content/dam/Ford/website-assets/latam/co/nameplate/ranger/2023/gallery/ford-ranger-2023-gallery-01.jpg', 125.00),
(3, 'Camion', 'STU901', 'MAN TGX', 2019, 'https://www.man.eu/man/media_common/img/products/trucks/tgx_gallery/tgx_gallery_01.jpg', 160.00),
(3, 'Camioneta', 'VWX234', 'Nissan Frontier', 2021, 'https://www.nissan.com.co/content/dam/Nissan/latam/vehicles/frontier/2022/gallery/nissan-frontier-2022-gallery-01.jpg', 128.00),
(3, 'Camion', 'YZA567', 'Iveco Stralis', 2022, 'https://www.iveco.com/PublishingImages/stralis-gallery-01.jpg', 175.00),
(3, 'Camioneta', 'BCD890', 'Mazda BT-50', 2020, 'https://mazda.com.co/assets/img/vehiculos/bt-50/galeria/mazda-bt-50-galeria-01.jpg', 122.00),
(3, 'Camion', 'EFG123', 'Renault Trucks T', 2018, 'https://www.renault-trucks.com/sites/default/files/styles/gallery_image/public/2021-06/renault-trucks-t-gallery-01.jpg', 155.00),
(3, 'Camioneta', 'HIJ456', 'Volkswagen Amarok', 2021, 'https://www.vw.com.co/media/Model_Image_Banner_Image_Component/root-new-cars/amarok/amarok-gallery-01.jpg', 135.00),
(3, 'Camion', 'KLM789', 'DAF XF', 2019, 'https://www.daf.com/-/media/images/daf-trucks/gallery/xf-gallery-01.jpg', 165.00),
(3, 'Camioneta', 'NOP012', 'Isuzu D-Max', 2022, 'https://www.isuzu.com.co/assets/img/dmax/galeria/isuzu-dmax-galeria-01.jpg', 127.00),
(3, 'Camion', 'QRS345', 'Freightliner Cascadia', 2020, 'https://www.freightliner.com/-/media/freightliner/gallery/cascadia-gallery-01.jpg', 185.00),
(3, 'Camioneta', 'TUV678', 'Ram 1500', 2021, 'https://www.ram.com.co/content/dam/ram/latam/vehicles/1500/2022/gallery/ram-1500-2022-gallery-01.jpg', 140.00),
(3, 'Camion', 'WXY901', 'Kenworth T680', 2018, 'https://www.kenworth.com/media/kenworth-t680-gallery-01.jpg', 172.00),
(3, 'Camioneta', 'ZAB234', 'Fiat Toro', 2020, 'https://www.fiat.com.co/content/dam/fiat/latam/vehicles/toro/2022/gallery/fiat-toro-2022-gallery-01.jpg', 124.00),
(3, 'Camion', 'CDE567', 'Volvo FMX', 2021, 'https://www.volvotrucks.com/media/volvo-fmx-gallery-01.jpg', 178.00),
(3, 'Camioneta', 'FGH890', 'Peugeot Landtrek', 2022, 'https://www.peugeot.com.co/content/dam/peugeot/latam/vehicles/landtrek/2022/gallery/peugeot-landtrek-2022-gallery-01.jpg', 138.00);

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
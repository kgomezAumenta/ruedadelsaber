-- Database Schema for Rueda del Saber

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ruedadelsaber;
USE ruedadelsaber;

CREATE TABLE IF NOT EXISTS paises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puntos_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    pais_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    punto_venta_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS marcas_bayer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    pais_id INT NOT NULL,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'editor', 'promotor') DEFAULT 'promotor',
    pais_id INT,
    punto_venta_id INT,
    ubicacion_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE SET NULL,
    FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(id) ON DELETE SET NULL,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    pais_id INT NOT NULL,
    marca_bayer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE CASCADE,
    FOREIGN KEY (marca_bayer_id) REFERENCES marcas_bayer(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS respuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE,
    pregunta_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS participaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    marca_bayer_id INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    aciertos INT DEFAULT 0,
    gano BOOLEAN DEFAULT FALSE,
    numero_participante INT DEFAULT 1,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (marca_bayer_id) REFERENCES marcas_bayer(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS respuestas_participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participacion_id INT NOT NULL,
    pregunta_id INT NOT NULL,
    respuesta_id INT NOT NULL,
    es_correcta BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participacion_id) REFERENCES participaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE,
    FOREIGN KEY (respuesta_id) REFERENCES respuestas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS logs_ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS logs_actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    accion VARCHAR(255) NOT NULL,
    detalles TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

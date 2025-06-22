-- Script d'initialisation de la base de données Library
-- Ce script sera exécuté automatiquement par MySQL lors du premier démarrage
-- si le volume de données est vide

-- Note: Pas besoin de CREATE DATABASE ou USE car MySQL s'exécute 
-- déjà dans le contexte de MYSQL_DATABASE=library_db

-- Table des auteurs
-- Structure exacte de la base de développement
CREATE TABLE IF NOT EXISTS Authors (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_author_name (firstName, lastName)
);

-- Table des étagères
-- Structure exacte de la base de développement (PAS de contrainte UNIQUE sur name)
CREATE TABLE IF NOT EXISTS Shelves (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des livres
-- Structure exacte de la base de développement
CREATE TABLE IF NOT EXISTS Books (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(36) NOT NULL,
    isbn VARCHAR(13) NOT NULL UNIQUE,
    date DATE,
    description TEXT,
    jacket VARCHAR(255),
    shelf VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX author (author),
    INDEX shelf (shelf),
    FOREIGN KEY (author) REFERENCES Authors(id),
    FOREIGN KEY (shelf) REFERENCES Shelves(id)
);

-- Insérer quelques données d'exemple (vous pouvez supprimer cette section si non désirée)
INSERT IGNORE INTO Authors (id, firstName, lastName) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John', 'Doe'),
('b2c3d4e5-f6g7-8901-bcde-f12345678901', 'Jane', 'Smith'),
('c3d4e5f6-g7h8-9012-cdef-123456789012', 'Bob', 'Johnson');

INSERT IGNORE INTO Shelves (id, name) VALUES
('d4e5f6g7-h8i9-0123-def0-234567890123', 'Étagère 1'),
('e5f6g7h8-i9j0-1234-ef01-345678901234', 'Étagère 2'),
('f6g7h8i9-j0k1-2345-f012-456789012345', 'Étagère 3');

INSERT IGNORE INTO Books (id, title, author, isbn, date, description, jacket, shelf) VALUES
('e5f6g7h8-i9j0-1234-ef01-345678901234', 'Book 1', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1234567890123', '2024-01-01', 'Description 1', '/cover1.jpg', 'd4e5f6g7-h8i9-0123-def0-234567890123'),
('f6g7h8i9-j0k1-2345-f012-456789012345', 'Book 2', 'b2c3d4e5-f6g7-8901-bcde-f12345678901', '9876543210987', '2024-02-01', 'Description 2', '/cover2.jpg', NULL);

-- Afficher un message de confirmation
SELECT 'Base de données initialisée avec succès!' as message;

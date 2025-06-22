-- Script d'initialisation de la base de données Library
-- Ce script sera exécuté automatiquement par MySQL lors du premier démarrage
-- si le volume de données est vide

-- Note: Pas besoin de CREATE DATABASE ou USE car MySQL s'exécute 
-- déjà dans le contexte de MYSQL_DATABASE=library_db

-- Table des auteurs
CREATE TABLE IF NOT EXISTS Authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    bio TEXT,
    birth_date DATE,
    nationality VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (firstName, lastName)
);

-- Table des étagères
CREATE TABLE IF NOT EXISTS Shelves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Table des livres
CREATE TABLE IF NOT EXISTS Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE,
    author VARCHAR(255),
    description TEXT,
    isbn VARCHAR(20) UNIQUE,
    jacket VARCHAR(255),
    shelf VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_isbn (isbn),
    INDEX idx_author (author)
);

-- Table des couvertures de livres
CREATE TABLE IF NOT EXISTS Jackets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size INT,
    small_path VARCHAR(255),
    medium_path VARCHAR(255),
    large_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES Books(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id),
    INDEX idx_filename (filename)
);

-- Insérer des données d'exemple
INSERT IGNORE INTO Authors (firstName, lastName, bio, birth_date, nationality) VALUES
('Victor', 'Hugo', 'Écrivain français du XIXe siècle, auteur des Misérables', '1802-02-26', 'Française'),
('Agatha', 'Christie', 'Romancière britannique, reine du roman policier', '1890-09-15', 'Britannique'),
('Gabriel García', 'Márquez', 'Écrivain colombien, prix Nobel de littérature', '1927-03-06', 'Colombienne');

INSERT IGNORE INTO Shelves (name, description, location) VALUES
('Fiction Classique', 'Romans et œuvres de fiction classique', 'Étage 1 - Section A'),
('Polar & Thriller', 'Romans policiers et thrillers', 'Étage 1 - Section B'),
('Littérature Mondiale', 'Œuvres de littérature internationale', 'Étage 2 - Section A');

INSERT IGNORE INTO Books (title, author, isbn, date, description, shelf) VALUES
('Les Misérables', 'Victor Hugo', '978-2-07-036194-1', '1862-01-01', 'Chef-d\'œuvre de Victor Hugo sur la France du XIXe siècle', 'Fiction Classique'),
('Le Crime de l\'Orient-Express', 'Agatha Christie', '978-2-253-00689-4', '1934-01-01', 'Hercule Poirot enquête sur un meurtre dans un train', 'Polar & Thriller'),
('Cent ans de solitude', 'Gabriel García Márquez', '978-2-02-000598-4', '1967-01-01', 'Saga familiale de Gabriel García Márquez', 'Littérature Mondiale');

-- Afficher un message de confirmation (sera ignoré en cas d'erreur)
SELECT 'Base de données initialisée avec succès!' as message;

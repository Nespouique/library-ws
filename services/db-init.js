import mysql from 'mysql2/promise';
import config from '../config/config.js';

/**
 * Service d'initialisation de la base de données
 * Vérifie si les tables existent et les crée si nécessaire
 */

// Scripts SQL d'initialisation des tables
const CREATE_AUTHORS_TABLE = `
CREATE TABLE IF NOT EXISTS Authors (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_author_name (firstName, lastName)
)`;

const CREATE_SHELVES_TABLE = `
CREATE TABLE IF NOT EXISTS Shelves (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_BOOKS_TABLE = `
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
)`;

// Données d'exemple
const SAMPLE_AUTHORS = [
    ['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John', 'Doe'],
    ['b2c3d4e5-f6g7-8901-bcde-f12345678901', 'Jane', 'Smith'],
    ['c3d4e5f6-g7h8-9012-cdef-123456789012', 'Bob', 'Johnson'],
];

const SAMPLE_SHELVES = [
    ['d4e5f6g7-h8i9-0123-def0-234567890123', 'Étagère 1', 'kube1'],
    ['e5f6g7h8-i9j0-1234-ef01-345678901234', 'Étagère 2', 'kube2'],
    ['f6g7h8i9-j0k1-2345-f012-456789012345', 'Étagère 3', 'kube3'],
];

const SAMPLE_BOOKS = [
    ['e5f6g7h8-i9j0-1234-ef01-345678901234', 'Book 1', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1234567890123', '2024-01-01', 'Description 1', '/cover1.jpg', 'd4e5f6g7-h8i9-0123-def0-234567890123'],
    ['f6g7h8i9-j0k1-2345-f012-456789012345', 'Book 2', 'b2c3d4e5-f6g7-8901-bcde-f12345678901', '9876543210987', '2024-02-01', 'Description 2', '/cover2.jpg', null],
];

/**
 * Vérifie si une table existe dans la base de données
 */
async function tableExists(connection, tableName) {
    try {
        const [rows] = await connection.execute(
            `SELECT COUNT(*) as count FROM information_schema.tables 
             WHERE table_schema = ? AND table_name = ?`,
            [config.db.database, tableName]
        );
        return rows[0].count > 0;
    } catch (error) {
        console.error(`Erreur lors de la vérification de la table ${tableName}:`, error);
        return false;
    }
}

/**
 * Crée les tables de la base de données si elles n'existent pas
 */
async function createTables(connection) {
    try {
        console.log('📋 Création des tables...');

        // Créer la table Authors
        await connection.execute(CREATE_AUTHORS_TABLE);
        console.log('✅ Table Authors créée');

        // Créer la table Shelves
        await connection.execute(CREATE_SHELVES_TABLE);
        console.log('✅ Table Shelves créée');

        // Créer la table Books (doit être créée après Authors et Shelves à cause des clés étrangères)
        await connection.execute(CREATE_BOOKS_TABLE);
        console.log('✅ Table Books créée');

        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error);
        throw error;
    }
}

/**
 * Insère des données d'exemple si les tables sont vides
 */
async function insertSampleData(connection) {
    try {
        console.log("📦 Insertion des données d'exemple...");

        // Vérifier si les tables contiennent déjà des données
        const [authorCount] = await connection.execute('SELECT COUNT(*) as count FROM Authors');
        const [shelfCount] = await connection.execute('SELECT COUNT(*) as count FROM Shelves');
        const [bookCount] = await connection.execute('SELECT COUNT(*) as count FROM Books');

        if (authorCount[0].count === 0) {
            // Insérer les auteurs d'exemple
            for (const author of SAMPLE_AUTHORS) {
                await connection.execute('INSERT IGNORE INTO Authors (id, firstName, lastName) VALUES (?, ?, ?)', author);
            }
            console.log("✅ Auteurs d'exemple insérés");
        }

        if (shelfCount[0].count === 0) {
            // Insérer les étagères d'exemple
            for (const shelf of SAMPLE_SHELVES) {
                await connection.execute('INSERT IGNORE INTO Shelves (id, name, location) VALUES (?, ?, ?)', shelf);
            }
            console.log("✅ Étagères d'exemple insérées");
        }

        if (bookCount[0].count === 0) {
            // Insérer les livres d'exemple
            for (const book of SAMPLE_BOOKS) {
                await connection.execute('INSERT IGNORE INTO Books (id, title, author, isbn, date, description, jacket, shelf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', book);
            }
            console.log("✅ Livres d'exemple insérés");
        }

        if (authorCount[0].count > 0 || shelfCount[0].count > 0 || bookCount[0].count > 0) {
            console.log("ℹ️ Des données existent déjà, pas d'insertion de données d'exemple");
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'insertion des données d'exemple:", error);
        // Ne pas faire échouer l'initialisation si l'insertion des données d'exemple échoue
    }
}

/**
 * Initialise la base de données : crée les tables si nécessaire
 * et insère des données d'exemple si les tables sont vides
 */
async function initializeDatabase() {
    let connection = null;

    try {
        console.log('🔄 Initialisation de la base de données...');

        // Créer une connexion directe (pas via le pool)
        connection = await mysql.createConnection({
            ...config.db,
            // Augmenter les timeouts pour les opérations d'initialisation
            acquireTimeout: 60000,
            timeout: 60000,
        });

        // Vérifier si les tables existent
        const authorsExists = await tableExists(connection, 'Authors');
        const shelvesExists = await tableExists(connection, 'Shelves');
        const booksExists = await tableExists(connection, 'Books');

        if (!authorsExists || !shelvesExists || !booksExists) {
            console.log('🏗️ Tables manquantes détectées, création en cours...');
            await createTables(connection);
            await insertSampleData(connection);
            console.log('✅ Base de données initialisée avec succès!');
        } else {
            console.log("✅ Toutes les tables existent déjà, pas d'initialisation nécessaire");
        }

        return true;
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de la base de données:", error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Attend que la base de données soit disponible avant de tenter l'initialisation
 */
async function waitForDatabase(maxRetries = 30, delayMs = 2000) {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const connection = await mysql.createConnection({
                ...config.db,
                connectTimeout: 5000,
            });
            await connection.end();
            console.log('✅ Connexion à la base de données établie');
            return true;
        } catch (error) {
            retries++;
            console.log(`⏳ Tentative de connexion ${retries}/${maxRetries} à la base de données...`);

            if (retries >= maxRetries) {
                console.error('❌ Impossible de se connecter à la base de données après', maxRetries, 'tentatives');
                throw new Error('Database connection timeout', error);
            }

            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

export default {
    initializeDatabase,
    waitForDatabase,
};

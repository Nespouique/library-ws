import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des tailles d'images depuis le config
const JACKET_SIZES = config.images.jacketSizes;

// Chemin de base pour les uploads
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const JACKETS_DIR = path.join(UPLOADS_DIR, 'jackets');

/**
 * Traite et sauvegarde une image de jacket en différentes tailles
 * @param {Buffer} imageBuffer - Buffer de l'image originale
 * @param {string} filename - Nom du fichier (sans extension)
 * @returns {Object} - Informations sur les fichiers créés
 */
async function processJacketImage(imageBuffer, filename) {
    try {
        // S'assurer que tous les dossiers existent
        await ensureDirectoriesExist();

        // Sauvegarder l'original
        const originalPath = path.join(JACKETS_DIR, 'original', `${filename}.jpg`);
        await sharp(imageBuffer).jpeg({ quality: 100 }).toFile(originalPath);

        const processedSizes = {};

        // Traiter chaque taille
        for (const [sizeName, config] of Object.entries(JACKET_SIZES)) {
            const outputPath = path.join(JACKETS_DIR, sizeName, `${filename}.${config.format}`);

            await sharp(imageBuffer)
                .resize(config.width, config.height, {
                    fit: 'cover',
                    position: 'center',
                })
                .webp({ quality: config.quality })
                .toFile(outputPath);

            processedSizes[sizeName] = {
                path: outputPath,
                width: config.width,
                height: config.height,
                format: config.format,
                url: `/books/jacket/${filename}/${sizeName}`,
            };
        }

        return {
            filename,
            original: {
                path: originalPath,
                url: `/books/jacket/${filename}/original`,
            },
            sizes: processedSizes,
        };
    } catch (error) {
        throw new Error(`Erreur lors du traitement de l'image: ${error.message}`);
    }
}

/**
 * Récupère une image de jacket dans la taille demandée
 * @param {string} filename - Nom du fichier (sans extension)
 * @param {string} size - Taille demandée (small, medium, large, original)
 * @returns {Object} - Informations sur le fichier ou null si non trouvé
 */
async function getJacketImage(filename, size = 'medium') {
    try {
        let filePath;
        let contentType;

        if (size === 'original') {
            filePath = path.join(JACKETS_DIR, 'original', `${filename}.jpg`);
            contentType = 'image/jpeg';
        } else if (JACKET_SIZES[size]) {
            filePath = path.join(JACKETS_DIR, size, `${filename}.webp`);
            contentType = 'image/webp';
        } else {
            throw new Error(`Taille non supportée: ${size}`);
        }

        // Vérifier si le fichier existe
        try {
            await fs.access(filePath);
        } catch {
            return null;
        }

        return {
            filePath,
            contentType,
            size,
        };
    } catch (error) {
        throw new Error(`Erreur lors de la récupération de l'image: ${error.message}`);
    }
}

/**
 * Supprime toutes les versions d'une image de jacket
 * @param {string} filename - Nom du fichier (sans extension)
 * @returns {boolean} - True si supprimé avec succès
 */
async function deleteJacketImage(filename) {
    try {
        const filesToDelete = [];

        // Ajouter l'original
        filesToDelete.push(path.join(JACKETS_DIR, 'original', `${filename}.jpg`));

        // Ajouter toutes les tailles
        for (const sizeName of Object.keys(JACKET_SIZES)) {
            filesToDelete.push(path.join(JACKETS_DIR, sizeName, `${filename}.webp`));
        }

        // Supprimer tous les fichiers
        const deletePromises = filesToDelete.map(async filePath => {
            try {
                await fs.unlink(filePath);
            } catch (error) {
                // Ignorer si le fichier n'existe pas
                if (error.code !== 'ENOENT') {
                    console.warn(`Impossible de supprimer ${filePath}:`, error.message);
                }
            }
        });

        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        throw new Error(`Erreur lors de la suppression de l'image: ${error.message}`);
    }
}

/**
 * Valide qu'un fichier est une image supportée
 * @param {Object} file - Objet file de multer
 * @returns {boolean} - True si valide
 */
function validateImageFile(file) {
    const allowedMimeTypes = config.images.allowedMimeTypes;
    const maxSize = config.images.maxFileSize;

    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Format de fichier non supporté. Utilisez JPG, PNG ou WebP.');
    }

    if (file.size > maxSize) {
        throw new Error('Fichier trop volumineux. Taille maximum: 10MB.');
    }

    return true;
}

/**
 * Génère un nom de fichier unique basé sur l'UUID du livre
 * @param {string} bookId - UUID du livre
 * @returns {string} - Nom de fichier unique
 */
function generateJacketFilename(bookId) {
    return `jacket_${bookId}_${Date.now()}`;
}

/**
 * S'assure que tous les dossiers nécessaires existent
 */
async function ensureDirectoriesExist() {
    try {
        // Créer le dossier uploads s'il n'existe pas
        await fs.mkdir(UPLOADS_DIR, { recursive: true });

        // Créer le dossier jackets s'il n'existe pas
        await fs.mkdir(JACKETS_DIR, { recursive: true });

        // Créer le dossier original
        await fs.mkdir(path.join(JACKETS_DIR, 'original'), { recursive: true });

        // Créer tous les dossiers de tailles
        for (const sizeName of Object.keys(JACKET_SIZES)) {
            await fs.mkdir(path.join(JACKETS_DIR, sizeName), { recursive: true });
        }
    } catch (error) {
        console.error('Erreur lors de la création des dossiers:', error);
        throw error;
    }
}

export { processJacketImage, getJacketImage, deleteJacketImage, validateImageFile, generateJacketFilename, JACKET_SIZES, ensureDirectoriesExist };

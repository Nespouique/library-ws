import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le dossier kubes-svg
const KUBES_DIR = path.join(__dirname, '../uploads/kubes-svg');
const KUBES_FILE_PATH = path.join(KUBES_DIR, 'kubes.svg');

/**
 * S'assure que le dossier kubes-svg existe
 * @returns {Promise<void>}
 */
async function ensureKubesDirectoryExists() {
    try {
        await fs.mkdir(KUBES_DIR, { recursive: true });
    } catch (error) {
        // Le dossier existe déjà ou erreur de création
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

/**
 * Vérifie si le fichier kubes.svg existe
 * @returns {Promise<boolean>} - True si le fichier existe
 */
async function kubesFileExists() {
    try {
        await ensureKubesDirectoryExists();
        await fs.access(KUBES_FILE_PATH);
        return true;
    } catch {
        return false;
    }
}

/**
 * Valide qu'un fichier est bien un SVG
 * @param {string} content - Contenu du fichier
 * @throws {Error} - Si le fichier n'est pas un SVG valide
 */
function validateSvgContent(content) {
    if (!content || typeof content !== 'string') {
        throw new Error('Le contenu du fichier est invalide');
    }

    const trimmedContent = content.trim();
    if (!trimmedContent.startsWith('<svg') && !trimmedContent.startsWith('<?xml')) {
        throw new Error("Le fichier n'est pas un SVG valide");
    }

    if (!trimmedContent.includes('<svg')) {
        throw new Error("Le fichier n'est pas un SVG valide");
    }
}

/**
 * Crée un nouveau fichier kubes.svg
 * @param {string} svgContent - Contenu SVG
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function createKubesFile(svgContent) {
    if (await kubesFileExists()) {
        const error = new Error('Le fichier kubes.svg existe déjà');
        error.statusCode = 409;
        throw error;
    }

    validateSvgContent(svgContent);

    // S'assurer que le dossier existe
    await ensureKubesDirectoryExists();

    // Écrire le fichier
    await fs.writeFile(KUBES_FILE_PATH, svgContent, 'utf8');

    return { message: 'Fichier kubes.svg créé avec succès' };
}

/**
 * Met à jour le fichier kubes.svg existant
 * @param {string} svgContent - Nouveau contenu SVG
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function updateKubesFile(svgContent) {
    if (!(await kubesFileExists())) {
        const error = new Error("Le fichier kubes.svg n'existe pas encore");
        error.statusCode = 404;
        throw error;
    }

    validateSvgContent(svgContent);

    // S'assurer que le dossier existe (par sécurité)
    await ensureKubesDirectoryExists();

    // Remplacer le contenu du fichier
    await fs.writeFile(KUBES_FILE_PATH, svgContent, 'utf8');

    return { message: 'Fichier kubes.svg mis à jour avec succès' };
}

/**
 * Récupère le contenu du fichier kubes.svg
 * @returns {Promise<string>} - Contenu du fichier SVG
 */
async function getKubesFile() {
    if (!(await kubesFileExists())) {
        const error = new Error("Le fichier kubes.svg n'existe pas encore");
        error.statusCode = 404;
        throw error;
    }

    // S'assurer que le dossier existe (par sécurité)
    await ensureKubesDirectoryExists();

    return await fs.readFile(KUBES_FILE_PATH, 'utf8');
}

/**
 * Supprime le fichier kubes.svg
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function deleteKubesFile() {
    if (!(await kubesFileExists())) {
        const error = new Error("Le fichier kubes.svg n'existe pas encore");
        error.statusCode = 404;
        throw error;
    }

    // S'assurer que le dossier existe (par sécurité)
    await ensureKubesDirectoryExists();

    await fs.unlink(KUBES_FILE_PATH);

    return { message: 'Fichier kubes.svg supprimé avec succès' };
}

export default {
    createKubesFile,
    updateKubesFile,
    getKubesFile,
    deleteKubesFile,
    kubesFileExists,
};

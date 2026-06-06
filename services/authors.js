import db from './db-pool.js';
import { emptyOrRows } from '../utils/helper.js';
import { v4 as uuidv4 } from 'uuid';

function normalizeName(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function validateAuthorNames(firstName, lastName) {
    if (!firstName && !lastName) {
        const error = new Error('At least one of firstName or lastName is required');
        error.statusCode = 400;
        throw error;
    }
}

async function getMultiple() {
    const rows = await db.query(`SELECT id, firstName, lastName FROM Authors`);
    return emptyOrRows(rows);
}

async function getById(id) {
    const rows = await db.query('SELECT id, firstName, lastName FROM Authors WHERE id = ?', [id]);

    return rows[0] || null;
}

async function create(author) {
    const normalizedAuthor = {
        firstName: normalizeName(author?.firstName),
        lastName: normalizeName(author?.lastName),
    };

    validateAuthorNames(normalizedAuthor.firstName, normalizedAuthor.lastName);

    // Vérifie qu'un auteur avec le même prénom et nom n'existe pas déjà
    const existing = await db.query('SELECT id FROM Authors WHERE firstName = ? AND lastName = ?', [normalizedAuthor.firstName, normalizedAuthor.lastName]);
    if (existing.length) {
        const error = new Error('Author already exists');
        error.statusCode = 409;
        throw error;
    }
    const authorId = uuidv4();
    await db.query('INSERT INTO Authors (id, firstName, lastName) VALUES (?, ?, ?)', [authorId, normalizedAuthor.firstName, normalizedAuthor.lastName]);

    return { id: authorId, ...normalizedAuthor };
}

async function update(id, author) {
    const normalizedAuthor = {
        firstName: normalizeName(author?.firstName),
        lastName: normalizeName(author?.lastName),
    };

    // Validation PUT : au moins un des deux champs doit être renseigné
    validateAuthorNames(normalizedAuthor.firstName, normalizedAuthor.lastName);

    // Vérifie qu'aucun autre auteur n'a déjà ce prénom et nom
    const existing = await db.query('SELECT id FROM Authors WHERE firstName = ? AND lastName = ? AND id != ?', [normalizedAuthor.firstName, normalizedAuthor.lastName, id]);
    if (existing.length) {
        const error = new Error('Author already exists');
        error.statusCode = 409;
        throw error;
    }
    const result = await db.query('UPDATE Authors SET firstName=?, lastName=? WHERE id=?', [normalizedAuthor.firstName, normalizedAuthor.lastName, id]);

    return result.affectedRows > 0;
}

async function updatePartial(id, updates) {
    // Récupère l'auteur existant d'abord
    const current = await getById(id);
    if (!current) {
        return false;
    }

    // Construit dynamiquement la requête UPDATE
    const fields = [];
    const values = [];

    if (updates.firstName !== undefined) {
        fields.push('firstName = ?');
        values.push(normalizeName(updates.firstName));
    }

    if (updates.lastName !== undefined) {
        fields.push('lastName = ?');
        values.push(normalizeName(updates.lastName));
    }

    // Si aucun champ à mettre à jour
    if (fields.length === 0) {
        return true; // Rien à faire, considéré comme succès
    }

    // Vérifie les conflits de noms si nécessaire
    const finalFirstName = updates.firstName !== undefined ? normalizeName(updates.firstName) : normalizeName(current.firstName);
    const finalLastName = updates.lastName !== undefined ? normalizeName(updates.lastName) : normalizeName(current.lastName);

    validateAuthorNames(finalFirstName, finalLastName);

    const existing = await db.query('SELECT id FROM Authors WHERE firstName = ? AND lastName = ? AND id != ?', [finalFirstName, finalLastName, id]);
    if (existing.length) {
        const error = new Error('Author already exists');
        error.statusCode = 409;
        throw error;
    }

    // Exécute la mise à jour
    values.push(id);
    const query = `UPDATE Authors SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.query(query, values);

    return result.affectedRows > 0;
}

async function remove(id) {
    // Check if author is referenced by any books
    const books = await db.query('SELECT COUNT(*) as count FROM Books WHERE author = ?', [id]);

    if (books[0].count > 0) {
        throw new Error('Cannot delete author: it has books');
    }

    const result = await db.query('DELETE FROM Authors WHERE id=?', [id]);

    return result.affectedRows > 0;
}

export default {
    getMultiple,
    getById,
    create,
    update,
    updatePartial,
    remove,
};

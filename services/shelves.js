import db from './db-pool.js';
import { getOffset, emptyOrRows } from '../utils/helper.js';
import config from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';

async function getMultiple(page = 1) {
    const offset = getOffset(page, config.listPerPage);
    const rows = await db.query('SELECT id, name FROM Shelves LIMIT ?,?', [offset, config.listPerPage]);
    const data = emptyOrRows(rows);
    const meta = { page };

    return { data, meta };
}

async function getById(id) {
    const rows = await db.query('SELECT id, name FROM Shelves WHERE id = ?', [id]);

    return rows[0] || null;
}

async function create(shelf) {
    // Validate required field
    if (!shelf.name || shelf.name.trim() === '') {
        const error = new Error('Shelf name is required');
        error.statusCode = 400;
        throw error;
    }

    const shelfId = uuidv4();
    await db.query('INSERT INTO Shelves (id, name) VALUES (?, ?)', [shelfId, shelf.name.trim()]);

    return { id: shelfId, name: shelf.name.trim() };
}

async function update(id, shelf) {
    // Validate required field
    if (!shelf.name || shelf.name.trim() === '') {
        const error = new Error('Shelf name is required');
        error.statusCode = 400;
        throw error;
    }

    const result = await db.query('UPDATE Shelves SET name = ? WHERE id = ?', [shelf.name.trim(), id]);

    return result.affectedRows > 0;
}

async function updatePartial(id, updates) {
    const current = await getById(id);
    if (!current) {
        return false;
    }

    // Only update if name is provided
    if (updates.name !== undefined) {
        if (!updates.name || updates.name.trim() === '') {
            const error = new Error('Shelf name cannot be empty');
            error.statusCode = 400;
            throw error;
        }
        const result = await db.query('UPDATE Shelves SET name = ? WHERE id = ?', [updates.name.trim(), id]);
        return result.affectedRows > 0;
    }

    // If no valid updates, return true (no-op)
    return true;
}

async function remove(id) {
    // Check if shelf is referenced by any books
    const books = await db.query('SELECT COUNT(*) as count FROM Books WHERE shelf = ?', [id]);

    if (books[0].count > 0) {
        throw new Error('Cannot delete shelf: it contains books');
    }

    const result = await db.query('DELETE FROM Shelves WHERE id = ?', [id]);

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

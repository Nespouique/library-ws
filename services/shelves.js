import db from './db-pool.js';
import { emptyOrRows } from '../utils/helper.js';
import { v4 as uuidv4 } from 'uuid';

async function getMultiple() {
    const rows = await db.query(`SELECT id, name, location FROM Shelves`);
    return emptyOrRows(rows);
}

async function getById(id) {
    const rows = await db.query('SELECT id, name, location FROM Shelves WHERE id = ?', [id]);

    return rows[0] || null;
}

async function getByName(name) {
    const rows = await db.query('SELECT id, name, location FROM Shelves WHERE name = ?', [name.trim()]);
    return rows[0] || null;
}

async function create(shelf) {
    // Validate required field
    if (!shelf.name || shelf.name.trim() === '') {
        const error = new Error('Shelf name is required');
        error.statusCode = 400;
        throw error;
    }

    // Check if a shelf with the same name already exists
    const existingShelf = await getByName(shelf.name);
    if (existingShelf) {
        const error = new Error('Shelf already exists');
        error.statusCode = 409;
        throw error;
    }

    const shelfId = uuidv4();
    await db.query('INSERT INTO Shelves (id, name, location) VALUES (?, ?, ?)', [shelfId, shelf.name.trim(), shelf.location || null]);

    return { id: shelfId, name: shelf.name.trim(), location: shelf.location || null };
}

async function update(id, shelf) {
    // Validate required field
    if (!shelf.name || shelf.name.trim() === '') {
        const error = new Error('Shelf name is required');
        error.statusCode = 400;
        throw error;
    }

    // Check if a shelf with the same name already exists (excluding current shelf)
    const existingShelf = await getByName(shelf.name);
    if (existingShelf && existingShelf.id !== id) {
        const error = new Error('Shelf already exists');
        error.statusCode = 409;
        throw error;
    }

    const result = await db.query('UPDATE Shelves SET name = ?, location = ? WHERE id = ?', [shelf.name.trim(), shelf.location || null, id]);

    return result.affectedRows > 0;
}

async function updatePartial(id, updates) {
    const current = await getById(id);
    if (!current) {
        return false;
    }

    // Build the update query dynamically
    const updateFields = [];
    const updateValues = [];

    // Only update if name is provided
    if (updates.name !== undefined) {
        if (!updates.name || updates.name.trim() === '') {
            const error = new Error('Shelf name cannot be empty');
            error.statusCode = 400;
            throw error;
        }

        // Check if a shelf with the same name already exists (excluding current shelf)
        const existingShelf = await getByName(updates.name);
        if (existingShelf && existingShelf.id !== id) {
            const error = new Error('Shelf already exists');
            error.statusCode = 409;
            throw error;
        }

        updateFields.push('name = ?');
        updateValues.push(updates.name.trim());
    }

    // Handle location updates (can be null)
    if (updates.location !== undefined) {
        updateFields.push('location = ?');
        updateValues.push(updates.location || null);
    }

    // If no valid updates, return true (no-op)
    if (updateFields.length === 0) {
        return true;
    }

    updateValues.push(id);
    const result = await db.query(`UPDATE Shelves SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    return result.affectedRows > 0;
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
    getByName,
    create,
    update,
    updatePartial,
    remove,
};

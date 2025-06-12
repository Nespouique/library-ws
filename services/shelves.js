import db from './db-pool.js';
import { getOffset } from '../utils/helper.js';
import { v4 as uuidv4 } from 'uuid';

async function getMultiple(page = 1) {
    const listPerPage = 10;
    const offset = getOffset(page, listPerPage);
    const rows = await db.query('SELECT id FROM Shelves LIMIT ?,?', [
        offset,
        listPerPage,
    ]);

    const data = rows;
    const meta = { page };

    return {
        data,
        meta,
    };
}

async function getById(id) {
    const rows = await db.query('SELECT id FROM Shelves WHERE id = ?', [id]);

    return rows.length > 0 ? rows[0] : null;
}

async function create(shelf) {
    // For now, we only insert with auto-generated ID
    // Future: could add properties like name, location, wled_segment, etc.
    const shelfId = uuidv4();
    const result = await db.query('INSERT INTO Shelves (id) VALUES (?)', [
        shelfId,
    ]);

    return { id: shelfId, ...shelf };
}

async function update(id, _shelf) {
    // For now, there's nothing to update since we only have ID
    // Future: could update properties like name, location, wled_segment, etc.
    const result = await db.query(
        'UPDATE Shelves SET id = ? WHERE id = ?',
        [id, id] // Dummy update to check if shelf exists
    );

    return result.affectedRows > 0;
}

async function remove(id) {
    // Check if shelf is referenced by any books
    const books = await db.query(
        'SELECT COUNT(*) as count FROM Books WHERE shelf = ?',
        [id]
    );

    if (books[0].count > 0) {
        throw new Error('Cannot delete shelf: it contains books');
    }

    const result = await db.query('DELETE FROM Shelves WHERE id = ?', [id]);

    let message = 'Error in deleting shelf';

    if (result.affectedRows) {
        message = 'Shelf deleted successfully';
    }

    return { message };
}

export default {
    getMultiple,
    getById,
    create,
    update,
    remove,
};

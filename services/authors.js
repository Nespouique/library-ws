import db from './db-pool.js';
import { getOffset, emptyOrRows } from '../utils/helper.js';
import config from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';

async function getMultiple(page = 1) {
    const offset = getOffset(page, config.listPerPage);
    const rows = await db.query(
        'SELECT id, firstName, lastName FROM Authors LIMIT ?, ?',
        [offset, config.listPerPage]
    );
    const data = emptyOrRows(rows);
    const meta = { page };
    return { data, meta };
}

async function getById(id) {
    const rows = await db.query(
        'SELECT id, firstName, lastName FROM Authors WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

async function create(author) {
    // Vérifie qu'un auteur avec le même prénom et nom n'existe pas déjà
    const existing = await db.query(
        'SELECT id FROM Authors WHERE firstName = ? AND lastName = ?',
        [author.firstName, author.lastName]
    );
    if (existing.length) {
        const error = new Error('Author already exists');
        error.statusCode = 409;
        throw error;
    }
    const authorId = uuidv4();
    const result = await db.query(
        'INSERT INTO Authors (id, firstName, lastName) VALUES (?, ?, ?)',
        [authorId, author.firstName, author.lastName]
    );
    
    return { id: result.insertId, ...author };
}

async function update(id, author) {
    // Vérifie qu'aucun autre auteur n'a déjà ce prénom et nom
    const existing = await db.query(
        'SELECT id FROM Authors WHERE firstName = ? AND lastName = ? AND id != ?',
        [author.firstName, author.lastName, id]
    );
    if (existing.length) {
        const error = new Error('Another author with this name already exists');
        error.statusCode = 409;
        throw error;
    }
    const result = await db.query(
        'UPDATE Authors SET firstName=?, lastName=? WHERE id=?',
        [author.firstName, author.lastName, id]
    );
    return result.affectedRows > 0;
}

async function remove(id) {
    const result = await db.query('DELETE FROM Authors WHERE id=?', [id]);
    return result.affectedRows > 0;
}

export default { getMultiple, getById, create, update, remove };

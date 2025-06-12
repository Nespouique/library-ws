import db from './db-pool.js';
import { getOffset, emptyOrRows } from '../utils/helper.js';
import config from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';

async function getMultiple(page = 1) {
    const offset = getOffset(page, config.listPerPage);
    const rows = await db.query('SELECT B.id, B.title, DATE_FORMAT(B.date, "%Y-%m-%d") as date, CONCAT(A.firstName, " ", A.lastName) as author, B.description, B.isbn, B.jacket FROM Books B JOIN Authors A ON A.id = B.author LIMIT ?, ?', [offset, config.listPerPage]);
    const data = emptyOrRows(rows);
    const meta = { page };

    return { data, meta };
}

async function getById(id) {
    const rows = await db.query('SELECT B.id, B.title, DATE_FORMAT(B.date, "%Y-%m-%d") as date, CONCAT(A.firstName, " ", A.lastName) as author, B.description, B.isbn, B.jacket FROM Books B JOIN Authors A ON A.id = B.author WHERE B.id = ?', [id]);

    return rows[0] || null;
}

async function create(book) {
    // Vérifie que l'auteur existe
    const authorRows = await db.query('SELECT id FROM Authors WHERE id = ?', [book.author]);
    if (!authorRows.length) {
        const error = new Error('Author does not exist');
        error.statusCode = 400;
        throw error;
    }
    // Vérifie qu'un livre avec le même ISBN n'existe pas déjà
    const existingBook = await db.query('SELECT id FROM Books WHERE isbn = ?', [book.isbn]);
    if (existingBook.length) {
        const error = new Error('Book with this ISBN already exists');
        error.statusCode = 409;
        throw error;
    }
    const bookId = uuidv4();
    await db.query('INSERT INTO Books (id, title, date, author, description, isbn, jacket, shelf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [bookId, book.title, book.date, book.author, book.description, book.isbn, book.jacket, book.shelf || null]);

    return { id: bookId, ...book };
}

async function update(id, book) {
    // Vérifie que l'auteur existe
    const authorRows = await db.query('SELECT id FROM Authors WHERE id = ?', [book.author]);
    if (!authorRows.length) {
        const error = new Error('Author does not exist');
        error.statusCode = 400;
        throw error;
    }
    const result = await db.query('UPDATE Books SET title=?, date=?, author=?, description=?, isbn=?, jacket=? WHERE id=?', [book.title, book.date, book.author, book.description, book.isbn, book.jacket, id]);

    return result.affectedRows > 0;
}

async function remove(id) {
    const result = await db.query('DELETE FROM Books WHERE id = ?', [id]);

    return result.affectedRows > 0;
}

export default {
    getMultiple,
    getById,
    create,
    update,
    remove,
};

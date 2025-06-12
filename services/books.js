import db from './db.js';
import { getOffset, emptyOrRows } from '../utils/helper.js';
import config from '../config/config.js';

async function getMultiple(page = 1) {
    const offset = getOffset(page, config.listPerPage);
    const rows = await db.query(
        `SELECT B.id, B.title, B.date, CONCAT(A.firstName, ' ', A.lastName) as author, B.description, B.isbn, B.jacket
         FROM Books B JOIN Authors A ON A.id = B.author LIMIT ?, ?`,
        [offset, config.listPerPage]
    );
    const data = emptyOrRows(rows);
    const meta = { page };
    return { data, meta };
}

async function getById(id) {
    const rows = await db.query(
        `SELECT B.id, B.title, B.date, CONCAT(A.firstName, ' ', A.lastName) as author, B.description, B.isbn, B.jacket
         FROM Books B JOIN Authors A ON A.id = B.author WHERE B.id = ?`, [id]
    );
    return rows[0] || null;
}

async function create(book) {
    const result = await db.query(
        `INSERT INTO Books (title, date, author, description, isbn, jacket) VALUES (?, ?, ?, ?, ?, ?)` ,
        [book.title, book.date, book.author, book.description, book.isbn, book.jacket]
    );
    return { id: result.insertId, ...book };
}

async function update(id, book) {
    const result = await db.query(
        `UPDATE Books SET title=?, date=?, author=?, description=?, isbn=?, jacket=? WHERE id=?`,
        [book.title, book.date, book.author, book.description, book.isbn, book.jacket, id]
    );
    return result.affectedRows > 0;
}

async function remove(id) {
    const result = await db.query(
        `DELETE FROM Books WHERE id=?`, [id]
    );
    return result.affectedRows > 0;
}

export default { getMultiple, getById, create, update, remove };
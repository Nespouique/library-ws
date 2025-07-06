import db from './db-pool.js';
import { emptyOrRows } from '../utils/helper.js';
import { v4 as uuidv4 } from 'uuid';

async function getMultiple() {
    const rows = await db.query(`SELECT id, title, DATE_FORMAT(date, "%Y-%m-%d") as date, author, description, isbn, jacket, shelf FROM Books`);

    return emptyOrRows(rows);
}

async function getById(id) {
    const rows = await db.query('SELECT id, title, DATE_FORMAT(date, "%Y-%m-%d") as date, author, description, isbn, jacket, shelf FROM Books WHERE id = ?', [id]);

    if (!rows[0]) {
        return null;
    }

    return rows[0];
}

async function create(book) {
    // Extract author ID whether it's a string or an object with id property
    const authorId = typeof book.author === 'string' ? book.author : book.author?.id;

    if (!authorId) {
        const error = new Error('Author ID is required');
        error.statusCode = 400;
        throw error;
    }

    // Vérifie que l'auteur existe
    const authorRows = await db.query('SELECT id FROM Authors WHERE id = ?', [authorId]);
    if (!authorRows.length) {
        const error = new Error('Author does not exist');
        error.statusCode = 400;
        throw error;
    }
    // Vérifie qu'un livre avec le même ISBN n'existe pas déjà
    const existingBook = await db.query('SELECT id FROM Books WHERE isbn = ?', [book.isbn]);
    if (existingBook.length) {
        const error = new Error('Book/ISBN already exists');
        error.statusCode = 409;
        throw error;
    }
    const bookId = uuidv4();
    await db.query('INSERT INTO Books (id, title, date, author, description, isbn, jacket, shelf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [bookId, book.title, book.date, authorId, book.description, book.isbn, book.jacket, book.shelf || null]);

    // Return the created book in the same format as getById
    return await getById(bookId);
}

async function update(id, book) {
    // Extract author ID whether it's a string or an object with id property
    const authorId = typeof book.author === 'string' ? book.author : book.author?.id;

    // Validation PUT : tous les champs requis doivent être fournis
    if (!book.title || !authorId || !book.isbn) {
        const error = new Error('PUT requires complete object: title, author, and isbn are required');
        error.statusCode = 400;
        throw error;
    }

    // Le champ jacket n'est plus modifiable via cette route
    if (book.jacket !== undefined) {
        const error = new Error('Jacket field is read-only. Use /books/{id}/jacket endpoint to manage jacket images');
        error.statusCode = 400;
        throw error;
    }

    // Vérifie que l'auteur existe
    const authorRows = await db.query('SELECT id FROM Authors WHERE id = ?', [authorId]);
    if (!authorRows.length) {
        const error = new Error('Author does not exist');
        error.statusCode = 400;
        throw error;
    }

    // Vérifie qu'aucun autre livre n'a le même ISBN (exclut le livre actuel)
    const existing = await db.query('SELECT id FROM Books WHERE isbn = ? AND id != ?', [book.isbn, id]);
    if (existing.length) {
        const error = new Error('Book/ISBN already exists');
        error.statusCode = 409;
        throw error;
    }

    // Ne met à jour que les champs autorisés (sans jacket)
    const result = await db.query('UPDATE Books SET title=?, date=?, author=?, description=?, isbn=?, shelf=? WHERE id=?', [book.title, book.date, authorId, book.description, book.isbn, book.shelf || null, id]);

    return result.affectedRows > 0;
}

async function updatePartial(id, updates) {
    // Récupère le livre existant d'abord
    const current = await getById(id);
    if (!current) {
        return false;
    }

    // Construit dynamiquement la requête UPDATE
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
    }

    if (updates.date !== undefined) {
        fields.push('date = ?');
        values.push(updates.date);
    }

    if (updates.author !== undefined) {
        // Extract author ID whether it's a string or an object with id property
        const authorId = typeof updates.author === 'string' ? updates.author : updates.author?.id;

        if (!authorId) {
            const error = new Error('Author ID is required');
            error.statusCode = 400;
            throw error;
        }

        // Vérifie que l'auteur existe
        const authorRows = await db.query('SELECT id FROM Authors WHERE id = ?', [authorId]);
        if (!authorRows.length) {
            const error = new Error('Author does not exist');
            error.statusCode = 400;
            throw error;
        }
        fields.push('author = ?');
        values.push(authorId);
    }

    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }
    if (updates.isbn !== undefined) {
        // Vérifie qu'aucun autre livre n'a le même ISBN
        const existing = await db.query('SELECT id FROM Books WHERE isbn = ? AND id != ?', [updates.isbn, id]);
        if (existing.length) {
            const error = new Error('Book/ISBN already exists');
            error.statusCode = 409;
            throw error;
        }
        fields.push('isbn = ?');
        values.push(updates.isbn);
    }

    // Le champ jacket n'est plus modifiable via cette route
    if (updates.jacket !== undefined) {
        const error = new Error('Jacket field is read-only. Use /books/{id}/jacket endpoint to manage jacket images');
        error.statusCode = 400;
        throw error;
    }

    if (updates.shelf !== undefined) {
        fields.push('shelf = ?');
        values.push(updates.shelf);
    }

    // Si aucun champ à mettre à jour
    if (fields.length === 0) {
        return true; // Rien à faire, considéré comme succès
    }

    // Exécute la mise à jour
    values.push(id);
    const query = `UPDATE Books SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.query(query, values);

    return result.affectedRows > 0;
}

async function remove(id) {
    const result = await db.query('DELETE FROM Books WHERE id = ?', [id]);

    return result.affectedRows > 0;
}

async function updateJacket(id, jacketFilename) {
    const result = await db.query('UPDATE Books SET jacket = ? WHERE id = ?', [jacketFilename, id]);
    return result.affectedRows > 0;
}

export default {
    getMultiple,
    getById,
    create,
    update,
    updatePartial,
    remove,
    updateJacket,
};

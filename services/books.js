import db from './db-pool.js';
import { emptyOrRows } from '../utils/helper.js';
import { v4 as uuidv4 } from 'uuid';
import { deleteJacketImage } from './images.js';

async function getMultiple() {
    const rows = await db.query(`SELECT id, title, DATE_FORMAT(date, "%Y-%m-%d") as date, author, description, isbn, jacket, lentTo, DATE_FORMAT(lentAt, "%Y-%m-%d") as lentAt, shelf FROM Books`);

    return emptyOrRows(rows);
}

async function getById(id) {
    const rows = await db.query('SELECT id, title, DATE_FORMAT(date, "%Y-%m-%d") as date, author, description, isbn, jacket, lentTo, DATE_FORMAT(lentAt, "%Y-%m-%d") as lentAt, shelf FROM Books WHERE id = ?', [id]);

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

    // Normalise l'ISBN : chaîne vide → null
    const isbn = book.isbn || null;

    // Vérifie qu'un livre avec le même ISBN n'existe pas déjà (seulement si ISBN fourni)
    if (isbn) {
        const existingBook = await db.query('SELECT id FROM Books WHERE isbn = ?', [isbn]);
        if (existingBook.length) {
            const error = new Error('Book/ISBN already exists');
            error.statusCode = 409;
            throw error;
        }
    }

    const bookId = uuidv4();
    await db.query('INSERT INTO Books (id, title, date, author, description, isbn, jacket, lentTo, lentAt, shelf) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [bookId, book.title, book.date, authorId, book.description, isbn, book.jacket, book.lentTo || null, book.lentAt || null, book.shelf || null]);

    // Return the created book in the same format as getById
    return await getById(bookId);
}

async function update(id, book) {
    // Extract author ID whether it's a string or an object with id property
    const authorId = typeof book.author === 'string' ? book.author : book.author?.id;

    // Validation PUT : title et author requis, isbn optionnel
    if (!book.title || !authorId) {
        const error = new Error('PUT requires complete object: title and author are required');
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

    // Normalise l'ISBN : chaîne vide → null
    const isbn = book.isbn || null;

    // Vérifie qu'aucun autre livre n'a le même ISBN (seulement si ISBN fourni)
    if (isbn) {
        const existing = await db.query('SELECT id FROM Books WHERE isbn = ? AND id != ?', [isbn, id]);
        if (existing.length) {
            const error = new Error('Book/ISBN already exists');
            error.statusCode = 409;
            throw error;
        }
    }

    // Ne met à jour que les champs autorisés (sans jacket)
    const result = await db.query('UPDATE Books SET title=?, date=?, author=?, description=?, isbn=?, shelf=?, lentTo=?, lentAt=? WHERE id=?', [book.title, book.date, authorId, book.description, isbn, book.shelf || null, book.lentTo || null, book.lentAt || null, id]);

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
        // Normalise l'ISBN : chaîne vide → null
        const newIsbn = updates.isbn || null;
        // Vérifie qu'aucun autre livre n'a le même ISBN (seulement si ISBN fourni)
        if (newIsbn) {
            const existing = await db.query('SELECT id FROM Books WHERE isbn = ? AND id != ?', [newIsbn, id]);
            if (existing.length) {
                const error = new Error('Book/ISBN already exists');
                error.statusCode = 409;
                throw error;
            }
        }
        fields.push('isbn = ?');
        values.push(newIsbn);
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

    if (updates.lentTo !== undefined) {
        fields.push('lentTo = ?');
        values.push(updates.lentTo);
    }

    if (updates.lentAt !== undefined) {
        fields.push('lentAt = ?');
        values.push(updates.lentAt);
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
    // Récupérer le livre avant suppression pour connaître son jacket
    const book = await getById(id);
    if (!book) {
        return false;
    }

    // Supprimer les fichiers de jacket si ils existent
    if (book.jacket) {
        try {
            await deleteJacketImage(book.jacket);
            console.log(`Fichiers de jacket supprimés pour le livre ${id}: ${book.jacket}`);
        } catch (error) {
            // Log l'erreur mais ne pas faire échouer la suppression du livre
            console.warn(`Erreur lors de la suppression des fichiers de jacket pour le livre ${id}:`, error.message);
        }
    }

    // Supprimer l'enregistrement en base
    const result = await db.query('DELETE FROM Books WHERE id = ?', [id]);

    return result.affectedRows > 0;
}

async function updateJacket(id, jacketFilename) {
    // Récupérer l'ancien jacket avant mise à jour
    const book = await getById(id);
    if (!book) {
        return false;
    }

    // Supprimer l'ancien jacket si il existe et qu'on le remplace par un nouveau
    if (book.jacket && jacketFilename && book.jacket !== jacketFilename) {
        try {
            await deleteJacketImage(book.jacket);
            console.log(`Ancien fichier de jacket supprimé pour le livre ${id}: ${book.jacket}`);
        } catch (error) {
            // Log l'erreur mais ne pas faire échouer la mise à jour
            console.warn(`Erreur lors de la suppression de l'ancien jacket pour le livre ${id}:`, error.message);
        }
    }

    // Si on supprime le jacket (jacketFilename = null), supprimer aussi les fichiers
    if (book.jacket && jacketFilename === null) {
        try {
            await deleteJacketImage(book.jacket);
            console.log(`Fichiers de jacket supprimés pour le livre ${id}: ${book.jacket}`);
        } catch (error) {
            console.warn(`Erreur lors de la suppression des fichiers de jacket pour le livre ${id}:`, error.message);
        }
    }

    // Mettre à jour en base
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

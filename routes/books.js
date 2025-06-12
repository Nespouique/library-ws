import express from 'express';
import books from '../services/books.js';
const router = express.Router();

// GET books (paginated)
router.get('/', async function (req, res, next) {
    try {
        const result = await books.getMultiple(req.query.page);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET book by id
router.get('/:id', async function (req, res, next) {
    try {
        const book = await books.getById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json({ data: book });
    } catch (err) {
        next(err);
    }
});

// CREATE book
router.post('/', async function (req, res, next) {
    try {
        const created = await books.create(req.body);
        res.status(201).json({ data: created });
    } catch (err) {
        next(err);
    }
});

// UPDATE book
router.put('/:id', async function (req, res, next) {
    try {
        const updated = await books.update(req.params.id, req.body);
        if (!updated)
            return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book updated' });
    } catch (err) {
        next(err);
    }
});

// DELETE book
router.delete('/:id', async function (req, res, next) {
    try {
        const deleted = await books.remove(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;

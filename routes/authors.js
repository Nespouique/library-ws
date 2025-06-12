import express from 'express';
import authors from '../services/authors.js';

const router = express.Router();

// GET authors (paginated)
router.get('/', async function (req, res, next) {
    try {
        const result = await authors.getMultiple(req.query.page);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET author by id
router.get('/:id', async function (req, res, next) {
    try {
        const author = await authors.getById(req.params.id);
        if (!author)
            return res.status(404).json({ message: 'Author not found' });
        res.json({ data: author });
    } catch (err) {
        next(err);
    }
});

// CREATE author
router.post('/', async function (req, res, next) {
    try {
        const created = await authors.create(req.body);
        res.status(201).json({ data: created });
    } catch (err) {
        next(err);
    }
});

// UPDATE author
router.put('/:id', async function (req, res, next) {
    try {
        const updated = await authors.update(req.params.id, req.body);
        if (!updated)
            return res.status(404).json({ message: 'Author not found' });
        res.json({ message: 'Author updated' });
    } catch (err) {
        next(err);
    }
});

// DELETE author
router.delete('/:id', async function (req, res, next) {
    try {
        const deleted = await authors.remove(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Author not found' });
        res.json({ message: 'Author deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;

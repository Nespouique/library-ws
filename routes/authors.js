import express from 'express';
import authors from '../services/authors.js';

const router = express.Router();

/* GET authors. */
router.get('/', async function(req, res, next) {
    try {
        res.json(await authors.getMultiple(req.query.page));
    } catch (err) {
        console.error(`Error while getting authors `, err.message);
        next(err);
    }
});

export default router;
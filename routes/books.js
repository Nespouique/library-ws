import express from 'express';
import books from '../services/books.js';
const router = express.Router();

/* GET books. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await books.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting books `, err.message);
    next(err);
  }
});

export default router;
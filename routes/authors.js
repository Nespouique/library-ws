const express = require('express');
const router = express.Router();
const authors = require('../services/authors');

/* GET authors. */
router.get('/', async function(req, res, next) {
    try {
        res.json(await authors.getMultiple(req.query.page));
    } catch (err) {
        console.error(`Error while getting authors `, err.message);
        next(err);
    }
});

module.exports = router;
import express from 'express';
import authors from '../services/authors.js';
const router = express.Router();

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors with pagination
 *     description: Retrieve a paginated list of all authors in the library
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Successfully retrieved authors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAuthors'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET authors (paginated)
router.get('/', async function (req, res, next) {
    try {
        const result = await authors.getMultiple(req.query.page);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get author by UUID
 *     description: Retrieve a specific author by its UUID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author UUID
 *     responses:
 *       200:
 *         description: Successfully retrieved author
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET author by id
router.get('/:id', async function (req, res, next) {
    try {
        const author = await authors.getById(req.params.id);
        if (!author) return res.status(404).json({ message: 'Author not found' });
        res.json({ data: author });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author
 *     description: Add a new author to the library
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Author first name
 *                 example: Victor
 *               lastName:
 *                 type: string
 *                 description: Author last name
 *                 example: HUGO
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       409:
 *         description: Author already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// CREATE author
router.post('/', async function (req, res, next) {
    try {
        const created = await authors.create(req.body);
        res.status(201).json({ data: created });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Update an author
 *     description: Update an existing author's information
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Author first name
 *                 example: Victor
 *               lastName:
 *                 type: string
 *                 description: Author last name
 *                 example: HUGO
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Author updated
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Author already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// UPDATE author
router.put('/:id', async function (req, res, next) {
    try {
        const updated = await authors.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Author not found' });
        res.json({ message: 'Author updated' });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /authors/{id}:
 *   patch:
 *     summary: Partially update an author
 *     description: Update specific fields of an existing author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Author first name
 *                 example: Victor
 *               lastName:
 *                 type: string
 *                 description: Author last name
 *                 example: HUGO
 *             description: Only include fields you want to update
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Author updated
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Author already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// PATCH author (partial update)
router.patch('/:id', async function (req, res, next) {
    try {
        const updated = await authors.updatePartial(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Author not found' });
        res.json({ message: 'Author updated' });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     description: Remove an author from the library
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author UUID
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Author deleted
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// DELETE author
router.delete('/:id', async function (req, res, next) {
    try {
        const deleted = await authors.remove(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Author not found' });
        res.json({ message: 'Author deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;

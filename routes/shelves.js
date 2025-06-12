import express from 'express';
import shelves from '../services/shelves.js';

const router = express.Router();

/**
 * @swagger
 * /shelves:
 *   get:
 *     summary: Get all shelves with pagination
 *     description: Retrieve a paginated list of all shelves in the library
 *     tags: [Shelves]
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
 *         description: Successfully retrieved shelves
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedShelves'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET shelves (paginated)
router.get('/', async function (req, res, next) {
    try {
        const result = await shelves.getMultiple(req.query.page);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /shelves/{id}:
 *   get:
 *     summary: Get shelf by ID
 *     description: Retrieve a specific shelf by its ID
 *     tags: [Shelves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shelf ID
 *     responses:
 *       200:
 *         description: Successfully retrieved shelf
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shelf'
 *       404:
 *         description: Shelf not found
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
// GET shelf by id
router.get('/:id', async function (req, res, next) {
    try {
        const shelf = await shelves.getById(req.params.id);
        if (!shelf) return res.status(404).json({ message: 'Shelf not found' });
        res.json(shelf);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /shelves:
 *   post:
 *     summary: Create a new shelf
 *     description: Create a new shelf in the library system
 *     tags: [Shelves]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Empty object (shelf is created with auto-generated ID only)
 *             example: {}
 *     responses:
 *       201:
 *         description: Shelf created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shelf created successfully
 *                 id:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Bad request
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
// POST shelf
router.post('/', async function (req, res, next) {
    try {
        const result = await shelves.create(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /shelves/{id}:
 *   put:
 *     summary: Update a shelf
 *     description: Update a shelf by ID (currently no updatable fields, used for validation)
 *     tags: [Shelves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shelf ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Empty object (no updatable fields currently)
 *             example: {}
 *     responses:
 *       200:
 *         description: Shelf updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shelf updated successfully
 *       404:
 *         description: Shelf not found
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
// PUT shelf
router.put('/:id', async function (req, res, next) {
    try {
        const result = await shelves.update(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /shelves/{id}:
 *   delete:
 *     summary: Delete a shelf
 *     description: Delete a shelf by ID (only if no books are assigned to it)
 *     tags: [Shelves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shelf ID
 *     responses:
 *       200:
 *         description: Shelf deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shelf deleted successfully
 *       400:
 *         description: Cannot delete shelf (contains books)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Shelf not found
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
// DELETE shelf
router.delete('/:id', async function (req, res, next) {
    try {
        const result = await shelves.remove(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;

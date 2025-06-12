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
 *     summary: Get shelf by UUID
 *     description: Retrieve a specific shelf by its UUID
 *     tags: [Shelves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shelf UUID
 *     responses:
 *       200:
 *         description: Successfully retrieved shelf
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Shelf'
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
        res.json({ data: shelf });
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
 *             description: Empty object (shelf is created with auto-generated UUID only)
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
 *                   type: string
 *                   format: uuid
 *                   example: c3d4e5f6-g7h8-9012-cdef-123456789012
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
// CREATE shelf
router.post('/', async function (req, res, next) {
    try {
        const created = await shelves.create(req.body);
        res.status(201).json({ data: created });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /shelves/{id}:
 *   put:
 *     summary: Update a shelf
 *     description: Update a shelf by UUID (currently no updatable fields, used for validation)
 *     tags: [Shelves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shelf UUID
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
// UPDATE shelf
router.put('/:id', async function (req, res, next) {
    try {
        const updated = await shelves.update(req.params.id, req.body);
        if (!updated)
            return res.status(404).json({ message: 'Shelf not found' });
        res.json({ message: 'Shelf updated' });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /shelves/{id}:
 *   delete:
 *     summary: Delete a shelf
 *     description: Delete a shelf by UUID (only if no books are assigned to it)
 *     tags: [Shelves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shelf UUID
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
        const deleted = await shelves.remove(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Shelf not found' });
        res.json({ message: 'Shelf deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;

import express from 'express';
import shelves from '../services/shelves.js';
const router = express.Router();

/**
 * @swagger
 * /shelves:
 *   get:
 *     summary: Get all shelves
 *     description: Retrieve all shelves in the library
 *     tags: [Shelves]
 *     responses:
 *       200:
 *         description: Successfully retrieved shelves
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shelf'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET shelves
router.get('/', async function (req, res, next) {
    try {
        const result = await shelves.getMultiple();
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShelfInput'
 *     responses:
 *       201:
 *         description: Shelf created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shelf'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Shelf already exists
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
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /shelves/{id}:
 *   put:
 *     summary: Update a shelf
 *     description: Update a shelf's name by UUID
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShelfInput'
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
 *       409:
 *         description: Shelf already exists
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
        if (!updated) return res.status(404).json({ message: 'Shelf not found' });
        res.json({ message: 'Shelf updated' });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /shelves/{id}:
 *   patch:
 *     summary: Partially update a shelf
 *     description: Update specific fields of a shelf (name is optional for PATCH)
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShelfPartialInput'
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
 *                   example: Shelf updated
 *       404:
 *         description: Shelf not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Shelf already exists
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
// PATCH shelf (partial update)
router.patch('/:id', async function (req, res, next) {
    try {
        const updated = await shelves.updatePartial(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Shelf not found' });
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
        if (!deleted) return res.status(404).json({ message: 'Shelf not found' });
        res.json({ message: 'Shelf deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;

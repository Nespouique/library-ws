import express from 'express';
import books from '../services/books.js';
const router = express.Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with pagination
 *     description: Retrieve a paginated list of all books in the library
 *     tags: [Books]
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
 *         description: Successfully retrieved books
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedBooks'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET books (paginated)
router.get('/', async function (req, res, next) {
    try {
        const result = await books.getMultiple(req.query.page);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book by ID
 *     description: Retrieve a specific book by its ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Successfully retrieved book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
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

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     description: Add a new book to the library
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - isbn
 *             properties:
 *               title:
 *                 type: string
 *                 description: Book title
 *                 example: Les Misérables
 *               author:
 *                 type: integer
 *                 description: Author ID (must exist)
 *                 example: 1
 *               isbn:
 *                 type: string
 *                 description: ISBN-13 code (must be unique)
 *                 example: "9782253096337"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Publication date
 *                 example: "1998-12-02"
 *               description:
 *                 type: string
 *                 description: Book description
 *                 example: "Les Misérables is a French historical novel by Victor Hugo..."
 *               jacket:
 *                 type: string
 *                 description: Cover image URL
 *                 example: "/covers/les-miserables.jpg"
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Author does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Book with this ISBN already exists
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
// CREATE book
router.post('/', async function (req, res, next) {
    try {
        const created = await books.create(req.body);
        res.status(201).json({ data: created });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     description: Update an existing book's information
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Book title
 *                 example: Les Misérables
 *               author:
 *                 type: integer
 *                 description: Author ID (must exist)
 *                 example: 1
 *               isbn:
 *                 type: string
 *                 description: ISBN-13 code (must be unique)
 *                 example: "9782253096337"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Publication date
 *                 example: "1998-12-02"
 *               description:
 *                 type: string
 *                 description: Book description
 *                 example: "Les Misérables is a French historical novel by Victor Hugo..."
 *               jacket:
 *                 type: string
 *                 description: Cover image URL
 *                 example: "/covers/les-miserables.jpg"
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Book updated
 *       400:
 *         description: Author does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Another book with this ISBN already exists
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

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     description: Remove a book from the library
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Book deleted
 *       404:
 *         description: Book not found
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

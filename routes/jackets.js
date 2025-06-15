import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import books from '../services/books.js';
import { processJacketImage, getJacketImage, deleteJacketImage, validateImageFile, generateJacketFilename } from '../services/images.js';

const router = express.Router();

// Configuration multer pour upload en mémoire
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        try {
            validateImageFile(file);
            cb(null, true);
        } catch (error) {
            cb(new Error(error.message), false);
        }
    },
});

/**
 * @swagger
 * /books/{bookId}/jacket:
 *   post:
 *     summary: Upload a book jacket image
 *     description: Upload and process a jacket image for a specific book
 *     tags: [Books, Images]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book UUID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               jacket:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, WebP, max 10MB)
 *             required:
 *               - jacket
 *     responses:
 *       201:
 *         description: Jacket uploaded and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jacket uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     urls:
 *                       type: object
 *                       properties:
 *                         small:
 *                           type: string
 *                         medium:
 *                           type: string
 *                         large:
 *                           type: string
 *                         original:
 *                           type: string
 *       400:
 *         description: Bad request - invalid file or missing book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
// POST /books/:bookId/jacket - Upload jacket
router.post('/:bookId/jacket', upload.single('jacket'), async function (req, res, next) {
    try {
        const { bookId } = req.params;

        // Vérifier que le livre existe
        const book = await books.getById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Vérifier qu'un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Supprimer l'ancienne image si elle existe
        if (book.jacket) {
            try {
                await deleteJacketImage(book.jacket);
            } catch (error) {
                console.warn('Could not delete old jacket:', error.message);
            }
        } // Générer le nom de fichier et traiter l'image
        const filename = generateJacketFilename(bookId);
        await processJacketImage(req.file.buffer, filename);

        // Mettre à jour la base de données avec le nouveau nom de fichier
        await books.updateJacket(bookId, filename);

        // Construire les URLs de réponse
        const urls = {
            small: `/books/${bookId}/jacket/small`,
            medium: `/books/${bookId}/jacket/medium`,
            large: `/books/${bookId}/jacket/large`,
            original: `/books/${bookId}/jacket/original`,
        };

        res.status(201).json({
            message: 'Jacket uploaded successfully',
            data: {
                filename,
                urls,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /books/{bookId}/jacket/{size}:
 *   get:
 *     summary: Get book jacket image
 *     description: Retrieve a book jacket image in the specified size
 *     tags: [Books, Images]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book UUID
 *       - in: path
 *         name: size
 *         required: true
 *         schema:
 *           type: string
 *           enum: [small, medium, large, original]
 *           default: medium
 *         description: Image size
 *     responses:
 *       200:
 *         description: Jacket image
 *         content:
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Book or jacket not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
// GET /books/:bookId/jacket/:size - Get jacket image
router.get('/:bookId/jacket/:size', async function (req, res, next) {
    try {
        const { bookId, size } = req.params;

        // Vérifier que le livre existe
        const book = await books.getById(bookId);
        if (!book || !book.jacket) {
            return res.status(404).json({ message: 'Book or jacket not found' });
        }

        // Récupérer l'image dans la taille demandée
        const imageInfo = await getJacketImage(book.jacket, size);
        if (!imageInfo) {
            return res.status(404).json({ message: 'Jacket image not found' });
        }

        // Lire le fichier et l'envoyer
        const imageBuffer = await fs.readFile(imageInfo.filePath);

        res.set({
            'Content-Type': imageInfo.contentType,
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'no-cache', // Pas de cache comme demandé
        });

        res.send(imageBuffer);
    } catch (error) {
        next(error);
    }
});

// GET /books/:bookId/jacket - Get jacket image (default size: medium)
router.get('/:bookId/jacket', async function (req, res, next) {
    try {
        const { bookId } = req.params;
        const size = 'medium'; // Taille par défaut

        // Vérifier que le livre existe
        const book = await books.getById(bookId);
        if (!book || !book.jacket) {
            return res.status(404).json({ message: 'Book or jacket not found' });
        }

        // Récupérer l'image dans la taille demandée
        const imageInfo = await getJacketImage(book.jacket, size);
        if (!imageInfo) {
            return res.status(404).json({ message: 'Jacket image not found' });
        }

        // Lire le fichier et l'envoyer
        const imageBuffer = await fs.readFile(imageInfo.filePath);

        res.set({
            'Content-Type': imageInfo.contentType,
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'no-cache', // Pas de cache comme demandé
        });

        res.send(imageBuffer);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /books/{bookId}/jacket:
 *   delete:
 *     summary: Delete book jacket image
 *     description: Remove the jacket image for a specific book
 *     tags: [Books, Images]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book UUID
 *     responses:
 *       200:
 *         description: Jacket deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jacket deleted successfully
 *       404:
 *         description: Book or jacket not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
// DELETE /books/:bookId/jacket - Delete jacket
router.delete('/:bookId/jacket', async function (req, res, next) {
    try {
        const { bookId } = req.params;

        // Vérifier que le livre existe
        const book = await books.getById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (!book.jacket) {
            return res.status(404).json({ message: 'No jacket to delete' });
        }

        // Supprimer les fichiers image
        await deleteJacketImage(book.jacket);

        // Mettre à jour la base de données
        await books.updateJacket(bookId, null);

        res.json({ message: 'Jacket deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;

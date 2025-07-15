import express from 'express';
import multer from 'multer';
import kubes from '../services/kubes.js';

const router = express.Router();

// Configuration multer pour upload en mémoire
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB pour les SVG
    },
    fileFilter: (req, file, cb) => {
        // Vérifier que c'est un fichier SVG
        if (file.mimetype !== 'image/svg+xml') {
            return cb(new Error('Seuls les fichiers SVG sont acceptés'), false);
        }
        cb(null, true);
    },
});

/**
 * @swagger
 * /kubes:
 *   post:
 *     summary: Create kubes.svg file
 *     description: Create a new kubes.svg file in the uploads/kubes-svg directory
 *     tags: [Kubes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               svg:
 *                 type: string
 *                 format: binary
 *                 description: SVG file
 *             required:
 *               - svg
 *     responses:
 *       201:
 *         description: Kubes.svg file created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fichier kubes.svg créé avec succès
 *       400:
 *         description: Bad request - invalid SVG file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       409:
 *         description: File already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Le fichier kubes.svg existe déjà
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
router.post('/', upload.single('svg'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Fichier SVG requis' });
        }

        const svgContent = req.file.buffer.toString('utf8');
        const result = await kubes.createKubesFile(svgContent);

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /kubes:
 *   put:
 *     summary: Update kubes.svg file
 *     description: Update the existing kubes.svg file with new SVG content
 *     tags: [Kubes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               svg:
 *                 type: string
 *                 format: binary
 *                 description: SVG file
 *             required:
 *               - svg
 *     responses:
 *       200:
 *         description: Kubes.svg file updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fichier kubes.svg mis à jour avec succès
 *       400:
 *         description: Bad request - invalid SVG file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Le fichier kubes.svg n'existe pas encore
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
router.put('/', upload.single('svg'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Fichier SVG requis' });
        }

        const svgContent = req.file.buffer.toString('utf8');
        const result = await kubes.updateKubesFile(svgContent);

        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /kubes:
 *   get:
 *     summary: Get kubes.svg file
 *     description: Retrieve the kubes.svg file content
 *     tags: [Kubes]
 *     responses:
 *       200:
 *         description: Kubes.svg file retrieved successfully
 *         content:
 *           image/svg+xml:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Le fichier kubes.svg n'existe pas encore
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
router.get('/', async (req, res, next) => {
    try {
        const svgContent = await kubes.getKubesFile();

        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svgContent);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /kubes:
 *   delete:
 *     summary: Delete kubes.svg file
 *     description: Delete the kubes.svg file from the uploads/kubes-svg directory
 *     tags: [Kubes]
 *     responses:
 *       200:
 *         description: Kubes.svg file deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fichier kubes.svg supprimé avec succès
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Le fichier kubes.svg n'existe pas encore
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
router.delete('/', async (req, res, next) => {
    try {
        const result = await kubes.deleteKubesFile();

        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;

import express from 'express';
import books from './routes/books.js';
import authors from './routes/authors.js';
import shelves from './routes/shelves.js';
import dotenv from 'dotenv';
import { specs, swaggerUi } from './config/swagger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a simple OK message to verify the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ok
 */
app.get('/', (req, res) => {
    res.json({ message: 'ok' });
});

// Swagger JSON endpoint for external tools (Postman, etc.)
app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

// Swagger documentation endpoint
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
        explorer: true,
        customSiteTitle: 'Library API Documentation',
    })
);

app.use('/books', books);
app.use('/authors', authors);
app.use('/shelves', shelves);

/* Error handler middleware */
app.use((err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

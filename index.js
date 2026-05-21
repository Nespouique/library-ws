import express from 'express';
import cors from 'cors';
import books from './routes/books.js';
import authors from './routes/authors.js';
import shelves from './routes/shelves.js';
import jackets from './routes/jackets.js';
import kubes from './routes/kubes.js';
import dotenv from 'dotenv';
import { specs, swaggerUi } from './config/swagger.js';
import dbInit from './services/db-init.js';
import { createOidcAuthMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permettre les requêtes sans origin (comme les apps mobiles, Postman, etc.)
        if (!origin) return callback(null, true);

        // Pour le développement local et production
        const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000', 'http://localhost:8080', 'https://library-ws.hallais.bzh'];

        // Permettre tous les domaines en développement ou spécifiques en production
        if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Plus permissif pour permettre aux contributeurs d'utiliser l'API
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: process.env.AUTH_ENABLED === 'true',
    optionsSuccessStatus: 200, // Support pour anciens navigateurs
};

app.use(cors(corsOptions));

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

app.get('/health', (req, res) => {
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

app.use(createOidcAuthMiddleware());

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    return next();
});

app.use('/books', books);
app.use('/books', jackets);
app.use('/authors', authors);
app.use('/shelves', shelves);
app.use('/kubes', kubes);

/* Error handler middleware */
app.use((err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

// Fonction d'initialisation et de démarrage du serveur
async function startServer() {
    try {
        console.log("🔄 Démarrage de l'application Library API...");

        // Attendre que la base de données soit disponible
        console.log('🔌 Vérification de la connexion à la base de données...');
        await dbInit.waitForDatabase();

        // Initialiser la base de données (créer les tables si nécessaire)
        await dbInit.initializeDatabase();

        // Démarrer le serveur
        app.listen(port, () => {
            console.log(`🚀 Library API server ready on http://localhost:${port}`);
            console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
        });
    } catch (error) {
        console.error("❌ Erreur lors du démarrage de l'application:", error);
        process.exit(1);
    }
}

// Démarrer l'application
startServer();

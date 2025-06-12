import express from 'express';
import books from './routes/books.js';
import authors from './routes/authors.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.get('/', (req, res) => {
    res.json({ message: 'ok' });
});
app.use('/books', books);
app.use('/authors', authors);

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

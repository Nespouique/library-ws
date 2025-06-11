# Library API Modernization

This project provides a modern RESTful API built with Express.js to interact with a MariaDB database for managing a library (books and authors). The API is designed for extensibility and maintainability, and can be integrated with other services (e.g., WLED devices for shelf lighting).

## Features
- REST API to list books and authors from a MariaDB database
- Modern ES module syntax (import/export)
- Secure configuration using dotenv and .env file
- Pagination support for listing endpoints
- Ready for extension (add, update, delete, connect to other services)

## Modernization Steps

1. **Migration to ES Modules**
   - All files now use `import`/`export` syntax
   - `type: "module"` added to `package.json`
2. **Configuration Security**
   - Uses `dotenv` and a `.env` file for sensitive data (DB credentials, port, etc.)
3. **Dependency Updates**
   - All dependencies updated to latest stable versions
4. **Helper and Config Refactoring**
   - Utility and config files moved to `utils/` and `config/` folders for clarity
   - Named exports for helpers
5. **Project Cleanliness**
   - `.gitignore` excludes `node_modules/`, `.env`, `.idea/`, and `public/`
   - Unused frontend/static files removed

## Project Structure

```
config/
  config.js         # Database and app configuration
routes/
  books.js          # Book API routes
  authors.js        # Author API routes
services/
  books.js          # Book data access logic
  authors.js        # Author data access logic
  db.js             # Database connection helper
utils/
  helper.js         # Pagination and utility functions
index.js            # Main entry point
package.json        # Project metadata and dependencies
README.md           # Project documentation
.env                # Environment variables (not committed)
```

## Getting Started

1. **Install dependencies:**
   ```powershell
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in your database credentials (or use the provided `.env` if present)
3. **Start the server:**
   ```powershell
   node index.js
   ```
4. **Test the API:**
   ```powershell
   curl http://localhost:3000/
   curl http://localhost:3000/books
   curl http://localhost:3000/authors
   curl "http://localhost:3000/books?page=2"
   ```

## Suggestions for Improvement
- Add ESLint and Prettier for code quality and formatting
- Implement POST/PUT/DELETE endpoints for full CRUD support
- Add Swagger/OpenAPI documentation
- Write automated tests (unit/integration)
- Integrate with WLED or other IoT devices for shelf lighting

---
Modernized and maintained as of 2025-06-11.

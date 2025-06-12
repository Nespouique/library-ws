# Library Web Service API

Node.js/Express REST API for library management with complete CRUD operations for books and authors. Designed for a future Android barcode scanning application.

## 🚀 Features

### Authors

- ✅ **Complete CRUD** : Create, Read, Update, Delete
- ✅ **Validation** : No duplicates (unique first name + last name)
- ✅ **Pagination** : Pagination support for lists
- ✅ **Error handling** : Proper HTTP status codes

### Books

- ✅ **Complete CRUD** : Create, Read, Update, Delete
- ✅ **Validation** : Unique ISBN, author must exist
- ✅ **Pagination** : Pagination support for lists
- ✅ **Relationships** : Foreign key link to Authors table

## 🛠 Technologies

- **Node.js** + **Express.js** (ES Modules)
- **MySQL** with connection pooling
- **Jest** for unit testing
- **dotenv** for environment configuration

## 📦 Installation

```bash
# Clone the project
git clone <repository-url>
cd library-ws

# Install dependencies
npm install

# Environment configuration
cp .env.example .env
# Edit .env with your MySQL settings
```

## ⚙️ Configuration

Create a `.env` file:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=Library

# Configuration
PORT=3000
```

## 🧪 Testing

```bash
# Unit tests with mocks (recommended)
npm test

# Tests in watch mode
npm run test:watch

# Complete validation
npm run validate
```

### Test Coverage

- **27 unit tests** with mocked data
- **Execution time** : ~1.2 seconds
- **Complete coverage** : CRUD for Authors and Books + utilities

## 🚀 Production Ready

This API is designed to be the backend for an Android book barcode scanning application. It can be easily deployed and integrated with any frontend.

---

**Author** : Developed with ❤️ for library management  
**Version** : 1.0.0  
**License** : Private

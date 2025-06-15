# Library Web Service API

Node.js/Express REST API for library management with complete CRUD operations for books, authors, and book jacket image management. Designed for a future Android barcode scanning application.

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

### 📸 Book Jacket Images (NEW)

- ✅ **Image Upload** : POST `/books/{id}/jacket` with automatic processing
- ✅ **Multi-size Support** : 4 optimized sizes (small, medium, large, original)
- ✅ **Format Optimization** : WebP conversion with fallback JPEG
- ✅ **Image Retrieval** : GET `/books/{id}/jacket/{size?}`
- ✅ **Image Deletion** : DELETE `/books/{id}/jacket`
- ✅ **Field Protection** : `jacket` field is read-only in standard book endpoints

#### Image Sizes

```javascript
{
  small: { width: 200, height: 300, quality: 85, format: 'webp' },
  medium: { width: 300, height: 450, quality: 90, format: 'webp' },  // default
  large: { width: 500, height: 750, quality: 95, format: 'webp' },
  original: { format: 'jpeg', quality: 100 }
}
```

#### Image API Usage

```bash
# Upload jacket image
curl -X POST http://localhost:3000/books/{uuid}/jacket -F "jacket=@image.jpg"

# Get jacket image (medium size by default)
GET /books/{uuid}/jacket
GET /books/{uuid}/jacket/large

# Delete jacket image
DELETE /books/{uuid}/jacket
```

#### Security & Validation

- **Supported formats**: JPG, PNG, WebP
- **Max file size**: 10MB
- **Protection**: `jacket` field cannot be modified via standard book PUT/PATCH endpoints
- **Error handling**: Clear error messages for validation failures

## 🛠 Technologies

- **Node.js** + **Express.js** (ES Modules)
- **MySQL** with connection pooling
- **Sharp** for image processing and optimization
- **Multer** for file upload handling
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

# Complete validation (lint + format + tests)
npm run validate
```

### Test Coverage

- **94 unit tests** with mocked data including image service tests
- **Execution time** : ~1.3 seconds
- **Complete coverage** : CRUD for Authors, Books, Image management + utilities
- **Services tested** : Books, Authors, Images (validation, filename generation)

## 🚀 Production Ready

This API is designed to be the backend for an Android book barcode scanning application with complete image management capabilities. It can be easily deployed and integrated with any frontend.

### File Structure

```
uploads/jackets/
├── original/        # Original images in JPEG
├── small/          # 200x300 WebP
├── medium/         # 300x450 WebP
└── large/          # 500x750 WebP
```

---

**Author** : Developed with ❤️ for library management  
**Version** : 1.0.0  
**License** : Private

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

## 🐳 Docker Deployment

The application is fully containerized and available on Docker Hub at [nespouique/library-ws](https://hub.docker.com/repository/docker/nespouique/library-ws).

### Docker Hub Image

The official Docker image is automatically built and pushed to Docker Hub:

- **Repository**: `nespouique/library-ws:latest`
- **Base Image**: Node.js Alpine
- **Size**: Optimized for production

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd library-ws

# Start the application with Docker
docker-compose up -d

# The API will be available at http://localhost:3001
```

### ✨ Automatic Database Initialization

🎉 **New Feature**: The application now handles database initialization automatically! No more manual script deployment.

**What happens on first startup:**
1. Application waits for MySQL to be available
2. Checks if required tables exist
3. Creates tables automatically if needed
4. Inserts sample data if database is empty

**Benefits:**
- ✅ No manual script deployment required
- ✅ Simplified deployment process
- ✅ Robust connection handling with retries
- ✅ Works with existing databases

See [DATABASE-INIT.md](DATABASE-INIT.md) for detailed information.

### Docker Architecture

The application uses a multi-container setup:

- **library-ws**: Main Node.js application (port 3001)
    - Image: `nespouique/library-ws:latest`
    - Environment: Production-ready configuration
    - Volumes: Persistent uploads storage
    - **Auto-initialization**: Creates database schema on startup
- **mysql**: MySQL 8.0 database (port 3306)
    - Image: `mysql:8.0`
    - Volumes: Persistent database storage

### Environment Configuration

The Docker setup includes production-ready environment variables:

```yaml
environment:
    - DB_HOST=mysql
    - DB_PORT=3306
    - DB_USER=library_user
    - DB_PASSWORD=SecurePassword123
    - DB_NAME=library_db
    - NODE_ENV=production
    - PORT=3000
    - LIST_PER_PAGE=10
```

### Volume Management

```yaml
volumes:
    mysql_data: # Database persistence
    uploads_data: # Image uploads persistence
```

### Health Checks & Dependencies

- **MySQL Health Check**: Ensures database is ready before starting the application
- **Service Dependencies**: Application waits for MySQL to be healthy
- **Restart Policy**: `unless-stopped` for both services

### What's Included

- **Node.js Application**: Runs on port 3001 with production optimizations
- **MySQL Database**: Pre-configured with sample data via `init.sql`
- **Volume Persistence**: Database and uploaded images are persisted across restarts
- **Health Checks**: Automatic service monitoring and dependency management
- **Network Isolation**: Services communicate via dedicated Docker network

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

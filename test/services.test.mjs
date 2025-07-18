// Simple unit tests with manual mocks
import { describe, test, expect, beforeEach } from '@jest/globals';
import { emptyOrRows } from '../utils/helper.js';

// Mock data for testing with UUIDs
const mockAuthors = [
    {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        firstName: 'John',
        lastName: 'Doe',
    },
    {
        id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
        firstName: 'Jane',
        lastName: 'Smith',
    },
    {
        id: 'c3d4e5f6-g7h8-9012-cdef-123456789012',
        firstName: 'Bob',
        lastName: 'Johnson',
    },
];

const mockBooks = [
    {
        id: 'e5f6g7h8-i9j0-1234-ef01-345678901234',
        title: 'Book 1',
        author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        isbn: '1234567890123',
        date: '2024-01-01',
        description: 'Description 1',
        jacket: '/cover1.jpg',
        shelf: 'd4e5f6g7-h8i9-0123-def0-234567890123',
    },
    {
        id: 'f6g7h8i9-j0k1-2345-f012-456789012345',
        title: 'Book 2',
        author: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
        isbn: '9876543210987',
        date: '2024-02-01',
        description: 'Description 2',
        jacket: '/cover2.jpg',
        shelf: null, // Book not on any shelf
    },
];

const mockShelves = [
    { id: 'd4e5f6g7-h8i9-0123-def0-234567890123', name: 'Étagère 1', location: 'Salon - Mur Nord' },
    { id: 'e5f6g7h8-i9j0-1234-ef01-345678901234', name: 'Étagère 2', location: 'Bureau - Étagère droite' },
    { id: 'f6g7h8i9-j0k1-2345-f012-456789012345', name: 'Étagère 3', location: null },
];

// Generate UUID-like string for testing
function generateTestUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Simple service implementations with mock data
const authorsService = {
    async getMultiple() {
        return emptyOrRows([...mockAuthors]);
    },

    async getById(id) {
        const author = mockAuthors.find(a => a.id === id);
        return author || null;
    },

    async create(author) {
        // Check if author already exists
        const existing = mockAuthors.find(a => a.firstName === author.firstName && a.lastName === author.lastName);
        if (existing) {
            const error = new Error('Author already exists');
            error.statusCode = 409;
            throw error;
        }

        const newId = generateTestUuid();
        const newAuthor = { id: newId, ...author };
        mockAuthors.push(newAuthor);
        return newAuthor;
    },

    async update(id, author) {
        // Validation PUT : tous les champs requis doivent être fournis
        if (!author.firstName || !author.lastName) {
            const error = new Error('PUT requires complete object: firstName and lastName are required');
            error.statusCode = 400;
            throw error;
        }

        // Check for duplicate name
        const duplicate = mockAuthors.find(a => a.id !== id && a.firstName === author.firstName && a.lastName === author.lastName);
        if (duplicate) {
            const error = new Error('Author already exists');
            error.statusCode = 409;
            throw error;
        }

        const index = mockAuthors.findIndex(a => a.id === id);
        if (index === -1) return false;

        mockAuthors[index] = { ...mockAuthors[index], ...author };
        return true;
    },

    async updatePartial(id, updates) {
        // Get current author
        const index = mockAuthors.findIndex(a => a.id === id);
        if (index === -1) return false;

        const current = mockAuthors[index];

        // Build final values for validation
        const finalFirstName = updates.firstName !== undefined ? updates.firstName : current.firstName;
        const finalLastName = updates.lastName !== undefined ? updates.lastName : current.lastName;

        // Check for duplicate name
        const duplicate = mockAuthors.find(a => a.id !== id && a.firstName === finalFirstName && a.lastName === finalLastName);
        if (duplicate) {
            const error = new Error('Author already exists');
            error.statusCode = 409;
            throw error;
        }

        // Apply partial updates
        if (updates.firstName !== undefined) {
            mockAuthors[index].firstName = updates.firstName;
        }
        if (updates.lastName !== undefined) {
            mockAuthors[index].lastName = updates.lastName;
        }

        return true;
    },

    async remove(id) {
        const index = mockAuthors.findIndex(a => a.id === id);
        if (index === -1) return false;

        mockAuthors.splice(index, 1);
        return true;
    },
};

const booksService = {
    async getMultiple() {
        return emptyOrRows([...mockBooks]);
    },

    async getById(id) {
        const book = mockBooks.find(b => b.id === id);
        if (!book) return null;

        return book;
    },

    async create(book) {
        // Extract author ID whether it's a string or an object with id property
        const authorId = typeof book.author === 'string' ? book.author : book.author?.id;

        if (!authorId) {
            const error = new Error('Author ID is required');
            error.statusCode = 400;
            throw error;
        }

        // Check if author exists
        const authorExists = mockAuthors.find(a => a.id === authorId);
        if (!authorExists) {
            const error = new Error('Author does not exist');
            error.statusCode = 400;
            throw error;
        }

        // Check for duplicate ISBN
        const existing = mockBooks.find(b => b.isbn === book.isbn);
        if (existing) {
            const error = new Error('Book/ISBN already exists');
            error.statusCode = 409;
            throw error;
        }
        const newId = generateTestUuid();
        const createdBook = { id: newId, ...book, author: authorId };
        mockBooks.push(createdBook);

        return createdBook;
    },

    async update(id, book) {
        // Extract author ID whether it's a string or an object with id property
        const authorId = typeof book.author === 'string' ? book.author : book.author?.id;

        // Validation PUT : tous les champs requis doivent être fournis
        if (!book.title || !authorId || !book.isbn) {
            const error = new Error('PUT requires complete object: title, author, and isbn are required');
            error.statusCode = 400;
            throw error;
        }

        // Check if author exists
        const authorExistsUpdate = mockAuthors.find(a => a.id === authorId);
        if (!authorExistsUpdate) {
            const error = new Error('Author does not exist');
            error.statusCode = 400;
            throw error;
        }

        // Check for duplicate ISBN
        const duplicate = mockBooks.find(b => b.id !== id && b.isbn === book.isbn);
        if (duplicate) {
            const error = new Error('Book/ISBN already exists');
            error.statusCode = 409;
            throw error;
        }

        const index = mockBooks.findIndex(b => b.id === id);
        if (index === -1) return false;

        // Le champ jacket n'est pas modifiable via cette route
        if (book.jacket !== undefined) {
            const error = new Error('Jacket field is read-only. Use /books/{id}/jacket endpoint to manage jacket images');
            error.statusCode = 400;
            throw error;
        }

        // Filter out jacket field - it should not be updated via regular update
        const { jacket, ...updateData } = book;
        mockBooks[index] = { ...mockBooks[index], ...updateData, author: authorId };
        return true;
    },

    async updatePartial(id, updates) {
        // Get current book
        const index = mockBooks.findIndex(b => b.id === id);
        if (index === -1) return false;

        // Validate author if provided
        if (updates.author !== undefined) {
            // Extract author ID whether it's a string or an object with id property
            const authorId = typeof updates.author === 'string' ? updates.author : updates.author?.id;

            if (!authorId) {
                const error = new Error('Author ID is required');
                error.statusCode = 400;
                throw error;
            }

            const authorExistsPartial = mockAuthors.find(a => a.id === authorId);
            if (!authorExistsPartial) {
                const error = new Error('Author does not exist');
                error.statusCode = 400;
                throw error;
            }

            // Store the authorId for the update
            updates.author = authorId;
        }

        // Check for duplicate ISBN if provided
        if (updates.isbn !== undefined) {
            const duplicate = mockBooks.find(b => b.id !== id && b.isbn === updates.isbn);
            if (duplicate) {
                const error = new Error('Book/ISBN already exists');
                error.statusCode = 409;
                throw error;
            }
        }

        // Apply partial updates (excluding jacket field)
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && key !== 'jacket') {
                mockBooks[index][key] = updates[key];
            } else if (key === 'jacket') {
                const error = new Error('Jacket field is read-only. Use /books/{id}/jacket endpoint to manage jacket images');
                error.statusCode = 400;
                throw error;
            }
        });

        return true;
    },

    async remove(id) {
        const index = mockBooks.findIndex(b => b.id === id);
        if (index === -1) return false;

        mockBooks.splice(index, 1);
        return true;
    },

    async updateJacket(id, newFilename) {
        const index = mockBooks.findIndex(b => b.id === id);
        if (index === -1) return false;

        // If newFilename is null, set jacket to null
        if (newFilename === null) {
            mockBooks[index].jacket = null;
        } else {
            // Otherwise, update the jacket filename
            mockBooks[index].jacket = newFilename;
        }
        return true;
    },
};

const shelvesService = {
    async getMultiple() {
        return emptyOrRows([...mockShelves]);
    },

    async getById(id) {
        const shelf = mockShelves.find(s => s.id === id);
        return shelf || null;
    },

    async getByName(name) {
        const shelf = mockShelves.find(s => s.name === name.trim());
        return shelf || null;
    },

    async create(shelf) {
        if (!shelf || !shelf.name || shelf.name.trim() === '') {
            const error = new Error('Shelf name is required');
            error.statusCode = 400;
            throw error;
        }

        // Check if a shelf with the same name already exists
        const existingShelf = await this.getByName(shelf.name);
        if (existingShelf) {
            const error = new Error('Shelf already exists');
            error.statusCode = 409;
            throw error;
        }

        const newId = generateTestUuid();
        const newShelf = { id: newId, name: shelf.name.trim(), location: shelf.location || null };
        mockShelves.push(newShelf);
        return newShelf;
    },

    async update(id, shelf) {
        if (!shelf || !shelf.name || shelf.name.trim() === '') {
            const error = new Error('Shelf name is required');
            error.statusCode = 400;
            throw error;
        }

        // Check if a shelf with the same name already exists (excluding current shelf)
        const existingShelf = await this.getByName(shelf.name);
        if (existingShelf && existingShelf.id !== id) {
            const error = new Error('Shelf already exists');
            error.statusCode = 409;
            throw error;
        }

        const index = mockShelves.findIndex(s => s.id === id);
        if (index === -1) return false;

        mockShelves[index].name = shelf.name.trim();
        mockShelves[index].location = shelf.location || null;
        return true;
    },

    async updatePartial(id, updates) {
        const index = mockShelves.findIndex(s => s.id === id);
        if (index === -1) return false;

        if (updates.name !== undefined) {
            if (!updates.name || updates.name.trim() === '') {
                const error = new Error('Shelf name cannot be empty');
                error.statusCode = 400;
                throw error;
            }

            // Check if a shelf with the same name already exists (excluding current shelf)
            const existingShelf = await this.getByName(updates.name);
            if (existingShelf && existingShelf.id !== id) {
                const error = new Error('Shelf already exists');
                error.statusCode = 409;
                throw error;
            }

            mockShelves[index].name = updates.name.trim();
        }

        if (updates.location !== undefined) {
            mockShelves[index].location = updates.location || null;
        }
        return true;
    },

    async remove(id) {
        // Check if shelf is referenced by any books
        const booksOnShelf = mockBooks.filter(b => b.shelf === id);
        if (booksOnShelf.length > 0) {
            throw new Error('Cannot delete shelf: it contains books');
        }

        const index = mockShelves.findIndex(s => s.id === id);
        if (index === -1) return false;

        mockShelves.splice(index, 1);
        return true;
    },
};

describe('Authors Service - Unit Tests with Mock Data (UUID)', () => {
    beforeEach(() => {
        // Reset mock data before each test
        mockAuthors.length = 0;
        mockAuthors.push(
            {
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                firstName: 'John',
                lastName: 'Doe',
            },
            {
                id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
                firstName: 'Jane',
                lastName: 'Smith',
            },
            {
                id: 'c3d4e5f6-g7h8-9012-cdef-123456789012',
                firstName: 'Bob',
                lastName: 'Johnson',
            }
        );
    });

    describe('getMultiple', () => {
        test('should return all authors', async () => {
            const result = await authorsService.getMultiple();

            expect(result).toEqual(mockAuthors);
        });
        test('should handle empty results', async () => {
            mockAuthors.length = 0; // Clear mock data

            const result = await authorsService.getMultiple();

            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        test('should return author when found', async () => {
            const result = await authorsService.getById('a1b2c3d4-e5f6-7890-abcd-ef1234567890');

            expect(result).toEqual({
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                firstName: 'John',
                lastName: 'Doe',
            });
        });

        test('should return null when not found', async () => {
            const result = await authorsService.getById('00000000-0000-0000-0000-000000000000');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new author successfully', async () => {
            const newAuthor = { firstName: 'Alice', lastName: 'Wonder' };

            const result = await authorsService.create(newAuthor);

            expect(result.firstName).toBe('Alice');
            expect(result.lastName).toBe('Wonder');
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockAuthors).toHaveLength(4);
        });

        test('should throw error when author already exists', async () => {
            const existingAuthor = { firstName: 'John', lastName: 'Doe' };

            await expect(authorsService.create(existingAuthor)).rejects.toThrow('Author already exists');
        });
    });

    describe('update', () => {
        test('should update author successfully', async () => {
            const updateData = { firstName: 'Johnny', lastName: 'Doe' };

            const result = await authorsService.update('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updateData);

            expect(result).toBe(true);
            expect(mockAuthors[0]).toEqual({
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                firstName: 'Johnny',
                lastName: 'Doe',
            });
        });

        test('should return false when author not found', async () => {
            const updateData = { firstName: 'Johnny', lastName: 'Doe' };

            const result = await authorsService.update('00000000-0000-0000-0000-000000000000', updateData);

            expect(result).toBe(false);
        });

        test('should throw error when duplicate name exists', async () => {
            const updateData = { firstName: 'Jane', lastName: 'Smith' }; // Existing name

            await expect(authorsService.update('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updateData)).rejects.toThrow('Author already exists');
        });

        test('should throw error when firstName is missing (PUT validation)', async () => {
            const updateData = { lastName: 'Doe' }; // Missing firstName

            await expect(authorsService.update('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updateData)).rejects.toThrow('PUT requires complete object: firstName and lastName are required');
        });

        test('should throw error when lastName is missing (PUT validation)', async () => {
            const updateData = { firstName: 'Johnny' }; // Missing lastName

            await expect(authorsService.update('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updateData)).rejects.toThrow('PUT requires complete object: firstName and lastName are required');
        });

        test('should throw error when both fields are missing (PUT validation)', async () => {
            const updateData = {}; // Missing both fields

            await expect(authorsService.update('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updateData)).rejects.toThrow('PUT requires complete object: firstName and lastName are required');
        });
    });

    describe('updatePartial', () => {
        test('should update only firstName', async () => {
            const updates = { firstName: 'Johnny' };

            const result = await authorsService.updatePartial('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updates);

            expect(result).toBe(true);
            expect(mockAuthors[0]).toEqual({
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                firstName: 'Johnny', // Updated
                lastName: 'Doe', // Unchanged
            });
        });

        test('should update only lastName', async () => {
            const updates = { lastName: 'Brown' };

            const result = await authorsService.updatePartial('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updates);

            expect(result).toBe(true);
            expect(mockAuthors[0]).toEqual({
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                firstName: 'John', // Unchanged
                lastName: 'Brown', // Updated
            });
        });

        test('should update both firstName and lastName', async () => {
            const updates = { firstName: 'Johnny', lastName: 'Brown' };

            const result = await authorsService.updatePartial('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updates);

            expect(result).toBe(true);
            expect(mockAuthors[0]).toEqual({
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                firstName: 'Johnny', // Updated
                lastName: 'Brown', // Updated
            });
        });

        test('should handle empty updates object', async () => {
            const originalAuthor = { ...mockAuthors[0] };
            const updates = {};

            const result = await authorsService.updatePartial('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updates);

            expect(result).toBe(true);
            expect(mockAuthors[0]).toEqual(originalAuthor); // Unchanged
        });

        test('should return false when author not found', async () => {
            const updates = { firstName: 'Johnny' };

            const result = await authorsService.updatePartial('00000000-0000-0000-0000-000000000000', updates);

            expect(result).toBe(false);
        });

        test('should throw error when partial update creates duplicate name', async () => {
            // Try to change John Doe to Jane Smith (which already exists)
            const updates = { firstName: 'Jane', lastName: 'Smith' };

            await expect(authorsService.updatePartial('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updates)).rejects.toThrow('Author already exists');
        });

        test('should allow updating firstName when result is not duplicate', async () => {
            // Try to change John Doe's firstName to Jane (making it Jane Doe, different from Jane Smith)
            const updates = { firstName: 'Jane' };

            const result = await authorsService.updatePartial('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updates);

            expect(result).toBe(true);
            expect(mockAuthors[0]).toEqual({
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                firstName: 'Jane',
                lastName: 'Doe',
            });
        });

        test('should allow updating to same values', async () => {
            // Update to current values should be allowed
            const updates = { firstName: 'John', lastName: 'Doe' };

            const result = await authorsService.updatePartial('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updates);

            expect(result).toBe(true);
            expect(mockAuthors[0]).toEqual({
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                firstName: 'John',
                lastName: 'Doe',
            });
        });
    });

    describe('remove', () => {
        test('should delete author successfully', async () => {
            const result = await authorsService.remove('a1b2c3d4-e5f6-7890-abcd-ef1234567890');

            expect(result).toBe(true);
            expect(mockAuthors).toHaveLength(2);
            expect(mockAuthors.find(a => a.id === 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBeUndefined();
        });

        test('should return false when author not found', async () => {
            const result = await authorsService.remove('00000000-0000-0000-0000-000000000000');

            expect(result).toBe(false);
            expect(mockAuthors).toHaveLength(3);
        });
    });
});

describe('Books Service - Unit Tests with Mock Data (UUID)', () => {
    beforeEach(() => {
        // Reset mock data before each test
        mockBooks.length = 0;
        mockBooks.push(
            {
                id: 'e5f6g7h8-i9j0-1234-ef01-345678901234',
                title: 'Book 1',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                isbn: '1234567890123',
                date: '2024-01-01',
                description: 'Description 1',
                jacket: '/cover1.jpg',
                shelf: 'd4e5f6g7-h8i9-0123-def0-234567890123',
            },
            {
                id: 'f6g7h8i9-j0k1-2345-f012-456789012345',
                title: 'Book 2',
                author: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
                isbn: '9876543210987',
                date: '2024-02-01',
                description: 'Description 2',
                jacket: '/cover2.jpg',
                shelf: null,
            }
        );
    });

    describe('getMultiple', () => {
        test('should return all books with author IDs', async () => {
            const result = await booksService.getMultiple();

            expect(result).toHaveLength(2);
            expect(result[0].author).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        });
    });

    describe('getById', () => {
        test('should return book with author ID when found', async () => {
            const result = await booksService.getById('e5f6g7h8-i9j0-1234-ef01-345678901234');

            expect(result.title).toBe('Book 1');
            expect(result.author).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
            expect(result.shelf).toBe('d4e5f6g7-h8i9-0123-def0-234567890123');
        });

        test('should return book with null shelf when not on any shelf', async () => {
            const result = await booksService.getById('f6g7h8i9-j0k1-2345-f012-456789012345');

            expect(result.title).toBe('Book 2');
            expect(result.shelf).toBeNull();
        });

        test('should return null when not found', async () => {
            const result = await booksService.getById('00000000-0000-0000-0000-000000000000');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new book successfully with author ID string', async () => {
            const newBook = {
                title: 'New Book',
                date: '2025-01-01',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                description: 'New Description',
                isbn: '1111111111111',
                jacket: '/new-cover.jpg',
            };

            const result = await booksService.create(newBook);

            expect(result.title).toBe('New Book');
            expect(result.author).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
            expect(result.shelf).toBeUndefined(); // Should include shelf field as undefined when not set
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockBooks).toHaveLength(3);
        });

        test('should create new book successfully with author object', async () => {
            const newBook = {
                title: 'New Book 2',
                date: '2025-01-01',
                author: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                description: 'New Description 2',
                isbn: '2222222222222',
                jacket: '/new-cover2.jpg',
            };

            const result = await booksService.create(newBook);

            expect(result.title).toBe('New Book 2');
            expect(result.author).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
            expect(result.shelf).toBeUndefined(); // Should include shelf field as undefined when not set
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockBooks).toHaveLength(3);
        });

        test('should throw error when author does not exist', async () => {
            const newBook = {
                title: 'Invalid Book',
                author: '00000000-0000-0000-0000-000000000000',
                isbn: '1111111111111',
            };

            await expect(booksService.create(newBook)).rejects.toThrow('Author does not exist');
        });

        test('should throw error when author object has invalid ID', async () => {
            const newBook = {
                title: 'Invalid Book',
                author: { id: '00000000-0000-0000-0000-000000000000' },
                isbn: '1111111111111',
            };

            await expect(booksService.create(newBook)).rejects.toThrow('Author does not exist');
        });

        test('should throw error when author ID is missing', async () => {
            const newBook = {
                title: 'Invalid Book',
                author: {},
                isbn: '1111111111111',
            };

            await expect(booksService.create(newBook)).rejects.toThrow('Author ID is required');
        });

        test('should throw error when ISBN already exists', async () => {
            const newBook = {
                title: 'Duplicate ISBN Book',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                isbn: '1234567890123', // Existing ISBN
            };

            await expect(booksService.create(newBook)).rejects.toThrow('Book/ISBN already exists');
        });
    });

    describe('update', () => {
        test('should update book successfully with complete object including shelf', async () => {
            const updateData = {
                title: 'Updated Book Title',
                date: '2024-01-01',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                description: 'Updated description',
                isbn: '9999999999999',
                shelf: 'e5f6g7h8-i9j0-1234-ef01-345678901234',
            };

            const result = await booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData);

            expect(result).toBe(true);
            expect(mockBooks[0].shelf).toBe('e5f6g7h8-i9j0-1234-ef01-345678901234');
            expect(mockBooks[0].title).toBe('Updated Book Title');
        });

        test('should update book successfully and set shelf to null', async () => {
            const updateData = {
                title: 'Updated Book Title 2',
                date: '2024-01-01',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                description: 'Updated description',
                isbn: '8888888888888',
                shelf: null,
            };

            const result = await booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData);

            expect(result).toBe(true);
            expect(mockBooks[0].shelf).toBeNull();
        });

        test('should update book successfully with author object format', async () => {
            const updateData = {
                title: 'Updated Book Title 2',
                date: '2024-02-01',
                author: { id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901' },
                description: 'Updated description 2',
                isbn: '8888888888888',
            };

            const result = await booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData);

            expect(result).toBe(true);
            expect(mockBooks[0].author).toBe('b2c3d4e5-f6g7-8901-bcde-f12345678901'); // Stored as ID
            expect(mockBooks[0].title).toBe('Updated Book Title 2');
        });

        test('should throw error when author object has no ID', async () => {
            const updateData = {
                title: 'Updated Title',
                date: '2024-01-01',
                author: {},
                description: 'Updated description',
                isbn: '9999999999999',
            };

            await expect(booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData)).rejects.toThrow('PUT requires complete object: title, author, and isbn are required');
        });

        test('should return false when book not found', async () => {
            const updateData = {
                title: 'Updated Title',
                date: '2024-01-01',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                description: 'Updated description',
                isbn: '9999999999999',
            };

            const result = await booksService.update('00000000-0000-0000-0000-000000000000', updateData);

            expect(result).toBe(false);
        });

        test('should throw error when title is missing (PUT validation)', async () => {
            const updateData = {
                date: '2024-01-01',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                description: 'Updated description',
                isbn: '9999999999999',
            };

            await expect(booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData)).rejects.toThrow('PUT requires complete object: title, author, and isbn are required');
        });

        test('should throw error when author does not exist', async () => {
            const updateData = {
                title: 'Updated Title',
                date: '2024-01-01',
                author: '00000000-0000-0000-0000-000000000000',
                description: 'Updated description',
                isbn: '9999999999999',
            };

            await expect(booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData)).rejects.toThrow('Author does not exist');
        });

        test('should throw error when ISBN already exists', async () => {
            const updateData = {
                title: 'Updated Title',
                date: '2024-01-01',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                description: 'Updated description',
                isbn: '9876543210987', // Existing ISBN from book 2
            };

            await expect(booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData)).rejects.toThrow('Book/ISBN already exists');
        });
    });

    describe('updatePartial', () => {
        test('should update only title', async () => {
            const updates = { title: 'Partially Updated Title' };

            const result = await booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates);

            expect(result).toBe(true);
            expect(mockBooks[0].title).toBe('Partially Updated Title');
            expect(mockBooks[0].author).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890'); // Unchanged
        });

        test('should update multiple fields', async () => {
            const updates = {
                title: 'New Title',
                description: 'New Description',
            };

            const result = await booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates);

            expect(result).toBe(true);
            expect(mockBooks[0].title).toBe('New Title');
            expect(mockBooks[0].description).toBe('New Description');
            expect(mockBooks[0].author).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890'); // Unchanged
        });

        test('should handle empty updates object', async () => {
            const originalBook = { ...mockBooks[0] };
            const updates = {};

            const result = await booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates);

            expect(result).toBe(true);
            expect(mockBooks[0]).toEqual(originalBook); // Unchanged
        });

        test('should return false when book not found', async () => {
            const updates = { title: 'New Title' };

            const result = await booksService.updatePartial('00000000-0000-0000-0000-000000000000', updates);

            expect(result).toBe(false);
        });

        test('should throw error when partial author update is invalid', async () => {
            const updates = { author: '00000000-0000-0000-0000-000000000000' };

            await expect(booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates)).rejects.toThrow('Author does not exist');
        });

        test('should throw error when partial ISBN update creates duplicate', async () => {
            const updates = { isbn: '9876543210987' }; // Existing ISBN from book 2

            await expect(booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates)).rejects.toThrow('Book/ISBN already exists');
        });

        test('should update author with ID string', async () => {
            const updates = { author: 'b2c3d4e5-f6g7-8901-bcde-f12345678901' };

            const result = await booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates);

            expect(result).toBe(true);
            expect(mockBooks[0].author).toBe('b2c3d4e5-f6g7-8901-bcde-f12345678901');
        });

        test('should update author with object format', async () => {
            const updates = { author: { id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901' } };

            const result = await booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates);

            expect(result).toBe(true);
            expect(mockBooks[0].author).toBe('b2c3d4e5-f6g7-8901-bcde-f12345678901');
        });

        test('should throw error when author object has no ID', async () => {
            const updates = { author: {} };

            await expect(booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates)).rejects.toThrow('Author ID is required');
        });

        test('should throw error when author object has invalid ID', async () => {
            const updates = { author: { id: '00000000-0000-0000-0000-000000000000' } };

            await expect(booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates)).rejects.toThrow('Author does not exist');
        });

        test('should update shelf field only', async () => {
            const updates = { shelf: 'f6g7h8i9-j0k1-2345-f012-456789012345' };

            const result = await booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates);

            expect(result).toBe(true);
            expect(mockBooks[0].shelf).toBe('f6g7h8i9-j0k1-2345-f012-456789012345');
            expect(mockBooks[0].title).toBe('Book 1'); // Unchanged
        });

        test('should set shelf to null via partial update', async () => {
            const updates = { shelf: null };

            const result = await booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates);

            expect(result).toBe(true);
            expect(mockBooks[0].shelf).toBeNull();
            expect(mockBooks[0].title).toBe('Book 1'); // Unchanged
        });
    });

    describe('remove', () => {
        test('should delete book successfully', async () => {
            const result = await booksService.remove('e5f6g7h8-i9j0-1234-ef01-345678901234');

            expect(result).toBe(true);
            expect(mockBooks).toHaveLength(1);
            expect(mockBooks.find(b => b.id === 'e5f6g7h8-i9j0-1234-ef01-345678901234')).toBeUndefined();
        });

        test('should return false when book not found', async () => {
            const result = await booksService.remove('00000000-0000-0000-0000-000000000000');

            expect(result).toBe(false);
            expect(mockBooks).toHaveLength(2);
        });
    });

    describe('updateJacket', () => {
        test('should update jacket filename successfully', async () => {
            const newJacketFilename = 'jacket_test_123456789';
            const result = await booksService.updateJacket('e5f6g7h8-i9j0-1234-ef01-345678901234', newJacketFilename);

            expect(result).toBe(true);
            const updatedBook = mockBooks.find(b => b.id === 'e5f6g7h8-i9j0-1234-ef01-345678901234');
            expect(updatedBook.jacket).toBe(newJacketFilename);
        });

        test('should set jacket to null', async () => {
            const result = await booksService.updateJacket('e5f6g7h8-i9j0-1234-ef01-345678901234', null);

            expect(result).toBe(true);
            const updatedBook = mockBooks.find(b => b.id === 'e5f6g7h8-i9j0-1234-ef01-345678901234');
            expect(updatedBook.jacket).toBeNull();
        });

        test('should return false when book not found', async () => {
            const result = await booksService.updateJacket('00000000-0000-0000-0000-000000000000', 'test_jacket');

            expect(result).toBe(false);
        });
    });

    describe('updateJacket', () => {
        test('should update jacket filename successfully', async () => {
            const newJacketFilename = 'jacket_test_123456789';
            const result = await booksService.updateJacket('e5f6g7h8-i9j0-1234-ef01-345678901234', newJacketFilename);

            expect(result).toBe(true);
            const updatedBook = mockBooks.find(b => b.id === 'e5f6g7h8-i9j0-1234-ef01-345678901234');
            expect(updatedBook.jacket).toBe(newJacketFilename);
        });

        test('should set jacket to null', async () => {
            const result = await booksService.updateJacket('e5f6g7h8-i9j0-1234-ef01-345678901234', null);

            expect(result).toBe(true);
            const updatedBook = mockBooks.find(b => b.id === 'e5f6g7h8-i9j0-1234-ef01-345678901234');
            expect(updatedBook.jacket).toBeNull();
        });

        test('should return false when book not found', async () => {
            const result = await booksService.updateJacket('00000000-0000-0000-0000-000000000000', 'test_jacket');

            expect(result).toBe(false);
        });
    });

    describe('jacket field protection in updates', () => {
        test('should throw error when trying to update jacket via regular update', async () => {
            const updates = {
                title: 'Updated Title',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                isbn: '1111111111111',
                date: '2024-03-01',
                description: 'Updated description',
                jacket: 'should_cause_error',
            };

            await expect(booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updates)).rejects.toThrow('Jacket field is read-only');
        });

        test('should throw error when trying to update jacket via partial update', async () => {
            const updates = {
                jacket: 'should_cause_error',
            };

            await expect(booksService.updatePartial('e5f6g7h8-i9j0-1234-ef01-345678901234', updates)).rejects.toThrow('Jacket field is read-only');
        });
    });
});

describe('Helper Functions', () => {
    test('emptyOrRows should handle null/undefined', () => {
        expect(emptyOrRows(null)).toEqual([]);
        expect(emptyOrRows(undefined)).toEqual([]);
        expect(emptyOrRows([])).toEqual([]);
        expect(emptyOrRows([1, 2, 3])).toEqual([1, 2, 3]);
        expect(emptyOrRows(['a', 'b'])).toEqual(['a', 'b']);
    });

    test('emptyOrRows should preserve object properties', () => {
        const testData = [
            { id: 'test-uuid-1', name: 'Test' },
            { id: 'test-uuid-2', name: 'Test2' },
        ];

        expect(emptyOrRows(testData)).toEqual(testData);
        expect(emptyOrRows(testData)).toBe(testData); // Should return the same reference for efficiency
    });
});

describe('Shelves Service - Unit Tests with Mock Data (UUID)', () => {
    beforeEach(() => {
        // Reset mock data before each test
        mockShelves.length = 0;
        mockShelves.push(
            { id: 'd4e5f6g7-h8i9-0123-def0-234567890123', name: 'Étagère 1', location: 'Salon - Mur Nord' },
            { id: 'e5f6g7h8-i9j0-1234-ef01-345678901234', name: 'Étagère 2', location: 'Bureau - Étagère droite' },
            { id: 'f6g7h8i9-j0k1-2345-f012-456789012345', name: 'Étagère 3', location: null }
        );

        // Also reset books data to ensure clean state for shelf tests
        mockBooks.length = 0;
        mockBooks.push(
            {
                id: 'e5f6g7h8-i9j0-1234-ef01-345678901234',
                title: 'Book 1',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                isbn: '1234567890123',
                date: '2024-01-01',
                description: 'Description 1',
                jacket: '/cover1.jpg',
                shelf: null, // No shelf assigned for clean shelf tests
            },
            {
                id: 'f6g7h8i9-j0k1-2345-f012-456789012345',
                title: 'Book 2',
                author: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
                isbn: '9876543210987',
                date: '2024-02-01',
                description: 'Description 2',
                jacket: '/cover2.jpg',
                shelf: null,
            }
        );
    });

    describe('getMultiple', () => {
        test('should return all shelves', async () => {
            const result = await shelvesService.getMultiple();

            expect(result).toEqual(mockShelves);
        });

        test('should handle empty results', async () => {
            mockShelves.length = 0; // Clear mock data

            const result = await shelvesService.getMultiple();

            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        test('should return shelf when found', async () => {
            const result = await shelvesService.getById('d4e5f6g7-h8i9-0123-def0-234567890123');

            expect(result).toEqual({
                id: 'd4e5f6g7-h8i9-0123-def0-234567890123',
                name: 'Étagère 1',
                location: 'Salon - Mur Nord',
            });
        });

        test('should return null when not found', async () => {
            const result = await shelvesService.getById('00000000-0000-0000-0000-000000000000');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new shelf successfully with name', async () => {
            const newShelf = { name: 'Nouvelle Étagère' };
            const result = await shelvesService.create(newShelf);

            expect(result.name).toBe('Nouvelle Étagère');
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockShelves).toHaveLength(4);
        });

        test('should create new shelf with location', async () => {
            const newShelf = { name: 'Nouvelle Étagère', location: 'Cuisine - Étagère haute' };
            const result = await shelvesService.create(newShelf);

            expect(result.name).toBe('Nouvelle Étagère');
            expect(result.location).toBe('Cuisine - Étagère haute');
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockShelves).toHaveLength(4);
        });

        test('should create new shelf without location (null)', async () => {
            const newShelf = { name: 'Étagère sans lieu' };
            const result = await shelvesService.create(newShelf);

            expect(result.name).toBe('Étagère sans lieu');
            expect(result.location).toBeNull();
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockShelves).toHaveLength(4);
        });

        test('should throw error when name is missing', async () => {
            await expect(shelvesService.create({})).rejects.toThrow('Shelf name is required');
        });

        test('should throw error when name is empty string', async () => {
            await expect(shelvesService.create({ name: '' })).rejects.toThrow('Shelf name is required');
        });

        test('should trim whitespace from name', async () => {
            const newShelf = { name: '  Étagère avec espaces  ' };
            const result = await shelvesService.create(newShelf);

            expect(result.name).toBe('Étagère avec espaces');
        });

        test('should throw 409 error when shelf name already exists', async () => {
            const newShelf = { name: 'Étagère 1' }; // Name already exists in mock data

            const error = await shelvesService.create(newShelf).catch(e => e);

            expect(error.message).toBe('Shelf already exists');
            expect(error.statusCode).toBe(409);
            expect(mockShelves).toHaveLength(3); // Should not add duplicate
        });

        test('should throw 409 error for duplicate name with different case/spaces', async () => {
            const newShelf = { name: ' Étagère 1 ' }; // Same name with spaces

            const error = await shelvesService.create(newShelf).catch(e => e);

            expect(error.message).toBe('Shelf already exists');
            expect(error.statusCode).toBe(409);
        });
    });
    describe('update', () => {
        test('should update shelf name successfully', async () => {
            const updateData = { name: 'Étagère Mise à Jour' };
            const result = await shelvesService.update('d4e5f6g7-h8i9-0123-def0-234567890123', updateData);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère Mise à Jour');
        });

        test('should update shelf name and location successfully', async () => {
            const updateData = { name: 'Étagère Mise à Jour', location: 'Nouvelle location' };
            const result = await shelvesService.update('d4e5f6g7-h8i9-0123-def0-234567890123', updateData);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère Mise à Jour');
            expect(mockShelves[0].location).toBe('Nouvelle location');
        });

        test('should update shelf with null location', async () => {
            const updateData = { name: 'Étagère Sans Lieu', location: null };
            const result = await shelvesService.update('d4e5f6g7-h8i9-0123-def0-234567890123', updateData);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère Sans Lieu');
            expect(mockShelves[0].location).toBeNull();
        });

        test('should return false when shelf not found', async () => {
            const updateData = { name: 'Étagère Test' };
            const result = await shelvesService.update('00000000-0000-0000-0000-000000000000', updateData);

            expect(result).toBe(false);
        });

        test('should throw error when name is missing', async () => {
            await expect(shelvesService.update('d4e5f6g7-h8i9-0123-def0-234567890123', {})).rejects.toThrow('Shelf name is required');
        });

        test('should trim whitespace from name', async () => {
            const updateData = { name: '  Étagère Trimée  ' };
            const result = await shelvesService.update('d4e5f6g7-h8i9-0123-def0-234567890123', updateData);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère Trimée');
        });

        test('should throw 409 error when updating to existing shelf name', async () => {
            const updateData = { name: 'Étagère 2' }; // Name already exists in mock data

            const error = await shelvesService.update('d4e5f6g7-h8i9-0123-def0-234567890123', updateData).catch(e => e);

            expect(error.message).toBe('Shelf already exists');
            expect(error.statusCode).toBe(409);
            expect(mockShelves[0].name).toBe('Étagère 1'); // Should remain unchanged
        });

        test('should allow updating shelf with its own name', async () => {
            const updateData = { name: 'Étagère 1' }; // Same name as current shelf

            const result = await shelvesService.update('d4e5f6g7-h8i9-0123-def0-234567890123', updateData);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère 1');
        });
    });

    describe('updatePartial', () => {
        test('should update shelf name when provided', async () => {
            const updates = { name: 'Étagère Partiellement Mise à Jour' };

            const result = await shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère Partiellement Mise à Jour');
        });

        test('should update only location when provided', async () => {
            const updates = { location: 'Nouvelle location partielle' };

            const result = await shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère 1'); // Should remain unchanged
            expect(mockShelves[0].location).toBe('Nouvelle location partielle');
        });

        test('should update both name and location in partial update', async () => {
            const updates = { name: 'Nouveau nom', location: 'Nouvelle location' };

            const result = await shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Nouveau nom');
            expect(mockShelves[0].location).toBe('Nouvelle location');
        });

        test('should set location to null in partial update', async () => {
            const updates = { location: null };

            const result = await shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère 1'); // Should remain unchanged
            expect(mockShelves[0].location).toBeNull();
        });

        test('should be successful with no updates (no-op)', async () => {
            const updates = {};

            const result = await shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère 1'); // Should remain unchanged
        });

        test('should return false when shelf not found', async () => {
            const updates = { name: 'Test' };

            const result = await shelvesService.updatePartial('00000000-0000-0000-0000-000000000000', updates);

            expect(result).toBe(false);
        });

        test('should throw error when name is empty in partial update', async () => {
            const updates = { name: '' };

            await expect(shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates)).rejects.toThrow('Shelf name cannot be empty');
        });

        test('should trim whitespace in partial update', async () => {
            const updates = { name: '  Étagère Partiellement Trimée  ' };

            const result = await shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère Partiellement Trimée');
        });

        test('should throw 409 error when partial updating to existing shelf name', async () => {
            const updates = { name: 'Étagère 3' }; // Name already exists in mock data

            const error = await shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates).catch(e => e);

            expect(error.message).toBe('Shelf already exists');
            expect(error.statusCode).toBe(409);
            expect(mockShelves[0].name).toBe('Étagère 1'); // Should remain unchanged
        });

        test('should allow partial updating shelf with its own name', async () => {
            const updates = { name: 'Étagère 1' }; // Same name as current shelf

            const result = await shelvesService.updatePartial('d4e5f6g7-h8i9-0123-def0-234567890123', updates);

            expect(result).toBe(true);
            expect(mockShelves[0].name).toBe('Étagère 1');
        });
    });

    describe('remove', () => {
        test('should delete shelf successfully', async () => {
            const result = await shelvesService.remove('e5f6g7h8-i9j0-1234-ef01-345678901234'); // Use a shelf that has no books

            expect(result).toBe(true);
            expect(mockShelves).toHaveLength(2);
            expect(mockShelves.find(s => s.id === 'e5f6g7h8-i9j0-1234-ef01-345678901234')).toBeUndefined();
        });

        test('should return false when shelf not found', async () => {
            const result = await shelvesService.remove('00000000-0000-0000-0000-000000000000');

            expect(result).toBe(false);
            expect(mockShelves).toHaveLength(3);
        });

        test('should throw error when shelf contains books', async () => {
            // Assign a book to the shelf before trying to delete it
            mockBooks[0].shelf = 'd4e5f6g7-h8i9-0123-def0-234567890123';

            await expect(shelvesService.remove('d4e5f6g7-h8i9-0123-def0-234567890123')).rejects.toThrow('Cannot delete shelf: it contains books');
        });
    });
});

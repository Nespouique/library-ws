// Simple unit tests with manual mocks
import { describe, test, expect, beforeEach } from '@jest/globals';
import { getOffset, emptyOrRows } from '../utils/helper.js';

// Mock data for testing with UUIDs
const mockAuthors = [
    { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', firstName: 'John', lastName: 'Doe' },
    { id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901', firstName: 'Jane', lastName: 'Smith' },
    { id: 'c3d4e5f6-g7h8-9012-cdef-123456789012', firstName: 'Bob', lastName: 'Johnson' },
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
    },
    {
        id: 'f6g7h8i9-j0k1-2345-f012-456789012345',
        title: 'Book 2',
        author: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
        isbn: '9876543210987',
        date: '2024-02-01',
        description: 'Description 2',
        jacket: '/cover2.jpg',
    },
];

const mockShelves = [
    { id: 'd4e5f6g7-h8i9-0123-def0-234567890123' }, 
    { id: 'e5f6g7h8-i9j0-1234-ef01-345678901234' }, 
    { id: 'f6g7h8i9-j0k1-2345-f012-456789012345' }
];

// Generate UUID-like string for testing
function generateTestUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Simple service implementations with mock data
const authorsService = {
    async getMultiple(page = 1) {
        const listPerPage = 10;
        const offset = getOffset(page, listPerPage);
        const data = emptyOrRows(
            mockAuthors.slice(offset, offset + listPerPage)
        );
        return { data, meta: { page } };
    },

    async getById(id) {
        const author = mockAuthors.find(a => a.id === id);
        return author || null;
    },

    async create(author) {
        // Check if author already exists
        const existing = mockAuthors.find(
            a =>
                a.firstName === author.firstName &&
                a.lastName === author.lastName
        );        if (existing) {
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
        // Check for duplicate name
        const duplicate = mockAuthors.find(
            a =>
                a.id !== id &&
                a.firstName === author.firstName &&
                a.lastName === author.lastName
        );
        if (duplicate) {
            const error = new Error(
                'Another author with this name already exists'
            );
            error.statusCode = 409;
            throw error;
        }

        const index = mockAuthors.findIndex(a => a.id === id);
        if (index === -1) return false;

        mockAuthors[index] = { ...mockAuthors[index], ...author };
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
    async getMultiple(page = 1) {
        const listPerPage = 10;
        const offset = getOffset(page, listPerPage);
        const data = emptyOrRows(mockBooks.slice(offset, offset + listPerPage));
        return { data, meta: { page } };
    },

    async getById(id) {
        const book = mockBooks.find(b => b.id === id);
        return book || null;
    },

    async create(book) {
        // Check if author exists
        const authorExists = mockAuthors.find(a => a.id === book.author);
        if (!authorExists) {
            const error = new Error('Author does not exist');
            error.statusCode = 400;
            throw error;
        }

        // Check for duplicate ISBN
        const existing = mockBooks.find(b => b.isbn === book.isbn);
        if (existing) {
            const error = new Error('Book with this ISBN already exists');
            error.statusCode = 409;
            throw error;
        }        const newId = generateTestUuid();
        const newBook = { id: newId, ...book };
        mockBooks.push(newBook);
        return newBook;
    },

    async update(id, book) {
        // Check if author exists
        if (book.author) {
            const authorExists = mockAuthors.find(a => a.id === book.author);
            if (!authorExists) {
                const error = new Error('Author does not exist');
                error.statusCode = 400;
                throw error;
            }
        }

        // Check for duplicate ISBN
        if (book.isbn) {
            const duplicate = mockBooks.find(
                b => b.id !== id && b.isbn === book.isbn
            );
            if (duplicate) {
                const error = new Error(
                    'Another book with this ISBN already exists'
                );
                error.statusCode = 409;
                throw error;
            }
        }

        const index = mockBooks.findIndex(b => b.id === id);
        if (index === -1) return false;

        mockBooks[index] = { ...mockBooks[index], ...book };
        return true;
    },

    async remove(id) {
        const index = mockBooks.findIndex(b => b.id === id);
        if (index === -1) return false;

        mockBooks.splice(index, 1);
        return true;
    },
};

const shelvesService = {
    async getMultiple(page = 1) {
        const listPerPage = 10;
        const offset = getOffset(page, listPerPage);
        const data = emptyOrRows(
            mockShelves.slice(offset, offset + listPerPage)
        );
        return { data, meta: { page } };
    },

    async getById(id) {
        const shelf = mockShelves.find(s => s.id === id);
        return shelf || null;
    },    async create() {
        const newId = generateTestUuid();
        const newShelf = { id: newId };
        mockShelves.push(newShelf);
        return { message: 'Shelf created successfully', id: newId };
    },

    async update(id) {
        const index = mockShelves.findIndex(s => s.id === id);
        if (index === -1) return { message: 'Error in updating shelf' };

        return { message: 'Shelf updated successfully' };
    },

    async remove(id) {
        // Check if shelf is referenced by any books
        const booksOnShelf = mockBooks.filter(b => b.shelf === id);
        if (booksOnShelf.length > 0) {
            throw new Error('Cannot delete shelf: it contains books');
        }

        const index = mockShelves.findIndex(s => s.id === id);
        if (index === -1) return { message: 'Error in deleting shelf' };

        mockShelves.splice(index, 1);
        return { message: 'Shelf deleted successfully' };
    },
};

describe('Authors Service - Unit Tests with Mock Data (UUID)', () => {
    beforeEach(() => {
        // Reset mock data before each test
        mockAuthors.length = 0;
        mockAuthors.push(
            { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', firstName: 'John', lastName: 'Doe' },
            { id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901', firstName: 'Jane', lastName: 'Smith' },
            { id: 'c3d4e5f6-g7h8-9012-cdef-123456789012', firstName: 'Bob', lastName: 'Johnson' }
        );
    });

    describe('getMultiple', () => {
        test('should return paginated authors', async () => {
            const result = await authorsService.getMultiple(1);

            expect(result).toEqual({
                data: mockAuthors,
                meta: { page: 1 },
            });
        });        test('should handle empty results', async () => {
            mockAuthors.length = 0; // Clear mock data

            const result = await authorsService.getMultiple(1);

            expect(result).toEqual({
                data: [],
                meta: { page: 1 },
            });
        });

        test('should handle pagination correctly', async () => {
            // Add more authors for pagination test
            for (let i = 4; i <= 15; i++) {
                mockAuthors.push({
                    id: generateTestUuid(),
                    firstName: `Author${i}`,
                    lastName: `Last${i}`,
                });
            }

            const page1 = await authorsService.getMultiple(1);
            const page2 = await authorsService.getMultiple(2);

            expect(page1.data).toHaveLength(10);
            expect(page1.meta.page).toBe(1);
            expect(page2.data).toHaveLength(5);
            expect(page2.meta.page).toBe(2);
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

    describe('create', () => {        test('should create new author successfully', async () => {
            const newAuthor = { firstName: 'Alice', lastName: 'Wonder' };

            const result = await authorsService.create(newAuthor);

            expect(result.firstName).toBe('Alice');
            expect(result.lastName).toBe('Wonder');
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockAuthors).toHaveLength(4);
        });

        test('should throw error when author already exists', async () => {
            const existingAuthor = { firstName: 'John', lastName: 'Doe' };

            await expect(authorsService.create(existingAuthor)).rejects.toThrow(
                'Author already exists'
            );
        });
    });    describe('update', () => {
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

            await expect(authorsService.update('a1b2c3d4-e5f6-7890-abcd-ef1234567890', updateData)).rejects.toThrow(
                'Another author with this name already exists'
            );
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
            },
            {
                id: 'f6g7h8i9-j0k1-2345-f012-456789012345',
                title: 'Book 2',
                author: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
                isbn: '9876543210987',
                date: '2024-02-01',
                description: 'Description 2',
                jacket: '/cover2.jpg',
            }
        );
    });

    describe('getMultiple', () => {
        test('should return paginated books', async () => {
            const result = await booksService.getMultiple(1);

            expect(result).toEqual({
                data: mockBooks,
                meta: { page: 1 },
            });
        });
    });    describe('getById', () => {
        test('should return book when found', async () => {
            const result = await booksService.getById('e5f6g7h8-i9j0-1234-ef01-345678901234');

            expect(result).toEqual(mockBooks[0]);
        });

        test('should return null when not found', async () => {
            const result = await booksService.getById('00000000-0000-0000-0000-000000000000');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new book successfully', async () => {
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
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockBooks).toHaveLength(3);
        });        test('should throw error when author does not exist', async () => {
            const newBook = {
                title: 'Invalid Book',
                author: '00000000-0000-0000-0000-000000000000',
                isbn: '1111111111111',
            };

            await expect(booksService.create(newBook)).rejects.toThrow(
                'Author does not exist'
            );
        });

        test('should throw error when ISBN already exists', async () => {
            const newBook = {
                title: 'Duplicate ISBN Book',
                author: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                isbn: '1234567890123', // Existing ISBN
            };

            await expect(booksService.create(newBook)).rejects.toThrow(
                'Book with this ISBN already exists'
            );
        });
    });

    describe('update', () => {
        test('should update book successfully', async () => {
            const updateData = { title: 'Updated Book Title' };

            const result = await booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData);            expect(result).toBe(true);
            expect(mockBooks[0].title).toBe('Updated Book Title');
        });

        test('should return false when book not found', async () => {
            const updateData = { title: 'Updated Title' };

            const result = await booksService.update('00000000-0000-0000-0000-000000000000', updateData);

            expect(result).toBe(false);
        });

        test('should throw error when author does not exist', async () => {
            const updateData = { author: '00000000-0000-0000-0000-000000000000' };

            await expect(booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData)).rejects.toThrow(
                'Author does not exist'
            );
        });

        test('should throw error when ISBN already exists', async () => {
            const updateData = { isbn: '9876543210987' }; // Existing ISBN from book 2

            await expect(booksService.update('e5f6g7h8-i9j0-1234-ef01-345678901234', updateData)).rejects.toThrow(
                'Another book with this ISBN already exists'
            );
        });
    });

    describe('remove', () => {        test('should delete book successfully', async () => {
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
});

describe('Helper Functions', () => {
    test('getOffset should calculate correct offset', () => {
        expect(getOffset(1, 10)).toBe(0);
        expect(getOffset(2, 10)).toBe(10);
        expect(getOffset(3, 5)).toBe(10);
        expect(getOffset(1, 5)).toBe(0);
        expect(getOffset(4, 10)).toBe(30);
    });

    test('emptyOrRows should handle null/undefined', () => {
        expect(emptyOrRows(null)).toEqual([]);
        expect(emptyOrRows(undefined)).toEqual([]);
        expect(emptyOrRows([])).toEqual([]);
        expect(emptyOrRows([1, 2, 3])).toEqual([1, 2, 3]);        expect(emptyOrRows(['a', 'b'])).toEqual(['a', 'b']);
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
            { id: 'd4e5f6g7-h8i9-0123-def0-234567890123' }, 
            { id: 'e5f6g7h8-i9j0-1234-ef01-345678901234' }, 
            { id: 'f6g7h8i9-j0k1-2345-f012-456789012345' }
        );
    });

    describe('getMultiple', () => {
        test('should return paginated shelves', async () => {
            const result = await shelvesService.getMultiple(1);

            expect(result).toEqual({
                data: mockShelves,
                meta: { page: 1 },
            });
        });

        test('should handle empty results', async () => {
            mockShelves.length = 0; // Clear mock data

            const result = await shelvesService.getMultiple(1);

            expect(result).toEqual({
                data: [],
                meta: { page: 1 },
            });
        });
    });    
    
    describe('getById', () => {
        test('should return shelf when found', async () => {
            const result = await shelvesService.getById('d4e5f6g7-h8i9-0123-def0-234567890123');

            expect(result).toEqual({ id: 'd4e5f6g7-h8i9-0123-def0-234567890123' });
        });

        test('should return null when not found', async () => {
            const result = await shelvesService.getById('00000000-0000-0000-0000-000000000000');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new shelf successfully', async () => {
            const result = await shelvesService.create();            expect(result.message).toBe('Shelf created successfully');
            expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(mockShelves).toHaveLength(4);
        });
    });    describe('update', () => {
        test('should update shelf successfully', async () => {
            const result = await shelvesService.update('d4e5f6g7-h8i9-0123-def0-234567890123');

            expect(result).toEqual({
                message: 'Shelf updated successfully',
            });
        });

        test('should return error when shelf not found', async () => {
            const result = await shelvesService.update('00000000-0000-0000-0000-000000000000');

            expect(result).toEqual({
                message: 'Error in updating shelf',
            });
        });
    });

    describe('remove', () => {        test('should delete shelf successfully', async () => {
            const result = await shelvesService.remove('d4e5f6g7-h8i9-0123-def0-234567890123');

            expect(result).toEqual({
                message: 'Shelf deleted successfully',
            });
            expect(mockShelves).toHaveLength(2);
            expect(mockShelves.find(s => s.id === 'd4e5f6g7-h8i9-0123-def0-234567890123')).toBeUndefined();
        });

        test('should return error when shelf not found', async () => {
            const result = await shelvesService.remove('00000000-0000-0000-0000-000000000000');

            expect(result).toEqual({
                message: 'Error in deleting shelf',
            });
            expect(mockShelves).toHaveLength(3);
        });        test('should throw error when shelf contains books', async () => {
            // Add a book with shelf reference
            mockBooks.push({ 
                id: 'test-book-uuid', 
                title: 'Test Book', 
                shelf: 'd4e5f6g7-h8i9-0123-def0-234567890123' 
            });

            await expect(shelvesService.remove('d4e5f6g7-h8i9-0123-def0-234567890123')).rejects.toThrow(
                'Cannot delete shelf: it contains books'
            );
        });
    });
});
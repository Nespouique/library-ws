// Simple unit tests with manual mocks
import { describe, test, expect, beforeEach } from '@jest/globals';
import { getOffset, emptyOrRows } from '../utils/helper.js';

// Mock data for testing
const mockAuthors = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson' },
];

const mockBooks = [
    {
        id: 1,
        title: 'Book 1',
        author: 1,
        isbn: '1234567890123',
        date: '2024-01-01',
        description: 'Description 1',
        jacket: '/cover1.jpg',
    },
    {
        id: 2,
        title: 'Book 2',
        author: 2,
        isbn: '9876543210987',
        date: '2024-02-01',
        description: 'Description 2',
        jacket: '/cover2.jpg',
    },
];

const mockShelves = [{ id: 1 }, { id: 2 }, { id: 3 }];

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
        );
        if (existing) {
            const error = new Error('Author already exists');
            error.statusCode = 409;
            throw error;
        }

        const newId = Math.max(...mockAuthors.map(a => a.id)) + 1;
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
        }

        const newId = Math.max(...mockBooks.map(b => b.id)) + 1;
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
    },

    async create() {
        const newId = Math.max(...mockShelves.map(s => s.id)) + 1;
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

describe('Authors Service - Unit Tests with Mock Data', () => {
    beforeEach(() => {
        // Reset mock data before each test
        mockAuthors.length = 0;
        mockAuthors.push(
            { id: 1, firstName: 'John', lastName: 'Doe' },
            { id: 2, firstName: 'Jane', lastName: 'Smith' },
            { id: 3, firstName: 'Bob', lastName: 'Johnson' }
        );
    });

    describe('getMultiple', () => {
        test('should return paginated authors', async () => {
            const result = await authorsService.getMultiple(1);

            expect(result).toEqual({
                data: mockAuthors,
                meta: { page: 1 },
            });
        });

        test('should handle empty results', async () => {
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
                    id: i,
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
            const result = await authorsService.getById(1);

            expect(result).toEqual({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
            });
        });

        test('should return null when not found', async () => {
            const result = await authorsService.getById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new author successfully', async () => {
            const newAuthor = { firstName: 'Alice', lastName: 'Wonder' };

            const result = await authorsService.create(newAuthor);

            expect(result).toEqual({
                id: 4,
                firstName: 'Alice',
                lastName: 'Wonder',
            });
            expect(mockAuthors).toHaveLength(4);
        });

        test('should throw error when author already exists', async () => {
            const existingAuthor = { firstName: 'John', lastName: 'Doe' };

            await expect(authorsService.create(existingAuthor)).rejects.toThrow(
                'Author already exists'
            );
        });
    });

    describe('update', () => {
        test('should update author successfully', async () => {
            const updateData = { firstName: 'Johnny', lastName: 'Doe' };

            const result = await authorsService.update(1, updateData);

            expect(result).toBe(true);
            expect(mockAuthors[0]).toEqual({
                id: 1,
                firstName: 'Johnny',
                lastName: 'Doe',
            });
        });

        test('should return false when author not found', async () => {
            const updateData = { firstName: 'Johnny', lastName: 'Doe' };

            const result = await authorsService.update(999, updateData);

            expect(result).toBe(false);
        });

        test('should throw error when duplicate name exists', async () => {
            const updateData = { firstName: 'Jane', lastName: 'Smith' }; // Existing name

            await expect(authorsService.update(1, updateData)).rejects.toThrow(
                'Another author with this name already exists'
            );
        });
    });

    describe('remove', () => {
        test('should delete author successfully', async () => {
            const result = await authorsService.remove(1);

            expect(result).toBe(true);
            expect(mockAuthors).toHaveLength(2);
            expect(mockAuthors.find(a => a.id === 1)).toBeUndefined();
        });

        test('should return false when author not found', async () => {
            const result = await authorsService.remove(999);

            expect(result).toBe(false);
            expect(mockAuthors).toHaveLength(3);
        });
    });
});

describe('Books Service - Unit Tests with Mock Data', () => {
    beforeEach(() => {
        // Reset mock data before each test
        mockBooks.length = 0;
        mockBooks.push(
            {
                id: 1,
                title: 'Book 1',
                author: 1,
                isbn: '1234567890123',
                date: '2024-01-01',
                description: 'Description 1',
                jacket: '/cover1.jpg',
            },
            {
                id: 2,
                title: 'Book 2',
                author: 2,
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
    });

    describe('getById', () => {
        test('should return book when found', async () => {
            const result = await booksService.getById(1);

            expect(result).toEqual(mockBooks[0]);
        });

        test('should return null when not found', async () => {
            const result = await booksService.getById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new book successfully', async () => {
            const newBook = {
                title: 'New Book',
                date: '2025-01-01',
                author: 1,
                description: 'New Description',
                isbn: '1111111111111',
                jacket: '/new-cover.jpg',
            };

            const result = await booksService.create(newBook);

            expect(result).toEqual({ id: 3, ...newBook });
            expect(mockBooks).toHaveLength(3);
        });

        test('should throw error when author does not exist', async () => {
            const newBook = {
                title: 'Invalid Book',
                author: 999,
                isbn: '1111111111111',
            };

            await expect(booksService.create(newBook)).rejects.toThrow(
                'Author does not exist'
            );
        });

        test('should throw error when ISBN already exists', async () => {
            const newBook = {
                title: 'Duplicate ISBN Book',
                author: 1,
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

            const result = await booksService.update(1, updateData);

            expect(result).toBe(true);
            expect(mockBooks[0].title).toBe('Updated Book Title');
        });

        test('should return false when book not found', async () => {
            const updateData = { title: 'Updated Title' };

            const result = await booksService.update(999, updateData);

            expect(result).toBe(false);
        });

        test('should throw error when author does not exist', async () => {
            const updateData = { author: 999 };

            await expect(booksService.update(1, updateData)).rejects.toThrow(
                'Author does not exist'
            );
        });

        test('should throw error when ISBN already exists', async () => {
            const updateData = { isbn: '9876543210987' }; // Existing ISBN from book 2

            await expect(booksService.update(1, updateData)).rejects.toThrow(
                'Another book with this ISBN already exists'
            );
        });
    });

    describe('remove', () => {
        test('should delete book successfully', async () => {
            const result = await booksService.remove(1);

            expect(result).toBe(true);
            expect(mockBooks).toHaveLength(1);
            expect(mockBooks.find(b => b.id === 1)).toBeUndefined();
        });

        test('should return false when book not found', async () => {
            const result = await booksService.remove(999);

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
        expect(emptyOrRows([1, 2, 3])).toEqual([1, 2, 3]);
        expect(emptyOrRows(['a', 'b'])).toEqual(['a', 'b']);
    });
    test('emptyOrRows should preserve object properties', () => {
        const testData = [
            { id: 1, name: 'Test' },
            { id: 2, name: 'Test2' },
        ];

        expect(emptyOrRows(testData)).toEqual(testData);
        expect(emptyOrRows(testData)).toBe(testData); // Should return the same reference for efficiency
    });
});

describe('Shelves Service - Unit Tests with Mock Data', () => {
    beforeEach(() => {
        // Reset mock data before each test
        mockShelves.length = 0;
        mockShelves.push({ id: 1 }, { id: 2 }, { id: 3 });
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
            const result = await shelvesService.getById(1);

            expect(result).toEqual({ id: 1 });
        });

        test('should return null when not found', async () => {
            const result = await shelvesService.getById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new shelf successfully', async () => {
            const result = await shelvesService.create();

            expect(result).toEqual({
                message: 'Shelf created successfully',
                id: 4,
            });
            expect(mockShelves).toHaveLength(4);
            expect(mockShelves[3]).toEqual({ id: 4 });
        });
    });

    describe('update', () => {
        test('should update shelf successfully', async () => {
            const result = await shelvesService.update(1);

            expect(result).toEqual({
                message: 'Shelf updated successfully',
            });
        });

        test('should return error when shelf not found', async () => {
            const result = await shelvesService.update(999);

            expect(result).toEqual({
                message: 'Error in updating shelf',
            });
        });
    });

    describe('remove', () => {
        test('should delete shelf successfully', async () => {
            const result = await shelvesService.remove(1);

            expect(result).toEqual({
                message: 'Shelf deleted successfully',
            });
            expect(mockShelves).toHaveLength(2);
            expect(mockShelves.find(s => s.id === 1)).toBeUndefined();
        });

        test('should return error when shelf not found', async () => {
            const result = await shelvesService.remove(999);

            expect(result).toEqual({
                message: 'Error in deleting shelf',
            });
            expect(mockShelves).toHaveLength(3);
        });

        test('should throw error when shelf contains books', async () => {
            // Add a book with shelf reference
            mockBooks.push({ id: 3, title: 'Test Book', shelf: 1 });

            await expect(shelvesService.remove(1)).rejects.toThrow(
                'Cannot delete shelf: it contains books'
            );
        });
    });
});

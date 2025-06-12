import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Library Web Service API',
            version: '1.0.0',
            description:
                'Node.js/Express REST API for library management with complete CRUD operations for books and authors. Designed for a future Android barcode scanning application.',
            contact: {
                name: 'Library API Support',
                email: 'support@library-api.com',
            },
            license: {
                name: 'Private',
                url: 'https://example.com/license',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'https://api.library.com',
                description: 'Production server',
            },
        ],
        components: {
            schemas: {                Author: {
                    type: 'object',
                    required: ['firstName', 'lastName'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'The UUID of the author',
                            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        },
                        firstName: {
                            type: 'string',
                            description: 'Author first name',
                            example: 'Victor',
                        },
                        lastName: {
                            type: 'string',
                            description: 'Author last name',
                            example: 'HUGO',
                        },
                    },
                },
                Book: {
                    type: 'object',
                    required: ['title', 'author', 'isbn'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'The UUID of the book',
                            example: 'e5f6g7h8-i9j0-1234-ef01-345678901234',
                        },
                        title: {
                            type: 'string',
                            description: 'Book title',
                            example: 'Les Misérables',
                        },
                        author: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Author UUID (foreign key)',
                            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        },
                        isbn: {
                            type: 'string',
                            description: 'ISBN-13 code',
                            example: '9782253096337',
                        },
                        date: {
                            type: 'string',
                            format: 'date',
                            description: 'Publication date',
                            example: '1998-12-02',
                        },
                        description: {
                            type: 'string',
                            description: 'Book description',
                            example:
                                'Les Misérables is a French historical novel by Victor Hugo...',
                        },
                        jacket: {
                            type: 'string',
                            description: 'Cover image URL',
                            example: '/covers/les-miserables.jpg',
                        },
                        shelf: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Shelf UUID in library',
                            example: 'c3d4e5f6-g7h8-9012-cdef-123456789012',
                        },
                    },
                },
                Shelf: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'The UUID of the shelf',
                            example: 'c3d4e5f6-g7h8-9012-cdef-123456789012',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Resource not found',
                        },
                    },
                },
                PaginatedAuthors: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Author',
                            },
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                page: {
                                    type: 'integer',
                                    example: 1,
                                },
                            },
                        },
                    },
                },
                PaginatedBooks: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Book',
                            },
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                page: {
                                    type: 'integer',
                                    example: 1,
                                },
                            },
                        },
                    },
                },
                PaginatedShelves: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Shelf',
                            },
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                page: {
                                    type: 'integer',
                                    example: 1,
                                },
                            },
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authors',
                description: 'Operations about authors',
            },
            {
                name: 'Books',
                description: 'Operations about books',
            },
            {
                name: 'Shelves',
                description: 'Operations about library shelves',
            },
        ],
    },
    apis: ['./routes/*.js', './index.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };

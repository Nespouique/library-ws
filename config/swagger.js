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
            schemas: {
                Author: {
                    type: 'object',
                    required: ['firstName', 'lastName'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'The auto-generated id of the author',
                            example: 1,
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
                            type: 'integer',
                            description: 'The auto-generated id of the book',
                            example: 1,
                        },
                        title: {
                            type: 'string',
                            description: 'Book title',
                            example: 'Les Misérables',
                        },
                        author: {
                            type: 'integer',
                            description: 'Author ID (foreign key)',
                            example: 1,
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
                            type: 'integer',
                            description: 'Shelf number in library',
                            example: 1,
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
        ],
    },
    apis: ['./routes/*.js', './index.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };

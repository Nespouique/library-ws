import dotenv from 'dotenv';
dotenv.config();
const config = {
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    images: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        jacketSizes: {
            small: {
                width: 200,
                height: 300,
                quality: 85,
                format: 'webp',
            },
            medium: {
                width: 300,
                height: 450,
                quality: 90,
                format: 'webp',
            },
            large: {
                width: 500,
                height: 750,
                quality: 95,
                format: 'webp',
            },
        },
    },
};
export default config;

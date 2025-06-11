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
    listPerPage: parseInt(process.env.LIST_PER_PAGE) || 10,
};
export default config;

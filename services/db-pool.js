import mysql from 'mysql2/promise';
import config from '../config/config.js';

// Pool de connexions pour de meilleures performances
const pool = mysql.createPool({
    ...config.db,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results;
}

async function closePool() {
    await pool.end();
}

export default {
    query,
    closePool,
};

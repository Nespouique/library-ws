import db from './db.js';
import { getOffset, emptyOrRows } from '../helper.js';
import config from '../config.js';

async function getMultiple(page = 1){
    const offset = getOffset(page, config.listPerPage);
    const rows = await db.query(
        `SELECT id, firstName, lastName 
    FROM Authors LIMIT ${offset},${config.listPerPage}`
    );
    const data = emptyOrRows(rows);
    const meta = {page};
    return {
        data,
        meta
    }
}

export default { getMultiple };
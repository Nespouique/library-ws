import db from './db.js';
import { getOffset, emptyOrRows } from '../utils/helper.js';
import config from '../config/config.js';

async function getMultiple(page = 1){
    const offset = getOffset(page, config.listPerPage);
    const rows = await db.query(
        `select B.id, B.title, B.date, CONCAT(A.firstName, ' ', A.lastName) as author, B.description, B.isbn, B.jacket
         from Books B join Authors A on A.id = B.author LIMIT ${offset},${config.listPerPage}`
    );
    const data = emptyOrRows(rows);
    const meta = {page};
    return {
        data,
        meta
    }
}

export default { getMultiple };
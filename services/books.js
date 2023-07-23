const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
        `select B.id, B.title, B.date, CONCAT(A.firstName, ' ', A.lastName) as author, B.description, B.isbn, B.jacket
         from Books B join Authors A on A.id = B.author LIMIT ${offset},${config.listPerPage}`
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};

    return {
        data,
        meta
    }
}

module.exports = {
    getMultiple
}
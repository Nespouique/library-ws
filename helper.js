export function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * listPerPage;
}

export function emptyOrRows(rows) {
    if (!rows) {
        return [];
    }
    return rows;
}
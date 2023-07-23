const config = {
    db: {
        /* don't expose password or any sensitive info, done only for demo */
        host: "192.168.1.32",
        port: 3307,
        user: "libraryDB",
        password: "L1br@ry_DB",
        database: "Library",
    },
    listPerPage: 10,
};
module.exports = config;
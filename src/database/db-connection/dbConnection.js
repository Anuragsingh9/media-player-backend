const mysql = require("mysql2");
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.HOST_USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE_NAME
});

db.connect((error) => {
    if(error){
        throw error;
    }
    console.log("DB connections established successfully!");
});

module.exports = db;
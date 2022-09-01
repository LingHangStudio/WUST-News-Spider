const mysql = require('mysql')


const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "admin123",
    database: "xinwenzixun",
    port:"3306",
    //链接新闻资讯表
  });

module.exports = db
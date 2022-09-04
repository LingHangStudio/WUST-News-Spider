const mysql = require('mysql')


const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "admin123",
  database: "lh_news",
  port:"3306",
  //链接新闻资讯表
});

db.query('select 1', (err, results) => {
  if (err) return console.log(err.message)
  console.log('数据库连接成功')//测试是否能正确链接
})



module.exports = db
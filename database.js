const mysql = require('mysql')


function database() {
	const db = mysql.createPool({
		host: "127.0.0.1",
		user: "root",
		password: "admin123",
		database: "wust-news",
		port:"3306"
	})
	return db
}


async function testDatabase(db) {
	return new Promise(function(resolve) {
		db.query('SELECT 1', function(err, res) {
			if (err) {
				console.log(err.message)
			}
			else {
				console.log('Database link successfully.')
				resolve(res)
			}
		})
	})
}


async function createTableIfNotExist(db, tb) {
	return new Promise(function(resolve) {
		db.query(`CREATE TABLE IF NOT EXISTS ${tb} (
			id INT NOT NULL AUTO_INCREMENT,
			part INT,
			sub INT,
			data MEDIUMTEXT,
			title MEDIUMTEXT,
			time TINYTEXT,
			href TINYTEXT,
			other MEDIUMTEXT,
			PRIMARY KEY (id)
		)`, function(err, res) {
			if (err) {
				console.log(err.message)
			}
			else {
				console.log(`Make sure table '${tb}' exist.`)
				resolve(res)
			}
		})
	})
}


module.exports = {
	database,
	testDatabase,
	createTableIfNotExist
}

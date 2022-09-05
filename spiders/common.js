const axios = require("axios")
const cheerio = require("cheerio")
const database = require("../database")
let https = require("https")



// 查寻 href 的新闻的数组
async function queryNews(db, tb, href) {
	return new Promise(function(resolve) {
		db.query(
			`SELECT * FROM ${tb} WHERE href = '${href}' `,
			function(err, results) {
				resolve(results)
			}
		)
	})
}


// 读取新闻 HTML ，并写入数据库
async function readHtml(db, tb, environment, href, html) {
	const $ = cheerio.load(html)

	// 新闻时间
	var timeSelector = environment.config.timeSelector
	if (timeSelector == undefined) {timeSelector = '.arti_update'}
	let time = $(timeSelector).text()
	var targetStr = time.match(/[0-9]+-[0-9]+-[0-9]+/)[0]
	var targetArr = targetStr.split(/-/)
	var date = {
		year: parseInt(targetArr[0]),
		month: parseInt(targetArr[1]),
		day: parseInt(targetArr[2])
	}

	// 新闻标题
	var titleSelector = environment.config.titleSelector
	if (titleSelector == undefined) {titleSelector = '.bt'}
	let title = $(titleSelector)
		.text()
		.replace(/[\r\n]/g, "")
		.replace(/[ ]/g, "")
	
	// 新闻正文
	var textSelector = environment.config.textSelector
	if (textSelector == undefined) {textSelector = '.read'}
	let text = $(textSelector).html()

	// 存放图片和附件等附加信息，后被转换为字符串存入数据库
	let other = {
		picList: [],
		fileList: []
	}

	// 图片
	var imgSelector = environment.config.imgSelector
	if (imgSelector == undefined) {imgSelector = '.read img'}
	$(imgSelector).each(function(index, elem) {
		let old_pic = $(elem).attr("src");
		let new_pic = ""
		let RE = /^\//
		if (RE.test(old_pic)) {
			new_pic = "https://news.wust.edu.cn" + old_pic
		}
		else {
			new_pic = old_pic
		}

		other.picList.push(new_pic)
	})

	// 附件
	var appendixSelector = environment.config.appendixSelector
	if (appendixSelector == undefined) {appendixSelector = 'img+a'}
	$(appendixSelector).each(function(index, elem) {
		let appendix_title = $(elem).text()
		let appendix = "https://www.wust.edu.cn" + $(elem).attr("href")
		other.fileList.push({
			title: appendix_title,
			url: appendix
		})
	})

	// 写入数据库
	await new Promise(function(resolve) {
		db.query(
			`INSERT INTO ${tb} (part, sub, data, title, time, href, other) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[environment.part, environment.sub, text, title, JSON.stringify(date), href, JSON.stringify(other)],
			function(err, res) {
				if (err) {
					console.log('MySQL Error:', err)
				}
				else {
					console.log(`${title} ${time} add to database successfully.`)
				}
				resolve()
			}
		)
	})
}


// 爬取 environment.spideNews 中的新闻
async function spideNews(db, tb, environment) {
	var urls = environment.spideNews
	for (let idx = urls.length - 1; idx > -1; idx--) {
		var href = urls[idx]
		console.log(idx)
		await axios
		.get(href, {
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
			},
			httpsAgent: environment.agent
		})
		.then(async function(res) {
			await readHtml(db, tb, environment, href, res.data)
		})
	}
}


// 爬取新闻目录页面，把新闻 URL 追加到 environment.allNews 列表中
async function spideContents(environment) {
	await axios
	.get(environment.newsContents, {
		headers: {
			"Content-Type": "application/json;charset=UTF-8",
		},
		httpsAgent: environment.agent,
	})
	.then(function(res) {
		const $ = cheerio.load(res.data)
	
		
		var listSelector = environment.config.listSelector
		if (listSelector == undefined) {listSelector = '.wp_article_list .Article_Title a'}
		$(listSelector).each(function(i, elem) {
			//先获取对应的链接
			//总共20条数据
			let re_news = /^https:\/\/news.wust.edu.cn/
			let re_wust = /^https:\/\/www.wust.edu.cn/
			let re_jwc = /^https:\/\/jwc.wust.edu.cn/
	
			let connect_url = ""
			if (re_news.test(environment.newsContents)) {
				connect_url = "https://news.wust.edu.cn"
			}
			else if (re_wust.test(environment.newsContents)) {
				connect_url = "https://www.wust.edu.cn"
			}
			else if (re_jwc.test(environment.newsContents)) {
				connect_url = "https://jwc.wust.edu.cn"
			}

			let old_url = $(elem).attr("href")
			let new_url = ''
			let RE = /^\//
			if (RE.test(old_url)) {
				new_url = connect_url + old_url
				environment.allNews.push(new_url)
			}
		})
	})
}


// 对照数据库判断哪些是新的新闻需要爬取
async function compareNews(db, tb, environment) {
	for (let i = 0; i < environment.allNews.length; i++) {
		let rtn = await queryNews(db, tb, environment.allNews[i])
		// console.log(re)
		if (!rtn.length) {
			environment.spideNews.push(environment.allNews[i])
		}
	}
	console.log(`${environment.spideNews.length} page will be spide:`, environment.spideNews)
}


async function launch(tb, part, sub, url, config={
	listSelector: undefined,
	titleSelector: undefined,
	timeSelector: undefined,
	textSelector: undefined,
	imgSelector: undefined,
	appendixSelector: undefined
}) {
	// 整理爬取变量
	var environment = {
		// 新闻目录页 URL
		newsContents: url,
		// 大类
		part: part,
		// 小类
		sub: sub,
		// 目录页上的所有新闻 URL 列表
		allNews: [],
		// 需要爬取的新闻 URL 列表
		spideNews: [],
		// HTTPS 代理
		agent: new https.Agent({
			rejectUnauthorized: false,
		}),
		// 爬取配置，选择器字符串等配置
		config: config
	}

	// 创建数据库连接实例
	var db = database.database()
	// 表名
	var tb = tb

	// 如果表不存在则创建
	await database.createTableIfNotExist(db, tb)

	// 爬取新闻目录页面，把新闻 URL 追加到 environment.allNews 列表中
	await spideContents(environment)

	// 对照数据库判断哪些是新的新闻需要爬取
	await compareNews(db, tb, environment)
	
	// 爬取 environment.spideNews 中的新闻
	await spideNews(db, tb, environment)

	// 断开数据库连接
	db.end()
}

module.exports = {
	launch
}

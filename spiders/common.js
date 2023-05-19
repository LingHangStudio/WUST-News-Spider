const axios = require("axios")
const cheerio = require("cheerio")
const database = require("../database")
const https = require("https")
const path = require('path')
const NodeUrl = require('node:url')


axios.default.defaults.timeout = 5000


// 判断路径类型是绝对路径、相对路径还是网络路径
function pathType(pathString) {
	if (path.isAbsolute(pathString)) {
		return 'absolute'
	}
	else {
		if (pathString.length >= 7 && pathString.slice(0, 7) == "http://" || pathString.length >= 8 && pathString.slice(0, 8) == "https://") {
			return 'web'
		}
		else {
			return 'relative'
		}
	}
}


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


function subAssetUrl(currentUrl, assetUrl) {
	var assetUrlType = pathType(assetUrl)
	if (assetUrlType == 'web') {
		return assetUrl
	}
	else if (assetUrlType == 'absolute') {
		var urlObj = new NodeUrl.URL(currentUrl)
		urlObj.pathname = assetUrl
		return decodeURIComponent(urlObj.toString())
	}
	else if (assetUrlType == 'relative') {
		var urlObj = new NodeUrl.URL(currentUrl)
		urlObj.pathname = path.join(path.dirname(urlObj.pathname), assetUrl)
		return decodeURIComponent(urlObj.toString())
	}
}


// 读取新闻 HTML ，并写入数据库
async function readHtml(db, tb, environment, href, html) {
	const $ = cheerio.load(html)

	// 新闻时间
	var timeSelector = environment.config.timeSelector
	if (timeSelector == undefined) {timeSelector = '.arti_update'}
	let time = $(timeSelector).text()
	var targetMatch = time.match(/[0-9]+-[0-9]+-[0-9]+/) || time.match(/[0-9]+年[0-9]+月[0-9]+日/)
	if (targetMatch != null) {
		var targetStr = targetMatch[0]
		var targetArr = targetStr.split(/[-年月日]/)
		var date = {
			year: parseInt(targetArr[0]),
			month: parseInt(targetArr[1]),
			day: parseInt(targetArr[2])
		}
	}
	else {
		var date = {
			year: 0,
			month: 0,
			day: 0
		}
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
		let new_pic = subAssetUrl(href, old_pic)

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
			try {
				await readHtml(db, tb, environment, href, res.data)
			}
			catch(err) {
				console.log(`${href} spide failed.`, err)
			}
		})
		// await new Promise(function(resolve) {
		// 	setTimeout(function() {
		// 		resolve()
		// 	}, 1000)
		// })
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
			var hrefUrl = $(elem).attr("href")
			var hrefUrlType = pathType(hrefUrl)
			var newsUrl = ''
			if (hrefUrlType == 'web') {
				// 可能跳转到其他网站，所以不爬取
				newsUrl = ''
			}
			else if (hrefUrlType == 'absolute') {
				var baseUrl = environment.newsContents.match(/http[a-zA-Z.:\/]+/)[0]
				newsUrl = baseUrl.concat(hrefUrl.slice(1))
			}
			else if (hrefUrlType == 'relative') {
				newsUrl = subAssetUrl(environment.newsContents, hrefUrl)
			}

			if (newsUrl != '' && path.extname(newsUrl) == '.htm') {
				environment.allNews.push(newsUrl)
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

	try {
		// 爬取新闻目录页面，把新闻 URL 追加到 environment.allNews 列表中
		await spideContents(environment)

		// 对照数据库判断哪些是新的新闻需要爬取
		await compareNews(db, tb, environment)
		
		// 爬取 environment.spideNews 中的新闻
		await spideNews(db, tb, environment)
	}
	catch(err) {
		console.log('Task spide failed.', err)
	}

	// 断开数据库连接
	db.end()
}

module.exports = {
	launch
}

const commonSpider = require('./common')



async function launch(tb, part, sub, url) {
	await commonSpider.launch(tb, part, sub, url, {
		listSelector: '#wp_news_w82 .news_title a',
		titleSelector: '.arti_title',
		timeSeletor: '.arti_update',
		textSelector: '.read',
		imgSelector: '.read img',
		appendixSelector: 'img+a'
	})
}


module.exports = {
	launch
}

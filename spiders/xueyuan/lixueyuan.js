const commonSpider = require('../common')



async function launch(tb, part, sub, url) {
	await commonSpider.launch(tb, part, sub, url, {
		listSelector: '#wp_news_w6 td a[href]',
		titleSelector: '.biaoti3',
		timeSelector: '.border2 td',
		textSelector: '.article',
		imgSelector: '.article img',
		appendixSelector: 'img+a'
	})
}


module.exports = {
	launch
}

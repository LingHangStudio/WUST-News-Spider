const commonSpider = require('./common')



async function launch(tb, part, sub, url) {
	await commonSpider.launch(tb, part, sub, url, {
		listSelector: '.wp_article_list .Article_Title a',
		titleSelector: '.bt',
		timeSelector: '.arti_update',
		textSelector: '.read',
		imgSelector: '.read img',
		appendixSelector: 'img+a'
	})
}


module.exports = {
	launch
}

const commonSpider = require('./common')



async function launch(tb, part, sub, url) {
	await commonSpider.launch(tb, part, sub, url, {
		listSelector: '.col_news .Article_Title a',
		titleSelector: '.arti_title',
		timeSelector: '.arti_update',
		textSelector: '.read',
		imgSelector: '.read img',
		appendixSelector: 'img+a'
	})
}


module.exports = {
	launch
}

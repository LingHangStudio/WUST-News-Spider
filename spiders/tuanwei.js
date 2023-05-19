const commonSpider = require('./common')



async function launch(tb, part, sub, url) {
	await commonSpider.launch(tb, part, sub, url, {
		listSelector: '.new_list li a',
		titleSelector: '.cotit',
		timeSelector: '.sjkk',
		textSelector: '.v_news_content',
		imgSelector: '.v_news_content img',
		appendixSelector: 'img+a'
	})
}


module.exports = {
	launch
}

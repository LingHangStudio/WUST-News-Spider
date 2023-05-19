const commonSpider = require('../common')



async function launch(tb, part, sub, url) {
	await commonSpider.launch(tb, part, sub, url, {
		listSelector: '.col_news_list .news_title a.news_tit',
		titleSelector: '.arti_title',
		timeSelector: '.arti_metas',
		textSelector: '.v_news_content',
		imgSelector: '.v_news_content img',
		appendixSelector: 'img+a'
	})
}


module.exports = {
	launch
}
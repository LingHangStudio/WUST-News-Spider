const targetList = require('./store/targetList')
const xuexiaoSpider = require('./spiders/xuexiao')


async function routine() {
	var xuexiaoSpideList = targetList.xuexiao
	for (var idx = 0; idx < xuexiaoSpideList.length; idx += 1) {
		var spideTarget = xuexiaoSpideList[idx]
		await xuexiaoSpider.launch(
			`xuexiao_${spideTarget.name}`,
			spideTarget.part,
			spideTarget.sub,
			spideTarget.url
		)
	}
}



routine()

const targetList = require('./store/targetList')
const xuexiaoSpider = require('./spiders/xuexiao')
const jiaowuSpider = require('./spiders/jiaowu')
const tuanweiSpider = require('./spiders/tuanwei')


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

	var jiaowuSpideList = targetList.jiaowu
	for (var idx = 0; idx < jiaowuSpideList.length; idx += 1) {
		var spideTarget = jiaowuSpideList[idx]
		await jiaowuSpider.launch(
			`jiaowu_${spideTarget.name}`,
			spideTarget.part,
			spideTarget.sub,
			spideTarget.url
		)
	}

	var tuanweiSpideList = targetList.tuanwei
	for (var idx = 0; idx < tuanweiSpideList.length; idx += 1) {
		var spideTarget = tuanweiSpideList[idx]
		await tuanweiSpider.launch(
			`tuanwei_${spideTarget.name}`,
			spideTarget.part,
			spideTarget.sub,
			spideTarget.url
		)
	}
}



routine()

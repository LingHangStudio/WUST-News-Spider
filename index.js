const targetList = require('./store/targetList')
const xueyuanList = require('./store/xueyuanList')
const xuexiaoSpider = require('./spiders/xuexiao')
const jiaowuSpider = require('./spiders/jiaowu')
const tuanweiSpider = require('./spiders/tuanwei')



var spideTaskList = [
	{  // 1 材料与冶金学院
		name: 'cailiaoyuyejinxueyuan',
		list: xueyuanList.cailiaoyuyejinxueyuan,
		spider: require('./spiders/xueyuan/cailiaoyuyejinxueyuan')
	},
	{  // 2 城市建设学院
		name: 'chengshijianshexueyuan',
		list: xueyuanList.chengshijianshexueyuan,
		spider: require('./spiders/xueyuan/chengshijianshexueyuan')
	},
	{  // 3 恒大管理学院
		name: 'hengdaguanlixueyuan',
		list: xueyuanList.hengdaguanlixueyuan,
		spider: require('./spiders/xueyuan/hengdaguanlixueyuan')
	},
	{  // 4 国际学院
		name: 'guojixueyuan',
		list: xueyuanList.guojixueyuan,
		spider: require('./spiders/xueyuan/guojixueyuan')
	},
	{  // 5 化学与化工学院
		name: 'huaxueyuhuagongxueyuan',
		list: xueyuanList.huaxueyuhuagongxueyuan,
		spider: require('./spiders/xueyuan/huaxueyuhuagongxueyuan')
	},
	{  // 6 机械自动化学院
		name: 'jixiezidonghuaxueyuan',
		list: xueyuanList.jixiezidonghuaxueyuan,
		spider: require('./spiders/xueyuan/jixiezidonghuaxueyuan')
	},
	{  // 7 计算机科学与技术学院
		name: 'jisuanjikexueyujishuxueyuan',
		list: xueyuanList.jisuanjikexueyujishuxueyuan,
		spider: require('./spiders/xueyuan/jisuanjikexueyujishuxueyuan')
	},
	{  // 8 理学院
		name: 'lixueyuan',
		list: xueyuanList.lixueyuan,
		spider: require('./spiders/xueyuan/lixueyuan')
	},
	{  // 9 马克思主义学院
		name: 'makesizhuyixueyuan',
		list: xueyuanList.makesizhuyixueyuan,
		spider: require('./spiders/xueyuan/makesizhuyixueyuan')
	},
	{  // 10 汽车与交通工程学院
		name: 'qicheyujiaotonggongchengxueyuan',
		list: xueyuanList.qicheyujiaotonggongchengxueyuan,
		spider: require('./spiders/xueyuan/qicheyujiaotonggongchengxueyuan')
	},
	{  // 11 生命科学与健康学院
		name: 'shengmingkexueyujiankangxueyuan',
		list: xueyuanList.shengmingkexueyujiankangxueyuan,
		spider: require('./spiders/xueyuan/shengmingkexueyujiankangxueyuan')
	},
	{  // 12 体育学院
		name: 'tiyuxueyuan',
		list: xueyuanList.tiyuxueyuan,
		spider: require('./spiders/xueyuan/tiyuxueyuan')
	},
	{  // 13 外国语学院
		name: 'waiguoyuxueyuan',
		list: xueyuanList.waiguoyuxueyuan,
		spider: require('./spiders/xueyuan/waiguoyuxueyuan')
	},
	{  // 14 文法与经济学院
		name: 'wenfayujingjixueyuan',
		list: xueyuanList.wenfayujingjixueyuan,
		spider: require('./spiders/xueyuan/wenfayujingjixueyuan')
	},
	{  // 15 信息科学与工程学院
		name: 'xinxikexueyugongchengxueyuan',
		list: xueyuanList.xinxikexueyugongchengxueyuan,
		spider: require('./spiders/xueyuan/xinxikexueyugongchengxueyuan')
	},
	{  // 16 医学院
		name: 'yixueyuan',
		list: xueyuanList.yixueyuan,
		spider: require('./spiders/xueyuan/yixueyuan')
	},
	{  // 17 艺术与设计学院
		name: 'yishuyushejixueyuan',
		list: xueyuanList.yishuyushejixueyuan,
		spider: require('./spiders/xueyuan/yishuyushejixueyuan')
	},
	{  // 18 资源与环境工程学院
		name: 'ziyuanyuhuanjinggongchengxueyuan',
		list: xueyuanList.ziyuanyuhuanjinggongchengxueyuan,
		spider: require('./spiders/xueyuan/ziyuanyuhuanjinggongchengxueyuan')
	}
]


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

	for (var taskIdx = 0; taskIdx < spideTaskList.length; taskIdx += 1) {
		var spideTask = spideTaskList[taskIdx]
		var spideList = spideTask.list
		var spider = spideTask.spider
		for (var idx = 0; idx < spideList.length; idx += 1) {
			var spideTarget = spideList[idx]
			await spider.launch(
				`xueyuan_${spideTask.name}_${spideTarget.name}`,
				spideTarget.part,
				spideTarget.sub,
				spideTarget.url
			)
		}
	}
}



routine()

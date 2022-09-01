const axios = require("axios");
const cheerio = require("cheerio");
const humanInterval = require("human-interval");
const db = require('./sql')
let https = require("https");
const { rejects } = require("assert");

const agent = new https.Agent({
    rejectUnauthorized: false,
});//爬虫需要

let detail_url = [];
let compare_url = [];

function query(i){
    return new Promise((res)=>{
        db.query(`SELECT * FROM shujubiao WHERE href = '${compare_url[i]}' `,(err,results)=>{
            res(results)                 
        });
    })
}

 // if (!res.length) {
                //     detail_url.push(compare_url[i]);
                //     // console.log(detail_url);
                // }

async function spider(spider_url){
    


    await axios.get(spider_url,{
        headers: {
            "Content-Type": 'application/json;charset=UTF-8',
         },
         httpsAgent: agent//选择性忽略SSL
    }).then((res)=>{
        const $ = cheerio.load(res.data)
        // db.query('select 1', (err, results) => {
        //     if (err) return console.log(err.message)
        //     console.log(results)//测试是否能正确链接
        //   })

        $('.wp_article_list .Article_Title a' ).each((i,elem)=>{
        //先获取对应的链接
        // console.log($(elem).text());
        //总共20条数据
        let old_url = $(elem).attr('href');
        let new_url = 'https://news.wust.edu.cn/' + old_url
        
        compare_url.push(new_url);
        

        })
    })
    
    for(let i = 0;i<compare_url.length;i++){

        let re = await query(i)
        // console.log(re.length);
        if(!re.length){
            console.log('要保存');
            detail_url.push(compare_url[i]);
        }else{
            console.log('不要保存');
        }
    }
    



    await spider_detail()


    function spider_detail(){
        return new Promise((res)=>{
            // console.log(re);
            for(let i = 0; i<detail_url.length;i++){
    
                 axios.get(detail_url[i],{
                    headers: {
                        "Content-Type": 'application/json;charset=UTF-8',
                     },
                     httpsAgent: agent//选择性忽略SSL
                }).then((res)=>{
                    const $ = cheerio.load(res.data)
                    let time = $('.arti_update').text()
                    let title = $('.bt').text().replace(/[\r\n]/g, "").replace(/[ ]/g,"")
                    let text = $('.read').html()
                    db.query('INSERT INTO shujubiao (tab1,tab2,text,title,time,href) VALUES (?,?,?,?,?,?)',[1,1,text,title,time,detail_url[i]])
                    //先存信息
                    
                    $('.read img').each((index,elem)=>{
                        let old_pic = $(elem).attr('src')
                        let new_pic = 'https://news.wust.edu.cn/' + old_pic
                        // console.log(new_pic);
                        db.query('INSERT INTO pic (pic,href) VALUES (?,?)',[new_pic,detail_url[i]])
                    })
        
                    // console.log(new_pic);
                })
            }
            console.log('詳細爬蟲結束');
          
            res()
            
        })
    }
    
}




spider('https://news.wust.edu.cn/58/list.htm')

module.exports = detail_url

const axios = require("axios");
const cheerio = require("cheerio");
const humanInterval = require("human-interval");
const db = require("./sql");
let https = require("https");
const { time } = require("console");

const agent = new https.Agent({
  rejectUnauthorized: false,
}); //爬虫需要


let date 
date = new Date()

async function spider_jiaowu(spider_url, part, sub) {
  let detail_url = [];
  let compare_url = [];
  let re_news = /^https:\/\/news.wust.edu.cn/;
  let re_wust = /^https:\/\/www.wust.edu.cn/;
  let re_jwc = /^https:\/\/jwc.wust.edu.cn/;

  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM my_data WHERE href = '${compare_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }

  function spider_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < detail_url.length; i++) {
        axios
          .get(detail_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
            .text()
            .replace(/[\r\n]/g, "")
            .replace(/[ ]/g, "");
            let text = $(".read").html();
            // console.log(time);
            db.query(
              "INSERT INTO my_data (part,sub,data,title,time,href) VALUES (?,?,?,?,?,?)",
              [part, sub, text, title, time, detail_url[i]]
            );

            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://news.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }

              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                detail_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, detail_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);

      $("#wp_news_w82 .news_title a").each((i, elem) => {
        //先获取对应的链接
        //总共20条数据

        let connect_url = "";
        if (re_news.test(spider_url)) {
          connect_url = "https://news.wust.edu.cn";
        } else if (re_wust.test(spider_url)) {
          connect_url = "https://www.wust.edu.cn";
        } else if (re_jwc.test(spider_url)) {
          connect_url = "https://jwc.wust.edu.cn";
        }

        let old_url = $(elem).attr("href");
        let new_url = ''
        let RE = /^\//;
          if (RE.test(old_url)) {
              new_url = connect_url + old_url;
              compare_url.push(new_url);
          } 
      });
    });

  for (let i = 0; i < compare_url.length; i++) {
    let re = await query(i);
    if (!re.length) {
      console.log("要保存");
      detail_url.push(compare_url[i]);
    } else {
      console.log("不要保存");
    }
  }

  await spider_detail();
}

async function spider_tuanwei(spider_url, part, sub) {
  let detail_url = [];
  let compare_url = [];
  let re_news = /^https:\/\/news.wust.edu.cn/;
  let re_wust = /^https:\/\/www.wust.edu.cn/;
  let re_jwc = /^https:\/\/jwc.wust.edu.cn/;

  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM my_data WHERE href = '${compare_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }

  function spider_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < detail_url.length; i++) {
        axios
          .get(detail_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            // console.log(time);
            db.query(
              "INSERT INTO my_data (part,sub,data,title,time,href) VALUES (?,?,?,?,?,?)",
              [part, sub, text, title, time, detail_url[i]]
            );

            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://news.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }

              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                detail_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, detail_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);

      $(".col_news .Article_Title a").each((i, elem) => {
        //先获取对应的链接
        //总共20条数据

        let connect_url = "";
        if (re_news.test(spider_url)) {
          connect_url = "https://news.wust.edu.cn";
        } else if (re_wust.test(spider_url)) {
          connect_url = "https://www.wust.edu.cn";
        } else if (re_jwc.test(spider_url)) {
          connect_url = "https://jwc.wust.edu.cn";
        }

        let old_url = $(elem).attr("href");
        let new_url = ''
        let RE = /^\//;
          if (RE.test(old_url)) {
              new_url = connect_url + old_url;
              compare_url.push(new_url);
          } 
      });
    });

  for (let i = 0; i < compare_url.length; i++) {
    let re = await query(i);
    if (!re.length) {
      console.log("要保存");
      detail_url.push(compare_url[i]);
    } else {
      console.log("不要保存");
    }
  }

  await spider_detail();
}

async function spider_guanwang(spider_url, part, sub) {
  let detail_url = [];
  let compare_url = [];
  let re_news = /^https:\/\/news.wust.edu.cn/;
  let re_wust = /^https:\/\/www.wust.edu.cn/;
  let re_jwc = /^https:\/\/jwc.wust.edu.cn/;

  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM my_data WHERE href = '${compare_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
      console.log(res)
    });
  }

  async function spider_detail() {
    // return new Promise((res) => {
      // console.log('A', res)
      // console.log(re);
      for (let i = 0; i < detail_url.length; i++) {
        console.log(i)
        await axios
          .get(detail_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".bt")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            // console.log(time);
            db.query(
              "INSERT INTO my_data (part,sub,data,title,time,href) VALUES (?,?,?,?,?,?)",
              [part, sub, text, title, time, detail_url[i]],
              function(err, res) {
                if (err) {
                  console.log('MySQL Error')
                }
                else {
                  console.log('MySQL Success')
                }
              }
            );

            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://news.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }

              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                detail_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, detail_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      return new Promise(function() {
        console.log('ok')
      })
    // });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);

      $(".wp_article_list .Article_Title a").each((i, elem) => {
        //先获取对应的链接
        //总共20条数据

        let connect_url = "";
        if (re_news.test(spider_url)) {
          connect_url = "https://news.wust.edu.cn";
        } else if (re_wust.test(spider_url)) {
          connect_url = "https://www.wust.edu.cn";
        } else if (re_jwc.test(spider_url)) {
          connect_url = "https://jwc.wust.edu.cn";
        }

        let old_url = $(elem).attr("href");
        let new_url = ''
        let RE = /^\//;
          if (RE.test(old_url)) {
              new_url = connect_url + old_url;
              compare_url.push(new_url);
          } 
      });
    });

  for (let i = 0; i < compare_url.length; i++) {
    console.log(i)
    let re = await query(i);
    if (!re.length) {
      console.log("要保存");
      detail_url.push(compare_url[i]);
    } else {
      console.log("不要保存");
    }
  }

  await spider_detail();
  console.log('Monkey')
}

async function spider_caiye(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [1, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://news.wust.edu.cn/" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://cy.wust.edu.cn/" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://cy.wust.edu.cn/" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}

async function spider_chengjian(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [2, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn/" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn/" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col-news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn/" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}



async function spider_guanyuan(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [3, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://som.wust.edu.cn/" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://som.wust.edu.cn/" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://som.wust.edu.cn/" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_guoji(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [4, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://wis.wust.edu.cn/" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://wis.wust.edu.cn/" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://wis.wust.edu.cn/" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_huagong(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [5, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_jixie(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [6, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_jisuanji(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [7, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_lixueyuan(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".WP_VisitCount").parent().text();
            let title = $(".biaoti3")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".article").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [9, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://lixueyuan.wust.edu.cn/" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix =
                "https://lixueyuan.wust.edu.cn/" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $("#wp_news_w6 td a[href]").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://lixueyuan.wust.edu.cn/" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_makesi(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [9, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://my.wust.edu.cn/" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://my.wust.edu.cn/" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://my.wust.edu.cn/" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_jiaotong(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [10, sub, text, title, mytime[i], xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  let mytime = [];

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col-news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });

      $(".Article_PublishDate").each((i, elem) => {
        // console.log($(elem).text());
        mytime.push($(elem).text());
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}

async function spider_shengming(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [11, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_tiyu(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [12, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_waiguoyu(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".WP_VisitCount").parent().text();
            let title = $(".biaoti3")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".article").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [13, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $("#wp_news_w6 td a[href]").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}

async function spider_wenfa(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [14, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_xinxi(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [15, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_yixueyuan(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [16, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_yishu(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [17, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://www.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://www.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://www.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}


async function spider_zihuan(spider_url, sub, name) {
  let xueyuan_url = [];
  let compare_xueyuan_url = [];
  function query(i) {
    return new Promise((res) => {
      db.query(
        `SELECT * FROM academy WHERE href = '${compare_xueyuan_url[i]}' `,
        (err, results) => {
          res(results);
        }
      );
    });
  }
  function spider_xueyuan_detail() {
    return new Promise((res) => {
      // console.log(re);
      for (let i = 0; i < xueyuan_url.length; i++) {
        axios
          .get(xueyuan_url[i], {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            httpsAgent: agent, //选择性忽略SSL
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            let time = $(".arti_update").text();
            let title = $(".arti_title")
              .text()
              .replace(/[\r\n]/g, "")
              .replace(/[ ]/g, "");
            let text = $(".read").html();
            db.query(
              "INSERT INTO academy (house,sub,data,title,time,href,name) VALUES (?,?,?,?,?,?,?)",
              [18, sub, text, title, time, xueyuan_url[i], name]
            );
            //先存信息

            $(".read img").each((index, elem) => {
              let old_pic = $(elem).attr("src");
              let new_pic = "";
              let RE = /^\//;
              if (RE.test(old_pic)) {
                new_pic = "https://cree.wust.edu.cn" + old_pic;
              } else {
                new_pic = old_pic;
              }
              // console.log(new_pic);
              db.query("INSERT INTO picture (picture_url,href) VALUES (?,?)", [
                new_pic,
                xueyuan_url[i],
              ]);
            });

            //爬取附件
            $("img+a").each((index, elem) => {
              let appendix_title = $(elem).text();
              let appendix = "https://cree.wust.edu.cn" + $(elem).attr("href");
              db.query(
                "INSERT INTO appendix (appendix,href,appendix_title) VALUES (?,?,?)",
                [appendix, xueyuan_url[i], appendix_title]
              );
            });

            // console.log(new_pic);
          });
      }
      console.log("詳細爬蟲結束");
      res();
    });
  }

  await axios
    .get(spider_url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      httpsAgent: agent, //选择性忽略SSL
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".col_news .Article_Title a").each((i, elem) => {
        let reg = /^\//;
        let old_url = $(elem).attr("href");
        if (reg.test(old_url)) {
          let new_url = "https://cree.wust.edu.cn" + old_url;
          compare_xueyuan_url.push(new_url);
        }
      });
    });

  for (let i = 0; i < compare_xueyuan_url.length; i++) {
    let re = await query(i);
    // console.log(re.length);
    if (!re.length) {
      console.log("要保存");
      xueyuan_url.push(compare_xueyuan_url[i]);
    } else {
      console.log("不要保存");
    }
  }
  await spider_xueyuan_detail();
}




async function launch() {
  await spider_guanwang("https://news.wust.edu.cn/58/list.htm", 1, 1); //学校要闻
  
  await spider_guanwang("https://news.wust.edu.cn/66/list.htm", 1, 2); //媒体科大

  await spider_guanwang("https://news.wust.edu.cn/61/list.htm", 1, 3); //学术动态

  await spider_guanwang("https://news.wust.edu.cn/59/list.htm", 1, 4); //综合新闻

  await spider_guanwang("https://news.wust.edu.cn/60/list.htm", 1, 5); //院系动态

//   // ——————————————————————————————————————————————————————————————————————

//   spider_jiaowu("https://jwc.wust.edu.cn/1925/list1.htm", 2, 1); //教务处  通知

//   spider_jiaowu("https://jwc.wust.edu.cn/1926/list.htm", 2, 2); //动态

//   //———————————————————————————————————————————————————————————————————————

//   spider_tuanwei("https://www.wust.edu.cn/tw/353/list.htm", 4, 1); //团委  团情快报

//   spider_tuanwei("https://www.wust.edu.cn/tw/356/list.htm", 4, 2); //基层信息

//   spider_tuanwei("https://www.wust.edu.cn/tw/355/list.htm", 4, 3); //文件资料

//   spider_tuanwei("https://www.wust.edu.cn/tw/359/list.htm", 4, 4); //学生活动

//   spider_tuanwei("https://www.wust.edu.cn/tw/360/list.htm", 4, 5); //热点聚焦

//   spider_tuanwei("https://www.wust.edu.cn/tw/361/list.htm", 4, 6); //他山之石

//   //———————————————————————————————————————————————————————————————————————

//   spider_caiye('https://cy.wust.edu.cn/878/list.htm',1,'公告栏')
//   spider_caiye('https://cy.wust.edu.cn/776/list.htm',2,'学院新闻')
//   spider_caiye('https://cy.wust.edu.cn/581/list.htm',3,'学工动态')
//   spider_caiye('https://cy.wust.edu.cn/547/list.htm',4,'学术交流')
//   spider_caiye('https://cy.wust.edu.cn/778/list.htm',5,'实验室安全')

// //———————————————————————————————————————————————————————————————————————

// spider_chengjian('https://www.wust.edu.cn/cjxy/932/list.htm',1,'学院新闻')
// spider_chengjian('https://www.wust.edu.cn/cjxy/933/list.htm',2,'通知公告')
// spider_chengjian('https://www.wust.edu.cn/cjxy/978/list.htm',3,'人才培养')

// //——————————————————————————————————————————————————————————————————————


// spider_guanyuan('https://som.wust.edu.cn/3477/list.htm',1,'学院要闻')
// spider_guanyuan('https://som.wust.edu.cn/3478/list.htm',2,'通知公告')
// spider_guanyuan('https://som.wust.edu.cn/3479/list.htm',3,'学术动态')
// spider_guanyuan('https://som.wust.edu.cn/3480/list.htm',4,'学子家园')

// //——————————————————————————————————————————————————————————————————————


// spider_guoji('https://wis.wust.edu.cn/xwdt/list.htm',1,'新闻动态')
// spider_guoji('https://wis.wust.edu.cn/ggl/list.htm',2,'公告栏')
// spider_guoji('https://wis.wust.edu.cn/zsdt/list.htm',3,'教学信息')
// //——————————————————————————————————————————————————————————————————————

// spider_huagong('https://www.wust.edu.cn/hxyhg/2184/list.htm',1,'学院要闻')
// spider_huagong('https://www.wust.edu.cn/hxyhg/2183/list.htm',2,'通知公告')
// spider_huagong('https://www.wust.edu.cn/hxyhg/2154/list.htm',3,'教学动态')
// //——————————————————————————————————————————————————————————————————————


// spider_jixie('https://www.wust.edu.cn/jxzdh/1424/list.htm',1,'学院新闻')
// spider_jixie('https://www.wust.edu.cn/jxzdh/1427/list.htm',2,'学术交流')
// spider_jixie('https://www.wust.edu.cn/jxzdh/1423/list.htm',3,'通知公告')
// spider_jixie('https://www.wust.edu.cn/jxzdh/1425/list.htm',4,'教育教学')
// spider_jixie('https://www.wust.edu.cn/jxzdh/1426/list.htm',5,'师生动态')
// //——————————————————————————————————————————————————————————————————————

// spider_jisuanji('https://www.wust.edu.cn/jsjkx/1563/list.htm',1,'学院新闻')
// spider_jisuanji('https://www.wust.edu.cn/jsjkx/1564/list.htm',2,'通知公告')
// spider_jisuanji('https://www.wust.edu.cn/jsjkx/1556/list.htm',3,'党建工作')
// //——————————————————————————————————————————————————————————————————————

// spider_lixueyuan('https://lixueyuan.wust.edu.cn/2196/list.htm',1,'学院新闻')
// spider_lixueyuan('https://lixueyuan.wust.edu.cn/2197/list.htm',2,'教学动态')
// spider_lixueyuan('https://lixueyuan.wust.edu.cn/2195/list.htm',3,'通知公告')
// spider_lixueyuan('https://lixueyuan.wust.edu.cn/2220/list.htm',4,'科研动态')

// //——————————————————————————————————————————————————————————————————————

// spider_makesi('https://my.wust.edu.cn/2118/list.htm',1,'通知公告')
// spider_makesi('https://my.wust.edu.cn/2117/list.htm',2,'校园短波')
// spider_makesi('https://my.wust.edu.cn/2119/list.htm',3,'理论广角')
// spider_makesi('https://my.wust.edu.cn/2120/list.htm',4,'社会聚焦')

// //——————————————————————————————————————————————————————————————————————

// spider_jiaotong('https://www.wust.edu.cn/qcyjt/2077/list.htm',1,'新闻头条')
// spider_jiaotong('https://www.wust.edu.cn/qcyjt/2078/list.htm',2,'最新公告')
// //——————————————————————————————————————————————————————————————————————


// spider_shengming('https://www.wust.edu.cn/smkx/832/list.htm',1,'学院新闻')
// spider_shengming('https://www.wust.edu.cn/smkx/831/list.htm',2,'通知公告')
// spider_shengming('https://www.wust.edu.cn/smkx/3546/list.htm',3,'管理制度')
// spider_shengming('https://www.wust.edu.cn/smkx/858/list.htm',4,'学术交流')
// spider_shengming('https://www.wust.edu.cn/smkx/835/list.htm',5,'科研动态')
// //——————————————————————————————————————————————————————————————————————


// spider_tiyu('https://www.wust.edu.cn/tyxy/765/list.htm',1,'新闻动态')
// spider_tiyu('https://www.wust.edu.cn/tyxy/766/list.htm',2,'党建工作')
// spider_tiyu('https://www.wust.edu.cn/tyxy/764/list.htm',3,'通知公告')
// //——————————————————————————————————————————————————————————————————————


// spider_waiguoyu('https://www.wust.edu.cn/wgy/3285/list.htm',1,'公示公告')
// spider_waiguoyu('https://www.wust.edu.cn/wgy/3286/list.htm',2,'综合新闻')
// spider_waiguoyu('https://www.wust.edu.cn/wgy/3280/list.htm',3,'党建工作')
// spider_waiguoyu('https://www.wust.edu.cn/wgy/3281/list.htm',4,'学生工作')
// //——————————————————————————————————————————————————————————————————————


// spider_wenfa('https://www.wust.edu.cn/wfyjj/1658/list.htm',1,'公告栏')
// spider_wenfa('https://www.wust.edu.cn/wfyjj/1657/list.htm',2,'新闻动态')
// spider_wenfa('https://www.wust.edu.cn/wfyjj/1660/list.htm',3,'师生风采')
// //——————————————————————————————————————————————————————————————————————

// spider_xinxi('https://www.wust.edu.cn/xxkx/6043/list.htm',1,'通知公告')
// spider_xinxi('https://www.wust.edu.cn/xxkx/xyxwcs/list.htm',2,'学院新闻')
// //——————————————————————————————————————————————————————————————————————


// spider_yixueyuan('https://www.wust.edu.cn/yxy/1337/list.htm',1,'通知公告')
// spider_yixueyuan('https://www.wust.edu.cn/yxy/1030/list.htm',2,'学院新闻')
// spider_yixueyuan('https://www.wust.edu.cn/yxy/1033/list.htm',3,'科研通知')
// spider_yixueyuan('https://www.wust.edu.cn/yxy/1035/list.htm',4,'学团动态')
// //——————————————————————————————————————————————————————————————————————

// spider_yishu('https://www.wust.edu.cn/ysysj/1370/list.htm',1,'通知公告')
// spider_yishu('https://www.wust.edu.cn/ysysj/1371/list.htm',2,'学院新闻')
// //——————————————————————————————————————————————————————————————————————


// spider_zihuan('https://cree.wust.edu.cn/1754/list.htm',1,'通知公告')
// spider_zihuan('https://cree.wust.edu.cn/1726/list.htm',2,'教学动态')
// spider_zihuan('https://cree.wust.edu.cn/1749/list.htm',3,'学工动态')
// spider_zihuan('https://cree.wust.edu.cn/1736/list.htm',4,'科研动态')

console.log('爬虫更新完毕');
// return new Promise(function(resolve, reject) {
//   reject('End')
// })
}

// setInterval(() => {
//   launch()
// }, 60000);`
// launch()
// module.exports = date;
spider_guanwang("https://news.wust.edu.cn/58/list.htm", 1, 1)

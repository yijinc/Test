/**
 * Created by yijinc on 2018
 */

/***
 * 第二次使用 可能会有缓存，请强制刷新浏览器清除缓存
 *
 * 请在下面数字中填写你关注过的大V的Id 改好了复制 粘贴到 浏览器的 console的
 **/

var arr = ['96578', '143895', '11880', '3692', '9457', '177492', '71115', '21800'];

function zanBigVPro(commentContent='', isComment=false) {

    var record = {};
    var reTryStore = {}; //失败后的重试

    var api = {
        list: "https://be02.bihu.com/bihube-pc/api/content/show/getFollowArtList",
        upVote: "https://be02.bihu.com/bihube-pc/api/content/upVote",
        comment: "https://be02.bihu.com/bihube-pc/api/content/createComment",
    };

    let timer = null;
    let totalUpVote = 0 ; //总共点赞
    let requestCount = 0; //请求成功次数
    let errorCount = 0; //请求失败次数
    var advertise = decodeURIComponent('%E8%B4%AD%E4%B9%B0%E8%81%94%E7%B3%BB%E8%9C%9C%E8%9C%82%EF%BC%8C%E5%BE%AE%E4%BF%A1%EF%BC%9Ateo742695');

    var userInfo = JSON.parse(window.localStorage.getItem("ANDUI_BIHU_LOGININFO"));
    if(!userInfo) {
        alert("请先登录");
        console.info("您当前未登录");
    }

    // 引入jquery
    var jqueryLib = document.createElement('script');
    jqueryLib.src = 'https://cdn.bootcss.com/jquery/2.2.3/jquery.min.js';
    document.querySelectorAll('body')[0].appendChild(jqueryLib);
    jqueryLib.onload = function() {
        alert(advertise);
        console.warn(advertise);
        console.info("打赏作者：https://m.weibo.cn/3702496574/4224052040346429 （将会持续更新");
        listPolling()
    };


    // // 时间设置
    // var startDate = 1522544642548; // 开始时间
    // var usableTime = 60 * 60 * 24 * 1000 * 2; //可用时长 2天
    // var expireDate = startDate + usableTime; //到期日期 = 开始时间 + 可用时间


    var setRandomTime = function(n) {return parseInt(Math.random() * n * 1000)};

    var setComment = function(articleId) {
        setTimeout( function() {
            $.ajax({
                url: api.comment,
                headers: { Accept: "*/*" },
                type: 'post',
                dataType: 'json',
                data: {
                    'userId': userInfo.userId,
                    'accessToken': userInfo.accessToken,
                    'artId': articleId,
                    'content': commentContent,
                    'commentId': '',
                    'rootCmtId': ''
                }
            })
        }, 3000)
    };

    var setZan = function(article) {
        $.ajax({
            url: api.upVote,
            type: 'post',
            dataType: 'json',
            headers: { Accept: "*/*" },
            data: {
                'userId': userInfo.userId,
                'accessToken': userInfo.accessToken,
                'artId': article.id
            },
            success: function(res) {
                if (res.res === 1) {
                    console.warn(`已经成功点到${++totalUpVote}个赞。本次点到赞的文章ID是 ${article.id}, 链接：https://bihu.com/article/${article.id}`);
                    if(isComment) {
                        setComment(article.id)
                    }
                } else {
                    if(reTryStore[article.id]===undefined) {
                        reTryStore[article.id]=8;  //点赞失败 后 重试的次数
                        notify(`有文章点赞失败，点击手动点赞`, `https://bihu.com/article/${article.id}`)
                    } else if(reTryStore[article.id]<=0) {
                        console.info("点赞失败，多次重试仍然失败，跳过此文章，继续为您检测！失败文章id为："+ article.id + " 您可用手动点赞" );
                        return;
                    }
                    console.info(`点赞失败，正在为您重试！重试次数：${reTryStore[article.id]} ` );
                    console.log(`失败文章链接：https://bihu.com/article/${article.id}`);
                    setTimeout(function() {
                        reTryStore[article.id]--;
                        setZan(article)
                    }, 10000)
                }
            }
        })
    };


    var isBigVNewArticle = function(artList) {
        artList.forEach(function(article) {
            arr.forEach( function(bigVId) {
                if (bigVId==article.userId) {
                    if (article.ups < 120 && !record[article.id]) {
                        console.warn(`大V ${article.userName} 发文啦，题目《${article.title}》，文章编号：${article.id}` );
                        setTimeout(function() {
                            setZan(article)
                        }, 3000);
                        record[article.id] = 1
                    }
                }
            })
        })
    };


    var listPolling = function() {
        // if (new Date().getTime() > expireDate) { // 到期
        //     alert("脚本到期 "+ advertise);
        //     console.error("脚本到期 "+ advertise);
        //     return
        // }
        timer = setInterval(function() {
            $.ajax({
                url: api.list,
                type: 'post',
                dataType: 'json',
                data: {
                    'userId': userInfo.userId,
                    'accessToken': userInfo.accessToken
                },
                success: function(res) {
                    if (res.res === 1) {
                        isBigVNewArticle(res.data.artList.list);
                        console.warn(`已经成功监听${++requestCount}次，请求出错${errorCount}次。`)
                    } else {
                        clearInterval(timer);
                        console.warn(`已经成功监听${requestCount}次，请求出错${++errorCount}次。`);
                        console.warn(`服务器繁忙，12秒后继续尝试检测`);
                        setTimeout(function() {
                            listPolling()
                        }, 120000)
                    }
                }
            })
        }, 40000 + setRandomTime(20))
    };

    var notify = function(title, url) {
        if (!("Notification" in window)) {
            return;
        }
        if (Notification.permission === "granted") {
            let myNotification = new Notification(title);
            if (url) {
                myNotification .onclick = function(e) {
                    e.preventDefault();
                    window.open(url, '_blank')
                }
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(e) {
                if (e === "granted") {
                    let myNotification = new Notification(title);
                    if (url) {
                        myNotification.onclick = function(e) {
                            e.preventDefault();
                            window.open(url, '_blank')
                        }
                    }
                }
            })
        }
    }
}


zanBigVPro('6666，艰难等到更新，认真读完，前排支持。', true);
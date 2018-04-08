/**
 * Created by yijinc on 2018
 */

/***
 * 第二次使用 可能会有缓存，请强制刷新浏览器清除缓存
 * 请在下面数字中填写你关注过的大V的Id 改好了复制 粘贴到 浏览器的 console的
 **/

var arr = [2234, 9909, 483, 256409, 11880, 131507, 112225, 233279, 193646, 55332, 96578, 143895, 231155, 87858, 21800, 92598, 16340];
/* 过滤(标题中的)敏感词汇，不点赞 */
var sensitiveWord = ['机_器_人', '会删', '会_删'];

function zanBigVPro(commentContent='', isComment=false) {

    var record = {};
    var reTryStore = {}; //失败后的重试

    var api = {
        list: "https://be02.bihu.com/bihube-pc/api/content/show/getFollowArtList",
        upVote: "https://be02.bihu.com/bihube-pc/api/content/upVote",
        comment: "https://be02.bihu.com/bihube-pc/api/content/createComment",
    };

    var timer = null;
    var totalUpVote = 0 ; //总共点赞
    var requestCount = 0; //请求成功次数
    var errorCount = 0; //请求失败次数
    var advertise = decodeURIComponent('%E8%B4%AD%E4%B9%B0%E8%81%94%E7%B3%BB%E8%9C%9C%E8%9C%82%EF%BC%8C%E5%BE%AE%E4%BF%A1%EF%BC%9Ateo742695');
    var service = decodeURIComponent('%E5%AE%A2%E6%9C%8D%EF%BC%9Acxj5377053');
    var provider = decodeURIComponent("%E6%89%93%E8%B5%8F%E4%BD%9C%E8%80%85%EF%BC%9Ahttps%3A%2F%2Fm.weibo.cn%2F3702496574%2F4224052040346429%20%EF%BC%88%E5%B0%86%E4%BC%9A%E6%8C%81%E7%BB%AD%E6%9B%B4%E6%96%B0");

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
        console.warn(service);
        console.info(provider);
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
                    console.warn("已经成功点到 "+(++totalUpVote)+" 个赞。本次点到赞的文章ID是 "+article.id+" , 链接：https://bihu.com/article/"+article.id);
                    if(isComment) {
                        setComment(article.id)
                    }
                } else if(res.resMsg==="已投过票了。") {
                    console.info("您已经赞过了，文章链接：https://bihu.com/article/"+article.id)
                } else {
                    if(reTryStore[article.id]===undefined) {
                        reTryStore[article.id]=8;  //点赞失败 后 重试的次数
                        notify("有文章点赞失败，点击手动点赞", "https://bihu.com/article/"+article.id)
                    } else if(reTryStore[article.id]<=0) {
                        console.info("点赞失败，多次重试仍然失败，跳过此文章，继续为您检测！失败文章id为："+ article.id + " 您可用手动点赞" );
                        return;
                    }
                    console.info("点赞失败，正在为您重试！重试次数："+reTryStore[article.id] );
                    console.info("失败文章链接：https://bihu.com/article/"+article.id);
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
                    if (article.ups < 150 && !record[article.id]) {
                        if(sensitiveFilter(article.title)){
                            console.info("检测到绞杀机器人的文章啦，老子是不会点赞的");
                            console.warn("大V "+article.userName+ " 发垃圾文章，题目《"+ article.title+ "》，文章编号："+ article.id );
                            return;
                        }
                        console.warn("大V "+article.userName+ " 发文啦，题目《"+ article.title+ "》，文章编号："+ article.id );
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
                headers: { Accept: "*/*" },
                type: 'post',
                dataType: 'json',
                data: {
                    'userId': userInfo.userId,
                    'accessToken': userInfo.accessToken
                },
                success: function(res) {
                    if (res.res === 1) {
                        isBigVNewArticle(res.data.artList.list);
                        console.warn("已经成功监听" + (++requestCount)+ "次，请求出错" + errorCount+ "次。")
                    } else {
                        clearInterval(timer);
                        console.warn("已经成功监听"+requestCount+"次，请求出错"+(++errorCount)+"次");
                        console.warn("服务器繁忙，12秒后继续尝试检测");
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
            var myNotification = new Notification(title);
            if (url) {
                myNotification .onclick = function(e) {
                    e.preventDefault();
                    window.open(url, '_blank')
                }
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(e) {
                if (e === "granted") {
                    var myNotification = new Notification(title);
                    if (url) {
                        myNotification.onclick = function(e) {
                            e.preventDefault();
                            window.open(url, '_blank')
                        }
                    }
                }
            })
        }
    };

    function sensitiveFilter(title) {
        return sensitiveWord.some(function (key) {
            return title.indexOf(key)>=0
        })
    }
}


zanBigVPro('6666，艰难等到更新，认真读完，前排支持。', true);
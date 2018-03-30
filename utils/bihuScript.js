/**
 * Created by yijinc on 2018/3/30
 */

/*请在下面数字中填写你关注过的大V的Id 改好了复制 粘贴到 浏览器的 console的*/
const arr = ['2234', '143895', '11880', '3692', '9457'];

function zanBigVPro(commentContent='', isComment=false) {

    const record = {};

    const reTryStore = {}; //失败后的重试

    const api = {
        list: "https://be02.bihu.com/bihube-pc/api/content/show/getFollowArtList",
        upVote: "https://be02.bihu.com/bihube-pc/api/content/upVote",
        comment: "https://be02.bihu.com/bihube-pc/api/content/createComment",
    };

    let timer = null;
    let totalUpVote = 0 ; //总共点赞
    let requestCount = 0; //请求成功次数
    let errorCount = 0; //请求失败次数
    const advertise = decodeURIComponent('%E8%B4%AD%E4%B9%B0%E8%81%94%E7%B3%BB%E8%9C%9C%E8%9C%82%EF%BC%8C%E5%BE%AE%E4%BF%A1%EF%BC%9Ateo742695');


    const userInfo = JSON.parse(window.localStorage.getItem("ANDUI_BIHU_LOGININFO"));
    if(!userInfo) {
        alert("请先登录");
        console.info("您当前未登录");
    }

    // 引入jquery
    const jqueryLib = document.createElement('script');
    jqueryLib.src = 'https://cdn.bootcss.com/jquery/2.2.3/jquery.min.js';
    document.querySelectorAll('body')[0].appendChild(jqueryLib);
    jqueryLib.onload = function() {
        alert(advertise);
        console.warn(advertise);
        listPolling()
    };


    // 时间设置
    const startDate = 1522377681167; // 开始时间
    const usableTime = 60 * 60 * 24 * 1000 * 2; //可用时长 2天
    const expireDate = startDate + usableTime; //到期日期 = 开始时间 + 可用时间


    const setRandomTime = (n) => parseInt(Math.random() * n * 1000);

    const setComment = articleId => {
        setTimeout(() => {
            $.ajax({
                url: api.comment,
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

    const setZan = (articleId) => {
        $.ajax({
            url: api.upVote,
            type: 'post',
            dataType: 'json',
            data: {
                'userId': userInfo.userId,
                'accessToken': userInfo.accessToken,
                'artId': articleId
            },
            success: function(res) {
                if (res.res === 1) {
                    console.warn(`已经成功点到${++totalUpVote}个赞。本次点到赞的文章ID是 ${articleId}`);
                    if(isComment) {
                        setComment(articleId)
                    }
                } else {
                    if(reTryStore[articleId]===undefined) {
                        reTryStore[articleId]=3; //让每次点赞3次
                    } else if(reTryStore[articleId]<=0) {
                        return;
                    }
                    setTimeout(() => {
                        reTryStore[articleId]--;
                        setZan(articleId)
                    }, 10000)
                }
            }
        })
    };


    const isBigVNewArticle = artList => {
        artList.forEach( article => {
            arr.forEach( bigVId => {
                if (bigVId==article.userId) {
                    if (article.ups < 120 && !record[article.id]) {
                        console.warn("大V " + article.userName + "发文，题目《" + article.title + "》，文章编号：" + article.id);
                        setTimeout(() => {
                            setZan(article.id)
                        }, 3000);
                        record[article.id] = 1
                    }
                }
            })
        })
    };


    const listPolling = () => {
        if (new Date().getTime() > expireDate) { // 到期
            alert("脚本到期 "+ advertise);
            console.error("脚本到期 "+ advertise);
            return
        }
        timer = setInterval(() => {
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
                        setTimeout(() => {
                            listPolling()
                        }, 120000)
                    }
                }
            })
        }, 40000 + setRandomTime(20))
    };
}


zanBigVPro('6666，艰难等到更新，认真读完，前排支持。', true);
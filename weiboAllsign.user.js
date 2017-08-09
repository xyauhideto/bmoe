// ==UserScript==
// @name           weiboAllsign
// @description    超级话题集中签到，基于 congxz6688 的 tiebaAllsign ( https://greasyfork.org/scripts/152 )
// @match        http://*.weibo.com/*
// @match        http://weibo.com/*
// @icon           http://www.weibo.com/favicon.ico
// @author       xyau
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @version        2017.8.8.0
// @downloadURL    https://greasyfork.org/scripts/32143-weiboallsign/code/weiboAllsign.user.js
// @namespace https://greasyfork.org/users/32143
// ==/UserScript==


//这里指明不签到的话题，话题名不要带最后的“话题”字，用小写的双引号括起来，再用小写的逗号隔开，就象下面一样
var undoList = ["话题一", "话题二", "话题三"];

//此处可修改屏幕允许显示的最大行数;
var maxLines = 20;

//这里指定最大签到数，9999为默认，即全签。
var maxSign = 9999;

/************************以下不要随便动****************************/

//脚本应用式样
function addStyle(css) {
    document.head.appendChild(document.createElement("style")).textContent = css;
}
var signCSS = "";
signCSS += ".s-mod-nav{margin-right:10px}";
signCSS += "#headTd{border-bottom:1px solid grey; color:blue; padding:0px 0px 5px 0px !important;}";
signCSS += "#footTd{border-top:1px solid grey; color:blue; padding:6px 0px 0px 0px !important;}";
signCSS += ".signbaInfor{white-space:nowrap; padding:0px 6px 0px 6px;}";
signCSS += "#scrollDiv *{font-size:12px !important; line-height:18px !important;} #scrollDiv{max-height:" + (maxLines * 18) + "px; max-width:1200px;}";
signCSS += "#newbutn,#newbutn2,#newbutn3,#zhidaoDiv{float:right;}#useIdDiv,#thDiv{float:left;}";
signCSS += "#timerDiv{z-index:997; position:fixed;left:5px;top:5px;}";
signCSS += "#getDown,#allsign,#newbutn,#newbutn2,#newbutn3{font-size:12px; background:rgba(228,228,228,0.4); cursor:pointer; margin:0px 1px 0px 0px; padding:0px 3px;color:black; border:2px ridge black;}";
signCSS += "#getDown:active,#allsign:active,#newbutn:active,#newbutn3:active{border:2px groove black;}";
signCSS += "#readyDiv,#messageWindow{z-index:9999; padding:6px 10px 8px 10px;background-color:lightGrey;position:fixed;left:5px;bottom:5px;border:1px solid grey}";
addStyle(signCSS);

//北京时间
var yuy = new Date();
re = yuy.getTime() + 28800000;
yuy.setTime(re);
var fulltime = yuy.getUTCFullYear() + "/" + (yuy.getUTCMonth() + 1) + "/" + yuy.getUTCDate();

//添加按钮
var newEm = document.createElement("span");
newEm.innerHTML = "话题签到";
newEm.id = "allsign";
newEm.addEventListener('click', jjuds, true);
var autoSignbox = document.createElement("input");
autoSignbox.type = "checkbox";
autoSignbox.id = "autoSign";
autoSignbox.title = "选中此项，启动自动签到，否则，关闭自动签到";
autoSignbox.checked = GM_getValue('autoSignbox', true);
autoSignbox.addEventListener('click', function () {
    GM_setValue('autoSignbox', document.getElementById("autoSign").checked);
}, true);
if (window.location.href.indexOf("weibo.com/") != -1) {
    //移除游戏，添加按钮
    document.querySelector('li a[nm="game"]').parentNode.remove();
    document.getElementsByClassName('gn_nav_list')[0].appendChild(newEm);
    document.getElementsByClassName('gn_nav_list')[0].appendChild(autoSignbox);
    addStyle("#autoSign{margin:9px 0 0 0;} #allsign{margin:2px 0 0 30px}");
}

//自动签到
var todaySign = JSON.parse(GM_getValue('todaySigned', "{}"));
if ($CONFIG.nick) {
    if (yuy.getUTCHours() > 0 && document.getElementById("autoSign").checked && (!todaySign.date || todaySign.date != fulltime || todaySign[$CONFIG.nick] === undefined)) {
        jjuds();
    }
}

//获取签到话题名单
function jjuds() {
    var newsignCss = document.createElement("style");
    newsignCss.id = "newsignCss";
    newsignCss.type = "text/css";
    newsignCss.innerHTML = "#allsign{display:none}";
    document.head.appendChild(newsignCss); //签到过程中，隐藏签到按钮

    var readyDiv = document.createElement("div");
    readyDiv.id = "readyDiv";
    readyDiv.innerHTML = "开始签到准备，正在获取话题列表第1页";
    document.body.appendChild(readyDiv);
    var allAncs = []; //地址收集数组
    var htNameF = []; //话题名收集数组
    var heer = new Date();
    sed = heer.getTime() - 600000;

    function getHuati(nn, lp) { //获取第2-第n页的话题列表
        var urll = 'http://www.weibo.com/p/100505'+$CONFIG.uid+'/myfollow?relate=interested&Pl_Official_RelationInterested__95_page=' + nn;
        setTimeout(function () { //延时操作以免度娘误会
            readyDiv.innerHTML = "开始签到准备，正在获取话题列表第" + nn + "页";
            GM_xmlhttpRequest({
                method : 'GET',
                synchronous : false,
                headers : { //添加http头信息，希望有用
                    "cookie" : encodeURIComponent(document.cookie)
                },
                url : urll,
                onload : function (reText) {
                    var ww = reText.responseText.replace(/[\r\n]\s?/g,'').replace(/\s+/g,' ').match(/100808([\d\w]+)&belongs=interest&screen_name=[^&]+&/g);
                    for (s = 0; s < ww.length; s++) {
                        if (allAncs.length < maxSign) {
                            qq = allAncs.push(/100808[\d\w]+/g.exec(ww[s])[0]);
                            dd = htNameF.push(/e=([^&]+)&/g.exec(ww[s])[1]);
                        } else {
                            break;
                        }
                    }
                    if (nn == lp) { //最后一页取完，开始执行签到
                        gowork(allAncs, htNameF);
                    } else {
                        ns = nn + 1;
                        getHuati(ns, lp); //自调用，顺序循环
                    }
                }
            });
        }, 1000);
    }

    GM_xmlhttpRequest({ //从“我的话题”第1页获取列表
        method : 'GET',
        synchronous : false,
        url :  'http://www.weibo.com/p/100505'+$CONFIG.uid+'/myfollow?relate=interested',
        headers : { //添加http头信息，希望有用
            "cookie" : encodeURIComponent(document.cookie)
        },
        onload : function (reDetails) {
            var simTxt = reDetails.responseText.replace(/[\r\n]\s?/g,'').replace(/\s+/g,' ');
            var ww = simTxt.match(/100808([\d\w]+)&belongs=interest&screen_name=[^&]+&/g);
            for (s = 0; s < ww.length; s++) {
                if (allAncs.length < maxSign) {
                    qq = allAncs.push(/100808[\d\w]+/g.exec(ww[s])[0]);
                    dd = htNameF.push(/e=([^&]+)&/g.exec(ww[s])[1]);
                } else {
                    break;
                }
            }
            var qqee = simTxt.match(/\"page S_txt1/g);
            if (qqee) { //检查是否分页，分页则继续获取话题名单
                var deho = qqee.length;
                if (Math.ceil(maxSign / 30) < deho) {
                    deho = Math.ceil(maxSign / 30);
                }
                if (deho == 1) {
                    gowork(allAncs, htNameF);
                } else {
                    getHuati(2, deho);
                }
            } else { //不分页则直接开始签到
                gowork(allAncs, htNameF);
            }
        }
    });
}

//功能函数
function gowork(allAncs, htNameF) { //以获取的地址数组和话题名数组为参数
    document.body.removeChild(document.getElementById("readyDiv"));

    var yuye = new Date();
    ree = yuye.getTime() + 28800000;
    yuye.setTime(ree);
    var anotherTime = yuye.getUTCFullYear() + "/" + (yuye.getUTCMonth() + 1) + "/" + yuye.getUTCDate(); //当前时间

    //创建窗口
    if (document.getElementById("messageWindow")) {
        document.body.removeChild(document.getElementById("messageWindow"));
    }
    var newDiv = document.createElement("div");
    newDiv.id = "messageWindow";
    newDiv.align = "left";
    document.body.appendChild(newDiv);

    var tablee = document.createElement("table");
    newDiv.appendChild(tablee);

    var thh = document.createElement("th");
    thh.id = "headTd";
    var thDiv = document.createElement("span");
    thDiv.id = "thDiv";
    thh.appendChild(thDiv);
    tablee.appendChild(thh);

    var tr1 = document.createElement("tr");
    var tr2 = document.createElement("tr");

    tablee.appendChild(tr1);
    tablee.appendChild(tr2);

    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    td2.id = "footTd";

    tr1.appendChild(td1);
    tr2.appendChild(td2);

    var tibeNums = allAncs.length; //话题总数量
    var Tds = []; //各话题签到信息栏的空白数组

    var scrollDiv = document.createElement("div");
    scrollDiv.id = "scrollDiv";
    newTable = creaseTable(tibeNums); //根据话题数量创建列表
    scrollDiv.appendChild(newTable);
    td1.appendChild(scrollDiv);
    td2.innerHTML += anotherTime + " 共" + tibeNums + "个话题需要签到&nbsp;&nbsp;";

    onebyone(0, "conti"); //这里开始启动逐一签到动作


    var newbutn = document.createElement("span"); //创建关窗按钮
    newbutn.id = "newbutn";
    newbutn.innerHTML = "关闭窗口";
    newbutn.addEventListener("click", function () {
        document.head.removeChild(document.getElementById("newsignCss"));
        document.body.removeChild(document.getElementById("messageWindow"));
    }, false);
    td2.appendChild(newbutn);

    var useIdDiv = document.createElement("span");
    useIdDiv.id = "useIdDiv";
    useIdDiv.innerHTML = "用户ID&nbsp;:&nbsp;" + $CONFIG.nick;
    thDiv.appendChild(useIdDiv);

    //列表创建函数
    function creaseTable(UrlLength) {
        var cons = (UrlLength <= maxLines * 2) ? 2 : 3;
        if (tibeNums > maxLines * cons) {
            addStyle("#scrollDiv{overflow-x:auto; overflow-y:scroll; padding-right:15px}");
        }
        var tablepp = document.createElement("table");
        var trs = [];
        for (ly = 0; ly < Math.ceil(UrlLength / cons); ly++) {
            var tr = document.createElement("tr");
            mmd = trs.push(tr);
            tablepp.appendChild(tr);
        }
        for (ls = 0; ls < UrlLength; ls++) {
            var td = document.createElement("td");
            td.setAttribute("class", "signbaInfor");
            wq = Tds.push(td);
            trs[Math.floor(ls / cons)].appendChild(td);
        }
        return tablepp;
    }

    //显示信息序号的函数
    function consNum(n) {
        if (tibeNums < 10) {
            var indexN = (n + 1).toString();
        } else if (tibeNums > 9 && tibeNums < 100) {
            if (n < 9) {
                var indexN = "0" + (n + 1);
            } else {
                var indexN = (n + 1).toString();
            }
        } else if (tibeNums > 99 && tibeNums < 1000) {
            if (n < 9) {
                var indexN = "00" + (n + 1);
            } else if (n >= 9 && n < 99) {
                var indexN = "0" + (n + 1);
            } else {
                var indexN = (n + 1).toString();
            }
        } else {
            if (n < 9) {
                var indexN = "000" + (n + 1);
            } else if (n >= 9 && n < 99) {
                var indexN = "00" + (n + 1);
            } else if (n >= 99 && n < 999) {
                var indexN = "0" + (n + 1);
            } else {
                var indexN = (n + 1).toString();
            }
        }
        return indexN;
    }

    function onebyone(gg, goorstop) { //这里的gg是从0开始的话题序号，goorstop用于判别是否递进执行。
        //话题名缩略显示
        String.prototype.reComLength = function () {
            var yn = 0;
            var kuu = "";
            for (var w in this) {
                if (w < this.length) {
                    if (/[a-zA-Z0-9]/.exec(this[w])) {
                        yn += 1;
                    } else {
                        yn += 2;
                    }
                    if (yn < 11) {
                        kuu += this[w];
                    }
                }
            }
            var uui = yn > 13 ? kuu + "..." : this;
            return uui;
        };

        gg = Number(gg);
        var timeout = 0; //默认延时
        var huatiName = "<a href='http://www.weibo.com/p/" + allAncs[gg] + "' title='" + htNameF[gg] + "' target='_blank'><font color='blue'>" + htNameF[gg].reComLength() + "</font></a>";
        if (!todaySign[$CONFIG.nick])
            todaySign[$CONFIG.nick] = [];
        if (undoList.indexOf(htNameF[gg]) != -1) {
            Tds[gg].innerHTML = consNum(gg) + ".&nbsp;" + huatiName + " 用户指定不签到";
            if (gg + 1 < tibeNums && !Tds[gg + 1].innerHTML) {
                onebyone(gg + 1, "conti");
            }
        } else if (todaySign.date == fulltime && todaySign[$CONFIG.nick].indexOf(htNameF[gg]) != -1 && goorstop!="stop") {
            Tds[gg].innerHTML = consNum(gg) + ".&nbsp;" + huatiName + " 已有签到记录";
            if (gg + 1 < tibeNums && !Tds[gg + 1].innerHTML) {
                onebyone(gg + 1, "conti");
            }
        } else {
            Tds[gg].innerHTML = consNum(gg) + ".&nbsp;" + huatiName + " 访问中......".blink();
            if (goorstop == "conti") {
                document.getElementById("scrollDiv").scrollTop = document.getElementById("scrollDiv").scrollHeight; //滚动时总显示最下一行
            }
            var ttss;
            var myRequest = GM_xmlhttpRequest({
                method : 'GET',
                synchronous : false,
                headers : {
                    "cookie" : encodeURIComponent(document.cookie),
                },
                url : 'http://www.weibo.com/p/aj/general/button?ajwvr=6&api=http://i.huati.weibo.com/aj/super/checkin&texta=签到&textb=已签到&status=0&id=' + allAncs[gg],
                onload : function (responseDetails) {
                    var wwdata =JSON.parse( responseDetails.responseText);
                    if (wwdata.code=='100000'||'382004') {
                        if (!todaySign.date || todaySign.date != fulltime) { //日期不对，记录全清零
                            todaySign = {};
                            todaySign.date = fulltime;
                            todaySign[$CONFIG.nick] = [];
                            rqq = todaySign[$CONFIG.nick].push(htNameF[gg]);
                        } else {
                            if (Object.prototype.toString.call(todaySign[$CONFIG.nick]) == "[object String]") { //清除旧版的不同格式记录
                                todaySign[$CONFIG.nick] = [];
                            }
                            if (todaySign[$CONFIG.nick].indexOf(htNameF[gg]) == -1) {
                                rqq = todaySign[$CONFIG.nick].push(htNameF[gg]);
                            }}
                            GM_setValue('todaySigned', JSON.stringify(todaySign)); //成功一个保存一个，以防签到意外中断
                            if(wwdata.code=='100000'){ // 签到成功
                                info ='签到第' + /\d+/g.exec(wwdata.data.alert_title)[0] + '名，经验+' + /\d+/g.exec(wwdata.data.alert_subtitle)[0];}
                        else {info = wwdata.msg;}
                    } else {
                        var km = gg; //把gg此时的值记录下来是必须的，因为gg值将发生变化，后面不便调用
                        var reSignAn = document.createElement("a");
                        reSignAn.href = 'javascript:void(0);';
                        reSignAn.innerHTML = "重签";
                        reSignAn.setAttribute("sentValue", km);
                        reSignAn.addEventListener('click', function (ee) {
                            k = ee.target.getAttribute("sentValue");
                            onebyone(k, "stop"); //带"stop"参数，避免递进执行。
                        }, true);
                        Tds[km].appendChild(reSignAn);
                        info = wwdata.msg;
                    }
                    Tds[gg].innerHTML = consNum(gg) + ".&nbsp;" + huatiName + info;
                    if ( goorstop == "conti" && Tds[gg + 1] && !Tds[gg + 1].innerHTML) { //只有当参数为"conti"、下一表格存在且内容为空时，才继续下一个签到动作
                        setTimeout(function () {
                            onebyone(gg + 1, "conti"); //函数自调用，其实是另一种循环
                        }, timeout);
                    }
                },
                onreadystatechange : function (responseDe) { //访问超时应对
                    if (responseDe.readyState == 1 && typeof ttss == 'undefined') {
                        ttss = setTimeout(function () { //添加延时
                            myRequest.abort(); //中止请求
                            var delayRetry = GM_getValue("delayRetry", 0);
                            if (delayRetry < 5) {
                                console.log(htNameF[gg] + "话题 访问超时！第" + (delayRetry + 1) + "次重试中...");
                                GM_setValue("delayRetry", delayRetry + 1);
                                onebyone(gg, "conti"); //再请求
                            } else {
                                Tds[gg].innerHTML = consNum(gg) + ".&nbsp;" + huatiName + " 暂时无法访问 ";
                                Tds[gg].appendChild(pauseAc);
                                GM_deleteValue("delayRetry");
                            }
                        }, 5000);
                    } else if (responseDe.readyState == 2) { //如顺利，消除延时
                        clearTimeout(ttss);
                        GM_deleteValue("delayRetry");
                    }
                }
            });
            //跳过功能
            var hii = gg;
            var pauseAc = document.createElement("a");
            pauseAc.href = 'javascript:void(0);';
            pauseAc.innerHTML = " 跳过";
            pauseAc.addEventListener('click', function () {
                myRequest.abort(); //中止请求
                clearTimeout(ttss); //取消延时块
                GM_deleteValue("delayRetry");
                var dnn = hii + 1;
                if (dnn < tibeNums && !Tds[dnn].innerHTML) {
                    onebyone(dnn, "conti"); //进行下一个话题的签到
                }
                Tds[hii].innerHTML = consNum(hii) + ".&nbsp;" + huatiName + " 已跳过 ";
                var reSignAn = document.createElement("a"); //添加重试按钮
                reSignAn.href = 'javascript:void(0);';
                reSignAn.innerHTML = "重试";
                reSignAn.addEventListener('click', function () {
                    onebyone(hii, "stop"); //带"stop"参数，避免递进执行。
                }, true);
                Tds[hii].appendChild(reSignAn);
            }, true);
            Tds[gg].appendChild(pauseAc);
        }
    }
}

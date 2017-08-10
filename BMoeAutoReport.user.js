// ==UserScript==
// @name         BMoeAutoReport
// @namespace    https://greasyfork.org/users/10290
// @version      2017.08.11.1
// @description  b萌自动报榜。支持投票期未投票后台记录导出。投票记录分析需每日调节参数。
// @author       xyau
// @match        file:///*/201708*.txt
// @include        http://bangumi.bilibili.com/moe/2017/*/index*
// @downloadURL       https://github.com/xyauhideto/bmoe/raw/master/BMoeAutoReport.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var url=location.href;
    if(/txt/.test(url)){
        // 投票记录报榜
        var data=document.querySelector('body').innerText;
        var lj=[];
        // 每日变化部分开始
        var s='128-32-4 总数,真爱,单投';
var id=[11106,1773,11108,11317,11092,1718,1256,1660,1670,10969,3197,11196,3072,10977,3136,1665,1966,2585,11318,3496,2226,2577,2212,3492,2744,3300,11088,2891,2845,2844,2935,2843];
var ch=["天真·哈尼雅·怀特","宇智波佐良娜","律","速水凛香","工藤有希子","阿尼·利昂纳德","藤原塔子","绘鸠早苗","中津静流","漩涡向日葵","诗浓(朝田诗乃)","宫野明美","羽川翼","小爱","夕立","篝","海藤瞬","罗马尼·阿基曼","千叶龙之介","紫原敦","鹤丸国永","松野十四松","堀川国广","赤司征十郎","真土翔太","鹿屋瑠伟","工藤优作","海涅·维特根斯坦因","让·基尔希斯坦","莱纳·布朗","安昙小太郎","艾尔文·史密斯",];
var gnm=["女子32C3","女子32D3","女子32G3","女子32H3","男子32C3","男子32D3","男子32G3","男子32H3",];
lj.push(['杀老师Q',matchN(data,/11(108|317),.*11318/g)]);
lj.push(['博人传',matchN(data,/1773,.*10969/g)]);
lj.push(['名侦探柯南',matchN(data,/11092,11196/g)+matchN(data,/11092,.*11088/g)+matchN(data,/11196,.*11088/g)-2*matchN(data,/11092,11196,.*11088/g)]);
lj.push(['进击的巨人',matchN(data,/1718,.*284[543]/g)]);
lj.push(['Rewrite',matchN(data,/1670,1665/g)]);
lj.push(['黑子的篮球',matchN(data,/3496,.*3492/g)]);
        // 每日变化部分结束
        var cha=[];
        id.forEach(function(e,n){
            // 真爱票
            var reg=new RegExp(',1,'+e,'g');
            var tl=matchN(data,reg);
            // 总票数
            reg=new RegExp(','+e,'g');
            var al=matchN(data,reg)+tl;
            // 单投
            reg=new RegExp(',0,'+e+'[^,]','g');
            var sg=matchN(data,reg);
            cha.push({
                id:e,
                nm:ch[n],
                truelove:tl,
                single:sg,
                all:al
            });
        });
        var group=[];
        var groupSize=id.length/gnm.length;
        for(var k=0;k<gnm.length;k++){
            group.push({
                name:gnm[k],
                result:cha.slice(k*groupSize,(k+1)*groupSize)
            });
        }
        group.forEach(function(e){
            s+='<br>.<br>'+e.name;
            var gRe=e.result.sort(function(a,b){
                return b.all-a.all;
            });
            gRe.forEach(function(e){
                s+='<br>'+e.all+','+e.truelove+','+e.single+'\t'+e.nm;
            });
        });
        s+='<br>.<br>连击';
        lj.sort(function(a,b){
            return b[1]-a[1];
        }).forEach(function(e){
            s+='<br>'+e[1]+' '+e[0];
        });
        document.write(s);
        function matchN(d,a){
            return a.test(d)?d.match(a).length:0;
        }
    }
    // 赛程页报榜
    if(/schedule/.test(url)){
        var areaId=/cn/.test(url)?1:2;
        var [y,mm,dd]=/=(\d{4})(\d{2})(\d{2})/g.exec(url).slice(1,4);
        var dp=new Date(y+'/'+mm+'/'+dd+' 00:30 GMT+8');
        var d=new Date();
        var ddif=d.getTime()-dp.getTime();
        // 判定是否开赛
        var isVote=ddif>=0;
        if(isVote){
            if(ddif<22.5*3600000){
                var h=(d.getUTCHours()+8)%24;
                var m=d.getMinutes();m=m-m%30;
                // 判定当日是否投票
                var voted=document.querySelectorAll('.myvote-content a').length;
                if(!voted){
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET','http://bangumi.bilibili.com/moe/2017/'+areaId+'/api/schedule/current',false);
                    xhr.send();
                    var data = JSON.parse(xhr.responseText).result;
                    var gid=[];
                    data.voteGroups.forEach(function(e){
                        gid.push([e.group_id,e.group_name]);
                    });
                }
            }else{
                // 判定比赛是否结束
                var voted=1;
                var [h,m]=[23,0];
            }
        }
        function r(){
            // 判定页面加载完成
            if(document.querySelector('.male .role-item')&&document.querySelector('.female .role-item')){
                // 输出结果分析用参数
                var [ss,id,ch]=['var id=[',[],'];\r\nvar ch=['];
                [].slice.call(document.querySelectorAll('.name-wrapper')).forEach(function(e){
                    id.push(e.href.split('/')[8]);
                    ch+='"'+e.innerText+'",';
                });
                ss+=id+ch+'];\r\nvar gnm=[';
                [].slice.call(document.querySelectorAll('.tickets-list-title-2')).forEach(function(e){
                    ss+='"'+e.innerText+'",';
                });
                ss+='];';
                console.log(ss);
                [].slice.call(document.querySelectorAll('.role-item [style="display: none;"]')).forEach(function(e){
                    e.style.display = 'block';
                });
                var result=[];
                [].slice.call(document.querySelectorAll('.name-wrapper')).forEach(function(e,n){
                    result.push({
                        name:e.innerText,
                        bgm:$('.bangumi-wrapper')[n].innerText,
                        per:isVote&&voted?$('.ticket-num-percentage')[n].innerText:'',
                        all:isVote&&voted?parseInt($('.ticket-num-all')[n].innerText):0,
                        inc:isVote&&voted?parseInt($('.ticket-num-increment')[n].innerText):0
                    });
                });
                if(isVote&&!voted){
                    var i=0;
                    gid.forEach(function(e){
                        xhr.open('GET','http://bangumi.bilibili.com/moe/2017/'+areaId+'/api/schedule/ranking/'+e[0],false);
                        xhr.send();
                        JSON.parse(xhr.responseText).result.forEach(function(e){
                            result[i].name=e.chn_name;
                            result[i].bgm=e.seasons.title;
                            result[i].per=e.ballot_ratio/100+'%';
                            result[i].all=e.ballot_sum;
                            result[i].inc=e.ballot_num;
                            i++;
                        });
                    });
                }
                var s='';
                var group=[];
                var t=document.querySelectorAll('.tickets-list-title-2');
                // 判定是否海选
                var isHX=t.length===0;
                if(isHX){
                    // 萌组角色数
                    var fl=document.querySelectorAll('.female .role-item').length;
                    group.push({
                        name:'萌组',
                        result:result.slice(0,fl-1)
                    });
                    group.push({
                        name:'燃组',
                        result:result.slice(fl)
                    });
                }else{
                    var groupSize=result.length/t.length;
                    for(var k=0;k<t.length;k++){
                        group.push({
                            name:t[k].innerText,
                            result:result.slice(k*groupSize,(k+1)*groupSize)
                        });
                    }
                }
                if(isVote)var [All,Inc]=[0,0];
                group.forEach(function(e,n){
                    if(isVote){
                        var [gAll,gInc]=[0,0];
                        e.result.forEach(function(e){
                            gAll+=e.all; gInc+=e.inc;
                        });
                        All+=gAll; Inc+=gInc;
                    }
                    var nn=n;
                    s+='<br>.<br>'+e.name+(isVote?('\t'+gAll+'|'+gInc):'');
                    var gRe=isHX?e.result.slice(0,13):(isVote?e.result.sort(function(a,b){
                        return b.all-a.all;
                    }):e.result);
                    gRe.forEach(function(e,n){
                        if(isVote){
                            var num=e.all+'|'+e.inc;
                            var per=e.per+'|'+Math.floor(e.inc*10000/gInc)/100+'%';
                        }
                        s+='<br>'+(isVote?(isHX?((n<9?'0':'')+(n+1)+':\t'+per+'\t'+num):(num+'\t'+per)):id[n+nn*groupSize])+'\t'+e.name+(isVote?((isHX?('\t'+e.bgm):'')+(n==0?'':'\t'+(gRe[n-1].all-e.all)+'|'+(gRe[n-1].inc-e.inc))):('\t'+e.bgm));
                    });
                });
                window.open().document.write($('.text3')[0].innerText+(isVote?('\t'+h+':'+(m<1?'0'+m:m)+'<br>'+All+'|'+Inc):'')+s);
                e=clearInterval(e);
            }
        }
        var e=setInterval(r,100);
    }
})();

# bmoe
2017 Bilibili Moe 相关。没系统学过 JS ，随便写写。

一些记录档案：[百度云](https://pan.baidu.com/s/1dELXoGT) 密码：77rp

## 活动主页
http://bangumi.bilibili.com/moe/2017/*area*/index

  + area: 区域
    - cn: [国产](http://bangumi.bilibili.com/moe/2017/cn/index) 
    - jp: [日本](http://bangumi.bilibili.com/moe/2017/jp/index)

## [每日实时投票记录](http://bangumi.bilibili.com/moe/2017/realtime/index)
2017日本动画场本战开启。
 
  + 记录抓取小书签: 其实可以直接用 JSON.stringify() ，不过考虑数据量为了节省空间改了改。
    - 序数版，首页存储赛程信息：```javascript: var page = parseInt(window.prompt('起始', 1)); var num = parseInt(window.prompt('单次至多抓取', 100)); var max = page + num - 1; var more = 1; var xhr = new XMLHttpRequest(); xhr.open('GET', 'http://bangumi.bilibili.com/moe/2017/2/api/schedule/current', false); xhr.send(); data = JSON.parse(xhr.responseText).result; var group = data.voteGroups; var title = data.title; var isHX = !data.duel_type; var id = []; group.forEach(function(e) { e.characters.sort(function(a, b) { return a.character_id - b.character_id }); id.push(e.characters.map(function(e) { return e.character_id })) }); while (more && page <= max) { if (page == 1) { document.write(data.title + '\t' + data.duel_type + '<br>% 组号,组名\t序号:角色号,角色名,番名;<br>' + group.map(function(e) { return [e.group_id, e.group_name, e.sex, e.vote_num].join() + '\t' + e.characters.map(function(e, n) { return (isHX ? '' : (n + 1) + ':') + [e.character_id, e.chn_name, e.seasons[0].title].join(); }).join('; '); }).join('<br>') + '<br>% 昵称首字+长度+末字,真爱与否,' + (isHX ? '所投ID,' : '分组所投序数')) } xhr = new XMLHttpRequest(); xhr.open('GET', 'http://bangumi.bilibili.com/moe/2017/2/api/realtime/votes?pagesize=50&page=' + page, false); xhr.send(); data = JSON.parse(xhr.responseText).result; if (data.length > 0) { document.write('<br>' + data.map(function(e) { return [[e.nickname].map(function(e) { e = Array.from(e); return e[0] + (e.length - 2) + e.pop() }).join(), e.type, isHX ? e.character_ids : Number(id.map(function(ee) { return e.character_ids.split(',').reduce(function(c, eee) { return c + 1 + ee.indexOf(Number(eee)) }, 0).toString() }).join(''))].join() }).join('<br>')); console.log(page); if (data.length < 50) more = 0 } else { more = 0 } page++; } document.write('<br>% ' + (more ? '待续自' : '截止' + new Date(Math.floor((new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 28800000) / 1800000) * 1800000).toLocaleTimeString('nl') + '共' + ((page - 1) * 50 + data.length) + '人次。下轮抓取自') + (page - (more ? 0 : 1)) + '页' + (more ? '' : '第' + (1 + data.length) + '行'))```
    - 旧版，需手动修改userscript中部分参数，来源赛程页控制台生成的第二组代码：```javascript: var page = parseInt(window.prompt('起始', 1)); var num = parseInt(window.prompt('单次至多抓取', 100)); var max = page + num - 1; var more = 1; var result = new Array; while (more && page <= max) { xhr = new XMLHttpRequest(); xhr.open('GET', 'http://bangumi.bilibili.com/moe/2017/2/api/realtime/votes?pagesize=50&page=' + page, false); xhr.send(); data = JSON.parse(xhr.responseText).result; if (data.length > 0) { var s = ''; data.forEach(function(e) { rec = e.nickname + ',' + e.type + ',' + e.character_ids; s += rec + '<br>'; }); document.write(s); console.log(page); if (data.length < 50) more = 0 } else { more = 0 } page++; } document.write('<br>% ' + (more ? '待续自' : '截止' + new Date(Math.floor((new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 28800000) / 1800000) * 1800000).toLocaleTimeString('nl') + '共' + ((page - 1) * 50 + data.length) + '人次。下轮抓取自') + (page - (more ? 0 : 1)) + '页' + (more ? '' : '第' + (1 + data.length) + '行'))```
  + 旧版到序数版记录转换小书签，需配合赛程页控制台生成的第一组代码：```javascript: var data = document.body.innerText.split('\n'); var isHX = !duel_type; var id = []; group.forEach(function(e) { e.result.sort(function(a, b) { return a.id - b.id }); id.push(e.result.map(function(e) { return e.id })) }); console.log(title + '\t' + duel_type + '\r\n% 组号,组名\t序号:角色号,角色名,番名;\r\n' + group.map(function(e) { return [e.id, e.name, e.sex, e.vote_num].join() + '\t' + e.result.map(function(e, n) { return (isHX ? '' : (n + 1) + ':') + [e.id, e.name, e.bangumi].join(); }).join('; '); }).join('\r\n') + '\r\n% 昵称首字+长度+末字,真爱与否,' + (isHX ? '所投ID,' : '分组所投序数') + '\r\n' + data.map(function(e) { if (!/^(.*),([01]),((,?\d{2,})+)/g.test(e)) return e; else { e = /^(.*),([01]),((,?\d{2,})+)/g.exec(e).slice(1, 4); return [[e[0]].map(function(e) { e = Array.from(e); return e[0] + (e.length - 2) + e.pop() }).join(''), e[1], isHX ? e.slice(2).join() : Number(id.map(function(ee) { return e[2].split(',').reduce(function(c, eee) { return c + 1 + ee.indexOf(Number(eee)) }, 0).toString() }).join(''))].join() } }).join('\r\n'));```

## 一些后台JSON
* 日程安排：http://bangumi.bilibili.com/moe/2017/*area_id*/api/schedule/calendar
  + area_id/meng_type: 区域编号
    - 1: [国产](http://bangumi.bilibili.com/moe/2017/1/api/schedule/calendar)
    - 2: [日本](http://bangumi.bilibili.com/moe/2017/2/api/schedule/calendar)
  + duel_type: 比赛类型
    - 0: 海选
    - mn: m进n ，如 "6416" 表示 64进16
  + groups.id: **分组.编号**
  + schedule_id: 比赛日序数
  + schedule_status: 比赛进程
  	- 0: 下一场
  	- 1: 当前
  	- -1: 下两场或更晚
  	- 2: 完成
  + title: 当场标题
  + type: 赛程类型
  	- 0: 海选
  	- 1: 复活
  	- 2: 本战
  	- 3: 决赛
* 当日分组：http://bangumi.bilibili.com/moe/2017/*area_id*/api/schedule/current
	+ voteGroups.group_id: **分组.编号**
		- .characters.character_id: **角色.编号**
			- .seasons.title: 番剧标题
	+ vote_num: 组内最大可投票数
* 比赛结果：http://bangumi.bilibili.com/moe/2017/*area_id*/api/schedule/winner/*yyyymmdd*

* 当前排名： http://bangumi.bilibili.com/moe/2017/*area_id*/api/schedule/ranking/*group_id*

* 分时数据： http://bangumi.bilibili.com/moe/2017/*area_id*/api/schedule/trend/chart_*group_id*_*chart_type*.json
  + chart_type: 曲线类型
    - 0: 时段得票率
    - 1: 总得票数
    - 2: 时段得票数
  
* 当日投票记录： http://bangumi.bilibili.com/moe/2017/*area_id*/api/realtime/votes?pagesize=50&page=*page_number*
  + type: 投票类型。
    - 0: 普通票
    - 1: 真爱票

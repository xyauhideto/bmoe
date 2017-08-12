# bmoe
2017 Bilibili Moe 相关。没系统学过 JS ，随便写写。

## 活动主页
http://bangumi.bilibili.com/moe/2017/ *area* /index

  + area: 区域
    - cn: [国产](http://bangumi.bilibili.com/moe/2017/cn/index) 
    - jp: [日本](http://bangumi.bilibili.com/moe/2017/jp/index)
  
## [每日实时投票记录](http://bangumi.bilibili.com/moe/2017/realtime/index)
2017日本动画场本战开启。
 
 记录抓取:
    `javascript: var page = parseInt(window.prompt('%E8%B5%B7%E5%A7%8B', 1)); var num = parseInt(window.prompt('%E5%8D%95%E6%AC%A1%E8%87%B3%E5%A4%9A%E6%8A%93%E5%8F%96', 100)); var max = page + num - 1; var more = 1; var result = new Array; while (more && page <= max) { xhr = new XMLHttpRequest(); xhr.open('GET', 'http://bangumi.bilibili.com/moe/2017/2/api/realtime/votes?pagesize=50&page=' + page, false); xhr.send(); data = JSON.parse(xhr.responseText).result; if (data.length > 0) { var s = ''; data.forEach(function(e) { rec = e.nickname + ',' + e.type + ',' + e.character_ids; s += rec + '<br>'; }); document.write(s); console.log(page); if (data.length < 50) more = 0 } else { more = 0 } page++; } document.write((more ? '%E5%BE%85%E7%BB%AD%E8%87%AA' : '%E4%B8%8B%E8%BD%AE%E6%8A%93%E5%8F%96%E8%87%AA') + (page - (more ? 0 : 1)))`

## 一些后台JSON
* 日程安排：http://bangumi.bilibili.com/moe/2017/ *area_id* /api/schedule/calendar
  + area_id: 区域编号
    - 1: [国产](http://bangumi.bilibili.com/moe/2017/1/api/schedule/calendar)
    - 2: [日本](http://bangumi.bilibili.com/moe/2017/2/api/schedule/calendar)
  + duel_type: 比赛类型
    - 0: 海选
    - mn: m进n ，如 "6416" 表示 64进16
  + groups.id: **分组编号**
  + schedule_id: 比赛日序数

* 当前排名： http://bangumi.bilibili.com/moe/2017/1/api/schedule/ranking/ *group_id*

* 分时数据： http://bangumi.bilibili.com/moe/2017/1/api/schedule/trend/chart_ *group_id* _ *chart_type* .json
  + chart_type: 曲线类型
    - 0: 时段得票率
    - 1: 总得票数
    - 2: 时段得票数
  
* 当日投票记录： http://bangumi.bilibili.com/moe/2017/2/api/realtime/votes?pagesize=50&page= *page_number*
  + type: 投票类型。
    - 0: 普通票
    - 1: 真爱票

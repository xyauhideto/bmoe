// ==UserScript==
// @name         BMoeAutoReport
// @namespace    https://greasyfork.org/users/10290
// @version      2017.08.12.3
// @description  b萌自动报榜。支持投票期未投票后台记录导出。投票记录分析需每日调节参数。
// @author       xyau
// @match        file:///*/201708*.txt
// @include        http://bangumi.bilibili.com/moe/2017/*/index*
// @downloadURL       https://github.com/xyauhideto/bmoe/raw/master/BMoeAutoReport.user.js
// @grant        none
// ==/UserScript==
function matchN(d, a) {
    return a.test(d) ? d.match(a).length : 0;
}

(function() {
    'use strict';
    var url = location.href;
    var i, j, data;
    if (/txt/.test(url)) {
        // 投票记录报榜
        data = document.body.innerText;
        var [total, lj] = [data.match(/,[0,1],/g).length, []];

        // 每日变化部分开始
        var s = "本战128进32 DAY5\t" + total + "人次<br>总数, 真爱, 单投, 被投率";
        var id = [1645, 2993, 1313, 1662, 2997, 1661, 1754, 1716, 3170, 1591, 3154, 1253, 1590, 3006, 1046, 11057, 2841, 3328, 3470, 2574, 3450, 2201, 10933, 11093, 10908, 11313, 1965, 3453, 2656, 2233, 3448, 3299, ];
        var ch = ["才川莉子", "米特奥拉·艾斯特莱希", "泉镜花", "鸥端海苔子(最可)", "阿尔泰尔", "皆川茜", "露米娅·廷格尔", "希斯特莉亚·雷斯", "大和", "班长", "金刚", "夏目玲子", "白羽·菈菲尔·恩兹沃斯", "高砂智惠", "照桥心美", "丙", "柯尼·史普林格", "威廉·克梅修", "茅场晶彦", "松野空松", "格雷尔·沙多克里夫", "药研藤四郎", "琴酒", "高木涉", "自来也", "矶贝悠马", "燃堂力", "斯内克", "老板", "山姥切国广", "夏尔·凡多姆海威", "弥勒寺优夜", ];
        var gnm = ["女子32A2", "女子32B2", "女子32E2", "女子32F2", "男子32A2", "男子32B2", "男子32E2", "男子32F2", ];
        lj.push(["Re: CREATORS: 米特奥拉·艾斯特莱希, 阿尔泰尔", matchN(data, /2993, .*2997/g)]);
        lj.push(["Re: CREATORS: 米特奥拉·艾斯特莱希, 弥勒寺优夜", matchN(data, /2993, .*3299/g)]);
        lj.push(["Re: CREATORS: 米特奥拉·艾斯特莱希, 阿尔泰尔, 弥勒寺优夜", matchN(data, /2993, .*2997, .*3299/g)]);
        lj.push(["人渣的本愿: 鸥端海苔子(最可), 皆川茜", matchN(data, /1662, .*1661/g)]);
        lj.push(["Re: CREATORS: 阿尔泰尔, 弥勒寺优夜", matchN(data, /2997, .*3299/g)]);
        lj.push(["进击的巨人 第二季: 希斯特莉亚·雷斯, 柯尼·史普林格", matchN(data, /1716, .*2841/g)]);
        lj.push(["珈百璃的堕落: 班长, 白羽·菈菲尔·恩兹沃斯", matchN(data, /1591, .*1590/g)]);
        lj.push(["珈百璃的堕落: 班长, 老板", matchN(data, /1591, .*2656/g)]);
        lj.push(["珈百璃的堕落: 班长, 白羽·菈菲尔·恩兹沃斯, 老板", matchN(data, /1591, .*1590, .*2656/g)]);
        lj.push(["夏目友人帐 伍: 夏目玲子, 丙", matchN(data, /1253, .*11057/g)]);
        lj.push(["珈百璃的堕落: 白羽·菈菲尔·恩兹沃斯, 老板", matchN(data, /1590, .*2656/g)]);
        lj.push(["齐木楠雄的灾难: 照桥心美, 燃堂力", matchN(data, /1046, .*1965/g)]);
        lj.push(["黑执事 Book of the Atlantic: 格雷尔·沙多克里夫, 斯内克", matchN(data, /3450, .*3453/g)]);
        lj.push(["黑执事 Book of the Atlantic: 格雷尔·沙多克里夫, 夏尔·凡多姆海威", matchN(data, /3450, .*3448/g)]);
        lj.push(["黑执事 Book of the Atlantic: 格雷尔·沙多克里夫, 斯内克, 夏尔·凡多姆海威", matchN(data, /3450, .*3453, .*3448/g)]);
        lj.push(["刀剑乱舞-花丸-: 药研藤四郎, 山姥切国广", matchN(data, /2201, .*2233/g)]);
        lj.push(["黑执事 Book of the Atlantic: 斯内克, 夏尔·凡多姆海威", matchN(data, /3453, .*3448/g)]);
        // 每日变化部分结束

        var cha = [];
        id.forEach(function(e, n) {
            // 真爱票
            var reg = new RegExp(',1,' + e, 'g');
            var tl = matchN(data, reg);
            // 总票数
            reg = new RegExp(',' + e, 'g');
            var al = matchN(data, reg) + tl;
            // 单投
            reg = new RegExp(',0,' + e + '[^,]', 'g');
            var sg = matchN(data, reg);
            cha.push({
                id: e,
                nm: ch[n],
                truelove: tl,
                single: sg,
                all: al
            });
        });
        var group = [];
        var groupSize = id.length / gnm.length;
        for (j = 0; j < gnm.length; j++) {
            group.push({
                name: gnm[j],
                result: cha.slice(j * groupSize, (j + 1) * groupSize)
            });
        }
        var [All, Tl, Sg] = [0, 0, 0];
        group.forEach(function(e) {
            s += '<br>.<br>' + e.name;
            var [gAll, gTl, gSg] = [0, 0, 0];
            e.result.forEach(function(e) {
                gAll += e.all;
                gTl += e.truelove;
                gSg += e.single;
            });
            All += gAll;
            Tl += gTl;
            Sg += gSg;
            s += '\t' + [gAll, gTl, gSg, Math.floor((gAll - gTl) / total *10000) / 100 + '%'].join(', ');
            var gRe = e.result.sort(function(a, b) {
                return b.all - a.all;
            });
            gRe.forEach(function(e) {
                s += '<br>' + [e.all, e.truelove, e.single, Math.floor((e.all - e.truelove) / total *10000) / 100 + '%'].join(', ') + '\t' + e.nm;
            });
        });
        i = s.indexOf('.');
        s = s.slice(0, i).concat([All, Tl, Sg].join(', ') + '<br>', s.slice(i));
        s += '<br>.<br>连击';
        lj.sort(function(a, b) {
            return b[1] - a[1];
        }).forEach(function(e) {
            s += '<br>' + e[1] + '\t' + e[0];
        });
        document.title = location.href.split('/')[location.href.split('/').length - 1].split('.')[0] + '投票记录分析';
        document.body.innerHTML = s;
    }
    // 赛程页报榜
    if (/schedule/.test(url)) {
        function r() {
            var areaId = /cn/.test(url) ? 1 : 2;
            var [y, mm, dd] = /=(\d{4})(\d{2})(\d{2})/g.exec(url).slice(1, 4);
            var dp = new Date(y + '/' + mm + '/' + dd + ' 00:30 GMT+8');
            var d = new Date();
            var ddif = d.getTime() - dp.getTime();
            // 判定是否开赛
            var isVote = ddif >= 0;
            // 判定页面加载完成
            if ((isVote && document.querySelector('.myvote-content')) || (document.querySelector('.male .role-item') && document.querySelector('.female .role-item'))) {
                var h, m, voted;
                var gid = [];
                if (isVote) {
                    if (ddif < 22.5 * 3600000) {
                        h = (d.getUTCHours() + 8) % 24;
                        m = d.getMinutes();
                        m = m - m % 30;
                        // 判定当日是否投票
                        voted = document.querySelectorAll('.myvote-content a').length;
                        if (!voted) {
                            var xhr = new XMLHttpRequest();
                            xhr.open('GET', 'http://bangumi.bilibili.com/moe/2017/' + areaId + '/api/schedule/current', false);
                            xhr.send();
                            data = JSON.parse(xhr.responseText).result;
                            data.voteGroups.forEach(function(e) {
                                gid.push([e.group_id, e.group_name]);
                            });
                        }
                    } else {
                        // 判定比赛是否结束
                        voted = 1;
                        [h, m] = [23, 0];
                    }
                }
                var dayTitle = $('.text3')[0].innerText;
                // 显示全部数据
                [].slice.call(document.querySelectorAll('.role-item [style="display: none;"]')).forEach(function(e) {
                    e.style.display = 'block';
                });
                // 储存结果
                var result = [];
                [].slice.call(document.querySelectorAll('.name-wrapper')).forEach(function(e, n) {
                    result.push({
                        id: e.href.split('/')[8],
                        name: e.innerText,
                        bgm: $('.bangumi-wrapper')[n].innerText,
                        per: isVote && voted ? $('.ticket-num-percentage')[n].innerText : '',
                        all: isVote && voted ? parseInt($('.ticket-num-all')[n].innerText) : 0,
                        inc: isVote && voted ? parseInt($('.ticket-num-increment')[n].innerText) : 0
                    });
                });
                // 比赛日未投票时从后台抓取
                if (isVote && !voted) {
                    i = 0;
                    gid.forEach(function(e) {
                        xhr.open('GET', 'http://bangumi.bilibili.com/moe/2017/' + areaId + '/api/schedule/ranking/' + e[0], false);
                        xhr.send();debugger;
                        JSON.parse(xhr.responseText).result.forEach(function(e) {
                            result[i].id = e.character_id;
                            result[i].name = e.chn_name;
                            result[i].bgm = e.seasons[0].title;
                            result[i].per = e.ballot_ratio / 100 + '%';
                            result[i].all = e.ballot_sum;
                            result[i].inc = e.ballot_num;
                            i++;
                        });
                    });
                }
                var s = '';
                var group = [];
                var t = document.querySelectorAll('.tickets-list-title-2');
                // 判定是否海选
                var isHX = t.length === 0;
                if (isHX) {
                    // 萌组角色数
                    var fl = document.querySelectorAll('.female .role-item').length;
                    group.push({
                        name: '萌组',
                        result: result.slice(0, fl - 1)
                    });
                    group.push({
                        name: '燃组',
                        result: result.slice(fl)
                    });
                } else {
                    var groupSize = result.length / t.length;
                    for (j = 0; j < t.length; j++) {
                        group.push({
                            name: t[j].innerText,
                            result: result.slice(j * groupSize, (j + 1) * groupSize)
                        });
                    }
                }
                var [All, Inc, num, per] = [0, 0, 0, 0];
                group.forEach(function(e, nn) {
                    s += '<br>.<br>' + e.name;
                    if (isVote) {
                        var [gAll, gInc] = [0, 0];
                        e.result.forEach(function(e) {
                            gAll += e.all;
                            gInc += e.inc;
                        });
                        All += gAll;
                        Inc += gInc;
                        s += '\t' + gAll + '|' + gInc;
                    }
                    var gRe = isHX ? e.result.slice(0, 13) : (isVote ? e.result.sort(function(a, b) {
                        return b.all - a.all;
                    }) : e.result);
                    gRe.forEach(function(e, n) {
                        if (isVote) {
                            num = e.all + '|' + e.inc;
                            per = e.per + '|' + Math.floor(e.inc * 10000 / gInc) / 100 + '%';
                        }
                        s += '<br>' + (isVote ? (isHX ? ((n < 9 ? '0' : '') + (n + 1) + ':\t' + per + '\t' + num) : (num + '\t' + per)) : result[n + nn * groupSize].id) + '\t' + e.name + (isVote ? ((isHX ? ('\t' + e.bgm) : '') + (n === 0 ? '' : '\t' + (gRe[n - 1].all - e.all) + '|' + (gRe[n - 1].inc - e.inc))) : ('\t' + e.bgm));
                    });
                });
                var reWin = window.open('', '', 'width = 480, height = 640');
                reWin.document.body.innerHTML = dayTitle + (isVote ? ('\t' + h + ':' + (m < 1 ? '0' + m : m) + '<br>' + All + ', ' + Inc) : '') + s;
                reWin.document.title = dayTitle + (isVote ? ('\t' + h + ':' + (m < 1 ? '0' + m : m)) : '');
                reWin.document.close();
                // 输出结果分析用参数
                var [ss, ch, lj] = ['\r\nvar s = "' + dayTitle + '\\t" + total + "人次<br>总数, 真爱, 单投, 被投率";\r\nvar id = [', '];\r\nvar ch = [', '];'];
                result.forEach(function(e) {
                    ss += e.id + ',';
                    ch += '"' + e.name + '", ';
                });
                ss += ch + '];\r\nvar gnm = [';
                group.forEach(function(e, n) {
                    ss += '"' + e.name + '", ';
                    e.result.forEach(function(e) {
                        var ljs = [];
                        var [name, id] = [
                            [e.name],
                            [e.id]
                        ];
                        group.slice(n + 1).forEach(function(ee, nn) {
                            ee.result.forEach(function(eee) {
                                if (e.bgm == eee.bgm) {
                                    if (id.length > 1 && j == nn) {
                                        name.pop();
                                        id.pop();
                                    }
                                    if (id.length > 1) {
                                        ljs.push([
                                            [name[0], eee.name].join(', '), [id[0], '.*' + eee.id].join()
                                        ]);
                                        for (i = 1; i < id.length - 1; i++) {
                                            for (var k = 0; k < id.length - i; k++) {
                                                var [ids, names] = [id.slice(i), name.slice(i)];
                                                ljs.push([name.slice(0, i).concat(names.splice(k, 1), eee.name).join(', '), id.slice(0, i).concat(ids.splice(k, 1), '.*' + eee.id).join()]);
                                            }
                                        }
                                    }
                                    id.push('.*' + eee.id);
                                    name.push(eee.name);
                                    ljs.push([name.join(', '), id.join()]);
                                    j = nn;
                                }
                            });
                        });
                        ljs.forEach(function(el) {
                            lj += '\r\nlj.push(["' + e.bgm + ': ' + el[0] + '", matchN(data,/' + el[1] + '/g)]);';
                        });
                    });
                });
                ss += lj;
                console.log(ss);
                e = clearInterval(e);
            }
        }
        var e = setInterval(r, 1000);
    }
})();

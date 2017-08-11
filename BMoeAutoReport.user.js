// ==UserScript==
// @name         BMoeAutoReport
// @namespace    https://greasyfork.org/users/10290
// @version      2017.08.11.2
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
        var lj = [];

        // 每日变化部分开始
        var s = "本战128进32 DAY4<br>总数,真爱,单投";
        var id = [11106, 1773, 11108, 11317, 1718, 1660, 1256, 11092, 3197, 10969, 1670, 11196, 3136, 3072, 1665, 10977, 2585, 1966, 3496, 11318, 3492, 2226, 2577, 2212, 2744, 2891, 11088, 3300, 2935, 2843, 2845, 2844, ];
        var ch = ["天真·哈尼雅·怀特", "宇智波佐良娜", "律", "速水凛香", "阿尼·利昂纳德", "绘鸠早苗", "藤原塔子", "工藤有希子", "诗浓(朝田诗乃)", "漩涡向日葵", "中津静流", "宫野明美", "夕立", "羽川翼", "篝", "小爱", "罗马尼·阿基曼", "海藤瞬", "紫原敦", "千叶龙之介", "赤司征十郎", "鹤丸国永", "松野十四松", "堀川国广", "真土翔太", "海涅·维特根斯坦因", "工藤优作", "鹿屋瑠伟", "安昙小太郎", "艾尔文·史密斯", "让·基尔希斯坦", "莱纳·布朗", ];
        var gnm = ["女子32C3", "女子32D3", "女子32G3", "女子32H3", "男子32C3", "男子32D3", "男子32G3", "男子32H3", ];
        lj.push(["博人传 火影忍者新时代:宇智波佐良娜,漩涡向日葵", matchN(data, /1773,.*10969/g)]);
        lj.push(["杀老师Q:律,千叶龙之介", matchN(data, /11108,.*11318/g)]);
        lj.push(["杀老师Q:速水凛香,千叶龙之介", matchN(data, /11317,.*11318/g)]);
        lj.push(["进击的巨人 第二季:阿尼·利昂纳德,艾尔文·史密斯", matchN(data, /1718,.*2843/g)]);
        lj.push(["进击的巨人 第二季:阿尼·利昂纳德,让·基尔希斯坦", matchN(data, /1718,.*2845/g)]);
        lj.push(["进击的巨人 第二季:阿尼·利昂纳德,莱纳·布朗", matchN(data, /1718,.*2844/g)]);
        lj.push(["名侦探柯南:工藤有希子,宫野明美", matchN(data, /11092,.*11196/g)]);
        lj.push(["名侦探柯南:工藤有希子,工藤优作", matchN(data, /11092,.*11088/g)]);
        lj.push(["名侦探柯南:工藤有希子,宫野明美,工藤优作", matchN(data, /11092,.*11196,.*11088/g)]);
        lj.push(["Rewrite 2nd Season:中津静流,篝", matchN(data, /1670,.*1665/g)]);
        lj.push(["名侦探柯南:宫野明美,工藤优作", matchN(data, /11196,.*11088/g)]);
        lj.push(["黑子的篮球 LAST GAME:紫原敦,赤司征十郎", matchN(data, /3496,.*3492/g)]);
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
            s += '\t' + [gAll, gTl, gSg];
            var gRe = e.result.sort(function(a, b) {
                return b.all - a.all;
            });
            gRe.forEach(function(e) {
                s += '<br>' + [e.all, e.truelove, e.single] + '\t' + e.nm;
            });
        });
        i = s.indexOf('.');
        s = s.slice(0, i).concat([All, Tl, Sg] + '<br>', s.slice(i));
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
            if (document.querySelector('.myvote-content') || (!isVote && document.querySelector('.male .role-item') && document.querySelector('.female .role-item'))) {
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
                        xhr.send();
                        JSON.parse(xhr.responseText).result.forEach(function(e) {
                            result[i].id = e.character_id;
                            result[i].name = e.chn_name;
                            result[i].bgm = e.seasons.title;
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
                reWin.document.body.innerHTML = dayTitle + (isVote ? ('\t' + h + ':' + (m < 1 ? '0' + m : m) + '<br>' + All + '|' + Inc) : '') + s;
                reWin.document.title = dayTitle + (isVote ? ('\t' + h + ':' + (m < 1 ? '0' + m : m)) : '');
                reWin.document.close();
                // 输出结果分析用参数
                var [ss, ch, lj] = ['\r\nvar s = "' + dayTitle + '<br>总数,真爱,单投";\r\nvar id = [', '];\r\nvar ch = [', '];'];
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
                                            [name[0], eee.name].join(), [id[0], '.*' + eee.id].join()
                                        ]);
                                        for (i = 1; i < id.length - 1; i++) {
                                            for (var k = 0; k < id.length - i; k++) {
                                                var [ids, names] = [id.slice(i), name.slice(i)];
                                                ljs.push([name.slice(0, i).concat(names.splice(k, 1), eee.name).join(), id.slice(0, i).concat(ids.splice(k, 1), '.*' + eee.id).join()]);
                                            }
                                        }
                                    }
                                    id.push('.*' + eee.id);
                                    name.push(eee.name);
                                    ljs.push([name.join(), id.join()]);
                                    j = nn;
                                }
                            });
                        });
                        ljs.forEach(function(el) {
                            lj += '\r\nlj.push(["' + e.bgm + ':' + el[0] + '", matchN(data,/' + el[1] + '/g)]);';
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

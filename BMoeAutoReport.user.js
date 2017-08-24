// ==UserScript==
// @name         BMoeAutoReport
// @namespace    https://greasyfork.org/users/10290
// @version      2017.08.24.0
// @description  b萌自动报榜。支持投票期未投票后台记录导出。投票记录分析旧版需手动修改赛程参数。
// @author       xyau
// @include        /file:\/\/\/.*/201708\d+\.txt/
// @include        /file:\/\/\/.*/201708\d+\.log/
// @include        http://bangumi.bilibili.com/moe/2017/*/index*
// @downloadURL       https://github.com/xyauhideto/bmoe/raw/master/BMoeAutoReport.user.js
// @grant        none
// ==/UserScript==
function matchN(d, a) {
    return a.test(d) ? d.match(a).length : 0;
}

function br(e, b) {
    return b.length > 1 ? b[0] + e + b.slice(-1) : e;
}
// 计算分组和全部得票数以及各组时段得票率
function sum(e, p) {
    return p.reduce(function(a, ee) {
        a.push(e.reduce(function(s, c) {
            return s + c[ee];
        }, 0));
        return a;
    }, []);
}
(function() {
    'use strict';
    var url = location.href;
    var style = '<style type=\'text/css\'>body{font-size: 14px; border-collapse; padding-top: 14px;} .t{border-top: 1px solid #ddd; padding-top: 8px} .f{position:fixed; top: 0px; width: 100%; background:white; z-index:999}td:nth-child(odd) {background: #ddd}</style>';
    var i, j, data;
    if (/log/.test(url)) {
        // 投票记录序数版报榜
        data = document.body.innerText.split('\n');
        var [title, duel_type] = data.shift().split('\t');
        var isHX = !duel_type;
        data.shift();
        var [all, truelove, single, max_vote_num] = [0, 0, 0, 0];
        // 读取赛程分组
        var group = data.splice(0, data.findIndex(function(e) {
            return e.includes('% ');
        })).map(function(e) {
            e = e.split('\t');
            var [group_id, name, sex, vote_num] = e[0].split(',');
            max_vote_num += Number(vote_num);
            var ch = e[1].split('; ').map(function(e) {
                if (!isHX)
                    e = e.replace(/^\d+:/, '');
                var [id, name, bangumi] = e.split(',');
                return {
                    id: id,
                    name: name,
                    sex: sex,
                    bangumi: bangumi,
                    gid: group_id,
                    all: 0,
                    num: 0,
                    truelove: 0,
                    single: 0
                };
            });
            return {
                id: group_id,
                name: name,
                sex: sex,
                vote_num: vote_num,
                ch: ch,
                all: 0,
                num: 0,
                truelove: 0,
                single: 0
            };
        });
        if (isHX) var ch = group.reduce(function(c, e) {
            return c.concat(e.ch);
        }, []);
        else {
            // 初始化性别大组
            var sex = [];
            sex.push({
                name: '男子组',
                all: 0,
                num: 0,
                truelove: 0,
                single: 0
            });
            sex.push({
                name: '女子组',
                all: 0,
                num: 0,
                truelove: 0,
                single: 0
            });
        }
        // 分析番组阵营
        var bangumi = group.reduce(function(bangumi, e) {
            e.ch.forEach(function(e) {
                i = bangumi.findIndex(function(eb) {
                    return eb.name == e.bangumi;
                });
                if (i == -1) {
                    bangumi.push({
                        name: e.bangumi,
                        id: [e.id],
                        ch: [e.name],
                        gid: [e.gid],
                        lj: [],
                        all: 0,
                        num: 0,
                        truelove: 0,
                        single: 0
                    });
                } else {
                    bangumi[i].id.push(e.id);
                    bangumi[i].gid.push(e.gid);
                    bangumi[i].ch.push(e.name);
                }
            });
            return bangumi;
        }, []);
        // 分析同番连击组合
        bangumi.forEach(function(e) {
            if (e.id.length > 1) {
                var idn = e.id.reduce(function(idn, ee, n) {
                    if (n > 0 && e.gid[n - 1] == e.gid[n]) {
                        idn.slice(-1)[0].push(ee);
                    } else {
                        idn.push([ee]);
                    }
                    return idn;
                }, []);
                var l = Math.pow(2, e.id.length);
                for (i = 0; i < l; i++) {
                    var t = Array.from(i.toString(2));
                    while (t.length < e.id.length)
                        t.unshift('0');
                    var ids = [];
                    for (var n in idn) {
                        var tt = t.splice(0, idn[n].length);
                        if (!isHX && tt.reduce(function(s, e) {
                                return s + Number(e);
                            }, 0) > 1)
                            continue;
                        for (var m in idn[n]) {
                            if (tt[m] == '1') {
                                ids.push(idn[n][m]);
                                if (!isHX)
                                    break;
                            }
                        }
                    }
                    if (ids.length > 1 && e.lj.findIndex(function(e) {
                            return e[0].length == ids.length && ids.every(function(ee) {
                                return e[0].includes(ee);
                            });
                        }) == -1) {
                        e.lj.push([ids, 0]);
                    }
                }
            }
        });
        data.shift();
        // 移除文件末空数据
        // while (1) {
        //   if (data[data.length - 1].length === 0)
        //      data.pop();
        //     else
        //      break;
        //  }
        var skip = 0;
        // 遍历记录计数
        data = data.map(function(e) {
            if (!/,[01],/.test(e)) skip++;
            else {
                var [nickname, type, vote] = e.split(',');
                if (isHX || !Array.from('01').includes(type))[nickname, type, vote] = /^(.*),([01]),((,?\d{2,})+)/g.exec(e).slice(1, 4);
                vote = isHX ? vote.split(',') : '0'.repeat(max_vote_num - vote.length) + vote;
                var [characters, bangumis, groups, isTruelove, isSingle] = [
                    [],
                    [],
                    [],
                    Number(type),
                    (isHX ? vote : vote.replace(/0/g, '')).length == 1,
                ];
                if (isTruelove) {
                    truelove++;
                } else if (isSingle) single++;
                if (!isHX) var sexs = [0, 0];
                Array.from(vote).forEach(function(e, n) {
                    if (e > 0) {
                        var ee = (isHX ? ch : group[n].ch).find(function(ee, nn) {
                            var isMatch = isHX ? ee.id : nn + 1 == e;
                            if (isMatch) {
                                if (!isHX) sexs[ee.sex]++;
                                ee.all++;
                                ee.num++;
                                all++;
                                if (isTruelove) {
                                    ee.truelove++;
                                    ee.all++;
                                    all++;
                                } else if (isSingle) ee.single++;
                            }
                            return isMatch;
                        });
                        characters.push(ee.id);
                        bangumis.push(ee.bangumi);
                        groups.push(ee.gid);
                    }
                });
                bangumi.forEach(function(e) {
                    if (bangumis.includes(e.name)) {
                        e.all += bangumis.reduce(function(c, ee) {
                            if (ee == e.name) c++;
                            return c;
                        }, 0);
                        e.num++;
                        if (isTruelove) {
                            e.truelove++;
                            e.all++;
                        } else if (isSingle) e.single++;
                        e.lj.forEach(function(ee, n) {
                            if (ee[0].every(function(ee) {
                                    return characters.includes(ee);
                                })) e.lj[n][1]++;
                        });
                    }
                });
                group.forEach(function(e) {
                    if (groups.includes(e.id)) {
                        e.all += groups.reduce(function(c, ee) {
                            if (ee == e.id) c++;
                            return c;
                        }, 0);
                        e.num++;
                        if (isTruelove) {
                            e.truelove++;
                            e.all++;
                        } else if (isSingle) e.single++;
                    }
                });
                if (!isHX) {
                    sex.forEach(function(e, n) {
                        if (sexs[n]) {
                            e.all += sexs[n];
                            e.num++;
                            if (isTruelove) {
                                e.truelove++;
                                e.all++;
                            } else if (isSingle) e.single++;
                        }
                    });
                }
                return {
                    nickname: nickname,
                    type: type,
                    vote: vote,
                    characters: characters,
                    bangumis: bangumis
                };
            }
        });
        var total = data.length - skip;
        var s = '<table><thead><tr class = \'f\'><th>' + ['总票数', '真爱', '单投', '总人次', '被投率', title].join('</th><th>') + '</th></tr></thead><tbody><tr><td class = \'t\'>' + [all, truelove, single, total, '', '<b>总计</b>'].join('</td><td class = \'t\'>') + '</td></tr>';
        if (!isHX) {
            s += '<tr><td>' + sex.map(function(e) {
                e.vper = Math.floor(e.num / total * 10000);
                return [e.all, e.truelove, e.single, e.num, e.vper / 100 + '%'].join('</td><td>') + '</td><td>' + e.name;
            }).join('</td></tr><tr><td>') + '</td></tr>';
        }
        group.forEach(function(e) {
            e.vper = Math.floor(e.num / total * 10000);
            var gRe = isHX ? e.ch.slice(0, 13) : e.ch.sort(function(a, b) {
                return b.all - a.all;
            });
            s += '<tr><td class = \'t\'>' + [e.all, e.truelove, e.single, e.num, e.vper / 100 + '%'].join('</td><td class = \'t\'>') + '<td class = \'t\'><b>' + e.name + '</b></td></td></tr><tr><td>' + gRe.map(function(e, n) {
                e.vper = Math.floor(e.num / total * 10000);
                return [e.all, e.truelove, e.single, e.num, e.vper / 100 + '%'].join('</td><td>') + '</td><td>' + e.name;
            }).join('</td></tr><tr><td>') + '</td></tr>';
        });
        s += '<tr><td class = \'t\'>' + ['', '', '', '', '', '<b>番组连击</b>'].join('</td><td class = \'t\'>') + '</td></tr>';
        bangumi.sort(function(a, b) {
            return b.num - a.num;
        });
        bangumi.forEach(function(e) {
            e.vper = Math.floor(e.num / total * 10000);
            e.lj.sort(function(a, b) {
                return b[1] - a[1];
            });
            s += '<tr><td class = \'t\'>' + [e.all, e.truelove, e.single, e.num, e.vper / 100 + '%'].join('</td><td class = \'t\'>') + '</td><td class = \'t\'>' + e.name + '</td></tr>' + (e.lj.length > 0 ? '<tr><td>' + e.lj.map(function(elj, n) {
                elj.push(Math.floor(elj[1] / total * 10000));
                return ['', '', '', elj[1], elj[2] / 100 + '%'].join('</td><td>') + '</td><td><i>' + elj[0].map(function(eid) {
                    return e.ch[e.id.findIndex(function(e) {
                        return eid == e;
                    })];
                }).join(', ') + '</i>';
            }).join('</td></tr><tr><td>') + '</td></tr>' : '');
        });
        document.body.innerHTML = s + '</tbody></table>';
        document.title = title + ' 投票记录分析';
        document.head.innerHTML += style;
    }
    // 赛程页报榜
    if (/schedule/.test(url)) {
        var areaId = /cn/.test(url) ? 1 : 2;
        var [y, mm, dd] = /=(\d{4})(\d{2})(\d{2})/g.exec(url).slice(1, 4);
        var dp = new Date(y + '/' + mm + '/' + dd + ' 00:30 GMT+8');
        var d = new Date();
        var ddif = d.getTime() - dp.getTime();
        // 判定是否开赛
        var isVote = ddif >= 0;
        var waitLoad = setInterval(function() {
            // 判定页面加载完成
            if ((isVote && document.querySelector('.myvote-content')) || (document.querySelector('.male .role-item') && document.querySelector('.female .role-item'))) {
                var h, m, voted;
                var title = $('.text3')[0].innerText;
                // 获取分组信息
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'http://bangumi.bilibili.com/moe/2017/' + areaId + '/api/schedule/calendar', false);
                xhr.send();
                data = JSON.parse(xhr.responseText).result;
                var schedule = data.schedules.find(function(e) {
                    return e.title == title;
                });
                var group = schedule.groups;
                // 判定是否海选
                var isHX = !schedule.duel_type;
                if (isVote) {
                    if (ddif < 22.5 * 3600000) {
                        h = (d.getUTCHours() + 8) % 24;
                        m = d.getMinutes();
                        m = m - m % 30;
                        // 判定当日是否投票
                        voted = document.querySelectorAll('.myvote-content a').length;
                    } else {
                        // 判定比赛是否结束
                        voted = 1;
                        [h, m] = [23, 0];
                    }
                }
                // 显示全部数据
                Array.from(document.querySelectorAll('.role-item [style="display: none;"]')).forEach(function(e) {
                    e.style.display = 'block';
                });
                // 储存结果
                var result = [];
                Array.from(document.querySelectorAll('.name-wrapper')).forEach(function(e, n) {
                    result.push({
                        id: e.href.split('/')[8],
                        name: e.innerText,
                        bangumi: $('.bangumi-wrapper')[n].innerText,
                        per: isVote && voted ? $('.ticket-num-percentage')[n].innerText : '',
                        all: isVote && voted ? parseInt($('.ticket-num-all')[n].innerText) : 0,
                        inc: isVote && voted ? parseInt($('.ticket-num-increment')[n].innerText) : 0
                    });
                });
                // 比赛日未投票时从后台抓取
                if (isVote && !voted) {
                    i = 0;
                    group.forEach(function(e) {
                        xhr.open('GET', 'http://bangumi.bilibili.com/moe/2017/' + areaId + '/api/schedule/ranking/' + e.id, false);
                        xhr.send();
                        JSON.parse(xhr.responseText).result.forEach(function(e) {
                            i = result.findIndex(function(ee) {
                                return ee.id == e.character_id;
                            });
                            result[i].per = e.ballot_ratio / 100 + '%';
                            result[i].all = e.ballot_sum;
                            result[i].inc = e.ballot_num;
                        });
                    });
                }
                if (isHX) {
                    // 萌组角色数
                    var fl = document.querySelectorAll('.female .role-item').length;
                    group[0].result = result.slice(0, fl - 1);
                    group[1].result = result.slice(fl);
                } else {
                    var groupSize = result.length / group.length;
                    group.forEach(function(e, n) {
                        e.result = result.slice(n * groupSize, (n + 1) * groupSize);
                    });
                }

                if (isVote) {
                    group.forEach(function(e) {
                        [e.all, e.inc] = sum(e.result, ['all', 'inc']);
                        e.result.forEach(function(ee) {
                            ee.cper = Math.floor(ee.inc / e.inc * 10000) / 100 + '%';
                        });
                    });
                    [group.all, group.inc] = sum(group, ['all', 'inc']);
                }
                var s = '';
                group.forEach(function(e) {
                    var gRe = isHX ? (isVote ? e.result.slice(0, 13) : e.result) : (isVote ? e.result.sort(function(a, b) {
                        return b.all - a.all;
                    }) : e.result);
                    s += '<tr>' + (isVote ? (isHX ? '<td class="t"></td>' : '') : '<td class="t">' + e.id + '</td>') + (isVote ? '<td class="t">' + [e.all, e.inc, '', ''].join('</td><td class="t">') + '</td>' : '') + '<td class="t"' + (isVote ? '' : ' colspan=2') + '><b>' + e.name + '</b>' + '</td></tr><tr><td>' + gRe.map(function(e, n) {
                        var num, per;
                        if (isVote)[num, per] = [e.all + '</td><td>' + e.inc, e.per + '</td><td>' + e.cper];
                        return (isVote ? (isHX ? [(n < 9 ? '0' : '') + (n + 1), per, num].join('</td><td>') : num + '</td><td>' + per) : e.id) + '</td><td>' + e.name + (isVote ? ((isHX ? ('\t' + e.bangumi) : '') + (gRe[n - 1] ? '</td><td>' + (gRe[n - 1].all - e.all) + '</td><td>' + (gRe[n - 1].inc - e.inc) : '')) : ('</td><td>' + e.bangumi)) + '</td></tr>';
                    }).join('</td></tr><tr><td>') + '</td></tr>';
                });
                var reWin = window.open('', '', 'width = 600, height = ' + Math.min(800, 28*(result.length + group.length + 3)));
                reWin.document.body.innerHTML = '<table><thead><tr>' + (isHX ? '<th rowspan=2>序号</th>' : '') + (isVote ? '' : '<th>ID</th>') + (isVote ? '<th colspan=2>' + (isHX ? ['得票率', '得票数'] : ['得票数', '得票率']).join('</th><th colspan=2>') + '</th>' : '') + '<th' + (isVote ? ' row' : ' col') + 'span=2><b>' + title + '</b>' + (isVote ? ('\t' + h + ':' + (m < 1 ? '0' + m : m)) + '</th><th colspan=2>票数差' : '') + '</th></tr>' + (isVote ? '<tr><th class="t">' + Array(3).fill('累积,时段').join().split(',').join('</th><th class="t">') + '</th></tr>' : '') + '</thead><tbody>' + (isVote ? '<tr><td>' + Array(isHX ? 1 : 0).concat(group.all, group.inc, Array(2), '<b>总计</b>', Array(isHX ? 1 : 0)).join('</td><td>') + '</td><td></td></tr>' : '') + s + '</tbody></table>';
                reWin.document.title = title + (isVote ? ('\t' + h + ':' + (m < 1 ? '0' + m : m)) : '');
                reWin.document.head.innerHTML += style;
                reWin.document.close();
                // 输出结果分析用参数
                console.log('var [title, duel_type, group] = ' + br([br(title, '\'\''), schedule.duel_type, '[]'], '[]') + ';\r\n' + group.map(function(e) {
                    return 'group.push({id:' + e.id + ', name:' + br(e.name, '\'\'') + ', sex:' + e.sex + ', vote_num:' + (isHX ? 8 : 1) + ', result:' + br(e.result.map(function(e) {
                        return '{id:' + e.id + ', name:' + br(e.name, '\'\'') + ', bangumi:' + br(e.bangumi, '\'\'') + '}';
                    }), '[]') + '});';
                }).join('\r\n'));
                var [ss, ch, lj] = ['\r\nvar s = "' + title + '\\t" + total + "人次<br>总数, 真爱, 单投, 被投率";\r\nvar id = [', '];\r\nvar ch = [', '];'];
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
                                if (e.bangumi == eee.bangumi) {
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
                            lj += '\r\nlj.push(["' + e.bangumi + ': ' + el[0] + '", matchN(data,/' + el[1] + '/g)]);';
                        });
                    });
                });
                ss += lj;
                console.log(ss);
                clearInterval(waitLoad);
            }
        }, 1000);
    }
    if (/txt/.test(url)) {
        // 投票记录报榜
        data = document.body.innerText;
        var [total, lj] = [data.match(/,[0,1],/g).length, []];

        // 每日变化部分开始
        var s = "本战128进32 DAY7\t" + total + "人次<br>总数, 真爱, 单投, 被投率";
        var id = [1640, 3093, 1181, 11186, 3002, 3042, 3038, 11141, 2992, 1593, 11374, 3145, 1641, 3004, 3037, 1298, 2743, 2600, 3412, 10876, 3373, 2214, 3494, 1969, 2847, 2198, 2327, 2379, 3466, 3491, 2210, 2770, ];
        var ch = ["小林", "奥寺美纪", "若菜羽衣", "黑魔导女孩", "和泉纱雾", "艾丝·华伦斯坦", "波岛出海", "和泉纱雾的母亲(初代埃罗芒阿老师)", "赛蕾嘉·尤比缇利亚", "千咲·塔普利斯·修格贝尔", "天女兽", "爱宕", "托尔", "千寿村征", "冰堂美智留", "黄前久美子", "泷谷真", "真壁政宗", "石田将也", "格伦·勒达斯", "杀老师", "加州清光", "绿间真太郎", "洼谷须亚莲", "阿明·阿诺德", "大和守安定", "田沼要", "埃德加·爱伦·坡", "桐人(桐谷和人)", "火神大我", "鲶尾藤四郎", "天王寺瑚太朗", ];
        var gnm = ["女子32A4", "女子32B4", "女子32E4", "女子32F4", "男子32A4", "男子32B4", "男子32E4", "男子32F4", ];
        lj.push(["小林家的龙女仆: 小林, 托尔", matchN(data, /1640,.*1641/g)]);
        lj.push(["小林家的龙女仆: 小林, 泷谷真", matchN(data, /1640,.*2743/g)]);
        lj.push(["小林家的龙女仆: 小林, 托尔, 泷谷真", matchN(data, /1640,.*1641,.*2743/g)]);
        lj.push(["埃罗芒阿老师: 和泉纱雾, 千寿村征", matchN(data, /3002,.*3004/g)]);
        lj.push(["路人女主的养成方法 ♭: 波岛出海, 冰堂美智留", matchN(data, /3038,.*3037/g)]);
        lj.push(["埃罗芒阿老师: 和泉纱雾的母亲(初代埃罗芒阿老师), 千寿村征", matchN(data, /11141,.*3004/g)]);
        lj.push(["小林家的龙女仆: 托尔, 泷谷真", matchN(data, /1641,.*2743/g)]);
        lj.push(["刀剑乱舞-花丸-: 加州清光, 大和守安定", matchN(data, /2214,.*2198/g)]);
        lj.push(["刀剑乱舞-花丸-: 加州清光, 鲶尾藤四郎", matchN(data, /2214,.*2210/g)]);
        lj.push(["刀剑乱舞-花丸-: 加州清光, 大和守安定, 鲶尾藤四郎", matchN(data, /2214,.*2198,.*2210/g)]);
        lj.push(["黑子的篮球 LAST GAME: 绿间真太郎, 火神大我", matchN(data, /3494,.*3491/g)]);
        lj.push(["刀剑乱舞-花丸-: 大和守安定, 鲶尾藤四郎", matchN(data, /2198,.*2210/g)]);
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
            s += '\t' + [gAll, gTl, gSg, Math.floor((gAll - gTl) / total * 10000) / 100 + '%'].join(', ');
            var gRe = e.result.sort(function(a, b) {
                return b.all - a.all;
            });
            gRe.forEach(function(e) {
                s += '<br>' + [e.all, e.truelove, e.single, Math.floor((e.all - e.truelove) / total * 10000) / 100 + '%'].join(', ') + '\t' + e.nm;
            });
        });
        i = s.indexOf('.');
        s = s.slice(0, i).concat([All, Tl, Sg].join(', ') + '<br>', s.slice(i));
        s += '<br><br>连击';
        lj.sort(function(a, b) {
            return b[1] - a[1];
        }).forEach(function(e) {
            s += '<br>' + e[1] + '\t' + e[0];
        });
        document.title = location.href.split('/')[location.href.split('/').length - 1].split('.')[0] + '投票记录分析';
        document.body.innerHTML = s;
    }
})();

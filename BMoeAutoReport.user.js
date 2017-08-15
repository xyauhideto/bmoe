// ==UserScript==
// @name         BMoeAutoReport
// @namespace    https://greasyfork.org/users/10290
// @version      2017.08.15.1
// @description  b萌自动报榜。支持投票期未投票后台记录导出。投票记录分析需每日调节参数。
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
    var i, j, data;
    if (/log/.test(url)) {
        // 投票记录报榜new
        data = document.body.innerText.split('\n');
        var [title, duel_type] = data.shift().split('\t');
        var isHX = !duel_type;
        data.shift();
        var group = data.splice(0, data.findIndex(function(e) {
            return e.indexOf('% ') > -1;
        })).map(function(e) {
            e = e.split('\t');
            var [gid, name] = e[0].split(',');
            var ch = e[1].split('; ').map(function(e) {
                if (!isHX)
                    e = e.split(':')[1];
                var [cid, name, bgm] = e.split(',');
                return {
                    id: cid,
                    name: name,
                    bgm: bgm,
                    all: 0,
                    truelove: 0,
                    single: 0
                };
            });
            return {
                id: gid,
                name: name,
                ch: ch
            };
        });
        var bgm = group.reduce(function(bgm, e) {
            e.ch.forEach(function(ec) {
                i = bgm.findIndex(function(eb) {
                    return eb.name == ec.bgm;
                });
                if (i == -1) {
                    bgm.push({
                        name: ec.bgm,
                        id: [ec.id],
                        ch: [ec.name],
                        gid: [e.id],
                        lj: [],
                        all: 0,
                        truelove: 0,
                        single: 0
                    });
                } else {
                    bgm[i].id.push(ec.id);
                    bgm[i].gid.push(e.id);
                    bgm[i].ch.push(ec.name);
                }
            });
            return bgm;
        }, []);
        bgm.forEach(function(e) {
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
                            return e.length == ids.length && ids.every(function(ee) {
                                return e.indexOf(ee) > -1;
                            });
                        }) == -1) {
                        e.lj.push([ids, 0]);
                    }
                }
            }
        });
        data.shift();
        while (1) {
            if (data[data.length - 1].length === 0)
                data.pop();
            else
                break;
        }
        data = data.map(function(e) {
            var [nickname, type, vote] = e.split(',');
            if (nickname.length < 3)[nickname, type, vote] = /^([^\d]?\d{1,2}[^\d]?),([01]),(\d+)$/g.exec(e).slice(1, 4);
            vote = '0'.repeat(group.length - vote.length) + vote;
            var [chs, bgms] = [
                [],
                []
            ];
            Array.from(vote).forEach(function(e, n) {
                if (e > 0) {
                    var ee = group[n].ch.find(function(ee, nn) {
                        if (nn + 1 == e) {
                            ee.all++;
                            if (Number(type)) {
                                ee.truelove++;
                                ee.all++;
                            } else if (e * Math.pow(10, group.length - n - 1) == Number(vote)) {
                                ee.single++;
                            }
                        }
                        return nn + 1 == e;
                    });
                    chs.push(ee.id);
                    if (bgms.indexOf(ee.bgm) == -1) bgms.push(ee.bgm);
                }
            });
            bgm.forEach(function(e) {
                if (bgms.indexOf(e.name) > -1) {
                    e.all++;
                    e.lj.forEach(function(ee, n) {
                        if (ee[0].every(function(ee) {
                                return chs.indexOf(ee) > -1;
                            }))
                            e.lj[n][1]++;
                    });
                }
            });
            return {
                nickname: nickname,
                type: type,
                vote: vote,
                chs: chs,
                bgm: bgm
            };
        });
        group.forEach(function(e) {
            [e.all, e.truelove, e.single] = sum(e.ch, ['all', 'truelove', 'single']);
            e.ch.forEach(function(e) {
                e.vper = Math.floor((e.all - e.truelove) / data.length * 10000);
            });
            e.vper = Math.floor((e.all - e.truelove) / data.length * 10000);
        });
        [group.all, group.truelove, group.single] = sum(group, ['all', 'truelove', 'single']);
        var result = group.reduce(function(c, e) {
            return c.concat(e.ch);
        }, []);
        bgm.forEach(function(e) {
            if (e.id.length > 1) {
                [e.truelove, e.single] = sum(result.filter(function(ee) {
                    return e.id.indexOf(ee.id) > -1;
                }), ['truelove', 'single']);
            } else {
                var ee = result.find(function(ee) {
                    return e.id == ee.id;
                });
                [e.all, e.truelove, e.single] = [ee.all, ee.truelove, ee.single];
            }
            e.vper = Math.floor((e.all - e.truelove) / data.length * 10000);
        });
        document.body.innerHTML = title + '\t' + data.length + '人次<br>总数, 真爱, 单投, 被投率<br>' + [group.all, group.truelove, group.single].join(', ');
        group.forEach(function(e) {
            document.body.innerHTML += '<br>.<br>' + e.name + '\t' + [e.all, e.truelove, e.single, e.vper / 100 + '%'].join(', ');
            var gRe = isHX ? e.ch.slice(0, 13) : e.ch.sort(function(a, b) {
                return b.all - a.all;
            });
            gRe.forEach(function(e, n) {
                document.body.innerHTML += '<br>' + [e.all, e.truelove, e.single, e.vper / 100 + '%'].join(', ') + '\t' + e.name;
            });
        });
        document.body.innerHTML += '<br>.<br>番组连击';
        bgm.sort(function(a, b) {
            return b.all - a.all;
        });
        bgm.forEach(function(e) {
            document.body.innerHTML += '<br>' + e.name + '\t' + [e.all, e.truelove, e.single, e.vper / 100 + '%'].join(', ');
            e.lj.sort(function(a, b) {
                return b[1] - a[1];
            });
            e.lj.forEach(function(e, n) {
                document.body.innerHTML += '<br>' + e[1] + '\t' + e[0].map(function(e) {
                    return result.find(function(ee) {
                        return ee.id == e;
                    }).name;
                }).join(', ');
            });
        });
        document.title = title + ' 投票记录分析';
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
                        bgm: $('.bangumi-wrapper')[n].innerText,
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
                    s += '<br>.<br>' + (isVote ? '' : e.id + '\t') + e.name + (isVote ? '\t' + e.all + '|' + e.inc : '');
                    var gRe = isHX ? (isVote ? e.result.slice(0, 13) : e.result) : (isVote ? e.result.sort(function(a, b) {
                        return b.all - a.all;
                    }) : e.result);
                    gRe.forEach(function(e, n) {
                        var num, per;
                        if (isVote)[num, per] = [e.all + '|' + e.inc, e.per + '|' + e.cper];
                        s += '<br>' + (isVote ? (isHX ? ((n < 9 ? '0' : '') + (n + 1) + ':\t' + per + '\t' + num) : (num + '\t' + per)) : e.id) + '\t' + e.name + (isVote ? ((isHX ? ('\t' + e.bgm) : '') + (n === 0 ? '' : '\t' + (gRe[n - 1].all - e.all) + '|' + (gRe[n - 1].inc - e.inc))) : ('\t' + e.bgm));
                    });
                });
                var reWin = window.open('', '', 'width = 480, height = 640');
                reWin.document.body.innerHTML = title + (isVote ? ('\t' + h + ':' + (m < 1 ? '0' + m : m) + '<br>' + group.all + '|' + group.inc) : '') + s;
                reWin.document.title = title + (isVote ? ('\t' + h + ':' + (m < 1 ? '0' + m : m)) : '');
                reWin.document.close();
                // 输出结果分析用参数
                console.log('var [title, duel_type, group] = ' + br([br(title, '\'\''), schedule.duel_type, '[]'], '[]') + ';\r\n' + group.map(function(e) {
                    return 'group.push({id:' + e.id + ', name:' + br(e.name, '\'\'') + ', result:' + br(e.result.map(function(e) {
                        return '{id:' + e.id + ', name:' + br(e.name, '\'\'') + ', bgm:' + br(e.bgm, '\'\'') + '}';
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
        s += '<br>.<br>连击';
        lj.sort(function(a, b) {
            return b[1] - a[1];
        }).forEach(function(e) {
            s += '<br>' + e[1] + '\t' + e[0];
        });
        document.title = location.href.split('/')[location.href.split('/').length - 1].split('.')[0] + '投票记录分析';
        document.body.innerHTML = s;
    }
})();

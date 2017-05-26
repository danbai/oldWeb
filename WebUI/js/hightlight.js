/*
 * Syntax highlighting with language autodetection.
 * http://softwaremaniacs.org/soft/highlight/
 * V6.0 (IE8 Compatible)
 */

var hljs = new function() {
    function l(o) {
        return o.replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
    }

    function g(r, p, o) {
        var q = "m" + (r.cI ? "i" : "") + (o ? "g" : "");
        return new RegExp(p, q)
    }

    function b(p) {
        for (var o = 0; o < p.childNodes.length; o++) {
            node = p.childNodes[o];
            if (node.nodeName == "CODE") {
                return node
            }
            if (!(node.nodeType == 3 && node.nodeValue.match(/\s+/))) {
                break
            }
        }
    }

    function h(s, r) {
        var o = "";
        for (var q = 0; q < s.childNodes.length; q++) {
            if (s.childNodes[q].nodeType == 3) {
                var p = s.childNodes[q].nodeValue;
                if (r) {
                    p = p.replace(/\n/g, "")
                }
                o += p
            } else {
                if (s.childNodes[q].nodeName == "BR") {
                    o += "\n"
                } else {
                    o += h(s.childNodes[q])
                }
            }
        }
        if (/MSIE [678]/.test(navigator.userAgent)) {
            o = o.replace(/\r/g, "\n")
        }
        return o
    }

    function a(r) {
        var q = r.className.split(/\s+/);
        q = q.concat(r.parentNode.className.split(/\s+/));
        for (var p = 0; p < q.length; p++) {
            var o = q[p].replace(/^language-/, "");
            if (e[o] || o == "no-highlight") {
                return o
            }
        }
    }

    function c(p) {
        var o = [];
        (function(r, s) {
            for (var q = 0; q < r.childNodes.length; q++) {
                if (r.childNodes[q].nodeType == 3) {
                    s += r.childNodes[q].nodeValue.length
                } else {
                    if (r.childNodes[q].nodeName == "BR") {
                        s += 1
                    } else {
                        o.push({
                            event: "start",
                            offset: s,
                            node: r.childNodes[q]
                        });
                        s = arguments.callee(r.childNodes[q], s);
                        o.push({
                            event: "stop",
                            offset: s,
                            node: r.childNodes[q]
                        })
                    }
                }
            }
            return s
        })(p, 0);
        return o
    }

    function j(x, v, w) {
        var p = 0;
        var z = "";
        var r = [];

        function t() {
            if (x.length && v.length) {
                if (x[0].offset != v[0].offset) {
                    return (x[0].offset < v[0].offset) ? x : v
                } else {
                    return (x[0].event == "start" && v[0].event == "stop") ? v : x
                }
            } else {
                return x.length ? x : v
            }
        }

        function s(D) {
            var A = "<" + D.nodeName.toLowerCase();
            for (var B = 0; B < D.attributes.length; B++) {
                var C = D.attributes[B];
                A += " " + C.nodeName.toLowerCase();
                if (C.nodeValue != undefined) {
                    A += '="' + l(C.nodeValue) + '"'
                }
            }
            return A + ">"
        }

        function y(A) {
            return "</" + A.nodeName.toLowerCase() + ">"
        }
        while (x.length || v.length) {
            var u = t().splice(0, 1)[0];
            z += l(w.substr(p, u.offset - p));
            p = u.offset;
            if (u.event == "start") {
                z += s(u.node);
                r.push(u.node)
            } else {
                if (u.event == "stop") {
                    var q = r.length;
                    do {
                        q--;
                        var o = r[q];
                        z += y(o)
                    } while (o != u.node);
                    r.splice(q, 1);
                    while (q < r.length) {
                        z += s(r[q]);
                        q++
                    }
                }
            }
        }
        z += w.substr(p);
        return z
    }

    function d(A, B) {
        function p(r, L) {
            for (var K = 0; K < L.c.length; K++) {
                if (L.c[K].bR.test(r)) {
                    return L.c[K]
                }
            }
        }

        function u(K, r) {
            if (C[K].e && C[K].eR.test(r)) {
                return 1
            }
            if (C[K].eW) {
                var L = u(K - 1, r);
                return L ? L + 1 : 0
            }
            return 0
        }

        function v(r, K) {
            return K.iR && K.iR.test(r)
        }

        function J(M, N) {
            var L = [];
            for (var K = 0; K < M.c.length; K++) {
                L.push(M.c[K].b)
            }
            var r = C.length - 1;
            do {
                if (C[r].e) {
                    L.push(C[r].e)
                }
                r--
            } while (C[r + 1].eW);
            if (M.i) {
                L.push(M.i)
            }
            return g(N, "(" + L.join("|") + ")", true)
        }

        function o(L, K) {
            var M = C[C.length - 1];
            if (!M.t) {
                M.t = J(M, D)
            }
            M.t.lastIndex = K;
            var r = M.t.exec(L);
            if (r) {
                return [L.substr(K, r.index - K), r[0], false]
            } else {
                return [L.substr(K), "", true]
            }
        }

        function y(N, r) {
            var K = D.cI ? r[0].toLowerCase() : r[0];
            for (var M in N.kG) {
                if (!N.kG.hasOwnProperty(M)) {
                    continue
                }
                var L = N.kG[M].hasOwnProperty(K);
                if (L) {
                    return [M, L]
                }
            }
            return false
        }

        function E(K, O) {
            if (!O.k || !O.l) {
                return l(K)
            }
            var r = "";
            var N = 0;
            O.lR.lastIndex = 0;
            var L = O.lR.exec(K);
            while (L) {
                r += l(K.substr(N, L.index - N));
                var M = y(O, L);
                if (M) {
                    w += M[1];
                    r += '<span class="' + M[0] + '">' + l(L[0]) + "</span>"
                } else {
                    r += l(L[0])
                }
                N = O.lR.lastIndex;
                L = O.lR.exec(K)
            }
            r += l(K.substr(N, K.length - N));
            return r
        }

        function I(K, L) {
            if (L.sL && e[L.sL]) {
                var r = d(L.sL, K);
                w += r.keyword_count;
                z += r.r;
                return r.value
            } else {
                return E(K, L)
            }
        }

        function H(L, r) {
            var K = L.cN ? '<span class="' + L.cN + '">' : "";
            if (L.rB) {
                x += K;
                L.buffer = ""
            } else {
                if (L.eB) {
                    x += l(r) + K;
                    L.buffer = ""
                } else {
                    x += K;
                    L.buffer = r
                }
            }
            C.push(L)
        }

        function F(M, L, P) {
            var Q = C[C.length - 1];
            if (P) {
                x += I(Q.buffer + M, Q);
                return false
            }
            var O = p(L, Q);
            if (O) {
                x += I(Q.buffer + M, Q);
                H(O, L);
                z += O.r;
                return O.rB
            }
            var K = u(C.length - 1, L);
            if (K) {
                var N = Q.cN ? "</span>" : "";
                if (Q.rE) {
                    x += I(Q.buffer + M, Q) + N
                } else {
                    if (Q.eE) {
                        x += I(Q.buffer + M, Q) + N + l(L)
                    } else {
                        x += I(Q.buffer + M + L, Q) + N
                    }
                }
                while (K > 1) {
                    N = C[C.length - 2].cN ? "</span>" : "";
                    x += N;
                    K--;
                    C.length--
                }
                var r = C[C.length - 1];
                C.length--;
                C[C.length - 1].buffer = "";
                if (r.starts) {
                    H(r.starts, "")
                }
                return Q.rE
            }
            if (v(L, Q)) {
                throw "Illegal"
            }
        }
        var D = e[A];
        var C = [D.dM];
        var z = 0;
        var w = 0;
        var x = "";
        try {
            var t = 0;
            D.dM.buffer = "";
            do {
                var q = o(B, t);
                var s = F(q[0], q[1], q[2]);
                t += q[0].length;
                if (!s) {
                    t += q[1].length
                }
            } while (!q[2]);
            if (C.length > 1) {
                throw "Illegal"
            }
            return {
                language: A,
                r: z,
                keyword_count: w,
                value: x
            }
        } catch (G) {
            if (G == "Illegal") {
                return {
                    language: null,
                    r: 0,
                    keyword_count: 0,
                    value: l(B)
                }
            } else {
                throw G
            }
        }
    }

    function i() {
        function p(t, u, s) {
            if (t.compiled) {
                return
            }
            if (!s) {
                t.bR = g(u, t.b ? "^" + t.b : "\\B|\\b");
                if (!t.e && !t.eW) {
                    t.e = "\\B|\\b"
                }
                if (t.e) {
                    t.eR = g(u, "^" + t.e)
                }
            }
            if (t.i) {
                t.iR = g(u, "^(?:" + t.i + ")")
            }
            if (t.l) {
                t.lR = g(u, t.l, true)
            }
            if (t.r == undefined) {
                t.r = 1
            }
            for (var r in t.k) {
                if (!t.k.hasOwnProperty(r)) {
                    continue
                }
                if (t.k[r] instanceof Object) {
                    t.kG = t.k
                } else {
                    t.kG = {
                        keyword: t.k
                    }
                }
                break
            }
            if (!t.c) {
                t.c = []
            }
            t.compiled = true;
            for (var q = 0; q < t.c.length; q++) {
                p(t.c[q], u, false)
            }
            if (t.starts) {
                p(t.starts, u, false)
            }
        }
        for (var o in e) {
            if (!e.hasOwnProperty(o)) {
                continue
            }
            p(e[o].dM, e[o], true)
        }
    }

    function f() {
        if (f.called) {
            return
        }
        f.called = true;
        i()
    }

    function m(s, w, q) {
        f();
        var z = h(s, q);
        var u = a(s);
        if (u == "no-highlight") {
            return
        }
        if (u) {
            var A = d(u, z)
        } else {
            var A = {
                language: "",
                keyword_count: 0,
                r: 0,
                value: l(z)
            };
            var x = A;
            for (var y in e) {
                if (!e.hasOwnProperty(y)) {
                    continue
                }
                var v = d(y, z);
                if (v.keyword_count + v.r > x.keyword_count + x.r) {
                    x = v
                }
                if (v.keyword_count + v.r > A.keyword_count + A.r) {
                    x = A;
                    A = v
                }
            }
        }
        var t = s.className;
        if (!t.match(A.language)) {
            t = t ? (t + " " + A.language) : A.language
        }
        var p = c(s);
        if (p.length) {
            var r = document.createElement("pre");
            r.innerHTML = A.value;
            A.value = j(p, c(r), z)
        }
        if (w) {
            A.value = A.value.replace(/^((<[^>]+>|\t)+)/gm, function(B, E, D, C) {
                return E.replace(/\t/g, w)
            })
        }
        if (q) {
            A.value = A.value.replace(/\n/g, "<br>")
        }
        if (/MSIE [678]/.test(navigator.userAgent) && s.tagName == "CODE" && s.parentNode.tagName == "PRE") {
            var r = s.parentNode;
            var o = document.createElement("div");
            o.innerHTML = "<pre><code>" + A.value + "</code></pre>";
            s = o.firstChild.firstChild;
            o.firstChild.cN = r.cN;
            r.parentNode.replaceChild(o.firstChild, r)
        } else {
            s.innerHTML = A.value
        }
        s.className = t;
        s.dataset = {};
        s.dataset.result = {
            language: A.language,
            kw: A.keyword_count,
            re: A.r
        };
        if (x && x.language) {
            s.dataset.second_best = {
                language: x.language,
                kw: x.keyword_count,
                re: x.r
            }
        }
    }

    function n() {
        if (n.called) {
            return
        }
        n.called = true;
        f();
        var q = document.getElementsByTagName("pre");
        for (var o = 0; o < q.length; o++) {
            var p = b(q[o]);
            if (p) {
                m(p, hljs.tabReplace)
            }
        }
    }

    function k() {
        var o = arguments;
        var p = function() {
            n.apply(null, o)
        };
        if (window.addEventListener) {
            window.addEventListener("DOMContentLoaded", p, false);
            window.addEventListener("load", p, false)
        } else {
            if (window.attachEvent) {
                window.attachEvent("onload", p)
            } else {
                window.onload = p
            }
        }
    }
    var e = {};
    this.LANGUAGES = e;
    this.initHighlightingOnLoad = k;
    this.highlightBlock = m;
    this.initHighlighting = n;
    this.IR = "[a-zA-Z][a-zA-Z0-9_]*";
    this.UIR = "[a-zA-Z_][a-zA-Z0-9_]*";
    this.NR = "\\b\\d+(\\.\\d+)?";
    this.CNR = "\\b(0x[A-Za-z0-9]+|\\d+(\\.\\d+)?)";
    this.RSR = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
    this.BE = {
        b: "\\\\.",
        r: 0
    };
    this.ASM = {
        cN: "string",
        b: "'",
        e: "'",
        i: "\\n",
        c: [this.BE],
        r: 0
    };
    this.QSM = {
        cN: "string",
        b: '"',
        e: '"',
        i: "\\n",
        c: [this.BE],
        r: 0
    };
    this.CLCM = {
        cN: "comment",
        b: "//",
        e: "$",
        r: 0
    };
    this.CBLCLM = {
        cN: "comment",
        b: "/\\*",
        e: "\\*/"
    };
    this.HCM = {
        cN: "comment",
        b: "#",
        e: "$"
    };
    this.NM = {
        cN: "number",
        b: this.NR,
        r: 0
    };
    this.CNM = {
        cN: "number",
        b: this.CNR,
        r: 0
    };
    this.inherit = function(q, r) {
        var o = {};
        for (var p in q) {
            o[p] = q[p]
        }
        if (r) {
            for (var p in r) {
                o[p] = r[p]
            }
        }
        return o
    }
}();
hljs.LANGUAGES["1c"] = function() {
    var e = "[a-zA-Zа-яА-Я][a-zA-Z0-9_а-яА-Я]*";
    var b = {
        "возврат": 1,
        "дата": 1,
        "для": 1,
        "если": 1,
        "и": 1,
        "или": 1,
        "иначе": 1,
        "иначеесли": 1,
        "исключение": 1,
        "конецесли": 1,
        "конецпопытки": 1,
        "конецпроцедуры": 1,
        "конецфункции": 1,
        "конеццикла": 1,
        "константа": 1,
        "не": 1,
        "перейти": 1,
        "перем": 1,
        "перечисление": 1,
        "по": 1,
        "пока": 1,
        "попытка": 1,
        "прервать": 1,
        "продолжить": 1,
        "процедура": 1,
        "строка": 1,
        "тогда": 1,
        "фс": 1,
        "функция": 1,
        "цикл": 1,
        "число": 1,
        "экспорт": 1
    };
    var d = {
        ansitooem: 1,
        oemtoansi: 1,
        "ввестивидсубконто": 1,
        "ввестидату": 1,
        "ввестизначение": 1,
        "ввестиперечисление": 1,
        "ввестипериод": 1,
        "ввестиплансчетов": 1,
        "ввестистроку": 1,
        "ввестичисло": 1,
        "вопрос": 1,
        "восстановитьзначение": 1,
        "врег": 1,
        "выбранныйплансчетов": 1,
        "вызватьисключение": 1,
        "датагод": 1,
        "датамесяц": 1,
        "датачисло": 1,
        "добавитьмесяц": 1,
        "завершитьработусистемы": 1,
        "заголовоксистемы": 1,
        "записьжурналарегистрации": 1,
        "запуститьприложение": 1,
        "зафиксироватьтранзакцию": 1,
        "значениевстроку": 1,
        "значениевстрокувнутр": 1,
        "значениевфайл": 1,
        "значениеизстроки": 1,
        "значениеизстрокивнутр": 1,
        "значениеизфайла": 1,
        "имякомпьютера": 1,
        "имяпользователя": 1,
        "каталогвременныхфайлов": 1,
        "каталогиб": 1,
        "каталогпользователя": 1,
        "каталогпрограммы": 1,
        "кодсимв": 1,
        "командасистемы": 1,
        "конгода": 1,
        "конецпериодаби": 1,
        "конецрассчитанногопериодаби": 1,
        "конецстандартногоинтервала": 1,
        "конквартала": 1,
        "конмесяца": 1,
        "коннедели": 1,
        "лев": 1,
        "лог": 1,
        "лог10": 1,
        "макс": 1,
        "максимальноеколичествосубконто": 1,
        "мин": 1,
        "монопольныйрежим": 1,
        "названиеинтерфейса": 1,
        "названиенабораправ": 1,
        "назначитьвид": 1,
        "назначитьсчет": 1,
        "найти": 1,
        "найтипомеченныенаудаление": 1,
        "найтиссылки": 1,
        "началопериодаби": 1,
        "началостандартногоинтервала": 1,
        "начатьтранзакцию": 1,
        "начгода": 1,
        "начквартала": 1,
        "начмесяца": 1,
        "начнедели": 1,
        "номерднягода": 1,
        "номерднянедели": 1,
        "номернеделигода": 1,
        "нрег": 1,
        "обработкаожидания": 1,
        "окр": 1,
        "описаниеошибки": 1,
        "основнойжурналрасчетов": 1,
        "основнойплансчетов": 1,
        "основнойязык": 1,
        "открытьформу": 1,
        "открытьформумодально": 1,
        "отменитьтранзакцию": 1,
        "очиститьокносообщений": 1,
        "периодстр": 1,
        "полноеимяпользователя": 1,
        "получитьвремята": 1,
        "получитьдатута": 1,
        "получитьдокументта": 1,
        "получитьзначенияотбора": 1,
        "получитьпозициюта": 1,
        "получитьпустоезначение": 1,
        "получитьта": 1,
        "прав": 1,
        "праводоступа": 1,
        "предупреждение": 1,
        "префиксавтонумерации": 1,
        "пустаястрока": 1,
        "пустоезначение": 1,
        "рабочаядаттьпустоезначение": 1,
        "получитьта": 1,
        "прав": 1,
        "праводоступа": 1,
        "предупреждение": 1,
        "префиксавтонумерации": 1,
        "пустаястрока": 1,
        "пустоезначение": 1,
        "рабочаядата": 1,
        "разделительстраниц": 1,
        "разделительстрок": 1,
        "разм": 1,
        "разобратьпозициюдокумента": 1,
        "рассчитатьрегистрына": 1,
        "рассчитатьрегистрыпо": 1,
        "сигнал": 1,
        "симв": 1,
        "символтабуляции": 1,
        "создатьобъект": 1,
        "сокрл": 1,
        "сокрлп": 1,
        "сокрп": 1,
        " сообщить": 1,
        "состояние": 1,
        "сохранитьзначение": 1,
        "сред": 1,
        "статусвозврата": 1,
        "стрдлина": 1,
        "стрзаменить": 1,
        "стрколичествострок": 1,
        "стрполучитьстроку": 1,
        " стрчисловхождений": 1,
        "сформироватьпозициюдокумента": 1,
        "счетпокоду": 1,
        "текущаядата": 1,
        "текущеевремя": 1,
        "типзначения": 1,
        "типзначениястр": 1,
        "удалитьобъекты": 1,
        "установитьтана": 1,
        "установитьтапо": 1,
        "фиксшаблон": 1,
        "формат": 1,
        "цел": 1,
        "шаблон": 1
    };
    var a = {
        cN: "dquote",
        b: '""'
    };
    var c = {
        cN: "string",
        b: '"',
        e: '"|$',
        c: [a],
        r: 0
    };
    var f = {
        cN: "string",
        b: "\\|",
        e: '"|$',
        c: [a]
    };
    return {
        cI: true,
        dM: {
            l: e,
            k: {
                keyword: b,
                built_in: d
            },
            c: [hljs.CLCM, hljs.NM, c, f, {
                cN: "function",
                b: "(процедура|функция)",
                e: "$",
                l: e,
                k: {
                    "процедура": 1,
                    "экспорт": 1,
                    "функция": 1
                },
                c: [{
                    cN: "title",
                    b: e
                }, {
                    cN: "tail",
                    eW: true,
                    c: [{
                        cN: "params",
                        b: "\\(",
                        e: "\\)",
                        l: e,
                        k: {
                            "знач": 1
                        },
                        c: [c, f]
                    }, {
                        cN: "export",
                        b: "экспорт",
                        eW: true,
                        l: e,
                        k: {
                            "экспорт": 1
                        },
                        c: [hljs.CLCM]
                    }]
                }, hljs.CLCM]
            }, {
                cN: "preprocessor",
                b: "#",
                e: "$"
            }, {
                cN: "date",
                b: "'\\d{2}\\.\\d{2}\\.(\\d{2}|\\d{4})'"
            }]
        }
    }
}();
hljs.LANGUAGES.apache = function() {
    var b = {
        cN: "number",
        b: "[\\$%]\\d+"
    };
    var a = {
        cN: "cbracket",
        b: "[\\$%]\\{",
        e: "\\}"
    };
    a.c = [a, b];
    return {
        cI: true,
        dM: {
            l: hljs.IR,
            k: {
                keyword: {
                    acceptfilter: 1,
                    acceptmutex: 1,
                    acceptpathinfo: 1,
                    accessfilename: 1,
                    action: 1,
                    addalt: 1,
                    addaltbyencoding: 1,
                    addaltbytype: 1,
                    addcharset: 1,
                    adddefaultcharset: 1,
                    adddescription: 1,
                    addencoding: 1,
                    addhandler: 1,
                    addicon: 1,
                    addiconbyencoding: 1,
                    addiconbytype: 1,
                    addinputfilter: 1,
                    addlanguage: 1,
                    addmoduleinfo: 1,
                    addoutputfilter: 1,
                    addoutputfilterbytype: 1,
                    addtype: 1,
                    alias: 1,
                    aliasmatch: 1,
                    allow: 1,
                    allowconnect: 1,
                    allowencodedslashes: 1,
                    allowoverride: 1,
                    anonymous: 1,
                    anonymous_logemail: 1,
                    anonymous_mustgiveemail: 1,
                    anonymous_nouserid: 1,
                    anonymous_verifyemail: 1,
                    authbasicauthoritative: 1,
                    authbasicprovider: 1,
                    authdbduserpwquery: 1,
                    authdbduserrealmquery: 1,
                    authdbmgroupfile: 1,
                    authdbmtype: 1,
                    authdbmuserfile: 1,
                    authdefaultauthoritative: 1,
                    authdigestalgorithm: 1,
                    authdigestdomain: 1,
                    authdigestnccheck: 1,
                    authdigestnonceformat: 1,
                    authdigestnoncelifetime: 1,
                    authdigestprovider: 1,
                    authdigestqop: 1,
                    authdigestshmemsize: 1,
                    authgroupfile: 1,
                    authldapbinddn: 1,
                    authldapbindpassword: 1,
                    authldapcharsetconfig: 1,
                    authldapcomparednonserver: 1,
                    authldapdereferencealiases: 1,
                    authldapgroupattribute: 1,
                    authldapgroupattributeisdn: 1,
                    authldapremoteuserattribute: 1,
                    authldapremoteuserisdn: 1,
                    authldapurl: 1,
                    authname: 1,
                    authnprovideralias: 1,
                    authtype: 1,
                    authuserfile: 1,
                    authzdbmauthoritative: 1,
                    authzdbmtype: 1,
                    authzdefaultauthoritative: 1,
                    authzgroupfileauthoritative: 1,
                    authzldapauthoritative: 1,
                    authzownerauthoritative: 1,
                    authzuserauthoritative: 1,
                    balancermember: 1,
                    browsermatch: 1,
                    browsermatchnocase: 1,
                    bufferedlogs: 1,
                    cachedefaultexpire: 1,
                    cachedirlength: 1,
                    cachedirlevels: 1,
                    cachedisable: 1,
                    cacheenable: 1,
                    cachefile: 1,
                    cacheignorecachecontrol: 1,
                    cacheignoreheaders: 1,
                    cacheignorenolastmod: 1,
                    cacheignorequerystring: 1,
                    cachelastmodifiedfactor: 1,
                    cachemaxexpire: 1,
                    cachemaxfilesize: 1,
                    cacheminfilesize: 1,
                    cachenegotiateddocs: 1,
                    cacheroot: 1,
                    cachestorenostore: 1,
                    cachestoreprivate: 1,
                    cgimapextension: 1,
                    charsetdefault: 1,
                    charsetoptions: 1,
                    charsetsourceenc: 1,
                    checkcaseonly: 1,
                    checkspelling: 1,
                    chrootdir: 1,
                    contentdigest: 1,
                    cookiedomain: 1,
                    cookieexpires: 1,
                    cookielog: 1,
                    cookiename: 1,
                    cookiestyle: 1,
                    cookietracking: 1,
                    coredumpdirectory: 1,
                    customlog: 1,
                    dav: 1,
                    davdepthinfinity: 1,
                    davgenericlockdb: 1,
                    davlockdb: 1,
                    davmintimeout: 1,
                    dbdexptime: 1,
                    dbdkeep: 1,
                    dbdmax: 1,
                    dbdmin: 1,
                    dbdparams: 1,
                    dbdpersist: 1,
                    dbdpreparesql: 1,
                    dbdriver: 1,
                    defaulticon: 1,
                    defaultlanguage: 1,
                    defaulttype: 1,
                    deflatebuffersize: 1,
                    deflatecompressionlevel: 1,
                    deflatefilternote: 1,
                    deflatememlevel: 1,
                    deflatewindowsize: 1,
                    deny: 1,
                    directoryindex: 1,
                    directorymatch: 1,
                    directoryslash: 1,
                    documentroot: 1,
                    dumpioinput: 1,
                    dumpiologlevel: 1,
                    dumpiooutput: 1,
                    enableexceptionhook: 1,
                    enablemmap: 1,
                    enablesendfile: 1,
                    errordocument: 1,
                    errorlog: 1,
                    example: 1,
                    expiresactive: 1,
                    expiresbytype: 1,
                    expiresdefault: 1,
                    extendedstatus: 1,
                    extfilterdefine: 1,
                    extfilteroptions: 1,
                    fileetag: 1,
                    filterchain: 1,
                    filterdeclare: 1,
                    filterprotocol: 1,
                    filterprovider: 1,
                    filtertrace: 1,
                    forcelanguagepriority: 1,
                    forcetype: 1,
                    forensiclog: 1,
                    gracefulshutdowntimeout: 1,
                    group: 1,
                    header: 1,
                    headername: 1,
                    hostnamelookups: 1,
                    identitycheck: 1,
                    identitychecktimeout: 1,
                    imapbase: 1,
                    imapdefault: 1,
                    imapmenu: 1,
                    include: 1,
                    indexheadinsert: 1,
                    indexignore: 1,
                    indexoptions: 1,
                    indexorderdefault: 1,
                    indexstylesheet: 1,
                    isapiappendlogtoerrors: 1,
                    isapiappendlogtoquery: 1,
                    isapicachefile: 1,
                    isapifakeasync: 1,
                    isapilognotsupported: 1,
                    isapireadaheadbuffer: 1,
                    keepalive: 1,
                    keepalivetimeout: 1,
                    languagepriority: 1,
                    ldapcacheentries: 1,
                    ldapcachettl: 1,
                    ldapconnectiontimeout: 1,
                    ldapopcacheentries: 1,
                    ldapopcachettl: 1,
                    ldapsharedcachefile: 1,
                    ldapsharedcachesize: 1,
                    ldaptrustedclientcert: 1,
                    ldaptrustedglobalcert: 1,
                    ldaptrustedmode: 1,
                    ldapverifyservercert: 1,
                    limitinternalrecursion: 1,
                    limitrequestbody: 1,
                    limitrequestfields: 1,
                    limitrequestfieldsize: 1,
                    limitrequestline: 1,
                    limitxmlrequestbody: 1,
                    listen: 1,
                    listenbacklog: 1,
                    loadfile: 1,
                    loadmodule: 1,
                    lockfile: 1,
                    logformat: 1,
                    loglevel: 1,
                    maxclients: 1,
                    maxkeepaliverequests: 1,
                    maxmemfree: 1,
                    maxrequestsperchild: 1,
                    maxrequestsperthread: 1,
                    maxspareservers: 1,
                    maxsparethreads: 1,
                    maxthreads: 1,
                    mcachemaxobjectcount: 1,
                    mcachemaxobjectsize: 1,
                    mcachemaxstreamingbuffer: 1,
                    mcacheminobjectsize: 1,
                    mcacheremovalalgorithm: 1,
                    mcachesize: 1,
                    metadir: 1,
                    metafiles: 1,
                    metasuffix: 1,
                    mimemagicfile: 1,
                    minspareservers: 1,
                    minsparethreads: 1,
                    mmapfile: 1,
                    mod_gzip_on: 1,
                    mod_gzip_add_header_count: 1,
                    mod_gzip_keep_workfiles: 1,
                    mod_gzip_dechunk: 1,
                    mod_gzip_min_http: 1,
                    mod_gzip_minimum_file_size: 1,
                    mod_gzip_maximum_file_size: 1,
                    mod_gzip_maximum_inmem_size: 1,
                    mod_gzip_temp_dir: 1,
                    mod_gzip_item_include: 1,
                    mod_gzip_item_exclude: 1,
                    mod_gzip_command_version: 1,
                    mod_gzip_can_negotiate: 1,
                    mod_gzip_handle_methods: 1,
                    mod_gzip_static_suffix: 1,
                    mod_gzip_send_vary: 1,
                    mod_gzip_update_static: 1,
                    modmimeusepathinfo: 1,
                    multiviewsmatch: 1,
                    namevirtualhost: 1,
                    noproxy: 1,
                    nwssltrustedcerts: 1,
                    nwsslupgradeable: 1,
                    options: 1,
                    order: 1,
                    passenv: 1,
                    pidfile: 1,
                    protocolecho: 1,
                    proxybadheader: 1,
                    proxyblock: 1,
                    proxydomain: 1,
                    proxyerroroverride: 1,
                    proxyftpdircharset: 1,
                    proxyiobuffersize: 1,
                    proxymaxforwards: 1,
                    proxypass: 1,
                    proxypassinterpolateenv: 1,
                    proxypassmatch: 1,
                    proxypassreverse: 1,
                    proxypassreversecookiedomain: 1,
                    proxypassreversecookiepath: 1,
                    proxypreservehost: 1,
                    proxyreceivebuffersize: 1,
                    proxyremote: 1,
                    proxyremotematch: 1,
                    proxyrequests: 1,
                    proxyset: 1,
                    proxystatus: 1,
                    proxytimeout: 1,
                    proxyvia: 1,
                    readmename: 1,
                    receivebuffersize: 1,
                    redirect: 1,
                    redirectmatch: 1,
                    redirectpermanent: 1,
                    redirecttemp: 1,
                    removecharset: 1,
                    removeencoding: 1,
                    removehandler: 1,
                    removeinputfilter: 1,
                    removelanguage: 1,
                    removeoutputfilter: 1,
                    removetype: 1,
                    requestheader: 1,
                    require: 2,
                    rewritebase: 1,
                    rewritecond: 10,
                    rewriteengine: 1,
                    rewritelock: 1,
                    rewritelog: 1,
                    rewriteloglevel: 1,
                    rewritemap: 1,
                    rewriteoptions: 1,
                    rewriterule: 10,
                    rlimitcpu: 1,
                    rlimitmem: 1,
                    rlimitnproc: 1,
                    satisfy: 1,
                    scoreboardfile: 1,
                    script: 1,
                    scriptalias: 1,
                    scriptaliasmatch: 1,
                    scriptinterpretersource: 1,
                    scriptlog: 1,
                    scriptlogbuffer: 1,
                    scriptloglength: 1,
                    scriptsock: 1,
                    securelisten: 1,
                    seerequesttail: 1,
                    sendbuffersize: 1,
                    serveradmin: 1,
                    serveralias: 1,
                    serverlimit: 1,
                    servername: 1,
                    serverpath: 1,
                    serverroot: 1,
                    serversignature: 1,
                    servertokens: 1,
                    setenv: 1,
                    setenvif: 1,
                    setenvifnocase: 1,
                    sethandler: 1,
                    setinputfilter: 1,
                    setoutputfilter: 1,
                    ssienableaccess: 1,
                    ssiendtag: 1,
                    ssierrormsg: 1,
                    ssistarttag: 1,
                    ssitimeformat: 1,
                    ssiundefinedecho: 1,
                    sslcacertificatefile: 1,
                    sslcacertificatepath: 1,
                    sslcadnrequestfile: 1,
                    sslcadnrequestpath: 1,
                    sslcarevocationfile: 1,
                    sslcarevocationpath: 1,
                    sslcertificatechainfile: 1,
                    sslcertificatefile: 1,
                    sslcertificatekeyfile: 1,
                    sslciphersuite: 1,
                    sslcryptodevice: 1,
                    sslengine: 1,
                    sslhonorciperorder: 1,
                    sslmutex: 1,
                    ssloptions: 1,
                    sslpassphrasedialog: 1,
                    sslprotocol: 1,
                    sslproxycacertificatefile: 1,
                    sslproxycacertificatepath: 1,
                    sslproxycarevocationfile: 1,
                    sslproxycarevocationpath: 1,
                    sslproxyciphersuite: 1,
                    sslproxyengine: 1,
                    sslproxymachinecertificatefile: 1,
                    sslproxymachinecertificatepath: 1,
                    sslproxyprotocol: 1,
                    sslproxyverify: 1,
                    sslproxyverifydepth: 1,
                    sslrandomseed: 1,
                    sslrequire: 1,
                    sslrequiressl: 1,
                    sslsessioncache: 1,
                    sslsessioncachetimeout: 1,
                    sslusername: 1,
                    sslverifyclient: 1,
                    sslverifydepth: 1,
                    startservers: 1,
                    startthreads: 1,
                    substitute: 1,
                    suexecusergroup: 1,
                    threadlimit: 1,
                    threadsperchild: 1,
                    threadstacksize: 1,
                    timeout: 1,
                    traceenable: 1,
                    transferlog: 1,
                    typesconfig: 1,
                    unsetenv: 1,
                    usecanonicalname: 1,
                    usecanonicalphysicalport: 1,
                    user: 1,
                    userdir: 1,
                    virtualdocumentroot: 1,
                    virtualdocumentrootip: 1,
                    virtualscriptalias: 1,
                    virtualscriptaliasip: 1,
                    win32disableacceptex: 1,
                    xbithack: 1
                },
                literal: {
                    on: 1,
                    off: 1
                }
            },
            c: [hljs.HCM, {
                cN: "sqbracket",
                b: "\\s\\[",
                e: "\\]$"
            }, a, b, {
                cN: "tag",
                b: "</?",
                e: ">"
            }, hljs.QSM]
        }
    }
}();
hljs.LANGUAGES.avrasm = {
    cI: true,
    dM: {
        l: hljs.IR,
        k: {
            keyword: {
                adc: 1,
                add: 1,
                adiw: 1,
                and: 1,
                andi: 1,
                asr: 1,
                bclr: 1,
                bld: 1,
                brbc: 1,
                brbs: 1,
                brcc: 1,
                brcs: 1,
                "break": 1,
                breq: 1,
                brge: 1,
                brhc: 1,
                brhs: 1,
                brid: 1,
                brie: 1,
                brlo: 1,
                brlt: 1,
                brmi: 1,
                brne: 1,
                brpl: 1,
                brsh: 1,
                brtc: 1,
                brts: 1,
                brvc: 1,
                brvs: 1,
                bset: 1,
                bst: 1,
                call: 1,
                cbi: 1,
                cbr: 1,
                clc: 1,
                clh: 1,
                cli: 1,
                cln: 1,
                clr: 1,
                cls: 1,
                clt: 1,
                clv: 1,
                clz: 1,
                com: 1,
                cp: 1,
                cpc: 1,
                cpi: 1,
                cpse: 1,
                dec: 1,
                eicall: 1,
                eijmp: 1,
                elpm: 1,
                eor: 1,
                fmul: 1,
                fmuls: 1,
                fmulsu: 1,
                icall: 1,
                ijmp: 1,
                "in": 1,
                inc: 1,
                jmp: 1,
                ld: 1,
                ldd: 1,
                ldi: 1,
                lds: 1,
                lpm: 1,
                lsl: 1,
                lsr: 1,
                mov: 1,
                movw: 1,
                mul: 1,
                muls: 1,
                mulsu: 1,
                neg: 1,
                nop: 1,
                or: 1,
                ori: 1,
                out: 1,
                pop: 1,
                push: 1,
                rcall: 1,
                ret: 1,
                reti: 1,
                rjmp: 1,
                rol: 1,
                ror: 1,
                sbc: 1,
                sbr: 1,
                sbrc: 1,
                sbrs: 1,
                sec: 1,
                seh: 1,
                sbi: 1,
                sbci: 1,
                sbic: 1,
                sbis: 1,
                sbiw: 1,
                sei: 1,
                sen: 1,
                ser: 1,
                ses: 1,
                set: 1,
                sev: 1,
                sez: 1,
                sleep: 1,
                spm: 1,
                st: 1,
                std: 1,
                sts: 1,
                sub: 1,
                subi: 1,
                swap: 1,
                tst: 1,
                wdr: 1
            },
            built_in: {
                r0: 1,
                r1: 1,
                r2: 1,
                r3: 1,
                r4: 1,
                r5: 1,
                r6: 1,
                r7: 1,
                r8: 1,
                r9: 1,
                r10: 1,
                r11: 1,
                r12: 1,
                r13: 1,
                r14: 1,
                r15: 1,
                r16: 1,
                r17: 1,
                r18: 1,
                r19: 1,
                r20: 1,
                r21: 1,
                r22: 1,
                r23: 1,
                r24: 1,
                r25: 1,
                r26: 1,
                r27: 1,
                r28: 1,
                r29: 1,
                r30: 1,
                r31: 1,
                x: 1,
                xh: 1,
                xl: 1,
                y: 1,
                yh: 1,
                yl: 1,
                z: 1,
                zh: 1,
                zl: 1,
                ucsr1c: 1,
                udr1: 1,
                ucsr1a: 1,
                ucsr1b: 1,
                ubrr1l: 1,
                ubrr1h: 1,
                ucsr0c: 1,
                ubrr0h: 1,
                tccr3c: 1,
                tccr3a: 1,
                tccr3b: 1,
                tcnt3h: 1,
                tcnt3l: 1,
                ocr3ah: 1,
                ocr3al: 1,
                ocr3bh: 1,
                ocr3bl: 1,
                ocr3ch: 1,
                ocr3cl: 1,
                icr3h: 1,
                icr3l: 1,
                etimsk: 1,
                etifr: 1,
                tccr1c: 1,
                ocr1ch: 1,
                ocr1cl: 1,
                twcr: 1,
                twdr: 1,
                twar: 1,
                twsr: 1,
                twbr: 1,
                osccal: 1,
                xmcra: 1,
                xmcrb: 1,
                eicra: 1,
                spmcsr: 1,
                spmcr: 1,
                portg: 1,
                ddrg: 1,
                ping: 1,
                portf: 1,
                ddrf: 1,
                sreg: 1,
                sph: 1,
                spl: 1,
                xdiv: 1,
                rampz: 1,
                eicrb: 1,
                eimsk: 1,
                gimsk: 1,
                gicr: 1,
                eifr: 1,
                gifr: 1,
                timsk: 1,
                tifr: 1,
                mcucr: 1,
                mcucsr: 1,
                tccr0: 1,
                tcnt0: 1,
                ocr0: 1,
                assr: 1,
                tccr1a: 1,
                tccr1b: 1,
                tcnt1h: 1,
                tcnt1l: 1,
                ocr1ah: 1,
                ocr1al: 1,
                ocr1bh: 1,
                ocr1bl: 1,
                icr1h: 1,
                icr1l: 1,
                tccr2: 1,
                tcnt2: 1,
                ocr2: 1,
                ocdr: 1,
                wdtcr: 1,
                sfior: 1,
                eearh: 1,
                eearl: 1,
                eedr: 1,
                eecr: 1,
                porta: 1,
                ddra: 1,
                pina: 1,
                portb: 1,
                ddrb: 1,
                pinb: 1,
                portc: 1,
                ddrc: 1,
                pinc: 1,
                portd: 1,
                ddrd: 1,
                pind: 1,
                spdr: 1,
                spsr: 1,
                spcr: 1,
                udr0: 1,
                ucsr0a: 1,
                ucsr0b: 1,
                ubrr0l: 1,
                acsr: 1,
                admux: 1,
                adcsr: 1,
                adch: 1,
                adcl: 1,
                porte: 1,
                ddre: 1,
                pine: 1,
                pinf: 1
            }
        },
        c: [hljs.CBLCLM, {
            cN: "comment",
            b: ";",
            e: "$"
        }, hljs.CNM, hljs.QSM, {
            cN: "string",
            b: "'",
            e: "[^\\\\]'",
            i: "[^\\\\][^']"
        }, {
            cN: "label",
            b: "^[A-Za-z0-9_.$]+:"
        }, {
            cN: "preprocessor",
            b: "#",
            e: "$"
        }, {
            cN: "preprocessor",
            b: "\\.[a-zA-Z]+"
        }, {
            cN: "localvars",
            b: "@[0-9]+"
        }]
    }
};
hljs.LANGUAGES.axapta = {
    dM: {
        l: hljs.UIR,
        k: {
            "false": 1,
            "int": 1,
            "abstract": 1,
            "private": 1,
            "char": 1,
            "interface": 1,
            "boolean": 1,
            "static": 1,
            "null": 1,
            "if": 1,
            "for": 1,
            "true": 1,
            "while": 1,
            "long": 1,
            "throw": 1,
            "finally": 1,
            "protected": 1,
            "extends": 1,
            "final": 1,
            "implements": 1,
            "return": 1,
            "void": 1,
            "enum": 1,
            "else": 1,
            "break": 1,
            "new": 1,
            "catch": 1,
            "byte": 1,
            "super": 1,
            "class": 1,
            "case": 1,
            "short": 1,
            "default": 1,
            "double": 1,
            "public": 1,
            "try": 1,
            "this": 1,
            "switch": 1,
            "continue": 1,
            reverse: 1,
            firstfast: 1,
            firstonly: 1,
            forupdate: 1,
            nofetch: 1,
            sum: 1,
            avg: 1,
            minof: 1,
            maxof: 1,
            count: 1,
            order: 1,
            group: 1,
            by: 1,
            asc: 1,
            desc: 1,
            index: 1,
            hint: 1,
            like: 1,
            dispaly: 1,
            edit: 1,
            client: 1,
            server: 1,
            ttsbegin: 1,
            ttscommit: 1,
            str: 1,
            real: 1,
            date: 1,
            container: 1,
            anytype: 1,
            common: 1,
            div: 1,
            mod: 1
        },
        c: [hljs.CLCM, hljs.CBLCLM, hljs.ASM, hljs.QSM, hljs.CNM, {
            cN: "preprocessor",
            b: "#",
            e: "$"
        }, {
            cN: "class",
            l: hljs.UIR,
            b: "(class |interface )",
            e: "{",
            i: ":",
            k: {
                "class": 1,
                "interface": 1
            },
            c: [{
                cN: "inheritance",
                b: "(implements|extends)",
                l: hljs.IR,
                k: {
                    "extends": 1,
                    "implements": 1
                },
                r: 10
            }, {
                cN: "title",
                b: hljs.UIR
            }]
        }]
    }
};
hljs.LANGUAGES.bash = function() {
    var e = {
        "true": 1,
        "false": 1
    };
    var c = {
        cN: "variable",
        b: "\\$([a-zA-Z0-9_]+)\\b"
    };
    var b = {
        cN: "variable",
        b: "\\$\\{(([^}])|(\\\\}))+\\}",
        c: [hljs.CNM]
    };
    var a = {
        cN: "string",
        b: '"',
        e: '"',
        i: "\\n",
        c: [hljs.BE, c, b],
        r: 0
    };
    var d = {
        cN: "test_condition",
        b: "",
        e: "",
        c: [a, c, b, hljs.CNM],
        l: hljs.IR,
        k: {
            literal: e
        },
        r: 0
    };
    return {
        dM: {
            l: hljs.IR,
            k: {
                keyword: {
                    "if": 1,
                    then: 1,
                    "else": 1,
                    fi: 1,
                    "for": 1,
                    "break": 1,
                    "continue": 1,
                    "while": 1,
                    "in": 1,
                    "do": 1,
                    done: 1,
                    echo: 1,
                    exit: 1,
                    "return": 1,
                    set: 1,
                    declare: 1
                },
                literal: e
            },
            c: [{
                cN: "shebang",
                b: "(#!\\/bin\\/bash)|(#!\\/bin\\/sh)",
                r: 10
            }, hljs.HCM, {
                cN: "comment",
                b: "\\/\\/",
                e: "$",
                i: "."
            }, hljs.CNM, a, c, b, hljs.inherit(d, {
                b: "\\[ ",
                e: " \\]",
                r: 0
            }), hljs.inherit(d, {
                b: "\\[\\[ ",
                e: " \\]\\]"
            })]
        }
    }
}();
hljs.LANGUAGES.cmake = {
    cI: true,
    dM: {
        l: hljs.IR,
        k: {
            add_custom_command: 2,
            add_custom_target: 2,
            add_definitions: 2,
            add_dependencies: 2,
            add_executable: 2,
            add_library: 2,
            add_subdirectory: 2,
            add_executable: 2,
            add_library: 2,
            add_subdirectory: 2,
            add_test: 2,
            aux_source_directory: 2,
            "break": 1,
            build_command: 2,
            cmake_minimum_required: 3,
            cmake_policy: 3,
            configure_file: 1,
            create_test_sourcelist: 1,
            define_property: 1,
            "else": 1,
            elseif: 1,
            enable_language: 2,
            enable_testing: 2,
            endforeach: 1,
            endfunction: 1,
            endif: 1,
            endmacro: 1,
            endwhile: 1,
            execute_process: 2,
            "export": 1,
            find_file: 1,
            find_library: 2,
            find_package: 2,
            find_path: 1,
            find_program: 1,
            fltk_wrap_ui: 2,
            foreach: 1,
            "function": 1,
            get_cmake_property: 3,
            get_directory_property: 1,
            get_filename_component: 1,
            get_property: 1,
            get_source_file_property: 1,
            get_target_property: 1,
            get_test_property: 1,
            "if": 1,
            include: 1,
            include_directories: 2,
            include_external_msproject: 1,
            include_regular_expression: 2,
            install: 1,
            link_directories: 1,
            load_cache: 1,
            load_command: 1,
            macro: 1,
            mark_as_advanced: 1,
            message: 1,
            option: 1,
            output_required_files: 1,
            project: 1,
            qt_wrap_cpp: 2,
            qt_wrap_ui: 2,
            remove_definitions: 2,
            "return": 1,
            separate_arguments: 1,
            set: 1,
            set_directory_properties: 1,
            set_property: 1,
            set_source_files_properties: 1,
            set_target_properties: 1,
            set_tests_properties: 1,
            site_name: 1,
            source_group: 1,
            string: 1,
            target_link_libraries: 2,
            try_compile: 2,
            try_run: 2,
            unset: 1,
            variable_watch: 2,
            "while": 1,
            build_name: 1,
            exec_program: 1,
            export_library_dependencies: 1,
            install_files: 1,
            install_programs: 1,
            install_targets: 1,
            link_libraries: 1,
            make_directory: 1,
            remove: 1,
            subdir_depends: 1,
            subdirs: 1,
            use_mangled_mesa: 1,
            utility_source: 1,
            variable_requires: 1,
            write_file: 1
        },
        c: [{
            cN: "envvar",
            b: "\\${",
            e: "}"
        }, hljs.HCM, hljs.QSM, hljs.NM]
    }
};
hljs.LANGUAGES.cpp = function() {
    var b = {
        keyword: {
            "false": 1,
            "int": 1,
            "float": 1,
            "while": 1,
            "private": 1,
            "char": 1,
            "catch": 1,
            "export": 1,
            virtual: 1,
            operator: 2,
            sizeof: 2,
            dynamic_cast: 2,
            typedef: 2,
            const_cast: 2,
            "const": 1,
            struct: 1,
            "for": 1,
            static_cast: 2,
            union: 1,
            namespace: 1,
            unsigned: 1,
            "long": 1,
            "throw": 1,
            "volatile": 2,
            "static": 1,
            "protected": 1,
            bool: 1,
            template: 1,
            mutable: 1,
            "if": 1,
            "public": 1,
            friend: 2,
            "do": 1,
            "return": 1,
            "goto": 1,
            auto: 1,
            "void": 2,
            "enum": 1,
            "else": 1,
            "break": 1,
            "new": 1,
            extern: 1,
            using: 1,
            "true": 1,
            "class": 1,
            asm: 1,
            "case": 1,
            typeid: 1,
            "short": 1,
            reinterpret_cast: 2,
            "default": 1,
            "double": 1,
            register: 1,
            explicit: 1,
            signed: 1,
            typename: 1,
            "try": 1,
            "this": 1,
            "switch": 1,
            "continue": 1,
            wchar_t: 1,
            inline: 1,
            "delete": 1,
            alignof: 1,
            char16_t: 1,
            char32_t: 1,
            constexpr: 1,
            decltype: 1,
            noexcept: 1,
            nullptr: 1,
            static_assert: 1,
            thread_local: 1
        },
        built_in: {
            std: 1,
            string: 1,
            cin: 1,
            cout: 1,
            cerr: 1,
            clog: 1,
            stringstream: 1,
            istringstream: 1,
            ostringstream: 1,
            auto_ptr: 1,
            deque: 1,
            list: 1,
            queue: 1,
            stack: 1,
            vector: 1,
            map: 1,
            set: 1,
            bitset: 1,
            multiset: 1,
            multimap: 1,
            unordered_set: 1,
            unordered_map: 1,
            unordered_multiset: 1,
            unordered_multimap: 1,
            array: 1,
            shared_ptr: 1
        }
    };
    var a = {
        cN: "stl_container",
        b: "\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",
        e: ">",
        l: hljs.UIR,
        k: b.built_in,
        r: 10
    };
    a.c = [a];
    return {
        dM: {
            l: hljs.UIR,
            k: b,
            i: "</",
            c: [hljs.CLCM, hljs.CBLCLM, hljs.QSM, {
                cN: "string",
                b: "'",
                e: "[^\\\\]'",
                i: "[^\\\\][^']"
            }, hljs.CNM, {
                cN: "preprocessor",
                b: "#",
                e: "$"
            }, a]
        }
    }
}();
hljs.LANGUAGES.cs = {
    dM: {
        l: hljs.UIR,
        k: {
            "abstract": 1,
            as: 1,
            base: 1,
            bool: 1,
            "break": 1,
            "byte": 1,
            "case": 1,
            "catch": 1,
            "char": 1,
            checked: 1,
            "class": 1,
            "const": 1,
            "continue": 1,
            decimal: 1,
            "default": 1,
            delegate: 1,
            "do": 1,
            "do": 1,
            "double": 1,
            "else": 1,
            "enum": 1,
            event: 1,
            explicit: 1,
            extern: 1,
            "false": 1,
            "finally": 1,
            fixed: 1,
            "float": 1,
            "for": 1,
            foreach: 1,
            "goto": 1,
            "if": 1,
            implicit: 1,
            "in": 1,
            "int": 1,
            "interface": 1,
            internal: 1,
            is: 1,
            lock: 1,
            "long": 1,
            namespace: 1,
            "new": 1,
            "null": 1,
            object: 1,
            operator: 1,
            out: 1,
            override: 1,
            params: 1,
            "private": 1,
            "protected": 1,
            "public": 1,
            readonly: 1,
            ref: 1,
            "return": 1,
            sbyte: 1,
            sealed: 1,
            "short": 1,
            sizeof: 1,
            stackalloc: 1,
            "static": 1,
            string: 1,
            struct: 1,
            "switch": 1,
            "this": 1,
            "throw": 1,
            "true": 1,
            "try": 1,
            "typeof": 1,
            uint: 1,
            ulong: 1,
            unchecked: 1,
            unsafe: 1,
            ushort: 1,
            using: 1,
            virtual: 1,
            "volatile": 1,
            "void": 1,
            "while": 1,
            ascending: 1,
            descending: 1,
            from: 1,
            get: 1,
            group: 1,
            into: 1,
            join: 1,
            let: 1,
            orderby: 1,
            partial: 1,
            select: 1,
            set: 1,
            value: 1,
            "var": 1,
            where: 1,
            yield: 1
        },
        c: [{
            cN: "comment",
            b: "///",
            e: "$",
            rB: true,
            c: [{
                cN: "xmlDocTag",
                b: "///|<!--|-->"
            }, {
                cN: "xmlDocTag",
                b: "</?",
                e: ">"
            }]
        }, hljs.CLCM, hljs.CBLCLM, {
            cN: "string",
            b: '@"',
            e: '"',
            c: [{
                b: '""'
            }]
        }, hljs.ASM, hljs.QSM, hljs.CNM]
    }
};
hljs.LANGUAGES.css = function() {
    var b = {
        cN: "function",
        b: hljs.IR + "\\(",
        e: "\\)",
        c: [{
            eW: true,
            eE: true,
            c: [hljs.NM, hljs.ASM, hljs.QSM]
        }]
    };
    var a = {
        cN: "pseudo",
        b: ":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+"
    };
    return {
        cI: true,
        dM: {
            i: "=",
            c: [hljs.CBLCLM, {
                cN: "at_rule",
                b: "@",
                e: "[{;]",
                eE: true,
                l: hljs.IR,
                k: {
                    "import": 1,
                    page: 1,
                    media: 1,
                    charset: 1,
                    "font-face": 1
                },
                c: [b, hljs.ASM, hljs.QSM, hljs.NM, a]
            }, {
                cN: "tag",
                b: hljs.IR,
                r: 0
            }, {
                cN: "id",
                b: "\\#[A-Za-z0-9_-]+",
            }, {
                cN: "class",
                b: "\\.[A-Za-z0-9_-]+",
                r: 0
            }, {
                cN: "attr_selector",
                b: "\\[",
                e: "\\]",
                i: "$"
            }, a, {
                cN: "rules",
                b: "{",
                e: "}",
                i: "[^\\s]",
                r: 0,
                c: [hljs.CBLCLM, {
                    cN: "rule",
                    b: "[^\\s]",
                    rB: true,
                    e: ";",
                    eW: true,
                    c: [{
                        cN: "attribute",
                        b: "[A-Z\\_\\.\\-]+",
                        e: ":",
                        eE: true,
                        i: "[^\\s]",
                    }, {
                        cN: "value",
                        b: "\\s*",
                        eW: true,
                        eB: true,
                        eE: true,
                        c: [b, hljs.NM, hljs.QSM, hljs.ASM, hljs.CBLCLM, {
                            cN: "hexcolor",
                            b: "\\#[0-9A-F]+"
                        }, {
                            cN: "important",
                            b: "!important"
                        }]
                    }]
                }]
            }]
        }
    }
}();
hljs.LANGUAGES.delphi = function() {
    var e = {
        and: 1,
        safecall: 1,
        cdecl: 1,
        then: 1,
        string: 1,
        exports: 1,
        library: 1,
        not: 1,
        pascal: 1,
        set: 1,
        virtual: 1,
        file: 1,
        "in": 1,
        array: 1,
        label: 1,
        packed: 1,
        "end.": 1,
        index: 1,
        "while": 1,
        "const": 1,
        raise: 1,
        "for": 1,
        to: 1,
        implementation: 1,
        "with": 1,
        except: 1,
        overload: 1,
        destructor: 1,
        downto: 1,
        "finally": 1,
        program: 1,
        exit: 1,
        unit: 1,
        inherited: 1,
        override: 1,
        "if": 1,
        type: 1,
        until: 1,
        "function": 1,
        "do": 1,
        begin: 1,
        repeat: 1,
        "goto": 1,
        nil: 1,
        far: 1,
        initialization: 1,
        object: 1,
        "else": 1,
        "var": 1,
        uses: 1,
        external: 1,
        resourcestring: 1,
        "interface": 1,
        end: 1,
        finalization: 1,
        "class": 1,
        asm: 1,
        mod: 1,
        "case": 1,
        on: 1,
        shr: 1,
        shl: 1,
        of: 1,
        register: 1,
        xorwrite: 1,
        threadvar: 1,
        "try": 1,
        record: 1,
        near: 1,
        stored: 1,
        constructor: 1,
        stdcall: 1,
        inline: 1,
        div: 1,
        out: 1,
        or: 1,
        procedure: 1
    };
    var d = {
        safecall: 1,
        stdcall: 1,
        pascal: 1,
        stored: 1,
        "const": 1,
        implementation: 1,
        finalization: 1,
        except: 1,
        to: 1,
        "finally": 1,
        program: 1,
        inherited: 1,
        override: 1,
        then: 1,
        exports: 1,
        string: 1,
        read: 1,
        not: 1,
        mod: 1,
        shr: 1,
        "try": 1,
        div: 1,
        shl: 1,
        set: 1,
        library: 1,
        message: 1,
        packed: 1,
        index: 1,
        "for": 1,
        near: 1,
        overload: 1,
        label: 1,
        downto: 1,
        exit: 1,
        "public": 1,
        "goto": 1,
        "interface": 1,
        asm: 1,
        on: 1,
        of: 1,
        constructor: 1,
        or: 1,
        "private": 1,
        array: 1,
        unit: 1,
        raise: 1,
        destructor: 1,
        "var": 1,
        type: 1,
        until: 1,
        "function": 1,
        "else": 1,
        external: 1,
        "with": 1,
        "case": 1,
        "default": 1,
        record: 1,
        "while": 1,
        "protected": 1,
        property: 1,
        procedure: 1,
        published: 1,
        and: 1,
        cdecl: 1,
        "do": 1,
        threadvar: 1,
        file: 1,
        "in": 1,
        "if": 1,
        end: 1,
        virtual: 1,
        write: 1,
        far: 1,
        out: 1,
        begin: 1,
        repeat: 1,
        nil: 1,
        initialization: 1,
        object: 1,
        uses: 1,
        resourcestring: 1,
        "class": 1,
        register: 1,
        xorwrite: 1,
        inline: 1,
        "static": 1
    };
    var a = {
        cN: "comment",
        b: "{",
        e: "}",
        r: 0
    };
    var f = {
        cN: "comment",
        b: "\\(\\*",
        e: "\\*\\)",
        r: 10
    };
    var b = {
        cN: "string",
        b: "'",
        e: "'",
        c: [{
            b: "''"
        }],
        r: 0
    };
    var c = {
        cN: "string",
        b: "(#\\d+)+"
    };
    var g = {
        cN: "function",
        b: "(procedure|constructor|destructor|function)\\b",
        e: "[:;]",
        l: hljs.IR,
        k: {
            "function": 1,
            constructor: 10,
            destructor: 10,
            procedure: 10
        },
        c: [{
            cN: "title",
            b: hljs.IR
        }, {
            cN: "params",
            b: "\\(",
            e: "\\)",
            l: hljs.IR,
            k: e,
            c: [b, c]
        }, a, f]
    };
    return {
        cI: true,
        dM: {
            l: hljs.IR,
            k: e,
            i: '("|\\$[G-Zg-z]|\\/\\*|</)',
            c: [a, f, hljs.CLCM, b, c, hljs.NM, g, {
                cN: "class",
                b: "=\\bclass\\b",
                e: "end;",
                l: hljs.IR,
                k: d,
                c: [b, c, a, f, g]
            }]
        },
        m: []
    }
}();
hljs.LANGUAGES.diff = {
    cI: true,
    dM: {
        c: [{
            cN: "chunk",
            b: "^\\@\\@ +\\-\\d+,\\d+ +\\+\\d+,\\d+ +\\@\\@$",
            r: 10
        }, {
            cN: "chunk",
            b: "^\\*\\*\\* +\\d+,\\d+ +\\*\\*\\*\\*$",
            r: 10
        }, {
            cN: "chunk",
            b: "^\\-\\-\\- +\\d+,\\d+ +\\-\\-\\-\\-$",
            r: 10
        }, {
            cN: "header",
            b: "Index: ",
            e: "$"
        }, {
            cN: "header",
            b: "=====",
            e: "=====$"
        }, {
            cN: "header",
            b: "^\\-\\-\\-",
            e: "$"
        }, {
            cN: "header",
            b: "^\\*{3} ",
            e: "$"
        }, {
            cN: "header",
            b: "^\\+\\+\\+",
            e: "$"
        }, {
            cN: "header",
            b: "\\*{5}",
            e: "\\*{5}$"
        }, {
            cN: "addition",
            b: "^\\+",
            e: "$"
        }, {
            cN: "deletion",
            b: "^\\-",
            e: "$"
        }, {
            cN: "change",
            b: "^\\!",
            e: "$"
        }]
    }
};
hljs.LANGUAGES.xml = function() {
    var b = "[A-Za-z0-9\\._:-]+";
    var a = {
        eW: true,
        c: [{
            cN: "attribute",
            b: b,
            r: 0
        }, {
            b: '="',
            rB: true,
            e: '"',
            c: [{
                cN: "value",
                b: '"',
                eW: true
            }]
        }, {
            b: "='",
            rB: true,
            e: "'",
            c: [{
                cN: "value",
                b: "'",
                eW: true
            }]
        }, {
            b: "=",
            c: [{
                cN: "value",
                b: "[^\\s/>]+"
            }]
        }]
    };
    return {
        cI: true,
        dM: {
            c: [{
                cN: "pi",
                b: "<\\?",
                e: "\\?>",
                r: 10
            }, {
                cN: "doctype",
                b: "<!DOCTYPE",
                e: ">",
                r: 10
            }, {
                cN: "comment",
                b: "<!--",
                e: "-->",
                r: 10
            }, {
                cN: "cdata",
                b: "<\\!\\[CDATA\\[",
                e: "\\]\\]>",
                r: 10
            }, {
                cN: "tag",
                b: "<style",
                e: ">",
                l: hljs.IR,
                k: {
                    title: {
                        style: 1
                    }
                },
                c: [a],
                starts: {
                    cN: "css",
                    e: "</style>",
                    rE: true,
                    sL: "css"
                }
            }, {
                cN: "tag",
                b: "<script",
                e: ">",
                l: hljs.IR,
                k: {
                    title: {
                        script: 1
                    }
                },
                c: [a],
                starts: {
                    cN: "javascript",
                    e: "<\/script>",
                    rE: true,
                    sL: "javascript"
                }
            }, {
                cN: "vbscript",
                b: "<%",
                e: "%>",
                sL: "vbscript"
            }, {
                cN: "tag",
                b: "</?",
                e: "/?>",
                c: [{
                    cN: "title",
                    b: b
                }, a]
            }]
        }
    }
}();
hljs.LANGUAGES.django = function() {
    function c(f, e) {
        return (e == undefined || (!f.cN && e.cN == "tag") || f.cN == "value")
    }

    function d(j, h) {
        var e = {};
        for (var g in j) {
            if (g != "contains") {
                e[g] = j[g]
            }
            var k = [];
            for (var f = 0; j.c && f < j.c.length; f++) {
                k.push(d(j.c[f], j))
            }
            if (c(j, h)) {
                k = a.concat(k)
            }
            if (k.length) {
                e.c = k
            }
        }
        return e
    }
    var b = {
        cN: "filter",
        b: "\\|[A-Za-z]+\\:?",
        eE: true,
        l: hljs.IR,
        k: {
            truncatewords: 1,
            removetags: 1,
            linebreaksbr: 1,
            yesno: 1,
            get_digit: 1,
            timesince: 1,
            random: 1,
            striptags: 1,
            filesizeformat: 1,
            escape: 1,
            linebreaks: 1,
            length_is: 1,
            ljust: 1,
            rjust: 1,
            cut: 1,
            urlize: 1,
            fix_ampersands: 1,
            title: 1,
            floatformat: 1,
            capfirst: 1,
            pprint: 1,
            divisibleby: 1,
            add: 1,
            make_list: 1,
            unordered_list: 1,
            urlencode: 1,
            timeuntil: 1,
            urlizetrunc: 1,
            wordcount: 1,
            stringformat: 1,
            linenumbers: 1,
            slice: 1,
            date: 1,
            dictsort: 1,
            dictsortreversed: 1,
            default_if_none: 1,
            pluralize: 1,
            lower: 1,
            join: 1,
            center: 1,
            "default": 1,
            truncatewords_html: 1,
            upper: 1,
            length: 1,
            phone2numeric: 1,
            wordwrap: 1,
            time: 1,
            addslashes: 1,
            slugify: 1,
            first: 1
        },
        c: [{
            cN: "argument",
            b: '"',
            e: '"'
        }]
    };
    var a = [{
        cN: "template_comment",
        b: "{%\\s*comment\\s*%}",
        e: "{%\\s*endcomment\\s*%}"
    }, {
        cN: "template_comment",
        b: "{#",
        e: "#}"
    }, {
        cN: "template_tag",
        b: "{%",
        e: "%}",
        l: hljs.IR,
        k: {
            comment: 1,
            endcomment: 1,
            load: 1,
            templatetag: 1,
            ifchanged: 1,
            endifchanged: 1,
            "if": 1,
            endif: 1,
            firstof: 1,
            "for": 1,
            endfor: 1,
            "in": 1,
            ifnotequal: 1,
            endifnotequal: 1,
            widthratio: 1,
            "extends": 1,
            include: 1,
            spaceless: 1,
            endspaceless: 1,
            regroup: 1,
            by: 1,
            as: 1,
            ifequal: 1,
            endifequal: 1,
            ssi: 1,
            now: 1,
            "with": 1,
            cycle: 1,
            url: 1,
            filter: 1,
            endfilter: 1,
            debug: 1,
            block: 1,
            endblock: 1,
            "else": 1
        },
        c: [b]
    }, {
        cN: "variable",
        b: "{{",
        e: "}}",
        c: [b]
    }];
    return {
        cI: true,
        dM: d(hljs.LANGUAGES.xml.dM)
    }
}();
hljs.LANGUAGES.dos = {
    cI: true,
    dM: {
        l: hljs.IR,
        k: {
            flow: {
                "if": 1,
                "else": 1,
                "goto": 1,
                "for": 1,
                "in": 1,
                "do": 1,
                call: 1,
                exit: 1,
                not: 1,
                exist: 1,
                errorlevel: 1,
                defined: 1,
                equ: 1,
                neq: 1,
                lss: 1,
                leq: 1,
                gtr: 1,
                geq: 1
            },
            keyword: {
                shift: 1,
                cd: 1,
                dir: 1,
                echo: 1,
                setlocal: 1,
                endlocal: 1,
                set: 1,
                pause: 1,
                copy: 1
            },
            stream: {
                prn: 1,
                nul: 1,
                lpt3: 1,
                lpt2: 1,
                lpt1: 1,
                con: 1,
                com4: 1,
                com3: 1,
                com2: 1,
                com1: 1,
                aux: 1
            },
            winutils: {
                ping: 1,
                net: 1,
                ipconfig: 1,
                taskkill: 1,
                xcopy: 1,
                ren: 1,
                del: 1
            }
        },
        c: [{
            cN: "envvar",
            b: "%[^ ]+?%"
        }, {
            cN: "number",
            b: "\\b\\d+",
            r: 0
        }, {
            cN: "comment",
            b: "@?rem",
            e: "$"
        }]
    }
};
hljs.LANGUAGES.erlang_repl = {
    dM: {
        l: hljs.UIR,
        k: {
            special_functions: {
                spawn: 10,
                spawn_link: 10,
                self: 2
            },
            reserved: {
                after: 1,
                and: 1,
                andalso: 5,
                band: 1,
                begin: 1,
                bnot: 1,
                bor: 1,
                bsl: 1,
                bsr: 1,
                bxor: 1,
                "case": 1,
                "catch": 0,
                cond: 1,
                div: 1,
                end: 1,
                fun: 0,
                "if": 0,
                let: 1,
                not: 0,
                of: 1,
                or: 1,
                orelse: 5,
                query: 1,
                receive: 0,
                rem: 1,
                "try": 0,
                when: 1,
                xor: 1
            }
        },
        c: [{
            cN: "input_number",
            b: "^[0-9]+>"
        }, {
            cN: "comment",
            b: "%",
            e: "$"
        }, hljs.NM, hljs.ASM, hljs.QSM, {
            cN: "constant",
            b: "\\?(::)?([A-Z]\\w*(::)?)+"
        }, {
            cN: "arrow",
            b: "->"
        }, {
            cN: "ok",
            b: "ok"
        }, {
            cN: "exclamation_mark",
            b: "!"
        }, {
            cN: "function_or_atom",
            b: "(\\b[a-z'][a-zA-Z0-9_']*:[a-z'][a-zA-Z0-9_']*)|(\\b[a-z'][a-zA-Z0-9_']*)",
            r: 0
        }, {
            cN: "variable",
            b: "[A-Z][a-zA-Z0-9_']*",
            r: 0
        }]
    }
};
hljs.LANGUAGES.erlang = function() {
    var c = "[a-z'][a-zA-Z0-9_']*";
    var m = "(" + c + ":" + c + "|" + c + ")";
    var e = {
        keyword: {
            after: 1,
            and: 1,
            andalso: 10,
            band: 1,
            begin: 1,
            bnot: 1,
            bor: 1,
            bsl: 1,
            bzr: 1,
            bxor: 1,
            "case": 1,
            "catch": 1,
            cond: 1,
            div: 1,
            end: 1,
            fun: 1,
            let: 1,
            not: 1,
            of: 1,
            orelse: 10,
            query: 1,
            receive: 1,
            rem: 1,
            "try": 1,
            when: 1,
            xor: 1,
        },
        literal: {
            "false": 1,
            "true": 1
        }
    };
    var j = {
        cN: "comment",
        b: "%",
        e: "$",
        r: 0
    };
    var f = {
        b: "fun\\s+" + c + "/\\d+"
    };
    var l = {
        b: m + "\\(",
        e: "\\)",
        rB: true,
        r: 0,
        c: [{
            cN: "function_name",
            b: m
        }, {
            b: "\\(",
            e: "\\)",
            eW: true,
            rE: true
        }]
    };
    var g = {
        cN: "tuple",
        b: "{",
        e: "}"
    };
    var a = {
        cN: "variable",
        b: "\\b_([A-Z][A-Za-z0-9_]*)?",
        r: 0
    };
    var k = {
        cN: "variable",
        b: "[A-Z][a-zA-Z0-9_]*",
        r: 0
    };
    var b = {
        b: "#",
        e: "}",
        i: ".",
        r: 0,
        rB: true,
        c: [{
            cN: "record_name",
            b: "#" + hljs.UIR,
            r: 0
        }, {
            b: "{",
            eW: true,
            r: 0
        }]
    };
    var i = {
        l: c,
        k: e,
        b: "(fun|receive|if|try|case)",
        e: "end"
    };
    i.c = [j, f, hljs.inherit(hljs.ASM, {
        cN: ""
    }), i, l, hljs.QSM, hljs.CNM, g, a, k, b];
    var h = [j, f, i, l, hljs.QSM, hljs.CNM, g, a, k, b];
    l.c[1].c = h;
    g.c = h;
    b.c[1].c = h;
    var d = {
        cN: "params",
        b: "\\(",
        e: "\\)",
        eW: true,
        c: h
    };
    return {
        dM: {
            l: hljs.UIR,
            k: e,
            i: "(</|\\*=|\\+=|-=|/=|/\\*|\\*/|\\(\\*|\\*\\))",
            c: [{
                cN: "function",
                b: "^" + c + "\\(",
                e: ";|\\.",
                rB: true,
                c: [d, {
                    cN: "title",
                    b: c
                }, {
                    l: c,
                    k: e,
                    b: "->",
                    eW: true,
                    c: h
                }]
            }, j, {
                cN: "pp",
                b: "^-",
                e: "\\.",
                r: 0,
                eE: true,
                rB: true,
                l: "-" + hljs.UIR,
                k: {
                    "-module": 1,
                    "-record": 1,
                    "-undef": 1,
                    "-export": 1,
                    "-ifdef": 1,
                    "-ifndef": 1,
                    "-author": 1,
                    "-copyright": 1,
                    "-doc": 1,
                    "-vsn": 1,
                    "-import": 1,
                    "-include": 1,
                    "-include_lib": 1,
                    "-compile": 1,
                    "-define": 1,
                    "-else": 1,
                    "-endif": 1,
                    "-file": 1,
                    "-behaviour": 1,
                    "-behavior": 1
                },
                c: [d]
            }, hljs.CNM, hljs.QSM, b, a, k, g]
        }
    }
}();
hljs.LANGUAGES.haskell = function() {
    var a = {
        cN: "label",
        b: "\\b[A-Z][\\w\\']*",
        r: 0
    };
    var b = {
        cN: "container",
        b: "\\(",
        e: "\\)",
        c: [a, {
            cN: "title",
            b: "[_a-z][\\w\\']*"
        }]
    };
    return {
        dM: {
            l: "[a-zA-Z-\\+\\*/\\\\><\\:=\\$\\|][a-zA-Z-\\+\\*/\\\\><\\:=\\$\\|]*",
            k: {
                keyword: {
                    let: 1,
                    "in": 1,
                    "if": 1,
                    then: 1,
                    "else": 1,
                    "case": 1,
                    of: 1,
                    where: 1,
                    "do": 1,
                    module: 1,
                    "import": 1,
                    hiding: 1,
                    qualified: 1,
                    type: 1,
                    data: 1,
                    deriving: 1,
                    "class": 1,
                    instance: 1,
                    "null": 1,
                    not: 1,
                    as: 1
                },
                built_in: {
                    Bool: 1,
                    True: 1,
                    False: 1,
                    Int: 1,
                    Char: 1,
                    Maybe: 1,
                    Nothing: 1,
                    String: 1
                }
            },
            c: [{
                cN: "comment",
                b: "--",
                e: "$"
            }, {
                cN: "comment",
                b: "{-",
                e: "-}"
            }, hljs.ASM, hljs.QSM, {
                cN: "import",
                b: "\\bimport",
                e: "$",
                l: hljs.UIR,
                k: {
                    "import": 1,
                    qualified: 1,
                    as: 1,
                    hiding: 1
                },
                c: [b]
            }, {
                cN: "module",
                b: "\\bmodule",
                e: "where",
                l: hljs.UIR,
                k: {
                    module: 1,
                    where: 1
                },
                c: [b]
            }, {
                cN: "class",
                b: "\\b(class|instance)",
                e: "where",
                l: hljs.UIR,
                k: {
                    "class": 1,
                    where: 1,
                    instance: 1
                },
                c: [a]
            }, hljs.CNM, {
                cN: "shebang",
                b: "#!\\/usr\\/bin\\/env runhaskell",
                e: "$"
            }, a, {
                cN: "title",
                b: "^[_a-z][\\w\\']*"
            }]
        }
    }
}();
hljs.LANGUAGES.ini = {
    cI: true,
    dM: {
        i: "[^\\s]",
        c: [{
            cN: "comment",
            b: ";",
            e: "$"
        }, {
            cN: "title",
            b: "\\[",
            e: "\\]"
        }, {
            cN: "setting",
            b: "^[a-z0-9_\\[\\]]+[ \\t]*=[ \\t]*",
            e: "$",
            c: [{
                cN: "value",
                eW: true,
                l: hljs.IR,
                k: {
                    on: 1,
                    off: 1,
                    "true": 1,
                    "false": 1,
                    yes: 1,
                    no: 1
                },
                c: [hljs.QSM, hljs.NM]
            }]
        }]
    }
};
hljs.LANGUAGES.java = {
    dM: {
        l: hljs.UIR,
        k: {
            "false": 1,
            "synchronized": 1,
            "int": 1,
            "abstract": 1,
            "float": 1,
            "private": 1,
            "char": 1,
            "interface": 1,
            "boolean": 1,
            "static": 1,
            "null": 1,
            "if": 1,
            "const": 1,
            "for": 1,
            "true": 1,
            "while": 1,
            "long": 1,
            "throw": 1,
            strictfp: 1,
            "finally": 1,
            "protected": 1,
            "extends": 1,
            "import": 1,
            "native": 1,
            "final": 1,
            "implements": 1,
            "return": 1,
            "void": 1,
            "enum": 1,
            "else": 1,
            "break": 1,
            "transient": 1,
            "new": 1,
            "catch": 1,
            "instanceof": 1,
            "byte": 1,
            "super": 1,
            "class": 1,
            "volatile": 1,
            "case": 1,
            assert: 1,
            "short": 1,
            "package": 1,
            "default": 1,
            "double": 1,
            "public": 1,
            "try": 1,
            "this": 1,
            "switch": 1,
            "continue": 1,
            "throws": 1
        },
        c: [{
            cN: "javadoc",
            b: "/\\*\\*",
            e: "\\*/",
            c: [{
                cN: "javadoctag",
                b: "@[A-Za-z]+"
            }],
            r: 10
        }, hljs.CLCM, hljs.CBLCLM, hljs.ASM, hljs.QSM, {
            cN: "class",
            b: "(class |interface )",
            e: "{",
            l: hljs.UIR,
            k: {
                "class": 1,
                "interface": 1
            },
            i: ":",
            c: [{
                b: "(implements|extends)",
                l: hljs.IR,
                k: {
                    "extends": 1,
                    "implements": 1
                },
                r: 10
            }, {
                cN: "title",
                b: hljs.UIR
            }]
        }, hljs.CNM, {
            cN: "annotation",
            b: "@[A-Za-z]+"
        }]
    }
};
hljs.LANGUAGES.javascript = {
    dM: {
        l: hljs.UIR,
        k: {
            keyword: {
                "in": 1,
                "if": 1,
                "for": 1,
                "while": 1,
                "finally": 1,
                "var": 1,
                "new": 1,
                "function": 1,
                "do": 1,
                "return": 1,
                "void": 1,
                "else": 1,
                "break": 1,
                "catch": 1,
                "instanceof": 1,
                "with": 1,
                "throw": 1,
                "case": 1,
                "default": 1,
                "try": 1,
                "this": 1,
                "switch": 1,
                "continue": 1,
                "typeof": 1,
                "delete": 1
            },
            literal: {
                "true": 1,
                "false": 1,
                "null": 1
            }
        },
        c: [hljs.ASM, hljs.QSM, hljs.CLCM, hljs.CBLCLM, hljs.CNM, {
            b: "(" + hljs.RSR + "|case|return|throw)\\s*",
            l: hljs.IR,
            k: {
                "return": 1,
                "throw": 1,
                "case": 1
            },
            c: [hljs.CLCM, hljs.CBLCLM, {
                cN: "regexp",
                b: "/.*?[^\\\\/]/[gim]*"
            }],
            r: 0
        }, {
            cN: "function",
            b: "\\bfunction\\b",
            e: "{",
            l: hljs.UIR,
            k: {
                "function": 1
            },
            c: [{
                cN: "title",
                b: "[A-Za-z$_][0-9A-Za-z$_]*"
            }, {
                cN: "params",
                b: "\\(",
                e: "\\)",
                c: [hljs.ASM, hljs.QSM, hljs.CLCM, hljs.CBLCLM]
            }]
        }]
    }
};
hljs.LANGUAGES.lisp = function() {
    var n = "[a-zA-Z_\\-\\+\\*\\/\\<\\=\\>\\&\\#][a-zA-Z0-9_\\-\\+\\*\\/\\<\\=\\>\\&\\#]*";
    var p = "(\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s)(\\+|\\-)?\\d+)?";
    var a = {
        cN: "literal",
        b: "\\b(t{1}|nil)\\b"
    };
    var m = {
        cN: "number",
        b: p
    };
    var l = {
        cN: "number",
        b: "#b[0-1]+(/[0-1]+)?"
    };
    var k = {
        cN: "number",
        b: "#o[0-7]+(/[0-7]+)?"
    };
    var j = {
        cN: "number",
        b: "#x[0-9a-f]+(/[0-9a-f]+)?"
    };
    var i = {
        cN: "number",
        b: "#c\\(" + p + " +" + p,
        e: "\\)"
    };
    var g = {
        cN: "string",
        b: '"',
        e: '"',
        c: [hljs.BE],
        r: 0
    };
    var o = {
        cN: "comment",
        b: ";",
        e: "$"
    };
    var f = {
        cN: "variable",
        b: "\\*",
        e: "\\*"
    };
    var q = {
        cN: "keyword",
        b: "[:&]" + n
    };
    var b = {
        b: "\\(",
        e: "\\)"
    };
    b.c = [b, a, m, l, k, j, i, g];
    var d = {
        cN: "quoted",
        b: "['`]\\(",
        e: "\\)",
        c: [m, l, k, j, i, g, f, q, b]
    };
    var c = {
        cN: "quoted",
        b: "\\(quote ",
        e: "\\)",
        l: n,
        k: {
            title: {
                quote: 1
            }
        },
        c: [m, l, k, j, i, g, f, q, b]
    };
    var h = {
        cN: "list",
        b: "\\(",
        e: "\\)"
    };
    var e = {
        cN: "body",
        eW: true,
        eE: true
    };
    h.c = [{
        cN: "title",
        b: n
    }, e];
    e.c = [d, c, h, a, m, l, k, j, i, g, o, f, q];
    return {
        cI: true,
        dM: {
            i: "[^\\s]",
            c: [a, m, l, k, j, i, g, o, d, c, h]
        }
    }
}();
hljs.LANGUAGES.lua = function() {
    var a = "\\[=*\\[";
    var e = "\\]=*\\]";
    var b = {
        b: a,
        e: e
    };
    b.c = [b];
    var d = {
        cN: "comment",
        b: "--(?!" + a + ")",
        e: "$"
    };
    var c = {
        cN: "comment",
        b: "--" + a,
        e: e,
        c: [b],
        r: 10
    };
    return {
        dM: {
            l: hljs.UIR,
            k: {
                keyword: {
                    and: 1,
                    "break": 1,
                    "do": 1,
                    "else": 1,
                    elseif: 1,
                    end: 1,
                    "false": 1,
                    "for": 1,
                    "if": 1,
                    "in": 1,
                    local: 1,
                    nil: 1,
                    not: 1,
                    or: 1,
                    repeat: 1,
                    "return": 1,
                    then: 1,
                    "true": 1,
                    until: 1,
                    "while": 1
                },
                built_in: {
                    _G: 1,
                    _VERSION: 1,
                    assert: 1,
                    collectgarbage: 1,
                    dofile: 1,
                    error: 1,
                    getfenv: 1,
                    getmetatable: 1,
                    ipairs: 1,
                    load: 1,
                    loadfile: 1,
                    loadstring: 1,
                    module: 1,
                    next: 1,
                    pairs: 1,
                    pcall: 1,
                    print: 1,
                    rawequal: 1,
                    rawget: 1,
                    rawset: 1,
                    require: 1,
                    select: 1,
                    setfenv: 1,
                    setmetatable: 1,
                    tonumber: 1,
                    tostring: 1,
                    type: 1,
                    unpack: 1,
                    xpcall: 1,
                    coroutine: 1,
                    debug: 1,
                    io: 1,
                    math: 1,
                    os: 1,
                    "package": 1,
                    string: 1,
                    table: 1
                }
            },
            c: [d, c, {
                cN: "function",
                b: "\\bfunction\\b",
                e: "\\)",
                l: hljs.UIR,
                k: {
                    "function": 1
                },
                c: [{
                    cN: "title",
                    b: "([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*"
                }, {
                    cN: "params",
                    b: "\\(",
                    eW: true,
                    c: [d, c]
                }, d, c]
            }, hljs.CNM, hljs.ASM, hljs.QSM, {
                cN: "string",
                b: a,
                e: e,
                c: [b],
                r: 10
            }]
        }
    }
}();
hljs.LANGUAGES.mel = {
    dM: {
        l: hljs.UIR,
        k: {
            "int": 1,
            "float": 1,
            string: 1,
            "float": 1,
            vector: 1,
            matrix: 1,
            "if": 1,
            "else": 1,
            "switch": 1,
            "case": 1,
            "default": 1,
            "while": 1,
            "do": 1,
            "for": 1,
            "in": 1,
            "break": 1,
            "continue": 1,
            exists: 1,
            objExists: 1,
            attributeExists: 1,
            global: 1,
            proc: 1,
            "return": 1,
            error: 1,
            warning: 1,
            trace: 1,
            "catch": 1,
            about: 1,
            abs: 1,
            addAttr: 1,
            addAttributeEditorNodeHelp: 1,
            addDynamic: 1,
            addNewShelfTab: 1,
            addPP: 1,
            addPanelCategory: 1,
            addPrefixToName: 1,
            advanceToNextDrivenKey: 1,
            affectedNet: 1,
            affects: 1,
            aimConstraint: 1,
            air: 1,
            alias: 1,
            aliasAttr: 1,
            align: 1,
            alignCtx: 1,
            alignCurve: 1,
            alignSurface: 1,
            allViewFit: 1,
            ambientLight: 1,
            angle: 1,
            angleBetween: 1,
            animCone: 1,
            animCurveEditor: 1,
            animDisplay: 1,
            animView: 1,
            annotate: 1,
            appendStringArray: 1,
            applicationName: 1,
            applyAttrPreset: 1,
            applyTake: 1,
            arcLenDimContext: 1,
            arcLengthDimension: 1,
            arclen: 1,
            arrayMapper: 1,
            art3dPaintCtx: 1,
            artAttrCtx: 1,
            artAttrPaintVertexCtx: 1,
            artAttrSkinPaintCtx: 1,
            artAttrTool: 1,
            artBuildPaintMenu: 1,
            artFluidAttrCtx: 1,
            artPuttyCtx: 1,
            artSelectCtx: 1,
            artSetPaintCtx: 1,
            artUserPaintCtx: 1,
            assignCommand: 1,
            assignInputDevice: 1,
            assignViewportFactories: 1,
            attachCurve: 1,
            attachDeviceAttr: 1,
            attachSurface: 1,
            attrColorSliderGrp: 1,
            attrCompatibility: 1,
            attrControlGrp: 1,
            attrEnumOptionMenu: 1,
            attrEnumOptionMenuGrp: 1,
            attrFieldGrp: 1,
            attrFieldSliderGrp: 1,
            attrNavigationControlGrp: 1,
            attrPresetEditWin: 1,
            attributeExists: 1,
            attributeInfo: 1,
            attributeMenu: 1,
            attributeQuery: 1,
            autoKeyframe: 1,
            autoPlace: 1,
            bakeClip: 1,
            bakeFluidShading: 1,
            bakePartialHistory: 1,
            bakeResults: 1,
            bakeSimulation: 1,
            basename: 1,
            basenameEx: 1,
            batchRender: 1,
            bessel: 1,
            bevel: 1,
            bevelPlus: 1,
            binMembership: 1,
            bindSkin: 1,
            blend2: 1,
            blendShape: 1,
            blendShapeEditor: 1,
            blendShapePanel: 1,
            blendTwoAttr: 1,
            blindDataType: 1,
            boneLattice: 1,
            boundary: 1,
            boxDollyCtx: 1,
            boxZoomCtx: 1,
            bufferCurve: 1,
            buildBookmarkMenu: 1,
            buildKeyframeMenu: 1,
            button: 1,
            buttonManip: 1,
            CBG: 1,
            cacheFile: 1,
            cacheFileCombine: 1,
            cacheFileMerge: 1,
            cacheFileTrack: 1,
            camera: 1,
            cameraView: 1,
            canCreateManip: 1,
            canvas: 1,
            capitalizeString: 1,
            "catch": 1,
            catchQuiet: 1,
            ceil: 1,
            changeSubdivComponentDisplayLevel: 1,
            changeSubdivRegion: 1,
            channelBox: 1,
            character: 1,
            characterMap: 1,
            characterOutlineEditor: 1,
            characterize: 1,
            chdir: 1,
            checkBox: 1,
            checkBoxGrp: 1,
            checkDefaultRenderGlobals: 1,
            choice: 1,
            circle: 1,
            circularFillet: 1,
            clamp: 1,
            clear: 1,
            clearCache: 1,
            clip: 1,
            clipEditor: 1,
            clipEditorCurrentTimeCtx: 1,
            clipSchedule: 1,
            clipSchedulerOutliner: 1,
            clipTrimBefore: 1,
            closeCurve: 1,
            closeSurface: 1,
            cluster: 1,
            cmdFileOutput: 1,
            cmdScrollFieldExecuter: 1,
            cmdScrollFieldReporter: 1,
            cmdShell: 1,
            coarsenSubdivSelectionList: 1,
            collision: 1,
            color: 1,
            colorAtPoint: 1,
            colorEditor: 1,
            colorIndex: 1,
            colorIndexSliderGrp: 1,
            colorSliderButtonGrp: 1,
            colorSliderGrp: 1,
            columnLayout: 1,
            commandEcho: 1,
            commandLine: 1,
            commandPort: 1,
            compactHairSystem: 1,
            componentEditor: 1,
            compositingInterop: 1,
            computePolysetVolume: 1,
            condition: 1,
            cone: 1,
            confirmDialog: 1,
            connectAttr: 1,
            connectControl: 1,
            connectDynamic: 1,
            connectJoint: 1,
            connectionInfo: 1,
            constrain: 1,
            constrainValue: 1,
            constructionHistory: 1,
            container: 1,
            containsMultibyte: 1,
            contextInfo: 1,
            control: 1,
            convertFromOldLayers: 1,
            convertIffToPsd: 1,
            convertLightmap: 1,
            convertSolidTx: 1,
            convertTessellation: 1,
            convertUnit: 1,
            copyArray: 1,
            copyFlexor: 1,
            copyKey: 1,
            copySkinWeights: 1,
            cos: 1,
            cpButton: 1,
            cpCache: 1,
            cpClothSet: 1,
            cpCollision: 1,
            cpConstraint: 1,
            cpConvClothToMesh: 1,
            cpForces: 1,
            cpGetSolverAttr: 1,
            cpPanel: 1,
            cpProperty: 1,
            cpRigidCollisionFilter: 1,
            cpSeam: 1,
            cpSetEdit: 1,
            cpSetSolverAttr: 1,
            cpSolver: 1,
            cpSolverTypes: 1,
            cpTool: 1,
            cpUpdateClothUVs: 1,
            createDisplayLayer: 1,
            createDrawCtx: 1,
            createEditor: 1,
            createLayeredPsdFile: 1,
            createMotionField: 1,
            createNewShelf: 1,
            createNode: 1,
            createRenderLayer: 1,
            createSubdivRegion: 1,
            cross: 1,
            crossProduct: 1,
            ctxAbort: 1,
            ctxCompletion: 1,
            ctxEditMode: 1,
            ctxTraverse: 1,
            currentCtx: 1,
            currentTime: 1,
            currentTimeCtx: 1,
            currentUnit: 1,
            currentUnit: 1,
            curve: 1,
            curveAddPtCtx: 1,
            curveCVCtx: 1,
            curveEPCtx: 1,
            curveEditorCtx: 1,
            curveIntersect: 1,
            curveMoveEPCtx: 1,
            curveOnSurface: 1,
            curveSketchCtx: 1,
            cutKey: 1,
            cycleCheck: 1,
            cylinder: 1,
            dagPose: 1,
            date: 1,
            defaultLightListCheckBox: 1,
            defaultNavigation: 1,
            defineDataServer: 1,
            defineVirtualDevice: 1,
            deformer: 1,
            deg_to_rad: 1,
            "delete": 1,
            deleteAttr: 1,
            deleteShadingGroupsAndMaterials: 1,
            deleteShelfTab: 1,
            deleteUI: 1,
            deleteUnusedBrushes: 1,
            delrandstr: 1,
            detachCurve: 1,
            detachDeviceAttr: 1,
            detachSurface: 1,
            deviceEditor: 1,
            devicePanel: 1,
            dgInfo: 1,
            dgdirty: 1,
            dgeval: 1,
            dgtimer: 1,
            dimWhen: 1,
            directKeyCtx: 1,
            directionalLight: 1,
            dirmap: 1,
            dirname: 1,
            disable: 1,
            disconnectAttr: 1,
            disconnectJoint: 1,
            diskCache: 1,
            displacementToPoly: 1,
            displayAffected: 1,
            displayColor: 1,
            displayCull: 1,
            displayLevelOfDetail: 1,
            displayPref: 1,
            displayRGBColor: 1,
            displaySmoothness: 1,
            displayStats: 1,
            displayString: 1,
            displaySurface: 1,
            distanceDimContext: 1,
            distanceDimension: 1,
            doBlur: 1,
            dolly: 1,
            dollyCtx: 1,
            dopeSheetEditor: 1,
            dot: 1,
            dotProduct: 1,
            doubleProfileBirailSurface: 1,
            drag: 1,
            dragAttrContext: 1,
            draggerContext: 1,
            dropoffLocator: 1,
            duplicate: 1,
            duplicateCurve: 1,
            duplicateSurface: 1,
            dynCache: 1,
            dynControl: 1,
            dynExport: 1,
            dynExpression: 1,
            dynGlobals: 1,
            dynPaintEditor: 1,
            dynParticleCtx: 1,
            dynPref: 1,
            dynRelEdPanel: 1,
            dynRelEditor: 1,
            dynamicLoad: 1,
            editAttrLimits: 1,
            editDisplayLayerGlobals: 1,
            editDisplayLayerMembers: 1,
            editRenderLayerAdjustment: 1,
            editRenderLayerGlobals: 1,
            editRenderLayerMembers: 1,
            editor: 1,
            editorTemplate: 1,
            effector: 1,
            emit: 1,
            emitter: 1,
            enableDevice: 1,
            encodeString: 1,
            endString: 1,
            endsWith: 1,
            env: 1,
            equivalent: 1,
            equivalentTol: 1,
            erf: 1,
            error: 1,
            "eval": 1,
            "eval": 1,
            evalDeferred: 1,
            evalEcho: 1,
            event: 1,
            exactWorldBoundingBox: 1,
            exclusiveLightCheckBox: 1,
            exec: 1,
            executeForEachObject: 1,
            exists: 1,
            exp: 1,
            expression: 1,
            expressionEditorListen: 1,
            extendCurve: 1,
            extendSurface: 1,
            extrude: 1,
            fcheck: 1,
            fclose: 1,
            feof: 1,
            fflush: 1,
            fgetline: 1,
            fgetword: 1,
            file: 1,
            fileBrowserDialog: 1,
            fileDialog: 1,
            fileExtension: 1,
            fileInfo: 1,
            filetest: 1,
            filletCurve: 1,
            filter: 1,
            filterCurve: 1,
            filterExpand: 1,
            filterStudioImport: 1,
            findAllIntersections: 1,
            findAnimCurves: 1,
            findKeyframe: 1,
            findMenuItem: 1,
            findRelatedSkinCluster: 1,
            finder: 1,
            firstParentOf: 1,
            fitBspline: 1,
            flexor: 1,
            floatEq: 1,
            floatField: 1,
            floatFieldGrp: 1,
            floatScrollBar: 1,
            floatSlider: 1,
            floatSlider2: 1,
            floatSliderButtonGrp: 1,
            floatSliderGrp: 1,
            floor: 1,
            flow: 1,
            fluidCacheInfo: 1,
            fluidEmitter: 1,
            fluidVoxelInfo: 1,
            flushUndo: 1,
            fmod: 1,
            fontDialog: 1,
            fopen: 1,
            formLayout: 1,
            format: 1,
            fprint: 1,
            frameLayout: 1,
            fread: 1,
            freeFormFillet: 1,
            frewind: 1,
            fromNativePath: 1,
            fwrite: 1,
            gamma: 1,
            gauss: 1,
            geometryConstraint: 1,
            getApplicationVersionAsFloat: 1,
            getAttr: 1,
            getClassification: 1,
            getDefaultBrush: 1,
            getFileList: 1,
            getFluidAttr: 1,
            getInputDeviceRange: 1,
            getMayaPanelTypes: 1,
            getModifiers: 1,
            getPanel: 1,
            getParticleAttr: 1,
            getPluginResource: 1,
            getenv: 1,
            getpid: 1,
            glRender: 1,
            glRenderEditor: 1,
            globalStitch: 1,
            gmatch: 1,
            goal: 1,
            gotoBindPose: 1,
            grabColor: 1,
            gradientControl: 1,
            gradientControlNoAttr: 1,
            graphDollyCtx: 1,
            graphSelectContext: 1,
            graphTrackCtx: 1,
            gravity: 1,
            grid: 1,
            gridLayout: 1,
            group: 1,
            groupObjectsByName: 1,
            HfAddAttractorToAS: 1,
            HfAssignAS: 1,
            HfBuildEqualMap: 1,
            HfBuildFurFiles: 1,
            HfBuildFurImages: 1,
            HfCancelAFR: 1,
            HfConnectASToHF: 1,
            HfCreateAttractor: 1,
            HfDeleteAS: 1,
            HfEditAS: 1,
            HfPerformCreateAS: 1,
            HfRemoveAttractorFromAS: 1,
            HfSelectAttached: 1,
            HfSelectAttractors: 1,
            HfUnAssignAS: 1,
            hardenPointCurve: 1,
            hardware: 1,
            hardwareRenderPanel: 1,
            headsUpDisplay: 1,
            headsUpMessage: 1,
            help: 1,
            helpLine: 1,
            hermite: 1,
            hide: 1,
            hilite: 1,
            hitTest: 1,
            hotBox: 1,
            hotkey: 1,
            hotkeyCheck: 1,
            hsv_to_rgb: 1,
            hudButton: 1,
            hudSlider: 1,
            hudSliderButton: 1,
            hwReflectionMap: 1,
            hwRender: 1,
            hwRenderLoad: 1,
            hyperGraph: 1,
            hyperPanel: 1,
            hyperShade: 1,
            hypot: 1,
            iconTextButton: 1,
            iconTextCheckBox: 1,
            iconTextRadioButton: 1,
            iconTextRadioCollection: 1,
            iconTextScrollList: 1,
            iconTextStaticLabel: 1,
            ikHandle: 1,
            ikHandleCtx: 1,
            ikHandleDisplayScale: 1,
            ikSolver: 1,
            ikSplineHandleCtx: 1,
            ikSystem: 1,
            ikSystemInfo: 1,
            ikfkDisplayMethod: 1,
            illustratorCurves: 1,
            image: 1,
            imfPlugins: 1,
            inheritTransform: 1,
            insertJoint: 1,
            insertJointCtx: 1,
            insertKeyCtx: 1,
            insertKnotCurve: 1,
            insertKnotSurface: 1,
            instance: 1,
            instanceable: 1,
            instancer: 1,
            intField: 1,
            intFieldGrp: 1,
            intScrollBar: 1,
            intSlider: 1,
            intSliderGrp: 1,
            interToUI: 1,
            internalVar: 1,
            intersect: 1,
            iprEngine: 1,
            isAnimCurve: 1,
            isConnected: 1,
            isDirty: 1,
            isParentOf: 1,
            isSameObject: 1,
            isTrue: 1,
            isValidObjectName: 1,
            isValidString: 1,
            isValidUiName: 1,
            isolateSelect: 1,
            itemFilter: 1,
            itemFilterAttr: 1,
            itemFilterRender: 1,
            itemFilterType: 1,
            joint: 1,
            jointCluster: 1,
            jointCtx: 1,
            jointDisplayScale: 1,
            jointLattice: 1,
            keyTangent: 1,
            keyframe: 1,
            keyframeOutliner: 1,
            keyframeRegionCurrentTimeCtx: 1,
            keyframeRegionDirectKeyCtx: 1,
            keyframeRegionDollyCtx: 1,
            keyframeRegionInsertKeyCtx: 1,
            keyframeRegionMoveKeyCtx: 1,
            keyframeRegionScaleKeyCtx: 1,
            keyframeRegionSelectKeyCtx: 1,
            keyframeRegionSetKeyCtx: 1,
            keyframeRegionTrackCtx: 1,
            keyframeStats: 1,
            lassoContext: 1,
            lattice: 1,
            latticeDeformKeyCtx: 1,
            launch: 1,
            launchImageEditor: 1,
            layerButton: 1,
            layeredShaderPort: 1,
            layeredTexturePort: 1,
            layout: 1,
            layoutDialog: 1,
            lightList: 1,
            lightListEditor: 1,
            lightListPanel: 1,
            lightlink: 1,
            lineIntersection: 1,
            linearPrecision: 1,
            linstep: 1,
            listAnimatable: 1,
            listAttr: 1,
            listCameras: 1,
            listConnections: 1,
            listDeviceAttachments: 1,
            listHistory: 1,
            listInputDeviceAxes: 1,
            listInputDeviceButtons: 1,
            listInputDevices: 1,
            listMenuAnnotation: 1,
            listNodeTypes: 1,
            listPanelCategories: 1,
            listRelatives: 1,
            listSets: 1,
            listTransforms: 1,
            listUnselected: 1,
            listerEditor: 1,
            loadFluid: 1,
            loadNewShelf: 1,
            loadPlugin: 1,
            loadPluginLanguageResources: 1,
            loadPrefObjects: 1,
            localizedPanelLabel: 1,
            lockNode: 1,
            loft: 1,
            log: 1,
            longNameOf: 1,
            lookThru: 1,
            ls: 1,
            lsThroughFilter: 1,
            lsType: 1,
            lsUI: 1,
            Mayatomr: 1,
            mag: 1,
            makeIdentity: 1,
            makeLive: 1,
            makePaintable: 1,
            makeRoll: 1,
            makeSingleSurface: 1,
            makeTubeOn: 1,
            makebot: 1,
            manipMoveContext: 1,
            manipMoveLimitsCtx: 1,
            manipOptions: 1,
            manipRotateContext: 1,
            manipRotateLimitsCtx: 1,
            manipScaleContext: 1,
            manipScaleLimitsCtx: 1,
            marker: 1,
            match: 1,
            max: 1,
            memory: 1,
            menu: 1,
            menuBarLayout: 1,
            menuEditor: 1,
            menuItem: 1,
            menuItemToShelf: 1,
            menuSet: 1,
            menuSetPref: 1,
            messageLine: 1,
            min: 1,
            minimizeApp: 1,
            mirrorJoint: 1,
            modelCurrentTimeCtx: 1,
            modelEditor: 1,
            modelPanel: 1,
            mouse: 1,
            movIn: 1,
            movOut: 1,
            move: 1,
            moveIKtoFK: 1,
            moveKeyCtx: 1,
            moveVertexAlongDirection: 1,
            multiProfileBirailSurface: 1,
            mute: 1,
            nParticle: 1,
            nameCommand: 1,
            nameField: 1,
            namespace: 1,
            namespaceInfo: 1,
            newPanelItems: 1,
            newton: 1,
            nodeCast: 1,
            nodeIconButton: 1,
            nodeOutliner: 1,
            nodePreset: 1,
            nodeType: 1,
            noise: 1,
            nonLinear: 1,
            normalConstraint: 1,
            normalize: 1,
            nurbsBoolean: 1,
            nurbsCopyUVSet: 1,
            nurbsCube: 1,
            nurbsEditUV: 1,
            nurbsPlane: 1,
            nurbsSelect: 1,
            nurbsSquare: 1,
            nurbsToPoly: 1,
            nurbsToPolygonsPref: 1,
            nurbsToSubdiv: 1,
            nurbsToSubdivPref: 1,
            nurbsUVSet: 1,
            nurbsViewDirectionVector: 1,
            objExists: 1,
            objectCenter: 1,
            objectLayer: 1,
            objectType: 1,
            objectTypeUI: 1,
            obsoleteProc: 1,
            oceanNurbsPreviewPlane: 1,
            offsetCurve: 1,
            offsetCurveOnSurface: 1,
            offsetSurface: 1,
            openGLExtension: 1,
            openMayaPref: 1,
            optionMenu: 1,
            optionMenuGrp: 1,
            optionVar: 1,
            orbit: 1,
            orbitCtx: 1,
            orientConstraint: 1,
            outlinerEditor: 1,
            outlinerPanel: 1,
            overrideModifier: 1,
            paintEffectsDisplay: 1,
            pairBlend: 1,
            palettePort: 1,
            paneLayout: 1,
            panel: 1,
            panelConfiguration: 1,
            panelHistory: 1,
            paramDimContext: 1,
            paramDimension: 1,
            paramLocator: 1,
            parent: 1,
            parentConstraint: 1,
            particle: 1,
            particleExists: 1,
            particleInstancer: 1,
            particleRenderInfo: 1,
            partition: 1,
            pasteKey: 1,
            pathAnimation: 1,
            pause: 1,
            pclose: 1,
            percent: 1,
            performanceOptions: 1,
            pfxstrokes: 1,
            pickWalk: 1,
            picture: 1,
            pixelMove: 1,
            planarSrf: 1,
            plane: 1,
            play: 1,
            playbackOptions: 1,
            playblast: 1,
            plugAttr: 1,
            plugNode: 1,
            pluginInfo: 1,
            pluginResourceUtil: 1,
            pointConstraint: 1,
            pointCurveConstraint: 1,
            pointLight: 1,
            pointMatrixMult: 1,
            pointOnCurve: 1,
            pointOnSurface: 1,
            pointPosition: 1,
            poleVectorConstraint: 1,
            polyAppend: 1,
            polyAppendFacetCtx: 1,
            polyAppendVertex: 1,
            polyAutoProjection: 1,
            polyAverageNormal: 1,
            polyAverageVertex: 1,
            polyBevel: 1,
            polyBlendColor: 1,
            polyBlindData: 1,
            polyBoolOp: 1,
            polyBridgeEdge: 1,
            polyCacheMonitor: 1,
            polyCheck: 1,
            polyChipOff: 1,
            polyClipboard: 1,
            polyCloseBorder: 1,
            polyCollapseEdge: 1,
            polyCollapseFacet: 1,
            polyColorBlindData: 1,
            polyColorDel: 1,
            polyColorPerVertex: 1,
            polyColorSet: 1,
            polyCompare: 1,
            polyCone: 1,
            polyCopyUV: 1,
            polyCrease: 1,
            polyCreaseCtx: 1,
            polyCreateFacet: 1,
            polyCreateFacetCtx: 1,
            polyCube: 1,
            polyCut: 1,
            polyCutCtx: 1,
            polyCylinder: 1,
            polyCylindricalProjection: 1,
            polyDelEdge: 1,
            polyDelFacet: 1,
            polyDelVertex: 1,
            polyDuplicateAndConnect: 1,
            polyDuplicateEdge: 1,
            polyEditUV: 1,
            polyEditUVShell: 1,
            polyEvaluate: 1,
            polyExtrudeEdge: 1,
            polyExtrudeFacet: 1,
            polyExtrudeVertex: 1,
            polyFlipEdge: 1,
            polyFlipUV: 1,
            polyForceUV: 1,
            polyGeoSampler: 1,
            polyHelix: 1,
            polyInfo: 1,
            polyInstallAction: 1,
            polyLayoutUV: 1,
            polyListComponentConversion: 1,
            polyMapCut: 1,
            polyMapDel: 1,
            polyMapSew: 1,
            polyMapSewMove: 1,
            polyMergeEdge: 1,
            polyMergeEdgeCtx: 1,
            polyMergeFacet: 1,
            polyMergeFacetCtx: 1,
            polyMergeUV: 1,
            polyMergeVertex: 1,
            polyMirrorFace: 1,
            polyMoveEdge: 1,
            polyMoveFacet: 1,
            polyMoveFacetUV: 1,
            polyMoveUV: 1,
            polyMoveVertex: 1,
            polyNormal: 1,
            polyNormalPerVertex: 1,
            polyNormalizeUV: 1,
            polyOptUvs: 1,
            polyOptions: 1,
            polyOutput: 1,
            polyPipe: 1,
            polyPlanarProjection: 1,
            polyPlane: 1,
            polyPlatonicSolid: 1,
            polyPoke: 1,
            polyPrimitive: 1,
            polyPrism: 1,
            polyProjection: 1,
            polyPyramid: 1,
            polyQuad: 1,
            polyQueryBlindData: 1,
            polyReduce: 1,
            polySelect: 1,
            polySelectConstraint: 1,
            polySelectConstraintMonitor: 1,
            polySelectCtx: 1,
            polySelectEditCtx: 1,
            polySeparate: 1,
            polySetToFaceNormal: 1,
            polySewEdge: 1,
            polyShortestPathCtx: 1,
            polySmooth: 1,
            polySoftEdge: 1,
            polySphere: 1,
            polySphericalProjection: 1,
            polySplit: 1,
            polySplitCtx: 1,
            polySplitEdge: 1,
            polySplitRing: 1,
            polySplitVertex: 1,
            polyStraightenUVBorder: 1,
            polySubdivideEdge: 1,
            polySubdivideFacet: 1,
            polyToSubdiv: 1,
            polyTorus: 1,
            polyTransfer: 1,
            polyTriangulate: 1,
            polyUVSet: 1,
            polyUnite: 1,
            polyWedgeFace: 1,
            popen: 1,
            popupMenu: 1,
            pose: 1,
            pow: 1,
            preloadRefEd: 1,
            print: 1,
            progressBar: 1,
            progressWindow: 1,
            projFileViewer: 1,
            projectCurve: 1,
            projectTangent: 1,
            projectionContext: 1,
            projectionManip: 1,
            promptDialog: 1,
            propModCtx: 1,
            propMove: 1,
            psdChannelOutliner: 1,
            psdEditTextureFile: 1,
            psdExport: 1,
            psdTextureFile: 1,
            putenv: 1,
            pwd: 1,
            python: 1,
            querySubdiv: 1,
            quit: 1,
            rad_to_deg: 1,
            radial: 1,
            radioButton: 1,
            radioButtonGrp: 1,
            radioCollection: 1,
            radioMenuItemCollection: 1,
            rampColorPort: 1,
            rand: 1,
            randomizeFollicles: 1,
            randstate: 1,
            rangeControl: 1,
            readTake: 1,
            rebuildCurve: 1,
            rebuildSurface: 1,
            recordAttr: 1,
            recordDevice: 1,
            redo: 1,
            reference: 1,
            referenceEdit: 1,
            referenceQuery: 1,
            refineSubdivSelectionList: 1,
            refresh: 1,
            refreshAE: 1,
            registerPluginResource: 1,
            rehash: 1,
            reloadImage: 1,
            removeJoint: 1,
            removeMultiInstance: 1,
            removePanelCategory: 1,
            rename: 1,
            renameAttr: 1,
            renameSelectionList: 1,
            renameUI: 1,
            render: 1,
            renderGlobalsNode: 1,
            renderInfo: 1,
            renderLayerButton: 1,
            renderLayerParent: 1,
            renderLayerPostProcess: 1,
            renderLayerUnparent: 1,
            renderManip: 1,
            renderPartition: 1,
            renderQualityNode: 1,
            renderSettings: 1,
            renderThumbnailUpdate: 1,
            renderWindowEditor: 1,
            renderWindowSelectContext: 1,
            renderer: 1,
            reorder: 1,
            reorderDeformers: 1,
            requires: 1,
            reroot: 1,
            resampleFluid: 1,
            resetAE: 1,
            resetPfxToPolyCamera: 1,
            resetTool: 1,
            resolutionNode: 1,
            retarget: 1,
            reverseCurve: 1,
            reverseSurface: 1,
            revolve: 1,
            rgb_to_hsv: 1,
            rigidBody: 1,
            rigidSolver: 1,
            roll: 1,
            rollCtx: 1,
            rootOf: 1,
            rot: 1,
            rotate: 1,
            rotationInterpolation: 1,
            roundConstantRadius: 1,
            rowColumnLayout: 1,
            rowLayout: 1,
            runTimeCommand: 1,
            runup: 1,
            sampleImage: 1,
            saveAllShelves: 1,
            saveAttrPreset: 1,
            saveFluid: 1,
            saveImage: 1,
            saveInitialState: 1,
            saveMenu: 1,
            savePrefObjects: 1,
            savePrefs: 1,
            saveShelf: 1,
            saveToolSettings: 1,
            scale: 1,
            scaleBrushBrightness: 1,
            scaleComponents: 1,
            scaleConstraint: 1,
            scaleKey: 1,
            scaleKeyCtx: 1,
            sceneEditor: 1,
            sceneUIReplacement: 1,
            scmh: 1,
            scriptCtx: 1,
            scriptEditorInfo: 1,
            scriptJob: 1,
            scriptNode: 1,
            scriptTable: 1,
            scriptToShelf: 1,
            scriptedPanel: 1,
            scriptedPanelType: 1,
            scrollField: 1,
            scrollLayout: 1,
            sculpt: 1,
            searchPathArray: 1,
            seed: 1,
            selLoadSettings: 1,
            select: 1,
            selectContext: 1,
            selectCurveCV: 1,
            selectKey: 1,
            selectKeyCtx: 1,
            selectKeyframeRegionCtx: 1,
            selectMode: 1,
            selectPref: 1,
            selectPriority: 1,
            selectType: 1,
            selectedNodes: 1,
            selectionConnection: 1,
            separator: 1,
            setAttr: 1,
            setAttrEnumResource: 1,
            setAttrMapping: 1,
            setAttrNiceNameResource: 1,
            setConstraintRestPosition: 1,
            setDefaultShadingGroup: 1,
            setDrivenKeyframe: 1,
            setDynamic: 1,
            setEditCtx: 1,
            setEditor: 1,
            setFluidAttr: 1,
            setFocus: 1,
            setInfinity: 1,
            setInputDeviceMapping: 1,
            setKeyCtx: 1,
            setKeyPath: 1,
            setKeyframe: 1,
            setKeyframeBlendshapeTargetWts: 1,
            setMenuMode: 1,
            setNodeNiceNameResource: 1,
            setNodeTypeFlag: 1,
            setParent: 1,
            setParticleAttr: 1,
            setPfxToPolyCamera: 1,
            setPluginResource: 1,
            setProject: 1,
            setStampDensity: 1,
            setStartupMessage: 1,
            setState: 1,
            setToolTo: 1,
            setUITemplate: 1,
            setXformManip: 1,
            sets: 1,
            shadingConnection: 1,
            shadingGeometryRelCtx: 1,
            shadingLightRelCtx: 1,
            shadingNetworkCompare: 1,
            shadingNode: 1,
            shapeCompare: 1,
            shelfButton: 1,
            shelfLayout: 1,
            shelfTabLayout: 1,
            shellField: 1,
            shortNameOf: 1,
            showHelp: 1,
            showHidden: 1,
            showManipCtx: 1,
            showSelectionInTitle: 1,
            showShadingGroupAttrEditor: 1,
            showWindow: 1,
            sign: 1,
            simplify: 1,
            sin: 1,
            singleProfileBirailSurface: 1,
            size: 1,
            sizeBytes: 1,
            skinCluster: 1,
            skinPercent: 1,
            smoothCurve: 1,
            smoothTangentSurface: 1,
            smoothstep: 1,
            snap2to2: 1,
            snapKey: 1,
            snapMode: 1,
            snapTogetherCtx: 1,
            snapshot: 1,
            soft: 1,
            softMod: 1,
            softModCtx: 1,
            sort: 1,
            sound: 1,
            soundControl: 1,
            source: 1,
            spaceLocator: 1,
            sphere: 1,
            sphrand: 1,
            spotLight: 1,
            spotLightPreviewPort: 1,
            spreadSheetEditor: 1,
            spring: 1,
            sqrt: 1,
            squareSurface: 1,
            srtContext: 1,
            stackTrace: 1,
            startString: 1,
            startsWith: 1,
            stitchAndExplodeShell: 1,
            stitchSurface: 1,
            stitchSurfacePoints: 1,
            strcmp: 1,
            stringArrayCatenate: 1,
            stringArrayContains: 1,
            stringArrayCount: 1,
            stringArrayInsertAtIndex: 1,
            stringArrayIntersector: 1,
            stringArrayRemove: 1,
            stringArrayRemoveAtIndex: 1,
            stringArrayRemoveDuplicates: 1,
            stringArrayRemoveExact: 1,
            stringArrayToString: 1,
            stringToStringArray: 1,
            strip: 1,
            stripPrefixFromName: 1,
            stroke: 1,
            subdAutoProjection: 1,
            subdCleanTopology: 1,
            subdCollapse: 1,
            subdDuplicateAndConnect: 1,
            subdEditUV: 1,
            subdListComponentConversion: 1,
            subdMapCut: 1,
            subdMapSewMove: 1,
            subdMatchTopology: 1,
            subdMirror: 1,
            subdToBlind: 1,
            subdToPoly: 1,
            subdTransferUVsToCache: 1,
            subdiv: 1,
            subdivCrease: 1,
            subdivDisplaySmoothness: 1,
            substitute: 1,
            substituteAllString: 1,
            substituteGeometry: 1,
            substring: 1,
            surface: 1,
            surfaceSampler: 1,
            surfaceShaderList: 1,
            swatchDisplayPort: 1,
            switchTable: 1,
            symbolButton: 1,
            symbolCheckBox: 1,
            sysFile: 1,
            system: 1,
            tabLayout: 1,
            tan: 1,
            tangentConstraint: 1,
            texLatticeDeformContext: 1,
            texManipContext: 1,
            texMoveContext: 1,
            texMoveUVShellContext: 1,
            texRotateContext: 1,
            texScaleContext: 1,
            texSelectContext: 1,
            texSelectShortestPathCtx: 1,
            texSmudgeUVContext: 1,
            texWinToolCtx: 1,
            text: 1,
            textCurves: 1,
            textField: 1,
            textFieldButtonGrp: 1,
            textFieldGrp: 1,
            textManip: 1,
            textScrollList: 1,
            textToShelf: 1,
            textureDisplacePlane: 1,
            textureHairColor: 1,
            texturePlacementContext: 1,
            textureWindow: 1,
            threadCount: 1,
            threePointArcCtx: 1,
            timeControl: 1,
            timePort: 1,
            timerX: 1,
            toNativePath: 1,
            toggle: 1,
            toggleAxis: 1,
            toggleWindowVisibility: 1,
            tokenize: 1,
            tokenizeList: 1,
            tolerance: 1,
            tolower: 1,
            toolButton: 1,
            toolCollection: 1,
            toolDropped: 1,
            toolHasOptions: 1,
            toolPropertyWindow: 1,
            torus: 1,
            toupper: 1,
            trace: 1,
            track: 1,
            trackCtx: 1,
            transferAttributes: 1,
            transformCompare: 1,
            transformLimits: 1,
            translator: 1,
            trim: 1,
            trunc: 1,
            truncateFluidCache: 1,
            truncateHairCache: 1,
            tumble: 1,
            tumbleCtx: 1,
            turbulence: 1,
            twoPointArcCtx: 1,
            uiRes: 1,
            uiTemplate: 1,
            unassignInputDevice: 1,
            undo: 1,
            undoInfo: 1,
            ungroup: 1,
            uniform: 1,
            unit: 1,
            unloadPlugin: 1,
            untangleUV: 1,
            untitledFileName: 1,
            untrim: 1,
            upAxis: 1,
            updateAE: 1,
            userCtx: 1,
            uvLink: 1,
            uvSnapshot: 1,
            validateShelfName: 1,
            vectorize: 1,
            view2dToolCtx: 1,
            viewCamera: 1,
            viewClipPlane: 1,
            viewFit: 1,
            viewHeadOn: 1,
            viewLookAt: 1,
            viewManip: 1,
            viewPlace: 1,
            viewSet: 1,
            visor: 1,
            volumeAxis: 1,
            vortex: 1,
            waitCursor: 1,
            warning: 1,
            webBrowser: 1,
            webBrowserPrefs: 1,
            whatIs: 1,
            window: 1,
            windowPref: 1,
            wire: 1,
            wireContext: 1,
            workspace: 1,
            wrinkle: 1,
            wrinkleContext: 1,
            writeTake: 1,
            xbmLangPathList: 1,
            xform: 1
        },
        i: "</",
        c: [hljs.CNM, hljs.ASM, hljs.QSM, {
            cN: "string",
            b: "`",
            e: "`",
            c: [hljs.BE]
        }, {
            cN: "variable",
            b: "\\$\\d",
            r: 5
        }, {
            cN: "variable",
            b: "[\\$\\%\\@\\*](\\^\\w\\b|#\\w+|[^\\s\\w{]|{\\w+}|\\w+)"
        }, hljs.CLCM, hljs.CBLCLM]
    }
};
hljs.LANGUAGES.nginx = function() {
    var c = {
        cN: "variable",
        b: "\\$\\d+"
    };
    var b = {
        cN: "variable",
        b: "\\${",
        e: "}"
    };
    var a = {
        cN: "variable",
        b: "[\\$\\@]" + hljs.UIR,
        r: 0
    };
    return {
        dM: {
            c: [hljs.HCM, {
                b: hljs.UIR,
                e: ";|{",
                rE: true,
                l: hljs.UIR,
                k: {
                    accept_mutex: 1,
                    accept_mutex_delay: 1,
                    access_log: 1,
                    add_after_body: 1,
                    add_before_body: 1,
                    add_header: 1,
                    addition_types: 1,
                    alias: 1,
                    allow: 1,
                    ancient_browser: 1,
                    ancient_browser: 1,
                    ancient_browser_value: 1,
                    ancient_browser_value: 1,
                    auth_basic: 1,
                    auth_basic_user_file: 1,
                    autoindex: 1,
                    autoindex_exact_size: 1,
                    autoindex_localtime: 1,
                    "break": 1,
                    charset: 1,
                    charset: 1,
                    charset_map: 1,
                    charset_map: 1,
                    charset_types: 1,
                    charset_types: 1,
                    client_body_buffer_size: 1,
                    client_body_in_file_only: 1,
                    client_body_in_single_buffer: 1,
                    client_body_temp_path: 1,
                    client_body_timeout: 1,
                    client_header_buffer_size: 1,
                    client_header_timeout: 1,
                    client_max_body_size: 1,
                    connection_pool_size: 1,
                    connections: 1,
                    create_full_put_path: 1,
                    daemon: 1,
                    dav_access: 1,
                    dav_methods: 1,
                    debug_connection: 1,
                    debug_points: 1,
                    default_type: 1,
                    deny: 1,
                    directio: 1,
                    directio_alignment: 1,
                    echo: 1,
                    echo_after_body: 1,
                    echo_before_body: 1,
                    echo_blocking_sleep: 1,
                    echo_duplicate: 1,
                    echo_end: 1,
                    echo_exec: 1,
                    echo_flush: 1,
                    echo_foreach_split: 1,
                    echo_location: 1,
                    echo_location_async: 1,
                    echo_read_request_body: 1,
                    echo_request_body: 1,
                    echo_reset_timer: 1,
                    echo_sleep: 1,
                    echo_subrequest: 1,
                    echo_subrequest_async: 1,
                    empty_gif: 1,
                    empty_gif: 1,
                    env: 1,
                    error_log: 1,
                    error_log: 1,
                    error_page: 1,
                    events: 1,
                    expires: 1,
                    fastcgi_bind: 1,
                    fastcgi_buffer_size: 1,
                    fastcgi_buffers: 1,
                    fastcgi_busy_buffers_size: 1,
                    fastcgi_cache: 1,
                    fastcgi_cache_key: 1,
                    fastcgi_cache_methods: 1,
                    fastcgi_cache_min_uses: 1,
                    fastcgi_cache_path: 1,
                    fastcgi_cache_use_stale: 1,
                    fastcgi_cache_valid: 1,
                    fastcgi_catch_stderr: 1,
                    fastcgi_connect_timeout: 1,
                    fastcgi_hide_header: 1,
                    fastcgi_ignore_client_abort: 1,
                    fastcgi_ignore_headers: 1,
                    fastcgi_index: 1,
                    fastcgi_intercept_errors: 1,
                    fastcgi_max_temp_file_size: 1,
                    fastcgi_next_upstream: 1,
                    fastcgi_param: 1,
                    fastcgi_pass: 1,
                    fastcgi_pass_header: 1,
                    fastcgi_pass_request_body: 1,
                    fastcgi_pass_request_headers: 1,
                    fastcgi_read_timeout: 1,
                    fastcgi_send_lowat: 1,
                    fastcgi_send_timeout: 1,
                    fastcgi_split_path_info: 1,
                    fastcgi_store: 1,
                    fastcgi_store_access: 1,
                    fastcgi_temp_file_write_size: 1,
                    fastcgi_temp_path: 1,
                    fastcgi_upstream_fail_timeout: 1,
                    fastcgi_upstream_max_fails: 1,
                    flv: 1,
                    geo: 1,
                    geo: 1,
                    geoip_city: 1,
                    geoip_country: 1,
                    gzip: 1,
                    gzip_buffers: 1,
                    gzip_comp_level: 1,
                    gzip_disable: 1,
                    gzip_hash: 1,
                    gzip_http_version: 1,
                    gzip_min_length: 1,
                    gzip_no_buffer: 1,
                    gzip_proxied: 1,
                    gzip_static: 1,
                    gzip_types: 1,
                    gzip_vary: 1,
                    gzip_window: 1,
                    http: 1,
                    "if": 1,
                    if_modified_since: 1,
                    ignore_invalid_headers: 1,
                    image_filter: 1,
                    image_filter_buffer: 1,
                    image_filter_jpeg_quality: 1,
                    image_filter_transparency: 1,
                    include: 1,
                    index: 1,
                    internal: 1,
                    ip_hash: 1,
                    js: 1,
                    js_load: 1,
                    js_require: 1,
                    js_utf8: 1,
                    keepalive_requests: 1,
                    keepalive_timeout: 1,
                    kqueue_changes: 1,
                    kqueue_events: 1,
                    large_client_header_buffers: 1,
                    limit_conn: 1,
                    limit_conn_log_level: 1,
                    limit_except: 1,
                    limit_rate: 1,
                    limit_rate_after: 1,
                    limit_req: 1,
                    limit_req_log_level: 1,
                    limit_req_zone: 1,
                    limit_zone: 1,
                    lingering_time: 1,
                    lingering_timeout: 1,
                    listen: 1,
                    location: 1,
                    lock_file: 1,
                    log_format: 1,
                    log_not_found: 1,
                    log_subrequest: 1,
                    map: 1,
                    map_hash_bucket_size: 1,
                    map_hash_max_size: 1,
                    master_process: 1,
                    memcached_bind: 1,
                    memcached_buffer_size: 1,
                    memcached_connect_timeout: 1,
                    memcached_next_upstream: 1,
                    memcached_pass: 1,
                    memcached_read_timeout: 1,
                    memcached_send_timeout: 1,
                    memcached_upstream_fail_timeout: 1,
                    memcached_upstream_max_fails: 1,
                    merge_slashes: 1,
                    min_delete_depth: 1,
                    modern_browser: 1,
                    modern_browser: 1,
                    modern_browser_value: 1,
                    modern_browser_value: 1,
                    more_clear_headers: 1,
                    more_clear_input_headers: 1,
                    more_set_headers: 1,
                    more_set_input_headers: 1,
                    msie_padding: 1,
                    msie_refresh: 1,
                    multi_accept: 1,
                    open_file_cache: 1,
                    open_file_cache_errors: 1,
                    open_file_cache_events: 1,
                    open_file_cache_min_uses: 1,
                    open_file_cache_retest: 1,
                    open_file_cache_valid: 1,
                    open_log_file_cache: 1,
                    optimize_server_names: 1,
                    output_buffers: 1,
                    override_charset: 1,
                    override_charset: 1,
                    perl: 1,
                    perl_modules: 1,
                    perl_require: 1,
                    perl_set: 1,
                    pid: 1,
                    port_in_redirect: 1,
                    post_action: 1,
                    postpone_gzipping: 1,
                    postpone_output: 1,
                    proxy_bind: 1,
                    proxy_buffer_size: 1,
                    proxy_buffering: 1,
                    proxy_buffers: 1,
                    proxy_busy_buffers_size: 1,
                    proxy_cache: 1,
                    proxy_cache_key: 1,
                    proxy_cache_methods: 1,
                    proxy_cache_min_uses: 1,
                    proxy_cache_path: 1,
                    proxy_cache_use_stale: 1,
                    proxy_cache_valid: 1,
                    proxy_connect_timeout: 1,
                    proxy_headers_hash_bucket_size: 1,
                    proxy_headers_hash_max_size: 1,
                    proxy_hide_header: 1,
                    proxy_ignore_client_abort: 1,
                    proxy_ignore_headers: 1,
                    proxy_intercept_errors: 1,
                    proxy_max_temp_file_size: 1,
                    proxy_method: 1,
                    proxy_next_upstream: 1,
                    proxy_pass: 1,
                    proxy_pass_header: 1,
                    proxy_pass_request_body: 1,
                    proxy_pass_request_headers: 1,
                    proxy_read_timeout: 1,
                    proxy_redirect: 1,
                    proxy_send_lowat: 1,
                    proxy_send_timeout: 1,
                    proxy_set_body: 1,
                    proxy_set_header: 1,
                    proxy_store: 1,
                    proxy_store_access: 1,
                    proxy_temp_file_write_size: 1,
                    proxy_temp_path: 1,
                    proxy_upstream_fail_timeout: 1,
                    proxy_upstream_max_fails: 1,
                    push_authorized_channels_only: 1,
                    push_channel_group: 1,
                    push_max_channel_id_length: 1,
                    push_max_channel_subscribers: 1,
                    push_max_message_buffer_length: 1,
                    push_max_reserved_memory: 1,
                    push_message_buffer_length: 1,
                    push_message_timeout: 1,
                    push_min_message_buffer_length: 1,
                    push_min_message_recipients: 1,
                    push_publisher: 1,
                    push_store_messages: 1,
                    push_subscriber: 1,
                    push_subscriber_concurrency: 1,
                    random_index: 1,
                    read_ahead: 1,
                    real_ip_header: 1,
                    recursive_error_pages: 1,
                    request_pool_size: 1,
                    reset_timedout_connection: 1,
                    resolver: 1,
                    resolver_timeout: 1,
                    "return": 1,
                    rewrite: 1,
                    rewrite_log: 1,
                    root: 1,
                    satisfy: 1,
                    satisfy_any: 1,
                    send_lowat: 1,
                    send_timeout: 1,
                    sendfile: 1,
                    sendfile_max_chunk: 1,
                    server: 1,
                    server: 1,
                    server_name: 1,
                    server_name_in_redirect: 1,
                    server_names_hash_bucket_size: 1,
                    server_names_hash_max_size: 1,
                    server_tokens: 1,
                    set: 1,
                    set_real_ip_from: 1,
                    source_charset: 1,
                    source_charset: 1,
                    ssi: 1,
                    ssi_ignore_recycled_buffers: 1,
                    ssi_min_file_chunk: 1,
                    ssi_silent_errors: 1,
                    ssi_types: 1,
                    ssi_value_length: 1,
                    ssl: 1,
                    ssl_certificate: 1,
                    ssl_certificate_key: 1,
                    ssl_ciphers: 1,
                    ssl_client_certificate: 1,
                    ssl_crl: 1,
                    ssl_dhparam: 1,
                    ssl_prefer_server_ciphers: 1,
                    ssl_protocols: 1,
                    ssl_session_cache: 1,
                    ssl_session_timeout: 1,
                    ssl_verify_client: 1,
                    ssl_verify_depth: 1,
                    sub_filter: 1,
                    sub_filter_once: 1,
                    sub_filter_types: 1,
                    tcp_nodelay: 1,
                    tcp_nopush: 1,
                    timer_resolution: 1,
                    try_files: 1,
                    types: 1,
                    types_hash_bucket_size: 1,
                    types_hash_max_size: 1,
                    underscores_in_headers: 1,
                    uninitialized_variable_warn: 1,
                    upstream: 1,
                    use: 1,
                    user: 1,
                    userid: 1,
                    userid: 1,
                    userid_domain: 1,
                    userid_domain: 1,
                    userid_expires: 1,
                    userid_expires: 1,
                    userid_mark: 1,
                    userid_name: 1,
                    userid_name: 1,
                    userid_p3p: 1,
                    userid_p3p: 1,
                    userid_path: 1,
                    userid_path: 1,
                    userid_service: 1,
                    userid_service: 1,
                    valid_referers: 1,
                    variables_hash_bucket_size: 1,
                    variables_hash_max_size: 1,
                    worker_connections: 1,
                    worker_cpu_affinity: 1,
                    worker_priority: 1,
                    worker_processes: 1,
                    worker_rlimit_core: 1,
                    worker_rlimit_nofile: 1,
                    worker_rlimit_sigpending: 1,
                    working_directory: 1,
                    xml_entities: 1,
                    xslt_stylesheet: 1,
                    xslt_types: 1
                },
                r: 0,
                c: [hljs.HCM, {
                    b: "\\s",
                    e: "[;{]",
                    rB: true,
                    rE: true,
                    l: "[a-z/]+",
                    k: {
                        built_in: {
                            on: 1,
                            off: 1,
                            yes: 1,
                            no: 1,
                            "true": 1,
                            "false": 1,
                            none: 1,
                            blocked: 1,
                            debug: 1,
                            info: 1,
                            notice: 1,
                            warn: 1,
                            error: 1,
                            crit: 1,
                            select: 1,
                            permanent: 1,
                            redirect: 1,
                            kqueue: 1,
                            rtsig: 1,
                            epoll: 1,
                            poll: 1,
                            "/dev/poll": 1
                        }
                    },
                    c: [hljs.HCM, {
                        cN: "string",
                        b: '"',
                        e: '"',
                        c: [hljs.BE, c, b, a],
                        r: 0
                    }, {
                        cN: "string",
                        b: "'",
                        e: "'",
                        c: [hljs.BE, c, b, a],
                        r: 0
                    }, {
                        cN: "string",
                        b: "([a-z]+):/",
                        e: "[;\\s]",
                        rE: true
                    }, {
                        cN: "regexp",
                        b: "\\s\\^",
                        e: "\\s|{|;",
                        rE: true,
                        c: [hljs.BE, c, b, a]
                    }, {
                        cN: "regexp",
                        b: "~\\*?\\s+",
                        e: "\\s|{|;",
                        rE: true,
                        c: [hljs.BE, c, b, a]
                    }, {
                        cN: "regexp",
                        b: "\\*(\\.[a-z\\-]+)+",
                        c: [hljs.BE, c, b, a]
                    }, {
                        cN: "regexp",
                        b: "([a-z\\-]+\\.)+\\*",
                        c: [hljs.BE, c, b, a]
                    }, {
                        cN: "number",
                        b: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b"
                    }, {
                        cN: "number",
                        b: "\\s\\d+[kKmMgGdshdwy]*\\b",
                        r: 0
                    }, c, b, a]
                }]
            }]
        }
    }
}();
hljs.LANGUAGES.objectivec = function() {
    var a = {
        keyword: {
            "false": 1,
            "int": 1,
            "float": 1,
            "while": 1,
            "private": 1,
            "char": 1,
            "catch": 1,
            "export": 1,
            sizeof: 2,
            typedef: 2,
            "const": 1,
            struct: 1,
            "for": 1,
            union: 1,
            unsigned: 1,
            "long": 1,
            "volatile": 2,
            "static": 1,
            "protected": 1,
            bool: 1,
            mutable: 1,
            "if": 1,
            "public": 1,
            "do": 1,
            "return": 1,
            "goto": 1,
            "void": 2,
            "enum": 1,
            "else": 1,
            "break": 1,
            extern: 1,
            "true": 1,
            "class": 1,
            asm: 1,
            "case": 1,
            "short": 1,
            "default": 1,
            "double": 1,
            "throw": 1,
            register: 1,
            explicit: 1,
            signed: 1,
            typename: 1,
            "try": 1,
            "this": 1,
            "switch": 1,
            "continue": 1,
            wchar_t: 1,
            inline: 1,
            readonly: 1,
            assign: 1,
            property: 1,
            protocol: 10,
            self: 1,
            "synchronized": 1,
            end: 1,
            synthesize: 50,
            id: 1,
            optional: 1,
            required: 1,
            implementation: 10,
            nonatomic: 1,
            "interface": 1,
            "super": 1,
            unichar: 1,
            "finally": 2,
            dynamic: 2,
            nil: 1
        },
        built_in: {
            YES: 5,
            NO: 5,
            NULL: 1,
            IBOutlet: 50,
            IBAction: 50,
            NSString: 50,
            NSDictionary: 50,
            CGRect: 50,
            CGPoint: 50,
            NSRange: 50,
            release: 1,
            retain: 1,
            autorelease: 50,
            UIButton: 50,
            UILabel: 50,
            UITextView: 50,
            UIWebView: 50,
            MKMapView: 50,
            UISegmentedControl: 50,
            NSObject: 50,
            UITableViewDelegate: 50,
            UITableViewDataSource: 50,
            NSThread: 50,
            UIActivityIndicator: 50,
            UITabbar: 50,
            UIToolBar: 50,
            UIBarButtonItem: 50,
            UIImageView: 50,
            NSAutoreleasePool: 50,
            UITableView: 50,
            BOOL: 1,
            NSInteger: 20,
            CGFloat: 20,
            NSException: 50,
            NSLog: 50,
            NSMutableString: 50,
            NSMutableArray: 50,
            NSMutableDictionary: 50,
            NSURL: 50
        }
    };
    return {
        dM: {
            l: hljs.UIR,
            k: a,
            i: "</",
            c: [hljs.CLCM, hljs.CBLCLM, hljs.CNM, hljs.QSM, {
                cN: "string",
                b: "'",
                e: "[^\\\\]'",
                i: "[^\\\\][^']"
            }, {
                cN: "preprocessor",
                b: "#import",
                e: "$",
                c: [{
                    cN: "title",
                    b: '"',
                    e: '"'
                }, {
                    cN: "title",
                    b: "<",
                    e: ">"
                }]
            }, {
                cN: "preprocessor",
                b: "#",
                e: "$"
            }, {
                cN: "class",
                l: hljs.UIR,
                b: "interface|class|protocol|implementation",
                e: "({|$)",
                k: {
                    "interface": 1,
                    "class": 1,
                    protocol: 5,
                    implementation: 5
                },
                c: [{
                    cN: "id",
                    b: hljs.UIR
                }]
            }]
        }
    }
}();
hljs.LANGUAGES.parser3 = function() {
    var a = {
        b: "{",
        e: "}"
    };
    a.c = [a];
    return {
        dM: {
            sL: "html",
            c: [{
                cN: "comment",
                b: "^#",
                e: "$"
            }, {
                cN: "comment",
                c: [a],
                b: "\\^rem{",
                e: "}",
                r: 10
            }, {
                cN: "preprocessor",
                b: "^@(?:BASE|USE|CLASS|OPTIONS)$",
                r: 10
            }, {
                cN: "title",
                b: "@[\\w\\-]+\\[[\\w^;\\-]*\\](?:\\[[\\w^;\\-]*\\])?(?:.*)$"
            }, {
                cN: "variable",
                b: "\\$\\{?[\\w\\-\\.\\:]+\\}?"
            }, {
                cN: "keyword",
                b: "\\^[\\w\\-\\.\\:]+"
            }, {
                cN: "number",
                b: "\\^#[0-9a-fA-F]+"
            }, hljs.CNM]
        }
    }
}();
hljs.LANGUAGES.perl = function() {
    var d = {
        getpwent: 1,
        getservent: 1,
        quotemeta: 1,
        msgrcv: 1,
        scalar: 1,
        kill: 1,
        dbmclose: 1,
        undef: 1,
        lc: 1,
        ma: 1,
        syswrite: 1,
        tr: 1,
        send: 1,
        umask: 1,
        sysopen: 1,
        shmwrite: 1,
        vec: 1,
        qx: 1,
        utime: 1,
        local: 1,
        oct: 1,
        semctl: 1,
        localtime: 1,
        readpipe: 1,
        "do": 1,
        "return": 1,
        format: 1,
        read: 1,
        sprintf: 1,
        dbmopen: 1,
        pop: 1,
        getpgrp: 1,
        not: 1,
        getpwnam: 1,
        rewinddir: 1,
        qq: 1,
        fileno: 1,
        qw: 1,
        endprotoent: 1,
        wait: 1,
        sethostent: 1,
        bless: 1,
        s: 1,
        opendir: 1,
        "continue": 1,
        each: 1,
        sleep: 1,
        endgrent: 1,
        shutdown: 1,
        dump: 1,
        chomp: 1,
        connect: 1,
        getsockname: 1,
        die: 1,
        socketpair: 1,
        close: 1,
        flock: 1,
        exists: 1,
        index: 1,
        shmget: 1,
        sub: 1,
        "for": 1,
        endpwent: 1,
        redo: 1,
        lstat: 1,
        msgctl: 1,
        setpgrp: 1,
        abs: 1,
        exit: 1,
        select: 1,
        print: 1,
        ref: 1,
        gethostbyaddr: 1,
        unshift: 1,
        fcntl: 1,
        syscall: 1,
        "goto": 1,
        getnetbyaddr: 1,
        join: 1,
        gmtime: 1,
        symlink: 1,
        semget: 1,
        splice: 1,
        x: 1,
        getpeername: 1,
        recv: 1,
        log: 1,
        setsockopt: 1,
        cos: 1,
        last: 1,
        reverse: 1,
        gethostbyname: 1,
        getgrnam: 1,
        study: 1,
        formline: 1,
        endhostent: 1,
        times: 1,
        chop: 1,
        length: 1,
        gethostent: 1,
        getnetent: 1,
        pack: 1,
        getprotoent: 1,
        getservbyname: 1,
        rand: 1,
        mkdir: 1,
        pos: 1,
        chmod: 1,
        y: 1,
        substr: 1,
        endnetent: 1,
        printf: 1,
        next: 1,
        open: 1,
        msgsnd: 1,
        readdir: 1,
        use: 1,
        unlink: 1,
        getsockopt: 1,
        getpriority: 1,
        rindex: 1,
        wantarray: 1,
        hex: 1,
        system: 1,
        getservbyport: 1,
        endservent: 1,
        "int": 1,
        chr: 1,
        untie: 1,
        rmdir: 1,
        prototype: 1,
        tell: 1,
        listen: 1,
        fork: 1,
        shmread: 1,
        ucfirst: 1,
        setprotoent: 1,
        "else": 1,
        sysseek: 1,
        link: 1,
        getgrgid: 1,
        shmctl: 1,
        waitpid: 1,
        unpack: 1,
        getnetbyname: 1,
        reset: 1,
        chdir: 1,
        grep: 1,
        split: 1,
        require: 1,
        caller: 1,
        lcfirst: 1,
        until: 1,
        warn: 1,
        "while": 1,
        values: 1,
        shift: 1,
        telldir: 1,
        getpwuid: 1,
        my: 1,
        getprotobynumber: 1,
        "delete": 1,
        and: 1,
        sort: 1,
        uc: 1,
        defined: 1,
        srand: 1,
        accept: 1,
        "package": 1,
        seekdir: 1,
        getprotobyname: 1,
        semop: 1,
        our: 1,
        rename: 1,
        seek: 1,
        "if": 1,
        q: 1,
        chroot: 1,
        sysread: 1,
        setpwent: 1,
        no: 1,
        crypt: 1,
        getc: 1,
        chown: 1,
        sqrt: 1,
        write: 1,
        setnetent: 1,
        setpriority: 1,
        foreach: 1,
        tie: 1,
        sin: 1,
        msgget: 1,
        map: 1,
        stat: 1,
        getlogin: 1,
        unless: 1,
        elsif: 1,
        truncate: 1,
        exec: 1,
        keys: 1,
        glob: 1,
        tied: 1,
        closedir: 1,
        ioctl: 1,
        socket: 1,
        readlink: 1,
        "eval": 1,
        xor: 1,
        readline: 1,
        binmode: 1,
        setservent: 1,
        eof: 1,
        ord: 1,
        bind: 1,
        alarm: 1,
        pipe: 1,
        atan2: 1,
        getgrent: 1,
        exp: 1,
        time: 1,
        push: 1,
        setgrent: 1,
        gt: 1,
        lt: 1,
        or: 1,
        ne: 1,
        m: 1
    };
    var e = {
        cN: "subst",
        b: "[$@]\\{",
        e: "}",
        l: hljs.IR,
        k: d,
        r: 10
    };
    var c = {
        cN: "variable",
        b: "\\$\\d"
    };
    var b = {
        cN: "variable",
        b: "[\\$\\%\\@\\*](\\^\\w\\b|#\\w+(\\:\\:\\w+)*|[^\\s\\w{]|{\\w+}|\\w+(\\:\\:\\w*)*)"
    };
    var f = [hljs.BE, e, c, b];
    var a = [hljs.HCM, {
        cN: "comment",
        b: "^(__END__|__DATA__)",
        e: "\\n$",
        r: 5
    }, {
        cN: "string",
        b: "q[qwxr]?\\s*\\(",
        e: "\\)",
        c: f,
        r: 5
    }, {
        cN: "string",
        b: "q[qwxr]?\\s*\\[",
        e: "\\]",
        c: f,
        r: 5
    }, {
        cN: "string",
        b: "q[qwxr]?\\s*\\{",
        e: "\\}",
        c: f,
        r: 5
    }, {
        cN: "string",
        b: "q[qwxr]?\\s*\\|",
        e: "\\|",
        c: f,
        r: 5
    }, {
        cN: "string",
        b: "q[qwxr]?\\s*\\<",
        e: "\\>",
        c: f,
        r: 5
    }, {
        cN: "string",
        b: "qw\\s+q",
        e: "q",
        c: f,
        r: 5
    }, {
        cN: "string",
        b: "'",
        e: "'",
        c: [hljs.BE],
        r: 0
    }, {
        cN: "string",
        b: '"',
        e: '"',
        c: f,
        r: 0
    }, {
        cN: "string",
        b: "`",
        e: "`",
        c: [hljs.BE]
    }, {
        cN: "string",
        b: "{\\w+}",
        r: 0
    }, {
        cN: "string",
        b: "-?\\w+\\s*\\=\\>",
        r: 0
    }, {
        cN: "number",
        b: "(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",
        r: 0
    }, {
        cN: "regexp",
        b: "(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",
        r: 10
    }, {
        cN: "regexp",
        b: "(m|qr)?/",
        e: "/[a-z]*",
        c: [hljs.BE],
        r: 0
    }, {
        cN: "sub",
        b: "\\bsub\\b",
        e: "(\\s*\\(.*?\\))?[;{]",
        l: hljs.IR,
        k: {
            sub: 1
        },
        r: 5
    }, c, b, {
        cN: "operator",
        b: "-\\w\\b",
        r: 0
    }, {
        cN: "pod",
        b: "\\=\\w",
        e: "\\=cut"
    }];
    e.c = a;
    return {
        dM: {
            l: hljs.IR,
            k: d,
            c: a
        }
    }
}();
hljs.LANGUAGES.php = {
    cI: true,
    dM: {
        l: hljs.IR,
        k: {
            and: 1,
            include_once: 1,
            list: 1,
            "abstract": 1,
            global: 1,
            "private": 1,
            echo: 1,
            "interface": 1,
            as: 1,
            "static": 1,
            endswitch: 1,
            array: 1,
            "null": 1,
            "if": 1,
            endwhile: 1,
            or: 1,
            "const": 1,
            "for": 1,
            endforeach: 1,
            self: 1,
            "var": 1,
            "while": 1,
            isset: 1,
            "public": 1,
            "protected": 1,
            exit: 1,
            foreach: 1,
            "throw": 1,
            elseif: 1,
            "extends": 1,
            include: 1,
            __FILE__: 1,
            empty: 1,
            require_once: 1,
            "function": 1,
            "do": 1,
            xor: 1,
            "return": 1,
            "implements": 1,
            parent: 1,
            clone: 1,
            use: 1,
            __CLASS__: 1,
            __LINE__: 1,
            "else": 1,
            "break": 1,
            print: 1,
            "eval": 1,
            "new": 1,
            "catch": 1,
            __METHOD__: 1,
            "class": 1,
            "case": 1,
            exception: 1,
            php_user_filter: 1,
            "default": 1,
            die: 1,
            require: 1,
            __FUNCTION__: 1,
            enddeclare: 1,
            "final": 1,
            "try": 1,
            "this": 1,
            "switch": 1,
            "continue": 1,
            endfor: 1,
            endif: 1,
            declare: 1,
            unset: 1,
            "true": 1,
            "false": 1,
            namespace: 1
        },
        c: [hljs.CLCM, hljs.HCM, {
            cN: "comment",
            b: "/\\*",
            e: "\\*/",
            c: [{
                cN: "phpdoc",
                b: "\\s@[A-Za-z]+",
                r: 10
            }]
        }, hljs.CNM, hljs.inherit(hljs.ASM, {
            i: null
        }), hljs.inherit(hljs.QSM, {
            i: null
        }), {
            cN: "variable",
            b: "\\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*"
        }, {
            cN: "preprocessor",
            b: "<\\?php",
            r: 10
        }, {
            cN: "preprocessor",
            b: "\\?>"
        }]
    }
};
hljs.LANGUAGES.profile = {
    dM: {
        l: hljs.UIR,
        c: [hljs.CNM, {
            cN: "builtin",
            b: "{",
            e: "}$",
            eB: true,
            eE: true,
            c: [hljs.ASM, hljs.QSM],
            r: 0
        }, {
            cN: "filename",
            b: "(/w|[a-zA-Z_][\da-zA-Z_]+\\.[\da-zA-Z_]{1,3})",
            e: ":",
            eE: true
        }, {
            cN: "header",
            b: "(ncalls|tottime|cumtime)",
            e: "$",
            l: hljs.IR,
            k: {
                ncalls: 1,
                tottime: 10,
                cumtime: 10,
                filename: 1
            },
            r: 10
        }, {
            cN: "summary",
            b: "function calls",
            e: "$",
            c: [hljs.CNM],
            r: 10
        }, hljs.ASM, hljs.QSM, {
            cN: "function",
            b: "\\(",
            e: "\\)$",
            c: [{
                cN: "title",
                b: hljs.UIR,
                r: 0
            }],
            r: 0
        }]
    }
};
hljs.LANGUAGES.python = function() {
    var c = {
        cN: "string",
        b: "u?r?'''",
        e: "'''",
        r: 10
    };
    var b = {
        cN: "string",
        b: 'u?r?"""',
        e: '"""',
        r: 10
    };
    var a = {
        cN: "string",
        b: "(u|r|ur)'",
        e: "'",
        c: [hljs.BE],
        r: 10
    };
    var f = {
        cN: "string",
        b: '(u|r|ur)"',
        e: '"',
        c: [hljs.BE],
        r: 10
    };
    var e = {
        cN: "title",
        b: hljs.UIR
    };
    var d = {
        cN: "params",
        b: "\\(",
        e: "\\)",
        c: [c, b, a, f, hljs.ASM, hljs.QSM]
    };
    return {
        dM: {
            l: hljs.UIR,
            k: {
                keyword: {
                    and: 1,
                    elif: 1,
                    is: 1,
                    global: 1,
                    as: 1,
                    "in": 1,
                    "if": 1,
                    from: 1,
                    raise: 1,
                    "for": 1,
                    except: 1,
                    "finally": 1,
                    print: 1,
                    "import": 1,
                    pass: 1,
                    "return": 1,
                    exec: 1,
                    "else": 1,
                    "break": 1,
                    not: 1,
                    "with": 1,
                    "class": 1,
                    assert: 1,
                    yield: 1,
                    "try": 1,
                    "while": 1,
                    "continue": 1,
                    del: 1,
                    or: 1,
                    def: 1,
                    lambda: 1,
                    nonlocal: 10
                },
                built_in: {
                    None: 1,
                    True: 1,
                    False: 1,
                    Ellipsis: 1,
                    NotImplemented: 1
                }
            },
            i: "(</|->|\\?)",
            c: [hljs.HCM, c, b, a, f, hljs.ASM, hljs.QSM, {
                cN: "function",
                l: hljs.UIR,
                b: "\\bdef ",
                e: ":",
                i: "$",
                k: {
                    def: 1
                },
                c: [e, d],
                r: 10
            }, {
                cN: "class",
                l: hljs.UIR,
                b: "\\bclass ",
                e: ":",
                i: "[${]",
                k: {
                    "class": 1
                },
                c: [e, d],
                r: 10
            }, hljs.CNM, {
                cN: "decorator",
                b: "@",
                e: "$"
            }]
        }
    }
}();
hljs.LANGUAGES.rib = {
    dM: {
        l: hljs.UIR,
        k: {
            keyword: {
                ArchiveRecord: 1,
                AreaLightSource: 1,
                Atmosphere: 1,
                Attribute: 1,
                AttributeBegin: 1,
                AttributeEnd: 1,
                Basis: 1,
                Begin: 1,
                Blobby: 1,
                Bound: 1,
                Clipping: 1,
                ClippingPlane: 1,
                Color: 1,
                ColorSamples: 1,
                ConcatTransform: 1,
                Cone: 1,
                CoordinateSystem: 1,
                CoordSysTransform: 1,
                CropWindow: 1,
                Curves: 1,
                Cylinder: 1,
                DepthOfField: 1,
                Detail: 1,
                DetailRange: 1,
                Disk: 1,
                Displacement: 1,
                Display: 1,
                End: 1,
                ErrorHandler: 1,
                Exposure: 1,
                Exterior: 1,
                Format: 1,
                FrameAspectRatio: 1,
                FrameBegin: 1,
                FrameEnd: 1,
                GeneralPolygon: 1,
                GeometricApproximation: 1,
                Geometry: 1,
                Hider: 1,
                Hyperboloid: 1,
                Identity: 1,
                Illuminate: 1,
                Imager: 1,
                Interior: 1,
                LightSource: 1,
                MakeCubeFaceEnvironment: 1,
                MakeLatLongEnvironment: 1,
                MakeShadow: 1,
                MakeTexture: 1,
                Matte: 1,
                MotionBegin: 1,
                MotionEnd: 1,
                NuPatch: 1,
                ObjectBegin: 1,
                ObjectEnd: 1,
                ObjectInstance: 1,
                Opacity: 1,
                Option: 1,
                Orientation: 1,
                Paraboloid: 1,
                Patch: 1,
                PatchMesh: 1,
                Perspective: 1,
                PixelFilter: 1,
                PixelSamples: 1,
                PixelVariance: 1,
                Points: 1,
                PointsGeneralPolygons: 1,
                PointsPolygons: 1,
                Polygon: 1,
                Procedural: 1,
                Projection: 1,
                Quantize: 1,
                ReadArchive: 1,
                RelativeDetail: 1,
                ReverseOrientation: 1,
                Rotate: 1,
                Scale: 1,
                ScreenWindow: 1,
                ShadingInterpolation: 1,
                ShadingRate: 1,
                Shutter: 1,
                Sides: 1,
                Skew: 1,
                SolidBegin: 1,
                SolidEnd: 1,
                Sphere: 1,
                SubdivisionMesh: 1,
                Surface: 1,
                TextureCoordinates: 1,
                Torus: 1,
                Transform: 1,
                TransformBegin: 1,
                TransformEnd: 1,
                TransformPoints: 1,
                Translate: 1,
                TrimCurve: 1,
                WorldBegin: 1,
                WorldEnd: 1
            }
        },
        i: "</",
        c: [hljs.HCM, hljs.CNM, hljs.ASM, hljs.QSM]
    }
};
hljs.LANGUAGES.rsl = {
    dM: {
        l: hljs.UIR,
        k: {
            keyword: {
                "float": 1,
                color: 1,
                point: 1,
                normal: 1,
                vector: 1,
                matrix: 1,
                "while": 1,
                "for": 1,
                "if": 1,
                "do": 1,
                "return": 1,
                "else": 1,
                "break": 1,
                extern: 1,
                "continue": 1
            },
            built_in: {
                abs: 1,
                acos: 1,
                ambient: 1,
                area: 1,
                asin: 1,
                atan: 1,
                atmosphere: 1,
                attribute: 1,
                calculatenormal: 1,
                ceil: 1,
                cellnoise: 1,
                clamp: 1,
                comp: 1,
                concat: 1,
                cos: 1,
                degrees: 1,
                depth: 1,
                Deriv: 1,
                diffuse: 1,
                distance: 1,
                Du: 1,
                Dv: 1,
                environment: 1,
                exp: 1,
                faceforward: 1,
                filterstep: 1,
                floor: 1,
                format: 1,
                fresnel: 1,
                incident: 1,
                length: 1,
                lightsource: 1,
                log: 1,
                match: 1,
                max: 1,
                min: 1,
                mod: 1,
                noise: 1,
                normalize: 1,
                ntransform: 1,
                opposite: 1,
                option: 1,
                phong: 1,
                pnoise: 1,
                pow: 1,
                printf: 1,
                ptlined: 1,
                radians: 1,
                random: 1,
                reflect: 1,
                refract: 1,
                renderinfo: 1,
                round: 1,
                setcomp: 1,
                setxcomp: 1,
                setycomp: 1,
                setzcomp: 1,
                shadow: 1,
                sign: 1,
                sin: 1,
                smoothstep: 1,
                specular: 1,
                specularbrdf: 1,
                spline: 1,
                sqrt: 1,
                step: 1,
                tan: 1,
                texture: 1,
                textureinfo: 1,
                trace: 1,
                transform: 1,
                vtransform: 1,
                xcomp: 1,
                ycomp: 1,
                zcomp: 1
            }
        },
        i: "</",
        c: [hljs.CLCM, hljs.CBLCLM, hljs.QSM, hljs.ASM, hljs.CNM, {
            cN: "preprocessor",
            b: "#",
            e: "$"
        }, {
            cN: "shader",
            b: "surface |displacement |light |volume |imager ",
            e: "\\(",
            l: hljs.IR,
            k: {
                surface: 1,
                displacement: 1,
                light: 1,
                volume: 1,
                imager: 1
            }
        }, {
            cN: "shading",
            b: "illuminate|illuminance|gather",
            e: "\\(",
            l: hljs.IR,
            k: {
                illuminate: 1,
                illuminance: 1,
                gather: 1
            }
        }]
    }
};
hljs.LANGUAGES.ruby = function() {
    var g = "[a-zA-Z_][a-zA-Z0-9_]*(\\!|\\?)?";
    var a = "[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?";
    var v = {
        keyword: {
            and: 1,
            "false": 1,
            then: 1,
            defined: 1,
            module: 1,
            "in": 1,
            "return": 1,
            redo: 1,
            "if": 1,
            BEGIN: 1,
            retry: 1,
            end: 1,
            "for": 1,
            "true": 1,
            self: 1,
            when: 1,
            next: 1,
            until: 1,
            "do": 1,
            begin: 1,
            unless: 1,
            END: 1,
            rescue: 1,
            nil: 1,
            "else": 1,
            "break": 1,
            undef: 1,
            not: 1,
            "super": 1,
            "class": 1,
            "case": 1,
            require: 1,
            yield: 1,
            alias: 1,
            "while": 1,
            ensure: 1,
            elsif: 1,
            or: 1,
            def: 1
        },
        keymethods: {
            __id__: 1,
            __send__: 1,
            abort: 1,
            abs: 1,
            "all?": 1,
            allocate: 1,
            ancestors: 1,
            "any?": 1,
            arity: 1,
            assoc: 1,
            at: 1,
            at_exit: 1,
            autoload: 1,
            "autoload?": 1,
            "between?": 1,
            binding: 1,
            binmode: 1,
            "block_given?": 1,
            call: 1,
            callcc: 1,
            caller: 1,
            capitalize: 1,
            "capitalize!": 1,
            casecmp: 1,
            "catch": 1,
            ceil: 1,
            center: 1,
            chomp: 1,
            "chomp!": 1,
            chop: 1,
            "chop!": 1,
            chr: 1,
            "class": 1,
            class_eval: 1,
            "class_variable_defined?": 1,
            class_variables: 1,
            clear: 1,
            clone: 1,
            close: 1,
            close_read: 1,
            close_write: 1,
            "closed?": 1,
            coerce: 1,
            collect: 1,
            "collect!": 1,
            compact: 1,
            "compact!": 1,
            concat: 1,
            "const_defined?": 1,
            const_get: 1,
            const_missing: 1,
            const_set: 1,
            constants: 1,
            count: 1,
            crypt: 1,
            "default": 1,
            default_proc: 1,
            "delete": 1,
            "delete!": 1,
            delete_at: 1,
            delete_if: 1,
            detect: 1,
            display: 1,
            div: 1,
            divmod: 1,
            downcase: 1,
            "downcase!": 1,
            downto: 1,
            dump: 1,
            dup: 1,
            each: 1,
            each_byte: 1,
            each_index: 1,
            each_key: 1,
            each_line: 1,
            each_pair: 1,
            each_value: 1,
            each_with_index: 1,
            "empty?": 1,
            entries: 1,
            eof: 1,
            "eof?": 1,
            "eql?": 1,
            "equal?": 1,
            "eval": 1,
            exec: 1,
            exit: 1,
            "exit!": 1,
            extend: 1,
            fail: 1,
            fcntl: 1,
            fetch: 1,
            fileno: 1,
            fill: 1,
            find: 1,
            find_all: 1,
            first: 1,
            flatten: 1,
            "flatten!": 1,
            floor: 1,
            flush: 1,
            for_fd: 1,
            foreach: 1,
            fork: 1,
            format: 1,
            freeze: 1,
            "frozen?": 1,
            fsync: 1,
            getc: 1,
            gets: 1,
            global_variables: 1,
            grep: 1,
            gsub: 1,
            "gsub!": 1,
            "has_key?": 1,
            "has_value?": 1,
            hash: 1,
            hex: 1,
            id: 1,
            include: 1,
            "include?": 1,
            included_modules: 1,
            index: 1,
            indexes: 1,
            indices: 1,
            induced_from: 1,
            inject: 1,
            insert: 1,
            inspect: 1,
            instance_eval: 1,
            instance_method: 1,
            instance_methods: 1,
            "instance_of?": 1,
            "instance_variable_defined?": 1,
            instance_variable_get: 1,
            instance_variable_set: 1,
            instance_variables: 1,
            "integer?": 1,
            intern: 1,
            invert: 1,
            ioctl: 1,
            "is_a?": 1,
            isatty: 1,
            "iterator?": 1,
            join: 1,
            "key?": 1,
            keys: 1,
            "kind_of?": 1,
            lambda: 1,
            last: 1,
            length: 1,
            lineno: 1,
            ljust: 1,
            load: 1,
            local_variables: 1,
            loop: 1,
            lstrip: 1,
            "lstrip!": 1,
            map: 1,
            "map!": 1,
            match: 1,
            max: 1,
            "member?": 1,
            merge: 1,
            "merge!": 1,
            method: 1,
            "method_defined?": 1,
            method_missing: 1,
            methods: 1,
            min: 1,
            module_eval: 1,
            modulo: 1,
            name: 1,
            nesting: 1,
            "new": 1,
            next: 1,
            "next!": 1,
            "nil?": 1,
            nitems: 1,
            "nonzero?": 1,
            object_id: 1,
            oct: 1,
            open: 1,
            pack: 1,
            partition: 1,
            pid: 1,
            pipe: 1,
            pop: 1,
            popen: 1,
            pos: 1,
            prec: 1,
            prec_f: 1,
            prec_i: 1,
            print: 1,
            printf: 1,
            private_class_method: 1,
            private_instance_methods: 1,
            "private_method_defined?": 1,
            private_methods: 1,
            proc: 1,
            protected_instance_methods: 1,
            "protected_method_defined?": 1,
            protected_methods: 1,
            public_class_method: 1,
            public_instance_methods: 1,
            "public_method_defined?": 1,
            public_methods: 1,
            push: 1,
            putc: 1,
            puts: 1,
            quo: 1,
            raise: 1,
            rand: 1,
            rassoc: 1,
            read: 1,
            read_nonblock: 1,
            readchar: 1,
            readline: 1,
            readlines: 1,
            readpartial: 1,
            rehash: 1,
            reject: 1,
            "reject!": 1,
            remainder: 1,
            reopen: 1,
            replace: 1,
            require: 1,
            "respond_to?": 1,
            reverse: 1,
            "reverse!": 1,
            reverse_each: 1,
            rewind: 1,
            rindex: 1,
            rjust: 1,
            round: 1,
            rstrip: 1,
            "rstrip!": 1,
            scan: 1,
            seek: 1,
            select: 1,
            send: 1,
            set_trace_func: 1,
            shift: 1,
            singleton_method_added: 1,
            singleton_methods: 1,
            size: 1,
            sleep: 1,
            slice: 1,
            "slice!": 1,
            sort: 1,
            "sort!": 1,
            sort_by: 1,
            split: 1,
            sprintf: 1,
            squeeze: 1,
            "squeeze!": 1,
            srand: 1,
            stat: 1,
            step: 1,
            store: 1,
            strip: 1,
            "strip!": 1,
            sub: 1,
            "sub!": 1,
            succ: 1,
            "succ!": 1,
            sum: 1,
            superclass: 1,
            swapcase: 1,
            "swapcase!": 1,
            sync: 1,
            syscall: 1,
            sysopen: 1,
            sysread: 1,
            sysseek: 1,
            system: 1,
            syswrite: 1,
            taint: 1,
            "tainted?": 1,
            tell: 1,
            test: 1,
            "throw": 1,
            times: 1,
            to_a: 1,
            to_ary: 1,
            to_f: 1,
            to_hash: 1,
            to_i: 1,
            to_int: 1,
            to_io: 1,
            to_proc: 1,
            to_s: 1,
            to_str: 1,
            to_sym: 1,
            tr: 1,
            "tr!": 1,
            tr_s: 1,
            "tr_s!": 1,
            trace_var: 1,
            transpose: 1,
            trap: 1,
            truncate: 1,
            "tty?": 1,
            type: 1,
            ungetc: 1,
            uniq: 1,
            "uniq!": 1,
            unpack: 1,
            unshift: 1,
            untaint: 1,
            untrace_var: 1,
            upcase: 1,
            "upcase!": 1,
            update: 1,
            upto: 1,
            "value?": 1,
            values: 1,
            values_at: 1,
            warn: 1,
            write: 1,
            write_nonblock: 1,
            "zero?": 1,
            zip: 1
        }
    };
    var h = {
        cN: "yardoctag",
        b: "@[A-Za-z]+"
    };
    var d = {
        cN: "comment",
        b: "#",
        e: "$",
        c: [h]
    };
    var c = {
        cN: "comment",
        b: "^\\=begin",
        e: "^\\=end",
        c: [h],
        r: 10
    };
    var b = {
        cN: "comment",
        b: "^__END__",
        e: "\\n$"
    };
    var t = {
        cN: "subst",
        b: "#\\{",
        e: "}",
        l: g,
        k: v
    };
    var u = [hljs.BE, t];
    var r = {
        cN: "string",
        b: "'",
        e: "'",
        c: u,
        r: 0
    };
    var q = {
        cN: "string",
        b: '"',
        e: '"',
        c: u,
        r: 0
    };
    var p = {
        cN: "string",
        b: "%[qw]?\\(",
        e: "\\)",
        c: u,
        r: 10
    };
    var o = {
        cN: "string",
        b: "%[qw]?\\[",
        e: "\\]",
        c: u,
        r: 10
    };
    var n = {
        cN: "string",
        b: "%[qw]?{",
        e: "}",
        c: u,
        r: 10
    };
    var m = {
        cN: "string",
        b: "%[qw]?<",
        e: ">",
        c: u,
        r: 10
    };
    var l = {
        cN: "string",
        b: "%[qw]?/",
        e: "/",
        c: u,
        r: 10
    };
    var k = {
        cN: "string",
        b: "%[qw]?%",
        e: "%",
        c: u,
        r: 10
    };
    var i = {
        cN: "string",
        b: "%[qw]?-",
        e: "-",
        c: u,
        r: 10
    };
    var s = {
        cN: "string",
        b: "%[qw]?\\|",
        e: "\\|",
        c: u,
        r: 10
    };
    var f = {
        cN: "function",
        b: "\\bdef\\s+",
        e: " |$|;",
        l: g,
        k: v,
        c: [{
            cN: "title",
            b: a,
            l: g,
            k: v
        }, {
            cN: "params",
            b: "\\(",
            e: "\\)",
            l: g,
            k: v,
        }, d, c, b]
    };
    var e = {
        cN: "identifier",
        b: g,
        l: g,
        k: v,
        r: 0
    };
    var j = [d, c, b, r, q, p, o, n, m, l, k, i, s, {
        cN: "class",
        b: "\\b(class|module)\\b",
        e: "$|;",
        l: hljs.UIR,
        k: {
            "class": 1,
            module: 1
        },
        c: [{
            cN: "title",
            b: "[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?",
            r: 0
        }, {
            cN: "inheritance",
            b: "<\\s*",
            c: [{
                cN: "parent",
                b: "(" + hljs.IR + "::)?" + hljs.IR
            }]
        }, d, c, b]
    }, f, {
        cN: "constant",
        b: "(::)?([A-Z]\\w*(::)?)+",
        r: 0
    }, {
        cN: "symbol",
        b: ":",
        c: [r, q, p, o, n, m, l, k, i, s, e]
    }, {
        cN: "number",
        b: "(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",
        r: 0
    }, {
        cN: "number",
        b: "\\?\\w"
    }, {
        cN: "variable",
        b: "(\\$\\W)|((\\$|\\@\\@?)(\\w+))"
    }, e, {
        b: "(" + hljs.RSR + ")\\s*",
        c: [d, c, b, {
            cN: "regexp",
            b: "/",
            e: "/[a-z]*",
            i: "\\n",
            c: [hljs.BE]
        }],
        r: 0
    }];
    t.c = j;
    f.c[1].c = j;
    return {
        dM: {
            l: g,
            k: v,
            c: j
        }
    }
}();
hljs.LANGUAGES.scala = function() {
    var b = {
        cN: "annotation",
        b: "@[A-Za-z]+"
    };
    var a = {
        cN: "string",
        b: 'u?r?"""',
        e: '"""',
        r: 10
    };
    return {
        dM: {
            l: hljs.UIR,
            k: {
                type: 1,
                yield: 1,
                lazy: 1,
                override: 1,
                def: 1,
                "with": 1,
                val: 1,
                "var": 1,
                "false": 1,
                "true": 1,
                sealed: 1,
                "abstract": 1,
                "private": 1,
                trait: 1,
                object: 1,
                "null": 1,
                "if": 1,
                "for": 1,
                "while": 1,
                "throw": 1,
                "finally": 1,
                "protected": 1,
                "extends": 1,
                "import": 1,
                "final": 1,
                "return": 1,
                "else": 1,
                "break": 1,
                "new": 1,
                "catch": 1,
                "super": 1,
                "class": 1,
                "case": 1,
                "package": 1,
                "default": 1,
                "try": 1,
                "this": 1,
                match: 1,
                "continue": 1,
                "throws": 1
            },
            c: [{
                cN: "javadoc",
                b: "/\\*\\*",
                e: "\\*/",
                c: [{
                    cN: "javadoctag",
                    b: "@[A-Za-z]+"
                }],
                r: 10
            }, hljs.CLCM, hljs.CBLCLM, hljs.ASM, hljs.QSM, a, {
                cN: "class",
                b: "((case )?class |object |trait )",
                e: "({|$)",
                i: ":",
                l: hljs.UIR,
                k: {
                    "case": 1,
                    "class": 1,
                    trait: 1,
                    object: 1
                },
                c: [{
                    b: "(extends|with)",
                    l: hljs.IR,
                    k: {
                        "extends": 1,
                        "with": 1
                    },
                    r: 10
                }, {
                    cN: "title",
                    b: hljs.UIR
                }, {
                    cN: "params",
                    b: "\\(",
                    e: "\\)",
                    c: [hljs.ASM, hljs.QSM, a, b]
                }]
            }, hljs.CNM, b]
        }
    }
}();
hljs.LANGUAGES.smalltalk = function() {
    var a = "[a-z][a-zA-Z0-9_]*";
    var c = {
        cN: "char",
        b: "\\$.{1}"
    };
    var b = {
        cN: "symbol",
        b: "#" + hljs.UIR
    };
    return {
        dM: {
            l: hljs.UIR,
            k: {
                self: 1,
                "super": 1,
                nil: 1,
                "true": 1,
                "false": 1,
                thisContext: 1
            },
            c: [{
                cN: "comment",
                b: '"',
                e: '"',
                r: 0
            }, hljs.ASM, {
                cN: "class",
                b: "\\b[A-Z][A-Za-z0-9_]*",
                r: 0
            }, {
                cN: "method",
                b: a + ":"
            }, hljs.CNM, b, c, {
                cN: "localvars",
                b: "\\|\\s*((" + a + ")\\s*)+\\|",
                r: 10
            }, {
                cN: "array",
                b: "\\#\\(",
                e: "\\)",
                c: [hljs.ASM, c, hljs.CNM, b]
            }]
        }
    }
}();
hljs.LANGUAGES.sql = {
    cI: true,
    dM: {
        i: "[^\\s]",
        c: [{
            cN: "operator",
            b: "(begin|start|commit|rollback|savepoint|lock|alter|create|drop|rename|call|delete|do|handler|insert|load|replace|select|truncate|update|set|show|pragma)\\b",
            e: ";|$",
            l: "[a-zA-Z][a-zA-Z0-9_\\.]*",
            k: {
                keyword: {
                    all: 1,
                    partial: 1,
                    global: 1,
                    month: 1,
                    current_timestamp: 1,
                    using: 1,
                    go: 1,
                    revoke: 1,
                    smallint: 1,
                    indicator: 1,
                    "end-exec": 1,
                    disconnect: 1,
                    zone: 1,
                    "with": 1,
                    character: 1,
                    assertion: 1,
                    to: 1,
                    add: 1,
                    current_user: 1,
                    usage: 1,
                    input: 1,
                    local: 1,
                    alter: 1,
                    match: 1,
                    collate: 1,
                    real: 1,
                    then: 1,
                    rollback: 1,
                    get: 1,
                    read: 1,
                    timestamp: 1,
                    session_user: 1,
                    not: 1,
                    integer: 1,
                    bit: 1,
                    unique: 1,
                    day: 1,
                    minute: 1,
                    desc: 1,
                    insert: 1,
                    execute: 1,
                    like: 1,
                    ilike: 2,
                    level: 1,
                    decimal: 1,
                    drop: 1,
                    "continue": 1,
                    isolation: 1,
                    found: 1,
                    where: 1,
                    constraints: 1,
                    domain: 1,
                    right: 1,
                    national: 1,
                    some: 1,
                    module: 1,
                    transaction: 1,
                    relative: 1,
                    second: 1,
                    connect: 1,
                    escape: 1,
                    close: 1,
                    system_user: 1,
                    "for": 1,
                    deferred: 1,
                    section: 1,
                    cast: 1,
                    current: 1,
                    sqlstate: 1,
                    allocate: 1,
                    intersect: 1,
                    deallocate: 1,
                    numeric: 1,
                    "public": 1,
                    preserve: 1,
                    full: 1,
                    "goto": 1,
                    initially: 1,
                    asc: 1,
                    no: 1,
                    key: 1,
                    output: 1,
                    collation: 1,
                    group: 1,
                    by: 1,
                    union: 1,
                    session: 1,
                    both: 1,
                    last: 1,
                    language: 1,
                    constraint: 1,
                    column: 1,
                    of: 1,
                    space: 1,
                    foreign: 1,
                    deferrable: 1,
                    prior: 1,
                    connection: 1,
                    unknown: 1,
                    action: 1,
                    commit: 1,
                    view: 1,
                    or: 1,
                    first: 1,
                    into: 1,
                    "float": 1,
                    year: 1,
                    primary: 1,
                    cascaded: 1,
                    except: 1,
                    restrict: 1,
                    set: 1,
                    references: 1,
                    names: 1,
                    table: 1,
                    outer: 1,
                    open: 1,
                    select: 1,
                    size: 1,
                    are: 1,
                    rows: 1,
                    from: 1,
                    prepare: 1,
                    distinct: 1,
                    leading: 1,
                    create: 1,
                    only: 1,
                    next: 1,
                    inner: 1,
                    authorization: 1,
                    schema: 1,
                    corresponding: 1,
                    option: 1,
                    declare: 1,
                    precision: 1,
                    immediate: 1,
                    "else": 1,
                    timezone_minute: 1,
                    external: 1,
                    varying: 1,
                    translation: 1,
                    "true": 1,
                    "case": 1,
                    exception: 1,
                    join: 1,
                    hour: 1,
                    "default": 1,
                    "double": 1,
                    scroll: 1,
                    value: 1,
                    cursor: 1,
                    descriptor: 1,
                    values: 1,
                    dec: 1,
                    fetch: 1,
                    procedure: 1,
                    "delete": 1,
                    and: 1,
                    "false": 1,
                    "int": 1,
                    is: 1,
                    describe: 1,
                    "char": 1,
                    as: 1,
                    at: 1,
                    "in": 1,
                    varchar: 1,
                    "null": 1,
                    trailing: 1,
                    any: 1,
                    absolute: 1,
                    current_time: 1,
                    end: 1,
                    grant: 1,
                    privileges: 1,
                    when: 1,
                    cross: 1,
                    check: 1,
                    write: 1,
                    current_date: 1,
                    pad: 1,
                    begin: 1,
                    temporary: 1,
                    exec: 1,
                    time: 1,
                    update: 1,
                    catalog: 1,
                    user: 1,
                    sql: 1,
                    date: 1,
                    on: 1,
                    identity: 1,
                    timezone_hour: 1,
                    natural: 1,
                    whenever: 1,
                    interval: 1,
                    work: 1,
                    order: 1,
                    cascade: 1,
                    diagnostics: 1,
                    nchar: 1,
                    having: 1,
                    left: 1,
                    call: 1,
                    "do": 1,
                    handler: 1,
                    load: 1,
                    replace: 1,
                    truncate: 1,
                    start: 1,
                    lock: 1,
                    show: 1,
                    pragma: 1
                },
                aggregate: {
                    count: 1,
                    sum: 1,
                    min: 1,
                    max: 1,
                    avg: 1
                }
            },
            c: [{
                cN: "string",
                b: "'",
                e: "'",
                c: [hljs.BE, {
                    b: "''"
                }],
                r: 0
            }, {
                cN: "string",
                b: '"',
                e: '"',
                c: [hljs.BE, {
                    b: '""'
                }],
                r: 0
            }, {
                cN: "string",
                b: "`",
                e: "`",
                c: [hljs.BE]
            }, hljs.CNM, {
                b: "\\n"
            }]
        }, hljs.CBLCLM, {
            cN: "comment",
            b: "--",
            e: "$"
        }]
    }
};
hljs.LANGUAGES.tex = function() {
    var c = {
        cN: "command",
        b: "\\\\[a-zA-Zа-яА-я]+[\\*]?",
        r: 10
    };
    var b = {
        cN: "command",
        b: "\\\\[^a-zA-Zа-яА-я0-9]",
        r: 0
    };
    var a = {
        cN: "special",
        b: "[{}\\[\\]\\&#~]",
        r: 0
    };
    return {
        dM: {
            c: [{
                b: "\\\\[a-zA-Zа-яА-я]+[\\*]? *= *-?\\d*\\.?\\d+(pt|pc|mm|cm|in|dd|cc|ex|em)?",
                rB: true,
                c: [c, b, {
                    cN: "number",
                    b: " *=",
                    e: "-?\\d*\\.?\\d+(pt|pc|mm|cm|in|dd|cc|ex|em)?",
                    eB: true
                }],
                r: 10
            }, c, b, a, {
                cN: "formula",
                b: "\\$\\$",
                e: "\\$\\$",
                c: [c, b, a],
                r: 0
            }, {
                cN: "formula",
                b: "\\$",
                e: "\\$",
                c: [c, b, a],
                r: 0
            }, {
                cN: "comment",
                b: "%",
                e: "$",
                r: 0
            }]
        }
    }
}();
hljs.LANGUAGES.vala = {
    dM: {
        l: [hljs.UIR],
        k: {
            keyword: {
                "char": 1,
                uchar: 1,
                unichar: 1,
                "int": 1,
                uint: 1,
                "long": 1,
                ulong: 1,
                "short": 1,
                ushort: 1,
                int8: 1,
                int16: 1,
                int32: 1,
                int64: 1,
                uint8: 1,
                uint16: 1,
                uint32: 1,
                uint64: 1,
                "float": 1,
                "double": 1,
                bool: 1,
                struct: 1,
                "enum": 1,
                string: 1,
                "void": 1,
                weak: 5,
                unowned: 5,
                owned: 5,
                async: 5,
                signal: 5,
                "static": 1,
                "abstract": 1,
                "interface": 1,
                override: 1,
                "while": 1,
                "do": 1,
                "for": 1,
                foreach: 1,
                "else": 1,
                "switch": 1,
                "case": 1,
                "break": 1,
                "default": 1,
                "return": 1,
                "try": 1,
                "catch": 1,
                "public": 1,
                "private": 1,
                "protected": 1,
                internal: 1,
                using: 1,
                "new": 1,
                "this": 1,
                get: 1,
                set: 1,
                "const": 1,
                stdout: 1,
                stdin: 1,
                stderr: 1,
                "var": 1,
                DBus: 2,
                GLib: 2,
                CCode: 10,
                Gee: 10,
                Object: 1
            },
            literal: {
                "false": 1,
                "true": 1,
                "null": 1
            }
        },
        c: [{
            cN: "class",
            l: hljs.UIR,
            b: "(class |interface |delegate |namespace )",
            e: "{",
            k: {
                "class": 1,
                "interface": 1
            },
            c: [{
                b: "(implements|extends)",
                e: hljs.IMMEDIATE_RE,
                l: hljs.IR,
                k: {
                    "extends": 1,
                    "implements": 1
                },
                r: 1
            }, {
                cN: "title",
                b: hljs.UIR,
                e: hljs.IMMEDIATE_RE
            }]
        }, hljs.CLCM, hljs.CBLCLM, {
            cN: "string",
            b: '"""',
            e: '"""',
            r: 5
        }, hljs.ASM, hljs.QSM, hljs.CNM, {
            cN: "preprocessor",
            b: "^#",
            e: "$",
            r: 2
        }, {
            cN: "constant",
            b: " [A-Z_]+ ",
            e: hljs.IMMEDIATE_RE,
            r: 0
        }]
    }
};
hljs.LANGUAGES.vbscript = {
    cI: true,
    dM: {
        l: hljs.IR,
        k: {
            keyword: {
                call: 1,
                "class": 1,
                "const": 1,
                dim: 1,
                "do": 1,
                loop: 1,
                erase: 1,
                execute: 1,
                executeglobal: 1,
                exit: 1,
                "for": 1,
                each: 1,
                next: 1,
                "function": 1,
                "if": 1,
                then: 1,
                "else": 1,
                on: 1,
                error: 1,
                option: 1,
                explicit: 1,
                "new": 1,
                "private": 1,
                property: 1,
                let: 1,
                get: 1,
                "public": 1,
                randomize: 1,
                redim: 1,
                rem: 1,
                select: 1,
                "case": 1,
                set: 1,
                stop: 1,
                sub: 1,
                "while": 1,
                wend: 1,
                "with": 1,
                end: 1,
                to: 1,
                elseif: 1,
                is: 1,
                or: 1,
                xor: 1,
                and: 1,
                not: 1,
                class_initialize: 1,
                class_terminate: 1,
                "default": 1,
                preserve: 1,
                "in": 1,
                me: 1,
                byval: 1,
                byref: 1,
                step: 1,
                resume: 1,
                "goto": 1
            },
            built_in: {
                lcase: 1,
                month: 1,
                vartype: 1,
                instrrev: 1,
                ubound: 1,
                setlocale: 1,
                getobject: 1,
                rgb: 1,
                getref: 1,
                string: 1,
                weekdayname: 1,
                rnd: 1,
                dateadd: 1,
                monthname: 1,
                now: 1,
                day: 1,
                minute: 1,
                isarray: 1,
                cbool: 1,
                round: 1,
                formatcurrency: 1,
                conversions: 1,
                csng: 1,
                timevalue: 1,
                second: 1,
                year: 1,
                space: 1,
                abs: 1,
                clng: 1,
                timeserial: 1,
                fixs: 1,
                len: 1,
                asc: 1,
                isempty: 1,
                maths: 1,
                dateserial: 1,
                atn: 1,
                timer: 1,
                isobject: 1,
                filter: 1,
                weekday: 1,
                datevalue: 1,
                ccur: 1,
                isdate: 1,
                instr: 1,
                datediff: 1,
                formatdatetime: 1,
                replace: 1,
                isnull: 1,
                right: 1,
                sgn: 1,
                array: 1,
                snumeric: 1,
                log: 1,
                cdbl: 1,
                hex: 1,
                chr: 1,
                lbound: 1,
                msgbox: 1,
                ucase: 1,
                getlocale: 1,
                cos: 1,
                cdate: 1,
                cbyte: 1,
                rtrim: 1,
                join: 1,
                hour: 1,
                oct: 1,
                typename: 1,
                trim: 1,
                strcomp: 1,
                "int": 1,
                createobject: 1,
                loadpicture: 1,
                tan: 1,
                formatnumber: 1,
                mid: 1,
                scriptenginebuildversion: 1,
                scriptengine: 1,
                split: 1,
                scriptengineminorversion: 1,
                cint: 1,
                sin: 1,
                datepart: 1,
                ltrim: 1,
                sqr: 1,
                scriptenginemajorversion: 1,
                time: 1,
                derived: 1,
                "eval": 1,
                date: 1,
                formatpercent: 1,
                exp: 1,
                inputbox: 1,
                left: 1,
                ascw: 1,
                chrw: 1,
                regexp: 1,
                server: 1,
                response: 1,
                request: 1,
                cstr: 1,
                err: 1
            },
            literal: {
                "true": 1,
                "false": 1,
                "null": 1,
                nothing: 1,
                empty: 1
            }
        },
        c: [{
            cN: "string",
            b: '"',
            e: '"',
            i: "\\n",
            c: [{
                b: '""'
            }],
            r: 0
        }, {
            cN: "comment",
            b: "'",
            e: "$"
        }, hljs.CNM]
    }
};
hljs.LANGUAGES.vhdl = {
    cI: true,
    dM: {
        l: hljs.IR,
        k: {
            keyword: {
                abs: 1,
                access: 1,
                after: 1,
                alias: 1,
                all: 1,
                and: 1,
                architecture: 2,
                array: 1,
                assert: 1,
                attribute: 1,
                begin: 1,
                block: 1,
                body: 1,
                buffer: 1,
                bus: 1,
                "case": 1,
                component: 2,
                configuration: 1,
                constant: 1,
                disconnect: 2,
                downto: 2,
                "else": 1,
                elsif: 1,
                end: 1,
                entity: 2,
                exit: 1,
                file: 1,
                "for": 1,
                "function": 1,
                generate: 2,
                generic: 2,
                group: 1,
                guarded: 2,
                "if": 0,
                impure: 2,
                "in": 1,
                inertial: 1,
                inout: 1,
                is: 1,
                label: 1,
                library: 1,
                linkage: 1,
                literal: 1,
                loop: 1,
                map: 1,
                mod: 1,
                nand: 1,
                "new": 1,
                next: 1,
                nor: 1,
                not: 1,
                "null": 1,
                of: 1,
                on: 1,
                open: 1,
                or: 1,
                others: 1,
                out: 1,
                "package": 1,
                port: 2,
                postponed: 1,
                procedure: 1,
                process: 1,
                pure: 2,
                range: 1,
                record: 1,
                register: 1,
                reject: 1,
                "return": 1,
                rol: 1,
                ror: 1,
                select: 1,
                severity: 1,
                signal: 1,
                shared: 1,
                sla: 1,
                sli: 1,
                sra: 1,
                srl: 1,
                subtype: 2,
                then: 1,
                to: 1,
                transport: 1,
                type: 1,
                units: 1,
                until: 1,
                use: 1,
                variable: 1,
                wait: 1,
                when: 1,
                "while": 1,
                "with": 1,
                xnor: 1,
                xor: 1
            },
            type: {
                "boolean": 1,
                bit: 1,
                character: 1,
                severity_level: 2,
                integer: 1,
                time: 1,
                delay_length: 2,
                natural: 1,
                positive: 1,
                string: 1,
                bit_vector: 2,
                file_open_kind: 2,
                file_open_status: 2,
                std_ulogic: 2,
                std_ulogic_vector: 2,
                std_logic: 2,
                std_logic_vector: 2
            }
        },
        c: [{
            cN: "comment",
            b: "--",
            e: "$"
        }, hljs.QSM, hljs.CNM, {
            cN: "literal",
            b: "'(U|X|0|1|Z|W|L|H|-)",
            e: "'",
            c: [hljs.BE],
            r: 5
        }]
    }
};

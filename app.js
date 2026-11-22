var view = "all", fits = [], cur = 0, builtFor = "";
var platforms = ["SHEIN", "Shopee", "TikTok"];
var audiences = ["Women", "Men", "Kids", "Plus Size"];
var groups = [
    { n: "Clothing", c: ["Tops", "Bottoms", "Co-ords", "Dresses", "Outerwear", "Activewear", "Sleepwear", "Swimwear"] },
    { n: "Footwear", c: ["Shoes"] },
    { n: "Bags", c: ["Handbags", "Backpacks", "Wallets", "Purses"] },
    { n: "Accessories", c: ["Jewelry", "Watches", "Belts", "Sunglasses", "Hats", "Scarves", "Gloves"] },
    { n: "Other Garments & Hair", c: ["Socks & Intimates", "Hair & Wigs"] },
    { n: "Beauty", c: ["Makeup"] }
];
// ===== Search, filters & main render =====
var st = { s: "all", a: "all", g: "all", c: "all" };
var hadQ = false, showF = false, showI = false;
function norm(t) { return String(t).toLowerCase().replace(/gray/g, "grey").replace(/[’']/g, "").replace(/[-_\/,]/g, " "); }
items.forEach(function (it) { it.h = norm([it.n, it.b, it.s, it.a, it.g, it.c, it.d, it.kw].concat(variantText(it)).join(" ")); });
function has(key, val) { return items.some(function (it) { return [].concat(it[key]).indexOf(val) > -1; }); }
function chip(label, on, none, fn, extra) { var b = document.createElement("button"); b.type = "button"; b.className = "chip" + (on ? " on" : "") + (none ? " none" : "") + (extra ? " " + extra : ""); b.textContent = label; b.setAttribute("aria-pressed", on ? "true" : "false"); b.addEventListener("click", fn); return b; }
function go() { document.getElementById("q").value = ""; render(); }
function fill(id, list, key, labelFn) {
    var el = document.getElementById(id);
    el.innerHTML = "";
    list.forEach(function (v) { el.appendChild(chip(v, st[key] === v && !qv(), !has(key, v), function () { view = "all"; st[key] = (st[key] === v ? "all" : v); if (key === "g")
        st.c = "all"; go(); })); });
}
function qv() { return document.getElementById("q").value.trim(); }
function render() {
    var q = qv(), tokens = norm(q).split(/\s+/).filter(Boolean);
    if (q)
        view = "all";
    if (q && !hadQ) {
        showF = false;
        showI = false;
        document.getElementById("q").scrollIntoView({ block: "start" });
    }
    hadQ = !!q;
    var all = view === "all" && st.s === "all" && st.a === "all" && st.g === "all" && st.c === "all" && !q;
    var top = document.getElementById("top");
    top.innerHTML = "";
    top.appendChild(chip("All products", all, false, function () { view = "all"; st = { s: "all", a: "all", g: "all", c: "all" }; go(); }));
    top.appendChild(chip("School fits", view === "school" && !q, false, function () { view = "school"; st = { s: "all", a: "all", g: "all", c: "all" }; go(); }, "fits half"));
    top.appendChild(chip("OOTD Inspo", view === "y2k" && !q, false, function () { view = "y2k"; st = { s: "all", a: "all", g: "all", c: "all" }; go(); }, "fits half"));
    likedChip = chip(likedLabel(), view === "liked" && !q, false, function () { view = "liked"; go(); }, "fits half");
    top.appendChild(likedChip);
    var fa = st.s !== "all" || st.a !== "all" || st.g !== "all" || st.c !== "all";
    top.appendChild(chip("Filters" + (fa ? " •" : "") + (showF ? " ▲" : " ▼"), showF, false, function () { showF = !showF; render(); }, "tog"));
    top.appendChild(chip("Ideas" + (showI ? " ▲" : " ▼"), showI, false, function () { showI = !showI; render(); }, "tog"));
    document.getElementById("panel").hidden = !showF;
    document.getElementById("hints").hidden = !showI;
    fill("plat", platforms, "s");
    fill("aud", audiences, "a");
    fill("grp", groups.map(function (g) { return g.n; }), "g");
    var sw = document.getElementById("subs");
    sw.innerHTML = "";
    var grp = groups.filter(function (g) { return g.n === st.g; })[0];
    if (!q && grp && grp.c.length > 1) {
        sw.appendChild(chip("All " + grp.n, st.c === "all", false, function () { st.c = "all"; go(); }));
        grp.c.forEach(function (c) { sw.appendChild(chip(c, st.c === c, !has("c", c), function () { st.c = (st.c === c ? "all" : c); go(); })); });
    }
    var nm = /^#?(\d+)$/.exec(q), nl = nm ? looks.filter(function (l) { return l.n === +nm[1]; }) : null;
    var list = items.filter(function (it) {
        if (nl) {
            return nl.some(function (l) { return l.k.indexOf(it.k) > -1; });
        }
        if (tokens.length) {
            return tokens.every(function (t) { return it.h.indexOf(t) > -1; });
        }
        return (st.s === "all" || it.s === st.s) && (st.a === "all" || [].concat(it.a).indexOf(st.a) > -1) && (st.g === "all" || it.g === st.g) && (st.c === "all" || it.c === st.c);
    });
    var g = document.getElementById("grid");
    g.innerHTML = "";
    list.forEach(function (it) { g.appendChild(card(it)); });
    document.getElementById("count").textContent = list.length + (list.length === 1 ? " product" : " products");
    var e = document.getElementById("empty");
    e.hidden = list.length > 0;
    e.textContent = q ? "No matches. Try another word." : "No products here yet. Check back soon!";
    var inF = view === "school" || view === "y2k", inS = view === "sim", hd = inF || inS || view === "liked";
    document.getElementById("count").hidden = hd;
    g.hidden = hd;
    if (hd)
        e.hidden = true;
    buildHints();
    if (renderLookRes(q, tokens))
        e.hidden = true;
    renderSim(inS);
    renderLiked(view === "liked");
    renderBuilder(view === "all" && !q);
    renderFits();
}
// ===== School fits / OOTD carousel =====
var SCHOOL_NOTE = "School fits follow common school dress codes: covered shoulders, no crop tops, closed toes, and skirts or shorts that reach the knee. White options available.";
var jump = -1, sim = null, looks = [];
// ===== Look tags & style vocabulary (used for "More like this") =====
var LOOK_TAGS = {
    "bt1-top": { n: 1, tg: ["minimalist", "clean girl", "burgundy", "denim", "korean"], a: ["minimalist", "casual", "korean", "streetwear", "clean girl", "soft girl"], c: ["red", "burgundy", "maroon", "wine", "black", "pink", "blush"], x: ["cotton", "jersey", "stretchy", "solid", "plain", "denim", "washed", "suede"] },
    "bt2-top": { n: 2, tg: ["y2k", "grunge", "grey", "graphic print", "distressed"], a: ["y2k", "grunge", "streetwear", "vintage", "alt", "baggy"], c: ["grey", "silver", "black", "white", "charcoal", "monochrome"], x: ["distressed", "faded", "washed", "denim", "metallic", "graphic print", "halftone", "cat print", "whiskering"] },
    "bt3-top": { n: 5, tg: ["y2k", "british", "grunge", "flag print", "distressed"], a: ["y2k", "grunge", "streetwear", "vintage", "punk", "british", "indie sleaze", "americana", "off shoulder"], c: ["navy", "red", "white", "black", "blue", "pink"], x: ["distressed", "graphic print", "flag print", "washed", "faded", "denim"] },
    "bt4-top": { n: 3, tg: ["coquette", "grunge", "bow print", "light blue", "y2k"], a: ["y2k", "grunge", "coquette", "streetwear", "casual", "gothic", "soft grunge", "bow", "dark feminine"], c: ["black", "grey", "charcoal", "light blue", "sky blue", "silver"], x: ["faded", "washed", "stonewashed", "denim", "graphic print", "bow print", "key print", "whiskering"] },
    "bt5-top": { n: 4, tg: ["kawaii", "y2k", "pink", "satin", "sporty"], a: ["y2k", "cute", "kawaii", "sporty", "soft girl", "athleisure", "girly", "pink aesthetic", "lounge"], c: ["pink", "light pink", "baby pink", "white", "black"], x: ["satin", "silky", "parachute", "graphic print", "stripe", "side stripe", "drawstring", "cotton", "jersey"] }
};
var VOC = {
    ae: [["y2k", /y2k/, "y2k"], ["korean", /korea/, "k fashion"], ["minimalist", /minimal|basic|simple|solid/, "minimal clean"], ["streetwear", /streetwear|hip ?hop|swagger|baggy|oversized/, "street"], ["grunge", /grunge|goth|punk|distress/, "alt"], ["coquette", /\bbow\b|ribbon|coquette|\blace\b/, "girly feminine"], ["preppy", /varsity|preppy|plaid|pleat|polo/, "school"], ["sporty", /sport|athletic|jogger|sweatpant|running|training|activewear|runner/, "athleisure"], ["cute", /cute|kitty|sweet|kawaii/, "kawaii"], ["vintage", /vintage|retro/, "retro"], ["elegant", /elegant|evening|formal|gown|luxury|goddess/, "dressy classy"], ["beachy", /beach|vacation|summer|swim/, "resort"], ["party", /party|prom|cocktail|club/, "night out"], ["casual", /casual|everyday|basic/, "everyday"]],
    cl: [["red", /\bred\b|maroon|burgundy|wine|cherry|scarlet/, ""], ["pink", /pink|blush|\brose\b|fuchsia|magenta/, ""], ["orange", /orange|coral|peach|\brust\b|terracotta/, ""], ["yellow", /yellow|mustard|lemon|butter/, ""], ["green", /green|olive|sage|mint|emerald|khaki/, ""], ["blue", /\bblue\b|\bsky\b|cobalt|royal/, ""], ["navy", /navy/, ""], ["purple", /purple|lilac|lavender|violet|mauve/, ""], ["brown", /brown|chocolate|mocha|coffee|camel|\btan\b/, ""], ["beige", /beige|nude|cream|champagne|\bsand\b|ivory|khaki/, ""], ["white", /white|ivory/, ""], ["black", /black/, ""], ["grey", /grey|charcoal|silver|slate|rain cloud/, ""], ["silver", /silver|metallic/, ""], ["gold", /gold|champagne/, ""], ["multicolor", /multi|rainbow|colorful|tie dye/, ""]],
    tx: [["denim", /denim|jeans|maong/, "jeans"], ["satin", /satin|silk/, "silky"], ["lace", /\blace\b/, ""], ["knit", /knit|\brib\b|ribbed|crochet|cable/, "ribbed knitted"], ["mesh", /mesh|sheer|tulle/, "sheer"], ["leather", /leather|\bpu\b|suede/, "faux leather suede"], ["fuzzy", /fleece|fuzzy|plush|\bfur\b|teddy/, "fleece furry"], ["velvet", /velvet|velour/, ""], ["cotton", /cotton|jersey/, "jersey"], ["sparkle", /sequin|glitter|rhinestone|sparkle|shimmer|metallic/, "sequin glitter shimmer"], ["distressed", /faded|wash|distress|whisker|ripped/, "washed faded"], ["ruffle", /ruffle|tiered|frill/, "frilly"], ["stripe", /stripe/, "striped"], ["plaid", /plaid|\bcheck(ed)?\b|gingham/, "checkered"], ["floral", /floral|flower/, "flowers"], ["polka dot", /\bdots?\b|polka/, "dotted"], ["animal print", /leopard|zebra|snake|animal|cow print/, "leopard"], ["graphic print", /graphic|print|logo|slogan|letter/, "graphic printed"], ["solid", /solid|plain|basic/, "plain"], ["stretchy", /stretch|spandex|elastic/, "stretch"]]
};
function tagsFor(t, l) { return l.filter(function (v) { return v[1].test(t); }); }
Object.keys(sets).forEach(function (k) { sets[k].forEach(function (f, i) { var tg = LOOK_TAGS[f.k[0]] || {}; f.set = k; f.i = i; f.tg = tg.tg || []; f.n = tg.n; f.ae = tg.a || []; f.cl = tg.c || []; f.tx = tg.x || []; f.h = norm([k === "school" ? "school fits" : "ootd inspo", f.t].concat(f.ae, f.cl, f.tx).join(" ")); looks.push(f); }); });
items.forEach(function (it) {
    var t = norm([it.n, it.d, it.kw, it.c].concat(variantText(it)).join(" ")), x = [];
    var A = tagsFor(t, VOC.ae), C = tagsFor(t, VOC.cl), T = tagsFor(t, VOC.tx);
    it.ae = A.map(function (v) { return v[0]; });
    it.cl = C.map(function (v) { return v[0]; });
    it.tx = T.map(function (v) { return v[0]; });
    A.concat(C, T).forEach(function (v) { x.push(v[0], v[2]); });
    looks.forEach(function (l) { if (l.k.indexOf(it.k) > -1)
        l.ae.forEach(function (a) { if (it.ae.indexOf(a) < 0)
            it.ae.push(a); x.push(a); }); });
    it.h = norm([it.n, it.b, it.s, it.a, it.g, it.c, it.d, it.kw].concat(x, variantText(it)).join(" "));
});
function ov(a, b) { return a.filter(function (x) { return b.indexOf(x) > -1; }).length; }
function pick(arr, sc, min, n) { return arr.map(function (o) { return { o: o, s: sc(o) }; }).filter(function (r) { return r.s >= min; }).sort(function (a, b) { return b.s - a.s; }).slice(0, n).map(function (r) { return r.o; }); }
// ===== Search hint chips & hashtags =====
var HINTS = ["y2k", "coquette", "grunge", "streetwear", "kawaii", "minimalist", "pink", "black", "grey", "denim", "satin", "graphic print", "stripe", "knit"];
function buildHints() {
    var el = document.getElementById("hints");
    el.innerHTML = "";
    var cur = norm(qv());
    HINTS.forEach(function (t) {
        var n = norm(t);
        if (!items.some(function (it) { return it.h.indexOf(n) > -1; }) && !looks.some(function (l) { return l.h.indexOf(n) > -1; }))
            return;
        el.appendChild(chip(t, cur === n, false, function () { document.getElementById("q").value = t; showI = false; render(); }, "hint"));
    });
}
function tagGo(t) { document.getElementById("q").value = t; showF = false; showI = false; sim = null; view = "all"; render(); document.getElementById("q").scrollIntoView({ block: "start" }); }
function tagList(l) { return (l.n ? ["#" + l.n] : []).concat(l.tg || []); }
function tagBtn(t) { var b = document.createElement("button"); b.type = "button"; var isN = t.charAt(0) === "#"; b.className = isN ? "n" : ""; b.textContent = isN ? t : "#" + t.replace(/\s+/g, ""); b.setAttribute("aria-label", "Search " + t); b.addEventListener("click", function () { tagGo(t); }); return b; }
function tagRow(l) { var d = document.createElement("div"); d.className = "ltags"; tagList(l).forEach(function (t) { d.appendChild(tagBtn(t)); }); return d; }
// ===== Outfit builder =====
var SLOTS = { top: { l: "Top", n: "tops", c: ["Tops"], p: "50% 22%", h: "t" }, bottom: { l: "Bottom", n: "bottoms", c: ["Bottoms"], p: "50% 60%", h: "t" }, shoe: { l: "Shoes", n: "shoes", c: ["Shoes"], p: "50% 95%", h: "s" }, dress: { l: "Dress", n: "dresses", c: ["Dresses"], p: "50% 30%", h: "t" }, coord: { l: "Terno", m: "Terno (matching set)", n: "matching sets", c: ["Co-ords"], p: "50% 40%", h: "t" }, active: { l: "Activewear", n: "activewear", c: ["Activewear"], p: "50% 40%", h: "t" }, sleep: { l: "Sleepwear", n: "sleepwear", c: ["Sleepwear"], p: "50% 40%", h: "t" }, swim: { l: "Swimwear", n: "swimwear", c: ["Swimwear"], p: "50% 40%", h: "t" }, layer: { l: "Outerwear", n: "outerwear", c: ["Outerwear"], p: "50% 30%", h: "t" }, belt: { l: "Belt", n: "belts", c: ["Belts"], p: "50% 50%", h: "s" }, handbag: { l: "Handbag", n: "handbags", c: ["Handbags"], p: "50% 50%", h: "s" }, backpack: { l: "Backpack", n: "backpacks", c: ["Backpacks"], p: "50% 50%", h: "s" }, wallet: { l: "Wallet", n: "wallets", c: ["Wallets"], p: "50% 50%", h: "s" }, purse: { l: "Purse", n: "purses", c: ["Purses"], p: "50% 50%", h: "s" }, hat: { l: "Hat", n: "hats", c: ["Hats"], p: "50% 15%", h: "s" }, sunglasses: { l: "Sunglasses", n: "sunglasses", c: ["Sunglasses"], p: "50% 20%", h: "s" }, jewelry: { l: "Jewelry", n: "jewelry", c: ["Jewelry"], p: "50% 30%", h: "s" }, watch: { l: "Watch", n: "watches", c: ["Watches"], p: "50% 50%", h: "s" }, scarf: { l: "Scarf", n: "scarves", c: ["Scarves"], p: "50% 30%", h: "s" }, gloves: { l: "Gloves", n: "gloves", c: ["Gloves"], p: "50% 50%", h: "s" }, wig: { l: "Wig", n: "wigs", c: ["Hair & Wigs"], f: function (it) { return /wig/i.test(it.n); }, p: "50% 15%", h: "t" }, hair: { l: "Hair accessories", m: "Hair accessories", n: "hair pieces", c: ["Hair & Wigs"], f: function (it) { return !/wig/i.test(it.n); }, p: "50% 15%", h: "t" }, socks: { l: "Socks", n: "socks", c: ["Socks & Intimates"], p: "50% 80%", h: "s" } }, bBase = ["wig", "hair", "layer", "top", "coord", "dress", "active", "sleep", "swim", "bottom", "socks", "shoe"], bExtra = ["wig", "hair", "hat", "sunglasses", "scarf", "jewelry", "layer", "top", "coord", "dress", "active", "sleep", "swim", "belt", "bottom", "handbag", "backpack", "wallet", "purse", "gloves", "watch", "socks", "shoe"], bOn = [], bIdx = {}, bBuilt = false, bRowsDone = false, favs = {}, likedChip = null;
try {
    favs = JSON.parse(localStorage.getItem("vf_favs") || "{}") || {};
}
catch (e) {
    favs = {};
}
function saveFavs() { try {
    localStorage.setItem("vf_favs", JSON.stringify(favs));
}
catch (e) { } }
function paintHeart(b, on) { b.textContent = on ? "♥" : "♡"; b.setAttribute("aria-pressed", on ? "true" : "false"); b.setAttribute("aria-label", on ? "Remove from liked" : "Like this product"); }
function likedLabel() { var n = likedCount(); return "♥ Liked (" + n + ")"; }
function likedCount() { return Object.keys(favs).length; }
function heartBtn(it) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "heart";
    b.setAttribute("data-k", it.k);
    paintHeart(b, !!favs[it.k]);
    b.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (favs[it.k])
            delete favs[it.k];
        else
            favs[it.k] = 1;
        saveFavs();
        var hs = document.querySelectorAll(".heart");
        for (var i = 0; i < hs.length; i++)
            paintHeart(hs[i], !!favs[hs[i].getAttribute("data-k")]);
        if (likedChip)
            likedChip.textContent = likedLabel();
        if (view === "liked")
            renderLiked(true);
    });
    return b;
}
function renderLiked(on) {
    document.getElementById("likedSec").hidden = !on;
    if (!on)
        return;
    var G = document.getElementById("likedGrid");
    G.innerHTML = "";
    var l = items.filter(function (it) { return favs[it.k]; });
    l.forEach(function (it) { G.appendChild(card(it)); });
    document.getElementById("likedEmpty").hidden = l.length > 0;
}
function slotItems(sl) { var S = SLOTS[sl]; return items.filter(function (it) { return S.c.indexOf(it.c) > -1 && (!S.f || S.f(it)) && (it.s !== "SHEIN" || it.ob); }); }
var MENU_POP = ["hair", "hat", "top", "bottom", "shoe"], ACCS = ["wig", "hair", "hat", "sunglasses", "scarf", "jewelry", "belt", "handbag", "backpack", "wallet", "purse", "gloves", "watch"];
function isLand() { return !!(window.matchMedia && window.matchMedia("(orientation:landscape)").matches); }
function buildMenu() {
    var M = document.getElementById("bMenu");
    M.innerHTML = "";
    function row(sl) {
        var S = SLOTS[sl], n = slotItems(sl).length, lab = document.createElement("label");
        lab.className = "tgl" + (n ? "" : " off");
        var t = document.createElement("span");
        t.textContent = (S.m || S.l) + (n ? "" : " · soon");
        lab.appendChild(t);
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.setAttribute("role", "switch");
        cb.checked = bOn.indexOf(sl) > -1;
        cb.disabled = !n;
        cb.addEventListener("change", function () { if (cb.checked) {
            if (bOn.indexOf(sl) < 0)
                bOn.push(sl);
        }
        else
            bOn = bOn.filter(function (q) { return q !== sl; }); bOn.sort(function (p, q) { return bExtra.indexOf(p) - bExtra.indexOf(q); }); buildRows(); });
        lab.appendChild(cb);
        lab.appendChild(document.createElement("i"));
        return lab;
    }
    function head(t) { var p = document.createElement("p"); p.className = "mh"; p.textContent = t; M.appendChild(p); }
    head("Popular");
    MENU_POP.forEach(function (sl) { M.appendChild(row(sl)); });
    head("More");
    bExtra.filter(function (x) { return MENU_POP.indexOf(x) < 0; }).forEach(function (sl) { M.appendChild(row(sl)); });
}
function buildRows() {
    var R = document.getElementById("bRows"), AL = document.getElementById("bAccL"), AR = document.getElementById("bAccR");
    R.innerHTML = "";
    AL.innerHTML = "";
    AR.innerHTML = "";
    var land = isLand(), ai = 0;
    bOn.forEach(function (sl) {
        var S = SLOTS[sl], its = slotItems(sl), isAcc = ACCS.indexOf(sl) > -1, w = document.createElement("div");
        w.className = "win " + S.h + (isAcc ? " acc" : "");
        var pill = document.createElement("span");
        pill.className = "pill";
        w.appendChild(pill);
        if (!its.length) {
            var m = document.createElement("div");
            m.className = "wmsg";
            m.textContent = "No " + S.n + " yet. Check back soon!";
            w.appendChild(m);
            pill.textContent = S.l;
        }
        else {
            var im = document.createElement("img");
            im.decoding = "async";
            w.appendChild(im);
            var sh = document.createElement("a");
            sh.className = "wshop";
            sh.target = "_blank";
            sh.rel = "noopener sponsored";
            sh.textContent = "Shop";
            w.appendChild(sh);
            var hb = null;
            var cd = null;
            function show() {
                var i = (((bIdx[sl] || 0) % its.length) + its.length) % its.length;
                bIdx[sl] = i;
                var it = its[i], opts = colorOpts(it), ci = Math.min(bCol[it.k] || 0, opts.length - 1), o = opts[ci];
                im.src = o.img;
                im.alt = o.n;
                pill.textContent = S.l + " " + (i + 1) + "/" + its.length;
                sh.href = o.u;
                sh.setAttribute("aria-label", "Shop " + o.n);
                if (hb)
                    w.removeChild(hb);
                hb = heartBtn(it);
                w.appendChild(hb);
                if (cd) {
                    w.removeChild(cd);
                    cd = null;
                }
                if (opts.length > 1) {
                    cd = document.createElement("div");
                    cd.className = "wdots";
                    cd.setAttribute("role", "group");
                    cd.setAttribute("aria-label", "Colors");
                    opts.forEach(function (op, k) {
                        var b = document.createElement("button");
                        b.type = "button";
                        b.className = "cdot" + (k === ci ? " on" : "");
                        b.style.background = op.ch;
                        b.setAttribute("aria-label", op.cn);
                        b.setAttribute("aria-pressed", k === ci ? "true" : "false");
                        b.addEventListener("click", function (e) { e.stopPropagation(); bCol[it.k] = k; show(); });
                        cd.appendChild(b);
                    });
                    w.appendChild(cd);
                }
            }
            function step(d) { bIdx[sl] = (bIdx[sl] || 0) + d; show(); }
            if (its.length > 1) {
                var L = document.createElement("button");
                L.type = "button";
                L.className = "arr l";
                L.textContent = "‹";
                L.setAttribute("aria-label", "Previous " + S.l);
                L.addEventListener("click", function () { step(-1); });
                var Rr = document.createElement("button");
                Rr.type = "button";
                Rr.className = "arr r";
                Rr.textContent = "›";
                Rr.setAttribute("aria-label", "Next " + S.l);
                Rr.addEventListener("click", function () { step(1); });
                w.appendChild(L);
                w.appendChild(Rr);
                var sx = 0;
                w.addEventListener("pointerdown", function (e) { sx = e.clientX; });
                w.addEventListener("pointerup", function (e) { var dx = e.clientX - sx; if (Math.abs(dx) > 40)
                    step(dx < 0 ? 1 : -1); });
            }
            show();
        }
        var x = document.createElement("button");
        x.type = "button";
        x.className = "wx";
        x.textContent = "×";
        x.setAttribute("aria-label", "Remove " + S.l);
        x.addEventListener("click", function (e) { e.stopPropagation(); bOn = bOn.filter(function (q) { return q !== sl; }); buildRows(); buildMenu(); });
        w.appendChild(x);
        (land && isAcc ? (ai++ % 2 === 0 ? AL : AR) : R).appendChild(w);
    });
    if (!bOn.length) {
        var em = document.createElement("div");
        em.className = "oempty";
        em.innerHTML = "<b>Your outfit is empty</b><br>Tap the + to switch on pieces, or tap 🎲 to get a matching outfit.";
        R.appendChild(em);
    }
}
function waitImg(im) { return new Promise(function (res) { if (im.complete && im.naturalWidth) {
    res();
    return;
} im.addEventListener("load", function () { res(); }); im.addEventListener("error", function () { res(); }); setTimeout(res, 3500); }); }
function openOutfit() {
    var pg = document.getElementById("outfitPage"), ld = document.getElementById("oLoad"), mn = document.getElementById("oMain"), fl = document.getElementById("oFill");
    pg.hidden = false;
    document.body.style.overflow = "hidden";
    mn.hidden = true;
    ld.hidden = false;
    ld.className = "oload";
    fl.className = "";
    void fl.offsetWidth;
    fl.className = "go";
    if (!bRowsDone) {
        bRowsDone = true;
        buildRows();
        buildMenu();
    }
    var imgs = [].slice.call(document.querySelectorAll("#oScroll img")), t0 = Date.now();
    Promise.all(imgs.map(waitImg)).then(function () { setTimeout(function () { ld.className = "oload out"; setTimeout(function () { ld.hidden = true; mn.hidden = false; var sc = document.getElementById("oScroll"); if (sc)
        sc.scrollTop = 0; }, 250); }, Math.max(0, 1300 - (Date.now() - t0))); });
}
function closeOutfit() { document.getElementById("outfitPage").hidden = true; document.body.style.overflow = ""; document.getElementById("bMenu").hidden = true; }
function renderBuilder(on) {
    document.getElementById("build").hidden = !on;
    if (!on || bBuilt)
        return;
    bBuilt = true;
    document.getElementById("bOpen").addEventListener("click", openOutfit);
    document.getElementById("bBack").addEventListener("click", closeOutfit);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !document.getElementById("outfitPage").hidden)
        closeOutfit(); });
    document.getElementById("bPlus").addEventListener("click", function () { var m = document.getElementById("bMenu"); m.hidden = !m.hidden; });
    document.addEventListener("click", function (e) { var m = document.getElementById("bMenu"), t = e.target; if (m.hidden || !t || !t.closest)
        return; if (!t.closest("#bMenu") && !t.closest("#bPlus"))
        m.hidden = true; });
    if (window.matchMedia) {
        var mq = window.matchMedia("(orientation:landscape)"), of = function () { if (bRowsDone)
            buildRows(); };
        if (mq.addEventListener)
            mq.addEventListener("change", of);
        else if (mq.addListener)
            mq.addListener(of);
    }
    document.getElementById("bShuf").addEventListener("click", function () { var b = this; b.classList.remove("roll"); void b.offsetWidth; b.classList.add("roll"); shuffleMatch(); });
}
var NEU = ["black", "white", "grey", "silver", "beige", "navy"];
function pairScore(a, b, tb) { var s = 3 * ov(a.ae, b.ae) + ov(a.tx, b.tx) + (tb ? 3 : 2) * ov(a.cl, b.cl); var na = a.cl.some(function (c) { return NEU.indexOf(c) > -1; }), nb = b.cl.some(function (c) { return NEU.indexOf(c) > -1; }); if (na || nb)
    s += 1; return s; }
function hasSlot(sl) { return slotItems(sl).length > 0; }
function shuffleMatch() {
    if (!bOn.length) {
        var opts = [];
        if (hasSlot("coord") && hasSlot("shoe"))
            opts.push(["coord", "shoe"]);
        if (hasSlot("dress") && hasSlot("shoe"))
            opts.push(["dress", "shoe"]);
        if (hasSlot("top") && hasSlot("bottom") && hasSlot("shoe"))
            opts.push(["top", "bottom", "shoe"]);
        if (hasSlot("top") && hasSlot("bottom"))
            opts.push(["top", "bottom"]);
        if (!opts.length) {
            var any = bExtra.filter(hasSlot);
            if (any.length)
                opts.push(any.slice(0, 3));
        }
        if (!opts.length)
            return;
        bOn = opts[Math.floor(Math.random() * opts.length)].slice();
    }
    var on = bOn.filter(hasSlot);
    if (!on.length) {
        buildRows();
        buildMenu();
        return;
    }
    var seedSl = on[Math.floor(Math.random() * on.length)], pool = slotItems(seedSl), seed = pool[Math.floor(Math.random() * pool.length)], chosen = [seed];
    bIdx[seedSl] = pool.indexOf(seed);
    on.forEach(function (sl) {
        if (sl === seedSl)
            return;
        var its = slotItems(sl), tb = (sl === "top" && seedSl === "bottom") || (sl === "bottom" && seedSl === "top"), best = 0, bs = -1;
        its.forEach(function (it, i) { var sc = Math.random() * 1.5; chosen.forEach(function (c) { sc += pairScore(it, c, tb); }); if (sc > bs) {
            bs = sc;
            best = i;
        } });
        bIdx[sl] = best;
        chosen.push(its[best]);
    });
    buildRows();
    buildMenu();
}
// ===== Looks, similar items & cards =====
function lookName(l) { return (l.set === "school" ? "School fits" : "OOTD Inspo") + " · " + l.t; }
function moreBtn(fn) { var b = document.createElement("button"); b.type = "button"; b.className = "more"; b.textContent = "✦ More like this"; b.addEventListener("click", fn); return b; }
function lookCard(l) {
    var d = document.createElement("div");
    d.className = "card";
    d.innerHTML = '<div class="ph tall"></div><div class="body"><p class="name"></p><p class="meta">Outfit look</p><button type="button" class="shop">View look</button></div>';
    d.querySelector(".name").textContent = lookName(l);
    var im = document.createElement("img");
    im.src = l.img;
    im.loading = "lazy";
    im.decoding = "async";
    im.alt = lookName(l);
    d.querySelector(".ph").appendChild(im);
    d.querySelector(".shop").addEventListener("click", function () { document.getElementById("q").value = ""; sim = null; view = l.set; jump = l.i; builtFor = ""; render(); window.scrollTo(0, 0); });
    var bd = d.querySelector(".body");
    bd.insertBefore(tagRow(l), d.querySelector(".shop"));
    bd.appendChild(moreBtn(function () { goSim({ look: l }); }));
    return d;
}
function goSim(s) { if (view !== "sim") {
    s.prev = view;
    s.q = qv();
}
else {
    s.prev = sim.prev;
    s.q = sim.q;
} sim = s; view = "sim"; document.getElementById("q").value = ""; render(); window.scrollTo(0, 0); }
function renderLookRes(q, tokens) {
    var sec = document.getElementById("lookSec"), gr = document.getElementById("lookGrid");
    gr.innerHTML = "";
    var nm = /^#?(\d+)$/.exec(q);
    var m = nm ? looks.filter(function (l) { return l.n === +nm[1]; }) : q ? looks.filter(function (l) { return tokens.every(function (t) { return l.h.indexOf(t) > -1; }); }) : [];
    m.forEach(function (l) { gr.appendChild(lookCard(l)); });
    sec.hidden = !m.length;
    return m.length;
}
function renderSim(on) {
    var sec = document.getElementById("simSec");
    sec.hidden = !on;
    if (!on)
        return;
    var L = document.getElementById("simLooks"), I = document.getElementById("simItems");
    L.innerHTML = "";
    I.innerHTML = "";
    var sl = [], si = [];
    if (sim.look) {
        var a = sim.look;
        document.getElementById("simHead").textContent = "More like " + lookName(a);
        sl = pick(looks.filter(function (b) { return b !== a; }), function (b) { return 3 * ov(a.ae, b.ae) + 2 * ov(a.cl, b.cl) + 1.5 * ov(a.tx, b.tx); }, 1, 4);
        si = pick(items.filter(function (it) { return a.k.indexOf(it.k) < 0; }), function (it) { var s = 3 * ov(a.ae, it.ae); a.cl.forEach(function (c) { if (it.h.indexOf(c) > -1)
            s += 1; }); a.tx.forEach(function (c) { if (it.h.indexOf(c) > -1)
            s += .5; }); return s; }, 1, 8);
    }
    else {
        var b0 = sim.item;
        document.getElementById("simHead").textContent = "More like: " + b0.n;
        si = pick(items.filter(function (it) { return it !== b0; }), function (it) { return (it.c === b0.c ? 2 : 0) + (it.g === b0.g ? .5 : 0) + 3 * ov(b0.ae, it.ae) + 1.5 * ov(b0.cl, it.cl) + ov(b0.tx, it.tx); }, 3, 12);
    }
    sl.forEach(function (l) { L.appendChild(lookCard(l)); });
    si.forEach(function (it) { I.appendChild(card(it)); });
    document.getElementById("simLH").hidden = !sl.length;
    document.getElementById("simIH").hidden = !si.length;
    document.getElementById("simEmpty").hidden = sl.length + si.length > 0;
}
// ===== Color variants =====
var bCol = {};
function colorOpts(it) { var base = { cn: it.cn || "Default", ch: it.ch || "#cccccc", img: it.img, n: it.n, u: it.u }; if (!it.v || !it.v.length)
    return [base]; return [base].concat(it.v.map(function (v) { return { cn: v.cn, ch: v.ch, img: v.img || it.img, n: v.n || it.n, u: v.u || it.u }; })); }
function variantText(it) { return [it.cn || ""].concat((it.v || []).map(function (v) { return (v.cn || "") + " " + (v.kw || ""); })); }
function addColors(d, it) {
    if (!it.v || !it.v.length)
        return;
    var opts = colorOpts(it);
    var row = document.createElement("div");
    row.className = "cdots";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "Colors");
    var nm = d.querySelector(".name"), a = d.querySelector(".shop"), im = d.querySelector(".ph img");
    opts.forEach(function (o, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "cdot" + (i ? "" : " on");
        b.style.background = o.ch;
        b.setAttribute("aria-label", o.cn);
        b.setAttribute("aria-pressed", i ? "false" : "true");
        b.addEventListener("click", function () {
            var all = row.children;
            for (var k = 0; k < all.length; k++) {
                all[k].className = "cdot" + (all[k] === b ? " on" : "");
                all[k].setAttribute("aria-pressed", all[k] === b ? "true" : "false");
            }
            if (im) {
                im.src = o.img;
                im.alt = o.n;
            }
            nm.textContent = o.n;
            a.href = o.u;
            a.setAttribute("aria-label", "Shop " + o.n);
        });
        row.appendChild(b);
    });
    d.querySelector(".body").insertBefore(row, a);
}
function card(it) {
    var d = document.createElement("div");
    d.className = "card";
    d.innerHTML = '<div class="ph"></div><div class="body"><p class="name"></p><p class="meta"></p><a class="shop" target="_blank" rel="noopener sponsored">Shop now</a></div>';
    d.querySelector(".name").textContent = it.n;
    d.querySelector(".meta").textContent = it.s + " · " + it.c;
    var a = d.querySelector(".shop");
    a.href = it.u;
    a.setAttribute("aria-label", "Shop " + it.n);
    var ph = d.querySelector(".ph");
    if (it.img) {
        var im = document.createElement("img");
        im.src = it.img;
        im.loading = "lazy";
        im.decoding = "async";
        im.alt = it.n;
        ph.appendChild(im);
    }
    else {
        ph.textContent = "Photo";
    }
    ph.appendChild(heartBtn(it));
    addColors(d, it);
    d.querySelector(".body").appendChild(moreBtn(function () { goSim({ item: it }); }));
    return d;
}
function showFit(n) {
    cur = n;
    var f = fits[n];
    document.getElementById("lookMore").hidden = false;
    document.getElementById("shopAll").hidden = false;
    var lt = document.getElementById("lookTags");
    lt.innerHTML = "";
    tagList(f).forEach(function (t) { lt.appendChild(tagBtn(t)); });
    lt.hidden = !tagList(f).length;
    document.getElementById("shopMsg").hidden = true;
    document.getElementById("num").textContent = (n + 1) + " / " + fits.length;
    var ds = document.getElementById("dots").children;
    for (var i = 0; i < ds.length; i++) {
        ds[i].className = i === n ? "on" : "";
    }
    document.getElementById("fitTitle").textContent = f.t || "";
    var g = document.getElementById("fitGrid");
    g.innerHTML = "";
    (f.k || []).forEach(function (k) { items.forEach(function (it) { if (it.k === k)
        g.appendChild(card(it)); }); });
}
function renderFits() {
    var sec = document.getElementById("fits"), on = view === "school" || view === "y2k";
    sec.hidden = !on;
    if (!on)
        return;
    fits = sets[view] || [];
    document.getElementById("fitHead").textContent = view === "school" ? "School fits" : "OOTD Inspo";
    var nt = document.getElementById("fitNote");
    nt.textContent = SCHOOL_NOTE;
    nt.hidden = view !== "school";
    document.getElementById("car").hidden = !fits.length;
    document.getElementById("lookMore").hidden = !fits.length;
    document.getElementById("shopAll").hidden = !fits.length;
    if (!fits.length)
        document.getElementById("lookTags").hidden = true;
    var em = document.getElementById("fitEmpty");
    em.hidden = fits.length > 0;
    em.textContent = view === "school" ? "School fits are coming soon. Check back!" : "OOTD inspo is coming soon. Check back!";
    if (!fits.length) {
        document.getElementById("fitTitle").textContent = "";
        document.getElementById("fitGrid").innerHTML = "";
        return;
    }
    if (builtFor !== view) {
        var tr = document.getElementById("track"), dt = document.getElementById("dots");
        tr.innerHTML = "";
        dt.innerHTML = "";
        tr.scrollLeft = 0;
        fits.forEach(function (f, i) { var sl = document.createElement("div"); sl.className = "slide"; var im = document.createElement("img"); im.src = f.img; im.alt = f.t || ("Outfit photo " + (i + 1)); sl.appendChild(im); tr.appendChild(sl); dt.appendChild(document.createElement("i")); });
        builtFor = view;
        showFit(0);
        if (jump > 0) {
            tr.scrollLeft = jump * tr.clientWidth;
            showFit(jump);
        }
        jump = -1;
    }
}
document.getElementById("track").addEventListener("scroll", function () { var tr = this, n = Math.round(tr.scrollLeft / tr.clientWidth); if (n !== cur && fits[n])
    showFit(n); });
// ===== Menu, buttons & startup =====
var mb = document.getElementById("mb"), mn = document.getElementById("menu");
function tog(o) { mn.hidden = !o; mb.setAttribute("aria-expanded", o ? "true" : "false"); }
mb.addEventListener("click", function (e) { e.stopPropagation(); tog(mn.hidden); });
document.addEventListener("click", function (e) { if (!mn.hidden && !mn.contains(e.target))
    tog(false); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape")
    tog(false); });
document.getElementById("cb").addEventListener("click", function () {
    var b = this, t = document.getElementById("cv").textContent;
    function ok() { b.textContent = "Copied!"; setTimeout(function () { b.textContent = "Copy"; }, 1500); }
    function no() { b.textContent = "Hold the code to copy"; }
    try {
        navigator.clipboard.writeText(t).then(ok, no);
    }
    catch (x) {
        no();
    }
});
document.getElementById("simBack").addEventListener("click", function () { var s = sim; sim = null; view = s.prev || "all"; document.getElementById("q").value = s.q || ""; render(); window.scrollTo(0, 0); });
document.getElementById("shopAll").addEventListener("click", function () {
    var f = fits[cur];
    if (!f)
        return;
    items.forEach(function (it) { if (f.k.indexOf(it.k) > -1 && it.u) {
        var w = window.open(it.u, "_blank");
        if (w) {
            try {
                w.opener = null;
            }
            catch (x) { }
        }
    } });
    document.getElementById("shopMsg").hidden = false;
});
document.getElementById("lookMore").addEventListener("click", function () { var f = fits[cur]; if (f)
    goSim({ look: f }); });
var qt;
document.getElementById("q").addEventListener("input", function () { clearTimeout(qt); qt = setTimeout(render, 120); });
render();
if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () { try {
        navigator.serviceWorker.register("sw.js").catch(function () { });
    }
    catch (e) { } });
}

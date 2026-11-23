(() => {
  "use strict";
  const C = window.REVA_CONFIG;
  const grid = document.getElementById("grid");

  // ---------- helpers ----------
  const safeUrl = (u) => {
    try {
      const x = new URL(u);
      return x.protocol === "https:" || x.protocol === "http:" ? x.href : null;
    } catch { return null; }
  };
  const el = (tag, props, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "href") { const s = safeUrl(v); if (s) { n.href = s; n.target = "_blank"; n.rel = "noopener noreferrer"; } }
      else n.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  };
  const sources = (list) => {
    const wrap = el("div", { class: "srcs" });
    for (const s of list || []) {
      if (safeUrl(s.url)) wrap.append(el("a", { href: s.url, text: s.name, title: new URL(s.url).hostname }));
      else wrap.append(el("span", { class: "nolink", title: "No working link found", text: s.name + " (no link)" }));
    }
    return wrap;
  };
  const headline = (title, url) => {
    const h = el("h3");
    h.append(safeUrl(url) ? el("a", { href: url, text: title }) : title);
    return h;
  };
  const box = (id, span, label, title, ...body) =>
    el("section", { class: "box span-" + span, id }, el("p", { class: "label", text: label }), title ? el("h2", { text: title }) : null, body);

  const roundup = (items) =>
    (items || []).map((it) => {
      const first = (it.sources || []).find((s) => safeUrl(s.url));
      return el("article", { class: "item" }, headline(it.title, first && first.url), it.date ? el("p", { class: "meta", text: it.date }) : null, el("p", { text: it.summary }), sources(it.sources));
    });

  const readCard = (id, label, it, isSubstack) => {
    if (!it) return box(id, 3, label, "", el("p", { text: "Nothing picked today." }));
    const meta = [it.outlet, it.author, it.date, it.minutes ? it.minutes + " min" : null, it.paywalled ? "paywalled" : null]
      .filter(Boolean).join(" · ");
    return box(id, 3, label, "",
      el("article", { class: "item" },
        headline(it.title, it.url),
        el("p", { class: "meta", text: meta }),
        el("p", { text: it.why }),
        isSubstack || it.substack
          ? el("p", {}, el("a", { class: "tag", href: C.PANGRAM_URL, text: "Check on Pangram" }))
          : null));
  };

  // ---------- Obsidian / marginalia ----------
  const obsidianUrl = (data) => {
    const w = data.writing || {};
    const date = data.date;
    const links = (w.connection_basis || []).map((b) => "- [" + b.title + "](" + b.url + ")").join("\n");
    const body = [
      "---", "type: writing-exercise", "kind: connection", "date: " + date,
      "tags: [" + ((w.tags || []).join(", ")) + "]", "---", "",
      "# " + (w.connection_question || ""), "",
      "Write for 10 minutes. Do not stop to edit.", "",
      "## Pieces in play", links, "", "## Writing", ""
    ].join("\n");
    return "obsidian://new?vault=" + encodeURIComponent(C.OBSIDIAN_VAULT) +
      "&file=" + encodeURIComponent(C.OBSIDIAN_FOLDER + "/" + date + " connection") +
      "&content=" + encodeURIComponent(body);
  };

  // obsidian:// is not http(s), so it bypasses safeUrl. The URL is built here from our own template only.
  const obsidianLink = (data, cls, text) => {
    const a = el("a", { class: cls, text });
    a.setAttribute("href", obsidianUrl(data));
    return a;
  };

  // ---------- checklist ----------
  const storeKey = (date) => "reva-daily:" + date;
  const loadTicks = (date) => { try { return JSON.parse(localStorage.getItem(storeKey(date)) || "{}"); } catch { return {}; } };
  const saveTicks = (date, t) => { try { localStorage.setItem(storeKey(date), JSON.stringify(t)); } catch {} };
  const pushTick = (date, id, done) => {
    if (!C.SHEET_WEBAPP_URL) return;
    fetch(C.SHEET_WEBAPP_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ date, item: id, done, at: new Date().toISOString() }) }).catch(() => {});
  };

  const checklist = (data) => {
    const ticks = loadTicks(data.date);
    const all = C.CHECKLIST.flatMap((g) => g.items);
    const progress = el("i");
    const count = el("span", { class: "label" });
    const syncNote = el("p", { class: "sync", text: C.SHEET_WEBAPP_URL ? "Saved to your Sheet and this browser." : "Saved in this browser only. Add a Sheet URL in config.js to sync." });
    const refresh = () => {
      const n = all.filter((i) => ticks[i.id]).length;
      progress.style.width = (n / all.length) * 100 + "%";
      count.textContent = n + " of " + all.length + " done";
    };
    const wrap = el("div", { class: "check" }, count, el("div", { class: "bar" }, progress));
    for (const g of C.CHECKLIST) {
      const ul = el("ul");
      for (const it of g.items) {
        const cb = el("input", { type: "checkbox", id: "c-" + it.id });
        cb.checked = !!ticks[it.id];
        cb.addEventListener("change", () => { ticks[it.id] = cb.checked; saveTicks(data.date, ticks); pushTick(data.date, it.id, cb.checked); refresh(); });
        let go = null;
        if (it.link) go = el("a", { class: "go", href: it.link, text: "open" });
        else if (it.anchor) go = el("a", { class: "go", href: "#" + it.anchor, text: "go" });
        else if (it.action === "marginalia" && C.MARGINALIA_URL) go = el("a", { class: "go", href: C.MARGINALIA_URL, text: "open" });
        else if (it.action === "obsidian" && C.OBSIDIAN_VAULT) go = obsidianLink(data, "go", "open");
        ul.append(el("li", {}, cb, el("label", { for: "c-" + it.id, text: it.label }), go));
      }
      wrap.append(el("p", { class: "label", text: g.group }), ul);
    }
    wrap.append(syncNote);
    refresh();
    // Pull ticks made on another device, if a Sheet is connected.
    if (C.SHEET_WEBAPP_URL) {
      fetch(C.SHEET_WEBAPP_URL + "?date=" + encodeURIComponent(data.date)).then((r) => r.json()).then((remote) => {
        for (const it of all) if (remote[it.id]) { ticks[it.id] = true; const cb = wrap.querySelector("#c-" + it.id); if (cb) cb.checked = true; }
        saveTicks(data.date, ticks); refresh();
      }).catch(() => {});
    }
    return wrap;
  };

  // ---------- render ----------
  const render = (d) => {
    document.getElementById("mast-date").textContent = d.date_label || d.date;
    document.getElementById("mast-top").textContent = d.top_line || "";
    document.title = "Reva Daily, " + (d.date_label || d.date);
    grid.textContent = "";

    const pieces = [];
    pieces.push(box("ai-roundup", 7, "AI and tech", "Five things in AI and tech", roundup(d.ai_roundup)));
    pieces.push(box("checklist", 5, "Today", "Daily checklist", checklist(d)));

    pieces.push(readCard("read-ai", "Read: AI", d.reading && d.reading.ai, d.reading && d.reading.ai && d.reading.ai.substack));
    pieces.push(readCard("read-mind", "Read: mind-broadening", d.reading && d.reading.mind, d.reading && d.reading.mind && d.reading.mind.substack));
    const p = d.reading && d.reading.paper;
    pieces.push(readCard("read-paper", "Paper in review", p && { ...p, why: p.why }, false));
    const m = d.reading && d.reading.media;
    pieces.push(readCard("read-media", "Watch or listen" + (m && m.kind ? ": " + m.kind : ""), m, false));

    const c = d.concept_ai;
    pieces.push(box("concept-ai", 6, "AI concept spotlight", c ? c.term : "",
      c ? [(c.paragraphs || []).map((t) => el("p", { text: t })), c.why ? el("p", { class: "why", text: c.why }) : null, sources(c.learn_more)] : el("p", { text: "No concept today." })));
    const g = d.geo_concept;
    pieces.push(box("geo-concept", 6, "Geopolitics: concept in review", g ? g.title : "",
      g ? [(g.paragraphs || []).map((t) => el("p", { text: t })), sources(g.learn_more)] : el("p", { text: "No concept today." })));

    pieces.push(box("money", 6, "Big money moves", "Where the money is going",
      (d.big_moves || []).map((b) => el("article", { class: "item" }, headline(b.headline, ((b.sources || [])[0] || {}).url),
        b.who ? el("p", { class: "meta", text: b.who }) : null, el("p", { text: b.why }), sources(b.sources)))));
    pieces.push(box("geo-roundup", 6, "Geopolitics", "Geopolitics round-up", roundup(d.geo_roundup)));

    pieces.push(box("world", 7, "General", "Around the world", roundup(d.world)));
    pieces.push(box("india", 5, "India", "India", roundup(d.india)));

    pieces.push(box("know", 6, "Worth knowing", "Things I should know",
      (d.know || []).map((k) => el("article", { class: "item" }, headline(k.headline, ((k.sources || [])[0] || {}).url), el("p", { text: k.body }), sources(k.sources)))));

    const w = d.writing || {};
    const btns = el("div", { class: "btn-row" });
    if (C.OBSIDIAN_VAULT) btns.append(obsidianLink(d, "btn", "Write in Obsidian"));
    if (C.MARGINALIA_URL) btns.append(el("a", { class: "btn", href: C.MARGINALIA_URL, text: "Open marginalia" }));
    if (!btns.children.length) btns.append(el("p", { class: "meta", text: "Set OBSIDIAN_VAULT and MARGINALIA_URL in config.js to switch these on." }));
    pieces.push(box("write", 6, "Write for 10 minutes", "Today's connection question",
      el("p", { class: "prompt", text: w.connection_question || "No question today." }),
      (w.connection_basis || []).length ? [el("p", { class: "label", text: "Built from" }), sources((w.connection_basis || []).map((b) => ({ name: b.title, url: b.url })))] : null,
      btns));

    grid.append(...pieces);
  };

  // ---------- load ----------
  const params = new URLSearchParams(location.search);
  const want = params.get("date");
  const path = want && /^\d{4}-\d{2}-\d{2}$/.test(want) ? "data/" + want + ".json" : "data/latest.json";
  fetch(path + "?v=" + Date.now())
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((d) => {
      render(d);
      fetch("data/index.json?v=" + Date.now()).then((r) => r.ok ? r.json() : null).then((idx) => {
        if (!idx || !idx.days) return;
        const i = idx.days.indexOf(d.date);
        const prev = idx.days[i + 1];
        const a = document.getElementById("prev-day");
        if (prev) { a.href = "?date=" + prev; a.textContent = prev; a.hidden = false; }
        if (want) document.getElementById("day-note").textContent = "(archive)";
      }).catch(() => {});
    })
    .catch(() => {
      document.getElementById("state").textContent = "Couldn't load " + path + ". If this is the first run, today's edition hasn't been published yet.";
      document.getElementById("mast-date").textContent = "Not loaded";
      document.getElementById("mast-top").textContent = "";
    });
})();

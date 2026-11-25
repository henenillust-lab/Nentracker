/* 넨트래커 랜딩 — 모닥불 자라기 · 헨냥이 말풍선 · 별자리 잇기 체험 (데이터 = data.js, tools/landing/build.py 가 앱에서 뽑음) */
(() => {
  "use strict";
  const D = window.NT_DATA || { groups: {}, cons: {}, talk: {}, fire: {} };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const pick = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : "");

  /* ── 들어올 때: 칸마다 제목 → 글 → 그림 차례로 ── */
  const groups = document.querySelectorAll(".block, .sky-text, .sky-stage, .friend, .neighbors, .letter, .faq, .cta");
  groups.forEach((g) => {
    const parts = g.matches(".sky-stage") ? [g] : g.querySelectorAll(":scope > h2, :scope > p, :scope > figure, :scope > img, :scope > ul, :scope > div, .multi-text > *, .cta-text > *, .faq-text > p");
    let i = 0;
    parts.forEach((el) => {
      if (el.classList.contains("prints") || el.classList.contains("multi-text") || el.classList.contains("cta-text") || el.classList.contains("faq-text")) return;
      el.classList.add("rise");
      el.style.setProperty("--d", Math.min(i++ * 80, 480) + "ms");
    });
  });
  document.querySelectorAll(".print").forEach((el, i) => { el.classList.add("rise"); el.style.setProperty("--d", 120 + i * 110 + "ms"); });
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -12% 0px" });
  document.querySelectorAll(".rise").forEach((el) => io.observe(el));

  /* ── 움직임 줄이기: 영상은 멈춘 첫 장면으로 ── */
  if (reduce) document.querySelectorAll("video[autoplay]").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); v.controls = true; });

  /* ── 헨냥이 말풍선 ── */
  const bubble = $("#bubble");
  let bubT = 0;
  function say(line, ms = 3400) {
    if (!bubble || !line) return;
    bubble.textContent = line;
    bubble.classList.add("on");
    clearTimeout(bubT);
    bubT = setTimeout(() => bubble.classList.remove("on"), ms);
  }
  const nyang = $("#nyang");
  let pokes = [];
  if (nyang) {
    nyang.addEventListener("click", () => {
      const now = Date.now();
      pokes = pokes.filter((t) => now - t < 3000);
      pokes.push(now);
      say(pokes.length >= 5 ? pick(D.talk.poke_many) : pick(D.talk.click));
      const img = nyang.querySelector("img");
      img.src = "img/hennyang_happy.png";
      clearTimeout(nyang._t);
      nyang._t = setTimeout(() => (img.src = "img/hennyang.png"), 1400);
    });
  }
  setTimeout(() => say(pick(D.talk.hello_open)), 1200);

  /* ── 모닥불: 내려 읽을수록 1 → 8단계 ── */
  const split = $(".split");
  const fa = $("#fireA"), fb = $("#fireB"), fname = $("#fireName");
  let stage = 1, front = fa, back = fb, said = {};
  for (let s = 2; s <= 8; s++) { const im = new Image(); im.src = `img/fire${s}.webp`; } // 미리 받아 둠 (모두 합쳐 약 0.5MB)
  function setStage(s) {
    if (s === stage) return;
    stage = s;
    // 두 장을 엇갈려 바꿔 끼움 · 다 사라진 쪽은 감춤 (투명한 그림을 화면에 남겨 두지 않음)
    const inc = back, out = front;
    inc.style.opacity = "0";
    inc.src = `img/fire${s}.webp`;
    inc.hidden = false;
    void inc.offsetWidth;  // 꺼낸 그림이 투명한 채로 먼저 그려진 뒤 엇갈려 바뀌게
    inc.style.opacity = "1"; out.style.opacity = "0";
    clearTimeout(out._t);
    out._t = setTimeout(() => { if (out.style.opacity === "0") out.hidden = true; }, reduce ? 0 : 800);
    [front, back] = [inc, out];
    if (fname) fname.textContent = `모닥불 Lv.${s} · ${D.fire[s] || ""}`;
    if ((s === 4 || s === 8) && !said[s]) { said[s] = 1; say(pick(D.talk.cx_fire_o)); }
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    if (!split) return;
    const r = split.getBoundingClientRect();
    const span = Math.max(1, r.height - window.innerHeight * 0.9);
    const p = Math.min(1, Math.max(0, -r.top / span));
    setStage(1 + Math.min(7, Math.floor(p * 8.4)));
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ── 마지막 칸 헨냥이 인사 ── */
  const ctaB = $("#ctaBubble");
  if (ctaB) {
    new IntersectionObserver((ents, ob) => {
      ents.forEach((e) => { if (e.isIntersecting) { ctaB.textContent = pick(D.talk.hello_open) || ctaB.textContent; ob.disconnect(); } });
    }, { threshold: 0.4 }).observe(ctaB);
  }

  /* ── 별자리 잇기 (앱 core/pomo_const.py 48개 그대로) ── */
  const cv = $("#skyCanvas");
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  const W = 560, H = 400;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.scale(dpr, dpr);
  const DUR = 12000;
  const tEl = $("#pomoTime"), sEl = $("#pomoState"), go = $("#pomoGo"), reset = $("#pomoReset"), cEl = $("#pomoCount"), cap = $("#skyCap");
  const radios = document.querySelectorAll(".sky-pick button");

  // 바탕 별 (늘 같은 자리)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dust = Array.from({ length: 70 }, () => ({ x: rnd() * W, y: rnd() * H * 0.92, r: 0.5 + rnd() * 1.1, ph: rnd() * 6.28 }));

  const order = {};
  function nextName(g) {
    const names = (D.groups[g] && D.groups[g].names) || [];
    if (!order[g] || !order[g].length) order[g] = names.slice().sort(() => Math.random() - 0.5);
    return order[g].shift();
  }

  let cur = null, group = "보통", minutes = 25, f = 0, running = false, done = false, last = 0, count = 0;
  function build(name) {
    const c = D.cons[name];
    const BW = 440, BH = 300, ox = (W - BW) / 2, oy = 30;
    const P = (p) => [ox + p[0] * BW, oy + p[1] * BH];
    const stars = new Map(), segs = [];
    let L = 0;
    c.s.forEach((st) => {
      st.forEach((p, i) => {
        const k = p[0].toFixed(3) + "," + p[1].toFixed(3);
        if (!stars.has(k)) stars.set(k, { x: P(p)[0], y: P(p)[1], at: Infinity, k });
        if (i > 0) {
          const a = P(st[i - 1]), b = P(p);
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          segs.push({ a, b, len, from: L, ka: st[i - 1][0].toFixed(3) + "," + st[i - 1][1].toFixed(3), kb: k });
          L += len;
        }
      });
    });
    // 별에 닿는 때 (이은 길이 비율)
    segs.forEach((s, i) => {
      if (i === 0 || segs[i - 1].kb !== s.ka) stars.get(s.ka).at = Math.min(stars.get(s.ka).at, s.from / L);
      stars.get(s.kb).at = Math.min(stars.get(s.kb).at, (s.from + s.len) / L);
    });
    return { name, stars: [...stars.values()], segs, L };
  }

  function fmt(sec) { sec = Math.max(0, Math.ceil(sec)); return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0"); }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    const t = now / 1000;
    dust.forEach((d) => {
      const a = 0.25 + 0.2 * Math.sin(t * 1.3 + d.ph);
      ctx.fillStyle = `rgba(220,215,255,${running ? a : 0.3})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
    });
    if (!cur) return;
    const drawn = f * cur.L;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(200,195,255,.12)"; ctx.lineWidth = 1.6;
    cur.segs.forEach((s) => { ctx.beginPath(); ctx.moveTo(s.a[0], s.a[1]); ctx.lineTo(s.b[0], s.b[1]); ctx.stroke(); });
    ctx.strokeStyle = done ? "rgba(255,226,160,.95)" : "rgba(255,214,150,.85)";
    ctx.lineWidth = 2.4;
    let tip = null;
    cur.segs.forEach((s) => {
      if (drawn <= s.from) return;
      const k = Math.min(1, (drawn - s.from) / s.len);
      const x = s.a[0] + (s.b[0] - s.a[0]) * k, y = s.a[1] + (s.b[1] - s.a[1]) * k;
      ctx.beginPath(); ctx.moveTo(s.a[0], s.a[1]); ctx.lineTo(x, y); ctx.stroke();
      if (k < 1) tip = [x, y];
    });
    cur.stars.forEach((s) => {
      const lit = f >= s.at - 1e-6;
      if (!lit) {
        ctx.fillStyle = "rgba(235,232,255,.5)";
        ctx.beginPath(); ctx.arc(s.x, s.y, 3.2, 0, 6.283); ctx.fill();
        return;
      }
      const age = (f - s.at) * DUR;
      const pop = reduce ? 1 : 1 + Math.max(0, 0.7 * (1 - age / 320));
      ctx.fillStyle = "rgba(255,200,120,.16)";
      ctx.beginPath(); ctx.arc(s.x, s.y, 11 * pop, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#fff1c8";
      star(s.x, s.y, 6.2 * pop);
    });
    if (tip && running) {
      ctx.fillStyle = "rgba(255,240,200,.95)";
      ctx.beginPath(); ctx.arc(tip[0], tip[1], 3.4, 0, 6.283); ctx.fill();
    }
  }
  function star(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      ctx[i ? "lineTo" : "moveTo"](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
  }

  function loop(now) {
    if (!running) { draw(now); return; }
    const dt = last ? now - last : 0;
    last = now;
    f = Math.min(1, f + dt / DUR);
    tEl.textContent = fmt(minutes * 60 * (1 - f));
    if (f >= 1) finish();
    draw(now);
    if (running) requestAnimationFrame(loop);
  }
  function finish() {
    running = false; done = true; f = 1;
    count += 1;
    cEl.textContent = `집중 ${count}번 했어요`;
    tEl.textContent = "00:00";
    sEl.textContent = `${cur.name}자리 완성! · ${pick(D.talk.n_pomo_focus) || "잘했다냥"}`;
    cv.setAttribute("aria-label", `${cur.name}자리를 다 이었어요`);
    go.textContent = "다른 별자리";
  }
  function fresh() {
    cur = build(nextName(group));
    f = 0; done = false; running = false; last = 0;
    tEl.textContent = fmt(minutes * 60);
    sEl.textContent = "시작을 누르면 별을 이어요";
    go.textContent = "시작";
    cv.setAttribute("aria-label", "별자리 판. 시작을 누르면 별을 이어요");
    draw(performance.now());
  }
  go.addEventListener("click", () => {
    if (done) { fresh(); }
    if (running) { running = false; go.textContent = "계속"; sEl.textContent = "잠깐 멈췄어요"; return; }
    if (reduce) { f = 1; finish(); draw(performance.now()); return; }
    running = true; last = 0; go.textContent = "일시정지";
    sEl.textContent = f > 0 ? "다시 잇는 중이에요" : pick(D.talk.n_pomo_start) || "집중 시작이다냥";
    requestAnimationFrame(loop);
  });
  reset.addEventListener("click", () => { const keep = cur && cur.name; cur = keep ? build(keep) : cur; f = 0; done = false; running = false; last = 0; tEl.textContent = fmt(minutes * 60); sEl.textContent = "시작을 누르면 별을 이어요"; go.textContent = "시작"; draw(performance.now()); });
  radios.forEach((b) => {
    b.addEventListener("click", () => {
      radios.forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      group = b.dataset.g; minutes = +b.dataset.min;
      cap.textContent = `앱에서는 ${minutes}분 동안 천천히 이어져요. 여기서는 12초로 빨리 감았어요.`;
      fresh();
    });
    b.addEventListener("keydown", (e) => {
      const list = [...radios], i = list.indexOf(b);
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); const n = list[(i + k + list.length) % list.length]; n.focus(); n.click(); }
    });
  });
  fresh();
  new IntersectionObserver((ents, ob) => {
    ents.forEach((e) => { if (e.isIntersecting && !running && !done && f === 0) { go.click(); ob.disconnect(); } });
  }, { threshold: 0.6 }).observe(cv);
})();

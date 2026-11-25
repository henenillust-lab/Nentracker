/* 넨트래커 랜딩 3판 — 반짝이는 밤하늘 · 실제 앱 화면 넘기기 · 레퍼런스 보드 체험(자유 · 웹툰 · 페이지) · 기본 친구 9 · 테마
   (대사 · 테마 글 · 친구 = data.js, tools/landing/build.py 가 앱에서 뽑음) */
(() => {
  "use strict";
  const D = window.NT_DATA || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pick = (a) => (a && a.length ? a[Math.floor(Math.random() * a.length)] : "");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ═════ 1. 반짝이는 밤하늘 (페이지 바탕 · 30fps · 탭이 숨으면 멈춤) ═════ */
  (function sky() {
    const cv = $("#stars");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, stars = [], dust = [], shoot = null, nextShoot = 0, last = 0;
    function init() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((W * H) / 4200);
      stars = Array.from({ length: n }, () => {
        const r = Math.random();
        return {
          x: Math.random() * W, y: Math.random() * H, ph: Math.random() * 6.283, sp: 0.5 + Math.random() * 2.2,
          s: r < 0.84 ? 0.5 + Math.random() * 0.6 : r < 0.965 ? 1.1 + Math.random() * 0.6 : 1.7 + Math.random() * 0.6,
          big: r >= 0.965, c: r < 0.88 ? "238,241,248" : Math.random() < 0.5 ? "255,218,178" : "200,220,255",
        };
      });
      dust = [];  // 은하수: 비스듬한 띠를 따라 아주 작은 점 (보라 X · 흰빛)
      const m = Math.round((W * H) / 2600);
      for (let i = 0; i < m; i++) {
        const t = Math.random(), off = (Math.random() + Math.random() + Math.random() - 1.5) * H * 0.17;
        dust.push({ x: t * W * 1.3 - W * 0.15, y: H * 0.98 - t * H * 0.95 + off, a: 0.035 + Math.random() * 0.08 });
      }
      nextShoot = performance.now() + 3000;
      draw(performance.now());
    }
    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      for (const d of dust) { ctx.fillStyle = `rgba(225,232,245,${d.a})`; ctx.fillRect(d.x, d.y, 1.2, 1.2); }
      const t = now / 1000;
      for (const s of stars) {
        const k = reduce ? 0.8 : 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        ctx.fillStyle = `rgba(${s.c},${0.25 + 0.75 * k})`;
        if (s.big) {
          const r = s.s * (0.7 + 0.6 * k);
          ctx.fillRect(s.x - r * 2.6, s.y - 0.5, r * 5.2, 1);
          ctx.fillRect(s.x - 0.5, s.y - r * 2.6, 1, r * 5.2);
          ctx.beginPath(); ctx.arc(s.x, s.y, r * 0.8, 0, 6.283); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 0.6, 0, 6.283); ctx.fill();
        }
      }
      if (shoot) {  // 별똥별
        const p = (now - shoot.t0) / shoot.dur;
        if (p >= 1) shoot = null;
        else {
          const x = shoot.x + shoot.dx * p, y = shoot.y + shoot.dy * p;
          const g = ctx.createLinearGradient(x, y, x - shoot.dx * 0.22, y - shoot.dy * 0.22);
          g.addColorStop(0, `rgba(255,246,226,${0.9 * (1 - p)})`); g.addColorStop(1, "rgba(255,246,226,0)");
          ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - shoot.dx * 0.22, y - shoot.dy * 0.22); ctx.stroke();
        }
      } else if (!reduce && now > nextShoot) {
        shoot = { t0: now, dur: 900, x: W * (0.3 + Math.random() * 0.7), y: H * Math.random() * 0.4, dx: -W * 0.32, dy: H * 0.22 };
        nextShoot = now + 6000 + Math.random() * 9000;
      }
    }
    function loop(now) {
      if (now - last > 33) { last = now; draw(now); }
      requestAnimationFrame(loop);
    }
    let rt = 0;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(init, 150); });
    init();
    if (!reduce) requestAnimationFrame(loop);
  })();

  /* ═════ 2. 실제 앱 화면 넘기기 (단추 = 앱 화면 전환) ═════ */
  $$("[data-switch]").forEach((box) => {
    const name = box.dataset.switch;
    const fig = $(`[data-screen="${name}"]`);
    if (!fig) return;
    const img = $("img", fig), cap = $("figcaption", fig);
    const btns = $$("button", box);
    btns.forEach((b) => { const im = new Image(); im.src = b.dataset.src; });  // 미리 받아 둠
    function show(b) {
      if (b.getAttribute("aria-selected") === "true" && img.getAttribute("src") === b.dataset.src) return;
      btns.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      img.classList.add("fade");
      setTimeout(() => {
        img.src = b.dataset.src;
        img.alt = b.dataset.cap || b.textContent;
        if (cap) cap.textContent = b.dataset.cap + (name === "pomo" ? " · 실제 화면을 빨리 감았어요" : "");
        img.classList.toggle("mini", !!b.dataset.mini);
        img.classList.toggle("wide", /strip/.test(b.dataset.src));
        img.classList.remove("fade");
      }, reduce ? 0 : 160);
    }
    btns.forEach((b, i) => {
      b.addEventListener("click", () => show(b));
      b.addEventListener("keydown", (e) => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); const n = btns[(i + k + btns.length) % btns.length]; n.focus(); show(n); }
      });
    });
  });

  /* ═════ 2-0. 크게 보기 창 (실제 화면 · 영수증 · 아무 곳이나 누르거나 Esc로 닫힘) ═════ */
  const zoomDlg = $("#zoomBig");
  function zoom(im) {
    if (!im || !zoomDlg || typeof zoomDlg.showModal !== "function") return;
    let big = zoomDlg.querySelector("img");
    if (!big) { big = new Image(); zoomDlg.prepend(big); }  // 빈 그림 칸을 HTML에 두지 않음 (누를 때 만듦)
    big.src = im.currentSrc || im.src; big.alt = im.alt;
    zoomDlg.showModal();
  }
  if (zoomDlg) zoomDlg.addEventListener("click", () => zoomDlg.close());

  /* ═════ 2-1. 그림 누르면 크게 · 양옆 ‹ › 로 넘기기 · 'n / 전체'는 그림 아래 (실제 화면 칸 + 테마) ═════ */
  function addNav(fig, getBtns) {
    const img = fig && $("img", fig);
    if (!img) return;
    let holder = img.parentElement;
    if (holder === fig) {  // 그림을 감싸는 자리를 만들어 단추를 그림 가운데 높이에 둠
      holder = document.createElement("div");
      holder.className = "scr-wrap";
      fig.insertBefore(holder, img);
      holder.appendChild(img);
    }
    holder.classList.add("scr-hold");
    const mk = (cls, label, txt) => { const b = document.createElement("button"); b.type = "button"; b.className = "scr-nav " + cls; b.setAttribute("aria-label", label); b.textContent = txt; holder.appendChild(b); return b; };
    const prev = mk("prev", "앞 화면", "‹"), next = mk("next", "다음 화면", "›");
    const cnt = document.createElement("span");
    cnt.className = "scr-count";
    cnt.setAttribute("aria-hidden", "true");
    // 번호는 그림 위가 아니라 그림 아래 설명 줄 오른쪽에 (그림을 가리지 않게 · 2026-11-26 헤넨 님)
    const foot = document.createElement("div");
    foot.className = "scr-foot";
    const cap = $("figcaption", fig);
    (cap && cap.parentElement === fig ? cap : null) ? fig.insertBefore(foot, cap) : fig.appendChild(foot);
    if (cap && cap.parentElement === fig) foot.appendChild(cap);
    foot.appendChild(cnt);
    const cur = () => Math.max(0, getBtns().findIndex((b) => b.getAttribute("aria-selected") === "true"));
    const upd = () => { cnt.textContent = `${cur() + 1} / ${getBtns().length}`; };
    const go = (d) => { const bs = getBtns(); if (!bs.length) return; bs[(cur() + d + bs.length) % bs.length].click(); upd(); };
    prev.addEventListener("click", (e) => { e.stopPropagation(); go(-1); });
    next.addEventListener("click", (e) => { e.stopPropagation(); go(1); });
    // 넘기기는 양옆 단추 · 그림을 누르면 크게 (2026-11-26 헤넨 님) · 칸이 그림을 바꿔 끼워도 되게 누른 그림을 씀
    holder.addEventListener("click", (e) => { if (e.target.tagName === "IMG") zoom(e.target); });
    $$("img", holder).forEach((im) => { im.title = "누르면 크게 보기"; });
    getBtns().forEach((b) => b.addEventListener("click", () => setTimeout(upd, 0)));
    upd();
  }
  $$("[data-switch]").forEach((box) => addNav($(`[data-screen="${box.dataset.switch}"]`), () => $$("button", box)));

  /* ═════ 2-2. 리포트 미리 보기 창: 스크롤 + 바로 가기 (자리 = report_marks.js, build.py가 그림에서 찾음) ═════ */
  (function reportScroll() {
    const box = $("#rpScroll"), img = $("#rpFull"), jump = $$("#rpJump button");
    if (!box || !img || !jump.length) return;
    const M = window.NT_RMARKS || { h: 1, marks: [] };
    const yOf = (i) => (M.marks[i] != null ? M.marks[i] / M.h : 0) * img.clientHeight;
    const pick = (i) => jump.forEach((b, j) => b.setAttribute("aria-selected", String(i === j)));
    jump.forEach((b, i) => b.addEventListener("click", () => {
      pick(i);
      box.scrollTo({ top: Math.max(0, yOf(i) - 8), behavior: reduce ? "auto" : "smooth" });
    }));
    let tk = 0;
    box.addEventListener("scroll", () => {
      clearTimeout(tk);
      tk = setTimeout(() => {
        const y = box.scrollTop + box.clientHeight * 0.3;
        let cur = 0;
        jump.forEach((_, i) => { if (yOf(i) <= y) cur = i; });
        pick(cur);
      }, 80);
    }, { passive: true });
  })();

  /* ═════ 2-3. 미니 화면 끌기 · 창 조립 (실제 앱 그림 낱장 · 폭 · 겹침 = widgets.js, build.py가 촬영본에서) ═════ */
  (function miniStack() {
    const desk = $("#miniDesk"), st = $("#miniStack"), btns = $$("#miniParts button");
    if (!desk || !st || !btns.length) return;
    const WG = window.NT_WIDGETS || { w: 210, ov: 1, last: [] };
    // 붙은 차례 = 누른 차례 (앱처럼 새로 붙인 창이 맨 아래) · 음악 플레이어는 다른 창과 같이 붙지 않음 (앱: 늘 미니 바로 아래 하나)
    const order = btns.filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.part);
    const NAME = { deadline: "마감", pomo: "뽀모도로", todo: "할 일", memo: "메모", player: "음악 플레이어" };
    const scale = () => (desk.clientWidth < 420 ? 0.95 : 1.15);
    function place(x, y) {
      const maxX = desk.clientWidth - st.offsetWidth, maxY = desk.clientHeight - st.offsetHeight;
      x = clamp(x, 0, Math.max(0, maxX)); y = clamp(y, 0, Math.max(0, maxY));
      // 가장자리 가까이 가면 착 붙음 (앱처럼)
      if (x < 14) x = 0; if (maxX - x < 14) x = maxX; if (y < 14) y = 0; if (maxY - y < 14) y = maxY;
      st.style.left = x + "px"; st.style.top = y + "px";
    }
    function render() {
      const on = order;
      btns.forEach((b) => b.setAttribute("aria-pressed", String(on.includes(b.dataset.part))));
      const had = new Set([...st.children].map((i) => i.dataset.k));
      st.style.setProperty("--w", Math.round(WG.w * scale()) + "px");
      st.style.setProperty("--ov", -(WG.ov / 2 * scale()).toFixed(2) + "px");  // 겹침은 2배 촬영 px → 화면 px
      st.textContent = "";
      const add = (src, k, alt) => { const im = new Image(); im.src = src; im.alt = alt; im.dataset.k = k; im.draggable = false; if (had.size && !had.has(k)) im.classList.add("in"); st.appendChild(im); };
      add(on.length ? "img/w_mini_top.webp" : "img/w_mini_only.webp", "mini", "미니 화면");
      on.forEach((k, i) => add(`img/w_dock_${k}${i === on.length - 1 && (WG.last || []).includes(k) ? "_last" : ""}.webp`, k, NAME[k] + " 창"));
      requestAnimationFrame(() => place(st.offsetLeft, st.offsetTop));
    }
    btns.forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.part, i = order.indexOf(k);
      if (i >= 0) order.splice(i, 1);
      else if (k === "player") order.splice(0, order.length, k);
      else { const p = order.indexOf("player"); if (p >= 0) order.splice(p, 1); order.push(k); }
      render();
    }));
    let sx = 0, sy = 0, ox = 0, oy = 0, moving = false;
    st.addEventListener("pointerdown", (e) => { moving = true; st.setPointerCapture(e.pointerId); st.classList.add("drag"); sx = e.clientX; sy = e.clientY; ox = st.offsetLeft; oy = st.offsetTop; });
    st.addEventListener("pointermove", (e) => { if (moving) place(ox + e.clientX - sx, oy + e.clientY - sy); });
    const end = () => { moving = false; st.classList.remove("drag"); };
    st.addEventListener("pointerup", end); st.addEventListener("pointercancel", end);
    st.addEventListener("keydown", (e) => {
      const k = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
      if (k) { e.preventDefault(); place(st.offsetLeft + k[0], st.offsetTop + k[1]); }
    });
    window.addEventListener("resize", () => render());
    render();
  })();

  /* ═════ 2-4. 영수증 크게 보기 (2-0 창을 같이 씀) ═════ */
  $$(".rc-open").forEach((b) => b.addEventListener("click", () => zoom(b.querySelector("img"))));

  /* ═════ 3. 레퍼런스 보드 체험: 자유 · 웹툰 · 페이지 보기 ═════ */
  (function board() {
    const free = $("#bFree");
    if (!free) return;
    const PAGES = [1, 2, 3, 4, 5, 6].map((n) => `img/pg_${n}.webp`);
    const ITEMS = [
      { src: "img/pg_1.webp", alt: "밤 캠핑장 숲 그림", x: 3, y: 6, w: 22, r: -3 },
      { src: "img/f_hennyang.png", alt: "헨냥이 도트", x: 28, y: 10, w: 12, r: 4, px: 1 },
      { src: "img/pg_3.webp", alt: "달 뜬 산 그림", x: 43, y: 5, w: 20, r: 2 },
      { src: "img/f_mongus.png", alt: "몽구스 도트", x: 66, y: 12, w: 12, r: -5, px: 1 },
      { src: "img/pg_4.webp", alt: "친구 셋 그림", x: 80, y: 6, w: 17, r: 3 },
      { src: "img/f_beetle.png", alt: "아기장수풍뎅이 도트", x: 30, y: 58, w: 11, r: -2, px: 1 },
      { src: "img/pg_6.webp", alt: "친구 셋 그림", x: 46, y: 52, w: 16, r: 2 },
    ];
    let z = 10;
    const els = ITEMS.map((it) => {
      const f = document.createElement("figure");
      f.className = "b-item" + (it.px ? " px" : "");
      f.tabIndex = 0;
      f.setAttribute("role", "button");
      f.setAttribute("aria-label", it.alt + " (끌어서 옮기기 · 두 번 눌러 크게)");
      Object.assign(f.style, { left: it.x + "%", top: it.y + "%", width: it.w + "%", rotate: it.r + "deg", zIndex: ++z });
      f.innerHTML = `<img src="${it.src}" alt="" draggable="false">`;
      f._home = { ...it };
      free.appendChild(f);
      return f;
    });
    const toPct = (f) => ({ x: (f.offsetLeft / free.clientWidth) * 100, y: (f.offsetTop / free.clientHeight) * 100 });
    els.forEach((f) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, moving = false;
      f.addEventListener("pointerdown", (e) => {
        if (f.classList.contains("big")) return;
        moving = true; f.setPointerCapture(e.pointerId); f.classList.add("drag"); f.style.zIndex = ++z;
        sx = e.clientX; sy = e.clientY; ox = f.offsetLeft; oy = f.offsetTop;
      });
      f.addEventListener("pointermove", (e) => {
        if (!moving) return;
        const x = clamp(ox + e.clientX - sx, -f.offsetWidth * 0.4, free.clientWidth - f.offsetWidth * 0.6);
        const y = clamp(oy + e.clientY - sy, -f.offsetHeight * 0.4, free.clientHeight - f.offsetHeight * 0.6);
        f.style.left = (x / free.clientWidth) * 100 + "%"; f.style.top = (y / free.clientHeight) * 100 + "%";
      });
      const end = () => { if (moving) { moving = false; f.classList.remove("drag"); } };
      f.addEventListener("pointerup", end); f.addEventListener("pointercancel", end);
      f.addEventListener("dblclick", () => big(f));
      f.addEventListener("keydown", (e) => {
        const k = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key];
        if (k && !f.classList.contains("big")) { e.preventDefault(); const p = toPct(f); f.style.left = clamp(p.x + k[0], -10, 95) + "%"; f.style.top = clamp(p.y + k[1], -10, 92) + "%"; }
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); big(f); }
      });
    });
    function big(f) {
      if (f.classList.contains("big")) { Object.assign(f.style, f._prev); f.classList.remove("big"); return; }
      f._prev = { left: f.style.left, top: f.style.top, width: f.style.width, rotate: f.style.rotate };
      const ar = f.offsetHeight / f.offsetWidth;
      let w = 56; if (ar * w * free.clientWidth / 100 > free.clientHeight * 0.86) w = (free.clientHeight * 0.86) / ar / free.clientWidth * 100;
      f.classList.add("big"); f.style.zIndex = ++z;
      Object.assign(f.style, { width: w + "%", left: (100 - w) / 2 + "%", top: Math.max(2, (100 - (ar * w * free.clientWidth / free.clientHeight)) / 2) + "%", rotate: "0deg" });
    }
    $("#boardTidy").addEventListener("click", () => {
      els.forEach((f) => { if (f.classList.contains("big")) big(f); });
      const cols = window.innerWidth < 700 ? 3 : 4, gap = 2.5, w = (100 - gap * (cols + 1)) / cols;
      els.forEach((f, i) => {
        f.style.transition = reduce ? "none" : "left .45s var(--ease), top .45s var(--ease), width .45s var(--ease), rotate .45s var(--ease)";
        Object.assign(f.style, { width: w * (f._home.px ? 0.6 : 1) + "%", left: gap + (i % cols) * (w + gap) + "%", top: 5 + Math.floor(i / cols) * 50 + "%", rotate: "0deg" });
        setTimeout(() => (f.style.transition = ""), 500);
      });
    });
    // 웹툰 보기: 세로로 이어 보기 + 왼쪽 쪽 줄
    const strip = $("#bStrip"), scroll = $("#bScroll");
    PAGES.forEach((src, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.innerHTML = `<img src="${src}" alt="">${i + 1}쪽`; b.setAttribute("aria-label", `${i + 1}쪽으로`);
      b.addEventListener("click", () => scroll.children[i].scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }));
      strip.appendChild(b);
      const im = document.createElement("img");
      im.src = src; im.alt = `${i + 1}쪽`; im.loading = "lazy";
      scroll.appendChild(im);
    });
    scroll.addEventListener("scroll", () => {
      const top = scroll.scrollTop + scroll.clientHeight * 0.35;
      let cur = 0;
      [...scroll.children].forEach((im, i) => { if (im.offsetTop <= top) cur = i; });
      [...strip.children].forEach((b, i) => b.setAttribute("aria-current", String(i === cur)));
    }, { passive: true });
    strip.children[0].setAttribute("aria-current", "true");
    // 페이지 보기: 한 쪽씩 넘기기
    let pg = 0;
    const pimg = $("#bPageImg"), cnt = $("#bCount");
    function showPage(i) { pg = (i + PAGES.length) % PAGES.length; pimg.src = PAGES[pg]; pimg.alt = `${pg + 1}쪽`; cnt.textContent = `${pg + 1} / ${PAGES.length}쪽`; }
    $("#bPrev").addEventListener("click", () => showPage(pg - 1));
    $("#bNext").addEventListener("click", () => showPage(pg + 1));
    $("#bPage").addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") showPage(pg - 1); if (e.key === "ArrowRight") showPage(pg + 1); });
    showPage(0);
    // 보기 바꾸기
    const views = { free: $("#bFree"), toon: $("#bToon"), page: $("#bPage") };
    const HINT = { free: "그림을 끌어 보세요 · 두 번 누르면 크게 · 화살표 키로도 옮겨요", toon: "위아래로 스크롤해요 · 왼쪽 쪽 줄을 누르면 그 쪽으로 가요", page: "‹ › 단추나 화살표 키로 한 쪽씩 넘겨요" };
    $$("#boardModes button").forEach((b) => b.addEventListener("click", () => {
      $$("#boardModes button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      Object.entries(views).forEach(([k, el]) => (el.hidden = k !== b.dataset.mode));
      $("#boardTidy").hidden = b.dataset.mode !== "free";
      $("#boardHint").textContent = HINT[b.dataset.mode];
      if (b.dataset.mode === "page") $("#bNext").focus({ preventScroll: true });
    }));
  })();

  /* ═════ 4. 기본 친구 9 (도트 · 성격 · 말투 대사 = 앱 그대로) ═════ */
  (function friends() {
    const ul = $("#friends");
    if (!ul || !D.friends) return;
    D.friends.forEach((f) => {
      // 소개 한마디(첫 만남 대사) → 누를 때마다 다음 줄 (첫 만남 3줄 → 누를 때 대사)
      const lines = [...(f.intro || []), ...(f.lines || [])];
      let k = 0;
      const li = document.createElement("li");
      li.innerHTML = `<button type="button" class="fr" aria-pressed="false" aria-label="${f.name}에게 말 걸기">
        <span class="pic"><img src="img/f_${f.id}.png" width="64" height="64" alt="${f.name} 도트"></span>
        <b>${f.name}<small>${f.kw}</small></b>
        <span class="intro" aria-live="polite">“${lines[0] || ""}”</span>
        <span class="tag">말투 · ${f.style}</span>
      </button>`;
      const btn = $("button", li), img = $("img", li), say = $(".intro", li);
      let t = 0;
      btn.addEventListener("click", () => {
        k = (k + 1) % Math.max(1, lines.length);
        say.classList.remove("swap"); void say.offsetWidth; say.classList.add("swap");
        say.textContent = `“${lines[k]}”`;
        btn.setAttribute("aria-pressed", "true");
        img.src = `img/f_${f.id}_happy.png`;
        clearTimeout(t);
        t = setTimeout(() => { img.src = `img/f_${f.id}.png`; btn.setAttribute("aria-pressed", "false"); }, 1600);
      });
      ul.appendChild(li);
    });
  })();

  /* ═════ 5. 테마 (실제 앱 화면 · 밝음 / 어두움) ═════ */
  (function theme() {
    const box = $("#themePick"), img = $("#themeImg"), cap = $("#themeCap");
    if (!box || !img) return;
    const T = D.themes || {};
    const LIST = [["basic", "light"], ["basic", "dark"], ["hennyang", "light"], ["game", "light"], ["mono", "light"], ["halloween", "dark"], ["christmas", "light"]];
    const btns = LIST.map(([k, mode], i) => {
      const t = T[k] || { name: k, desc: "" };
      const src = `img/theme_${k}_${mode}.webp`;
      new Image().src = src;
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "radio");
      b.textContent = t.name + (mode === "dark" ? " · 어두움" : " · 밝음");
      b.setAttribute("aria-selected", String(i === 0));
      b.setAttribute("aria-checked", String(i === 0));
      b.addEventListener("click", () => {
        btns.forEach((x) => { x.setAttribute("aria-selected", String(x === b)); x.setAttribute("aria-checked", String(x === b)); });
        img.classList.add("fade");
        setTimeout(() => {
          img.src = src; img.alt = `${t.name} 테마(${mode === "dark" ? "어두움" : "밝음"})의 넨트래커 홈 화면`;
          cap.textContent = `${t.name} · ${t.desc}`;
          img.classList.remove("fade");
        }, reduce ? 0 : 160);
      });
      box.appendChild(b);
      return b;
    });
    addNav($('[data-screen="theme"]'), () => btns);
  })();
})();

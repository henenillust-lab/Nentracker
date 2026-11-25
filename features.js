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
      const li = document.createElement("li");
      li.innerHTML = `<button type="button" class="fr" aria-pressed="false">
        <span class="pic"><img src="img/f_${f.id}.png" width="64" height="64" alt="${f.name} 도트"></span>
        <b>${f.name}<small>${f.species}</small></b>
        <span class="desc">${f.desc}</span>
        <span class="say" aria-live="polite">말투 · ${f.style}</span>
      </button>`;
      const btn = $("button", li), img = $("img", li), say = $(".say", li);
      let t = 0;
      btn.addEventListener("click", () => {
        say.textContent = `“${pick(f.lines)}”`;
        btn.setAttribute("aria-pressed", "true");
        img.src = `img/f_${f.id}_happy.png`;
        clearTimeout(t);
        t = setTimeout(() => { img.src = `img/f_${f.id}.png`; btn.setAttribute("aria-pressed", "false"); }, 2200);
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
  })();
})();

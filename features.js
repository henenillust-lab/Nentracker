/* 넨트래커 랜딩 2판 — 밤하늘 · 기능 일곱 칸 '해 보기' (대사 · 테마 글 = data.js, 앱에서 뽑음) */
(() => {
  "use strict";
  const D = window.NT_DATA || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pick = (a) => (a && a.length ? a[Math.floor(Math.random() * a.length)] : "");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ── 꾹 누르면 계속 (앱 규칙: ± 단추는 모두 꾹 누르기) ── */
  function hold(btn, fn) {
    let t1 = 0, t2 = 0;
    const stop = () => { clearTimeout(t1); clearInterval(t2); };
    btn.addEventListener("pointerdown", (e) => { if (e.button) return; fn(); t1 = setTimeout(() => (t2 = setInterval(fn, 70)), 420); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, stop));
    btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } });
  }
  const deny = (el) => { if (reduce || !el.animate) return; el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 220 }); };

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
          big: r >= 0.965, c: r < 0.88 ? "236,232,255" : Math.random() < 0.5 ? "255,216,176" : "196,214,255",
        };
      });
      dust = [];  // 은하수: 비스듬한 띠를 따라 아주 작은 점
      const m = Math.round((W * H) / 2400);
      for (let i = 0; i < m; i++) {
        const t = Math.random(), off = (Math.random() + Math.random() + Math.random() - 1.5) * H * 0.17;
        dust.push({ x: t * W * 1.3 - W * 0.15, y: H * 0.98 - t * H * 0.95 + off, a: 0.04 + Math.random() * 0.1 });
      }
      nextShoot = performance.now() + 3000;
      draw(performance.now());
    }
    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      for (const d of dust) { ctx.fillStyle = `rgba(214,204,255,${d.a})`; ctx.fillRect(d.x, d.y, 1.2, 1.2); }
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
          g.addColorStop(0, `rgba(255,244,220,${0.9 * (1 - p)})`); g.addColorStop(1, "rgba(255,244,220,0)");
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

  /* ═════ 2. 들어올 때 움직임 (새 칸들) ═════ */
  const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  $$(".index, .feat").forEach((sec) => {
    const parts = [...$$(".feat-text > *, :scope > h2, :scope > p, :scope > ul", sec), ...[...sec.children].filter((c) => !c.classList.contains("feat-text") && c.tagName !== "H2" && c.tagName !== "P" && c.tagName !== "UL")];
    parts.forEach((el, i) => { el.classList.add("rise"); el.style.setProperty("--d", Math.min(i * 70, 420) + "ms"); io.observe(el); });
  });

  /* ═════ 3. 해 보기 / 실제 앱 화면 ═════ */
  $$(".view-seg").forEach((seg) => {
    const stage = seg.closest(".feat-stage") || seg.closest("section");
    $$("button", seg).forEach((b) => b.addEventListener("click", () => {
      $$("button", seg).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      $$("[data-pane]", stage).forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.view));
    }));
  });

  /* ═════ 4. 마감: 남은 분량 · 남은 날 · 쉬는 요일 → 하루 몫 ═════ */
  (function deadline() {
    const cal = $("#dlCal");
    if (!cal) return;
    const st = { amt: 12, days: 9, rest: new Set([0]), missed: 0 };
    const LIM = { amt: [1, 200], days: [1, 60] };
    const WD = "일월화수목금토";
    const out = { amt: $("#dlAmt"), days: $("#dlDays") };
    function render() {
      const t0 = new Date(); t0.setHours(0, 0, 0, 0);
      const list = [];
      for (let i = 0; i < st.days; i++) { const d = new Date(t0); d.setDate(t0.getDate() + i); list.push({ d, rest: st.rest.has(d.getDay()) }); }
      const work = list.filter((x) => !x.rest);
      const missed = Math.min(st.missed, work.length);
      work.slice(0, missed).forEach((x) => (x.missed = true));
      const live = work.slice(missed);
      const n = live.length;
      const base = n ? Math.floor(st.amt / n) : 0, extra = n ? st.amt % n : 0;
      live.forEach((x, i) => (x.q = base + (i < extra ? 1 : 0)));
      const maxQ = Math.max(1, ...live.map((x) => x.q));
      const planQ = Math.ceil(st.amt / Math.max(1, work.length));
      $("#dlD").textContent = "D-" + st.days;
      $("#dlSub").textContent = `남은 ${st.amt}컷 · 쉬는 날 빼고 ${work.length}일`;
      const first = live[0];
      $("#dlToday").textContent = first ? `${first.q}컷` : "—";
      const chip = $("#dlState");
      if (!n) { chip.textContent = "남은 작업일이 없어요"; chip.className = "ui-chip warn"; }
      else if (missed && maxQ > planQ) { chip.textContent = "조금 빠듯해요"; chip.className = "ui-chip warn"; }
      else { chip.textContent = "계획대로예요"; chip.className = "ui-chip ok"; }
      const restNames = [...st.rest].sort().map((w) => WD[w] + "요일").join(" · ");
      $("#dlNote").textContent = !n ? "쉬는 요일을 줄이거나 남은 날을 늘려 보세요."
        : missed ? `못 한 ${missed}일 몫을 남은 ${n}일에 다시 나눴어요.`
        : `${restNames ? restNames + "은 빼고 " : ""}하루 ${base}${extra ? "~" + (base + 1) : ""}컷씩 나눴어요.`;
      cal.innerHTML = "";
      list.slice(0, 14).forEach((x, i) => {
        const c = document.createElement("div");
        const isToday = first && x === first;
        c.className = "dcol" + (x.rest ? " rest" : "") + (x.missed ? " missed" : "") + (isToday ? " today" : "");
        const h = x.rest ? 4 : x.missed ? 4 : Math.max(8, Math.round((x.q / maxQ) * 100));
        c.innerHTML = `<b>${x.rest ? "쉼" : x.missed ? "0" : x.q}</b><i style="height:${h}px"></i><span>${i === 0 ? "오늘" : WD[x.d.getDay()]}</span>`;
        c.setAttribute("aria-label", `${x.d.getMonth() + 1}월 ${x.d.getDate()}일 ${x.rest ? "쉬는 날" : x.missed ? "못 한 날" : x.q + "컷"}`);
        cal.appendChild(c);
      });
      out.amt.textContent = st.amt; out.days.textContent = st.days;
    }
    $$(".pm").forEach((b) => hold(b, () => {
      const k = b.dataset.k, v = st[k] + +b.dataset.d, [lo, hi] = LIM[k];
      if (v < lo || v > hi) { deny(out[k]); return; }
      st[k] = v; st.missed = 0; render();
    }));
    $$(".chip[data-wd]").forEach((c) => c.addEventListener("click", () => {
      const w = +c.dataset.wd;
      if (st.rest.has(w)) st.rest.delete(w);
      else if (st.rest.size >= 6) { deny(c); return; } else st.rest.add(w);
      c.setAttribute("aria-pressed", String(st.rest.has(w)));
      st.missed = 0; render();
    }));
    $("#dlMiss").addEventListener("click", (e) => {
      const workDays = [...Array(st.days)].filter((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return !st.rest.has(d.getDay()); }).length;
      if (st.missed + 1 >= workDays) { deny(e.currentTarget); return; }
      st.missed += 1; render();
    });
    render();
  })();

  /* ═════ 5. 리포트: 관찰 다섯 장 (시험 데이터 리포트와 같은 내용) ═════ */
  (function report() {
    const box = $(".ui-rp");
    if (!box) return;
    const R = window.NT_REPORT || [];
    const tabs = $$(".rp-pick button");
    function show(i) {
      const c = R[i];
      if (!c) return;
      tabs.forEach((t, j) => t.setAttribute("aria-selected", String(i === j)));
      $("#rpNo").textContent = i + 1; $("#rpQ").textContent = c.q;
      $("#rpT").textContent = c.title; $("#rpD").textContent = c.desc;
      $("#rpFig").innerHTML = c.fig || "";
      [$("#rpT"), $("#rpFig"), $("#rpD")].forEach((el) => { el.classList.remove("rp-anim"); void el.offsetWidth; el.classList.add("rp-anim"); });
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(i));
      t.addEventListener("keydown", (e) => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); const n = (i + k + tabs.length) % tabs.length; tabs[n].focus(); show(n); }
      });
    });
    show(0);
  })();

  /* ═════ 6. 셀프 출퇴근: 출근 전 → 근무 중 ⇄ 쉬는 중 → 퇴근 뒤 ═════ */
  (function work() {
    const btns = $("#wkBtns");
    if (!btns) return;
    const W = D.work || {};
    const st = { s: "before", clock: 9 * 60 + 52, worked: 0, offAt: 0 };
    const CHIP = { before: ["출근 전", ""], work: ["근무 중", "on"], rest: ["쉬는 중", "warn"], off: ["퇴근 뒤", "ok"] };
    const say = (t) => { if (t) $("#wkSay").textContent = t; };
    const fmt = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    let tick = 0;
    function draw() {
      const [txt, cls] = CHIP[st.s];
      const chip = $("#wkChip"); chip.textContent = txt; chip.className = "ui-chip " + cls;
      $("#wkClock").textContent = fmt(st.clock);
      $("#wkTime").textContent = `${Math.floor(st.worked / 60)}시간 ${st.worked % 60}분`;
      $("#wkBar").style.width = Math.min(100, (st.worked / 480) * 100) + "%";
      const B = { before: [["출근", "go", 1]], work: [["쉬기", "rest"], ["퇴근", "off", 1]], rest: [["다시 시작", "back", 1], ["퇴근", "off"]], off: st.clock - st.offAt <= 30 ? [["퇴근 취소", "undo"]] : [["처음부터", "reset"]] }[st.s];
      btns.innerHTML = "";
      B.forEach(([label, act, pri]) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "ui-btn" + (pri ? " pri" : ""); b.textContent = label;
        b.addEventListener("click", () => act_(act));
        btns.appendChild(b);
      });
    }
    function run(on) {
      clearInterval(tick);
      if (!on) return;
      tick = setInterval(() => {  // 체험이라 1초 = 7분
        st.clock += 7;
        if (st.s === "work") st.worked += 7;
        if (st.s === "work" && st.worked >= 480 && st.worked < 487) say(pick(W.work_out_ask));
        if (st.s === "off" && st.clock - st.offAt > 30) { run(false); }
        draw();
      }, reduce ? 400 : 1000);
    }
    const today = $(".cal-grid .d.today");
    function act_(a) {
      if (a === "go") { st.s = "work"; st.clock = Math.max(st.clock, 10 * 60); say(pick(W.work_in)); run(true); }
      if (a === "rest") { st.s = "rest"; say(pick(W.n_pomo_break_care)); }
      if (a === "back") { st.s = "work"; say(pick(D.talk && D.talk.work)); }
      if (a === "off") {
        st.s = "off"; st.offAt = st.clock; say(pick(W.work_out));
        const t = $(".cal-grid .d.today"); if (t) { t.classList.add("stamp", "pop"); }
      }
      if (a === "undo") { st.s = "work"; const t = $(".cal-grid .d.today"); if (t) t.classList.remove("stamp", "pop"); say("퇴근 취소했어요. 조금만 더 하자냥"); run(true); }
      if (a === "reset") { Object.assign(st, { s: "before", clock: 9 * 60 + 52, worked: 0, offAt: 0 }); run(false); const t = $(".cal-grid .d.today"); if (t) t.classList.remove("stamp", "pop"); say(pick(W.work_in_ask)); }
      draw();
    }
    // 근태 기록부: 이번 달 · 지난 평일 = 출근 · 퇴근 도장, 주말 = 쉬는 날
    const grid = $("#wkCal");
    const now = new Date(), y = now.getFullYear(), m = now.getMonth();
    $(".ui-cal small").textContent = `${m + 1}월`;
    $(".ui-cal").setAttribute("aria-label", `근태 기록부 ${m + 1}월`);
    grid.innerHTML = [..."일월화수목금토"].map((w) => `<span class="wd">${w}</span>`).join("");
    const first = new Date(y, m, 1).getDay(), last = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < first; i++) grid.insertAdjacentHTML("beforeend", "<span></span>");
    for (let d = 1; d <= last; d++) {
      const wd = new Date(y, m, d).getDay(), past = d < now.getDate();
      const cls = d === now.getDate() ? "d today" : past && wd > 0 && wd < 6 ? "d stamp" : past ? "d soft" : "d";
      grid.insertAdjacentHTML("beforeend", `<span class="${cls}">${d}</span>`);
    }
    say(pick(W.work_in_ask) || "출근 도장 찍으러 가자냥");
    draw();
    void today;
  })();

  /* ═════ 7. 레퍼런스 보드: 끌어 옮기기 · 두 번 눌러 크게 · 가지런히 ═════ */
  (function board() {
    const bd = $("#boardCanvas");
    if (!bd) return;
    const ITEMS = [
      { src: "img/og.png", alt: "밤 캠핑장 모닥불 장면", x: 3, y: 7, w: 34, r: -3 },
      { src: "img/hennyang.png", alt: "헨냥이 도트", x: 40, y: 12, w: 13, r: 4, px: 1 },
      { src: "img/desk_friend.png", alt: "바탕화면에 앉은 헨냥이", x: 56, y: 6, w: 14, r: -5, px: 1 },
      { src: "img/shot_visit.webp", alt: "이웃 캠핑장에 놀러 간 화면", x: 74, y: 9, w: 20, r: 3 },
      { src: "img/hennyang_happy.png", alt: "웃는 헨냥이 도트", x: 44, y: 55, w: 12, r: -2, px: 1 },
      { src: "img/l_maker.webp", alt: "새 친구 만들기 창", x: 8, y: 58, w: 28, r: 2 },
    ];
    let z = 10;
    const els = ITEMS.map((it, i) => {
      const f = document.createElement("figure");
      f.className = "b-item" + (it.px ? " px" : "");
      f.tabIndex = 0;
      f.setAttribute("role", "button");
      f.setAttribute("aria-label", it.alt + " (끌어서 옮기기 · 두 번 눌러 크게)");
      f.style.left = it.x + "%"; f.style.top = it.y + "%"; f.style.width = it.w + "%"; f.style.rotate = it.r + "deg"; f.style.zIndex = ++z;
      f.innerHTML = `<img src="${it.src}" alt="" draggable="false">`;
      f._home = { ...it };
      bd.appendChild(f);
      return f;
    });
    function toPct(f) { return { x: (f.offsetLeft / bd.clientWidth) * 100, y: (f.offsetTop / bd.clientHeight) * 100 }; }
    els.forEach((f) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, moving = false;
      f.addEventListener("pointerdown", (e) => {
        if (f.classList.contains("big")) return;
        moving = true; f.setPointerCapture(e.pointerId); f.classList.add("drag"); f.style.zIndex = ++z;
        sx = e.clientX; sy = e.clientY; ox = f.offsetLeft; oy = f.offsetTop;
      });
      f.addEventListener("pointermove", (e) => {
        if (!moving) return;
        const x = clamp(ox + e.clientX - sx, -f.offsetWidth * 0.4, bd.clientWidth - f.offsetWidth * 0.6);
        const y = clamp(oy + e.clientY - sy, -f.offsetHeight * 0.4, bd.clientHeight - f.offsetHeight * 0.6);
        f.style.left = (x / bd.clientWidth) * 100 + "%"; f.style.top = (y / bd.clientHeight) * 100 + "%";
      });
      const end = () => { if (!moving) return; moving = false; f.classList.remove("drag"); };
      f.addEventListener("pointerup", end); f.addEventListener("pointercancel", end);
      f.addEventListener("dblclick", () => big(f));
      f.addEventListener("keydown", (e) => {
        const k = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key];
        if (k && !f.classList.contains("big")) { e.preventDefault(); const p = toPct(f); f.style.left = clamp(p.x + k[0], -10, 95) + "%"; f.style.top = clamp(p.y + k[1], -10, 92) + "%"; }
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); big(f); }
      });
    });
    function big(f) {
      if (f.classList.contains("big")) {
        const p = f._prev;
        f.animate && !reduce && f.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 200 });
        Object.assign(f.style, p); f.classList.remove("big");
        return;
      }
      f._prev = { left: f.style.left, top: f.style.top, width: f.style.width, rotate: f.style.rotate };
      const ar = f.offsetHeight / f.offsetWidth;
      let w = 60; if (ar * w * bd.clientWidth / 100 > bd.clientHeight * 0.86) w = (bd.clientHeight * 0.86) / ar / bd.clientWidth * 100;
      f.classList.add("big"); f.style.zIndex = ++z;
      Object.assign(f.style, { width: w + "%", left: (100 - w) / 2 + "%", top: Math.max(2, (100 - (ar * w * bd.clientWidth / bd.clientHeight)) / 2) + "%", rotate: "0deg" });
    }
    $("#boardTidy").addEventListener("click", () => {
      els.forEach((f) => { if (f.classList.contains("big")) big(f); });
      const cols = window.innerWidth < 700 ? 2 : 3, gap = 3, w = (100 - gap * (cols + 1)) / cols;
      els.forEach((f, i) => {
        f.style.transition = reduce ? "none" : "left .45s var(--ease), top .45s var(--ease), width .45s var(--ease), rotate .45s var(--ease)";
        Object.assign(f.style, { width: w * (f._home.px ? 0.55 : 1) + "%", left: gap + (i % cols) * (w + gap) + "%", top: 5 + Math.floor(i / cols) * 48 + "%", rotate: "0deg" });
        setTimeout(() => (f.style.transition = ""), 500);
      });
    });
  })();

  /* ═════ 8. 미니 화면 접기 ═════ */
  (function mini() {
    const b = $("#miniGo"), stg = $("#miniStage");
    if (!b || !stg) return;
    const small = $(".mini-small", stg), main_ = $(".mini-main", stg);
    let t = 0;
    b.addEventListener("click", () => {
      const on = !stg.classList.contains("folded");
      clearTimeout(t);
      // 안 보이는 쪽은 hidden 으로 빼 둠 (투명한 그림을 화면에 남기지 않음)
      (on ? small : main_).hidden = false;
      void stg.offsetWidth;  // 꺼낸 그림이 먼저 자리를 잡은 뒤 움직이게
      stg.classList.toggle("folded", on);
      t = setTimeout(() => { (on ? main_ : small).hidden = true; }, reduce ? 0 : 950);
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? "다시 펴기" : "작게 접기";
    });
  })();

  /* ═════ 9. 캐릭터 만들기: 16 × 16 도트 · 말투 ═════ */
  (function maker() {
    const grid = $("#pxGrid");
    if (!grid) return;
    const PAL = ["#2b1d2e", "#d98a8a", "#f2c2b8", "#ffffff", "#ff8fa3", "#ffcf6b", "#7fc8a9", "#7b8cff"];
    const KEY = { o: 0, f: 1, l: 2, w: 3, p: 4, y: 5, g: 6, b: 7 };
    const HALF = ["........", "..o.....", "..oo....", "..ofo...", "..offooo", "..offfff", "..offfff", "..ofwoff", "..ofooff",
      "..opffff", "..offfll", "...offlo", "...offff", "..offfff", "..offfff", "...ooooo"];
    const SAMPLE = HALF.map((h) => h + [...h].reverse().join(""));
    const N = 16, cells = new Array(N * N).fill(-1);
    let color = 1, erase = false, down = false, cur = 0;
    for (let i = 0; i < N * N; i++) { const c = document.createElement("div"); c.dataset.i = i; grid.appendChild(c); }
    grid.tabIndex = 0;
    const pv = $("#pvCanvas"), pctx = pv.getContext("2d");
    function paintPv() {
      pctx.clearRect(0, 0, N, N);
      cells.forEach((v, i) => { if (v >= 0) { pctx.fillStyle = PAL[v]; pctx.fillRect(i % N, Math.floor(i / N), 1, 1); } });
    }
    function setCell(i, v) {
      if (i < 0 || i >= N * N || cells[i] === v) return;
      cells[i] = v; grid.children[i].style.background = v >= 0 ? PAL[v] : "";
      paintPv();
    }
    function load(rows) { rows.forEach((r, y) => [...r].forEach((ch, x) => setCell(y * N + x, ch === "." ? -1 : KEY[ch]))); }
    const at = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.parentElement === grid ? +el.dataset.i : -1; };
    grid.addEventListener("pointerdown", (e) => { down = true; grid.setPointerCapture(e.pointerId); const i = at(e); if (i >= 0) { cur = i; setCell(i, erase ? -1 : color); } });
    grid.addEventListener("pointermove", (e) => { if (down) { const i = at(e); if (i >= 0) setCell(i, erase ? -1 : color); } });
    const up = () => { if (!down) return; down = false; hop(); };
    grid.addEventListener("pointerup", up); grid.addEventListener("pointercancel", up);
    function mark() { [...grid.children].forEach((c, i) => (c.style.outline = i === cur && document.activeElement === grid ? "2px solid #5b6cff" : "")); }
    grid.addEventListener("focus", mark); grid.addEventListener("blur", mark);
    grid.addEventListener("keydown", (e) => {
      const k = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -N, ArrowDown: N }[e.key];
      if (k) { e.preventDefault(); cur = clamp(cur + k, 0, N * N - 1); mark(); }
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setCell(cur, erase ? -1 : color); }
    });
    const pal = $("#pxPal");
    PAL.forEach((c, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.style.background = c; b.setAttribute("role", "radio"); b.setAttribute("aria-label", "색 " + (i + 1));
      b.setAttribute("aria-checked", String(i === color));
      b.addEventListener("click", () => { color = i; erase = false; $("#pxErase").setAttribute("aria-pressed", "false"); $$("button", pal).forEach((x, j) => x.setAttribute("aria-checked", String(j === i))); });
      pal.appendChild(b);
    });
    $("#pxErase").addEventListener("click", (e) => { erase = !erase; e.currentTarget.setAttribute("aria-pressed", String(erase)); });
    $("#pxClear").addEventListener("click", () => { for (let i = 0; i < N * N; i++) setCell(i, -1); $("#pvBubble").textContent = "빈 판이에요. 칸을 눌러 그려 보세요"; });
    $("#pxSample").addEventListener("click", () => { load(SAMPLE); hop(); });
    // 말투 (앱 nt_speech 말투별 '누를 때' 대사)
    const S = D.styles || {};
    let style = "nyang";
    const box = $("#pvStyles");
    Object.entries(S).forEach(([k, v]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = v.name; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", String(k === style));
      b.addEventListener("click", () => { style = k; $$("button", box).forEach((x) => x.setAttribute("aria-checked", String(x === b))); talk(); });
      box.appendChild(b);
    });
    const ch = $("#pvChar");
    function hop() { if (reduce) return; ch.classList.remove("hop"); void ch.offsetWidth; ch.classList.add("hop"); }
    function talk() { const s = S[style]; $("#pvBubble").textContent = (s && pick(s.lines)) || "안녕!"; hop(); }
    ch.addEventListener("click", talk);
    load(SAMPLE);
  })();

  /* ═════ 10. 테마 바꾸기 (실제 앱 화면 · 밝음 / 어두움) ═════ */
  (function theme() {
    const box = $("#themePick"), img = $("#themeImg"), cap = $("#themeCap");
    if (!box || !img) return;
    const T = D.themes || {};
    const LIST = [["basic", "light"], ["basic", "dark"], ["hennyang", "light"], ["game", "light"], ["mono", "light"], ["halloween", "dark"], ["christmas", "light"]];
    LIST.forEach(([k, mode], i) => {
      const t = T[k] || { name: k, desc: "" };
      const src = `img/theme_${k}_${mode}.webp`;
      new Image().src = src;
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.setAttribute("role", "radio");
      b.textContent = t.name + (mode === "dark" ? " · 어두움" : " · 밝음");
      b.setAttribute("aria-checked", String(i === 0));
      b.addEventListener("click", () => {
        $$("button", box).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
        img.classList.add("fade");
        setTimeout(() => {
          img.src = src; img.alt = `${t.name} 테마(${mode === "dark" ? "어두움" : "밝음"})의 넨트래커 홈 화면`;
          cap.textContent = `${t.name} · ${t.desc}`;
          img.classList.remove("fade");
        }, reduce ? 0 : 180);
      });
      box.appendChild(b);
    });
  })();
})();

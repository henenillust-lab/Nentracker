/* 넨트래커 랜딩 — 들어올 때 움직임 · 헨냥이 말풍선 · 읽을수록 자라는 모닥불 (대사 = data.js, tools/landing/build.py 가 앱에서 뽑음) */
(() => {
  "use strict";
  const D = window.NT_DATA || { talk: {}, fire: {} };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const pick = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : "");

  /* ── 들어올 때: 칸마다 제목 → 글 → 그림 차례로 ── */
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -10% 0px" });
  const add = (el, i) => { el.classList.add("rise"); el.style.setProperty("--d", Math.min(i * 80, 480) + "ms"); io.observe(el); };
  document.querySelectorAll(".block").forEach((sec) => [...sec.children].forEach(add));
  document.querySelectorAll(".band").forEach((sec) => {
    const parts = sec.querySelectorAll(":scope > h2, :scope > p, :scope > ul, :scope > .sw-btns, :scope > .board-wrap, :scope > figure, .feat-text > *, .feat-shot, .friends-head > *, .letter > *, .faq > *, .neighbors > figure, .multi-text > *");
    parts.forEach((el, i) => add(el, i % 8));
  });
  document.querySelectorAll(".cta-text > *, .cta-pet").forEach(add);

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
  let stage = 1, front = fa, back = fb;
  const said = {};
  for (let s = 2; s <= 8; s++) { const im = new Image(); im.src = `img/fire${s}.webp`; }
  function setStage(s) {
    if (s === stage || !front || !back) return;
    stage = s;
    // 두 장을 엇갈려 바꿔 끼움 · 다 사라진 쪽은 감춤 (투명한 그림을 화면에 남겨 두지 않음)
    const inc = back, out = front;
    inc.style.opacity = "0";
    inc.src = `img/fire${s}.webp`;
    inc.hidden = false;
    void inc.offsetWidth;
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
})();

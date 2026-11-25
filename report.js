/* 리포트 관찰 다섯 장 — 시험 데이터(홍보용 깨끗한 기록 5주)로 앱이 실제로 쓴 문장 그대로 (ui_qt/pages/report_obs.py 카드 꼴)
   원본 화면: tools/_out/landing_light/report_obs.png (다시 찍기 = python tools/landing/cap/run.py report) · 앱 화면이 바뀌면 그 그림을 보고 고쳐요 */
(() => {
  const STAR = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#fff" d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
  window.NT_REPORT = [
    {
      q: "얼마나",
      title: "이번 달 집중 67시간 36분 · 지난달과 비슷해요",
      fig: `<div class="stamps"><span class="s full"><i>${STAR}</i>1주</span><span class="s full"><i>${STAR}</i>2주</span><span class="s full"><i>${STAR}</i>3주</span><span class="s half"><i></i>4주</span><span class="s"><i></i>5주</span></div>`,
      desc: "주마다 도장을 채워요. 가득 차면 하루 목표(3시간)를 채운 주예요.",
    },
    {
      q: "어떻게",
      title: "한 번 앉으면 보통 22분 이어 가요",
      fig: '<div class="rbar"><span>이번 달</span><i style="width:100%"></i><b>22분</b></div><div class="rbar ghost"><span>평소</span><i style="width:86%"></i><b>19분</b></div><div class="rchips"><span>앉자마자 시작했어요</span><span>28분쯤 지나면 자주 다른 창으로</span></div>',
      desc: "가장 길게는 72분 앉아 있었어요. 잘하고 못하고가 아니라, 내 집중이 어떤 모양인지 보여 줘요.",
    },
    {
      q: "언제, 어떤 날",
      title: "아침 10시 ~ 낮 12시에 가장 깊게 몰입해요",
      fig: '<div class="when"><span class="on">아침</span><span>오후</span><span>저녁</span><span>밤</span></div><div class="rchips"><span>이런 날은 달랐어요 · 화요일에 집중이 긴 편이에요</span></div>',
      desc: "하루 중 잘 되는 때와, 유난히 달랐던 요일을 짚어 줘요.",
    },
    {
      q: "무엇이 끊었나",
      title: "작업 중 딴짓은 하루 한두 번뿐이었어요",
      fig: '<div class="rnum"><span><b>13번</b>작업한 23일 동안</span><span><b>0.6번</b>하루 평균</span></div>',
      desc: "작업하다 다른 데로 간 때만 세요. 쉬는 시간 · 퇴근 뒤 놀이는 세지 않아요.",
    },
    {
      q: "다음 한 걸음",
      title: "지금 흐름 그대로 가요",
      fig: '<div class="next">실험할 만큼 약한 곳이 없어요.</div><div class="rchips"><span>웹툰 12화 마감: 지금 속도면 2~4일 일찍 끝나요</span><span>1컷당 시간이 조금 늘었어요</span></div>',
      desc: "약한 곳이 보이면 ‘다음엔 이렇게 해 볼까요’ 하나만 권해요. 판정하지 않아요.",
    },
  ];
})();

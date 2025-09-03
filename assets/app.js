/* ================= Header：透明→毛玻璃 ================= */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 50);
});

/* ================= Mobile Menu ================= */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.classList.toggle('no-scroll', !expanded);
  });
}

/* ================= Reveal Animations ================= */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }
})();

/* ================= 技术卡片：点击/键盘 → 平滑居中（FLIP） ================= */
(() => {
  const row = document.querySelector('.tech-tilt-row');
  if (!row) return;
  let cards = Array.from(row.querySelectorAll('.tilt-card'));
  if (cards.length !== 3) return;

  let centerIdx = cards.findIndex(c => c.classList.contains('tilt-center'));
  if (centerIdx < 0) centerIdx = 1;

  function applyClasses() {
    const leftIndex  = (centerIdx + cards.length - 1) % cards.length;
    const rightIndex = (centerIdx + 1) % cards.length;
    cards.forEach(c => c.classList.remove('tilt-left','tilt-center','tilt-right'));
    cards[leftIndex].classList.add('tilt-left');
    cards[centerIdx].classList.add('tilt-center');
    cards[rightIndex].classList.add('tilt-right');
  }

  function focusCard(idx) {
    if (idx === centerIdx) return;
    const prevScroll = window.scrollY;

    const first = cards.map(card => card.getBoundingClientRect());
    centerIdx = idx;

    const left  = cards[(centerIdx + cards.length - 1) % cards.length];
    const center= cards[centerIdx];
    const right = cards[(centerIdx + 1) % cards.length];

    row.appendChild(left); row.appendChild(center); row.appendChild(right);
    cards = [left, center, right];

    applyClasses();
    const last = cards.map(card => card.getBoundingClientRect());

    cards.forEach((card, i) => {
      const dx = first[i].left - last[i].left;
      const dy = first[i].top - last[i].top;
      card.style.transition = 'transform 0s';
      card.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    requestAnimationFrame(() => {
      cards.forEach(card => {
        card.style.transition = 'transform 0.6s cubic-bezier(.22,.61,.36,1)';
        card.style.transform = '';
      });
      window.scrollTo({ top: prevScroll, behavior: 'auto' });
    });
  }

  row.addEventListener('click', e => {
    const card = e.target.closest('.tilt-card');
    if (!card) return;
    const idx = cards.indexOf(card);
    if (idx > -1) {
      e.preventDefault();
      e.stopPropagation();
      focusCard(idx);
    }
  });

  cards.forEach(c => {
    c.tabIndex = 0; c.setAttribute('role','button');
    c.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusCard(cards.indexOf(c)); }
    });
  });

  applyClasses();
})();

/* ================= 合作伙伴：无缝滚动 + 悬停卡片 ================= */
(() => {
  const track = document.getElementById('partners-track');
  if (!track) return;

  // 复制一份内容以实现无缝滚动
  track.innerHTML += track.innerHTML;

  // CSS 动画足够顺滑，此处只做 hover 暂停（CSS 已处理）与 tooltip
  const tooltip = document.getElementById('logo-tooltip');
  const nameEl  = tooltip?.querySelector('.logo-tooltip__name');
  const descEl  = tooltip?.querySelector('.logo-tooltip__desc');
  const linkEl  = tooltip?.querySelector('.logo-tooltip__link');

  if (!tooltip || !nameEl || !descEl || !linkEl) return;

  function showTip(a, x, y) {
    nameEl.textContent = a.dataset.name || a.querySelector('img')?.alt || '合作伙伴';
    descEl.textContent = a.dataset.desc || '';
    linkEl.href = a.href || '#';
    tooltip.hidden = false;

    const pad = 12;
    const { innerWidth: W, innerHeight: H } = window;
    let left = x + pad, top = y + pad;
    tooltip.style.transform = 'translate(0,0)';
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > W) tooltip.style.left = (W - rect.width  - pad) + 'px';
    if (rect.bottom > H) tooltip.style.top  = (H - rect.height - pad) + 'px';
  }
  function hideTip(){ tooltip.hidden = true; }

  document.querySelectorAll('.marquee .logo-item').forEach(a => {
    a.addEventListener('mouseenter', e => showTip(a, e.clientX, e.clientY));
    a.addEventListener('mousemove',  e => showTip(a, e.clientX, e.clientY));
    a.addEventListener('mouseleave', hideTip);

    // 触屏支持：点一次显示，再点空白处隐藏
    a.addEventListener('touchstart', e => {
      const t = e.touches[0]; showTip(a, t.clientX, t.clientY);
    }, {passive:true});
  });
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.logo-item')) hideTip();
  }, {passive:true});
})();

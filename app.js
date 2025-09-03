/* ================= Header：透明→毛玻璃 ================= */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 50);
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
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }
})();



/* ===== 合作伙伴：无缝滚动 + 悬停提示 ===== */
(() => {
  const track = document.getElementById('partners-track');
  if (!track) return;
  // 复制一份以实现无缝滚动
  track.innerHTML += track.innerHTML;

  const tooltip = document.getElementById('logo-tooltip');
  const nameEl  = tooltip?.querySelector('.logo-tooltip__name');
  const descEl  = tooltip?.querySelector('.logo-tooltip__desc');
  const linkEl  = tooltip?.querySelector('.logo-tooltip__link');

  function showTip(a, x, y){
    if (!tooltip) return;
    nameEl.textContent = a.dataset.name || a.querySelector('img')?.alt || '合作伙伴';
    descEl.textContent = a.dataset.desc || '';
    linkEl.href = a.href || '#';
    tooltip.hidden = false;
    const pad = 12;
    const { innerWidth: W, innerHeight: H } = window;
    let left = x + pad, top = y + pad;
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > W) tooltip.style.left = (W - rect.width  - pad) + 'px';
    if (rect.bottom > H) tooltip.style.top = (H - rect.height - pad) + 'px';
  }
  function hideTip(){ if (tooltip) tooltip.hidden = true; }

  document.querySelectorAll('.marquee .logo-item').forEach(a => {
    a.addEventListener('mouseenter', e => showTip(a, e.clientX, e.clientY));
    a.addEventListener('mousemove',  e => showTip(a, e.clientX, e.clientY));
    a.addEventListener('mouseleave', hideTip);
    a.addEventListener('touchstart', e => {
      const t = e.touches[0]; showTip(a, t.clientX, t.clientY);
    }, {passive:true});
  });
  document.addEventListener('touchstart', e => {
    if (!e.target.closest('.logo-item')) hideTip();
  }, {passive:true});
})();


/* ===== 技术优势：点击放大、加边框并播放视频 ===== */

(() => {
  const cards = document.querySelectorAll('.tech-tilt-row .tilt-card');
  if (!cards || cards.length === 0) return;

  // 默认激活中间的卡片
  const initialActiveCard = cards[1] || cards[0];
  
  function setActiveCard(cardToActivate) {
    // 遍历所有卡片
    cards.forEach(card => {
      const video = card.querySelector('video');
      if (card === cardToActivate) {
        // 对要激活的卡片：添加 active 类并播放视频
        card.classList.add('active-card');
        if (video) {
          const src = card.getAttribute('data-video');
          if (src && !video.src) {
            video.src = src;
          }
          video.muted = true;
          video.playsInline = true;
          video.play().catch(() => {}); // 播放视频
        }
      } else {
        // 对其他卡片：移除 active 类并暂停视频
        card.classList.remove('active-card');
        if (video) {
          video.pause(); // 暂停视频
        }
      }
    });
  }

  // 为每张卡片添加点击事件
  cards.forEach(card => {
    card.addEventListener('click', () => {
      setActiveCard(card);
    });
  });

  // 页面加载时，自动激活初始卡片
  setActiveCard(initialActiveCard);
})();
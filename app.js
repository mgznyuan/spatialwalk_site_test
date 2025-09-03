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

/* ================= Landing Video Aspect Ratio (Fixed) ================= */
// We wrap this in a DOMContentLoaded event to ensure the element exists when we try to select it.
document.addEventListener('DOMContentLoaded', () => {
  const videoPlayer = document.getElementById('value-demo');
  if (videoPlayer) {
    // This event fires when the browser has loaded metadata for the video.
    videoPlayer.addEventListener('loadedmetadata', () => {
      const videoWidth = videoPlayer.videoWidth;
      const videoHeight = videoPlayer.videoHeight;
      // We check for valid dimensions to avoid errors.
      if (videoWidth > 0 && videoHeight > 0) {
        // We remove the fixed aspect ratio from the parent container and set it on the video itself.
        if (videoPlayer.parentElement) {
            videoPlayer.parentElement.style.aspectRatio = 'auto';
        }
        videoPlayer.style.aspectRatio = `${videoWidth} / ${videoHeight}`;
      }
    });
    // This handles cases where the video might already be loaded (e.g., from cache).
    if (videoPlayer.readyState >= 1) {
        videoPlayer.dispatchEvent(new Event('loadedmetadata'));
    }
  }
});


/* ===== 技术优势卡片交互 (全部自动播放) ===== */
(() => {
  const cards = document.querySelectorAll('.tech-tilt-row .tilt-card');
  if (!cards || cards.length === 0) return;

  function setupAndPlayAllVideos() {
    cards.forEach(card => {
      const video = card.querySelector('video');
      const src = card.getAttribute('data-video');
      if (video && src) {
        // Set video attributes
        video.src = src;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        
        // Attempt to play the video
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Autoplay was prevented.
            console.warn("Autoplay was prevented for video:", src, error);
          });
        }
      }
    });
  }

  // Call the function to set up and play all videos on page load
  setupAndPlayAllVideos();

  // The click-to-play interaction has been removed as all videos now autoplay.
})();

/* ===== 合作伙伴：无缝滚动 + 悬停提示 (代码保留，但HTML中已隐藏) ===== */
(() => {
  const track = document.getElementById('partners-track');
  if (!track) return;
  // 复制一份以实现无缝滚动
  const originalContent = track.innerHTML;
  track.innerHTML += originalContent;

  const tooltip = document.getElementById('logo-tooltip');
  if (!tooltip) return;
  
  const nameEl  = tooltip.querySelector('.logo-tooltip__name');
  const descEl  = tooltip.querySelector('.logo-tooltip__desc');
  const linkEl  = tooltip.querySelector('.logo-tooltip__link');

  function showTip(a, x, y){
    if (!nameEl || !descEl || !linkEl) return;
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


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

    // FIX: Observer for the new multi-stage trilemma animation
    const trilemmaWrapper = document.getElementById('trilemma-container');
    if (trilemmaWrapper) {
      const trilemmaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // After the intro animation completes, add a class to trigger the next stage
            setTimeout(() => {
              entry.target.classList.add('animate-complete');
            }, 3200); // Timed to start after logo appears
            trilemmaObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      trilemmaObserver.observe(trilemmaWrapper);
    }
  }
})();


/* ================= Demo Video Adjustment ================= */
document.addEventListener('DOMContentLoaded', () => {
  const videoPlayer = document.getElementById('value-demo');
  if (videoPlayer) {
    videoPlayer.addEventListener('error', (err) => {
      console.error('Video loading error:', err);
    });
    videoPlayer.load();
  }
});


/* ===== 技术优势卡片视频 ===== */
(() => {
  const cards = document.querySelectorAll('.tech-tilt-row .tilt-card');
  if (!cards || cards.length === 0) return;

  function setupAndPlayAllVideos() {
    cards.forEach(card => {
      const video = card.querySelector('video');
      const src = card.getAttribute('data-video');
      if (video && src) {
        video.src = src;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.play().catch(error => {});
      }
    });
  }
  setupAndPlayAllVideos();
})();


/* ===================================================
   Lottie Animation Loader
   =================================================== */
document.addEventListener('DOMContentLoaded', function() {
  
  const loadLottieAnimation = (containerId, path) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: path
    });
  };

  loadLottieAnimation('lottie-modeling-icon', 'assets/animations/Pause_Play.json');
  loadLottieAnimation('lottie-rocket-icon', 'assets/animations/Rocket_Go.json');
  loadLottieAnimation('lottie-tool-icon', 'assets/animations/tool.json');
});
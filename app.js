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

/* ================= Reveal 动画 ================= */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    // General reveal-on-scroll for sections
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal:not(.particle-logo-trigger)').forEach(el => io.observe(el));

    // Desktop-only animation for trilemma repositioning
    const trilemmaWrapper = document.getElementById('trilemma-container');
    if (trilemmaWrapper && window.innerWidth > 820) { // Use new breakpoint
      const trilemmaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // FIX: Speed up animation
            setTimeout(() => {
              entry.target.classList.add('animate-complete');
            }, 1800); // Was 3200
            trilemmaObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      trilemmaObserver.observe(trilemmaWrapper);
    }
    
    // Observer for scroll-triggered particle logos (footer on desktop)
    const particleLogoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (window.getComputedStyle(entry.target).display !== 'none') {
                    if (window.createParticleAnimation) {
                        window.createParticleAnimation(entry.target);
                    }
                }
                particleLogoObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.8 });

    document.querySelectorAll('.particle-logo-trigger.reveal').forEach(logo => {
        particleLogoObserver.observe(logo);
    });
  }
})();

/* ================= Demo Video  ================= */
document.addEventListener('DOMContentLoaded', () => {
  const videoPlayer = document.getElementById('value-demo');
  const videoLoader = document.getElementById('video-loader');
  
  if (videoPlayer && videoLoader) {
    // 视频加载开始时显示加载动画
    videoLoader.classList.remove('hidden');
    
    // 设置超时机制，确保加载动画在一定时间后消失
    const loadTimeout = setTimeout(() => {
      videoLoader.classList.add('hidden');
    }, 8000); // 8秒后自动隐藏
    
    // 视频加载完成时隐藏加载动画
    videoPlayer.addEventListener('loadeddata', () => {
      clearTimeout(loadTimeout); // 清除超时
      videoLoader.classList.add('hidden');
    });
    
    // 视频播放开始时隐藏加载动画（作为后备）
    videoPlayer.addEventListener('play', () => {
      clearTimeout(loadTimeout); // 清除超时
      videoLoader.classList.add('hidden');
    });
    
    // 视频加载错误处理
    videoPlayer.addEventListener('error', (err) => {
      console.error('Video loading error:', err);
      clearTimeout(loadTimeout); // 清除超时
      // 错误情况下也隐藏加载动画
      videoLoader.classList.add('hidden');
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
   手机端不可能三角轮播 (Mobile Trilemma Carousel)
   =================================================== */
(() => {
  if (window.innerWidth > 820) return;

  const container = document.getElementById('trilemma-container');
  if (!container) return;

  const nodesContainer = container.querySelector('.trilemma-nodes-container');
  const carousel = container.querySelector('.trilemma-carousel');
  const slides = Array.from(nodesContainer.children);
  const leftArrow = container.querySelector('.carousel-arrow-left');
  const rightArrow = container.querySelector('.carousel-arrow-right');
  
  if (slides.length === 0 || !carousel || !leftArrow || !rightArrow) return;

  let currentIndex = 0;
  let autoplayInterval;

  function updateCarousel() {
      const slideStyle = getComputedStyle(slides[0]);
      const slideMargin = parseFloat(slideStyle.marginLeft) + parseFloat(slideStyle.marginRight);
      const slideWidth = slides[0].offsetWidth + slideMargin;
      
      const offset = (carousel.offsetWidth / 2) - (slideWidth / 2) - (currentIndex * slideWidth);
      nodesContainer.style.transform = `translateX(${offset}px)`;

      slides.forEach((slide, index) => {
          slide.classList.toggle('active', index === currentIndex);
      });
  }

  function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      updateCarousel();
  }
  
  function startAutoplay() {
      stopAutoplay();
      autoplayInterval = setInterval(() => {
          goToSlide(currentIndex + 1);
      }, 5000);
  }

  function stopAutoplay() {
      clearInterval(autoplayInterval);
  }

  leftArrow.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      stopAutoplay();
      startAutoplay();
  });
  rightArrow.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      stopAutoplay();
      startAutoplay();
  });

  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      stopAutoplay();
  }, { passive: true });
  carousel.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchStartX - touchEndX > 50) {
          goToSlide(currentIndex + 1);
      } else if (touchEndX - startX > 50) {
          goToSlide(currentIndex - 1);
      }
      startAutoplay();
  });

  setTimeout(() => {
      goToSlide(0);
      startAutoplay();
  }, 100);
  window.addEventListener('resize', updateCarousel);
})();


/* ===================================================
   手机端超越对口型轮播 (Mobile Tech Demo Carousel)
   =================================================== */
(() => {
    if (window.innerWidth > 820) return;

    const section = document.getElementById('technology');
    if (!section) return;

    const carouselWrapper = section.querySelector('.tech-demo-carousel-wrapper.mobile-only');
    if (!carouselWrapper) return;

    const demoContainer = carouselWrapper.querySelector('.tech-demo-container');
    const slides = Array.from(demoContainer.children);
    const leftArrow = carouselWrapper.querySelector('.carousel-arrow-left');
    const rightArrow = carouselWrapper.querySelector('.carousel-arrow-right');
    
    if (slides.length === 0 || !leftArrow || !rightArrow) return;
    
    let currentIndex = 0;
    
    function updateCarousel() {
        // FIX: Re-implement slide logic to account for the CSS gap property
        const slideWidth = slides[0].offsetWidth;
        const gapStyle = getComputedStyle(demoContainer).gap;
        const gap = parseFloat(gapStyle) || 0;
        const offset = -currentIndex * (slideWidth + gap);
        demoContainer.style.transform = `translateX(${offset}px)`;
    }

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        updateCarousel();
    }

    leftArrow.addEventListener('click', () => goToSlide(currentIndex - 1));
    rightArrow.addEventListener('click', () => goToSlide(currentIndex + 1));
    
    let touchStartX = 0;
    carouselWrapper.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
    carouselWrapper.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 50) {
            goToSlide(currentIndex + 1);
        } else if (touchEndX - touchStartX > 50) {
            goToSlide(currentIndex - 1);
        }
    });

    updateCarousel();
    window.addEventListener('resize', updateCarousel);
})();

/* ===================================================
   Lottie 动画
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

/* ===================================================
   FIX: Flip Card on Click/Tap
   =================================================== */
(() => {
  // Select all types of flip cards
  const flipCards = document.querySelectorAll('.case-card, .team-card');

  if (!flipCards || flipCards.length === 0) return;

  flipCards.forEach(card => {
    // Make card focusable for accessibility
    card.setAttribute('tabindex', '0');
    
    const clickOrTapHandler = (e) => {
      // Find the inner element to apply the flip class to
      const inner = card.querySelector('.case-card-inner, .team-card-inner');
      if (inner) {
        e.preventDefault();
        inner.classList.toggle('is-flipped');
      }
    };
    
    const keydownHandler = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        const inner = card.querySelector('.case-card-inner, .team-card-inner');
        if (inner) {
          e.preventDefault();
          inner.classList.toggle('is-flipped');
        }
      }
    };

    card.addEventListener('click', clickOrTapHandler);
    card.addEventListener('keydown', keydownHandler);
  });
})();

/* ===================================================
   FIX: Mobile Menu Auto-Close on Link Click
   =================================================== */
(() => {
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger = document.querySelector('.hamburger');
  if (!mobileMenu || !hamburger) return;

  const menuLinks = mobileMenu.querySelectorAll('a');

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Only close if the menu is open
      if (mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('no-scroll');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();
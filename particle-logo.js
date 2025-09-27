/**
 * Particle Logo Animation v8
 * - Implements a smooth cross-fade: as the black text fades in, the colored particles simultaneously fade out.
 * - Dwell time for colored particles is 0.8 seconds.
 * - Animation is fast and fluid.
 */
document.addEventListener('DOMContentLoaded', function() {
  const logoContainer = document.querySelector('.logo');
  if (!logoContainer) {
    console.error('Particle Logo: Target container ".logo" not found.');
    return;
  }

  const originalText = logoContainer.textContent?.trim() || 'SpatialWalk';
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-logo-canvas';
  const ariaLabel = logoContainer.getAttribute('aria-label') || originalText;
  canvas.setAttribute('aria-label', ariaLabel);

  logoContainer.innerHTML = '';
  logoContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Particle Logo: Could not get 2D context from canvas.');
    logoContainer.innerHTML = originalText; // Fallback to original text
    return;
  }
  
  // Helper to convert hex colors to RGB arrays for alpha manipulation
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  };

  const themeColorsHex = ['#6A39C6', '#9C4C88', '#FFC8DD', '#FFAFCC', '#BDE0FE'];
  const themeColorsRgb = themeColorsHex.map(hexToRgb);
  
  let particles = [];
  let animationFrameId;
  
  // Animation State Variables
  let isAnimationRunning = false;
  let startFadeToBlack = false;
  let fadeAlpha = 0;

  // --- Particle Class ---
  class Particle {
    constructor(targetX, targetY, canvasWidth, canvasHeight) {
      const angle = Math.random() * Math.PI * 2;
      const maxRadius = Math.max(canvasWidth, canvasHeight) * 1.2;
      const radius = Math.sqrt(Math.random()) * maxRadius;
      
      this.x = canvasWidth / 2 + Math.cos(angle) * radius;
      this.y = canvasHeight / 2 + Math.sin(angle) * radius;
      
      this.targetX = targetX;
      this.targetY = targetY;
      
      this.rgb = themeColorsRgb[Math.floor(Math.random() * themeColorsRgb.length)];
      this.alpha = 1.0; // Particle's own alpha for fading out
      this.size = Math.random() * 1.2 + 0.5;
      this.ease = Math.random() * 0.06 + 0.04;
    }

    update() {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      this.x += dx * this.ease;
      this.y += dy * this.ease;
    }

    draw() {
      // FIX: Use rgba to allow for smooth fade-out of particles
      ctx.fillStyle = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Canvas and Text Setup ---
  function setupAndCreateParticles() {
    const dpr = window.devicePixelRatio || 1;
    const computedStyle = getComputedStyle(logoContainer);
    const width = parseInt(computedStyle.width, 10);
    const height = parseInt(computedStyle.height, 10);

    if (width === 0 || height === 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const fontName = 'Inter';
    const fontWeight = '800';
    const fontSize = height * 0.7;

    ctx.font = `${fontWeight} ${fontSize}px ${fontName}`;
    const textMetrics = ctx.measureText(originalText);
    const textWidth = textMetrics.width;
    const textX = (width - textWidth) / 2;
    const textY = (height / 2) + (textMetrics.actualBoundingBoxAscent / 2);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.scale(dpr, dpr);
    tempCtx.font = `${fontWeight} ${fontSize}px ${fontName}`;
    tempCtx.fillText(originalText, textX, textY);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    particles = [];
    const density = 1; 
    for (let y = 0; y < imageData.height; y += density) {
      for (let x = 0; x < imageData.width; x += density) {
        if (imageData.data[(y * imageData.width + x) * 4 + 3] > 128) {
          particles.push(new Particle(x / dpr, y / dpr, width, height));
        }
      }
    }
  }
  
  // --- Final Static Text Drawing ---
  function drawStaticText() {
    const computedStyle = getComputedStyle(logoContainer);
    const width = parseInt(computedStyle.width, 10);
    const height = parseInt(computedStyle.height, 10);

    const fontName = 'Inter';
    const fontWeight = '800';
    const fontSize = height * 0.7;

    ctx.font = `${fontWeight} ${fontSize}px ${fontName}`;
    const textMetrics = ctx.measureText(originalText);
    const textWidth = textMetrics.width;
    const textX = (width - textWidth) / 2;
    const textY = (height / 2) + (textMetrics.actualBoundingBoxAscent / 2);
    
    ctx.fillStyle = '#000000';
    ctx.fillText(originalText, textX, textY);
  }


  // --- Animation Loop ---
  function animate() {
    if (!isAnimationRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Update and draw particles
    particles.forEach(p => {
      if (!startFadeToBlack) {
          p.update();
      }
      p.draw();
    });

    // 2. If it's time to fade, start the cross-fade effect
    if (startFadeToBlack) {
        const easingFactor = 0.05;
        fadeAlpha += (1 - fadeAlpha) * easingFactor;
        
        if (1 - fadeAlpha < 0.001) {
            fadeAlpha = 1;
        }

        // FIX: Simultaneously fade particles out as text fades in
        const particleAlpha = 1 - fadeAlpha;
        particles.forEach(p => p.alpha = particleAlpha);

        ctx.globalAlpha = fadeAlpha;
        drawStaticText();
        ctx.globalAlpha = 1;
    }

    // 3. When the fade is complete, stop the animation
    if (fadeAlpha >= 1) {
        isAnimationRunning = false;
        // Final, clean draw of the static text
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawStaticText();
    } else {
        animationFrameId = requestAnimationFrame(animate);
    }
  }
  
  function init() {
    // Reset state for re-runs
    isAnimationRunning = true;
    startFadeToBlack = false;
    fadeAlpha = 0;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    document.fonts.load(`800 12px Inter`).then(() => {
      setupAndCreateParticles();
      animate();

      // Timing logic
      // 1. Let particles gather for 1.5 seconds.
      setTimeout(() => {
        // 2. After gathering, wait for 0.8 seconds (the pause).
        setTimeout(() => {
          // 3. After the pause, start the cross-fade.
          startFadeToBlack = true;
        }, 800); // 800ms pause
      }, 1500); // 1500ms for gathering

    }).catch(err => {
        console.error("Font failed to load, attempting to draw anyway.", err);
        setupAndCreateParticles();
    });
  }

  // Initial Run
  init();

  // Re-initialize on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 250);
  });
});
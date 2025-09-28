/**
 * Particle Logo Animation v10 - Reusable Function
 * - FIX: Added a check to disable the animation entirely on mobile devices.
 */

// Make the animation function globally accessible
window.createParticleAnimation = function(logoContainer) {
    // FIX: Do not run the animation on mobile screens
    if (window.innerWidth <= 768) {
        return;
    }

    if (!logoContainer || logoContainer.querySelector('canvas')) {
        return;
    }

    const originalText = logoContainer.querySelector('span')?.textContent?.trim() || 'SpatialWalk';
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-logo-canvas-' + Math.random().toString(36).substr(2, 9);
    const ariaLabel = logoContainer.getAttribute('aria-label') || originalText;
    canvas.setAttribute('aria-label', ariaLabel);

    // Keep the original span, but hide it. Show canvas.
    const span = logoContainer.querySelector('span');
    if (span) span.style.display = 'none';
    logoContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Particle Logo: Could not get 2D context from canvas.');
        if (span) span.style.display = 'block'; // Fallback
        return;
    }

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    };

    const themeColorsHex = ['#6A39C6', '#9C4C88', '#FFC8DD', '#FFAFCC', '#BDE0FE'];
    const themeColorsRgb = themeColorsHex.map(hexToRgb);
    let particles = [];
    let animationFrameId;
    let isAnimationRunning = false,
        startFadeToBlack = false,
        fadeAlpha = 0;

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
            this.alpha = 1.0;
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
            ctx.fillStyle = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

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

    function animate() {
        if (!isAnimationRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            if (!startFadeToBlack) p.update();
            p.draw();
        });
        if (startFadeToBlack) {
            const easingFactor = 0.05;
            fadeAlpha += (1 - fadeAlpha) * easingFactor;
            if (1 - fadeAlpha < 0.001) fadeAlpha = 1;
            const particleAlpha = 1 - fadeAlpha;
            particles.forEach(p => p.alpha = particleAlpha);
            ctx.globalAlpha = fadeAlpha;
            drawStaticText();
            ctx.globalAlpha = 1;
        }
        if (fadeAlpha >= 1) {
            isAnimationRunning = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawStaticText();
        } else {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    function init() {
        isAnimationRunning = true;
        startFadeToBlack = false;
        fadeAlpha = 0;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        document.fonts.load(`800 12px Inter`).then(() => {
            setupAndCreateParticles();
            animate();
            // FIX: Shorten animation delays to ensure logo text appears faster
            setTimeout(() => {
                setTimeout(() => {
                    startFadeToBlack = true;
                }, 500); // Was 800
            }, 800); // Was 1500
        }).catch(err => {
            console.error("Font failed to load, attempting to draw anyway.", err);
            setupAndCreateParticles();
        });
    }

    init();
};

// Auto-run the animation for the header logo on page load
document.addEventListener('DOMContentLoaded', function() {
    const headerLogo = document.querySelector('.logo.particle-logo-trigger:not(.reveal)');
    if (headerLogo && window.createParticleAnimation) {
        window.createParticleAnimation(headerLogo);
    }
});
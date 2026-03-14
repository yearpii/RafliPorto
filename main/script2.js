 // Lightbox
  function openLightbox(wrap) {
    const img = wrap.querySelector('img');
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('lightbox-close')) return;
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }

  // Escape key closes lightbox
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Theme toggle (fun extra)
const toggle = document.getElementById('themeToggle');
let light = false;

if (toggle) {
  toggle.addEventListener('click', () => {
    light = !light;
    document.documentElement.style.setProperty('--bg', light ? '#f5f5f7' : '#0d0d0f');
    document.documentElement.style.setProperty('--surface', light ? '#fff' : '#141416');
    document.documentElement.style.setProperty('--border', light ? '#e0e0e6' : '#232328');
    document.documentElement.style.setProperty('--text', light ? '#111' : '#e8e8ec');
    document.documentElement.style.setProperty('--muted', light ? '#888' : '#6b6b75');
    document.documentElement.style.setProperty('--tag-bg', light ? '#f0f0f5' : '#1c1c22');
    document.documentElement.style.setProperty('--tag-border', light ? '#d8d8e0' : '#2e2e38');
    toggle.textContent = light ? '🌙' : '☀️';
  });
}

  // Scroll-reveal observer
  const items = document.querySelectorAll('.achievement-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

// ==================== PAGE TRANSITION ====================
const transition = document.getElementById("pageTransition");

document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", function(e) {
    const href = this.getAttribute("href");
    if (!href) return;
    if (href.startsWith("#")) return;
    if (this.target === "_blank") return;
    const sameOrigin = !this.hostname || this.hostname === window.location.hostname;
    if (sameOrigin) {
      e.preventDefault();
      transition.classList.add("active");
      setTimeout(() => {
        window.location.href = href;
      }, 700);
    }
  });
});
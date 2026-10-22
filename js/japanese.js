/**
 * Aditya Jare Portfolio - Japanese Page Engine (japanese.js)
 * Powers Bunkasai 2026 Auto-Slider, Cultural Photo Gallery, and Full-Screen Lightbox.
 */

(function () {
  'use strict';

  let japaneseData = null;
  let currentSlideIndex = 0;
  let autoSlideTimer = null;
  let isHovered = false;

  async function loadJapaneseData() {
    try {
      const response = await fetch('data/japanese.json');
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      japaneseData = await response.json();

      renderBunkasaiSlider();
      initBunkasaiSliderControls();
      renderBunkasaiGallery();
      initLightbox();
    } catch (error) {
      console.error('Error loading Japanese data:', error);
    }
  }

  // --- 1. Render Bunkasai Auto-Slider ---
  function renderBunkasaiSlider() {
    const track = document.getElementById('bunkasai-slides-track');
    const dotsContainer = document.getElementById('bunkasai-dots');
    if (!track || !japaneseData || !japaneseData.gallery) return;

    const items = japaneseData.gallery;
    if (items.length === 0) return;

    track.innerHTML = items.map((item, index) => `
      <div class="bunkasai-slide" data-slide-index="${index}">
        <div class="bunkasai-slide-img-box" role="button" tabindex="0" aria-label="Enlarge photo: ${escapeHtml(item.title)}">
          <span class="bunkasai-slide-badge">${escapeHtml(item.category)}</span>
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || item.title)}" loading="${index === 0 ? 'eager' : 'lazy'}" />
        </div>
        <div class="bunkasai-slide-info">
          <h4 class="bunkasai-slide-title">
            <span>${escapeHtml(item.title)}</span>
          </h4>
          <p class="bunkasai-slide-desc">${escapeHtml(item.description || item.alt)}</p>
        </div>
      </div>
    `).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = items.map((item, index) => `
        <button type="button" class="bunkasai-dot ${index === 0 ? 'active' : ''}" data-target-slide="${index}" aria-label="Go to slide ${index + 1}: ${escapeHtml(item.title)}"></button>
      `).join('');
    }

    updateSliderUI();
  }

  // --- 2. Bunkasai Slider Logic & Controls ---
  function initBunkasaiSliderControls() {
    const wrapper = document.getElementById('bunkasai-slider');
    const prevBtn = document.getElementById('bunkasai-prev-btn');
    const nextBtn = document.getElementById('bunkasai-next-btn');
    const dotsContainer = document.getElementById('bunkasai-dots');
    const track = document.getElementById('bunkasai-slides-track');
    if (!wrapper || !japaneseData || !japaneseData.gallery) return;

    const totalSlides = japaneseData.gallery.length;
    if (totalSlides <= 1) return;

    function goToSlide(index) {
      currentSlideIndex = (index + totalSlides) % totalSlides;
      updateSliderUI();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentSlideIndex - 1);
        resetAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentSlideIndex + 1);
        resetAutoSlide();
      });
    }

    if (dotsContainer) {
      dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.bunkasai-dot');
        if (!dot) return;
        const target = parseInt(dot.getAttribute('data-target-slide'), 10);
        if (!isNaN(target)) {
          goToSlide(target);
          resetAutoSlide();
        }
      });
    }

    // Click on slide image opens lightbox
    if (track) {
      track.addEventListener('click', (e) => {
        const imgBox = e.target.closest('.bunkasai-slide-img-box');
        if (!imgBox) return;
        const slide = imgBox.closest('.bunkasai-slide');
        const idx = slide ? parseInt(slide.getAttribute('data-slide-index'), 10) : currentSlideIndex;
        openLightbox(idx);
      });

      track.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const imgBox = e.target.closest('.bunkasai-slide-img-box');
          if (imgBox) {
            e.preventDefault();
            const slide = imgBox.closest('.bunkasai-slide');
            const idx = slide ? parseInt(slide.getAttribute('data-slide-index'), 10) : currentSlideIndex;
            openLightbox(idx);
          }
        }
      });
    }

    // Pause on hover or focus
    wrapper.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoSlide();
    });
    wrapper.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoSlide();
    });
    wrapper.addEventListener('focusin', () => {
      isHovered = true;
      stopAutoSlide();
    });
    wrapper.addEventListener('focusout', () => {
      isHovered = false;
      startAutoSlide();
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          goToSlide(currentSlideIndex + 1);
        } else {
          goToSlide(currentSlideIndex - 1);
        }
        resetAutoSlide();
      }
    }

    // Keyboard navigation when wrapper is focused or active
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlideIndex - 1);
        resetAutoSlide();
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlideIndex + 1);
        resetAutoSlide();
      }
    });

    startAutoSlide();
  }

  function updateSliderUI() {
    const track = document.getElementById('bunkasai-slides-track');
    const counter = document.getElementById('bunkasai-slide-counter');
    const dots = document.querySelectorAll('.bunkasai-dot');
    if (!track || !japaneseData || !japaneseData.gallery) return;

    const total = japaneseData.gallery.length;
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

    if (counter) {
      counter.textContent = `${currentSlideIndex + 1} / ${total}`;
    }

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlideIndex);
      dot.setAttribute('aria-selected', idx === currentSlideIndex ? 'true' : 'false');
    });
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      if (!isHovered && japaneseData && japaneseData.gallery) {
        currentSlideIndex = (currentSlideIndex + 1) % japaneseData.gallery.length;
        updateSliderUI();
      }
    }, 3500);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  function resetAutoSlide() {
    stopAutoSlide();
    if (!isHovered) {
      startAutoSlide();
    }
  }

  // --- 3. Bunkasai 2026 Cultural Festival Gallery Grid ---
  function renderBunkasaiGallery() {
    const container = document.getElementById('jp-gallery-grid');
    if (!container || !japaneseData || !japaneseData.gallery) return;

    container.innerHTML = japaneseData.gallery.map((item, index) => `
      <article class="jp-gallery-card" tabindex="0" role="button" aria-label="View photo: ${escapeHtml(item.title)}. Press Enter to enlarge." data-index="${index}">
        <div class="jp-gallery-thumb-frame">
          <span class="jp-gallery-badge-overlay">${escapeHtml(item.category)}</span>
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || item.title)}" loading="lazy" />
        </div>
        <div class="jp-gallery-card-content">
          <h4 class="jp-gallery-card-title">${escapeHtml(item.title)}</h4>
          <p class="jp-gallery-card-desc">${escapeHtml(item.description || item.alt)}</p>
          <span class="jp-gallery-zoom-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            Click to enlarge
          </span>
        </div>
      </article>
    `).join('');

    // Bind click and Enter key events to open lightbox
    container.querySelectorAll('.jp-gallery-card').forEach((card) => {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      card.addEventListener('click', () => openLightbox(idx));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });
  }

  // --- 4. Lightbox Modal Interactions ---
  function initLightbox() {
    const backdrop = document.getElementById('jp-lightbox');
    const closeBtn = document.getElementById('jp-lightbox-close');
    if (!backdrop) return;

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  function openLightbox(index) {
    if (!japaneseData || !japaneseData.gallery || !japaneseData.gallery[index]) return;
    const item = japaneseData.gallery[index];

    const backdrop = document.getElementById('jp-lightbox');
    const imgElem = document.getElementById('jp-lightbox-img');
    const titleElem = document.getElementById('jp-lightbox-title');
    const descElem = document.getElementById('jp-lightbox-desc');

    if (imgElem) {
      imgElem.src = item.image;
      imgElem.alt = item.alt || item.title;
    }
    if (titleElem) titleElem.textContent = item.title;
    if (descElem) descElem.textContent = item.description || item.alt;

    if (backdrop) {
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    const backdrop = document.getElementById('jp-lightbox');
    if (backdrop) {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', loadJapaneseData);
})();

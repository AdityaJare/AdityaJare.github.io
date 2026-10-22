/**
 * Aditya Jare Portfolio - Projects Engine (projects.js)
 * Loads projects.json, handles filtering, FYP auto-slider showcase,
 * project card thumbnails, real gallery images in modals,
 * demo button states, and rich interactive modal detail views.
 */

(function () {
  'use strict';

  let allProjects = [];
  let currentFilter = 'All';
  let lastFocusedElement = null;

  // =========================================================================
  // FYP Auto-Slider State
  // =========================================================================
  let fypSliderInterval = null;
  let fypCurrentSlide = 0;
  const FYP_SLIDE_INTERVAL_MS = 3500;

  async function loadProjects() {
    try {
      const response = await fetch('data/projects.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allProjects = await response.json();

      // Check if on Home page or Projects page
      const featuredContainer = document.getElementById('featured-projects-grid');
      const allProjectsContainer = document.getElementById('all-projects-grid');

      if (featuredContainer) {
        renderFeaturedProjects(featuredContainer);
      }

      if (allProjectsContainer) {
        initProjectFilters();
        renderFilteredProjects(allProjectsContainer, currentFilter);
      }

      // Initialize FYP Slider (only exists on projects.html)
      initFYPSlider();

      initProjectModal();

      // Bind detail triggers inside the FYP showcase card too
      const fypShowcase = document.getElementById('final-year-project');
      if (fypShowcase) {
        bindCardEvents(fypShowcase);
      }
    } catch (error) {
      console.error('Error loading projects data:', error);
      showErrorMessage();
    }
  }

  function showErrorMessage() {
    const containers = [
      document.getElementById('featured-projects-grid'),
      document.getElementById('all-projects-grid')
    ];
    containers.forEach((container) => {
      if (container) {
        container.innerHTML = `
          <div class="empty-state-card">
            <p style="color: var(--accent-rose); font-weight: 600;">Unable to load projects right now.</p>
            <p style="font-size: 0.88rem;">Please check local file permissions or serve via a web server.</p>
          </div>
        `;
      }
    });
  }

  // =========================================================================
  // FYP AUTO-SLIDER ENGINE
  // =========================================================================
  function initFYPSlider() {
    const track = document.getElementById('fyp-slides-track');
    const dotsContainer = document.getElementById('fyp-slider-dots');
    const counter = document.getElementById('fyp-slide-counter');
    const prevBtn = document.getElementById('fyp-prev-btn');
    const nextBtn = document.getElementById('fyp-next-btn');
    const sliderWrapper = document.getElementById('fyp-slider');

    if (!track || !dotsContainer) return;

    // Get gallery from the jury-ai project
    const juryAiProject = allProjects.find((p) => p.id === 'jury-ai');
    if (!juryAiProject || !juryAiProject.gallery || juryAiProject.gallery.length === 0) return;

    const slides = juryAiProject.gallery;

    // Render slides
    track.innerHTML = slides.map((slide, idx) => `
      <div class="fyp-slide${idx === 0 ? ' active' : ''}" data-slide-index="${idx}">
        <img src="${slide.image}" alt="${escapeHtml(slide.caption)}" class="fyp-slide-img" loading="${idx === 0 ? 'eager' : 'lazy'}" />
        <div class="fyp-slide-caption">
          <p class="fyp-slide-title">${escapeHtml(slide.caption)}</p>
        </div>
      </div>
    `).join('');

    // Render dots
    dotsContainer.innerHTML = slides.map((_, idx) => `
      <button type="button" class="fyp-dot${idx === 0 ? ' active' : ''}" data-dot-index="${idx}" aria-label="Go to slide ${idx + 1}" role="tab" aria-selected="${idx === 0}"></button>
    `).join('');

    // Update counter
    function updateCounter() {
      if (counter) {
        const current = String(fypCurrentSlide + 1).padStart(2, '0');
        const total = String(slides.length).padStart(2, '0');
        counter.textContent = `${current} / ${total}`;
      }
    }

    // Go to a specific slide
    function goToSlide(index) {
      const allSlides = track.querySelectorAll('.fyp-slide');
      const allDots = dotsContainer.querySelectorAll('.fyp-dot');

      allSlides.forEach((s) => s.classList.remove('active'));
      allDots.forEach((d) => { d.classList.remove('active'); d.setAttribute('aria-selected', 'false'); });

      fypCurrentSlide = ((index % slides.length) + slides.length) % slides.length;
      allSlides[fypCurrentSlide].classList.add('active');
      allDots[fypCurrentSlide].classList.add('active');
      allDots[fypCurrentSlide].setAttribute('aria-selected', 'true');
      updateCounter();
    }

    // Auto advance
    function startAutoSlide() {
      stopAutoSlide();
      fypSliderInterval = setInterval(() => {
        goToSlide(fypCurrentSlide + 1);
      }, FYP_SLIDE_INTERVAL_MS);
    }

    function stopAutoSlide() {
      if (fypSliderInterval) {
        clearInterval(fypSliderInterval);
        fypSliderInterval = null;
      }
    }

    // Controls
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(fypCurrentSlide - 1);
        startAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(fypCurrentSlide + 1);
        startAutoSlide();
      });
    }

    // Dot clicks
    dotsContainer.querySelectorAll('.fyp-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-dot-index'), 10);
        goToSlide(idx);
        startAutoSlide();
      });
    });

    // Pause on hover / focus
    if (sliderWrapper) {
      sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
      sliderWrapper.addEventListener('mouseleave', startAutoSlide);
      sliderWrapper.addEventListener('focusin', stopAutoSlide);
      sliderWrapper.addEventListener('focusout', startAutoSlide);
    }

    // Keyboard navigation
    if (sliderWrapper) {
      sliderWrapper.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToSlide(fypCurrentSlide - 1);
          startAutoSlide();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToSlide(fypCurrentSlide + 1);
          startAutoSlide();
        }
      });
    }

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    if (sliderWrapper) {
      sliderWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
      }, { passive: true });

      sliderWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            goToSlide(fypCurrentSlide + 1);
          } else {
            goToSlide(fypCurrentSlide - 1);
          }
        }
        startAutoSlide();
      }, { passive: true });
    }

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!prefersReducedMotion.matches) {
      startAutoSlide();
    }

    prefersReducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        stopAutoSlide();
      } else {
        startAutoSlide();
      }
    });

    updateCounter();
  }

  // =========================================================================
  // RENDER FEATURED PROJECTS (Home Page)
  // =========================================================================
  function renderFeaturedProjects(container) {
    const featuredProjects = allProjects.filter((p) => p.featured === true);
    container.innerHTML = featuredProjects.map((p) => createProjectCardHTML(p)).join('');
    bindCardEvents(container);
  }

  // =========================================================================
  // FILTER BAR SETUP (Projects Page)
  // =========================================================================
  function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const container = document.getElementById('all-projects-grid');

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'All';
        renderFilteredProjects(container, currentFilter);
      });
    });
  }

  // =========================================================================
  // RENDER FILTERED PROJECTS
  // =========================================================================
  function renderFilteredProjects(container, filter) {
    // Handle RNN Coming Soon
    if (filter === 'RNN') {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <span class="badge badge-progress" style="margin-bottom: 0.75rem;">Under Active Development</span>
          <h3 style="margin-bottom: 0.5rem;">RNN Project Coming Soon</h3>
          <p style="max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.92rem; color: var(--text-secondary);">
            Aditya is currently researching and implementing novel architectures in Recurrent Neural Networks / sequential vision models. Check back soon or visit GitHub for work in progress.
          </p>
          <a href="https://github.com/AdityaJare" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            Check GitHub Commits
          </a>
        </div>
      `;
      return;
    }

    let filtered = allProjects;
    if (filter !== 'All') {
      filtered = allProjects.filter((p) => {
        return p.categoryTags && p.categoryTags.includes(filter);
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <h3>No projects found</h3>
          <p>There are no projects currently tagged under "${filter}".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((p) => createProjectCardHTML(p)).join('');
    bindCardEvents(container);
  }

  // =========================================================================
  // CARD HTML GENERATOR (with thumbnail images)
  // =========================================================================
  function createProjectCardHTML(project) {
    const statusClass = project.status.toLowerCase().includes('deployed')
      ? 'badge-deployed'
      : project.status.toLowerCase().includes('progress')
      ? 'badge-progress'
      : 'badge-notebook';

    // Thumbnail image from project.image or first gallery item
    let thumbHTML = '';
    const thumbSrc = project.image || (project.gallery && project.gallery.length > 0 && project.gallery[0].image ? project.gallery[0].image : null);
    if (thumbSrc) {
      thumbHTML = `
        <div class="project-card-thumb-wrap">
          <img src="${escapeHtml(thumbSrc)}" alt="${escapeHtml(project.title)} screenshot" class="project-card-thumb-img" loading="lazy" />
        </div>
      `;
    }

    // Live Demo Button logic
    let demoBtnHTML = '';
    if (project.hasDemo && project.liveDemoUrl && project.liveDemoUrl !== '[Add URL]') {
      demoBtnHTML = `
        <a href="${escapeHtml(project.liveDemoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" aria-label="Live Demo for ${escapeHtml(project.title)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Live Demo
        </a>
      `;
    } else {
      demoBtnHTML = `
        <span class="badge badge-tag" title="Deployment or live demo is under preparation">
          Demo coming soon
        </span>
      `;
    }

    // GitHub link button
    const githubLinkHTML = (project.githubUrl && project.githubUrl !== '[Add URL]')
      ? `
        <a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" aria-label="GitHub Repository for ${escapeHtml(project.title)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
      `
      : `
        <span class="badge badge-tag" title="Repository URL will be updated soon">[GitHub: Add URL]</span>
      `;

    const tagsHTML = (project.categoryTags || [])
      .map((tag) => {
        const badgeClass = tag === 'Final Year Project' ? 'badge badge-capstone' : 'badge badge-tag';
        return `<span class="${badgeClass}">${escapeHtml(tag)}</span>`;
      })
      .join('');

    return `
      <article class="card project-card" data-project-id="${escapeHtml(project.id)}">
        <div>
          ${thumbHTML}
          <div class="project-meta-top">
            <span class="badge ${statusClass}">${escapeHtml(project.status)}</span>
            <button type="button" class="btn btn-outline btn-sm view-details-trigger" data-project-id="${escapeHtml(project.id)}" aria-label="View detailed study for ${escapeHtml(project.title)}">
              Details
            </button>
          </div>
          <h3 class="card-title">${escapeHtml(project.title)}</h3>
          <div class="project-tags-wrap">
            ${tagsHTML}
          </div>
          <p class="project-summary">${escapeHtml(project.summary)}</p>
        </div>

        <div class="project-card-footer">
          <div class="project-links-row">
            ${demoBtnHTML}
            ${githubLinkHTML}
          </div>
        </div>
      </article>
    `;
  }

  function bindCardEvents(container) {
    container.querySelectorAll('.view-details-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-project-id');
        openProjectModal(id, btn);
      });
    });
  }

  // =========================================================================
  // MODAL ENGINE
  // =========================================================================
  function initProjectModal() {
    let modalOverlay = document.getElementById('project-detail-modal');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'project-detail-modal';
      modalOverlay.className = 'modal-overlay';
      modalOverlay.setAttribute('role', 'dialog');
      modalOverlay.setAttribute('aria-modal', 'true');
      modalOverlay.setAttribute('aria-hidden', 'true');
      modalOverlay.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-header-content">
              <span id="modal-status-badge" class="badge badge-deployed" style="margin-bottom: 0.5rem;">Deployed</span>
              <h3 id="modal-project-title" style="margin-bottom: 0.35rem;">Project Title</h3>
              <div id="modal-project-tags" class="project-tags-wrap" style="margin: 0;"></div>
            </div>
            <button type="button" id="modal-close-btn" class="modal-close-btn" aria-label="Close project details modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="modal-body" id="modal-body-content">
            <!-- Injected dynamically -->
          </div>

          <div class="modal-footer" id="modal-footer-actions">
            <!-- Buttons injected dynamically -->
          </div>
        </div>
      `;
      document.body.appendChild(modalOverlay);

      const closeBtn = modalOverlay.querySelector('#modal-close-btn');
      closeBtn.addEventListener('click', closeProjectModal);

      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          closeProjectModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
          closeProjectModal();
        }
      });
    }
  }

  function openProjectModal(projectId, triggerElem) {
    const project = allProjects.find((p) => p.id === projectId);
    if (!project) return;

    lastFocusedElement = triggerElem;
    const modalOverlay = document.getElementById('project-detail-modal');
    if (!modalOverlay) return;

    // Set Header
    document.getElementById('modal-project-title').textContent = project.title;
    const statusBadge = document.getElementById('modal-status-badge');
    statusBadge.textContent = project.status;
    statusBadge.className = 'badge ' + (
      project.status.toLowerCase().includes('deployed')
        ? 'badge-deployed'
        : project.status.toLowerCase().includes('progress')
        ? 'badge-progress'
        : 'badge-notebook'
    );

    const tagsContainer = document.getElementById('modal-project-tags');
    tagsContainer.innerHTML = (project.categoryTags || [])
      .map((t) => `<span class="badge badge-tag">${escapeHtml(t)}</span>`)
      .join('');

    // Set Body
    const bodyContainer = document.getElementById('modal-body-content');
    const techPills = (project.technologies || [])
      .map((tech) => `<span class="badge badge-tag" style="background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.25); color: var(--accent-cyan);">${escapeHtml(tech)}</span>`)
      .join(' ');

    // Build gallery content - show real images if available, otherwise show placeholder
    let galleryContent = '';
    if (project.gallery && project.gallery.length > 0) {
      const hasRealImages = project.gallery.some((g) => g.image);
      if (hasRealImages) {
        // Show first 3 images with real screenshots
        const galleryItems = project.gallery.slice(0, 4).map((g) => {
          if (g.image) {
            return `
              <div class="modal-gallery-item">
                <img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.caption)}" class="modal-gallery-img" loading="lazy" />
                <p class="modal-gallery-caption">${escapeHtml(g.caption)}</p>
              </div>
            `;
          }
          return `
            <div class="modal-gallery-box">
              <p style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">${escapeHtml(g.caption)}</p>
              <p style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(g.placeholderText || '[Add screenshot]')}</p>
            </div>
          `;
        }).join('');

        // If there are more images, show a count note
        const remaining = project.gallery.length - 4;
        const moreNote = remaining > 0
          ? `<p style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">+ ${remaining} more screenshot${remaining > 1 ? 's' : ''} in project showcase</p>`
          : '';

        galleryContent = galleryItems + moreNote;
      } else {
        // Fallback to placeholder style
        galleryContent = project.gallery.map((g) => `
          <div class="modal-gallery-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 0.75rem; color: var(--text-accent);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">${escapeHtml(g.caption)}</p>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(g.placeholderText || '[Add your architecture diagram / chart screenshot]')}</p>
          </div>
        `).join('');
      }
    } else {
      galleryContent = '<p style="color: var(--text-muted); font-size: 0.88rem;">[Add screenshot / architecture gallery]</p>';
    }

    bodyContainer.innerHTML = `
      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Executive Summary &amp; Objective
        </h4>
        <p>${escapeHtml(project.summary)}</p>
        <p style="font-size: 0.92rem; color: var(--text-secondary); margin-top: 0.25rem;"><strong>Problem:</strong> ${escapeHtml(project.problem)}</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Dataset &amp; Methodology
        </h4>
        <p><strong>Dataset:</strong> ${escapeHtml(project.dataset)}</p>
        <p><strong>Methodology:</strong> ${escapeHtml(project.methodology)}</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Key Results &amp; Quantitative Metrics
        </h4>
        <div class="modal-results-box">
          ${escapeHtml(project.keyResults)}
        </div>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Technologies &amp; Architecture
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
          ${techPills}
        </div>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          My Role &amp; Contributions
        </h4>
        <p>${escapeHtml(project.role)}</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Key Challenges, Debugging Insights &amp; Limitations
        </h4>
        <p style="margin-bottom: 0.6rem;"><strong>Challenges &amp; Learnings:</strong> ${escapeHtml(project.challengesLearnings)}</p>
        <p><strong>Limitations:</strong> ${escapeHtml(project.limitations)}</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Architecture &amp; Screenshot Gallery
        </h4>
        ${galleryContent}
      </div>
    `;

    // Set Footer Links
    const footerContainer = document.getElementById('modal-footer-actions');
    let demoBtn = '';
    if (project.hasDemo && project.liveDemoUrl && project.liveDemoUrl !== '[Add URL]') {
      demoBtn = `<a href="${escapeHtml(project.liveDemoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Launch Live Demo</a>`;
    } else {
      demoBtn = `<span class="badge badge-tag">Demo coming soon</span>`;
    }

    let githubBtn = '';
    if (project.githubUrl && project.githubUrl !== '[Add URL]') {
      githubBtn = `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">View GitHub Repo</a>`;
    } else {
      githubBtn = `<span class="badge badge-tag">[GitHub: Add URL]</span>`;
    }

    let extraLinkBtn = '';
    if (project.additionalLinks && project.additionalLinks !== '[Add optional YouTube/blog/report link]') {
      extraLinkBtn = `<a href="${escapeHtml(project.additionalLinks)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Project Report</a>`;
    }

    footerContainer.innerHTML = `
      <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
        ${demoBtn}
        ${githubBtn}
        ${extraLinkBtn}
      </div>
      <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('modal-close-btn').click()">Close</button>
    `;

    // Show Modal
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeProjectModal() {
    const modalOverlay = document.getElementById('project-detail-modal');
    if (!modalOverlay) return;

    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastFocusedElement) {
      lastFocusedElement.focus();
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

  // Auto initialize on load
  document.addEventListener('DOMContentLoaded', loadProjects);
})();

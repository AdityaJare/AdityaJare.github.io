/**
 * Aditya Jare Portfolio - Core JavaScript (main.js)
 * Zero-dependency, lightweight, accessible navigation, theme switching & UX
 */

(function () {
  'use strict';

  // --- 1. Theme Management (Dark / Light) ---
  const THEME_STORAGE_KEY = 'aj_theme_preference';

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      });
    }

    // Listen for system theme changes if user hasn't explicitly set one
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
      toggleBtn.setAttribute('title', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
    }
  }

  // --- 2. Mobile Hamburger Navigation ---
  function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navBackdrop = document.getElementById('nav-backdrop');

    if (!hamburgerBtn || !navMenu) return;

    function openNav() {
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      navMenu.classList.add('open');
      if (navBackdrop) navBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
      if (navBackdrop) navBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
      const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeNav);
    }

    // Close mobile nav on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeNav();
        hamburgerBtn.focus();
      }
    });

    // Close when clicking any nav link
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', closeNav);
    });
  }

  // --- 3. Sticky Header Scroll Indicator & Back to Top ---
  function initScrollTracking() {
    const header = document.querySelector('.site-header');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    function onScroll() {
      const scrollY = window.scrollY || window.pageYOffset;

      if (header) {
        if (scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      if (backToTopBtn) {
        if (scrollY > 400) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // --- 4. Active Nav Highlighting ---
  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const targetPage = href.split('/').pop() || 'index.html';

      if (
        (currentPath === '' && targetPage === 'index.html') ||
        currentPath === targetPage ||
        (currentPath === '/' && targetPage === 'index.html')
      ) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // --- 5. Dynamic Footer Date & Profile Data ---
  function initFooterDate() {
    const lastUpdatedElem = document.getElementById('footer-last-updated');
    if (lastUpdatedElem) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      lastUpdatedElem.textContent = new Date().toLocaleDateString('en-US', options);
    }
    const currentYearElem = document.getElementById('footer-year');
    if (currentYearElem) {
      currentYearElem.textContent = new Date().getFullYear();
    }
  }

  // DOM Content Loaded Handler
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initScrollTracking();
    initActiveNav();
    initFooterDate();
  });
})();

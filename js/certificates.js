/**
 * Aditya Jare Portfolio - Certificates Engine (certificates.js)
 * Loads certificates.json, supports category filters (AI/ML, Deep Learning, Data Science, Cloud, Programming, Japanese),
 * and handles credential verification placeholders.
 */

(function () {
  'use strict';

  let allCertificates = [];
  let currentFilter = 'All';

  async function loadCertificates() {
    const container = document.getElementById('certificates-grid');
    if (!container) return;

    try {
      const response = await fetch('data/certificates.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allCertificates = await response.json();
      initCertificateFilters();
      renderCertificates(currentFilter);
    } catch (error) {
      console.error('Error loading certificates data:', error);
      container.innerHTML = `
        <div class="empty-state-card">
          <p style="color: var(--accent-rose); font-weight: 600;">Unable to load certificates.</p>
        </div>
      `;
    }
  }

  function initCertificateFilters() {
    const filterButtons = document.querySelectorAll('.cert-filter-btn');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'All';
        renderCertificates(currentFilter);
      });
    });
  }

  function renderCertificates(filter) {
    const container = document.getElementById('certificates-grid');
    if (!container) return;

    let filtered = allCertificates;
    if (filter !== 'All') {
      filtered = allCertificates.filter((c) => c.category === filter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <span class="badge badge-tag" style="margin-bottom: 0.75rem;">Status: Empty Category</span>
          <h3>No certificates in "${escapeHtml(filter)}"</h3>
          <p style="color: var(--text-muted); max-width: 480px; margin: 0.5rem auto;">
            Certificates in this specialization will appear here as soon as you add entries into <code>data/certificates.json</code>.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((cert) => createCertCardHTML(cert)).join('');
  }

  function createCertCardHTML(cert) {
    const skillsHTML = (cert.skillsCovered || [])
      .map((s) => `<span class="badge badge-tag">${escapeHtml(s)}</span>`)
      .join(' ');

    const verifyBtn = (cert.verificationUrl && cert.verificationUrl !== '[Add Verify Credential link]')
      ? `<a href="${escapeHtml(cert.verificationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Verify Credential</a>`
      : `<span class="badge badge-tag" title="Add your credential URL in certificates.json">[Verify: Add link]</span>`;

    const relatedProjectLink = (cert.relatedProjectId)
      ? `<a href="projects.html" class="btn btn-secondary btn-sm" title="View associated research">Related Project</a>`
      : '';

    return `
      <article class="card cert-card">
        <div class="cert-badge-frame">
          <img src="${escapeHtml(cert.image || 'assets/images/cert-placeholder.svg')}" alt="Badge for ${escapeHtml(cert.title)}" loading="lazy" />
        </div>
        <div style="flex-grow: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span class="badge badge-progress">${escapeHtml(cert.category)}</span>
            <span class="cert-date text-mono">${escapeHtml(cert.issueDate)}</span>
          </div>
          <h3 class="card-title" style="font-size: 1.15rem;">${escapeHtml(cert.title)}</h3>
          <div class="cert-issuer">${escapeHtml(cert.issuer)}</div>
          <p style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 0.75rem;">
            ID: ${escapeHtml(cert.credentialId)}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem;">
            ${skillsHTML}
          </div>
          ${cert.notes ? `<p style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-bottom: 1rem;">Note: ${escapeHtml(cert.notes)}</p>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); flex-wrap: wrap;">
          ${verifyBtn}
          ${relatedProjectLink}
        </div>
      </article>
    `;
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

  document.addEventListener('DOMContentLoaded', loadCertificates);
})();

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

    const verifyUrl = cert.verificationUrl || '#';
    const relatedProjectLink = (cert.relatedProjectId)
      ? `<a href="projects.html" class="btn btn-secondary btn-sm" title="View associated research project">Related Project</a>`
      : '';

    const isWhiteBg = cert.category === 'Japanese' || (cert.image && cert.image.includes('NAT'));
    const frameStyle = isWhiteBg ? ' style="background: #ffffff; padding: 0.35rem;"' : '';

    return `
      <article class="card cert-card">
        <a href="${escapeHtml(verifyUrl)}" target="_blank" rel="noopener noreferrer" class="cert-badge-frame"${frameStyle} title="Click to verify ${escapeHtml(cert.title)}">
          <img src="${escapeHtml(cert.image || 'assets/images/cert-placeholder.svg')}" alt="Badge for ${escapeHtml(cert.title)}" loading="lazy" />
        </a>
        <div style="flex-grow: 1; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge badge-progress">${escapeHtml(cert.category)}</span>
            <span class="cert-date text-mono" style="margin-bottom: 0;">${escapeHtml(cert.issueDate)}</span>
          </div>
          <h3 class="card-title" style="font-size: 1.15rem; margin-bottom: 0.35rem;">
            <a href="${escapeHtml(verifyUrl)}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
              ${escapeHtml(cert.title)}
            </a>
          </h3>
          <div class="cert-issuer">${escapeHtml(cert.issuer)}</div>
          <p style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 0.75rem; word-break: break-all;">
            ${cert.credentialId ? `ID: ${escapeHtml(cert.credentialId)}` : 'Verified Credential'}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem;">
            ${skillsHTML}
          </div>
          ${cert.notes ? `<p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">${escapeHtml(cert.notes)}</p>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); flex-wrap: wrap; margin-top: auto;">
          <a href="${escapeHtml(verifyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 0.35rem;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Verify Credential
          </a>
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

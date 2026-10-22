/**
 * Aditya Jare Portfolio - Contact Form Engine (contact.js)
 * Static-friendly backend integration (Formspree) with strict client-side validation,
 * no fake submits, and copy-to-clipboard utilities.
 */

(function () {
  'use strict';

  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('contact-submit-btn');
    const feedbackBanner = document.getElementById('form-feedback-banner');

    function showError(input, errorId, message) {
      input.classList.add('error');
      const errElem = document.getElementById(errorId);
      if (errElem) {
        errElem.textContent = message;
        errElem.classList.add('visible');
      }
    }

    function clearError(input, errorId) {
      input.classList.remove('error');
      const errElem = document.getElementById(errorId);
      if (errElem) {
        errElem.textContent = '';
        errElem.classList.remove('visible');
      }
    }

    // Input listeners to clear error on typing
    [
      { input: nameInput, id: 'name-error' },
      { input: emailInput, id: 'email-error' },
      { input: subjectInput, id: 'subject-error' },
      { input: messageInput, id: 'message-error' }
    ].forEach(({ input, id }) => {
      if (input) {
        input.addEventListener('input', () => clearError(input, id));
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        showError(nameInput, 'name-error', 'Please enter your name (at least 2 characters).');
        isValid = false;
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, 'email-error', 'Please provide a valid email address.');
        isValid = false;
      }

      // Validate Subject
      if (!subjectInput.value.trim() || subjectInput.value.trim().length < 3) {
        showError(subjectInput, 'subject-error', 'Please specify a subject for your message.');
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        showError(messageInput, 'message-error', 'Please enter your message (at least 10 characters).');
        isValid = false;
      }

      if (!isValid) return;

      const endpoint = form.getAttribute('action');

      // Check if endpoint is still unconfigured placeholder
      if (!endpoint || endpoint.includes('[Add your Formspree ID]')) {
        feedbackBanner.className = 'form-feedback-banner error';
        feedbackBanner.innerHTML = `
          <strong>Endpoint Setup Required:</strong> To enable direct static form processing, create a free form endpoint at <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">formspree.io</a> and replace <code>[Add your Formspree ID]</code> in <code>data/profile.json</code>. In the meantime, please contact Aditya directly using the direct Gmail or WhatsApp links on this page.
        `;
        feedbackBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      // Live submission to configured Formspree backend
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        Sending message...
      `;

      try {
        const formData = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          subject: subjectInput.value.trim(),
          message: messageInput.value.trim()
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          form.reset();
          feedbackBanner.className = 'form-feedback-banner success';
          feedbackBanner.innerHTML = `
            <strong>Thank you!</strong> Your message has been sent successfully. Aditya will get back to you promptly.
          `;
        } else {
          const errData = await response.json();
          feedbackBanner.className = 'form-feedback-banner error';
          feedbackBanner.textContent = errData.error || 'Oops! There was a problem submitting your message. Please try again or email directly.';
        }
      } catch (err) {
        feedbackBanner.className = 'form-feedback-banner error';
        feedbackBanner.textContent = 'Network error occurred while sending your message. Please reach out directly via Gmail or LinkedIn.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        feedbackBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Copy to clipboard helper
  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetText = btn.getAttribute('data-copy');
        if (!targetText || targetText.startsWith('[Add')) {
          alert('Placeholder value. Update in data/profile.json once your exact handle is set!');
          return;
        }

        navigator.clipboard.writeText(targetText).then(() => {
          const originalTitle = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = originalTitle;
          }, 2000);
        }).catch(() => {
          prompt('Copy to clipboard:', targetText);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
    initCopyButtons();
  });
})();

/**
 * Aditya Jare Portfolio - Contact Form Engine (contact.js)
 * Direct mailto integration with strict client-side validation
 * and copy-to-clipboard utilities.
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

      const recipient = 'adityajare2004@gmail.com';
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = encodeURIComponent(`[Portfolio Contact] ${subjectInput.value.trim()}`);
      const body = encodeURIComponent(
        `Hi Aditya,\n\n${messageInput.value.trim()}\n\nFrom: ${name}\nEmail: ${email}`
      );

      feedbackBanner.className = 'form-feedback-banner success';
      feedbackBanner.innerHTML = `
        <strong>Composing message...</strong> Opening your default mail client. If it does not launch automatically, <a href="mailto:${recipient}?subject=${subject}&body=${body}" style="text-decoration: underline; font-weight: 600;">click here to email ${recipient}</a>.
      `;
      feedbackBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
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

/**
 * Aditya Jare Portfolio - Japanese Engine (japanese.js)
 * Powers JLPT N3 tracker, skills grid, interactive Word of the Day with Web Speech API,
 * 3D flashcards flip logic, and resource lists from japanese.json.
 */

(function () {
  'use strict';

  let japaneseData = null;
  let currentWordIndex = 0;

  async function loadJapaneseData() {
    try {
      const response = await fetch('data/japanese.json');
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      japaneseData = await response.json();

      renderSkillsGrid();
      initWordOfTheDay();
      renderVocabFlipCards();
      renderStudyResources();
    } catch (error) {
      console.error('Error loading Japanese data:', error);
    }
  }

  // --- 1. Skills Grid ---
  function renderSkillsGrid() {
    const container = document.getElementById('jp-skills-grid');
    if (!container || !japaneseData || !japaneseData.skills) return;

    container.innerHTML = japaneseData.skills.map((skill) => `
      <div class="jp-skill-card">
        <div class="jp-skill-top">
          <span class="jp-skill-name">${escapeHtml(skill.name)}</span>
          <span class="badge badge-tag" style="color: var(--accent-cyan); font-weight: 600;">
            ${escapeHtml(skill.level)}
          </span>
        </div>
        <div class="progress-track" role="progressbar" aria-valuenow="${skill.percentage}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" style="width: ${skill.percentage}%;"></div>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem;">
          ${escapeHtml(skill.note)}
        </p>
      </div>
    `).join('');
  }

  // --- 2. Interactive Word of the Day ---
  function initWordOfTheDay() {
    const wotdContainer = document.getElementById('wotd-card-content');
    if (!wotdContainer || !japaneseData || !japaneseData.vocabulary) return;

    const vocabList = japaneseData.vocabulary;
    if (vocabList.length === 0) return;

    // Pick day-seeded word
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    currentWordIndex = dayOfYear % vocabList.length;

    renderWord(currentWordIndex);

    const nextBtn = document.getElementById('wotd-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentWordIndex = (currentWordIndex + 1) % vocabList.length;
        renderWord(currentWordIndex);
      });
    }

    const audioBtn = document.getElementById('wotd-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const word = vocabList[currentWordIndex];
        speakJapanese(word.reading || word.kanji);
      });
    }
  }

  function renderWord(index) {
    const word = japaneseData.vocabulary[index];
    if (!word) return;

    const kanjiElem = document.getElementById('wotd-kanji');
    const readingElem = document.getElementById('wotd-reading');
    const romajiElem = document.getElementById('wotd-romaji');
    const meaningElem = document.getElementById('wotd-meaning');
    const exJpElem = document.getElementById('wotd-ex-jp');
    const exEnElem = document.getElementById('wotd-ex-en');
    const catElem = document.getElementById('wotd-category');

    if (kanjiElem) kanjiElem.textContent = word.kanji;
    if (readingElem) readingElem.textContent = `【${word.reading}】`;
    if (romajiElem) romajiElem.textContent = `${word.romaji} • ${word.partOfSpeech}`;
    if (meaningElem) meaningElem.textContent = word.english;
    if (exJpElem) exJpElem.textContent = word.example;
    if (exEnElem) exEnElem.textContent = word.exampleEnglish;
    if (catElem) catElem.textContent = word.category;
  }

  function speakJapanese(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  // --- 3. 3D Vocabulary Flashcards ---
  function renderVocabFlipCards() {
    const container = document.getElementById('vocab-cards-grid');
    if (!container || !japaneseData || !japaneseData.vocabulary) return;

    container.innerHTML = japaneseData.vocabulary.map((card) => `
      <div class="flip-card" tabindex="0" role="button" aria-label="Flashcard for ${escapeHtml(card.kanji)}. Press Enter to flip.">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <span class="badge badge-tag" style="margin-bottom: 0.75rem; font-size: 0.7rem;">${escapeHtml(card.category)}</span>
            <div class="flip-kanji">${escapeHtml(card.kanji)}</div>
            <div class="flip-reading">${escapeHtml(card.reading)}</div>
            <span class="flip-hint">Click or press Enter to flip ↻</span>
          </div>
          <div class="flip-card-back">
            <div style="font-weight: 700; font-size: 1.15rem; color: var(--text-primary); margin-bottom: 0.4rem;">${escapeHtml(card.english)}</div>
            <div class="text-mono" style="font-size: 0.82rem; color: var(--accent-indigo); margin-bottom: 0.75rem;">${escapeHtml(card.romaji)}</div>
            <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.75rem;">
              "${escapeHtml(card.exampleEnglish)}"
            </p>
            <button type="button" class="btn btn-outline btn-sm speak-card-btn" data-speak="${escapeHtml(card.reading)}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
              🔊 Listen
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Flip interactions on click and keyboard
    container.querySelectorAll('.flip-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        // Prevent flip if clicking speak button
        if (e.target.closest('.speak-card-btn')) return;
        card.classList.toggle('flipped');
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      });
    });

    // Listen buttons
    container.querySelectorAll('.speak-card-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-speak');
        if (text) speakJapanese(text);
      });
    });
  }

  // --- 4. Study Resources ---
  function renderStudyResources() {
    const container = document.getElementById('study-resources-list');
    if (!container || !japaneseData || !japaneseData.studyResources) return;

    container.innerHTML = japaneseData.studyResources.map((res) => `
      <div class="card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span class="badge badge-progress">${escapeHtml(res.type)}</span>
          <span class="badge badge-tag">${escapeHtml(res.status)}</span>
        </div>
        <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem;">${escapeHtml(res.name)}</h4>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">${escapeHtml(res.description)}</p>
      </div>
    `).join('');
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

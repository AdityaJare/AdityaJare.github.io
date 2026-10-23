# Er. Aditya Jare - Personal AI/ML Portfolio

A modern, responsive, mobile-first personal portfolio website for **Er. Aditya Jare**, a B.E. graduate in AIML actively learning ML, ANN, CNN, RNN, GenAI, and RAG with a deep passion for Computer Vision tasks, and on a Japanese language journey targeting JLPT N3 proficiency.

Deployed directly on **GitHub Pages** (free, zero-build, ultra-fast static HTML5/CSS3/ES6).

---

## 🚀 Key Features

- **Dark & Light Modes**: System preference auto-detection with smooth persistence in `localStorage`.
- **Data-Driven Architecture**: 100% of projects, certificates, and Japanese curriculum live inside `data/*.json`. Adding a project requires editing only one JSON file.
- **Interactive Project Drawer / Modal**: Complete case studies including Problem, Dataset, Methodology, Quantitative Results (with exact metrics), My Role, Debugging Insights, Limitations, and Architecture gallery.
- **Smart Category Filtering**: Instant filtering by `All`, `ML`, `ANN`, `CNN`, `RNN`, `RAG`, and `Web Apps`. Displays a dedicated "Coming Soon" card for RNN and RAG under development.
- **Live Demo Fallback**: Projects without a live demo automatically display a clean `"Demo coming soon"` tag rather than broken links.
- **Interactive Japanese Section (JLPT N3)**:
  - Daily seeded **Word of the Day** with Japanese audio pronunciation (Web Speech API).
  - 3D interactive **vocabulary flashcards** with flip triggers (mouse click or keyboard `Enter`).
  - Comprehensive 9-dimension competency progress matrix.
- **Direct Contact Form**: Client-side validated direct mailto message composer and direct links (Gmail, WhatsApp, LinkedIn, GitHub).
- **Accessibility & Performance**: Keyboard `:focus-visible` styling, ARIA roles, `prefers-reduced-motion` compliance, semantic HTML5, and custom SVG favicon.

---

## 📁 File Structure

```text
AJportfolio/
├── index.html                 # Hero, About Preview, Featured Projects (6), Skills Overview, Highlights
├── about.html                 # Bio, Computer Vision roadmap, Education, Experience, Technical & Soft Skills
├── projects.html              # All 9 Case Studies with Category Filters & Modal Dialogs
├── certificates.html          # Verified Credentials with Category Filters (AI/ML, DL, Cloud, etc.)
├── japanese.html              # JLPT N3 Journey, Word of the Day, 3D Flashcards, Study Resources
├── contact.html               # Direct Contact Form, Direct Channels (Gmail, WhatsApp, LinkedIn, GitHub, Location)
├── 404.html                   # Clean fallback error page for GitHub Pages
├── .nojekyll                  # GitHub Pages flag to disable Jekyll
├── css/
│   └── style.css              # Vanilla CSS Design System, Responsive Grids, Themes, Micro-animations
├── js/
│   ├── main.js                # Theme toggle, Mobile hamburger, Sticky nav, Back-to-top, Dynamic year
│   ├── projects.js            # Projects engine, Category filters, Coming soon state, Modal dialogs
│   ├── certificates.js        # Certificates engine & Category filters
│   ├── japanese.js            # JLPT N3 tracker, Word of the Day audio, 3D Flashcard flip
│   └── contact.js             # Form validation, Direct message mailto composer, Clipboard helpers
├── data/
│   ├── profile.json           # Profile metadata and social links
│   ├── projects.json          # All 9 projects + schema for new additions
│   ├── certificates.json      # Certificate credentials schema & placeholders
│   └── japanese.json          # JLPT N3 skills, vocabulary list, and study resources
└── assets/
    └── images/
        ├── favicon.svg        # Custom AI / Neural aperture favicon
        ├── profile-placeholder.svg # High-tech CV bounding box portrait placeholder
        ├── cert-placeholder.svg    # Official credential badge illustration
        ├── japanese-placeholder-1.svg # Kanji stroke practice notes illustration
        ├── japanese-placeholder-2.svg # Grammar flowchart illustration
        └── japanese-placeholder-3.svg # Research & cultural immersion illustration
```

---

## 🛠️ How to Customize Your Content

### 1. Update Profile & Social Links
Open `data/profile.json` and update the placeholders:
- `"resumeUrl"`: Put the path or link to your resume PDF (e.g. `assets/Aditya_Jare_Resume.pdf`).
- `"socials"`: Replace `[Add your LinkedIn URL]`, `[Add your Gmail address]`, etc.

### 2. Adding a New Project
Open `data/projects.json` and append a new JSON object:
```json
{
  "id": "my-new-cv-project",
  "title": "Object Detection with YOLOv9",
  "categoryTags": ["CNN", "PyTorch"],
  "summary": "Real-time road obstacle detection on edge hardware.",
  "featured": true,
  "status": "In progress",
  "problem": "...",
  "dataset": "...",
  "methodology": "...",
  "technologies": ["PyTorch", "OpenCV", "YOLOv9"],
  "keyResults": "mAP@0.5 of 82.4% at 45 FPS on RTX 4060.",
  "role": "Computer Vision Developer",
  "challengesLearnings": "...",
  "limitations": "...",
  "liveDemoUrl": null,
  "hasDemo": false,
  "githubUrl": "https://github.com/AdityaJare/...",
  "gallery": []
}
```
The Projects page and filter buttons will immediately recognize and render it.

### 3. Adding Your Certificates
Open `data/certificates.json` and replace the `[Add your certificates]` entries with your genuine certificates, issuer names, verification URLs, and credential IDs.

---

## 🌐 Free Hosting on GitHub Pages

1. Push this folder to your GitHub repository (e.g., `https://github.com/AdityaJare/AdityaJare.github.io` or `https://github.com/AdityaJare/AJportfolio`).
2. In GitHub, go to your repository's **Settings** tab.
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment > Source**, select **Deploy from a branch**.
5. Set the branch to `main` (or `master`) and folder to `/ (root)`.
6. Click **Save**. Within 1–2 minutes, your website will be live at `https://adityajare.github.io/` or `https://adityajare.github.io/AJportfolio/`!

// BISTEC Care static site content loader
// Loads content/shared.json + content/<page>.json and applies to [data-content] placeholders.
(async function () {
  const html = document.documentElement;
  const page = html.getAttribute('data-page') || 'index';
  // Compute base path robustly for GitHub Pages (any repo name), subfolders, and local preview.
  // We derive it from the loaded app.js script URL so we don't hardcode repo names.
  const appJsSrc = Array.from(document.scripts)
    .map(s => s.src || '')
    .find(src => /\/app\.js(\?|$)/.test(src));

  // If app.js is loaded with an absolute URL, keep the origin+path prefix.
  // Example: https://user.github.io/repo/app.js  -> base = https://user.github.io/repo/
  // Example: file:///.../app.js -> base = file:///.../
  const base = appJsSrc
    ? appJsSrc.replace(/app\.js(\?.*)?$/, '')
    : (location.pathname.endsWith('/')
      ? location.pathname
      : location.pathname.replace(/[^/]*$/, ''));
  async function loadJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load ' + url);
    return await res.json();
  }
  function deepGet(obj, path) {
    return path.split('.').reduce((o, k) => (o && k in o) ? o[k] : undefined, obj);
  }
  function merge(a, b) {
    return { ...a, ...b, meta: { ...(a.meta || {}), ...(b.meta || {}) }, nav: { ...(a.nav || {}), ...(b.nav || {}) }, cta: { ...(a.cta || {}), ...(b.cta || {}) }, footer: { ...(a.footer || {}), ...(b.footer || {}) } };
  }
  try {
    const shared = await loadJSON(base + 'content/shared.json');
    let pageData = {};
    try { pageData = await loadJSON(base + 'content/' + page + '.json'); } catch (e) { /* optional */ }
    const data = merge(shared, pageData);
    // Expose merged content for small interactive widgets (demo-only)
    window.__content = data;
    // Apply meta if present
    if (data.meta) {
      if (data.meta.title) document.title = data.meta.title;
      const desc = data.meta.description || '';
      const og = data.meta.ogImage || '';
      function setMeta(name, content, prop = false) {
        if (!content) return;
        let sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let el = document.querySelector(sel);
        if (!el) { el = document.createElement('meta'); if (prop) el.setAttribute('property', name); else el.setAttribute('name', name); document.head.appendChild(el); }
        el.setAttribute('content', content);
      }
      setMeta('description', desc, false);
      setMeta('og:title', data.meta.title, true);
      setMeta('og:description', desc, true);
      setMeta('og:image', og, true);
    }
    // Inject all text nodes
    document.querySelectorAll('[data-content]').forEach(el => {
      const key = el.getAttribute('data-content');
      const val = deepGet(data, key);
      if (val === undefined || val === null) return;
      if (el.tagName === 'A' && !el.textContent.trim()) {
        el.textContent = val;
      } else if (el.tagName === 'IMG') {
        el.setAttribute('src', val);
      } else if (el.dataset && el.dataset.render === 'list' && Array.isArray(val)) {
        // Handle list rendering
        el.innerHTML = '';
        val.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          el.appendChild(li);
        });
      } else if (el.dataset && el.dataset.html === 'true') {
        // Allow limited HTML for specific headings (e.g., colored spans)
        el.innerHTML = String(val);
      } else {
        el.textContent = val;
      }
    });

    // data-src images (kept separate so we don't overload data-content)
    document.querySelectorAll('[data-src]').forEach(img => {
      const key = img.getAttribute('data-src');
      const val = deepGet(data, key);
      if (!val) return;
      img.setAttribute('src', val);
    });

    // data-placeholder for inputs
    document.querySelectorAll('[data-placeholder]').forEach(el => {
      const key = el.getAttribute('data-placeholder');
      const val = deepGet(data, key);
      if (!val) return;
      el.setAttribute('placeholder', String(val));
    });

    // repeat templates: containers with data-repeat expected to contain a child with data-template
    document.querySelectorAll('[data-repeat]').forEach(container => {
      const key = container.getAttribute('data-repeat');
      const arr = deepGet(data, key) || [];
      const tpl = container.querySelector('[data-template]');
      if (!tpl) return;
      tpl.style.display = 'none';
      arr.forEach(item => {
        const node = tpl.cloneNode(true);
        node.removeAttribute('data-template');
        node.style.display = '';
        // set simple content fields
        node.querySelectorAll('[data-item-content]').forEach(el => {
          const prop = el.getAttribute('data-item-content');
          const val = item[prop];
          if (val === undefined || val === null) return;
          if (el.tagName === 'IMG') el.setAttribute('src', String(val));
          else el.textContent = String(val);
        });
        // set hrefs when element has data-item-href="prop"
        node.querySelectorAll('[data-item-href]').forEach(el => {
          const prop = el.getAttribute('data-item-href');
          const val = item[prop];
          if (!val) return;
          el.setAttribute('href', '#' + String(val));
        });
        container.appendChild(node);
      });
    });
    // active nav item
    document.querySelectorAll('[data-nav]').forEach(a => {
      if (a.getAttribute('data-nav') === page.replace('.html', '')) a.classList.add('font-semibold', 'text-slate-900');
    });
    // year
    const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
  } catch (err) {
    console.warn(err);
  }
})();

// Case study download widget (demo-only, no backend)
(function initCaseStudy() {
  const form = document.getElementById('caseStudyForm');
  if (!form) return;

  const direct = document.getElementById('caseStudyDirectLink');
  const success = document.getElementById('caseStudySuccess');
  const pdfUrl = window.__content && window.__content.caseStudy && window.__content.caseStudy.pdfUrl;

  if (direct && pdfUrl) direct.setAttribute('href', pdfUrl);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (pdfUrl) window.open(pdfUrl, '_blank', 'noopener');
    if (success) success.classList.remove('hidden');
  });
})();

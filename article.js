(async function () {
  async function loadJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    return await res.json();
  }

  function setMeta(nameOrProp, value, isProp = false) {
    if (!value) return;
    const sel = isProp ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
    let el = document.head.querySelector(sel);
    if (!el) {
      el = document.createElement("meta");
      if (isProp) el.setAttribute("property", nameOrProp);
      else el.setAttribute("name", nameOrProp);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function applyPostSeo(seo) {
    if (!seo) return;
    if (seo.title) document.title = seo.title;
    if (seo.description) {
      setMeta("description", seo.description, false);
      setMeta("og:description", seo.description, true);
      setMeta("twitter:description", seo.description, false);
    }
    const img = seo.ogImage;
    if (img) {
      setMeta("og:image", img, true);
      setMeta("twitter:image", img, false);
    }
    const ot = seo.ogTitle || seo.title;
    if (ot) {
      setMeta("og:title", ot, true);
      setMeta("twitter:title", ot, false);
    }

    // Dynamic Canonical
    let link = document.head.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    const u = new URL(window.location.href);
    const slug = u.searchParams.get("slug");
    if (slug) {
      link.setAttribute("href", `https://www.bisteccare.lk/article.html?slug=${encodeURIComponent(slug)}`);
    }
  }

  function esc(s) { return (s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  function qs(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function renderBlocks(blocks) {
    return (blocks || []).map(b => {
      if (b.type === "h2") return `<h2>${esc(b.text)}</h2>`;
      if (b.type === "h3") return `<h3>${esc(b.text)}</h3>`;
      if (b.type === "p") return `<p>${esc(b.text)}</p>`;
      if (b.type === "quote") return `<blockquote>${esc(b.text)}</blockquote>`;
      if (b.type === "ul") return `<ul>${(b.items || []).map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
      if (b.type === "img") return `<figure><img src="${esc(b.src)}" alt="${esc(b.alt || "")}" class="rounded-2xl border border-line"/><figcaption>${esc(b.caption || "")}</figcaption></figure>`;
      return "";
    }).join("");
  }

  try {
    const slug = qs("slug");
    const blog = await loadJson("content/blog.json");
    const posts = blog.posts || [];
    const meta = posts.find(p => p.slug === slug) || posts[0];
    const post = await loadJson(`content/posts/${meta.slug}.json`);
    applyPostSeo(post.seo);

    document.title = `${post.title} — BISTEC Care Blog`;

    const titleEl = document.getElementById("aTitle");
    const metaEl = document.getElementById("aMeta");
    const cover = document.getElementById("aCover");
    const content = document.getElementById("aContent");
    const tags = document.getElementById("aTags");

    titleEl.textContent = post.title;
    metaEl.innerHTML = `
      <span class="rounded-full bg-white/80 border border-line px-3 py-1">${esc(post.date || "")}</span>
      <span class="rounded-full bg-white/80 border border-line px-3 py-1">${esc(post.readTime || "")}</span>
      <span class="rounded-full bg-white/80 border border-line px-3 py-1">By ${esc(post.author || "BISTEC Care")}</span>
    `;

    cover.src = post.cover || "assets/images/blog/cover-1.png";
    cover.alt = post.title;

    content.innerHTML = renderBlocks(post.content);

    (post.tags || []).forEach(t => {
      const el = document.createElement("span");
      el.className = "rounded-full bg-white border border-line px-3 py-1 text-xs text-slate-600";
      el.textContent = t;
      tags.appendChild(el);
    });

    // related
    const related = posts.filter(p => p.slug !== meta.slug).slice(0, 4);
    const list = document.getElementById("relatedList");
    list.innerHTML = related.map(p => `
      <a class="block group" href="article.html?slug=${encodeURIComponent(p.slug)}">
        <div class="text-sm font-semibold group-hover:text-brandBlue">${esc(p.title)}</div>
        <div class="text-xs text-slate-500 mt-1">${esc(p.date || "")}</div>
      </a>
    `).join("");
  } catch (e) {
    console.warn("Article load failed", e);
  }
})();

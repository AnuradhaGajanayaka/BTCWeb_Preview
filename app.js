(async function () {
  async function loadJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    return await res.json();
  }

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
      if (cur === null || cur === undefined) return undefined;
      // array index
      if (/^\d+$/.test(p)) {
        cur = cur[Number(p)];
      } else {
        cur = cur[p];
      }
    }
    return cur;
  }

  function applyData(obj) {
    document.querySelectorAll("[data-content]").forEach(el => {
      const key = el.getAttribute("data-content");
      const val = getByPath(obj, key);
      if (val === undefined) return;

      if (Array.isArray(val)) {
        // If element wants list rendering
        if (el.getAttribute("data-render") === "list") {
          el.innerHTML = val.map(v => `<li>${v}</li>`).join("");
        } else {
          el.innerHTML = val.map(v => `<div>${v}</div>`).join("");
        }
      } else if (typeof val === "string") {
        // allow basic inline HTML via data-html="true"
        if (el.getAttribute("data-html") === "true") el.innerHTML = val;
        else el.textContent = val;
      } else {
        el.textContent = String(val);
      }
    });
  }

  try {
    const page = document.documentElement.getAttribute("data-page") || "index";
    const [site, pageData] = await Promise.all([
      loadJson("content/site.json"),
      loadJson(`content/${page}.json`)
    ]);

    // apply site keys, then page overrides
    applyData(site);
    applyData(pageData);

    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  } catch (e) {
    console.warn("Content loader failed:", e);
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  }
})();

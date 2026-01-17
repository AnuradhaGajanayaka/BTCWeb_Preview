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
      if (/^\d+$/.test(p)) cur = cur[Number(p)];
      else cur = cur[p];
    }
    return cur;
  }

  
  function setMeta(nameOrProp, value, isProp=false){
    if(!value) return;
    const sel = isProp ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
    let el=document.head.querySelector(sel);
    if(!el){
      el=document.createElement("meta");
      if(isProp) el.setAttribute("property", nameOrProp);
      else el.setAttribute("name", nameOrProp);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function applySeo(obj){
    if(!obj) return;
    const seo=obj.seo || {};
    if(seo.title) document.title = seo.title;
    if(seo.description){
      setMeta("description", seo.description, false);
      setMeta("og:description", seo.description, true);
      setMeta("twitter:description", seo.description, false);
    }
    if(seo.ogImage){
      setMeta("og:image", seo.ogImage, true);
      setMeta("twitter:image", seo.ogImage, false);
    }
    if(seo.ogTitle){
      setMeta("og:title", seo.ogTitle, true);
      setMeta("twitter:title", seo.ogTitle, false);
    } else if(seo.title){
      setMeta("og:title", seo.title, true);
      setMeta("twitter:title", seo.title, false);
    }
  }

  function applyData(obj) {
    document.querySelectorAll("[data-src]").forEach(el=>{
      const key=el.getAttribute("data-src");
      const val=getByPath(obj,key);
      if(!val) return;
      el.setAttribute("src", val);
    });

    document.querySelectorAll("[data-content]").forEach(el => {
      const key = el.getAttribute("data-content");
      const val = getByPath(obj, key);
      if (val === undefined) return;

      if (Array.isArray(val)) {
        if (el.getAttribute("data-render") === "list") {
          el.innerHTML = val.map(v => `<li>${v}</li>`).join("");
        } else {
          el.innerHTML = val.map(v => `<div>${v}</div>`).join("");
        }
        return;
      }

      if (typeof val === "string") {
        if (el.getAttribute("data-html") === "true") el.innerHTML = val;
        else el.textContent = val;
        return;
      }

      el.textContent = String(val);
    });
  }

  try {
    const page = document.documentElement.getAttribute("data-page") || "index";
    const [site, pageData] = await Promise.all([
      loadJson("content/site.json"),
      loadJson(`content/${page}.json`)
    ]);

    applyData(site);
    applyData(pageData);

    // SEO: page overrides site
    applySeo(site);
    applySeo(pageData);

    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  } catch (e) {
    console.warn("Content loader failed:", e);
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  }
})();

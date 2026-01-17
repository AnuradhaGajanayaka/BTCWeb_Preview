(async function(){
  const state = { tag: "All", q: "" };

  async function loadJson(path){
    const res = await fetch(path, { cache: "no-store" });
    return await res.json();
  }

  function esc(s){ return (s||"").replace(/[&<>"]/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c])); }

  function renderTags(tags){
    const wrap = document.getElementById("tagChips");
    if(!wrap) return;
    const all = ["All", ...tags];
    wrap.innerHTML = all.map(t=>{
      const active = t===state.tag;
      return `<button data-tag="${esc(t)}" class="rounded-full px-3 py-1 text-xs font-semibold border ${active?'bg-slate-900 text-white border-slate-900':'bg-white border-line text-slate-700 hover:bg-fog'}">${esc(t)}</button>`;
    }).join("");
    wrap.querySelectorAll("button").forEach(b=>b.addEventListener("click", ()=>{
      state.tag=b.getAttribute("data-tag");
      update();
    }));
  }

  let posts=[];

  function match(p){
    if(state.tag!=="All" && !(p.tags||[]).includes(state.tag)) return false;
    if(state.q){
      const t=(p.title+" "+(p.excerpt||"")+" "+(p.tags||[]).join(" ")).toLowerCase();
      if(!t.includes(state.q.toLowerCase())) return false;
    }
    return true;
  }

  function postCard(p){
    const href = `article.html?slug=${encodeURIComponent(p.slug)}`;
    return `
    <a href="${href}" class="group rounded-3xl border border-line bg-fog p-6 shadow-sm hover:bg-white transition">
      <div class="flex items-center justify-between gap-3">
        <span class="text-xs font-semibold text-brandGreen">${esc(p.category||"Blog")}</span>
        <span class="text-xs text-slate-500">${esc(p.date||"")}</span>
      </div>
      <div class="mt-2 text-lg font-semibold text-slate-900 group-hover:text-brandBlue">${esc(p.title)}</div>
      <p class="mt-2 text-sm text-slate-600">${esc(p.excerpt||"")}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        ${(p.tags||[]).slice(0,3).map(t=>`<span class="rounded-full bg-white/80 border border-line px-2 py-0.5 text-xs text-slate-600">${esc(t)}</span>`).join("")}
      </div>
      <div class="mt-5 text-sm font-semibold text-brandBlue">Read →</div>
    </a>`;
  }

  function renderFeatured(p){
    const wrap=document.getElementById("featuredWrap");
    if(!wrap) return;
    if(!p){ wrap.innerHTML=""; return; }
    const href=`article.html?slug=${encodeURIComponent(p.slug)}`;
    wrap.innerHTML = `
      <a href="${href}" class="block rounded-3xl border border-line bg-white shadow overflow-hidden">
        <div class="grid md:grid-cols-2">
          <div class="p-8">
            <div class="inline-flex items-center gap-2 rounded-full bg-brandBlue/10 text-brandBlue px-3 py-1 text-xs font-semibold">Featured</div>
            <h2 class="mt-4 text-2xl font-semibold tracking-tight">${esc(p.title)}</h2>
            <p class="mt-3 text-slate-600">${esc(p.excerpt||"")}</p>
            <div class="mt-5 flex flex-wrap gap-2">
              ${(p.tags||[]).slice(0,4).map(t=>`<span class="rounded-full bg-fog border border-line px-2 py-0.5 text-xs text-slate-600">${esc(t)}</span>`).join("")}
            </div>
            <div class="mt-6 text-sm font-semibold text-brandBlue">Read article →</div>
          </div>
          <div class="bg-fog p-6 flex items-center justify-center">
            <img src="${esc(p.cover||'assets/blog/cover-1.png')}" alt="" class="w-full max-h-[260px] object-cover rounded-2xl border border-line"/>
          </div>
        </div>
      </a>`;
  }

  function update(){
    const grid=document.getElementById("postsGrid");
    if(!grid) return;
    const filtered = posts.filter(match);
    grid.innerHTML = filtered.map(postCard).join("") || `<div class="text-slate-600">No posts found.</div>`;
  }

  try{
    const data = await loadJson("content/blog.json");
    posts = (data.posts||[]).slice().sort((a,b)=> (b.date||"").localeCompare(a.date||""));
    const tags = Array.from(new Set(posts.flatMap(p=>p.tags||[]))).sort();
    renderTags(tags);

    const featuredSlug = data.featured || (posts[0] && posts[0].slug);
    const featured = posts.find(p=>p.slug===featuredSlug);
    renderFeatured(featured);

    const inp=document.getElementById("searchInput");
    if(inp){
      inp.addEventListener("input", ()=>{ state.q=inp.value.trim(); update(); });
    }
    update();
  } catch(e){
    console.warn("Blog load failed", e);
  }
})();

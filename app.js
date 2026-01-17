// BISTEC Care static site content loader
// Loads content/shared.json + content/<page>.json and applies to [data-content] placeholders.
(async function(){
  const html=document.documentElement;
  const page=html.getAttribute('data-page')||'index';
  const base=location.pathname.includes('/BTCWeb_Preview/') ? '/BTCWeb_Preview/' : (location.pathname.endsWith('/')?location.pathname:location.pathname.replace(/[^/]*$/,''));
  async function loadJSON(url){
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok) throw new Error('Failed to load '+url);
    return await res.json();
  }
  function deepGet(obj,path){
    return path.split('.').reduce((o,k)=> (o && k in o)? o[k] : undefined, obj);
  }
  function merge(a,b){
    return {...a,...b, meta:{...(a.meta||{}),...(b.meta||{})}, nav:{...(a.nav||{}),...(b.nav||{})}, cta:{...(a.cta||{}),...(b.cta||{})}, footer:{...(a.footer||{}),...(b.footer||{})}};
  }
  try{
    const shared=await loadJSON(base+'content/shared.json');
    let pageData={};
    try{ pageData=await loadJSON(base+'content/'+page+'.json'); }catch(e){ /* optional */ }
    const data=merge(shared,pageData);
    // Apply meta if present
    if(data.meta){
      if(data.meta.title) document.title=data.meta.title;
      const desc=data.meta.description||'';
      const og=data.meta.ogImage||'';
      function setMeta(name,content,prop=false){
        if(!content) return;
        let sel=prop?`meta[property="${name}"]`:`meta[name="${name}"]`;
        let el=document.querySelector(sel);
        if(!el){ el=document.createElement('meta'); if(prop) el.setAttribute('property',name); else el.setAttribute('name',name); document.head.appendChild(el); }
        el.setAttribute('content',content);
      }
      setMeta('description',desc,false);
      setMeta('og:title',data.meta.title,true);
      setMeta('og:description',desc,true);
      setMeta('og:image',og,true);
    }
    // Inject all text nodes
    document.querySelectorAll('[data-content]').forEach(el=>{
      const key=el.getAttribute('data-content');
      const val=deepGet(data,key);
      if(val===undefined||val===null) return;
      if(el.tagName==='A' && !el.textContent.trim()) el.textContent=val;
      else if(el.tagName==='IMG') el.setAttribute('src',val);
      else el.textContent=val;
    });
    // active nav item
    document.querySelectorAll('[data-nav]').forEach(a=>{
      if(a.getAttribute('data-nav')===page.replace('.html','')) a.classList.add('font-semibold','text-slate-900');
    });
    // year
    const y=document.getElementById('y'); if(y) y.textContent=new Date().getFullYear();
  }catch(err){
    console.warn(err);
  }
})();
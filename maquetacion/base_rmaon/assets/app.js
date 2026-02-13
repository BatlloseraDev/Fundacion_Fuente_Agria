/* =========================================================
  App compartida para:
  - inicio.html (novedades)
  - artesanias.html (catálogo + modal)
  - reparacion.html (muestrario + presupuesto)
  - chat global en todas
========================================================= */

const el = (id) => document.getElementById(id);


/* =====================
   Storage seguro (Safari file://)
===================== */
const SAFE_STORAGE = (() => {
  try{
    const k="__ffa_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return localStorage;
  }catch(_){
    window.__ffaMem = window.__ffaMem || {};
    return {
      getItem: (key) => (key in window.__ffaMem ? window.__ffaMem[key] : null),
      setItem: (key, value) => { window.__ffaMem[key] = String(value); },
      removeItem: (key) => { delete window.__ffaMem[key]; }
    };
  }
})();



/* =====================
   Ajustes del sitio (desde admin/settings.html)
===================== */
const SETTINGS_KEY = "ffa_site_settings_v1";

function getSiteSettings(){
  try{
    const raw = SAFE_STORAGE.getItem(SETTINGS_KEY);
    if(!raw) return { theme: "default", heroImages: [], homepageTitle:"Fundación Fuente Agria", showCollaborators:true, highlightColor:"", newsAutoRotate:true };
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme || "default",
      heroImages: Array.isArray(parsed.heroImages) ? parsed.heroImages : [],
      homepageTitle: parsed.homepageTitle || "Fundación Fuente Agria",
      showCollaborators: (parsed.showCollaborators ?? true),
      highlightColor: parsed.highlightColor || "",
      newsAutoRotate: (parsed.newsAutoRotate ?? true)
    };
  }catch(_){
    return { theme: "default", heroImages: [], homepageTitle:"Fundación Fuente Agria", showCollaborators:true, highlightColor:"", newsAutoRotate:true };
  }
}

function applyTheme(){
  const s = getSiteSettings();
  const theme = (s.theme || "default").toLowerCase();
  if(theme === "dark" || theme === "pastel"){
    document.body.setAttribute("data-theme", theme);
  }else{
    document.body.removeAttribute("data-theme");
  }
}

function renderHeroImages(){
  // Solo en inicio
  if(document.body.getAttribute("data-page") !== "inicio") return;

  const wrap = document.getElementById("heroImages");
  if(!wrap) return;

  const { heroImages } = getSiteSettings();
  const imgs = (heroImages || []).filter(Boolean).slice(0, 5);

  if(imgs.length === 0){
    wrap.innerHTML = '<div class="hero-images-placeholder">Sin imágenes configuradas (admin → Ajustes)</div>';
    return;
  }

  const carouselId = "heroCarousel";
  const indicators = imgs.map((_, i) =>
    `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" ${i===0?'class="active" aria-current="true"':''} aria-label="Slide ${i+1}"></button>`
  ).join("");

  const items = imgs.map((src, i) =>
    `<div class="carousel-item ${i===0?'active':''}">
       <img src="${src}" alt="Imagen de portada ${i+1}" loading="lazy" />
     </div>`
  ).join("");

  wrap.innerHTML = `
    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">${indicators}</div>
      <div class="carousel-inner">${items}</div>
      <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Siguiente</span>
      </button>
    </div>`;
}


function applyHomepageSettings(){
  if(document.body.getAttribute("data-page") !== "inicio") return;
  const s = getSiteSettings();

  // Título principal (si existe un placeholder)
  const t = document.querySelector("[data-bind='homepageTitle']");
  if(t) t.textContent = s.homepageTitle || "Fundación Fuente Agria";

  // Mostrar/ocultar colaboradores
  const collab = document.getElementById("collaboratorLogos");
  if(collab){
    collab.style.display = (s.showCollaborators === false) ? "none" : "";
  }

  // Color destacado (opcional)
  if(s.highlightColor){
    document.documentElement.style.setProperty("--ffa-primary", s.highlightColor);
  }

  // Rotación automática de novedades (si el carrusel existe)
  const newsCarousel = document.getElementById("newsCarousel");
  if(newsCarousel){
    newsCarousel.setAttribute("data-bs-ride", (s.newsAutoRotate === false) ? "false" : "carousel");
  }
}



function formatDate(iso){
  const d = new Date(iso + "T00:00:00");
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* =========================================================
  CHAT DEMO (global)
========================================================= */
const cannedReplies = [
  "¡Gracias por escribir! ¿Podrías indicar medidas aproximadas y una fecha objetivo?",
  "Perfecto, lo reviso. Si tienes alguna foto (URL), compártela y te orientamos.",
  "¡Anotado! Te confirmo materiales y tiempo estimado en cuanto lo valoremos.",
  "Genial 😊 ¿Prefieres recogida o entrega? También dime tu localidad (demo).",
];

function addChatMessage(role, text){
  const history = el("chatHistory");
  if (!history) return;
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;
  msg.textContent = text;
  history.appendChild(msg);
  history.scrollTop = history.scrollHeight;
}

function simulateAgentReply(){
  const delay = 1000 + Math.floor(Math.random()*1000);
  setTimeout(()=>{
    const reply = cannedReplies[Math.floor(Math.random()*cannedReplies.length)];
    addChatMessage("agent", reply);
  }, delay);
}

function initChat(){
  if (!el("chatForm")) return;
  addChatMessage("agent", "Hola 👋 Soy el encargado. ¿En qué puedo ayudarte con artesanías o restauración?");
  el("chatForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    const input = el("chatInput");
    const text = input.value.trim();
    if (!text) return;
    addChatMessage("user", text);
    input.value = "";
    simulateAgentReply();
  });
}

/* =========================================================
  INICIO: Novedades (y modal “ver novedad”)
========================================================= */
function renderNews(){
  const grid = el("newsGrid");
  if (!grid) return;

  const { demoNews } = window.DEMO_DATA;
  grid.innerHTML = "";

  demoNews.slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).forEach((n, idx)=>{
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4";
    col.innerHTML = `
      <article class="card border-0 shadow-sm rounded-4 h-100">
        <img class="card-img-top rounded-top-4" src="${escapeHtml(n.img)}" alt="Imagen de novedad: ${escapeHtml(n.title)}" loading="lazy" />
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <span class="badge badge-soft">${escapeHtml(n.category)}</span>
            <span class="text-muted small">${formatDate(n.date)}</span>
          </div>
          <h3 class="h6 fw-semibold">${escapeHtml(n.title)}</h3>
          <p class="text-muted mb-3">${escapeHtml(n.desc)}</p>
          <button class="btn btn-outline-primary w-100" type="button" data-news-idx="${idx}">
            Ver novedad
          </button>
        </div>
      </article>
    `;
    col.querySelector("button").addEventListener("click", ()=>openNewsDetails(idx));
    grid.appendChild(col);
  });
}

function openNewsDetails(idx){
  const { demoNews } = window.DEMO_DATA;
  const n = demoNews[idx];
  if (!n) return;

  if (el("newsDetailsTitle")) el("newsDetailsTitle").textContent = n.title;
  if (el("newsDetailsMeta")) el("newsDetailsMeta").textContent = `${n.category} · ${formatDate(n.date)}`;
  if (el("newsDetailsImg")) el("newsDetailsImg").src = n.img;
  if (el("newsDetailsImg")) el("newsDetailsImg").alt = `Imagen de novedad: ${n.title}`;
  if (el("newsDetailsDesc")) el("newsDetailsDesc").textContent = n.desc;

  bootstrap.Modal.getOrCreateInstance(el("modalNewsDetails")).show();
}

function initNewsForm(){
  if (!el("newsForm")) return;

  const form = el("newsForm");
  el("newsDate").valueAsDate = new Date();

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const title = el("newsTitle").value.trim();
    const date = el("newsDate").value;
    const category = el("newsCategory").value;
    const desc = el("newsDesc").value.trim();
    const img = el("newsImage").value.trim() || `https://picsum.photos/seed/news_${Date.now()}/800/450`;
    if (!title || !date || !category || !desc) return;

    window.DEMO_DATA.demoNews.push({title,date,category,desc,img});
    renderNews();

    bootstrap.Modal.getOrCreateInstance(el("modalAddNews")).hide();
    form.reset();
    el("newsDate").valueAsDate = new Date();
  });
}

/* =========================================================
  ARTESANÍAS: categorías + filtros + grid + modal detalle
========================================================= */
function getCategories(){
  const { craftCatalog } = window.DEMO_DATA;
  const cats = new Set(craftCatalog.map(c=>c.category));
  return ["Todas", ...Array.from(cats).sort((a,b)=>a.localeCompare(b,"es"))];
}

function renderCategoryOptions(){
  const select = el("craftCategory");
  if (!select) return;

  select.innerHTML = "";
  getCategories().forEach(cat=>{
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  select.value = "Todas";
}

function renderCraftGrid(items){
  const grid = el("craftGrid");
  const empty = el("craftEmpty");
  if (!grid) return;

  grid.innerHTML = "";

  if (!items.length){
    empty?.classList.remove("d-none");
    return;
  }
  empty?.classList.add("d-none");

  items.forEach(item=>{
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-3";
    col.innerHTML = `
      <article class="card border-0 shadow-sm rounded-4 h-100">
        <img class="card-img-top rounded-top-4" src="${escapeHtml(item.images[0])}" alt="Imagen de ${escapeHtml(item.name)}" loading="lazy" />
        <div class="card-body p-4 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <span class="badge badge-soft">${escapeHtml(item.category)}</span>
            <span class="price-pill">${escapeHtml(item.price)}</span>
          </div>
          <h3 class="h6 fw-semibold">${escapeHtml(item.name)}</h3>
          <p class="text-muted small flex-grow-1 mb-3">${escapeHtml(item.short)}</p>
          <button class="btn btn-outline-primary w-100" type="button" data-craft-id="${escapeHtml(item.id)}">
            Ver detalles
          </button>
        </div>
      </article>
    `;
    col.querySelector("button").addEventListener("click", ()=>openCraftDetails(item.id));
    grid.appendChild(col);
  });
}

function applyCraftFilters(){
  const search = el("craftSearch");
  const catSel = el("craftCategory");
  if (!search || !catSel) return;

  const q = search.value.trim().toLowerCase();
  const cat = catSel.value;
  const { craftCatalog } = window.DEMO_DATA;

  const filtered = craftCatalog.filter(item=>{
    const matchesCat = (cat==="Todas") || (item.category===cat);
    const matchesText = !q
      || item.name.toLowerCase().includes(q)
      || item.short.toLowerCase().includes(q)
      || item.description.toLowerCase().includes(q)
      || item.materials.toLowerCase().includes(q);
    return matchesCat && matchesText;
  });

  renderCraftGrid(filtered);
}

function openCraftDetails(id){
  const { craftCatalog } = window.DEMO_DATA;
  const item = craftCatalog.find(x=>x.id===id);
  if (!item) return;

  el("modalCraftDetailsLabel").textContent = item.name;
  el("craftDetailsMeta").textContent = `ID: ${item.id}`;
  el("craftDetailsCategory").textContent = item.category;
  el("craftDetailsPrice").textContent = item.price;
  el("craftDetailsDescription").textContent = item.description;
  el("craftDetailsMaterials").textContent = item.materials;
  el("craftDetailsTime").textContent = item.time;
  el("craftDetailsAvailability").textContent = item.availability;

  el("orderSuccess")?.classList.add("d-none");
  el("orderCraftId").value = item.id;

  const indicators = el("craftCarouselIndicators");
  const inner = el("craftCarouselInner");
  indicators.innerHTML = "";
  inner.innerHTML = "";

  item.images.forEach((src,i)=>{
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-bs-target","#craftCarousel");
    btn.setAttribute("data-bs-slide-to", String(i));
    btn.setAttribute("aria-label", `Ir a imagen ${i+1}`);
    if (i===0){
      btn.className = "active";
      btn.setAttribute("aria-current","true");
    }
    indicators.appendChild(btn);

    const slide = document.createElement("div");
    slide.className = "carousel-item" + (i===0 ? " active":"");
    slide.innerHTML = `
      <img src="${escapeHtml(src)}" class="d-block w-100 rounded-4"
        alt="Imagen ${i+1} de ${escapeHtml(item.name)}"
        style="aspect-ratio:16/9; object-fit:cover;" loading="lazy" />
    `;
    inner.appendChild(slide);
  });

  bootstrap.Modal.getOrCreateInstance(el("modalCraftDetails")).show();
}

function initOrderForm(){
  if (!el("orderForm")) return;

  el("orderForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    el("orderSuccess")?.classList.remove("d-none");

    const craftId = el("orderCraftId").value;
    const craft = window.DEMO_DATA.craftCatalog.find(c=>c.id===craftId);
    const name = el("orderName").value.trim();
    const msg = el("orderMsg").value.trim();

    if (craft && name && msg){
      addChatMessage("user", `Hola, soy ${name}. Quiero encargar: "${craft.name}". ${msg}`);
      simulateAgentReply();
    }
    e.target.querySelectorAll("input:not([type=hidden]), textarea").forEach(inp=>inp.value="");
  });
}

/* =========================================================
  REPARACIÓN: render trabajos + form presupuesto
========================================================= */
function renderRepairs(){
  const grid = el("repairGrid");
  if (!grid) return;

  const { repairJobs } = window.DEMO_DATA;
  grid.innerHTML = "";

  repairJobs.forEach(job=>{
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";
    col.innerHTML = `
      <article class="card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h3 class="h6 fw-semibold mb-0">${escapeHtml(job.title)}</h3>
            <span class="badge badge-soft">${escapeHtml(job.time)}</span>
          </div>
          <div class="text-muted small mb-3">${escapeHtml(job.type)}</div>

          <div class="row g-2">
            <div class="col-6">
              <div class="small text-muted mb-1">Antes</div>
              <img src="${escapeHtml(job.beforeImg)}" class="img-fluid rounded-3 border" alt="Antes: ${escapeHtml(job.title)}" loading="lazy" />
            </div>
            <div class="col-6">
              <div class="small text-muted mb-1">Después</div>
              <img src="${escapeHtml(job.afterImg)}" class="img-fluid rounded-3 border" alt="Después: ${escapeHtml(job.title)}" loading="lazy" />
            </div>
          </div>

          <p class="text-muted small mt-3 mb-0">${escapeHtml(job.desc)}</p>
        </div>
      </article>
    `;
    grid.appendChild(col);
  });
}

function initBudgetForm(){
  if (!el("budgetForm")) return;

  el("budgetForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    el("budgetSuccess")?.classList.remove("d-none");

    const name = el("budgetContactName").value.trim();
    const type = el("budgetType").value.trim();
    const damage = el("budgetDamage").value.trim();

    if (name && type && damage){
      addChatMessage("user", `Soy ${name}. Quiero presupuesto para un/a ${type}. Daño: ${damage}.`);
      simulateAgentReply();
    }

    setTimeout(()=>{
      bootstrap.Modal.getOrCreateInstance(el("modalBudget")).hide();
      e.target.reset();
      el("budgetSuccess")?.classList.add("d-none");
    }, 900);
  });
}

/* =========================================================
  INIT (según página)
========================================================= */
document.addEventListener("DOMContentLoaded", ()=>{
  if (el("yearNow")) el("yearNow").textContent = String(new Date().getFullYear());

  initChat();

  const page = document.body.getAttribute("data-page");

  if (page === "inicio"){
    renderNews();
    initNewsForm();
  }

  if (page === "artesanias"){
    renderCategoryOptions();
    renderCraftGrid(window.DEMO_DATA.craftCatalog);

    el("craftSearch")?.addEventListener("input", applyCraftFilters);
    el("craftCategory")?.addEventListener("change", applyCraftFilters);

    initOrderForm();
  }

  if (page === "reparacion"){
    renderRepairs();
    initBudgetForm();
  }
});

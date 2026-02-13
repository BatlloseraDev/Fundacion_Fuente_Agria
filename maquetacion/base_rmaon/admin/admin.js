\
/* =========================================================
   Admin (wireframe funcional) - guarda todo en localStorage
========================================================= */

const $ = (id) => document.getElementById(id);

const KEY_USERS = "ffa_admin_users_v1";
const KEY_CHATS = "ffa_admin_chats_v1";
const KEY_SETTINGS = "ffa_site_settings_v1";


/* ---------- storage (Safari file:// safe) ---------- */
const SAFE_STORAGE = (() => {
  try{
    const k="__ffa_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return localStorage;
  }catch(_){
    // Fallback in-memory store (per tab)
    window.__ffaMem = window.__ffaMem || {};
    return {
      getItem: (key) => (key in window.__ffaMem ? window.__ffaMem[key] : null),
      setItem: (key, value) => { window.__ffaMem[key] = String(value); },
      removeItem: (key) => { delete window.__ffaMem[key]; }
    };
  }
})();


/* ---------- helpers ---------- */
function uid(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function nowISO(){
  return new Date().toISOString();
}

function loadJSON(key, fallback){
  try{
    const raw = SAFE_STORAGE.getItem(key);
    if(!raw) return fallback;
    return JSON.parse(raw);
  }catch(_){
    return fallback;
  }
}

function saveJSON(key, value){
  SAFE_STORAGE.setItem(key, JSON.stringify(value));
}


function ensureSeed(){

  const seedUsers = [
    { id: uid("usr"), name:"Ana García", email:"ana@example.com", role:"usuario", status:"activo", createdAt: nowISO() },
    { id: uid("usr"), name:"Carlos López", email:"carlos@example.com", role:"usuario", status:"activo", createdAt: nowISO() },
    { id: uid("usr"), name:"María Sánchez", email:"maria@example.com", role:"usuario", status:"activo", createdAt: nowISO() },
    { id: uid("usr"), name:"David Pérez", email:"david@example.com", role:"usuario", status:"suspendido", createdAt: nowISO() },
    { id: uid("usr"), name:"Lucía Martín", email:"lucia@example.com", role:"usuario", status:"activo", createdAt: nowISO() },
    { id: uid("usr"), name:"Javier Romero", email:"javier@example.com", role:"usuario", status:"activo", createdAt: nowISO() },
    { id: uid("usr"), name:"Elena Ruiz", email:"elena@example.com", role:"usuario", status:"activo", createdAt: nowISO() },
    { id: uid("usr"), name:"Pablo Torres", email:"pablo@example.com", role:"usuario", status:"activo", createdAt: nowISO() },
    { id: uid("usr"), name:"Sara Molina", email:"sara@example.com", role:"usuario", status:"activo", createdAt: nowISO() },
    { id: uid("usr"), name:"Hugo Navarro", email:"hugo@example.com", role:"usuario", status:"activo", createdAt: nowISO() }
  ];

  saveJSON(KEY_USERS, seedUsers);

  const seedChats = [
    {
      id: uid("chat"),
      userId: seedUsers[0].id,
      subject: "Encargo de bandeja personalizada",
      status: "open",
      createdAt: nowISO(),
      messages: [
        { from:"user", text:"Hola! ¿Podéis grabar mi nombre en una bandeja?", ts: nowISO() },
        { from:"admin", text:"Sí, claro. ¿Qué tamaño necesitas?", ts: nowISO() }
      ]
    },
    {
      id: uid("chat"),
      userId: seedUsers[2].id,
      subject: "Restauración de silla antigua",
      status: "open",
      createdAt: nowISO(),
      messages: [
        { from:"user", text:"Tengo una silla muy antigua, ¿la podéis restaurar?", ts: nowISO() }
      ]
    },
    {
      id: uid("chat"),
      userId: seedUsers[4].id,
      subject: "Pedido urgente para regalo",
      status: "open",
      createdAt: nowISO(),
      messages: [
        { from:"user", text:"Necesito un llavero grabado antes del viernes.", ts: nowISO() },
        { from:"admin", text:"Podemos intentarlo, ¿qué texto quieres?", ts: nowISO() }
      ]
    },
    {
      id: uid("chat"),
      userId: seedUsers[6].id,
      subject: "Consulta sobre barniz",
      status: "closed",
      createdAt: nowISO(),
      messages: [
        { from:"user", text:"¿Qué barniz recomendáis para interior?", ts: nowISO() },
        { from:"admin", text:"Recomendamos barniz al agua para interior.", ts: nowISO() }
      ]
    }
  ];

  saveJSON(KEY_CHATS, seedChats);

  saveJSON(KEY_SETTINGS, {
    theme:"pastel",
    heroImages: [
      "https://images.unsplash.com/photo-1458322493962-69c5a4ef7dd3?auto=format&fit=crop&w=1400&q=60",
      "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1400&q=60"
    ],
    homepageTitle: "Fundación Fuente Agria",
    showCollaborators: true,
    highlightColor: "#6FAFEA",
    newsAutoRotate: true
  });

}



function getUsers(){ return loadJSON(KEY_USERS, []); }
function setUsers(v){ saveJSON(KEY_USERS, v); }

function getChats(){ return loadJSON(KEY_CHATS, []); }
function setChats(v){ saveJSON(KEY_CHATS, v); }

function getSettings(){ return loadJSON(KEY_SETTINGS, { theme:"default", heroImages: [] }); }
function setSettings(v){ saveJSON(KEY_SETTINGS, v); }

/* ---------- dashboard ---------- */
function renderDashboard(){
  const users = getUsers();
  const chats = getChats();
  const open = chats.filter(c => c.status === "open").length;
  const closed = chats.filter(c => c.status === "closed").length;

  if($("kpiUsers")) $("kpiUsers").textContent = users.length;
  if($("kpiChatsOpen")) $("kpiChatsOpen").textContent = open;
  if($("kpiChatsClosed")) $("kpiChatsClosed").textContent = closed;

  const recent = [...chats].sort((a,b)=> (b.createdAt||"").localeCompare(a.createdAt||"")).slice(0,6);
  const list = $("recentChats");
  if(list){
    list.innerHTML = recent.map(c => `
      <a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
         href="chats.html#${c.id}">
        <div>
          <div class="fw-semibold">${escapeHtml(c.subject || "Sin asunto")}</div>
          <div class="small text-muted">${new Date(c.createdAt).toLocaleString()}</div>
        </div>
        <span class="badge ${c.status==="open"?"text-bg-primary":"text-bg-secondary"}">${c.status}</span>
      </a>
    `).join("") || `<div class="p-3 text-muted">Sin chats aún.</div>`;
  }
}

/* ---------- chats ---------- */
function renderChats(){
  const chats = getChats();
  const users = getUsers();
  const byId = Object.fromEntries(users.map(u => [u.id, u]));

  const list = $("chatList");
  const detail = $("chatDetail");

  const hashId = (location.hash || "").replace("#","") || (chats[0]?.id || "");
  const activeId = hashId;

  if(list){
    list.innerHTML = chats
      .sort((a,b)=> (b.createdAt||"").localeCompare(a.createdAt||""))
      .map(c => {
        const u = byId[c.userId] || { name:"(sin usuario)" };
        const isActive = c.id === activeId;
        const lastMsg = (c.messages||[]).slice(-1)[0]?.text || "";
        return `
          <a href="#${c.id}" class="list-group-item list-group-item-action ${isActive?"active":""}">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">${escapeHtml(c.subject || "Sin asunto")}</div>
                <div class="small">${escapeHtml(u.name)} · <span class="opacity-75">${escapeHtml(lastMsg.slice(0,44))}${lastMsg.length>44?"…":""}</span></div>
              </div>
              <span class="badge ${c.status==="open"?"text-bg-light":"text-bg-dark"}">${c.status}</span>
            </div>
          </a>
        `;
      }).join("") || `<div class="p-3 text-muted">Sin chats.</div>`;
  }

  const chat = chats.find(c => c.id === activeId) || chats[0];
  if(detail && chat){
    const u = byId[chat.userId] || { name:"(sin usuario)", email:"" };
    detail.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between gap-2 align-items-start mb-3">
        <div>
          <h1 class="h5 mb-1">${escapeHtml(chat.subject || "Chat")}</h1>
          <div class="text-muted small">
            ${escapeHtml(u.name)} ${u.email?`· <span class="mono">${escapeHtml(u.email)}</span>`:""} ·
            Creado: ${new Date(chat.createdAt).toLocaleString()}
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" id="btnToggleStatus">
            ${chat.status==="open"?"Cerrar chat":"Reabrir chat"}
          </button>
          <button class="btn btn-sm btn-outline-danger" id="btnDeleteChat">Eliminar</button>
        </div>
      </div>

      <div class="border rounded-4 bg-white p-3" style="height: 380px; overflow:auto;" id="chatMessages">
        ${(chat.messages||[]).map(m => messageBubble(m)).join("")}
      </div>

      <form class="mt-3 d-flex gap-2" id="formReply">
        <input class="form-control" id="replyText" placeholder="Escribe una respuesta..." ${chat.status!=="open"?"disabled":""} />
        <button class="btn btn-primary" ${chat.status!=="open"?"disabled":""}>Enviar</button>
      </form>

      <div class="small text-muted mt-2">
        * Demo: todo se guarda en tu navegador (localStorage).
      </div>
    `;

    const btnToggle = $("btnToggleStatus");
    if(btnToggle){
      btnToggle.addEventListener("click", () => {
        const all = getChats();
        const i = all.findIndex(x => x.id === chat.id);
        if(i>=0){
          all[i].status = all[i].status === "open" ? "closed" : "open";
          setChats(all);
          renderChats();
        }
      });
    }

    const btnDel = $("btnDeleteChat");
    if(btnDel){
      btnDel.addEventListener("click", () => {
        const all = getChats().filter(x => x.id !== chat.id);
        setChats(all);
        location.hash = all[0]?.id ? `#${all[0].id}` : "";
        renderChats();
      });
    }

    const form = $("formReply");
    if(form){
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const txt = ($("replyText")?.value || "").trim();
        if(!txt) return;

        const all = getChats();
        const i = all.findIndex(x => x.id === chat.id);
        if(i>=0){
          all[i].messages = all[i].messages || [];
          all[i].messages.push({ from:"admin", text: txt, ts: nowISO() });
          setChats(all);
          renderChats();

          const msgBox = $("chatMessages");
          if(msgBox) msgBox.scrollTop = msgBox.scrollHeight;
        }
      });
    }
  }
}

function messageBubble(m){
  const isAdmin = m.from === "admin";
  const align = isAdmin ? "justify-content-end" : "justify-content-start";
  const bg = isAdmin ? "bg-primary text-white" : "bg-light";
  const ts = m.ts ? new Date(m.ts).toLocaleString() : "";
  return `
    <div class="d-flex ${align} mb-2">
      <div class="p-2 px-3 rounded-4 ${bg}" style="max-width: 80%;">
        <div>${escapeHtml(m.text || "")}</div>
        <div class="small ${isAdmin?"text-white-50":"text-muted"} mt-1">${escapeHtml(ts)}</div>
      </div>
    </div>
  `;
}

/* ---------- users ---------- */
function renderUsers(){
  const users = getUsers().sort((a,b)=> (a.name||"").localeCompare(b.name||""));
  const tbody = $("usersTbody");
  if(tbody){
    tbody.innerHTML = users.map(u => `
      <tr>
        <td class="fw-semibold">${escapeHtml(u.name)}</td>
        <td class="mono">${escapeHtml(u.email||"")}</td>
        <td><span class="badge ${u.role==="admin"?"text-bg-danger":"text-bg-secondary"}">${escapeHtml(u.role)}</span></td>
        <td><span class="badge ${u.status==="activo"?"text-bg-success":"text-bg-warning"}">${escapeHtml(u.status)}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" data-edit="${u.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-del="${u.id}">Eliminar</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5" class="text-muted">Sin usuarios.</td></tr>`;

    tbody.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del");
        const left = getUsers().filter(x => x.id !== id);
        setUsers(left);
        renderUsers();
      });
    });

    tbody.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => openUserModal(btn.getAttribute("data-edit")));
    });
  }

  const form = $("formAddUser");
  if(form && !form.dataset.bound){
    form.dataset.bound = "1";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = ($("newName")?.value || "").trim();
      const email = ($("newEmail")?.value || "").trim();
      const role = $("newRole")?.value || "usuario";
      if(!name || !email) return;

      const all = getUsers();
      all.push({ id: uid("usr"), name, email, role, status:"activo", createdAt: nowISO() });
      setUsers(all);

      form.reset();
      renderUsers();
    });
  }
}

function openUserModal(userId){
  const user = getUsers().find(u => u.id === userId);
  if(!user) return;

  $("editId").value = user.id;
  $("editName").value = user.name || "";
  $("editEmail").value = user.email || "";
  $("editRole").value = user.role || "usuario";
  $("editStatus").value = user.status || "activo";

  const modal = bootstrap.Modal.getOrCreateInstance($("modalEditUser"));
  modal.show();

  const form = $("formEditUser");
  if(form && !form.dataset.bound){
    form.dataset.bound = "1";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = $("editId").value;
      const all = getUsers();
      const i = all.findIndex(x => x.id === id);
      if(i>=0){
        all[i].name = ($("editName").value || "").trim();
        all[i].email = ($("editEmail").value || "").trim();
        all[i].role = $("editRole").value;
        all[i].status = $("editStatus").value;
        setUsers(all);
        modal.hide();
        renderUsers();
      }
    });
  }
}

/* ---------- settings ---------- */
function renderSettings(){
  const s = getSettings();
  if($("themeSelect")) $("themeSelect").value = s.theme || "default";
  if($("homepageTitle")) $("homepageTitle").value = s.homepageTitle || "Fundación Fuente Agria";
  if($("highlightColor")) $("highlightColor").value = s.highlightColor || "";
  if($("showCollaborators")) $("showCollaborators").checked = (s.showCollaborators !== false);
  if($("newsAutoRotate")) $("newsAutoRotate").checked = (s.newsAutoRotate !== false);

  const list = $("heroList");
  if(list){
    const imgs = (s.heroImages || []).filter(Boolean);
    list.innerHTML = imgs.map((src, i) => `
      <div class="d-flex align-items-center justify-content-between gap-2 border rounded-4 p-2 mb-2 bg-white">
        <div class="text-truncate"><span class="badge text-bg-light me-2">#${i+1}</span><span class="mono">${escapeHtml(src)}</span></div>
        <button class="btn btn-sm btn-outline-danger" data-rm="${i}">Quitar</button>
      </div>
    `).join("") || `<div class="text-muted">No hay imágenes configuradas.</div>`;

    list.querySelectorAll("[data-rm]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-rm"));
        const cur = getSettings();
        cur.heroImages = (cur.heroImages || []).filter((_, i) => i !== idx);
        setSettings(cur);
        renderSettings();
      });
    });
  }

  const formTheme = $("formTheme");
  if(formTheme && !formTheme.dataset.bound){
    formTheme.dataset.bound = "1";
    formTheme.addEventListener("submit", (e) => {
      e.preventDefault();
      const cur = getSettings();
      cur.theme = $("themeSelect").value || "default";
      cur.homepageTitle = ($("homepageTitle")?.value || "Fundación Fuente Agria").trim() || "Fundación Fuente Agria";
      cur.highlightColor = ($("highlightColor")?.value || "").trim();
      cur.showCollaborators = $("showCollaborators") ? $("showCollaborators").checked : true;
      cur.newsAutoRotate = $("newsAutoRotate") ? $("newsAutoRotate").checked : true;
      setSettings(cur);
      toast("Ajustes guardados. Abre Inicio para ver el cambio.");
    });
  }

  const formAddImg = $("formAddHeroImg");
  if(formAddImg && !formAddImg.dataset.bound){
    formAddImg.dataset.bound = "1";
    formAddImg.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = ($("heroImgUrl")?.value || "").trim();
      if(!url) return;
      const cur = getSettings();
      cur.heroImages = cur.heroImages || [];
      cur.heroImages.unshift(url);
      cur.heroImages = cur.heroImages.slice(0, 5);
      setSettings(cur);
      $("heroImgUrl").value = "";
      renderSettings();
      toast("Imagen añadida. Abre Inicio para verla.");
    });
  }

  const btnReset = $("btnResetSettings");
  if(btnReset && !btnReset.dataset.bound){
    btnReset.dataset.bound = "1";
    btnReset.addEventListener("click", () => {
      setSettings({ theme:"default", heroImages: [] });
      renderSettings();
      toast("Ajustes reiniciados.");
    });
  }
}

/* ---------- UI bits ---------- */
function toast(msg){
  const wrap = $("toastWrap");
  if(!wrap) return alert(msg);
  wrap.innerHTML = `
    <div class="toast align-items-center text-bg-dark border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${escapeHtml(msg)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    </div>
  `;
  setTimeout(()=> wrap.innerHTML="", 3200);
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  
  ensureSeed();

  const page = document.body.getAttribute("data-admin-page");
  if(page === "dashboard") renderDashboard();
  if(page === "chats"){
    renderChats();
    window.addEventListener("hashchange", renderChats);
  }
  if(page === "users") renderUsers();
  if(page === "settings") renderSettings();
});

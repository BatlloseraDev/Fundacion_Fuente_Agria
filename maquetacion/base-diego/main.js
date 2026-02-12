document.addEventListener('DOMContentLoaded', () => {

    const DB = {
        users: [
            { name: 'Administrador', email: 'admin@fundacion.com', pass: '1234', role: 'Admin' },
            { name: 'Usuario Prueba', email: 'user@test.com', pass: '1234', role: 'User' }
        ],
        news: [
            {
                title: "Jornada de Puertas Abiertas",
                desc: "Este sábado abrimos nuestros talleres a la comunidad.",
                img: "https://placehold.co/600x400/2c3e50/white?text=Evento",
                date: new Date().toLocaleDateString(),
                featured: true
            }
        ],
        products: [
            {
                name: "Cesta de Mimbre",
                desc: "Hecha a mano en nuestros talleres.",
                img: "https://placehold.co/400x400/27ae60/white?text=Cesta"
            }
        ],
        sponsors: [],
        orders: [],
        chats: {
            'user1': { name: 'María (Madre)', msgs: [{type:'in', text:'Hola, ¿cuándo empieza el curso?'}, {type:'out', text:'Buenos días, en septiembre.'}] },
            'user2': { name: 'Juan (Visitante)', msgs: [{type:'in', text:'Buenas tardes.'}, {type:'in', text:'Quiero donar material.'}] }
        },
        currentUser: null
    };

    let activeChatId = 'user1';

    renderAll();

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.view');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    window.showView = function(viewId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('data-target') === viewId) link.classList.add('active');
        });

        sections.forEach(sec => {
            if(sec.id === viewId) {
                sec.classList.remove('d-none');
                sec.classList.add('active', 'fade-in');
            } else {
                sec.classList.add('d-none');
                sec.classList.remove('active');
            }
        });

        if(window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
            new bootstrap.Collapse(navbarCollapse).hide();
        }

        if(viewId === 'home' || viewId === 'news' || viewId === 'catalog') {
            renderAll();
        }
    };

    const authContainer = document.getElementById('authContainer');
    const adminTab = document.getElementById('adminNavItem');

    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;

        const user = DB.users.find(u => u.email === email && u.pass === pass);

        if(user) {
            DB.currentUser = user;
            updateAuthUI();
            document.getElementById('loginForm').reset();
            
            if(user.role === 'Admin') {
                alert(`¡Bienvenido Admin ${user.name}!`);
                showView('admin');
            } else {
                alert(`¡Hola ${user.name}!`);
                showView('home');
            }
        } else {
            alert('Credenciales incorrectas.');
        }
    });

    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        if(DB.users.find(u => u.email === email)) return alert('Correo ya registrado.');

        DB.users.push({
            name: document.getElementById('regName').value,
            email: email,
            pass: document.getElementById('regPass').value,
            role: 'User'
        });
        alert('Cuenta creada. Inicia sesión.');
        document.getElementById('registerForm').reset();
        showView('login');
    });

    window.logout = function() {
        DB.currentUser = null;
        updateAuthUI();
        alert('Sesión cerrada.');
        showView('home');
    }

    function updateAuthUI() {
        if(DB.currentUser) {
            authContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-check-fill"></i> ${DB.currentUser.name}
                    </button>
                    <ul class="dropdown-menu"><li><a class="dropdown-item" href="#" onclick="logout()">Cerrar Sesión</a></li></ul>
                </div>`;
            
            if(DB.currentUser.role === 'Admin') adminTab.classList.remove('d-none');
            else adminTab.classList.add('d-none');
        } else {
            authContainer.innerHTML = `<button class="btn btn-outline-light btn-sm" onclick="showView('login')"><i class="bi bi-person-circle"></i> Iniciar Sesión</button>`;
            adminTab.classList.add('d-none');
        }
    }

    const readFile = (file, cb) => {
        const reader = new FileReader();
        reader.onload = (e) => cb(e.target.result);
        reader.readAsDataURL(file);
    };

    document.getElementById('heroForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('heroTitleDisplay').textContent = document.getElementById('heroTitleInput').value;
        document.getElementById('heroDescDisplay').textContent = document.getElementById('heroDescInput').value;
        alert('Portada actualizada');
        showView('home');
    });

    document.getElementById('newsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = document.getElementById('newsImage').files[0];
        if(!file) return alert('Sube imagen');

        readFile(file, (img) => {
            DB.news.unshift({
                title: document.getElementById('newsTitle').value,
                desc: document.getElementById('newsDesc').value,
                featured: document.getElementById('newsFeatured').checked,
                img: img,
                date: new Date().toLocaleDateString()
            });
            alert('Noticia publicada');
            e.target.reset();
            renderAll();
        });
    });

    document.getElementById('productForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = document.getElementById('prodImage').files[0];
        if(!file) return alert('Sube imagen');

        readFile(file, (img) => {
            DB.products.unshift({
                name: document.getElementById('prodName').value,
                desc: document.getElementById('prodDesc').value,
                img: img
            });
            alert('Producto añadido');
            e.target.reset();
            renderAll();
        });
    });

    document.getElementById('sponsorForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = document.getElementById('sponsorImage').files[0];
        if(!file) return alert('Sube logo');

        readFile(file, (img) => {
            DB.sponsors.push({
                name: document.getElementById('sponsorName').value,
                img: img
            });
            alert('Colaborador añadido');
            e.target.reset();
            renderAll();
        });
    });

    document.getElementById('createAdminForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        DB.users.push({
            name: document.getElementById('newAdminName').value,
            email: document.getElementById('newAdminEmail').value,
            pass: document.getElementById('newAdminPass').value,
            role: 'Admin'
        });
        alert('Admin registrado');
        e.target.reset();
    });

    function renderAll() {
        const createCard = (n) => `
            <div class="col fade-in">
                <div class="card h-100 shadow-sm">
                    <img src="${n.img}" class="card-img-top" alt="${n.title}">
                    <div class="card-body">
                        ${n.featured ? '<span class="badge bg-danger mb-2">Destacado</span>' : ''}
                        <h5 class="card-title">${n.title}</h5>
                        <p class="card-text">${n.desc}</p>
                    </div>
                    <div class="card-footer text-muted"><small>${n.date}</small></div>
                </div>
            </div>`;
        
        document.getElementById('newsContainer').innerHTML = DB.news.map(createCard).join('');
        document.getElementById('homeNewsContainer').innerHTML = DB.news.filter(n=>n.featured).map(n => `
            <div class="col-md-6 fade-in">
                <div class="card h-100 shadow-sm">
                    <img src="${n.img}" class="card-img-top">
                    <div class="card-body">
                        <span class="badge bg-danger mb-2">Destacado</span>
                        <h5 class="card-title">${n.title}</h5>
                        <p class="card-text">${n.desc}</p>
                    </div>
                </div>
            </div>`).join('');

        document.getElementById('catalogContainer').innerHTML = DB.products.map(p => `
            <div class="col fade-in">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${p.img}" class="card-img-top">
                    <div class="card-body text-center">
                        <h5 class="card-title">${p.name}</h5>
                        <p class="card-text text-muted">${p.desc}</p>
                        <button class="btn btn-primary w-100" data-bs-toggle="modal" data-bs-target="#orderModal" data-product="${p.name}">
                            <i class="bi bi-cart-plus"></i> Solicitar Encargo
                        </button>
                    </div>
                </div>
            </div>`).join('');

        const sponsorContainer = document.getElementById('sponsorsContainer');
        DB.sponsors.forEach(s => {
            if(!sponsorContainer.innerHTML.includes(s.name)) {
                const img = document.createElement('img');
                img.src = s.img; img.alt = s.name; img.className = 'sponsor-logo fade-in';
                sponsorContainer.appendChild(img);
            }
        });

        const tbody = document.getElementById('ordersTableBody');
        const msg = document.getElementById('noOrdersMsg');
        document.getElementById('orderCountBadge').innerText = DB.orders.length;
        
        if(DB.orders.length === 0) {
            msg.style.display = 'block';
            tbody.innerHTML = '';
        } else {
            msg.style.display = 'none';
            tbody.innerHTML = DB.orders.map(o => `
                <tr>
                    <td>${o.date}</td><td>${o.client}</td><td>${o.contact}</td><td>${o.product}</td>
                    <td><span class="badge bg-warning text-dark">Pendiente</span></td>
                </tr>`).join('');
        }

        renderChatList();
        renderConversation();
    }

    const orderModal = document.getElementById('orderModal');
    if(orderModal) {
        orderModal.addEventListener('show.bs.modal', e => {
            const btn = e.relatedTarget;
            document.getElementById('productNameInput').value = btn.getAttribute('data-product');
        });
        
        document.getElementById('orderForm').addEventListener('submit', e => {
            e.preventDefault();
            DB.orders.unshift({
                date: new Date().toLocaleDateString(),
                product: document.getElementById('productNameInput').value,
                client: document.getElementById('orderClientName').value,
                contact: document.getElementById('orderClientContact').value
            });
            alert('Solicitud enviada');
            e.target.reset();
            bootstrap.Modal.getInstance(orderModal).hide();
            renderAll();
        });
    }

    const cw = document.getElementById('chatWidget');
    cw.querySelector('.chat-header').onclick = () => cw.querySelector('#chatContent').classList.toggle('d-none');
    cw.querySelector('button').onclick = () => {
        const inp = cw.querySelector('input');
        const val = inp.value.trim();
        if(val) {
            const b = cw.querySelector('#chatBody');
            b.innerHTML += `<div class="d-flex flex-column align-items-end mb-2"><span class="bg-primary text-white p-2 rounded">${val}</span></div>`;
            inp.value = '';
            
            if(!DB.chats['guest']) DB.chats['guest'] = { name: "Visitante Web", msgs: [] };
            DB.chats['guest'].msgs.push({ type: 'in', text: val });
            renderAll(); 

            setTimeout(() => {
                b.innerHTML += `<div class="d-flex flex-column align-items-start mb-2"><span class="bg-light text-dark p-2 rounded">Gracias, te contactaremos.</span></div>`;
                b.scrollTop = b.scrollHeight;
            }, 1000);
        }
    };

    window.loadChat = (id, el) => {
        activeChatId = id;
        renderAll();
    };

    window.adminSendMessage = () => {
        const inp = document.getElementById('adminChatInput');
        const val = inp.value.trim();
        if(val) {
            DB.chats[activeChatId].msgs.push({ type: 'out', text: val });
            inp.value = '';
            renderAll();
        }
    };

    function renderChatList() {
        const list = document.getElementById('chatUserList');
        list.innerHTML = Object.keys(DB.chats).map(id => {
            const chat = DB.chats[id];
            const active = id === activeChatId ? 'active' : '';
            const last = chat.msgs.length ? chat.msgs[chat.msgs.length-1].text : '';
            return `
                <a href="#" class="list-group-item list-group-item-action ${active}" onclick="loadChat('${id}', this)">
                    <div class="d-flex w-100 justify-content-between"><h6 class="mb-1">${chat.name}</h6></div>
                    <small class="text-truncate d-block" style="max-width: 150px;">${last}</small>
                </a>`;
        }).join('');
    }

    function renderConversation() {
        const display = document.getElementById('adminChatDisplay');
        const chat = DB.chats[activeChatId];
        document.getElementById('currentChatUser').innerText = chat.name;
        
        display.innerHTML = chat.msgs.map(m => `
            <div class="d-flex flex-column ${m.type==='in'?'align-items-start':'align-items-end'} mb-2">
                <span class="${m.type==='in'?'bg-light text-dark':'bg-primary text-white'} p-2 rounded">${m.text}</span>
            </div>
        `).join('');
        display.scrollTop = display.scrollHeight;
    }

    document.getElementById('contrastToggle').onclick = () => document.body.classList.toggle('high-contrast');
});
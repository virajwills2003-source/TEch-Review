/**
 * TECH REVIEW — Main Application & UI Controller
 * Handles: theme switching (Light/Dark/System), phone catalog rendering,
 * live search, GSMArena spec tables, YouTube player, admin CRUD, auth modals.
 */

/* ==========================================
   THEME MANAGEMENT
========================================== */

/**
 * Initialise theme from saved preference (or default to 'dark').
 * Called immediately so the page never flashes a wrong theme.
 */
function initTheme() {
  const saved = localStorage.getItem('techreview_theme') || 'dark';
  applyTheme(saved);
  highlightThemeBtn(saved);
}

/**
 * Set a new theme, persist it, apply to DOM, update button states.
 * @param {'light'|'dark'|'system'} mode
 */
function setTheme(mode) {
  localStorage.setItem('techreview_theme', mode);
  applyTheme(mode);
  highlightThemeBtn(mode);
}

function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
}

function highlightThemeBtn(mode) {
  ['light', 'system', 'dark'].forEach(m => {
    const el = document.getElementById('theme' + m.charAt(0).toUpperCase() + m.slice(1));
    if (el) el.classList.toggle('active', m === mode);
  });
}

// Apply theme immediately before DOMContentLoaded to prevent flash
initTheme();

/* ==========================================
   MAIN APP CONTROLLER
========================================== */
document.addEventListener('DOMContentLoaded', function () {

  // --- State ---
  let allPhones = [];
  let currentFilterBrand = 'ALL';

  // --- DOM refs ---
  const navActions              = document.getElementById('navActions');
  const searchInput             = document.getElementById('searchInput');
  const brandFilters            = document.getElementById('brandFilters');
  const phonesGrid              = document.getElementById('phonesGrid');
  const phoneCount              = document.getElementById('phoneCount');

  const specsModal              = document.getElementById('specsModal');
  const adminModal              = document.getElementById('adminModal');
  const authModal               = document.getElementById('authModal');

  const modalPhoneTitle         = document.getElementById('modalPhoneTitle');
  const modalHeaderCard         = document.getElementById('modalHeaderCard');
  const gsmSpecsTableContainer  = document.getElementById('gsmSpecsTableContainer');
  const videoPlayerContainer    = document.getElementById('videoPlayerContainer');
  const closeSpecsModal         = document.getElementById('closeSpecsModal');

  const adminPhoneForm          = document.getElementById('adminPhoneForm');
  const adminModalTitle         = document.getElementById('adminModalTitle');
  const closeAdminModal         = document.getElementById('closeAdminModal');
  const cancelAdminModal        = document.getElementById('cancelAdminModal');

  const closeAuthModal          = document.getElementById('closeAuthModal');
  const loginForm               = document.getElementById('loginForm');
  const registerForm            = document.getElementById('registerForm');
  const toastContainer          = document.getElementById('toastContainer');

  // --- Boot ---
  renderNavbar();
  loadPhones();
  setupEventListeners();

  /* ==========================================
     NAVBAR
  ========================================== */
  function renderNavbar() {
    const user = BackendService.getCurrentUser();

    if (!user) {
      navActions.innerHTML = `
        <button class="btn btn-primary" onclick="openAuthModal('login')">
          <i class="fa-solid fa-right-to-bracket"></i> Sign In / Register
        </button>`;
      return;
    }

    const isAdmin = user.role === 'admin';
    const rolePill = isAdmin
      ? `<span class="user-role-pill role-admin"><i class="fa-solid fa-shield-halved"></i> Admin</span>`
      : `<span class="user-role-pill role-user"><i class="fa-solid fa-user"></i> User</span>`;

    const addBtn = isAdmin
      ? `<button class="btn btn-admin" onclick="openAdminModal()"><i class="fa-solid fa-plus"></i> Add Mobile Phone</button>`
      : '';

    navActions.innerHTML = `
      ${addBtn}
      <div class="user-badge-group">
        <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}"
             class="user-avatar" alt="Avatar">
        <div style="display:flex;flex-direction:column;line-height:1.2;">
          <span style="font-weight:700;font-size:0.83rem;">${user.name}</span>
          ${rolePill}
        </div>
      </div>
      <button class="btn btn-outline" style="padding:0.45rem 0.75rem;" onclick="handleLogout()" title="Sign Out">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>`;
  }

  /* ==========================================
     PHONE CATALOG
  ========================================== */
  function loadPhones() {
    BackendService.getAllPhones().then(phones => {
      allPhones = phones;
      filterAndRenderPhones();
    });
  }

  function filterAndRenderPhones() {
    const query = searchInput.value.toLowerCase().trim();

    const filtered = allPhones.filter(phone => {
      const matchBrand = currentFilterBrand === 'ALL'
        || phone.brand.toLowerCase() === currentFilterBrand.toLowerCase();

      const blob = [
        phone.brand, phone.model, phone.price,
        phone.specs?.platform?.chipset,
        phone.specs?.display?.type,
        phone.specs?.battery?.type
      ].join(' ').toLowerCase();

      return matchBrand && (!query || blob.includes(query));
    });

    phoneCount.innerText = filtered.length;
    renderPhonesGrid(filtered);
  }

  function renderPhonesGrid(phones) {
    if (!phones.length) {
      phonesGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--text-secondary);">
          <i class="fa-solid fa-mobile-retro" style="font-size:3rem;margin-bottom:1rem;color:var(--text-muted);display:block;"></i>
          <h3>No smartphones match your search</h3>
          <p style="font-size:0.9rem;margin-top:0.5rem;">Try adjusting your search or brand filter.</p>
        </div>`;
      return;
    }

    const user    = BackendService.getCurrentUser();
    const isAdmin = user && user.role === 'admin';

    phonesGrid.innerHTML = phones.map(phone => {
      const hasVideo    = !!(phone.youtubeId || phone.youtubeUrl);
      const displaySize = phone.specs?.display?.size?.split(',')[0] || 'N/A';
      const battery     = phone.specs?.battery?.type?.split(',')[0] || 'N/A';
      const chipset     = phone.specs?.platform?.chipset?.split('(')[0] || 'N/A';

      const adminBtns = isAdmin ? `
        <button class="btn btn-outline" style="padding:0.38rem 0.62rem;color:var(--gold);"
                onclick="openAdminModal('${phone.id}')" title="Edit">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-outline" style="padding:0.38rem 0.62rem;color:var(--red);"
                onclick="handleDeletePhone('${phone.id}')" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>` : '';

      return `
        <div class="phone-card">
          <div class="phone-card-media">
            <span class="brand-badge">${phone.brand}</span>
            ${hasVideo ? `<span class="video-badge"><i class="fa-brands fa-youtube"></i> Video</span>` : ''}
            <img src="${phone.image}" alt="${phone.model}" class="phone-card-img"
                 onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'">
          </div>
          <div class="phone-card-content">
            <h3 class="phone-card-title">${phone.model}</h3>
            <div class="phone-card-release"><i class="fa-regular fa-calendar-check"></i> ${phone.releaseDate || '2024'}</div>
            <div class="quick-specs-grid">
              <div class="quick-spec-item"><i class="fa-solid fa-tv"></i><span>${displaySize}</span></div>
              <div class="quick-spec-item"><i class="fa-solid fa-microchip"></i><span>${chipset}</span></div>
              <div class="quick-spec-item"><i class="fa-solid fa-battery-full"></i><span>${battery}</span></div>
              <div class="quick-spec-item"><i class="fa-solid fa-circle-check"></i><span>${phone.status ? 'Released' : 'Upcoming'}</span></div>
            </div>
            <div class="phone-card-footer">
              <div class="phone-price">${phone.price || '$999'}</div>
              <div class="phone-card-actions">
                ${adminBtns}
                <button class="btn btn-primary" style="padding:0.4rem 0.9rem;font-size:0.83rem;"
                        onclick="openSpecsModal('${phone.id}')">
                  <i class="fa-solid fa-eye"></i> View Specs
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ==========================================
     EVENT LISTENERS
  ========================================== */
  function setupEventListeners() {
    searchInput.addEventListener('input', filterAndRenderPhones);

    brandFilters.addEventListener('click', e => {
      const btn = e.target.closest('.brand-pill');
      if (!btn) return;
      document.querySelectorAll('.brand-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilterBrand = btn.getAttribute('data-brand');
      filterAndRenderPhones();
    });

    closeSpecsModal.addEventListener('click',  () => closeModal(specsModal));
    closeAdminModal.addEventListener('click',  () => closeModal(adminModal));
    cancelAdminModal.addEventListener('click', () => closeModal(adminModal));
    closeAuthModal.addEventListener('click',   () => closeModal(authModal));

    window.addEventListener('click', e => {
      if (e.target === specsModal) closeModal(specsModal);
      if (e.target === adminModal) closeModal(adminModal);
      if (e.target === authModal)  closeModal(authModal);
    });

    adminPhoneForm.addEventListener('submit', handleAdminFormSubmit);
    loginForm.addEventListener('submit',      handleLoginSubmit);
    registerForm.addEventListener('submit',   handleRegisterSubmit);
  }

  /* ==========================================
     MODAL HELPERS
  ========================================== */
  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (modal === specsModal) videoPlayerContainer.innerHTML = '';
  }

  /* ==========================================
     SPECS MODAL — GSMArena Table + YouTube
  ========================================== */
  window.openSpecsModal = function (phoneId) {
    BackendService.getPhoneById(phoneId).then(phone => {
      if (!phone) return;

      modalPhoneTitle.innerText = `${phone.brand} ${phone.model}`;

      const displaySize = phone.specs?.display?.size || 'N/A';
      const chipset     = phone.specs?.platform?.chipset || 'N/A';
      const battery     = phone.specs?.battery?.type || 'N/A';
      const mainCam     = phone.specs?.mainCamera?.triple || phone.specs?.mainCamera?.single || 'N/A';

      modalHeaderCard.innerHTML = `
        <img src="${phone.image}" alt="${phone.model}" class="spec-header-img"
             onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'">
        <div class="spec-header-info">
          <h2 class="spec-header-title">${phone.model}</h2>
          <div class="spec-header-meta">
            <i class="fa-regular fa-clock"></i> Released ${phone.releaseDate || '2024'}
            &nbsp;•&nbsp;
            <i class="fa-solid fa-tag" style="color:var(--gold);"></i> ${phone.price || '$999'}
          </div>
          <div class="spec-quick-highlights">
            <span class="highlight-pill"><i class="fa-solid fa-microchip"></i>${chipset.split('(')[0]}</span>
            <span class="highlight-pill"><i class="fa-solid fa-mobile-screen"></i>${displaySize.split(',')[0]}</span>
            <span class="highlight-pill"><i class="fa-solid fa-battery-full"></i>${battery.split(',')[0]}</span>
            <span class="highlight-pill"><i class="fa-solid fa-camera"></i>${mainCam.substring(0, 28)}…</span>
          </div>
        </div>`;

      renderGSMSpecsTable(phone);
      renderYouTubePlayer(phone);
      switchModalTab('specs');
      openModal(specsModal);
    });
  };

  function renderGSMSpecsTable(phone) {
    const s = phone.specs || {};
    gsmSpecsTableContainer.innerHTML = `
      <table class="gsm-spec-table">
        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-network-wired"></i> Network</th></tr>
        <tr><td class="gsm-spec-key">Technology</td><td class="gsm-spec-val">${s.network?.technology || '—'}</td></tr>
        <tr><td class="gsm-spec-key">SIM</td><td class="gsm-spec-val">${s.network?.sim || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-rocket"></i> Launch</th></tr>
        <tr><td class="gsm-spec-key">Announced</td><td class="gsm-spec-val">${phone.releaseDate || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Status</td><td class="gsm-spec-val">${phone.status || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-box"></i> Body</th></tr>
        <tr><td class="gsm-spec-key">Dimensions</td><td class="gsm-spec-val">${s.body?.dimensions || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Weight</td><td class="gsm-spec-val">${s.body?.weight || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Build</td><td class="gsm-spec-val">${s.body?.build || '—'}</td></tr>
        <tr><td class="gsm-spec-key">IP Rating</td><td class="gsm-spec-val">${s.body?.ipRating || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-tv"></i> Display</th></tr>
        <tr><td class="gsm-spec-key">Type</td><td class="gsm-spec-val">${s.display?.type || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Size</td><td class="gsm-spec-val">${s.display?.size || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Resolution</td><td class="gsm-spec-val">${s.display?.resolution || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Protection</td><td class="gsm-spec-val">${s.display?.protection || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-microchip"></i> Platform</th></tr>
        <tr><td class="gsm-spec-key">OS</td><td class="gsm-spec-val">${s.platform?.os || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Chipset</td><td class="gsm-spec-val">${s.platform?.chipset || '—'}</td></tr>
        <tr><td class="gsm-spec-key">CPU</td><td class="gsm-spec-val">${s.platform?.cpu || '—'}</td></tr>
        <tr><td class="gsm-spec-key">GPU</td><td class="gsm-spec-val">${s.platform?.gpu || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-memory"></i> Memory</th></tr>
        <tr><td class="gsm-spec-key">Internal</td><td class="gsm-spec-val">${s.memory?.internal || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Card Slot</td><td class="gsm-spec-val">${s.memory?.cardSlot || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-camera-retro"></i> Main Camera</th></tr>
        <tr><td class="gsm-spec-key">Setup</td><td class="gsm-spec-val">${s.mainCamera?.triple || s.mainCamera?.single || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Features</td><td class="gsm-spec-val">${s.mainCamera?.features || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Video</td><td class="gsm-spec-val">${s.mainCamera?.video || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-user-circle"></i> Selfie Camera</th></tr>
        <tr><td class="gsm-spec-key">Setup</td><td class="gsm-spec-val">${s.selfieCamera?.single || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Video</td><td class="gsm-spec-val">${s.selfieCamera?.video || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-bolt"></i> Battery & Charging</th></tr>
        <tr><td class="gsm-spec-key">Battery</td><td class="gsm-spec-val">${s.battery?.type || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Charging</td><td class="gsm-spec-val">${s.battery?.charging || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-wifi"></i> Connectivity</th></tr>
        <tr><td class="gsm-spec-key">WLAN</td><td class="gsm-spec-val">${s.comms?.wlan || '—'}</td></tr>
        <tr><td class="gsm-spec-key">Bluetooth</td><td class="gsm-spec-val">${s.comms?.bluetooth || '—'}</td></tr>
        <tr><td class="gsm-spec-key">NFC</td><td class="gsm-spec-val">${s.comms?.nfc || '—'}</td></tr>
        <tr><td class="gsm-spec-key">USB</td><td class="gsm-spec-val">${s.comms?.usb || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-gauge"></i> Sensors & Features</th></tr>
        <tr><td class="gsm-spec-key">Sensors</td><td class="gsm-spec-val">${s.features?.sensors || '—'}</td></tr>

        <tr><th colspan="2" class="gsm-category-header"><i class="fa-solid fa-tag"></i> Pricing</th></tr>
        <tr><td class="gsm-spec-key">Price</td><td class="gsm-spec-val" style="color:var(--gold);font-weight:800;">${phone.price || '—'}</td></tr>
      </table>`;
  }

  function renderYouTubePlayer(phone) {
    const ytId = BackendService.helper.extractYouTubeId(phone.youtubeUrl) || phone.youtubeId || BackendService.helper.extractYouTubeId(phone.youtubeId);
    if (ytId) {
      videoPlayerContainer.innerHTML = `
        <div class="video-player-wrapper">
          <iframe src="https://www.youtube.com/embed/${ytId}?rel=0&autoplay=0"
                  title="${phone.brand} ${phone.model} Video Review"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="no-referrer-when-downgrade"
                  allowfullscreen></iframe>
        </div>`;
    } else {
      videoPlayerContainer.innerHTML = `
        <div class="no-video-box">
          <i class="fa-brands fa-youtube" style="font-size:3rem;color:var(--red);display:block;margin-bottom:1rem;"></i>
          <h3>No Review Video Attached</h3>
          <p style="font-size:0.9rem;margin-top:0.5rem;">Admins can attach a YouTube URL in the Admin Dashboard.</p>
        </div>`;
    }
  }

  window.switchModalTab = function (tab) {
    const specBtn  = document.getElementById('tabSpecsBtn');
    const videoBtn = document.getElementById('tabVideoBtn');
    const specCont = document.getElementById('tabSpecsContent');
    const vidCont  = document.getElementById('tabVideoContent');

    if (tab === 'specs') {
      specBtn.classList.add('active');    videoBtn.classList.remove('active');
      specCont.style.display = 'block';  vidCont.style.display  = 'none';
    } else {
      videoBtn.classList.add('active');   specBtn.classList.remove('active');
      vidCont.style.display  = 'block';  specCont.style.display = 'none';
    }
  };

  /* ==========================================
     ADMIN MODAL
  ========================================== */
  window.openAdminModal = function (phoneId = null) {
    const user = BackendService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      showToast('Admin privileges required.', 'error');
      openAuthModal('login');
      return;
    }

    adminPhoneForm.reset();
    document.getElementById('adminPhoneId').value = '';

    if (phoneId) {
      adminModalTitle.innerText = 'Edit Smartphone Specs';
      BackendService.getPhoneById(phoneId).then(phone => {
        if (!phone) return;
        setField('adminPhoneId',       phone.id);
        setField('inputBrand',         phone.brand);
        setField('inputModel',         phone.model);
        setField('inputReleaseDate',   phone.releaseDate);
        setField('inputStatus',        phone.status);
        setField('inputPrice',         phone.price);
        setField('inputImage',         phone.image);
        setField('inputYoutubeUrl',    phone.youtubeUrl);

        const s = phone.specs || {};
        setField('specNetworkTech',    s.network?.technology);
        setField('specSim',            s.network?.sim);
        setField('specDimensions',     s.body?.dimensions);
        setField('specWeight',         s.body?.weight);
        setField('specIpRating',       s.body?.ipRating);
        setField('specDisplayType',    s.display?.type);
        setField('specDisplaySize',    s.display?.size);
        setField('specDisplayRes',     s.display?.resolution);
        setField('specOs',             s.platform?.os);
        setField('specChipset',        s.platform?.chipset);
        setField('specGpu',            s.platform?.gpu);
        setField('specMemoryInternal', s.memory?.internal);
        setField('specMainCamera',     s.mainCamera?.triple || s.mainCamera?.single);
        setField('specSelfieCamera',   s.selfieCamera?.single);
        setField('specBatteryType',    s.battery?.type);
        setField('specCharging',       s.battery?.charging);
        setField('specSensors',        s.features?.sensors);

        openModal(adminModal);
      });
    } else {
      adminModalTitle.innerText = 'Add New Mobile Phone';
      openModal(adminModal);
    }
  };

  function setField(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  window.handleImageUpload = function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('inputImage').value = ev.target.result;
      showToast('Image uploaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  function handleAdminFormSubmit(e) {
    e.preventDefault();
    const data = {
      id:          document.getElementById('adminPhoneId').value,
      brand:       document.getElementById('inputBrand').value.trim(),
      model:       document.getElementById('inputModel').value.trim(),
      releaseDate: document.getElementById('inputReleaseDate').value.trim(),
      status:      document.getElementById('inputStatus').value.trim(),
      price:       document.getElementById('inputPrice').value.trim(),
      image:       document.getElementById('inputImage').value.trim(),
      youtubeUrl:  document.getElementById('inputYoutubeUrl').value.trim(),
      specs: {
        network:    { technology: v('specNetworkTech'), sim: v('specSim') },
        body:       { dimensions: v('specDimensions'), weight: v('specWeight'), ipRating: v('specIpRating') },
        display:    { type: v('specDisplayType'), size: v('specDisplaySize'), resolution: v('specDisplayRes') },
        platform:   { os: v('specOs'), chipset: v('specChipset'), gpu: v('specGpu') },
        memory:     { internal: v('specMemoryInternal') },
        mainCamera: { triple: v('specMainCamera') },
        selfieCamera: { single: v('specSelfieCamera') },
        battery:    { type: v('specBatteryType'), charging: v('specCharging') },
        features:   { sensors: v('specSensors') }
      }
    };

    BackendService.savePhone(data)
      .then(res => {
        showToast(res.message, 'success');
        closeModal(adminModal);
        loadPhones();
      })
      .catch(err => showToast(err.message, 'error'));
  }

  function v(id) { return (document.getElementById(id)?.value || '').trim(); }

  window.handleDeletePhone = function (id) {
    if (!confirm('Delete this smartphone from Tech Review database?')) return;
    BackendService.deletePhone(id)
      .then(res => { showToast(res.message, 'success'); loadPhones(); })
      .catch(err =>   showToast(err.message, 'error'));
  };

  /* ==========================================
     AUTH MODAL
  ========================================== */
  function updateAuthWrapperHeight(tab) {
    const wrapper = document.getElementById('authFormsWrapper');
    const loginSlide = document.getElementById('loginSlide');
    const registerSlide = document.getElementById('registerSlide');
    if (!wrapper || !loginSlide || !registerSlide) return;

    const activeSlide = tab === 'login' ? loginSlide : registerSlide;
    requestAnimationFrame(() => {
      const h = activeSlide.offsetHeight;
      if (h > 0) {
        wrapper.style.height = h + 'px';
      }
    });
  }

  window.openAuthModal = function (tab = 'login') {
    switchAuthTab(tab);
    openModal(authModal);
    setTimeout(() => {
      updateAuthWrapperHeight(tab);
    }, 50);
  };

  window.switchAuthTab = function (tab) {
    const loginBtn  = document.getElementById('tabLoginBtn');
    const regBtn    = document.getElementById('tabRegisterBtn');
    const tabsGroup = document.querySelector('.auth-modal-tabs');
    const track     = document.getElementById('authFormsTrack');
    const title     = document.getElementById('authModalTitle');

    if (tab === 'login') {
      if (loginBtn)  loginBtn.classList.add('active');
      if (regBtn)    regBtn.classList.remove('active');
      if (tabsGroup) tabsGroup.classList.remove('slide-register');
      if (track)     track.classList.remove('slide-register');
      if (title)     title.innerText = 'Sign In — Tech Review';
    } else {
      if (regBtn)    regBtn.classList.add('active');
      if (loginBtn)  loginBtn.classList.remove('active');
      if (tabsGroup) tabsGroup.classList.add('slide-register');
      if (track)     track.classList.add('slide-register');
      if (title)     title.innerText = 'Create Account';
    }
    updateAuthWrapperHeight(tab);
  };

  function handleLoginSubmit(e) {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    BackendService.login(u, p)
      .then(res => {
        showToast(`Welcome, ${res.user.name}! (${res.user.role.toUpperCase()})`, 'success');
        closeModal(authModal);
        renderNavbar();
        loadPhones();
      })
      .catch(err => showToast(err.message, 'error'));
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const name     = document.getElementById('regName').value;
    const password = document.getElementById('regPassword').value;
    const role     = document.getElementById('regRole').value;
    BackendService.register({ username, name, password, role })
      .then(res => {
        showToast(`Account created as ${role.toUpperCase()}!`, 'success');
        closeModal(authModal);
        renderNavbar();
        loadPhones();
      })
      .catch(err => showToast(err.message, 'error'));
  }

  window.handleLogout = function () {
    BackendService.logout().then(() => {
      showToast('Logged out successfully.', 'info');
      renderNavbar();
      loadPhones();
    });
  };

  /* ==========================================
     TOAST UTILITY
  ========================================== */
  function showToast(message, type = 'info') {
    const icons = {
      success: '<i class="fa-solid fa-circle-check" style="color:var(--green);"></i>',
      error:   '<i class="fa-solid fa-circle-exclamation" style="color:var(--red);"></i>',
      info:    '<i class="fa-solid fa-circle-info" style="color:var(--accent);"></i>'
    };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `${icons[type] || icons.info}<span style="font-size:0.88rem;font-weight:500;">${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity    = '0';
      toast.style.transform  = 'translateX(110%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

}); // end DOMContentLoaded

/**
 * TECH REVIEW — Backend Service Layer
 *
 * Auto-detects runtime environment:
 *  - When served via XAMPP (http://localhost/...) → uses PHP REST API + MySQL
 *  - When opened as a plain file (file://) → uses LocalStorage fallback
 *
 * Public API is identical in both modes so app.js doesn't need to change.
 */

const BackendService = (function () {

  /* ==========================================
     ENVIRONMENT DETECTION
  ========================================== */
  const IS_XAMPP = window.location.protocol !== 'file:';
const API_BASE = IS_XAMPP ? (window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '')) : null;

  if (IS_XAMPP) {
    console.log('%c[Tech Review] Running on XAMPP — using PHP/MySQL API at ' + API_BASE, 'color:#3b82f6;font-weight:bold;');
  } else {
    console.log('%c[Tech Review] Running as file:// — using LocalStorage fallback', 'color:#f59e0b;font-weight:bold;');
  }

  /* ==========================================
     LOCALSTORAGE KEYS & SEED DATA (fallback)
  ========================================== */
  const LS = {
    USERS:   'techreview_users_v2',
    PHONES:  'techreview_phones_v3',
    SESSION: 'techreview_session_v2'
  };

  const SEED_PHONES = [
    {
      id: 'phone-16-pro-max', brand: 'Apple', model: 'iPhone 16 Pro Max',
      releaseDate: '2024, September', status: 'Available. Released 2024, September',
      price: '$1,199',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=M-MkWpXb72g', youtubeId: 'M-MkWpXb72g',
      rating: 4.8, views: 14200,
      specs: {
        network: { technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G', sim: 'Nano-SIM and eSIM / Dual eSIM' },
        body: { dimensions: '163.0 x 77.6 x 8.25 mm', weight: '227 g (8.01 oz)', build: 'Glass front/back, grade 5 titanium frame', ipRating: 'IP68 (up to 6m for 30 min)' },
        display: { type: 'LTPO Super Retina XDR OLED, 120Hz, HDR10, Dolby Vision', size: '6.9 inches (~91.4% ratio)', resolution: '1320 x 2868 pixels (~460 ppi)', protection: 'Ceramic Shield (2024)' },
        platform: { os: 'iOS 18', chipset: 'Apple A18 Pro (3 nm)', cpu: 'Hexa-core (2x4.04 GHz + 4x2.0 GHz)', gpu: 'Apple GPU (6-core)' },
        memory: { internal: '256GB / 512GB / 1TB, 8GB RAM', cardSlot: 'No' },
        mainCamera: { triple: '48 MP (wide, OIS), 12 MP (periscope 5x), 48 MP (ultrawide)', features: 'Dual-LED, HDR, LiDAR', video: '4K@120fps, ProRes, Dolby Vision HDR' },
        selfieCamera: { single: '12 MP, f/1.9, PDAF, OIS', video: '4K@60fps' },
        battery: { type: 'Li-Ion 4685 mAh, non-removable', charging: '25W wired, 25W MagSafe, 15W Qi2' },
        comms: { wlan: 'Wi-Fi 7, tri-band', bluetooth: '5.3, A2DP, LE', nfc: 'Yes', usb: 'USB-C 3.2 Gen 2' },
        features: { sensors: 'Face ID, accelerometer, gyro, proximity, compass, barometer' }
      }
    },
    {
      id: 'samsung-s24-ultra', brand: 'Samsung', model: 'Galaxy S24 Ultra',
      releaseDate: '2024, January', status: 'Available. Released 2024, January',
      price: '$1,299',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=v3_v9U47YhQ', youtubeId: 'v3_v9U47YhQ',
      rating: 4.7, views: 18900,
      specs: {
        network: { technology: 'GSM / CDMA / HSPA / LTE / 5G', sim: 'Nano-SIM and eSIM / Dual SIM' },
        body: { dimensions: '162.3 x 79.0 x 8.6 mm', weight: '232 g (8.18 oz)', build: 'Gorilla Armor front, Gorilla Glass back, titanium frame', ipRating: 'IP68 (up to 1.5m for 30 min), S-Pen' },
        display: { type: 'Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits', size: '6.8 inches (~88.5% ratio)', resolution: '1440 x 3120 pixels (~505 ppi)', protection: 'Corning Gorilla Armor' },
        platform: { os: 'Android 14, One UI 6.1.1 (7 major OS upgrades)', chipset: 'Snapdragon 8 Gen 3 (4 nm)', cpu: '8-core (1x3.39 GHz Cortex-X4 + 3x3.1 GHz + 2x2.9 GHz + 2x2.2 GHz)', gpu: 'Adreno 750 (1 GHz)' },
        memory: { internal: '256GB / 512GB / 1TB UFS 4.0, 12GB RAM', cardSlot: 'No' },
        mainCamera: { triple: '200 MP (wide, OIS), 50 MP (periscope 5x), 10 MP (tele 3x), 12 MP (ultrawide)', features: 'LED flash, auto-HDR', video: '8K@24fps, 4K@120fps, HDR10+' },
        selfieCamera: { single: '12 MP, f/2.2, Dual Pixel PDAF', video: '4K@60fps' },
        battery: { type: 'Li-Ion 5000 mAh, non-removable', charging: 'Wired 45W, 15W wireless, 4.5W reverse' },
        comms: { wlan: 'Wi-Fi 7, tri-band', bluetooth: '5.3, A2DP, LE', nfc: 'Yes', usb: 'USB-C 3.2, OTG, DisplayPort' },
        features: { sensors: 'Fingerprint (ultrasonic, under display), accelerometer, gyro, barometer, Samsung DeX' }
      }
    },
    {
      id: 'rog-phone-9-pro', brand: 'ASUS', model: 'ROG Phone 9 Pro',
      releaseDate: '2024, November', status: 'Available. Released 2024, November',
      price: '$1,199',
      image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=600&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=1SgWp839w5A', youtubeId: '1SgWp839w5A',
      rating: 4.9, views: 9400,
      specs: {
        network: { technology: 'GSM / CDMA / HSPA / LTE / 5G', sim: 'Dual SIM (Nano-SIM)' },
        body: { dimensions: '163.8 x 76.8 x 8.9 mm', weight: '227 g', build: 'Gorilla Glass Victus 2, aluminum frame', ipRating: 'IP68, AniMe Vision LED 648-LED matrix' },
        display: { type: 'LTPO AMOLED, 185Hz, HDR10, 2500 nits', size: '6.78 inches (~88.2% ratio)', resolution: '1080 x 2400 pixels (~388 ppi)', protection: 'Gorilla Glass Victus 2' },
        platform: { os: 'Android 15, ROG UI', chipset: 'Qualcomm Snapdragon 8 Elite (3 nm)', cpu: '8-core (2x4.32 GHz Oryon V2 + 6x3.53 GHz)', gpu: 'Adreno 830' },
        memory: { internal: '512GB 16GB RAM / 1TB 24GB RAM (UFS 4.0)', cardSlot: 'No' },
        mainCamera: { triple: '50 MP (Gimbal OIS), 32 MP (tele 3x), 13 MP (ultrawide)', features: 'LED flash, HDR', video: '8K@30fps, 4K@60fps, HDR10+' },
        selfieCamera: { single: '32 MP, f/2.5, 22mm wide', video: '1080p@30fps' },
        battery: { type: 'Si/C 5800 mAh, non-removable', charging: '65W wired (100% in 46 min), 15W wireless, 10W reverse' },
        comms: { wlan: 'Wi-Fi 7, tri-band', bluetooth: '5.4, aptX HD, aptX Adaptive', nfc: 'Yes', usb: 'USB-C 3.2 + USB-C 2.0, DisplayPort 1.4' },
        features: { sensors: 'Fingerprint (under display), pressure gaming triggers, accelerometer, gyro' }
      }
    },
    {
      id: 'vivo-v30-pro', brand: 'Vivo', model: 'Vivo V30 Pro',
      releaseDate: '2024, February', status: 'Available. Released 2024, March',
      price: '$540',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=6P5E1B_k10I', youtubeId: '6P5E1B_k10I',
      rating: 4.6, views: 8100,
      specs: {
        network: { technology: 'GSM / HSPA / LTE / 5G', sim: 'Dual SIM (Nano-SIM)' },
        body: { dimensions: '164.4 x 75.1 x 7.5 mm', weight: '188 g', ipRating: 'IP54 splash resistant' },
        display: { type: 'AMOLED, 120Hz, HDR10+, 2800 nits', size: '6.78 inches (~89.9% ratio)', resolution: '1260 x 2800 pixels (~453 ppi)' },
        platform: { os: 'Android 14, Funtouch 14', chipset: 'Mediatek Dimensity 8200 (4 nm)', gpu: 'Mali-G610 MC6' },
        memory: { internal: '256GB/512GB 12GB RAM (UFS 3.1)' },
        mainCamera: { triple: '50 MP (wide, OIS, ZEISS), 50 MP (tele 2x), 50 MP (ultrawide)', video: '4K@30fps, gyro-EIS' },
        selfieCamera: { single: '50 MP, f/2.0, 21mm, AF', video: '4K@30fps' },
        battery: { type: 'Li-Ion 5000 mAh', charging: '80W wired (100% in 43 min)' },
        comms: { wlan: 'Wi-Fi 6', bluetooth: '5.3, aptX HD', nfc: 'Yes', usb: 'USB-C 2.0, OTG' },
        features: { sensors: 'Fingerprint (under display), accelerometer, gyro, compass' }
      }
    },
    {
      id: 'huawei-p60-pro', brand: 'Huawei', model: 'Huawei P60 Pro',
      releaseDate: '2023, March', status: 'Available. Released 2023, March',
      price: '$990',
      image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=w1vG7X29e7k', youtubeId: 'w1vG7X29e7k',
      rating: 4.7, views: 11200,
      specs: {
        network: { technology: 'GSM / CDMA / HSPA / LTE', sim: 'Single / Hybrid Dual SIM' },
        body: { dimensions: '161.0 x 74.5 x 8.3 mm', weight: '200 g', ipRating: 'IP68 (up to 1.5m for 30 min)' },
        display: { type: 'LTPO OLED, 120Hz', size: '6.67 inches (~89.8% ratio)', resolution: '1220 x 2700 pixels (~444 ppi)' },
        platform: { os: 'EMUI 13.1 / HarmonyOS 3.1', chipset: 'Snapdragon 8+ Gen 1 4G (4 nm)', gpu: 'Adreno 730' },
        memory: { internal: '256GB 8GB RAM / 512GB 12GB RAM', cardSlot: 'NM Card up to 256GB' },
        mainCamera: { triple: '48 MP (variable f/1.4-f/4.0, OIS), 48 MP (3.5x tele, OIS), 13 MP (ultrawide)', features: 'XMAGE optics, HDR', video: '4K@60fps, 1080p@960fps' },
        selfieCamera: { single: '13 MP, f/2.4, ultrawide', video: '4K@60fps' },
        battery: { type: 'Li-Po 4815 mAh', charging: '88W wired (50% in 10 min), 50W wireless, reverse' },
        comms: { wlan: 'Wi-Fi 6', bluetooth: '5.2', nfc: 'Yes', usb: 'USB-C 3.1, OTG' },
        features: { sensors: 'Fingerprint (under display), accelerometer, gyro, compass' }
      }
    }
  ];

  const SEED_USERS = [
    {
      id: 'usr-admin', username: 'admin', name: 'System Admin',
      email: 'admin@techreview.com', password: 'admin123', role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'usr-user', username: 'user', name: 'Mobile Enthusiast',
      email: 'user@techreview.com', password: 'user123', role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    }
  ];

  /* ==========================================
     LOCALSTORAGE HELPERS (fallback)
  ========================================== */
  function lsGet(key, seed) {
    const raw = localStorage.getItem(key);
    if (!raw) { localStorage.setItem(key, JSON.stringify(seed)); return seed; }
    return JSON.parse(raw);
  }
  function lsSave(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  function lsSession() { const r = localStorage.getItem(LS.SESSION); return r ? JSON.parse(r) : null; }
  function lsSetSession(u) { u ? localStorage.setItem(LS.SESSION, JSON.stringify(u)) : localStorage.removeItem(LS.SESSION); }

  /* ==========================================
     YOUTUBE HELPER
  ========================================== */
  function extractYouTubeId(input) {
    if (!input) return '';
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const m = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (m && m[1]) return m[1];
    return '';
  }

  /* ==========================================
     PHP API FETCH HELPER (XAMPP mode)
  ========================================== */
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await res.json();
    if (!data.success) throw data;
    return data;
  }

  /* ==========================================
     LOCALSTORAGE AUTH (fallback)
  ========================================== */
  const lsAuth = {
    login(username, password) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const users = lsGet(LS.USERS, SEED_USERS);
          const found = users.find(u =>
            u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
          );
          if (found) {
            const session = { id: found.id, username: found.username, name: found.name, email: found.email, role: found.role, avatar: found.avatar };
            lsSetSession(session);
            resolve({ success: true, user: found });
          } else {
            reject({ success: false, message: 'Invalid username or password!' });
          }
        }, 200);
      });
    },

    register(data) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const users = lsGet(LS.USERS, SEED_USERS);
          if (users.some(u => u.username.toLowerCase() === data.username.trim().toLowerCase())) {
            reject({ success: false, message: 'Username is already taken!' });
            return;
          }
          const newUser = {
            id: 'usr-' + Date.now(),
            username: data.username.trim(),
            name: data.name || data.username,
            email: data.email || '',
            password: data.password,
            role: data.role || 'user',
            avatar: data.role === 'admin'
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
          };
          users.push(newUser);
          lsSave(LS.USERS, users);
          lsSetSession(newUser);
          resolve({ success: true, user: newUser });
        }, 200);
      });
    },

    logout() { lsSetSession(null); return Promise.resolve({ success: true }); },
    getCurrentUser() { return lsSession(); }
  };

  /* ==========================================
     LOCALSTORAGE PHONES (fallback)
  ========================================== */
  const lsPhones = {
    getAll() { return Promise.resolve(lsGet(LS.PHONES, SEED_PHONES)); },
    getById(id) {
      const p = lsGet(LS.PHONES, SEED_PHONES).find(p => p.id === id);
      return Promise.resolve(p || null);
    },
    save(data) {
      return new Promise((resolve, reject) => {
        const session = lsSession();
        if (!session || session.role !== 'admin') {
          reject({ success: false, message: 'Admin privileges required.' });
          return;
        }
        const phones = lsGet(LS.PHONES, SEED_PHONES);
        const ytId   = extractYouTubeId(data.youtubeUrl);

        if (data.id) {
          const idx = phones.findIndex(p => p.id === data.id);
          if (idx !== -1) {
            phones[idx] = { ...phones[idx], ...data, youtubeId: ytId || phones[idx].youtubeId };
            lsSave(LS.PHONES, phones);
            resolve({ success: true, phone: phones[idx], message: 'Phone specs updated!' });
            return;
          }
        }

        const newId = 'phone-' + data.brand.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const newPhone = { ...data, id: newId, youtubeId: ytId, rating: 4.5, views: 0 };
        phones.unshift(newPhone);
        lsSave(LS.PHONES, phones);
        resolve({ success: true, phone: newPhone, message: 'Phone added to Tech Review!' });
      });
    },
    delete(id) {
      return new Promise((resolve, reject) => {
        const session = lsSession();
        if (!session || session.role !== 'admin') {
          reject({ success: false, message: 'Admin privileges required.' });
          return;
        }
        let phones = lsGet(LS.PHONES, SEED_PHONES);
        phones = phones.filter(p => p.id !== id);
        lsSave(LS.PHONES, phones);
        resolve({ success: true, message: 'Phone deleted from Tech Review!' });
      });
    }
  };

  /* ==========================================
     PHP API PHONES (XAMPP mode)
  ========================================== */
  const phpPhones = {
    getAll() {
      return apiFetch(API_BASE + '/phones.php').then(r => r.phones);
    },
    getById(id) {
      return apiFetch(API_BASE + '/phones.php?id=' + encodeURIComponent(id)).then(r => r.phone);
    },
    save(data) {
      if (data.id) {
        return apiFetch(API_BASE + '/phones.php?id=' + encodeURIComponent(data.id), {
          method: 'PUT', body: JSON.stringify(data)
        });
      }
      return apiFetch(API_BASE + '/phones.php', { method: 'POST', body: JSON.stringify(data) });
    },
    delete(id) {
      return apiFetch(API_BASE + '/phones.php?id=' + encodeURIComponent(id), { method: 'DELETE' });
    }
  };

  /* ==========================================
     PHP API AUTH (XAMPP mode)
  ========================================== */
  const phpAuth = {
    login(username, password) {
      return apiFetch(API_BASE + '/auth.php?action=login', { method: 'POST', body: JSON.stringify({ username, password }) });
    },
    register(data) {
      return apiFetch(API_BASE + '/auth.php?action=register', { method: 'POST', body: JSON.stringify(data) });
    },
    logout() {
      return apiFetch(API_BASE + '/auth.php?action=logout', { method: 'POST' });
    },
    getCurrentUser() {
      // Return cached value; full session check must be async — call refreshSession() on page load if needed
      return window.__techreviewUser || null;
    }
  };

  /* ==========================================
     PUBLIC API — uniform interface
  ========================================== */
  return {
    isXAMPP: IS_XAMPP,

    login(username, password) {
      if (IS_XAMPP) {
        return phpAuth.login(username, password).then(res => {
          window.__techreviewUser = res.user;
          return res;
        });
      }
      return lsAuth.login(username, password);
    },

    register(data) {
      if (IS_XAMPP) {
        return phpAuth.register(data).then(res => {
          window.__techreviewUser = res.user;
          return res;
        });
      }
      return lsAuth.register(data);
    },

    logout() {
      if (IS_XAMPP) {
        return phpAuth.logout().then(res => {
          window.__techreviewUser = null;
          return res;
        });
      }
      return lsAuth.logout();
    },

    getCurrentUser() {
      if (IS_XAMPP) return phpAuth.getCurrentUser();
      return lsAuth.getCurrentUser();
    },

    getAllPhones() {
      return IS_XAMPP ? phpPhones.getAll() : lsPhones.getAll();
    },

    getPhoneById(id) {
      return IS_XAMPP ? phpPhones.getById(id) : lsPhones.getById(id);
    },

    savePhone(data) {
      return IS_XAMPP ? phpPhones.save(data) : lsPhones.save(data);
    },

    deletePhone(id) {
      return IS_XAMPP ? phpPhones.delete(id) : lsPhones.delete(id);
    },

    /**
     * Refresh current session from server (XAMPP mode only).
     * Call this once on page load to restore login state across refreshes.
     */
    refreshSession() {
      if (!IS_XAMPP) return Promise.resolve(lsAuth.getCurrentUser());
      return fetch(API_BASE + '/auth.php?action=session', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          window.__techreviewUser = data.success ? data.user : null;
          return window.__techreviewUser;
        })
        .catch(() => {
          window.__techreviewUser = null;
          return null;
        });
    },

    helper: { extractYouTubeId }
  };

})();

// ═══════════════════════════════════════════════════════
// MyAutoCare — App Core
// Auth: Firebase | Database: Firestore | Cache: Memory
// ═══════════════════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, enableIndexedDbPersistence,
  collection, doc,
  addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const _cfg = {
  apiKey:            "AIzaSyAqN0nW66a2lBrjm_8UDafYkOUme1zhvRE",
  authDomain:        "myautocare-77996.firebaseapp.com",
  projectId:         "myautocare-77996",
  storageBucket:     "myautocare-77996.firebasestorage.app",
  messagingSenderId: "750791367549",
  appId:             "1:750791367549:web:4d2d50356216aaca9dca14"
};

const _app  = initializeApp(_cfg);
const _auth = getAuth(_app);
const _db   = getFirestore(_app);

// Enable offline persistence — makes app fast after first load
// Data cached in browser IndexedDB
try {
  enableIndexedDbPersistence(_db).catch(() => {});
} catch {}

// ── In-memory cache — instant reads within same session ──
const _cache = {
  _store: {},
  key(uid, col) { return uid + ':' + col; },
  get(uid, col) { return this._store[this.key(uid, col)] || null; },
  set(uid, col, data) { this._store[this.key(uid, col)] = data; },
  invalidate(uid, col) { delete this._store[this.key(uid, col)]; },
  invalidateAll(uid) {
    Object.keys(this._store).forEach(k => { if (k.startsWith(uid + ':')) delete this._store[k]; });
  }
};

// ── Session ───────────────────────────────────────────
let _session = null;

const MAC = {

  // ── AUTH ──────────────────────────────────────────────
  auth: {
    getUser()    { return _session; },
    isLoggedIn() { return !!_session; },

    async requireAuth() {
      if (_session) return _session;
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => { window.location.href = 'login.html'; reject(); }, 8000);
        onAuthStateChanged(_auth, async fbUser => {
          clearTimeout(t);
          if (!fbUser) { window.location.href = 'login.html'; reject(); return; }
          _session = await MAC.auth._profile(fbUser);
          resolve(_session);
        });
      });
    },

    async redirectIfLoggedIn() {
      if (_session) { window.location.href = 'dashboard.html'; return; }
      return new Promise(resolve => {
        const t = setTimeout(resolve, 3000);
        onAuthStateChanged(_auth, async fbUser => {
          clearTimeout(t);
          if (fbUser) { _session = await MAC.auth._profile(fbUser); window.location.href = 'dashboard.html'; }
          else resolve();
        });
      });
    },

    async _profile(fbUser) {
      try {
        const snap = await getDoc(doc(_db, 'users', fbUser.uid));
        const d    = snap.exists() ? snap.data() : {};
        return { uid: fbUser.uid, id: fbUser.uid, email: fbUser.email, name: d.name || fbUser.email, phone: d.phone || '', ...d };
      } catch {
        return { uid: fbUser.uid, id: fbUser.uid, email: fbUser.email, name: fbUser.email, phone: '' };
      }
    },

    async login(email, password) {
      const cred = await signInWithEmailAndPassword(_auth, email, password);
      _session   = await MAC.auth._profile(cred.user);
      return _session;
    },

    async register(name, email, password, phone) {
      const cred = await createUserWithEmailAndPassword(_auth, email, password);
      await setDoc(doc(_db, 'users', cred.user.uid), {
        name, email, phone: phone || '', createdAt: serverTimestamp()
      });
      _session = { uid: cred.user.uid, id: cred.user.uid, name, email, phone: phone || '' };
      return _session;
    },

    async logout() {
      try { await signOut(_auth); } catch {}
      _session = null;
      _cache._store = {};
      window.location.href = 'index.html';
    }
  },

  // ── VEHICLES ──────────────────────────────────────────
  vehicles: {
    async forUser(uid) {
      const cached = _cache.get(uid, 'vehicles');
      if (cached) return cached;
      // No orderBy — avoids index requirement, sort client-side
      const q    = query(collection(_db, 'vehicles'), where('userId', '==', uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                           .sort((a, b) => (a.createdAt?.seconds||0) - (b.createdAt?.seconds||0));
      _cache.set(uid, 'vehicles', data);
      return data;
    },
    async get(id) {
      // Check cache first
      const uid = MAC.auth.getUser()?.uid;
      if (uid) {
        const cached = _cache.get(uid, 'vehicles');
        if (cached) { const v = cached.find(v => v.id === String(id)); if (v) return v; }
      }
      const snap = await getDoc(doc(_db, 'vehicles', String(id)));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    async create(data) {
      const uid = MAC.auth.getUser()?.uid;
      const ref = await addDoc(collection(_db, 'vehicles'), {
        ...data, userId: uid, createdAt: serverTimestamp()
      });
      _cache.invalidate(uid, 'vehicles');
      return { id: ref.id, ...data, userId: uid };
    },
    async update(id, data) {
      const uid = MAC.auth.getUser()?.uid;
      await updateDoc(doc(_db, 'vehicles', String(id)), { ...data, updatedAt: serverTimestamp() });
      _cache.invalidate(uid, 'vehicles');
    },
    async delete(id) {
      const uid = MAC.auth.getUser()?.uid;
      const sid = String(id);
      const batch = writeBatch(_db);
      batch.delete(doc(_db, 'vehicles', sid));
      const lSnap = await getDocs(query(collection(_db, 'logs'),      where('vehicleId', '==', sid)));
      const rSnap = await getDocs(query(collection(_db, 'reminders'), where('vehicleId', '==', sid)));
      lSnap.docs.forEach(d => batch.delete(d.ref));
      rSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      _cache.invalidateAll(uid);
    }
  },

  // ── LOGS ──────────────────────────────────────────────
  logs: {
    async forUser(uid) {
      const cached = _cache.get(uid, 'logs');
      if (cached) return cached;
      const q    = query(collection(_db, 'logs'), where('userId', '==', uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                           .sort((a, b) => (b.serviceDate||'').localeCompare(a.serviceDate||''));
      _cache.set(uid, 'logs', data);
      return data;
    },
    async forVehicle(vehicleId) {
      const uid    = MAC.auth.getUser()?.uid;
      const cached = _cache.get(uid, 'logs');
      if (cached) return cached.filter(l => l.vehicleId === String(vehicleId) || l.vehicleId == vehicleId);
      const q    = query(collection(_db, 'logs'), where('vehicleId', '==', String(vehicleId)));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
                      .sort((a, b) => (b.serviceDate||'').localeCompare(a.serviceDate||''));
    },
    async get(id) {
      const uid    = MAC.auth.getUser()?.uid;
      const cached = _cache.get(uid, 'logs');
      if (cached) { const l = cached.find(l => l.id === String(id)); if (l) return l; }
      const snap = await getDoc(doc(_db, 'logs', String(id)));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    async create(data) {
      const uid = MAC.auth.getUser()?.uid;
      const ref = await addDoc(collection(_db, 'logs'), {
        ...data, userId: uid, createdAt: serverTimestamp()
      });
      _cache.invalidate(uid, 'logs');
      return { id: ref.id, ...data, userId: uid };
    },
    async update(id, data) {
      const uid = MAC.auth.getUser()?.uid;
      await updateDoc(doc(_db, 'logs', String(id)), { ...data, updatedAt: serverTimestamp() });
      _cache.invalidate(uid, 'logs');
    },
    async delete(id) {
      const uid = MAC.auth.getUser()?.uid;
      await deleteDoc(doc(_db, 'logs', String(id)));
      _cache.invalidate(uid, 'logs');
    }
  },

  // ── REMINDERS ─────────────────────────────────────────
  reminders: {
    async forUser(uid) {
      const cached = _cache.get(uid, 'reminders');
      if (cached) return cached;
      const q    = query(collection(_db, 'reminders'), where('userId', '==', uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                           .sort((a, b) => (a.dueDate||'').localeCompare(b.dueDate||''));
      _cache.set(uid, 'reminders', data);
      return data;
    },
    async forVehicle(vehicleId) {
      const uid    = MAC.auth.getUser()?.uid;
      const cached = _cache.get(uid, 'reminders');
      if (cached) return cached.filter(r => r.vehicleId === String(vehicleId) || r.vehicleId == vehicleId);
      const q    = query(collection(_db, 'reminders'), where('vehicleId', '==', String(vehicleId)));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async get(id) {
      const uid    = MAC.auth.getUser()?.uid;
      const cached = _cache.get(uid, 'reminders');
      if (cached) { const r = cached.find(r => r.id === String(id)); if (r) return r; }
      const snap = await getDoc(doc(_db, 'reminders', String(id)));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    async create(data) {
      const uid = MAC.auth.getUser()?.uid;
      const ref = await addDoc(collection(_db, 'reminders'), {
        ...data, userId: uid, status: 'upcoming', createdAt: serverTimestamp()
      });
      _cache.invalidate(uid, 'reminders');
      return { id: ref.id, ...data, userId: uid, status: 'upcoming' };
    },
    async update(id, data) {
      const uid = MAC.auth.getUser()?.uid;
      await updateDoc(doc(_db, 'reminders', String(id)), { ...data, updatedAt: serverTimestamp() });
      _cache.invalidate(uid, 'reminders');
    },
    async delete(id) {
      const uid = MAC.auth.getUser()?.uid;
      await deleteDoc(doc(_db, 'reminders', String(id)));
      _cache.invalidate(uid, 'reminders');
    },
    getStatus(dueDate, notifyDays) {
      const today = new Date(); today.setHours(0,0,0,0);
      const due   = new Date(dueDate); due.setHours(0,0,0,0);
      const diff  = Math.ceil((due - today) / 86400000);
      const win   = parseInt(notifyDays) || 7;
      if (diff < 0)    return 'overdue';
      if (diff === 0)  return 'today';
      if (diff <= win) return 'soon';
      return 'upcoming';
    }
  },

  // ── TOKENS ────────────────────────────────────────────
  tokens: {
    async create(vehicleId) {
      const uid    = MAC.auth.getUser()?.uid;
      const token  = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const expiry = new Date(); expiry.setDate(expiry.getDate() + 30);
      await setDoc(doc(_db, 'tokens', token), {
        vehicleId: String(vehicleId), userId: uid,
        expiresAt: expiry.toISOString(), createdAt: serverTimestamp()
      });
      return token;
    },
    async get(token) {
      const snap = await getDoc(doc(_db, 'tokens', token));
      return snap.exists() ? { token, ...snap.data() } : null;
    }
  },

  // ── UTILS ─────────────────────────────────────────────
  utils: {
    formatDate(iso) {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('en-MY', { day:'2-digit', month:'short', year:'numeric' });
    },
    formatCurrency(n) { return 'RM ' + parseFloat(n||0).toFixed(2); },
    escapeHtml(s) {
      return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    },
    toast(msg, type='success') {
      const el = document.getElementById('toast-container');
      if (!el) return;
      const t  = document.createElement('div');
      t.className = `mac-toast mac-toast-${type}`;
      t.innerHTML = `<span>${type==='success'?'✓':'✕'}</span> ${msg}`;
      el.appendChild(t);
      setTimeout(() => t.classList.add('show'), 10);
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
    },
    async getVehicleStatus(vehicleId) {
      try {
        const logs = await MAC.logs.forVehicle(vehicleId);
        if (!logs.length) return { label:'No Records', cls:'status-none' };
        const days = (Date.now() - new Date(logs[0].serviceDate)) / 86400000;
        if (days > 180) return { label:'Overdue',  cls:'status-overdue' };
        if (days > 150) return { label:'Due Soon', cls:'status-soon' };
        return { label:'Good', cls:'status-good' };
      } catch { return { label:'Unknown', cls:'status-none' }; }
    }
  }
};

window.MAC = MAC;
export default MAC;

// ═══════════════════════════════════════════════════════
// MyAutoCare — App Core (shared across all pages)
// ═══════════════════════════════════════════════════════

const MAC = {

  // ── AUTH ────────────────────────────────────────────
  auth: {
    getUser() {
      const u = localStorage.getItem('mac_user');
      return u ? JSON.parse(u) : null;
    },
    isLoggedIn() { return !!this.getUser(); },
    login(userData) {
      localStorage.setItem('mac_user', JSON.stringify(userData));
    },
    logout() {
      localStorage.removeItem('mac_user');
      window.location.href = 'index.html';
    },
    requireAuth() {
      if (!this.isLoggedIn()) window.location.href = 'login.html';
    },
    redirectIfLoggedIn() {
      if (this.isLoggedIn()) window.location.href = 'dashboard.html';
    }
  },

  // ── DB (localStorage abstraction) ───────────────────
  db: {
    get(key) {
      const d = localStorage.getItem('mac_' + key);
      return d ? JSON.parse(d) : [];
    },
    set(key, data) {
      localStorage.setItem('mac_' + key, JSON.stringify(data));
    },
    nextId(key) {
      const items = this.get(key);
      return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
    }
  },

  // ── USERS ────────────────────────────────────────────
  users: {
    all() { return MAC.db.get('users'); },
    find(email) { return this.all().find(u => u.email === email); },
    create(data) {
      const users = this.all();
      const newUser = { id: MAC.db.nextId('users'), ...data, createdAt: new Date().toISOString() };
      users.push(newUser);
      MAC.db.set('users', users);
      return newUser;
    }
  },

  // ── VEHICLES ─────────────────────────────────────────
  vehicles: {
    all() { return MAC.db.get('vehicles'); },
    forUser(userId) { return this.all().filter(v => v.userId === userId); },
    get(id) { return this.all().find(v => v.id === id); },
    create(data) {
      const items = this.all();
      const item = { id: MAC.db.nextId('vehicles'), ...data, createdAt: new Date().toISOString() };
      items.push(item);
      MAC.db.set('vehicles', items);
      return item;
    },
    update(id, data) {
      const items = this.all().map(v => v.id === id ? { ...v, ...data } : v);
      MAC.db.set('vehicles', items);
    },
    delete(id) {
      MAC.db.set('vehicles', this.all().filter(v => v.id !== id));
      // cascade delete logs and reminders
      MAC.logs.db.set('logs', MAC.logs.all().filter(l => l.vehicleId !== id));
      MAC.db.set('reminders', MAC.reminders.all().filter(r => r.vehicleId !== id));
    }
  },

  // ── MAINTENANCE LOGS ──────────────────────────────────
  logs: {
    all() { return MAC.db.get('logs'); },
    forVehicle(vehicleId) { return this.all().filter(l => l.vehicleId === vehicleId); },
    forUser(userId) {
      const vids = MAC.vehicles.forUser(userId).map(v => v.id);
      return this.all().filter(l => vids.includes(l.vehicleId));
    },
    get(id) { return this.all().find(l => l.id === id); },
    create(data) {
      const items = this.all();
      const item = { id: MAC.db.nextId('logs'), ...data, createdAt: new Date().toISOString() };
      items.push(item);
      MAC.db.set('logs', items);
      return item;
    },
    update(id, data) {
      const items = this.all().map(l => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l);
      MAC.db.set('logs', items);
    },
    delete(id) {
      MAC.db.set('logs', this.all().filter(l => l.id !== id));
    }
  },

  // ── REMINDERS ─────────────────────────────────────────
  reminders: {
    all() { return MAC.db.get('reminders'); },
    forVehicle(vehicleId) { return this.all().filter(r => r.vehicleId === vehicleId); },
    forUser(userId) {
      const vids = MAC.vehicles.forUser(userId).map(v => v.id);
      return this.all().filter(r => vids.includes(r.vehicleId));
    },
    get(id) { return this.all().find(r => r.id === id); },
    create(data) {
      const items = this.all();
      const item = { id: MAC.db.nextId('reminders'), ...data, status: 'upcoming', createdAt: new Date().toISOString() };
      items.push(item);
      MAC.db.set('reminders', items);
      return item;
    },
    update(id, data) {
      const items = this.all().map(r => r.id === id ? { ...r, ...data } : r);
      MAC.db.set('reminders', items);
    },
    delete(id) { MAC.db.set('reminders', this.all().filter(r => r.id !== id)); },
    getStatus(dueDate) {
      const today = new Date(); today.setHours(0,0,0,0);
      const due = new Date(dueDate); due.setHours(0,0,0,0);
      const diff = (due - today) / 86400000;
      if (diff < 0) return 'overdue';
      if (diff === 0) return 'today';
      if (diff <= 7) return 'soon';
      return 'upcoming';
    }
  },

  // ── UTILS ─────────────────────────────────────────────
  utils: {
    formatDate(iso) {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    formatCurrency(n) {
      return 'RM ' + parseFloat(n || 0).toFixed(2);
    },
    toast(msg, type = 'success') {
      const el = document.getElementById('toast-container');
      if (!el) return;
      const t = document.createElement('div');
      t.className = `mac-toast mac-toast-${type}`;
      t.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
      el.appendChild(t);
      setTimeout(() => t.classList.add('show'), 10);
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3500);
    },
    escapeHtml(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    },
    getVehicleStatus(vehicleId) {
      const logs = MAC.logs.forVehicle(vehicleId);
      if (!logs.length) return { label: 'No Records', cls: 'status-none' };
      const last = logs.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))[0];
      const daysSince = (Date.now() - new Date(last.serviceDate)) / 86400000;
      if (daysSince > 180) return { label: 'Overdue', cls: 'status-overdue' };
      if (daysSince > 150) return { label: 'Due Soon', cls: 'status-soon' };
      return { label: 'Good', cls: 'status-good' };
    }
  },

  // ── SEED DATA ─────────────────────────────────────────
  seed() {
    if (MAC.db.get('seeded').length) return;

    const user = MAC.users.create({ name: 'Hafy Danial', email: 'hafy@demo.com', password: 'demo1234', phone: '0123456789' });

    const car = MAC.vehicles.create({ userId: user.id, type: 'car', brand: 'Perodua', model: 'Myvi', year: '2021', plate: 'WXX 1234', colour: 'Silver', fuelType: 'Petrol', mileage: '45000' });
    const bike = MAC.vehicles.create({ userId: user.id, type: 'motorcycle', brand: 'Honda', model: 'Wave 125', year: '2019', plate: 'WA 5678', colour: 'Black', fuelType: 'Petrol', mileage: '22000' });

    const logs = [
      { vehicleId: car.id, serviceType: 'Oil Change', serviceDate: '2024-12-15', mileageAtService: '44000', workshopName: 'Perodua Service Centre KL', cost: '120', notes: 'Full synthetic oil used' },
      { vehicleId: car.id, serviceType: 'Tyre Replacement', serviceDate: '2024-10-03', mileageAtService: '42000', workshopName: 'Sime Tyre Specialist', cost: '480', notes: 'Replaced all 4 tyres' },
      { vehicleId: car.id, serviceType: 'Brake Service', serviceDate: '2024-08-20', mileageAtService: '40000', workshopName: 'Perodua Service Centre KL', cost: '95', notes: 'Front brake pads replaced' },
      { vehicleId: bike.id, serviceType: 'Oil Change', serviceDate: '2025-01-10', mileageAtService: '21800', workshopName: 'Honda Wing Kepong', cost: '45', notes: '' },
      { vehicleId: bike.id, serviceType: 'Chain Adjustment', serviceDate: '2024-11-05', mileageAtService: '20500', workshopName: 'Honda Wing Kepong', cost: '20', notes: 'Chain lubricated and tensioned' },
    ];
    logs.forEach(l => MAC.logs.create(l));

    const reminders = [
      { vehicleId: car.id, type: 'Next Service', dueDate: '2025-06-15', notifyDays: '7', notes: 'Schedule at Perodua SC' },
      { vehicleId: car.id, type: 'Road Tax Renewal', dueDate: '2025-07-01', notifyDays: '14', notes: 'Renew via myeg.com.my' },
      { vehicleId: bike.id, type: 'Insurance Expiry', dueDate: '2025-05-20', notifyDays: '30', notes: 'Renew with Takaful' },
    ];
    reminders.forEach(r => MAC.reminders.create(r));

    MAC.db.set('seeded', [true]);
  }
};

// Run seed on first load
MAC.seed();

// ── Shared App Layout Builder ──────────────────────────
// Called on every inner app page to render sidebar + topbar

function buildLayout(activePage, pageTitle) {
  MAC.auth.requireAuth();
  const user = MAC.auth.getUser();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>` },
    { id: 'vehicles', label: 'My Vehicles', href: 'vehicles.html', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M1 17h2a2 2 0 0 1 2-2h.5L7 9h10l1.5 6H19a2 2 0 0 1 2 2h2m-4-6H8"/></svg>` },
    { id: 'maintenance', label: 'Maintenance Log', href: 'maintenance.html', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"/></svg>` },
    { id: 'reminders', label: 'Reminders', href: 'reminders.html', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg>` },
    { id: 'workshops', label: 'Find Workshops', href: 'workshops.html', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>` },
    { id: 'analysis', label: 'Cost Analysis', href: 'analysis.html', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>` },
    { id: 'reports', label: 'Reports & Share', href: 'reports.html', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>` },
  ];

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  document.querySelector('.app-layout').innerHTML = `
    <aside class="app-sidebar" id="sidebar">
      <a href="dashboard.html" class="sidebar-logo">
        <div class="logo-mark">M</div>
        <div class="logo-text">My<em>Auto</em>Care</div>
      </a>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Main</div>
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
            ${item.icon} ${item.label}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar">${initials}</div>
          <div>
            <div class="user-name">${MAC.utils.escapeHtml(user.name)}</div>
            <div class="user-email">${MAC.utils.escapeHtml(user.email)}</div>
          </div>
        </div>
        <button class="nav-item" style="margin-top:.5rem;color:var(--danger);width:100%;" onclick="MAC.auth.logout()">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>
          Sign Out
        </button>
      </div>
    </aside>
    <div class="app-main">
      <header class="app-topbar">
        <div style="display:flex;align-items:center;gap:1rem;">
          <button class="hamburger" id="hamburger" onclick="document.getElementById('sidebar').classList.toggle('open')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path stroke-linecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
          </button>
          <span class="topbar-title">${pageTitle}</span>
        </div>
        <div class="topbar-actions">
          <a href="maintenance.html" class="btn btn-primary btn-sm" id="quickLog" style="display:none">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Log Service
          </a>
          <div class="user-avatar" style="width:34px;height:34px;font-size:.8rem;">${initials}</div>
        </div>
      </header>
      <div class="app-content" id="page-content"></div>
    </div>
  `;

  // Show quick log button on non-maintenance pages
  if (activePage !== 'maintenance') document.getElementById('quickLog').style.display = 'flex';

  // Close sidebar on overlay click (mobile)
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    if (window.innerWidth <= 900 && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

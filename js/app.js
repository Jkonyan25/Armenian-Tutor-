/* App start-up: routing, top bar, theme, offline support. */
(function () {
  'use strict';
  const AT = window.AT;
  const $ = (sel, el = document) => el.querySelector(sel);

  const ROUTES = {
    learn: { title: 'Learn', view: 'learn' },
    alphabet: { title: 'Alphabet', view: 'alphabet' },
    prayer: { title: 'The Jesus Prayer', view: 'prayer' },
    practice: { title: 'Practice', view: 'practice' },
    profile: { title: 'Profile', view: 'profile' }
  };

  function currentRoute() {
    const r = (location.hash || '').replace(/^#\/?/, '').split('/')[0];
    return ROUTES[r] ? r : 'learn';
  }

  AT.rerender = () => {
    const route = currentRoute();
    const view = $('#view');
    AT.views[ROUTES[route].view](view);
    AT.views.side($('#side-panel'));
    updateTopbar();
  };

  function navigate() {
    const route = currentRoute();
    document.querySelectorAll('.nav-item').forEach((a) => {
      const on = a.dataset.route === route;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('#topbar-title').textContent = ROUTES[route].title;
    document.title = route === 'learn' ? 'Armenian Tutor' : `${ROUTES[route].title} · Armenian Tutor`;
    AT.modal.close();
    AT.speech.stop();
    window.scrollTo(0, 0);
    AT.rerender();
  }

  function updateTopbar() {
    const goal = AT.state.settings.goal;
    const today = AT.todayXP();
    $('#pill-streak b').textContent = AT.currentStreak();
    $('#pill-streak').classList.toggle('lit', AT.state.lastDay === AT.dayKey());
    $('#pill-xp b').textContent = AT.state.xp;
    $('#goal-text').textContent = `${Math.min(today, goal)}/${goal}`;
    const ring = $('#goal-ring');
    const C = 2 * Math.PI * 15;
    ring.style.strokeDasharray = `${C}`;
    ring.style.strokeDashoffset = `${C * (1 - Math.min(1, today / goal))}`;
    $('#pill-goal').classList.toggle('met', today >= goal);
  }

  AT.applyTheme = () => {
    const t = AT.state.settings.theme;
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#131f24' : '#ffffff');
  };

  AT.on('state', updateTopbar);
  window.addEventListener('hashchange', navigate);
  ['pill-streak', 'pill-xp', 'pill-goal'].forEach((id) => $('#' + id).addEventListener('click', () => { location.hash = '#/profile'; }));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', AT.applyTheme);

  AT.applyTheme();
  navigate();
  if (!AT.state.onboarded) AT.onboard();

  // Offline support (works once the site is served over http/https).
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/[?&]nosw/.test(location.search)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();

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
    AT.cloud.refresh(); // pick up progress from other devices (at most every 30 s)
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
    const acct = $('#pill-account');
    acct.hidden = !AT.cloud.enabled;
    if (AT.cloud.signedIn()) {
      acct.innerHTML = `<span class="avatar sm ${AT.cloud.status}" aria-hidden="true">${AT.esc(AT.account.initial())}</span>`;
      acct.setAttribute('aria-label', 'Your account');
      acct.title = AT.cloud.user().email;
    } else {
      acct.innerHTML = `<span class="avatar sm guest" aria-hidden="true">${AT.account.USER_ICON}</span><span class="acct-label">Sign in</span>`;
      acct.setAttribute('aria-label', 'Sign in');
      acct.title = 'Sign in to save your progress';
    }
  }

  AT.applyTheme = () => {
    const t = AT.state.settings.theme;
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#131f24' : '#ffffff');
  };

  AT.on('state', updateTopbar);
  AT.on('auth', updateTopbar);
  AT.on('sync', updateTopbar);
  $('#pill-account').addEventListener('click', () => AT.account.open('in'));
  window.addEventListener('hashchange', navigate);
  ['pill-streak', 'pill-xp', 'pill-goal'].forEach((id) => $('#' + id).addEventListener('click', () => { location.hash = '#/profile'; }));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', AT.applyTheme);

  // Coming back from a Supabase email link (confirm account / reset password)?
  const redirect = AT.cloud.handleRedirect();

  AT.applyTheme();
  navigate();

  if (redirect && redirect.error) {
    AT.toast(redirect.error, 5000);
  } else if (redirect && redirect.type === 'recovery') {
    AT.account.openNewPassword();
  }
  if (AT.cloud.signedIn()) {
    AT.cloud.sync()
      .then((r) => {
        if (r.changed || r.addedGuest) AT.rerender();
        if (redirect && redirect.type !== 'recovery') AT.account.welcome(r);
      })
      .catch((e) => { if (redirect) AT.toast('Signed in, but saving didn’t work yet: ' + e.message, 5000); });
  } else if (!AT.state.onboarded) {
    AT.onboard();
  }

  // Offline support (works once the site is served over http/https).
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/[?&]nosw/.test(location.search)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();

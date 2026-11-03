/* Account screens: sign in, create account, password reset, account details. */
(function () {
  'use strict';
  const AT = window.AT;
  const { esc } = AT;
  const Cloud = AT.cloud;
  const $ = (sel, el = document) => el.querySelector(sel);
  const A = (AT.account = {});

  const README_URL = 'https://github.com/Jkonyan25/Armenian-Tutor-#turning-on-accounts';
  const USER_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4.5" fill="currentColor"/><path d="M3.5 21a8.5 8.5 0 0 1 17 0z" fill="currentColor"/></svg>';
  A.USER_ICON = USER_ICON;
  A.initial = () => {
    const u = Cloud.user();
    return u && u.email ? u.email.trim()[0].toUpperCase() : '?';
  };

  function timeAgo(t) {
    if (!t) return '';
    const s = Math.round((Date.now() - t) / 1000);
    if (s < 45) return 'just now';
    if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`;
    return new Date(t).toLocaleDateString();
  }
  A.statusLine = () => {
    const t = Cloud.statusText();
    return Cloud.status === 'synced' ? `${t} · ${timeAgo(Cloud.lastSync)}` : t;
  };

  /* ---------------- Entry point ---------------- */
  A.open = (tab = 'in') => {
    if (!Cloud.enabled) return A.openNotSetUp();
    if (Cloud.signedIn()) return A.openDetails();
    return A.openAuth(tab);
  };

  A.openNotSetUp = () => {
    AT.modal.open(`<div class="auth center">
      ${AT.mascot('happy', 90)}
      <h2>Accounts are almost ready</h2>
      <p>Sign-in needs a free Supabase project connected to this site. Until then, your progress is saved in this browser only.</p>
      <p class="muted small">Site owner: follow “Turning on accounts” in the README. It takes about 5 minutes.</p>
      <a class="btn btn-blue btn-wide" href="${README_URL}" target="_blank" rel="noopener">Open the setup guide</a>
    </div>`, { className: 'small' });
  };

  /* ---------------- Sign in / create account ---------------- */
  A.openAuth = (tab = 'in') => {
    const c = AT.modal.open(`<div class="auth">
      <div class="auth-head">${AT.mascot('happy', 72)}
        <div><h2>Save your progress</h2><p class="muted">Sign in to keep your lessons, XP and streak on every device.</p></div>
      </div>
      <div class="seg auth-tabs" role="tablist">
        <button role="tab" data-tab="in">Sign in</button>
        <button role="tab" data-tab="up">Create account</button>
      </div>
      <form class="auth-form" novalidate>
        <label class="field"><span>Email</span>
          <input type="email" name="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" required></label>
        <label class="field"><span>Password</span>
          <span class="pw-wrap"><input type="password" name="password" minlength="6" required>
          <button type="button" class="pw-toggle" aria-label="Show password">Show</button></span></label>
        <p class="field-hint" data-hint-up hidden>At least 6 characters.</p>
        <div class="auth-msg" role="alert" hidden></div>
        <button class="btn btn-green btn-wide" type="submit" data-submit>Sign in</button>
        <button type="button" class="link-btn" data-forgot>Forgot password?</button>
      </form>
      ${AT.hasProgress() ? '<p class="muted small center">The progress on this device will be added to your account.</p>' : ''}
    </div>`, { className: 'small' });

    const form = $('.auth-form', c);
    const email = form.email;
    const pw = form.password;
    const submit = $('[data-submit]', c);
    const msg = $('.auth-msg', c);
    let mode = tab;

    const setMode = (m) => {
      mode = m;
      c.querySelectorAll('[data-tab]').forEach((b) => { b.classList.toggle('on', b.dataset.tab === m); b.setAttribute('aria-selected', String(b.dataset.tab === m)); });
      submit.textContent = m === 'up' ? 'Create account' : 'Sign in';
      pw.autocomplete = m === 'up' ? 'new-password' : 'current-password';
      $('[data-hint-up]', c).hidden = m !== 'up';
      $('[data-forgot]', c).hidden = m === 'up';
      showMsg('');
    };
    const showMsg = (text, kind = 'bad') => {
      msg.hidden = !text;
      msg.textContent = text;
      msg.className = 'auth-msg ' + kind;
    };
    c.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.tab)));
    $('.pw-toggle', c).addEventListener('click', (e) => {
      const show = pw.type === 'password';
      pw.type = show ? 'text' : 'password';
      e.currentTarget.textContent = show ? 'Hide' : 'Show';
      e.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
    $('[data-forgot]', c).addEventListener('click', () => A.openForgot(email.value));
    setMode(tab);
    setTimeout(() => email.focus(), 60);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const em = email.value.trim();
      const p = pw.value;
      if (!/^\S+@\S+\.\S+$/.test(em)) return showMsg('Please enter a valid email address.');
      if (p.length < 6) return showMsg('Your password needs at least 6 characters.');
      submit.disabled = true;
      submit.textContent = mode === 'up' ? 'Creating account…' : 'Signing in…';
      try {
        const r = mode === 'up' ? await Cloud.signUp(em, p) : await Cloud.signIn(em, p);
        if (r.confirmEmail) return A.openCheckEmail(em);
        AT.modal.close();
        welcome(r);
      } catch (err) {
        showMsg(err.message);
        submit.disabled = false;
        submit.textContent = mode === 'up' ? 'Create account' : 'Sign in';
      }
    });
  };

  function welcome(r) {
    if (r && r.syncError) AT.toast('Signed in, but saving didn’t work yet: ' + r.syncError, 5000);
    else if (r && r.addedGuest) AT.toast('Signed in! Your progress on this device was added to your account.', 4000);
    else AT.toast('Signed in! Your progress is saved to your account.', 3500);
  }
  A.welcome = welcome;

  A.openCheckEmail = (email) => {
    AT.modal.open(`<div class="auth center">
      <div class="big-emoji" aria-hidden="true">📬</div>
      <h2>Check your email</h2>
      <p>We sent a link to <b>${esc(email)}</b>. Tap it to confirm your account and you’ll be signed in right away.</p>
      <p class="muted small">Can’t find it? Check your spam folder.</p>
      <button class="btn btn-blue btn-wide" data-close>OK</button>
    </div>`, { className: 'small' });
  };

  A.openForgot = (prefill = '') => {
    const c = AT.modal.open(`<div class="auth">
      <h2>Reset your password</h2>
      <p class="muted">Enter your email and we’ll send you a link to choose a new password.</p>
      <form class="auth-form" novalidate>
        <label class="field"><span>Email</span><input type="email" name="email" autocomplete="email" autocapitalize="off" spellcheck="false" value="${esc(prefill)}" required></label>
        <div class="auth-msg" role="alert" hidden></div>
        <button class="btn btn-blue btn-wide" type="submit">Send reset link</button>
        <button type="button" class="link-btn" data-back>Back to sign in</button>
      </form>
    </div>`, { className: 'small' });
    const form = $('form', c);
    const msg = $('.auth-msg', c);
    $('[data-back]', c).addEventListener('click', () => A.openAuth('in'));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const em = form.email.value.trim();
      const btn = $('[type=submit]', form);
      if (!/^\S+@\S+\.\S+$/.test(em)) { msg.hidden = false; msg.className = 'auth-msg bad'; msg.textContent = 'Please enter a valid email address.'; return; }
      btn.disabled = true;
      try {
        await Cloud.sendPasswordReset(em);
        msg.className = 'auth-msg ok';
        msg.textContent = 'If that email has an account, a reset link is on its way.';
      } catch (err) {
        msg.className = 'auth-msg bad';
        msg.textContent = err.message;
        btn.disabled = false;
      }
      msg.hidden = false;
    });
  };

  A.openNewPassword = () => {
    const c = AT.modal.open(`<div class="auth">
      <h2>Choose a new password</h2>
      <form class="auth-form" novalidate>
        <label class="field"><span>New password</span><input type="password" name="password" autocomplete="new-password" minlength="6" required></label>
        <p class="field-hint">At least 6 characters.</p>
        <div class="auth-msg" role="alert" hidden></div>
        <button class="btn btn-green btn-wide" type="submit">Save password</button>
      </form>
    </div>`, { className: 'small' });
    const form = $('form', c);
    const msg = $('.auth-msg', c);
    setTimeout(() => form.password.focus(), 60);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('[type=submit]', form);
      if (form.password.value.length < 6) { msg.hidden = false; msg.className = 'auth-msg bad'; msg.textContent = 'Your password needs at least 6 characters.'; return; }
      btn.disabled = true;
      try {
        await Cloud.updatePassword(form.password.value);
        AT.modal.close();
        AT.toast('Password saved. You’re signed in.');
      } catch (err) {
        msg.hidden = false;
        msg.className = 'auth-msg bad';
        msg.textContent = err.message;
        btn.disabled = false;
      }
    });
  };

  /* ---------------- Signed in ---------------- */
  A.openDetails = () => {
    const u = Cloud.user();
    const c = AT.modal.open(`<div class="auth">
      <div class="acct-head">
        <span class="avatar big" aria-hidden="true">${esc(A.initial())}</span>
        <div><h2>Your account</h2><p class="muted acct-email">${esc(u.email)}</p></div>
      </div>
      <p class="sync-line ${esc(Cloud.status)}" data-sync>${esc(A.statusLine())}</p>
      <div class="confirm-btns">
        <button class="btn btn-blue" data-sync-now>Sync now</button>
        <button class="btn btn-ghost danger" data-signout>Sign out</button>
      </div>
      <p class="muted small center">Signing out removes your progress from this device. It stays safe in your account.</p>
    </div>`, { className: 'small' });
    const line = $('[data-sync]', c);
    const upd = () => { if (document.contains(line)) { line.textContent = A.statusLine(); line.className = 'sync-line ' + Cloud.status; } };
    AT.on('sync', upd);
    $('[data-sync-now]', c).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      try { const r = await Cloud.sync(); if (r.changed) AT.rerender(); } catch (err) { /* shown in status line */ }
      upd();
      btn.disabled = false;
    });
    $('[data-signout]', c).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.textContent = 'Signing out…';
      await Cloud.signOut();
      AT.modal.close();
      AT.rerender();
      AT.toast('Signed out. See you soon!');
    });
  };

  /* ---------------- Cards used on other screens ---------------- */
  A.profileCard = () => {
    if (!Cloud.enabled) {
      return `<div class="card acct-card">
        <div class="acct-head"><span class="avatar" aria-hidden="true">${USER_ICON}</span>
        <div><b>Saved on this device</b><span class="muted small">Accounts aren’t set up on this site yet.</span></div></div>
        <button class="btn btn-ghost btn-sm" data-account>How to turn on accounts</button>
      </div>`;
    }
    if (!Cloud.signedIn()) {
      return `<div class="card acct-card cta">
        <div class="acct-head"><span class="avatar" aria-hidden="true">${USER_ICON}</span>
        <div><b>Save your progress</b><span class="small">Create a free account to continue on any device.</span></div></div>
        <div class="acct-btns">
          <button class="btn btn-green btn-sm" data-account="up">Create account</button>
          <button class="btn btn-ghost btn-sm" data-account="in">Sign in</button>
        </div>
      </div>`;
    }
    return `<div class="card acct-card">
      <div class="acct-head"><span class="avatar" aria-hidden="true">${esc(A.initial())}</span>
      <div><b class="acct-email">${esc(Cloud.user().email)}</b><span class="small sync-line ${esc(Cloud.status)}" data-sync-line>${esc(A.statusLine())}</span></div></div>
      <button class="btn btn-ghost btn-sm" data-account>Account</button>
    </div>`;
  };
  A.bind = (root) => {
    root.querySelectorAll('[data-account]').forEach((b) => b.addEventListener('click', () => A.open(b.dataset.account || 'in')));
  };

  AT.on('sync', () => document.querySelectorAll('[data-sync-line]').forEach((el) => {
    el.textContent = A.statusLine();
    el.className = 'small sync-line ' + Cloud.status;
  }));
})();

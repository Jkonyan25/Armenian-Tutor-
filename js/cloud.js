/* Accounts and cloud sync, talking to Supabase's Auth and REST APIs directly. */
(function () {
  'use strict';
  const AT = window.AT;
  const CFG = window.ARM_CONFIG || {};
  const BASE = String(CFG.supabaseUrl || '').trim().replace(/\/+$/, '');
  const KEY = String(CFG.supabaseKey || CFG.supabaseAnonKey || '').trim();
  const SESSION_KEY = 'armenianTutor.session';
  const TABLE = '/rest/v1/progress';
  const PUSH_DELAY = 1500;

  const Cloud = (AT.cloud = {
    enabled: /^https?:\/\/\S+$/.test(BASE) && KEY.length > 10,
    session: null,
    status: 'idle', // idle | syncing | synced | offline | error
    lastSync: 0,
    lastError: ''
  });

  /* ---------------- Session ---------------- */
  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
  }
  function writeSession(s) {
    try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }
  function decodeJwt(token) {
    try {
      let p = String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      p += '='.repeat((4 - (p.length % 4)) % 4);
      const bytes = Uint8Array.from(atob(p), (c) => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return {}; }
  }
  function setSession(s) {
    if (s && s.access_token) {
      const claims = decodeJwt(s.access_token);
      const user = s.user || {};
      Cloud.session = {
        access_token: s.access_token,
        refresh_token: s.refresh_token || (Cloud.session && Cloud.session.refresh_token) || '',
        expires_at: Number(s.expires_at) || Math.floor(Date.now() / 1000) + (Number(s.expires_in) || 3600),
        user: { id: user.id || claims.sub, email: user.email || claims.email || '' }
      };
    } else {
      Cloud.session = null;
    }
    writeSession(Cloud.session);
    AT.emit('auth');
  }
  Cloud.session = Cloud.enabled ? readSession() : null;
  Cloud.signedIn = () => !!(Cloud.session && Cloud.session.user && Cloud.session.user.id);
  Cloud.user = () => (Cloud.signedIn() ? Cloud.session.user : null);

  function setStatus(status, err = '') {
    Cloud.status = status;
    Cloud.lastError = err;
    if (status === 'synced') Cloud.lastSync = Date.now();
    AT.emit('sync');
  }
  Cloud.statusText = () => {
    if (!Cloud.signedIn()) return '';
    switch (Cloud.status) {
      case 'syncing': return 'Saving…';
      case 'synced': return 'All progress saved to your account';
      case 'offline': return 'Offline. Your progress will be saved when you’re back online.';
      case 'error': return 'Couldn’t save: ' + Cloud.lastError;
      default: return 'Signed in';
    }
  };

  /* ---------------- Requests ---------------- */
  const MSG = {
    credentials: 'That email and password don’t match. Please try again.',
    unconfirmed: 'Please confirm your email first. Look for the link we sent you.',
    exists: 'There’s already an account with this email. Try signing in instead.',
    rate: 'Too many tries. Please wait a minute and try again.',
    table: 'The progress table is missing in Supabase. Run supabase/schema.sql (see README).',
    perms: 'Supabase blocked saving progress. Run supabase/schema.sql again (see README).'
  };
  const CODES = {
    invalid_credentials: MSG.credentials, invalid_grant: MSG.credentials,
    email_not_confirmed: MSG.unconfirmed,
    user_already_exists: MSG.exists, email_exists: MSG.exists,
    over_email_send_rate_limit: 'Too many emails were sent. Please wait a minute and try again.',
    over_request_rate_limit: MSG.rate,
    email_address_invalid: 'Please enter a valid email address.',
    validation_failed: null,
    signup_disabled: 'New sign-ups are turned off for this site.',
    same_password: 'Please choose a password different from your current one.',
    PGRST205: MSG.table, '42P01': MSG.table, '42501': MSG.perms
  };
  function errorFrom(json, status) {
    const code = json && (json.error_code || json.code || (typeof json.error === 'string' ? json.error : ''));
    let msg = json && (json.msg || json.error_description || json.message);
    if (code && CODES[code]) msg = CODES[code];
    else if (/invalid login credentials/i.test(msg || '')) msg = MSG.credentials;
    else if (/email not confirmed/i.test(msg || '')) msg = MSG.unconfirmed;
    else if (/already (been )?registered/i.test(msg || '')) msg = MSG.exists;
    else if (status === 429) msg = MSG.rate;
    const e = new Error(msg || `Something went wrong (error ${status}). Please try again.`);
    e.status = status;
    e.code = code;
    return e;
  }

  async function request(path, { method = 'GET', body, auth = false, headers = {}, retry = true } = {}) {
    if (!Cloud.enabled) throw new Error('Accounts aren’t set up on this site yet.');
    const h = { apikey: KEY, ...headers };
    if (body !== undefined) h['Content-Type'] = 'application/json';
    if (auth) {
      await ensureFresh();
      if (!Cloud.session) { const e = new Error('Please sign in again.'); e.signedOut = true; throw e; }
      h.Authorization = 'Bearer ' + Cloud.session.access_token;
    }
    let res;
    try {
      res = await fetch(BASE + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (err) {
      const e = new Error('You seem to be offline. Check your connection and try again.');
      e.offline = true;
      throw e;
    }
    if (auth && res.status === 401 && retry && Cloud.session) {
      await refresh();
      return request(path, { method, body, auth, headers, retry: false });
    }
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
    if (!res.ok) throw errorFrom(json, res.status);
    return json;
  }

  async function ensureFresh() {
    const s = Cloud.session;
    if (s && s.expires_at - 60 < Date.now() / 1000) await refresh();
  }
  let refreshing = null;
  function refresh() {
    if (!refreshing) {
      refreshing = (async () => {
        const token = Cloud.session && Cloud.session.refresh_token;
        if (!token) { setSession(null); const e = new Error('Please sign in again.'); e.signedOut = true; throw e; }
        try {
          setSession(await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: token } }));
        } catch (e) {
          if (!e.offline) {
            setSession(null);
            AT.toast('You were signed out. Please sign in again.');
            e.signedOut = true;
          }
          throw e;
        }
      })().finally(() => { refreshing = null; });
    }
    return refreshing;
  }

  const redirectUrl = () => location.origin + location.pathname;

  /* ---------------- Sign up, sign in, sign out ---------------- */
  Cloud.signUp = async (email, password) => {
    const r = await request('/auth/v1/signup?redirect_to=' + encodeURIComponent(redirectUrl()), { method: 'POST', body: { email, password } });
    if (r && r.access_token) {
      setSession(r);
      return { signedIn: true, ...(await afterSignIn()) };
    }
    const u = (r && (r.user || r)) || {};
    // With email confirmation on, an existing email comes back with no identities.
    if (Array.isArray(u.identities) && u.identities.length === 0) throw new Error(MSG.exists);
    return { confirmEmail: true };
  };

  Cloud.signIn = async (email, password) => {
    setSession(await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }));
    return { signedIn: true, ...(await afterSignIn()) };
  };

  Cloud.signOut = async () => {
    try { await Cloud.flush(); } catch (e) { /* keep going */ }
    try { await request('/auth/v1/logout', { method: 'POST', auth: true }); } catch (e) { /* token may be gone */ }
    clearTimeout(pushTimer);
    dirty = false;
    setSession(null);
    // The progress lives in the account now; start this device fresh.
    applying = true;
    try { AT.resetProgress(); } finally { applying = false; }
    setStatus('idle');
  };

  Cloud.sendPasswordReset = (email) =>
    request('/auth/v1/recover?redirect_to=' + encodeURIComponent(redirectUrl()), { method: 'POST', body: { email } });
  Cloud.updatePassword = (password) => request('/auth/v1/user', { method: 'PUT', auth: true, body: { password } });

  // Links from Supabase emails come back as #access_token=…&type=signup|recovery.
  Cloud.handleRedirect = () => {
    const h = location.hash.replace(/^#\/?/, '');
    if (!/(^|&)(access_token|error|error_description)=/.test(h)) return null;
    const p = new URLSearchParams(h);
    history.replaceState(null, '', location.pathname + location.search + '#/learn');
    if (!Cloud.enabled) return null;
    if (p.get('error') || p.get('error_description')) {
      const d = p.get('error_description') || p.get('error');
      return { error: /expired|invalid/i.test(d) ? 'That email link has expired. Please try again.' : d };
    }
    setSession({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_at: p.get('expires_at'), expires_in: p.get('expires_in') });
    return { type: p.get('type') || 'signin' };
  };

  /* ---------------- Progress sync ----------------
     Every sync downloads the account's progress, merges it with this
     device's, saves the result here and uploads it. Merging (not
     overwriting) means practicing on two devices never loses anything. */
  let applying = false;
  let dirty = false;
  let pushTimer = null;
  let syncing = null;
  Cloud.lastPull = 0;

  function snapshot() {
    const s = JSON.parse(JSON.stringify(AT.state));
    delete s.owner;
    return s;
  }
  async function pull(uid) {
    const rows = await request(`${TABLE}?select=data,updated_at&user_id=eq.${encodeURIComponent(uid)}`, { auth: true });
    return Array.isArray(rows) && rows[0] ? rows[0].data : null;
  }
  async function push(uid) {
    await request(`${TABLE}?on_conflict=user_id`, {
      method: 'POST', auth: true,
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: { user_id: uid, data: snapshot(), updated_at: new Date().toISOString() }
    });
  }

  Cloud.sync = () => {
    if (!Cloud.signedIn()) return Promise.resolve({});
    if (syncing) return syncing;
    syncing = (async () => {
      setStatus('syncing');
      try {
        const uid = Cloud.session.user.id;
        const remote = await pull(uid);
        const local = AT.state;
        const before = JSON.stringify([local.xp, local.done, local.streak, local.settings]);
        let merged;
        let addedGuest = false;
        if (local.owner === uid) {
          merged = AT.mergeState(local, remote);
        } else if (!local.owner && AT.hasProgress(local)) {
          // Progress made before signing in gets added to the account.
          merged = AT.mergeState(local, remote || AT.freshState(), { additive: true });
          addedGuest = !!remote && AT.hasProgress(remote);
        } else {
          // Another account's leftovers (or nothing): use the account's progress.
          const blank = { ...AT.freshState(), settings: { ...local.settings }, settingsAt: local.settingsAt || 0, onboarded: local.onboarded };
          merged = AT.mergeState(blank, remote);
        }
        merged.owner = uid;
        applying = true;
        try { AT.replaceState(merged); } finally { applying = false; }
        dirty = false;
        await push(uid);
        Cloud.lastPull = Date.now();
        setStatus('synced');
        const changed = before !== JSON.stringify([merged.xp, merged.done, merged.streak, merged.settings]);
        return { addedGuest, changed };
      } catch (e) {
        if (!e.signedOut) dirty = true;
        setStatus(e.offline ? 'offline' : e.signedOut ? 'idle' : 'error', e.message);
        throw e;
      } finally {
        syncing = null;
      }
    })();
    return syncing;
  };

  // Start over. When signed in, the account is overwritten too (no merge,
  // or the old progress would come right back).
  Cloud.resetProgress = async () => {
    if (syncing) { try { await syncing; } catch (e) { /* ignore */ } }
    clearTimeout(pushTimer);
    dirty = false;
    applying = true;
    try {
      AT.resetProgress();
      if (Cloud.signedIn()) { AT.state.owner = Cloud.session.user.id; AT.save(); }
    } finally { applying = false; }
    if (!Cloud.signedIn()) return;
    setStatus('syncing');
    try {
      await push(Cloud.session.user.id);
      setStatus('synced');
    } catch (e) {
      setStatus(e.offline ? 'offline' : 'error', e.message);
      throw e;
    }
  };

  // Upload soon after any change (debounced).
  Cloud.flush = async () => {
    clearTimeout(pushTimer);
    if (!dirty || !Cloud.signedIn()) return;
    if (syncing) { try { await syncing; } catch (e) { /* retry below */ } }
    if (!dirty) return;
    await Cloud.sync();
  };
  AT.on('state', () => {
    if (applying || !Cloud.signedIn()) return;
    dirty = true;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => Cloud.flush().catch(() => {}), PUSH_DELAY);
  });

  async function afterSignIn() {
    try {
      const r = await Cloud.sync();
      return r;
    } catch (e) {
      return { syncError: e.message };
    } finally {
      if (AT.rerender) AT.rerender();
    }
  }

  // Pick up progress made on other devices when coming back to the app.
  Cloud.refresh = refreshFromCloud;
  function refreshFromCloud() {
    if (!Cloud.signedIn() || document.body.classList.contains('lesson-open')) return;
    if (Date.now() - Cloud.lastPull < 30000 && !dirty) return;
    Cloud.sync().then((r) => { if (r && r.changed && AT.rerender) AT.rerender(); }).catch(() => {});
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') Cloud.flush().catch(() => {});
    else refreshFromCloud();
  });
  window.addEventListener('online', () => { if (dirty || Cloud.status === 'offline') Cloud.sync().catch(() => {}); });
  window.addEventListener('focus', refreshFromCloud);
  // Signing in or out in another tab: reload so this tab matches.
  window.addEventListener('storage', (e) => {
    if (e.key !== SESSION_KEY) return;
    const other = (() => { try { return JSON.parse(e.newValue); } catch (x) { return null; } })();
    const otherId = other && other.user && other.user.id;
    const myId = Cloud.user() && Cloud.user().id;
    if (otherId !== myId) location.reload();
    else if (other) Cloud.session = other; // token refreshed elsewhere
  });
})();

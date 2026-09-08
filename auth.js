(function () {
  function confirmationState(search, hash) {
    const query = new URLSearchParams(search);
    const fragment = new URLSearchParams(hash.replace(/^#/, ''));
    if (['error', 'error_code', 'error_description'].some(key => query.has(key) || fragment.has(key))) {
      return { kind: 'error' };
    }
    const codes = query.getAll('code');
    if (codes.length === 1 && /^[A-Za-z0-9_-]{1,512}$/.test(codes[0]) && !hash) {
      return { kind: 'confirmed', url: 'brewit://confirm-email?code=' + encodeURIComponent(codes[0]) };
    }
    if (!codes.length && fragment.get('type') === 'signup' && fragment.has('access_token')) {
      return { kind: 'manual' };
    }
    return { kind: 'missing' };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = confirmationState;
    return;
  }

  const state = confirmationState(window.location.search, window.location.hash);
  window.history.replaceState(null, '', window.location.pathname);
  document.addEventListener('DOMContentLoaded', () => {
    const title = document.getElementById('auth-title');
    const description = document.getElementById('auth-description');
    const help = document.getElementById('auth-help');
    const button = document.getElementById('open-app');
    if (state.kind === 'confirmed') {
      title.textContent = 'Email confirmed.';
      description.textContent = 'You’re ready for your next great coffee. Continue in BrewIt to finish signing in.';
      button.href = state.url;
      button.hidden = false;
      help.textContent = 'Use the iPhone where you created your account. If BrewIt doesn’t open, tap the button. On another device, open BrewIt and sign in with your password. Older builds may need an update.';
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        const timer = window.setTimeout(() => { if (!document.hidden) window.location.assign(state.url); }, 800);
        document.addEventListener('visibilitychange', () => { if (document.hidden) window.clearTimeout(timer); });
      }
    } else if (state.kind === 'manual') {
      title.textContent = 'Email confirmed.';
      description.textContent = 'Open BrewIt and sign in with your password to continue.';
      button.href = 'brewit://';
      button.hidden = false;
    } else if (state.kind === 'error') {
      title.textContent = 'This link is no longer available.';
      description.textContent = 'It may have expired or already been used. Try signing in to BrewIt, or request a new confirmation email from the app.';
    } else {
      title.textContent = 'Check your email.';
      description.textContent = 'Open the latest confirmation email from BrewIt and tap Confirm email. You can close this page.';
    }
  });
})();

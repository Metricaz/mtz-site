// Login and logout are Django's own views (backend/backend/urls.py); the app only reads the session.
const DJANGO_LOGIN_URL = '/dashboard/login/';
const DJANGO_LOGOUT_URL = '/dashboard/logout/';
const SESSION_URL = '/api/auth/me/';

export const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
};

/** Logged-in dashboard user, or null. Also makes Django set the CSRF cookie. */
export const fetchSessionUser = async () => {
  const response = await fetch(SESSION_URL, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Falha ao verificar a sessão (HTTP ${response.status})`);
  }
  const data = await response.json();
  return data.user;
};

/** Go to Django's login page; it sends the user back here after logging in. */
export const redirectToLogin = () => {
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`${DJANGO_LOGIN_URL}?next=${encodeURIComponent(next)}`);
};

/** Django's LogoutView only accepts POST (with the CSRF token), then redirects to the login page. */
export const submitLogout = () => {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = DJANGO_LOGOUT_URL;

  const csrf = document.createElement('input');
  csrf.type = 'hidden';
  csrf.name = 'csrfmiddlewaretoken';
  csrf.value = getCookie('csrftoken');
  form.appendChild(csrf);

  document.body.appendChild(form);
  form.submit();
};

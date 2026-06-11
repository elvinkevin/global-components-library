# developer-ui-boilerplate

A reusable, framework-agnostic UI component library — vanilla HTML/CSS/JS
with optional Jinja/Flask templating syntax baked in. Drop the pieces you
need into any project (Flask, Django, plain static site, etc.). Jinja
`{{ }}` / `{% %}` tags degrade gracefully — strip them out for plain HTML.

##  Structure

```
developer-ui-boilerplate/
├── layouts/
│   ├── multi-page-skeleton.html   # Base layout: navbar + content + footer
│   └── dashboard-sidebar.html     # App-shell layout with collapsible sidebar
├── components/
│   ├── navbar.html                # Responsive nav with mobile toggle
│   ├── footer.html                # Simple site footer
│   └── auth-form.html             # Login / Signup / Reset forms (CSRF + validation)
├── assets/
│   ├── css/global-core.css        # Design tokens + utility classes
│   └── js/main-interactivity.js   # Nav/sidebar toggles, CSRF fetch wrapper, validation
├── flask-templates/
│   ├── app_setup_example.py       # Flask app factory w/ security config
│   └── pages/                     # Example pages using the layouts above
└── README.md
```

##  Quick start (Flask)

1. Copy `layouts/`, `components/`, and `flask-templates/pages/` into your
   Flask app's `templates/` directory (keep the same relative paths so
   `{% extends %}` / `{% include %}` paths resolve).
2. Copy `assets/` into your `static/` directory.
3. Install security deps:
   ```bash
   pip install flask flask-wtf flask-talisman
   ```
4. Use `flask-templates/app_setup_example.py` as a reference for:
   - CSRF protection (`Flask-WTF`)
   - Secure session cookies
   - CSP headers (`Flask-Talisman`, optional)
   - Honeypot + rate-limit hooks for auth routes
5. Set a real `SECRET_KEY` via environment variable — never commit it.

##  Quick start (plain HTML / other frameworks)

- Strip Jinja tags (`{% ... %}`, `{{ ... }}`) from the components/layouts,
  or replace them with your templating engine's equivalent
  (Handlebars, EJS, Django templates, etc. — the structure maps 1:1).
- Link `assets/css/global-core.css` and `assets/js/main-interactivity.js`
  in your HTML `<head>`/before `</body>`.
- For the CSRF auto-header in `main-interactivity.js`, either provide a
  `<meta name="csrf-token" content="...">` tag from your backend, or
  remove that block if your framework handles CSRF differently.

##  Theming

All colors, spacing, radii, and typography are defined as CSS custom
properties in `global-core.css` under `:root`. Override them in your own
stylesheet, or toggle `data-theme="light"` / `"dark"` on `<html>`.

##  Security measures included

| Feature | Where | Notes |
|---|---|---|
| CSRF tokens | `auth-form.html`, `main-interactivity.js`, `app_setup_example.py` | Requires Flask-WTF server-side |
| Secure cookies (`HttpOnly`, `Secure`, `SameSite`) | `app_setup_example.py` | Set via Flask config |
| CSP / Referrer-Policy / X-Content-Type-Options | `layouts/*.html` (meta fallback), `app_setup_example.py` (Talisman) | Prefer real HTTP headers in production |
| Honeypot field | `auth-form.html` (signup) | Server ignores submissions where it's filled |
| Client-side form validation | `main-interactivity.js` (`data-validate`/`data-rules`) | UX layer only — **server-side validation is mandatory** |
| Output escaping | All Jinja templates | Auto-escaping is on by default; avoid `|safe` on user input |
| Generic auth error messages | `app_setup_example.py` (`/forgot-password`) | Prevents user enumeration |
| No `debug=True` in prod | `app_setup_example.py` | Avoids leaking stack traces |

>  This kit provides scaffolding and sane defaults, not a full security
> audit. Always review against your own threat model (password hashing,
> rate limiting, dependency updates, HTTPS enforcement, etc.).

##  Components reference

### `navbar.html`
Responsive top nav with mobile hamburger toggle (handled by
`main-interactivity.js`). Pass `nav_links` (list of `{href, label}`) and
`current_path` for active-link highlighting.

### `footer.html`
Simple footer with year + legal links. Pass `current_year` or register it
as a Jinja global.

### `auth-form.html`
Three modes via `auth_mode`: `"login"`, `"signup"`, `"reset"`. Includes
CSRF token, flash message rendering, client validation hooks, and a
honeypot field on signup.

##  Layouts reference

### `multi-page-skeleton.html`
Standard page: navbar → `{% block content %}` → footer. Extend for
marketing pages, content pages, auth pages, etc.

### `dashboard-sidebar.html`
App-shell with fixed sidebar nav + main content area. Sidebar collapses
on mobile via `data-sidebar-toggle` button (wired in
`main-interactivity.js`).

##  JS utilities (`window.UIKit`)

- `UIKit.CSRF.getToken()` — reads the CSRF meta tag
- `UIKit.Sanitize.escapeHTML(str)` / `setText(el, text)` — safe DOM writes
- `UIKit.Validators` — `required`, `email`, `minLength`, `match`

`fetch()` is wrapped globally to attach `X-CSRFToken` on
POST/PUT/PATCH/DELETE requests automatically.

##  License

Add your preferred license here (MIT recommended for internal kits you
may open-source later).

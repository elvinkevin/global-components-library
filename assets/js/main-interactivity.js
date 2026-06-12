/* ==========================================================================
   MAIN INTERACTIVITY
   Framework-agnostic vanilla JS utilities + security helpers.
   Include via: <script src="/assets/js/main-interactivity.js" defer></script>
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. CSRF TOKEN HELPER
   *    Reads a <meta name="csrf-token" content="..."> tag (set by your
   *    Flask template via {{ csrf_token() }}) and attaches it to every
   *    fetch() call automatically for non-GET requests.
   * ------------------------------------------------------------------ */
  const CSRF = {
    getToken() {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute("content") : null;
    },
  };

  // Wrap fetch globally to inject CSRF header on mutating requests
  const originalFetch = window.fetch;
  window.fetch = function (input, init = {}) {
    const method = (init.method || "GET").toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const token = CSRF.getToken();
      if (token) {
        init.headers = {
          ...(init.headers || {}),
          "X-CSRFToken": token,
        };
      }
    }
    return originalFetch(input, init);
  };

  /* ------------------------------------------------------------------ *
   * 2. SAFE DOM HELPERS
   *    Avoid innerHTML for user-controlled data to prevent XSS.
   * ------------------------------------------------------------------ */
  const Sanitize = {
    /** Escape a string for safe insertion as text content */
    escapeHTML(str) {
      const div = document.createElement("div");
      div.textContent = String(str);
      return div.innerHTML;
    },
    /** Set text content safely (preferred over innerHTML) */
    setText(el, text) {
      el.textContent = text;
    },
  };

  /* ------------------------------------------------------------------ *
   * 3. NAVBAR TOGGLE (mobile menu)
   * ------------------------------------------------------------------ */
  function initNavbar() {
    const toggle = document.querySelector(".navbar-toggle");
    const links = document.querySelector(".navbar-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
      links.classList.toggle("hidden");
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. SIDEBAR TOGGLE (mobile dashboard)
   * ------------------------------------------------------------------ */
  function initSidebar() {
    const toggle = document.querySelector("[data-sidebar-toggle]");
    const sidebar = document.querySelector(".sidebar");
    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  /* ------------------------------------------------------------------ *
   * 5. FLASH MESSAGE AUTO-DISMISS
   * ------------------------------------------------------------------ */
  function initFlashMessages() {
    document.querySelectorAll("[data-flash]").forEach((el) => {
      const delay = parseInt(el.getAttribute("data-flash-timeout") || "5000", 10);
      setTimeout(() => {
        el.style.transition = "opacity 300ms ease";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 300);
      }, delay);
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. CLIENT-SIDE FORM VALIDATION
   *    Lightweight validation for forms with [data-validate].
   *    NOTE: This is a UX layer only — server-side validation in
   *    Flask is REQUIRED and is the real security boundary.
   * ------------------------------------------------------------------ */
  const Validators = {
    required: (v) => v.trim().length > 0,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    minLength: (v, len) => v.length >= Number(len),
    match: (v, fieldName, form) => {
      const other = form.querySelector(`[name="${fieldName}"]`);
      return other ? v === other.value : true;
    },
  };

  function showFieldError(input, message) {
    clearFieldError(input);
    input.classList.add("error");
    const error = document.createElement("div");
    error.className = "field-error";
    error.setAttribute("data-error-for", input.name);
    error.textContent = message;
    input.insertAdjacentElement("afterend", error);
  }

  function clearFieldError(input) {
    input.classList.remove("error");
    const next = input.nextElementSibling;
    if (next && next.classList.contains("field-error")) next.remove();
  }

  function initFormValidation() {
    document.querySelectorAll("form[data-validate]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        let valid = true;

        form.querySelectorAll("[data-rules]").forEach((input) => {
          clearFieldError(input);
          const rules = input.getAttribute("data-rules").split("|");

          for (const rule of rules) {
            const [name, arg] = rule.split(":");
            const fn = Validators[name];
            if (!fn) continue;

            const ok = arg
              ? fn(input.value, arg, form)
              : fn(input.value);

            if (!ok) {
              valid = false;
              const messages = {
                required: "This field is required.",
                email: "Enter a valid email address.",
                minLength: `Must be at least ${arg} characters.`,
                match: "Fields do not match.",
              };
              showFieldError(input, messages[name] || "Invalid value.");
              break;
            }
          }
        });

        if (!valid) e.preventDefault();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. INIT
   * ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initSidebar();
    initFlashMessages();
    initFormValidation();
  });

  // Expose limited utilities globally for reuse in page-specific scripts
  window.UIKit = { Sanitize, CSRF, Validators };
})();

---
name: wordpress
description: "Build and harden WordPress themes/plugins with escape-on-output, capability+nonce gates, prepared SQL, REST permission_callback, and WP-CLI-safe cutovers—security failures agents routinely ship."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["wordpress", "php", "plugins", "themes", "wp-cli", "rest-api", "security", "hooks"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# WordPress Development AI Skill Guide (Claude)

## Overview & Engine Architecture

WordPress serves content via **themes + plugins** on PHP + MySQL. Behavior extends through **actions/filters**, custom post types, and the **REST API**. **WP-CLI** drives installs, search-replace, and cron without the browser. Agents **sanitize on input / escape on output**, use `$wpdb->prepare` or WP APIs, require **`current_user_can` + nonces** (nonces alone are not auth), always set REST **`permission_callback`**, and never commit `wp-config.php` secrets or edit core files.

```
┌─────────────────────────────────────────────────────────────┐
│                 WordPress request → response                  │
│                                                             │
│  Client → @nginx / Apache → PHP-FPM                         │
│       → WP core bootstrap (wp-config secrets at runtime)    │
│       → Active theme + plugins (actions / filters)          │
│            ├── WP_Query / $wpdb → MySQL                     │
│            ├── REST (/wp-json) + permission_callback        │
│            └── admin-ajax / cron / WP-CLI                   │
│                                                             │
│  Security gates                                             │
│  ├── Escape output; prepare SQL; capability checks          │
│  └── Nonces = CSRF only (not authorization)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Building or reviewing custom themes, plugins, CPTs, taxonomies, or REST routes.
- Automating installs, search-replace, cache flush, or cron via WP-CLI.
- Hardening against XSS, SQLi, CSRF, privilege escalation, and file-edit abuse.

**Do not use when**

- The task is only reverse-proxy / TLS at the edge → `@nginx` / `@nginx-hardening`.
- Broader app-sec requirements mapping without WP-specific code → `@owasp-asvs`.
- Someone asks to edit core files, disable all auth on admin-ajax, or invent DB passwords in committed `wp-config.php` → refuse.

---

## Operational Capabilities & Agent Directives

1. **Escape on output** (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`); **sanitize on input** (`sanitize_text_field`, `absint`, etc.).
2. **SQL**: `$wpdb->prepare` for dynamic SQL; prefer `WP_Query` / Metadata API when possible.
3. **Authorization**: `current_user_can` (object-aware when needed). Nonces are **CSRF only**—never treat nonce presence as login/auth.
4. **State-changing requests**: verify nonce **and** capability; prefer `check_admin_referer` / `wp_verify_nonce` patterns.
5. **REST**: every `register_rest_route` needs `permission_callback`. Use `__return_true` only for genuinely public data; otherwise `current_user_can(...)`.
6. **Enqueue** with `wp_enqueue_script` / `wp_enqueue_style`; localize nonces via `wp_localize_script` / `wp_add_inline_script`—do not hardcode secrets in JS.
7. **Production hardening**: `DISALLOW_FILE_EDIT`, keep core/themes/plugins updated, remove unused plugins, prefer env/server config for secrets outside web root (Bedrock-style when applicable).
8. **WP-CLI search-replace**: always `--dry-run` first; then apply; flush caches; verify URLs/HTTPS.
9. **Never invent** DB credentials, salts, or Application Passwords—read from env / existing `wp-config` placeholders.

---

## Production Example: CPT + gated REST + WP-CLI cutover

Plugin sketch:

```php
<?php
/**
 * Plugin Name: Example Books
 */
add_action('init', function () {
  register_post_type('book', [
    'public'       => true,
    'label'        => 'Books',
    'show_in_rest' => true,
    'supports'     => ['title', 'editor', 'thumbnail'],
  ]);
});

add_action('rest_api_init', function () {
  register_rest_route('example-books/v1', '/settings', [
    'methods'             => 'POST',
    'callback'            => 'example_books_update_settings',
    'permission_callback' => function () {
      return current_user_can('manage_options');
    },
    'args'                => [
      'title_prefix' => [
        'required'          => true,
        'sanitize_callback' => 'sanitize_text_field',
      ],
    ],
  ]);
});

function example_books_update_settings(WP_REST_Request $request) {
  $prefix = $request->get_param('title_prefix');
  update_option('example_books_title_prefix', $prefix);
  return ['ok' => true, 'title_prefix' => $prefix];
}

add_action('admin_post_example_books_save', function () {
  if (!current_user_can('manage_options')) {
    wp_die(esc_html__('Forbidden', 'example-books'), 403);
  }
  check_admin_referer('example_books_save');
  $val = isset($_POST['title_prefix'])
    ? sanitize_text_field(wp_unslash($_POST['title_prefix']))
    : '';
  update_option('example_books_title_prefix', $val);
  wp_safe_redirect(admin_url('options-general.php?page=example-books'));
  exit;
});
```

`wp-config.php` production flags (values from env—do not invent secrets):

```php
define('DISALLOW_FILE_EDIT', true);
define('FORCE_SSL_ADMIN', true);
// define('WP_DEBUG', false); in production
```

WP-CLI cutover:

```bash
wp search-replace 'http://old.example' 'https://new.example' --all-tables --dry-run
wp search-replace 'http://old.example' 'https://new.example' --all-tables
wp rewrite flush --hard
wp cache flush
wp plugin list --status=active
wp core verify-checksums
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Stored XSS in admin/front | Echoed unsanitized `$_GET`/`the_content` mishandled | Escape/kses on output; sanitize on save |
| SQL injection / odd `$wpdb` errors | String-concat SQL | `$wpdb->prepare` or WP APIs |
| `rest_forbidden` / `_doing_it_wrong` permission | Missing or wrong `permission_callback` | Explicit callback; cookie + `X-WP-Nonce` for cookie auth |
| CSRF on settings save | No nonce / capability | `check_admin_referer` + `current_user_can` |
| Broken site after domain change | Serialized URL replace by naive sed | WP-CLI `search-replace` (PHP-aware) |
| White screen after plugin update | Fatal in plugin; memory | `WP_DEBUG_LOG`; disable via WP-CLI; raise memory carefully |
| admin-ajax abuse / DoS | Public unlimited handlers | Capability checks, nonces, rate limits |
| Edits lost on upgrade | Core/theme file hacks | Child theme / plugin hooks only |

---

## Best Practices

1. Prefer block themes / block APIs for new UI when the project allows.
2. Object cache + careful transient TTLs on high traffic; avoid unbounded `wp_options` autoload bloat.
3. Principle of least plugins; remove abandoned extensions.
4. Application Passwords / OAuth for remote REST—not shared admin passwords in scripts.
5. Multisite and Composer/Bedrock layouts change paths—detect project layout before writing paths.
6. Pair with `@nginx` hardening: deny PHP in uploads, correct `client_max_body_size`, HTTPS redirects.

---

## Limitations

- Hosting (shared, Bedrock, multisite) changes deploy and path conventions.
- Page builders and heavy plugin stacks create unpredictable hook conflicts.
- This skill does not replace malware incident response for compromised sites.
- Stop and ask if DB credentials, salts, or production URLs are missing.

---

## Related Skills

- `@nginx` — reverse proxy and PHP-FPM fronting
- `@nginx-hardening` — origin TLS and upload/PHP deny rules
- `@owasp-asvs` — broader application security requirements
- `@lets-encrypt` — certificate issuance interacting with the host

---

## Agent Operational Directive

> **MANDATORY**: Escape on output; prepare SQL; gate every state change with capability checks—nonces alone are not authorization. Every REST route needs an explicit `permission_callback`. Never edit core, never commit secrets, always `--dry-run` WP-CLI search-replace before apply.

---

## Source anchors (research)

- [Nonces (CSRF only, not auth)](https://developer.wordpress.org/apis/security/nonces/)
- [REST custom endpoints & permission_callback](https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/)
- [Hardening WordPress (`DISALLOW_FILE_EDIT`)](https://developer.wordpress.org/advanced-administration/security/hardening/)
- [REST authentication & `X-WP-Nonce`](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/)

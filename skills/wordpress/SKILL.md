---
name: wordpress
description: "Operational skill for WordPress development: themes, plugins, hooks, WP-CLI, REST API, and hardening against common WP pitfalls."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["wordpress", "php", "plugins", "themes", "wp-cli", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# WordPress Development AI Skill Guide

## Overview & Engine Architecture

WordPress serves content via themes and plugins on a PHP + MySQL stack. Behavior is extended through actions/filters hooks, custom post types, and the REST API. WP-CLI handles admin tasks without the browser. Agents escape output, prepare SQL, keep plugins minimal, and never commit `wp-config.php` secrets.

```
Request
   -> WordPress core
       -> Active theme + plugins (hooks)
       -> MySQL (posts, options, users)
REST / WP-CLI / cron -> same hook ecosystem
```

## When to use this skill

- Building or reviewing custom themes and plugins
- Registering CPTs, taxonomies, and REST routes
- Automating installs and searches with WP-CLI
- Hardening sites against XSS, SQLi, and file abuse

## Operational directives

1. Escape on output (`esc_html`, `esc_attr`, `wp_kses_post`); sanitize on input.
2. Use `$wpdb->prepare` for any dynamic SQL; prefer APIs (`WP_Query`) when possible.
3. Enqueue scripts with `wp_enqueue_script`; never hardcode admin jQuery hacks in random places.
4. Check capabilities (`current_user_can`) and nonces on every state-changing request.
5. Keep WordPress core, themes, and plugins updated; remove unused plugins.

## Plugin sketch

```php
add_action('init', function () {
  register_post_type('book', [
    'public' => true,
    'label'  => 'Books',
    'show_in_rest' => true,
  ]);
});

add_action('rest_api_init', function () {
  register_rest_route('myplugin/v1', '/health', [
    'methods'  => 'GET',
    'callback' => fn() => ['ok' => true],
    'permission_callback' => '__return_true', // tighten for sensitive data
  ]);
});
```

## WP-CLI sketches

```bash
wp plugin list --status=active
wp search-replace 'http://old.example' 'https://new.example' --all-tables --dry-run
wp cache flush
```

## Common pitfalls

| Pitfall | Result | Fix |
| --- | --- | --- |
| Echoing unsanitized `$_GET` | XSS | Escape/sanitize appropriately |
| Direct SQL with string concat | SQLi | `$wpdb->prepare` |
| Unlimited `admin-ajax` handlers | Abuse / DoS | Capability checks + rate limits |
| Editing core files | Lost on upgrade | Hooks / child theme / plugin |

## Best practices

- Prefer block themes / modern block APIs for new UI work when compatible.
- Store config in environment or server config outside the web root when possible.
- Use object caching and careful transient TTLs on high-traffic sites.
- Disallow file editing in admin (`DISALLOW_FILE_EDIT`) in production.

## Limitations

- Hosting stacks (Apache/Nginx, multisite, Bedrock/Composer layouts) change paths and deploy flow.
- Page builders and heavy plugin stacks can conflict in unpredictable ways.
- This skill does not replace malware incident response for compromised sites.

## Related skills

- `@php` - language-level patterns
- `@nginx` - fronting WordPress safely
- `@owasp-asvs` - broader application security requirements

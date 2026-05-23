# CLAUDE.md — n8nRequest Build Guide

> Drop this file at the repo root. Claude Code reads it automatically on every run.

---

## What We're Building

**n8nRequest** — a minimal HTTP client web app that lets developers build and test API requests, then export them as ready-to-paste n8n HTTP Request node JSON.

The core pain: devs test in Postman/Insomnia, then manually recreate every header/body/auth inside n8n's cramped node panel. This tool bridges that gap with a single "Export → n8n" button.

**Stack:** Nuxt 3 + TypeScript + Tailwind CSS  
**Deployment target:** Vercel (static/SSR)  
**No backend required.** All requests fire directly from the browser. CORS issues are the user's problem (document it, don't solve it in v1).

---

## Domain Glossary

**Request Profile** — the full configuration of an outgoing HTTP request: method, URL, headers, body, auth. This is the central data unit.  
_Avoid:_ "request object", "payload config"

**Export** — the act of converting a Request Profile into a valid n8n HTTP Request node JSON blob, ready to paste into n8n's JSON import.  
_Avoid:_ "serialize", "download"

**n8n Node JSON** — the specific JSON format n8n expects when importing a node via its JSON editor. Structure is versioned (typeVersion 4.2 as of writing).  
_Avoid:_ "n8n JSON", "workflow JSON"

**Response Panel** — the read-only area that displays the HTTP response: status code, timing, response body, headers.

**Collection** — a saved list of Request Profiles. Out of scope for v1.

---

## Problem Statement

When building n8n workflows, developers must configure HTTP Request nodes manually inside n8n's cramped UI. There is no way to test a request in a proper client and then transfer that configuration to n8n without manual re-entry. Headers get forgotten, body structures get mistyped, auth gets misconfigured. Every n8n HTTP node is rebuilt from scratch.

---

## Solution

A focused HTTP client that mirrors the n8n HTTP Request node's capabilities. The user builds and tests a request in a clean UI, verifies the response, and hits "Export to n8n" to get valid node JSON they can paste directly.

---

## User Stories

1. As a developer, I want to enter a URL and select an HTTP method so I can define the request target.
2. As a developer, I want to add request headers as key-value pairs so I can set Content-Type, Authorization, and custom headers.
3. As a developer, I want to write a JSON request body with syntax highlighting so I can build POST/PUT/PATCH payloads without typos.
4. As a developer, I want to configure Bearer token auth so I can test authenticated endpoints.
5. As a developer, I want to configure Basic auth (username + password) so I can test legacy authenticated APIs.
6. As a developer, I want to configure API Key auth (header name + value) so I can test key-authenticated APIs.
7. As a developer, I want to send the request and see the response status code, body, and timing so I can verify the API behaves as expected.
8. As a developer, I want response JSON to be syntax-highlighted and pretty-printed so I can read nested structures easily.
9. As a developer, I want to click "Export to n8n" and have the n8n HTTP Request node JSON copied to my clipboard so I can paste it directly into n8n.
10. As a developer, I want the exported JSON to be valid n8n node format (typeVersion 4.2) so it imports without errors.
11. As a developer, I want to import a cURL command and have it parsed into the request form so I can migrate existing curl commands quickly.
12. As a developer, I want to see query parameters as an editable key-value table so I don't have to manually encode them in the URL.
13. As a developer, I want query params I add in the table to be reflected live in the URL bar so I can see the final URL.
14. As a developer, I want the UI to clearly show me which auth method is active so I don't accidentally double-configure auth.
15. As a developer, I want to toggle headers on/off without deleting them so I can test with and without specific headers.
16. As a developer, I want to save a request profile to localStorage so I can return to it after a page refresh.
17. As a developer, I want to see a clear error message if the request fails (network error, CORS, timeout) so I understand what went wrong.
18. As a developer, I want the export button to be disabled if no URL is set so I don't export empty/invalid nodes.
19. As a developer, I want to choose between raw JSON body and form-urlencoded body types so I can match the API's expected content type.
20. As a developer, I want the n8n export to automatically set the correct Content-Type header based on my body type so the export just works.

---

## Implementation Decisions

### Module: `useRequestProfile` (composable)
Central state for the active Request Profile. Owns: method, url, headers array, queryParams array, body (raw string), bodyType (json | form | none), auth config. Exposes mutators. This is the single source of truth — every panel reads from it, every export consumes it.

### Module: `useHttpSender` (composable)
Wraps `$fetch` / native `fetch`. Accepts a Request Profile, fires the request, returns `{ status, body, headers, durationMs, error }`. Completely decoupled from UI. Testable in isolation with a mock fetch adapter.

### Module: `n8nExporter` (pure function, `utils/n8nExporter.ts`)
Takes a Request Profile, returns a string of valid n8n HTTP Request node JSON (typeVersion 4.2). Pure function — no side effects. This is the most important module in the app. Make it a deep module: the caller passes a profile, gets a string back, knows nothing about n8n's internal structure.

**n8n HTTP Request node shape (typeVersion 4.2):**
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.example.com/endpoint",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "Content-Type", "value": "application/json" }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [...]
    },
    "bodyContentType": "json",
    "jsonBody": "{\"key\": \"value\"}",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth"
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [0, 0],
  "name": "HTTP Request"
}
```
> Verify the exact field names against https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/ before finalizing. The exporter must handle all auth types (none, bearer, basicAuth, apiKey in header).

### Module: `curlParser` (pure function, `utils/curlParser.ts`)
Parses a curl command string into a Partial<RequestProfile>. Handles: `-X METHOD`, `-H "Header: Value"`, `-d 'body'`, `--data-raw`, `--user user:pass`, `-u user:pass`. Return partial — caller merges into active profile.

### Module: `KeyValueEditor` (component)
Reusable table component for headers and query params. Props: `rows`, `onUpdate`. Each row: `{ key, value, enabled: boolean }`. Renders as an editable grid with an enable/disable toggle per row and a delete button. Used for both headers and query params panels.

### Module: `ResponsePanel` (component)
Read-only. Displays: status badge (color-coded), duration in ms, response body with syntax highlighting (use `shiki` or `highlight.js`), response headers in a collapsible table.

### Routing
Single page app. No routing needed in v1. Everything lives on `/`.

### Layout
Two-column on desktop: left = request builder (method + URL bar, tabs for Params / Headers / Body / Auth), right = response panel. Single column on mobile (builder on top, response below).

### Persistence
On every Request Profile change, debounce-save to `localStorage` key `n8nrequest_profile`. On app mount, rehydrate from localStorage if present.

### CORS
Document clearly in the UI: "Requests fire from your browser. CORS errors are enforced by the target server." Do not proxy. Do not solve this in v1.

### Clipboard
Use `navigator.clipboard.writeText()` for the export copy. Show a transient "Copied!" confirmation on the export button (500ms, then revert).

---

## File Structure

```
/
├── CLAUDE.md                        ← this file
├── nuxt.config.ts
├── app.vue
├── pages/
│   └── index.vue                    ← main app page
├── components/
│   ├── RequestBuilder.vue           ← left panel container
│   ├── KeyValueEditor.vue           ← reusable key/value table
│   ├── BodyEditor.vue               ← JSON/form body editor
│   ├── AuthEditor.vue               ← auth method selector + fields
│   ├── ResponsePanel.vue            ← right panel, read-only
│   ├── ExportButton.vue             ← export to n8n + copy logic
│   └── CurlImportModal.vue          ← paste curl → parse → populate
├── composables/
│   ├── useRequestProfile.ts         ← central request state
│   └── useHttpSender.ts             ← fires the request
├── utils/
│   ├── n8nExporter.ts               ← Request Profile → n8n node JSON
│   └── curlParser.ts                ← curl string → Partial<RequestProfile>
├── types/
│   └── index.ts                     ← RequestProfile, AuthConfig, etc.
└── tests/
    ├── n8nExporter.test.ts
    └── curlParser.test.ts
```

---

## Testing Decisions

### Philosophy
Test behavior through public interfaces. The two pure utility modules are the highest-value test targets — they have no side effects and encode the most critical logic.

### What to test

**`n8nExporter.ts` — HIGH PRIORITY**
- Given a GET request with no body and no auth → produces valid n8n JSON with `sendBody: false`
- Given a POST with JSON body → `bodyContentType` is `"json"`, `jsonBody` is set
- Given Bearer auth → `authentication` and `genericAuthType` are set correctly
- Given Basic auth → maps to n8n's expected basicAuth fields
- Given API Key auth → maps to header auth fields
- Given disabled headers → they are excluded from the export
- Given query params → they are included in the URL or as n8n queryParameters array

**`curlParser.ts` — HIGH PRIORITY**
- `curl https://api.example.com` → method GET, url set
- `curl -X POST -H "Content-Type: application/json" -d '{"k":"v"}' https://...` → POST, header set, body set
- `curl -u user:pass https://...` → Basic auth populated
- Malformed curl → returns empty partial, no throw

**`useHttpSender` — NOT unit tested** (hits network; integration test or manual QA only)

### Test runner
Vitest. Tests live in `/tests/`. Run with `pnpm test`.

---

## Out of Scope (v1)

- Collections / saved request history (beyond single localStorage slot)
- Environments / variables (e.g. `{{BASE_URL}}`)
- WebSocket / GraphQL / gRPC support
- Response diffing
- Team sharing
- OAuth2 flow (only static token)
- Mosh or any non-HTTP protocol
- Backend proxy for CORS bypass
- n8n workflow export (multi-node) — single node only

---

## Build Order (Vertical Slices)

Follow this order — each slice is demoable on its own:

1. **Scaffold** — Nuxt 3 + Tailwind + TypeScript. Empty two-column layout renders.
2. **Request form** — URL bar + method dropdown + send button. No real request yet.
3. **`useRequestProfile` composable** — wires form to central state.
4. **`useHttpSender` composable** — fires real requests, returns response data.
5. **`ResponsePanel` component** — displays status + body. End-to-end: type URL, hit send, see response.
6. **`KeyValueEditor` component** — headers + query params tabs working.
7. **`BodyEditor` component** — raw JSON body tab, body type selector.
8. **`AuthEditor` component** — Bearer / Basic / API Key auth tabs.
9. **`n8nExporter` utility + tests** — pure function, fully tested.
10. **`ExportButton` component** — calls exporter, copies to clipboard, shows confirmation.
11. **`curlParser` utility + tests** — pure function, fully tested.
12. **`CurlImportModal`** — paste curl, parse, populate form.
13. **localStorage persistence** — rehydrate on mount, save on change.
14. **Polish** — CORS error messaging, disabled states, mobile layout, loading states.

---

## Agent Skills

### Issue tracker
Local markdown — issues live as files under `.scratch/`.

### Triage labels
| Role | Label string |
|------|-------------|
| needs-triage | `needs-triage` |
| needs-info | `needs-info` |
| ready-for-agent | `ready-for-agent` |
| ready-for-human | `ready-for-human` |
| wontfix | `wontfix` |

### Domain docs
Single-context. `CONTEXT.md` at repo root (create if absent). ADRs in `docs/adr/`.

---

## Further Notes

- Keep the n8n node typeVersion as a named constant (`N8N_HTTP_NODE_VERSION = 4.2`) in the exporter so it's easy to bump when n8n releases a new version.
- The `position` field in the exported JSON can be hardcoded to `[0, 0]` — n8n repositions nodes on paste.
- If `navigator.clipboard` is unavailable (HTTP context), fall back to a `<textarea>` select + `document.execCommand('copy')` with a visible fallback textarea.
- For syntax highlighting in the response panel, prefer `shiki` (Nuxt has a first-class integration via `@nuxtjs/mdc` or standalone) over highlight.js — smaller, tree-shakeable, and supports more themes.
- Auth fields should be masked (password-type inputs) to avoid shoulder surfing.
- The export modal (or inline preview) should show the raw JSON before copying so the user can verify it — trust but verify.

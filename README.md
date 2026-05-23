# BaridMan

**Test HTTP requests. Export them directly to n8n.**

BaridMan is a minimal HTTP client built for developers who work with [n8n](https://n8n.io). You build and test your API request in a clean interface, verify the response, then hit **Export to n8n** — and get a fully configured HTTP Request node you can paste directly into your workflow canvas.

No more rebuilding every header, body, and auth config by hand inside n8n's cramped node panel.

**Live → [barid-man-tebk.vercel.app](https://barid-man-tebk.vercel.app)**

---

## The Problem

You test an API in Insomnia or Postman. It works. Then you open n8n and have to re-enter the URL, every header, the auth token, the request body — manually, inside a tiny panel, with no syntax highlighting. Something always gets mistyped.

## The Solution

Build your request in BaridMan. Hit Send to confirm it works. Hit **Export to n8n** — copy the JSON, paste it (`Ctrl+V`) onto the n8n canvas. Done.

---

## Features

- **Import from cURL** — paste any curl command, fields populate automatically
- **Full request builder** — method, URL, headers, query params, JSON/form body
- **Schema body builder** — define fields with name + type, fill in values, JSON generates automatically
- **CSV schema import** — drop a CSV, headers become fields instantly
- **Auth support** — Bearer token, Basic auth, API Key
- **Live response panel** — status code, timing, pretty-printed JSON, response headers
- **Request history** — last 20 sent requests, click any to restore
- **Export to n8n** — generates a valid HTTP Request node (typeVersion 4.2) ready to paste with `Ctrl+V`
- **Persistent state** — your last request profile survives page refresh via localStorage
- **No backend** — everything runs in the browser

---

## How to Use

### Basic flow

1. Enter a URL and select a method
2. Add headers, query params, body, or auth as needed
3. Hit **Send** to test the request
4. Hit **Export to n8n** → **Copy to Clipboard**
5. Open your n8n workflow canvas → `Ctrl+V`

### Schema body builder

Instead of typing raw JSON, use the **Schema** tab under Body:

1. Add field names and pick a type for each: `string`, `number`, `boolean`, or `date`
2. Fill in the values — inputs adapt per type (number input, date picker, true/false dropdown)
3. The JSON body generates live as you type
4. Export to n8n — the body is serialized with correct types (no quoted numbers)

**CSV import:** if your API has a schema CSV, click **Import CSV schema** — the first row headers become fields automatically. Supports type hints in headers: `amount(number)`, `is_active(boolean)`.

### Request history

Click the **clock icon** in the top-right header to open your request history. The last 20 requests are saved automatically. Click any entry to restore the full request profile. Delete individual entries or clear all.

### Import from cURL

Click **Import cURL**, paste your curl command, hit Import. Supports `--cookie`, `--header`, `--data`, `--user`, `--location`, `--user-agent`, and more.

### CORS

Requests fire directly from your browser. If a target server blocks cross-origin requests, you'll see a "Failed to fetch" error. This is enforced by the target server — install a CORS browser extension like [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino) to bypass it locally.

---

## Stack

- [Nuxt 4](https://nuxt.com) + Vue 3
- TypeScript
- Tailwind CSS
- Vitest (26 tests)
- Deployed on Vercel

---

## Development

```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm test      # run test suite
pnpm build     # production build
```

---

## Project Structure

```
app/
├── pages/index.vue              # main layout
├── components/
│   ├── RequestBuilder.vue       # left panel
│   ├── KeyValueEditor.vue       # headers & query params table
│   ├── BodyEditor.vue           # JSON / form / schema body switcher
│   ├── SchemaBodyEditor.vue     # field name + type + value table, CSV import
│   ├── AuthEditor.vue           # Bearer / Basic / API Key
│   ├── ResponsePanel.vue        # status, body, headers
│   ├── ExportButton.vue         # n8n export + clipboard
│   ├── CurlImportModal.vue      # curl → request profile
│   └── HistoryPanel.vue         # last 20 requests, restore on click
├── composables/
│   ├── useRequestProfile.ts     # central request state + localStorage
│   ├── useHttpSender.ts         # fetch wrapper
│   └── useHistory.ts            # history state + localStorage
utils/
├── n8nExporter.ts               # Request Profile → n8n node JSON
└── curlParser.ts                # curl string → Request Profile
types/index.ts                   # RequestProfile, SchemaField, HistoryEntry, etc.
tests/
├── n8nExporter.test.ts
└── curlParser.test.ts
```

---

## Roadmap

- [ ] Saved request profiles (named, multiple slots)
- [ ] Environment variables (`{{BASE_URL}}`, `{{API_KEY}}`)
- [ ] Response syntax highlighting (Shiki)
- [ ] cURL export

---

Built by [@ZTF666](https://github.com/ZTF666)

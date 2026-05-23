import type { RequestProfile, HttpMethod, KeyValueRow } from '~/types'

function makeRow(key: string, value: string): KeyValueRow {
  return { id: crypto.randomUUID(), key, value, enabled: true }
}

// Flags that consume the next token as their value but we skip entirely
const SKIP_ARG_FLAGS = new Set([
  '-o', '--output',
  '-e', '--referer',
  '-m', '--max-time',
  '--connect-timeout',
  '--retry',
  '--proxy', '-x',
])

// Boolean flags (no argument) we can safely ignore
const BOOL_FLAGS = new Set([
  '-L', '--location',
  '--compressed',
  '-k', '--insecure',
  '-s', '--silent',
  '-v', '--verbose',
  '-i', '--include',
  '-I', '--head',
  '-g', '--globoff',
  '--http1.1', '--http2',
  '-f', '--fail',
  '--no-keepalive',
])

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inSingle = false
  let inDouble = false
  let i = 0

  while (i < input.length) {
    const ch = input[i]
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle
    } else if (ch === '"' && !inSingle) {
      inDouble = !inDouble
    } else if (ch === '\\' && (inSingle || inDouble)) {
      current += input[++i] ?? ''
    } else if (/\s/.test(ch) && !inSingle && !inDouble) {
      if (current) { tokens.push(current); current = '' }
    } else {
      current += ch
    }
    i++
  }
  if (current) tokens.push(current)
  return tokens
}

export function parseCurl(input: string): Partial<RequestProfile> {
  try {
    const trimmed = input.trim().replace(/\\\n/g, ' ')
    const tokens = tokenize(trimmed)

    if (!tokens[0] || tokens[0].toLowerCase() !== 'curl') return {}

    let method: HttpMethod = 'GET'
    let url = ''
    const headers: KeyValueRow[] = []
    let body = ''
    let basicUsername = ''
    let basicPassword = ''
    let hasExplicitMethod = false

    let i = 1
    while (i < tokens.length) {
      const t = tokens[i]

      if (t === '-X' || t === '--request') {
        method = (tokens[++i] ?? 'GET').toUpperCase() as HttpMethod
        hasExplicitMethod = true
      } else if (t === '-H' || t === '--header') {
        const raw = tokens[++i] ?? ''
        const colon = raw.indexOf(':')
        if (colon !== -1) {
          headers.push(makeRow(raw.slice(0, colon).trim(), raw.slice(colon + 1).trim()))
        }
      } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') {
        body = tokens[++i] ?? ''
        if (!hasExplicitMethod) method = 'POST'
      } else if (t === '-u' || t === '--user') {
        const raw = tokens[++i] ?? ''
        const colon = raw.indexOf(':')
        basicUsername = colon !== -1 ? raw.slice(0, colon) : raw
        basicPassword = colon !== -1 ? raw.slice(colon + 1) : ''
      } else if (t === '-b' || t === '--cookie') {
        // Add cookie as a Cookie header
        const raw = tokens[++i] ?? ''
        if (raw) headers.push(makeRow('Cookie', raw))
      } else if (t === '-A' || t === '--user-agent') {
        const raw = tokens[++i] ?? ''
        if (raw) headers.push(makeRow('User-Agent', raw))
      } else if (BOOL_FLAGS.has(t)) {
        // boolean flag, no argument — skip
      } else if (SKIP_ARG_FLAGS.has(t)) {
        i++ // skip the flag's argument too
      } else if (!t.startsWith('-')) {
        // Only accept absolute URLs to avoid cookie values / other args
        // being mistaken for a URL
        if (t.startsWith('http://') || t.startsWith('https://')) {
          url = t
        }
      }

      i++
    }

    const result: Partial<RequestProfile> = { method, url }
    if (headers.length) result.headers = headers
    if (body) {
      result.body = body
      result.bodyType = 'json'
    }
    if (basicUsername) {
      result.auth = { type: 'basic', basicUsername, basicPassword }
    }

    return result
  } catch {
    return {}
  }
}

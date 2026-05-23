import type { RequestProfile, HttpResponse } from '~/types'

const response = ref<HttpResponse | null>(null)
const loading = ref(false)

export function useHttpSender() {
  async function send(profile: RequestProfile): Promise<void> {
    loading.value = true
    response.value = null
    const start = Date.now()

    try {
      const headers: Record<string, string> = {}

      for (const row of profile.headers) {
        if (row.enabled && row.key) headers[row.key] = row.value
      }

      const auth = profile.auth
      if (auth.type === 'bearer' && auth.bearerToken) {
        headers['Authorization'] = `Bearer ${auth.bearerToken}`
      } else if (auth.type === 'basic' && auth.basicUsername) {
        const creds = btoa(`${auth.basicUsername}:${auth.basicPassword ?? ''}`)
        headers['Authorization'] = `Basic ${creds}`
      } else if (auth.type === 'apiKey' && auth.apiKeyName && auth.apiKeyValue) {
        headers[auth.apiKeyName] = auth.apiKeyValue
      }

      let body: string | undefined
      if (profile.bodyType === 'json' && profile.body) {
        body = profile.body
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
      } else if (profile.bodyType === 'form' && profile.body) {
        body = profile.body
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded'
      } else if (profile.bodyType === 'schema' && profile.schemaFields?.length) {
        const obj: Record<string, unknown> = {}
        for (const f of profile.schemaFields) {
          if (!f.name || f.value === '') continue
          if (f.type === 'number') obj[f.name] = Number(f.value)
          else if (f.type === 'boolean') obj[f.name] = f.value === 'true'
          else obj[f.name] = f.value
        }
        body = JSON.stringify(obj)
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
      }

      const res = await fetch(profile.url, {
        method: profile.method,
        headers,
        body: ['GET', 'HEAD'].includes(profile.method) ? undefined : body,
      })

      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((val, key) => { responseHeaders[key] = val })

      response.value = {
        status: res.status,
        statusText: res.statusText,
        body: await res.text(),
        headers: responseHeaders,
        durationMs: Date.now() - start,
      }
    } catch (err: unknown) {
      response.value = {
        status: 0,
        statusText: 'Network Error',
        body: '',
        headers: {},
        durationMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      }
    } finally {
      loading.value = false
    }
  }

  return { response: readonly(response), loading: readonly(loading), send }
}

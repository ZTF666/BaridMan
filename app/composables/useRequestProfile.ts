import type { RequestProfile, HttpMethod, BodyType, AuthConfig, KeyValueRow } from '~/types'

function makeRow(key = '', value = '', enabled = true): KeyValueRow {
  return { id: crypto.randomUUID(), key, value, enabled }
}

function defaultProfile(): RequestProfile {
  return {
    method: 'GET',
    url: '',
    headers: [makeRow()],
    queryParams: [makeRow()],
    body: '',
    bodyType: 'none',
    auth: { type: 'none' },
  }
}

const STORAGE_KEY = 'baridman_profile'

function loadFromStorage(): RequestProfile {
  if (import.meta.server) return defaultProfile()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProfile()
    return JSON.parse(raw) as RequestProfile
  } catch {
    return defaultProfile()
  }
}

const profile = ref<RequestProfile>(defaultProfile())
let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave() {
  if (import.meta.server) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value))
  }, 300)
}

export function useRequestProfile() {
  onMounted(() => {
    profile.value = loadFromStorage()
  })

  watch(profile, scheduleSave, { deep: true })

  function setMethod(method: HttpMethod) {
    profile.value.method = method
  }

  function setUrl(url: string) {
    profile.value.url = url
  }

  function setHeaders(rows: KeyValueRow[]) {
    profile.value.headers = rows
  }

  function setQueryParams(rows: KeyValueRow[]) {
    profile.value.queryParams = rows
    syncQueryParamsToUrl()
  }

  function syncQueryParamsToUrl() {
    try {
      const base = profile.value.url.split('?')[0]
      const active = profile.value.queryParams.filter(r => r.enabled && r.key)
      if (!active.length) {
        profile.value.url = base
        return
      }
      const qs = active.map(r => `${encodeURIComponent(r.key)}=${encodeURIComponent(r.value)}`).join('&')
      profile.value.url = base ? `${base}?${qs}` : profile.value.url
    } catch {
      // malformed URL — leave as-is
    }
  }

  function setBody(body: string) {
    profile.value.body = body
  }

  function setBodyType(bodyType: BodyType) {
    profile.value.bodyType = bodyType
  }

  function setAuth(auth: AuthConfig) {
    profile.value.auth = auth
  }

  function reset() {
    profile.value = defaultProfile()
  }

  function mergePartial(partial: Partial<RequestProfile>) {
    profile.value = { ...profile.value, ...partial }
  }

  return {
    profile: readonly(profile),
    setMethod,
    setUrl,
    setHeaders,
    setQueryParams,
    setBody,
    setBodyType,
    setAuth,
    reset,
    mergePartial,
    makeRow,
  }
}

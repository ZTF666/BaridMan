import type { HistoryEntry, RequestProfile } from '~/types'

const STORAGE_KEY = 'baridman_history'
const MAX_ENTRIES = 20

const history = ref<HistoryEntry[]>([])

function loadFromStorage(): HistoryEntry[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function save() {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
}

export function useHistory() {
  onMounted(() => {
    history.value = loadFromStorage()
  })

  function push(profile: RequestProfile) {
    const label = `${profile.method} ${profile.url}`
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label,
      profile: JSON.parse(JSON.stringify(profile)),
    }
    history.value = [entry, ...history.value].slice(0, MAX_ENTRIES)
    save()
  }

  function remove(id: string) {
    history.value = history.value.filter(e => e.id !== id)
    save()
  }

  function clear() {
    history.value = []
    save()
  }

  return {
    history: readonly(history),
    push,
    remove,
    clear,
  }
}

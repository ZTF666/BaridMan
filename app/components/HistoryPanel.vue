<script setup lang="ts">
import type { HistoryEntry } from '~/types'
import { useHistory } from '~/composables/useHistory'

const emit = defineEmits<{ restore: [entry: HistoryEntry] }>()

const { history, remove, clear } = useHistory()

const open = ref(false)

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const methodColor: Record<string, string> = {
  GET: 'text-green-400',
  POST: 'text-blue-400',
  PUT: 'text-yellow-400',
  PATCH: 'text-orange-400',
  DELETE: 'text-red-400',
  HEAD: 'text-purple-400',
  OPTIONS: 'text-zinc-400',
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :class="[
        'px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5',
        open ? 'text-zinc-200 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
      ]"
      @click="open = !open"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      History
      <span v-if="history.length" class="text-xs text-zinc-500">({{ history.length }})</span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 z-40"
        @click="open = false"
      />
      <div
        v-if="open"
        class="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-96 max-h-[70vh] flex flex-col"
        style="top: 56px; right: 16px;"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 class="text-sm font-medium text-zinc-200">Request History</h2>
          <div class="flex items-center gap-2">
            <button
              v-if="history.length"
              type="button"
              class="text-xs text-zinc-500 hover:text-red-400 transition-colors"
              @click="clear"
            >
              Clear all
            </button>
            <button type="button" class="text-zinc-500 hover:text-zinc-200" @click="open = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div v-if="!history.length" class="flex-1 flex items-center justify-center text-sm text-zinc-600 p-8">
          No requests yet. Send one to start building history.
        </div>

        <div v-else class="flex-1 overflow-auto">
          <div
            v-for="entry in history"
            :key="entry.id"
            class="group flex items-start gap-3 px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors"
          >
            <button
              type="button"
              class="flex-1 text-left min-w-0"
              @click="emit('restore', entry); open = false"
            >
              <div class="flex items-center gap-2 mb-0.5">
                <span :class="['text-xs font-bold font-mono', methodColor[entry.profile.method] ?? 'text-zinc-400']">
                  {{ entry.profile.method }}
                </span>
                <span class="text-xs text-zinc-500">{{ formatDate(entry.timestamp) }} {{ formatTime(entry.timestamp) }}</span>
              </div>
              <span class="text-sm text-zinc-300 truncate block">{{ entry.profile.url }}</span>
            </button>
            <button
              type="button"
              class="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all flex-shrink-0 mt-1"
              @click="remove(entry.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

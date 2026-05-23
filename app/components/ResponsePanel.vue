<script setup lang="ts">
import type { HttpResponse } from '~/types'

const props = defineProps<{
  response: HttpResponse | null
  loading: boolean
}>()

const headersOpen = ref(false)

const statusClass = computed(() => {
  if (!props.response) return ''
  const s = props.response.status
  if (s >= 200 && s < 300) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (s >= 300 && s < 400) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (s >= 400 && s < 500) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  if (s >= 500) return 'bg-red-500/20 text-red-400 border-red-500/30'
  return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
})

const prettyBody = computed(() => {
  if (!props.response?.body) return ''
  try {
    return JSON.stringify(JSON.parse(props.response.body), null, 2)
  } catch {
    return props.response.body
  }
})

const isJson = computed(() => {
  if (!props.response?.body) return false
  try { JSON.parse(props.response.body); return true } catch { return false }
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3 text-zinc-400">
        <div class="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        <span class="text-sm">Sending request…</span>
      </div>
    </div>

    <div v-else-if="!response" class="flex-1 flex items-center justify-center text-zinc-600 text-sm">
      Send a request to see the response.
    </div>

    <div v-else class="flex-1 flex flex-col gap-4 overflow-auto">
      <!-- Status bar -->
      <div class="flex items-center gap-3 flex-wrap">
        <span :class="['px-2.5 py-0.5 rounded border text-sm font-mono font-medium', statusClass]">
          {{ response.status }} {{ response.statusText }}
        </span>
        <span v-if="response.error" class="text-red-400 text-sm">{{ response.error }}</span>
        <span class="text-zinc-500 text-sm ml-auto">{{ response.durationMs }}ms</span>
      </div>

      <!-- Error notice -->
      <div v-if="response.error" class="bg-red-500/10 border border-red-500/30 rounded p-3 text-sm text-red-300">
        <strong class="block mb-1">Request Failed</strong>
        {{ response.error }}
        <p v-if="response.error.toLowerCase().includes('cors') || response.error.toLowerCase().includes('fetch')" class="mt-2 text-red-400/80">
          This may be a CORS error. Requests fire from your browser — the target server must allow cross-origin requests.
        </p>
      </div>

      <!-- Response body -->
      <div v-if="response.body" class="flex-1 flex flex-col min-h-0">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-zinc-500 uppercase tracking-wider">Body</span>
          <span v-if="isJson" class="text-xs text-zinc-600">JSON</span>
        </div>
        <pre class="flex-1 overflow-auto bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-200 font-mono whitespace-pre-wrap break-words">{{ prettyBody }}</pre>
      </div>

      <!-- Response headers -->
      <div>
        <button
          type="button"
          class="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          @click="headersOpen = !headersOpen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" :class="['w-3 h-3 transition-transform', headersOpen ? 'rotate-90' : '']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          Response Headers ({{ Object.keys(response.headers).length }})
        </button>
        <div v-if="headersOpen" class="mt-2 border border-zinc-800 rounded overflow-hidden">
          <div
            v-for="(val, key) in response.headers"
            :key="key"
            class="flex text-xs border-b border-zinc-800 last:border-0"
          >
            <span class="px-3 py-1.5 text-zinc-400 font-mono bg-zinc-800/50 w-1/3 truncate">{{ key }}</span>
            <span class="px-3 py-1.5 text-zinc-300 font-mono flex-1 break-all">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseCurl } from '~/utils/curlParser'
import type { RequestProfile } from '~/types'

const emit = defineEmits<{
  import: [partial: Partial<RequestProfile>]
}>()

const open = ref(false)
const input = ref('')
const error = ref('')

function onImport() {
  error.value = ''
  const result = parseCurl(input.value)
  if (!result.url) {
    error.value = 'Could not parse a URL from this curl command.'
    return
  }
  emit('import', result)
  open.value = false
  input.value = ''
}
</script>

<template>
  <div>
    <button
      type="button"
      class="px-3 py-1.5 rounded text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
      @click="open = true"
    >
      Import cURL
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        @click.self="open = false"
      >
        <div class="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-xl flex flex-col">
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h2 class="text-sm font-medium text-zinc-200">Import from cURL</h2>
            <button type="button" class="text-zinc-500 hover:text-zinc-200" @click="open = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-4 space-y-3">
            <textarea
              v-model="input"
              placeholder="curl -X POST https://api.example.com/data \&#10;  -H &quot;Content-Type: application/json&quot; \&#10;  -d '{&quot;key&quot;: &quot;value&quot;}'"
              class="w-full h-36 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 font-mono focus:outline-none focus:border-zinc-500 resize-none"
              spellcheck="false"
            />
            <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
          </div>
          <div class="px-4 py-3 border-t border-zinc-800 flex justify-end gap-2">
            <button type="button" class="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200" @click="open = false">Cancel</button>
            <button
              type="button"
              class="px-4 py-1.5 rounded text-sm font-medium bg-zinc-600 hover:bg-zinc-500 text-white transition-colors"
              @click="onImport"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

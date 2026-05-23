<script setup lang="ts">
import type { RequestProfile } from '~/types'
import { exportToN8n } from '~/utils/n8nExporter'

const props = defineProps<{ profile: RequestProfile }>()

const copied = ref(false)
const showPreview = ref(false)
const fallbackVisible = ref(false)
const fallbackTextarea = ref<HTMLTextAreaElement | null>(null)

const disabled = computed(() => !props.profile.url.trim())

const exportedJson = computed(() => exportToN8n(props.profile))

async function onExport() {
  showPreview.value = true
}

async function copyToClipboard() {
  const json = exportedJson.value
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(json)
    } else {
      fallbackVisible.value = true
      await nextTick()
      fallbackTextarea.value?.select()
      document.execCommand('copy')
    }
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    fallbackVisible.value = true
  }
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'px-4 py-2 rounded text-sm font-medium transition-colors',
        disabled
          ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          : 'bg-orange-600 hover:bg-orange-500 text-white'
      ]"
      @click="onExport"
    >
      Export to n8n
    </button>

    <!-- Preview modal -->
    <Teleport to="body">
      <div
        v-if="showPreview"
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        @click.self="showPreview = false"
      >
        <div class="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-2xl flex flex-col max-h-[80vh]">
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h2 class="text-sm font-medium text-zinc-200">n8n HTTP Request Node JSON</h2>
            <button type="button" class="text-zinc-500 hover:text-zinc-200" @click="showPreview = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="px-4 py-2 bg-zinc-800/50 border-b border-zinc-800 text-xs text-zinc-400">
            Copy → open n8n workflow canvas → <kbd class="px-1 py-0.5 bg-zinc-700 rounded text-zinc-300">Ctrl+V</kbd> to paste as a node. Do not paste into the cURL import field inside a node.
          </div>
          <pre class="flex-1 overflow-auto p-4 text-sm text-zinc-300 font-mono whitespace-pre">{{ exportedJson }}</pre>
          <div class="px-4 py-3 border-t border-zinc-800 flex justify-end gap-2">
            <button type="button" class="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200" @click="showPreview = false">Close</button>
            <button
              type="button"
              :class="['px-4 py-1.5 rounded text-sm font-medium transition-colors', copied ? 'bg-green-600 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white']"
              @click="copyToClipboard"
            >
              {{ copied ? 'Copied!' : 'Copy to Clipboard' }}
            </button>
          </div>

          <textarea
            v-if="fallbackVisible"
            ref="fallbackTextarea"
            :value="exportedJson"
            class="sr-only"
            readonly
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

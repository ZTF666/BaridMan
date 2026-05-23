<script setup lang="ts">
import type { BodyType } from '~/types'

const props = defineProps<{
  body: string
  bodyType: BodyType
}>()

const emit = defineEmits<{
  'update:body': [value: string]
  'update:bodyType': [value: BodyType]
}>()

const bodyTypes: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'form', label: 'Form URL-encoded' },
]

const placeholder = computed(() =>
  props.bodyType === 'json' ? '{\n  "key": "value"\n}' : 'key=value&other=123'
)
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <button
        v-for="bt in bodyTypes"
        :key="bt.value"
        type="button"
        :class="[
          'px-3 py-1 rounded text-sm transition-colors',
          bodyType === bt.value
            ? 'bg-zinc-600 text-white'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        ]"
        @click="emit('update:bodyType', bt.value)"
      >
        {{ bt.label }}
      </button>
    </div>

    <div v-if="bodyType !== 'none'">
      <textarea
        :value="body"
        :placeholder="placeholder"
        class="w-full h-48 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 font-mono focus:outline-none focus:border-zinc-500 resize-y"
        spellcheck="false"
        @input="emit('update:body', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <p v-else class="text-sm text-zinc-500">No request body.</p>
  </div>
</template>

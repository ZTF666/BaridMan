<script setup lang="ts">
import type { KeyValueRow } from '~/types'

const props = defineProps<{
  rows: KeyValueRow[]
  placeholder?: string
}>()

const emit = defineEmits<{
  update: [rows: KeyValueRow[]]
}>()

function makeRow(): KeyValueRow {
  return { id: crypto.randomUUID(), key: '', value: '', enabled: true }
}

function ensureTrailingEmpty(rows: KeyValueRow[]): KeyValueRow[] {
  const last = rows[rows.length - 1]
  if (!last || last.key || last.value) return [...rows, makeRow()]
  return rows
}

const localRows = ref<KeyValueRow[]>(ensureTrailingEmpty(props.rows))

watch(() => props.rows, (val) => {
  localRows.value = ensureTrailingEmpty(val)
}, { deep: true })

function onRowChange(index: number, field: 'key' | 'value', val: string) {
  const updated = localRows.value.map((r, i) => i === index ? { ...r, [field]: val } : r)
  localRows.value = ensureTrailingEmpty(updated)
  emit('update', localRows.value.filter(r => r.key || r.value))
}

function toggleRow(index: number) {
  const updated = localRows.value.map((r, i) => i === index ? { ...r, enabled: !r.enabled } : r)
  localRows.value = updated
  emit('update', updated.filter(r => r.key || r.value))
}

function deleteRow(index: number) {
  const updated = localRows.value.filter((_, i) => i !== index)
  localRows.value = ensureTrailingEmpty(updated)
  emit('update', localRows.value.filter(r => r.key || r.value))
}
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="(row, index) in localRows"
      :key="row.id"
      class="flex items-center gap-2"
    >
      <button
        type="button"
        :title="row.enabled ? 'Disable' : 'Enable'"
        :class="[
          'w-4 h-4 rounded-sm border flex-shrink-0 transition-colors',
          row.enabled ? 'bg-green-500 border-green-500' : 'border-zinc-600 bg-transparent'
        ]"
        @click="toggleRow(index)"
      />
      <input
        :value="row.key"
        :placeholder="placeholder ? `${placeholder} key` : 'Key'"
        class="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        @input="onRowChange(index, 'key', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="row.value"
        :placeholder="placeholder ? `${placeholder} value` : 'Value'"
        class="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        @input="onRowChange(index, 'value', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        title="Delete"
        class="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"
        @click="deleteRow(index)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  </div>
</template>

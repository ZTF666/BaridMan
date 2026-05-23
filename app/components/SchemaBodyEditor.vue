<script setup lang="ts">
import type { SchemaField, FieldType } from '~/types'

const props = defineProps<{ fields: SchemaField[] }>()
const emit = defineEmits<{ update: [fields: SchemaField[]] }>()

const fieldTypes: FieldType[] = ['string', 'number', 'boolean', 'date']

function makeField(): SchemaField {
  return { id: crypto.randomUUID(), name: '', type: 'string', value: '' }
}

function ensureTrailing(fields: SchemaField[]): SchemaField[] {
  const last = fields[fields.length - 1]
  if (!last || last.name) return [...fields, makeField()]
  return fields
}

const local = ref<SchemaField[]>(ensureTrailing(props.fields))

watch(() => props.fields, (val) => {
  local.value = ensureTrailing(val)
}, { deep: true })

function update(index: number, patch: Partial<SchemaField>) {
  const updated = local.value.map((f, i) => i === index ? { ...f, ...patch } : f)
  // reset value when type changes
  if (patch.type) updated[index].value = ''
  local.value = ensureTrailing(updated)
  emit('update', local.value.filter(f => f.name))
}

function remove(index: number) {
  const updated = local.value.filter((_, i) => i !== index)
  local.value = ensureTrailing(updated)
  emit('update', local.value.filter(f => f.name))
}

function importCsv(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const text = ev.target?.result as string
    const firstLine = text.split('\n')[0]
    const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const fields: SchemaField[] = headers
      .filter(h => h)
      .map(h => {
        // detect type hints like "amount(number)" or "is_active(boolean)"
        const match = h.match(/^(.+?)\((\w+)\)$/)
        const name = match ? match[1].trim() : h
        const type = (['string','number','boolean','date'].includes(match?.[2] ?? ''))
          ? match![2] as FieldType
          : 'string'
        return { id: crypto.randomUUID(), name, type, value: '' }
      })
    local.value = ensureTrailing(fields)
    emit('update', local.value.filter(f => f.name))
  }
  reader.readAsText(file)
  ;(e.target as HTMLInputElement).value = ''
}

// computed JSON preview
const jsonPreview = computed(() => {
  const obj: Record<string, unknown> = {}
  for (const f of local.value) {
    if (!f.name || f.value === '') continue
    if (f.type === 'number') obj[f.name] = Number(f.value)
    else if (f.type === 'boolean') obj[f.name] = f.value === 'true'
    else obj[f.name] = f.value
  }
  return JSON.stringify(obj, null, 2)
})
</script>

<template>
  <div class="space-y-3">
    <!-- CSV import -->
    <div class="flex items-center gap-2">
      <label class="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700 cursor-pointer transition-colors">
        Import CSV schema
        <input type="file" accept=".csv" class="sr-only" @change="importCsv" />
      </label>
      <span class="text-xs text-zinc-600">or define fields manually</span>
    </div>

    <!-- Field table -->
    <div class="space-y-1">
      <div class="grid grid-cols-[1fr_120px_1fr_24px] gap-2 text-xs text-zinc-500 px-1 mb-1">
        <span>Field name</span><span>Type</span><span>Value</span><span />
      </div>

      <div
        v-for="(field, index) in local"
        :key="field.id"
        class="grid grid-cols-[1fr_120px_1fr_24px] gap-2 items-center"
      >
        <!-- Name -->
        <input
          :value="field.name"
          placeholder="field_name"
          class="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          @input="update(index, { name: ($event.target as HTMLInputElement).value })"
        />

        <!-- Type -->
        <select
          :value="field.type"
          class="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500"
          @change="update(index, { type: ($event.target as HTMLSelectElement).value as FieldType })"
        >
          <option v-for="t in fieldTypes" :key="t" :value="t">{{ t }}</option>
        </select>

        <!-- Value — input type changes by field type -->
        <select
          v-if="field.type === 'boolean'"
          :value="field.value"
          class="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
          @change="update(index, { value: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">— pick —</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
        <input
          v-else
          :value="field.value"
          :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
          placeholder="value"
          class="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          @input="update(index, { value: ($event.target as HTMLInputElement).value })"
        />

        <!-- Delete -->
        <button
          type="button"
          class="text-zinc-600 hover:text-red-400 transition-colors"
          @click="remove(index)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- JSON preview -->
    <div v-if="jsonPreview !== '{}'">
      <p class="text-xs text-zinc-500 mb-1">Generated body</p>
      <pre class="bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-300 font-mono overflow-auto max-h-36">{{ jsonPreview }}</pre>
    </div>
  </div>
</template>

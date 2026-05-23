<script setup lang="ts">
import type { AuthConfig, AuthType } from '~/types'

const props = defineProps<{ auth: AuthConfig }>()
const emit = defineEmits<{ update: [auth: AuthConfig] }>()

const authTypes: { value: AuthType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'apiKey', label: 'API Key' },
]

function setType(type: AuthType) {
  emit('update', { ...props.auth, type })
}

function set(field: keyof AuthConfig, value: string) {
  emit('update', { ...props.auth, [field]: value })
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="at in authTypes"
        :key="at.value"
        type="button"
        :class="[
          'px-3 py-1 rounded text-sm transition-colors',
          auth.type === at.value
            ? 'bg-zinc-600 text-white'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        ]"
        @click="setType(at.value)"
      >
        {{ at.label }}
      </button>
    </div>

    <div v-if="auth.type === 'bearer'" class="space-y-2">
      <label class="block text-xs text-zinc-400">Bearer Token</label>
      <input
        :value="auth.bearerToken ?? ''"
        type="password"
        placeholder="eyJhbGci..."
        class="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        @input="set('bearerToken', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div v-else-if="auth.type === 'basic'" class="space-y-2">
      <label class="block text-xs text-zinc-400">Username</label>
      <input
        :value="auth.basicUsername ?? ''"
        type="text"
        placeholder="username"
        class="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        @input="set('basicUsername', ($event.target as HTMLInputElement).value)"
      />
      <label class="block text-xs text-zinc-400">Password</label>
      <input
        :value="auth.basicPassword ?? ''"
        type="password"
        placeholder="••••••••"
        class="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        @input="set('basicPassword', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div v-else-if="auth.type === 'apiKey'" class="space-y-2">
      <label class="block text-xs text-zinc-400">Header Name</label>
      <input
        :value="auth.apiKeyName ?? ''"
        type="text"
        placeholder="X-API-Key"
        class="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        @input="set('apiKeyName', ($event.target as HTMLInputElement).value)"
      />
      <label class="block text-xs text-zinc-400">API Key Value</label>
      <input
        :value="auth.apiKeyValue ?? ''"
        type="password"
        placeholder="••••••••"
        class="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        @input="set('apiKeyValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <p v-else class="text-sm text-zinc-500">No authentication.</p>
  </div>
</template>

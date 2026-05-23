<script setup lang="ts">
import type { HttpMethod } from '~/types'
import { useRequestProfile } from '~/composables/useRequestProfile'
import { useHttpSender } from '~/composables/useHttpSender'

const { profile, setMethod, setUrl, setHeaders, setQueryParams, setBody, setBodyType, setAuth, mergePartial } = useRequestProfile()
const { send, loading, response } = useHttpSender()

defineExpose({ response, loading })

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

type Tab = 'params' | 'headers' | 'body' | 'auth'
const activeTab = ref<Tab>('params')

const methodColors: Record<HttpMethod, string> = {
  GET: 'text-green-400',
  POST: 'text-blue-400',
  PUT: 'text-yellow-400',
  PATCH: 'text-orange-400',
  DELETE: 'text-red-400',
  HEAD: 'text-purple-400',
  OPTIONS: 'text-zinc-400',
}

async function onSend() {
  await send(profile.value)
}
</script>

<template>
  <div class="flex flex-col h-full gap-4">
    <!-- URL bar -->
    <div class="flex gap-2">
      <select
        :value="profile.method"
        :class="['bg-zinc-800 border border-zinc-700 rounded px-2 py-2 text-sm font-semibold focus:outline-none focus:border-zinc-500', methodColors[profile.method]]"
        @change="setMethod(($event.target as HTMLSelectElement).value as HttpMethod)"
      >
        <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
      </select>

      <input
        :value="profile.url"
        type="url"
        placeholder="https://api.example.com/endpoint"
        class="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        @input="setUrl(($event.target as HTMLInputElement).value)"
      />

      <button
        type="button"
        :disabled="!profile.url.trim() || loading"
        :class="[
          'px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap',
          !profile.url.trim() || loading
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        ]"
        @click="onSend"
      >
        {{ loading ? 'Sending…' : 'Send' }}
      </button>
    </div>

    <!-- CORS notice -->
    <p class="text-xs text-zinc-600">
      Requests fire from your browser. CORS errors are enforced by the target server.
    </p>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-zinc-800">
      <button
        v-for="tab in (['params', 'headers', 'body', 'auth'] as Tab[])"
        :key="tab"
        type="button"
        :class="[
          'px-3 py-2 text-sm capitalize transition-colors border-b-2 -mb-px',
          activeTab === tab
            ? 'border-blue-500 text-zinc-100'
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
        ]"
        @click="activeTab = tab"
      >
        {{ tab === 'params' ? 'Params' : tab === 'auth' ? 'Auth' : tab.charAt(0).toUpperCase() + tab.slice(1) }}
        <span
          v-if="tab === 'auth' && profile.auth.type !== 'none'"
          class="ml-1 w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"
        />
      </button>
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-auto">
      <KeyValueEditor
        v-if="activeTab === 'params'"
        :rows="profile.queryParams"
        placeholder="Query param"
        @update="setQueryParams"
      />
      <KeyValueEditor
        v-else-if="activeTab === 'headers'"
        :rows="profile.headers"
        placeholder="Header"
        @update="setHeaders"
      />
      <BodyEditor
        v-else-if="activeTab === 'body'"
        :body="profile.body"
        :body-type="profile.bodyType"
        @update:body="setBody"
        @update:body-type="setBodyType"
      />
      <AuthEditor
        v-else-if="activeTab === 'auth'"
        :auth="profile.auth"
        @update="setAuth"
      />
    </div>

    <!-- Bottom action bar -->
    <div class="flex items-center gap-3 pt-2 border-t border-zinc-800">
      <ExportButton :profile="profile" />
      <CurlImportModal @import="mergePartial" />
    </div>
  </div>
</template>

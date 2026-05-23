<script setup lang="ts">
import { useHttpSender } from '~/composables/useHttpSender'

const { response, loading } = useHttpSender()
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
    <!-- Header -->
    <header class="border-b border-zinc-800 px-6 py-3 flex items-center gap-3">
      <span class="text-orange-400 font-bold tracking-tight text-lg">BaridMan</span>
      <span class="text-zinc-600 text-sm">HTTP client → n8n node exporter</span>
    </header>

    <!-- Main two-column layout -->
    <main class="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <!-- Left: Request Builder -->
      <section class="lg:w-1/2 lg:border-r border-zinc-800 p-4 flex flex-col overflow-auto">
        <RequestBuilder />
      </section>

      <!-- Right: Response Panel -->
      <section class="lg:w-1/2 p-4 flex flex-col overflow-auto border-t lg:border-t-0 border-zinc-800">
        <ResponsePanel :response="response" :loading="loading" />
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-zinc-800 px-6 py-2 flex items-center justify-end">
      <span class="text-xs text-zinc-600">
        made by
        <a
          href="https://github.com/ZTF666"
          target="_blank"
          rel="noopener noreferrer"
          class="text-zinc-400 hover:text-orange-400 transition-colors ml-1"
        >ZTF</a>
      </span>
    </footer>
  </div>
</template>

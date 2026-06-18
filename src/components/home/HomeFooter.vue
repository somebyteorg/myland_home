<script setup lang="ts">
defineProps<{
  versionText: string
}>()
</script>

<template>
  <footer class="bg-gradient-to-br from-[#5FA35F] to-[#4A8A4A] px-8 pb-6 pt-16 text-center text-white">
    <div class="mx-auto max-w-7xl">
      <h3 class="mb-5 text-3xl font-bold">寻找开发者、设计师与玩家</h3>
      <p class="mb-7 text-lg leading-[1.8] text-white/95">让我们一起共建这个世界</p>

      <div class="mt-6 flex flex-col items-center justify-center gap-3 md:flex-row md:gap-8">
        <a href="https://t.me/soby_myland" class="footer-link" target="_blank" rel="noreferrer">Telegram</a>
        <a href="https://postman.com/somebyteorg/myland" class="footer-link" target="_blank" rel="noreferrer">API
          文档</a>
        <a href="https://github.com/orgs/somebyteorg" class="footer-link" target="_blank" rel="noreferrer">GitHub</a>
      </div>

      <div class="mx-auto mb-5 mt-8 h-0.5 w-16 rounded bg-white/30"></div>

      <p class="mb-2 text-sm text-white/80">© 2026 一亩三分地</p>
      <p class="text-sm text-white/80">{{ versionText }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  border-bottom: 2px solid transparent;
  padding-bottom: 3px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.footer-link:hover {
  border-bottom-color: white;
  opacity: 1;
  transform: translateY(-2px);
}
</style>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
      type="button"
      class="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-[#5FA35F] text-xl text-white shadow-[0_4px_16px_rgba(95,163,95,0.3)] transition md:bottom-8 md:right-8 md:h-12 md:w-12"
      :class="visible ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-5 opacity-0'"
      aria-label="返回顶部"
      @click="emit('click')"
  >
    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">
      <path d="m6 15 6-6 6 6"/>
    </svg>
  </button>
</template>

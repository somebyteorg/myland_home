<script setup lang="ts">
import {features, iconPaths} from './homeContent'
</script>

<template>
  <section id="features"
           class="features-section relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F0F4F0] to-[#E8F5E8] px-5 py-20">
    <div class="pointer-events-none absolute inset-0 opacity-80 pattern-grid"></div>

    <div class="relative z-10 mb-16 text-center">
      <h2 class="mb-6 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.4] text-[#2C2C2C]">没有 NPC，只有玩家</h2>
      <p class="mx-auto max-w-4xl text-[clamp(1.05rem,2.5vw,1.35rem)] leading-[1.9] text-[#666]">
        每个故事都由玩家创造，每个选择都将塑造世界。<br/>
        选择你的玩法，也是在回答：你会成为怎样的人？
      </p>
    </div>

    <div class="relative z-10 grid w-full max-w-7xl grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:gap-6 lg:grid-cols-5">
      <article
          v-for="feature in features"
          :key="feature.title"
          class="group relative overflow-hidden rounded-lg border border-[#5FA35F]/15 bg-white px-5 py-7 text-center shadow-[0_4px_20px_rgba(95,163,95,0.1)] transition duration-300 hover:-translate-y-2 hover:border-[#5FA35F]/35 hover:shadow-[0_16px_40px_rgba(95,163,95,0.2)] md:px-7 md:py-9"
      >
        <svg
            class="mx-auto mb-5 h-14 w-14 text-[#5FA35F] drop-shadow-[0_2px_8px_rgba(95,163,95,0.18)] transition duration-300 group-hover:scale-110 md:h-16 md:w-16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
          <path v-for="path in iconPaths[feature.icon]" :key="path" :d="path"/>
        </svg>
        <h3 class="mb-3 text-xl font-bold text-[#2C2C2C] md:text-2xl">{{ feature.title }}</h3>
        <p class="whitespace-nowrap text-sm font-medium leading-snug text-[#4a8ab5] md:text-base">{{ feature.role }}</p>
      </article>
    </div>

    <p class="relative z-10 mt-14 text-center text-[clamp(1.2rem,2.8vw,1.6rem)] font-semibold text-[#4a8ab5]">
      答案，由你亲手写下。</p>
  </section>
</template>

<style scoped>
.pattern-grid {
  background-image: radial-gradient(circle, rgba(95, 163, 95, 0.08) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: moveBackground 20s linear infinite;
}

@keyframes moveBackground {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(50px, 50px);
  }
}
</style>

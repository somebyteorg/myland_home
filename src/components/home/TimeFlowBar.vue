<script setup lang="ts">
import type {TimeFlowStep} from '@/types/home'

defineProps<{
  steps: TimeFlowStep[]
}>()
</script>

<template>
  <div class="rounded-lg bg-white/55 px-4 py-3 shadow-[0_10px_28px_rgba(54,84,58,0.06)] backdrop-blur">
    <div class="flex flex-col gap-3 md:flex-row md:items-center">
      <div class="shrink-0">
        <p class="text-xs font-bold tracking-[0.18em] text-[#5FA35F]">时间流速</p>
      </div>
      <div class="time-flow-track grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
        <div
            v-for="step in steps"
            :key="step.real"
            class="time-flow-step relative px-3 py-2"
        >
          <div class="time-flow-dot"></div>
          <p class="text-xs font-semibold text-[#748071]">{{ step.real }}</p>
          <p class="mt-1 text-base font-extrabold text-[#253126]">{{ step.game }}</p>
          <p class="text-xs font-bold text-[#4F7F52]">{{ step.note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-flow-track {
  position: relative;
}

.time-flow-track::before {
  content: '';
  position: absolute;
  left: 1.5rem;
  right: 1.5rem;
  top: 50%;
  height: 2px;
  background: linear-gradient(90deg, rgba(95, 163, 95, 0.16), rgba(74, 138, 181, 0.32), rgba(95, 163, 95, 0.16));
  transform: translateY(-50%);
}

.time-flow-step {
  isolation: isolate;
}

.time-flow-step::before {
  content: '';
  position: absolute;
  inset: 0.35rem 0.15rem;
  z-index: -1;
  border-radius: 0.5rem;
  background: rgba(250, 252, 248, 0.88);
  box-shadow: 0 8px 20px rgba(54, 84, 58, 0.05);
}

.time-flow-dot {
  position: absolute;
  left: 0;
  top: 50%;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #5FA35F;
  box-shadow: 0 0 0 5px rgba(95, 163, 95, 0.12);
  transform: translate(-0.2rem, -50%);
}

@media (max-width: 639px) {
  .time-flow-track::before {
    inset: 1.2rem auto 1.2rem 0.65rem;
    width: 2px;
    height: auto;
    transform: none;
  }

  .time-flow-dot {
    left: 0.65rem;
  }

  .time-flow-step {
    padding-left: 1.6rem;
  }
}
</style>

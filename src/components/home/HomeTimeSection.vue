<script setup lang="ts">
import type {TimeInfo} from '@/types/home'
import {iconPaths, seasons, timeEvents, timeScaleItems} from './homeContent'

defineProps<{
  currentTime: TimeInfo | null
  currentSeason: string
  currentSeasonHour: string
  currentSeasonHourIndex: number
  seasonProgress: number
  seasonDayProgressText: string
  seasonHourCalendar: Array<{ value: string; label: string }>
  timeDiffText: string
}>()
</script>

<template>
  <section id="time"
           class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5F9F5] to-[#E8F3E8] px-5 py-20">
    <div class="mx-auto max-w-4xl text-center">
      <h2 class="mb-6 text-[clamp(2.5rem,6vw,3.8rem)] font-extrabold text-[#2C2C2C]">时间，在这里流转不息</h2>
      <p class="text-[clamp(1.15rem,2.5vw,1.5rem)] leading-[1.8] text-[#666]">即使你离线，世界依然继续运转。</p>
    </div>

    <div
        class="relative z-10 mt-12 flex w-full max-w-7xl flex-col items-center justify-center gap-10 lg:mt-16 lg:flex-row lg:items-start lg:gap-20">
      <div class="w-full max-w-xl flex-[1.1] lg:max-w-none">
        <div class="mb-12 flex flex-col border-l-[3px] border-[#5FA35F]/30 pl-8">
          <div
              v-for="item in timeScaleItems"
              :key="item.real"
              class="time-scale-item relative flex flex-wrap items-center gap-3 py-4 text-[clamp(1.1rem,2.2vw,1.35rem)]"
          >
            <span class="font-bold text-[#2C2C2C]">{{ item.real }}</span>
            <span class="text-[#5FA35F]">→</span>
            <span class="font-semibold text-[#4a8ab5]">{{ item.game }}</span>
          </div>
        </div>

        <div>
          <p class="mb-5 text-[clamp(1.1rem,2.2vw,1.3rem)] font-bold text-[#2C2C2C]">当你离线时，世界正在发生：</p>
          <div>
            <div class="flex flex-col gap-4">
              <div
                  v-for="(event, index) in timeEvents"
                  :key="`${event.text}-${index}`"
                  class="time-event relative flex shrink-0 items-center gap-3 rounded-lg border border-[#5FA35F]/15 bg-white/75 px-5 py-4 text-base leading-relaxed text-[#666] transition hover:translate-x-2 hover:border-[#5FA35F]/30 hover:bg-white/95 hover:shadow-[0_4px_20px_rgba(95,163,95,0.15)] md:text-lg"
              >
                <svg class="h-5 w-5 shrink-0 text-[#5FA35F]" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path v-for="path in iconPaths[event.icon]" :key="path" :d="path"/>
                </svg>
                <span>{{ event.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="order-first flex w-full flex-1 items-start justify-center lg:order-none lg:justify-end">
        <div
            class="time-panel w-full max-w-[560px] rounded-lg border border-white/80 bg-gradient-to-br from-white/95 via-white/90 to-[#F7FBF7]/90 p-6 shadow-[0_22px_60px_rgba(57,91,61,0.14)] ring-1 ring-[#5FA35F]/10 backdrop-blur-md md:p-8">
          <div class="mb-7 flex items-start justify-between gap-4 border-b border-[#E8E4D8] pb-6">
            <div>
              <p class="text-base font-medium text-[#5FA35F]">当前地元历</p>
              <p class="mt-2 text-3xl font-extrabold text-[#2C2C2C] md:text-4xl">地元 {{ currentTime?.year ?? '-' }}
                年</p>
            </div>
          </div>

          <div class="mb-8">
            <div class="mb-4 flex items-center justify-between">
              <p class="text-base font-bold text-[#2C2C2C]">四季</p>
            </div>
            <div class="grid grid-cols-4 gap-3 md:gap-4">
              <div
                  v-for="season in seasons"
                  :key="season.name"
                  class="rounded-lg border px-3 py-4 text-center text-lg font-bold shadow-sm transition md:py-5 md:text-xl"
                  :class="currentSeason === season.name ? season.tone : 'border-[#E8E4D8] bg-white/70 text-[#999]'"
              >
                {{ season.label }}
              </div>
            </div>
            <div class="relative mt-5 h-9 overflow-hidden rounded-full bg-[#E8E4D8] shadow-inner">
              <div class="h-full rounded-full bg-[#5FA35F] transition-all duration-500"
                   :style="{width: `${seasonProgress}%`}"></div>
              <p class="absolute inset-0 grid place-items-center text-sm font-bold text-[#2C2C2C] md:text-base">
                {{ seasonDayProgressText }}</p>
            </div>
            <p v-if="timeDiffText" class="mt-3 text-sm font-medium text-[#777]">{{ timeDiffText }}</p>
          </div>

          <div>
            <div class="mb-4 flex items-start justify-between gap-4">
              <p class="text-base font-bold text-[#2C2C2C]">时辰</p>
            </div>
            <div class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:gap-2.5">
              <div
                  v-for="(hour, index) in seasonHourCalendar"
                  :key="hour.value"
                  class="rounded-lg border px-2 py-3 text-center text-sm font-semibold transition md:py-3.5 md:text-base"
                  :class="currentSeasonHour === hour.value ? 'border-[#5FA35F] bg-[#5FA35F] text-white shadow-[0_8px_20px_rgba(95,163,95,0.26)]' : currentSeasonHourIndex > index ? 'border-[#5FA35F]/20 bg-[#5FA35F]/10 text-[#5FA35F]' : 'border-[#E8E4D8] bg-white/75 text-[#888]'"
              >
                {{ hour.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.time-scale-item::before {
  content: '';
  position: absolute;
  left: -2.1rem;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #5FA35F;
  box-shadow: 0 0 0 5px rgba(95, 163, 95, 0.15);
  transform: translateY(-50%);
}

.time-event::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 0.5rem 0 0 0.5rem;
  background: #5FA35F;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.time-event:hover::before {
  transform: scaleY(1);
}
</style>

<script setup lang="ts">
import type {SeasonHourItem, TimeFlowStep, TimeInfo} from '@/types/home'
import ChroniclePanel from './ChroniclePanel.vue'
import TimeCalendarPanel from './TimeCalendarPanel.vue'
import TimeFlowBar from './TimeFlowBar.vue'

defineProps<{
  currentTime: TimeInfo | null
  currentSeason: string
  currentSeasonHour: string
  currentSeasonHourIndex: number
  seasonProgress: number
  seasonDayProgressText: string
  seasonHourCalendar: SeasonHourItem[]
  timeDiffText: string
}>()

const timeFlowSteps: TimeFlowStep[] = [
  {real: '现实 1 小时', game: '地元 1 日', note: '360 tick'},
  {real: '现实 1 天', game: '地元 1 季', note: '24 日'},
  {real: '现实 4 天', game: '地元 1 年', note: '春夏秋冬'},
]
</script>

<template>
  <section id="time"
           class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F3F7F1] px-4 py-14 sm:px-5 md:py-20">
    <div class="pointer-events-none absolute inset-0 opacity-70 time-field"></div>

    <div class="relative z-10 mx-auto max-w-4xl text-center">
      <p class="mb-3 text-sm font-bold tracking-[0.22em] text-[#5FA35F]">WORLD TIME</p>
      <h2 class="text-[clamp(2.2rem,5.4vw,3.6rem)] font-extrabold leading-tight text-[#253126]">时间，在这里流转不息</h2>
      <p class="mx-auto mt-4 max-w-2xl text-[clamp(1rem,2.2vw,1.28rem)] leading-[1.75] text-[#5A665C] md:mt-5 md:leading-[1.8]">即使你离线，村庄仍按自己的节奏留下记录。</p>
    </div>

    <div
        class="relative z-10 mt-8 w-full max-w-7xl md:mt-10 lg:mt-12">
      <div class="mb-4 md:mb-5">
        <TimeFlowBar :steps="timeFlowSteps"/>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(520px,1.02fr)] lg:gap-7">
        <ChroniclePanel/>
        <TimeCalendarPanel
            :current-time="currentTime"
            :current-season="currentSeason"
            :current-season-hour="currentSeasonHour"
            :current-season-hour-index="currentSeasonHourIndex"
            :season-progress="seasonProgress"
            :season-day-progress-text="seasonDayProgressText"
            :season-hour-calendar="seasonHourCalendar"
            :time-diff-text="timeDiffText"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.time-field {
  background-image:
      linear-gradient(rgba(95, 163, 95, 0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(95, 163, 95, 0.07) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(circle at center, black, transparent 78%);
}
</style>

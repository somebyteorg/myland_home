<script setup lang="ts">
import type {SeasonHourItem, TimeInfo} from '@/types/home'
import {seasons} from './homeContent'

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
</script>

<template>
  <div class="flex w-full min-w-0 items-start justify-center">
    <div
        class="time-panel flex w-full flex-col rounded-lg border border-white/80 bg-gradient-to-br from-white/95 via-white/90 to-[#F7FBF7]/90 p-5 shadow-[0_22px_60px_rgba(57,91,61,0.14)] ring-1 ring-[#5FA35F]/10 backdrop-blur-md md:p-8 lg:h-[660px]">
      <div class="mb-6 flex items-start justify-between gap-4 border-b border-[#E8E4D8] pb-5 md:mb-7 md:pb-6">
        <div>
          <p class="text-base font-medium text-[#5FA35F]">当前地元历</p>
          <p class="mt-2 text-2xl font-extrabold text-[#2C2C2C] md:text-4xl">地元 {{ currentTime?.year ?? '-' }}
            年</p>
        </div>
      </div>

      <div class="mb-7 md:mb-8">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-base font-bold text-[#2C2C2C]">四季</p>
        </div>
        <div class="grid grid-cols-4 gap-3 md:gap-4">
          <div
              v-for="season in seasons"
              :key="season.name"
              class="rounded-lg border px-3 py-4 text-center text-lg font-bold shadow-sm transition md:py-6 md:text-2xl lg:py-7"
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

      <div class="flex-1">
        <div class="mb-4 flex items-start justify-between gap-4">
          <p class="text-base font-bold text-[#2C2C2C]">时辰</p>
        </div>
        <div class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:gap-3">
          <div
              v-for="(hour, index) in seasonHourCalendar"
              :key="hour.value"
              class="rounded-lg border px-2 py-3 text-center text-sm font-semibold transition sm:py-4 md:py-5 md:text-base lg:py-6"
              :class="currentSeasonHour === hour.value ? 'border-[#5FA35F] bg-[#5FA35F] text-white shadow-[0_8px_20px_rgba(95,163,95,0.26)]' : currentSeasonHourIndex > index ? 'border-[#5FA35F]/20 bg-[#5FA35F]/10 text-[#5FA35F]' : 'border-[#E8E4D8] bg-white/75 text-[#888]'"
          >
            {{ hour.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import type {TimeInfo} from '@/types/home'
import api from '@/utils/ky'
import {seasons} from './homeContent'

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

interface ChronicleItem {
  event_id: number
  text: string
  tick_format: {
    string: string
  }
}

interface ChronicleResponse {
  page: number
  page_size: number
  total: number
  items: ChronicleItem[]
}

const CHRONICLE_PAGE_SIZE = 5
const timeFlowSteps = [
  {real: '现实 1 小时', game: '地元 1 日', note: '360 tick'},
  {real: '现实 1 天', game: '地元 1 季', note: '24 日'},
  {real: '现实 4 天', game: '地元 1 年', note: '春夏秋冬'},
]

const chronicleItems = ref<ChronicleItem[]>([])
const chroniclePage = ref(1)
const chronicleTotal = ref(0)
const chronicleLoading = ref(false)
const chronicleInitialized = ref(false)
const chronicleError = ref('')

const chronicleHasMore = computed(() => chronicleItems.value.length < chronicleTotal.value)
const chronicleCanLoad = computed(() => chronicleHasMore.value || Boolean(chronicleError.value))
const chronicleCountText = computed(() => {
  if (!chronicleTotal.value) {
    return '0 条'
  }

  return `${chronicleItems.value.length} / ${chronicleTotal.value} 条`
})

async function loadChronicle(page = 1) {
  if (chronicleLoading.value) {
    return
  }

  chronicleLoading.value = true
  chronicleError.value = ''

  try {
    const response = await api.get('api/common/chronicle', {
      searchParams: {
        action_type: 'village',
        action_id: '11',
        page: String(page),
        page_size: String(CHRONICLE_PAGE_SIZE),
      },
    }).json<ChronicleResponse>()

    chroniclePage.value = response.page
    chronicleTotal.value = response.total

    if (page === 1) {
      chronicleItems.value = response.items ?? []
    } else {
      chronicleItems.value = [...chronicleItems.value, ...(response.items ?? [])]
    }
  } catch {
    chronicleError.value = page === 1 ? '编年史暂时无法载入' : '加载失败，请稍后重试'
  } finally {
    chronicleLoading.value = false
    chronicleInitialized.value = true
  }
}

function loadMoreChronicle() {
  if (!chronicleCanLoad.value || chronicleLoading.value) {
    return
  }

  void loadChronicle(chronicleError.value ? chroniclePage.value : chroniclePage.value + 1)
}

onMounted(() => {
  void loadChronicle()
})
</script>

<template>
  <section id="time"
           class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F3F7F1] px-5 py-18 md:py-20">
    <div class="pointer-events-none absolute inset-0 opacity-70 time-field"></div>

    <div class="relative z-10 mx-auto max-w-4xl text-center">
      <p class="mb-3 text-sm font-bold tracking-[0.22em] text-[#5FA35F]">WORLD TIME</p>
      <h2 class="text-[clamp(2.2rem,5.4vw,3.6rem)] font-extrabold leading-tight text-[#253126]">时间，在这里流转不息</h2>
      <p class="mx-auto mt-5 max-w-2xl text-[clamp(1rem,2.2vw,1.28rem)] leading-[1.8] text-[#5A665C]">即使你离线，村庄仍按自己的节奏留下记录。</p>
    </div>

    <div
        class="relative z-10 mt-10 w-full max-w-7xl lg:mt-12">
      <div class="mb-5 rounded-lg bg-white/55 px-4 py-3 shadow-[0_10px_28px_rgba(54,84,58,0.06)] backdrop-blur">
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <div class="shrink-0">
            <p class="text-xs font-bold tracking-[0.18em] text-[#5FA35F]">时间流速</p>
          </div>
          <div class="time-flow-track grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
            <div
                v-for="step in timeFlowSteps"
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

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(520px,1.02fr)] lg:gap-7">
        <div class="min-h-0 rounded-lg border border-[#DDE8D8] bg-[#FBFCF7] shadow-[0_16px_44px_rgba(54,84,58,0.10)] lg:h-[660px]">
          <div class="flex items-center justify-between gap-4 border-b border-[#E2ECDD] px-5 py-4 md:px-6">
            <div>
              <p class="text-sm font-bold text-[#5FA35F]">编年史</p>
              <h3 class="mt-1 text-2xl font-extrabold text-[#253126]">村庄纪事</h3>
            </div>
            <span class="shrink-0 rounded-full bg-[#EFF6EE] px-3 py-1 text-sm font-bold text-[#60715F]">
              {{ chronicleCountText }}
            </span>
          </div>

          <div class="chronicle-scroll h-[420px] overflow-y-auto overscroll-contain px-5 py-5 md:h-[500px] md:px-6 lg:h-[566px]">
            <div v-if="chronicleItems.length" class="chronicle-timeline flex flex-col gap-3">
              <div
                  v-for="event in chronicleItems"
                  :key="event.event_id"
                  class="chronicle-item relative rounded-lg border border-[#E3EBDD] bg-white px-4 py-4 shadow-sm transition hover:border-[#B8D5B8] hover:shadow-[0_10px_26px_rgba(65,95,66,0.12)]"
              >
                <p class="mb-2 text-xs font-bold tracking-wide text-[#6A8F6A]">{{ event.tick_format.string }}</p>
                <p class="text-base font-semibold leading-relaxed text-[#2F382F]">{{ event.text }}</p>
              </div>
            </div>

            <div v-else-if="chronicleLoading && !chronicleInitialized" class="flex h-full items-center justify-center">
              <p class="text-sm font-semibold text-[#6B786B]">编年史载入中...</p>
            </div>

            <div v-else class="flex h-full items-center justify-center rounded-lg border border-dashed border-[#C9D9C5] bg-white/55 px-5 text-center">
              <p class="text-sm font-semibold text-[#6B786B]">{{ chronicleError || '暂无编年史记录' }}</p>
            </div>

            <div v-if="chronicleItems.length || chronicleError" class="mt-5 flex justify-center">
              <button
                  type="button"
                  class="rounded-full border border-[#9FBE9C] bg-white px-5 py-2.5 text-sm font-bold text-[#3F7D3D] shadow-sm transition hover:border-[#5FA35F] hover:bg-[#F2FAF2] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="chronicleLoading || !chronicleCanLoad"
                  @click="loadMoreChronicle"
              >
                <span v-if="chronicleLoading">加载中...</span>
                <span v-else-if="chronicleError">重试</span>
                <span v-else-if="chronicleHasMore">加载更多</span>
                <span v-else>已全部载入</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex w-full min-w-0 items-start justify-center">
          <div
              class="time-panel flex w-full flex-col rounded-lg border border-white/80 bg-gradient-to-br from-white/95 via-white/90 to-[#F7FBF7]/90 p-6 shadow-[0_22px_60px_rgba(57,91,61,0.14)] ring-1 ring-[#5FA35F]/10 backdrop-blur-md md:p-8 lg:h-[660px]">
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
                    class="rounded-lg border px-3 py-5 text-center text-xl font-bold shadow-sm transition md:py-6 md:text-2xl lg:py-7"
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
              <div class="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:gap-3">
                <div
                    v-for="(hour, index) in seasonHourCalendar"
                    :key="hour.value"
                    class="rounded-lg border px-2 py-4 text-center text-sm font-semibold transition md:py-5 md:text-base lg:py-6"
                    :class="currentSeasonHour === hour.value ? 'border-[#5FA35F] bg-[#5FA35F] text-white shadow-[0_8px_20px_rgba(95,163,95,0.26)]' : currentSeasonHourIndex > index ? 'border-[#5FA35F]/20 bg-[#5FA35F]/10 text-[#5FA35F]' : 'border-[#E8E4D8] bg-white/75 text-[#888]'"
                >
                  {{ hour.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
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

.chronicle-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(95, 163, 95, 0.55) rgba(226, 236, 221, 0.75);
}

.chronicle-scroll::-webkit-scrollbar {
  width: 10px;
}

.chronicle-scroll::-webkit-scrollbar-track {
  background: rgba(226, 236, 221, 0.75);
  border-radius: 999px;
}

.chronicle-scroll::-webkit-scrollbar-thumb {
  background: rgba(95, 163, 95, 0.55);
  border: 2px solid rgba(226, 236, 221, 0.75);
  border-radius: 999px;
}

.chronicle-timeline {
  position: relative;
}

.chronicle-timeline::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0.6rem;
  width: 2px;
  background: linear-gradient(to bottom, rgba(95, 163, 95, 0), rgba(95, 163, 95, 0.5), rgba(95, 163, 95, 0));
}

.chronicle-item {
  margin-left: 1.8rem;
}

.chronicle-item::before {
  content: '';
  position: absolute;
  left: -1.52rem;
  top: 1.35rem;
  width: 0.72rem;
  height: 0.72rem;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #5FA35F;
  box-shadow: 0 0 0 4px rgba(95, 163, 95, 0.16);
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

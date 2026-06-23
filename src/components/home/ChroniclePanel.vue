<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import api from '@/utils/ky'
import type {ChronicleItem, ChronicleResponse} from '@/types/home'

const CHRONICLE_PAGE_SIZE = 5

const chronicleItems = ref<ChronicleItem[]>([])
const chroniclePage = ref(1)
const chronicleTotal = ref(0)
const chronicleLoading = ref(false)
const chronicleRefreshing = ref(false)
const chronicleInitialized = ref(false)
const chronicleError = ref('')
const chronicleFailedPage = ref<number | null>(null)

const chronicleHasMore = computed(() => chronicleItems.value.length < chronicleTotal.value)
const chronicleCanLoad = computed(() => chronicleHasMore.value || Boolean(chronicleError.value))
const chronicleCountText = computed(() => {
  if (!chronicleTotal.value) {
    return '0 条'
  }

  return `${chronicleItems.value.length} / ${chronicleTotal.value} 条`
})

async function loadChronicle(page = 1, options: {refresh?: boolean} = {}) {
  if (chronicleLoading.value) {
    return
  }

  chronicleLoading.value = true
  chronicleRefreshing.value = Boolean(options.refresh)
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
    chronicleFailedPage.value = null

    if (page === 1) {
      chronicleItems.value = response.items ?? []
    } else {
      chronicleItems.value = [...chronicleItems.value, ...(response.items ?? [])]
    }
  } catch {
    chronicleFailedPage.value = page
    chronicleError.value = page === 1 ? '编年史暂时无法载入' : '加载失败，请稍后重试'
  } finally {
    chronicleLoading.value = false
    chronicleRefreshing.value = false
    chronicleInitialized.value = true
  }
}

function loadMoreChronicle() {
  if (!chronicleCanLoad.value || chronicleLoading.value) {
    return
  }

  void loadChronicle(chronicleFailedPage.value ?? chroniclePage.value + 1)
}

function refreshChronicle() {
  void loadChronicle(1, {refresh: true})
}

onMounted(() => {
  void loadChronicle()
})
</script>

<template>
  <div class="min-h-0 rounded-lg border border-[#DDE8D8] bg-[#FBFCF7] shadow-[0_16px_44px_rgba(54,84,58,0.10)] lg:h-[660px]">
    <div class="flex items-center justify-between gap-4 border-b border-[#E2ECDD] px-5 py-4 md:px-6">
      <div>
        <p class="text-sm font-bold text-[#5FA35F]">编年史</p>
        <h3 class="mt-1 text-2xl font-extrabold text-[#253126]">村庄纪事</h3>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <span class="rounded-full bg-[#EFF6EE] px-3 py-1 text-sm font-bold text-[#60715F]">
          {{ chronicleCountText }}
        </span>
        <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full border border-[#C9DCC6] bg-white text-base font-bold leading-none text-[#4F8E4D] shadow-sm transition hover:border-[#5FA35F] hover:bg-[#F2FAF2] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="chronicleLoading"
            title="刷新"
            aria-label="刷新村庄纪事"
            @click="refreshChronicle"
        >
          <span class="sr-only">刷新</span>
          <span aria-hidden="true" class="inline-block" :class="chronicleRefreshing ? 'animate-spin' : ''">↻</span>
        </button>
      </div>
    </div>

    <div class="chronicle-scroll h-[min(420px,62vh)] overflow-y-auto overscroll-contain px-4 py-4 md:h-[500px] md:px-6 md:py-5 lg:h-[566px]">
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
</template>

<style scoped>
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
</style>

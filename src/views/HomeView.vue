<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useClipboard} from '@vueuse/core'
import api from '@/utils/ky'
import useSignStore, {type UserInfo} from '@/stores/sign'
import HomeBackToTop from '@/components/home/HomeBackToTop.vue'
import HomeFeaturesSection from '@/components/home/HomeFeaturesSection.vue'
import HomeFooter from '@/components/home/HomeFooter.vue'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
import HomeNav from '@/components/home/HomeNav.vue'
import HomeTimeSection from '@/components/home/HomeTimeSection.vue'
import PlayerDialog from '@/components/home/PlayerDialog.vue'
import TokenDialog from '@/components/home/TokenDialog.vue'
import {
  heroPlayObjects,
  heroPlayPositionSlots,
  seasonDayCount,
  seasonHours,
} from '@/components/home/homeContent'
import type {TimeInfo, VersionInfo, VisibleHeroPlayObject, WeatherItem, WeatherName} from '@/types/home'

const sign = useSignStore()

const navScrolled = ref(false)
const showBackToTop = ref(false)
const heroOpacity = ref(1)
const profileOpen = ref(false)
const mobileMenuOpen = ref(false)
const copyFeedback = ref('')
const tokenDialogOpen = ref(false)
const playerDialogOpen = ref(false)
const unbindTelegramDialogOpen = ref(false)
const unbindingTelegram = ref(false)
const unbindCancelButtonRef = ref<HTMLButtonElement | null>(null)
const currentTime = ref<TimeInfo | null>(null)
const version = ref<VersionInfo | null>(null)
const activeWeather = ref<WeatherName>('sunny')
const weatherItems = ref<WeatherItem[]>([])
const visibleHeroPlayObjects = ref<VisibleHeroPlayObject[]>([])

let ticking = false
let copyFeedbackTimer: number | undefined
const {copy: copyToClipboard, isSupported: clipboardSupported} = useClipboard()

const displayName = computed(() => sign.username || '已登录')
const currentTimeText = computed(() => currentTime.value?.string || '地元历加载中')
const timeDiffText = computed(() => {
  const diffHour = currentTime.value?.diff_hour

  if (!diffHour) {
    return ''
  }

  if (diffHour === 0) {
    return '天数换算基准：与现实时间一致'
  }

  return `天数换算基准：现实时间 ${diffHour > 0 ? '+' : ''}${diffHour} 小时`
})
const versionText = computed(() => {
  if (!version.value) {
    return '版本加载中'
  }

  return `v${version.value.number} · 更新于 ${version.value.time}`
})
const isTestServer = computed(() => Boolean(version.value?.is_test))
const currentSeason = computed(() => currentTime.value?.season || '')
const seasonProgress = computed(() => {
  const day = currentTime.value?.day || 0
  return Math.min(100, Math.max(0, Math.round((day / seasonDayCount) * 100)))
})
const currentSeasonDay = computed(() => currentTime.value?.day || 0)
const currentSeasonHour = computed(() => currentTime.value?.hour || '')
const currentSeasonHourIndex = computed(() => seasonHours.findIndex((hour) => hour.value === currentSeasonHour.value))
const seasonDayProgressText = computed(() => `第 ${currentSeasonDay.value || '-'} / ${seasonDayCount} 天`)
const seasonHourCalendar = computed(() => {
  const currentHour = currentSeasonHour.value

  if (!currentHour || seasonHours.some((hour) => hour.value === currentHour)) {
    return seasonHours
  }

  return [...seasonHours, {value: currentHour, label: currentSeasonHour.value}]
})

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function buildWeatherItems(weather: WeatherName) {
  if (weather === 'spring-rain') {
    return Array.from({length: 30}, () => ({
      className: 'raindrop',
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 1.5}s`,
        animationDuration: `${randomBetween(1.2, 1.8)}s`,
      },
    }))
  }

  if (weather === 'heavy-rain') {
    return Array.from({length: 50}, () => ({
      className: 'raindrop',
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.6}s`,
        animationDuration: `${randomBetween(0.4, 0.8)}s`,
      },
    }))
  }

  if (weather === 'thunderstorm') {
    const rain = Array.from({length: 60}, () => ({
      className: 'raindrop',
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${randomBetween(0.3, 0.7)}s`,
      },
    }))

    return [
      ...rain,
      {
        className: 'lightning',
        style: {
          left: `${randomBetween(30, 70)}%`,
        },
      },
    ]
  }

  if (weather === 'sunny') {
    const sparkles = Array.from({length: 10}, () => ({
      className: 'sparkle',
      style: {
        left: `${randomBetween(20, 80)}%`,
        top: `${randomBetween(10, 50)}%`,
        animationDelay: `${Math.random() * 3}s`,
      },
    }))

    return [{className: 'sun-ray', style: {}}, ...sparkles]
  }

  if (weather === 'drought') {
    return [{className: 'heatwave', style: {}}]
  }

  return Array.from({length: 6}, () => {
    const size = randomBetween(200, 500)

    return {
      className: 'fog',
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${randomBetween(15, 25)}s`,
      },
    }
  })
}

function initWeather() {
  const weathers: WeatherName[] = ['spring-rain', 'heavy-rain', 'sunny', 'drought', 'mist', 'thunderstorm']
  const weather = weathers[Math.floor(Math.random() * weathers.length)]
  activeWeather.value = weather
  weatherItems.value = buildWeatherItems(weather)
}

function initHeroPlayObjects() {
  const count = Math.random() > 0.5 ? 2 : 1
  const selectedObjects = [...heroPlayObjects].sort(() => Math.random() - 0.5).slice(0, count)
  const sides: Array<keyof typeof heroPlayPositionSlots> =
      count === 2 ? (Math.random() > 0.5 ? ['left', 'right'] : ['right', 'left']) : [Math.random() > 0.5 ? 'left' : 'right']

  visibleHeroPlayObjects.value = selectedObjects.map((object, index) => ({
    ...object,
    className: `${object.sizeClass} ${heroPlayPositionSlots[sides[index]][Math.floor(Math.random() * heroPlayPositionSlots[sides[index]].length)]}`,
  }))
}

async function loadCommonTime() {
  try {
    currentTime.value = await api.get('api/common/time').json<TimeInfo>()
  } catch {
    currentTime.value = null
  }
}

async function loadVersion() {
  try {
    version.value = await api.get('api/common/version').json<VersionInfo>()
  } catch {
    version.value = null
  }
}

async function loadUserInfo() {
  if (!sign.user_token) {
    return
  }

  try {
    const info = await api.get('api/user/info').json<UserInfo>()
    sign.setUserInfo(info)
  } catch {
    // 401 会在 ky hook 中统一清理登录态，其余错误保持当前页面可用。
  }
}

function signIn() {
  window.location.assign('/api/sign')
}

function openTokenDialog() {
  tokenDialogOpen.value = true
  profileOpen.value = false
  mobileMenuOpen.value = false
  copyFeedback.value = ''
}

function closeTokenDialog() {
  tokenDialogOpen.value = false
}

function openPlayerDialog() {
  playerDialogOpen.value = true
  profileOpen.value = false
  mobileMenuOpen.value = false
}

function closePlayerDialog() {
  playerDialogOpen.value = false
}

async function signOut() {
  closePlayerDialog()
  profileOpen.value = false
  mobileMenuOpen.value = false
  await sign.signOut()
}

function bindTelegram() {
  profileOpen.value = false
  mobileMenuOpen.value = false

  if (sign.telegram_bind_url) {
    window.open(sign.telegram_bind_url, '_blank', 'noopener,noreferrer')
  }
}

function openUnbindTelegramDialog() {
  unbindTelegramDialogOpen.value = true
  profileOpen.value = false
  mobileMenuOpen.value = false

  // 下一帧设置焦点
  requestAnimationFrame(() => {
    unbindCancelButtonRef.value?.focus()
  })
}

function closeUnbindTelegramDialog() {
  unbindTelegramDialogOpen.value = false
}

async function confirmUnbindTelegram() {
  unbindingTelegram.value = true

  try {
    await api.delete('api/user/telegram')
    await loadUserInfo()
    closeUnbindTelegramDialog()
  } catch {
    // 错误处理已在 ky hook 中统一处理
  } finally {
    unbindingTelegram.value = false
  }
}

async function copyToken() {
  const token = sign.user_token

  if (!token) {
    openTokenDialog()
    return
  }

  try {
    if (!clipboardSupported.value) {
      throw new Error('Clipboard API unavailable')
    }

    await copyToClipboard(token)
    copyFeedback.value = '已复制'
    window.clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = window.setTimeout(() => {
      copyFeedback.value = ''
    }, 1800)
    mobileMenuOpen.value = false
  } catch {
    openTokenDialog()
  }
}

function scrollToTop() {
  window.scrollTo({top: 0, behavior: 'smooth'})
}

function onScroll() {
  if (ticking) {
    return
  }

  ticking = true
  window.requestAnimationFrame(() => {
    const scrolled = window.scrollY
    const viewportHeight = window.innerHeight

    navScrolled.value = scrolled > 80
    showBackToTop.value = scrolled > viewportHeight * 0.6

    // 优化：只在需要时计算透明度
    if (scrolled < viewportHeight) {
      heroOpacity.value = 1 - (scrolled / viewportHeight) * 0.5
    } else if (heroOpacity.value !== 0.5) {
      heroOpacity.value = 0.5
    }

    ticking = false
  })
}

function closeMenus() {
  profileOpen.value = false
  mobileMenuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return
  }

  if (tokenDialogOpen.value) {
    closeTokenDialog()
    return
  }

  if (playerDialogOpen.value) {
    closePlayerDialog()
    return
  }

  if (unbindTelegramDialogOpen.value) {
    closeUnbindTelegramDialog()
    return
  }

  closeMenus()
}

onMounted(() => {
  initWeather()
  initHeroPlayObjects()
  void loadCommonTime()
  void loadVersion()
  void loadUserInfo()
  onScroll()
  window.addEventListener('scroll', onScroll, {passive: true})
  window.addEventListener('click', closeMenus)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('click', closeMenus)
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(copyFeedbackTimer)
})
</script>

<template>
  <main
      class="min-h-dvh overflow-x-hidden bg-[#FAF8F2] text-[#2C2C2C] opacity-0 animate-[pageLoad_0.8s_ease-out_0.1s_forwards]"
  >
    <HomeNav
        :nav-scrolled="navScrolled"
        :is-signed-in="sign.isSignedIn"
        :is-test-server="isTestServer"
        :display-name="displayName"
        :avatar="sign.avatar"
        :profile-open="profileOpen"
        :mobile-menu-open="mobileMenuOpen"
        :copy-feedback="copyFeedback"
        :telegram-user-id="sign.telegram_user_id"
        :telegram-bind-url="sign.telegram_bind_url"
        @sign-in="signIn"
        @copy-token="copyToken"
        @sign-out="signOut"
        @bind-telegram="bindTelegram"
        @unbind-telegram="openUnbindTelegramDialog"
        @toggle-profile="profileOpen = !profileOpen"
        @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen"
        @close-mobile-menu="mobileMenuOpen = false"
    />

    <HomeHeroSection
        :active-weather="activeWeather"
        :hero-opacity="heroOpacity"
        :current-time-text="currentTimeText"
        :weather-items="weatherItems"
        :visible-hero-play-objects="visibleHeroPlayObjects"
        @play="openPlayerDialog"
    />

    <HomeFeaturesSection/>

    <HomeTimeSection
        :current-time="currentTime"
        :current-season="currentSeason"
        :current-season-hour="currentSeasonHour"
        :current-season-hour-index="currentSeasonHourIndex"
        :season-progress="seasonProgress"
        :season-day-progress-text="seasonDayProgressText"
        :season-hour-calendar="seasonHourCalendar"
        :time-diff-text="timeDiffText"
    />

    <HomeFooter :version-text="versionText"/>

    <HomeBackToTop :visible="showBackToTop" @click="scrollToTop"/>

    <TokenDialog :open="tokenDialogOpen" :token="sign.user_token" @close="closeTokenDialog"/>
    <PlayerDialog
        :open="playerDialogOpen"
        :token="sign.user_token"
        :is-test-server="isTestServer"
        @close="closePlayerDialog"
        @sign-in="signIn"
    />

    <Teleport to="body">
      <div
          v-if="unbindTelegramDialogOpen"
          class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unbind-telegram-title"
          @click.self="closeUnbindTelegramDialog"
      >
        <div class="w-full max-w-md rounded-lg bg-[#FAF8F2] shadow-[0_22px_64px_rgba(0,0,0,0.26)]" tabindex="-1">
          <div class="border-b border-[#E8E4D8] bg-white px-5 py-4">
            <h2 id="unbind-telegram-title" class="text-xl font-extrabold text-[#2C2C2C]">确认解绑 Telegram</h2>
          </div>
          <div class="px-5 py-5">
            <p class="text-sm leading-relaxed text-[#666]">解绑后将无法使用 Telegram 模式游玩。</p>
            <div class="mt-5 flex justify-end gap-3">
              <button
                  ref="unbindCancelButtonRef"
                  type="button"
                  class="rounded-full border border-[#E8E4D8] px-5 py-2 text-sm font-semibold text-[#2C2C2C] transition hover:border-[#5FA35F]"
                  :disabled="unbindingTelegram"
                  @click="closeUnbindTelegramDialog"
              >
                取消
              </button>
              <button
                  type="button"
                  class="rounded-full bg-[#B04444] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#953636] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="unbindingTelegram"
                  @click="confirmUnbindTelegram"
              >
                {{ unbindingTelegram ? '解绑中...' : '确认解绑' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted} from 'vue'
import HomeBackToTop from '@/components/home/HomeBackToTop.vue'
import HomeFeaturesSection from '@/components/home/HomeFeaturesSection.vue'
import HomeFooter from '@/components/home/HomeFooter.vue'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
import HomeNav from '@/components/home/HomeNav.vue'
import HomeTimeSection from '@/components/home/HomeTimeSection.vue'
import PlayerDialog from '@/components/home/PlayerDialog.vue'
import TokenDialog from '@/components/home/TokenDialog.vue'
import {useHomeHeroScene} from '@/composables/home/useHomeHeroScene'
import {useHomeMeta} from '@/composables/home/useHomeMeta'
import {useHomeScroll} from '@/composables/home/useHomeScroll'
import {useHomeSession} from '@/composables/home/useHomeSession'

const {
  currentTime,
  currentTimeText,
  timeDiffText,
  versionText,
  isTestServer,
  currentSeason,
  currentSeasonHour,
  currentSeasonHourIndex,
  seasonProgress,
  seasonDayProgressText,
  seasonHourCalendar,
  loadCommonTime,
  loadVersion,
} = useHomeMeta()

const {
  activeWeather,
  weatherItems,
  visibleHeroPlayObjects,
  initWeather,
  initHeroPlayObjects,
} = useHomeHeroScene()

const {
  navScrolled,
  showBackToTop,
  heroOpacity,
  scrollToTop,
  onScroll,
} = useHomeScroll()

const {
  sign,
  profileOpen,
  mobileMenuOpen,
  copyFeedback,
  tokenDialogOpen,
  playerDialogOpen,
  unbindTelegramDialogOpen,
  unbindingTelegram,
  unbindCancelButtonRef,
  displayName,
  loadUserInfo,
  signIn,
  closeTokenDialog,
  openPlayerDialog,
  closePlayerDialog,
  signOut,
  bindTelegram,
  openUnbindTelegramDialog,
  closeUnbindTelegramDialog,
  confirmUnbindTelegram,
  copyToken,
  closeMenus,
  clearCopyFeedbackTimer,
} = useHomeSession()

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
  clearCopyFeedbackTimer()
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

<script setup lang="ts">
import {computed, ref, watch} from 'vue'

const props = defineProps<{
  navScrolled: boolean
  isSignedIn: boolean
  isTestServer: boolean
  displayName: string
  avatar: string | null
  profileOpen: boolean
  mobileMenuOpen: boolean
  copyFeedback: string
  telegramUserId: string | null
  telegramBindUrl: string | null
}>()

const emit = defineEmits<{
  signIn: []
  copyToken: []
  signOut: []
  toggleProfile: []
  toggleMobileMenu: []
  closeMobileMenu: []
  bindTelegram: []
  unbindTelegram: []
}>()

const avatarLoadFailed = ref(false)

// 头像地址变化时重置加载失败状态，让新头像有机会重新加载。
watch(() => props.avatar, () => {
  avatarLoadFailed.value = false
})

const showAvatar = computed(() => Boolean(props.avatar) && !avatarLoadFailed.value)
const nameInitial = computed(() => props.displayName.slice(0, 1).toUpperCase())
</script>

<template>
  <nav
      class="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-3 transition-all duration-300 md:px-8 md:py-4"
      :class="navScrolled ? 'bg-[#FAF8F2]/90 shadow-[0_2px_16px_rgba(0,0,0,0.05)] backdrop-blur-xl' : 'bg-transparent'"
  >
    <a href="#hero"
       class="relative z-50 flex min-w-0 items-center gap-2 text-lg font-black tracking-wide text-[#2C2C2C] md:text-xl">
      <img src="/favicon.svg" alt="一亩三分地 Logo" class="h-8 w-8 md:h-[34px] md:w-[34px]"/>
      <span>一亩三分地</span>
      <span v-if="isTestServer" class="test-server-badge">测试服</span>
    </a>

    <div class="hidden items-center gap-7 md:flex">
      <a href="#features" class="nav-link">玩法</a>
      <a href="#time" class="nav-link">时间</a>
      <template v-if="!isSignedIn">
        <button type="button"
                class="rounded-full bg-[#5FA35F] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(95,163,95,0.25)] transition hover:-translate-y-0.5 hover:bg-[#4A8A4A]"
                @click="emit('signIn')">
          登录
        </button>
      </template>
      <div v-else class="relative" @click.stop>
        <button
            type="button"
            class="flex items-center gap-2 rounded-full border border-[#E8E4D8] bg-white/80 px-4 py-2 text-sm font-semibold text-[#2C2C2C] shadow-sm transition hover:border-[#5FA35F]"
            @click="emit('toggleProfile')"
        >
          <img
              v-if="showAvatar"
              :src="avatar!"
              alt=""
              class="h-6 w-6 rounded-full object-cover"
              @error="avatarLoadFailed = true"
          />
          <span v-else class="grid h-6 w-6 place-items-center rounded-full bg-[#5FA35F] text-xs text-white">{{
              nameInitial
            }}</span>
          <span>{{ displayName }}</span>
        </button>

        <div
            v-if="profileOpen"
            class="absolute right-0 mt-3 w-44 rounded-lg border border-[#E8E4D8] bg-white p-2 text-sm shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        >
          <button type="button" class="menu-button" @click="emit('copyToken')">复制 token</button>
          <button v-if="telegramUserId" type="button" class="menu-button" @click="emit('unbindTelegram')">解绑
            Telegram
          </button>
          <button v-else-if="telegramBindUrl" type="button" class="menu-button" @click="emit('bindTelegram')">绑定
            Telegram
          </button>
          <button type="button" class="menu-button text-[#B04444]" @click="emit('signOut')">退出登录</button>
          <p v-if="copyFeedback" class="px-3 pb-1 pt-2 text-xs text-[#5FA35F]">{{ copyFeedback }}</p>
        </div>
      </div>
    </div>

    <button
        type="button"
        class="relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
        aria-label="打开菜单"
        :aria-expanded="mobileMenuOpen"
        @click.stop="emit('toggleMobileMenu')"
    >
      <span class="h-0.5 w-5 rounded bg-[#2C2C2C] transition"
            :class="mobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''"></span>
      <span class="h-0.5 w-5 rounded bg-[#2C2C2C] transition" :class="mobileMenuOpen ? 'opacity-0' : ''"></span>
      <span class="h-0.5 w-5 rounded bg-[#2C2C2C] transition"
            :class="mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''"></span>
    </button>
  </nav>

  <div
      class="fixed inset-x-0 top-0 z-40 flex flex-col gap-1 bg-[#FAF8F2]/95 px-6 pb-6 pt-20 shadow-[0_2px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl transition duration-300 md:hidden"
      :class="mobileMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'"
      @click.stop
  >
    <a href="#features" class="mobile-link" @click="emit('closeMobileMenu')">玩法</a>
    <a href="#time" class="mobile-link" @click="emit('closeMobileMenu')">时间</a>
    <button v-if="!isSignedIn" type="button" class="mobile-link text-left font-bold text-[#5FA35F]"
            @click="emit('signIn')">登录
    </button>
    <template v-else>
      <div class="flex items-center gap-2 px-1 py-3">
        <img
            v-if="showAvatar"
            :src="avatar!"
            alt=""
            class="h-7 w-7 rounded-full object-cover"
            @error="avatarLoadFailed = true"
        />
        <span v-else class="grid h-7 w-7 place-items-center rounded-full bg-[#5FA35F] text-xs text-white">{{
            nameInitial
          }}</span>
        <p class="text-sm font-semibold text-[#2C2C2C]">{{ displayName }}</p>
      </div>
      <button type="button" class="mobile-link text-left" @click="emit('copyToken')">复制 token</button>
      <button v-if="telegramUserId" type="button" class="mobile-link text-left" @click="emit('unbindTelegram')">解绑
        Telegram
      </button>
      <button v-else-if="telegramBindUrl" type="button" class="mobile-link text-left" @click="emit('bindTelegram')">绑定
        Telegram
      </button>
      <button type="button" class="mobile-link text-left text-[#B04444]" @click="emit('signOut')">退出登录</button>
      <p v-if="copyFeedback" class="px-1 text-xs text-[#5FA35F]">{{ copyFeedback }}</p>
    </template>
  </div>
</template>

<style scoped>
.test-server-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(176, 68, 68, 0.26);
  border-radius: 999px;
  background: rgba(176, 68, 68, 0.09);
  padding: 0.18rem 0.5rem;
  color: #B04444;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
}

.nav-link {
  position: relative;
  color: #555;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 0;
  height: 2px;
  background: #5FA35F;
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #5FA35F;
}

.nav-link:hover::after {
  width: 100%;
}

.menu-button {
  display: block;
  width: 100%;
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
  text-align: left;
  transition: background 0.2s ease;
}

.menu-button:hover {
  background: rgba(95, 163, 95, 0.08);
}

.mobile-link {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0.9rem 0.25rem;
  color: #555;
  font-size: 1.05rem;
  font-weight: 500;
}
</style>

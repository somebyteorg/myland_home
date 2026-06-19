<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, ref, watch} from 'vue'
import {useClipboard} from '@vueuse/core'
import api from '@/utils/ky'
import useSignStore from '@/stores/sign'
import type {BirthIdentity, CreatePlayerGender, MapVillageItem, PlayerItem, PlayerListResponse} from '@/types/home'
import PlayerEditDialog from './PlayerEditDialog.vue'
import {birthIdentityOptions, genderOptions} from './homeContent'

const props = defineProps<{
  open: boolean
  isTestServer: boolean
}>()

const emit = defineEmits<{
  close: []
  signIn: []
}>()

const PLAYER_PAGE_SIZE = 5
const MAX_ALIVE_PLAYERS = 3
const sign = useSignStore()

const playerLoading = ref(false)
const playerCreating = ref(false)
const playerListError = ref('')
const playerCreateError = ref('')
const playerTotal = ref(0)
const playerPage = ref(1)
const players = ref<PlayerItem[]>([])
const copiedPlayerId = ref('')
const editOpen = ref(false)
const editingPlayer = ref<PlayerItem | null>(null)
const createPlayerOpen = ref(false)
const createNameInputRef = ref<HTMLInputElement | null>(null)
const createPlayerForm = ref<{ name: string; gender: CreatePlayerGender }>({
  name: '',
  gender: 'male',
})
const birthIdentity = ref<BirthIdentity>('child')
const selectedVillageId = ref<number | null>(null)
const villages = ref<MapVillageItem[]>([])
const villagesLoading = ref(false)
const villagesError = ref('')

const hasMorePlayers = computed(() => players.value.length < playerTotal.value)
const alivePlayersCount = computed(() => players.value.filter((p) => p.is_can_play).length)
const canCreatePlayer = computed(() => alivePlayersCount.value < MAX_ALIVE_PLAYERS)

let copiedPlayerIdTimer: number | undefined
const {copy: copyToClipboard, isSupported: clipboardSupported} = useClipboard()

watch(
    () => props.open,
    (open) => {
      if (open) {
        playerCreateError.value = ''
        copiedPlayerId.value = ''
        createPlayerOpen.value = false
        void loadPlayers()
        return
      }

      createPlayerOpen.value = false
      playerListError.value = ''
      playerCreateError.value = ''
      copiedPlayerId.value = ''
      editOpen.value = false
      editingPlayer.value = null
    },
)

function displayPlayerValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

function getDisabledReason(player: PlayerItem) {
  if (player.is_can_play) {
    return ''
  }

  if (player.reason_death) {
    return `角色已死亡：${player.reason_death}`
  }

  return '当前角色暂不可进入'
}

function getAgeText(player: PlayerItem) {
  const age = displayPlayerValue(player.tick_age_string)

  if (age === '-') {
    return '年龄未知'
  }

  return `${age} 岁`
}

function resetCreatePlayerForm() {
  createPlayerForm.value = {
    name: '',
    gender: 'male',
  }
  birthIdentity.value = 'child'
  selectedVillageId.value = villages.value[0]?.id ?? null
}

async function loadVillages() {
  if (villagesLoading.value) {
    return
  }

  villagesLoading.value = true
  villagesError.value = ''

  try {
    const result = await api
        .get('api/map/list', {
          searchParams: {
            map_type: 'village',
          },
        })
        .json<MapVillageItem[]>()

    villages.value = result || []

    if (selectedVillageId.value === null || !villages.value.some((village) => village.id === selectedVillageId.value)) {
      selectedVillageId.value = villages.value[0]?.id ?? null
    }
  } catch {
    villages.value = []
    selectedVillageId.value = null
    villagesError.value = '村庄列表加载失败，请稍后再试。'
  } finally {
    villagesLoading.value = false
  }
}

function openEditPlayer(player: PlayerItem) {
  if (!player.is_can_play) {
    return
  }

  editingPlayer.value = player
  editOpen.value = true
}

function onPlayerUpdated(updated: PlayerItem) {
  players.value = players.value.map((item) => (item.player_id === updated.player_id ? updated : item))
  editingPlayer.value = updated
}

async function loadPlayers(page = 1) {
  if (!sign.isSignedIn) {
    players.value = []
    playerTotal.value = 0
    playerPage.value = 1
    playerListError.value = '请先登录后查看角色列表。'
    return
  }

  playerLoading.value = true
  playerListError.value = ''

  try {
    const result = await api
        .get('api/player/list', {
          searchParams: {
            page,
            page_size: PLAYER_PAGE_SIZE,
          },
        })
        .json<PlayerListResponse>()

    const items = result.items || []
    players.value = page === 1 ? items : [...players.value, ...items]
    playerTotal.value = result.total || 0
    playerPage.value = result.page || page
  } catch {
    if (page === 1) {
      players.value = []
      playerTotal.value = 0
      playerPage.value = 1
    }
    playerListError.value = '角色列表加载失败，请稍后再试。'
  } finally {
    playerLoading.value = false
  }
}

async function loadMorePlayers() {
  if (playerLoading.value || !hasMorePlayers.value) {
    return
  }

  await loadPlayers(playerPage.value + 1)
}

function toggleCreatePlayerForm() {
  if (!sign.isSignedIn) {
    emit('signIn')
    return
  }

  createPlayerOpen.value = !createPlayerOpen.value
  playerCreateError.value = ''

  if (createPlayerOpen.value) {
    if (!villages.value.length) {
      void loadVillages()
    }

    void nextTick(() => {
      createNameInputRef.value?.focus()
    })
  }
}

async function createPlayer() {
  const name = createPlayerForm.value.name.trim()

  if (!name) {
    playerCreateError.value = '请输入姓名。'
    return
  }

  if ([...name].length > 30) {
    playerCreateError.value = '姓名不能超过 30 个字符。'
    return
  }

  if (!sign.isSignedIn) {
    playerCreateError.value = '请先登录后新增角色。'
    return
  }

  const isAdult = birthIdentity.value === 'adult'

  if (isAdult && selectedVillageId.value === null) {
    playerCreateError.value = '请选择出生村庄。'
    return
  }

  playerCreating.value = true
  playerCreateError.value = ''

  try {
    await api.post('api/player/create', {
      json: {
        name,
        gender: createPlayerForm.value.gender,
        village_id: isAdult ? selectedVillageId.value : null,
      },
    })

    resetCreatePlayerForm()
    createPlayerOpen.value = false
    await loadPlayers(1)
  } catch {
    playerCreateError.value = '新增角色失败，请稍后再试。'
  } finally {
    playerCreating.value = false
  }
}

function enterPlayerWorld(player: PlayerItem) {
  if (!player.is_can_play || !sign.user_token) {
    return
  }

  const token = encodeURIComponent(sign.user_token)
  const playerId = encodeURIComponent(player.player_id)
  window.open(`/web?token=${token}&player_id=${playerId}`, '_blank', 'noopener,noreferrer')
}

function handleRetryOrSignIn() {
  if (sign.isSignedIn) {
    void loadPlayers(players.value.length ? playerPage.value : 1)
    return
  }

  emit('signIn')
}

async function copyPlayerId(playerId: string) {
  try {
    if (!clipboardSupported.value) {
      throw new Error('Clipboard API unavailable')
    }

    await copyToClipboard(playerId)
    copiedPlayerId.value = playerId
    window.clearTimeout(copiedPlayerIdTimer)
    copiedPlayerIdTimer = window.setTimeout(() => {
      if (copiedPlayerId.value === playerId) {
        copiedPlayerId.value = ''
      }
    }, 1600)
  } catch {
    copiedPlayerId.value = ''
  }
}

onBeforeUnmount(() => {
  window.clearTimeout(copiedPlayerIdTimer)
})
</script>

<template>
  <Teleport to="body">
    <div
        v-if="open"
        class="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-dialog-title"
        @click.self="emit('close')"
    >
      <div class="my-auto w-full max-w-5xl rounded-lg bg-[#FAF8F2] shadow-[0_22px_64px_rgba(0,0,0,0.26)]">
        <div class="flex items-start justify-between gap-4 border-b border-[#E8E4D8] bg-white px-5 py-4 md:px-6">
          <div>
            <h2 id="player-dialog-title" class="text-xl font-extrabold text-[#2C2C2C] md:text-2xl">选择角色</h2>
            <p class="mt-1 text-sm text-[#777]">共 {{ playerTotal }} 个角色，当前显示 {{ players.length }} 个</p>
          </div>
          <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#E8E4D8] bg-white text-[#555] transition hover:border-[#5FA35F] hover:text-[#5FA35F]"
              aria-label="关闭角色选择"
              @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <div class="max-h-[min(70dvh,680px)] overflow-y-auto px-5 py-5 md:px-6">
          <div
              v-if="isTestServer"
              class="test-server-notice mb-5"
              role="status"
              aria-label="测试服提示：当前为测试服，数据可能随时清空"
          >
            <div class="test-server-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
                   stroke-linejoin="round">
                <path d="M12 3 2.8 19a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L12 3Z"/>
                <path d="M12 9v5"/>
                <path d="M12 18h.01"/>
              </svg>
            </div>
            <div class="test-server-copy">
              <strong>当前为测试服</strong>
              <span>功能和数值仍在调整，所有角色、资产与进度都可能随时清空。</span>
            </div>
          </div>

          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm leading-relaxed text-[#666]">
              {{ sign.isSignedIn ? '选择角色进入游戏世界，或创建一个新角色。' : '请先登录后查看角色，并在登录后创建新角色。' }}
            </p>
            <button
                v-if="sign.isSignedIn"
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-[#5FA35F] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(95,163,95,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4A8A4A] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="playerCreating || !canCreatePlayer"
                :title="!canCreatePlayer ? `当前角色数量已达上限（${MAX_ALIVE_PLAYERS} 个）` : ''"
                @click="toggleCreatePlayerForm"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </svg>
              <span>新增角色</span>
            </button>
          </div>

          <form
              v-if="createPlayerOpen && sign.isSignedIn"
              class="mb-5 rounded-lg border border-[#5FA35F]/20 bg-white p-4 shadow-[0_8px_24px_rgba(95,163,95,0.1)] md:p-5"
              @submit.prevent="createPlayer"
          >
            <fieldset class="m-0 min-w-0 border-0 p-0" :disabled="playerCreating">
              <div class="grid gap-4 md:grid-cols-[1.4fr_1fr]">
                <label class="block">
                  <span class="mb-2 block text-sm font-bold text-[#2C2C2C]">姓名</span>
                  <input
                      ref="createNameInputRef"
                      v-model.trim="createPlayerForm.name"
                      class="h-11 w-full rounded-lg border border-[#E8E4D8] bg-[#FAF8F2] px-4 text-sm text-[#2C2C2C] outline-none transition focus:border-[#5FA35F] focus:bg-white"
                      type="text"
                      maxlength="30"
                      required
                      autocomplete="off"
                      placeholder="建议输入中文姓名"
                  />
                </label>

                <div>
                  <span class="mb-2 block text-sm font-bold text-[#2C2C2C]">性别</span>
                  <div class="grid grid-cols-3 overflow-hidden rounded-lg border border-[#E8E4D8] bg-[#FAF8F2]">
                    <label
                        v-for="option in genderOptions"
                        :key="option.value"
                        class="cursor-pointer text-center text-sm font-semibold transition"
                        :class="createPlayerForm.gender === option.value ? 'bg-[#5FA35F] text-white' : 'text-[#666] hover:bg-white'"
                    >
                      <input v-model="createPlayerForm.gender" class="sr-only" type="radio" name="gender"
                             :value="option.value"/>
                      <span class="block px-3 py-3">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <span class="mb-2 block text-sm font-bold text-[#2C2C2C]">出生身份</span>
                <div class="grid max-w-xs grid-cols-2 overflow-hidden rounded-lg border border-[#E8E4D8] bg-[#FAF8F2]">
                  <label
                      v-for="option in birthIdentityOptions"
                      :key="option.value"
                      class="cursor-pointer text-center text-sm font-semibold transition"
                      :class="birthIdentity === option.value ? 'bg-[#5FA35F] text-white' : 'text-[#666] hover:bg-white'"
                  >
                    <input v-model="birthIdentity" class="sr-only" type="radio" name="birth-identity"
                           :value="option.value"/>
                    <span class="block px-3 py-3">{{ option.label }}</span>
                  </label>
                </div>

                <p v-if="birthIdentity === 'child'"
                   class="mt-3 flex items-start gap-2 rounded-lg bg-[#F4FAF4] px-3 py-2.5 text-[13px] leading-relaxed text-[#4A7A4A] ring-1 ring-[#5FA35F]/20">
                  <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#5FA35F]" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  <span>当世界中夫妻正在要孩子、且孩子名额有空位时，才会以孩子身份出生；姓名可能由父母取，未必采用上方填写的姓名。</span>
                </p>

                <div v-else class="mt-3 max-w-sm">
                  <span class="mb-2 block text-sm font-bold text-[#2C2C2C]">出生村庄</span>
                  <div class="relative">
                    <select
                        v-model="selectedVillageId"
                        aria-label="出生村庄"
                        class="h-11 w-full appearance-none rounded-lg border border-[#E8E4D8] bg-[#FAF8F2] pl-4 pr-10 text-sm text-[#2C2C2C] outline-none transition focus:border-[#5FA35F] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="villagesLoading || !villages.length"
                    >
                      <option v-for="village in villages" :key="village.id" :value="village.id">{{
                          village.name
                        }}
                      </option>
                    </select>
                    <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"
                         stroke-linejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  <p v-if="villagesLoading" class="mt-1.5 text-xs text-[#999]">村庄列表加载中...</p>
                  <p v-else-if="villagesError" class="mt-1.5 text-xs text-[#B04444]">
                    {{ villagesError }}
                    <button type="button" class="ml-1 font-semibold text-[#5FA35F] underline-offset-2 hover:underline"
                            @click="loadVillages">重试
                    </button>
                  </p>
                  <p v-else-if="!villages.length" class="mt-1.5 text-xs text-[#999]">暂无可选村庄</p>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-[#E8E4D8] pt-4">
                <p v-if="playerCreateError" class="mr-auto text-sm font-semibold text-[#B04444]">{{
                    playerCreateError
                  }}</p>
                <button
                    type="button"
                    class="rounded-full border border-[#E8E4D8] px-5 py-2 text-sm font-semibold text-[#2C2C2C] transition hover:border-[#5FA35F]"
                    @click="toggleCreatePlayerForm"
                >
                  取消
                </button>
                <button
                    type="submit"
                    class="rounded-full bg-[#5FA35F] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#4A8A4A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {{ playerCreating ? '创建中...' : '创建角色' }}
                </button>
              </div>
            </fieldset>
          </form>

          <div v-if="playerLoading && !players.length"
               class="grid min-h-48 place-items-center rounded-lg border border-[#E8E4D8] bg-white">
            <p class="text-sm font-semibold text-[#5FA35F]">角色加载中...</p>
          </div>

          <div v-else-if="playerListError"
               class="flex flex-col gap-3 rounded-lg border border-[#F0C8C8] bg-[#FFF7F7] px-4 py-5 text-sm font-semibold text-[#B04444] sm:flex-row sm:items-center sm:justify-between">
            <span>{{ playerListError }}</span>
            <button
                type="button"
                class="inline-flex justify-center rounded-full bg-white px-4 py-2 text-sm font-bold text-[#B04444] ring-1 ring-[#F0C8C8] transition hover:bg-[#FFF2F2]"
                @click="handleRetryOrSignIn"
            >
              {{ sign.isSignedIn ? '重试' : '登录' }}
            </button>
          </div>

          <div v-else-if="!players.length" class="rounded-lg border border-[#E8E4D8] bg-white px-4 py-10 text-center">
            <p class="text-base font-bold text-[#2C2C2C]">暂无角色</p>
            <p class="mt-2 text-sm text-[#777]">点击“新增角色”创建后即可进入世界。</p>
          </div>

          <div v-else class="grid gap-3">
            <article
                v-for="player in players"
                :key="player.player_id"
                class="rounded-lg border bg-white p-4 shadow-[0_8px_24px_rgba(57,91,61,0.08)] transition md:p-5"
                :class="player.is_can_play ? 'border-[#5FA35F]/20 hover:border-[#5FA35F]/45' : 'border-[#E8E4D8] opacity-75'"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div class="flex min-w-0 flex-1 gap-4">
                  <button
                      type="button"
                      class="group relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#E8F5E8] text-lg font-black text-[#5FA35F] transition"
                      :class="player.is_can_play ? 'cursor-pointer hover:ring-2 hover:ring-[#5FA35F]/35' : 'cursor-not-allowed'"
                      :disabled="!player.is_can_play"
                      :title="player.is_can_play ? '点击编辑角色' : getDisabledReason(player)"
                      @click="openEditPlayer(player)"
                  >
                    <img v-if="player.avatar" :src="player.avatar" :alt="`${player.name} 头像`"
                         class="h-full w-full object-cover"/>
                    <span v-else>{{ player.name.slice(0, 1) || '?' }}</span>
                    <span
                        v-if="player.is_can_play"
                        class="absolute inset-x-0 bottom-0 bg-black/45 py-0.5 text-center text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                      编辑
                    </span>
                  </button>

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="truncate text-lg font-extrabold text-[#2C2C2C]">{{
                          displayPlayerValue(player.name)
                        }}</h3>
                      <span
                          class="rounded-full border border-[#E8E4D8] bg-[#FAF8F2] px-2.5 py-1 text-xs font-bold text-[#666]">{{
                          displayPlayerValue(player.gender_string)
                        }}</span>
                      <span
                          class="rounded-full border border-[#E8E4D8] bg-[#FAF8F2] px-2.5 py-1 text-xs font-bold text-[#666]">{{
                          getAgeText(player)
                        }}</span>
                      <span
                          v-if="player.color"
                          class="inline-flex items-center gap-1.5 rounded-full border border-[#E8E4D8] bg-[#FAF8F2] px-2.5 py-1 text-xs font-bold text-[#666]"
                          title="住宅颜色"
                      >
                        <span class="h-3 w-3 rounded-full border border-black/10"
                              :style="{ backgroundColor: player.color }"/>
                        住宅
                      </span>
                    </div>

                    <dl class="mt-3 flex flex-col gap-3 rounded-xl border border-[#E8E4D8] bg-[#FAF8F2] px-3.5 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <div class="flex min-w-0 items-center gap-2.5">
                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E8F5E8] text-[#5FA35F]">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="9"/>
                            <path d="M12 7v5l3 2"/>
                          </svg>
                        </span>
                        <div class="min-w-0">
                          <dt class="text-xs font-semibold text-[#999]">出生时间</dt>
                          <dd class="mt-0.5 wrap-break-word font-semibold leading-snug text-[#2C2C2C]">
                            {{ displayPlayerValue(player.tick_current_birth_format?.string) }}
                          </dd>
                        </div>
                      </div>
                      <button
                          type="button"
                          class="inline-flex max-w-full shrink-0 items-center gap-1.5 self-start rounded-full border border-[#E8E4D8] bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold leading-none text-[#888] transition hover:border-[#5FA35F]/45 hover:text-[#5FA35F] sm:max-w-[18rem] sm:self-auto"
                          :title="`点击复制 ${player.player_id}`"
                          @click="copyPlayerId(player.player_id)"
                      >
                        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <rect width="13" height="13" x="9" y="9" rx="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        <span class="truncate">{{
                            copiedPlayerId === player.player_id ? '已复制' : player.player_id
                          }}</span>
                      </button>
                    </dl>

                    <div v-if="player.manifesto"
                         class="mt-3 flex items-start gap-2.5 rounded-xl border border-[#E8E4D8] bg-[#FAF8F2] px-3.5 py-2.5">
                      <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E8F5E8] text-[#5FA35F]">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </span>
                      <div class="min-w-0">
                        <p class="text-xs font-semibold text-[#999]">角色宣言</p>
                        <p class="mt-0.5 line-clamp-2 wrap-break-word text-sm leading-relaxed text-[#5C5C5C]">
                          {{ player.manifesto }}
                        </p>
                      </div>
                    </div>

                    <p v-if="!player.is_can_play"
                       class="mt-3 rounded-lg bg-[#FFF7F7] px-3 py-2 text-sm font-semibold text-[#B04444] ring-1 ring-[#F0C8C8]">
                      {{ getDisabledReason(player) }}
                    </p>
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-2 lg:flex-col lg:items-stretch">
                  <button
                      type="button"
                      class="inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-bold transition"
                      :class="player.is_can_play ? 'border-[#E8E4D8] bg-white text-[#2C2C2C] hover:border-[#5FA35F] hover:text-[#5FA35F]' : 'cursor-not-allowed border-[#E8E4D8] bg-[#FAF8F2] text-[#999]'"
                      :disabled="!player.is_can_play"
                      @click="openEditPlayer(player)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                    </svg>
                    <span>编辑</span>
                  </button>
                  <button
                      type="button"
                      class="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition"
                      :class="player.is_can_play ? 'bg-[#5FA35F] text-white shadow-[0_4px_14px_rgba(95,163,95,0.22)] hover:bg-[#4A8A4A]' : 'cursor-not-allowed border border-[#E8E4D8] bg-[#FAF8F2] text-[#999]'"
                      :disabled="!player.is_can_play"
                      @click="enterPlayerWorld(player)"
                  >
                    <span>进入世界</span>
                  </button>
                </div>
              </div>
            </article>

            <button
                v-if="hasMorePlayers"
                type="button"
                class="mx-auto mt-2 inline-flex items-center justify-center rounded-full border border-[#E8E4D8] bg-white px-5 py-2.5 text-sm font-bold text-[#2C2C2C] transition hover:border-[#5FA35F] hover:text-[#5FA35F] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="playerLoading"
                @click="loadMorePlayers"
            >
              {{ playerLoading ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <PlayerEditDialog
      :open="editOpen"
      :player="editingPlayer"
      @close="editOpen = false"
      @updated="onPlayerUpdated"
  />
</template>

<style scoped>
.test-server-notice {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  border: 1px solid rgba(176, 68, 68, 0.28);
  border-left-width: 4px;
  border-radius: 8px;
  background: #FFFAF4;
  padding: 0.9rem 1rem;
  color: #2C2C2C;
  text-align: left;
  box-shadow: 0 8px 22px rgba(126, 58, 36, 0.08);
}

.test-server-icon {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: #B04444;
  color: #FFFFFF;
}

.test-server-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.test-server-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.2rem;
}

.test-server-copy strong {
  color: #B04444;
  font-size: 1.05rem;
  line-height: 1.25;
}

.test-server-copy span {
  color: #6B4A3D;
  font-size: 0.95rem;
  line-height: 1.55;
}

@media (max-width: 640px) {
  .test-server-notice {
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.8rem 0.85rem;
  }

  .test-server-icon {
    width: 2rem;
    height: 2rem;
  }

  .test-server-icon svg {
    width: 1.1rem;
    height: 1.1rem;
  }
}
</style>

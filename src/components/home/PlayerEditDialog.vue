<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import api from '@/utils/ky'
import {compressImageBlob} from '@/utils/image'
import {uploadFile} from '@/utils/upload'
import type {PlayerItem, UpdatePlayerPayload} from '@/types/home'
import AvatarCropDialog from './AvatarCropDialog.vue'

const props = defineProps<{
  open: boolean
  player: PlayerItem | null
}>()

const emit = defineEmits<{
  close: []
  updated: [player: PlayerItem]
}>()

const MANIFESTO_MAX = 120
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/
const FALLBACK_COLOR = '#5FA35F'

const colorPresets = ref<string[]>([])

const form = ref<{ avatar: string | null; color: string | null; manifesto: string }>({
  avatar: null,
  color: null,
  manifesto: '',
})
const original = ref<{ avatar: string | null; color: string | null; manifesto: string | null }>({
  avatar: null,
  color: null,
  manifesto: null,
})

const hexInput = ref('')
const saving = ref(false)
const saveError = ref('')

const avatarInputRef = ref<HTMLInputElement | null>(null)
const avatarCropSrc = ref('')
const avatarCropError = ref('')
const avatarUploading = ref(false)
let avatarObjectUrl: string | undefined

function normalizeColor(value: string | null | undefined) {
  if (!value) {
    return null
  }
  return HEX_PATTERN.test(value) ? value.toLowerCase() : null
}

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100
  const light = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sat * Math.min(light, 1 - light)
  const channel = (n: number) => {
    const color = light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

// 生成一组随机颜色，每次打开编辑时刷新。
function generateRandomPresets(count = 8) {
  const presets: string[] = []
  while (presets.length < count) {
    const hue = Math.round(Math.random() * 360)
    const saturation = Math.round(55 + Math.random() * 35) // 55% - 90%
    const lightness = Math.round(42 + Math.random() * 26)  // 42% - 68%
    const hex = hslToHex(hue, saturation, lightness)
    if (!presets.includes(hex)) {
      presets.push(hex)
    }
  }
  return presets
}

function revokeAvatarObjectUrl() {
  if (avatarObjectUrl) {
    URL.revokeObjectURL(avatarObjectUrl)
    avatarObjectUrl = undefined
  }
}

watch(
    () => props.open,
    (open) => {
      if (open && props.player) {
        const color = normalizeColor(props.player.color)
        form.value = {
          avatar: props.player.avatar,
          color,
          manifesto: props.player.manifesto ?? '',
        }
        original.value = {
          avatar: props.player.avatar,
          color,
          manifesto: props.player.manifesto ?? null,
        }
        hexInput.value = color ?? ''
        saveError.value = ''
        avatarCropError.value = ''
        colorPresets.value = generateRandomPresets()
        return
      }

      revokeAvatarObjectUrl()
      avatarCropSrc.value = ''
      avatarCropError.value = ''
      avatarUploading.value = false
      saving.value = false
    },
)

const manifestoLength = computed(() => [...form.value.manifesto].length)
const manifestoTooLong = computed(() => manifestoLength.value > MANIFESTO_MAX)
const colorInvalid = computed(() => hexInput.value !== '' && !HEX_PATTERN.test(hexInput.value))
const nativeColorValue = computed(() => form.value.color ?? FALLBACK_COLOR)

const normalizedDescription = computed(() => {
  const trimmed = form.value.manifesto.trim()
  return trimmed === '' ? null : trimmed
})

const changedPayload = computed<UpdatePlayerPayload>(() => {
  const payload: UpdatePlayerPayload = {}
  if (form.value.avatar !== original.value.avatar) {
    payload.avatar = form.value.avatar
  }
  if (form.value.color !== original.value.color) {
    payload.color = form.value.color
  }
  if (normalizedDescription.value !== original.value.manifesto) {
    payload.manifesto = normalizedDescription.value
  }
  return payload
})

const hasChanges = computed(() => Object.keys(changedPayload.value).length > 0)
const canSave = computed(
    () => hasChanges.value && !manifestoTooLong.value && !colorInvalid.value && !saving.value && !avatarUploading.value,
)

function setColor(value: string) {
  const normalized = normalizeColor(value)
  form.value.color = normalized
  hexInput.value = normalized ?? value
}

function onNativeColorInput(event: Event) {
  setColor((event.target as HTMLInputElement).value)
}

function onHexInput() {
  const value = hexInput.value.trim()
  if (value === '') {
    form.value.color = null
    return
  }
  if (HEX_PATTERN.test(value)) {
    form.value.color = value.toLowerCase()
  }
}

function clearColor() {
  form.value.color = null
  hexInput.value = ''
}

function pickAvatarFile() {
  if (saving.value || avatarUploading.value) {
    return
  }
  avatarCropError.value = ''
  avatarInputRef.value?.click()
}

function onAvatarFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    avatarCropError.value = '请选择图片文件。'
    return
  }

  revokeAvatarObjectUrl()
  avatarObjectUrl = URL.createObjectURL(file)
  avatarCropSrc.value = avatarObjectUrl
}

function closeAvatarCrop(force = false) {
  if (avatarUploading.value && !force) {
    return
  }
  revokeAvatarObjectUrl()
  avatarCropSrc.value = ''
}

async function onAvatarCropConfirm(blob: Blob) {
  const player = props.player
  if (!player) {
    return
  }

  avatarUploading.value = true
  avatarCropError.value = ''

  try {
    const compressedBlob = await compressImageBlob(blob, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.82,
      type: 'image/jpeg',
    })
    const uploaded = await uploadFile(compressedBlob, `${player.player_id}-avatar.jpg`)
    form.value.avatar = uploaded.url
    avatarUploading.value = false
    closeAvatarCrop(true)
  } catch {
    avatarCropError.value = '头像上传失败，请稍后再试。'
    avatarUploading.value = false
  }
}

async function save() {
  const player = props.player
  if (!player || !canSave.value) {
    return
  }

  saving.value = true
  saveError.value = ''

  try {
    await api.put(`api/player/${player.player_id}/update`, {
      json: changedPayload.value,
    })

    emit('updated', {
      ...player,
      avatar: form.value.avatar,
      color: form.value.color,
      manifesto: normalizedDescription.value,
    })
    saving.value = false
    emit('close')
  } catch {
    saveError.value = '保存失败，请稍后再试。'
    saving.value = false
  }
}

function requestClose() {
  if (saving.value || avatarUploading.value) {
    return
  }
  emit('close')
}

onBeforeUnmount(() => {
  revokeAvatarObjectUrl()
})
</script>

<template>
  <Teleport to="body">
    <div
        v-if="open && player"
        class="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-edit-title"
        @click.self="requestClose"
    >
      <div class="my-auto w-full max-w-lg rounded-lg bg-[#FAF8F2] shadow-[0_22px_64px_rgba(0,0,0,0.26)]">
        <div class="flex items-start justify-between gap-4 border-b border-[#E8E4D8] bg-white px-5 py-4">
          <div>
            <h2 id="player-edit-title" class="text-xl font-extrabold text-[#2C2C2C]">编辑角色</h2>
            <p class="mt-1 text-sm text-[#777]">{{ player.name }} · 仅修改的字段会被保存</p>
          </div>
          <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#E8E4D8] bg-white text-[#555] transition hover:border-[#5FA35F] hover:text-[#5FA35F] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="关闭编辑"
              :disabled="saving || avatarUploading"
              @click="requestClose"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <div class="max-h-[min(72dvh,640px)] overflow-y-auto px-5 py-5">
          <input ref="avatarInputRef" class="sr-only" type="file" accept="image/*" @change="onAvatarFileChange"/>

          <!-- 头像 -->
          <section class="flex items-center gap-4">
            <button
                type="button"
                class="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#E8F5E8] text-2xl font-black text-[#5FA35F] transition hover:ring-2 hover:ring-[#5FA35F]/35 disabled:cursor-not-allowed"
                :disabled="saving || avatarUploading"
                title="点击更换头像"
                @click="pickAvatarFile"
            >
              <img v-if="form.avatar" :src="form.avatar" :alt="`${player.name} 头像`"
                   class="h-full w-full object-cover"/>
              <span v-else>{{ player.name.slice(0, 1) || '?' }}</span>
              <span
                  v-if="avatarUploading"
                  class="absolute inset-0 grid place-items-center bg-black/45 text-xs font-bold text-white">
                上传中...
              </span>
            </button>
            <div class="min-w-0">
              <p class="text-sm font-bold text-[#2C2C2C]">角色头像</p>
              <p class="mt-1 text-xs leading-relaxed text-[#888]">点击左侧头像选择图片，将以圆形区域裁剪。</p>
              <button
                  type="button"
                  class="mt-2 inline-flex items-center rounded-full border border-[#E8E4D8] bg-white px-3 py-1.5 text-xs font-bold text-[#2C2C2C] transition hover:border-[#5FA35F] hover:text-[#5FA35F] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="saving || avatarUploading"
                  @click="pickAvatarFile"
              >
                更换头像
              </button>
              <p v-if="avatarCropError && !avatarCropSrc" class="mt-2 text-xs font-semibold text-[#B04444]">
                {{ avatarCropError }}
              </p>
            </div>
          </section>

          <!-- 住宅颜色 -->
          <section class="mt-6">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[#2C2C2C]">住宅颜色</span>
              <button
                  v-if="form.color"
                  type="button"
                  class="text-xs font-semibold text-[#999] transition hover:text-[#B04444]"
                  @click="clearColor"
              >
                清除
              </button>
            </div>
            <p class="mt-1 text-xs text-[#888]">用于地图中标识你的住宅，留空则使用系统默认色。</p>

            <div class="mt-3 flex items-center gap-3">
              <label
                  class="relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border border-[#E8E4D8] shadow-inner"
                  :style="{ backgroundColor: form.color ?? 'transparent' }"
                  title="打开取色器"
              >
                <input
                    class="absolute inset-0 cursor-pointer opacity-0"
                    type="color"
                    :value="nativeColorValue"
                    aria-label="住宅颜色取色器"
                    @input="onNativeColorInput"
                />
                <svg v-if="!form.color" class="h-5 w-5 text-[#999]" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="13.5" cy="6.5" r="2.5"/>
                  <circle cx="17.5" cy="10.5" r="2.5"/>
                  <circle cx="8.5" cy="7.5" r="2.5"/>
                  <circle cx="6.5" cy="12.5" r="2.5"/>
                  <path
                      d="M12 2a10 10 0 0 0 0 20 2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 1 2-4h2a4 4 0 0 0 4-4 10 10 0 0 0-10-8Z"/>
                </svg>
              </label>
              <div class="relative flex-1">
                <span
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#999]">#</span>
                <input
                    v-model="hexInput"
                    class="h-11 w-full rounded-lg border bg-white pl-7 pr-3 font-mono text-sm uppercase text-[#2C2C2C] outline-none transition focus:bg-white"
                    :class="colorInvalid ? 'border-[#E1A1A1] focus:border-[#B04444]' : 'border-[#E8E4D8] focus:border-[#5FA35F]'"
                    type="text"
                    inputmode="text"
                    maxlength="7"
                    placeholder="ffffff"
                    autocomplete="off"
                    spellcheck="false"
                    @input="onHexInput"
                />
              </div>
            </div>
            <p v-if="colorInvalid" class="mt-2 text-xs font-semibold text-[#B04444]">请输入有效的十六进制颜色，例如
              #5FA35F。</p>

            <div class="mt-3 flex items-center justify-between">
              <span class="text-xs font-semibold text-[#999]">随机推荐</span>
              <button
                  type="button"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-[#5FA35F] transition hover:text-[#4A8A4A]"
                  @click="colorPresets = generateRandomPresets()"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-2.64-6.36"/>
                  <path d="M21 3v6h-6"/>
                </svg>
                换一批
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                  v-for="preset in colorPresets"
                  :key="preset"
                  type="button"
                  class="h-7 w-7 rounded-full border shadow-sm transition hover:scale-110"
                  :class="form.color === preset.toLowerCase() ? 'border-[#2C2C2C] ring-2 ring-[#5FA35F]/40' : 'border-[#E8E4D8]'"
                  :style="{ backgroundColor: preset }"
                  :title="preset"
                  :aria-label="`选择颜色 ${preset}`"
                  @click="setColor(preset)"
              />
            </div>
          </section>

          <!-- 角色宣言 -->
          <section class="mt-6">
            <div class="flex items-center justify-between">
              <label for="player-manifesto" class="text-sm font-bold text-[#2C2C2C]">角色宣言</label>
              <span class="text-xs font-semibold" :class="manifestoTooLong ? 'text-[#B04444]' : 'text-[#999]'">
                {{ manifestoLength }} / {{ MANIFESTO_MAX }}
              </span>
            </div>
            <textarea
                id="player-manifesto"
                v-model="form.manifesto"
                rows="4"
                class="mt-2 w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm leading-relaxed text-[#2C2C2C] outline-none transition placeholder:text-[#bbb]"
                :class="manifestoTooLong ? 'border-[#E1A1A1] focus:border-[#B04444]' : 'border-[#E8E4D8] focus:border-[#5FA35F]'"
                placeholder="要说点好听的吗（120 字以内）"
            ></textarea>
            <p v-if="manifestoTooLong" class="mt-1 text-xs font-semibold text-[#B04444]">
              宣言不能超过 {{ MANIFESTO_MAX }} 字。
            </p>
          </section>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-[#E8E4D8] bg-white px-5 py-4">
          <p v-if="saveError" class="mr-auto text-sm font-semibold text-[#B04444]">{{ saveError }}</p>
          <p v-else-if="!hasChanges" class="mr-auto text-xs text-[#999]">尚未做任何修改</p>
          <button
              type="button"
              class="rounded-full border border-[#E8E4D8] px-5 py-2 text-sm font-semibold text-[#2C2C2C] transition hover:border-[#5FA35F] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="saving || avatarUploading"
              @click="requestClose"
          >
            取消
          </button>
          <button
              type="button"
              class="rounded-full bg-[#5FA35F] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#4A8A4A] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!canSave"
              @click="save"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <AvatarCropDialog
      :open="Boolean(avatarCropSrc)"
      :src="avatarCropSrc"
      :saving="avatarUploading"
      :error="avatarCropError"
      @close="closeAvatarCrop"
      @confirm="onAvatarCropConfirm"
  />
</template>

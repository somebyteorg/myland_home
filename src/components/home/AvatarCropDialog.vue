<script setup lang="ts">
import {ref, watch} from 'vue'
import {CircleStencil, Cropper} from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

defineProps<{
  open: boolean
  src: string
  saving: boolean
  error: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [blob: Blob]
}>()

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)
const localError = ref('')

watch(
    () => cropperRef.value,
    () => {
      localError.value = ''
    },
)

function getCanvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas export failed'))
            return
          }

          resolve(blob)
        },
        'image/jpeg',
        0.92,
    )
  })
}

async function confirmCrop() {
  localError.value = ''

  try {
    const result = cropperRef.value?.getResult()
    const canvas = result?.canvas

    if (!canvas) {
      throw new Error('Crop result unavailable')
    }

    emit('confirm', await getCanvasBlob(canvas))
  } catch {
    localError.value = '头像裁剪失败，请重新选择图片。'
  }
}
</script>

<template>
  <Teleport to="body">
    <div
        v-if="open"
        class="fixed inset-0 z-[130] grid min-h-dvh place-items-center bg-black/55 px-4 py-6"
        role="dialog"
        aria-modal="true"
        @click.self="emit('close')"
    >
      <div class="w-full max-w-2xl overflow-hidden rounded-lg bg-[#FAF8F2] shadow-[0_22px_64px_rgba(0,0,0,0.28)]">
        <div class="flex items-start justify-between gap-4 border-b border-[#E8E4D8] bg-white px-5 py-4">
          <div>
            <h3 class="text-lg font-extrabold text-[#2C2C2C]">裁剪头像</h3>
            <p class="mt-1 text-sm text-[#777]">拖动图片并调整圆形区域。</p>
          </div>
          <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#E8E4D8] bg-white text-[#555] transition hover:border-[#5FA35F] hover:text-[#5FA35F]"
              aria-label="关闭头像裁剪"
              :disabled="saving"
              @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5">
          <div class="overflow-hidden rounded-lg bg-[#1E1E1E]">
            <Cropper
                ref="cropperRef"
                class="h-[min(64vh,460px)]"
                :src="src"
                :stencil-component="CircleStencil"
                :stencil-props="{aspectRatio: 1}"
                image-restriction="stencil"
            />
          </div>

          <p v-if="localError || error" class="mt-3 text-sm font-semibold text-[#B04444]">{{ localError || error }}</p>

          <div class="mt-5 flex flex-wrap justify-end gap-3">
            <button
                type="button"
                class="rounded-full border border-[#E8E4D8] px-5 py-2 text-sm font-semibold text-[#2C2C2C] transition hover:border-[#5FA35F] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="saving"
                @click="emit('close')"
            >
              取消
            </button>
            <button
                type="button"
                class="rounded-full bg-[#5FA35F] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#4A8A4A] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="saving"
                @click="confirmCrop"
            >
              {{ saving ? '保存中...' : '保存头像' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

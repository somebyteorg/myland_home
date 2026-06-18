<script setup lang="ts">
import {ref, watch} from 'vue'

const props = defineProps<{
  open: boolean
  token: string
}>()

const emit = defineEmits<{
  close: []
}>()

const tokenVisible = ref(false)

watch(
    () => props.open,
    (open) => {
      if (open) {
        tokenVisible.value = false
      }
    },
)

function selectTokenInput(event: Event) {
  const input = event.target as HTMLInputElement
  input.select()
}
</script>

<template>
  <Teleport to="body">
    <div
        v-if="open"
        class="fixed inset-0 z-[100] grid min-h-dvh place-items-center bg-black/40 px-5 py-6"
        role="dialog"
        aria-modal="true"
        @click.self="emit('close')"
    >
      <div class="w-full max-w-[560px] rounded-lg bg-white p-6 shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
        <h2 class="mb-3 text-xl font-bold text-[#2C2C2C]">复制失败</h2>
        <p class="mb-4 text-sm leading-relaxed text-[#666]">浏览器未允许自动写入剪贴板。token
          默认隐藏，显示后可手动选中复制，请勿泄露给他人。</p>
        <input
            class="w-full rounded-lg border border-[#E8E4D8] bg-[#FAF8F2] px-4 py-3 font-mono text-[13px] leading-none tracking-wide text-[#333] outline-none focus:border-[#5FA35F]"
            :type="tokenVisible ? 'text' : 'password'"
            readonly
            :value="token"
            autocomplete="off"
            spellcheck="false"
            aria-label="登录 token"
            @focus="selectTokenInput"
            @click="selectTokenInput"
        />
        <div class="mt-5 flex flex-wrap justify-end gap-3">
          <button type="button"
                  class="rounded-full border border-[#E8E4D8] px-5 py-2 text-sm font-semibold text-[#2C2C2C] transition hover:border-[#5FA35F]"
                  @click="tokenVisible = !tokenVisible">
            {{ tokenVisible ? '隐藏 token' : '显示 token' }}
          </button>
          <button type="button" class="rounded-full bg-[#5FA35F] px-5 py-2 text-sm font-semibold text-white"
                  @click="emit('close')">关闭
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

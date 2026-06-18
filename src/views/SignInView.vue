<script setup lang="ts">
import {onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import api from '@/utils/ky'
import useSignStore, {type UserInfo} from '@/stores/sign'

const route = useRoute()
const router = useRouter()
const sign = useSignStore()

function getTokenFromQuery() {
  const token = route.query.token

  if (Array.isArray(token)) {
    return token[0] || ''
  }

  return token || ''
}

async function loadUserInfo() {
  try {
    const info = await api.get('api/user/info').json<UserInfo>()
    sign.setUserInfo(info)
  } catch {
    // 401 会由 ky hook 统一清理登录态。
  }
}

onMounted(() => {
  const token = getTokenFromQuery()

  if (token) {
    sign.setToken(token)
    void loadUserInfo()
  }

  void router.replace({name: 'home'})
})
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-[#FAF8F2] px-6 text-center text-[#2C2C2C]">
    <div>
      <img src="/favicon.svg" alt="一亩三分地 Logo" class="mx-auto mb-5 h-20 w-20"/>
      <p class="text-lg font-semibold">正在完成登录...</p>
    </div>
  </main>
</template>

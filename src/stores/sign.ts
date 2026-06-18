import {computed, ref} from 'vue'
import {defineStore} from 'pinia'

export interface UserInfo {
    username: string
    avatar: string | null
    telegram_user_id: string | null
    telegram_bind_url: string | null
}

export const useSignStore = defineStore(
    'sign',
    () => {
        const username = ref('')
        const avatar = ref<string | null>(null)
        const user_token = ref('')
        const telegram_user_id = ref<string | null>(null)
        const telegram_bind_url = ref<string | null>(null)

        const isSignedIn = computed(() => Boolean(user_token.value))

        function setToken(token: string) {
            user_token.value = token
        }

        function setUserInfo(info: UserInfo) {
            username.value = info.username
            avatar.value = info.avatar
            telegram_user_id.value = info.telegram_user_id
            telegram_bind_url.value = info.telegram_bind_url
        }

        async function signOut() {
            username.value = ''
            avatar.value = null
            user_token.value = ''
            telegram_user_id.value = null
            telegram_bind_url.value = null
        }

        return {
            username,
            avatar,
            user_token,
            telegram_user_id,
            telegram_bind_url,
            isSignedIn,
            setToken,
            setUserInfo,
            signOut,
        }
    },
    {
        persist: true,
    },
)

export default useSignStore

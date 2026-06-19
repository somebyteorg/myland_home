import {computed, ref} from 'vue'
import {useClipboard} from '@vueuse/core'
import api from '@/utils/ky'
import useSignStore, {type UserInfo} from '@/stores/sign'
import {startSignInFlow} from '@/utils/auth'

export function useHomeSession() {
    const sign = useSignStore()
    const profileOpen = ref(false)
    const mobileMenuOpen = ref(false)
    const copyFeedback = ref('')
    const tokenDialogOpen = ref(false)
    const playerDialogOpen = ref(false)
    const unbindTelegramDialogOpen = ref(false)
    const unbindingTelegram = ref(false)
    const unbindCancelButtonRef = ref<HTMLButtonElement | null>(null)

    let copyFeedbackTimer: number | undefined
    const {copy: copyToClipboard, isSupported: clipboardSupported} = useClipboard()

    const displayName = computed(() => sign.username || '已登录')

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
        startSignInFlow()
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

    function closeMenus() {
        profileOpen.value = false
        mobileMenuOpen.value = false
    }

    function clearCopyFeedbackTimer() {
        window.clearTimeout(copyFeedbackTimer)
    }

    return {
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
        openTokenDialog,
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
    }
}

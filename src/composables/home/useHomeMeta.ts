import {computed, ref} from 'vue'
import api from '@/utils/ky'
import {seasonDayCount, seasonHours} from '@/components/home/homeContent'
import type {TimeInfo, VersionInfo} from '@/types/home'

export function useHomeMeta() {
    const currentTime = ref<TimeInfo | null>(null)
    const version = ref<VersionInfo | null>(null)

    const currentTimeText = computed(() => currentTime.value?.string || '地元历加载中')
    const timeDiffText = computed(() => {
        const diffHour = currentTime.value?.diff_hour

        if (diffHour === undefined || diffHour === null) {
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

    return {
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
    }
}

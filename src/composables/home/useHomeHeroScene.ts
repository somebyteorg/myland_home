import {ref} from 'vue'
import {
    heroPlayObjects,
    heroPlayPositionSlots,
} from '@/components/home/homeContent'
import type {VisibleHeroPlayObject, WeatherItem, WeatherName} from '@/types/home'

function randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min)
}

function buildWeatherItems(weather: WeatherName) {
    if (weather === 'spring-rain') {
        return Array.from({length: 30}, () => ({
            className: 'raindrop',
            style: {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${randomBetween(1.2, 1.8)}s`,
            },
        }))
    }

    if (weather === 'heavy-rain') {
        return Array.from({length: 50}, () => ({
            className: 'raindrop',
            style: {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.6}s`,
                animationDuration: `${randomBetween(0.4, 0.8)}s`,
            },
        }))
    }

    if (weather === 'thunderstorm') {
        const rain = Array.from({length: 60}, () => ({
            className: 'raindrop',
            style: {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${randomBetween(0.3, 0.7)}s`,
            },
        }))

        return [
            ...rain,
            {
                className: 'lightning',
                style: {
                    left: `${randomBetween(30, 70)}%`,
                },
            },
        ]
    }

    if (weather === 'sunny') {
        const sparkles = Array.from({length: 10}, () => ({
            className: 'sparkle',
            style: {
                left: `${randomBetween(20, 80)}%`,
                top: `${randomBetween(10, 50)}%`,
                animationDelay: `${Math.random() * 3}s`,
            },
        }))

        return [{className: 'sun-ray', style: {}}, ...sparkles]
    }

    if (weather === 'drought') {
        return [{className: 'heatwave', style: {}}]
    }

    return Array.from({length: 6}, () => {
        const size = randomBetween(200, 500)

        return {
            className: 'fog',
            style: {
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${randomBetween(15, 25)}s`,
            },
        }
    })
}

export function useHomeHeroScene() {
    const activeWeather = ref<WeatherName>('sunny')
    const weatherItems = ref<WeatherItem[]>([])
    const visibleHeroPlayObjects = ref<VisibleHeroPlayObject[]>([])

    function initWeather() {
        const weathers: WeatherName[] = ['spring-rain', 'heavy-rain', 'sunny', 'drought', 'mist', 'thunderstorm']
        const weather = weathers[Math.floor(Math.random() * weathers.length)]
        activeWeather.value = weather
        weatherItems.value = buildWeatherItems(weather)
    }

    function initHeroPlayObjects() {
        const count = Math.random() > 0.5 ? 2 : 1
        const selectedObjects = [...heroPlayObjects].sort(() => Math.random() - 0.5).slice(0, count)
        const sides: Array<keyof typeof heroPlayPositionSlots> =
            count === 2 ? (Math.random() > 0.5 ? ['left', 'right'] : ['right', 'left']) : [Math.random() > 0.5 ? 'left' : 'right']

        visibleHeroPlayObjects.value = selectedObjects.map((object, index) => ({
            ...object,
            className: `${object.sizeClass} ${heroPlayPositionSlots[sides[index]][Math.floor(Math.random() * heroPlayPositionSlots[sides[index]].length)]}`,
        }))
    }

    return {
        activeWeather,
        weatherItems,
        visibleHeroPlayObjects,
        initWeather,
        initHeroPlayObjects,
    }
}

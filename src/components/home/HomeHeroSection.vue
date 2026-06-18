<script setup lang="ts">
import type {WeatherItem, VisibleHeroPlayObject} from '@/types/home'
import {iconPaths} from './homeContent'

defineProps<{
  activeWeather: string
  heroOpacity: number
  currentTimeText: string
  weatherItems: WeatherItem[]
  visibleHeroPlayObjects: VisibleHeroPlayObject[]
}>()

const emit = defineEmits<{
  play: []
}>()
</script>

<template>
  <section
      id="hero"
      class="hero-section relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 pb-40 pt-24 text-center transition duration-300 md:pb-44"
      :class="`weather-${activeWeather}`"
      :style="{opacity: heroOpacity}"
  >
    <div class="weather-layer absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div
          v-for="(item, index) in weatherItems"
          :key="`${item.className}-${index}`"
          :class="item.className"
          :style="item.style"
      ></div>
    </div>

    <div class="hero-play-scene pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <div
          class="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,transparent_0%,rgba(95,163,95,0.06)_58%,rgba(95,163,95,0.1)_100%)]"></div>
      <div class="field-rows absolute inset-x-0 bottom-0 h-[34%] opacity-70"></div>

      <div
          v-for="object in visibleHeroPlayObjects"
          :key="object.key"
          class="play-object absolute text-[#35543A]"
          :class="[object.className, `play-object-${object.key}`]"
      >
        <svg viewBox="0 0 160 130" class="h-auto w-full overflow-visible" fill="none" stroke="currentColor"
             stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <g v-if="object.key === 'scarecrow'" class="play-object-art">
            <path d="M80 32v72"/>
            <path d="M43 55h74"/>
            <path d="M62 39h36"/>
            <path d="M68 28h24l10 11H58l10-11Z" fill="#D8B56D" stroke="#8E6E35"/>
            <circle cx="80" cy="49" r="15" fill="#F1D28B" stroke="#8E6E35"/>
            <path d="M73 49h.1M87 49h.1M74 58c5 4 8 4 12 0"/>
            <path d="M54 67 38 85M106 67l16 18"/>
            <path d="M63 69c8 9 26 9 34 0" fill="#7FAE6D"/>
            <path d="M48 108h64"/>
          </g>

          <g v-else-if="object.key === 'dog'" class="play-object-art">
            <path d="M38 88c5-23 22-35 48-31 18 3 30 14 34 31" fill="#D8B56D" stroke="#7A5A34"/>
            <path d="M52 62 41 42 65 56" fill="#B9824C" stroke="#7A5A34"/>
            <path d="M107 61 123 42 116 70" fill="#B9824C" stroke="#7A5A34"/>
            <circle cx="72" cy="73" r="2"/>
            <circle cx="96" cy="73" r="2"/>
            <path d="M84 78v7M76 88c5 4 11 4 16 0"/>
            <path d="M37 88v18M58 89v18M105 88v18M123 87v18"/>
            <path d="M121 75c16-7 20 8 9 16"/>
            <path d="M32 108h96"/>
          </g>

          <g v-else-if="object.key === 'baitField'" class="play-object-art">
            <path d="M25 96c20-18 90-18 110 0v18H25V96Z" fill="#8BC97A" stroke="#5C8D4B"/>
            <path d="M40 94c11-18 23-18 34 0M70 94c11-18 23-18 34 0M100 94c8-15 17-15 24 0"/>
            <path d="M50 74v20M83 70v24M115 76v18"/>
            <path d="M50 74c-10 4-14 10-12 18M50 74c10 4 14 10 12 18"/>
            <path d="M83 70c-11 5-16 12-13 21M83 70c11 5 16 12 13 21"/>
            <path d="M33 110h94"/>
          </g>

          <g v-else-if="object.key === 'shed'" class="play-object-art">
            <path d="M36 65 80 30l44 35" fill="#C9A26D" stroke="#7B6040"/>
            <path d="M45 63h70v51H45V63Z" fill="#D8B56D" stroke="#7B6040"/>
            <path d="M55 74h18v18H55zM89 73h17v41H89z" fill="#F3E7C5" stroke="#7B6040"/>
            <path d="M49 108c18-9 39 5 63-4M57 63l-9 51M75 63l-5 51M105 63l8 51"/>
            <path d="M34 114h92"/>
          </g>

          <g v-else class="play-object-art">
            <path d="M39 60 80 32l41 28v54H39V60Z" fill="#D8B56D" stroke="#7B6040"/>
            <path d="M55 76h50v38H55z" fill="#F3E7C5" stroke="#7B6040"/>
            <path d="M55 76 105 114M105 76 55 114"/>
            <path d="M52 50h56"/>
            <path d="M33 114h94"/>
            <path d="M118 64c10 2 15 8 14 18" stroke="#B04444"/>
            <path d="M124 72h14M131 65v14" stroke="#B04444"/>
          </g>
        </svg>

        <div class="play-object-label">
          <span class="font-semibold">{{ object.label }}</span>
          <span>{{ object.hint }}</span>
        </div>
      </div>
    </div>

    <span
        class="relative z-10 mb-8 inline-flex items-center gap-2 rounded-full border border-[#5FA35F]/25 bg-[#5FA35F]/10 px-5 py-2 text-sm font-medium text-[#5FA35F] md:text-base">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path v-for="path in iconPaths.globe" :key="path" :d="path"/>
      </svg>
      <span>实时演化的多人世界</span>
    </span>
    <img src="/favicon.svg" alt="一亩三分地 Logo"
         class="relative z-10 mb-3 h-24 w-24 drop-shadow-[0_4px_12px_rgba(95,163,95,0.2)] md:h-28 md:w-28"/>
    <h1 class="relative z-10 text-[clamp(3.5rem,12vw,7rem)] font-black leading-[1.1] tracking-wide text-[#2C2C2C]">
      一亩三分地
    </h1>
    <p class="relative z-10 mb-8 mt-3 text-[clamp(1.5rem,3.5vw,2.4rem)] font-semibold tracking-wide text-[#5FA35F]">
      从三亩荒地，到万亩宗门
    </p>
    <p class="relative z-10 mb-10 max-w-3xl text-[clamp(1.15rem,2.5vw,1.45rem)] leading-[1.9] text-[#666]">
      时间不停流转，世界永不落幕。<br/>
      而这一切的走向，由你亲手决定。
    </p>
    <p class="relative z-10 mb-14 inline-flex items-center gap-3 rounded-full border border-[#E8E4D8] bg-white px-8 py-4 text-[clamp(1.05rem,2.2vw,1.25rem)] text-[#2C2C2C] shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
      <svg class="h-5 w-5 text-[#5FA35F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path v-for="path in iconPaths.clock" :key="path" :d="path"/>
      </svg>
      <span>{{ currentTimeText }}</span>
    </p>

    <div class="relative z-10 flex flex-col items-center gap-5">
      <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl bg-[#5FA35F] px-10 py-4 text-lg font-bold text-white shadow-[0_4px_14px_rgba(95,163,95,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(95,163,95,0.35)]"
          @click="emit('play')"
      >
        <span>点击游玩</span>
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-for="path in iconPaths.arrow" :key="path" :d="path"/>
        </svg>
      </button>
      <p class="flex items-center gap-2 text-sm text-[#888] md:text-base">
        <span class="h-2 w-2 rounded-full bg-[#5FA35F]/60"></span>
        <span>选择角色后进入 Web 世界</span>
      </p>
    </div>

    <div class="wave-divider pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28 overflow-hidden md:h-36"
         aria-hidden="true">
      <svg class="wave-svg wave-svg-back absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 2880 160"
           preserveAspectRatio="none">
        <path
            fill="#9FD09F"
            opacity="0.55"
            d="M0 102 C160 62 320 62 480 102 C640 142 800 142 960 102 C1120 62 1280 62 1440 102 C1600 142 1760 142 1920 102 C2080 62 2240 62 2400 102 C2560 142 2720 142 2880 102 V160 H0 Z"
        />
      </svg>
      <svg class="wave-svg wave-svg-mid absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 2880 160"
           preserveAspectRatio="none">
        <path
            fill="#C2E4C2"
            opacity="0.85"
            d="M0 118 C180 84 300 82 480 116 C660 150 780 150 960 116 C1140 82 1260 84 1440 118 C1620 152 1740 152 1920 118 C2100 84 2220 82 2400 116 C2580 150 2700 150 2880 116 V160 H0 Z"
        />
      </svg>
      <svg class="wave-svg wave-svg-front absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 2880 160"
           preserveAspectRatio="none">
        <path
            fill="#DCEFDC"
            d="M0 132 C160 106 320 106 480 132 C640 158 800 158 960 132 C1120 106 1280 106 1440 132 C1600 158 1760 158 1920 132 C2080 106 2240 106 2400 132 C2560 158 2720 158 2880 132 V160 H0 Z"
        />
      </svg>
    </div>

    <a href="#features"
       class="scroll-indicator absolute bottom-32 left-1/2 z-20 -translate-x-1/2 text-[#5FA35F]/70 md:bottom-25"
       aria-label="滚动到玩法">
      <span class="mouse-shell">
        <span class="mouse-wheel"></span>
      </span>
    </a>
  </section>
</template>

<style scoped>
.hero-section.weather-spring-rain .weather-layer {
  background: linear-gradient(180deg, rgba(135, 206, 235, 0.05) 0%, transparent 100%);
}

.hero-section.weather-heavy-rain .weather-layer {
  background: linear-gradient(180deg, rgba(70, 70, 90, 0.15) 0%, transparent 100%);
}

.hero-section.weather-sunny .weather-layer {
  background: radial-gradient(circle at 80% 20%, rgba(255, 223, 100, 0.15) 0%, transparent 60%);
}

.hero-section.weather-drought {
  background: #FAF3E8;
}

.hero-section.weather-drought .weather-layer {
  background: linear-gradient(180deg, rgba(255, 200, 100, 0.08) 0%, transparent 100%);
}

.hero-section.weather-mist .weather-layer {
  background: linear-gradient(180deg, rgba(200, 210, 230, 0.1) 0%, transparent 100%);
}

.hero-section.weather-thunderstorm .weather-layer {
  background: linear-gradient(180deg, rgba(50, 50, 70, 0.2) 0%, transparent 100%);
}

.hero-play-scene {
  color: #35543A;
}

.field-rows {
  background-image: linear-gradient(168deg, transparent 0 43%, rgba(95, 163, 95, 0.22) 44%, transparent 47%),
  linear-gradient(12deg, transparent 0 43%, rgba(95, 163, 95, 0.18) 44%, transparent 47%);
  background-size: 82px 26px;
  mask-image: linear-gradient(180deg, transparent 0%, black 22%, black 100%);
}

.play-object {
  opacity: 0.58;
  filter: drop-shadow(0 12px 18px rgba(52, 83, 56, 0.13));
}

.play-object-art {
  transform-origin: 50% 100%;
  animation: playObjectSway 6s ease-in-out infinite;
}

.play-object-dog .play-object-art,
.play-object-baitField .play-object-art {
  animation-delay: -1.7s;
}

.play-object-shed .play-object-art,
.play-object-fakeWarehouse .play-object-art {
  animation-delay: -3.2s;
}

.play-object-label {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  min-width: 92px;
  margin-top: -8px;
  padding: 7px 10px;
  border: 1px solid rgba(95, 163, 95, 0.18);
  border-radius: 8px;
  background: rgba(250, 248, 242, 0.76);
  color: rgba(44, 44, 44, 0.74);
  font-size: 12px;
  line-height: 1.25;
  box-shadow: 0 8px 24px rgba(52, 83, 56, 0.08);
  backdrop-filter: blur(8px);
}

.play-object-label span:last-child {
  color: rgba(74, 138, 74, 0.82);
}

.raindrop {
  position: absolute;
  width: 1px;
  height: 15px;
  background: linear-gradient(to bottom, transparent, rgba(100, 150, 200, 0.3));
  animation: rainFall 1.5s linear infinite;
}

.weather-heavy-rain .raindrop {
  width: 2px;
  height: 30px;
  background: linear-gradient(to bottom, transparent, rgba(80, 120, 160, 0.5));
}

.weather-thunderstorm .raindrop {
  width: 2px;
  height: 35px;
  background: linear-gradient(to bottom, transparent, rgba(70, 100, 140, 0.6));
}

.sun-ray {
  position: absolute;
  top: 10%;
  right: 15%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 223, 100, 0.3) 0%, transparent 70%);
  animation: sunPulse 4s ease-in-out infinite;
}

.sparkle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 240, 150, 0.8);
  animation: sparkleAnim 3s ease-in-out infinite;
}

.heatwave {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255, 150, 50, 0.03) 10px, rgba(255, 150, 50, 0.03) 20px);
  animation: heatShimmer 2s ease-in-out infinite;
}

.fog {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(220, 230, 240, 0.4) 0%, transparent 70%);
  animation: fogFloat 20s ease-in-out infinite;
}

.lightning {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 255, 200, 0) 0%, rgba(255, 255, 200, 0.8) 20%, rgba(200, 220, 255, 0.6) 40%, transparent 60%);
  box-shadow: 0 0 20px rgba(255, 255, 200, 0.8);
  opacity: 0;
  animation: lightningFlash 8s ease-in-out infinite;
}

.mouse-shell {
  display: block;
  width: 26px;
  height: 42px;
  border: 2px solid currentColor;
  border-radius: 999px;
  opacity: 0.9;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.scroll-indicator:hover .mouse-shell {
  opacity: 1;
  transform: translateY(-2px);
}

.mouse-wheel {
  display: block;
  width: 4px;
  height: 8px;
  margin: 8px auto 0;
  border-radius: 999px;
  background: currentColor;
  animation: mouseWheel 1.8s ease-in-out infinite;
}

.wave-svg {
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

/* 渐变背景让波浪区域有一层淡绿色底色,与下方玩法区衔接,使波浪更明显 */
.wave-divider {
  background: linear-gradient(180deg, transparent 0%, rgba(95, 163, 95, 0.06) 45%, rgba(159, 208, 159, 0.22) 100%);
}

.wave-svg-back {
  animation: waveDrift 18s ease-in-out infinite alternate;
}

.wave-svg-mid {
  animation: waveDrift 13s ease-in-out infinite alternate-reverse;
}

.wave-svg-front {
  animation: waveDrift 10s ease-in-out infinite alternate;
}

@keyframes rainFall {
  to {
    transform: translateY(100vh);
  }
}

@keyframes sunPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.2);
  }
}

@keyframes sparkleAnim {
  0%,
  100% {
    opacity: 0;
    transform: scale(0);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes heatShimmer {
  0%,
  100% {
    opacity: 0.5;
    transform: translateY(0) scaleY(1);
  }

  50% {
    opacity: 0.8;
    transform: translateY(-5px) scaleY(1.02);
  }
}

@keyframes fogFloat {
  0%,
  100% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(30px, -20px);
  }

  50% {
    transform: translate(-20px, 10px);
  }

  75% {
    transform: translate(40px, 5px);
  }
}

@keyframes lightningFlash {
  0%,
  100%,
  49%,
  51%,
  53% {
    opacity: 0;
  }

  50%,
  52% {
    opacity: 1;
  }
}

@keyframes waveDrift {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(-50%, 0, 0);
  }
}

@keyframes playObjectSway {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }

  50% {
    transform: translateY(-5px) rotate(1deg);
  }
}

@keyframes mouseWheel {
  0% {
    opacity: 0;
    transform: translateY(0);
  }

  35% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateY(13px);
  }
}

@media (max-width: 640px) {
  .play-object {
    opacity: 0.42;
  }

  .play-object-label {
    min-width: 78px;
    padding: 6px 8px;
    font-size: 11px;
  }
}
</style>

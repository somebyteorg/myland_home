import type {BirthIdentity, CreatePlayerGender, HeroPlayObject, IconName} from '@/types/home'

export const iconPaths: Record<IconName, string[]> = {
    plant: [
        'M12 21V9',
        'M12 9C8.8 9 6 6.2 6 3c3.2 0 6 2.8 6 6Z',
        'M12 13c3.2 0 6-2.8 6-6-3.2 0-6 2.8-6 6Z',
        'M6 21h12',
    ],
    trade: [
        'M12 3v18',
        'M17 7.5c-.9-1.1-2.5-1.8-4.6-1.8-2.8 0-4.7 1.3-4.7 3.3 0 5.2 9.9 2.7 9.9 7.9 0 2-1.9 3.4-4.8 3.4-2.4 0-4.4-.8-5.7-2.2',
    ],
    alliance: [
        'M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
        'M15.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
        'M2.5 21c.5-3.7 2.8-6 6-6s5.5 2.3 6 6',
        'M9.5 21c.5-3.7 2.8-6 6-6s5.5 2.3 6 6',
    ],
    stealth: [
        'M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z',
        'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
        'M4 20 20 4',
    ],
    ascension: ['M13 2 4 14h7l-1 8 10-14h-7l1-6Z'],
    market: ['M4 19V5', 'M4 19h16', 'M8 15l3-4 3 2 5-7'],
    globe: [
        'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
        'M2 12h20',
        'M12 2c2.5 2.7 4 6.1 4 10s-1.5 7.3-4 10c-2.5-2.7-4-6.1-4-10s1.5-7.3 4-10Z',
    ],
    clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
    arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
}

export const features: Array<{ icon: IconName; title: string; role: string }> = [
    {icon: 'plant', title: '种植', role: '勤劳耕耘 富甲一方'},
    {icon: 'trade', title: '交易', role: '纵横商海 财源滚滚'},
    {icon: 'alliance', title: '联盟', role: '凝聚人心 受人敬仰'},
    {icon: 'stealth', title: '偷窃', role: '暗夜行窃 声名狼藉'},
    {icon: 'ascension', title: '渡劫', role: '历经千劫 终得飞升'},
]

export const timeEvents: Array<{ icon: IconName; text: string }> = [
    {icon: 'plant', text: '田地里的作物仍在生长，疏于照料也会枯萎'},
    {icon: 'market', text: '市场价格悄悄波动，机会与风险同在'},
    {icon: 'stealth', text: '也许有人正盯着你的仓库'},
    {icon: 'alliance', text: '盟友与对手，都在暗中行动'},
    {icon: 'ascension', text: '节气流转，渡劫的时机正在临近'},
]

export const timeScaleItems = [
    {real: '现实 1 小时', game: '游戏 1 天（360 tick）'},
    {real: '现实 1 天', game: '游戏 1 季度（春夏秋冬）'},
    {real: '现实 4 天', game: '游戏 1 年（地元历）'},
]

export const genderOptions: Array<{ value: CreatePlayerGender; label: string }> = [
    {value: 'male', label: '男'},
    {value: 'female', label: '女'},
    {value: 'other', label: '其他'},
]

export const birthIdentityOptions: Array<{ value: BirthIdentity; label: string }> = [
    {value: 'child', label: '孩子'},
    {value: 'adult', label: '成人'},
]

export const heroPlayObjects: HeroPlayObject[] = [
    {
        key: 'scarecrow',
        label: '稻草人',
        hint: '更多痕迹',
        sizeClass: 'w-32 sm:w-[8.5rem] md:w-36',
    },
    {
        key: 'dog',
        label: '看门狗',
        hint: '提高热度',
        sizeClass: 'w-32 sm:w-[8.5rem] md:w-36',
    },
    {
        key: 'baitField',
        label: '诱饵田',
        hint: '误导行动',
        sizeClass: 'w-32 sm:w-36 md:w-40',
    },
    {
        key: 'shed',
        label: '破草棚',
        hint: '藏起真相',
        sizeClass: 'w-32 sm:w-36 md:w-40',
    },
    {
        key: 'fakeWarehouse',
        label: '假仓库',
        hint: '诱导判断',
        sizeClass: 'w-32 sm:w-36 md:w-40',
    },
]

export const heroPlayPositionSlots = {
    left: [
        'left-[4%] bottom-[24%] md:left-[7%] md:bottom-auto md:top-[22%] lg:left-[10%]',
        'left-[5%] bottom-[32%] md:left-[12%] md:bottom-[24%]',
        'left-[3%] bottom-[18%] md:left-[18%] md:bottom-[35%]',
    ],
    right: [
        'right-[4%] bottom-[24%] md:right-[8%] md:bottom-auto md:top-[24%] lg:right-[11%]',
        'right-[5%] bottom-[32%] md:right-[13%] md:bottom-[24%]',
        'right-[3%] bottom-[18%] md:right-[18%] md:bottom-[35%]',
    ],
}

export const seasons = [
    {name: '春', label: '春', tone: 'border-[#8BC97A] bg-[#8BC97A]/15 text-[#3F7D3D]'},
    {name: '夏', label: '夏', tone: 'border-[#FFC65C] bg-[#FFC65C]/20 text-[#8A6420]'},
    {name: '秋', label: '秋', tone: 'border-[#F0A05C] bg-[#F0A05C]/18 text-[#8A4E20]'},
    {name: '冬', label: '冬', tone: 'border-[#9BC4E8] bg-[#9BC4E8]/20 text-[#3B668B]'},
]

export const seasonDayCount = 24
export const seasonHours = [
    {value: '子时', label: '子时'},
    {value: '丑时', label: '丑时'},
    {value: '寅时', label: '寅时'},
    {value: '卯时', label: '卯时'},
    {value: '辰时', label: '辰时'},
    {value: '巳时', label: '巳时'},
    {value: '午时', label: '午时'},
    {value: '未时', label: '未时'},
    {value: '申时', label: '申时'},
    {value: '酉时', label: '酉时'},
    {value: '戌时', label: '戌时'},
    {value: '亥时', label: '亥时'},
]

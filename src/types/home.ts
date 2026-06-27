export interface TimeInfo {
    year: number
    season: string
    day: number
    hour: string
    string: string
    diff_hour?: number
}

export interface VersionInfo {
    number: string
    time: string
    is_test: boolean
}

export interface SeasonHourItem {
    value: string
    label: string
}

export interface TimeFlowStep {
    real: string
    game: string
    note: string
}

export interface ChronicleItem {
    event_id: number
    text: string
    tick_format: {
        string: string
    }
}

export interface ChronicleResponse {
    page: number
    page_size: number
    total: number
    items: ChronicleItem[]
}

export interface WeatherItem {
    className: string
    style: Record<string, string>
}

export interface HeroPlayObject {
    key: string
    label: string
    hint: string
    sizeClass: string
}

export interface VisibleHeroPlayObject extends HeroPlayObject {
    className: string
}

export interface PlayerBirthFormat {
    string: string
}

export interface PlayerItem {
    player_id: string
    name: string
    gender: string
    gender_string: string
    avatar: string | null
    color: string | null
    manifesto: string | null
    tick_current_birth_format: PlayerBirthFormat | null
    tick_age_string: string | number | null
    reason_death: string | null
    is_can_play: boolean
}

export interface UpdatePlayerPayload {
    avatar?: string | null
    color?: string | null
    manifesto?: string | null
}

export interface PlayerListResponse {
    page: number
    page_size: number
    total: number
    items: PlayerItem[]
}

export type CreatePlayerGender = 'male' | 'female' | 'other'

export type BirthIdentity = 'child' | 'adult'

export interface MapZoneItem {
    id: number
    name: string
}

export interface CreatePlayerPayload {
    name: string
    gender: CreatePlayerGender
    village_id: number | null
}

export type WeatherName = 'spring-rain' | 'heavy-rain' | 'sunny' | 'drought' | 'mist' | 'thunderstorm'
export type IconName = 'plant' | 'trade' | 'alliance' | 'stealth' | 'ascension' | 'globe' | 'clock' | 'arrow'

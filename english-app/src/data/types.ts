export interface Word {
  chinese: string
  english: string
  pronunciation: string
  emoji: string
  category?: string
}

export interface Sentence {
  chinese: string
  english: string
  pronunciation: string
  category: string
  emoji?: string
  level: 'easy' | 'medium'
}

export interface Category {
  key: string
  label: string
  emoji: string
}

export interface WordProgress {
  level: 0 | 1 | 2 | 3
  streak: number
  lastSeen: number
  seenCount: number
  correctCount: number
}

export interface AppStats {
  totalStars: number
  todayStars: number
  streak: number
  lastPlayDate: string
}

export interface AppProgress {
  words: Record<string, WordProgress>
  sentences: Record<string, WordProgress>
  stats: AppStats
  todayReviewed: string[]
}

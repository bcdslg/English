import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WordProgress, AppStats } from '../data/types'

interface ProgressState {
  words: Record<string, WordProgress>
  sentences: Record<string, WordProgress>
  stats: AppStats
  todayReviewed: string[]

  recordAnswer: (key: string, correct: boolean, type: 'word' | 'sentence') => void
  markReviewed: (key: string) => void
  resetAll: () => void
  getLevel: (key: string, type: 'word' | 'sentence') => 0 | 1 | 2 | 3
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function computeLevel(streak: number): 0 | 1 | 2 | 3 {
  if (streak >= 5) return 3
  if (streak >= 3) return 2
  if (streak >= 1) return 1
  return 0
}

const initialStats: AppStats = {
  totalStars: 0,
  todayStars: 0,
  streak: 0,
  lastPlayDate: '',
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      words: {},
      sentences: {},
      stats: { ...initialStats },
      todayReviewed: [],

      recordAnswer: (key, correct, type) => {
        set((state) => {
          const map = type === 'word' ? { ...state.words } : { ...state.sentences }
          const existing = map[key] || { level: 0 as const, streak: 0, lastSeen: 0, seenCount: 0, correctCount: 0 }

          const newStreak = correct ? existing.streak + 1 : 0
          const newLevel = computeLevel(newStreak)
          const newCorrect = correct ? existing.correctCount + 1 : existing.correctCount

          map[key] = {
            level: newLevel,
            streak: newStreak,
            lastSeen: Date.now(),
            seenCount: existing.seenCount + 1,
            correctCount: newCorrect,
          }

          // Update stats
          const stats = { ...state.stats }
          const today = todayStr()

          if (stats.lastPlayDate !== today) {
            // New day - check streak
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().slice(0, 10)
            stats.streak = stats.lastPlayDate === yesterdayStr ? stats.streak + 1 : 1
            stats.todayStars = 0
            stats.lastPlayDate = today
          }

          if (correct) {
            stats.totalStars += 1
            stats.todayStars += 1
          }

          return type === 'word'
            ? { words: map, stats, todayReviewed: [...state.todayReviewed, key] }
            : { sentences: map, stats, todayReviewed: [...state.todayReviewed, key] }
        })
      },

      markReviewed: (key) => {
        set((state) => ({
          todayReviewed: state.todayReviewed.includes(key)
            ? state.todayReviewed
            : [...state.todayReviewed, key],
        }))
      },

      getLevel: (key, type) => {
        const map = type === 'word' ? get().words : get().sentences
        return map[key]?.level ?? 0
      },

      resetAll: () => {
        set({ words: {}, sentences: {}, stats: { ...initialStats }, todayReviewed: [] })
      },
    }),
    { name: 'english-cards-progress' }
  )
)

import { useCallback, useEffect, useMemo, useState } from 'react'
import { wordData } from '../data/words'
import { sentenceData } from '../data/sentences'
import { useProgressStore } from '../store/progressStore'
import { useSpeech } from '../hooks/useSpeech'
import { EmojiImg } from '../components/EmojiImg'
import { CelebrationOverlay } from '../components/CelebrationOverlay'
import { playCheerSound, playAwwSound, playCelebrationSound } from '../utils/sound'

interface ReviewItem {
  english: string
  chinese: string
  emoji?: string
  type: 'word' | 'sentence'
}

function getAllItems(): ReviewItem[] {
  const items: ReviewItem[] = []
  for (const [cat, words] of Object.entries(wordData)) {
    words.forEach(w => items.push({ english: w.english, chinese: w.chinese, emoji: w.emoji, type: 'word' }))
  }
  for (const sentences of Object.values(sentenceData)) {
    sentences.forEach(s => items.push({ english: s.english, chinese: s.chinese, emoji: s.emoji, type: 'sentence' }))
  }
  return items
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ReviewPage() {
  const { speakEn, speakCn } = useSpeech()
  const { words, sentences, stats, todayReviewed, recordAnswer, markReviewed } = useProgressStore()
  const [items, setItems] = useState<ReviewItem[]>([])
  const [ci, setCi] = useState(0)
  const [done, setDone] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [todayCount, setTodayCount] = useState(0)

  const TOTAL = 10

  // Select today's review items
  useEffect(() => {
    const all = getAllItems()
    const today = new Date().toISOString().slice(0, 10)
    const isNewDay = stats.lastPlayDate !== today

    // Priority: unseen > low level > medium level > need review
    const scored = all.map(item => {
      const prog = item.type === 'word' ? words[item.english] : sentences[item.english]
      const level = prog?.level ?? 0
      const reviewed = todayReviewed.includes(item.english)
      let score = 0
      if (level === 0) score = 100        // New word - highest priority
      else if (level === 1) score = 80     // Unfamiliar
      else if (level === 2) score = 50     // Learning
      else score = 20                       // Mastered - lowest
      if (!reviewed || isNewDay) score += 30 // Not yet reviewed today
      return { item, score }
    })

    scored.sort((a, b) => b.score - a.score)
    const selected = shuffle(scored.slice(0, Math.min(20, scored.length))).slice(0, TOTAL).map(s => s.item)
    setItems(selected)
    setCi(0)
    setDone(false)
    setTodayCount(0)
  }, []) // eslint-disable-line

  const current = items[ci]

  const handleKnow = useCallback(() => {
    if (!current) return
    playCheerSound()
    recordAnswer(current.english, true, current.type)
    markReviewed(current.english)
    setTodayCount(c => c + 1)
    if (ci + 1 >= items.length) {
      setDone(true)
      setCelebrate(true)
      playCelebrationSound()
    } else {
      setCi(ci + 1)
    }
  }, [current, ci, items, recordAnswer, markReviewed])

  const handleDontKnow = useCallback(() => {
    if (!current) return
    playAwwSound()
    setWrong(true)
    recordAnswer(current.english, false, current.type)
    markReviewed(current.english)
    setTimeout(() => {
      setWrong(false)
      if (ci + 1 >= items.length) {
        setDone(true)
        setCelebrate(true)
        playCelebrationSound()
      } else {
        setCi(ci + 1)
      }
    }, 1200)
  }, [current, ci, items, recordAnswer, markReviewed])

  if (items.length === 0) return null

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <CelebrationOverlay show={celebrate} type="confetti" message={`今日完成！`} onDone={() => setCelebrate(false)} />
        <div className="text-6xl mb-4">🎉</div>
        <div className="text-2xl font-extrabold text-gray-800 mb-2">今日复习完成！</div>
        <div className="text-lg text-gray-500 mb-4">复习了 {items.length} 个内容</div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🔥</span>
          <span className="text-xl font-bold text-orange-500">连续 {stats.streak} 天</span>
        </div>
        <div className="text-3xl mb-6">{'⭐'.repeat(todayCount)}</div>
        <div className="text-sm text-gray-400">明天继续加油！</div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-br from-amber-500 to-orange-400 pt-12 pb-6 px-5 text-center relative overflow-hidden">
        <div className="absolute -right-1/4 -top-1/2 w-3/5 h-[200%] bg-white/5 rounded-full rotate-12" />
        <h1 className="text-white text-2xl font-bold relative z-10">今日复习</h1>
        <div className="flex justify-center items-center gap-4 mt-3 relative z-10">
          <div className="flex items-center gap-1">
            <span className="text-2xl">🔥</span>
            <span className="text-white font-bold">{stats.streak} 天</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl">⭐</span>
            <span className="text-white font-bold">{stats.todayStars}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        <CelebrationOverlay show={wrong} type="wrong" onDone={() => setWrong(false)} />
        <div className="text-center text-sm text-gray-400 mb-4 font-semibold">
          {ci + 1} / {items.length}
        </div>

        {current && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center animate-modal-in">
            {current.emoji && <EmojiImg emoji={current.emoji} size={80} />}
            <div className="text-2xl font-extrabold text-gray-800 mt-4">{current.chinese}</div>
            <div className="text-xl font-bold text-indigo-600 mt-2">{current.english}</div>

            <div className="flex justify-center gap-3 mt-5 mb-6">
              <button
                onClick={() => speakCn(current.chinese)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white text-xl flex items-center justify-center shadow-md active:scale-90 transition-transform"
              >📢</button>
              <button
                onClick={() => speakEn(current.english, 0.65)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xl flex items-center justify-center shadow-md active:scale-90 transition-transform"
              >🔊</button>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleDontKnow}
                className="flex-1 max-w-[140px] py-4 bg-gray-100 text-gray-500 font-bold text-lg rounded-2xl shadow-sm active:scale-95 transition-transform"
              >
                ❌ 不会
              </button>
              <button
                onClick={handleKnow}
                className="flex-1 max-w-[140px] py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg rounded-2xl shadow-md active:scale-95 transition-transform"
              >
                ✅ 认识
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

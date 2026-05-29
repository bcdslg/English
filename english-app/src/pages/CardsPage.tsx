import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { wordCategories, wordData } from '../data/words'
import type { Word } from '../data/types'
import { useProgressStore } from '../store/progressStore'
import { useSpeech } from '../hooks/useSpeech'
import { EmojiImg } from '../components/EmojiImg'
import { StarRating } from '../components/StarRating'
import { SpeakButton } from '../components/SpeakButton'

const CATEGORY_COLORS: Record<string, string> = {
  fruits: 'bg-green-500', toys: 'bg-yellow-500', furniture: 'bg-orange-500',
  appliances: 'bg-blue-500', daily: 'bg-purple-500', clothes: 'bg-pink-500',
  transport: 'bg-teal-500', animals: 'bg-orange-600', body: 'bg-rose-500', food: 'bg-orange-400',
}

type WordWithCat = Word & { category: string }

export function CardsPage() {
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const [detailIdx, setDetailIdx] = useState<number | null>(null)
  const [slideDir, setSlideDir] = useState<'none' | 'left' | 'right'>('none')
  const { speakCn, speakEn } = useSpeech()
  const getLevel = useProgressStore(s => s.getLevel)
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })

  const allWords = useMemo(() => {
    const arr: WordWithCat[] = []
    for (const [category, words] of Object.entries(wordData)) {
      words.forEach(w => arr.push({ ...w, category }))
    }
    return arr
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return allWords.filter(w => {
      const catOk = cat === 'all' || w.category === cat
      const qOk = !q || w.chinese.includes(q) || w.english.toLowerCase().includes(q) || w.pronunciation.toLowerCase().includes(q)
      return catOk && qOk
    })
  }, [allWords, cat, query])

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: allWords.length }
    for (const [k, v] of Object.entries(wordData)) m[k] = v.length
    return m
  }, [allWords])

  const detail = detailIdx !== null ? filtered[detailIdx] : null

  const navigate = useCallback((dir: -1 | 1) => {
    if (detailIdx === null) return
    const newIdx = detailIdx + dir
    if (newIdx < 0 || newIdx >= filtered.length) return
    setSlideDir(dir > 0 ? 'left' : 'right')
    setTimeout(() => {
      setDetailIdx(newIdx)
      setSlideDir(dir > 0 ? 'right' : 'left')
      setTimeout(() => setSlideDir('none'), 300)
    }, 250)
  }, [detailIdx, filtered.length])

  // Keyboard nav
  useEffect(() => {
    if (detailIdx === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailIdx(null)
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [detailIdx, navigate])

  // Touch swipe on modal
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    const dt = Date.now() - touchStartRef.current.time
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 500) {
      navigate(dx < 0 ? 1 : -1)
    }
  }

  const slideClass = slideDir === 'left' ? 'animate-slide-out-left' : slideDir === 'right' ? 'animate-slide-in-right' : ''

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 pt-12 pb-6 px-5 text-center relative overflow-hidden">
        <div className="absolute -left-1/4 -top-1/2 w-3/5 h-[200%] bg-white/5 rounded-full -rotate-12" />
        <h1 className="text-white text-2xl font-bold relative z-10">儿童英语单词卡</h1>
        <p className="text-white/80 text-sm mt-1 relative z-10">点击卡片听发音，学习身边常见事物</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-b-3xl shadow-md px-4 pt-4 pb-3 sticky top-0 z-50">
        <div className="relative mb-3">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 fill-gray-400" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索中文或英文..."
            className="w-full py-3 pl-10 pr-4 text-sm border-2 border-gray-100 rounded-2xl bg-gray-50 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {wordCategories.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                cat === c.key
                  ? 'bg-indigo-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {c.emoji} {c.label}
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md ${cat === c.key ? 'bg-white/20' : 'bg-black/5'}`}>
                {counts[c.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pt-4 pb-4 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12 text-lg">没有找到匹配的单词</div>
        ) : filtered.map((w, i) => (
          <div
            key={`${w.category}-${w.english}`}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.97] transition-all cursor-pointer overflow-hidden animate-card-in"
            style={{ animationDelay: `${Math.min(i * 0.02, 0.6)}s` }}
            onClick={() => { setDetailIdx(i); setSlideDir('none') }}
          >
            <div className={`h-1.5 ${CATEGORY_COLORS[w.category ?? ''] || 'bg-indigo-500'}`} />
            <div className="p-3.5 flex flex-col items-center gap-1">
              <EmojiImg emoji={w.emoji} size={60} />
              <div className="text-base font-bold text-gray-800 flex items-center gap-1">
                {w.chinese}
                <StarRating level={getLevel(w.english, 'word')} />
              </div>
              <div className="text-sm font-bold text-indigo-500">{w.english}</div>
              <div className="text-xs text-gray-400 italic">{w.pronunciation}</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={e => { e.stopPropagation(); speakEn(w.english) }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm flex items-center justify-center shadow-md active:scale-90 transition-transform"
                >🔊</button>
                <button
                  onClick={e => { e.stopPropagation(); speakEn(w.english, 0.5) }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-green-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md active:scale-90 transition-transform"
                >慢</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-gray-400 text-sm pb-4">共 {filtered.length} 个单词</div>

      {/* Detail Modal with navigation */}
      {detail && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDetailIdx(null)}>
          {/* Prev arrow */}
          {detailIdx! > 0 && (
            <button
              onClick={e => { e.stopPropagation(); navigate(-1) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-500 hover:bg-white active:scale-90 transition-transform z-10"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
          )}
          {/* Next arrow */}
          {detailIdx! < filtered.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); navigate(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-500 hover:bg-white active:scale-90 transition-transform z-10"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          )}
          <div
            ref={cardRef}
            className={`bg-white rounded-3xl shadow-2xl w-[90vw] max-w-[400px] overflow-hidden ${slideDir === 'none' ? 'animate-modal-in' : slideClass}`}
            onClick={e => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className={`h-1.5 ${CATEGORY_COLORS[detail.category ?? ''] || 'bg-indigo-500'}`} />
            <div className="p-6 text-center">
              <EmojiImg emoji={detail.emoji} size={100} />
              <div className="text-2xl font-extrabold text-gray-800 mt-3">{detail.chinese}</div>
              <div className="text-xl font-extrabold text-indigo-500 mt-1">{detail.english}</div>
              <div className="text-base text-gray-400 italic mt-1">{detail.pronunciation}</div>
              <div className="flex gap-3 justify-center mt-5">
                <SpeakButton text={detail.chinese} lang="zh-CN" label="📢 中文" variant="secondary" size="lg" />
                <SpeakButton text={detail.english} lang="en-US" label="🔊 English" variant="primary" size="lg" />
              </div>
              <div className="mt-3"><StarRating level={getLevel(detail.english, 'word')} size="md" /></div>
              <div className="text-xs text-gray-300 mt-2">{detailIdx! + 1} / {filtered.length}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

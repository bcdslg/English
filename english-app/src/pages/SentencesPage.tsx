import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sentenceCategories, sentenceData } from '../data/sentences'
import type { Sentence } from '../data/types'
import { useProgressStore } from '../store/progressStore'
import { useSpeech } from '../hooks/useSpeech'
import { EmojiImg } from '../components/EmojiImg'
import { StarRating } from '../components/StarRating'
import { SpeakButton } from '../components/SpeakButton'

const CAT_COLORS: Record<string, string> = {
  greeting: 'bg-pink-500', daily: 'bg-amber-500', food: 'bg-orange-500',
  play: 'bg-green-500', school: 'bg-blue-500', family: 'bg-purple-500', feelings: 'bg-rose-500',
}

export function SentencesPage() {
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const [detailIdx, setDetailIdx] = useState<number | null>(null)
  const [slideDir, setSlideDir] = useState<'none' | 'left' | 'right'>('none')
  const { speakCn, speakEn } = useSpeech()
  const getLevel = useProgressStore(s => s.getLevel)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })

  const allSentences = useMemo(() => {
    const arr: Sentence[] = []
    for (const sentences of Object.values(sentenceData)) {
      sentences.forEach(s => arr.push(s))
    }
    return arr
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return allSentences.filter(s => {
      const catOk = cat === 'all' || s.category === cat
      const qOk = !q || s.chinese.includes(q) || s.english.toLowerCase().includes(q)
      return catOk && qOk
    })
  }, [allSentences, cat, query])

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: allSentences.length }
    for (const [k, v] of Object.entries(sentenceData)) m[k] = v.length
    return m
  }, [allSentences])

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
      <div className="bg-gradient-to-br from-pink-500 to-rose-500 pt-12 pb-6 px-5 text-center relative overflow-hidden">
        <div className="absolute -right-1/4 -top-1/2 w-3/5 h-[200%] bg-white/5 rounded-full rotate-12" />
        <h1 className="text-white text-2xl font-bold relative z-10">英语句子卡</h1>
        <p className="text-white/80 text-sm mt-1 relative z-10">学说简单英语句子</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-b-3xl shadow-md px-4 pt-4 pb-3 sticky top-0 z-50">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索句子..."
          className="w-full py-3 px-4 text-sm border-2 border-gray-100 rounded-2xl bg-gray-50 focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 outline-none transition mb-3"
        />
        <div className="flex flex-wrap gap-2 justify-center">
          {sentenceCategories.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                cat === c.key
                  ? 'bg-pink-500 text-white shadow-md scale-105'
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

      {/* Cards */}
      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-lg">没有找到匹配的句子</div>
        ) : filtered.map((s, i) => (
          <div
            key={s.english}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden animate-card-in"
            style={{ animationDelay: `${Math.min(i * 0.03, 0.6)}s` }}
            onClick={() => { setDetailIdx(i); setSlideDir('none') }}
          >
            <div className={`h-1 ${CAT_COLORS[s.category] || 'bg-pink-500'}`} />
            <div className="p-4 flex items-center gap-3">
              {s.emoji && <EmojiImg emoji={s.emoji} size={44} />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-gray-800">{s.chinese}</span>
                  <StarRating level={getLevel(s.english, 'sentence')} />
                </div>
                <div className="text-sm font-semibold text-pink-500 mt-0.5">{s.english}</div>
                <div className="text-xs text-gray-400 italic">{s.pronunciation}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); speakEn(s.english) }}
                className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white text-base flex items-center justify-center shadow-md active:scale-90 transition-transform"
              >🔊</button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal with navigation */}
      {detail && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDetailIdx(null)}>
          {detailIdx! > 0 && (
            <button
              onClick={e => { e.stopPropagation(); navigate(-1) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-500 hover:bg-white active:scale-90 transition-transform z-10"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
          )}
          {detailIdx! < filtered.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); navigate(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-500 hover:bg-white active:scale-90 transition-transform z-10"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          )}
          <div
            className={`bg-white rounded-3xl shadow-2xl w-[92vw] max-w-[440px] overflow-hidden ${slideDir === 'none' ? 'animate-modal-in' : slideClass}`}
            onClick={e => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className={`h-1.5 ${CAT_COLORS[detail.category] || 'bg-pink-500'}`} />
            <div className="p-6 text-center">
              {detail.emoji && <EmojiImg emoji={detail.emoji} size={80} />}
              <div className="text-xl font-extrabold text-gray-800 mt-4">{detail.chinese}</div>
              <div className="text-lg font-bold text-pink-500 mt-2">{detail.english}</div>
              <div className="text-sm text-gray-400 italic mt-1">{detail.pronunciation}</div>
              <div className="flex gap-3 justify-center mt-5">
                <SpeakButton text={detail.chinese} lang="zh-CN" label="📢 中文" variant="secondary" size="lg" />
                <SpeakButton text={detail.english} lang="en-US" label="🔊 English" variant="primary" size="lg" rate={0.65} />
              </div>
              <div className="text-xs text-gray-300 mt-3">{detailIdx! + 1} / {filtered.length}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

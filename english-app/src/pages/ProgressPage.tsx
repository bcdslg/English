import { useMemo } from 'react'
import { wordCategories, wordData } from '../data/words'
import { sentenceCategories, sentenceData } from '../data/sentences'
import { useProgressStore } from '../store/progressStore'

export function ProgressPage() {
  const { words, sentences, stats, resetAll } = useProgressStore()

  const wordStats = useMemo(() => {
    const cats = wordCategories.filter(c => c.key !== 'all')
    return cats.map(cat => {
      const items = wordData[cat.key] || []
      const mastered = items.filter(w => (words[w.english]?.level ?? 0) === 3).length
      const learning = items.filter(w => {
        const l = words[w.english]?.level ?? 0
        return l === 1 || l === 2
      }).length
      return { ...cat, total: items.length, mastered, learning }
    })
  }, [words])

  const sentenceStats = useMemo(() => {
    const cats = sentenceCategories.filter(c => c.key !== 'all')
    return cats.map(cat => {
      const items = sentenceData[cat.key] || []
      const mastered = items.filter(s => (sentences[s.english]?.level ?? 0) === 3).length
      const learning = items.filter(s => {
        const l = sentences[s.english]?.level ?? 0
        return l === 1 || l === 2
      }).length
      return { ...cat, total: items.length, mastered, learning }
    })
  }, [sentences])

  const totalMasteredWords = wordStats.reduce((s, c) => s + c.mastered, 0)
  const totalWords = wordStats.reduce((s, c) => s + c.total, 0)
  const totalMasteredSentences = sentenceStats.reduce((s, c) => s + c.mastered, 0)
  const totalSentences = sentenceStats.reduce((s, c) => s + c.total, 0)

  const handleReset = () => {
    if (confirm('确定要重置所有学习数据吗？此操作不可撤销。')) {
      resetAll()
    }
  }

  return (
    <>
      <div className="bg-gradient-to-br from-yellow-500 to-amber-400 pt-12 pb-6 px-5 text-center relative overflow-hidden">
        <div className="absolute -left-1/4 -top-1/2 w-3/5 h-[200%] bg-white/5 rounded-full -rotate-12" />
        <h1 className="text-white text-2xl font-bold relative z-10">学习进度</h1>
      </div>

      <div className="px-4 pt-5 pb-4 flex flex-col gap-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">⭐</div>
            <div className="text-xl font-extrabold text-yellow-500">{stats.totalStars}</div>
            <div className="text-xs text-gray-400 mt-0.5">总星星</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-xl font-extrabold text-orange-500">{stats.streak}</div>
            <div className="text-xs text-gray-400 mt-0.5">连续天数</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-xl font-extrabold text-green-500">{totalMasteredWords + totalMasteredSentences}</div>
            <div className="text-xs text-gray-400 mt-0.5">已掌握</div>
          </div>
        </div>

        {/* Word progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-800 text-base">📚 单词进度</h2>
            <span className="text-xs text-gray-400">{totalMasteredWords} / {totalWords} 已掌握</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {wordStats.map(({ key, ...rest }) => (
              <ProgressRow key={key} {...rest} />
            ))}
          </div>
        </div>

        {/* Sentence progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-800 text-base">💬 句子进度</h2>
            <span className="text-xs text-gray-400">{totalMasteredSentences} / {totalSentences} 已掌握</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {sentenceStats.map(({ key, ...rest }) => (
              <ProgressRow key={key} {...rest} />
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="text-center text-xs text-gray-300 py-4 active:text-red-400 transition-colors"
        >
          长按重置所有数据
        </button>
      </div>
    </>
  )
}

function ProgressRow({ emoji, label, total, mastered, learning }: { emoji: string; label: string; total: number; mastered: number; learning: number }) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="font-semibold text-gray-600">{emoji} {label}</span>
        <span className="text-gray-400">
          <span className="text-green-500 font-bold">{mastered}</span>
          {learning > 0 && <span className="text-yellow-500 font-bold ml-1">+{learning}学习中</span>}
          <span className="ml-1">/{total}</span>
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

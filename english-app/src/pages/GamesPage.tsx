import { useCallback, useEffect, useMemo, useState } from 'react'
import { wordData } from '../data/words'
import { sentenceData } from '../data/sentences'
import { useProgressStore } from '../store/progressStore'
import { useSpeech } from '../hooks/useSpeech'
import { EmojiImg } from '../components/EmojiImg'
import { CelebrationOverlay } from '../components/CelebrationOverlay'
import { playCheerSound, playAwwSound, playCelebrationSound } from '../utils/sound'

type GameMode = 'menu' | 'listen' | 'match' | 'spell'
type ContentType = 'words' | 'sentences'

// --- Helpers ---
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface GameItem {
  chinese: string
  english: string
  pronunciation: string
  emoji?: string
  category?: string
  level?: 'easy' | 'medium'
}

function getAllWords(): GameItem[] {
  const arr: GameItem[] = []
  for (const [cat, words] of Object.entries(wordData)) {
    words.forEach(w => arr.push({ ...w, category: cat }))
  }
  return arr
}

function getAllSentences(): GameItem[] {
  const arr: GameItem[] = []
  for (const sentences of Object.values(sentenceData)) {
    sentences.forEach(s => arr.push(s))
  }
  return arr
}

// ===================== LISTEN & PICK =====================
function ListenGame({ contentType, onBack }: { contentType: ContentType; onBack: () => void }) {
  const allItems = useMemo(() => contentType === 'words' ? getAllWords() : getAllSentences(), [contentType])
  const [questions, setQuestions] = useState<typeof allItems>([])
  const [qi, setQi] = useState(0)
  const [options, setOptions] = useState<typeof allItems>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [wrong, setWrong] = useState(false)
  const { speakEn } = useSpeech()
  const recordAnswer = useProgressStore(s => s.recordAnswer)

  const TOTAL = 10

  useEffect(() => {
    const q = shuffle(allItems).slice(0, TOTAL)
    setQuestions(q)
  }, [allItems])

  useEffect(() => {
    if (questions.length === 0 || qi >= questions.length) return
    const correct = questions[qi]
    const others = shuffle(allItems.filter(i => i.english !== correct.english)).slice(0, 3)
    setOptions(shuffle([correct, ...others]))
    setSelected(null)
    // Auto speak
    setTimeout(() => speakEn(correct.english, 0.7), 400)
  }, [qi, questions, allItems, speakEn])

  const handlePick = useCallback((idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    const isCorrect = options[idx].english === questions[qi].english
    if (isCorrect) {
      playCheerSound()
      setScore(s => s + 1)
      recordAnswer(questions[qi].english, true, contentType === 'words' ? 'word' : 'sentence')
    } else {
      playAwwSound()
      setWrong(true)
      recordAnswer(questions[qi].english, false, contentType === 'words' ? 'word' : 'sentence')
    }
    setTimeout(() => {
      setWrong(false)
      if (qi + 1 >= questions.length) {
        setDone(true)
        setCelebrate(true)
        playCelebrationSound()
      } else {
        setQi(qi + 1)
      }
    }, 1200)
  }, [selected, options, qi, questions, recordAnswer, contentType])

  if (questions.length === 0) return null

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <CelebrationOverlay show={celebrate} type="confetti" message={`太棒了！${score}/${TOTAL}`} onDone={() => setCelebrate(false)} />
        <div className="text-6xl mb-4">🎉</div>
        <div className="text-2xl font-extrabold text-gray-800 mb-2">游戏结束！</div>
        <div className="text-lg text-gray-500 mb-6">答对 {score} / {TOTAL} 题</div>
        <div className="text-4xl mb-6">{'⭐'.repeat(Math.min(score, 10))}</div>
        <button onClick={onBack} className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
          返回
        </button>
      </div>
    )
  }

  const q = questions[qi]
  const isWord = contentType === 'words'

  return (
    <div className="px-4 pt-4">
      <CelebrationOverlay show={celebrate} type="stars" onDone={() => setCelebrate(false)} />
      <CelebrationOverlay show={wrong} type="wrong" onDone={() => setWrong(false)} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-indigo-500 font-bold text-sm">← 返回</button>
        <span className="text-sm text-gray-400 font-semibold">{qi + 1} / {TOTAL}</span>
        <span className="text-sm font-bold text-yellow-500">⭐ {score}</span>
      </div>

      <div className="text-center mb-6">
        <div className="text-gray-400 text-sm mb-2">听一听，选出正确的{isWord ? '图片' : '句子'}：</div>
        <button
          onClick={() => speakEn(q.english, 0.65)}
          className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-3xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >🔊</button>
        <div className="text-lg font-bold text-indigo-600 mt-3">{q.english}</div>
      </div>

      <div className={`grid ${isWord ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {options.map((opt, idx) => {
          const isSelected = selected === idx
          const isCorrect = opt.english === q.english
          let border = 'border-2 border-transparent'
          if (selected !== null) {
            if (isSelected && isCorrect) border = 'border-4 border-green-400 bg-green-50'
            else if (isSelected && !isCorrect) border = 'border-4 border-red-300 bg-red-50'
            else if (isCorrect) border = 'border-4 border-green-300'
          }
          return (
            <button
              key={idx}
              onClick={() => handlePick(idx)}
              disabled={selected !== null}
              className={`rounded-2xl p-5 flex flex-col items-center gap-2 shadow-md transition-all active:scale-95 ${border} ${selected === null ? 'bg-white hover:shadow-lg' : 'bg-white'}`}
            >
              {opt.emoji && <EmojiImg emoji={opt.emoji} size={isWord ? 64 : 40} />}
              <div className={`text-sm font-bold ${isWord ? 'text-gray-700' : 'text-pink-600'} text-center`}>
                {opt.chinese}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ===================== MATCH GAME =====================
function MatchGame({ contentType, onBack }: { contentType: ContentType; onBack: () => void }) {
  const allItems = useMemo(() => contentType === 'words' ? getAllWords() : getAllSentences(), [contentType])
  const [pairs, setPairs] = useState<typeof allItems>([])
  const [cards, setCards] = useState<{ id: number; text: string; pairIdx: number; side: 'left' | 'right'; emoji?: string }[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [wrongPair, setWrongPair] = useState<number[] | null>(null)
  const { speakEn } = useSpeech()
  const recordAnswer = useProgressStore(s => s.recordAnswer)

  const PAIRS_COUNT = 6

  useEffect(() => {
    const selected = shuffle(allItems).slice(0, PAIRS_COUNT)
    setPairs(selected)
    const lefts = selected.map((s, i) => ({ id: i * 2, text: s.chinese, pairIdx: i, side: 'left' as const, emoji: s.emoji }))
    const rights = selected.map((s, i) => ({ id: i * 2 + 1, text: s.english, pairIdx: i, side: 'right' as const }))
    setCards(shuffle([...lefts, ...rights]))
  }, [allItems])

  const handleFlip = useCallback((cardId: number) => {
    if (flipped.length >= 2) return
    if (matched.has(cardId)) return
    if (flipped.includes(cardId)) return

    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      const c1 = cards.find(c => c.id === newFlipped[0])!
      const c2 = cards.find(c => c.id === newFlipped[1])!
      if (c1.pairIdx === c2.pairIdx && c1.side !== c2.side) {
        // Match!
        playCheerSound()
        const item = pairs[c1.pairIdx]
        recordAnswer(item.english, true, contentType === 'words' ? 'word' : 'sentence')
        setTimeout(() => {
          const newMatched = new Set([...matched, c1.id, c2.id])
          setMatched(newMatched)
          setFlipped([])
          if (newMatched.size === cards.length) {
            setDone(true)
            setCelebrate(true)
            playCelebrationSound()
          }
        }, 500)
      } else {
        // No match
        setWrongPair(newFlipped)
        playAwwSound()
        setTimeout(() => {
          setFlipped([])
          setWrongPair(null)
        }, 800)
      }
    }
  }, [flipped, matched, cards, pairs, recordAnswer, contentType])

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <CelebrationOverlay show={celebrate} type="confetti" message="全部配对成功！" onDone={() => setCelebrate(false)} />
        <div className="text-6xl mb-4">🎊</div>
        <div className="text-2xl font-extrabold text-gray-800 mb-6">太厉害了！</div>
        <div className="text-4xl mb-6">{'⭐'.repeat(PAIRS_COUNT)}</div>
        <button onClick={onBack} className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4">
      <CelebrationOverlay show={celebrate} type="stars" onDone={() => setCelebrate(false)} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-indigo-500 font-bold text-sm">← 返回</button>
        <span className="text-sm text-gray-400 font-semibold">配对 {matched.size / 2} / {PAIRS_COUNT}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id)
          const isMatched = matched.has(card.id)
          const isWrong = wrongPair?.includes(card.id)
          let bg = 'bg-white'
          if (isMatched) bg = 'bg-green-100 border-2 border-green-300'
          else if (isWrong) bg = 'bg-red-50 border-2 border-red-300'
          else if (isFlipped) bg = 'bg-indigo-50 border-2 border-indigo-300'

          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              disabled={isMatched}
              className={`rounded-2xl p-3 min-h-[80px] flex flex-col items-center justify-center gap-1 shadow-sm transition-all active:scale-95 ${bg} ${isMatched ? 'opacity-60' : ''}`}
            >
              {isFlipped || isMatched ? (
                <>
                  {card.emoji && <EmojiImg emoji={card.emoji} size={28} />}
                  <span className={`text-xs font-bold text-center leading-tight ${card.side === 'left' ? 'text-gray-700' : 'text-pink-600'}`}>
                    {card.text}
                  </span>
                </>
              ) : (
                <span className="text-2xl">❓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ===================== SPELL GAME =====================
function SpellGame({ contentType, onBack }: { contentType: ContentType; onBack: () => void }) {
  const allItems = useMemo(() => {
    const items = contentType === 'words' ? getAllWords() : getAllSentences()
    // For words: only short words (<=8 chars). For sentences: only short sentences
    return items.filter(item => {
      if (contentType === 'words') return item.english.replace(/[^a-zA-Z]/g, '').length <= 8
      return item.english.split(/\s+/).length <= 5
    })
  }, [contentType])

  const [questions, setQuestions] = useState<typeof allItems>([])
  const [qi, setQi] = useState(0)
  const [shuffledParts, setShuffledParts] = useState<{ text: string; idx: number }[]>([])
  const [picked, setPicked] = useState<{ text: string; idx: number }[]>([])
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [wrong, setWrong] = useState(false)
  const { speakEn } = useSpeech()
  const recordAnswer = useProgressStore(s => s.recordAnswer)

  const TOTAL = 8

  useEffect(() => {
    const q = shuffle(allItems).slice(0, TOTAL)
    setQuestions(q)
  }, [allItems])

  useEffect(() => {
    if (questions.length === 0 || qi >= questions.length) return
    const item = questions[qi]
    const isWord = contentType === 'words'

    if (isWord) {
      // Split into letters
      const letters = item.english.toLowerCase().split('')
      setShuffledParts(shuffle(letters.map((l, i) => ({ text: l, idx: i }))))
    } else {
      // Split into words
      const words = item.english.replace(/[.!?,]/g, '').split(/\s+/)
      setShuffledParts(shuffle(words.map((w, i) => ({ text: w, idx: i }))))
    }
    setPicked([])
    setResult(null)
    setTimeout(() => speakEn(item.english, 0.6), 400)
  }, [qi, questions, contentType, speakEn])

  const correctAnswer = questions[qi]?.english ?? ''
  const isWord = contentType === 'words'
  const target = isWord ? correctAnswer.toLowerCase() : correctAnswer.replace(/[.!?,]/g, '')

  const handlePick = (part: { text: string; idx: number }) => {
    if (result) return
    setPicked([...picked, part])
    setShuffledParts(shuffledParts.filter(p => p.idx !== part.idx || p.text !== part.text))
  }

  const handleUnpick = (i: number) => {
    if (result) return
    const removed = picked[i]
    setPicked(picked.filter((_, idx) => idx !== i))
    setShuffledParts([...shuffledParts, removed])
  }

  useEffect(() => {
    if (picked.length === 0) return
    const answer = isWord
      ? picked.map(p => p.text).join('')
      : picked.map(p => p.text).join(' ')

    if (answer === target.toLowerCase()) {
      setResult('correct')
      playCheerSound()
      setScore(s => s + 1)
      recordAnswer(correctAnswer, true, contentType === 'words' ? 'word' : 'sentence')
      setTimeout(() => {
        if (qi + 1 >= TOTAL || qi + 1 >= questions.length) {
          setDone(true)
          setCelebrate(true)
          playCelebrationSound()
        } else {
          setQi(qi + 1)
        }
      }, 1200)
    } else if (answer.length >= target.length) {
      setResult('wrong')
      playAwwSound()
      recordAnswer(correctAnswer, false, contentType === 'words' ? 'word' : 'sentence')
      setTimeout(() => {
        if (qi + 1 >= TOTAL || qi + 1 >= questions.length) {
          setDone(true)
          setCelebrate(true)
        } else {
          setQi(qi + 1)
        }
      }, 1500)
    }
  }, [picked, target, isWord, qi, questions, correctAnswer, recordAnswer, contentType])

  if (questions.length === 0) return null

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <CelebrationOverlay show={celebrate} type="confetti" message={`完成！${score}/${Math.min(TOTAL, questions.length)}`} onDone={() => setCelebrate(false)} />
        <div className="text-6xl mb-4">🏆</div>
        <div className="text-2xl font-extrabold text-gray-800 mb-2">拼写完成！</div>
        <div className="text-lg text-gray-500 mb-6">答对 {score} / {Math.min(TOTAL, questions.length)} 题</div>
        <div className="text-4xl mb-6">{'⭐'.repeat(Math.min(score, 10))}</div>
        <button onClick={onBack} className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
          返回
        </button>
      </div>
    )
  }

  const q = questions[qi]

  return (
    <div className="px-4 pt-4">
      <CelebrationOverlay show={celebrate} type="stars" onDone={() => setCelebrate(false)} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-indigo-500 font-bold text-sm">← 返回</button>
        <span className="text-sm text-gray-400 font-semibold">{qi + 1} / {Math.min(TOTAL, questions.length)}</span>
        <span className="text-sm font-bold text-yellow-500">⭐ {score}</span>
      </div>

      <div className="text-center mb-4">
        <div className="text-gray-400 text-sm mb-2">听一听，把{isWord ? '字母' : '单词'}排好顺序：</div>
        <button
          onClick={() => speakEn(q.english, 0.6)}
          className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >🔊</button>
        <div className="text-base text-gray-400 mt-2 italic">{q.pronunciation}</div>
      </div>

      {/* Answer area */}
      <div className={`min-h-[60px] rounded-2xl border-2 border-dashed p-3 flex flex-wrap gap-2 justify-center items-center mb-4 ${
        result === 'correct' ? 'border-green-400 bg-green-50' : result === 'wrong' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
      }`}>
        {picked.length === 0 ? (
          <span className="text-gray-300 text-sm">点击下方{isWord ? '字母' : '单词'}拼出来</span>
        ) : picked.map((p, i) => (
          <button
            key={`picked-${i}`}
            onClick={() => handleUnpick(i)}
            className={`px-3 py-2 rounded-xl font-bold shadow-sm active:scale-90 transition-transform ${
              isWord ? 'text-lg min-w-[40px]' : 'text-sm'
            } ${result === 'correct' ? 'bg-green-200 text-green-800' : result === 'wrong' ? 'bg-red-200 text-red-800' : 'bg-indigo-100 text-indigo-700'}`}
          >
            {p.text}
          </button>
        ))}
      </div>

      {/* Available parts */}
      <div className="flex flex-wrap gap-2 justify-center">
        {shuffledParts.map((p, i) => (
          <button
            key={`avail-${p.idx}-${i}`}
            onClick={() => handlePick(p)}
            className={`px-4 py-3 rounded-xl font-bold bg-white shadow-md border-2 border-gray-100 active:scale-90 transition-transform hover:border-indigo-300 ${
              isWord ? 'text-xl min-w-[48px]' : 'text-base'
            }`}
          >
            {p.text}
          </button>
        ))}
      </div>

      {result === 'correct' && (
        <div className="text-center mt-4 text-green-600 font-bold text-lg animate-bounce">太棒了！✨</div>
      )}
      {result === 'wrong' && (
        <div className="text-center mt-4">
          <div className="text-gray-500 text-sm mb-1">正确答案：</div>
          <div className="text-indigo-600 font-bold text-lg">{correctAnswer}</div>
        </div>
      )}
    </div>
  )
}

// ===================== GAME MENU =====================
export function GamesPage() {
  const [game, setGame] = useState<GameMode>('menu')
  const [contentType, setContentType] = useState<ContentType>('words')

  if (game === 'listen') return <ListenGame contentType={contentType} onBack={() => setGame('menu')} />
  if (game === 'match') return <MatchGame contentType={contentType} onBack={() => setGame('menu')} />
  if (game === 'spell') return <SpellGame contentType={contentType} onBack={() => setGame('menu')} />

  return (
    <>
      <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 pt-12 pb-6 px-5 text-center relative overflow-hidden">
        <div className="absolute -left-1/4 -top-1/2 w-3/5 h-[200%] bg-white/5 rounded-full -rotate-12" />
        <h1 className="text-white text-2xl font-bold relative z-10">游戏乐园</h1>
        <p className="text-white/80 text-sm mt-1 relative z-10">选一个游戏开始玩吧！</p>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* Content type toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button
            onClick={() => setContentType('words')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${contentType === 'words' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}
          >📚 单词模式</button>
          <button
            onClick={() => setContentType('sentences')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${contentType === 'sentences' ? 'bg-white shadow-md text-pink-600' : 'text-gray-400'}`}
          >💬 句子模式</button>
        </div>

        {/* Game cards */}
        {[
          { mode: 'listen' as GameMode, emoji: '👂', title: '听音选图', desc: '听发音选出正确的图片', color: 'from-blue-500 to-cyan-400' },
          { mode: 'match' as GameMode, emoji: '🃏', title: '翻牌配对', desc: '翻开两张牌找到配对', color: 'from-orange-400 to-amber-400' },
          { mode: 'spell' as GameMode, emoji: '✏️', title: '听音拼词', desc: '听发音拼出正确的单词', color: 'from-green-500 to-teal-400' },
        ].map(g => (
          <button
            key={g.mode}
            onClick={() => setGame(g.mode)}
            className={`bg-gradient-to-r ${g.color} rounded-3xl p-6 text-left text-white shadow-lg active:scale-[0.97] transition-transform`}
          >
            <div className="text-4xl mb-2">{g.emoji}</div>
            <div className="text-xl font-extrabold">{g.title}</div>
            <div className="text-sm opacity-80 mt-1">{g.desc}</div>
          </button>
        ))}
      </div>
    </>
  )
}

import { useEffect, useState } from 'react'

interface Props {
  show: boolean
  type?: 'stars' | 'confetti'
  message?: string
  onDone?: () => void
}

const EMOJIS_STARS = ['⭐', '🌟', '✨', '💫', '🎉']
const EMOJIS_CONFETTI = ['🎊', '🎉', '🌈', '💖', '🥳', '✨', '⭐']

export function CelebrationOverlay({ show, type = 'stars', message, onDone }: Props) {
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number; delay: number; size: number }[]>([])

  useEffect(() => {
    if (!show) {
      setParticles([])
      return
    }
    const pool = type === 'stars' ? EMOJIS_STARS : EMOJIS_CONFETTI
    const count = type === 'stars' ? 20 : 30
    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: pool[i % pool.length],
      x: Math.random() * 100,
      y: -10 - Math.random() * 30,
      delay: Math.random() * 0.5,
      size: 18 + Math.random() * 24,
    }))
    setParticles(items)
    const timer = setTimeout(() => onDone?.(), 2000)
    return () => clearTimeout(timer)
  }, [show, type, onDone])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[3000] pointer-events-none overflow-hidden">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute animate-celebration-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      {message && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-celebration-pop text-3xl font-extrabold text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 rounded-3xl shadow-2xl">
            {message}
          </div>
        </div>
      )}
    </div>
  )
}

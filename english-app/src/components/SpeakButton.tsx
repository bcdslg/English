import { useSpeech } from '../hooks/useSpeech'

interface SpeakButtonProps {
  text: string
  lang: 'en-US' | 'zh-CN'
  label: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  rate?: number
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'px-6 py-3 text-lg rounded-2xl',
}

export function SpeakButton({ text, lang, label, variant = 'primary', size = 'md', rate }: SpeakButtonProps) {
  const { speak } = useSpeech()
  const bg = variant === 'primary'
    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-indigo-200'
    : 'bg-gradient-to-br from-pink-400 to-rose-500 shadow-pink-200'

  return (
    <button
      onClick={() => speak(text, lang, rate)}
      className={`${bg} ${sizeClasses[size]} rounded-full text-white font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-90 transition-transform touch-manipulation select-none`}
    >
      {label}
    </button>
  )
}

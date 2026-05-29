import { emojiToUrl, cleanEmoji } from '../utils/emoji'

interface Props {
  emoji: string
  size?: number
  className?: string
}

export function EmojiImg({ emoji, size = 72, className = '' }: Props) {
  return (
    <img
      src={emojiToUrl(emoji)}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
        const span = document.createElement('span')
        span.textContent = cleanEmoji(emoji)
        span.style.fontSize = `${size * 0.65}px`
        span.style.lineHeight = '1'
        target.parentNode?.insertBefore(span, target)
      }}
    />
  )
}

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/'

export function emojiToUrl(emoji: string): string {
  const codePoints: string[] = []
  for (const char of emoji) {
    const cp = char.codePointAt(0)!
    if (cp === 0xFE0F || cp === 0xFE0E) continue
    codePoints.push(cp.toString(16))
  }
  return TWEMOJI_BASE + codePoints.join('-') + '.png'
}

export function cleanEmoji(emoji: string): string {
  return [...emoji].filter(c => {
    const cp = c.codePointAt(0)!
    return cp !== 0xFE0F && cp !== 0xFE0E
  }).join('')
}

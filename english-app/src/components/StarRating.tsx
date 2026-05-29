interface Props {
  level: 0 | 1 | 2 | 3
  size?: 'sm' | 'md'
}

export function StarRating({ level, size = 'sm' }: Props) {
  if (level === 0) return null
  const starSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const stars = '⭐'.repeat(level)
  const color = level === 3 ? 'text-yellow-500' : 'text-yellow-400'
  return (
    <span className={`${starSize} ${color} select-none`} title={`掌握度 ${level}/3`}>
      {stars}
    </span>
  )
}

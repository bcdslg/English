let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

// 简短叮咚声
export function playCorrectSound() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(523, ctx.currentTime)
  osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
  osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.4)
}

// 简短低沉声
export function playWrongSound() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)
}

// 欢呼声效：多音上升 + 和声，模拟小孩欢呼"耶！"
export function playCheerSound() {
  const ctx = getCtx()
  // 第一层：上升琶音
  const notes = [523, 659, 784, 880, 1047]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.07)
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.07 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.07 + 0.2)
    osc.start(ctx.currentTime + i * 0.07)
    osc.stop(ctx.currentTime + i * 0.07 + 0.2)
  })
  // 第二层：高音和弦持续
  setTimeout(() => {
    const chord = [784, 988, 1175]
    chord.forEach(freq => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    })
  }, 350)
}

// "啊哦~"可惜声效：下降滑音 + 颤音
export function playAwwSound() {
  const ctx = getCtx()
  // 主音：从高滑到低
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.type = 'triangle'
  osc1.frequency.setValueAtTime(500, ctx.currentTime)
  osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5)
  gain1.gain.setValueAtTime(0.25, ctx.currentTime)
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
  osc1.start(ctx.currentTime)
  osc1.stop(ctx.currentTime + 0.6)
  // 第二音：略延迟的更低滑音
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(350, ctx.currentTime + 0.15)
  osc2.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.65)
  gain2.gain.setValueAtTime(0, ctx.currentTime)
  gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.15)
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7)
  osc2.start(ctx.currentTime + 0.1)
  osc2.stop(ctx.currentTime + 0.7)
}

// 完成关卡庆祝音
export function playCelebrationSound() {
  const ctx = getCtx()
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08)
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.08 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15)
    osc.start(ctx.currentTime + i * 0.08)
    osc.stop(ctx.currentTime + i * 0.08 + 0.15)
  })
}

import { useCallback, useRef } from 'react'

export function useSpeech() {
  const isSpeakingRef = useRef(false)

  const speak = useCallback((text: string, lang: 'en-US' | 'zh-CN' = 'en-US', rate = 0.8) => {
    if (!('speechSynthesis' in window)) return
    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel()
      isSpeakingRef.current = false
      return
    }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = lang === 'zh-CN' ? 0.9 : rate
    u.pitch = 1.1
    u.onstart = () => { isSpeakingRef.current = true }
    u.onend = () => { isSpeakingRef.current = false }
    u.onerror = () => { isSpeakingRef.current = false }
    window.speechSynthesis.speak(u)
  }, [])

  const speakEn = useCallback((text: string, rate?: number) => speak(text, 'en-US', rate), [speak])
  const speakCn = useCallback((text: string) => speak(text, 'zh-CN'), [speak])

  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      isSpeakingRef.current = false
    }
  }, [])

  return { speak, speakEn, speakCn, cancel }
}

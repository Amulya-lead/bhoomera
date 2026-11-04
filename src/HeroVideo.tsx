import { useEffect, useRef, useState } from 'react'

const VIDEO_ID = 'kYd7BrquliY'

export default function HeroVideo() {
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const revealTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(revealTimer.current), [])
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { if (preference.matches) setPlaying(false) }
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])
  return <>
    {playing && !failed && <div className={`hero-video${ready ? ' is-ready' : ''}`} aria-hidden="true"><iframe
      title="Bharat Future City, Hyderabad — background video"
      src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?start=15&autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&playsinline=1&disablekb=1&fs=0&rel=0`}
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      tabIndex={-1}
      onLoad={() => {
        clearTimeout(revealTimer.current)
        // YouTube's initial title/branding can appear even with controls=0.
        // Let the muted player start behind the existing hero image.
        revealTimer.current = setTimeout(() => setReady(true), 6500)
      }}
      onError={() => setFailed(true)}
    /></div>}
  </>
}

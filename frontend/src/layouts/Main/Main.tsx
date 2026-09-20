import React, { useContext, useEffect, useRef } from 'react'
import gsap from 'gsap'
import Button from '@/components/Button'
import './Main.scss'
import Widget from '@/sections/Widget'
import Icon from '@/components/Icon'
import AudioPlayer from '@/sections/AudioPlayer'
import CopyProvider from '@/providers/CopyProvider'
import { AudioContext } from '@/context/AudioContext'
import { links } from '@/lib/mainLinks'

function splitTitleIntoChars(container: HTMLElement, text: string): HTMLSpanElement[] {
  const chars: HTMLSpanElement[] = []
  const words = text.split(' ')

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span')
    wordSpan.className = 'main__title-word'

    Array.from(word).forEach((char) => {
      const charSpan = document.createElement('span')
      charSpan.className = 'main__title-char'
      charSpan.textContent = char
      wordSpan.appendChild(charSpan)
      chars.push(charSpan)
    })

    container.appendChild(wordSpan)
    if (wordIndex < words.length - 1) {
      container.appendChild(document.createTextNode('\u00A0'))
    }
  })

  return chars
}

export default (props: {
  children: React.ReactNode,
  subtitle: string
}) => {
  const { children, subtitle } = props
  const audioContext = useContext(AudioContext)
  const { preloadState } = audioContext ?? {}

  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const linksRef = useRef<HTMLUListElement>(null)
  const charsRef = useRef<HTMLSpanElement[]>([])
  const glowTween = useRef<gsap.core.Tween | null>(null)
  const reducedMotionRef = useRef(false)
  const hasEnteredRef = useRef(false)


  useEffect(() => {
    if (typeof window === 'undefined') return
    const titleEl = titleRef.current
    if (!titleEl) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedMotionRef.current = reducedMotion
    if (reducedMotion) return // ничего не трогаем — текст остаётся обычным, видимым сразу

    const originalText = titleEl.textContent || ''
    titleEl.setAttribute('aria-label', originalText)
    titleEl.textContent = ''

    const visual = document.createElement('span')
    visual.className = 'main__title-visual'
    visual.setAttribute('aria-hidden', 'true')
    titleEl.appendChild(visual)

    const chars = splitTitleIntoChars(visual, originalText)
    charsRef.current = chars

    gsap.set(chars, {
      opacity: 0,
      x: () => gsap.utils.random(-28, 28),
      y: () => gsap.utils.random(-50, 70),
      z: () => gsap.utils.random(-260, -40),
      rotateX: () => gsap.utils.random(-70, 70),
      rotateY: () => gsap.utils.random(-45, 45),
      filter: 'blur(6px)',
    })

    if (subtitleRef.current) {
      gsap.set(subtitleRef.current, { opacity: 0, y: 24, rotateX: -35 })
    }
    if (linksRef.current) {
      gsap.set(Array.from(linksRef.current.children), {
        opacity: 0, y: 18, scale: 0.6, rotateX: -40,
      })
    }
  }, [])

  useEffect(() => {
    if (!preloadState) return
    if (hasEnteredRef.current) return
    if (reducedMotionRef.current) return
    if (typeof window === 'undefined') return

    const titleEl = titleRef.current
    const subtitleEl = subtitleRef.current
    const linksEl = linksRef.current
    const chars = charsRef.current
    if (!titleEl || chars.length === 0) return

    hasEnteredRef.current = true

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    tl.to(chars, {
      opacity: 1,
      x: 0, y: 0, z: 0,
      rotateX: 0, rotateY: 0,
      filter: 'blur(0px)',
      duration: 1.1,
      stagger: { each: 0.035, from: 'center' },
      onComplete: () => gsap.set(chars, { clearProps: 'transform,filter,opacity' }),
    })

    if (subtitleEl) {
      tl.to(subtitleEl, {
        opacity: 1,
        y: 0,
        rotateX: 28, // финальный угол совпадает со статикой в SCSS
        duration: 0.7,
        ease: 'power3.out',
        onComplete: () => gsap.set(subtitleEl, { clearProps: 'transform,opacity' }),
      }, '-=0.55')
    }

    if (linksEl) {
      const linkItems = Array.from(linksEl.children) as HTMLElement[]
      if (linkItems.length) {
        tl.to(linkItems, {
          opacity: 1, y: 0, scale: 1, rotateX: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: 'back.out(2.2)',
          // clearProps обязателен: у .main__link уже есть hover-transform в SCSS,
          // инлайн-стиль от GSAP иначе перекрывал бы hover навсегда
          onComplete: () => gsap.set(linkItems, { clearProps: 'transform,opacity' }),
        }, '-=0.35')
      }
    }

    glowTween.current = gsap.to(titleEl, {
      filter: 'drop-shadow(-3px 5px 140px var(--color-white))',
      duration: 2.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: tl.duration(),
    })

    return () => { tl.kill() }
  }, [preloadState])

  useEffect(() => () => { glowTween.current?.kill() }, [])

  return (
    <main className="main">
      <h1 className="main__title" ref={titleRef}>{children}</h1>
      <div>
        <p className="main__subtitle" ref={subtitleRef}>
          {subtitle}
        </p>
      </div>
      <CopyProvider>
        <Widget />
      </CopyProvider>
      <ul className="main__links--list" ref={linksRef}>
        {links.map((link, index) => (
          <li key={index} className="main__links--item">
            <Button className="main__link" href={link.href} title={link.name} target="_blank">
              <Icon Component={link.icon} className="main__link-icon" size={44} />
            </Button>
          </li>
        ))}
      </ul>
      <AudioPlayer />
    </main>
  )
}
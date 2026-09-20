import './Widget.scss'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import Subname from '@/components/Subname'
import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { CopyContext } from '@/context/CopyContext'
import { AudioContext } from '@/context/AudioContext'
import clsx from 'clsx'
import gsap from 'gsap'
import Loader from '@/components/Loader'
import { ICopyContext } from '@/types/providers.interfaces'

export default function Widget() {
  const context = useContext(CopyContext)
  const { src, name, id, href, time, status } = context as ICopyContext

  const audioContext = useContext(AudioContext)
  const { preloadState } = audioContext ?? {}

  const imageWrapRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const nameWrapRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const linkWrapRef = useRef<HTMLDivElement>(null)

  const revealedForRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (!name) return
    if (typeof window === 'undefined') return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    gsap.set(imageWrapRef.current, { opacity: 0, scale: 0.4, rotate: -25, filter: 'blur(4px)' })
    gsap.set(statusRef.current, { opacity: 0, scale: 0 })
    gsap.set(nameWrapRef.current, { opacity: 0, x: -18 })
    gsap.set(timeRef.current, { opacity: 0 })
    gsap.set(linkWrapRef.current, { opacity: 0, x: 16, scale: 0.85 })
  }, [name])

  useEffect(() => {
    if (!preloadState) return
    if (!name) return
    if (revealedForRef.current === name) return
    if (typeof window === 'undefined') return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    revealedForRef.current = name

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.to(imageWrapRef.current, {
      opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)',
      duration: 0.6, ease: 'back.out(2.4)',
      onComplete: () => gsap.set(imageWrapRef.current, { clearProps: 'transform,filter' }),
    })
    tl.to(statusRef.current, {
      opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(3)',
      onComplete: () => gsap.set(statusRef.current, { clearProps: 'transform' }),
    }, '-=0.35')
    tl.to(nameWrapRef.current, {
      opacity: 1, x: 0, duration: 0.5,
      onComplete: () => gsap.set(nameWrapRef.current, { clearProps: 'transform' }),
    }, '-=0.3')
    tl.to(timeRef.current, { opacity: 1, duration: 0.4 }, '-=0.25')
    tl.to(linkWrapRef.current, {
      opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'back.out(2.2)',
      onComplete: () => gsap.set(linkWrapRef.current, { clearProps: 'transform' }),
    }, '-=0.25')

    return () => { tl.kill() }
  }, [preloadState, name])

  if (!name) return (
    <div className="widget">
      <Loader></Loader>
    </div>
  )

  return (
    <div className="widget">
      <div className="widget__image-wrap" ref={imageWrapRef}>
        <Icon src={src} className="widget__image" alt={name} size={60} />
      </div>

      <div className={clsx('status', status)} ref={statusRef}></div>

      <div className="widget__name--wrapper" ref={nameWrapRef}>
        <div className="widget__name">
          {name}
          <span className="widget__id">#{id}</span>
          <Subname />
        </div>

        <div className="widget__time" ref={timeRef}>
          Last seen {time}
        </div>
      </div>

      <div className="widget__link-wrap" ref={linkWrapRef}>
        <Button href={href} children="View" className="widget__link" />
      </div>
    </div>
  )
}
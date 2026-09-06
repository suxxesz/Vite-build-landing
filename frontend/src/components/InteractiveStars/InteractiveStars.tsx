// src/components/InteractiveStars/InteractiveStars.tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './InteractiveStars.scss'
import {Comet , BgStar} from '@/types/componets/interactivestars.types'

const CATCH_RADIUS = 150
const EXPLODE_DELAY = 0.55
const TRAIL_LENGTH = 16
const PALETTE = ['#ffffff', '#c9b8ff', '#8a60f5', '#5ecbff', '#c65fe0', '#ffd27a']

export default function InteractiveStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const layer = layerRef.current
    if (!canvas || !layer) return

    const ctx = canvas.getContext('2d')!
    let W = window.innerWidth
    let H = window.innerHeight
    const mouse = { x: W / 2, y: H / 2 }

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
      bgStars = Array.from({ length: 140 }, spawnBgStar)
    }

    const spawnBgStar = (): BgStar => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.4 + Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
    })
    let bgStars: BgStar[] = []

    const pickColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)]

    const spawnComet = (): Comet => {
      // рождаются сверху, летят по диагонали вниз — классический звездопад
      const x = Math.random() * W * 1.3 - W * 0.15
      const y = -30 - Math.random() * 120
      const angle = (55 + Math.random() * 30) * (Math.PI / 180) // вниз-вправо/влево по диагонали
      const dir = Math.random() < 0.5 ? 1 : -1
      const speed = 6 + Math.random() * 9
      return {
        x, y,
        vx: Math.cos(angle) * speed * dir,
        vy: Math.sin(angle) * speed,
        radius: 1.6 + Math.random() * 2.4,
        life: 500 + Math.random() * 400,
        caught: false,
        color: pickColor(),
        trail: [],
      }
    }

    let comets: Comet[] = Array.from({ length: 9 }, spawnComet)
    let caughtComet: Comet | null = null
    let explodeTimer: number | null = null
    resize()

    const explode = (comet: Comet) => {
      const count = 14 + Math.floor(Math.random() * 12)
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div')
        particle.className = 'star-particle'
        particle.style.setProperty('--pc', pickColor())
        layer.appendChild(particle)
        const angle = Math.random() * Math.PI * 2
        const dist = 40 + Math.random() * 130
        const size = 3 + Math.random() * 4
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        gsap.set(particle, { x: comet.x, y: comet.y, opacity: 1, scale: 0.4 })
        gsap.to(particle, { scale: 1.4, duration: 0.15, ease: 'power2.out' })
        gsap.to(particle, {
          x: comet.x + Math.cos(angle) * dist,
          y: comet.y + Math.sin(angle) * dist,
          opacity: 0,
          scale: 0.1,
          duration: 0.7 + Math.random() * 0.6,
          ease: 'power2.out',
          delay: 0.05,
          onComplete: () => particle.remove(),
        })
      }
      // короткая вспышка-кольцо в месте взрыва
      const flash = document.createElement('div')
      flash.className = 'star-flash'
      layer.appendChild(flash)
      gsap.set(flash, { x: comet.x, y: comet.y, opacity: 1, scale: 0.2 })
      gsap.to(flash, { scale: 3.2, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => flash.remove() })
    }

    let rafId: number
    let t = 0
    const loop = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      // фоновая мерцающая пыль
      for (const s of bgStars) {
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i]
        const dx = mouse.x - c.x
        const dy = mouse.y - c.y
        const distToMouse = Math.hypot(dx, dy)

        if (!c.caught && distToMouse < CATCH_RADIUS && !caughtComet) {
          c.caught = true
          caughtComet = c
          explodeTimer = window.setTimeout(() => {
            if (caughtComet) {
              explode(caughtComet)
              comets = comets.filter((com) => com !== caughtComet)
              caughtComet = null
              explodeTimer = null
            }
          }, EXPLODE_DELAY * 1000)
        }

        if (c.caught) {
          const angle = Math.atan2(dy, dx)
          const speed = 10
          c.x += Math.cos(angle) * speed
          c.y += Math.sin(angle) * speed
        } else {
          c.x += c.vx
          c.y += c.vy
        }

        // хвост
        c.trail.push({ x: c.x, y: c.y })
        if (c.trail.length > TRAIL_LENGTH) c.trail.shift()

        c.life--
        if (c.x < -60 || c.x > W + 60 || c.y < -60 || c.y > H + 60 || c.life <= 0) {
          if (c === caughtComet) {
            clearTimeout(explodeTimer!)
            caughtComet = null
          }
          comets.splice(i, 1)
        }
      }

      while (comets.length < 11) comets.push(spawnComet())

      // отрисовка хвостов и голов
      comets.forEach((c) => {
        const n = c.trail.length
        for (let j = 0; j < n; j++) {
          const p = c.trail[j]
          const k = j / n // 0 (старый/тусклый) -> 1 (свежий/яркий)
          const r = c.radius * (0.15 + k * 0.85)
          ctx.beginPath()
          ctx.fillStyle = c.caught
            ? `rgba(255,190,80,${(k * 0.55).toFixed(2)})`
            : `${c.color}${Math.floor(k * 0.5 * 255).toString(16).padStart(2, '0')}`
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
        }

        // голова кометы с мощным свечением
        ctx.save()
        ctx.shadowColor = c.caught ? '#ffaa00' : c.color
        ctx.shadowBlur = c.caught ? 26 : 16
        ctx.beginPath()
        ctx.fillStyle = c.caught ? '#ffdca0' : '#ffffff'
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      rafId = requestAnimationFrame(loop)
    }
    loop()

    const onMouseMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('pointermove', onMouseMove)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onMouseMove)
      window.removeEventListener('resize', resize)
      clearTimeout(explodeTimer!)
    }
  }, [])

  return (
    <>
      <canvas className="interactive-stars" ref={canvasRef} aria-hidden="true" />
      <div className="star-particles-layer" ref={layerRef} aria-hidden="true" />
    </>
  )
}
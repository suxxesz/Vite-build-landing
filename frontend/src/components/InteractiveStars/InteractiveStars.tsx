// src/components/InteractiveStars/InteractiveStars.tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './InteractiveStars.scss'
import {Comet , BgStar} from '@/types/componets/interactivestars.types'

const CATCH_RADIUS = 150
const EXPLODE_DELAY = 0.55
const TRAIL_LENGTH = 16
const PALETTE = ['#ffffff', '#c9b8ff', '#8a60f5', '#5ecbff', '#c65fe0', '#ffd27a']

const CURSOR_AIM_OFFSET = { x: -14, y: 18 }

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
      const x = Math.random() * W * 1.3 - W * 0.15
      const y = -30 - Math.random() * 120
      const angle = (55 + Math.random() * 30) * (Math.PI / 180) 
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

    const spawnCoreFlash = (comet: Comet) => {
      const flash = document.createElement('div')
      flash.className = 'burst-core'
      flash.style.setProperty('--pc', comet.color)
      layer.appendChild(flash)

      gsap.set(flash, { x: comet.x, y: comet.y, opacity: 0, scale: 0.2 })
      const tl = gsap.timeline()
      tl.to(flash, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' })
      tl.to(flash, {
        opacity: 0, scale: 2.3, duration: 0.5, ease: 'power3.out',
        onComplete: () => flash.remove(),
      }, '-=0.02')
    }

    const spawnShockwave = (comet: Comet) => {
      const ring = document.createElement('div')
      ring.className = 'burst-ring'
      ring.style.setProperty('--pc', comet.color)
      layer.appendChild(ring)

      gsap.set(ring, { x: comet.x, y: comet.y, opacity: 0.9, scale: 0.1 })
      gsap.to(ring, {
        scale: 5.4, opacity: 0, duration: 0.65, ease: 'power2.out',
        onComplete: () => ring.remove(),
      })
    }

    const spawnRays = (comet: Comet) => {
      const rays = document.createElement('div')
      rays.className = 'burst-rays'
      rays.style.setProperty('--pc', comet.color)
      layer.appendChild(rays)

      gsap.set(rays, {
        x: comet.x, y: comet.y, opacity: 0, scale: 0.3,
        rotate: gsap.utils.random(-15, 15),
      })
      const tl = gsap.timeline()
      tl.to(rays, { opacity: 1, scale: 1, duration: 0.12, ease: 'power1.out' })
      tl.to(rays, {
        opacity: 0, scale: 1.7, duration: 0.45, ease: 'power2.in',
        onComplete: () => rays.remove(),
      }, 0.05)
    }

    const spawnSparks = (comet: Comet) => {
      const count = 10 + Math.floor(Math.random() * 8)
      for (let i = 0; i < count; i++) {
        const spark = document.createElement('div')
        spark.className = 'burst-spark'
        spark.style.setProperty('--pc', pickColor())

        const angle = (Math.PI * 2 * i) / count + gsap.utils.random(-0.25, 0.25)
        const dist = 55 + Math.random() * 95
        const length = 14 + Math.random() * 16
        spark.style.width = `${length}px`
        layer.appendChild(spark)

        gsap.set(spark, {
          x: comet.x, y: comet.y,
          rotate: (angle * 180) / Math.PI,
          opacity: 1,
          scaleX: 0.3,
          transformOrigin: 'left center',
        })

        gsap.to(spark, { scaleX: 1, duration: 0.16, ease: 'power2.out' })
        gsap.to(spark, {
          x: comet.x + Math.cos(angle) * dist,
          y: comet.y + Math.sin(angle) * dist,
          scaleX: 0.15,
          opacity: 0,
          duration: 0.45 + Math.random() * 0.35,
          ease: 'power3.out',
          delay: 0.05,
          onComplete: () => spark.remove(),
        })
      }
    }

    const spawnDust = (comet: Comet) => {
      const count = 5 + Math.floor(Math.random() * 4)
      for (let i = 0; i < count; i++) {
        const dust = document.createElement('div')
        dust.className = 'burst-dust'
        dust.style.setProperty('--pc', pickColor())

        const angle = Math.random() * Math.PI * 2
        const dist = 20 + Math.random() * 50
        const size = 2 + Math.random() * 2.5
        dust.style.width = `${size}px`
        dust.style.height = `${size}px`
        layer.appendChild(dust)

        gsap.set(dust, { x: comet.x, y: comet.y, opacity: 0.9, scale: 0.5 })
        gsap.to(dust, {
          x: comet.x + Math.cos(angle) * dist,
          y: comet.y + Math.sin(angle) * dist,
          opacity: 0,
          scale: 1.4,
          duration: 0.7 + Math.random() * 0.5,
          ease: 'sine.out',
          onComplete: () => dust.remove(),
        })
      }
    }

    const explode = (comet: Comet) => {
      spawnCoreFlash(comet)
      spawnShockwave(comet)
      spawnRays(comet)
      spawnSparks(comet)
      spawnDust(comet)
    }

    let rafId: number
    let t = 0
    const loop = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

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

      comets.forEach((c) => {
        const n = c.trail.length
        for (let j = 0; j < n; j++) {
          const p = c.trail[j]
          const k = j / n 
          const r = c.radius * (0.15 + k * 0.85)
          ctx.beginPath()
          ctx.fillStyle = c.caught
            ? `rgba(255,190,80,${(k * 0.55).toFixed(2)})`
            : `${c.color}${Math.floor(k * 0.5 * 255).toString(16).padStart(2, '0')}`
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
        }

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
      mouse.x = e.clientX + CURSOR_AIM_OFFSET.x
      mouse.y = e.clientY + CURSOR_AIM_OFFSET.y
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
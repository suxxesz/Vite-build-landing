// src/layouts/ScrollGuide/ScrollGuide.tsx
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import './ScrollGuide.scss'

const PHRASES = ['scroll', 'more...', "pretty, isn't it?", 'not enough', 'closer...', 'almost there']

function makeTextTexture(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1536
  canvas.height = 340
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '800 350px "Segoe UI", -apple-system, sans-serif'

  const cx = canvas.width / 2
  const cy = canvas.height / 2

  ctx.lineJoin = 'round'
  ctx.lineWidth = 14
  ctx.strokeStyle = '#3a1f7a'
  ctx.strokeText(text, cx, cy)

  ctx.fillStyle = '#ffffff'
  ctx.fillText(text, cx, cy)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function makeGlowTexture(inner: string, outer: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  if (!ctx) return null
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, inner)
  g.addColorStop(0.35, outer)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

export default function ScrollGuide() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (typeof window === 'undefined') return

    let W = window.innerWidth
    let H = window.innerHeight
    if (W === 0 || H === 0) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { nx: 0, ny: 0 }

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false })
    } catch (e) {
      console.warn('ScrollGuide: WebGL unavailable', e)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 3000)
    camera.position.set(0, 8, 130)

    const beaconGroup = new THREE.Group()
    beaconGroup.position.set(0, 4, -520)
    scene.add(beaconGroup)

    const coreTex = makeGlowTexture('rgba(255,255,255,1)', 'rgba(200,180,255,.9)')
    const haloTex = makeGlowTexture('rgba(138,96,245,.9)', 'rgba(94,203,255,.15)')

    const core = new THREE.Sprite(new THREE.SpriteMaterial({
      map: coreTex ?? undefined, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.9,
    }))
    core.scale.set(10, 10, 1)
    beaconGroup.add(core)

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex ?? undefined, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.8,
    }))
    halo.scale.set(46, 46, 1)
    beaconGroup.add(halo)

    const breatheTweens: gsap.core.Tween[] = []
    if (!reducedMotion) {
      breatheTweens.push(
        gsap.to(halo.scale, { x: '+=6', y: '+=6', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        gsap.to(core.material, { opacity: 0.55, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      )
    }

    // отдельный ореол ПОД текстом — усиливает заметность независимо от маяка
    const textHaloTex = makeGlowTexture('rgba(148,110,255,.85)', 'rgba(94,203,255,.2)')
    const textHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: textHaloTex ?? undefined, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.55,
    }))
    textHalo.scale.set(52, 52, 1)
    textHalo.position.set(0, -12, -301)
    scene.add(textHalo)
    if (!reducedMotion) {
      breatheTweens.push(
        gsap.to(textHalo.scale, { x: '+=8', y: '+=8', duration: 2.0, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      )
    }

    let phraseIndex = -1
    const textMat = new THREE.SpriteMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 1,
    })
    const textSprite = new THREE.Sprite(textMat)
    // спрайт текста вырос почти в 1.5 раза, пропорции канваса сохранены (1536/340 ≈ 46/10)
    textSprite.scale.set(46, 10, 1)
    textSprite.position.set(0, -12, -300)
    scene.add(textSprite)

    const setPhrase = (i: number) => {
      if (i === phraseIndex || i < 0 || i >= PHRASES.length) return
      phraseIndex = i
      const tex = makeTextTexture(PHRASES[i])
      if (!tex) return
      textMat.map?.dispose()
      textMat.map = tex
      textMat.needsUpdate = true
      if (!reducedMotion) {
        gsap.fromTo(textSprite.scale, { x: 40, y: 8.7 }, { x: 46, y: 10, duration: 0.5, ease: 'back.out(2)' })
        gsap.fromTo(textHalo.scale, { x: 44, y: 44 }, { x: 52, y: 52, duration: 0.5, ease: 'back.out(2)' })
      }
    }
    setPhrase(0)

    let progress = 0
    const getScrollProgress = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      if (max <= 0) return 0
      return Math.min(1, Math.max(0, window.scrollY / max))
    }

    const applyProgress = (p: number) => {
      const scale = 1 + p * 3.4
      beaconGroup.scale.set(scale, scale, scale)
      beaconGroup.position.z = -520 + p * 380

      const idx = Math.min(PHRASES.length - 1, Math.floor(p * PHRASES.length * 1.15))
      setPhrase(idx)
      textSprite.position.z = -300 + p * 260
      textHalo.position.z = -301 + p * 260

      const textFade = p > 0.75 ? Math.max(0, 1 - (p - 0.75) / 0.2) : 1
      textMat.opacity = textFade
      textHalo.material.opacity = textFade * 0.55

      const beaconFade = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1
      core.material.opacity = beaconFade * 0.9
      halo.material.opacity = beaconFade * 0.8
    }
    applyProgress(0)

    const onScroll = () => { progress = getScrollProgress() }
    window.addEventListener('scroll', onScroll, { passive: true })

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      if (W === 0 || H === 0) return
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    const onPointerMove = (e: PointerEvent) => {
      mouse.nx = (e.clientX / W - 0.5) * 2
      mouse.ny = (e.clientY / H - 0.5) * 2
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove)

    let rafId: number
    let disposed = false
    const tick = () => {
      if (disposed) return
      applyProgress(progress)
      if (!reducedMotion) {
        camera.position.x += (mouse.nx * 10 - camera.position.x) * 0.02
        camera.position.y += (8 - mouse.ny * 6 - camera.position.y) * 0.02
        camera.lookAt(0, 0, 0)
        const bob = Math.sin(performance.now() * 0.0012) * 1.6
        textSprite.position.y = -12 + bob
        textHalo.position.y = -12 + bob
      }
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      breatheTweens.forEach((tw) => tw.kill())
      coreTex?.dispose()
      haloTex?.dispose()
      textHaloTex?.dispose()
      textMat.map?.dispose()
      core.material.dispose()
      halo.material.dispose()
      textHalo.material.dispose()
      textMat.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas className="scroll-guide" ref={canvasRef} aria-hidden="true" />
}
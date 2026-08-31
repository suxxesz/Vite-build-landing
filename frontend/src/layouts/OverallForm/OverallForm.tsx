import Button from '@/components/Button'
import Field from '@/components/Field'
import Toast from '@/components/Toast'
import clsx from 'clsx'
import './OverallForm.scss'
import React, { useContext, useMemo, useRef } from 'react'
import { FormContext } from '@/context/FormContext'
import { createPortal } from 'react-dom'
import CountrySelect from '@/components/CountrySelect'
import { TFormContext } from '@/types/form/formContext.types'
import { User, Mail, MessageSquare, Loader2, Check, Globe, PenLine } from 'lucide-react'
import { RULES } from '@/hooks/useForm'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function OverallForm() {
  const context = useContext(FormContext)
  if (!context) throw new Error('OverallForm must be used within a FormContext.Provider')
  const { fields, onChange, onBlur, onSubmit, isValid, submitStatus }: TFormContext = context

  const asteroidRef = useRef<HTMLDivElement>(null)
  const hatchRef = useRef<HTMLFormElement>(null)
  const fieldsWrapRef = useRef<HTMLDivElement>(null)
  const submitBtnRef = useRef<HTMLDivElement>(null)

  const handlers = useMemo(() => {
    const keys = Object.keys(fields)
    return Object.fromEntries(
      keys.map((name) => [
        name,
        {
          value: fields[name].value,
          errors: fields[name].errors,
          touched: fields[name].touched,
          onChange: (val: string | React.ChangeEvent<HTMLInputElement>) =>
            onChange(name, typeof val === 'string' ? val : val.target.value),
          onBlur: () => onBlur(name),
        },
      ])
    )
  }, [fields, onChange, onBlur])

  const f = (name: string) => handlers[name]

  const requiredKeys = useMemo(
    () => (Object.keys(RULES) as Array<keyof typeof RULES>).filter((key) => RULES[key]?.required),
    []
  )
  const completedCount = requiredKeys.filter(
    (key) => fields[key].value.trim().length > 0 && fields[key].errors.length === 0
  ).length

  const buttonLabel = useMemo(() => {
    if (submitStatus === 'success')
      return <span className="btn--submit__content"><Check size={18} /> Sent!</span>
    if (submitStatus === 'loading')
      return <span className="btn--submit__content"><Loader2 size={18} className="btn--submit__spinner" /> Sending…</span>
    return 'Launch transmission'
  }, [submitStatus])

  useGSAP(() => {
    const asteroid = asteroidRef.current
    if (!asteroid) return

    let driftTween: gsap.core.Tween | null = null

    gsap.set(asteroid, {
      transformPerspective: 1600,
      scale: window.innerWidth < 768 ? 0.4 : 0.2,
      z: -1200,
      rotationX: -55,
      rotationY: 130,
      rotationZ: 14,
      opacity: 0,
    })

    const children = fieldsWrapRef.current
      ? Array.from(fieldsWrapRef.current.children)
      : []

    gsap.set(children, { opacity: 0, y: 14 })
    gsap.set(submitBtnRef.current, { opacity: 0, y: 10 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
      onComplete: () => {
        if (!driftTween) {
          driftTween = gsap.to(asteroid, {
            rotationZ: '+=3',
            rotationX: '+=2',
            duration: 6,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
        }
      }
    })

    tl.to(asteroid, {
      scale: 1,
      z: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      opacity: 1,
      duration: 1,
      ease: 'expo.out',
    })
      .to(children, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04 }, '-=0.6')
      .to(submitBtnRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')

    const rotX = gsap.quickTo(asteroid, 'rotationX', { duration: 0.6, ease: 'power3' })
    const rotY = gsap.quickTo(asteroid, 'rotationY', { duration: 0.6, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      rotX(ny * -8)
      rotY(nx * 10)
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, { scope: asteroidRef })

  const { contextSafe } = useGSAP({ scope: asteroidRef })
  const burstShell = contextSafe(() => {
    const rect = asteroidRef.current?.getBoundingClientRect()
    if (!rect) return

    const fragment = document.createDocumentFragment()
    const frags: HTMLElement[] = []

    for (let i = 0; i < 22; i++) {
      const frag = document.createElement('div')
      frag.className = 'asteroid-fragment'
      fragment.appendChild(frag)
      frags.push(frag)
    }
    document.body.appendChild(fragment)

    frags.forEach((frag) => {
      const startX = rect.left + rect.width * Math.random()
      const startY = rect.top + rect.height * Math.random()
      gsap.set(frag, { x: startX, y: startY, opacity: 1, rotation: Math.random() * 360 })
      const angle = Math.random() * Math.PI * 2
      const dist = 70 + Math.random() * 200
      gsap.to(frag, {
        x: `+=${Math.cos(angle) * dist}`,
        y: `+=${Math.sin(angle) * dist}`,
        opacity: 0,
        rotation: `+=${Math.random() * 360 - 180}`,
        duration: 0.8 + Math.random() * 0.6,
        ease: 'power2.out',
        onComplete: () => frag.remove(),
      })
    })

    gsap.to(asteroidRef.current, {
      rotationY: '+=360',
      duration: 1.1,
      ease: 'power2.inOut',
    })
  })

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    onSubmit(e)
    burstShell()
  }

  return (
    <>
      {createPortal(<Toast />, document.body)}

      <div className="asteroid" ref={asteroidRef}>
        <div className="asteroid__shell" aria-hidden="true">
          <div className="asteroid__facets" />
          <div className="asteroid__craters" />
          <div className="asteroid__rim-glow" />
        </div>

        <span className="asteroid__chip asteroid__chip--a" aria-hidden="true" />
        <span className="asteroid__chip asteroid__chip--b" aria-hidden="true" />
        <span className="asteroid__chip asteroid__chip--c" aria-hidden="true" />

        <form className="asteroid__hatch" ref={hatchRef} noValidate onSubmit={handleSubmit} aria-label="Contact form">
          <div className="asteroid__hatch-glow" aria-hidden="true" />

          <h1 className="asteroid__title">Into the void</h1>
          <p className="asteroid__progress" aria-live="polite">
            {completedCount === requiredKeys.length
              ? 'All systems locked — ready to launch'
              : `${completedCount}/${requiredKeys.length} required fields completed`}
          </p>

          <div className="asteroid__grid" ref={fieldsWrapRef}>
            <div className="asteroid__field">
              <Field label="Your name" id="your-name" icon={<User size={16} aria-hidden="true" />} {...f('name')} />
            </div>
            <div className="asteroid__field">
              <Field label="Your surname" id="your-subname" icon={<User size={16} aria-hidden="true" />} {...f('subname')} />
            </div>
            <div className="asteroid__field">
              <Field label="Your email" id="your-email" type="email" icon={<Mail size={16} aria-hidden="true" />} {...f('email')} />
            </div>
            <div className="asteroid__field">
              <Field label="Topic" id="your-topic" icon={<MessageSquare size={16} aria-hidden="true" />} {...f('topic')} isSelect={true} />
            </div>
            <div className="asteroid__field asteroid__field--full">
              <CountrySelect icon={<Globe size={16} aria-hidden="true" />} {...f('country')} />
            </div>
            <div className="asteroid__field asteroid__field--full">
              <Field label="Write your message here..." id="your-message" icon={<PenLine size={16} aria-hidden="true" />} {...f('message')} isTextPole />
            </div>
          </div>

          <div ref={submitBtnRef} className="asteroid__submit-wrap">
            <Button
              className={clsx('btn--submit', {
                'is-loading': submitStatus === 'loading',
                'is-success': submitStatus === 'success',
                'disabled': !isValid || submitStatus === 'success',
              })}
              type="submit"
              isDisabeled={!isValid}
            >

              {buttonLabel}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
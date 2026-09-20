import './HeaderNavigation.scss'
import {
    useState, useCallback, useRef, useEffect, useMemo, useEffectEvent , 
    forwardRef, useImperativeHandle, memo
} from 'react'
import Button from '@/components/Button'
import { InfoIcon } from 'lucide-react'
import clsx from 'clsx'
import gsap from 'gsap'

const linksData = [
    { href: '/', title: 'Main page' },
    { href: '/biography', title: 'About me' },
    { href: '/form', title: 'Contact me' },
    { href: '/policy', title: 'Privacy  and rights' },
]

const GLYPHS = '!<>-_\\/[]{}=+*^?#$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(() =>
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])
    return reduced
}

type DecodeHandle = { start: () => void; reset: () => void }

const DecodeTitle = memo(forwardRef<DecodeHandle, { text: string; reduced: boolean }>(
    ({ text, reduced }, ref) => {
        const chars = useMemo(() => text.split(''), [text])
        const spans = useRef<(HTMLSpanElement | null)[]>([])
        const tl = useRef<gsap.core.Timeline | null>(null)

        useImperativeHandle(ref, () => ({
            start: () => {
                if (reduced) return
                tl.current?.kill()
                const t = gsap.timeline()
                chars.forEach((char, i) => {
                    const span = spans.current[i]
                    if (!span || char === ' ') return
                    const state = { p: 0 }
                    t.to(state, {
                        p: 1,
                        duration: 0.35,
                        ease: 'power1.out',
                        onUpdate: () => {
                            span.textContent = state.p > 0.75
                                ? char
                                : GLYPHS[(Math.random() * GLYPHS.length) | 0]
                        },
                        onComplete: () => { span.textContent = char }
                    }, i * 0.026)
                })
                tl.current = t
            },
            reset: () => {
                tl.current?.kill()
                spans.current.forEach((span, i) => {
                    if (span) span.textContent = chars[i]
                })
            }
        }), [chars, reduced])

        useEffect(() => () => { tl.current?.kill() }, [])

        return (
            <span className="decode-title" aria-label={text}>
                {chars.map((char, i) => (
                    <span
                        key={i}
                        ref={(el) => { spans.current[i] = el }}
                        className="decode-title__char"
                        aria-hidden="true"
                    >
                        {char}
                    </span>
                ))}
            </span>
        )
    }
    
))
DecodeTitle.displayName = 'DecodeTitle'

type NavItemHandle = { resetHover: () => void }

const NavItem = memo(forwardRef<NavItemHandle, { item: { href: string; title: string } }>(
    ({ item }, ref) => {
        const reduced = usePrefersReducedMotion()
        const itemRef = useRef<HTMLDivElement>(null)
        const barRef = useRef<HTMLSpanElement>(null)
        const decodeRef = useRef<DecodeHandle>(null)
        const yTween = useRef<gsap.QuickToFunc | null>(null)
        const barTween = useRef<gsap.QuickToFunc | null>(null)

        useEffect(() => {
            if (!itemRef.current || !barRef.current) return
            yTween.current = gsap.quickTo(itemRef.current, 'y', { duration: 0.25, ease: 'power2.out' })
            barTween.current = gsap.quickTo(barRef.current, 'scaleX', { duration: 0.3, ease: 'power3.out' })
        }, [])

        const onEnter = useCallback(() => {
            decodeRef.current?.start()
            if (reduced) return
            yTween.current?.(-2)
            barTween.current?.(1)
        }, [reduced])

        const onLeave = useCallback(() => {
            decodeRef.current?.reset()
            if (reduced) return
            yTween.current?.(0)
            barTween.current?.(0)
        }, [reduced])

        useImperativeHandle(ref, () => ({
            resetHover: () => {
                decodeRef.current?.reset()
                yTween.current?.(0)
                barTween.current?.(0)
            }
        }), [])
        const onLocateMove = useCallback(
            (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault()

                const href = e.currentTarget.href

                setTimeout(() => {
                    window.location.href = href
                }, 1000)
            },
            []
        )

        return (
            <div
                ref={itemRef}
                className="navigation__item"
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                onFocus={onEnter}
                onBlur={onLeave}
            >
                <Button
                    href={item.href}
                    className="navigation__item--title"
                    target="_blank"
                    unussual={true}
                    title={item.title}
                    onClick={onLocateMove}
                >
                    <DecodeTitle ref={decodeRef} text={item.title} reduced={reduced} />
                </Button>
                <span ref={barRef} className="navigation__item--bar" />
            </div>
        )
    }
))
NavItem.displayName = 'NavItem'

const HeaderNavigation = memo(function HeaderNavigation(props: { onLeftSide: boolean }) {
    const { onLeftSide } = props
    const reduced = usePrefersReducedMotion()
    const [opened, setIsOpened] = useState<boolean>(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const scanRef = useRef<HTMLSpanElement>(null)
    const itemsWrapRef = useRef<HTMLDivElement>(null)
    const itemHandles = useRef<(NavItemHandle | null)[]>([])
    const ctx = useRef<gsap.Context | null>(null)

    const onOpen = useCallback((): void => {
        setIsOpened(prev => !prev)
    }, [])


    const rootClassName = useMemo(
        () => clsx('navigation', onLeftSide && 'unreversed'),
        [onLeftSide]
    )

    const buttonClassName = useMemo(
        () => clsx('navigation__open', opened && 'is-open'),
        [opened]
    )

    useEffect(() => {
        if (!opened) return
        const handleClick = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setIsOpened(false)
            }
        }
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpened(false)
        }
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('keydown', handleKey)
        }
    }, [opened])

    useEffect(() => {
        ctx.current = gsap.context(() => { }, rootRef)
        return () => ctx.current?.revert()
    }, [])

    useEffect(() => {
        const panel = panelRef.current
        const scan = scanRef.current
        const items = itemsWrapRef.current
            ? (Array.from(itemsWrapRef.current.children) as HTMLElement[])
            : []
        if (!panel || !scan || items.length === 0) return

        if (!opened) {
            itemHandles.current.forEach(h => h?.resetHover())
        }

        if (reduced) {
            gsap.set(panel, { autoAlpha: opened ? 1 : 0, clipPath: 'inset(0% 0% 0% 0%)' })
            gsap.set(items, { autoAlpha: opened ? 1 : 0, y: 0, rotateX: 0 })
            panel.style.pointerEvents = opened ? 'auto' : 'none'
            return
        }

        const tl = gsap.timeline()

        if (opened) {
            panel.style.pointerEvents = 'auto'
            tl.fromTo(panel,
                { clipPath: 'inset(0% 0% 100% 0% round 10px)', autoAlpha: 1, filter: 'blur(6px)' },
                { clipPath: 'inset(0% 0% 0% 0% round 10px)', filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }
            )
            tl.fromTo(scan,
                { yPercent: -40, autoAlpha: 0 },
                { yPercent: 340, autoAlpha: 0.9, duration: 0.5, ease: 'power1.in' },
                0
            )
            tl.to(scan, { autoAlpha: 0, duration: 0.12 }, '-=0.08')
            tl.fromTo(items,
                { autoAlpha: 0, y: -10, rotateX: -70 },
                { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.45, stagger: 0.06, ease: 'back.out(1.8)' },
                '-=0.35'
            )
        } else {
            tl.to(items, { autoAlpha: 0, y: -6, duration: 0.15, stagger: 0.02, ease: 'power1.in' })
            tl.to(panel, {
                clipPath: 'inset(0% 0% 100% 0% round 10px)',
                filter: 'blur(4px)',
                duration: 0.25,
                ease: 'power2.in',
                onComplete: () => { panel.style.pointerEvents = 'none' }
            }, '-=0.05')
        }

        return () => { tl.kill() }
    }, [opened, reduced])

    return (
        <div ref={rootRef} className={rootClassName}>
            <Button
                className={buttonClassName}
                onClick={onOpen}
                title="Open nav dropdown"
                aria-expanded={opened}
            >
                <InfoIcon className="navigation__open--icon icon-switcher" />
            </Button>

            <div ref={panelRef} className="navigation__dropdown">
                <span ref={scanRef} className="navigation__dropdown-scan" />
                <div ref={itemsWrapRef} className="navigation__dropdown-items">
                    {linksData.map((item, i) => (
                        <NavItem
                            key={item.title}
                            item={item}
                            ref={(el) => { itemHandles.current[i] = el }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
})

HeaderNavigation.displayName = 'HeaderNavigation'

export default HeaderNavigation     
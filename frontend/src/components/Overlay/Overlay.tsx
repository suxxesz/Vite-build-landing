import React, {
    useContext,
    useEffect,
    useState
} from "react"

import Button from "../Button"
import { OverlayContext } from "@/context/OverlayContext"
import { X, Bell } from "lucide-react"
import clsx from "clsx"

import { IOverlayContext } from "@/types/providers.interfaces"

import "./Overlay.scss"

export default function Overlay({
    children
}: {
    children: React.ReactNode
}) {
    const {
        onClose,
        hasOpened
    }: IOverlayContext = useContext(OverlayContext)

    const [mounted, setMounted] = useState(hasOpened)

    useEffect(() => {
        // Если открываем — сразу монтируем
        if (hasOpened) {
            setMounted(true)
            return
        }

        // Если закрываем — ждём окончания анимации
        const timer = setTimeout(() => {
            setMounted(false)
        }, 600)

        return () => clearTimeout(timer)
    }, [hasOpened])

    // После завершения закрытия удаляем из DOM
    if (!mounted) {
        return null
    }

    return (
        <figure
            className={clsx(
                "overlay",
                hasOpened && "overlay--visible"
            )}
        >
            <div className="overlay__icon">
                <Bell size={18} />
            </div>

            <div className="overlay__content">
                <h3 className="overlay__title">
                    Need to contact with me as fast as possible?
                </h3>

                <div className="overlay__subtitle-wrapper">
                    <span className="overlay__subtitle">
                        {children}
                    </span>

                    <div className="overlay__dot" />
                </div>
            </div>

            <Button
                className="overlay__close-button"
                onClick={onClose}
            >
                <X
                    className="overlay__close-button-icon"
                    size={12}
                />
            </Button>
        </figure>
    )
}
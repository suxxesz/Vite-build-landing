import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useMemo
} from 'react'

import {
    Bell,
    Check,
    CheckCheck,
    Clock,
    X,
    XCircle,
    Trash,
} from 'lucide-react'

import { useAtomValue } from 'jotai'
import { sessionIdAtom } from '@/store/store'
import { useNotification } from '@/hooks/useNotification'
import Button from '../Button'
import './NotificationBell.scss'

const STATUS_ICON = {
    pending: <Clock size={14} />,
    accepted: <Check size={14} />,
    rejected: <XCircle size={14} />,
} as const

const STATUS_LABEL = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
} as const

export default function NotificationBell() {

    const sessionId = useAtomValue(sessionIdAtom)

    const { data, loading, history, clearHistory, setSessionId } = useNotification(sessionId)

    const [isOpen, setIsOpen] = useState(false)
    const [isRead, setIsRead] = useState(false)
    const [isConfirmingClear, setIsConfirmingClear] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const session = data?.session ?? null
    const notification = session?.notification ?? null
    const status = session?.status ?? null

    const hasNotification = !!notification
    const isUnread =
        hasNotification &&
        !notification!.isRead &&
        !isRead

    const handleToggle = useCallback(() => {
        setIsOpen(prev => !prev)
        if (isUnread) setIsRead(true)
    }, [isUnread])

    const handleClose = useCallback(() => {
        setIsOpen(false)
        setIsConfirmingClear(false)
    }, [])

    const handleRequestClear = useCallback(() => {
        setIsConfirmingClear(true)
    }, [])

    const handleCancelClear = useCallback(() => {
        setIsConfirmingClear(false)
    }, [])

    const handleConfirmClear = useCallback(() => {
        clearHistory()
        setIsConfirmingClear(false)
    }, [clearHistory])
    const activeCreatedAt = data?.session?.notification?.createdAt;

    const historyToDisplay = useMemo(() => {
        if (!activeCreatedAt) return history;

        return history.filter(item => item.createdAt !== activeCreatedAt);
    }, [history, activeCreatedAt]);

    useEffect(() => {
        if (!isOpen) return
        const onOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                !triggerRef.current?.contains(e.target as Node)
            ) {
                setIsOpen(false)
                setIsConfirmingClear(false)
            }
        }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isConfirmingClear) {
                    setIsConfirmingClear(false)
                    return
                }
                setIsOpen(false)
                triggerRef.current?.focus()
            }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [isOpen, isConfirmingClear])

    const formatDate = (ts: number) =>
        new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(ts))

    return (
        <div className="notif">

            <button
                ref={triggerRef}
                type="button"
                className="notif__trigger icon-switcher"
                aria-label="Notifications"
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                onClick={handleToggle}
            >
                <Bell size={20} className='icon-switcher'/>
                {isUnread && (
                    <span className="notif__badge" aria-hidden="true" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="notif__backdrop" onClick={handleClose} />

                    <div
                        ref={dropdownRef}
                        className="notif__dropdown"
                        role="dialog"
                        aria-label="Notification panel"
                    >
                        <div className="notif__dropdown-header">
                            <span className="notif__dropdown-title">
                                <Bell size={14} />
                                Notifications
                            </span>
                            <div className="notif__dropdown-actions">
                                <button
                                    type="button"
                                    className="notif__clear icon-switcher"
                                    aria-label="Clear history"
                                    onClick={handleRequestClear}
                                    disabled={history.length === 0}
                                    title="Clear history"
                                >
                                    <Trash size={12} />
                                </button>
                                <button
                                    type="button"
                                    className="notif__dropdown-close icon-switcher"
                                    aria-label="Close"
                                    onClick={handleClose}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {isConfirmingClear ? (
                            <div className="notif__confirm">
                                <p className="notif__confirm-text">
                                    Are  you sure to delete all story of messages?
                                </p>
                                <div className="notif__confirm-actions">
                                    <button
                                        type="button"
                                        className="notif__confirm-cancel"
                                        onClick={handleCancelClear}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="notif__confirm-delete"
                                        onClick={handleConfirmClear}
                                    >
                                        Delete!
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="notif__dropdown-body">

                                {loading && !data && (
                                    <p className="notif__empty">Loading…</p>
                                )}

                                {!loading && !session && (
                                    <p className="notif__empty">
                                        No notifications yet. Try contact with me - <br/>
                                        <Button href='/core/form' unussual={true}>Here!</Button>
                                    </p>
                                )}

                                {session && (
                                    <div className="notif__card">
                                        <div className={`notif__status notif__status--${status}`}>
                                            {STATUS_ICON[status!]}
                                            <span>{STATUS_LABEL[status!]}</span>
                                        </div>

                                        {notification ? (
                                            <>
                                                <p className="notif__text">
                                                    {notification.text}
                                                </p>
                                                <span className="notif__date">
                                                    <Clock size={11} />
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                                {(isRead || notification.isRead) && (
                                                    <span className="notif__read">
                                                        <CheckCheck size={12} />
                                                        Read
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <p className="notif__empty">No message yet.</p>
                                        )}
                                    </div>
                                )}

                                <div className="notif__history">
                                    <p className="notif__history-label">History</p>

                                    {historyToDisplay.length > 0 ? (
                                        historyToDisplay.map((item, i) => (
                                            <div key={i} className="notif__history-item">
                                                <div className={`notif__status notif__status--${item.status}`}>
                                                    {STATUS_ICON[item.status]}
                                                    <span>{STATUS_LABEL[item.status]}</span>
                                                </div>
                                                <p className="notif__text">{item.text}</p>
                                                <span className="notif__date">
                                                    <Clock size={11} />
                                                    {formatDate(item.createdAt)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="notif__empty">History is clear!!!</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
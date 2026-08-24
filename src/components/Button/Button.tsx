import React from 'react'
import './Button.scss'
import clsx from 'clsx'
import { ButtonProps } from '@/types/componets/button.types'

type ButtonComponentProps = Partial<ButtonProps<object>>

export default (props: ButtonComponentProps) => {
  const {
    className,
    type = 'button',
    href,
    children,
    unussual = false,
    isDisabeled,
    title,
    target, 
    ...rest 
  } = props

  const isLink = href !== undefined
  const classNames = unussual ? className : clsx('button', className)

  const safeTarget = target === null ? undefined : target

  if (isLink) {
  const linkOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // внешние ссылки и новые вкладки — не перехватываем
    if (
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      safeTarget === '_blank'
    ) {
      props.onClick?.(e as any)
      return
    }

    e.preventDefault()
    window.history.pushState({}, '', href)
    // уведомляем Router что путь изменился
    window.dispatchEvent(new PopStateEvent('popstate'))
    props.onClick?.(e as any)
  }

  return (
    <a
      className={classNames}
      href={href}
      target={safeTarget}
      title={title}
      onClick={linkOnClick}
      {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {children}
    </a>
  )
}
  
  const buttonOnClick = props.onClick as React.MouseEventHandler<HTMLButtonElement> | undefined

  return (
    <button 
      className={classNames} 
      type={type} 
      title={title}
      onClick={buttonOnClick} 
      disabled={isDisabeled}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}

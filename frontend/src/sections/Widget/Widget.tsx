import './Widget.scss'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import Subname from '@/components/Subname'
import React , { useContext } from 'react'
import { CopyContext } from '@/context/CopyContext'
import clsx from 'clsx'
import Loader from '@/components/Loader'
import { ICopyContext } from '@/types/providers.interfaces'

export default function Widget() {
  const context = useContext(CopyContext)
  const { src, name, id, href, time , status}  = context as ICopyContext


  if (!name) return (
  <div className="widget">
    <Loader></Loader>
  </div>
  )
  return (
    <div className="widget">
      <Icon src={src} className="widget__image" alt={name} size={60} />

      <div className={clsx("status" , status)}></div>

      <div className="widget__name--wrapper">
        <div className="widget__name">
          {name}
          <span className="widget__id">#{id}</span>
          <Subname />
        </div>

        <div className="widget__time">
          Last seen {time}
        </div>
      </div>

      <Button href={href} children="View" className="widget__link" />
    </div>
  )
}
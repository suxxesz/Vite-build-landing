import Button from '@/components/Button'
import React , { useContext } from 'react'
import { CopyContext } from '@/context/CopyContext'
import {clsx} from 'clsx'

export default function Subname() {

    const {subname , copyOnClipboard , isCopied , copyInner , copyState , onMouseLeaveCopyState , countOfCopy} : any = useContext(CopyContext)

    return (
    <Button className={isCopied ? clsx("widget__subname" , countOfCopy > 9 ? 'shake' : 'is_copied') : "widget__subname"} 
    onClick={() => {copyOnClipboard(subname) ;  copyState }} 
    onPointerLeave={onMouseLeaveCopyState}>
            {subname}
            <div className="widget__subname__hint">{copyInner}</div>
    </Button>
    )
}
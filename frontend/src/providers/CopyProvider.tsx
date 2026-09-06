import { CopyContext } from '@/context/CopyContext'
import useCopy from '@/hooks/useCopy'
import React , { useEffect, useState , useMemo } from 'react'
import ApiData from '@/config'
import getRawDiscordData from '@/api/discord/getRawDiscordData'
import { formatLastSeen } from '@/utils/formatLastSeen'
import { ICopyContext ,  IUseCopy , CopyContextType } from '@/types/providers.interfaces'

export default function CopyProvider({ children } : { children: React.ReactNode }) {
  const [user, setUser] = useState<Record<string, any> | null>(null)
  const [status, setStatus] = useState<string>('offline')

  const {
    isCopied,
    countOfCopy,
    copyInner,
    copyOnClipboard,
    onMouseLeaveCopyState,
  } : ReturnType<typeof useCopy> = useCopy()

  const { API_URL, USER_ID } = ApiData

  useEffect(() => {
    let isMounted = true

    const fetchUser : () => Promise<void> = async () => {
      try {
        const data = await getRawDiscordData(
          USER_ID
        ) as {
          status?: string
          avatar?: string
          globalName?: string
          username?: string
        }

        if (!isMounted) return

        setUser(data)
        setStatus(data?.status || 'offline')
      } catch (error) {
        console.error(
          'Failed to fetch discord user:',
          error
        )

        if (isMounted) {
          setStatus('offline')
        }
      }
    }

    fetchUser()

    const interval = setInterval(fetchUser, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [API_URL, USER_ID])

  const value : CopyContextType = useMemo(() => {
    const data : ICopyContext & IUseCopy
     = { 
      subname: 'levi_v_',

        src: user?.avatar as string || '',

        id: '1337',

        name: (user?.globalName || user?.username || '') as string,

        href: (user?.id && `https://discord.com/users/${user.id}`) as string,

        time: formatLastSeen(user?.lastSeen),

        status,

        isCopied,
        countOfCopy,
        copyInner,
        copyOnClipboard,
        onMouseLeaveCopyState,
     }
    return data 
  } , [

        status,
        isCopied,
        countOfCopy,
        copyInner,
        copyOnClipboard,
        onMouseLeaveCopyState,
  ])

  return (
    <CopyContext.Provider
      value={value as CopyContextType}
    >
      {children}
    </CopyContext.Provider>
  )
}
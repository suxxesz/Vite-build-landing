import {TAsyncData} from '@/types/fetch.types'
import ApiData from '@/config'

const MAIN_API_URL = ApiData.API_URL

const pushData : TAsyncData<JSON> = async (formData)  => {
  const response = await fetch(`${MAIN_API_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:      formData.name,
      email:     formData.email,
      discord_id: null,
      message:   [
        `Surname: ${formData.subname}`,
        `Topic: ${formData.topic}`,
        `Country: ${formData.country || '—'}`,
        '',
        formData.message,
      ].join('\n'),
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Server error')
  }

  return response.json() as Promise<JSON>
}

export default pushData

import ApiData from '@/config'
const API_URL = ApiData.API_URL

export default async function getRawDiscordData<T>( id : string) {
  const response = await fetch(`${API_URL}/users/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json() as T
}
import ApiData from '@/config'
const API_URL = ApiData.API_URL


export interface PushDataResponse {
    success:   boolean
    sessionId: string
}

interface FormPayload {
    name:    string
    subname: string
    email:   string
    topic:   string
    country: string
    message: string
}

const pushData = async (
    formData: FormPayload
): Promise<PushDataResponse> => {

    const response = await fetch(
        `${API_URL}/api/message`,
        {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name:    { value: formData.name },
                subname: { value: formData.subname },
                email:   { value: formData.email },
                topic:   { value: formData.topic },
                country: { value: formData.country },
                message: { value: formData.message },
            }),
        }
    )

    if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Server error')
    }

    return response.json() as Promise<PushDataResponse>
}

export default pushData
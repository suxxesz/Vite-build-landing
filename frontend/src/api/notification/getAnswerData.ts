import ApiData from '@/config'
const API_URL = ApiData.API_URL

export interface Notification {
    text: string;
    isRead: boolean;
    createdAt: number;
}

export interface SessionResponse {
    success: boolean;

    session: {
        id: string;
        status: 'pending' | 'accepted' | 'rejected';
        notification: Notification | null;
        createdAt: number;
    };
}

export class SessionNotFoundError extends Error {
    constructor() {
        super('Session not found');
        this.name = 'SessionNotFoundError';
    }
}

export const getSessionData = async (
    sessionId: string
): Promise<SessionResponse> => {
    const response = await fetch(`${API_URL}/api/message/${sessionId}`);

    if (response.status === 404) {
        throw new SessionNotFoundError();
    }

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
};

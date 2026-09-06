import { SessionResponse } from "@/api/notification/getAnswerData";

export interface HistoryItem {
    text: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: number;
}

export type State = {
    data: SessionResponse | null;
    loading: boolean;
    error: string | null;
    fatalError: boolean;
    history: HistoryItem[];
};

export type Action =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: SessionResponse }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'FATAL_ERROR'; payload: string }
    | { type: 'CLEAR_ALL' };
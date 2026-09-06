import { useEffect, useReducer, useCallback, useRef } from 'react';
import { useSetAtom } from 'jotai';

import {
    getSessionData,
    SessionNotFoundError,
} from '@/api/notification/getAnswerData';
import { sessionIdAtom } from '@/store/store';
import {type State , type HistoryItem} from '@/types/Form/notification.types'
import { Action } from '@/types/Form/notification.types';


const HISTORY_KEY = 'notif_history';
const HISTORY_LIMIT = 20;

const loadHistory = (): HistoryItem[] => {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveHistory = (items: HistoryItem[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
};


const initialState: State = {
    data: null,
    loading: false,
    error: null,
    fatalError: false,
    history: loadHistory(),
};

function notificationReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: state.data === null, error: null }; // Loading true только если нет старых данных (чтобы не моргало)

        case 'FETCH_SUCCESS': {
            const { session } = action.payload;
            const notification = session?.notification;
            let newHistory = state.history;

            // Защита от дубляжа: добавляем в историю, только если есть уведомление
            if (notification && session.status) {
                const alreadyExists = state.history.some(
                    (item) => item.createdAt === notification.createdAt
                );

                if (!alreadyExists) {
                    newHistory = [
                        {
                            text: notification.text,
                            status: session.status,
                            createdAt: notification.createdAt,
                        },
                        ...state.history,
                    ].slice(0, HISTORY_LIMIT);
                }
            }

            return {
                ...state,
                data: action.payload,
                loading: false,
                error: null,
                history: newHistory,
            };
        }

        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };

        case 'FATAL_ERROR':
            return { ...state, loading: false, error: action.payload, fatalError: true };

        case 'CLEAR_ALL':
            return { ...initialState, history: [] }; // Сбрасываем всё

        default:
            return state;
    }
}

// --- MAIN HOOK ---
export const useNotification = (sessionId: string | null) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);
    const setSessionId = useSetAtom(sessionIdAtom);
    
    // Используем ref, чтобы всегда иметь свежий state внутри эффектов без лишних ререндеров
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Синхронизация истории с localStorage (выполняется только при изменении history)
    useEffect(() => {
        saveHistory(state.history);
    }, [state.history]);

    const fetchData = useCallback(async () => {
        if (!sessionId) return;

        dispatch({ type: 'FETCH_START' });

        try {
            const result = await getSessionData(sessionId);
            dispatch({ type: 'FETCH_SUCCESS', payload: result });
        } catch (err) {
            if (err instanceof SessionNotFoundError) {
                dispatch({ type: 'FATAL_ERROR', payload: err.message });
                setSessionId(null); // Сессия умерла/не найдена — убиваем её в сторе
            } else {
                dispatch({
                    type: 'FETCH_ERROR',
                    payload: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        }
    }, [sessionId, setSessionId]);

    // Эффект поллинга
    useEffect(() => {
        // Если нет сессии или произошла фатальная ошибка — ничего не делаем (поллинг останавливается)
        if (!sessionId || state.fatalError) {
            return;
        }

        // Делаем первый запрос сразу при появлении sessionId
        fetchData();

        // Запускаем интервал
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [sessionId, fetchData, state.fatalError]);

    // Функция очистки истории И остановки текущей заявки
    const clearHistory = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' }); // Чистим стейт и историю
        setSessionId(null); // ВАЖНО: Зануляем sessionId, чтобы остановить поллинг
    }, [setSessionId]);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        history: state.history,
        refresh: fetchData,
        clearHistory,
        setSessionId,
    };
};
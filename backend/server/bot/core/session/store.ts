import type { Session } from '.../../../server/shared/types/form.types.ts';

const sessions = new Map<string, Session>();

export function createSession(id: string, session: Session): void {
    sessions.set(id, session);
}

export function getSession(id: string): Session | undefined {
    return sessions.get(id);
}

export function updateSession(
    id: string,
    patch: Partial<Session>
): Session | undefined {
    const session = sessions.get(id);

    if (!session) {
        return undefined;
    }

    const updated = { ...session, ...patch };
    sessions.set(id, updated);

    return updated;
}

export function deleteSession(id: string): boolean {
    return sessions.delete(id);
}
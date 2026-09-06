export interface IFormField {
    value: string;
}

export interface IForm {
    name?: IFormField;
    subname?: IFormField;
    email?: IFormField;
    country?: IFormField;
    topic?: IFormField;
    message?: IFormField;
}

export interface Notification {
    text: string;
    isRead: boolean;
    createdAt: number;
}

export type SessionStatus = 'pending' | 'accepted' | 'rejected';

export interface Session {
    id: string;
    name: string;
    subname: string;
    email: string;
    country: string;
    topic: string;
    message: string;
    status: SessionStatus;
    notification: Notification | null;
    messageId: number;
    createdAt: number;
}
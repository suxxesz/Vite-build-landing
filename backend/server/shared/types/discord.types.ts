export interface DiscordUser {
    id: string
    discord_id?: string
    username: string
    globalName: string | null
    avatar: string
    status: 'online' | 'idle' | 'dnd' | 'offline'
    lastSeen: number | null , 
    activities : any[]
}

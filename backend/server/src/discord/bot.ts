import { Client, GatewayIntentBits } from 'discord.js'

export const lastSeenMap = new Map() 

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, 
  ],
})

client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (!newPresence?.userId || newPresence.user?.bot) return

  const oldStatus = oldPresence?.status || 'invisible'
  const newStatus = newPresence?.status

  if (oldStatus !== 'offline' && newStatus === 'offline') {
    lastSeenMap.set(newPresence.userId, Date.now())
  }
})

client.once('clientReady', (readyClient) => {
  console.log(`[BOT] Бот успешно запущен: ${readyClient.user.tag}`)
})

export function getUserWidgetData(userId : string) {
  const member = client.guilds.cache.map(g => g.members.cache.get(userId)).find(m => m !== undefined)

  
  if (!member) {
    return { error: 'Пользователь не найден на серверах бота' }
  }

  const currentStatus = member.presence?.status || 'offline'
  
  return {
    userId,
    username: member.user.username,
    avatar: member.user.displayAvatarURL({ extension: 'png', size: 128 }),
    status: currentStatus,
    lastSeen: currentStatus === 'offline' ? (lastSeenMap.get(userId) || null) : null ,
    activities : member.presence?.activities ?? []
  }
}

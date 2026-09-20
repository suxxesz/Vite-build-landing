import type { Client } from '@libsql/client'
import type { Telegraf } from 'telegraf'
import type { Client as DiscordClient } from 'discord.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: Client
    bot: Telegraf
    client: DiscordClient
  }
}
import type { Client } from '@libsql/client'
import type { Telegraf } from 'telegraf'

declare module 'fastify' {
  interface FastifyInstance {
    db: Client
    bot: Telegraf
  }
}
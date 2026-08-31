import fp from 'fastify-plugin'
import { createClient, type Client } from '@libsql/client'
import type { FastifyInstance } from 'fastify'

async function databasePlugin(
  app: FastifyInstance,
) {
  const db  = createClient({
    url: app.config.TURSO_URL,
    authToken: app.config.TURSO_AUTH_TOKEN,
  })

  await db.execute(`
    CREATE TABLE IF NOT EXISTS applications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      message    TEXT NOT NULL,
      status     TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  app.decorate('db', db)

  app.log.info('Database connected')
}

export default fp(databasePlugin)
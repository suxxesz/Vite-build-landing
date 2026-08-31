import Fastify, { type FastifyInstance } from 'fastify'
import fastifyEnv from '@fastify/env'
import cors from '@fastify/cors'
import { Telegraf } from 'telegraf'
import { Type } from '@sinclair/typebox'

import { client } from './src/discord/bot'
import addBootstrap from './src/plugins/bootstrap'
import databasePlugin from './src/plugins/database'
import register from './bot/core/register'

const serverOptions = {
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  },
  ignoreTrailingSlash: true,
}

const app: FastifyInstance = Fastify(serverOptions)

const schema = Type.Object({
  TOKEN: Type.String(),

  PORT: Type.Number({
    default: 3001,
  }),

  GUILD_ID: Type.String(),

  TELEGRAM_BOT_TOKEN: Type.String(),

  TELEGRAM_CHAT_ID: Type.String(),

  TURSO_URL: Type.String(),

  TURSO_AUTH_TOKEN: Type.String(),
})

await app.register(fastifyEnv, {
  schema,
  dotenv: true,
  data: process.env,
})

async function start() {
  try {
    // CORS
    await app.register(cors, {
      origin: [
        'http://localhost:5173',
        'https://suxxesz.github.io',
      ],
    })

    // Database
    await app.register(databasePlugin)

    // Other bootstrap logic
    await app.register(addBootstrap)

    // Telegram
    const bot = new Telegraf(
      app.config.TELEGRAM_BOT_TOKEN,
    )

    app.decorate('bot', bot)

    await register(app)

    // Discord
    await client.login(app.config.TOKEN)

    bot.start(async (ctx) => {
      await ctx.reply('🤖 Бот запущен')
    })

    await app.ready()

    // Fastify
    await app.listen({
      port: app.config.PORT,
      host: '0.0.0.0',
    })

    // Telegram
    await bot.launch()

    app.log.info(
      `Server started on port ${app.config.PORT}`,
    )
  } catch (error) {
    app.log.error(error, 'Startup error!')
    process.exit(1)
  }
}

start()
import Fastify, { type FastifyInstance } from 'fastify'
import fastifyEnv from '@fastify/env'
import cors from '@fastify/cors'
import { Telegraf } from 'telegraf'
import { client } from './src/discord/bot.ts' 
import addBootstrap from './src/plugins/bootstrap.ts' 
import { Type } from '@sinclair/typebox'
import type { config } from '../env.d.ts'
import register from './bot/core/register.ts'

const serverOptions = {
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    } , 
    ignoreTrailingSlash: true, 
  }
}

const app : FastifyInstance = Fastify(serverOptions)

const schema = Type.Object({
  TOKEN: Type.String(),
  PORT: Type.Number({ default: 3001 }),
  GUILD_ID: Type.String(),
  TELEGRAM_BOT_TOKEN: Type.String() ,
  TELEGRAM_CHAT_ID: Type.String(),
})

await app.register(fastifyEnv, {
  schema: schema,
  dotenv: true,
  data: process.env
})

async function start() {
  try {

  await app.register(cors, {
    origin: ['http://localhost:5173',
      'https://suxxesz.github.io',
    ]

  })
    await app.register(addBootstrap)
    const bot = new Telegraf(app.config.TELEGRAM_BOT_TOKEN);   
    app.decorate('bot', bot);
    await register(app);
    await client.login(app.config.TOKEN)
    bot.start(async (ctx) => {
      await ctx.reply('🤖 Бот запущен');
    });    

    await app.ready()

    await app.listen({ port: app.config.PORT, host: '0.0.0.0' })
    await bot.launch()
  

  } catch (error) {
    app.log.error(error, 'Startup error!')
    process.exit(1)
  }
}

start()

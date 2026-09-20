import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { client } from '../../discord/bot'

export default fp(async function discordPlugin(fastify: FastifyInstance) {
  fastify.decorate('client', client)
})
import applicationsRouter from '../routes/application'
import { client, lastSeenMap } from '../discord/bot'
import type { FastifyInstance } from 'fastify'

/**
 * Плагин начальной загрузки бэкенда
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {Object} opts 
 */
async function addBootstrap(fastify: FastifyInstance & { config : any }, opts: any) {

  await fastify.register(applicationsRouter, { prefix: '/applications' })

  fastify.get<{
    Params: {
    id: string
  }
  }>('/users/:id', {
    errorHandler : async function handler(error : any , request , reply) {
      const errorPayload : any = request.log.error(error , "while getting user Data!")
      return {success : false  , errorPayload}
    }
  },  async (request, reply) => {
  const guild = await client.guilds.fetch(
    fastify.config.GUILD_ID
  )

  const member = await guild.members
    .fetch(request.params.id)
    .catch(() => null)

  if (!member) {
    return reply.code(404).send({
      error: 'User not found on server'
    })
  }

  const user = member.user

  return {
    id: user.id,
    username: user.username,
    globalName: user.globalName,
    avatar: user.displayAvatarURL({ size: 512 }),
    status: member.presence?.status || 'offline',
    lastSeen: lastSeenMap.get(user.id) || null,
  }
  })
}

export default addBootstrap

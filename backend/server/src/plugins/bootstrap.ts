import applicationsRouter from '../routes/application'
import { lastSeenMap } from '../discord/bot'
import type { FastifyInstance } from 'fastify'

/**
 * Плагин начальной загрузки бэкенда
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 */
async function addBootstrap(fastify: FastifyInstance & { config: any }, opts: any) {

  await fastify.register(applicationsRouter, { prefix: '/applications' })

  fastify.get<{
    Params: {
      id: string
    }
  }>('/users/:id', async (request, reply) => {
    try {
      const guild = await fastify.client.guilds.fetch(fastify.config.GUILD_ID)

      const member = await guild.members
        .fetch(request.params.id)
        .catch(() => null)

      if (!member) {
        return reply.code(404).send({
          success: false,
          error: 'User not found on server',
        })
      }

      const user = member.user

      return reply.code(200).send({
        id: user.id,
        username: user.username,
        globalName: user.globalName,
        avatar: user.displayAvatarURL({ size: 512 }),
        status: member.presence?.status || 'offline',
        lastSeen: lastSeenMap.get(user.id) || null,
        activities: member.presence?.activities ?? [],
      })
    } catch (error) {
      request.log.error(error, 'while getting user data')
      return reply.code(500).send({
        success: false,
        error: 'Internal error while fetching user data',
      })
    }
  })
}

export default addBootstrap
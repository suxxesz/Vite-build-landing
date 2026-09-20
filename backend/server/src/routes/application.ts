import type { FastifyInstance } from 'fastify'
import type { DiscordUser } from '../../shared/types/discord.types.ts'

async function applicationRouter(fastify: FastifyInstance, opts: any) {
  const postSchema = {
    body: {
      type: 'object',
      required: ['name', 'email', 'message'],
      properties: {
        discord_id: { type: ['string', 'null'], minLength: 2 },
        name:       { type: 'string', minLength: 1 },
        email:      { type: 'string', format: 'email' },
        message:    { type: 'string', minLength: 1 },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id:        { type: 'number' },
          sessionId: { type: 'string' },
          message:   { type: 'string' },
        },
      },
    },
  }

  const patchSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'integer' } },
    },
    body: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id:      { type: 'number' },
          status:  { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  }

  // Единый обработчик ошибок для всего плагина —
  // ловит всё, что не поймано локальным try/catch в роуте
  fastify.setErrorHandler(async function (error, request, reply) {
    request.log.error(error, 'an error happened in Fastify Instance!')
    reply.status(503).send({ success: false, error: 'Service unavailable' })
  })

  // ── POST / ──────────────────────────────────────────────────────────────────
  fastify.post<{
    Body: Pick<DiscordUser, 'discord_id'> & {
      name: string
      email: string
      message: string
    }
  }>(
    '/',
    { schema: postSchema },
    async (request, reply) => {
      try {
        const { discord_id, name, email, message } = request.body

        const result = await fastify.db.execute({
          sql: `INSERT INTO applications (discord_id, name, email, message)
                VALUES (?, ?, ?, ?)`,
          args: [
            discord_id?.trim() || null,
            name.trim(),
            email.trim().toLowerCase(),
            message.trim(),
          ],
        })

        return reply.code(201).send({
          id:        Number(result.lastInsertRowid),
          sessionId: String(result.lastInsertRowid),
          message:   'Заявка принята',
        })
      } catch (error) {
        request.log.error(error, 'error occured while posting data!')
        return reply.code(400).send({ success: false, error: 'Failed to create application' })
      }
    },
  )

  // ── GET / ───────────────────────────────────────────────────────────────────
  fastify.get(
    '/',
    async (request, reply) => {
      try {
        const result = await fastify.db.execute(
          'SELECT * FROM applications ORDER BY created_at DESC',
        )
        return result.rows
      } catch (error) {
        request.log.error(error, 'error occured while getting data!')
        return reply.code(400).send({ success: false, error: 'Failed to fetch applications' })
      }
    },
  )

  // ── PATCH /:id/status ───────────────────────────────────────────────────────
  fastify.patch<{
    Params: { id: string }
    Body:   { status: 'pending' | 'approved' | 'rejected' }
  }>(
    '/:id/status',
    { schema: patchSchema },
    async (request, reply) => {
      try {
        const { id }     = request.params
        const { status } = request.body

        const result = await fastify.db.execute({
          sql:  'UPDATE applications SET status = ? WHERE id = ?',
          args: [status, id],
        })

        if (result.rowsAffected === 0) {
          return reply.code(404).send({ success: false, error: 'Application not found' })
        }

        return reply.code(200).send({
          id: Number(id),
          status,
          message: 'Статус обновлен!',
        })
      } catch (error) {
        request.log.error(error, 'error occured while patching data!')
        return reply.code(400).send({ success: false, error: 'Failed to update status' })
      }
    },
  )
}

export default applicationRouter
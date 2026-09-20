import { FastifyInstance } from "fastify"

export async function onDiscordAssetsRegister(fastify: FastifyInstance) {
    fastify.get<{
        Params: {
            id: string
        }
    }>('/user/application/:id', {
        errorHandler: async function handler(error, request, reply) {
            request.log.error(error, "while getting user data!")

            return {
                success: false,
                error: error.message
            }
        }
    }, async (request, reply) => {

        const guild = await fastify.client.guilds.fetch(
            fastify.config.GUILD_ID
        )

        const member = await guild.members
            .fetch(request.params.id)
            .catch(() => null)

        if (!member) {
            throw new Error('Client exception error')
        }

        const activities = member.presence?.activities ?? []

        const activity = activities[0]

        if (!activity) {
            throw new Error('Activity exception error')
        }

        if (!activity.applicationId) {
            throw new Error('Application ID not found')
        }

        const response = await fetch(
            `https://discord.com/api/v10/applications/${activity.applicationId}`,
            {
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_TOKEN}`
                }
            }
        )

        if (!response.ok) {
            throw new Error(
                `Discord API error: ${response.status}`
            )
        }

        const application = await response.json()

        const icon = application.icon
            ? `https://cdn.discordapp.com/app-icons/${application.id}/${application.icon}.png`
            : null

        return {
            success: true,
            application: {
                id: application.id,
                name: application.name,
                icon
            }
        }
    })
}
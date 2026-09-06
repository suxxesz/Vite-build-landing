import crypto from 'node:crypto';

import type { FastifyInstance } from 'fastify';
import type { Context } from 'telegraf';
import type { IForm, Session } from '../../../server/shared/types/form.types.ts';

import {
    createSession,
    getSession,
    updateSession,
} from './session/store';

const rejectionStates = new Map<number, string>();
const acceptanceStates = new Map<number, string>();

export default async function register(fastify: FastifyInstance) {
    const bot = fastify.bot;

    fastify.post<{ Body: IForm }>(
        '/api/message',
        async (request, reply) => {
            const fields = request.body;
            const sessionId = crypto.randomUUID();

            const session: Session = {
                id: sessionId,
                name: fields.name?.value ?? '',
                subname: fields.subname?.value ?? '',
                email: fields.email?.value ?? '',
                country: fields.country?.value ?? '',
                topic: fields.topic?.value ?? '',
                message: fields.message?.value ?? '',
                status: 'pending',
                notification: null,
                messageId: 0,
                createdAt: Date.now(),
            };

            createSession(sessionId, session);

            const telegramText =
                `📨 <b>Новая заявка</b>\n\n` +
                `👤 <b>Имя:</b> <code>${escapeHtml(session.name)}</code>\n` +
                (
                    session.subname
                        ? `👤 <b>Фамилия:</b> <code>${escapeHtml(session.subname)}</code>\n`
                        : ''
                ) +
                `📧 <b>Email:</b> <code>${escapeHtml(session.email)}</code>\n` +
                `🏙️ <b>Город:</b> <code>${escapeHtml(session.country)}</code>\n` +
                `📌 <b>Тема:</b> <code>${escapeHtml(session.topic)}</code>\n\n` +
                `💬 <b>Сообщение:</b>\n` +
                `<blockquote>${escapeHtml(session.message)}</blockquote>`;

            try {
                const telegramMessage = await bot.telegram.sendMessage(
                    fastify.config.TELEGRAM_CHAT_ID,
                    telegramText,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '✅ Принять', callback_data: `accept_${sessionId}` },
                                    { text: '❌ Отклонить', callback_data: `reject_${sessionId}` },
                                ],
                            ],
                        },
                    }
                );

                updateSession(sessionId, {
                    messageId: telegramMessage.message_id,
                });
            } catch (error) {
                request.log.error(error);

                return reply.code(500).send({
                    success: false,
                    message: 'Failed to send Telegram message',
                });
            }

            return reply.send({
                success: true,
                sessionId,
            });
        }
    );

    fastify.get<{ Params: { sessionId: string } }>(
        '/api/message/:sessionId',
        async (request, reply) => {
            const { sessionId } = request.params;
            const session = getSession(sessionId);

            if (!session) {
                return reply.code(404).send({
                    success: false,
                    message: 'Session not found',
                });
            }

            return reply.send({
                success: true,
                session: {
                    id: session.id,
                    status: session.status,
                    notification: session.notification,
                    createdAt: session.createdAt,
                },
            });
        }
    );

    bot.action(/^accept_(.+)$/, async (ctx) => {
        const sessionId = ctx.match[1];
        const session = getSession(sessionId);

        if (!session) {
            await ctx.answerCbQuery('Сессия не найдена');
            return;
        }

        if (session.status !== 'pending') {
            await ctx.answerCbQuery('Заявка уже обработана');
            return;
        }

        const telegramUserId = ctx.from.id;
        acceptanceStates.set(telegramUserId, sessionId);

        updateSession(sessionId, {
            status: 'accepted',
        });

        await ctx.answerCbQuery('Заявка принята');
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

        await ctx.reply(
            `✅ Заявка от ${session.name} принята\n\n` +
            `Напишите сообщение для автора:`
        );
    });

    bot.action(/^reject_(.+)$/, async (ctx) => {
        const sessionId = ctx.match[1];
        const session = getSession(sessionId);

        if (!session) {
            await ctx.answerCbQuery('Сессия не найдена');
            return;
        }

        if (session.status !== 'pending') {
            await ctx.answerCbQuery('Заявка уже обработана');
            return;
        }

        const telegramUserId = ctx.from.id;
        rejectionStates.set(telegramUserId, sessionId);

        await ctx.answerCbQuery();
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

        await ctx.reply(
            `❌ Заявка от ${session.name}\n\n` +
            `Напишите причину отклонения:`
        );
    });

    bot.on('text', async (ctx) => {
        const telegramUserId = ctx.from.id;
        const text = ctx.message.text.trim();

        if (!text) {
            return;
        }

        const rejectSessionId = rejectionStates.get(telegramUserId);

        if (rejectSessionId) {
            rejectionStates.delete(telegramUserId);
            await handleRejectionMessage(ctx, rejectSessionId, text);
            return;
        }

        const acceptSessionId = acceptanceStates.get(telegramUserId);

        if (acceptSessionId) {
            acceptanceStates.delete(telegramUserId);
            await handleAcceptanceMessage(ctx, acceptSessionId, text);
            return;
        }
    });

    async function handleAcceptanceMessage(
        ctx: Context,
        sessionId: string,
        text: string
    ) {
        const session = getSession(sessionId);

        if (!session) {
            await ctx.reply('❌ Сессия не найдена.');
            return;
        }

        if (session.status !== 'accepted') {
            await ctx.reply('❌ Заявка уже обработана иначе.');
            return;
        }

        updateSession(sessionId, {
            notification: {
                text,
                isRead: false,
                createdAt: Date.now(),
            },
        });

        await ctx.reply(
            `✅ Сообщение для ${session.name} сохранено:\n\n${text}`
        );
    }

    async function handleRejectionMessage(
        ctx: Context,
        sessionId: string,
        reason: string
    ) {
        const session = getSession(sessionId);

        if (!session) {
            await ctx.reply('❌ Сессия не найдена.');
            return;
        }

        if (session.status !== 'pending') {
            await ctx.reply('❌ Заявка уже обработана.');
            return;
        }

        updateSession(sessionId, {
            status: 'rejected',
            notification: {
                text: reason,
                isRead: false,
                createdAt: Date.now(),
            },
        });

        await ctx.reply(
            `❌ Заявка от ${session.name} отклонена.\n\n` +
            `Причина: ${reason}`
        );
    }

    fastify.get('/health', async () => {
        return { status: 'ok' };
    });
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
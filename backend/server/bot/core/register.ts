import crypto from "node:crypto";
import {
    createSession,
    getSession,
    updateSession,
} from "./session/store";
import type { FastifyInstance } from "fastify";
import type { IForm, Session } from "../../../server/shared/types/form.types.ts";

export default async function register(fastify : FastifyInstance) {
    const bot = fastify.bot;

    fastify.post<{
        Body : IForm
    }>
    ("/api/message", async (request, reply) => {
        const fields  = request.body;

        const sessionId = crypto.randomUUID();

        const message =
            `📨 <b>Новая заявка</b>\n\n` +
            `👤 <b>Имя:</b> <code>${fields.name?.value ?? ""}</code>\n` +
            (fields.subname?.value
                ? `👤 <b>Фамилия:</b> <code>${fields.subname.value}</code>\n`
                : "") +
            `📧 <b>Email:</b> <code>${fields.email?.value ?? ""}</code>\n` +
            `🏙️ <b>Город:</b> <code>${fields.country?.value ?? ""}</code>\n` +
            `📌 <b>Тема:</b> <code>${fields.topic?.value ?? ""}</code>\n\n` +
            `💬 <b>Сообщение:</b>\n` +
            `<blockquote>${fields.message?.value ?? ""}</blockquote>`;

        const telegramMessage = await bot.telegram.sendMessage(
            fastify.config.TELEGRAM_CHAT_ID,
            message,
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "✅ Принять",
                            callback_data: `accept_${sessionId}`,
                        },
                        {
                            text: "❌ Отклонить",
                            callback_data: `reject_${sessionId}`,
                        },
                    ]],
                },
            }
        );
        const session : Session = {
            id: sessionId,
            name: fields.name?.value ?? "",
            subname: fields.subname?.value ?? "",
            email: fields.email?.value ?? "",
            country: fields.country?.value ?? "",
            topic: fields.topic?.value ?? "",
            message: fields.message?.value ?? "",
            status: "pending",
            messageId: telegramMessage.message_id,
            createdAt: Date.now(),
        };
        createSession(sessionId, session);

        return reply.send({
            success: true,
            sessionId,
        });
    });

    bot.action(/^accept_(.+)$/, async (ctx) => {
        const sessionId = ctx.match[1];

        const session = getSession(sessionId);

        if (!session) {
            return ctx.answerCbQuery("Сессия не найдена");
        }

        updateSession(sessionId, {
            status: "accepted",
        });

        await ctx.answerCbQuery("Заявка принята");

        await ctx.editMessageReplyMarkup({
            inline_keyboard: [],
        });

        await ctx.reply(
            `✅ Заявка от ${session.name} принята`
        );
    });

    bot.action(/^reject_(.+)$/, async (ctx) => {
        const sessionId = ctx.match[1];

        const session = getSession(sessionId);

        if (!session) {
            return ctx.answerCbQuery("Сессия не найдена");
        }

        updateSession(sessionId, {
            status: "rejected",
        });

        await ctx.answerCbQuery("Заявка отклонена");

        await ctx.editMessageReplyMarkup({
            inline_keyboard: [],
        });

        await ctx.reply(
            `❌ Заявка от ${session.name} отклонена`
        );
    });

    fastify.get("/health", async () => {
        return {
            status: "ok",
        };
    });
}
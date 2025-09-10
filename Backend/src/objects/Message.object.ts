import { Prisma } from "@prisma/client";
import prisma from "../config/db.config";

export async function createMessage(
    sender_id: number,
    receiver_id: number,
    content: string,
    sent_at?: Date,
) {
    try {
        const user = await prisma.message.create({
            data: {
                sender_id,
                receiver_id,
                content,
                sent_at: sent_at ?? new Date(),
            },
        });
        return user;
    } catch (error) {
        throw error;
    }
}

export async function getMessageById(id: number) {
    try {
        const message = await prisma.message.findUnique({
            where: { id }
        });
        return message;
    } catch (error) {
        throw error;
    }
}

export async function getSendMesssagesByUserId(userId: number) {
    try {
        const messages = await prisma.message.findMany({
            where: { sender_id: userId }
        });
        return messages;
    } catch (error) {
        throw error;
    }
}

export async function getReceivedMessagesByUserId(userId: number) {
    try {
        const messages = await prisma.message.findMany({
            where: { receiver_id: userId }
        });
        return messages;
    } catch (error) {
        throw error;
    }
}

export async function getAllMessages() {
    try {
        const messages = await prisma.message.findMany();
        return messages;
    } catch (error) {
        throw error;
    }
}

export async function updateMessage(id: number, updateFields: Prisma.MessageUpdateInput) {
    try {
        const message = await prisma.message.update({
            where: {
                id
            },
            data: {
                ...updateFields
            },
        });

        return message;
    } catch (error) {
        throw error;
    }
}

export async function deleteMessage(id: number) {
    try {
        const message = await prisma.message.delete({
            where: { id },
        });
        return message;
    } catch (error) {
        throw error;
    }
}

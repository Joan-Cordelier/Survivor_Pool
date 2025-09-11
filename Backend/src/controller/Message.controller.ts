import { Request, Response } from 'express';
import { createMessage, getMessageById, getAllMessages, deleteMessage, updateMessage, getReceivedMessagesByUserId, getSendMesssagesByUserId } from "../objects/Message.object"
import { Prisma } from "@prisma/client"


export const createMessageController = async (req: Request, res: Response): Promise<void> => {
    const { sender_id, receiver_id, content } = req.body;
    
    console.log("Creating message:", { sender_id, receiver_id, content });
    if (!sender_id || !receiver_id || !content) {
        res.status(400).json({ message: "Missing required fields", code: 400 });
        return;
    }
    try {
        const message = await createMessage(
            sender_id,
            receiver_id,
            content
        );
        res.status(201).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

export const getMessageByIdController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    
    if (!id) {
        res.status(400).json({ message: "Missing message ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid message ID", code: 422 });
        return;
    }
    try {
        const message = await getMessageById(id);
        if (!message) {
            res.status(404).json({ message: "Message not found", code: 404 });
            return;
        }
        res.status(200).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

export const getAllMessagesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const messages = await getAllMessages();
        res.status(200).json(messages);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

export const deleteMessageController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    
    if (!id) {
        res.status(400).json({ message: "Missing message ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid message ID", code: 422 });
        return;
    }
    try {
        const message = await deleteMessage(id);
        if (!message) {
            res.status(404).json({ message: "Message not found", code: 404 });
            return;
        }
        res.status(200).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

export const updateMessageController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { updateFields } = req.body;

    if (!id) {
        res.status(400).json({ message: "Missing message ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid message ID", code: 422 });
        return;
    }
    if (!updateFields || Object.keys(updateFields).length === 0) {
        res.status(400).json({ message: "No fields to update", code: 400 });
        return;
    }

    const authorizedFields = ['content'];
    const filteredFields: Prisma.MessageUpdateInput = {};

    for (const field of authorizedFields) {
        if (updateFields[field]) {
            (filteredFields as any)[field] = updateFields[field];
        }
    }

    if (Object.keys(filteredFields).length === 0) {
        res.status(422).json({ message: "No valid fields to update", code: 422 });
        return;
    }

    try {
        const message = await updateMessage(id, filteredFields);
        res.status(200).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

export const getSentMessagesByUserIdController = async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.params.userId);

    if (!userId) {
        res.status(400).json({ message: "Missing user ID", code: 400 });
        return;
    }
    if (isNaN(userId)) {
        res.status(422).json({ message: "Invalid user ID", code: 422 });
        return;
    }
    try {
        const messages = await getSendMesssagesByUserId(userId);
        res.status(200).json(messages);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

export const getReceivedMessagesByUserIdController = async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.params.userId);

    if (!userId) {
        res.status(400).json({ message: "Missing user ID", code: 400 });
        return;
    }
    if (isNaN(userId)) {
        res.status(422).json({ message: "Invalid user ID", code: 422 });
        return;
    }
    try {
        const messages = await getReceivedMessagesByUserId(userId);
        res.status(200).json(messages);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

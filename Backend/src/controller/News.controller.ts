import { Request, Response } from 'express';
import { createNews, getNewsById, getAllNews, deleteNews, updateNews } from "../objects/News.object"
import { Prisma } from "@prisma/client"


export const createNewsController = async (req: Request, res: Response): Promise<void> => {
    const { news_date, location, title, category, startup_id, description, image } = req.body;

    if (!title || !description) {
        res.status(400).json({ message: "Missing required fields", code: 400 });
        return;
    }
    try {
        const news = await createNews(
            String(title).trim(),
            String(description).trim(),
            news_date ? String(news_date).trim() : undefined,
            location ? String(location).trim() : undefined,
            category ? String(category).trim() : undefined,
            startup_id ? Number(startup_id) : undefined,
            image ? String(image) : undefined
        );
        res.status(201).json(news);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const getNewsByIdController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!id) {
        res.status(400).json({ message: "Missing news ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid news ID", code: 422 });
        return;
    }
    try {
        const news = await getNewsById(id);
        if (!news) {
            res.status(404).json({ message: "News not found", code: 404 });
            return;
        }
        res.status(200).json(news);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const getAllNewsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const all_news = await getAllNews();
        res.status(200).json(all_news);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const deleteNewsController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!id) {
        res.status(400).json({ message: "Missing news ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid news ID", code: 422 });
        return;
    }
    try {
        const news = await getNewsById(id);
        if (!news) {
            res.status(404).json({ message: "News not found", code: 404 });
            return;
        }
        await deleteNews(id);
        res.status(200).json({ message: "News deleted successfully", code: 200 });
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const updateNewsController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { updateFields } = req.body;

    if (!id) {
        res.status(400).json({ error: "ID is required" });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ error: "Invalid ID" });
        return;
    }
    if (!updateFields) {
        res.status(400).json({ error: "Missing update fields" });
        return;
    }

    const authorizedFields = [ "title", "description", "location", "category", "startup_id", "news_date", "image" ];
    const filteredFields: Prisma.NewsDetailUpdateInput = {};

    for (const field of authorizedFields) {
        if (Object.prototype.hasOwnProperty.call(updateFields, field)) {
            let value = updateFields[field];
            if (field === 'startup_id') {
                if (value === '' || value == null)
                    value = null;
                else
                    value = Number(value);
            }
            if (field === 'news_date' && value === '')
                value = null;
            if (value === '')
                value = null;
            (filteredFields as any)[field] = value;
        }
    }

    if (Object.keys(filteredFields).length === 0) {
        console.error('No valid fields to update');
        res.status(422).json({ error: 'No valid fields to update' });
        return;
    }

    try {
        const updatedNews = await updateNews(id, filteredFields);
        res.status(200).json({ message: "News updated successfully", news: updatedNews });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

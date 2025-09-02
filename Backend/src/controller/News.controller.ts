import { Request, Response } from 'express';
import { createNews, getNewsById, getAllNews, deleteNews } from "../objects/News.object"

export const createNewsController = async (req: Request, res: Response): Promise<void> => {
    const { news_date, location, title, category, startup_id, description } = req.body;

    if (!title || !description) {
        res.status(400).json({ message: "Missing required fields", code: 400 });
        return;
    }
    try {
        const news = await createNews(
            news_date ?? null,
            location ?? null,
            title,
            category ?? null,
            startup_id ?? null,
            description
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

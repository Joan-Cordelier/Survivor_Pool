import { Request, Response } from 'express';
import { createStartup, getAllStartups, getStartupById, deleteStartup } from "../objects/Startup.object"
import { Console } from 'console';


export const createStartupController = async (req: Request, res: Response): Promise<void> => {
    const { name, email, legal_status, address, phone, created_at, description, website_url, social_media_url, project_status, needs, sector, maturity, founders } = req.body;

    if (!name || !email) {
        res.status(400).json({ error: 'Name and email are required' });
        return;
    }

    try {
        const startup = await createStartup(
            name,
            email,
            legal_status,
            address,
            phone,
            created_at,
            description,
            website_url,
            social_media_url,
            project_status,
            needs,
            sector,
            maturity,
            founders
        );

        res.status(201).json(startup);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllStartupsController = async (req: Request, res: Response): Promise<void> => {
    console.log("Fetching all startups...");
    try {
        const startups = await getAllStartups();
        res.status(200).json(startups);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getStartupByIdController = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (!id) {
        res.status(400).json({ message: "Missing user ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid user ID", code: 422 });
        return;
    }
    try {
        const startup = await getStartupById(Number(id));
        res.status(200).json(startup);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteStartupController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!id) {
        res.status(400).json({ message: "Missing user ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid user ID", code: 422 });
        return;
    }
    try {
        const response = await deleteStartup(Number(id));
        res.status(200).json(response);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

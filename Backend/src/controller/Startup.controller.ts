import { Request, Response } from 'express';
import { createStartup, getAllStartups, getStartupById, deleteStartup, updateStartup } from "../objects/Startup.object"
import { Prisma } from '@prisma/client';


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
            undefined,
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

export const updateStartupController = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const { updateFields } = req.body;

    if (!id) {
        res.status(400).json({ message: "Missing startup ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid startup ID", code: 422 });
        return;
    }
    if (!updateFields) {
        res.status(400).json({ message: "Missing update fields", code: 400 });
        return;
    }

    const authorizedFields = [ "name", "legal_status", "address", "email", "phone", "description", "website_url", "social_media_url", "project_status", "needs", "sector", "maturity" ];
    const filteredFields: Prisma.StartupDetailUpdateInput = {};

    for (const field of authorizedFields) {
        if (updateFields[field]) {
            (filteredFields as any)[field] = updateFields[field];
        }
    }

    if (Object.keys(filteredFields).length === 0) {
        console.error('No valid fields to update');
        res.status(422).json({ error: 'No valid fields to update' });
        return;
    }

    try {
        const updatedStartup = await updateStartup(id, filteredFields);
        res.status(200).json({ message: "Startup updated successfully", startup: updatedStartup });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

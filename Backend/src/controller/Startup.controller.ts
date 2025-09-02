import { Request, Response } from 'express';
import { Startup } from "../objects/Startup.object"

export const createStartupController = async (req: Request, res: Response): Promise<void> => {
    const {
        name,
        legal_status,
        address,
        email,
        phone,
        created_at,
        description,
        website_url,
        social_media_url,
        project_status,
        needs,
        sector,
        maturity
    } = req.body;

    if (!name || !email) {
        res.status(400).json({ message: "Missing required fields (name, email)", code: 400 });
        return;
    }
    try {
        const startup = await Startup.create({
            name,
            legal_status: legal_status ?? null,
            address: address ?? null,
            email,
            phone: phone ?? null,
            created_at: created_at ?? null,
            description: description ?? null,
            website_url: website_url ?? null,
            social_media_url: social_media_url ?? null,
            project_status: project_status ?? null,
            needs: needs ?? null,
            sector: sector ?? null,
            maturity: maturity ?? null
        });
        if (!startup) {
            res.status(409).json({ message: "Email already exists", code: 409 });
            return;
        }
        res.status(201).json(startup);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const getStartupByIdController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!id) {
        res.status(400).json({ message: "Missing startup ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid startup ID", code: 422 });
        return;
    }
    try {
        const startup = await Startup.findById(id);
        if (!startup) {
            res.status(404).json({ message: "Startup not found", code: 404 });
            return;
        }
        res.status(200).json(startup);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const getAllStartupsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const startups = await Startup.findAll();
        res.status(200).json(startups);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const deleteStartupController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!id) {
        res.status(400).json({ message: "Missing startup ID", code: 400 });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ message: "Invalid startup ID", code: 422 });
        return;
    }
    try {
        const startup = await Startup.findById(id);
        if (!startup) {
            res.status(404).json({ message: "Startup not found", code: 404 });
            return;
        }
        await Startup.delete(id);
        res.status(200).json({ message: "Startup deleted successfully", code: 200 });
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

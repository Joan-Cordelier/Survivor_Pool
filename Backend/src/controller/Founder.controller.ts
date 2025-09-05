import { Request, Response } from 'express';
import { createFounder, getFounderById, getAllFounders, deleteFounder, updateFounder } from "../objects/Founder.object"
import { Prisma } from "@prisma/client"


export const createFounderController = async (req: Request, res: Response): Promise<void> => {
    const { name, startup_id, image } = req.body;

    if (!name || !startup_id) {
        res.status(400).json({ message: "Missing required fields", code: 400 });
        return;
    }
    try {
        const founder = await createFounder(
            name,
            startup_id,
            image
        );
        res.status(201).json(founder);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const getFounderByIdController = async (req: Request, res: Response): Promise<void> => {
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
        const founder = await getFounderById(id);
        if (!founder) {
            res.status(404).json({ message: "User not found", code: 404 });
            return;
        }
        res.status(200).json(founder);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const getAllFoundersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const founders = await getAllFounders();
        res.status(200).json(founders);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const deleteFounderController = async (req: Request, res: Response): Promise<void> => {
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
        const founder = await getFounderById(id);
        if (!founder) {
            res.status(404).json({ message: "User not found", code: 404 });
            return;
        }
        await deleteFounder(id);
        res.status(200).json({ message: "User deleted successfully", code: 200 });
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const updateFounderController = async (req: Request, res: Response): Promise<void> => {
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

    const authorizedFields = [ "name", "image" ];
    const filteredFields: Prisma.FounderUpdateInput = {};

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
        const updatedFounder = await updateFounder(id, filteredFields);
        res.status(200).json({ message: "Founder updated successfully", founder: updatedFounder });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

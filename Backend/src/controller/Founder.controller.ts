import { Request, Response } from 'express';
import { createFounder, getFounderById, getAllFounders, deleteFounder } from "../objects/Founder.object"

export const createFounderController = async (req: Request, res: Response): Promise<void> => {
    const { name, startup_id } = req.body;

    if (!name || !startup_id) {
        res.status(400).json({ message: "Missing required fields", code: 400 });
        return;
    }
    try {
        const founder = await createFounder(
            name,
            startup_id
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

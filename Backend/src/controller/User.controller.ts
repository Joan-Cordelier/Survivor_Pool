import { Request, Response } from 'express';
import { User } from "../objects/User"

export const createUserController = async (req: Request, res: Response): Promise<void> => {
    const { email, name, founder_id, investor_id } = req.body;

    if (!email || !name) {
        res.status(400).json({ message: "Missing required fields", code: 400 });
        return;
    }
    try {
        const user = await User.create({
            email,
            name,
            role: 'default',
            founder_id: founder_id ?? null,
            investor_id: investor_id ?? null
        });
        if (!user) {
            res.status(409).json({ message: "Email already exists", code: 409 });
            return;
        }
        res.status(201).json(user);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
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
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found", code: 404 });
            return;
        }
        res.status(200).json(user);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
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
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found", code: 404 });
            return;
        }
        await User.delete(id);
        res.status(200).json({ message: "User deleted successfully", code: 200 });
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

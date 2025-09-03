import { Request, Response } from 'express';
import { createUser, getUserById, getAllUsers, deleteUser } from "../objects/User.object"

export const createUserController = async (req: Request, res: Response): Promise<void> => {
    const { email, name, role, password, founder_id, investor_id } = req.body;

    if (!email || !name || !password) {
        res.status(400).json({ message: "Missing required fields", code: 400 });
        return;
    }
    try {
        const user = await createUser(
            email,
            name,
            password,
            role ?? 'default',
            founder_id ?? null,
            investor_id ?? null
        );
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
        const user = await getUserById(id);
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
        const users = await getAllUsers();
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
        const user = await getUserById(id);
        if (!user) {
            res.status(404).json({ message: "User not found", code: 404 });
            return;
        }
        await deleteUser(id);
        res.status(200).json({ message: "User deleted successfully", code: 200 });
    } catch (err: any) {
        res.status(400).json({ message: err.message, code: 400 });
    }
};

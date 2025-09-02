import { Request, Response } from 'express';
import { createUser, getUserById, getAllUsers, deleteUser } from "../objects/User.object"


const createUserController = async (req: Request, res: Response): Promise<void> => {
    const { email, name, role, founder_id, investor_id } = req.body;

    if (!email || !name || !role) {
        res.status(400).json({ message: "Missing required fields", code: 400 });
        return;
    }
    try {
        const user = await createUser(email, name, role, founder_id, investor_id);
        res.status(201).json(user);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: "Missing user ID", code: 400 });
        return;
    }
    if (typeof id !== 'number') {
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
        res.status(500).json({ message: err.message, code: 500 });
    }
};

const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

const deleteUserController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: "Missing user ID", code: 400 });
        return;
    }
    if (typeof id !== 'number') {
        res.status(422).json({ message: "Invalid user ID", code: 422 });
        return;
    }
    try {
        const user = await deleteUser(id);
        if (!user) {
            res.status(404).json({ message: "User not found", code: 404 });
            return;
        }
        res.status(200).json({ message: "User deleted successfully", code: 200 });
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

export {
    createUserController,
    getUserByIdController,
    getAllUsersController,
    deleteUserController
};

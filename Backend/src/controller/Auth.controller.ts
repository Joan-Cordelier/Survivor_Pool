import e, { Request, Response } from 'express';
import prisma from '../config/db.config';
import { signToken } from '../middleware/auth';
import crypto from 'crypto';

const SALT_BYTES = 16;
const KEY_LEN = 64;

export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
    const derived = crypto.scryptSync(password, salt, KEY_LEN).toString('hex');

    return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
    const parts = stored.split(':');
    if (parts.length !== 2)
        return false;
    const [salt, key] = parts;
    const derived = crypto.scryptSync(password, salt, KEY_LEN).toString('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(key, 'hex'));
    } catch (e) {
        return false;
    }
}

export const register = async (req: Request, res: Response): Promise<void> => {
    const { email, name, password, role } = req.body ?? {};

    if (!email || !name || !password) {
        res.status(400).json({ message: 'Missing required fields: email, name, password' });
        return;
    }
    try {
        const storedPassword = hashPassword(password);
        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing && existing.password == "") {
            const token = signToken({ id: existing.id, email: existing.email, name: existing.name, role: existing.role });
            await prisma.user.update({
                where: { email },
                data: { password: storedPassword },
            });
            res.status(201).json({user: { id: existing.id, email: existing.email, name: existing.name, role: existing.role }, token });
            return;
        } else if (existing) {
            res.status(409).json({ message: 'User already exists.', code: 409 });
            return;
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: storedPassword,
                name,
                role: role ?? 'default',
            },
        });

        const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
        res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (err: any) {
        res.status(500).json({ message: err.message, code: 500 });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
        res.status(400).json({ message: 'Missing required fields: email, password', code: 400 });
        return;
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(401).json({ message: 'Invalid credentials', code: 401 });
            return;
        }

        const is_valid = verifyPassword(password, user.password);
        if (!is_valid) {
            res.status(401).json({ message: 'Invalid credentials', code: 401 });
            return;
        }

        const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
        res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Failed to login', code: 500 });
    }
};

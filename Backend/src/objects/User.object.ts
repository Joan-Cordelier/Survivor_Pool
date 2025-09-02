import prisma from '../config/db.config';
import { User as PrismaUser } from '@prisma/client';

export class User {
    private data: PrismaUser;

    constructor(data: PrismaUser) {
        this.data = data;
    }

    // Accesseurs
    get id() { return this.data.id; }
    get email() { return this.data.email; }
    get name() { return this.data.name; }
    get founder_id() { return this.data.founder_id; }
    get investor_id() { return this.data.investor_id; }

    static async create(data: Omit<PrismaUser, 'id'>): Promise<User | null> {
        const existingUser = await prisma.user.findFirst({ where: { email: data.email } });
        if (existingUser)
            return null;
        const user = await prisma.user.create({ data });
        return new User(user);
    }

    static async findById(id: number): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { id } });
        return user ? new User(user) : null;
    }

    static async update(id: number, data: Partial<PrismaUser>): Promise<User | null> {
        const user = await prisma.user.update({ where: { id }, data });
        return user ? new User(user) : null;
    }

    static async delete(id: number): Promise<void> {
        await prisma.user.delete({ where: {id} });
    }

    static async findAll() {
        try {
            const users = await prisma.user.findMany();
            return users;
        } catch (error) {
            throw error;
        }
    }
}
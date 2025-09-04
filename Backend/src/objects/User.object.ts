import { Prisma } from "@prisma/client";
import prisma from "../config/db.config";
import { hashPassword } from "../controller/Auth.controller";

export async function createUser(
    email: string,
    name: string,
    password: string,
    role: string,
    founder_id?: number | null,
    investor_id?: number | null
) {
    try {
        const UserExist = await prisma.user.findUnique({
            where: { email }
        });

        if (UserExist)
            throw new Error("User already exists");

        const hashed = hashPassword(password);
        const data: any = {
            email,
            name,
            password: hashed,
            role,
            founder_id: founder_id ?? null,
            investor_id: investor_id ?? null
        };
        const user = await prisma.user.create({ data });

        return user;
    } catch (error) {
        throw error;
    }
}

export async function getUserById(id: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });
        return user;
    } catch (error) {
        throw error;
    }
}

export async function getAllUsers() {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        throw error;
    }
}

export async function updateUser(id: number, updateFields: Prisma.UserUpdateInput) {
    if (updateFields.password && typeof updateFields.password === 'string') {
        updateFields.password = hashPassword(updateFields.password);
    }
    try {
        const user = await prisma.user.update({
            where: {
                id
            },
            data: {
                ...updateFields
            },
        });

        return user;
    } catch (error) {
        throw error;
    }
}

export async function deleteUser(id: number) {
    try {
        const user = await prisma.user.delete({
            where: { id },
        });
        return user;
    } catch (error) {
        throw error;
    }
}

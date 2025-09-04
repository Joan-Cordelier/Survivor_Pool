import { Prisma } from "@prisma/client";
import prisma from "../config/db.config";
import { hashPassword } from "../controller/Auth.controller";

export async function createUser(
    email: string,
    name: string,
    password: string,
    role: string,
    id?: number,
    founder_id?: number,
    investor_id?: number
) {
    try {
        const UserExist = await prisma.user.findUnique({
            where: { email }
        });

        if (UserExist)
            throw new Error("User already exists");

        if (id) {
            const UserExistById = await prisma.user.findUnique({
                where: { id }
            });

            if (UserExistById)
                throw new Error("User with this ID already exists");
        }

        const user = await prisma.user.create({
            data: {
                id,
                email,
                name,
                password,
                role,
                founder_id,
                investor_id
            },
        });

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

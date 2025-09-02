import prisma from "../config/db.config";

async function createUser(
    email: string,
    name: string,
    role: string,
    founder_id?: number,
    investor_id?: number
) {
    try {
        const UserExist = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (UserExist) {
            throw new Error("User already exists");
        }

        const user = await prisma.user.create({
            data: {
                email,
                name,
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

async function getUserById(id: number) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        });
        return user;
    } catch (error) {
        throw error;
    }
}

async function getAllUsers() {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        throw error;
    }
}

async function deleteUser(id: number) {
    try {
        const user = await prisma.user.delete({
            where: {
                id
            },
        });
        return user;
    } catch (error) {
        throw error;
    }
}

export {
    createUser,
    getUserById,
    getAllUsers,
    deleteUser
};

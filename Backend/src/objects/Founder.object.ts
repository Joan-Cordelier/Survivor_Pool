import prisma from "../config/db.config";

export async function createFounder(
    name: string,
    startup_id: number,
) {
    try {
        // const UserExist = await prisma.user.findUnique({
        //     where: {
        //         email
        //     }
        // });
        // if (UserExist) {
        //     throw new Error("User already exists");
        // }
        const founder = await prisma.founder.create({
            data: {
                name,
                startup_id
            },
        });
        return founder;
    } catch (error) {
        throw error;
    }
}

export async function getFounderById(id: number) {
    try {
        const founder = await prisma.founder.findUnique({
            where: { id }
        });
        return founder;
    } catch (error) {
        throw error;
    }
}

export async function getAllFounders() {
    try {
        const founders = await prisma.founder.findMany();
        return founders;
    } catch (error) {
        throw error;
    }
}

export async function deleteFounder(id: number) {
    try {
        const founder = await prisma.founder.delete({
            where: { id },
        });
        return founder;
    } catch (error) {
        throw error;
    }
}

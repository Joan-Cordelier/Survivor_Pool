import prisma from "../config/db.config";

export async function createFounder(
    name: string,
    startup_id: number,
    id?: number,
    image?: string
) {
    if (id) {
        const founderExist = await prisma.founder.findUnique({
            where: { id }
        });

        if (founderExist) {
            throw new Error("Founder with this ID already exists");
        }
    }

    try {
        const founder = await prisma.founder.create({
            data: {
                id,
                name,
                startup_id,
                image
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

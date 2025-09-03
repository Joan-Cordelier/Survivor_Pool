import prisma from "../config/db.config"


export async function createPartner(
    name: string,
    email: string,
    id?: number,
    legal_status?: string,
    address?: string,
    phone?: string,
    created_at?: string,
    description?: string,
    partnership_type?: string
) {
    if (id) {
        const partnerExist = await prisma.partner.findUnique({
            where: { id }
        });

        if (partnerExist) {
            throw new Error("Partner with this ID already exists");
        }
    }

    try {
        const partner = await prisma.partner.create({
            data: {
                id,
                name,
                email,
                legal_status,
                address,
                phone,
                created_at,
                description,
                partnership_type
            }
        });
        return partner;
    } catch (error) {
        throw error;
    }
}

export async function getPartnerById(id: number) {
    try {
        const partner = await prisma.partner.findUnique({
            where: { id }
        });
        return partner;
    } catch (error) {
        throw error;
    }
}

export async function getAllPartners() {
    try {
        const partners = await prisma.partner.findMany();
        return partners;
    } catch (error) {
        throw error;
    }
}

export async function deletePartner(id: number) {
    try {
        const partner = await prisma.partner.delete({
            where: { id },
        });
        return partner;
    } catch (error) {
        throw error;
    }
}

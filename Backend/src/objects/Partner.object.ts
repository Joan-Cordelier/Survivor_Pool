import prisma from "../config/db.config"


export async function createPartner(
    name: string,
    email: string,
    legal_status?: string,
    address?: string,
    phone?: string,
    created_at?: string,
    description?: string,
    partnership_type?: string
) {
    try {
        const partner = await prisma.partner.create({
            data: {
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

import prisma from "../config/db.config";


export async function createInvestor(
    name: string,
    email: string,
    legal_status?: string,
    address?: string,
    phone?: string,
    created_at?: string,
    description?: string,
    investor_type?: string,
    investment_focus?: string
) {
    try {
        const investor = await prisma.investor.create({
            data: {
                name,
                email,
                legal_status,
                address,
                phone,
                created_at,
                description,
                investor_type,
                investment_focus
            }
        });
        return investor;
    } catch (error) {
        throw error;
    }
}

export async function getInvestorById(id: number) {
    try {
        const investor = await prisma.investor.findUnique({
            where: { id }
        });
        return investor;
    } catch (error) {
        throw error;
    }
}

export async function getAllInvestors() {
    try {
        const investors = await prisma.investor.findMany();
        return investors;
    } catch (error) {
        throw error;
    }
}

export async function deleteInvestor(id: number) {
    try {
        const investor = await prisma.investor.delete({
            where: { id }
        });
        return investor;
    } catch (error) {
        throw error;
    }
}

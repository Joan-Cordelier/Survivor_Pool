import prisma from "../config/db.config";
import { Prisma } from "@prisma/client"


export async function createInvestor(
    name: string,
    email: string,
    id?: number,
    legal_status?: string,
    address?: string,
    phone?: string,
    created_at?: string,
    description?: string,
    investor_type?: string,
    investment_focus?: string
) {
    if (id) {
        const investorExist = await prisma.investor.findUnique({
            where: { id }
        });

        if (investorExist) {
            throw new Error("Investor with this ID already exists");
        }
    }

    try {
        const investor = await prisma.investor.create({
            data: {
                id,
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

export async function updateInvestor(id: number, updateFields: Prisma.InvestorUpdateInput) {
    try {
        const investor = await prisma.investor.update({
            where: { id },
            data: { ...updateFields },
        });
        return investor;
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

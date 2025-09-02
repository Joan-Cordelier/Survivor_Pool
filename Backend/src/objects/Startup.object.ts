import prisma from '../config/db.config';
import { Prisma } from '@prisma/client';

export async function createStartup(
    name: string,
    email: string,
    legal_status?: string,
    address?: string,
    phone?: string,
    created_at?: string,
    description?: string,
    website_url?: string,
    social_media_url?: string,
    project_status?: string,
    needs?: string,
    sector?: string,
    maturity?: string,
    founders?: { id: number; name: string; startup_id: number; }[]
) {
    let foundersData: any[] = [];
    
    if (founders) {
        foundersData = await prisma.founder.findMany({
            where: {
                id: {
                    in: founders.map((founder) => founder.id)
                }
            }
        });
        
        if (foundersData.length === 0) {
            throw new Error('Founders not found');
        }
    }

    try {
        const startup = await prisma.$transaction(async (prisma) => {
            const data: Prisma.StartupDetailCreateInput = {
                name,
                email,
                legal_status,
                address,
                phone,
                created_at,
                description,
                website_url,
                social_media_url,
                project_status,
                needs,
                sector,
                maturity,
            };

            if (foundersData.length > 0) {
                data.founders = {
                    connect: foundersData.map((founder) => ({ id: founder.id }))
                };
            }

            const startupDetail = await prisma.startupDetail.create({ data });

            return startupDetail;
        });

        return startup;
    } catch (error) {
        throw error;
    }
}

export async function getStartupById(id: number) {
    try {
        const startup = await prisma.startupDetail.findUnique({
            where: { id },
            include: { founders: true }
        });

        if (!startup) {
            throw new Error('Startup not found');
        }

        return startup;
    } catch (error) {
        throw error;
    }
}

export async function getAllStartups() {
    try {
        const startups = await prisma.startupDetail.findMany({
            include: { founders: true }
        });
        return startups;
    } catch (error) {
        throw error;
    }
}

export async function deleteStartup(id: number) {
    try {
        const startup = await prisma.startupDetail.findUnique({
            where: { id }
        });

        if (!startup) {
            throw new Error('Startup not found');
        }

        await prisma.startupDetail.delete({
            where: { id }
        });

        return { message: 'Startup deleted successfully' };
    } catch (error) {
        throw error;
    }
}

import prisma from '../config/db.config';
import { StartupDetail as PrismaStartup } from '@prisma/client';

export class Startup {
    private data: PrismaStartup;

    constructor(data: PrismaStartup) {
        this.data = data;
    }

    // Accesseurs
    get id() { return this.data.id; }
    get name() { return this.data.name; }
    get legal_status() { return this.data.legal_status; }
    get address() { return this.data.address; }
    get email() { return this.data.email; }
    get phone() { return this.data.phone; }
    get created_at() { return this.data.created_at; }
    get description() { return this.data.description; }
    get website_url() { return this.data.website_url; }
    get social_media_url() { return this.data.social_media_url; }
    get project_status() { return this.data.project_status; }
    get needs() { return this.data.needs; }
    get sector() { return this.data.sector; }
    get maturity() { return this.data.maturity; }
    //get founder() { return this.data.founders; }

    static async create(data: Omit<PrismaStartup, 'id'>): Promise<Startup | null> {
        const existingStartup = await prisma.startupDetail.findFirst({ where: { email: data.email } });
        if (existingStartup)
            return null;
        const startup = await prisma.startupDetail.create({ data });
        return new Startup(startup);
    }

    static async findById(id: number): Promise<Startup | null> {
        const startup = await prisma.startupDetail.findUnique({ where: { id } });
        return startup ? new Startup(startup) : null;
    }

    static async update(id: number, data: Partial<PrismaStartup>): Promise<Startup | null> {
        const startup = await prisma.startupDetail.update({ where: { id }, data });
        return startup ? new Startup(startup) : null;
    }

    static async delete(id: number): Promise<void> {
        await prisma.startupDetail.delete({ where: {id} });
    }

    static async findAll() {
        try {
            const startups = await prisma.startupDetail.findMany();
            return startups;
        } catch (error) {
            throw error;
        }
    }
}

import prisma from "../config/db.config";


export async function createEvent(
    name: string,
    dates?: string,
    location?: string,
    description?: string,
    event_type?: string,
    target_audience?: string
){
    try {
        const event = await prisma.event.create({
            data: {
                name,
                dates,
                location,
                description,
                event_type,
                target_audience
            }
        });
        return event;
    } catch (error) {
        throw error;
    }
}

export async function getEventById(id: number) {
    try {
        const event = await prisma.event.findUnique({
            where: { id }
        });
        return event;
    } catch (error) {
        throw error;
    }
}

export async function getAllEvents() {
    try {
        const events = await prisma.event.findMany();
        return events;
    } catch (error) {
        throw error;
    }
}

export async function deleteEvent(id: number) {
    try {
        const event = await prisma.event.delete({
            where: { id }
        });
        return event;
    } catch (error) {
        throw error;
    }
}
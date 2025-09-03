import prisma from "../config/db.config";


export async function createEvent(
    name: string,
    id?: number,
    dates?: string,
    location?: string,
    description?: string,
    event_type?: string,
    target_audience?: string,
    image?: string
){
    if (id) {
        const eventExist = await prisma.event.findUnique({
            where: { id }
        });

        if (eventExist) {
            throw new Error("Event with this ID already exists");
        }
    }

    try {
        const event = await prisma.event.create({
            data: {
                id,
                name,
                dates,
                location,
                description,
                event_type,
                target_audience,
                image
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
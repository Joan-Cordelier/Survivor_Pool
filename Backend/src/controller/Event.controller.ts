import { Request, Response } from 'express';
import { createEvent, getEventById, getAllEvents, deleteEvent, updateEvent } from "../objects/Event.object"
import { Prisma } from "@prisma/client"


export const createEventController = async (req: Request, res: Response): Promise<void> => {
    const { name, dates, date, location, description, event_type, target_audience, image } = req.body;

    if (!name) {
        res.status(400).json({ error: "Name is required" });
        return;
    }
    try {
        const event = await createEvent(name, undefined, (dates || date) || undefined, location, description, event_type, target_audience, image);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: "Failed to create event" });
    }
}

export const getEventByIdController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!id) {
        res.status(400).json({ error: "ID is required" });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ error: "Invalid ID" });
        return;
    }
    try {
        const event = await getEventById(Number(id));
        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve event" });
    }
}

export const getAllEventsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const events = await getAllEvents();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve events" });
    }
}

export const deleteEventController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    if (!id) {
        res.status(400).json({ error: "ID is required" });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ error: "Invalid ID" });
        return;
    }
    try {
        const success = await deleteEvent(id);
        if (!success) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete event" });
    }
}

export const updateEventController = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { updateFields } = req.body;

    if (!id) {
        res.status(400).json({ error: "ID is required" });
        return;
    }
    if (isNaN(id)) {
        res.status(422).json({ error: "Invalid ID" });
        return;
    }
    if (!updateFields) {
        res.status(400).json({ error: "Missing update fields" });
        return;
    }

    const authorizedFields = [ "name", "dates", "date", "location", "description", "event_type", "target_audience", "image" ];
    const filteredFields: Prisma.EventUpdateInput = {};

    for (const field of authorizedFields) {
        if (Object.prototype.hasOwnProperty.call(updateFields, field)) {
            const value = updateFields[field];
            if (field === 'date') {
                (filteredFields as any).dates = value === '' ? null : value;
            } else if (field === 'dates') {
                (filteredFields as any).dates = value === '' ? null : value;
            } else {
                (filteredFields as any)[field] = value === '' ? null : value;
            }
        }
    }

    delete (filteredFields as any).date;

    if (Object.keys(filteredFields).length === 0) {
        console.error('No valid fields to update');
        res.status(422).json({ error: 'No valid fields to update' });
        return;
    }

    try {
        const updatedEvent = await updateEvent(id, filteredFields);
        res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

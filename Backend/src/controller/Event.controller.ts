import { Request, Response } from 'express';
import { createEvent, getEventById, getAllEvents, deleteEvent } from "../objects/Event.object"


export const createEventController = async (req: Request, res: Response): Promise<void> => {
    const { name, date, location, description, event_type, target_audience } = req.body;

    if (!name) {
        res.status(400).json({ error: "Name is required" });
        return;
    }
    try {
        const event = await createEvent(name, date, location, description, event_type, target_audience);
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

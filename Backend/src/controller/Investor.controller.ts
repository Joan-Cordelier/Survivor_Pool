import { Request, Response } from 'express';
import { createInvestor, getAllInvestors, getInvestorById, deleteInvestor, updateInvestor } from "../objects/Investor.object";
import { Prisma } from "@prisma/client"


export const createInvestorController = async (req: Request, res: Response): Promise<void> => {
    const { name, email, legal_status, address, phone, created_at, description, investor_type, investment_focus } = req.body;

    if (!name || !email) {
        res.status(400).json({ error: "Name and email are required" });
        return;
    }

    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const effectiveCreatedAt = (created_at && typeof created_at === 'string' && created_at.trim() !== '') ? created_at : todayStr;
        const investor = await createInvestor(
            name,
            email,
            undefined,
            legal_status,
            address,
            phone,
            effectiveCreatedAt,
            description,
            investor_type,
            investment_focus
        );
        res.status(201).json(investor);
    } catch (error) {
        res.status(500).json({ error: "Failed to create investor" });
    }
}

export const getInvestorByIdController = async (req: Request, res: Response): Promise<void> => {
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
        const investor = await getInvestorById(id);
        if (!investor) {
            res.status(404).json({ error: "Investor not found" });
            return;
        }
        res.status(200).json(investor);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve investor" });
    }
}

export const getAllInvestorsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const investors = await getAllInvestors();
        res.status(200).json(investors);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve investors" });
    }
}

export const deleteInvestorController = async (req: Request, res: Response): Promise<void> => {
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
        const success = await deleteInvestor(id);
        if (!success) {
            res.status(404).json({ error: "Investor not found" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete investor" });
    }
}

export const updateInvestorController = async (req: Request, res: Response): Promise<void> => {
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

    const authorizedFields = [ "name", "email", "legal_status", "address", "phone", "description", "investor_type", "investment_focus" ];
    const filteredFields: Prisma.InvestorUpdateInput = {};

    for (const field of authorizedFields) {
        if (Object.prototype.hasOwnProperty.call(updateFields, field)) {
            const value = updateFields[field];
            (filteredFields as any)[field] = (value === '' ? null : value);
        }
    }

    if (Object.keys(filteredFields).length === 0) {
        console.error('No valid fields to update');
        res.status(422).json({ error: 'No valid fields to update' });
        return;
    }

    try {
        const updatedInvestor = await updateInvestor(id, filteredFields);
        res.status(200).json({ message: "Investor updated successfully", investor: updatedInvestor });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

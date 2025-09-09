import { Request, Response } from 'express';
import { createPartner, getAllPartners, getPartnerById, deletePartner, updatePartner } from '../objects/Partner.object';
import { Prisma } from '@prisma/client';


export const createPartnerController = async (req: Request, res: Response): Promise<void> => {
    const { name, email, legal_status, address, phone, created_at, description, partnership_type } = req.body;

    if (!name || !email) {
        res.status(400).json({ error: 'Name and email are required' });
        return;
    }
    try {
        const partner = await createPartner(
            name,
            email,
            undefined,
            legal_status,
            address,
            phone,
            created_at,
            description,
            partnership_type
        );
        res.status(201).json(partner);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create partner' });
    }
};

export const getAllPartnersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const partners = await getAllPartners();
        res.status(200).json(partners);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve partners' });
    }
};

export const getPartnerByIdController = async (req: Request, res: Response): Promise<void> => {
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
        const partner = await getPartnerById(Number(id));
        if (partner) {
            res.status(200).json(partner);
        } else {
            res.status(404).json({ error: 'Partner not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve partner' });
    }
};

export const deletePartnerController = async (req: Request, res: Response): Promise<void> => {
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
        const partner = await deletePartner(Number(id));
        if (partner) {
            res.status(200).json({ message: 'Partner deleted successfully' });
        } else {
            res.status(404).json({ error: 'Partner not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete partner' });
    }
};

export const updatePartnerController = async (req: Request, res: Response): Promise<void> => {
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

    const authorizedFields = [ "name", "legal_status", "address", "email", "phone", "description", "partnership_type" ];
    const filteredFields: Prisma.PartnerUpdateInput = {};

    for (const field of authorizedFields) {
        if (updateFields[field]) {
            (filteredFields as any)[field] = updateFields[field];
        }
    }

    if (Object.keys(filteredFields).length === 0) {
        console.error('No valid fields to update');
        res.status(422).json({ error: 'No valid fields to update' });
        return;
    }

    try {
        const updatedPartner = await updatePartner(id, filteredFields);
        res.status(200).json({ message: "Partner updated successfully", partner: updatedPartner });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

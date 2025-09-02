import { Request, Response } from 'express';
import { createPartner, getAllPartners, getPartnerById, deletePartner } from '../objects/Partner.object';


export const createPartnerController = async (req: Request, res: Response): Promise<void> => {
    const { name, email, legal_status, address, phone, created_at, description, partnership_type } = req.body;

    try {
        const partner = await createPartner(
            name,
            email,
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

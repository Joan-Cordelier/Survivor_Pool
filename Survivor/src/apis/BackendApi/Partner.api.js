import BaseBackApi from "./BaseBackApi.api";


class PartnerApi extends BaseBackApi {
    async getAllPartners() {
        return this.request('/partner/get', { method: 'GET' });
    }

    async getPartnerById(id) {
        return this.request(`/partner/get/${encodeURIComponent(id)}`, { method: 'GET' });
    }

    async createPartner(payload, token) {
        return this.request('/partner/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async deletePartner(id, token) {
        return this.request(`/partner/delete/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async updatePartner(id, payload, token) {
        return this.request(`/partner/update/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}

export const getAllPartners = () => new PartnerApi().getAllPartners();
export const getPartnerById = (id) => new PartnerApi().getPartnerById(id);
export const createPartner = (payload, token) => new PartnerApi().createPartner(payload, token);
export const deletePartner = (id, token) => new PartnerApi().deletePartner(id, token);
export const updatePartner = (id, payload, token) => new PartnerApi().updatePartner(id, payload, token);

export default { getAllPartners, getPartnerById, createPartner, deletePartner, updatePartner };

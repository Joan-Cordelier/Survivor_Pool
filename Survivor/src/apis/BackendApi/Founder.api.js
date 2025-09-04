import BaseBackApi from "./BaseBackApi.api";


class FounderApi extends BaseBackApi {
    async getAllFounders() {
        return this.request('/founder/get', { method: 'GET' });
    }

    async getFounderById(id) {
        return this.request(`/founder/get/${encodeURIComponent(id)}`, { method: 'GET' });
    }

    async createFounder(payload, token) {
        return this.request('/founder/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async deleteFounder(id, token) {
        return this.request(`/founder/delete/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}

export const getAllFounders = () => new FounderApi().getAllFounders();
export const getFounderById = (id) => new FounderApi().getFounderById(id);
export const createFounder = (payload, token) => new FounderApi().createFounder(payload, token);
export const deleteFounder = (id, token) => new FounderApi().deleteFounder(id, token);

export default { getAllFounders, getFounderById, createFounder, deleteFounder };

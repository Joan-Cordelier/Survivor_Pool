import BaseBackApi from "./BaseBackApi.api";


class StartupApi extends BaseBackApi {
    async getAllStartups() {
        return this.request('/startup/get', { method: 'GET' });
    }

    async getStartupById(id) {
        return this.request(`/startup/get/${encodeURIComponent(id)}`, { method: 'GET' });
    }

    async createStartup(payload, token) {
        return this.request('/startup/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async deleteStartup(id, token) {
        return this.request(`/startup/delete/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async updateStartup(id, payload, token) {
        return this.request(`/startup/update/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}


export const getAllStartups = () => new StartupApi().getAllStartups();
export const getStartupById = (id) => new StartupApi().getStartupById(id);
export const createStartup = (payload, token) => new StartupApi().createStartup(payload, token);
export const deleteStartup = (id, token) => new StartupApi().deleteStartup(id, token);
export const updateStartup = (id, payload, token) => new StartupApi().updateStartup(id, payload, token);

export default { getAllStartups, getStartupById, createStartup, deleteStartup, updateStartup };

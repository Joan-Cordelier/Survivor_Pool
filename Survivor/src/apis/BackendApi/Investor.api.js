import BaseBackApi from "./BaseBackApi.api";


class InvestorApi extends BaseBackApi {
    async getAllInvestors() {
        return this.request('/investor/get', { method: 'GET' });
    }

    async getInvestorById(id) {
        return this.request(`/investor/get/${encodeURIComponent(id)}`, { method: 'GET' });
    }

    async createInvestor(payload, token) {
        return this.request('/investor/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async deleteInvestor(id, token) {
        return this.request(`/investor/delete/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}

export const getAllInvestors = () => new InvestorApi().getAllInvestors();
export const getInvestorById = (id) => new InvestorApi().getInvestorById(id);
export const createInvestor = (payload, token) => new InvestorApi().createInvestor(payload, token);
export const deleteInvestor = (id, token) => new InvestorApi().deleteInvestor(id, token);

export default { getAllInvestors, getInvestorById, createInvestor, deleteInvestor };

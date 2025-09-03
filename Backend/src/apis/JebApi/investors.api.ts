import BaseJebApi from "./BaseJeb.api";

class InvestorsApi extends BaseJebApi {

    //Get investors
    static async getInvestors(): Promise<any[]> {
        const url = `${this.baseUrl}/investors`;
        return await this.request<any[]>(url, { method: 'GET' });
    }

    //Get investor by id
    static async getInvestorById(id: number): Promise<any> {
        const url = `${this.baseUrl}/investors/${id}`;
        return await this.request<any>(url, { method: 'GET' });
    }
}

export default InvestorsApi;

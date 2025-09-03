import BaseJebApi from "./BaseJeb.api";


class PartnersApi extends BaseJebApi {

    //Get partners
    static async getPartners(): Promise<any[]> {
        const url = `${this.baseUrl}/partners`;
        return await this.request<any[]>(url, { method: 'GET' });
    }

    //Get partner by id
    static async getPartnerById(id: number): Promise<any> {
        const url = `${this.baseUrl}/partners/${id}`;
        return await this.request<any>(url, { method: 'GET' });
    }
}

export default PartnersApi;

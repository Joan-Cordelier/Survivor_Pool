import BaseJebApi from "./BaseJeb.api";

class StartupsApi extends BaseJebApi {
    
    //Get startups
    static async getStartups(): Promise<any[]> {
        const url = `${this.baseUrl}/startups`;
        return await this.request<any[]>(url, { method: 'GET' });
    }

    //Get startup by ID
    static async getStartupById(id: number): Promise<any> {
        const url = `${this.baseUrl}/startups/${id}`;
        return await this.request<any>(url, { method: 'GET' });
    }

    //Get founder image
    static async getFounderImage(startup_id: number, founder_id: number): Promise<any> {
        const url = `${this.baseUrl}/startups/${startup_id}/founders/${founder_id}/image`;
        return await this.request<any>(url, { method: 'GET' });
    }
}

export default StartupsApi;

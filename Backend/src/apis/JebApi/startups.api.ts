import BaseJebApi from "./BaseJeb.api";
import zlib from "zlib";

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

    //Get founder image (compressed)
    static async getFounderImage(startup_id: number, founder_id: number): Promise<any> {
        const url = `${this.baseUrl}/startups/${startup_id}/founders/${founder_id}/image`;
        const imageData = await this.request<any>(url, { method: 'GET' });
        if (typeof imageData === 'string') {
            const compressed = zlib.gzipSync(Buffer.from(imageData, 'utf-8'));
            return compressed.toString('base64');
        }
        return imageData;
    }
}

export default StartupsApi;

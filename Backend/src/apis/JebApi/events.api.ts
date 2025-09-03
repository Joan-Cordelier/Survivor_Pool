import BaseJebApi from "./BaseJeb.api";
import zlib from "zlib";


class EventsApi extends BaseJebApi {

    //Get events
    static async getEvents(): Promise<any[]> {
        const url = `${this.baseUrl}/events`;
        return await this.request<any[]>(url, { method: 'GET' });
    }

    //Get event by id
    static async getEventById(id: number): Promise<any> {
        const url = `${this.baseUrl}/events/${id}`;
        return await this.request<any>(url, { method: 'GET' });
    }

    //Get event image (compressed)
    static async getEventImage(id: number): Promise<any> {
        const url = `${this.baseUrl}/events/${id}/image`;
        const imageData = await this.request<any>(url, { method: 'GET' });
        if (typeof imageData === 'string') {
            const compressed = zlib.gzipSync(Buffer.from(imageData, 'utf-8'));
            return compressed.toString('base64');
        }
        return imageData;
    }
}

export default EventsApi;

import BaseJebApi from "./BaseJeb.api";


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

    //Get event image
    static async getEventImage(id: number): Promise<any> {
        const url = `${this.baseUrl}/events/${id}/image`;
        return await this.request<any>(url, { method: 'GET' });
    }
}

export default EventsApi;

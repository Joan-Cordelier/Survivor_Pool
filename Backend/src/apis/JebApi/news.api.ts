import BaseJebApi from "./BaseJeb.api";


class NewsApi extends BaseJebApi {

    //Get news
    static async getNews(): Promise<any[]> {
        const url = `${this.baseUrl}/news`;
        return await this.request<any[]>(url, { method: 'GET' });
    }

    //Get news by id
    static async getNewsById(id: number): Promise<any> {
        const url = `${this.baseUrl}/news/${id}`;
        return await this.request<any>(url, { method: 'GET' });
    }

    //Get news image
    static async getNewsImage(id: number): Promise<any> {
        const url = `${this.baseUrl}/news/${id}/image`;
        return await this.request<any>(url, { method: 'GET' });
    }
}

export default NewsApi;

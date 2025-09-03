import { JEB_URL, JEB_API_KEY } from "../../global";


class BaseJebApi {
    protected static baseUrl: string = JEB_URL;
    protected static apiKey?: string = JEB_API_KEY;

    protected static async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            ...options.headers as Record<string, string>,
        };
        if (this.apiKey) {
            headers['X-Group-Authorization'] = this.apiKey;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            const text = await response.text();
            let data: any;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = text;
            }

            if (!response.ok) {
                console.log(data);
                console.error(`Error in request to ${url}: ${JSON.stringify(data)}`);
                throw { message: data, status: response.status };
            }

            return data as T;
        } catch (error) {
            console.error(`Error occurred in request to ${url}:`, error);
            throw error;
        }
    }
}

export default BaseJebApi;

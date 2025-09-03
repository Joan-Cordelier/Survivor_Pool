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

            if (!response.ok) {
                let errorResponse;
                try {
                    errorResponse = await response.json();
                } catch (e) {
                    errorResponse = await response.text();
                }
                console.log(errorResponse);
                console.error(`Error in request to ${url}: ${JSON.stringify(errorResponse)}`);
                throw { message: errorResponse, status: response.status };
            }

            return response.json() as T;
        } catch (error) {
            console.error(`Error occurred in request to ${url}:`, error);
            throw error;
        }
    }
}

export default BaseJebApi;

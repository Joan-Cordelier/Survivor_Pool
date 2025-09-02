import { JEB_URL, JEB_API_KEY } from "../../global";


class BaseJebApi {
    protected baseUrl: string;
    protected apiKey?: string;

    constructor() {
        this.baseUrl = JEB_URL;
        this.apiKey = JEB_API_KEY;
    }

    protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers,
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (!response.ok) {
                const errorResponse = await response.json();
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

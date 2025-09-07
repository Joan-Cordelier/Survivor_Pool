import { JEB_URL, JEB_API_KEY } from "../../global";


class BaseJebApi {
    protected static baseUrl: string = JEB_URL;
    protected static apiKey?: string = JEB_API_KEY;

    protected static async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        const isImageEndpoint = /\/image$/i.test(url);
        const headers: Record<string, string> = {
            ...(isImageEndpoint ? {} : { 'Content-Type': 'application/json', 'accept': 'application/json' }),
            ...options.headers as Record<string, string>,
        };
        if (this.apiKey) headers['X-Group-Authorization'] = this.apiKey;

        try {
            const response = await fetch(url, { ...options, headers });

            if (!response.ok) {
                let errorBody: any;
                try { errorBody = await response.text(); } catch { errorBody = ''; }
                console.error(`Error in request to ${url}: ${errorBody}`);
                throw { message: errorBody, status: response.status };
            }

            if (isImageEndpoint) {
                // Read as arrayBuffer then convert to data URL (guess MIME by simple signatures)
                const buf = await response.arrayBuffer();
                const bytes = new Uint8Array(buf);
                // PNG signature 89 50 4E 47, JPEG FF D8 FF
                let mime = 'image/png';
                if (bytes.length > 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) mime = 'image/jpeg';
                const base64 = Buffer.from(bytes).toString('base64');
                const dataUrl = `data:${mime};base64,${base64}`;
                return dataUrl as any as T;
            }

            // Fallback JSON/text logic
            const text = await response.text();
            try {
                return (text ? JSON.parse(text) : {}) as T;
            } catch {
                return text as any as T;
            }
        } catch (error) {
            console.error(`Error occurred in request to ${url}:`, error);
            throw error;
        }
    }
}

export default BaseJebApi;

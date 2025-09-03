import BaseJebApi from "./BaseJeb.api";
import { JEB_URL } from "../../global";


class UsersApi extends BaseJebApi {

    // Get users
    static async getUsers(): Promise<any[]>  {
        const url = `${JEB_URL}/users`;
        return await this.request<any[]>(url, { method: 'GET' });
    }

    // GET user by ID
    static async getUserById(id: number): Promise<any> {
        const url = `${JEB_URL}/users/${id}`;
        return await this.request<any>(url, { method: 'GET' });
    }

    // Get user by email
    static async getUserByEmail(email: string): Promise<any> {
        const url = `${JEB_URL}/users/email/${encodeURIComponent(email)}`;
        return await this.request<any>(url, { method: 'GET' });
    }

    // Get user image
    static async getUserImage(id: number): Promise<any> {
        const url = `${JEB_URL}/users/${id}/image`;
        return await this.request<any>(url, { method: 'GET' });
    }
}

export default UsersApi;

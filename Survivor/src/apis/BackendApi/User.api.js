import BaseBackApi from "./BaseBackApi.api";


class UserApi extends BaseBackApi {
    async getAllUsers() {
        return this.request('/user/get', { method: 'GET' });
    }

    async getUserById(id) {
        return this.request(`/user/get/${encodeURIComponent(id)}`, { method: 'GET' });
    }

    async createUser(payload, token) {
        return this.request('/user/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async deleteUser(id, token) {
        return this.request(`/user/delete/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async updateUser(id, payload, token) {
        return this.request(`/user/update/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}

export const getAllUsers = () => new UserApi().getAllUsers();
export const getUserById = (id) => new UserApi().getUserById(id);
export const createUser = (payload, token) => new UserApi().createUser(payload, token);
export const deleteUser = (id, token) => new UserApi().deleteUser(id, token);
export const updateUser = (id, payload, token) => new UserApi().updateUser(id, payload, token);

export default { getAllUsers, getUserById, createUser, deleteUser, updateUser };

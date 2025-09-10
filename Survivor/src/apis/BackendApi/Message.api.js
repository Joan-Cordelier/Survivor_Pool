import BaseBackApi from "./BaseBackApi.api";

class MessageApi extends BaseBackApi {
    async createMessage(payload, token) {
        return this.request('/message/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async getSentMessages(userId, token) {
        return this.request(`/message/sent/${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async getReceivedMessages(userId, token) {
        return this.request(`/message/received/${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async getAllMessages(token) {
        return this.request('/message/get', {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async getMessageById(id, token) {
        return this.request(`/message/get/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async deleteMessage(id, token) {
        return this.request(`/message/delete/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async updateMessage(id, payload, token) {
        return this.request(`/message/update/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}

export const createMessage = (payload, token) => new MessageApi().createMessage(payload, token);
export const getSentMessages = (userId, token) => new MessageApi().getSentMessages(userId, token);
export const getReceivedMessages = (userId, token) => new MessageApi().getReceivedMessages(userId, token);
export const getAllMessages = (token) => new MessageApi().getAllMessages(token);
export const getMessageById = (id, token) => new MessageApi().getMessageById(id, token);
export const deleteMessage = (id, token) => new MessageApi().deleteMessage(id, token);
export const updateMessage = (id, payload, token) => new MessageApi().updateMessage(id, payload, token);

export default { createMessage, getSentMessages, getReceivedMessages, getAllMessages, getMessageById, deleteMessage, updateMessage };

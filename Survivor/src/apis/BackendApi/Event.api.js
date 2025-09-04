import BaseBackApi from "./BaseBackApi.api";


class EventApi extends BaseBackApi {
    async getAllEvents() {
        return this.request('/event/get', { method: 'GET' });
    }

    async getEventById(id) {
        return this.request(`/event/get/${encodeURIComponent(id)}`, { method: 'GET' });
    }

    async createEvent(payload, token) {
        return this.request('/event/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async deleteEvent(id, token) {
        return this.request(`/event/delete/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}

export const getAllEvents = () => new EventApi().getAllEvents();
export const getEventById = (id) => new EventApi().getEventById(id);
export const createEvent = (payload, token) => new EventApi().createEvent(payload, token);
export const deleteEvent = (id, token) => new EventApi().deleteEvent(id, token);

export default { getAllEvents, getEventById, createEvent, deleteEvent };

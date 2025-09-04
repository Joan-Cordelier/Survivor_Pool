import BaseBackApi from "./BaseBackApi.api";


class NewsApi extends BaseBackApi {
    async getAllNews() {
        return this.request('/news/get', { method: 'GET' });
    }

    async getNewsById(id) {
        return this.request(`/news/get/${encodeURIComponent(id)}`, { method: 'GET' });
    }

    async createNews(payload, token) {
        return this.request('/news/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async deleteNews(id, token) {
        return this.request(`/news/delete/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}

export const getAllNews = () => new NewsApi().getAllNews();
export const getNewsById = (id) => new NewsApi().getNewsById(id);
export const createNews = (payload, token) => new NewsApi().createNews(payload, token);
export const deleteNews = (id, token) => new NewsApi().deleteNews(id, token);

export default { getAllNews, getNewsById, createNews, deleteNews };

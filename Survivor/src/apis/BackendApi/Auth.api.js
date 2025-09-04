import BaseBackApi from "./BaseBackApi.api";

class AuthApi extends BaseBackApi {
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(name, email, password, role = 'default') {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
        });
    }
}

export const login = (email, password) => new AuthApi().login(email, password);
export const register = (name, email, password, role) => new AuthApi().register(name, email, password, role);

export default { login, register };

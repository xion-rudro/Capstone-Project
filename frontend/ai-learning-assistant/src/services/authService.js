import api from '../utils/axiosinstance';
import paths from '../utils/apiPaths';

const authService = {
  async login(credentials) { return (await api.post(paths.auth.login, credentials)).data; },
  async register(details) { return (await api.post(paths.auth.register, details)).data; },
  async me() { return (await api.get(paths.auth.me)).data; },
  async logout() { return (await api.post(paths.auth.logout)).data; }
};

export default authService;

import { environment } from '../environments/environment';

export const API = {
  // Base URL is read from environment configuration
  baseUrl: environment.apiBaseUrl,
  events: '/events'
};

export default API;

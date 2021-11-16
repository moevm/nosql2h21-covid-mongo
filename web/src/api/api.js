import ENDPOINTS from 'api/endpoints';
const BASE_URL = "http://localhost:8000";

class api {
    constructor(baseUrl, endpoints) {
        this.baseUrl = baseUrl;
        this.endpoints = endpoints;
    }

    async generateRequest(endpoint, data) {
        const {method, uri} = this.endpoints[endpoint];
        const URL = `${this.baseUrl}${uri}`;
        
        if (["GET"].includes(method)) {
            return fetch(URL, {method, params: data});
        } else {
            return fetch(URL, {method, body: data});
        }
    }

    async fetch(endpoint, data) {
        const response = await this.generateRequest(endpoint, data);
        return response.json();
    }
}

export default new api(BASE_URL, ENDPOINTS)
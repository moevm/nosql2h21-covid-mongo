import ENDPOINTS from 'api/endpoints';
const BASE_URL = "http://localhost:8000";

class api {
    constructor(baseUrl, endpoints) {
        this.baseUrl = baseUrl;
        this.endpoints = endpoints;
    }

    makeQueryLink(endpoint, data={}) {
        const {uri} = this.endpoints[endpoint];
        const url = new URL(`${this.baseUrl}${uri}`);

        const pureData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null));
        if (Object.keys(pureData).length > 0) {
            url.search = new URLSearchParams(pureData).toString();
        }

        return url.toString();
    }

    async generateRequest(endpoint, data = {}) {
        const {method, uri} = this.endpoints[endpoint];

        if (["GET"].includes(method)) {
            return fetch(this.makeQueryLink(endpoint, data), {method});
        } else {
            return fetch(`${this.baseUrl}${uri}`, {method, body: data});
        }
    }

    async fetch(endpoint, data) {
        const response = await this.generateRequest(endpoint, data);
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        return response.json()
    }
}

export default new api(BASE_URL, ENDPOINTS)
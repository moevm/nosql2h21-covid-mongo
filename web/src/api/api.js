import ENDPOINTS from 'api/endpoints';
const BASE_URL = "http://localhost:8000";

class api {
    constructor(baseUrl, endpoints) {
        this.baseUrl = baseUrl;
        this.endpoints = endpoints;
    }

    async generateRequest(endpoint, data = {}) {
        const {method, uri} = this.endpoints[endpoint];
        let url = new URL(`${this.baseUrl}${uri}`);
        
        const dataWithoutBlanks = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null));

        if (["GET"].includes(method)) {
            url.search = new URLSearchParams(dataWithoutBlanks).toString();
            return fetch(url, {method});
        } else {
            return fetch(url, {method, body: data});
        }
    }

    async fetch(endpoint, data) {
        const response = await this.generateRequest(endpoint, data);
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        return response.json()
    }

    download(endpoint, data = {}) {
        this.generateRequest(endpoint, data)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(
              new Blob([blob]),
            );
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
              'download',
              `dataset.json`,
            );
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          });
    }
}

export default new api(BASE_URL, ENDPOINTS)
import axios, { AxiosRequestConfig } from 'axios';

export class ApiService {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor(baseUrl: string, apiKey: string, apiSecret: string) {
        this.baseUrl = baseUrl;
        this.headers = {
            Authorization: `token ${apiKey}:${apiSecret}`,
            'Content-Type': 'application/json',
        };
    }

    // Method to handle API requests
    async request<T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any, params?: Record<string, any>): Promise<T> {
        const config: AxiosRequestConfig = {
            url: `${this.baseUrl}${endpoint}`,
            method,
            headers: this.headers,
            data,
            params,
        };

        try {
            const response = await axios(config);
            return response.data.data || response.data; // Adjust based on your API structure
        } catch (error: any) {
            this.handleError(error, endpoint);
            throw new Error(error?.response?.data?.message || 'API request failed');
        }
    }

    // Centralized error handler
    private handleError(error: any, endpoint: string): void {
        const status = error?.response?.status || 'Unknown';
        const message = error?.response?.data?.message || error.message;
        console.error(`Error during API call to ${endpoint}: [${status}] ${message}`);
    }
}

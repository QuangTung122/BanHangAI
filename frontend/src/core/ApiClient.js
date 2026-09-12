export default class ApiClient {
   static baseUrl = '/api';
   // static baseUrl = 'http://localhost:5000/api'; 

    static async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            // Tự động đăng xuất nếu token hết hạn hoặc bị thiết bị khác đăng nhập
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert('Tài khoản của bạn đã được đăng nhập ở thiết bị khác, hoặc phiên đăng nhập đã hết hạn. Hệ thống sẽ tự động đăng xuất.');
                window.location.reload();
            }
            
            return { status: response.status, data };
        } catch (error) {
            console.error('API Error:', error);
            return { status: 500, data: { success: false, message: 'Lỗi kết nối máy chủ' } };
        }
    }

    static post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

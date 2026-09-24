import fs from 'fs';

const html = `
    <div id="content-area"></div>
`;

import { JSDOM } from 'jsdom';
const dom = new JSDOM(html);
global.document = dom.window.document;
global.window = dom.window;

// Mock localStorage
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Mock fetch
global.fetch = async () => ({
    status: 200,
    json: async () => ({ success: true, data: [] })
});

try {
    const { default: StaffReturnWarrantyController } = await import('./frontend/src/controllers/StaffReturnWarrantyController.js');
    const controller = new StaffReturnWarrantyController();
    
    setTimeout(() => {
        console.log("Success! Inner HTML length:", document.getElementById('content-area').innerHTML.length);
    }, 1000);
} catch (e) {
    console.error("RUNTIME ERROR:", e);
}

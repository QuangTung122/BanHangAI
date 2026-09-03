import fs from 'fs';
import path from 'path';

// Mock browser environment
global.document = {
    getElementById: (id) => ({ innerHTML: '', querySelectorAll: () => [], focus: () => {}, classList: { remove: ()=>{}, add: ()=>{} } }),
    querySelectorAll: () => []
};
global.window = { addEventListener: () => {} };
global.localStorage = { getItem: () => 'fake-token' };

async function run() {
    try {
        console.log("Importing StaffOrderHistoryController...");
        await import('./frontend/src/controllers/StaffOrderHistoryController.js');
    } catch (e) {
        console.error(e);
    }
}
run();

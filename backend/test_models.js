import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    try {
        console.log("Checking models with API Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We can try to list models if the SDK supports it. 
        // In the older SDK version, there is no direct listModels method, we have to use REST.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("Available Gemini Models:");
            data.models
                .filter(m => m.name.includes('gemini'))
                .forEach(m => console.log(m.name, "-", m.description));
        } else {
            console.log("Error fetching models:", data);
        }
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

listModels();

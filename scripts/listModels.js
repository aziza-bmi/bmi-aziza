const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      process.env[key] = value.replace(/(^['"]|['"]$)/g, '').trim();
    }
  });
}

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;
  console.log('Using API Key starts with:', apiKey.slice(0, 10));
  
  // Note: listing models usually requires an API key too.
  // The SDK doesn't expose listModels directly easily, but we can try a fetch.
  try {
     const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
     const data = await resp.json();
     console.log('Available Models:', JSON.stringify(data, null, 2));
  } catch (e) {
     console.log('Error listing models:', e.message);
  }
}

listModels();

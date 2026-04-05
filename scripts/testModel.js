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
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY);
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash-latest'];
  
  for (const m of models) {
    console.log(`Testing ${m}...`);
    try {
       const model = genAI.getGenerativeModel({ model: m });
       const result = await model.generateContent("Hi");
       console.log(`Success with ${m}! Answer: ${result.response.text().slice(0, 20)}...`);
       return m; // Return first working one
    } catch (e) {
       console.log(`Failed with ${m}: ${e.message}`);
    }
  }
}

listModels();

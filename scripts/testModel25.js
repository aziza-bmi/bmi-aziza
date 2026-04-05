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

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY);
  const m = 'gemini-2.5-flash';
  console.log(`Testing ${m}...`);
  try {
     const model = genAI.getGenerativeModel({ model: m });
     const result = await model.generateContent("Salom, qandaysiz?");
     console.log(`Success! Answer: ${result.response.text()}`);
  } catch (e) {
     console.log(`Failed: ${e.message}`);
  }
}

test();

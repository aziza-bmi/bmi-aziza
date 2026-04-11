const fs = require('fs')

const raw = fs.readFileSync(
  'C:/Users/user/.gemini/antigravity/brain/60021c4a-d19f-4410-8874-28364c2709d8/.system_generated/steps/2159/output.txt',
  'utf8'
)
const data = JSON.parse(raw)
const names = data.documents.map(x => x.name)
console.log('Jami:', names.length)
names.forEach(n => console.log(n.split('/').pop()))

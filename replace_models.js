import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/gemini-2\.0-flash/g, 'gemini-3.5-flash');
fs.writeFileSync('server.ts', content);

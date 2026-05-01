const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function getRelativePathToAxios(filePath) {
    const dir = path.dirname(filePath);
    let rel = path.relative(dir, srcDir);
    if (rel === '') {
        return './axios';
    }
    return rel.replace(/\\/g, '/') + '/axios';
}

function processFile(filePath) {
    if (filePath.endsWith('axios.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it uses raw axios
    if (!content.includes('import axios from "axios"') && !content.includes("import axios from 'axios'")) {
        return;
    }

    const relPath = getRelativePathToAxios(filePath);
    
    // Replace import
    content = content.replace(/import\s+axios\s+from\s+['"]axios['"];?/g, `import api from "${relPath}";`);
    
    // Remove apiUrl declaration
    content = content.replace(/const\s+apiUrl\s*=\s*process\.env\.REACT_APP_API_URL;?/g, '');
    
    // Replace axios.verb with api.verb
    content = content.replace(/axios\.get\(/g, 'api.get(');
    content = content.replace(/axios\.post\(/g, 'api.post(');
    content = content.replace(/axios\.put\(/g, 'api.put(');
    content = content.replace(/axios\.delete\(/g, 'api.delete(');
    content = content.replace(/axios\.patch\(/g, 'api.patch(');
    
    // Replace ${apiUrl} with nothing inside backticks
    content = content.replace(/\$\{apiUrl\}/g, '');
    
    // Sometimes there might be a trailing comma or dependency array with apiUrl
    // E.g., [apiUrl, query] -> [query]
    content = content.replace(/\[\s*apiUrl\s*,\s*/g, '[');
    content = content.replace(/,\s*apiUrl\s*\]/g, ']');
    content = content.replace(/\[\s*apiUrl\s*\]/g, '[]');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(srcDir);
console.log("Migration complete.");

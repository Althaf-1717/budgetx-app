const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('.');

files.forEach(f => {
  if (f === 'fix.js' || f.includes('node_modules')) return;
  let text = fs.readFileSync(f, 'utf8');
  // We want to replace literal \` with `
  // We want to replace literal \$ with $
  let newText = text.replace(/\\\\`/g, '`').replace(/\\\\\\$/g, '$');
  
  if (text !== newText) {
    fs.writeFileSync(f, newText, 'utf8');
    console.log('Fixed', f);
  }
});

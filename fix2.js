const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fpath = path.join(dir, file);
    const stat = fs.statSync(fpath);
    if (stat && stat.isDirectory()) {
      if (!fpath.includes('node_modules')) {
        results = results.concat(walk(fpath));
      }
    } else {
      if (fpath.endsWith('.js')) {
        results.push(fpath);
      }
    }
  });
  return results;
}

const files = walk('.');

files.forEach(f => {
  if (f === 'fix.js' || f === 'fix2.js' || f.includes('node_modules')) return;
  
  let text = fs.readFileSync(f, 'utf8');
  // Match single backslash + backtick or dollar sign
  let newText = text.split('\\`').join('`').split('\\$').join('$');
  
  if (text !== newText) {
    fs.writeFileSync(f, newText, 'utf8');
    console.log('Fixed', f);
  }
});

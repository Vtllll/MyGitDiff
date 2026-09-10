const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

const html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf-8');
const js = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf-8');

// Replace link with inline style
let result = html.replace(
    '<link rel="stylesheet" href="styles.css">',
    `<style>\n${css}\n</style>`
);

// Replace script src with inline script
result = result.replace(
    '<script src="app.js"></script>',
    `<script>\n${js}\n</script>`
);

fs.writeFileSync(path.join(distDir, 'git-diff.html'), result, 'utf-8');
fs.writeFileSync(path.join(distDir, 'index.html'), result, 'utf-8');
console.log('Build successful! Generated dist/git-diff.html and dist/index.html');

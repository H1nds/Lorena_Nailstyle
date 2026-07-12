const fs = require('fs');
const path = require('path');
const srcPath = path.join(__dirname, 'src');

const replacements = [
  // Gradients for main buttons (turn into metallic gold)
  { regex: /from-pink-500 to-rose-500/g, replacement: 'from-gold-400 via-gold-500 to-gold-600' },
  { regex: /hover:from-pink-600 hover:to-rose-600/g, replacement: 'hover:from-gold-500 hover:via-gold-600 hover:to-gold-700' },
  { regex: /from-pink-500 via-rose-500 to-purple-500/g, replacement: 'from-gold-400 via-gold-500 to-gold-600' },
  { regex: /from-pink-600 to-purple-600/g, replacement: 'from-gold-500 to-gold-700' },
  { regex: /from-purple-600 to-pink-600/g, replacement: 'from-gold-600 to-gold-400' },
  { regex: /from-purple-500 to-indigo-600/g, replacement: 'from-gold-400 to-gold-600' },
  { regex: /hover:from-purple-600 hover:to-indigo-700/g, replacement: 'hover:from-gold-500 hover:to-gold-700' },
  { regex: /from-rose-100 to-pink-200/g, replacement: 'from-gold-100 to-gold-200' },
  { regex: /from-purple-400 to-pink-400/g, replacement: 'from-gold-400 to-gold-500' },
  { regex: /from-pink-500 to-purple-500/g, replacement: 'from-gold-400 to-gold-600' },
  { regex: /from-pink-500 to-rose-400/g, replacement: 'from-gold-400 to-gold-500' },
  { regex: /from-amber-400 to-orange-400/g, replacement: 'from-babyblue-400 to-babyblue-500' },
  { regex: /hover:from-amber-500 hover:to-orange-500/g, replacement: 'hover:from-babyblue-500 hover:to-babyblue-600' },
  
  // Shadows
  { regex: /shadow-pink-200/g, replacement: 'shadow-gold-200/50' },
  { regex: /shadow-purple-200/g, replacement: 'shadow-gold-200/50' },
  { regex: /shadow-amber-200/g, replacement: 'shadow-babyblue-200/50' },

  // General colors: replace pink, rose, purple with babyblue
  { regex: /pink/g, replacement: 'babyblue' },
  { regex: /rose/g, replacement: 'babyblue' },
  { regex: /purple/g, replacement: 'babyblue' },
  
  // Amber was used for edits, let's turn amber to gold or babyblue depending on context. But simpler to just turn amber to gold.
  { regex: /amber/g, replacement: 'gold' }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(srcPath);
console.log("Colors replaced!");

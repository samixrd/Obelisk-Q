const fs = require('fs');
const path = require('path');

const dirs = [
  'src/components/obelisk',
  'src/pages'
];

const skipFiles = [
  'LandingPage.tsx',
  'MagneticText.tsx'
];

dirs.forEach(dir => {
  const absoluteDir = path.resolve(dir);
  if (!fs.existsSync(absoluteDir)) return;

  fs.readdirSync(absoluteDir).forEach(file => {
    if (skipFiles.includes(file)) return;
    if (!file.endsWith('.tsx')) return;

    const filePath = path.join(absoluteDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('<MagneticText')) {
      console.log(`Updating ${filePath}`);
      content = content.replace(/<MagneticText(?!\s+disabled)/g, '<MagneticText disabled');
      fs.writeFileSync(filePath, content);
    }
  });
});

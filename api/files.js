const fs = require('fs');
const path = require('path');

function collect(dir, root, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(absolute, root, files);
    else if (/\.(html?|md)$/i.test(entry.name)) files.push('/' + path.relative(root, absolute).split(path.sep).join('/'));
  }
}

module.exports = (req, res) => {
  const root = path.join(process.cwd(), 'almanack');
  const files = [];
  collect(root, process.cwd(), files);
  files.sort((a, b) => a.localeCompare(b));
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(files);
};

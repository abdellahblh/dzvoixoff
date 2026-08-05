try {
  const functions = require('./functions/lib/index.js');
  console.log('Successfully loaded functions');
} catch (e) {
  console.error('Failed to load functions:', e);
  process.exit(1);
}

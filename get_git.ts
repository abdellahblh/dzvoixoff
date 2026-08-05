import { execSync } from 'child_process';
const log = execSync('git log -p src/pages/Dashboard.tsx').toString();
console.log(log.substring(0, 5000));
